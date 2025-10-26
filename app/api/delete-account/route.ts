import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Delete user profile (cascading deletes will handle projects, upvotes, etc.)
    const { error: profileError } = await supabase.from("profiles").delete().eq("user_id", user.id)

    if (profileError) {
      console.error("Error deleting profile:", profileError)
      return NextResponse.json({ error: "Failed to delete profile" }, { status: 500 })
    }

    // Delete the user from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(user.id)

    if (authError) {
      console.error("Error deleting auth user:", authError)
      return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
    }

    // Sign out the user
    await supabase.auth.signOut()

    return NextResponse.json({ success: true, message: "Account deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error in delete account:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
