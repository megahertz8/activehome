import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { claimHome } from '@/lib/supabase-helpers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { address, postcode, lat, lng, epcData } = body;

    if (!address || !postcode) {
      return NextResponse.json(
        { error: 'Address and postcode are required' },
        { status: 400 }
      );
    }

    // Claim the home (create or link)
    const home = await claimHome(
      user.id,
      address,
      postcode,
      lat,
      lng,
      epcData
    );

    return NextResponse.json(home);
  } catch (error: any) {
    console.error('Error claiming home:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
