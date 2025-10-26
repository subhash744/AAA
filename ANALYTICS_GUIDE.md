# 📊 Analytics & Projects Guide - Rizgeo

Complete guide to the analytics and project tracking features in your Supabase-powered leaderboard platform.

---

## 🎯 Features Overview

### 1. **Project Management**
- Create, edit, and delete projects
- Track project views and upvotes
- Display projects on user profiles
- Project counts in leaderboard

### 2. **User Analytics**
- Profile views and upvotes tracking
- Project performance metrics
- Daily stats for 30-day period
- Growth rate calculations
- Activity timeline

### 3. **Dashboard**
- Interactive charts and graphs
- Overview, Projects, and Engagement tabs
- Real-time statistics
- Badge display

---

## 📁 Project Features

### Creating Projects

Projects are stored in the `projects` table and linked to users via `user_id`:

\`\`\`typescript
// Add a new project
await addProject(userId, {
  user_id: userId,
  title: "My Awesome Project",
  description: "A revolutionary app that...",
  banner_url: "https://example.com/banner.jpg",
  link: "https://myproject.com"
})
\`\`\`

### Project Schema
\`\`\`sql
projects (
  id UUID PRIMARY KEY
  user_id UUID (references auth.users)
  title TEXT
  description TEXT
  banner_url TEXT (optional)
  link TEXT (optional)
  upvotes INTEGER (default: 0)
  views INTEGER (default: 0)
  created_at TIMESTAMPTZ
)
\`\`\`

### Project Tracking

**Views**: Automatically incremented when users click project links
\`\`\`typescript
await incrementProjectViews(projectId)
\`\`\`

**Upvotes**: Tracked with deduplication in upvotes table
\`\`\`typescript
await addProjectUpvote(projectId, voterId)
\`\`\`

### Leaderboard Integration

The leaderboard now displays project counts for each user:

\`\`\`typescript
const leaderboard = await getLeaderboard('all-time')
// Returns entries with projectCount field
\`\`\`

---

## 📈 Analytics Functions

### 1. User Analytics

Get comprehensive analytics for a specific user:

\`\`\`typescript
const analytics = await getUserAnalytics(userId)
\`\`\`

**Returns:**
\`\`\`typescript
{
  profile: {
    views: number
    upvotes: number
    streak: number
    badges: string[]
    rank: number
  },
  projects: {
    total: number
    totalViews: number
    totalUpvotes: number
    list: Project[]
  },
  dailyStats: {
    date: string
    views: number
    upvotes: number
  }[],
  totalEngagement: {
    views: number  // profile + project views
    upvotes: number  // profile + project upvotes
  }
}
\`\`\`

### 2. Growth Rate Tracking

Calculate 15-day growth comparison:

\`\`\`typescript
const growth = await getUserGrowthRate(userId)
// Returns: { viewsGrowth: number, upvotesGrowth: number }
\`\`\`

**How it works:**
- Compares last 15 days vs previous 15 days
- Returns percentage change
- Positive = growth, negative = decline

### 3. Activity Timeline

Get recent user actions:

\`\`\`typescript
const timeline = await getUserActivityTimeline(userId, 30)
\`\`\`

**Returns:**
\`\`\`typescript
[
  {
    type: 'project_created' | 'upvote_given',
    data: { /* project or upvote data */ },
    timestamp: string
  }
]
\`\`\`

### 4. Global Analytics

Platform-wide statistics:

\`\`\`typescript
const global = await getGlobalAnalytics()
\`\`\`

**Returns:**
\`\`\`typescript
{
  users: {
    total: number
    newThisWeek: number
  },
  projects: {
    total: number
  },
  engagement: {
    totalViews: number
    totalUpvotes: number
    totalProfileUpvotes: number
  },
  geography: {
    topCountries: { country: string, count: number }[]
  }
}
\`\`\`

### 5. Trending Projects

Most upvoted/viewed projects in last 7 days:

\`\`\`typescript
const trending = await getTrendingProjects(10)  // limit 10
\`\`\`

### 6. Daily Stats Recording

Automatically record daily stats:

\`\`\`typescript
// Called when views/upvotes occur
await recordDailyStats(userId, 'view')
await recordDailyStats(userId, 'upvote')
\`\`\`

---

## 🎨 Dashboard Components

### Overview Tab

**Stats Grid:**
- Profile Views (with growth indicator)
- Profile Upvotes (with growth indicator)
- Total Projects (with engagement summary)
- Streak (with badge count)

**Charts:**
- Bar chart: Daily Stats (Last 30 Days)
- Line chart: Upvotes Trend

**Badges:**
- Visual display of earned badges
- Color-coded by badge type

### Projects Tab

**Project Performance Table:**
- Project title
- Views count
- Upvotes count
- Engagement rate (upvotes/views %)
- Creation date

Sorted by upvotes (descending)

### Engagement Tab

**Daily Engagement Chart:**
- Combined views and upvotes line chart
- 30-day history

**Metrics Cards:**
- Total Engagement (views + upvotes)
- Engagement Rate (upvotes/views %)
- Current Rank (leaderboard position)

**Activity Timeline:**
- Last 10 actions (projects created, upvotes given)
- Timestamp for each action
- Visual icons (🚀 for projects, 👍 for upvotes)

---

## 📊 Using Charts

The dashboard uses **Recharts** library for data visualization:

\`\`\`tsx
import { 
  BarChart, Bar, 
  LineChart, Line, 
  XAxis, YAxis, 
  CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from "recharts"
\`\`\`

### Bar Chart Example
\`\`\`tsx
<BarChart data={analytics.dailyStats}>
  <CartesianGrid strokeDasharray="3 3" stroke="#E0DEDB" />
  <XAxis dataKey="date" stroke="#605A57" />
  <YAxis stroke="#605A57" />
  <Tooltip />
  <Bar dataKey="views" fill="#37322F" name="Views" />
</BarChart>
\`\`\`

### Line Chart Example
\`\`\`tsx
<LineChart data={analytics.dailyStats}>
  <CartesianGrid strokeDasharray="3 3" stroke="#E0DEDB" />
  <XAxis dataKey="date" stroke="#605A57" />
  <YAxis stroke="#605A57" />
  <Tooltip />
  <Line 
    type="monotone" 
    dataKey="upvotes" 
    stroke="#37322F" 
    strokeWidth={2} 
  />
</LineChart>
\`\`\`

---

## 🔧 Database Schema Extensions

### Daily Stats Table
\`\`\`sql
CREATE TABLE daily_stats (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  date TEXT NOT NULL,  -- YYYY-MM-DD format
  views INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
)
\`\`\`

**Indexes:**
\`\`\`sql
CREATE INDEX idx_daily_stats_user_id ON daily_stats(user_id);
CREATE INDEX idx_daily_stats_date ON daily_stats(date);
\`\`\`

### Upvotes Table
\`\`\`sql
CREATE TABLE upvotes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  target_id UUID NOT NULL,
  target_type TEXT CHECK (target_type IN ('profile', 'project')),
  voter_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(target_id, voter_id, target_type)
)
\`\`\`

---

## 🎯 Best Practices

### 1. Performance Optimization

**Batch Project Count Queries:**
\`\`\`typescript
// ✅ Good: Single query with map
const { data: projectCounts } = await supabase
  .from('projects')
  .select('user_id')

const projectCountMap = new Map()
projectCounts?.forEach(p => {
  projectCountMap.set(p.user_id, (projectCountMap.get(p.user_id) || 0) + 1)
})

// ❌ Bad: Individual queries per user
for (const user of users) {
  const count = await getUserProjectCount(user.id)
}
\`\`\`

**Use Indexes:**
- All foreign keys are indexed
- Date fields in daily_stats
- Target fields in upvotes table

### 2. Data Accuracy

**Daily Stats:**
- Use upserts to prevent duplicates
- Store dates in YYYY-MM-DD format
- Record stats at time of action

**Growth Calculations:**
- Compare equal time periods
- Handle zero-division cases
- Round percentages to nearest integer

### 3. User Experience

**Loading States:**
\`\`\`tsx
if (!analytics) {
  return <div>Loading analytics...</div>
}
\`\`\`

**Empty States:**
\`\`\`tsx
{projects.length === 0 && (
  <p>No projects yet. Create your first project!</p>
)}
\`\`\`

**Error Handling:**
\`\`\`typescript
try {
  const analytics = await getUserAnalytics(userId)
  setAnalytics(analytics)
} catch (error) {
  console.error('Failed to load analytics:', error)
  setError('Unable to load analytics')
}
\`\`\`

---

## 🚀 Advanced Usage

### Custom Analytics Queries

**Get top performers this week:**
\`\`\`typescript
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

const { data: topUsers } = await supabase
  .from('daily_stats')
  .select('user_id, SUM(upvotes) as total_upvotes')
  .gte('date', sevenDaysAgo.toISOString().split('T')[0])
  .group('user_id')
  .order('total_upvotes', { ascending: false })
  .limit(10)
\`\`\`

**Project engagement rate:**
\`\`\`typescript
const engagementRate = (project: Project) => {
  if (project.views === 0) return 0
  return ((project.upvotes / project.views) * 100).toFixed(1)
}
\`\`\`

**Calculate trending score:**
\`\`\`typescript
const trendingScore = (project: Project) => {
  const ageInDays = (Date.now() - new Date(project.created_at).getTime()) 
    / (1000 * 60 * 60 * 24)
  
  // Decay factor: newer = higher score
  const decayFactor = 1 / (ageInDays + 1)
  
  return (project.upvotes * 10 + project.views) * decayFactor
}
\`\`\`

---

## 🎨 Customization

### Add New Metrics

1. **Update daily_stats table:**
\`\`\`sql
ALTER TABLE daily_stats ADD COLUMN new_metric INTEGER DEFAULT 0;
\`\`\`

2. **Add recording function:**
\`\`\`typescript
export const recordNewMetric = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0]
  
  const { data: existing } = await supabase
    .from('daily_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single()
  
  if (existing) {
    await supabase
      .from('daily_stats')
      .update({ new_metric: (existing.new_metric || 0) + 1 })
      .eq('id', existing.id)
  }
}
\`\`\`

3. **Update analytics function:**
\`\`\`typescript
// Add to getUserAnalytics return object
newMetric: dailyStats.reduce((sum, d) => sum + d.new_metric, 0)
\`\`\`

### Add New Charts

\`\`\`tsx
<div className="bg-white p-6 rounded-lg border border-[#E0DEDB]">
  <h2 className="text-lg font-semibold mb-4">New Chart Title</h2>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={yourData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="label" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="value" fill="#37322F" />
    </BarChart>
  </ResponsiveContainer>
</div>
\`\`\`

---

## 🔍 Troubleshooting

### Analytics Not Loading

**Check authentication:**
\`\`\`typescript
const user = await getCurrentUserProfile()
if (!user) {
  console.error('User not authenticated')
  return
}
\`\`\`

**Verify data exists:**
\`\`\`typescript
const analytics = await getUserAnalytics(userId)
if (!analytics) {
  console.error('No analytics data found')
  return
}
\`\`\`

### Project Counts Incorrect

**Verify RLS policies:**
\`\`\`sql
-- Check if projects are visible
SELECT * FROM projects WHERE user_id = 'your-user-id';
\`\`\`

**Recount manually:**
\`\`\`typescript
const { count } = await supabase
  .from('projects')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId)
\`\`\`

### Growth Rate Shows 0%

**Check date range:**
- Ensure daily_stats has data for both periods
- Verify date format is YYYY-MM-DD
- Confirm time calculations are correct

---

## 📚 API Reference

### Analytics Functions

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `getUserAnalytics` | `userId: string` | `Analytics` | Complete user stats |
| `getGlobalAnalytics` | - | `GlobalAnalytics` | Platform-wide stats |
| `getUserGrowthRate` | `userId: string` | `GrowthRate` | 15-day growth % |
| `getUserActivityTimeline` | `userId: string, days: number` | `Activity[]` | Recent actions |
| `getTrendingProjects` | `limit: number` | `Project[]` | Top projects (7 days) |
| `recordDailyStats` | `userId: string, type: 'view'\|'upvote'` | `boolean` | Log daily activity |

### Project Functions

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `addProject` | `userId: string, project: Insert` | `Project` | Create project |
| `updateProject` | `projectId: string, updates: Update` | `Project` | Update project |
| `deleteProject` | `projectId: string` | `boolean` | Delete project |
| `getUserProjects` | `userId: string` | `Project[]` | Get user's projects |
| `incrementProjectViews` | `projectId: string` | `boolean` | +1 view |
| `addProjectUpvote` | `projectId: string, voterId: string` | `boolean` | Add upvote |

---

## 🎉 Success!

You now have a comprehensive analytics and project tracking system! 

**Key Features:**
- ✅ Real-time project performance tracking
- ✅ User growth rate calculations
- ✅ Activity timeline with recent actions
- ✅ Interactive dashboard with charts
- ✅ Global platform statistics
- ✅ Trending projects detection

**Next Steps:**
1. Test the dashboard with real data
2. Create some projects and track their performance
3. Monitor growth rates over time
4. Use analytics to identify top performers
5. Customize charts and metrics for your needs

Happy analyzing! 📊🚀
