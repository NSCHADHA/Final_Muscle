# MuscleDesk - Local Setup Guide

## Prerequisites

Before you start, make sure you have installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **pnpm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)

## Step 1: Download the Project

### Option A: Download from v0
1. Click the three dots (⋮) in the top right of the v0 interface
2. Select "Download ZIP"
3. Extract the ZIP file to your desired location

### Option B: Clone from GitHub (if you've pushed it)
\`\`\`bash
git clone <your-repo-url>
cd muscledesk
\`\`\`

## Step 2: Install Dependencies

Open your terminal in the project folder and run:

\`\`\`bash
# Using npm
npm install

# OR using pnpm (faster)
pnpm install
\`\`\`

This will install all required packages (Next.js, React, Supabase, Tailwind CSS, etc.)

## Step 3: Set Up Environment Variables

1. Copy the example environment file:
\`\`\`bash
# On Windows (Command Prompt)
copy .env.local.example .env.local

# On Mac/Linux (Terminal)
cp .env.local.example .env.local
\`\`\`

2. Your `.env.local` file already contains your Supabase credentials:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://yihbzmkerljlmzofkzmc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

**Note:** These credentials are already configured and ready to use!

## Step 4: Verify Database Setup

Your Supabase database should already have these tables:
- `profiles` (user accounts)
- `branches` (gym locations)
- `members` (gym members)
- `plans` (membership plans)
- `payments` (payment records)
- `reminders` (expiry notifications)
- `staff_members` (staff management)

If you need to recreate the database, run the SQL script in `scripts/complete-database-setup.sql` in your Supabase SQL Editor.

## Step 5: Run the Development Server

Start the local development server:

\`\`\`bash
# Using npm
npm run dev

# OR using pnpm
pnpm dev
\`\`\`

You should see:
\`\`\`
✓ Ready in 2.3s
○ Local:        http://localhost:3000
\`\`\`

## Step 6: Open Your App

1. Open your browser
2. Go to: **http://localhost:3000**
3. You should see the MuscleDesk login page!

## Step 7: Create Your First Account

1. Click "Sign Up" on the login page
2. Fill in:
   - **Gym Name**: Your gym name
   - **Owner Name**: Your name
   - **Email**: Your email
   - **Password**: Your password (min 6 characters)
3. Click "Sign Up"
4. Check your email for verification (if required)
5. Login with your credentials

## Troubleshooting

### Issue: "Module not found" errors
**Solution:** Run `npm install` or `pnpm install` again

### Issue: "Port 3000 already in use"
**Solution:** 
- Stop other apps using port 3000
- Or use a different port: `npm run dev -- -p 3001`

### Issue: "Failed to fetch" or Supabase connection errors
**Solution:**
- Verify your `.env.local` file exists
- Check that your Supabase project is active at https://supabase.com/dashboard

### Issue: CSS not loading properly
**Solution:** 
- Delete `.next` folder
- Run `npm run dev` again

### Issue: TypeScript errors
**Solution:**
- Make sure all dependencies are installed
- Run `npm run build` to check for errors

## Available Commands

\`\`\`bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server (after build)
npm start

# Check for linting errors
npm run lint
\`\`\`

## Project Structure

\`\`\`
muscledesk/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── page.tsx           # Home/Login page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/             # Login/Signup components
│   ├── layout/           # Header, Sidebar, etc.
│   ├── pages/            # Dashboard, Members, etc.
│   └── ui/               # UI components (buttons, cards, etc.)
├── hooks/                # Custom React hooks
│   └── useGymData.ts     # Main data management hook
├── lib/                  # Utility libraries
│   └── supabase/         # Supabase client setup
├── public/               # Static assets (images, icons)
├── scripts/              # Database setup scripts
└── .env.local           # Your environment variables
\`\`\`

## Features Available Locally

✅ User Authentication (Login/Signup)
✅ Dashboard with Analytics
✅ Member Management (Add, Edit, Delete)
✅ Plan Management
✅ Payment Tracking
✅ Expiry Reminders
✅ Multi-branch Support
✅ Settings & Data Export
✅ PWA Support (Install as App)
✅ Mobile Responsive Design

## Next Steps

Once everything is working locally:

1. **Test all features** - Add members, plans, payments
2. **Customize** - Modify colors, branding, features
3. **Deploy to Vercel** - See `VERCEL_DEPLOYMENT_CHECKLIST.md`

## Need Help?

- Check `DEPLOYMENT_GUIDE.md` for deployment instructions
- Check `PRODUCTION_CHECKLIST.md` for production readiness
- Review Supabase dashboard: https://supabase.com/dashboard

## Important Notes

- Your database is already set up with your Supabase account
- All features are production-ready
- The app runs entirely in your browser when local
- No additional backend server needed (uses Supabase)

Happy gym management! 🏋️‍♂️💪
