"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, TrendingUp, Award } from "lucide-react"
import { getAllUsers, calculateScore } from "@/lib/storage"

// Remove mock data and fetch real data instead
/*
const mockLeaderboardData = [
  { 
    rank: 1, 
    name: "Sarah Chen", 
    score: 2847, 
    badge: "🥇",
    avatar: "https://i.pravatar.cc/150?img=5",
    upvotes: 342,
    streak: 47,
    views: 12453,
    badges: ["🏆", "⭐", "🔥"],
    borderColor: "border-yellow-400",
    bgGlow: "shadow-yellow-400/30"
  },
  { 
    rank: 2, 
    name: "Alex Rivera", 
    score: 2621, 
    badge: "🥈",
    avatar: "https://i.pravatar.cc/150?img=12",
    upvotes: 298,
    streak: 35,
    views: 10234,
    badges: ["⭐", "🚀", "💎"],
    borderColor: "border-gray-300",
    bgGlow: "shadow-gray-400/30"
  },
  { 
    rank: 3, 
    name: "Jordan Kim", 
    score: 2405, 
    badge: "🥉",
    avatar: "https://i.pravatar.cc/150?img=32",
    upvotes: 276,
    streak: 28,
    views: 8932,
    badges: ["🔥", "💎", "🎯"],
    borderColor: "border-orange-400",
    bgGlow: "shadow-orange-400/30"
  },
  { 
    rank: 4, 
    name: "Taylor Swift", 
    score: 2198, 
    badge: "",
    avatar: "https://i.pravatar.cc/150?img=47",
    upvotes: 234,
    streak: 21,
    views: 7621,
    badges: ["🚀", "⭐"],
    borderColor: "border-[#E0DEDB]",
    bgGlow: ""
  },
  { 
    rank: 5, 
    name: "Morgan Lee", 
    score: 2043, 
    badge: "",
    avatar: "https://i.pravatar.cc/150?img=20",
    upvotes: 187,
    streak: 14,
    views: 6543,
    badges: ["💎", "🎯"],
    borderColor: "border-[#E0DEDB]",
    bgGlow: ""
  },
  { 
    rank: 6, 
    name: "Chris Martinez", 
    score: 1876, 
    badge: "",
    avatar: "https://i.pravatar.cc/150?img=13",
    upvotes: 165,
    streak: 12,
    views: 5421,
    badges: ["🎯", "⚡"],
    borderColor: "border-[#E0DEDB]",
    bgGlow: ""
  },
  { 
    rank: 7, 
    name: "Emma Wilson", 
    score: 1654, 
    badge: "",
    avatar: "https://i.pravatar.cc/150?img=45",
    upvotes: 142,
    streak: 9,
    views: 4892,
    badges: ["⚡", "🌟"],
    borderColor: "border-[#E0DEDB]",
    bgGlow: ""
  },
  { 
    rank: 8, 
    name: "David Park", 
    score: 1432, 
    badge: "",
    avatar: "https://i.pravatar.cc/150?img=68",
    upvotes: 128,
    streak: 7,
    views: 4231,
    badges: ["🌟", "🎨"],
    borderColor: "border-[#E0DEDB]",
    bgGlow: ""
  },
  { 
    rank: 9, 
    name: "Lisa Anderson", 
    score: 1287, 
    badge: "",
    avatar: "https://i.pravatar.cc/150?img=29",
    upvotes: 114,
    streak: 5,
    views: 3876,
    badges: ["🎨", "💫"],
    borderColor: "border-[#E0DEDB]",
    bgGlow: ""
  },
  { 
    rank: 10, 
    name: "Ryan Thompson", 
    score: 1143, 
    badge: "",
    avatar: "https://i.pravatar.cc/150?img=60",
    upvotes: 98,
    streak: 4,
    views: 3254,
    badges: ["💫", "✨"],
    borderColor: "border-[#E0DEDB]",
    bgGlow: ""
  },
]
*/

