// Plans page functionality
console.log("[v0] Plans page loaded")

// Check authentication
const user = localStorage.getItem("muscledesk-user")
if (!user) {
  window.location.href = "login.html"
}

// Plan management
document.querySelectorAll(".btn-primary, .btn-secondary, .btn-accent").forEach((btn) => {
  btn.addEventListener("click", function () {
    if (this.textContent.includes("Edit")) {
      console.log("[v0] Edit plan clicked")
      showToast("Opening plan editor...")
    } else if (this.textContent.includes("Create")) {
      console.log("[v0] Create plan clicked")
      showToast("Opening plan creator...")
    }
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
