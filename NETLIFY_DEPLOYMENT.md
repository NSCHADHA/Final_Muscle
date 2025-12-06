# MuscleDesk - Netlify Deployment Guide

## Prerequisites

- Netlify account (free tier works)
- Your Supabase project credentials
- GitHub repository (optional, but recommended)

## Quick Deploy Steps

### 1. Environment Variables

Add these environment variables in Netlify Dashboard → Site Settings → Environment Variables:

\`\`\`bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database Configuration (from Supabase)
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DATABASE=your_db_name
POSTGRES_HOST=your_db_host

# Supabase Auth
SUPABASE_JWT_SECRET=your_jwt_secret
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: For development redirects
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=https://your-app.netlify.app
\`\`\`

### 2. Build Settings

In Netlify Dashboard → Site Settings → Build & Deploy:

**Build Command:**
\`\`\`bash
npm run build
\`\`\`

**Publish Directory:**
\`\`\`bash
.next
\`\`\`

**Node Version:**
\`\`\`bash
20.x
\`\`\`

### 3. Deploy via GitHub (Recommended)

1. Push your code to GitHub
2. Go to Netlify Dashboard
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repository
5. Configure build settings (use settings from step 2)
6. Add environment variables (from step 1)
7. Click "Deploy site"

### 4. Deploy via Netlify CLI (Alternative)

\`\`\`bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize Netlify in your project
netlify init

# Deploy
netlify deploy --prod
\`\`\`

### 5. Post-Deployment Configuration

#### Update Supabase Redirect URLs

1. Go to your Supabase Dashboard
2. Navigate to Authentication → URL Configuration
3. Add your Netlify URL to:
   - Site URL: `https://your-app.netlify.app`
   - Redirect URLs: `https://your-app.netlify.app/**`

#### Enable Custom Domain (Optional)

1. Go to Netlify Dashboard → Domain Settings
2. Add your custom domain
3. Update DNS records as instructed
4. Enable HTTPS (automatic with Netlify)

### 6. PWA Configuration

PWA works automatically on Netlify! The service worker and manifest are served correctly.

To verify:
1. Open your deployed site in Chrome
2. Check DevTools → Application → Manifest
3. Check DevTools → Application → Service Workers
4. You should see an install prompt on mobile devices

### 7. Verify Deployment

Check these features:
- [ ] Login/Signup works
- [ ] Dashboard loads with data
- [ ] Add/Edit/Delete members works
- [ ] Payments can be recorded
- [ ] Plans can be created
- [ ] PWA install prompt appears
- [ ] Multi-device login works
- [ ] Real-time sync works across tabs

### 8. Common Issues & Solutions

#### Issue: Environment variables not working
**Solution:** Redeploy after adding env vars: `Settings → Deploys → Trigger deploy`

#### Issue: 404 on page refresh
**Solution:** Netlify automatically handles Next.js routing, but verify `netlify.toml` if needed

#### Issue: Build fails
**Solution:** 
- Check Node version is 20.x
- Run `npm install` and `npm run build` locally first
- Check build logs in Netlify dashboard

#### Issue: Database connection fails
**Solution:** 
- Verify all Supabase env vars are correct
- Check Supabase project is not paused
- Ensure RLS policies are enabled

### 9. Performance Optimization

Netlify automatically provides:
- CDN distribution
- Asset compression
- HTTPS
- Automatic deployments from Git

### 10. Monitoring

Monitor your app:
- Netlify Analytics (paid)
- Vercel Analytics (already integrated in code)
- Supabase Dashboard for database metrics

## Success!

Your MuscleDesk app is now live on Netlify with:
- Full PWA support
- Real-time database sync
- Multi-device authentication
- Production-ready performance

**Your app URL:** `https://your-app.netlify.app`

## Need Help?

- Netlify Docs: https://docs.netlify.com
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
\`\`\`

\`\`\`toml file="" isHidden
