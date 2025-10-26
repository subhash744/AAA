# 🚀 Supabase Integration Setup Guide

## ✅ Completed Steps

1. ✅ Installed Supabase packages
2. ✅ Created environment variables (`.env.local`)
3. ✅ Created Supabase client configuration (`lib/supabase.ts`)
4. ✅ Updated authentication modal with Gmail-only validation
5. ✅ Created database schema (`scripts/01-create-tables.sql`)
6. ✅ Added delete account functionality
7. ✅ Implemented email confirmation flow with auto-profile creation

---

## 📋 Next Steps (Required)

### Step 1: Execute SQL Schema in Supabase

1. Go to your Supabase project: https://cvdpjomalzrbohlabbvk.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `scripts/01-create-tables.sql`
5. Paste into the SQL editor
6. Click **RUN** to execute
7. Verify tables were created in **Table Editor**

**Expected Tables:**
- `profiles` - User profiles with all metadata
- `projects` - User projects
- `daily_stats` - Daily views/upvotes tracking
- `upvotes` - Upvote records

**Expected Functions:**
- `increment_profile_views()` - RPC function to increment profile views
- `update_updated_at_column()` - Trigger function for timestamp updates

### Step 2: Configure Email Authentication

1. In Supabase Dashboard, go to **Authentication → Providers**
2. Enable **Email** provider
3. Configure email templates:
   - **Confirm signup**: Customize welcome email
   - **Magic Link**: Optional
   - **Change Email Address**: Customize
   - **Reset Password**: Customize
4. Set **Site URL**: `http://localhost:3000` (development) or your production URL
5. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (production)

### Step 3: Gmail Domain Restriction (Optional - Already in Code)

The application already validates Gmail-only emails in the frontend.

For additional server-side protection:
1. Go to **Authentication → Email Auth**
2. Under **Advanced Settings**
3. Add custom validation hook (optional)

### Step 4: Configure Row Level Security (RLS)

Already included in the SQL schema! The policies are:

**Profiles:**
- ✅ Everyone can view profiles
- ✅ Users can only update their own profile
- ✅ Users can delete their own profile
- ✅ Auto-create profile on signup

**Projects:**
- ✅ Everyone can view projects
- ✅ Users can only manage their own projects
- ✅ Cascading delete when user is deleted

**Upvotes:**
- ✅ Everyone can view upvotes
- ✅ Users can only create upvotes for themselves
- ✅ Cascading delete when user is deleted

**Daily Stats:**
- ✅ Users can only view their own stats
- ✅ Cascading delete when user is deleted

### Step 5: Set Up Storage (For Avatars)

1. Go to **Storage** in Supabase
2. Create a new bucket: `avatars`
3. Set it to **Public**
4. Configure policies:

