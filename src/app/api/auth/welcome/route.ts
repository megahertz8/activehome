import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { sendWelcomeEmail } from '@/lib/welcome-email';

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: 'No user' }, { status: 401 });
  }

  // Check if welcome email already sent, handle missing column gracefully
  let alreadySent = false;
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('welcome_email_sent')
      .eq('id', user.id)
      .single();

    if (profile?.welcome_email_sent) {
      alreadySent = true;
    }
  } catch (checkError) {
    console.warn('Welcome email check failed (likely missing column):', checkError);
  }

  if (alreadySent) {
    return NextResponse.json({ already_sent: true });
  }

  try {
    await sendWelcomeEmail(user.email, user.user_metadata?.full_name);

    // Mark as sent, ignore if column missing
    await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        welcome_email_sent: true
      }, { onConflict: 'id' });

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error('Welcome email error:', error);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
