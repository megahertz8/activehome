import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { logImprovement } from '@/lib/supabase-helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: homeId } = await params;
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is current owner of this home
    const { data: ownership } = await supabase
      .from('home_owners')
      .select('id')
      .eq('home_id', homeId)
      .eq('user_id', user.id)
      .eq('is_current', true)
      .single();

    if (!ownership) {
      return NextResponse.json(
        { error: 'You must be the current owner to log improvements' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      ecm_type,
      title,
      description,
      cost,
      grant_applied,
      grant_amount,
      estimated_annual_savings,
      completed_at
    } = body;

    if (!ecm_type || !title) {
      return NextResponse.json(
        { error: 'ECM type and title are required' },
        { status: 400 }
      );
    }

    // Log the improvement
    const improvement = await logImprovement(homeId, {
      logged_by: user.id,
      ecm_type,
      title,
      description,
      cost: cost ? parseFloat(cost) : null,
      grant_applied,
      grant_amount: grant_amount ? parseFloat(grant_amount) : null,
      estimated_annual_savings: estimated_annual_savings
        ? parseFloat(estimated_annual_savings)
        : null,
      completed_at: completed_at || new Date().toISOString().split('T')[0]
    });

    return NextResponse.json(improvement);
  } catch (error: any) {
    console.error('Error logging improvement:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
