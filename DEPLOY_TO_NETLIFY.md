# Deploy MuscleDesk to Netlify

Complete guide to deploy your gym management SaaS to Netlify.

## Prerequisites

1. GitHub account
2. Netlify account (free tier works)
3. Supabase account (already set up)

## Step 1: Push to GitHub

\`\`\`bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - MuscleDesk"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/muscledesk.git
git branch -M main
git push -u origin main
\`\`\`

## Step 2: Run Database Migration

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Copy the entire content of `supabase/migrations/001_complete_schema.sql`
5. Paste it into the SQL editor
6. Click "Run" to execute the migration
7. Verify all tables and functions were created successfully

## Step 3: Deploy to Netlify

### Option A: One-Click Deploy (Easiest)

1. Go to https://app.netlify.com/
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" and authorize Netlify
4. Select your `muscledesk` repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Base directory**: (leave empty)
6. Click "Add environment variables"
7. Add these variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key
8. Click "Deploy site"

### Option B: Using Netlify CLI

\`\`\`bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
\`\`\`

## Step 4: Configure Custom Domain (Optional)

1. In Netlify dashboard, go to "Domain settings"
2. Click "Add custom domain"
3. Follow the DNS configuration instructions
4. Wait for SSL certificate to be provisioned (automatic)

## Step 5: Update Supabase Auth Settings

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Netlify URL to "Site URL": `https://your-app.netlify.app`
3. Add your Netlify URL to "Redirect URLs": `https://your-app.netlify.app/**`
4. Save changes

## Verification

1. Visit your Netlify URL
2. Create a new account
3. Login with the same credentials on different devices
4. Verify data syncs across devices

## Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Ensure all environment variables are set
- Verify `package.json` has all dependencies

### Login Issues
- Clear browser cache
- Check Supabase URL configuration
- Verify environment variables are correct

### Data Not Syncing
- Check browser console for errors
- Verify RLS policies in Supabase
- Ensure user_id is being passed correctly

## Production Checklist

- ✅ Database migration completed
- ✅ Environment variables configured
- ✅ Supabase auth URLs updated
- ✅ Custom domain configured (optional)
- ✅ SSL certificate active
- ✅ Test account creation and login
- ✅ Test data sync across devices

## Support

If you encounter issues:
1. Check Netlify build logs
2. Check browser console errors
3. Verify Supabase connection
4. Test on different devices

Your app is now live and production-ready!
\`\`\`

\`\`\`json file="" isHidden
