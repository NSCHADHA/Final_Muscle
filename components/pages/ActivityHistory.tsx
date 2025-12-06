"use client"

import { Activity, Users, DollarSign } from "lucide-react"
import { useGymData } from "@/hooks/useGymData"
import { useMemo } from "react"

export function ActivityHistory() {
  const { state } = useGymData()
  const { members, payments } = state

  // Generate activities from members and payments with proper timestamps
  const allActivities = useMemo(() => {
    const activities = [
      ...members.map((m) => ({
        id: `member-${m.id}`,
        type: "member_added" as const,
        icon: Users,
        description: `${m.name} joined`,
        time: m.joining_date || m.created_at || new Date().toISOString(),
        color: "text-blue-600",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
      })),
      ...payments.map((p) => ({
        id: `payment-${p.id}`,
        type: "payment_received" as const,
        icon: DollarSign,
        description: `Payment of ₹${p.amount.toLocaleString()} from ${p.member_name || "Unknown"}`,
        time: p.payment_date || p.created_at || new Date().toISOString(),
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-900/20",
      })),
    ]

    // Sort by time descending (newest first)
    return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  }, [members, payments])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              <Activity className="text-accent" size={32} />
              Activity History
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-2">
              Complete timeline of all activities in your gym
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Activities</p>
              <p className="text-2xl font-bold text-foreground">{allActivities.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20">
              <Activity size={20} />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Members Joined</p>
              <p className="text-2xl font-bold text-foreground">{members.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20">
              <Users size={20} />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Payments Received</p>
              <p className="text-2xl font-bold text-foreground">{payments.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20">
              <DollarSign size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="stat-card">
        <div className="space-y-3">
          {allActivities.length > 0 ? (
            allActivities.map((activity, idx) => {
              const Icon = activity.icon
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${idx * 20}ms` }}
                >
                  <div className={`p-2 rounded-lg ${activity.bgColor} flex-shrink-0`}>
                    <Icon size={20} className={activity.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(activity.time)}</p>
                  </div>
                  <div className="text-xs text-muted-foreground flex-shrink-0">
                    {new Date(activity.time).toLocaleDateString()}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-12">
              <Activity size={48} className="text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No activities yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Activities will appear here as you add members and payments
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
