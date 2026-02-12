-- Update profiles table to add referral fields
-- Run this in your Supabase SQL editor

-- Add referral_code column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Add plan column if it doesn't exist (default to 'free')
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';

-- Generate referral codes for existing users
UPDATE profiles
SET referral_code = UPPER(SUBSTRING(MD5(random()::text) FROM 1 FOR 8))
WHERE referral_code IS NULL;

-- Create a function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := UPPER(SUBSTRING(MD5(random()::text) FROM 1 FOR 8));
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = code) INTO exists;
    IF NOT exists THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Set default referral codes for new users
ALTER TABLE profiles ALTER COLUMN referral_code SET DEFAULT generate_referral_code();

-- Ensure credits default to 0
ALTER TABLE profiles ALTER COLUMN credits SET DEFAULT 0;