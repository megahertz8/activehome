// Database types for the home-centric architecture
// Based on: supabase/migrations/001_homes_refactor.sql

export interface Home {
  id: string;
  address: string;
  postcode: string;
  lat: number | null;
  lng: number | null;
  lmk_key: string | null;
  score: number;
  score_updated_at: string | null;
  epc_rating: string | null;
  epc_potential: string | null;
  epc_efficiency: number | null;
  epc_potential_efficiency: number | null;
  property_type: string | null;
  built_form: string | null;
  total_floor_area: number | null;
  walls_description: string | null;
  roof_description: string | null;
  floor_description: string | null;
  windows_description: string | null;
  heating_description: string | null;
  main_fuel: string | null;
  heating_cost: number | null;
  hot_water_cost: number | null;
  lighting_cost: number | null;
  solar_potential_kwh: number | null;
  year_built: number | null;
  biography_summary: string | null;
  claimed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface HomeOwner {
  id: string;
  home_id: string;
  user_id: string;
  role: 'owner' | 'tenant' | 'landlord' | 'previous_owner';
  is_current: boolean;
  from_date: string | null;
  to_date: string | null;
  created_at: string;
}

export interface ScoreHistoryEntry {
  id: string;
  home_id: string;
  score: number;
  reason: 'initial_claim' | 'improvement' | 'price_change' | 'grant_update' | 'recalculation';
  details: Record<string, any> | null;
  created_at: string;
}

export interface Improvement {
  id: string;
  home_id: string;
  logged_by: string | null;
  ecm_type: 'solar' | 'hp' | 'led' | 'insulation' | 'draught_proofing' | 'cylinder_insulation' | 'smart_thermostat' | 'double_glazing' | 'trvs' | 'pipe_insulation' | 'radiator_reflectors' | 'other';
  title: string;
  description: string | null;
  cost: number | null;
  grant_applied: string | null;
  grant_amount: number | null;
  score_before: number | null;
  score_after: number | null;
  estimated_annual_savings: number | null;
  verified_savings: number | null;
  completed_at: string | null;
  created_at: string;
}
