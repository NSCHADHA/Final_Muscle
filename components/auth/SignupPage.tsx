"use client"

import type React from "react"
import { useState } from "react"
import { Mail, Lock, User, Building2, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface SignupPageProps {
  onSuccess: () => void
  onSwitchToLogin: () => void
}

export function SignupPage({ onSuccess, onSwitchToLogin }: SignupPageProps) {
  const [name, setName] = useState("")
  const [gymName, setGymName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    // Sign up with Supabase Auth
    const { data: authData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          gym_name: gymName,
        },
      },
    })

    if (signupError) {
      setIsLoading(false)
      toast.error(signupError.message || "Failed to create account")
      return
    }

    if (!authData.user) {
      setIsLoading(false)
      toast.error("Failed to create account")
      return
    }

    // Create user record in users table
    const { error: userError } = await supabase.from("users").insert({
      id: authData.user.id,
      email: email,
      name: name,
      gym_name: gymName,
      role: "admin",
    })

    setIsLoading(false)

    if (userError) {
      toast.error("Account created but profile setup failed. Please contact support.")
      console.error("[v0] User creation error:", userError)
      return
    }

    toast.success("Account created successfully! Please sign in.")
    onSwitchToLogin()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-4">
            <div className="text-3xl font-bold text-primary">M</div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground">Set up your gym management account</p>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-2xl border border-border p-8 shadow-lg animate-fade-in">
          <form onSubmit={handleSignup} className="space-y-6">
            {/* Gym Name */}
            <div>
              <label className="form-label">Gym Name</label>
              <div className="relative">
                <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  placeholder="Iron Paradise Gym"
                  className="form-input pl-12"
                  required
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="form-label">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="form-input pl-12"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@gymnasium.com"
                  className="form-input pl-12"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input pl-12"
                  required
                  minLength={6}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-card text-muted-foreground">Already have an account?</span>
              </div>
            </div>

            {/* Login Link */}
            <button type="button" onClick={onSwitchToLogin} className="btn-secondary w-full">
              Sign In
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By creating an account, you agree to our terms of service
        </p>
      </div>
    </div>
  )
}
