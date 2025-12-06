"use client"

import type React from "react"
import {
  LayoutDashboard,
  Users,
  Package,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  Building2,
  UserCog,
  UserCheck,
  Mail,
} from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"

type NavItem =
  | "dashboard"
  | "members"
  | "plans"
  | "payments"
  | "reminders"
  | "settings"
  | "branches"
  | "staff"
  | "attendance"
  | "membersEmailPortal" // added new nav item for Members Email Portal

interface SidebarProps {
  currentPage: NavItem
  onNavigate: (page: NavItem) => void
  onLogout: () => void
  isMobileMenuOpen?: boolean
  onMobileMenuClose?: () => void
}

export function Sidebar({ currentPage, onNavigate, onLogout, isMobileMenuOpen, onMobileMenuClose }: SidebarProps) {
  const navItems: { id: NavItem; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "members", label: "Members", icon: <Users size={20} /> },
    { id: "attendance", label: "Attendance", icon: <UserCheck size={20} /> },
    { id: "plans", label: "Plans", icon: <Package size={20} /> },
    { id: "payments", label: "Payments", icon: <CreditCard size={20} /> },
    { id: "reminders", label: "Reminders", icon: <Bell size={20} /> },
    { id: "membersEmailPortal", label: "Members Email Portal", icon: <Mail size={20} /> }, // added Members Email Portal navigation item
    { id: "branches", label: "Branches", icon: <Building2 size={20} /> },
    { id: "staff", label: "Staff", icon: <UserCog size={20} /> },
    { id: "settings", label: "Settings", icon: <Settings size={20} /> },
  ]

  const handleNavigation = (page: NavItem) => {
    onNavigate(page)
    if (onMobileMenuClose) {
      onMobileMenuClose()
    }
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onMobileMenuClose} />}

      {/* Sidebar */}
      <aside
        className={`
        fixed md:sticky top-0 left-0 h-full
        w-64 bg-card/50 backdrop-blur-md border-r border-border/50 
        flex flex-col transition-transform duration-300 z-50
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* Logo */}
        <div className="p-4 md:p-6 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-lg">
              <span className="text-accent-foreground font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="font-bold text-base md:text-lg text-foreground">MuscleDesk</h1>
              <p className="text-xs text-muted-foreground">Pro</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 md:py-6 space-y-1 md:space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg transition-all duration-200 relative group ${
                currentPage === item.id
                  ? "bg-accent text-accent-foreground shadow-md"
                  : "text-foreground hover:bg-muted/50"
              }`}
            >
              {currentPage === item.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-foreground rounded-r-full" />
              )}
              {item.icon}
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Theme Toggle & Logout */}
        <div className="p-4 border-t border-border/50 space-y-3">
          <ThemeToggle />
          <button
            onClick={() => {
              onLogout()
              if (onMobileMenuClose) {
                onMobileMenuClose()
              }
            }}
            className="w-full flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-lg text-foreground hover:bg-destructive/10 transition-colors font-medium text-sm"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>

          <div className="text-center pt-2 border-t border-border/30">
            <p className="text-[10px] text-muted-foreground/80">© 2025 MuscleDesk</p>
            <p className="text-[9px] text-muted-foreground/70">Navjeet Chadha</p>
          </div>
        </div>
      </aside>
    </>
  )
}
