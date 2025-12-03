"use client"

import { useState } from "react"
import { useGymData } from "@/hooks/useGymData"
import { Plus, Edit, Trash2, Check, X } from "lucide-react"

export function Plans() {
  const { state, dispatch } = useGymData()
  const plans = state.plans

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newPlan, setNewPlan] = useState({ name: "", price: 0, duration: 3, features: "" })

  const handleAddPlan = async () => {
    if (newPlan.name && newPlan.price) {
      const featuresArray = newPlan.features
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f)

      if (editingId) {
        await dispatch({
          type: "UPDATE_PLAN",
          payload: {
            id: editingId,
            name: newPlan.name,
            price: newPlan.price,
            duration: newPlan.duration,
            features: featuresArray,
          },
        })
        setEditingId(null)
      } else {
        await dispatch({
          type: "ADD_PLAN",
          payload: {
            name: newPlan.name,
            price: newPlan.price,
            duration: newPlan.duration,
            features: featuresArray,
          },
        })
      }
      setNewPlan({ name: "", price: 0, duration: 3, features: "" })
      setShowAddModal(false)
    }
  }

  const handleEditPlan = (plan: any) => {
    setEditingId(plan.id)
    setNewPlan({
      name: plan.name,
      price: plan.price,
      duration: plan.duration,
      features: plan.features.join(", "),
    })
    setShowAddModal(true)
  }

  const handleDeletePlan = (id: string) => {
    dispatch({ type: "DELETE_PLAN", payload: id })
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Membership Plans</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">Create and manage your membership plans.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null)
            setNewPlan({ name: "", price: 0, duration: 3, features: "" })
            setShowAddModal(true)
          }}
          className="btn-primary flex items-center gap-2 justify-center"
        >
          <Plus size={20} /> New Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {plans.map((plan, idx) => (
          <div key={plan.id} className={`stat-card relative ${idx === 1 ? "md:scale-105 shadow-xl" : ""}`}>
            {idx === 1 && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-xs font-bold">
                POPULAR
              </div>
            )}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">₹{plan.price}</span>
                <span className="text-muted-foreground">/{plan.duration}m</span>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              {plan.features.map((feature, fidx) => (
                <div key={fidx} className="flex items-start gap-3">
                  <Check size={18} className="text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEditPlan(plan)}
                className="btn-secondary flex-1 text-sm flex items-center justify-center gap-2"
              >
                <Edit size={16} /> Edit
              </button>
              <button
                onClick={() => handleDeletePlan(plan.id)}
                className="p-3 hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <Trash2 size={18} className="text-destructive" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Plan Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">{editingId ? "Edit Plan" : "Create New Plan"}</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-muted rounded-lg">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Plan Name (e.g., Premium)"
                value={newPlan.name}
                onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                className="form-input"
              />
              <input
                type="number"
                placeholder="Price (₹)"
                value={newPlan.price}
                onChange={(e) => setNewPlan({ ...newPlan, price: Number(e.target.value) })}
                className="form-input"
              />
              <input
                type="number"
                placeholder="Duration (months)"
                value={newPlan.duration}
                onChange={(e) => setNewPlan({ ...newPlan, duration: Number(e.target.value) })}
                className="form-input"
              />
              <textarea
                placeholder='Features (comma-separated, e.g., "Gym Access, Locker, Water")'
                value={newPlan.features}
                onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value })}
                className="form-input"
                rows={3}
              />
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button onClick={handleAddPlan} className="btn-primary flex-1">
                  {editingId ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
