// Authentication modal for login/signup with Supabase
"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { supabase, validateEmail } from "@/lib/supabase"
import confetti from "canvas-confetti"
import { Loader2 } from "lucide-react"

interface AuthModalProps {
  onClose: () => void
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (!email || !password) {
      setError("Please fill in all fields")
      setLoading(false)
      return
    }

    // Validate Gmail only
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      setError(emailValidation.error || "Invalid email")
      setLoading(false)
      return
    }

    // Password validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    try {
      if (isLogin) {
        // Login with Supabase Auth
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          setError(signInError.message)
          setLoading(false)
          return
        }

        if (data.user) {
          // Success! Redirect to leaderboard
          setSuccess("Login successful! Redirecting...")
          setTimeout(() => {
            router.push("/leaderboard")
            router.refresh()
            onClose()
          }, 500)
        }
      } else {
        // Sign up with Supabase Auth
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: email.split('@')[0],
              display_name: email.split('@')[0],
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (signUpError) {
          setError(signUpError.message)
          setLoading(false)
          return
        }

        if (data.user) {
          // Show fullscreen confetti for new user creation
          confetti({
            particleCount: 300,
            spread: 360,
            origin: { x: 0.5, y: 0.5 },
            colors: ['#37322F', '#605A57', '#E0DEDB', '#2a2520']
          })
          
          // Additional fullscreen bursts
          setTimeout(() => {
            confetti({
              particleCount: 200,
              spread: 360,
              origin: { x: 0.3, y: 0.4 },
              colors: ['#37322F', '#605A57', '#E0DEDB']
            })
          }, 300)
          
          setTimeout(() => {
            confetti({
              particleCount: 200,
              spread: 360,
              origin: { x: 0.7, y: 0.6 },
              colors: ['#37322F', '#605A57', '#E0DEDB']
            })
          }, 600)

          setSuccess("Account created! Check your email to verify your account.")
          
          setTimeout(() => {
            router.push("/profile-creation")
            router.refresh()
            onClose()
          }, 2000)
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-[#37322F]">{isLogin ? "Log In" : "Sign Up"}</h2>
          <button onClick={onClose} className="text-[#605A57] hover:text-[#37322F]">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#37322F] mb-2">Gmail Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-[#E0DEDB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37322F]"
              placeholder="your.email@gmail.com"
              disabled={loading}
            />
            <p className="text-xs text-[#605A57] mt-1">Only @gmail.com addresses are accepted</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#37322F] mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-[#E0DEDB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37322F]"
              placeholder="Enter password (min 6 characters)"
              disabled={loading}
            />
          </div>

          {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
          {success && <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">{success}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#37322F] text-white rounded-lg font-medium hover:bg-[#2a2520] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? (isLogin ? "Logging in..." : "Creating account...") : (isLogin ? "Log In" : "Sign Up")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#605A57]">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError("")
              }}
              className="ml-2 text-[#37322F] font-medium hover:underline"
            >
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
