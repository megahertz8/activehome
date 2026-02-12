import { NextRequest, NextResponse } from 'next/server';
import { getBuildingGeometry, geocodePostcode } from '@/lib/osm-building';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const postcode = searchParams.get('postcode');

  try {
    let latNum: number;
    let lonNum: number;

    if (postcode) {
      const coords = await geocodePostcode(postcode);
      if (!coords) {
        return NextResponse.json({ error: 'Postcode not found' }, { status: 404 });
      }
      latNum = coords.lat;
      lonNum = coords.lon;
    } else if (lat && lon) {
      latNum = parseFloat(lat);
      lonNum = parseFloat(lon);
      if (isNaN(latNum) || isNaN(lonNum)) {
        return NextResponse.json({ error: 'Invalid lat/lon' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Missing lat/lon or postcode' }, { status: 400 });
    }

    const geometry = await getBuildingGeometry(latNum, lonNum);
    if (!geometry) {
      return NextResponse.json({ error: 'No building found at location' }, { status: 404 });
    }

    return NextResponse.json(geometry);
  } catch (error) {
    console.error('Building API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}