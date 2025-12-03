# Supabase Credentials for MuscleDesk

## Environment Variables Available in v0

Your Supabase project is already connected in v0. These credentials are automatically available:

- `NEXT_PUBLIC_SUPABASE_URL`: Your project's API URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anonymous key for client-side
- `SUPABASE_SERVICE_ROLE_KEY`: Admin key for server-side operations

## To Access Supabase Dashboard

1. Go to https://supabase.com
2. Click "Sign In"
3. Use the email associated with your v0/Vercel account
4. If you don't remember the password, click "Forgot password?" and reset it
5. Or sign in with GitHub if you used GitHub to connect v0

## For Local Development

Create a `.env.local` file with:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
\`\`\`

## For Deployment

Add these same environment variables in your Vercel/Netlify dashboard under "Environment Variables" settings.

## Current Database Status

Your database has these tables set up:
- `profiles` - User/gym owner profiles
- `members` - Gym members with membership details
- `payments` - Payment transactions
- `plans` - Membership plans
- `branches` - Multi-gym branch management (ready for future use)
- `staff_members` - Staff with role-based access (ready for future use)
- `activity_log` - Activity tracking

All tables have Row Level Security (RLS) enabled for data protection.
