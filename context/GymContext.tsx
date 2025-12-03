"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { useGymData } from "@/hooks/useGymData"
import type {
  UserData,
  Member,
  Payment,
  Plan,
  Branch,
  StaffMember,
  Reminder,
  ActivityLog,
  Attendance,
} from "@/hooks/useGymData"

interface GymContextType {
  state: {
    user: UserData | null
    authUser: any
    branches: Branch[]
    currentBranch: Branch | null
    staff: StaffMember[]
    members: Member[]
    payments: Payment[]
    plans: Plan[]
    attendance: Attendance[]
    activityLog: ActivityLog[]
    reminders: Reminder[]
    loading: boolean
  }
  dispatch: (action: any) => Promise<void>
  logout: () => Promise<void>
}

const GymContext = createContext<GymContextType | undefined>(undefined)

export function GymProvider({ children }: { children: React.ReactNode }) {
  const gymData = useGymData()

  return <GymContext.Provider value={gymData}>{children}</GymContext.Provider>
}

export function useGym(): GymContextType {
  const context = useContext(GymContext)
  if (!context) {
    throw new Error("useGym must be used within a GymProvider")
  }
  return context
}

export { GymContext }
export type { Member, Payment, Plan, Branch, StaffMember, Reminder, UserData, ActivityLog, Attendance }
