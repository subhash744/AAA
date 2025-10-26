// Supabase Storage Layer - Replaces localStorage with Supabase
import { supabase } from "./supabase"
import type { Database } from "./supabase"

// Helper to get today's date
export const getTodayDate = () => new Date().toISOString().split("T")[0]

// Get current user profile from Supabase
export const getCurrentUserProfile = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  return await getUserProfile(user.id)
}

// Get all user profiles for leaderboard
export const getAllProfiles = async () => {
  const { data: profiles } = await supabase.from("profiles").select("*").order("rank", { ascending: true })

  return profiles || []
}

// Get user profile by ID
export const getUserProfile = async (userId: string) => {
  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", userId).single()

  if (!profile) return null

  // Get user's projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  // Structure social links
  const social = {
    x: profile.social_x || "",
    github: profile.social_github || "",
    website: profile.social_website || "",
    linkedin: profile.social_linkedin || "",
  }

  // Structure goal if exists
  const goal = profile.goal_title
    ? {
        title: profile.goal_title,
        description: profile.goal_description || "",
        progressPercent: profile.goal_progress_percent || 0,
      }
    : null

  return {
    ...profile,
    projects: projects || [],
    social,
    goal,
    links: profile.links || [],
    interests: profile.interests || [],
  }
}

// Get user profile by username
export const getUserProfileByUsername = async (username: string) => {
  const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).single()

  return profile
}

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: Partial<Database["public"]["Tables"]["profiles"]["Update"]>,
) => {
  const { data, error } = await supabase.from("profiles").update(updates).eq("user_id", userId).select().single()

  if (error) {
    console.error("Error updating profile:", error)
    return null
  }

  return data
}

