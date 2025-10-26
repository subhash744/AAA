-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  quote TEXT,
  bio TEXT,
  avatar TEXT,
  social_x TEXT,
  social_github TEXT,
  social_website TEXT,
  social_linkedin TEXT,
  goal_title TEXT,
  goal_description TEXT,
  goal_started_at BIGINT,
  goal_progress_percent INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  badges TEXT[] DEFAULT '{}',
  streak INTEGER DEFAULT 0,
  last_active_date BIGINT,
  last_seen_date TEXT,
  schema_version INTEGER DEFAULT 1,
  hide_location BOOLEAN DEFAULT FALSE,
  location_lat FLOAT,
  location_lng FLOAT,
  location_city TEXT,
  location_country TEXT,
  links JSONB DEFAULT '[]',
  interests TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  banner_url TEXT,
  link TEXT,
  upvotes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create upvotes table
CREATE TABLE IF NOT EXISTS upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  target_id TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('profile', 'project')),
  voter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(target_id, voter_id, target_type)
);

-- Create daily_stats table
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_upvotes_target_id ON upvotes(target_id);
CREATE INDEX IF NOT EXISTS idx_upvotes_voter_id ON upvotes(voter_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_id ON daily_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
-- Allow anyone to view profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for projects table
-- Allow anyone to view projects
CREATE POLICY "Projects are viewable by everyone" ON projects
  FOR SELECT USING (true);

-- Allow users to insert their own projects
CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own projects
CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own projects
CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for upvotes table
-- Allow anyone to view upvotes
CREATE POLICY "Upvotes are viewable by everyone" ON upvotes
  FOR SELECT USING (true);

-- Allow authenticated users to insert upvotes
CREATE POLICY "Authenticated users can insert upvotes" ON upvotes
  FOR INSERT WITH CHECK (auth.uid() = voter_id);

-- Allow users to delete their own upvotes
CREATE POLICY "Users can delete their own upvotes" ON upvotes
  FOR DELETE USING (auth.uid() = voter_id);

-- RLS Policies for daily_stats table
-- Allow users to view their own stats
CREATE POLICY "Users can view their own stats" ON daily_stats
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own stats
CREATE POLICY "Users can insert their own stats" ON daily_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own stats
CREATE POLICY "Users can update their own stats" ON daily_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to increment profile views
CREATE OR REPLACE FUNCTION increment_profile_views(profile_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET views = views + 1
  WHERE user_id = profile_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
