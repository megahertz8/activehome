-- =============================================
-- EVOLVING HOME: The Home is the Entity
-- Migration: Restructure around homes, not users
-- =============================================

-- 1. HOMES — the primary entity
CREATE TABLE IF NOT EXISTS homes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Address
  address text NOT NULL,
  postcode text NOT NULL,
  lat numeric,
  lng numeric,
  
  -- EPC reference
  lmk_key text UNIQUE,
  
  -- Living score (0-100)
  score integer DEFAULT 0,
  score_updated_at timestamptz,
  
  -- EPC snapshot
  epc_rating text,
  epc_potential text,
  epc_efficiency integer,
  epc_potential_efficiency integer,
  property_type text,
  built_form text,
  total_floor_area numeric,
  
  -- Building details (from EPC + user corrections)
  walls_description text,
  roof_description text,
  floor_description text,
  windows_description text,
  heating_description text,
  main_fuel text,
  
  -- Energy costs (from EPC)
  heating_cost numeric,
  hot_water_cost numeric,
  lighting_cost numeric,
  
  -- Solar (from PVGIS)
  solar_potential_kwh numeric,
  
  -- Biography
  year_built integer,
  biography_summary text,
  
  -- Meta
  claimed_at timestamptz, -- when first user claimed this home
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for postcode lookups and street leagues
CREATE INDEX IF NOT EXISTS idx_homes_postcode ON homes(postcode);
CREATE INDEX IF NOT EXISTS idx_homes_score ON homes(score DESC);

-- 2. HOME_OWNERS — relationship between users and homes
CREATE TABLE IF NOT EXISTS home_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id uuid NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'tenant', 'landlord', 'previous_owner')),
  is_current boolean DEFAULT true,
  from_date date,
  to_date date,
  created_at timestamptz DEFAULT now(),
  
  -- A user can only have one current relationship with a home
  UNIQUE(home_id, user_id, is_current)
);

CREATE INDEX IF NOT EXISTS idx_home_owners_user ON home_owners(user_id);
CREATE INDEX IF NOT EXISTS idx_home_owners_home ON home_owners(home_id);

-- 3. SCORE_HISTORY — the home's score over time
CREATE TABLE IF NOT EXISTS score_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id uuid NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  score integer NOT NULL,
  reason text NOT NULL, -- 'initial_claim', 'improvement', 'price_change', 'grant_update', 'recalculation'
  details jsonb, -- { "trigger": "loft_insulation", "score_before": 31, "score_after": 41 }
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_score_history_home ON score_history(home_id, created_at DESC);

-- 4. IMPROVEMENTS — the home's evolution log
CREATE TABLE IF NOT EXISTS improvements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id uuid NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  logged_by uuid REFERENCES auth.users(id), -- who logged it (null if system-detected)
  
  -- What was done
  ecm_type text NOT NULL, -- 'solar', 'hp', 'led', 'insulation', 'draught_proofing', etc.
  title text NOT NULL, -- "Cavity wall insulation"
  description text, -- "Installed by ABC Contractors via GBIS scheme"
  
  -- Financials
  cost numeric, -- actual cost paid
  grant_applied text, -- 'BUS', 'GBIS', etc.
  grant_amount numeric,
  
  -- Impact
  score_before integer,
  score_after integer,
  estimated_annual_savings numeric,
  verified_savings numeric, -- from smart meter (filled later)
  
  -- When
  completed_at date,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_improvements_home ON improvements(home_id, completed_at DESC);

-- 5. Enable RLS
ALTER TABLE homes ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE improvements ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Homes: anyone can read (scores are public for leagues), owners can update
CREATE POLICY "homes_read_all" ON homes FOR SELECT USING (true);
CREATE POLICY "homes_update_owner" ON homes FOR UPDATE USING (
  id IN (SELECT home_id FROM home_owners WHERE user_id = auth.uid() AND is_current = true)
);

-- Home owners: users can see their own relationships
CREATE POLICY "home_owners_read_own" ON home_owners FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "home_owners_insert_own" ON home_owners FOR INSERT WITH CHECK (user_id = auth.uid());

-- Score history: public read (for leagues), home owners can see full detail
CREATE POLICY "score_history_read_all" ON score_history FOR SELECT USING (true);

-- Improvements: public read (community sharing), home owners can insert
CREATE POLICY "improvements_read_all" ON improvements FOR SELECT USING (true);
CREATE POLICY "improvements_insert_owner" ON improvements FOR INSERT WITH CHECK (
  home_id IN (SELECT home_id FROM home_owners WHERE user_id = auth.uid() AND is_current = true)
);

-- 6. Migrate existing saved_homes data (if any)
-- INSERT INTO homes (address, postcode, lmk_key, epc_rating, epc_potential, epc_efficiency, epc_potential_efficiency, solar_potential_kwh, claimed_at, created_at)
-- SELECT address, postcode, lmk_key, current_rating, potential_rating, current_efficiency, potential_efficiency, solar_potential_kwh, created_at, created_at
-- FROM saved_homes;
-- (Run manually after verifying data)
