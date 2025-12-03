"use client"

import { useState } from "react"
import { useGymData } from "@/hooks/useGymData"
import { MessageCircle, AlertCircle } from "lucide-react"

export function Reminders() {
  const { state } = useGymData()
  const reminders = state.reminders || []

  const [selectedReminders, setSelectedReminders] = useState<string[]>([])
  const [template, setTemplate] = useState("renewal")

  const templates = {
    renewal: "Hi {name}, Your membership expires in {days} days. Renew now to continue your fitness journey!",
    expired: "Hi {name}, Your membership has expired. Get back on track with a fresh renewal!",
    followup: "Hi {name}, We miss you! Your membership expires soon. Reply to renew.",
  }

  const toggleReminder = (id: string) => {
    setSelectedReminders((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]))
  }

  const getPreviewMessage = (reminder: (typeof reminders)[0]) => {
    return templates[template as keyof typeof templates]
      .replace("{name}", reminder.member_name.split(" ")[0])
      .replace("{days}", String(reminder.daysLeft))
  }

  const handleSendReminders = () => {
    if (selectedReminders.length === 0) return

    selectedReminders.forEach((reminderId) => {
      const reminder = reminders.find((r) => r.id === reminderId)
      if (!reminder) return

      const phoneNumber = reminder.phone?.replace(/\D/g, "") // Remove non-digits

      if (phoneNumber) {
        const message = getPreviewMessage(reminder)
        const waLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
        window.open(waLink, "_blank")
      }
    })

    setSelectedReminders([])
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Renewal Reminders</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Send WhatsApp reminders to members with expiring memberships.
        </p>
      </div>

      {/* Alert */}
      {reminders.length > 0 && (
        <div className="flex gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg mb-6 dark:bg-orange-900/20 dark:border-orange-900/40">
          <AlertCircle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-900 dark:text-orange-400">
              {reminders.length} members have expiring memberships
            </p>
            <p className="text-sm text-orange-800 dark:text-orange-300">Send reminders to help retain your members</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members List */}
        <div className="lg:col-span-2">
          <div className="stat-card mb-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Expiring Members</h2>
            {reminders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No members with expiring memberships</p>
            ) : (
              <div className="space-y-2">
                {[...reminders]
                  .sort((a, b) => a.daysLeft - b.daysLeft)
                  .map((reminder) => (
                    <label
                      key={reminder.id}
                      className="flex items-center gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedReminders.includes(reminder.id)}
                        onChange={() => toggleReminder(reminder.id)}
                        className="w-4 h-4 rounded accent"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{reminder.member_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Expires in {reminder.daysLeft} day{reminder.daysLeft !== 1 ? "s" : ""} • {reminder.plan}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xs font-semibold px-3 py-1 rounded ${
                            reminder.daysLeft <= 2
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30"
                              : "bg-orange-100 text-orange-800 dark:bg-orange-900/30"
                          }`}
                        >
                          {reminder.daysLeft} day{reminder.daysLeft !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </label>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Template Selection */}
        <div>
          <div className="stat-card sticky top-8">
            <h2 className="text-lg font-bold text-foreground mb-4">Message Template</h2>
            <div className="space-y-2 mb-6">
              {Object.entries(templates).map(([key, _]) => (
                <button
                  key={key}
                  onClick={() => setTemplate(key)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors font-medium text-sm ${template === key ? "bg-accent text-accent-foreground" : "bg-muted hover:bg-muted/80 text-foreground"}`}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>

            {/* Preview */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-muted-foreground mb-2">PREVIEW</p>
              <div className="bg-muted p-4 rounded-lg border border-border text-sm text-foreground">
                {reminders.length > 0 ? getPreviewMessage(reminders[0]) : "Select a member to preview"}
              </div>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendReminders}
              disabled={selectedReminders.length === 0}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <MessageCircle size={18} />
              Open WhatsApp ({selectedReminders.length})
            </button>

            <p className="text-xs text-muted-foreground mt-2 text-center">Opens WhatsApp with pre-filled message</p>
          </div>
        </div>
      </div>
    </div>
  )
}
