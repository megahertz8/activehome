import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getTrackingLink } from '@/data/affiliates'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const aff = searchParams.get('aff') // e.g., bark-solar
  const userId = searchParams.get('user_id') || 'anonymous'
  const postcode = searchParams.get('postcode') || ''
  const category = searchParams.get('category') || ''

  if (!aff) {
    return NextResponse.json({ error: 'Missing aff param' }, { status: 400 })
  }

  // Parse aff: assume format affiliate-category, e.g., bark-solar
  const [affiliateId, cat] = aff.split('-')
  const link = getTrackingLink(affiliateId, cat || category)

  if (!link) {
    return NextResponse.json({ error: 'Invalid affiliate' }, { status: 400 })
  }

  // Log to Supabase
  try {
    const { error } = await supabase
      .from('contractor_clicks')
      .insert({
        user_id: userId,
        postcode,
        category: cat || category,
        affiliate_id: affiliateId,
        timestamp: new Date().toISOString(),
      })

    if (error) {
      console.error('Supabase insert error:', error)
      // Continue anyway
    }
  } catch (err) {
    console.error('Error logging click:', err)
  }

  // Redirect to affiliate link
  return NextResponse.redirect(link)
}