// Increment profile views
export const incrementProfileViews = async (userId: string) => {
  try {
    // Call the database function
    const { error } = await supabase.rpc("increment_profile_views", {
      profile_user_id: userId,
    })

    if (error) {
      console.error("Error incrementing views:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error incrementing views:", error)
    return false
  }
}

// Check if user can upvote (hasn't upvoted before)
export const canUpvoteProfile = async (targetUserId: string, voterId: string) => {
  const { data } = await supabase
    .from("upvotes")
    .select("id")
    .eq("target_id", targetUserId)
    .eq("voter_id", voterId)
    .eq("target_type", "profile")
    .single()

  return !data // Can upvote if no record exists
}

// Add upvote to profile
export const addProfileUpvote = async (targetUserId: string, voterId: string) => {
  try {
    // Check if already upvoted
    const canUpvote = await canUpvoteProfile(targetUserId, voterId)
    if (!canUpvote) return false

    // Insert upvote record
    const { error: upvoteError } = await supabase.from("upvotes").insert({
      user_id: targetUserId,
      target_id: targetUserId,
      target_type: "profile",
      voter_id: voterId,
    })

    if (upvoteError) {
      console.error("Error inserting upvote:", upvoteError)
      return false
    }

    // Increment profile upvote count
    const { error: updateError } = await supabase.rpc("increment", {
      row_id: targetUserId,
      table_name: "profiles",
      column_name: "upvotes",
    })

    // If RPC doesn't exist, update directly
    if (updateError) {
      const { data: profile } = await supabase.from("profiles").select("upvotes").eq("user_id", targetUserId).single()

      if (profile) {
        await supabase
          .from("profiles")
          .update({ upvotes: (profile.upvotes || 0) + 1 })
          .eq("user_id", targetUserId)
      }
    }

    // Update daily stats
    const today = getTodayDate()
    const { data: dailyStat } = await supabase
      .from("daily_stats")
      .select("*")
      .eq("user_id", targetUserId)
      .eq("date", today)
      .single()

    if (dailyStat) {
      await supabase
        .from("daily_stats")
        .update({ upvotes: dailyStat.upvotes + 1 })
        .eq("id", dailyStat.id)
    } else {
      await supabase.from("daily_stats").insert({
        user_id: targetUserId,
        date: today,
        views: 0,
        upvotes: 1,
      })
    }

    return true
  } catch (error) {
    console.error("Error adding upvote:", error)
    return false
  }
}

// Remove upvote from profile
export const removeProfileUpvote = async (targetUserId: string, voterId: string) => {
  try {
    // Delete upvote record
    const { error: deleteError } = await supabase
      .from("upvotes")
      .delete()
      .eq("target_id", targetUserId)
      .eq("voter_id", voterId)
      .eq("target_type", "profile")

    if (deleteError) {
      console.error("Error removing upvote:", deleteError)
      return false
    }

    // Decrement profile upvote count
    const { data: profile } = await supabase.from("profiles").select("upvotes").eq("user_id", targetUserId).single()

    if (profile && profile.upvotes > 0) {
      await supabase
        .from("profiles")
        .update({ upvotes: profile.upvotes - 1 })
        .eq("user_id", targetUserId)
    }

    return true
  } catch (error) {
    console.error("Error removing upvote:", error)
    return false
  }
}

// Get user's projects
export const getUserProjects = async (userId: string) => {
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  return projects || []
}

// Add project
export const addProject = async (userId: string, project: Database["public"]["Tables"]["projects"]["Insert"]) => {
  const { data, error } = await supabase
    .from("projects")
    .insert({
      ...project,
      user_id: userId,
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding project:", error)
    return null
  }

  return data
}

// Update project
export const updateProject = async (projectId: string, updates: Database["public"]["Tables"]["projects"]["Update"]) => {
  const { data, error } = await supabase.from("projects").update(updates).eq("id", projectId).select().single()

  if (error) {
    console.error("Error updating project:", error)
    return null
  }

  return data
}

// Delete project
export const deleteProject = async (projectId: string) => {
  const { error } = await supabase.from("projects").delete().eq("id", projectId)

  if (error) {
    console.error("Error deleting project:", error)
    return false
  }

  return true
}

// Increment project views
export const incrementProjectViews = async (projectId: string) => {
  try {
    // Get current view count
    const { data: project } = await supabase.from("projects").select("views").eq("id", projectId).single()

    if (!project) return false

    // Increment views
    const { error } = await supabase
      .from("projects")
      .update({ views: (project.views || 0) + 1 })
      .eq("id", projectId)

    if (error) {
      console.error("Error incrementing project views:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error incrementing project views:", error)
    return false
  }
}

// Add upvote to project
export const addProjectUpvote = async (projectId: string, voterId: string) => {
  try {
    // Check if user already upvoted this project
    const { data: existingVote } = await supabase
      .from("upvotes")
      .select("*")
      .eq("target_id", projectId)
      .eq("target_type", "project")
      .eq("voter_id", voterId)
      .single()

    if (existingVote) return false

    // Insert upvote record
    const { error: upvoteError } = await supabase.from("upvotes").insert({
      target_id: projectId,
      target_type: "project",
      voter_id: voterId,
    })

    if (upvoteError) {
      console.error("Error adding project upvote:", upvoteError)
      return false
    }

    // Increment project upvote count
    const { data: project } = await supabase.from("projects").select("upvotes").eq("id", projectId).single()

    if (project) {
      await supabase
        .from("projects")
        .update({ upvotes: (project.upvotes || 0) + 1 })
        .eq("id", projectId)
    }

    return true
  } catch (error) {
    console.error("Error adding project upvote:", error)
    return false
  }
}

// Calculate score for leaderboard
const calculateScore = (profile: any, timeframe: "today" | "yesterday" | "all-time" | "newcomers" = "all-time") => {
  const upvotes = profile.upvotes || 0
  const views = profile.views || 0
  const streak = profile.streak || 0

  // Weight: upvotes (40) + views (30) + streak (20)
  const score = upvotes * 40 + views * 30 + streak * 20
  return score
}

// Get leaderboard with project counts
export const getLeaderboard = async (sortBy: "today" | "yesterday" | "all-time" | "newcomers" = "all-time") => {
  let query = supabase.from("profiles").select("*")

  if (sortBy === "newcomers") {
    // Users created in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    query = query.gte("created_at", sevenDaysAgo)
  }

  const { data: profiles } = await query

  if (!profiles) return []

  // Get project counts for all users
  const { data: projectCounts } = await supabase.from("projects").select("user_id")

  const projectCountMap = new Map<string, number>()
  projectCounts?.forEach((project) => {
    const count = projectCountMap.get(project.user_id) || 0
    projectCountMap.set(project.user_id, count + 1)
  })

  // Calculate scores and sort
  const leaderboard = profiles
    .map((profile) => ({
      userId: profile.user_id,
      username: profile.username,
      displayName: profile.display_name,
      avatar: profile.avatar,
      rank: 0, // Will be set after sorting
      score: calculateScore(profile, sortBy),
      views: profile.views,
      upvotes: profile.upvotes,
      streak: profile.streak,
      badges: profile.badges,
      projectCount: projectCountMap.get(profile.user_id) || 0,
      email: profile.email,
      createdAt: profile.created_at,
    }))
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }))

  return leaderboard
}

