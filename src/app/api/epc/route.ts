import { NextRequest, NextResponse } from "next/server";
import { calculateEnhancedEnergy } from "@/lib/energy-calc";
import { getEnergyPricesFromPostcode } from "@/lib/energy-prices";
import { estimateSolarPotential } from "@/lib/solar";
import { epcToOpenBEM } from "@/lib/epc-to-openbem";
import { getBuildingGeometry, geocodePostcode } from "@/lib/osm-building";
import { enrichWithGeometry } from "@/lib/geometry-enrichment";

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

// Helper function to get rough coordinates from postcode
function getCoordinatesFromPostcode(postcode: string): { lat: number; lon: number } | null {
  // Simplified: use postcode prefix to estimate coordinates
  // In production, use a proper geocoding service
  const prefix = postcode.split(' ')[0].toUpperCase().substring(0, 2);
  const coords: Record<string, { lat: number; lon: number }> = {
    'AB': { lat: 57.1, lon: -2.1 },
    'AL': { lat: 51.7, lon: -0.3 },
    'B': { lat: 52.5, lon: -1.9 },
    'BA': { lat: 51.2, lon: -2.5 },
    'BB': { lat: 53.8, lon: -2.2 },
    'BD': { lat: 53.8, lon: -1.8 },
    'BH': { lat: 50.7, lon: -1.9 },
    'BL': { lat: 53.6, lon: -2.4 },
    'BN': { lat: 50.8, lon: -0.1 },
    'BR': { lat: 51.4, lon: -0.1 },
    'BS': { lat: 51.5, lon: -2.6 },
    'CA': { lat: 54.9, lon: -2.9 },
    'CB': { lat: 52.2, lon: 0.1 },
    'CF': { lat: 51.5, lon: -3.2 },
    'CH': { lat: 53.2, lon: -2.9 },
    'CM': { lat: 51.9, lon: 0.5 },
    'CO': { lat: 51.9, lon: 0.9 },
    'CR': { lat: 51.4, lon: -0.1 },
    'CT': { lat: 51.4, lon: 1.4 },
    'CV': { lat: 52.4, lon: -1.5 },
    'CW': { lat: 53.2, lon: -2.2 },
    'DA': { lat: 51.4, lon: 0.2 },
    'DE': { lat: 53.0, lon: -1.5 },
    'DG': { lat: 55.1, lon: -3.9 },
    'DH': { lat: 54.8, lon: -1.6 },
    'DL': { lat: 54.5, lon: -1.6 },
    'DN': { lat: 53.5, lon: -1.1 },
    'DT': { lat: 50.7, lon: -2.8 },
    'DY': { lat: 52.5, lon: -2.1 },
    'E': { lat: 51.5, lon: -0.1 },
    'EC': { lat: 51.5, lon: -0.1 },
    'EH': { lat: 55.9, lon: -3.2 },
    'EN': { lat: 51.7, lon: -0.0 },
    'EX': { lat: 50.7, lon: -3.5 },
    'FK': { lat: 56.0, lon: -3.8 },
    'FY': { lat: 53.8, lon: -3.0 },
    'G': { lat: 55.9, lon: -4.3 },
    'GL': { lat: 51.9, lon: -2.2 },
    'GU': { lat: 51.2, lon: -0.6 },
    'HA': { lat: 51.6, lon: -0.3 },
    'HD': { lat: 53.6, lon: -2.0 },
    'HG': { lat: 54.0, lon: -1.5 },
    'HP': { lat: 51.7, lon: -0.6 },
    'HR': { lat: 52.1, lon: -0.5 },
    'HS': { lat: 58.2, lon: -6.3 },
    'HU': { lat: 53.7, lon: -0.3 },
    'HX': { lat: 53.7, lon: -2.0 },
    'IG': { lat: 51.6, lon: 0.1 },
    'IP': { lat: 52.1, lon: 1.3 },
    'IV': { lat: 57.5, lon: -4.2 },
    'KA': { lat: 55.6, lon: -4.5 },
    'KT': { lat: 51.4, lon: -0.3 },
    'KW': { lat: 58.6, lon: -3.1 },
    'KY': { lat: 56.1, lon: -3.0 },
    'L': { lat: 53.4, lon: -2.9 },
    'LA': { lat: 54.0, lon: -2.8 },
    'LD': { lat: 52.1, lon: -4.7 },
    'LE': { lat: 52.6, lon: -1.1 },
    'LL': { lat: 53.1, lon: -4.1 },
    'LN': { lat: 53.2, lon: -0.5 },
    'LS': { lat: 53.8, lon: -1.5 },
    'LU': { lat: 51.9, lon: -0.4 },
    'M': { lat: 53.5, lon: -2.2 },
    'ME': { lat: 51.4, lon: 0.5 },
    'MK': { lat: 52.0, lon: -0.8 },
    'ML': { lat: 55.0, lon: -4.1 },
    'N': { lat: 51.5, lon: -0.1 },
    'NE': { lat: 55.0, lon: -1.6 },
    'NG': { lat: 53.0, lon: -1.1 },
    'NN': { lat: 52.2, lon: -0.9 },
    'NP': { lat: 51.6, lon: -3.0 },
    'NR': { lat: 52.6, lon: 1.3 },
    'NW': { lat: 51.5, lon: -0.2 },
    'OL': { lat: 53.5, lon: -2.1 },
    'OX': { lat: 51.8, lon: -1.3 },
    'PA': { lat: 55.8, lon: -4.4 },
    'PE': { lat: 52.6, lon: -0.2 },
    'PH': { lat: 56.4, lon: -3.4 },
    'PL': { lat: 50.4, lon: -4.1 },
    'PO': { lat: 50.8, lon: -1.1 },
    'PR': { lat: 53.8, lon: -2.7 },
    'RG': { lat: 51.4, lon: -0.9 },
    'RH': { lat: 51.0, lon: -0.0 },
    'RM': { lat: 51.6, lon: 0.2 },
    'S': { lat: 53.4, lon: -1.5 },
    'SA': { lat: 51.6, lon: -4.3 },
    'SE': { lat: 51.5, lon: -0.1 },
    'SG': { lat: 51.9, lon: -0.2 },
    'SK': { lat: 53.4, lon: -2.1 },
    'SL': { lat: 51.5, lon: -0.6 },
    'SM': { lat: 51.4, lon: -0.2 },
    'SN': { lat: 51.4, lon: -1.8 },
    'SO': { lat: 50.9, lon: -1.4 },
    'SP': { lat: 51.1, lon: -1.9 },
    'SR': { lat: 54.9, lon: -1.4 },
    'SS': { lat: 51.6, lon: 0.7 },
    'ST': { lat: 53.0, lon: -2.2 },
    'SW': { lat: 51.5, lon: -0.1 },
    'SY': { lat: 53.0, lon: -2.6 },
    'TA': { lat: 51.0, lon: -3.1 },
    'TD': { lat: 55.6, lon: -2.4 },
    'TF': { lat: 52.7, lon: -2.4 },
    'TN': { lat: 51.1, lon: 0.3 },
    'TQ': { lat: 50.5, lon: -3.5 },
    'TR': { lat: 50.3, lon: -5.1 },
    'TS': { lat: 54.6, lon: -1.2 },
    'TW': { lat: 51.5, lon: -0.3 },
    'UB': { lat: 51.5, lon: -0.4 },
    'W': { lat: 51.5, lon: -0.2 },
    'WA': { lat: 53.4, lon: -2.6 },
    'WC': { lat: 51.5, lon: -0.1 },
    'WD': { lat: 51.7, lon: -0.4 },
    'WF': { lat: 53.7, lon: -1.5 },
    'WN': { lat: 53.5, lon: -2.6 },
    'WR': { lat: 52.2, lon: -2.0 },
    'WS': { lat: 52.6, lon: -2.0 },
    'WV': { lat: 52.6, lon: -2.1 },
    'YO': { lat: 53.9, lon: -1.1 },
    'ZE': { lat: 60.1, lon: -1.3 }
  };
  return coords[prefix] || null;
}

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

    // Enhanced integrations
    let energyCalc = null;
    let livePricing = null;
    let solar = null;
    let buildingGeometry = null;
    let enrichedScore = null;

    // Run integrations in parallel
    const integrations = await Promise.allSettled([
      (async () => {
        try {
          // OpenBEM energy calculation
          const epcRecord = {
            address: match.address,
            postcode: match.postcode,
            property_type: match["property-type"],
            total_floor_area: Number(match["total-floor-area"]) || 80,
            walls_description: match["walls-description"],
            roof_description: match["roof-description"],
            windows_description: match["windows-description"],
            floor_description: match["floor-description"],
            mainheat_description: match["mainheat-description"],
            construction_age_band: match["construction-age-band"],
            mechanical_ventilation: match["mechanical-ventilation"],
            solar_hot_water_flag: match["solar-hot-water-flag"]
          };
          const enhancedEnergy = await calculateEnhancedEnergy(epcRecord);
          return {
            epcRecord,
            enhancedEnergy,
            energyCalc: {
              heatLoss: {
                walls: Math.round(enhancedEnergy.fabric.total_wall_WK),
                roof: Math.round(enhancedEnergy.fabric.total_roof_WK),
                floor: Math.round(enhancedEnergy.fabric.total_floor_WK),
                windows: Math.round(enhancedEnergy.fabric.total_window_WK),
                ventilation: Math.round(enhancedEnergy.ventilation.average_WK),
                total: Math.round(enhancedEnergy.fabric.total_heat_loss_WK + enhancedEnergy.ventilation.average_WK)
              },
              heatingDemand_kWh: Math.round(enhancedEnergy.space_heating.annual_heating_demand),
              hotWaterDemand_kWh: Math.round(enhancedEnergy.water_heating.annual_energy_content),
              totalDemand_kWh: Math.round(enhancedEnergy.space_heating.annual_heating_demand + enhancedEnergy.water_heating.annual_energy_content)
            }
          };
        } catch (error) {
          console.warn("OpenBEM calculation failed:", error);
          return null;
        }
      })(),
      (async () => {
        try {
          // Live energy pricing
          const electricityDemand = Number(match["electricity-consumption-current"]) || 3000;
          const gasDemand = Number(match["gas-consumption-current"]) || 12000;
          return await getEnergyPricesFromPostcode(match.postcode, electricityDemand, gasDemand);
        } catch (error) {
          console.warn("Energy pricing failed:", error);
          return null;
        }
      })(),
      (async () => {
        try {
          // Solar potential
          const floorArea = Number(match["total-floor-area"]) || 80;
          const buildingData = epcToOpenBEM({
            address: match.address,
            postcode: match.postcode,
            property_type: match["property-type"],
            total_floor_area: floorArea,
            walls_description: match["walls-description"],
            roof_description: match["roof-description"],
            windows_description: match["windows-description"],
            floor_description: match["floor-description"],
            mainheat_description: match["mainheat-description"],
            construction_age_band: match["construction-age-band"]
          });
          const coords = getCoordinatesFromPostcode(match.postcode);
          if (coords) {
            const roofCapacity = floorArea * 0.15; // Rough estimate
            const solarData = await estimateSolarPotential({
              lat: coords.lat,
              lon: coords.lon,
              roofArea_m2: floorArea,
              peakPower_kWp: roofCapacity
            });
            if (solarData) {
              return {
                roofCapacity_kWp: Math.round(solarData.peakPower_kWp * 10) / 10,
                annualGeneration_kWh: Math.round(solarData.annualGeneration_kWh),
                annualSavings_GBP: Math.round(solarData.annualSavings_GBP),
                paybackYears: Math.round((roofCapacity * 2000) / solarData.annualSavings_GBP * 10) / 10, // Rough payback
                co2Saved_kg: Math.round(solarData.co2Saved_kg)
              };
            }
          }
          return null;
        } catch (error) {
          console.warn("Solar estimation failed:", error);
          return null;
        }
      })(),
      (async () => {
        try {
          // Building geometry
          const coords = await geocodePostcode(match.postcode);
          if (coords) {
            return await getBuildingGeometry(coords.lat, coords.lon);
          }
          return null;
        } catch (error) {
          console.warn("Geometry fetch failed:", error);
          return null;
        }
      })()
    ]);

    const [energyResult, pricingResult, solarResult, geometryResult] = integrations;

    if (energyResult.status === 'fulfilled' && energyResult.value) {
      energyCalc = energyResult.value.energyCalc;
    }

    if (pricingResult.status === 'fulfilled') {
      livePricing = pricingResult.value;
    }

    if (solarResult.status === 'fulfilled') {
      solar = solarResult.value;
    }

    if (geometryResult.status === 'fulfilled') {
      buildingGeometry = geometryResult.value;
    }

    // Enrich energy calculations with geometry
    if (buildingGeometry && energyResult.status === 'fulfilled' && energyResult.value) {
      try {
        enrichedScore = enrichWithGeometry(
          energyResult.value.epcRecord,
          buildingGeometry,
          energyResult.value.enhancedEnergy
        );
        // Update energyCalc with enriched data if available
        if (enrichedScore.improvements.sharedWallsAccounted) {
          // For now, keep original, but could update
        }
      } catch (error) {
        console.warn("Geometry enrichment failed:", error);
      }
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
      energyCalc,
      livePricing,
      solar,
      buildingGeometry,
      enrichedScore,
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

          // Fetch building geometry in parallel
          const geometryPromise = (async () => {
            try {
              const coords = await geocodePostcode(match.postcode);
              if (coords) {
                return await getBuildingGeometry(coords.lat, coords.lon);
              }
            } catch (error) {
              console.warn("Geometry fetch failed for local DB:", error);
            }
            return null;
          })();

          // Run integrations in parallel
          const [geometry] = await Promise.all([geometryPromise]);

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
            buildingGeometry: geometry,
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
