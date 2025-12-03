"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { toast } from "sonner"
import useSWR, { mutate } from "swr"

export interface UserData {
  id: string
  ownerName: string
  email: string
  phone: string
  gymName: string
  role: "owner" | "manager" | "trainer" | "front_desk"
}

export interface Member {
  id: string
  name: string
  email: string
  phone: string
  plan_duration: number
  joining_date: string
  expiry_date: string
  status: "active" | "expiring" | "expired"
  qr_token?: string
  branch_id?: string
  user_id?: string
  created_at?: string
  updated_at?: string
}

export interface Payment {
  id: string
  member_id: string
  member_name?: string
  amount: number
  payment_date?: string
  payment_method: string
  status?: "done" | "pending"
  plan_name?: string
  branch_id?: string
  user_id?: string
  created_at?: string
}

export interface Plan {
  id: string
  name: string
  price: number
  duration: number
  features: string[]
  user_id?: string
  branch_id?: string
  created_at?: string
  updated_at?: string
}

export interface ActivityLog {
  id: string
  activity_type: string
  description: string
  created_at: string
  user_id?: string
  branch_id?: string
  metadata?: any
}

export interface Branch {
  id: string
  owner_id: string
  name: string
  address: string
  phone: string
  is_main: boolean
  created_at: string
  updated_at?: string
}

export interface StaffMember {
  id: string
  user_id: string
  branch_id: string
  name: string
  email: string
  phone: string
  role: "owner" | "manager" | "trainer" | "front_desk"
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface Reminder {
  id: string
  member_name: string
  daysLeft: number
  plan: string
  status: string
  phone: string
}

export interface Attendance {
  id: string
  user_id: string
  member_id: string
  member_name: string
  check_in: string
  source?: string
  device_id?: string
  branch_id?: string
}

const calculateMemberStatus = (expiryDate: string): "active" | "expiring" | "expired" => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysLeft < 0) return "expired"
  if (daysLeft <= 7) return "expiring"
  return "active"
}

const calculateReminders = (members: Member[]): Reminder[] => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return members
    .filter((member) => {
      const expiryDate = new Date(member.expiry_date)
      expiryDate.setHours(0, 0, 0, 0)
      const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysLeft > 0 && daysLeft <= 7
    })
    .map((member) => {
      const expiryDate = new Date(member.expiry_date)
      expiryDate.setHours(0, 0, 0, 0)
      const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return {
        id: member.id,
        member_name: member.name,
        daysLeft,
        plan: `${member.plan_duration} month${member.plan_duration > 1 ? "s" : ""}`,
        status: "pending",
        phone: member.phone,
      }
    })
    .sort((a, b) => a.daysLeft - b.daysLeft)
}

