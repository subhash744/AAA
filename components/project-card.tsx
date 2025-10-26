"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { addProjectUpvote, getCurrentUserProfile, incrementProjectViews } from "@/lib/supabase-storage"
import confetti from "canvas-confetti"

interface ProjectCardProps {
  project: any
  userId: string
  onUpvote?: () => void
}

export default function ProjectCard({ project, userId, onUpvote }: ProjectCardProps) {
  const [upvotes, setUpvotes] = useState<number>(project.upvotes)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const profile = await getCurrentUserProfile()
    setCurrentUser(profile)
  }

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (hasUpvoted || !currentUser) return

    const success = await addProjectUpvote(project.id, currentUser.user_id)
    if (success) {
      setUpvotes((prev) => prev + 1)
      setHasUpvoted(true)

      confetti({
        particleCount: 20,
        spread: 45,
        origin: { x: 0.5, y: 0.5 },
      })

      onUpvote?.()
    }
  }

  const handleClick = async () => {
    if (project.link) {
      await incrementProjectViews(project.id)
      window.open(project.link, "_blank")
    }
  }

  return (
    <div
      onClick={handleClick}
      className="bg-white border border-[#E0DEDB] rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
    >
      {project.bannerUrl ? (
        <img
          src={project.bannerUrl || "/placeholder.svg"}
          alt={project.title}
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
        />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-[#E0DEDB] to-[#D0CECC]" />
      )}

      <div className="p-4">
        <h3 className="font-semibold text-[#37322F] mb-2 line-clamp-2">{project.title}</h3>
        <p className="text-sm text-[#605A57] mb-4 line-clamp-2">{project.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-4 text-sm text-[#605A57]">
            <span>Views: {project.views}</span>
          </div>
          <button
            onClick={handleUpvote}
            disabled={hasUpvoted}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all ${
              hasUpvoted ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500"
            }`}
          >
            <Heart size={16} fill={hasUpvoted ? "currentColor" : "none"} />
            <span className="text-sm font-medium">{upvotes}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
