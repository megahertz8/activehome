-- Grant insert permission to anon role
GRANT INSERT ON waitlist TO anon;

-- Grant usage on the sequence for auto-increment
GRANT USAGE ON SEQUENCE waitlist_id_seq TO anon;

-- Grant full access to service_role
GRANT ALL ON waitlist TO service_role;
GRANT USAGE ON SEQUENCE waitlist_id_seq TO service_role;
