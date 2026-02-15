import { createSupabaseServerClient } from './supabase-server';
import { Home, HomeOwner, ScoreHistoryEntry, Improvement } from './types';
import { EPCResult, searchByPostcode } from './epc';
import { getSolarPotential } from './solar';

/**
 * Get the home associated with a user (current home only)
 */
export async function getHomeForUser(userId: string): Promise<Home | null> {
  const supabase = createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('home_owners')
    .select('home_id')
    .eq('user_id', userId)
    .eq('is_current', true)
    .single();
  
  if (error || !data) return null;
  
  const { data: home } = await supabase
    .from('homes')
    .select('*')
    .eq('id', data.home_id)
    .single();
  
  return home || null;
}

/**
 * Calculate a home's living score (0-100)
 * Based on: EPC efficiency + solar potential + improvements made
 */
export function calculateHomeScore(home: Partial<Home>): number {
  let score = 0;
  
  // Base score from EPC efficiency (0-100 scale already)
  if (home.epc_efficiency) {
    score = home.epc_efficiency;
  }
  
  // Bonus for solar potential (up to +10 points)
  if (home.solar_potential_kwh) {
    const solarBonus = Math.min(10, (home.solar_potential_kwh / 4000) * 10);
    score += solarBonus;
  }
  
  // Adjust for energy price changes (simplified for now — in production, use real-time prices)
  // If prices rose since EPC, effective score drops slightly
  // This would require price history tracking — placeholder for future
  
  // Cap at 100
  return Math.min(100, Math.round(score));
}

/**
 * Claim a home (create or link)
 * Returns the home object
 */
export async function claimHome(
  userId: string,
  address: string,
  postcode: string,
  lat?: number,
  lng?: number,
  epcData?: EPCResult
): Promise<Home> {
  const supabase = createSupabaseServerClient();
  
  // Check if home already exists (by address + postcode, or lmk_key if available)
  let existingHome: Home | null = null;
  
  if (epcData?.['lmk-key']) {
    const { data } = await supabase
      .from('homes')
      .select('*')
      .eq('lmk_key', epcData['lmk-key'])
      .single();
    existingHome = data;
  }
  
  if (!existingHome) {
    const { data } = await supabase
      .from('homes')
      .select('*')
      .eq('address', address)
      .eq('postcode', postcode)
      .single();
    existingHome = data;
  }
  
  let home: Home;
  
  if (existingHome) {
    // Home exists — link user as owner
    home = existingHome;
  } else {
    // New home — fetch EPC data if not provided
    let epc = epcData;
    if (!epc && postcode) {
      try {
        const epcResults = await searchByPostcode(postcode);
        // Find the matching address
        epc = epcResults.find(r => 
          r.address.toLowerCase().includes(address.toLowerCase().split(',')[0].toLowerCase())
        );
      } catch (err) {
        console.error('Failed to fetch EPC data:', err);
      }
    }
    
    // Fetch solar potential
    let solarPotentialKwh: number | null = null;
    if (lat && lng) {
      try {
        const solar = await getSolarPotential(lat, lng);
        solarPotentialKwh = solar.yearlyProduction;
      } catch (err) {
        console.error('Failed to fetch solar potential:', err);
      }
    }
    
    // Build home data
    const homeData: Partial<Home> = {
      address,
      postcode,
      lat: lat ?? null,
      lng: lng ?? null,
      lmk_key: epc?.['lmk-key'] || null,
      epc_rating: epc?.['current-energy-rating'] || null,
      epc_potential: epc?.['potential-energy-rating'] || null,
      epc_efficiency: epc?.['current-energy-efficiency'] ? parseInt(epc['current-energy-efficiency']) : null,
      epc_potential_efficiency: epc?.['potential-energy-efficiency'] ? parseInt(epc['potential-energy-efficiency']) : null,
      property_type: epc?.['property-type'] || null,
      built_form: epc?.['built-form'] || null,
      total_floor_area: epc?.['total-floor-area'] ? parseFloat(epc['total-floor-area']) : null,
      walls_description: epc?.['walls-description'] || null,
      roof_description: epc?.['roof-description'] || null,
      floor_description: epc?.['floor-description'] || null,
      windows_description: epc?.['windows-description'] || null,
      heating_description: epc?.['mainheat-description'] || null,
      main_fuel: epc?.['main-fuel'] || null,
      heating_cost: epc?.['heating-cost-current'] ? parseFloat(epc['heating-cost-current']) : null,
      hot_water_cost: epc?.['hot-water-cost-current'] ? parseFloat(epc['hot-water-cost-current']) : null,
      lighting_cost: epc?.['lighting-cost-current'] ? parseFloat(epc['lighting-cost-current']) : null,
      solar_potential_kwh: solarPotentialKwh,
      claimed_at: new Date().toISOString(),
    };
    
    // Calculate initial score
    homeData.score = calculateHomeScore(homeData);
    homeData.score_updated_at = new Date().toISOString();
    
    // Insert home
    const { data: newHome, error } = await supabase
      .from('homes')
      .insert(homeData)
      .select()
      .single();
    
    if (error || !newHome) {
      throw new Error('Failed to create home: ' + error?.message);
    }
    
    home = newHome;
    
    // Log initial score in score_history
    await supabase.from('score_history').insert({
      home_id: home.id,
      score: home.score,
      reason: 'initial_claim',
      details: { 
        epc_efficiency: homeData.epc_efficiency,
        solar_potential: solarPotentialKwh 
      }
    });
  }
  
  // Link user as home_owner (if not already linked)
  const { data: existingOwner } = await supabase
    .from('home_owners')
    .select('id')
    .eq('home_id', home.id)
    .eq('user_id', userId)
    .eq('is_current', true)
    .single();
  
  if (!existingOwner) {
    await supabase.from('home_owners').insert({
      home_id: home.id,
      user_id: userId,
      role: 'owner',
      is_current: true,
      from_date: new Date().toISOString().split('T')[0]
    });
  }
  
  return home;
}

