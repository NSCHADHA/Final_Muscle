# Fix Schema Cache Error on Localhost

If you're seeing the error: **"Could not find the 'owner_name' column of 'profiles' in the schema cache"**

## Quick Fix (Choose ONE):

### Option 1: Run the SQL Migration (Recommended)
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to: SQL Editor
3. Copy and paste the contents of `scripts/fix-schema-cache.sql`
4. Click "Run"
5. Refresh your localhost page

### Option 2: Clear Browser Cache
1. Open Chrome DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Try signing up again

### Option 3: Clear Supabase Storage
1. Open Chrome DevTools (F12)
2. Go to Application → Local Storage
3. Delete all entries starting with "sb-"
4. Refresh the page

### Option 4: Restart Dev Server
\`\`\`bash
# Stop the server (Ctrl+C)
# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
\`\`\`

## Why This Happens
The Supabase JavaScript client caches table schemas in the browser. When you're developing locally and the schema changes, the cache can become stale. The RPC function bypasses this cache entirely.

## Permanent Fix
The SQL migration creates a PostgreSQL function that handles profile creation server-side, completely bypassing the client-side schema cache.
