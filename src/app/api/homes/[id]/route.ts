import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getScoreHistory, getImprovements } from '@/lib/supabase-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createSupabaseServerClient();

    // Get home data (public)
    const { data: home, error } = await supabase
      .from('homes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !home) {
      return NextResponse.json(
        { error: 'Home not found' },
        { status: 404 }
      );
    }

    // Get score history
    const scoreHistory = await getScoreHistory(id);

    // Get improvements
    const improvements = await getImprovements(id);

    // Get current owner info (if user is authenticated and is the owner)
    const { data: { user } } = await supabase.auth.getUser();
    let isOwner = false;
    let ownerName = null;

    if (user) {
      const { data: ownership } = await supabase
        .from('home_owners')
        .select('role, is_current')
        .eq('home_id', id)
        .eq('user_id', user.id)
        .eq('is_current', true)
        .single();

      isOwner = !!ownership;
    }

    // Get public owner info (first name only, for "Claimed by" display)
    const { data: owners } = await supabase
      .from('home_owners')
      .select('user_id')
      .eq('home_id', id)
      .eq('is_current', true)
      .limit(1)
      .single();

    if (owners) {
      const { data: { user: ownerUser } } = await supabase.auth.admin.getUserById(owners.user_id);
      if (ownerUser) {
        const fullName = ownerUser.user_metadata?.full_name;
        ownerName = fullName ? fullName.split(' ')[0] : null;
      }
    }

    return NextResponse.json({
      home,
      scoreHistory,
      improvements,
      isOwner,
      ownerName
    });
  } catch (error: any) {
    console.error('Error fetching home:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
