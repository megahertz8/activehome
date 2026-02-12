-- Migration for saved_homes table in Evolving Home
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS saved_homes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  postcode TEXT NOT NULL,
  address TEXT NOT NULL,
  lmk_key TEXT,
  current_rating TEXT,
  potential_rating TEXT,
  current_efficiency INTEGER,
  potential_efficiency INTEGER,
  annual_energy_cost NUMERIC,
  solar_potential_kwh NUMERIC,
  last_scanned_at TIMESTAMPTZ DEFAULT now(),
  scan_count INTEGER DEFAULT 1,
  score_data JSONB, -- full score snapshot
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_saved_homes_user ON saved_homes(user_id);

-- RLS: users can only see/edit their own homes
ALTER TABLE saved_homes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own homes" ON saved_homes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own homes" ON saved_homes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own homes" ON saved_homes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own homes" ON saved_homes FOR DELETE USING (auth.uid() = user_id);