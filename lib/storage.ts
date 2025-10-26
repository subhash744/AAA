export interface Project {
  id: string
  title: string
  description: string
  bannerUrl?: string
  link?: string
  upvotes: number
  views: number
  createdAt: number
}

export interface Goal {
  title: string
  description: string
  startedAt: number
  progressPercent: number
}

export interface Social {
  x?: string
  github?: string
  website?: string
  linkedin?: string
}

export interface UserProfile {
  id: string
  username: string
  displayName: string
  quote?: string
  bio: string
  avatar: string
  social: Social
  goal?: Goal
  projects: Project[]
  links: { title: string; url: string }[]
  interests: string[]
  views: number
  upvotes: number
  rank: number
  createdAt: number
  badges: string[]
  streak: number
  lastActiveDate: number
  lastSeenDate: string
  dailyViews: { date: string; count: number }[]
  dailyUpvotes: { date: string; count: number }[]
  schemaVersion: number
  location?: {
    lat: number
    lng: number
    city: string
    country: string
  }
  hideLocation?: boolean  // Privacy toggle
  metrics?: {
    mapClicks: number
  }
}

export interface LeaderboardEntry {
  userId: string
  username: string
  displayName: string
  avatar: string
  rank: number
  score: number
  views: number
  upvotes: number
  streak: number
  badges: string[]
  projectCount: number
}

export interface AnalyticsData {
  totalViews: number
  totalUpvotes: number
  weeklyViews: number
  weeklyUpvotes: number
  streak: number
  badges: string[]
  dailyData: { date: string; views: number; upvotes: number }[]
  projectStats: { projectId: string; title: string; views: number; upvotes: number; ctr: number }[]
}

const SCHEMA_VERSION = 3
export const getTodayDate = () => new Date().toISOString().split("T")[0]

