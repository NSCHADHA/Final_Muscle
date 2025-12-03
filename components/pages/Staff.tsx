"use client"

import { Users, Rocket } from "lucide-react"
import type { StaffMember } from "@/hooks/useGymData"

interface StaffProps {
  staff?: StaffMember[]
  currentBranchName?: string
}

export function Staff({ staff = [], currentBranchName = "Current Branch" }: StaffProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center max-w-lg">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <Users size={40} className="text-white" />
          </div>
        </div>

        <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-full">
          <Rocket size={16} className="text-purple-600" />
          <span className="text-sm font-semibold text-purple-600">Coming Soon</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Staff & Role Management</h1>

        <p className="text-muted-foreground text-base md:text-lg mb-6">
          Manage your team with role-based access control. Assign different permissions to owners, managers, trainers,
          and front desk staff.
        </p>

        <div className="bg-muted/50 rounded-lg p-6 text-left">
          <h3 className="font-semibold text-foreground mb-3">What's Coming:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">✓</span>
              <span>Add staff members with different roles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">✓</span>
              <span>Role-based permissions (Owner, Manager, Trainer, Front Desk)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">✓</span>
              <span>Branch-level staff assignments</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 mt-1">✓</span>
              <span>Activity tracking per staff member</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
