# 🔧 Quick Setup Guide - Apply Schema Updates

## Step 1: Run the Updated Schema

Your Supabase database needs the `links` and `interests` fields added. Follow these steps:

### Option A: Run the Full Schema (Recommended for New Projects)
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the **entire contents** of `supabase-schema.sql`
6. Paste into the SQL editor
7. Click **Run** or press `Ctrl+Enter`

### Option B: Add Just the New Fields (If You Already Ran Schema Before)
1. Go to **SQL Editor** in Supabase dashboard
2. Create a new query
3. Paste this migration SQL:

\`\`\`sql
-- Add new fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS links JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';
\`\`\`

4. Click **Run**

---

## Step 2: Verify the Schema

After running the SQL, verify your tables exist:

1. Click on **Table Editor** in the left sidebar
2. You should see these tables:
   - ✅ `profiles`
   - ✅ `projects`
   - ✅ `daily_stats`
   - ✅ `upvotes`

3. Click on the `profiles` table
4. Verify these columns exist:
   - ✅ `links` (jsonb)
   - ✅ `interests` (text[])

---

## Step 3: Test Authentication

1. Open your app: http://localhost:3001
2. Click **"Log in"** in the top navigation
3. Switch to **"Sign Up"** tab
4. Try signing up with a non-Gmail email (should fail with error message)
5. Sign up with a valid @gmail.com email
6. Check your email inbox for verification link
7. Click the verification link
8. You should be redirected to the profile creation wizard

---

## Step 4: Verify Auto-Profile Creation

After signing up, check your Supabase dashboard:

1. Go to **Authentication** → **Users**
2. You should see your new user
3. Copy the user ID
4. Go to **Table Editor** → **profiles**
5. Find the profile with matching `user_id`
6. Verify these fields are auto-populated:
   - ✅ `username` (from email prefix)
   - ✅ `display_name` (from email prefix)
   - ✅ `email` (your Gmail)
   - ✅ `avatar` (DiceBear URL)

---

## Step 5: Test Core Features

### Test Profile Views
1. Complete your profile creation wizard
2. View the leaderboard
3. Click on another user's profile
4. Go back to **Table Editor** → **profiles**
5. Verify the `views` count increased for that user

### Test Upvotes
1. On a profile page, click the upvote button (heart icon)
2. You should see confetti! 🎉
3. Go to **Table Editor** → **upvotes**
4. Verify a new record was created with:
   - `target_id` = profile user_id
   - `target_type` = 'profile'
   - `voter_id` = your user_id
5. Go to **Table Editor** → **profiles**
6. Verify the `upvotes` count increased

### Test Projects
1. Go to your own profile
2. Click **"Add Project"**
3. Fill in project details and save
4. Go to **Table Editor** → **projects**
5. Verify your project was created

---

## Step 6: Check RLS Policies

Verify Row Level Security is working:

1. Go to **Authentication** → **Policies**
2. Select the `profiles` table
3. You should see these policies:
   - ✅ Profiles are viewable by everyone (SELECT)
   - ✅ Users can insert their own profile (INSERT)
   - ✅ Users can update their own profile (UPDATE)

4. Try to update someone else's profile (should fail)
5. Try to delete someone else's project (should fail)

---

## Troubleshooting

### "Invalid email" Error When Signing Up
- ✅ Make sure you're using a @gmail.com email address
- ✅ Check the email format is correct (no spaces, valid characters)

### Profile Not Auto-Created
1. Check if the trigger exists:
   \`\`\`sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   \`\`\`
2. If missing, re-run the schema SQL

### Views/Upvotes Not Incrementing
1. Check browser console for errors
2. Verify you're logged in (auth state in navigation)
3. Check Supabase logs in **Logs** → **Database**

### RLS Blocking Operations
1. Make sure you're authenticated
2. Check policies in **Authentication** → **Policies**
3. Verify `auth.uid()` matches your `user_id`

---

## 🎉 Success!

If all tests pass, your Supabase backend is fully integrated! You can now:

- ✅ Sign up new users (Gmail only)
- ✅ Create and edit profiles
- ✅ Upvote profiles and projects
- ✅ Track views and engagement
- ✅ See real-time leaderboards
- ✅ Manage projects

**Ready to deploy to production!** 🚀

---

## Next Steps

1. **Environment Variables for Production**
   - Add `NEXT_PUBLIC_SUPABASE_URL` to your production environment
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your production environment

2. **Deploy**
   - Push to your Git repository
   - Deploy on your preferred platform
   - Verify environment variables are set

3. **Monitor**
   - Check Supabase dashboard for usage
   - Monitor RLS policies
   - Review database performance

4. **Scale**
   - Add indexes if queries slow down
   - Enable database backups
   - Set up monitoring and alerts
