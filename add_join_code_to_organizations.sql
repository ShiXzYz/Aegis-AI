-- Add join_code column to organizations table
-- Run this SQL in your Supabase SQL Editor

-- Add the join_code column
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS join_code VARCHAR(8) UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_organizations_join_code ON organizations(join_code);

-- Optional: Add a comment to the column
COMMENT ON COLUMN organizations.join_code IS '8-character alphanumeric code for users to join the organization';
