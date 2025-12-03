// Renewals page functionality
console.log("[v0] Renewals page loaded")

// Check authentication
const user = localStorage.getItem("muscledesk-user")
if (!user) {
  window.location.href = "login.html"
}

// WhatsApp button functionality
document.querySelectorAll(".whatsapp-btn").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    e.preventDefault()
    console.log("[v0] WhatsApp reminder sent")
    showToast("WhatsApp reminder sent successfully!")

    // Update button state
    const parent = this.closest(".flex")
    const select = parent.querySelector("select")
    if (select) {
      select.value = "sent"
    }
  })
})

// Status update functionality
window.updateRenewalStatus = (select) => {
  const value = select.value
  if (value) {
    console.log("[v0] Renewal status updated:", value)
    showToast(`Member marked as ${value}`)
    select.value = ""
  }
}

// Bulk actions
document.getElementById("sendBulkBtn").addEventListener("click", () => {
  console.log("[v0] Bulk WhatsApp reminders sent")
  showToast("WhatsApp reminders sent to 18 members!")
})

function showToast(message) {
  const toast = document.createElement("div")
  toast.className =
    "fixed bottom-4 right-4 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50"
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => toast.remove(), 3000)
}