// Get featured builders (top 3 most active)
export const getFeaturedBuilders = async () => {
  const { data: profiles } = await supabase.from("profiles").select("*").order("upvotes", { ascending: false }).limit(3)

  if (!profiles) return []

  // Get project counts for featured users
  const userIds = profiles.map((p) => p.user_id)
  const { data: projects } = await supabase.from("projects").select("user_id").in("user_id", userIds)

  const projectCountMap = new Map<string, number>()
  projects?.forEach((project) => {
    const count = projectCountMap.get(project.user_id) || 0
    projectCountMap.set(project.user_id, count + 1)
  })

  return profiles.map((profile) => ({
    id: profile.user_id,
    user_id: profile.user_id,
    username: profile.username,
    display_name: profile.display_name,
    bio: profile.bio,
    avatar: profile.avatar,
    views: profile.views,
    upvotes: profile.upvotes,
    projectCount: projectCountMap.get(profile.user_id) || 0,
  }))
}

// Get daily stats for a user
export const getUserDailyStats = async (userId: string, days = 14) => {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const { data: stats } = await supabase
    .from("daily_stats")
    .select("*")
    .eq("user_id", userId)
    .gte("date", startDate)
    .order("date", { ascending: true })

  return stats || []
}

// Update user location
export const updateUserLocation = async (
  userId: string,
  location: { lat: number; lng: number; city: string; country: string },
) => {
  // Randomize coordinates for privacy (~5km radius)
  const randomizeCoordinates = (lat: number, lng: number) => {
    const radiusInDegrees = 0.05
    const u = Math.random()
    const v = Math.random()
    const w = radiusInDegrees * Math.sqrt(u)
    const t = 2 * Math.PI * v
    const x = w * Math.cos(t)
    const y = w * Math.sin(t)

    return {
      lat: lat + x,
      lng: lng + y,
    }
  }

  const randomized = randomizeCoordinates(location.lat, location.lng)

  const { data, error } = await supabase
    .from("profiles")
    .update({
      location_lat: randomized.lat,
      location_lng: randomized.lng,
      location_city: location.city,
      location_country: location.country,
    })
    .eq("user_id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error updating location:", error)
    return false
  }

  return true
}

// Toggle location visibility
export const toggleLocationVisibility = async (userId: string, hideLocation: boolean) => {
  const { error } = await supabase.from("profiles").update({ hide_location: hideLocation }).eq("user_id", userId)

  if (error) {
    console.error("Error toggling location visibility:", error)
    return false
  }

  return true
}

// Get users with locations (for map)
export const getUsersWithLocations = async () => {
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .not("location_lat", "is", null)
    .not("location_lng", "is", null)
    .eq("hide_location", false)

  return profiles || []
}

