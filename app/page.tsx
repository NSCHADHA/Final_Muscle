"use client"

import { useState, useEffect } from "react"
import { LoginPage } from "@/components/auth/LoginPage"
import { SignupPage } from "@/components/auth/SignupPage"
import { MainLayout } from "@/components/layout/MainLayout"
import { createClient } from "@/lib/supabase/client"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showSignup, setShowSignup] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      setIsAuthenticated(true)
    }
  }

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setIsAuthenticated(false)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <MainLayout onLogout={handleLogout} />
  }

  return showSignup ? (
    <SignupPage onSuccess={handleAuthSuccess} onSwitchToLogin={() => setShowSignup(false)} />
  ) : (
    <LoginPage onSuccess={handleAuthSuccess} onSwitchToSignup={() => setShowSignup(true)} />
  )
}
