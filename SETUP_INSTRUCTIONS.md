# Organization Feature Setup Instructions

## Database Migration Required

You need to add the `join_code` column to your organizations table in Supabase.

### Steps:

1. Go to your Supabase Dashboard: https://qlwpfxjuuneujjlfqdrh.supabase.co
2. Navigate to the SQL Editor
3. Run the following SQL:

```sql
-- Add join_code column to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS join_code VARCHAR(8) UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_organizations_join_code ON organizations(join_code);

-- Optional: Add a comment to the column
COMMENT ON COLUMN organizations.join_code IS '8-character alphanumeric code for users to join the organization';
```

## What Was Fixed

### 1. Row-Level Security (RLS) Issue
- Updated all API routes to use `supabaseAdmin` instead of `supabase`
- The admin client bypasses RLS policies, allowing server-side operations
- Affected files:
  - `/src/lib/supabase.ts` - Added `supabaseAdmin` export
  - `/src/app/api/join-organization/route.ts` - Now uses `supabaseAdmin`
  - `/src/app/api/admin/organizations/route.ts` - Now uses `supabaseAdmin`

### 2. Chat Sidebar "Join Organization" Button
- Added the button to the chat page sidebar
- Only visible to non-admin users
- Works in both expanded and collapsed states
- Navigates to `/join-organization` page
- All text colors updated to black for consistency

### 3. Organization Deletion
- Removed restriction preventing deletion of "Default Organization"
- All organizations can now be deleted by admins

## Features Now Available

1. **Admins can:**
   - Create organizations with auto-generated 8-character join codes
   - View all organizations with user counts
   - Copy join codes to clipboard
   - Delete any organization

2. **Users can:**
   - Click "Join Organization" button in chat sidebar
   - Enter an 8-character join code
   - Join organizations and get assigned to them
   - Skip joining if they want to stay in default organization

## Next Steps

After running the SQL migration, restart your Next.js dev server and test:
1. Create an organization as admin
2. Copy the join code
3. Log in as a user
4. Click "Join Organization" in the sidebar
5. Enter the code and join
