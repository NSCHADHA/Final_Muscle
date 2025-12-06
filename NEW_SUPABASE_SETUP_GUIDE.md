# MuscleDesk - New Supabase Account Setup Guide

Follow these steps to switch to your new Supabase account and deploy to Vercel.

## Step 1: Create New Supabase Project

1. Go to https://supabase.com
2. Sign in or create a new account
3. Click "New Project"
4. Fill in:
   - **Project Name**: MuscleDesk (or any name you want)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project" and wait 2-3 minutes

## Step 2: Get Your Credentials

1. Once your project is ready, go to **Settings** → **API**
2. Copy these values (you'll need them):
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)
   - **service_role key** (for server-side operations)

## Step 3: Set Up Database

1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New Query"
3. Copy the ENTIRE contents of `scripts/complete-database-setup.sql`
4. Paste it into the SQL Editor
5. Click "Run" (bottom right)
6. You should see "Success. No rows returned" - this is correct!

**Verify it worked:**
- Go to **Table Editor** - you should see 7 tables:
  - profiles
  - branches
  - members
  - plans
  - payments
  - staff_members
  - activity_log

## Step 4: Update Environment Variables

### For v0 Preview (Current Workspace):
1. Click the **Vars** icon in the left sidebar
2. Update these variables with your NEW Supabase credentials:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your_new_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key
   \`\`\`

### For Local Development:
1. Create a file named `.env.local` in your project root
2. Add these lines:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=your_new_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_new_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   \`\`\`

### For Vercel Deployment:
1. Go to your Vercel dashboard
2. Select your project (or create new one)
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = your_new_project_url
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your_new_anon_key
   - `SUPABASE_SERVICE_ROLE_KEY` = your_service_role_key

## Step 5: Test Authentication

### Enable Email Authentication:
1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled (it should be by default)
3. Under **Auth Settings**:
   - Disable "Confirm email" for easier testing (you can enable later)

### Test Signup:
1. Run your app (locally or in v0 preview)
2. Go to signup page
3. Create a test account with:
   - Email: test@example.com
   - Password: TestPass123!
   - Owner Name: Test Owner
   - Gym Name: Test Gym
4. Check your Supabase dashboard:
   - **Authentication** → **Users** - you should see your user
   - **Table Editor** → **profiles** - you should see your profile
   - **Table Editor** → **branches** - you should see "Main Branch"

## Step 6: Deploy to Vercel

### Option A: Deploy from v0
1. Click **Publish** button in v0
2. Follow the prompts to deploy to Vercel
3. Vercel will automatically use the environment variables from Step 4

### Option B: Deploy from GitHub
1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "Add New Project"
4. Import your GitHub repository
5. Add environment variables (from Step 4)
6. Click "Deploy"

## Step 7: Verify Production Deployment

1. Visit your deployed Vercel URL
2. Sign up with a new account
3. Try adding:
   - A member
   - A payment
   - A plan
4. Check everything works without errors

## Troubleshooting

### Error: "Your project's URL and API key are required"
- Make sure environment variables are set correctly
- For Vercel: Redeploy after adding environment variables

### Error: "Invalid login credentials"
- Clear browser cache/cookies
- Make sure you're using the correct email/password

### Error: "relation does not exist"
- Run the SQL setup script again in Supabase SQL Editor
- Make sure all tables were created

### Error: "permission denied for table"
- RLS policies might not be set up correctly
- Re-run the complete SQL setup script

## Security Checklist

Before going live with real users:

- [ ] Enable "Confirm email" in Supabase Auth settings
- [ ] Set up email templates (Supabase → Auth → Email Templates)
- [ ] Enable password strength requirements
- [ ] Set up proper CORS settings
- [ ] Review all RLS policies
- [ ] Set up database backups
- [ ] Add custom domain in Vercel
- [ ] Set up analytics/monitoring

## Your Credentials (Fill in):

\`\`\`
Project URL: _________________________________
Anon Key: ____________________________________
Service Role Key: ____________________________
Database Password: ___________________________
\`\`\`

Keep these secure and NEVER commit them to GitHub!
