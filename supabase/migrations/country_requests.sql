-- Create country_requests table
CREATE TABLE country_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code text NOT NULL,
  country_name text,
  postcode text,
  user_id uuid REFERENCES auth.users(id),
  ip_country text,
  created_at timestamptz DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX idx_country_requests_code ON country_requests(country_code);

-- Create view for aggregation
CREATE VIEW country_request_counts AS
SELECT
  country_code,
  country_name,
  count(*) as request_count,
  min(created_at) as first_request,
  max(created_at) as last_request
FROM country_requests
GROUP BY country_code, country_name;

-- Enable RLS
ALTER TABLE country_requests ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can insert (for anonymous users)
CREATE POLICY "Anyone can insert country requests" ON country_requests
  FOR INSERT WITH CHECK (true);

-- Policy: only service_role can read (for analytics)
CREATE POLICY "Service role can read country requests" ON country_requests
  FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role');