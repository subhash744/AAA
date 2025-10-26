"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, useScroll, useTransform } from "framer-motion"
import AuthModal from "@/components/auth-modal"
import Navigation from "@/components/navigation"
import { getCurrentUser } from "@/lib/storage"
// Remove the mock data initialization import since we don't want placeholder profiles
// import { initializeMockData } from "@/lib/init-mock-data"
import { updateStreaks } from "@/lib/storage"
import confetti from "canvas-confetti"
import LeaderboardPreview from "@/components/landing/leaderboard-preview"
import UserMapSection from "@/components/landing/user-map-section"
import ShowcaseGallery from "@/components/landing/showcase-gallery"
import HowItWorks from "@/components/landing/how-it-works"
import CTASection from "@/components/landing/cta-section"
import Footer from "@/components/landing/footer"

export default function LandingPage() {
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    updateStreaks()
    // Don't auto-initialize mock data - only load existing user
    const user = getCurrentUser()
    if (user) {
      setCurrentUser(user)
    }

    // Show confetti only on actual page refresh (Ctrl+R/F5), not on navigation
    // Check if this was a hard refresh using performance.navigation or performance.getEntriesByType
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    const isRefresh = navigationEntries.length > 0 && navigationEntries[0].type === 'reload'
    
    if (isRefresh) {
      setTimeout(() => {
        // Multiple confetti bursts for fullscreen effect
        confetti({
          particleCount: 200,
          spread: 360,
          origin: { x: 0.5, y: 0.5 },
          colors: ['#37322F', '#605A57', '#E0DEDB', '#2a2520']
        })
        
        // Additional bursts from different positions
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 360,
            origin: { x: 0.2, y: 0.3 },
            colors: ['#37322F', '#605A57', '#E0DEDB']
          })
        }, 200)
        
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 360,
            origin: { x: 0.8, y: 0.7 },
            colors: ['#37322F', '#605A57', '#E0DEDB']
          })
        }, 400)
      }, 1000)
    }
  }, [])

  const handleGetStarted = () => {
    if (currentUser) {
      router.push("/leaderboard")
    } else {
      setShowAuthModal(true)
    }
  }

  if (!mounted) return null

  return (
    <div className="w-full min-h-screen bg-[#F7F5F3] flex flex-col">
      <Navigation />

      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-20 text-center overflow-hidden">
        {/* Background motion layer */}
        <motion.div
          className="absolute inset-0 -z-10"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(224, 222, 219, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(224, 222, 219, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(224, 222, 219, 0.3) 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <h1 className="text-5xl md:text-7xl font-serif text-[#37322F] mb-6 leading-tight">Rizgeo</h1>
        <p className="text-lg md:text-xl text-[#605A57] mb-8 max-w-2xl">
          Build your profile, showcase your talents, and compete on the leaderboard. Connect with creators and climb the
          ranks.
        </p>

        <div className="flex gap-4 mb-16">
          <button
            onClick={handleGetStarted}
            className="px-8 py-3 bg-[#37322F] text-white rounded-full font-medium hover:bg-[#2a2520] transition"
          >
            {currentUser ? "Go to Leaderboard" : "Create Profile"}
          </button>
          <button
            onClick={() => router.push("/leaderboard")}
            className="px-8 py-3 border border-[#E0DEDB] text-[#37322F] rounded-full font-medium hover:bg-white transition"
          >
            View Leaderboard
          </button>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mt-12">
          {[
            { icon: "🏆", title: "Compete", desc: "Climb the leaderboard and earn badges", delay: 0 },
            { icon: "👥", title: "Connect", desc: "Share your profile and build your network", delay: 0.15 },
            { icon: "⭐", title: "Showcase", desc: "Display your links and interests", delay: 0.3 },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: feature.delay, ease: "easeInOut" }}
              className="p-6 bg-white rounded-lg border border-[#E0DEDB]"
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <h3 className="font-semibold text-[#37322F] mb-2">{feature.title}</h3>
              <p className="text-sm text-[#605A57]">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Leaderboard Preview Section */}
      <LeaderboardPreview />

      {/* User Map Section */}
      <UserMapSection />

      {/* Showcase Gallery Section */}
      <ShowcaseGallery />

      {/* How It Works Section */}
      <HowItWorks />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}
