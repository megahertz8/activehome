-- Drop existing policies
DROP POLICY IF EXISTS "Allow anonymous inserts" ON waitlist;
DROP POLICY IF EXISTS "Service role can read" ON waitlist;

-- Recreate with correct syntax - allow anyone to insert
CREATE POLICY "Anyone can insert" ON waitlist
  FOR INSERT
  WITH CHECK (true);

-- Only service_role can read
CREATE POLICY "Service role reads" ON waitlist
  FOR SELECT
  USING (auth.role() = 'service_role');
