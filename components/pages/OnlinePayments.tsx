"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LinkIcon, ExternalLink, Copy } from "lucide-react"
import { useGym } from "@/context/GymContext"
import { toast } from "@/hooks/use-toast"

interface PaymentLink {
  id: string
  url: string
  amount: number
  member_name: string
  plan_name: string
  active: boolean
  created_at: string
}

export default function OnlinePayments() {
  const { state } = useGym()
  const [members, setMembers] = useState(state.members)
  const [selectedMember, setSelectedMember] = useState("")
  const [selectedPlan, setSelectedPlan] = useState("")
  const [customAmount, setCustomAmount] = useState("")
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([])
  const [loading, setLoading] = useState(false)

  const handleCreatePaymentLink = async () => {
    if (!selectedMember || !selectedPlan) {
      toast({
        title: "Missing Information",
        description: "Please select a member and plan",
        variant: "destructive",
      })
      return
    }

    const member = members.find((m) => m.id === selectedMember)
    const plan = state.plans.find((p) => p.id === selectedPlan)

    if (!member || !plan) return

    setLoading(true)

    try {
      // Create Stripe payment link
      const response = await fetch("/api/stripe/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: customAmount || plan.price,
          memberName: member.name,
          memberEmail: member.email,
          planName: plan.name,
          gymId: state.user?.id,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const newLink: PaymentLink = {
        id: data.linkId,
        url: data.url,
        amount: Number.parseInt(customAmount) || plan.price,
        member_name: member.name,
        plan_name: plan.name,
        active: true,
        created_at: new Date().toISOString(),
      }

      setPaymentLinks([newLink, ...paymentLinks])

      toast({
        title: "Payment Link Created",
        description: "Share this link with the member to collect payment",
      })

      // Reset form
      setSelectedMember("")
      setSelectedPlan("")
      setCustomAmount("")
    } catch (error: any) {
      toast({
        title: "Error Creating Link",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    toast({
      title: "Copied!",
      description: "Payment link copied to clipboard",
    })
  }

  const shareViaWhatsApp = (member: string, url: string) => {
    const message = `Hi ${member}, here's your payment link for MuscleDesk membership: ${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank")
  }

  const selectedPlanData = state.plans.find((p) => p.id === selectedPlan)

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Online Payments</h1>
        <p className="text-muted-foreground">Accept payments online via Stripe</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Payment Link</CardTitle>
            <CardDescription>Generate a secure payment link for members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Member</label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} - {member.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Plan</label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a plan" />
                </SelectTrigger>
                <SelectContent>
                  {state.plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - ₹{plan.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPlanData && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Plan: {selectedPlanData.name}</p>
                <p className="text-sm text-muted-foreground">Amount: ₹{selectedPlanData.price}</p>
                <p className="text-sm text-muted-foreground">Duration: {selectedPlanData.duration} month(s)</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Amount (Optional)</label>
              <Input
                type="number"
                placeholder="Override plan amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
            </div>

            <Button onClick={handleCreatePaymentLink} disabled={loading} className="w-full">
              <LinkIcon className="mr-2 h-4 w-4" />
              {loading ? "Creating..." : "Create Payment Link"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payment Links</CardTitle>
            <CardDescription>Active payment links you've created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentLinks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No payment links yet</p>
              ) : (
                paymentLinks.map((link) => (
                  <div key={link.id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{link.member_name}</p>
                        <p className="text-sm text-muted-foreground">{link.plan_name}</p>
                      </div>
                      <Badge variant={link.active ? "default" : "secondary"}>{link.active ? "Active" : "Used"}</Badge>
                    </div>
                    <p className="text-lg font-bold">₹{link.amount}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(link.url)}>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => shareViaWhatsApp(link.member_name, link.url)}>
                        Share
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => window.open(link.url, "_blank")}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
