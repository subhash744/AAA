"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import confetti from "canvas-confetti"
import { useState } from "react"

export default function CTASection() {
  const router = useRouter()
  const [isAnimating, setIsAnimating] = useState(false)

  const handleCreateProfile = () => {
    setIsAnimating(true)
    
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#37322F", "#605A57", "#E0DEDB"],
    })

    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#37322F", "#605A57", "#E0DEDB"],
      })
    }, 200)

    setTimeout(() => {
      router.push("/leaderboard")
    }, 1000)
  }

  return (
    <section className="py-24 px-6 bg-[#F7F5F3] relative overflow-hidden">
      {/* Background motion layer */}
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{
          background: [
            "radial-gradient(circle at 30% 50%, rgba(224, 222, 219, 0.4) 0%, transparent 50%)",
            "radial-gradient(circle at 70% 50%, rgba(224, 222, 219, 0.4) 0%, transparent 50%)",
            "radial-gradient(circle at 30% 50%, rgba(224, 222, 219, 0.4) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <h2 className="text-5xl md:text-6xl font-serif text-[#37322F] mb-6">
            Start Your Journey to the Leaderboard
          </h2>
          <p className="text-xl text-[#605A57] mb-10 max-w-2xl mx-auto">
            Join the community of builders, showcase your work, and climb the ranks
          </p>

          <motion.button
            onClick={handleCreateProfile}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-[#37322F] text-white rounded-full text-lg font-medium hover:bg-[#2a2520] transition shadow-lg"
            disabled={isAnimating}
          >
            Create Profile
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
