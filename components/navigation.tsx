"use client"

import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getCurrentUserProfile } from "@/lib/supabase-storage"
import { useState, useEffect } from "react"
import AuthModal from "./auth-modal"

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Get current user from Supabase
    const loadUser = async () => {
      const profile = await getCurrentUserProfile()
      setCurrentUser(profile)
    }
    
    loadUser()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await getCurrentUserProfile()
        setCurrentUser(profile)
      } else {
        setCurrentUser(null)
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setCurrentUser(null)
    router.push("/")
    router.refresh()
  }

  if (!mounted) return null

  const navItems = [
    { label: "Home", href: "/", icon: null },
    { label: "Leaderboard", href: "/leaderboard", icon: null },
    { label: "Map", href: "/map", icon: "🌍" },
    { label: "Hall of Fame", href: "/hall", icon: null },
    ...(currentUser ? [{ label: "Dashboard", href: "/dashboard", icon: null }] : []),
  ]

  return (
    <nav className="border-b border-[rgba(55,50,47,0.12)] px-6 py-5 flex justify-between items-center bg-[#F7F5F3]">
      <div className="text-3xl font-bold text-[#37322F] cursor-pointer" onClick={() => router.push("/")}>
        Rizgeo
      </div>

      <div className="flex gap-8 items-center">
        {navItems.map((item) => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={`text-base font-medium transition flex items-center gap-2 ${
              pathname === item.href ? "text-[#37322F] font-bold" : "text-[#605A57] hover:text-[#37322F]"
            }`}
          >
            {item.icon && <span className="text-xl">{item.icon}</span>}
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex gap-5 items-center">
        {currentUser ? (
          <>
            <span className="text-base text-[#605A57] font-medium">{currentUser.display_name}</span>
            <button
              onClick={() => router.push(`/profile/${currentUser.user_id}`)}
              className="w-10 h-10 rounded-full bg-[#E0DEDB] flex items-center justify-center text-sm font-bold text-[#37322F]"
            >
              {currentUser.display_name.charAt(0)}
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 border border-[#E0DEDB] text-[#37322F] rounded-full text-base font-medium hover:bg-white transition"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-5 py-2.5 bg-white border border-[#E0DEDB] text-[#37322F] rounded-full text-base font-medium hover:bg-[#F7F5F3] transition"
          >
            Log in
          </button>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
        />
      )}
    </nav>
  )
}
