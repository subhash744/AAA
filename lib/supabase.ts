import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

// Client-side Supabase client (for components)
export const supabase = createClientComponentClient()

// Alternative direct client
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Gmail domain validation
export const isGmailEmail = (email: string): boolean => {
  return email.toLowerCase().endsWith('@gmail.com')
}

// Validate email format
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email) {
    return { valid: false, error: 'Email is required' }
  }
  
  if (!isGmailEmail(email)) {
    return { valid: false, error: 'Only Gmail addresses (@gmail.com) are allowed' }
  }
  
  // Basic email format check
  const emailRegex = /^[^\s@]+@gmail\.com$/i
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid Gmail format' }
  }
  
  return { valid: true }
}

// Database types
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          username: string
          display_name: string
          quote: string | null
          bio: string
          avatar: string
          social_x: string | null
          social_github: string | null
          social_website: string | null
          social_linkedin: string | null
          goal_title: string | null
          goal_description: string | null
          goal_started_at: number | null
          goal_progress_percent: number | null
          views: number
          upvotes: number
          rank: number
          created_at: string
          updated_at: string
          badges: string[]
          streak: number
          last_active_date: number
          last_seen_date: string
          schema_version: number
          hide_location: boolean
          location_lat: number | null
          location_lng: number | null
          location_city: string | null
          location_country: string | null
          email: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          display_name: string
          quote?: string | null
          bio?: string
          avatar?: string
          social_x?: string | null
          social_github?: string | null
          social_website?: string | null
          social_linkedin?: string | null
          goal_title?: string | null
          goal_description?: string | null
          goal_started_at?: number | null
          goal_progress_percent?: number | null
          views?: number
          upvotes?: number
          rank?: number
          created_at?: string
          updated_at?: string
          badges?: string[]
          streak?: number
          last_active_date?: number
          last_seen_date?: string
          schema_version?: number
          hide_location?: boolean
          location_lat?: number | null
          location_lng?: number | null
          location_city?: string | null
          location_country?: string | null
          email: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          display_name?: string
          quote?: string | null
          bio?: string
          avatar?: string
          social_x?: string | null
          social_github?: string | null
          social_website?: string | null
          social_linkedin?: string | null
          goal_title?: string | null
          goal_description?: string | null
          goal_started_at?: number | null
          goal_progress_percent?: number | null
          views?: number
          upvotes?: number
          rank?: number
          created_at?: string
          updated_at?: string
          badges?: string[]
          streak?: number
          last_active_date?: number
          last_seen_date?: string
          schema_version?: number
          hide_location?: boolean
          location_lat?: number | null
          location_lng?: number | null
          location_city?: string | null
          location_country?: string | null
          email?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          banner_url: string | null
          link: string | null
          upvotes: number
          views: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          banner_url?: string | null
          link?: string | null
          upvotes?: number
          views?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          banner_url?: string | null
          link?: string | null
          upvotes?: number
          views?: number
          created_at?: string
        }
      }
      daily_stats: {
        Row: {
          id: string
          user_id: string
          date: string
          views: number
          upvotes: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          views?: number
          upvotes?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          views?: number
          upvotes?: number
          created_at?: string
        }
      }
      upvotes: {
        Row: {
          id: string
          user_id: string
          target_id: string
          target_type: 'profile' | 'project'
          voter_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          target_id: string
          target_type: 'profile' | 'project'
          voter_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          target_id?: string
          target_type?: 'profile' | 'project'
          voter_id?: string
          created_at?: string
        }
      }
    }
  }
}
