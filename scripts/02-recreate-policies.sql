-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

DROP POLICY IF EXISTS "Projects are viewable by everyone" ON projects;
DROP POLICY IF EXISTS "Users can insert their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;

DROP POLICY IF EXISTS "Upvotes are viewable by everyone" ON upvotes;
DROP POLICY IF EXISTS "Authenticated users can insert upvotes" ON upvotes;
DROP POLICY IF EXISTS "Users can delete their own upvotes" ON upvotes;

DROP POLICY IF EXISTS "Users can view their own stats" ON daily_stats;
DROP POLICY IF EXISTS "Users can insert their own stats" ON daily_stats;
DROP POLICY IF EXISTS "Users can update their own stats" ON daily_stats;

-- Recreate RLS Policies for profiles table
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Recreate RLS Policies for projects table
CREATE POLICY "Projects are viewable by everyone" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Recreate RLS Policies for upvotes table
CREATE POLICY "Upvotes are viewable by everyone" ON upvotes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert upvotes" ON upvotes
  FOR INSERT WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Users can delete their own upvotes" ON upvotes
  FOR DELETE USING (auth.uid() = voter_id);

-- Recreate RLS Policies for daily_stats table
CREATE POLICY "Users can view their own stats" ON daily_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" ON daily_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON daily_stats
  FOR UPDATE USING (auth.uid() = user_id);
