"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "./Sidebar"
import { AppHeader } from "./AppHeader"
import { Dashboard } from "../pages/Dashboard"
import { Members } from "../pages/Members"
import { Plans } from "../pages/Plans"
import { Payments } from "../pages/Payments"
import { Reminders } from "../pages/Reminders"
import { Branches } from "../pages/Branches"
import { Staff } from "../pages/Staff"
import { Settings } from "../pages/Settings"
import { ActivityHistory } from "../pages/ActivityHistory"
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt"
import { useGymData } from "@/hooks/useGymData"
import { Attendance } from "../pages/Attendance"

type NavItem =
  | "dashboard"
  | "members"
  | "attendance"
  | "plans"
  | "payments"
  | "reminders"
  | "branches"
  | "staff"
  | "settings"
  | "activity"

interface MainLayoutProps {
  onLogout: () => void
}

export function MainLayout({ onLogout }: MainLayoutProps) {
  const { state, logout } = useGymData()
  const [currentPage, setCurrentPage] = useState<NavItem>("dashboard")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [globalSearchQuery, setGlobalSearchQuery] = useState("")

  useEffect(() => {
    const handleOpenAddMember = () => {
      setCurrentPage("members")
      // Dispatch event to Members component after a small delay
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("triggerAddMember"))
      }, 100)
    }

    const handleOpenAddPayment = () => {
      setCurrentPage("payments")
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("triggerAddPayment"))
      }, 100)
    }

    const handleNavigateToReminders = () => {
      setCurrentPage("reminders")
    }

    const handleNavigateToPlans = () => {
      setCurrentPage("plans")
    }

    const handleNavigateToActivity = () => {
      setCurrentPage("activity")
    }

    window.addEventListener("openAddMember", handleOpenAddMember)
    window.addEventListener("openAddPayment", handleOpenAddPayment)
    window.addEventListener("navigateToReminders", handleNavigateToReminders)
    window.addEventListener("navigateToPlans", handleNavigateToPlans)
    window.addEventListener("navigateToActivity", handleNavigateToActivity)

    return () => {
      window.removeEventListener("openAddMember", handleOpenAddMember)
      window.removeEventListener("openAddPayment", handleOpenAddPayment)
      window.removeEventListener("navigateToReminders", handleNavigateToReminders)
      window.removeEventListener("navigateToPlans", handleNavigateToPlans)
      window.removeEventListener("navigateToActivity", handleNavigateToActivity)
    }
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && state.authUser) {
        // Page became visible - SWR will automatically revalidate
      }
    }

    const handleOnline = () => {
      // Device came back online
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("online", handleOnline)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("online", handleOnline)
    }
  }, [state.authUser])

  const handleLogout = async () => {
    await logout()
    onLogout()
  }

  const handleSearch = (query: string) => {
    setGlobalSearchQuery(query)

    if (query.trim()) {
      const lowerQuery = query.toLowerCase()

      const memberMatch = state.members.some(
        (m) =>
          m.name.toLowerCase().includes(lowerQuery) ||
          m.email.toLowerCase().includes(lowerQuery) ||
          m.phone.includes(query),
      )

      const paymentMatch =
        state.payments.some((p) => p.member_name?.toLowerCase().includes(lowerQuery)) ||
        lowerQuery.includes("payment") ||
        lowerQuery.includes("₹")

      const planMatch =
        state.plans.some((p) => p.name.toLowerCase().includes(lowerQuery)) || lowerQuery.includes("plan")

      if (memberMatch && currentPage !== "members") {
        setCurrentPage("members")
      } else if (paymentMatch && currentPage !== "payments") {
        setCurrentPage("payments")
      } else if (planMatch && currentPage !== "plans") {
        setCurrentPage("plans")
      }
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      case "members":
        return <Members searchQuery={globalSearchQuery} />
      case "attendance":
        return <Attendance />
      case "plans":
        return <Plans />
      case "payments":
        return <Payments searchQuery={globalSearchQuery} />
      case "reminders":
        return <Reminders />
      case "branches":
        return <Branches branches={state.branches} />
      case "staff":
        return <Staff staff={state.staff} currentBranchName={state.currentBranch?.name || "Main Branch"} />
      case "settings":
        return <Settings />
      case "activity":
        return <ActivityHistory />
      default:
        return <Dashboard />
    }
  }

  const handleNavigate = (page: NavItem) => {
    setCurrentPage(page)
    setIsMobileMenuOpen(false)
    setGlobalSearchQuery("")
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 md:relative md:translate-x-0 transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader
          onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onLogout={handleLogout}
          userName={state.user?.ownerName || "User"}
          userRole={state.user?.gymName || "My Gym"}
          notificationCount={state.reminders.length}
        />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-background/50">{renderPage()}</main>
      </div>

      {/* Floating PWA install prompt */}
      <PWAInstallPrompt />
    </div>
  )
}