// Generate badges based on metrics
export const generateBadges = (profile: any): string[] => {
  const badges: string[] = []
  const upvotes = profile.upvotes || 0
  const views = profile.views || 0
  const streak = profile.streak || 0

  // Tier badges based on upvotes
  if (upvotes >= 10) badges.push("Bronze")
  if (upvotes >= 50) badges.push("Silver")
  if (upvotes >= 200) badges.push("Gold")
  if (upvotes >= 10000) badges.push("Diamond")

  // View-based badges
  if (views >= 100) badges.push("Popular")
  if (views >= 500) badges.push("Trending")
  if (views >= 2000) badges.push("Viral")

  // Streak-based badges
  if (streak >= 3) badges.push("Consistent")
  if (streak >= 7) badges.push("Dedicated")
  if (streak >= 30) badges.push("Unstoppable")

  return [...new Set(badges)]
}

// Update user badges
export const updateUserBadges = async (userId: string) => {
  const profile = await getUserProfile(userId)
  if (!profile) return false

  const badges = generateBadges(profile)

  const { error } = await supabase.from("profiles").update({ badges }).eq("user_id", userId)

  if (error) {
    console.error("Error updating badges:", error)
    return false
  }

  return true
}

// Delete user account and all associated data
export const deleteUserAccount = async (userId: string) => {
  try {
    // Delete all user data from Supabase tables (cascading deletes will handle related data)
    const { error: profileError } = await supabase.from("profiles").delete().eq("user_id", userId)

    if (profileError) {
      console.error("Error deleting profile:", profileError)
      return false
    }

    // Delete the user from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      console.error("Error deleting auth user:", authError)
      return false
    }

    return true
  } catch (error) {
    console.error("Error deleting account:", error)
    return false
  }
}

// ============================================
// ANALYTICS FUNCTIONS
// ============================================

// Record daily stats for a user
export const recordDailyStats = async (userId: string, type: "view" | "upvote") => {
  const today = new Date().toISOString().split("T")[0]

  try {
    // Get existing stats for today
    const { data: existing } = await supabase
      .from("daily_stats")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .single()

    if (existing) {
      // Update existing record
      const updates = type === "view" ? { views: (existing.views || 0) + 1 } : { upvotes: (existing.upvotes || 0) + 1 }

      await supabase.from("daily_stats").update(updates).eq("user_id", userId).eq("date", today)
    } else {
      // Create new record
      await supabase.from("daily_stats").insert({
        user_id: userId,
        date: today,
        views: type === "view" ? 1 : 0,
        upvotes: type === "upvote" ? 1 : 0,
      })
    }

    return true
  } catch (error) {
    console.error("Error recording daily stats:", error)
    return false
  }
}

// Get analytics overview for a user
export const getUserAnalytics = async (userId: string) => {
  try {
    const profile = await getUserProfile(userId)
    if (!profile) return null

    const { data: projects } = await supabase.from("projects").select("*").eq("user_id", userId)

    const { data: dailyStats } = await supabase
      .from("daily_stats")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(30)

    const totalProjectViews = projects?.reduce((sum, p) => sum + (p.views || 0), 0) || 0
    const totalProjectUpvotes = projects?.reduce((sum, p) => sum + (p.upvotes || 0), 0) || 0

    return {
      profile: {
        views: profile.views || 0,
        upvotes: profile.upvotes || 0,
        streak: profile.streak || 0,
        badges: profile.badges || [],
        rank: profile.rank || 0,
      },
      projects: {
        total: projects?.length || 0,
        totalViews: totalProjectViews,
        totalUpvotes: totalProjectUpvotes,
        list: projects || [],
      },
      dailyStats: dailyStats || [],
      totalEngagement: {
        views: (profile.views || 0) + totalProjectViews,
        upvotes: (profile.upvotes || 0) + totalProjectUpvotes,
      },
    }
  } catch (error) {
    console.error("Error getting user analytics:", error)
    return null
  }
}

