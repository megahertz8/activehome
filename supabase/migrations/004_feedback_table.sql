-- Feedback table for soft launch
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/exrnpqwdnwlzsumaubci/sql

CREATE TABLE IF NOT EXISTS feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  email text,
  overall_rating int CHECK (overall_rating BETWEEN 1 AND 5),
  useful_features text,        -- comma-separated or free text
  missing_features text,       -- what they wish existed
  ease_of_use int CHECK (ease_of_use BETWEEN 1 AND 5),
  would_recommend boolean,
  comments text,
  country text,
  postcode_tested text,
  source text DEFAULT 'soft-launch',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Anyone can insert feedback (no auth required for soft launch)
CREATE POLICY "Anyone can submit feedback" ON feedback
  FOR INSERT WITH CHECK (true);

-- Only service_role can read (for analytics)
CREATE POLICY "Service role reads feedback" ON feedback
  FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');

-- Also run the country_requests migration if not already done:
CREATE TABLE IF NOT EXISTS country_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code text NOT NULL,
  country_name text,
  postcode text,
  user_id uuid REFERENCES auth.users(id),
  ip_country text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_country_requests_code ON country_requests(country_code);

ALTER TABLE country_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert country requests" ON country_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can read country requests" ON country_requests
  FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');
