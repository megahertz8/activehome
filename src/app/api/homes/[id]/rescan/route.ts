import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const homeId = resolvedParams.id

    // Get the home to rescan
    const { data: home, error: fetchError } = await supabase
      .from('saved_homes')
      .select('*')
      .eq('id', homeId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !home) {
      return NextResponse.json({ error: 'Home not found' }, { status: 404 })
    }

    // Fetch updated EPC data
    const epcResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/epc?postcode=${encodeURIComponent(home.postcode)}&address=${encodeURIComponent(home.address)}`
    )

    if (!epcResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch updated data' }, { status: 500 })
    }

    const epcData = await epcResponse.json()

    if (epcData.error) {
      return NextResponse.json({ error: epcData.error }, { status: 400 })
    }

    // Update the home with new data
    const { data: updatedHome, error: updateError } = await supabase
      .from('saved_homes')
      .update({
        current_rating: epcData.currentRating,
        potential_rating: epcData.potentialRating,
        current_efficiency: epcData.currentEfficiency,
        potential_efficiency: epcData.potentialEfficiency || null,
        annual_energy_cost: epcData.livePricing?.currentAnnualCost || epcData.currentCost,
        solar_potential_kwh: epcData.solar?.annualGeneration_kWh || null,
        last_scanned_at: new Date().toISOString(),
        scan_count: (home.scan_count || 1) + 1,
        score_data: epcData
      })
      .eq('id', homeId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating home:', updateError)
      return NextResponse.json({ error: 'Failed to update home' }, { status: 500 })
    }

    // Award 25 credits for rescan
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

    return NextResponse.json(updatedHome)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}