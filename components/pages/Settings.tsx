"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, User, Bell, Shield, Download, Smartphone } from "lucide-react"
import { useGym } from "@/context/GymContext"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { mutate } from "swr"
import * as XLSX from "xlsx"

export function Settings() {
  const { state } = useGym()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState("profile")
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  const [gymName, setGymName] = useState("")
  const [ownerName, setOwnerName] = useState("")
  const [email, setEmail] = useState("")

  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [membershipExpiry, setMembershipExpiry] = useState(true)
  const [paymentReminders, setPaymentReminders] = useState(true)

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    if (state.user) {
      setGymName(state.user.gym_name || "")
      setOwnerName(state.user.name || "")
      setEmail(state.user.email || "")
    }

    const savedNotifications = localStorage.getItem("notificationSettings")
    if (savedNotifications) {
      const settings = JSON.parse(savedNotifications)
      setEmailNotifications(settings.email ?? true)
      setPushNotifications(settings.push ?? true)
      setMembershipExpiry(settings.membershipExpiry ?? true)
      setPaymentReminders(settings.paymentReminders ?? true)
    }

    const handler = (e: any) => {
      e.preventDefault()
      console.log("[v0] PWA install prompt available")
      setDeferredPrompt(e)
      setShowInstallButton(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    if (window.matchMedia("(display-mode: standalone)").matches) {
      console.log("[v0] App is already installed")
      setIsInstalled(true)
      setShowInstallButton(false)
    }

    window.addEventListener("appinstalled", () => {
      console.log("[v0] App was installed")
      setIsInstalled(true)
      setShowInstallButton(false)
    })

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [state.user])

  const handleSaveProfile = async () => {
    if (!state.authUser?.id) {
      toast.error("Please log in first")
      return
    }

    try {
      const { error } = await supabase
        .from("users")
        .update({
          name: ownerName,
          email: email,
          gym_name: gymName,
        })
        .eq("id", state.authUser.id)

      if (error) throw error

      if (state.authUser?.id) {
        mutate(`gym-data-${state.authUser.id}`)
      }

      toast.success("Profile updated successfully!")
    } catch (error: any) {
      toast.error(`Failed to update profile: ${error.message}`)
    }
  }

  const handleSaveNotifications = () => {
    const settings = {
      email: emailNotifications,
      push: pushNotifications,
      membershipExpiry,
      paymentReminders,
    }
    localStorage.setItem("notificationSettings", JSON.stringify(settings))
    toast.success("Notification settings saved!")
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match!")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      toast.success("Password changed successfully!")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      toast.error(`Failed to change password: ${error.message}`)
    }
  }

  const handleClearCache = () => {
    localStorage.clear()
    sessionStorage.clear()
    toast.success("Cache cleared! Please refresh the page.")
    setTimeout(() => window.location.reload(), 1500)
  }

  const handleExportData = () => {
    const dataToExport = {
      members: state.members,
      payments: state.payments,
      plans: state.plans,
      branches: state.branches,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `muscledesk-data-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Data exported successfully!")
  }

  const handleExportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new()

      const membersData = state.members.map((m) => ({
        Name: m.name,
        Email: m.email,
        Phone: m.phone,
        "Joining Date": m.joining_date,
        "Expiry Date": m.expiry_date,
        Status: m.status,
        "Plan Duration": m.plan_duration,
      }))
      const membersSheet = XLSX.utils.json_to_sheet(membersData)
      XLSX.utils.book_append_sheet(wb, membersSheet, "Members")

      const paymentsData = state.payments.map((p) => ({
        Member: p.member_name,
        Amount: p.amount,
        "Payment Method": p.payment_method,
        "Payment Date": p.payment_date,
        Status: p.status,
        Plan: p.plan_name,
      }))
      const paymentsSheet = XLSX.utils.json_to_sheet(paymentsData)
      XLSX.utils.book_append_sheet(wb, paymentsSheet, "Payments")

      const plansData = state.plans.map((p) => ({
        Name: p.name,
        Duration: p.duration,
        Price: p.price,
        Features: p.features?.join(", ") || "",
      }))
      const plansSheet = XLSX.utils.json_to_sheet(plansData)
      XLSX.utils.book_append_sheet(wb, plansSheet, "Plans")

      const fileName = `muscledesk-data-${new Date().toISOString().split("T")[0]}.xlsx`
      XLSX.writeFile(wb, fileName)

      toast.success("Data exported to Excel successfully!")
    } catch (error: any) {
      toast.error(`Failed to export: ${error.message}`)
    }
  }

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      console.log("[v0] No deferred prompt available")
      toast.error("Install option not available yet. Try using your browser's menu to add to home screen.")
      return
    }

    console.log("[v0] Showing install prompt")
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    console.log("[v0] Install outcome:", outcome)

    if (outcome === "accepted") {
      toast.success("Installing MuscleDesk... Check your home screen!")
      setShowInstallButton(false)
      setIsInstalled(true)
    } else {
      toast("Installation cancelled. You can install later from browser menu.")
    }

    setDeferredPrompt(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your gym profile and application preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="gym" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Gym</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="pwa" className="gap-2">
            <Smartphone className="h-4 w-4" />
            <span className="hidden sm:inline">Install App</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <Input
                    id="ownerName"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <Button onClick={handleSaveProfile}>Save Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gym" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gym Information</CardTitle>
              <CardDescription>Update your gym details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gymName">Gym Name</Label>
                <Input
                  id="gymName"
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  placeholder="Enter gym name"
                />
              </div>
              <Button onClick={handleSaveProfile}>Save Gym Info</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Membership Expiry Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified about expiring memberships</p>
                </div>
                <Switch checked={membershipExpiry} onCheckedChange={setMembershipExpiry} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Payment Reminders</Label>
                  <p className="text-sm text-muted-foreground">Receive reminders for pending payments</p>
                </div>
                <Switch checked={paymentReminders} onCheckedChange={setPaymentReminders} />
              </div>
              <Button onClick={handleSaveNotifications}>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <Button onClick={handleChangePassword}>Change Password</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clear Cache</CardTitle>
              <CardDescription>Remove stored data and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleClearCache} variant="destructive">
                Clear All Cache
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pwa" className="space-y-4">
          <Card className={isInstalled ? "border-green-500/50 bg-green-500/5" : "border-primary/50"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                {isInstalled ? "App Installed Successfully" : "Install MuscleDesk App"}
              </CardTitle>
              <CardDescription>
                {isInstalled
                  ? "MuscleDesk is installed and ready to use offline"
                  : "Get the best experience with our Progressive Web App"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isInstalled ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                      <Smartphone className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-600 dark:text-green-400">Successfully Installed!</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        MuscleDesk is now available on your home screen
                      </p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <h4 className="font-medium mb-3">What you can do now:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400">✓</span>
                        <span>Launch MuscleDesk directly from your home screen or app drawer</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400">✓</span>
                        <span>Access all features offline when you don't have internet</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400">✓</span>
                        <span>Experience faster load times and smoother performance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400">✓</span>
                        <span>Use less mobile data with cached resources</span>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : showInstallButton ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="text-primary">🚀</span>
                      Why Install MuscleDesk?
                    </h4>
                    <ul className="space-y-2.5 text-sm">
                      <li className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">1</span>
                        </div>
                        <div>
                          <p className="font-medium">Quick Access</p>
                          <p className="text-muted-foreground">Launch from your home screen like any other app</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">2</span>
                        </div>
                        <div>
                          <p className="font-medium">Works Offline</p>
                          <p className="text-muted-foreground">Access your data even without internet connection</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">3</span>
                        </div>
                        <div>
                          <p className="font-medium">Faster Performance</p>
                          <p className="text-muted-foreground">Loads instantly with cached resources</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">4</span>
                        </div>
                        <div>
                          <p className="font-medium">Save Data</p>
                          <p className="text-muted-foreground">Uses less mobile data with smart caching</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <Button onClick={handleInstallPWA} className="w-full" size="lg">
                    <Download className="mr-2 h-5 w-5" />
                    Install MuscleDesk Now
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <h4 className="font-medium mb-3">Installation Instructions</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      The automatic install button isn't available right now, but you can still install MuscleDesk
                      manually:
                    </p>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 rounded-lg bg-background border">
                        <p className="font-medium mb-1">Chrome / Edge (Desktop & Android)</p>
                        <p className="text-muted-foreground">
                          Click the menu (⋮) → "Install MuscleDesk" or look for the install icon (⊕) in the address bar
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-background border">
                        <p className="font-medium mb-1">Safari (iOS / Mac)</p>
                        <p className="text-muted-foreground">
                          Tap the Share button → "Add to Home Screen" or "Add to Dock"
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-background border">
                        <p className="font-medium mb-1">Firefox (Desktop & Android)</p>
                        <p className="text-muted-foreground">Tap the menu → "Install" or "Add to Home Screen"</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm text-muted-foreground text-center">
                      💡 Tip: After installing, you'll find MuscleDesk on your home screen or in your apps list
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>Download your gym data in various formats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Members:</span>
                  <span className="font-medium">{state.members.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Payments:</span>
                  <span className="font-medium">{state.payments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Plans:</span>
                  <span className="font-medium">{state.plans.length}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Button onClick={handleExportToExcel} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export to Excel (.xlsx)
                </Button>
                <Button onClick={handleExportData} variant="outline" className="w-full bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Export to JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
