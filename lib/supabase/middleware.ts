import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are missing, just pass through the request without auth
  if (!supabaseUrl || !supabaseKey) {
    console.log("[v0] Supabase env vars missing in middleware, skipping auth check")
    return NextResponse.next({
      request,
    })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    // If refresh token is invalid, clear all auth cookies
    if (error?.message?.includes("refresh_token_not_found") || error?.message?.includes("Invalid Refresh Token")) {
      console.log("[v0] Invalid refresh token detected, clearing auth cookies")

      // Clear all Supabase auth cookies
      const authCookies = ["sb-access-token", "sb-refresh-token"]
      authCookies.forEach((cookieName) => {
        supabaseResponse.cookies.delete(cookieName)
      })

      // Also clear any cookies that match the Supabase project pattern
      request.cookies.getAll().forEach((cookie) => {
        if (cookie.name.includes("sb-") || cookie.name.includes("supabase")) {
          supabaseResponse.cookies.delete(cookie.name)
        }
      })
    }
  } catch (error) {
    console.log("[v0] Auth error in middleware:", error)
    // Clear cookies on any auth error
    request.cookies.getAll().forEach((cookie) => {
      if (cookie.name.includes("sb-") || cookie.name.includes("supabase")) {
        supabaseResponse.cookies.delete(cookie.name)
      }
    })
  }

  return supabaseResponse
}