// Randomize coordinates within ~5km radius for privacy (city-level accuracy)
const randomizeCoordinates = (lat: number, lng: number): { lat: number; lng: number } => {
  // ~0.05 degrees = ~5km radius
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

const migrateUserSchema = (user: any): UserProfile => {
  if (user.schemaVersion === SCHEMA_VERSION) return user

  return {
    ...user,
    quote: user.quote || "",
    social: user.social || { x: "", github: "", website: "", linkedin: "" },
    goal: user.goal || undefined,
    projects: user.projects || [],
    dailyUpvotes: user.dailyUpvotes || user.dailyVotes || [],
    lastSeenDate: user.lastSeenDate || getTodayDate(),
    dailyViews: user.dailyViews || [],
    location: user.location || { lat: 0, lng: 0, city: "", country: "" },
    hideLocation: user.hideLocation || false,
    metrics: user.metrics || { mapClicks: 0 },
    schemaVersion: SCHEMA_VERSION,
  }
}

export const getCurrentUser = (): UserProfile | null => {
  if (typeof window === "undefined") return null
  const user = localStorage.getItem("currentUser")
  return user ? migrateUserSchema(JSON.parse(user)) : null
}

export const setCurrentUser = (user: UserProfile) => {
  if (typeof window === "undefined") return
  localStorage.setItem("currentUser", JSON.stringify(user))
}

export const getAllUsers = (): UserProfile[] => {
  if (typeof window === "undefined") return []
  const users = localStorage.getItem("allUsers")
  return users ? JSON.parse(users).map(migrateUserSchema) : []
}

export const saveUserProfile = (user: UserProfile) => {
  if (typeof window === "undefined") return
  const migratedUser = migrateUserSchema(user)
  const allUsers = getAllUsers()
  const existingIndex = allUsers.findIndex((u) => u.id === migratedUser.id)

  if (existingIndex >= 0) {
    allUsers[existingIndex] = migratedUser
  } else {
    allUsers.push(migratedUser)
  }

  localStorage.setItem("allUsers", JSON.stringify(allUsers))
  setCurrentUser(migratedUser)
}

export const canUpvote = (userId: string, visitorId: string): boolean => {
  if (typeof window === "undefined") return false
  const upvotes = JSON.parse(localStorage.getItem("upvotes") || "{}")
  const key = `${userId}-${visitorId}`
  return !upvotes[key]
}

export const recordUpvote = (userId: string, visitorId: string) => {
  if (typeof window === "undefined") return
  const upvotes = JSON.parse(localStorage.getItem("upvotes") || "{}")
  const key = `${userId}-${visitorId}`
  upvotes[key] = Date.now()
  localStorage.setItem("upvotes", JSON.stringify(upvotes))
}

export const addUpvote = (userId: string, visitorId: string) => {
  if (typeof window === "undefined") return false
  if (!canUpvote(userId, visitorId)) return false

  const allUsers = getAllUsers()
  const user = allUsers.find((u) => u.id === userId)

  if (user) {
    const today = getTodayDate()
    user.upvotes += 1
    user.lastActiveDate = Date.now()

    const dailyUpvoteIndex = user.dailyUpvotes.findIndex((d) => d.date === today)
    if (dailyUpvoteIndex >= 0) {
      user.dailyUpvotes[dailyUpvoteIndex].count += 1
    } else {
      user.dailyUpvotes.push({ date: today, count: 1 })
    }

    user.badges = generateBadges(user)
    recordUpvote(userId, visitorId)
    saveUserProfile(user)
    return true
  }
  return false
}

export const addProjectUpvote = (userId: string, projectId: string, visitorId: string): boolean => {
  if (typeof window === "undefined") return false
  const key = `project-${projectId}-${visitorId}`
  const upvotes = JSON.parse(localStorage.getItem("upvotes") || "{}")
  if (upvotes[key]) return false

  const allUsers = getAllUsers()
  const user = allUsers.find((u) => u.id === userId)
  if (!user) return false

  const project = user.projects.find((p) => p.id === projectId)
  if (!project) return false

  project.upvotes += 1
  upvotes[key] = Date.now()
  localStorage.setItem("upvotes", JSON.stringify(upvotes))
  saveUserProfile(user)
  return true
}

export const incrementViewCount = (userId: string) => {
  if (typeof window === "undefined") return
  const allUsers = getAllUsers()
  const user = allUsers.find((u) => u.id === userId)

  if (user) {
    const today = getTodayDate()
    user.views += 1
    user.lastActiveDate = Date.now()

    const dailyViewIndex = user.dailyViews.findIndex((d) => d.date === today)
    if (dailyViewIndex >= 0) {
      dailyViewIndex >= 0 ? (user.dailyViews[dailyViewIndex].count += 1) : null
    } else {
      user.dailyViews.push({ date: today, count: 1 })
    }

    user.badges = generateBadges(user)
    saveUserProfile(user)
  }
}

export const incrementProjectViews = (userId: string, projectId: string) => {
  if (typeof window === "undefined") return
  const allUsers = getAllUsers()
  const user = allUsers.find((u) => u.id === userId)

  if (user) {
    const project = user.projects.find((p) => p.id === projectId)
    if (project) {
      project.views += 1
      saveUserProfile(user)
    }
  }
}

export const addProject = (userId: string, project: Omit<Project, "id" | "upvotes" | "views" | "createdAt">) => {
  if (typeof window === "undefined") return null
  const allUsers = getAllUsers()
  const user = allUsers.find((u) => u.id === userId)

  if (user) {
    const newProject: Project = {
      id: `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...project,
      upvotes: 0,
      views: 0,
      createdAt: Date.now(),
    }
    user.projects.push(newProject)
    saveUserProfile(user)
    return newProject
  }
  return null
}

export const updateProject = (userId: string, projectId: string, updates: Partial<Project>) => {
  if (typeof window === "undefined") return false
  const allUsers = getAllUsers()
  const user = allUsers.find((u) => u.id === userId)

  if (user) {
    const project = user.projects.find((p) => p.id === projectId)
    if (project) {
      Object.assign(project, updates)
      saveUserProfile(user)
      return true
    }
  }
  return false
}

export const deleteProject = (userId: string, projectId: string) => {
  if (typeof window === "undefined") return false
  const allUsers = getAllUsers()
  const user = allUsers.find((u) => u.id === userId)

  if (user) {
    user.projects = user.projects.filter((p) => p.id !== projectId)
    saveUserProfile(user)
    return true
  }
  return false
}

export const calculateScore = (
  user: UserProfile,
  timeframe: "today" | "yesterday" | "all-time" | "newcomers" = "all-time",
): number => {
  let views = user.views
  let upvotes = user.upvotes
  const streak = user.streak
  const projectCount = user.projects.length

  if (timeframe === "today") {
    const today = getTodayDate()
    views = user.dailyViews.find((d) => d.date === today)?.count || 0
    upvotes = user.dailyUpvotes.find((d) => d.date === today)?.count || 0
  } else if (timeframe === "yesterday") {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    views = user.dailyViews.find((d) => d.date === yesterday)?.count || 0
    upvotes = user.dailyUpvotes.find((d) => d.date === yesterday)?.count || 0
  }

  const score = upvotes * 40 + views * 30 + streak * 20 + projectCount * 10
  return score
}

const normalizeScores = (scores: number[]): number[] => {
  if (scores.length === 0) return []
  const min = Math.min(...scores)
  const max = Math.max(...scores)
  const range = max - min

  if (range === 0) {
    return scores.map(() => 0.5)
  }

  return scores.map((score) => (score - min) / range)
}

export const getLeaderboard = (sortBy: "today" | "yesterday" | "all-time" | "newcomers"): LeaderboardEntry[] => {
  const allUsers = getAllUsers()
  const now = Date.now()
  const oneDayMs = 24 * 60 * 60 * 1000

  let filtered = allUsers

  if (sortBy === "today") {
    const today = getTodayDate()
    filtered = allUsers.filter((u) => {
      const dailyViews = u.dailyViews.find((d) => d.date === today)?.count || 0
      const dailyUpvotes = u.dailyUpvotes.find((d) => d.date === today)?.count || 0
      return dailyViews > 0 || dailyUpvotes > 0
    })
  } else if (sortBy === "yesterday") {
    const yesterday = new Date(now - oneDayMs).toISOString().split("T")[0]
    filtered = allUsers.filter((u) => {
      const dailyViews = u.dailyViews.find((d) => d.date === yesterday)?.count || 0
      const dailyUpvotes = u.dailyUpvotes.find((d) => d.date === yesterday)?.count || 0
      return dailyViews > 0 || dailyUpvotes > 0
    })
  } else if (sortBy === "newcomers") {
    filtered = allUsers.filter((u) => now - u.createdAt < 7 * oneDayMs).sort((a, b) => b.createdAt - a.createdAt)
  }

  const scores = filtered.map((u) => calculateScore(u, sortBy))
  const normalized = normalizeScores(scores)

  const sorted = filtered
    .map((user, idx) => ({ user, normalizedScore: normalized[idx] }))
    .sort((a, b) => b.normalizedScore - a.normalizedScore)

  return sorted.map((entry, index) => ({
    userId: entry.user.id,
    username: entry.user.username,
    displayName: entry.user.displayName,
    avatar: entry.user.avatar,
    rank: index + 1,
    score: calculateScore(entry.user, sortBy),
    views: entry.user.views,
    upvotes: entry.user.upvotes,
    streak: entry.user.streak,
    badges: entry.user.badges,
    projectCount: entry.user.projects.length,
  }))
}

export const updateStreaks = () => {
  if (typeof window === "undefined") return
  const allUsers = getAllUsers()
  const today = getTodayDate()

  allUsers.forEach((user) => {
    const todayScore = calculateScore(user, "today")
    const yesterdayDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    const yesterdayScore = calculateScore(user, "yesterday")

    if (todayScore > 0) {
      if (user.lastSeenDate === yesterdayDate && yesterdayScore > 0) {
        user.streak += 1
      } else if (user.lastSeenDate !== yesterdayDate) {
        user.streak = 1
      }
      user.lastSeenDate = today
    } else if (user.lastSeenDate !== today && user.lastSeenDate !== yesterdayDate) {
      user.streak = 0
    }

    user.badges = generateBadges(user)
    saveUserProfile(user)
  })
}

export const generateBadges = (user: UserProfile): string[] => {
  const badges: string[] = []

  // Tier badges based on upvotes
  if (user.upvotes >= 10) badges.push("Bronze")
  if (user.upvotes >= 50) badges.push("Silver")
  if (user.upvotes >= 200) badges.push("Gold")
  if (user.upvotes >= 10000) badges.push("Diamond")

  // View-based badges
  if (user.views >= 100) badges.push("Popular")
  if (user.views >= 500) badges.push("Trending")
  if (user.views >= 2000) badges.push("Viral")

  // Streak-based badges
  if (user.streak >= 3) badges.push("Consistent")
  if (user.streak >= 7) badges.push("Dedicated")
  if (user.streak >= 30) badges.push("Unstoppable")

  // Project-based badges
  if (user.projects.length >= 3) badges.push("Builder")
  if (user.projects.length >= 10) badges.push("Prolific")

  return [...new Set(badges)]
}

export const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const getFeaturedBuilders = (): UserProfile[] => {
  const allUsers = getAllUsers()
  if (allUsers.length === 0) return []

  const today = getTodayDate()
  const seed = today.split("-").reduce((acc, part) => acc + Number.parseInt(part), 0)

  const shuffled = [...allUsers].sort((a, b) => {
    const hashA = (seed + a.id.charCodeAt(0)) % 1000
    const hashB = (seed + b.id.charCodeAt(0)) % 1000
    return hashB - hashA
  })

  return shuffled.slice(0, Math.min(3, shuffled.length))
}

export const getUserAnalytics = (userId: string): AnalyticsData | null => {
  const user = getAllUsers().find((u) => u.id === userId)
  if (!user) return null

  const today = getTodayDate()
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

  const weeklyViews = user.dailyViews.filter((d) => d.date >= weekAgo).reduce((sum, d) => sum + d.count, 0)
  const weeklyUpvotes = user.dailyUpvotes.filter((d) => d.date >= weekAgo).reduce((sum, d) => sum + d.count, 0)

  const dailyData = []
  for (let i = 13; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    const views = user.dailyViews.find((d) => d.date === date)?.count || 0
    const upvotes = user.dailyUpvotes.find((d) => d.date === date)?.count || 0
    dailyData.push({ date, views, upvotes })
  }

  const projectStats = user.projects.map((p) => ({
    projectId: p.id,
    title: p.title,
    views: p.views,
    upvotes: p.upvotes,
    ctr: p.views > 0 ? Number(((p.upvotes / p.views) * 100).toFixed(2)) : 0,
  }))

  return {
    totalViews: user.views,
    totalUpvotes: user.upvotes,
    weeklyViews,
    weeklyUpvotes,
    streak: user.streak,
    badges: user.badges,
    dailyData,
    projectStats,
  }
}

export const resetAllData = () => {
  if (typeof window === "undefined") return
  localStorage.removeItem("allUsers")
  localStorage.removeItem("currentUser")
  localStorage.removeItem("upvotes")
}

export const getStorageSchema = () => {
  if (typeof window === "undefined") return null
  const allUsers = getAllUsers()
  return {
    schemaVersion: SCHEMA_VERSION,
    totalUsers: allUsers.length,
    sampleUser: allUsers[0] || null,
    storageSize: new Blob([JSON.stringify(localStorage)]).size,
  }
}

export const incrementMapClicks = (userId: string) => {
  if (typeof window === "undefined") return
  const allUsers = getAllUsers()
  const user = allUsers.find((u) => u.id === userId)

  if (user) {
    if (!user.metrics) user.metrics = { mapClicks: 0 }
    user.metrics.mapClicks += 1
    saveUserProfile(user)
  }
}

export const updateUserLocation = (
  userId: string,
  location: { lat: number; lng: number; city: string; country: string },
) => {
  if (typeof window === "undefined") return false
  const allUsers = getAllUsers()
  const user = allUsers.find((u) => u.id === userId)

  if (user) {
    // Randomize coordinates for privacy (city-level accuracy only)
    const randomized = randomizeCoordinates(location.lat, location.lng)
    user.location = {
      lat: randomized.lat,
      lng: randomized.lng,
      city: location.city,
      country: location.country,
    }
    saveUserProfile(user)
    return true
  }
  return false
}

export const toggleLocationVisibility = (userId: string, hideLocation: boolean) => {
  if (typeof window === "undefined") return false
  const allUsers = getAllUsers()
  const user = allUsers.find((u) => u.id === userId)

  if (user) {
    user.hideLocation = hideLocation
    saveUserProfile(user)
    return true
  }
  return false
}
