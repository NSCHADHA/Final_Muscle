# Deployment Guide for MuscleDesk Gym SaaS

## Local Development Setup

1. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure Environment Variables**
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase credentials from [Supabase Dashboard](https://supabase.com/dashboard)

3. **Run development server**
   \`\`\`bash
   npm run dev
   \`\`\`

## Deploy to Vercel

1. **Push to GitHub**
   \`\`\`bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   \`\`\`

2. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables**
   - In Vercel project settings → Environment Variables
   - Add these variables (they should already be connected if you used v0):
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - All other Supabase variables

4. **Deploy**
   - Click "Deploy"
   - Your app will be live at `your-project.vercel.app`

## Deploy to Netlify

1. **Build command:** `npm run build`
2. **Publish directory:** `.next`
3. **Add environment variables** in Netlify dashboard (same as above)

## Troubleshooting

### Error: "Supabase client creation failed"
- Make sure environment variables are set correctly
- Check that they're prefixed with `NEXT_PUBLIC_` for client-side access

### Build fails with TypeScript errors
- Run `npm run build` locally to see the errors
- Fix any type errors before deploying

### PWA not working
- Ensure manifest.json is in the public folder
- Check that service worker is registered in app/layout.tsx
\`\`\`

\`\`\`ts file="middleware.ts" isDeleted="true"
...deleted...
