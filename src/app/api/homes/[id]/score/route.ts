import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { calculateHomeScore } from '@/lib/supabase-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createSupabaseServerClient();

    // Get home data
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

    // Recalculate score
    const newScore = calculateHomeScore(home);

    // Update if changed
    if (newScore !== home.score) {
      await supabase
        .from('homes')
        .update({
          score: newScore,
          score_updated_at: new Date().toISOString()
        })
        .eq('id', id);

      // Log the recalculation in history
      await supabase.from('score_history').insert({
        home_id: id,
        score: newScore,
        reason: 'recalculation',
        details: {
          old_score: home.score,
          trigger: 'manual_recalc'
        }
      });
    }

    return NextResponse.json({
      score: newScore,
      updated: newScore !== home.score
    });
  } catch (error: any) {
    console.error('Error recalculating score:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
