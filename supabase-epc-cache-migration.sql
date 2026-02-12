-- Migration to create EPC cache table in Supabase
-- Run this in Supabase SQL editor or via migration tool

CREATE TABLE IF NOT EXISTS epc_cache (
  lmk_key TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  postcode TEXT NOT NULL,
  current_energy_rating TEXT,
  potential_energy_rating TEXT,
  current_energy_efficiency INTEGER,
  potential_energy_efficiency INTEGER,
  property_type TEXT,
  built_form TEXT,
  total_floor_area REAL,
  heating_cost_current REAL,
  hot_water_cost_current REAL,
  lighting_cost_current REAL,
  heating_cost_potential REAL,
  hot_water_cost_potential REAL,
  lighting_cost_potential REAL,
  walls_description TEXT,
  roof_description TEXT,
  floor_description TEXT,
  windows_description TEXT,
  mainheat_description TEXT,
  main_fuel TEXT,
  lodgement_date TEXT,
  local_authority TEXT,
  cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_epc_cache_postcode ON epc_cache (postcode);
CREATE INDEX IF NOT EXISTS idx_epc_cache_address ON epc_cache (address);
CREATE INDEX IF NOT EXISTS idx_epc_cache_cached_at ON epc_cache (cached_at);

-- Function to clean old cache entries (TTL 30 days)
CREATE OR REPLACE FUNCTION clean_old_epc_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM epc_cache WHERE cached_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a trigger to auto-clean on insert (or run periodically)
-- CREATE TRIGGER trigger_clean_epc_cache
--   AFTER INSERT ON epc_cache
--   EXECUTE FUNCTION clean_old_epc_cache();