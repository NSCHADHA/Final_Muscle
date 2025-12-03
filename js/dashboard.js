// Dashboard initialization
console.log("[v0] Dashboard loaded")

// Check if user is logged in
const user = localStorage.getItem("muscledesk-user")
if (!user) {
  window.location.href = "login.html"
}

// Add interactivity to stats
document.querySelectorAll(".stat-card").forEach((card) => {
  card.addEventListener("mouseenter", function () {
    this.style.boxShadow = "0 4px 20px rgba(245, 192, 70, 0.1)"
  })
  card.addEventListener("mouseleave", function () {
    this.style.boxShadow = ""
  })
})

console.log("[v0] Dashboard interactivity enabled")