// Get global analytics
export const getGlobalAnalytics = async () => {
  try {
    const { data: profiles, count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact" })

    const { data: projects, count: totalProjects } = await supabase.from("projects").select("*", { count: "exact" })

    const { data: upvotes, count: totalUpvotes } = await supabase.from("upvotes").select("*", { count: "exact" })

    const totalViews = profiles?.reduce((sum, p) => sum + (p.views || 0), 0) || 0
    const totalProfileUpvotes = profiles?.reduce((sum, p) => sum + (p.upvotes || 0), 0) || 0

    // Get users created in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: newUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo)

    // Get top countries
    const countryCounts = new Map<string, number>()
    profiles?.forEach((p) => {
      if (p.location_country) {
        const count = countryCounts.get(p.location_country) || 0
        countryCounts.set(p.location_country, count + 1)
      }
    })

    const topCountries = Array.from(countryCounts.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      users: {
        total: totalUsers || 0,
        newThisWeek: newUsers || 0,
      },
      projects: {
        total: totalProjects || 0,
      },
      engagement: {
        totalViews,
        totalUpvotes: totalUpvotes || 0,
        totalProfileUpvotes,
      },
      geography: {
        topCountries,
      },
    }
  } catch (error) {
    console.error("Error getting global analytics:", error)
    return null
  }
}

// Get trending projects (most upvoted/viewed in last 7 days)
export const getTrendingProjects = async (limit = 10) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: projects } = await supabase
    .from("projects")
    .select(`
      *,
      profiles!inner(username, display_name, avatar)
    `)
    .gte("created_at", sevenDaysAgo)
    .order("upvotes", { ascending: false })
    .limit(limit)

  return projects || []
}

// Get user activity timeline (upvotes, projects, views)
export const getUserActivityTimeline = async (userId: string, days = 30) => {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  try {
    // Get projects created
    const { data: projects } = await supabase
      .from("projects")
      .select("id, title, created_at")
      .eq("user_id", userId)
      .gte("created_at", startDate)
      .order("created_at", { ascending: false })

    // Get upvotes given
    const { data: upvotesGiven } = await supabase
      .from("upvotes")
      .select("target_id, target_type, created_at")
      .eq("voter_id", userId)
      .gte("created_at", startDate)
      .order("created_at", { ascending: false })

    // Combine into timeline
    const timeline = [
      ...(projects?.map((p) => ({
        type: "project_created",
        data: p,
        timestamp: p.created_at,
      })) || []),
      ...(upvotesGiven?.map((u) => ({
        type: "upvote_given",
        data: u,
        timestamp: u.created_at,
      })) || []),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return timeline
  } catch (error) {
    console.error("Error getting user activity timeline:", error)
    return []
  }
}

// Calculate user growth rate
export const getUserGrowthRate = async (userId: string) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  try {
    const { data: firstPeriod } = await supabase
      .from("daily_stats")
      .select("views, upvotes")
      .eq("user_id", userId)
      .gte("date", thirtyDaysAgo)
      .lt("date", fifteenDaysAgo)

    const { data: secondPeriod } = await supabase
      .from("daily_stats")
      .select("views, upvotes")
      .eq("user_id", userId)
      .gte("date", fifteenDaysAgo)

    const firstPeriodViews = firstPeriod?.reduce((sum, d) => sum + (d.views || 0), 0) || 0
    const firstPeriodUpvotes = firstPeriod?.reduce((sum, d) => sum + (d.upvotes || 0), 0) || 0

    const secondPeriodViews = secondPeriod?.reduce((sum, d) => sum + (d.views || 0), 0) || 0
    const secondPeriodUpvotes = secondPeriod?.reduce((sum, d) => sum + (d.upvotes || 0), 0) || 0

    const viewsGrowth = firstPeriodViews > 0 ? ((secondPeriodViews - firstPeriodViews) / firstPeriodViews) * 100 : 0

    const upvotesGrowth =
      firstPeriodUpvotes > 0 ? ((secondPeriodUpvotes - firstPeriodUpvotes) / firstPeriodUpvotes) * 100 : 0

    return {
      viewsGrowth: Math.round(viewsGrowth),
      upvotesGrowth: Math.round(upvotesGrowth),
    }
  } catch (error) {
    console.error("Error calculating growth rate:", error)
    return { viewsGrowth: 0, upvotesGrowth: 0 }
  }
}