export default function LeaderboardPreview() {
  const router = useRouter()
  const [upvotedUsers, setUpvotedUsers] = useState<Set<number>>(new Set())
  
  // Get real users and calculate their scores
  const allUsers = getAllUsers()
  const leaderboardData = allUsers
    .map((user, index) => ({
      rank: index + 1,
      name: user.displayName,
      score: calculateScore(user, "all-time"),
      badge: getRankBadge(index + 1),
      avatar: user.avatar,
      upvotes: user.upvotes,
      streak: user.streak,
      views: user.views,
      badges: user.badges,
      borderColor: getBorderColor(index + 1),
      bgGlow: getBgGlow(index + 1)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  const handleUpvote = (rank: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setUpvotedUsers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(rank)) {
        newSet.delete(rank)
      } else {
        newSet.add(rank)
      }
      return newSet
    })
  }

  // If no users exist, show a message instead of mock data
  if (allUsers.length === 0) {
    return (
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl font-serif text-[#37322F] mb-4">Top Builders</h2>
            <p className="text-lg text-[#605A57] max-w-xl mx-auto">
              Be the first to join our leaderboard! Create your profile to get started.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeInOut" }}
            className="bg-[#F7F5F3] rounded-lg border border-[#E0DEDB] overflow-hidden p-12 text-center"
          >
            <p className="text-[#605A57]">
              No builders yet. Be the first to join and climb the ranks!
            </p>
            <button
              onClick={() => router.push("/leaderboard")}
              className="mt-6 px-8 py-3 bg-[#37322F] text-white rounded-full font-medium hover:bg-[#2a2520] transition"
            >
              View Full Leaderboard
            </button>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-serif text-[#37322F] mb-4">Top Builders</h2>
          <p className="text-lg text-[#605A57] max-w-xl mx-auto">
            See who's leading the way and climbing the ranks
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeInOut" }}
          className="bg-[#F7F5F3] rounded-lg border border-[#E0DEDB] overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E0DEDB]">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#37322F]">Rank</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-[#37322F]">Builder</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-[#37322F]">Badges</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-[#37322F]">Streak</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-[#37322F]">Views</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-[#37322F]">Score</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-[#37322F]">Vote</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((user, index) => {
                  const isUpvoted = upvotedUsers.has(user.rank)
                  const currentUpvotes = user.upvotes + (isUpvoted ? 1 : 0)
                  
                  return (
                    <motion.tr
                      key={user.rank}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeInOut" }}
                      className={`border-b border-[#E0DEDB] last:border-0 hover:bg-white transition cursor-pointer group ${user.bgGlow}`}
                      onClick={() => router.push("/leaderboard")}
                    >
                      {/* Rank with Medal */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="text-[#605A57] font-medium">#{user.rank}</span>
                          {user.badge && <span className="text-2xl">{user.badge}</span>}
                        </div>
                      </td>

                      {/* Builder with Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img 
                            src={user.avatar} 
                            alt={user.name}
                            className={`w-10 h-10 rounded-full object-cover border-2 ${user.borderColor} ${user.bgGlow && 'shadow-lg'}`}
                          />
                          <span className="text-[#37322F] font-medium">{user.name}</span>
                        </div>
                      </td>

                      {/* Badges */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {user.badges.slice(0, 3).map((badge, i) => (
                            <span key={i} className="text-lg" title="Achievement Badge">
                              {getBadgeEmoji(badge)}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Streak */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <TrendingUp className="w-4 h-4 text-orange-500" />
                          <span className="text-[#37322F] font-semibold">{user.streak}</span>
                          <span className="text-xs text-[#605A57]">days</span>
                        </div>
                      </td>

                      {/* Views */}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <Eye className="w-4 h-4 text-[#605A57]" />
                          <span className="text-[#605A57] text-sm">
                            {user.views.toLocaleString()}
                          </span>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="py-4 px-6 text-right">
                        <span className="text-[#37322F] font-bold text-lg">
                          {user.score.toLocaleString()}
                        </span>
                      </td>

                      {/* Upvote Button */}
                      <td className="py-4 px-4">
                        <motion.button
                          onClick={(e) => handleUpvote(user.rank, e)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-all ${
                            isUpvoted 
                              ? 'bg-[#37322F] text-white border-[#37322F]' 
                              : 'bg-white text-[#605A57] border-[#E0DEDB] hover:border-[#37322F]'
                          }`}
                        >
                          <span className="text-lg">▲</span>
                          <span className="text-xs font-semibold">{currentUpvotes}</span>
                        </motion.button>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeInOut" }}
          className="text-center mt-8"
        >
          <button
            onClick={() => router.push("/leaderboard")}
            className="px-8 py-3 bg-[#37322F] text-white rounded-full font-medium hover:bg-[#2a2520] transition"
          >
            View Full Leaderboard
          </button>
        </motion.div>
      </div>
    </section>
  )
}

// Helper functions
function getRankBadge(rank: number): string {
  if (rank === 1) return "🥇"
  if (rank === 2) return "🥈"
  if (rank === 3) return "🥉"
  return ""
}

function getBorderColor(rank: number): string {
  if (rank === 1) return "border-yellow-400"
  if (rank === 2) return "border-gray-300"
  if (rank === 3) return "border-orange-400"
  return "border-[#E0DEDB]"
}

function getBgGlow(rank: number): string {
  if (rank === 1) return "shadow-yellow-400/30"
  if (rank === 2) return "shadow-gray-400/30"
  if (rank === 3) return "shadow-orange-400/30"
  return ""
}

function getBadgeEmoji(badgeName: string): string {
  const badgeMap: Record<string, string> = {
    "Bronze": "🏆",
    "Silver": "⭐",
    "Gold": "🔥",
    "Diamond": "💎",
    "Popular": "🚀",
    "Trending": "🎯",
    "Viral": "⚡",
    "Consistent": "🌟",
    "Dedicated": "🎨",
    "Unstoppable": "💫",
    "Builder": "🏗️",
    "Prolific": "📈"
  }
  return badgeMap[badgeName] || "🏅"
}
