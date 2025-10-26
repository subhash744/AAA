-- Rizgeo Database Schema for Supabase
-- Execute this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  quote TEXT,
  bio TEXT DEFAULT '',
  avatar TEXT DEFAULT '',
  
  -- Social links
  social_x TEXT,
  social_github TEXT,
  social_website TEXT,
  social_linkedin TEXT,
  
  -- Additional data
  links JSONB DEFAULT '[]'::jsonb,
  interests TEXT[] DEFAULT '{}',
  
  -- Goal tracking
  goal_title TEXT,
  goal_description TEXT,
  goal_started_at BIGINT,
  goal_progress_percent INTEGER DEFAULT 0,
  
  -- Metrics
  views INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Gamification
  badges TEXT[] DEFAULT '{}',
  streak INTEGER DEFAULT 0,
  last_active_date BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  last_seen_date TEXT DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD'),
  
  -- Schema versioning
  schema_version INTEGER DEFAULT 3,
  
  -- Location (privacy-protected)
  hide_location BOOLEAN DEFAULT FALSE,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_city TEXT,
  location_country TEXT,
  
  -- User metadata
  email TEXT NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@gmail\.com$'),
  CONSTRAINT valid_progress CHECK (goal_progress_percent >= 0 AND goal_progress_percent <= 100)
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  banner_url TEXT,
  link TEXT,
  upvotes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create daily_stats table (for tracking views/upvotes per day)
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create upvotes table (to track who upvoted what)
CREATE TABLE IF NOT EXISTS upvotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('profile', 'project')),
  voter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(target_id, voter_id, target_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_rank ON profiles(rank);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

CREATE INDEX IF NOT EXISTS idx_daily_stats_user_id ON daily_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);

CREATE INDEX IF NOT EXISTS idx_upvotes_target ON upvotes(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_upvotes_voter ON upvotes(voter_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Projects are viewable by everyone" ON projects
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Daily stats policies
CREATE POLICY "Daily stats are viewable by everyone" ON daily_stats
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own daily stats" ON daily_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily stats" ON daily_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Upvotes policies
CREATE POLICY "Upvotes are viewable by everyone" ON upvotes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert upvotes" ON upvotes
  FOR INSERT WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Users can delete their own upvotes" ON upvotes
  FOR DELETE USING (auth.uid() = voter_id);

-- Create function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, display_name, email, avatar)
  VALUES (
    NEW.id,
    SPLIT_PART(NEW.email, '@', 1),
    SPLIT_PART(NEW.email, '@', 1),
    NEW.email,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || SPLIT_PART(NEW.email, '@', 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to increment view count
CREATE OR REPLACE FUNCTION increment_profile_views(profile_user_id UUID)
RETURNS VOID AS $$
DECLARE
  today_date TEXT := TO_CHAR(NOW(), 'YYYY-MM-DD');
BEGIN
  -- Update total views
  UPDATE profiles SET views = views + 1 WHERE user_id = profile_user_id;
  
  -- Update or insert daily stats
  INSERT INTO daily_stats (user_id, date, views, upvotes)
  VALUES (profile_user_id, today_date, 1, 0)
  ON CONFLICT (user_id, date)
  DO UPDATE SET views = daily_stats.views + 1;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_profile_views(UUID) TO authenticated, anon;
