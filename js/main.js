// Global utilities and routing
const appConfig = {
  isDark: localStorage.getItem("muscledesk-theme") === "dark",
  currentUser: localStorage.getItem("muscledesk-user") ? JSON.parse(localStorage.getItem("muscledesk-user")) : null,
}

// Initialize theme
if (appConfig.isDark) {
  document.documentElement.classList.add("dark")
} else {
  document.documentElement.classList.remove("dark")
}

// Theme toggle functionality (globally available)
document.addEventListener("DOMContentLoaded", () => {
  const themeToggles = document.querySelectorAll("#themeToggle")

  themeToggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      appConfig.isDark = !appConfig.isDark
      localStorage.setItem("muscledesk-theme", appConfig.isDark ? "dark" : "light")

      if (appConfig.isDark) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    })
  })

  // Nav items active state
  const navItems = document.querySelectorAll(".nav-item")
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navItems.forEach((i) => i.classList.remove("active"))
      item.classList.add("active")
    })
  })
})
