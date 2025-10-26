"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import Navigation from "@/components/navigation"
import { getAllUsers, incrementMapClicks, incrementViewCount, getCurrentUser } from "@/lib/storage"
import type { UserProfile } from "@/lib/storage"

const MapComponent = dynamic(() => import("@/components/map-component"), { ssr: false })

export default function MapPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(searchParams.get("userId"))
  const [mounted, setMounted] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    const user = getCurrentUser()
    setCurrentUser(user)
    const allUsers = getAllUsers()
    setUsers(allUsers.filter((u) => u.location && (u.location.lat !== 0 || u.location.lng !== 0)))
  }, [])

  const handlePinClick = (userId: string) => {
    setSelectedUserId(userId)
    incrementMapClicks(userId)
  }

  const handleViewProfile = (userId: string) => {
    incrementViewCount(userId)
    router.push(`/profile/${userId}`)
  }

  if (!mounted) return null

  return (
    <div className="w-full min-h-screen bg-[#F7F5F3] flex flex-col">
      <Navigation />

      <div className="flex-1 flex flex-col">
        <div className="px-6 py-6 border-b border-[#E0DEDB] text-center">
          <h1 className="text-4xl font-serif text-[#37322F] mb-2">Global OG Builders Map</h1>
          <p className="text-[#605A57]">Discover Original builders from around the world - connect</p>
        </div>

        <div className="flex-1 flex gap-6 p-6">
          {/* Map Container */}
          <div className="flex-1 rounded-lg overflow-hidden border border-[#E0DEDB] shadow-sm">
            <MapComponent users={users} selectedUserId={selectedUserId} onPinClick={handlePinClick} />
          </div>

          {/* Selected User Info */}
          {selectedUserId && (
            <div className="w-80 bg-white rounded-lg border border-[#E0DEDB] p-6 shadow-sm">
              {users.find((u) => u.id === selectedUserId) && (
                <div>
                  {(() => {
                    const user = users.find((u) => u.id === selectedUserId)
                    if (!user) return null
                    return (
                      <>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E0DEDB] to-[#D0CECC] flex items-center justify-center text-lg font-semibold text-[#37322F]">
                            {user.displayName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-[#37322F]">{user.displayName}</p>
                            <p className="text-sm text-[#605A57]">@{user.username}</p>
                          </div>
                        </div>

                        {user.location && (
                          <div className="mb-4 p-3 bg-[#F7F5F3] rounded-lg">
                            <p className="text-sm text-[#605A57]">
                              {user.location.city}, {user.location.country}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="p-3 bg-[#F7F5F3] rounded-lg">
                            <p className="text-xs text-[#605A57]">Views</p>
                            <p className="text-lg font-semibold text-[#37322F]">{user.views}</p>
                          </div>
                          <div className="p-3 bg-[#F7F5F3] rounded-lg">
                            <p className="text-xs text-[#605A57]">Upvotes</p>
                            <p className="text-lg font-semibold text-[#37322F]">{user.upvotes}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleViewProfile(user.id)}
                          className="w-full px-4 py-2 bg-[#37322F] text-white rounded-lg font-medium hover:bg-[#2a2520] transition"
                        >
                          View Profile
                        </button>
                      </>
                    )
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
