# Switch to New Supabase Account - Complete Guide

## Quick Setup (5 minutes)

### Step 1: Get New Credentials
1. Go to https://supabase.com
2. Create new project (or select existing)
3. Go to **Settings → API**
4. Copy:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - anon public key (starts with `eyJ...`)

### Step 2: Set Up Database
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `scripts/setup-new-supabase.sql`
4. Paste and click **Run**
5. Wait for "Success" message (takes 5-10 seconds)

### Step 3: Update Environment Variables

**For Local Development:**
Create/update `.env.local` file in your project root:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

**For Vercel Deployment:**
1. Go to your Vercel project
2. Settings → Environment Variables
3. Add/update:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Redeploy

**For Netlify Deployment:**
1. Go to your Netlify site
2. Site settings → Environment variables
3. Add/update the same two variables
4. Trigger new deploy

### Step 4: Test
1. Start your app: `npm run dev`
2. Go to http://localhost:3000
3. Sign up with new account
4. Add test member
5. Verify data appears in Supabase dashboard

## That's It!

Your MuscleDesk is now running on your new Supabase account. All data will be stored in your new database with proper security (Row Level Security enabled).

## Troubleshooting

**"Invalid login credentials" error?**
- Make sure you've run the SQL setup script
- Try signing up as a new user first
- Check that environment variables are correct

**Data not appearing?**
- Check Supabase dashboard → Table Editor to verify tables exist
- Check browser console for errors
- Verify RLS policies are enabled

**Need to migrate old data?**
- Export from old Supabase (Table Editor → Export as CSV)
- Import to new Supabase (Table Editor → Import CSV)
- Make sure to update user_id fields to match new auth users
