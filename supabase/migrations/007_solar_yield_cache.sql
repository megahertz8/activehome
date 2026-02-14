-- Migration: Create solar_yield_cache table for caching PVGIS data

CREATE TABLE solar_yield_cache (
  id SERIAL PRIMARY KEY,
  lat DECIMAL(10, 6) NOT NULL,
  lon DECIMAL(10, 6) NOT NULL,
  peak_power DECIMAL(10, 2) NOT NULL,
  tilt DECIMAL(5, 2) NOT NULL,
  azimuth DECIMAL(5, 2) NOT NULL,
  losses DECIMAL(5, 2) NOT NULL,
  data JSONB NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lat, lon, peak_power, tilt, azimuth, losses)
);

-- Create index for efficient lookups
CREATE INDEX idx_solar_yield_cache_lat_lon ON solar_yield_cache(lat, lon);
CREATE INDEX idx_solar_yield_cache_fetched_at ON solar_yield_cache(fetched_at);

-- Enable RLS
ALTER TABLE solar_yield_cache ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to authenticated users" ON solar_yield_cache
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow insert/update for authenticated users (for caching)
CREATE POLICY "Allow write access to authenticated users" ON solar_yield_cache
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update access to authenticated users" ON solar_yield_cache
  FOR UPDATE USING (auth.role() = 'authenticated');