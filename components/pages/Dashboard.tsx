"use client"

import { TrendingUp, Users, DollarSign, UserCheck, Activity, Plus, Bell, FileText, ArrowRight } from "lucide-react"
import { useGymData } from "@/hooks/useGymData"
import { Button } from "@/components/ui/button"
import { AIRecommendations } from "@/components/AIRecommendations"
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts"
import { useMemo } from "react"

export function Dashboard() {
  const { state } = useGymData()
  const { members, payments } = state

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Each member should only be counted in ONE category

  // First, categorize expired members (expiry date is in the past)
  const expiredMembers = members.filter((m) => {
    const expiryDate = new Date(m.expiry_date)
    expiryDate.setHours(0, 0, 0, 0)
    return expiryDate < today
  })

  // Second, categorize expiring members (expiry within 1-7 days from today)
  const expiringMembers = members.filter((m) => {
    const expiryDate = new Date(m.expiry_date)
    expiryDate.setHours(0, 0, 0, 0)
    const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    // Only count as expiring if: 1 to 7 days left (not expired, not too far in future)
    return daysLeft > 0 && daysLeft <= 7
  })

  // Finally, active members (expiry is more than 7 days away)
  const activeMembers = members.filter((m) => {
    const expiryDate = new Date(m.expiry_date)
    expiryDate.setHours(0, 0, 0, 0)
    const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    // Active only if more than 7 days left
    return daysLeft > 7
  })

  const revenueChartData = useMemo(() => {
    const monthlyData: { [key: string]: number } = {}
    const last6Months = []

    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toLocaleDateString("en-US", { month: "short" })
      last6Months.push(monthKey)
      monthlyData[monthKey] = 0
    }

    payments.forEach((payment) => {
      if (payment.status === "done") {
        const date = new Date(payment.payment_date || payment.created_at || "")
        const monthKey = date.toLocaleDateString("en-US", { month: "short" })
        if (monthlyData[monthKey] !== undefined) {
          monthlyData[monthKey] += payment.amount
        }
      }
    })

    return last6Months.map((month) => ({
      month,
      revenue: monthlyData[month] || 0,
    }))
  }, [payments])

  const memberGrowthData = useMemo(() => {
    const monthlyData: { [key: string]: number } = {}
    const last6Months = []

    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toLocaleDateString("en-US", { month: "short" })
      last6Months.push(monthKey)
      monthlyData[monthKey] = 0
    }

    members.forEach((member) => {
      const date = new Date(member.joining_date || member.created_at || "")
      const monthKey = date.toLocaleDateString("en-US", { month: "short" })
      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey] += 1
      }
    })

    let cumulative = 0
    return last6Months.map((month) => {
      cumulative += monthlyData[month] || 0
      return {
        month,
        newMembers: monthlyData[month] || 0,
        totalMembers: cumulative,
      }
    })
  }, [members])

  const quickActions = [
    {
      icon: Plus,
      title: "Add Member",
      description: "Register new gym member",
      onClick: () => {
        // Navigate to members page and open add modal
        const event = new CustomEvent("openAddMember")
        window.dispatchEvent(event)
      },
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: DollarSign,
      title: "Record Payment",
      description: "Process member payments",
      onClick: () => {
        const event = new CustomEvent("openAddPayment")
        window.dispatchEvent(event)
      },
      gradient: "from-accent to-yellow-600",
    },
    {
      icon: Bell,
      title: "Send Reminders",
      description: "Notify expiring members",
      onClick: () => {
        const event = new CustomEvent("navigateToReminders")
        window.dispatchEvent(event)
      },
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: FileText,
      title: "Manage Plans",
      description: "Update membership plans",
      onClick: () => {
        const event = new CustomEvent("navigateToPlans")
        window.dispatchEvent(event)
      },
      gradient: "from-purple-500 to-pink-500",
    },
  ]

  const stats = [
    {
      label: "Total Members",
      value: members.length,
      icon: Users,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    {
      label: "Active Members",
      value: activeMembers.length,
      icon: UserCheck,
      color: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    },
    {
      label: "Expiring Soon",
      value: expiringMembers.length,
      icon: TrendingUp,
      color: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    },
    {
      label: "Monthly Revenue",
      value: `₹${payments
        .filter((p) => {
          const paymentDate = new Date(p.payment_date || p.created_at)
          const currentMonth = new Date().getMonth()
          const currentYear = new Date().getFullYear()
          return (
            p.status === "done" && paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
          )
        })
        .reduce((sum, p) => sum + p.amount, 0)
        .toLocaleString()}`,
      icon: DollarSign,
      color: "bg-accent/10 text-accent dark:text-accent",
    },
  ]

  const recentActivities = [
    ...members.slice(0, 3).map((m) => ({
      id: `member-${m.id}`,
      type: "member",
      icon: Users,
      text: `${m.name} joined`,
      time: m.joining_date || "1970-01-01",
      color: "text-blue-600 dark:text-blue-400",
    })),
    ...payments.slice(0, 3).map((p) => ({
      id: `payment-${p.id}`,
      type: "payment",
      icon: DollarSign,
      text: `Payment of ₹${p.amount} from ${p.member_name || "Unknown"}`,
      time: p.payment_date || p.created_at || "1970-01-01",
      color: "text-green-600 dark:text-green-400",
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 4)

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8 animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Welcome back! Here's your gym's performance overview.
        </p>
      </div>

      {/* Stats Grid - Responsive: 1 col mobile, 2 col tablet, 4 col desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="stat-card animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-xs md:text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`p-2 md:p-3 rounded-lg ${stat.color} flex-shrink-0`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Revenue Growth Chart */}
        <div className="stat-card animate-fade-in overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 dark:from-green-500/10 dark:to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Revenue Growth</h2>
              <div className="p-2 rounded-lg bg-green-500/10 dark:bg-green-500/20">
                <TrendingUp className="text-green-600 dark:text-green-400" size={20} />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => `₹${value}`}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                  itemStyle={{ color: "rgb(34, 197, 94)" }}
                  formatter={(value: any) => [`₹${value}`, "Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="rgb(74, 222, 128)"
                  strokeWidth={3}
                  dot={{
                    fill: "rgb(74, 222, 128)",
                    strokeWidth: 2,
                    r: 5,
                    stroke: "hsl(var(--card))",
                  }}
                  activeDot={{ r: 7, strokeWidth: 2 }}
                  fill="url(#revenueGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member Growth Chart */}
        <div className="stat-card animate-fade-in overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 dark:from-blue-500/10 dark:to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Member Growth</h2>
              <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                <Users className="text-blue-600 dark:text-blue-400" size={20} />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={memberGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="newMembersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(251, 191, 36)" stopOpacity={1} />
                    <stop offset="100%" stopColor="rgb(252, 211, 77)" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="totalMembersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(96, 165, 250)" stopOpacity={1} />
                    <stop offset="100%" stopColor="rgb(147, 197, 253)" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border))" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
                  cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="rect" iconSize={12} />
                <Bar
                  dataKey="newMembers"
                  fill="url(#newMembersGradient)"
                  name="New Members"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
                <Bar
                  dataKey="totalMembers"
                  fill="url(#totalMembersGradient)"
                  name="Total Members"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions Section - Now below stats */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon
            return (
              <button
                key={idx}
                onClick={action.onClick}
                className="group relative overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 text-left transition-all hover:scale-[1.02] hover:shadow-lg hover:border-accent/50 animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="relative z-10">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${action.gradient} mb-4`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground mb-1">{action.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{action.description}</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )
          })}
        </div>
      </div>

      {/* AI Recommendations Section */}
      <div className="mb-6 md:mb-8">
        <AIRecommendations />
      </div>

      {/* Charts Section - Responsive: stacked mobile, split on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2 stat-card animate-fade-in">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-3">
              <Activity size={20} className="text-accent" />
              <h2 className="text-lg md:text-lg font-bold text-foreground">Recent Activity</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const event = new CustomEvent("navigateToActivity")
                window.dispatchEvent(event)
              }}
              className="text-xs md:text-sm"
            >
              View All
              <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => {
                const Icon = activity.icon
                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg bg-muted ${activity.color}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{activity.text}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">No recent activity</div>
            )}
          </div>
        </div>

        {/* Membership Distribution */}
        <div className="stat-card animate-fade-in">
          <h2 className="text-lg md:text-lg font-bold text-foreground mb-4 md:mb-6">Membership Status</h2>
          <div className="space-y-4">
            {[
              {
                label: "Active",
                count: activeMembers.length,
                color: "bg-green-500",
              },
              {
                label: "Expiring",
                count: expiringMembers.length,
                color: "bg-orange-500",
              },
              {
                label: "Expired",
                count: expiredMembers.length,
                color: "bg-red-500",
              },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-sm font-bold text-foreground">{item.count}</p>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color}`}
                    style={{ width: `${(item.count / (members.length || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
