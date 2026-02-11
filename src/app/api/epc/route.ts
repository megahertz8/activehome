import { NextRequest, NextResponse } from "next/server";

const EPC_BASE = "https://epc.opendatacommunities.org/api/v1";

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

  const token = process.env.EPC_API_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "EPC API not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `${EPC_BASE}/domestic/search?postcode=${encodeURIComponent(postcode.trim())}&size=100`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${token}`,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `EPC API returned ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const rows = data.rows || [];

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No EPC records found for this postcode" },
        { status: 404 }
      );
    }

    // If no specific address, return address list for selection
    if (!addressFilter) {
      // Deduplicate by address, keep most recent
      const seen = new Map<string, typeof rows[0]>();
      for (const row of rows) {
        const addr = row.address;
        const existing = seen.get(addr);
        if (!existing || row["lodgement-date"] > existing["lodgement-date"]) {
          seen.set(addr, row);
        }
      }

      const addresses = Array.from(seen.values())
        .sort((a, b) => a.address.localeCompare(b.address))
        .map((r) => ({ address: r.address, lmk: r["lmk-key"] }));

      return NextResponse.json({ addresses });
    }

    // Find specific address (most recent record)
    const match = rows
      .filter((r: Record<string, string>) => r.address === addressFilter)
      .sort((a: Record<string, string>, b: Record<string, string>) =>
        (b["lodgement-date"] || "").localeCompare(a["lodgement-date"] || "")
      )[0];

    if (!match) {
      return NextResponse.json(
        { error: "Address not found in EPC records" },
        { status: 404 }
      );
    }

    // Calculate savings
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
    const grants = [];
    const rating = match["current-energy-rating"]?.toUpperCase();
    const fuel = (match["main-fuel"] || "").toLowerCase();
    const heating = (match["mainheat-description"] || "").toLowerCase();

    if (heating.includes("boiler") || fuel.includes("gas")) {
      grants.push({
        scheme: "Boiler Upgrade Scheme (BUS)",
        amount: "£7,500",
        description: "Grant towards replacing your gas boiler with an air source heat pump",
      });
    }

    if (["D", "E", "F", "G"].includes(rating)) {
      grants.push({
        scheme: "ECO4 / Great British Insulation Scheme",
        amount: "Up to £20,000",
        description: "Insulation and heating upgrades for eligible households",
      });
    }

    if (!fuel.includes("gas")) {
      grants.push({
        scheme: "Home Upgrade Grant (HUG2)",
        amount: "Up to £38,000",
        description: "For off-gas-grid homes — insulation, heat pumps, solar PV",
      });
    }

    return NextResponse.json({
      address: match.address,
      postcode: match.postcode,
      currentRating: match["current-energy-rating"],
      potentialRating: match["potential-energy-rating"],
      currentEfficiency: Number(match["current-energy-efficiency"]),
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
    });
  } catch (err) {
    console.error("EPC API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch energy data" },
      { status: 500 }
    );
  }
}
