import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calculateHomeScore } from '@/lib/supabase-helpers';
import { Home } from '@/lib/types';
import { Database } from '@/lib/database.types';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>(cookieStore);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check ownership
  const { data: home, error: fetchError } = await supabase
    .from('homes')
    .select('user_id')
    .eq('id', params.id)
    .single();

  if (fetchError || !home) {
    return NextResponse.json({ error: 'Home not found' }, { status: 404 });
  }

  if (home.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Not the owner' }, { status: 403 });
  }

  const updateData: Partial<Home> = await request.json();

  // Use service role client
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: updatedHome, error: updateError } = await supabaseAdmin
    .from('homes')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const newScore = await calculateHomeScore(updatedHome as Home);

  const { error: scoreError } = await supabaseAdmin
    .from('homes')
    .update({ score: newScore, score_updated_at: new Date().toISOString() })
    .eq('id', params.id);

  if (scoreError) {
    return NextResponse.json({ error: scoreError.message }, { status: 500 });
  }

  return NextResponse.json({ home: { ...updatedHome, score: newScore }, score: newScore });
}
