import { NextRequest, NextResponse } from 'next/server';
import { estimateSolarPotential, estimateRoofCapacity } from '@/lib/solar';

async function geocodePostcode(postcode: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?country=UK&postalcode=${encodeURIComponent(postcode)}&format=json&limit=1`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    const data = await response.json();
    if (data.length === 0) {
      return null;
    }
    const { lat, lon } = data[0];
    return { lat: parseFloat(lat), lon: parseFloat(lon) };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  let lat: number | undefined;
  let lon: number | undefined;
  let roofArea: number | undefined;
  let peakPower: number | undefined;

  const postcode = searchParams.get('postcode');
  const propertyType = searchParams.get('property_type');
  const floorAreaStr = searchParams.get('floor_area');
  const latStr = searchParams.get('lat');
  const lonStr = searchParams.get('lon');
  const roofAreaStr = searchParams.get('roof_area');
  const peakPowerStr = searchParams.get('peak_power');

  if (postcode && propertyType && floorAreaStr) {
    // Geocode postcode
    const coords = await geocodePostcode(postcode);
    if (!coords) {
      return NextResponse.json({ error: 'Invalid postcode' }, { status: 400 });
    }
    lat = coords.lat;
    lon = coords.lon;

    // Estimate roof area
    const floorArea = parseFloat(floorAreaStr);
    if (isNaN(floorArea)) {
      return NextResponse.json({ error: 'Invalid floor_area' }, { status: 400 });
    }
    roofArea = estimateRoofCapacity(floorArea, 2, propertyType); // Assume 2 floors
  } else if (latStr && lonStr && roofAreaStr) {
    lat = parseFloat(latStr);
    lon = parseFloat(lonStr);
    roofArea = parseFloat(roofAreaStr);
    if (isNaN(lat) || isNaN(lon) || isNaN(roofArea)) {
      return NextResponse.json({ error: 'Invalid lat, lon, or roof_area' }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: 'Provide either postcode+property_type+floor_area or lat+lon+roof_area' }, { status: 400 });
  }

  if (peakPowerStr) {
    peakPower = parseFloat(peakPowerStr);
    if (isNaN(peakPower)) {
      return NextResponse.json({ error: 'Invalid peak_power' }, { status: 400 });
    }
  }

  const result = await estimateSolarPotential({ lat, lon, roofArea_m2: roofArea, peakPower_kWp: peakPower });

  if (!result) {
    return NextResponse.json({ error: 'Failed to estimate solar potential' }, { status: 500 });
  }

  return NextResponse.json(result);
}