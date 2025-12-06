// Payments page functionality
console.log("[v0] Payments page loaded")

// Check authentication
const user = localStorage.getItem("muscledesk-user")
if (!user) {
  window.location.href = "login.html"
}

// Filter functionality
const filterDate = document.getElementById("filterDate")
const filterStatus = document.getElementById("filterStatus")
const filterMethod = document.getElementById("filterMethod")
;[filterDate, filterStatus, filterMethod].forEach((filter) => {
  filter.addEventListener("change", () => {
    console.log("[v0] Filters applied")
    showToast("Filters applied successfully")
  })
})

// Download functionality
document.querySelector('button:has(svg[viewBox="0 0 24 24"])').addEventListener("click", () => {
  console.log("[v0] Downloading transactions...")
  showToast("Download started")
})

function showToast(message) {
  const toast = document.createElement("div")
  toast.className =
    "fixed bottom-4 right-4 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50"
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => toast.remove(), 3000)
}
