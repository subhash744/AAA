"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { incrementProfileViews } from "@/lib/supabase-storage"
import { Github, Linkedin, Globe, Twitter } from 'lucide-react'

interface LeaderboardEntry {
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

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentUserId: string
}

const badgeColors: Record<string, string> = {
  Bronze: "bg-amber-700 text-white",
  Silver: "bg-gray-400 text-white",
  Gold: "bg-yellow-500 text-white",
  Diamond: "bg-blue-400 text-white",
  Popular: "bg-pink-500 text-white",
  Trending: "bg-red-500 text-white",
  Viral: "bg-purple-500 text-white",
  Consistent: "bg-green-500 text-white",
  Dedicated: "bg-indigo-500 text-white",
  Unstoppable: "bg-orange-500 text-white",
  Builder: "bg-cyan-500 text-white",
  Prolific: "bg-violet-500 text-white",
}

export default function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  const router = useRouter()
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null)

  const handleViewProfile = async (userId: string) => {
    await incrementProfileViews(userId)
    router.push(`/profile/${userId}`)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#E0DEDB]">
            <th className="text-left py-4 px-4 font-semibold text-[#37322F]">Rank</th>
            <th className="text-left py-4 px-4 font-semibold text-[#37322F]">Profile</th>
            <th className="text-left py-4 px-4 font-semibold text-[#37322F]">Score</th>
            <th className="text-left py-4 px-4 font-semibold text-[#37322F]">Views</th>
            <th className="text-left py-4 px-4 font-semibold text-[#37322F]">Upvotes</th>
            <th className="text-left py-4 px-4 font-semibold text-[#37322F]">Streak</th>
            <th className="text-left py-4 px-4 font-semibold text-[#37322F]">Projects</th>
            <th className="text-left py-4 px-4 font-semibold text-[#37322F]">Badges</th>
            <th className="text-left py-4 px-4 font-semibold text-[#37322F]">Action</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.userId}
              className="border-b border-[#E0DEDB] hover:bg-white transition"
              onMouseEnter={() => setHoveredUserId(entry.userId)}
              onMouseLeave={() => setHoveredUserId(null)}
            >
              <td className="py-4 px-4">
                <span className="font-semibold text-[#37322F]">#{entry.rank}</span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E0DEDB] to-[#D0CECC] flex items-center justify-center text-sm font-semibold text-[#37322F]">
                    {entry.displayName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-[#37322F]">{entry.displayName}</p>
                    <p className="text-sm text-[#605A57]">@{entry.username}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4 font-semibold text-[#37322F]">{entry.score}</td>
              <td className="py-4 px-4 text-[#605A57]">{entry.views}</td>
              <td className="py-4 px-4 text-[#605A57]">{entry.upvotes}</td>
              <td className="py-4 px-4 text-[#605A57]">{entry.streak} days</td>
              {/* <CHANGE> Added project count column */}
              <td className="py-4 px-4 text-[#605A57]">{entry.projectCount}</td>
              <td className="py-4 px-4">
                <div className="flex gap-1 flex-wrap">
                  {entry.badges.slice(0, 3).map((badge) => (
                    <span
                      key={badge}
                      className={`px-2 py-1 text-xs font-medium rounded ${badgeColors[badge] || "bg-gray-300"}`}
                      title={badge}
                    >
                      {badge.substring(0, 3)}
                    </span>
                  ))}
                </div>
              </td>
              <td className="py-4 px-4">
                <button
                  onClick={() => handleViewProfile(entry.userId)}
                  className="px-4 py-2 bg-[#37322F] text-white rounded-lg text-sm font-medium hover:bg-[#2a2520] transition"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {entries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#605A57]">No profiles yet. Be the first to join!</p>
        </div>
      )}
    </div>
  )
}
