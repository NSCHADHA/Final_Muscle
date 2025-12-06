// Settings page functionality
console.log("[v0] Settings page loaded")

// Check authentication
const user = localStorage.getItem("muscledesk-user")
if (!user) {
  window.location.href = "login.html"
}

// Settings tab switching
const settingsTabs = document.querySelectorAll(".settings-tab")
const settingSections = document.querySelectorAll(".setting-section")

settingsTabs.forEach((tab) => {
  tab.addEventListener("click", (e) => {
    e.preventDefault()

    // Update active tab
    settingsTabs.forEach((t) => {
      t.classList.remove("text-foreground", "font-semibold")
      t.classList.add("text-muted-foreground")
    })
    tab.classList.remove("text-muted-foreground")
    tab.classList.add("text-foreground", "font-semibold")

    // Update visible section
    const targetId = tab.getAttribute("href").substring(1)
    settingSections.forEach((section) => {
      section.classList.add("hidden")
    })
    document.getElementById(targetId).classList.remove("hidden")

    console.log("[v0] Settings tab changed:", targetId)
  })
})

// Form submission handlers
document.querySelectorAll('button:has-text("Save")').forEach((btn) => {
  btn.addEventListener("click", () => {
    console.log("[v0] Settings saved")
    showToast("Settings updated successfully!")
  })
})

// Checkbox handlers
document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
  checkbox.addEventListener("change", function () {
    console.log("[v0] Preference toggled:", this.checked)
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
