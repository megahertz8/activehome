import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: homes, error } = await supabase
      .from('saved_homes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching homes:', error)
      return NextResponse.json({ error: 'Failed to fetch homes' }, { status: 500 })
    }

    return NextResponse.json(homes)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Redirect to new /api/homes/claim endpoint for backward compatibility
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Forward to claim endpoint with proper format
    const claimResponse = await fetch(
      new URL('/api/homes/claim', request.url).toString(),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: body.address,
          postcode: body.postcode,
          lat: body.lat,
          lng: body.lng,
          epcData: body.lmk_key ? {
            'lmk-key': body.lmk_key,
            'current-energy-rating': body.current_rating,
            'potential-energy-rating': body.potential_rating,
            'current-energy-efficiency': body.current_efficiency?.toString(),
            'potential-energy-efficiency': body.potential_efficiency?.toString()
          } : undefined
        })
      }
    )

    const home = await claimResponse.json()
    
    if (!claimResponse.ok) {
      return NextResponse.json({ error: home.error || 'Failed to claim home' }, { status: claimResponse.status })
    }

    return NextResponse.json(home)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}