/**
 * Log an improvement for a home
 */
export async function logImprovement(
  homeId: string,
  improvement: Partial<Improvement>
): Promise<Improvement> {
  const supabase = createSupabaseServerClient();
  
  // Get current home score
  const { data: home } = await supabase
    .from('homes')
    .select('score')
    .eq('id', homeId)
    .single();
  
  const scoreBefore = home?.score || 0;
  
  // Insert improvement
  const { data: newImprovement, error } = await supabase
    .from('improvements')
    .insert({
      home_id: homeId,
      score_before: scoreBefore,
      ...improvement
    })
    .select()
    .single();
  
  if (error || !newImprovement) {
    throw new Error('Failed to log improvement: ' + error?.message);
  }
  
  // Recalculate score (add small bonus for logged improvement)
  const improvementBonus = 2; // +2 points per logged improvement
  const newScore = Math.min(100, scoreBefore + improvementBonus);
  
  await supabase
    .from('homes')
    .update({ 
      score: newScore, 
      score_updated_at: new Date().toISOString() 
    })
    .eq('id', homeId);
  
  // Update improvement with new score
  await supabase
    .from('improvements')
    .update({ score_after: newScore })
    .eq('id', newImprovement.id);
  
  // Log score change in history
  await supabase.from('score_history').insert({
    home_id: homeId,
    score: newScore,
    reason: 'improvement',
    details: {
      improvement_id: newImprovement.id,
      ecm_type: improvement.ecm_type,
      score_before: scoreBefore,
      score_after: newScore
    }
  });
  
  return { ...newImprovement, score_after: newScore };
}

/**
 * Get score history for a home
 */
export async function getScoreHistory(homeId: string): Promise<ScoreHistoryEntry[]> {
  const supabase = createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('score_history')
    .select('*')
    .eq('home_id', homeId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Failed to fetch score history:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Get improvements for a home
 */
export async function getImprovements(homeId: string): Promise<Improvement[]> {
  const supabase = createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('improvements')
    .select('*')
    .eq('home_id', homeId)
    .order('completed_at', { ascending: false });
  
  if (error) {
    console.error('Failed to fetch improvements:', error);
    return [];
  }
  
  return data || [];
}
