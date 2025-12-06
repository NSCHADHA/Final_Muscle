"use client"

import { useState } from "react"
import { Mail, Copy, Check, Download } from "lucide-react"
import { useGymData } from "@/hooks/useGymData"

export function MembersEmailPortal() {
  const { state } = useGymData()
  const members = state.members
  const [copied, setCopied] = useState(false)

  // Extract all member emails
  const allEmails = members.map((member) => member.email).filter((email) => email)

  const handleCopyAll = async () => {
    const emailsString = allEmails.join(", ")
    try {
      await navigator.clipboard.writeText(emailsString)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy emails:", err)
      alert("Failed to copy emails. Please try again.")
    }
  }

  const handleExportToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + allEmails.join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "member_emails.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Members Email Portal</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Access and copy all member emails for easy batch management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Users size={24} className="text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Members</p>
              <p className="text-2xl font-bold text-foreground">{members.length}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Mail size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email Addresses</p>
              <p className="text-2xl font-bold text-foreground">{allEmails.length}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Check size={24} className="text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ready to Copy</p>
              <p className="text-2xl font-bold text-foreground">{copied ? "Copied!" : "Ready"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">Email List</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {allEmails.length} email{allEmails.length !== 1 ? "s" : ""} available
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleExportToCSV}
              className="btn-secondary flex items-center gap-2 justify-center flex-1 sm:flex-initial"
            >
              <Download size={18} />
              Export CSV
            </button>
            <button
              onClick={handleCopyAll}
              className="btn-primary flex items-center gap-2 justify-center flex-1 sm:flex-initial"
            >
              {copied ? (
                <>
                  <Check size={18} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy All
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-2 font-medium">Preview (Comma-separated):</p>
          <div className="bg-background/50 rounded-lg p-4 max-h-32 overflow-y-auto">
            <code className="text-xs text-foreground break-all">{allEmails.join(", ")}</code>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-muted-foreground">#</th>
                <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-muted-foreground">Name</th>
                <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-muted-foreground">Email</th>
                <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => (
                <tr key={member.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-3 md:py-4 px-3 md:px-6 text-muted-foreground">{index + 1}</td>
                  <td className="py-3 md:py-4 px-3 md:px-6">
                    <span className="font-medium text-foreground">{member.name}</span>
                  </td>
                  <td className="py-3 md:py-4 px-3 md:px-6">
                    <span className="text-foreground">{member.email}</span>
                  </td>
                  <td className="py-3 md:py-4 px-3 md:px-6">
                    <span
                      className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${
                        member.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : member.status === "expiring"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {members.length === 0 && <div className="text-center py-8 text-muted-foreground">No members found</div>}
        </div>
      </div>

      <div className="mt-6 stat-card bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Mail size={20} className="text-blue-500" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">About Members Email Portal</h3>
            <p className="text-sm text-muted-foreground mb-2">
              This portal provides easy access to all member email addresses for batch management and communication
              purposes.
            </p>
            <p className="text-sm text-muted-foreground">
              Use the <strong>Copy All</strong> button to copy all emails to your clipboard, or{" "}
              <strong>Export CSV</strong> to download them as a file for use in email marketing platforms or the new
              Members Portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Users({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
