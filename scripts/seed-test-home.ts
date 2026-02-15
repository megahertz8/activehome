#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js'
import { v4 as uuid } from 'uuid'

const SUPABASE_URL = process.env.SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function seedTestHome() {
  console.log('Seeding test home...')

  // Create test home
  const testHomeId = uuid()
  const { data: home, error: homeError } = await supabase
    .from('homes')
    .insert({
      id: testHomeId,
      address: '10 Test Street, Testville TV1 2AB',
      postcode: 'TV1 2AB',
      total_floor_area: 120,
      epc_efficiency: 62,
      score: 62,
      lat: 51.5074,
      lng: -0.1278
    })
    .select()
    .single()

  if (homeError) throw homeError

  console.log('Test home created:', testHomeId)

  // Get Eran's user ID (first user or hardcoded)
  const { data: users } = await supabase.auth.admin.listUsers()
  const eranId = users.data[0].id // or find by email

  // Link ownership
  const { error: ownerError } = await supabase
    .from('home_owners')
    .insert({
      home_id: testHomeId,
      user_id: eranId,
      is_current: true
    })

  if (ownerError) throw ownerError

  // Seed score history
  await supabase
    .from('score_history')
    .insert([
      { home_id: testHomeId, score: 62, reason: 'initial_claim' },
      { home_id: testHomeId, score: 72, reason: 'heat_pump_install' },
      { home_id: testHomeId, score: 80, reason: 'loft_insulation' }
    ])

  // Seed improvements
  await supabase
    .from('improvements')
    .insert([
      {
        home_id: testHomeId,
        user_id: eranId,
        type: 'heat_pump',
        cost: 4500,
        notes: 'BUS grant covered 75%',
        before_score: 62,
        after_score: 72
      },
      {
        home_id: testHomeId,
        user_id: eranId,
        type: 'loft_insulation',
        cost: 0,
        notes: 'GBIS free grant',
        before_score: 72,
        after_score: 80
      }
    ])

  console.log('✅ Test home seeded. View at /home/' + testHomeId)
}

seedTestHome().catch(console.error)
