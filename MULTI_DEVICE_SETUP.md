# Multi-Device Account Setup Guide

Your MuscleDesk app is now configured for **permanent accounts that work across all devices** with real-time data syncing.

## How It Works

### 1. **Cookie-Based Authentication**
- Supabase sessions are stored in **HTTP-only cookies** (not localStorage)
- Cookies automatically sync across all browsers on the same device
- Sessions persist for 7 days with automatic refresh

### 2. **Database Row-Level Security (RLS)**
- All data is tied to your `user_id` from Supabase Auth
- RLS policies ensure you only see YOUR data, no matter which device you log in from
- Data is fetched in real-time from the database on every page load

### 3. **Middleware Session Refresh**
- The `proxy.ts` middleware runs on every request
- Automatically refreshes expired tokens
- Ensures you stay logged in across devices

## Using Your Account Across Devices

### Same Account, Multiple Devices

1. **Device 1 (Computer)**
   - Log in with: `nschadha99@gmail.com`
   - Add 2 members
   - Your data is saved to Supabase

2. **Device 2 (Phone)**
   - Log in with the SAME email: `nschadha99@gmail.com`
   - You'll see the same 2 members automatically
   - Add a payment → it syncs instantly

3. **Device 3 (Tablet)**
   - Log in with the SAME email
   - All your data (members, payments, plans) appears automatically

### Why It Works

Your account is identified by:
\`\`\`
user_id: 0c673dfa-f390-4ace-b655-8d2b1f2bea4b
\`\`\`

All data in the database has this `user_id`:
- `members.user_id = 0c673dfa-f390-4ace-b655-8d2b1f2bea4b`
- `payments.user_id = 0c673dfa-f390-4ace-b655-8d2b1f2bea4b`
- `plans.user_id = 0c673dfa-f390-4ace-b655-8d2b1f2bea4b`

When you log in from ANY device, Supabase returns the same `user_id`, so you see the same data!

## Current Account

**Email:** nschadha99@gmail.com  
**Gym Name:** LifeTime  
**Owner:** NsChadha  
**Phone:** +91 8320699497

**Current Data:**
- 2 Members (Devasya, Darvesh)
- 1 Payment
- 1 Plan
- 1 Branch

## Troubleshooting

### "No data on localhost but data on v0 preview"

This happens when:
1. **Different environments** - v0 preview and localhost might be using different Supabase projects
2. **Solution:** Copy your `.env.local` file with the correct credentials:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://yihbzmkerljlmzofkzmc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-key-here
\`\`\`

3. Restart your dev server: `npm run dev`

### "Wrong credentials when switching devices"

- You're trying to log in with a DIFFERENT email
- Use the SAME email on all devices: `nschadha99@gmail.com`
- The password must match the one you created during signup

### Data Not Syncing

1. Check browser console for errors
2. Verify you're logged in (check user icon in header)
3. Hard refresh the page: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

## Security

- ✅ All data protected by Row-Level Security
- ✅ You can only see YOUR gym's data
- ✅ Sessions automatically expire after 7 days of inactivity
- ✅ Passwords are hashed and never stored in plain text
