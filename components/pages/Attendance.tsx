"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCode, UserCheck, Search, Download, Camera, Users, TrendingUp } from "lucide-react"
import { useGym } from "@/context/GymContext"
import { toast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { Html5Qrcode } from "html5-qrcode"

export function Attendance() {
  const { state } = useGym()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [isScanning, setIsScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [manualMemberId, setManualMemberId] = useState("")

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const supabase = createClient()

  // Filter today's attendance
  const todayAttendance = (state.attendance || []).filter(
    (a) => format(new Date(a.check_in), "yyyy-MM-dd") === selectedDate,
  )

  // Calculate stats
  const totalMembers = state.members.length
  const presentToday = todayAttendance.length
  const attendanceRate = totalMembers > 0 ? Math.round((presentToday / totalMembers) * 100) : 0

  // Initialize QR Scanner
  useEffect(() => {
    if (isScanning && !scannerRef.current) {
      const html5QrCode = new Html5Qrcode("qr-scanner")
      scannerRef.current = html5QrCode

      html5QrCode
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          handleQrCodeScan,
          undefined,
        )
        .catch((err) => {
          console.error("Scanner error:", err)
          toast({
            title: "Camera Error",
            description: "Could not access camera. Please check permissions.",
            variant: "destructive",
          })
          setIsScanning(false)
        })
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error)
        scannerRef.current = null
      }
    }
  }, [isScanning])

  const handleQrCodeScan = async (decodedText: string) => {
    // QR format: MDQR_<uuid>
    if (!decodedText.startsWith("MDQR_")) {
      toast({
        title: "Invalid QR Code",
        description: "This is not a valid MuscleDesk member QR code.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.rpc("check_in_by_qr", {
        p_user_id: state.user?.id,
        p_qr_token: decodedText,
        p_branch_id: state.currentBranch?.id,
        p_device_id: navigator.userAgent,
      })

      if (error) throw error

      const result = data as { success: boolean; error?: string; member?: any }

      if (!result.success) {
        toast({
          title: "Check-In Failed",
          description: result.error || "Could not check in member.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Check-In Successful",
        description: `${result.member?.name} has been marked present.`,
      })

      // Stop scanning after successful scan
      setIsScanning(false)
      if (scannerRef.current) {
        scannerRef.current.stop()
        scannerRef.current = null
      }
    } catch (error: any) {
      console.error("QR scan error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to process QR code.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const recordAttendance = async (memberId: string, memberName: string, source = "manual") => {
    setLoading(true)
    try {
      const { error } = await supabase.from("attendance").insert({
        user_id: state.user?.id,
        member_id: memberId,
        member_name: memberName,
        check_in: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "Check-In Successful",
        description: `${memberName} has been marked present.`,
      })

      // Refresh will happen via realtime subscription
    } catch (error: any) {
      console.error("Attendance error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to record attendance.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleManualCheckIn = async () => {
    if (!manualMemberId) return

    const member = state.members.find((m) => m.id === manualMemberId)
    if (!member) return

    // Check if already checked in
    const alreadyCheckedIn = todayAttendance.some((a) => a.member_id === member.id)

    if (alreadyCheckedIn) {
      toast({
        title: "Already Checked In",
        description: `${member.name} has already checked in today.`,
      })
      return
    }

    await recordAttendance(member.id, member.name, "manual")
    setManualMemberId("")
  }

  const exportAttendance = () => {
    const csv = [
      ["Member Name", "Phone", "Check-In Time", "Status"],
      ...todayAttendance.map((a) => {
        const member = state.members.find((m) => m.id === a.member_id)
        return [
          a.member_name,
          member?.phone || "-",
          format(new Date(a.check_in), "hh:mm a"),
          member?.status || "active",
        ]
      }),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `attendance-${selectedDate}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredMembers = state.members.filter(
    (member) => member.name.toLowerCase().includes(searchQuery.toLowerCase()) || member.phone.includes(searchQuery),
  )

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{presentToday}</div>
            <p className="text-xs text-muted-foreground">Out of {totalMembers} members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              {selectedDate === format(new Date(), "yyyy-MM-dd")
                ? "Today"
                : format(new Date(selectedDate), "MMM dd, yyyy")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground">Active memberships</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="scan" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scan">
            <Camera className="mr-2 h-4 w-4" />
            QR Scanner
          </TabsTrigger>
          <TabsTrigger value="list">
            <Users className="mr-2 h-4 w-4" />
            Today's Attendance
          </TabsTrigger>
          <TabsTrigger value="manual">
            <UserCheck className="mr-2 h-4 w-4" />
            Manual Check-In
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scan">
          <Card>
            <CardHeader>
              <CardTitle>Scan Member QR Code</CardTitle>
              <CardDescription>Point camera at member's QR code to mark attendance</CardDescription>
            </CardHeader>
            <CardContent>
              {!isScanning ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <QrCode className="h-24 w-24 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground text-center">
                    Click the button below to start scanning QR codes
                  </p>
                  <Button onClick={() => setIsScanning(true)} size="lg">
                    <Camera className="mr-2 h-5 w-5" />
                    Start Camera
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div id="qr-scanner" className="w-full max-w-md mx-auto rounded-lg overflow-hidden" />
                  <div className="flex justify-center">
                    <Button
                      onClick={() => {
                        setIsScanning(false)
                        if (scannerRef.current) {
                          scannerRef.current.stop()
                          scannerRef.current = null
                        }
                      }}
                      variant="outline"
                    >
                      Stop Camera
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Today's Attendance</CardTitle>
                <CardDescription>{presentToday} members present</CardDescription>
              </div>
              <Button onClick={exportAttendance} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {todayAttendance.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No attendance records for today</p>
                ) : (
                  todayAttendance.map((record) => {
                    const member = state.members.find((m) => m.id === record.member_id)
                    return (
                      <div key={record.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <UserCheck className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{record.member_name}</p>
                            <p className="text-sm text-muted-foreground">{member?.phone || "-"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(record.check_in), "hh:mm a")}
                          </p>
                          <Badge variant={member?.status === "active" ? "default" : "secondary"}>
                            {member?.status || "active"}
                          </Badge>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Manual Check-In</CardTitle>
              <CardDescription>Search and check-in members without QR code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredMembers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No members found</p>
                ) : (
                  filteredMembers.map((member) => {
                    const isCheckedIn = todayAttendance.some((a) => a.member_id === member.id)
                    const isExpired = member.status === "expired"

                    return (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.phone}</p>
                          {isExpired && (
                            <Badge variant="destructive" className="mt-1">
                              Expired
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => recordAttendance(member.id, member.name, "manual")}
                          disabled={loading || isExpired || isCheckedIn}
                        >
                          {isCheckedIn ? (
                            <>
                              <UserCheck className="mr-1 h-4 w-4" />
                              Checked In
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-1 h-4 w-4" />
                              Check In
                            </>
                          )}
                        </Button>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
