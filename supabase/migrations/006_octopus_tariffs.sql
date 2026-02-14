-- Migration: Create octopus_tariffs table for caching tariff data

CREATE TABLE octopus_tariffs (
  id SERIAL PRIMARY KEY,
  postcode VARCHAR(10) NOT NULL,
  product_code VARCHAR(50) NOT NULL,
  tariff_code VARCHAR(50) NOT NULL,
  tariff_type VARCHAR(20) NOT NULL, -- 'electricity', 'gas'
  rate_type VARCHAR(20) NOT NULL, -- 'standard-unit-rates', 'standing-charges', 'export'
  data JSONB NOT NULL,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(postcode, product_code, tariff_code, rate_type)
);

-- Create index for efficient lookups
CREATE INDEX idx_octopus_tariffs_postcode_product ON octopus_tariffs(postcode, product_code);
CREATE INDEX idx_octopus_tariffs_fetched_at ON octopus_tariffs(fetched_at);

-- Enable RLS
ALTER TABLE octopus_tariffs ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to authenticated users" ON octopus_tariffs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow insert/update for authenticated users (for caching)
CREATE POLICY "Allow write access to authenticated users" ON octopus_tariffs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow update access to authenticated users" ON octopus_tariffs
  FOR UPDATE USING (auth.role() = 'authenticated');