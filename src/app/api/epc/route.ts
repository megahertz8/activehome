import { NextRequest, NextResponse } from "next/server";
import { getAdapter, detectCountry, isLiteMode } from "@/lib/adapters";
import { getBuildingGeometry, geocodePostcode } from "@/lib/osm-building";
import { enrichWithGeometry } from "@/lib/geometry-enrichment";
import { supabase } from "@/lib/supabase";

// ── Main handler ───────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const postcode = req.nextUrl.searchParams.get("postcode");
  const addressFilter = req.nextUrl.searchParams.get("address");
  const countryParam = req.nextUrl.searchParams.get("country");
  const latParam = req.nextUrl.searchParams.get("lat");
  const lngParam = req.nextUrl.searchParams.get("lng");

  if (!postcode) {
    return NextResponse.json({ error: "Postcode required" }, { status: 400 });
  }

  // Detect country from postcode or use param
  const countryCode = countryParam || detectCountry(postcode, req);
  const adapter = getAdapter(countryCode);
  const liteMode = isLiteMode(countryCode);

  // Validate postcode format
  if (!adapter.validatePostcode(postcode)) {
    return NextResponse.json({ error: `Invalid ${adapter.countryName} postcode` }, { status: 400 });
  }

  // Log lite mode requests
  if (liteMode) {
    try {
      await supabase.from('country_requests').insert({
        country_code: countryCode,
        country_name: adapter.countryName,
        postcode: postcode,
        ip_country: req.headers.get('CF-IPCountry') || req.headers.get('X-Forwarded-For-Country')
      });
    } catch (error) {
      console.warn('Failed to log country request:', error);
    }
  }

  // ── Use adapter for search/get ──
  try {
    if (addressFilter) {
      // Get specific certificate
      const data = await adapter.getCertificate(addressFilter);
      if (!data) {
        return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
      }

      const score = adapter.calculateEnergyScore(data);
      const grants = await adapter.getAvailableGrants(data);
      const recommendations = adapter.getRecommendations(data);

      // Fetch building geometry in parallel
      const geometryPromise = (async () => {
        try {
          let coords = null;
          if (latParam && lngParam) {
            // Use Google Maps geocoding coordinates
            coords = { lat: parseFloat(latParam), lon: parseFloat(lngParam) };
          } else {
            // Fallback to Nominatim geocoding
            coords = await geocodePostcode(data.postcode);
          }
          if (coords) {
            return await getBuildingGeometry(coords.lat, coords.lon);
          }
        } catch (error) {
          console.warn("Geometry fetch failed:", error);
        }
        return null;
      })();

      // Run integrations in parallel
      const [geometry] = await Promise.all([geometryPromise]);

      return NextResponse.json({
        address: data.address,
        postcode: data.postcode,
        currentRating: data.currentEnergyRating,
        potentialRating: data.potentialEnergyRating,
        currentEfficiency: data.currentEnergyEfficiency,
        propertyType: data.propertyType || "Unknown",
        floorArea: data.floorArea || "Unknown",
        walls: data.wallsDescription || "Unknown",
        roof: data.roofDescription || "Unknown",
        windows: data.windowsDescription || "Unknown",
        heating: data.mainHeatDescription || "Unknown",
        currentCost: score.savings.annual,
        potentialCost: score.savings.annual,
        annualSavings: score.savings.annual,
        twentyYearSavings: score.savings.twentyYear,
        grants,
        recommendations,
        buildingGeometry: geometry,
        source: "adapter",
        liteMode,
      });
    } else {
      // Search by postcode
      const addresses = await adapter.searchByPostcode(postcode);
      return NextResponse.json({
        addresses: addresses.map(a => ({ address: a.address, lmk: a.lmk })),
        source: "adapter",
        liteMode,
      });
    }
  } catch (err) {
    console.error("Adapter error:", err);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}