\`\`\`sql
-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public to view avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
\`\`\`

### Step 6: Test Authentication & Account Deletion

1. Restart your development server:
   \`\`\`bash
   pnpm dev
   \`\`\`

2. Open http://localhost:3000

3. Click **"Create Profile"** button

4. Try to sign up with:
   - ✅ **Valid**: `test@gmail.com`
   - ❌ **Invalid**: `test@yahoo.com` (should show error)
   - ❌ **Invalid**: `test@hotmail.com` (should show error)

5. Check your email for verification link

6. Click the confirmation link - you'll be redirected to profile creation

7. Complete your profile

8. Go to your profile page and test the **"Delete Account"** button

---

## 🔍 Verify Setup

### Check Database

\`\`\`sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- View all profiles
SELECT * FROM profiles;

-- Check cascading deletes are working
SELECT constraint_name, table_name, column_name
FROM information_schema.key_column_usage
WHERE table_schema = 'public' AND constraint_name LIKE '%fk%';
\`\`\`

### Check Authentication

1. Go to **Authentication → Users** in Supabase
2. You should see new users after signup
3. Check user metadata includes:
   - `username`
   - `display_name`
   - Email must end with `@gmail.com`

---

## 📊 User Tracking Features

The system automatically tracks:

✅ **User Creation Date**: `created_at` (automatically set)
✅ **Last Update**: `updated_at` (auto-updated on profile changes)
✅ **Last Active**: `last_active_date` (updated on any activity)
✅ **Last Seen**: `last_seen_date` (daily tracker)
✅ **Email**: User's Gmail address
✅ **Views**: Total profile views
✅ **Upvotes**: Total upvotes received
✅ **Streak**: Consecutive active days
✅ **Badges**: Earned achievement badges

### View User Activity

\`\`\`sql
-- Get user with all tracking data
SELECT 
  username,
  email,
  created_at,
  updated_at,
  views,
  upvotes,
  streak,
  last_active_date,
  badges
FROM profiles
WHERE email = 'user@gmail.com';

-- Get daily statistics
SELECT 
  p.username,
  d.date,
  d.views,
  d.upvotes
FROM daily_stats d
JOIN profiles p ON p.user_id = d.user_id
WHERE p.email = 'user@gmail.com'
ORDER BY d.date DESC;
\`\`\`

---

## 🔐 Security Features

✅ **Gmail-Only**: Frontend & database validation
✅ **Row Level Security**: Users can only modify their own data
✅ **Email Verification**: Required before full access
✅ **Password Requirements**: Minimum 6 characters
✅ **Secure Sessions**: Handled by Supabase Auth
✅ **HTTPS**: Enforced in production
✅ **Cascading Deletes**: All user data removed when account is deleted
✅ **Account Deletion**: Users can permanently delete their account from profile page

---

## 🗑️ Account Deletion Feature

### How It Works

1. User clicks **"Delete Account"** button on their profile page
2. Confirmation modal appears with warning about permanent deletion
3. User confirms deletion
4. API call to `/api/delete-account` is made
5. All user data is deleted from Supabase:
   - Profile record
   - All projects
   - All upvotes
   - All daily stats
   - Auth user account
6. User is signed out and redirected to home page

### Database Behavior

When a user is deleted:
- `profiles` table: User record deleted
- `projects` table: All user's projects deleted (cascading)
- `upvotes` table: All user's upvotes deleted (cascading)
- `daily_stats` table: All user's stats deleted (cascading)
- `auth.users` table: Auth user deleted

This is handled by the `ON DELETE CASCADE` constraints in the SQL schema.

---

## 🚨 Troubleshooting

### "Email not allowed"
- Ensure email ends with `@gmail.com`
- Check for typos

### "User already exists"
- Check **Authentication → Users** in Supabase
- Delete duplicate if needed

### "Failed to create profile"
- Verify SQL schema was executed
- Check trigger `on_auth_user_created` exists
- Check function `handle_new_user` exists

### "RLS Policy Error"
- Verify RLS policies were created
- Check in **Table Editor → Policies** for each table

### "Delete account failed"
- Ensure you're logged in as the account owner
- Check that the profile exists in the database
- Verify RLS policies allow deletion
- Check browser console for detailed error message

### "Email confirmation not working"
- Verify redirect URL is set correctly in Supabase Auth settings
- Check that `/auth/callback` route exists
- Ensure email provider is enabled in Supabase
- Check spam folder for confirmation email

---

## 📈 Next Features to Implement

1. **Social Login**: Add Google OAuth
2. **Password Reset**: Email-based recovery
3. **Email Notifications**: Welcome emails, weekly summaries
4. **Real-time Updates**: Supabase Realtime subscriptions
5. **Avatar Upload**: Replace Dicebear with user uploads
6. **Profile Analytics**: Detailed view/upvote tracking
7. **Leaderboard**: Query optimized rankings
8. **Account Recovery**: Soft deletes with recovery window

---

## 🎉 You're Ready!

Once you complete the SQL setup, your app will:
- ✅ Only accept Gmail addresses
- ✅ Store all data in Supabase (no local storage)
- ✅ Track user creation and activity
- ✅ Enforce security with RLS
- ✅ Auto-create profiles on signup
- ✅ Handle authentication securely
- ✅ Allow users to delete their accounts
- ✅ Automatically remove all data on deletion

Run `pnpm dev` and test it out!
