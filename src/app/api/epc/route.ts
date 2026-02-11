import { NextRequest, NextResponse } from "next/server";
import { searchByPostcode, getByAddress, calculateSavings, checkGrants, getPostcodeStats } from "@/lib/epc-local";

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

  try {
    // If specific address requested, return full score
    if (addressFilter) {
      const match = getByAddress(postcode, addressFilter);
      if (!match) {
        return NextResponse.json({ error: "Address not found" }, { status: 404 });
      }

      const savings = calculateSavings(match);
      const grants = checkGrants(match);
      const neighborhood = getPostcodeStats(postcode);

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
      });
    }

    // Otherwise return address list for selection
    const rows = searchByPostcode(postcode);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No EPC records found for this postcode" },
        { status: 404 }
      );
    }

    // Deduplicate by address, keep most recent
    const seen = new Map<string, typeof rows[0]>();
    for (const row of rows) {
      if (!seen.has(row.address)) {
        seen.set(row.address, row); // Already sorted by lodgement_date DESC
      }
    }

    const addresses = Array.from(seen.values())
      .sort((a, b) => a.address.localeCompare(b.address))
      .map((r) => ({ address: r.address, lmk: r.lmk_key }));

    return NextResponse.json({ addresses });
  } catch (err) {
    console.error("EPC lookup error:", err);
    return NextResponse.json(
      { error: "Failed to fetch energy data" },
      { status: 500 }
    );
  }
}