export function useGymData() {
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const channelRef = useRef<any>(null)

  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setAuthUser(session.user)
      }
      setLoading(false)
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetcher = useCallback(
    async (userId: string) => {
      const [profileResult, branchesResult, membersResult, paymentsResult, plansResult, staffResult, attendanceResult] =
        await Promise.all([
          supabase.from("users").select("*").eq("id", userId).single(),
          supabase.from("branches").select("*").eq("owner_id", userId).order("created_at", { ascending: false }),
          supabase.from("members").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
          supabase.from("payments").select("*").eq("user_id", userId).order("payment_date", { ascending: false }),
          supabase.from("plans").select("*").eq("user_id", userId).order("duration", { ascending: true }),
          supabase.from("staff_members").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
          supabase.from("attendance").select("*").eq("user_id", userId).order("check_in", { ascending: false }),
        ])

      const profile = profileResult.data
      const branches = branchesResult.data || []
      const members = membersResult.data || []
      const payments = paymentsResult.data || []
      const plans = plansResult.data || []
      const staff = staffResult.data || []
      const attendance = attendanceResult.data || []

      const membersWithStatus = (members || []).map((member: Member) => ({
        ...member,
        status: calculateMemberStatus(member.expiry_date),
      }))

      const paymentsWithStatus = (payments || []).map((payment: Payment) => ({
        ...payment,
        status: payment.status || "done",
      }))

      const currentBranch = branches?.[0] || null
      const reminders = calculateReminders(membersWithStatus)

      const userData: UserData = {
        id: userId,
        ownerName: profile?.name || authUser?.user_metadata?.name || authUser?.email?.split("@")[0] || "User",
        email: profile?.email || authUser?.email || "",
        phone: profile?.phone || "",
        gymName: profile?.gym_name || "My Gym",
        role: profile?.role || "owner",
      }

      return {
        user: userData,
        branches: branches || [],
        currentBranch,
        staff: staff || [],
        members: membersWithStatus,
        payments: paymentsWithStatus,
        plans: plans || [],
        attendance: attendance || [],
        activityLog: [],
        reminders,
      }
    },
    [authUser],
  )

  useEffect(() => {
    if (!authUser?.id || channelRef.current) return

    const channel = supabase
      .channel(`user-${authUser.id}`, {
        config: {
          broadcast: { self: true },
          presence: { key: authUser.id },
        },
      })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "members", filter: `user_id=eq.${authUser.id}` },
        () => {
          mutate(`gym-data-${authUser.id}`)
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments", filter: `user_id=eq.${authUser.id}` },
        () => {
          mutate(`gym-data-${authUser.id}`)
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "plans", filter: `user_id=eq.${authUser.id}` },
        () => {
          mutate(`gym-data-${authUser.id}`)
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendance", filter: `user_id=eq.${authUser.id}` },
        () => {
          mutate(`gym-data-${authUser.id}`)
        },
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "users", filter: `id=eq.${authUser.id}` }, () => {
        mutate(`gym-data-${authUser.id}`)
      })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "staff_members", filter: `user_id=eq.${authUser.id}` },
        () => {
          mutate(`gym-data-${authUser.id}`)
        },
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
    }
  }, [authUser?.id])

  const { data, error, isLoading } = useSWR(
    authUser?.id ? `gym-data-${authUser.id}` : null,
    () => fetcher(authUser!.id),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      keepPreviousData: true,
      refreshInterval: 0,
      revalidateIfStale: true,
    },
  )

  const state = {
    authUser,
    user: data?.user || null,
    branches: data?.branches || [],
    currentBranch: data?.currentBranch || null,
    staff: data?.staff || [],
    members: data?.members || [],
    payments: data?.payments || [],
    plans: data?.plans || [],
    attendance: data?.attendance || [],
    activityLog: data?.activityLog || [],
    reminders: data?.reminders || [],
    loading: loading || isLoading,
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setAuthUser(null)
    if (authUser?.id) {
      mutate(`gym-data-${authUser.id}`, null, false)
    }
  }

  const dispatch = async (action: any) => {
    try {
      switch (action.type) {
        case "ADD_MEMBER": {
          if (!authUser?.id) {
            toast.error("Please log in first.")
            return
          }

          const memberStatus = calculateMemberStatus(action.payload.expiryDate)

          const qrToken = `${authUser.id}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`

          const optimisticMember: Member = {
            id: `temp-${Date.now()}`,
            user_id: authUser.id,
            name: action.payload.name,
            email: action.payload.email,
            phone: action.payload.phone,
            plan_duration: action.payload.planDuration,
            joining_date: action.payload.joinDate,
            expiry_date: action.payload.expiryDate,
            status: memberStatus,
            qr_token: qrToken,
          }

          const optimisticMembers = [optimisticMember, ...(data?.members || [])]
          mutate(
            `gym-data-${authUser.id}`,
            {
              ...data,
              members: optimisticMembers,
              reminders: calculateReminders(optimisticMembers),
            },
            false,
          )

          const { data: newMember, error } = await supabase
            .from("members")
            .insert({
              user_id: authUser.id,
              name: action.payload.name,
              email: action.payload.email,
              phone: action.payload.phone,
              joining_date: action.payload.joinDate,
              plan_duration: action.payload.planDuration,
              expiry_date: action.payload.expiryDate,
              status: memberStatus,
              qr_token: qrToken,
            })
            .select()
            .single()

          if (error) throw error

          const memberWithStatus = { ...newMember, status: memberStatus }
          const finalMembers = [memberWithStatus, ...(data?.members || []).filter((m) => m.id !== optimisticMember.id)]
          mutate(
            `gym-data-${authUser.id}`,
            {
              ...data,
              members: finalMembers,
              reminders: calculateReminders(finalMembers),
            },
            false,
          )

          await supabase.from("activity_log").insert({
            user_id: authUser.id,
            activity_type: "member_added",
            description: `Member "${action.payload.name}" added`,
          })

          toast.success("Member added successfully!")
          break
        }

        case "UPDATE_MEMBER": {
          if (!authUser?.id) return

          const memberStatus = calculateMemberStatus(action.payload.expiryDate)

          const optimisticMembers = (data?.members || []).map((m) =>
            m.id === action.payload.id ? { ...m, ...action.payload, status: memberStatus } : m,
          )

          mutate(
            `gym-data-${authUser.id}`,
            {
              ...data,
              members: optimisticMembers,
              reminders: calculateReminders(optimisticMembers),
            },
            false,
          )

          const { data: updatedMember, error } = await supabase
            .from("members")
            .update({
              name: action.payload.name,
              email: action.payload.email,
              phone: action.payload.phone,
              joining_date: action.payload.joinDate,
              plan_duration: action.payload.planDuration,
              expiry_date: action.payload.expiryDate,
              status: memberStatus,
              updated_at: new Date().toISOString(),
            })
            .eq("id", action.payload.id)
            .select()
            .single()

          if (error) throw error

          const memberWithStatus = { ...updatedMember, status: memberStatus }
          const finalMembers = (data?.members || []).map((m) => (m.id === action.payload.id ? memberWithStatus : m))

          mutate(
            `gym-data-${authUser.id}`,
            {
              ...data,
              members: finalMembers,
              reminders: calculateReminders(finalMembers),
            },
            false,
          )

          await supabase.from("activity_log").insert({
            user_id: authUser.id,
            activity_type: "member_updated",
            description: `Member "${action.payload.name}" updated`,
          })

          toast.success("Member updated successfully!")
          break
        }

        case "DELETE_MEMBER": {
          const optimisticMembers = (data?.members || []).filter((m) => m.id !== action.payload)

          mutate(
            `gym-data-${authUser.id}`,
            {
              ...data,
              members: optimisticMembers,
              reminders: calculateReminders(optimisticMembers),
            },
            false,
          )

          const member = (data?.members || []).find((m) => m.id === action.payload)
          const { error } = await supabase.from("members").delete().eq("id", action.payload)

          if (error) throw error

          if (member) {
            await supabase.from("activity_log").insert({
              user_id: authUser.id,
              activity_type: "member_deleted",
              description: `Member "${member.name}" deleted`,
            })
          }

          toast.success("Member deleted successfully!")
          break
        }

        case "ADD_PAYMENT": {
          if (!authUser?.id) {
            toast.error("Please log in first.")
            return
          }

          const member = (data?.members || []).find((m) => m.name === action.payload.memberName)
          if (!member) {
            toast.error("Member not found")
            return
          }

          const optimisticPayment: Payment = {
            id: `temp-${Date.now()}`,
            user_id: authUser.id,
            member_id: member.id,
            member_name: action.payload.memberName,
            amount: action.payload.amount,
            payment_method: action.payload.mode,
            payment_date: action.payload.paymentDate || new Date().toISOString().split("T")[0],
            status: "done",
            plan_name: action.payload.planName,
          }

          mutate(
            `gym-data-${authUser.id}`,
            {
              ...data,
              payments: [optimisticPayment, ...(data?.payments || [])],
            },
            false,
          )

          const { data: newPayment, error } = await supabase
            .from("payments")
            .insert({
              user_id: authUser.id,
              member_id: member.id,
              member_name: action.payload.memberName,
              amount: action.payload.amount,
              payment_method: action.payload.mode,
              payment_date: action.payload.paymentDate || new Date().toISOString().split("T")[0],
              status: "done",
            })
            .select()
            .single()

          if (error) throw error

          mutate(
            `gym-data-${authUser.id}`,
            {
              ...data,
              payments: [newPayment, ...(data?.payments || []).filter((p) => p.id !== optimisticPayment.id)],
            },
            false,
          )

          await supabase.from("activity_log").insert({
            user_id: authUser.id,
            activity_type: "payment_added",
            description: `Payment of ₹${action.payload.amount} added for ${action.payload.memberName}`,
          })

          toast.success("Payment added successfully!")
          break
        }

        case "UPDATE_PAYMENT": {
          if (!authUser?.id) return

          const optimisticPayments = (data?.payments || []).map((p) =>
            p.id === action.payload.id ? { ...p, ...action.payload } : p,
          )

          mutate(
            `gym-data-${authUser.id}`,
            {
              ...data,
              payments: optimisticPayments,
            },
            false,
          )

          const { data: updatedPayment, error } = await supabase
            .from("payments")
            .update({
              member_name: action.payload.memberName,
              amount: action.payload.amount,
              payment_method: action.payload.mode,
              payment_date: action.payload.paymentDate || new Date().toISOString().split("T")[0],
              status: action.payload.status,
              plan_name: action.payload.planName,
              updated_at: new Date().toISOString(),
            })
            .eq("id", action.payload.id)
            .eq("user_id", authUser.id)
            .select()
            .single()

          if (error) throw error

          mutate(
            `gym-data-${authUser.id}`,
            {
              ...data,
              payments: (data?.payments || []).map((p) => (p.id === action.payload.id ? updatedPayment : p)),
            },
            false,
          )

          await supabase.from("activity_log").insert({
            user_id: authUser.id,
            activity_type: "payment_updated",
            description: `Payment for ${action.payload.memberName} updated`,
          })

          toast.success("Payment updated successfully!")
          break
        }

        case "DELETE_PAYMENT": {
          if (!authUser?.id) return

          mutate(
            `gym-data-${authUser.id}`,
            {
              ...data,
              payments: (data?.payments || []).filter((p) => p.id !== action.payload),
            },
            false,
          )

          const payment = (data?.payments || []).find((p) => p.id === action.payload)
          const { error } = await supabase.from("payments").delete().eq("id", action.payload).eq("user_id", authUser.id)

          if (error) throw error

          if (payment) {
            await supabase.from("activity_log").insert({
              user_id: authUser.id,
              activity_type: "payment_deleted",
              description: `Payment for ${payment.member_name} deleted`,
            })
          }

          toast.success("Payment deleted successfully!")
          break
        }

        case "ADD_PLAN": {
          if (!authUser?.id) {
            toast.error("Please log in first.")
            return
          }

          const optimisticPlan: Plan = {
            id: `temp-${Date.now()}`,
            user_id: authUser.id,
            name: action.payload.name,
            duration: action.payload.duration,
            price: action.payload.price,
            features: action.payload.features || [],
          }

          mutate(
            `gym-data-${authUser.id}`,
            {
              ...data,
              plans: [optimisticPlan, ...(data?.plans || [])],
            },
            false,
          )

          const { data: newPlan, error } = await supabase
            .from("plans")
            .insert({
              user_id: authUser.id,
              name: action.payload.name,
              price: action.payload.price,
              duration: action.payload.duration,
              features: action.payload.features || [],
            })
            .select()
            .single()

          if (error) throw error

          mutate(
            `gym-data-${authUser.id}`,
            {
              ...data,
              plans: [newPlan, ...(data?.plans || []).filter((p) => p.id !== optimisticPlan.id)],
            },
            false,
          )

          await supabase.from("activity_log").insert({
            user_id: authUser.id,
            activity_type: "plan_added",
            description: `Plan "${action.payload.name}" added`,
          })

          toast.success("Plan added successfully!")
          break
        }

        case "UPDATE_PLAN": {
          if (!authUser?.id) return

          const optimisticPlans = (data?.plans || []).map((p) =>
            p.id === action.payload.id ? { ...p, ...action.payload } : p,
          )

          mutate(
            `gym-data-${authUser.id}`,
            {
              ...data,
              plans: optimisticPlans,
            },
            false,
          )

          const { data: updatedPlan, error } = await supabase
            .from("plans")
            .update({
              name: action.payload.name,
              price: action.payload.price,
              duration: action.payload.duration,
              features: action.payload.features || [],
              updated_at: new Date().toISOString(),
            })
            .eq("id", action.payload.id)
            .eq("user_id", authUser.id)
            .select()
            .single()

          if (error) throw error

          mutate(
            `gym-data-${authUser.id}`,
            {
              ...data,
              plans: (data?.plans || []).map((p) => (p.id === action.payload.id ? updatedPlan : p)),
            },
            false,
          )

          await supabase.from("activity_log").insert({
            user_id: authUser.id,
            activity_type: "plan_updated",
            description: `Plan "${action.payload.name}" updated`,
          })

          toast.success("Plan updated successfully!")
          break
        }

        case "DELETE_PLAN": {
          if (!authUser?.id) return

          mutate(
            `gym-data-${authUser.id}`,
            {
              ...data,
              plans: (data?.plans || []).filter((p) => p.id !== action.payload),
            },
            false,
          )

          const plan = (data?.plans || []).find((p) => p.id === action.payload)
          const { error } = await supabase.from("plans").delete().eq("id", action.payload).eq("user_id", authUser.id)

          if (error) throw error

          if (plan) {
            await supabase.from("activity_log").insert({
              user_id: authUser.id,
              activity_type: "plan_deleted",
              description: `Plan "${plan.name}" deleted`,
            })
          }

          toast.success("Plan deleted successfully!")
          break
        }

        case "SWITCH_BRANCH": {
          // No-op for single gym system
          break
        }

        case "UPDATE_PROFILE": {
          if (!authUser?.id) return

          try {
            const { error } = await supabase
              .from("users")
              .update({
                name: action.payload.name,
                email: action.payload.email,
                gym_name: action.payload.gymName,
                updated_at: new Date().toISOString(),
              })
              .eq("id", authUser.id)

            if (error) throw error

            mutate(`gym-data-${authUser.id}`)

            toast.success("Profile updated successfully!")
          } catch (error: any) {
            toast.error(`Failed to update profile: ${error.message}`)
          }
          break
        }

        default:
          break
      }
    } catch (error: any) {
      console.error("Dispatch error:", error)
      toast.error(`Error: ${error.message}`)
      if (authUser?.id) {
        mutate(`gym-data-${authUser.id}`)
      }
    }
  }

  return { state, dispatch, logout }
}
