import { NextRequest, NextResponse } from "next/server";

// Dynamic imports to avoid loading native modules at compile time
let localDb: typeof import("@/lib/epc-local") | null = null;

function getLocalDb() {
  if (!localDb) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      localDb = require("@/lib/epc-local");
    } catch {
      localDb = null;
    }
  }
  return localDb;
}

// ── Live EPC API fallback ──────────────────────────────────────────────
const EPC_API_BASE = "https://epc.opendatacommunities.org/api/v1";

async function fetchFromLiveAPI(postcode: string, address?: string) {
  const token = process.env.EPC_API_TOKEN;
  if (!token) throw new Error("No EPC_API_TOKEN configured");

  // Base64 encode email:token for Basic auth
  const auth = Buffer.from(`${token}:`).toString("base64");

  const res = await fetch(
    `${EPC_API_BASE}/domestic/search?postcode=${encodeURIComponent(postcode)}&size=100`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${auth}`,
      },
      next: { revalidate: 86400 }, // Cache 24h
    }
  );

  if (!res.ok) {
    throw new Error(`EPC API ${res.status}: ${res.statusText}`);
  }

  const data = await res.json();
  const rows = data.rows || [];

  if (rows.length === 0) return null;

  if (address) {
    // Find specific address
    const match = rows.find(
      (r: Record<string, string>) => r.address === address
    );
    if (!match) return null;

    const currentCost =
      Number(match["heating-cost-current"] || 0) +
      Number(match["hot-water-cost-current"] || 0) +
      Number(match["lighting-cost-current"] || 0);
    const potentialCost =
      Number(match["heating-cost-potential"] || 0) +
      Number(match["hot-water-cost-potential"] || 0) +
      Number(match["lighting-cost-potential"] || 0);
    const annualSavings = currentCost - potentialCost;

    let twentyYearSavings = 0;
    for (let y = 1; y <= 20; y++) {
      twentyYearSavings += annualSavings * Math.pow(1.035, y);
    }

    // Grant eligibility
    const grants: { scheme: string; amount: string; description: string }[] = [];
    const rating = (match["current-energy-rating"] || "").toUpperCase();
    const fuel = (match["main-fuel"] || "").toLowerCase();
    const heating = (match["mainheat-description"] || "").toLowerCase();

    if (heating.includes("boiler") || fuel.includes("gas")) {
      grants.push({ scheme: "Boiler Upgrade Scheme (BUS)", amount: "£7,500", description: "Grant towards replacing your gas boiler with an air source heat pump" });
    }
    if (["D", "E", "F", "G"].includes(rating)) {
      grants.push({ scheme: "ECO4 / Great British Insulation Scheme", amount: "Up to £20,000", description: "Insulation and heating upgrades for eligible households" });
    }
    if (!fuel.includes("gas")) {
      grants.push({ scheme: "Home Upgrade Grant (HUG2)", amount: "Up to £38,000", description: "For off-gas-grid homes — insulation, heat pumps, solar PV" });
    }

    return {
      address: match.address,
      postcode: match.postcode,
      currentRating: match["current-energy-rating"],
      potentialRating: match["potential-energy-rating"],
      currentEfficiency: Number(match["current-energy-efficiency"]) || 0,
      propertyType: match["property-type"] || "Unknown",
      floorArea: match["total-floor-area"] || "Unknown",
      walls: match["walls-description"] || "Unknown",
      roof: match["roof-description"] || "Unknown",
      windows: match["windows-description"] || "Unknown",
      heating: match["mainheat-description"] || "Unknown",
      currentCost: Math.round(currentCost),
      potentialCost: Math.round(potentialCost),
      annualSavings: Math.round(annualSavings),
      twentyYearSavings: Math.round(twentyYearSavings),
      grants,
      neighborhood: { avgEfficiency: 0, totalHomes: 0, ratingDistribution: {} },
      source: "live-api",
    };
  }

  // Return address list
  const seen = new Map<string, string>();
  for (const row of rows) {
    if (!seen.has(row.address)) {
      seen.set(row.address, row["lmk-key"]);
    }
  }

  return {
    addresses: Array.from(seen.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([addr, lmk]) => ({ address: addr, lmk })),
    source: "live-api",
  };
}

// ── Main handler ───────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const postcode = req.nextUrl.searchParams.get("postcode");
  const addressFilter = req.nextUrl.searchParams.get("address");

  if (!postcode) {
    return NextResponse.json({ error: "Postcode required" }, { status: 400 });
  }

  // Validate UK postcode format
  const postcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
  if (!postcodeRegex.test(postcode.trim())) {
    return NextResponse.json({ error: "Invalid UK postcode" }, { status: 400 });
  }

  // ── Try local DB first (fast, no API token usage) ──
  try {
    const db = getLocalDb();
    if (db) {
      if (addressFilter) {
        const match = db.getByAddress(postcode, addressFilter);
        if (match) {
          const savings = db.calculateSavings(match);
          const grants = db.checkGrants(match);
          const neighborhood = db.getPostcodeStats(postcode);

          return NextResponse.json({
            address: match.address,
            postcode: match.postcode,
            currentRating: match.current_energy_rating,
            potentialRating: match.potential_energy_rating,
            currentEfficiency: match.current_energy_efficiency,
            propertyType: match.property_type || "Unknown",
            floorArea: match.total_floor_area || "Unknown",
            walls: match.walls_description || "Unknown",
            roof: match.roof_description || "Unknown",
            windows: match.windows_description || "Unknown",
            heating: match.mainheat_description || "Unknown",
            ...savings,
            grants,
            neighborhood: {
              avgEfficiency: neighborhood.avgEfficiency,
              totalHomes: neighborhood.totalHomes,
              ratingDistribution: neighborhood.ratingDistribution,
            },
            source: "local-db",
          });
        }
      } else {
        const rows = db.searchByPostcode(postcode);
        if (rows.length > 0) {
          const seen = new Map<string, typeof rows[0]>();
          for (const row of rows) {
            if (!seen.has(row.address)) {
              seen.set(row.address, row);
            }
          }

          return NextResponse.json({
            addresses: Array.from(seen.values())
              .sort((a, b) => a.address.localeCompare(b.address))
              .map((r) => ({ address: r.address, lmk: r.lmk_key })),
            source: "local-db",
          });
        }
      }
    }
  } catch (localErr) {
    console.warn("Local DB unavailable, falling back to live API:", localErr);
  }

  // ── Fallback: Live EPC API ──
  try {
    const result = await fetchFromLiveAPI(postcode, addressFilter || undefined);
    if (!result) {
      return NextResponse.json(
        { error: addressFilter ? "Address not found" : "No EPC records found for this postcode" },
        { status: 404 }
      );
    }
    return NextResponse.json(result);
  } catch (apiErr) {
    console.error("Both local DB and live API failed:", apiErr);
    return NextResponse.json(
      { error: "Failed to fetch energy data. Please try again." },
      { status: 500 }
    );
  }
}
