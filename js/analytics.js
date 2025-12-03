// Analytics page functionality
console.log("[v0] Analytics page loaded")

// Check authentication
const user = localStorage.getItem("muscledesk-user")
if (!user) {
  window.location.href = "login.html"
}

// Period selector
document.querySelectorAll(".period-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".period-btn").forEach((b) => {
      b.classList.remove("bg-accent/10", "text-accent")
      b.classList.add("hover:bg-muted")
    })
    this.classList.add("bg-accent/10", "text-accent")
    this.classList.remove("hover:bg-muted")

    const period = this.textContent
    console.log("[v0] Analytics period changed:", period)
    showToast(`Showing data for ${period}`)
  })
})

// Export functionality
document.querySelectorAll(".btn-secondary").forEach((btn) => {
  btn.addEventListener("click", function () {
    const format = this.textContent.trim()
    console.log("[v0] Exporting report as:", format)
    showToast(`Generating ${format}...`)
  })
})

function showToast(message) {
  const toast = document.createElement("div")
  toast.className =
    "fixed bottom-4 right-4 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50"
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => toast.remove(), 3000)
}
