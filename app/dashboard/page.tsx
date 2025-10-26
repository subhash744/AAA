"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUserProfile, getUserAnalytics, getUserGrowthRate, getUserActivityTimeline } from "@/lib/supabase-storage"
import Navigation from "@/components/navigation"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export default function DashboardPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "projects" | "engagement">("overview")

  const [growthRate, setGrowthRate] = useState<any>(null)
  const [activityTimeline, setActivityTimeline] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
    loadDashboard()
  }, [router])

  const loadDashboard = async () => {
    const user = await getCurrentUserProfile()
    if (!user) {
      router.push("/")
      return
    }
    setCurrentUser(user)
    
    // Load analytics data
    const analyticsData = await getUserAnalytics(user.user_id)
    setAnalytics(analyticsData)
    
    // Load growth rate
    const growth = await getUserGrowthRate(user.user_id)
    setGrowthRate(growth)
    
    // Load activity timeline
    const timeline = await getUserActivityTimeline(user.user_id, 30)
    setActivityTimeline(timeline)
  }

  if (!mounted || !currentUser || !analytics) return null

  const badgeColors: Record<string, string> = {
    Bronze: "bg-amber-700",
    Silver: "bg-gray-400",
    Gold: "bg-yellow-500",
    Diamond: "bg-blue-400",
    Popular: "bg-pink-500",
    Trending: "bg-red-500",
    Viral: "bg-purple-500",
    Consistent: "bg-green-500",
    Dedicated: "bg-indigo-500",
    Unstoppable: "bg-orange-500",
    Builder: "bg-cyan-500",
    Prolific: "bg-violet-500",
  }

  return (
    <div className="w-full min-h-screen bg-[#F7F5F3]">
      <Navigation />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-serif text-[#37322F] mb-8">Your Analytics Dashboard</h1>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-[#E0DEDB]">
          {(["overview", "projects", "engagement"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors capitalize ${
                activeTab === tab ? "text-[#37322F] border-b-2 border-[#37322F]" : "text-[#605A57] hover:text-[#37322F]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-6 rounded-lg border border-[#E0DEDB]">
                <div className="text-sm text-[#605A57] mb-2">Profile Views</div>
                <div className="text-3xl font-semibold text-[#37322F]">{analytics.profile.views}</div>
                {growthRate && (
                  <div className={`text-sm mt-2 ${
                    growthRate.viewsGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {growthRate.viewsGrowth > 0 ? '↑' : '↓'} {Math.abs(growthRate.viewsGrowth)}% vs last period
                  </div>
                )}
              </div>
              <div className="bg-white p-6 rounded-lg border border-[#E0DEDB]">
                <div className="text-sm text-[#605A57] mb-2">Profile Upvotes</div>
                <div className="text-3xl font-semibold text-[#37322F]">{analytics.profile.upvotes}</div>
                {growthRate && (
                  <div className={`text-sm mt-2 ${
                    growthRate.upvotesGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {growthRate.upvotesGrowth > 0 ? '↑' : '↓'} {Math.abs(growthRate.upvotesGrowth)}% vs last period
                  </div>
                )}
              </div>
              <div className="bg-white p-6 rounded-lg border border-[#E0DEDB]">
                <div className="text-sm text-[#605A57] mb-2">Total Projects</div>
                <div className="text-3xl font-semibold text-[#37322F]">{analytics.projects.total}</div>
                <div className="text-sm text-[#605A57] mt-2">
                  {analytics.projects.totalViews} views · {analytics.projects.totalUpvotes} upvotes
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-[#E0DEDB]">
                <div className="text-sm text-[#605A57] mb-2">Streak</div>
                <div className="text-3xl font-semibold text-[#37322F]">{analytics.profile.streak} days</div>
                <div className="text-sm text-[#605A57] mt-2">
                  {analytics.profile.badges.length} badges earned
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-6 rounded-lg border border-[#E0DEDB]">
                <h2 className="text-lg font-semibold text-[#37322F] mb-4">Daily Stats (Last 30 Days)</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0DEDB" />
                    <XAxis dataKey="date" stroke="#605A57" />
                    <YAxis stroke="#605A57" />
                    <Tooltip contentStyle={{ backgroundColor: "#F7F5F3", border: "1px solid #E0DEDB" }} />
                    <Bar dataKey="views" fill="#37322F" name="Views" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 rounded-lg border border-[#E0DEDB]">
                <h2 className="text-lg font-semibold text-[#37322F] mb-4">Upvotes Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0DEDB" />
                    <XAxis dataKey="date" stroke="#605A57" />
                    <YAxis stroke="#605A57" />
                    <Tooltip contentStyle={{ backgroundColor: "#F7F5F3", border: "1px solid #E0DEDB" }} />
                    <Line type="monotone" dataKey="upvotes" stroke="#37322F" strokeWidth={2} name="Upvotes" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white p-6 rounded-lg border border-[#E0DEDB]">
              <h2 className="text-lg font-semibold text-[#37322F] mb-4">Your Badges</h2>
              <div className="flex flex-wrap gap-3">
                {analytics.profile.badges.length > 0 ? (
                  analytics.profile.badges.map((badge: string) => (
                    <div
                      key={badge}
                      className={`${badgeColors[badge] || "bg-gray-300"} text-white px-4 py-2 rounded-full text-sm font-semibold`}
                    >
                      {badge}
                    </div>
                  ))
                ) : (
                  <p className="text-[#605A57]">No badges yet. Keep building to earn badges!</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <div className="bg-white p-6 rounded-lg border border-[#E0DEDB]">
            <h2 className="text-lg font-semibold text-[#37322F] mb-6">Project Performance</h2>
            {analytics.projects.list && analytics.projects.list.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E0DEDB]">
                      <th className="text-left py-3 px-4 font-semibold text-[#37322F]">Project</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#37322F]">Views</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#37322F]">Upvotes</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#37322F]">Engagement</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#37322F]">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.projects.list
                      .sort((a: any, b: any) => b.upvotes - a.upvotes)
                      .map((project: any) => (
                        <tr key={project.id} className="border-b border-[#E0DEDB] hover:bg-gray-50">
                          <td className="py-3 px-4 text-[#37322F] font-medium">{project.title}</td>
                          <td className="py-3 px-4 text-[#605A57]">{project.views}</td>
                          <td className="py-3 px-4 text-[#605A57]">{project.upvotes}</td>
                          <td className="py-3 px-4 text-[#605A57]">
                            {project.views > 0 ? ((project.upvotes / project.views) * 100).toFixed(1) : 0}%
                          </td>
                          <td className="py-3 px-4 text-[#605A57]">
                            {new Date(project.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[#605A57]">No projects yet. Create your first project to see analytics!</p>
            )}
          </div>
        )}

        {/* Engagement Tab */}
        {activeTab === "engagement" && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg border border-[#E0DEDB]">
              <h2 className="text-lg font-semibold text-[#37322F] mb-4">Daily Engagement</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0DEDB" />
                  <XAxis dataKey="date" stroke="#605A57" />
                  <YAxis stroke="#605A57" />
                  <Tooltip contentStyle={{ backgroundColor: "#F7F5F3", border: "1px solid #E0DEDB" }} />
                  <Line type="monotone" dataKey="views" stroke="#37322F" strokeWidth={2} name="Views" />
                  <Line type="monotone" dataKey="upvotes" stroke="#605A57" strokeWidth={2} name="Upvotes" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg border border-[#E0DEDB]">
                <h3 className="text-lg font-semibold text-[#37322F] mb-4">Total Engagement</h3>
                <div>
                  <p className="text-2xl font-semibold text-[#37322F] mb-2">
                    {analytics.totalEngagement.views + analytics.totalEngagement.upvotes}
                  </p>
                  <p className="text-sm text-[#605A57]">
                    {analytics.totalEngagement.views} views + {analytics.totalEngagement.upvotes} upvotes
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-[#E0DEDB]">
                <h3 className="text-lg font-semibold text-[#37322F] mb-4">Engagement Rate</h3>
                {analytics.totalEngagement.views > 0 && (
                  <div>
                    <p className="text-2xl font-semibold text-[#37322F] mb-2">
                      {((analytics.totalEngagement.upvotes / analytics.totalEngagement.views) * 100).toFixed(2)}%
                    </p>
                    <p className="text-sm text-[#605A57]">Upvotes per view</p>
                  </div>
                )}
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-[#E0DEDB]">
                <h3 className="text-lg font-semibold text-[#37322F] mb-4">Current Rank</h3>
                <div>
                  <p className="text-2xl font-semibold text-[#37322F] mb-2">
                    #{analytics.profile.rank || 'Unranked'}
                  </p>
                  <p className="text-sm text-[#605A57]">Leaderboard position</p>
                </div>
              </div>
            </div>
            
            {/* Activity Timeline */}
            <div className="bg-white p-6 rounded-lg border border-[#E0DEDB]">
              <h2 className="text-lg font-semibold text-[#37322F] mb-4">Recent Activity</h2>
              {activityTimeline.length > 0 ? (
                <div className="space-y-3">
                  {activityTimeline.slice(0, 10).map((activity: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl">
                        {activity.type === 'project_created' ? '🚀' : '👍'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#37322F]">
                          {activity.type === 'project_created' 
                            ? `Created project: ${activity.data.title}` 
                            : `Upvoted a ${activity.data.target_type}`}
                        </p>
                        <p className="text-xs text-[#605A57]">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#605A57]">No recent activity</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
