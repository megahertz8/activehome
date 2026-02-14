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
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      postcode,
      address,
      lmk_key,
      current_rating,
      potential_rating,
      current_efficiency,
      potential_efficiency,
      annual_energy_cost,
      solar_potential_kwh,
      score_data
    } = body

    if (!postcode || !address) {
      return NextResponse.json({ error: 'Postcode and address are required' }, { status: 400 })
    }

    // Enforce 1 home per user limit
    const { data: existingHomes, error: countError } = await supabase
      .from('saved_homes')
      .select('id')
      .eq('user_id', user.id)

    if (countError) {
      console.error('Error checking home count:', countError)
      return NextResponse.json({ error: 'Failed to check home count' }, { status: 500 })
    }

    if (existingHomes && existingHomes.length >= 1) {
      return NextResponse.json({ error: 'You can only save one home per account' }, { status: 403 })
    }

    // Check if this specific home already exists (redundant now, but kept for safety)
    const { data: existing } = await supabase
      .from('saved_homes')
      .select('id')
      .eq('user_id', user.id)
      .eq('postcode', postcode)
      .eq('address', address)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Home already saved' }, { status: 409 })
    }

    const { data: home, error } = await supabase
      .from('saved_homes')
      .insert({
        user_id: user.id,
        postcode,
        address,
        lmk_key,
        current_rating,
        potential_rating,
        current_efficiency,
        potential_efficiency,
        annual_energy_cost,
        solar_potential_kwh,
        score_data,
        scan_count: 1
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving home:', error)
      return NextResponse.json({ error: 'Failed to save home' }, { status: 500 })
    }

    // Award 25 credits for first scan
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    const currentCredits = currentProfile?.credits || 0
    await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        credits: currentCredits + 25
      }, { onConflict: 'id' })

    return NextResponse.json(home)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}