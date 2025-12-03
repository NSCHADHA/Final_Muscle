"use client"
import { Building2, Rocket } from "lucide-react"
import type { Branch } from "@/hooks/useGymData"

interface BranchesProps {
  branches: Branch[]
  onAddBranch?: (branch: { name: string; address: string; phone: string }) => Promise<void>
  onUpdateBranch?: (branch: { id: string; name: string; address: string; phone: string }) => Promise<void>
  onDeleteBranch?: (id: string) => Promise<void>
}

export function Branches({ branches = [], onAddBranch, onUpdateBranch, onDeleteBranch }: BranchesProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center max-w-lg">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center">
            <Building2 size={40} className="text-white" />
          </div>
        </div>

        <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
          <Rocket size={16} className="text-accent" />
          <span className="text-sm font-semibold text-accent">Coming Soon</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Multi-Branch Management</h1>

        <p className="text-muted-foreground text-base md:text-lg mb-6">
          Manage multiple gym locations from one dashboard. This powerful feature is currently under development and
          will be available soon!
        </p>

        <div className="bg-muted/50 rounded-lg p-6 text-left">
          <h3 className="font-semibold text-foreground mb-3">What's Coming:</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1">✓</span>
              <span>Add and manage multiple gym branches</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1">✓</span>
              <span>Switch between branches seamlessly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1">✓</span>
              <span>Branch-specific member and payment data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent mt-1">✓</span>
              <span>Consolidated reports across all locations</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
