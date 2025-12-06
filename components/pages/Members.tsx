"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Plus, Edit, Trash2, RotateCw, X, QrCode, Download } from "lucide-react"
import { useGymData } from "@/hooks/useGymData"
import QRCodeStyling from "qr-code-styling"

interface MembersProps {
  searchQuery?: string
}

export function Members({ searchQuery = "" }: MembersProps) {
  const { state, dispatch } = useGymData()
  const members = state.members
  const plans = state.plans

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "expiring" | "expired">("all")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedMemberQR, setSelectedMemberQR] = useState<any>(null)
  const qrCodeRef = useRef<HTMLDivElement>(null)

  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    plan_id: "",
    planDuration: 1 as 1 | 3 | 6 | 12,
    joiningDate: new Date().toISOString().split("T")[0],
  })

  useEffect(() => {
    if (searchQuery) {
      setSearchTerm(searchQuery)
    }
  }, [searchQuery])

  useEffect(() => {
    const handleTriggerAddMember = () => {
      setEditingId(null)
      setNewMember({
        name: "",
        email: "",
        phone: "",
        plan_id: plans[0]?.id || "",
        planDuration: 1,
        joiningDate: new Date().toISOString().split("T")[0],
      })
      setShowAddModal(true)
    }

    window.addEventListener("triggerAddMember", handleTriggerAddMember)
    return () => window.removeEventListener("triggerAddMember", handleTriggerAddMember)
  }, [plans])

  useEffect(() => {
    if (showQRModal && selectedMemberQR && qrCodeRef.current) {
      qrCodeRef.current.innerHTML = ""

      if (!selectedMemberQR.qr_token) {
        qrCodeRef.current.innerHTML =
          '<div class="text-center text-red-500 p-8">QR code not available for this member</div>'
        return
      }

      const qrCode = new QRCodeStyling({
        width: 300,
        height: 300,
        data: selectedMemberQR.qr_token,
        margin: 10,
        qrOptions: {
          typeNumber: 0,
          mode: "Byte",
          errorCorrectionLevel: "H",
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: 0.4,
          margin: 5,
        },
        dotsOptions: {
          color: "#000000",
          type: "rounded",
        },
        backgroundOptions: {
          color: "#ffffff",
        },
        cornersSquareOptions: {
          color: "#000000",
          type: "extra-rounded",
        },
        cornersDotOptions: {
          color: "#000000",
          type: "dot",
        },
      })

      qrCode.append(qrCodeRef.current)
    }
  }, [showQRModal, selectedMemberQR])

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm)
    const matchesStatus = filterStatus === "all" || member.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleAddMember = async () => {
    if (newMember.name && newMember.email && newMember.phone && newMember.plan_id) {
      try {
        const joiningDate = new Date(newMember.joiningDate)
        const selectedPlan = plans.find((p) => p.id === newMember.plan_id)
        const expiryDate = new Date(joiningDate)
        expiryDate.setMonth(expiryDate.getMonth() + (selectedPlan?.duration || 1))

        const expiryDateStr = expiryDate.toISOString().split("T")[0]

        if (editingId) {
          await dispatch({
            type: "UPDATE_MEMBER",
            payload: {
              id: editingId,
              name: newMember.name,
              email: newMember.email,
              phone: newMember.phone,
              planDuration: selectedPlan?.duration || 1,
              joinDate: newMember.joiningDate,
              expiryDate: expiryDateStr,
            },
          })
          setEditingId(null)
        } else {
          await dispatch({
            type: "ADD_MEMBER",
            payload: {
              name: newMember.name,
              email: newMember.email,
              phone: newMember.phone,
              planDuration: selectedPlan?.duration || 1,
              joinDate: newMember.joiningDate,
              expiryDate: expiryDateStr,
            },
          })
        }

        setNewMember({
          name: "",
          email: "",
          phone: "",
          plan_id: "",
          planDuration: 1,
          joiningDate: new Date().toISOString().split("T")[0],
        })
        setShowAddModal(false)
      } catch (error) {
        // Error handled in dispatch
      }
    }
  }

  const handleEditMember = (member: any) => {
    setEditingId(member.id)
    setNewMember({
      name: member.name,
      email: member.email,
      phone: member.phone,
      plan_id: member.plan_id || plans[0]?.id || "",
      planDuration: member.plan_duration,
      joiningDate: member.joining_date,
    })
    setShowAddModal(true)
  }

  const handleDeleteMember = async (id: string) => {
    if (confirm("Are you sure you want to delete this member?")) {
      try {
        await dispatch({ type: "DELETE_MEMBER", payload: id })
      } catch (error) {
        // Error handled in dispatch
      }
    }
  }

  const handleRenewMember = async (id: string) => {
    const member = members.find((m) => m.id === id)
    if (member) {
      try {
        const newJoinDate = new Date().toISOString().split("T")[0]
        const expiryDate = new Date()
        expiryDate.setMonth(expiryDate.getMonth() + member.plan_duration)
        const newExpiryDate = expiryDate.toISOString().split("T")[0]

        await dispatch({
          type: "UPDATE_MEMBER",
          payload: {
            id: member.id,
            name: member.name,
            email: member.email,
            phone: member.phone,
            plan_duration: member.plan_duration,
            joining_date: newJoinDate,
            expiry_date: newExpiryDate,
            status: "active",
          },
        })
      } catch (error) {
        // Error handled in dispatch
      }
    }
  }

  const handleViewQR = (member: any) => {
    if (!member.qr_token) {
      alert("QR code not available for this member. Please contact support.")
      return
    }
    setSelectedMemberQR(member)
    setShowQRModal(true)
  }

  const handleDownloadQR = () => {
    if (!selectedMemberQR || !selectedMemberQR.qr_token) return

    const qrCode = new QRCodeStyling({
      width: 1000,
      height: 1000,
      data: selectedMemberQR.qr_token,
      margin: 40,
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "H",
      },
      dotsOptions: {
        color: "#000000",
        type: "rounded",
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      cornersSquareOptions: {
        color: "#000000",
        type: "extra-rounded",
      },
    })

    qrCode.download({
      name: `${selectedMemberQR.name.replace(/\s+/g, "_")}_QR`,
      extension: "png",
    })
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "expiring":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Members</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Manage your gym members and their memberships.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setNewMember({
              name: "",
              email: "",
              phone: "",
              plan_id: plans[0]?.id || "",
              planDuration: 1,
              joiningDate: new Date().toISOString().split("T")[0],
            })
            setShowAddModal(true)
          }}
          className="btn-primary flex items-center gap-2 justify-center"
        >
          <Plus size={20} /> Add Member
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-12 w-full text-sm"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="form-input px-4 py-3 text-sm"
        >
          <option value="all">All Members</option>
          <option value="active">Active</option>
          <option value="expiring">Expiring Soon</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="stat-card overflow-x-auto">
        <table className="w-full text-xs md:text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-muted-foreground">Name</th>
              <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-muted-foreground hidden sm:table-cell">
                Email
              </th>
              <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-muted-foreground">Plan</th>
              <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-muted-foreground">Status</th>
              <th className="text-left py-3 md:py-4 px-3 md:px-6 font-semibold text-muted-foreground hidden md:table-cell">
                Expiry
              </th>
              <th className="text-right py-3 md:py-4 px-3 md:px-6 font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr key={member.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="py-3 md:py-4 px-3 md:px-6">
                  <span className="font-medium text-foreground text-sm md:text-base">{member.name}</span>
                </td>
                <td className="py-3 md:py-4 px-3 md:px-6 text-muted-foreground text-xs md:text-sm hidden sm:table-cell">
                  {member.email}
                </td>
                <td className="py-3 md:py-4 px-3 md:px-6">
                  <span className="font-medium text-foreground text-xs md:text-sm">
                    {member.plan_duration} month{member.plan_duration > 1 ? "s" : ""}
                  </span>
                </td>
                <td className="py-3 md:py-4 px-3 md:px-6">
                  <span
                    className={`inline-block px-2 md:px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(member.status)}`}
                  >
                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 md:py-4 px-3 md:px-6 text-muted-foreground text-xs md:text-sm hidden md:table-cell">
                  {member.expiry_date}
                </td>
                <td className="py-3 md:py-4 px-3 md:px-6 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleViewQR(member)}
                      className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="View QR Code"
                    >
                      <QrCode size={16} className="text-blue-500" />
                    </button>
                    {member.status !== "active" && (
                      <button
                        onClick={() => handleRenewMember(member.id)}
                        className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
                        title="Renew Membership"
                      >
                        <RotateCw size={16} className="text-accent" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEditMember(member)}
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} className="text-primary" />
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredMembers.length === 0 && <div className="text-center py-8 text-muted-foreground">No members found</div>}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div
            className="modal-content max-h-[90vh] overflow-y-auto w-full md:w-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">{editingId ? "Edit Member" : "Add New Member"}</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-muted rounded-lg">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                className="form-input"
              />
              <input
                type="email"
                placeholder="Email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                className="form-input"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={newMember.phone}
                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                className="form-input"
              />
              <div>
                <label className="form-label">Select Plan</label>
                <select
                  value={newMember.plan_id}
                  onChange={(e) => {
                    const selectedPlan = plans.find((p) => p.id === e.target.value)
                    setNewMember({
                      ...newMember,
                      plan_id: e.target.value,
                      planDuration: (selectedPlan?.duration || 1) as 1 | 3 | 6 | 12,
                    })
                  }}
                  className="form-input"
                >
                  <option value="">-- Select Plan --</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - ₹{plan.price} ({plan.duration} month{plan.duration > 1 ? "s" : ""})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Joining Date</label>
                <input
                  type="date"
                  value={newMember.joiningDate}
                  onChange={(e) => setNewMember({ ...newMember, joiningDate: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button onClick={() => setShowAddModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button onClick={handleAddMember} className="btn-primary">
                  {editingId ? "Update Member" : "Add Member"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showQRModal && selectedMemberQR && (
        <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
          <div className="modal-content w-full md:w-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Member QR Code</h2>
              <button onClick={() => setShowQRModal(false)} className="p-1 hover:bg-muted rounded-lg">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">{selectedMemberQR.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedMemberQR.phone}</p>
                <p className="text-xs text-muted-foreground">Member ID: {selectedMemberQR.id.slice(0, 8)}</p>
              </div>

              <div className="flex justify-center bg-white p-6 rounded-lg">
                <div ref={qrCodeRef} />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-center text-muted-foreground">
                  Scan this QR code at the gym entrance for attendance
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleDownloadQR}
                  className="btn-primary flex items-center gap-2 flex-1 justify-center"
                >
                  <Download size={18} />
                  Download QR Code
                </button>
                <button onClick={() => setShowQRModal(false)} className="btn-secondary flex-1">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
