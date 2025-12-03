# Fix "owner_name column not found" Error on Localhost

If you see the error: **"Could not find the 'owner_name' column of 'profiles' in the schema cache"**

This is a Supabase schema caching issue. Here's how to fix it:

## Option 1: Clear Browser Cache (Fastest)
1. Open browser DevTools (F12)
2. Go to Application → Storage → Clear Site Data
3. Refresh the page (Ctrl/Cmd + Shift + R)

## Option 2: Restart Dev Server
\`\`\`bash
# Stop the server (Ctrl + C)
npm run dev
\`\`\`

## Option 3: Clear Supabase Client Cache
1. Delete the `.next` folder in your project
\`\`\`bash
rm -rf .next
\`\`\`
2. Restart the dev server
\`\`\`bash
npm run dev
\`\`\`

## Why This Happens
- The Supabase client caches the database schema for performance
- When the schema changes, the cache needs to be cleared
- The `owner_name` column EXISTS in your database (verified ✓)
- The code is correct - it's just a caching issue

## Verification
Your profiles table has these columns:
- `id` (uuid)
- `owner_name` (text) ✓
- `email` (text)
- `phone` (text)
- `gym_name` (text)
- `role` (USER-DEFINED)
- `created_at` (timestamp)

All columns are present and correct!
