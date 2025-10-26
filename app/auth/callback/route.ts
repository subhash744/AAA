import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    try {
      const supabase = createRouteHandlerClient({ cookies })
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Error exchanging code for session:", error)
        return NextResponse.redirect(new URL("/", requestUrl.origin))
      }

      if (data.user) {
        // Check if profile exists
        const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", data.user.id).single()

        // If profile doesn't exist, create one
        if (!profile) {
          const username = data.user.email?.split("@")[0] || `user_${Date.now()}`
          const displayName = data.user.email?.split("@")[0] || "New User"

          await supabase.from("profiles").insert({
            user_id: data.user.id,
            email: data.user.email || "",
            username: username,
            display_name: displayName,
            bio: "",
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
          })
        }
      }
    } catch (error) {
      console.error("Error during auth callback:", error)
    }
  }

  // Redirect to profile creation page after successful authentication
  return NextResponse.redirect(new URL("/profile-creation", requestUrl.origin))
}
