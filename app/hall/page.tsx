"use client"

import { useEffect, useState } from "react"
import { getAllUsers, getCurrentUser } from "@/lib/storage"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"

export default function HallOfFamePage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    const user = getCurrentUser()
    setCurrentUser(user)
    const allUsers = getAllUsers()
    setUsers(allUsers)
  }, [])

  if (!mounted) return null

  return (
    <div className="w-full min-h-screen bg-[#F7F5F3]">
      <Navigation />

      <div className="px-6 py-12">
        <div className="max-w-7xl mx-auto mb-12 text-center">
          <h1 className="text-5xl font-serif text-[#37322F] mb-4">Hall of Fame</h1>
          <p className="text-lg text-[#605A57]">Discover the builders shaping the future</p>
        </div>

        {/* Museum Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-max">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => router.push(`/profile/${user.id}`)}
                className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
              >
                {/* Frame */}
                <div className="bg-white border-8 border-[#37322F] p-4 rounded-lg shadow-lg hover:shadow-2xl transition-shadow">
                  {/* Avatar */}
                  <div className="w-full aspect-square bg-gradient-to-br from-[#E0DEDB] to-[#D0CECC] rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                    <div className="text-5xl font-semibold text-[#37322F]">{user.displayName.charAt(0)}</div>
                  </div>

                  {/* Info - Always visible and centered */}
                  <div className="text-center">
                    <h3 className="font-semibold text-[#37322F] text-sm mb-1 truncate">{user.displayName}</h3>
                    <p className="text-xs text-[#605A57] mb-3 line-clamp-2">{user.bio}</p>

                    {/* Social Links */}
                    {user.links && user.links.length > 0 && (
                      <div className="flex gap-2 mb-3 justify-center">
                        {user.links.slice(0, 2).map((link: any, idx: number) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs bg-[#37322F] text-white px-2 py-1 rounded hover:bg-[#2a2520] transition"
                          >
                            {link.title}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex gap-2 text-xs text-[#605A57] justify-center">
                      <span>{user.views} views</span>
                      <span>{user.votes} votes</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {users.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🌟</div>
              <h2 className="text-2xl font-semibold text-[#37322F] mb-4">Hall of Fame is Empty</h2>
              <p className="text-[#605A57] mb-8 max-w-md mx-auto">
                Be the first builder to join the Hall of Fame! Create your profile and showcase your talents.
              </p>
              {!currentUser && (
                <button
                  onClick={() => router.push("/")}
                  className="px-6 py-3 bg-[#37322F] text-white rounded-lg font-medium hover:bg-[#2a2520] transition"
                >
                  Create Your Profile
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
