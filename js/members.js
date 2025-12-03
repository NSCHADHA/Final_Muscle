// Members page functionality
const addMemberBtn = document.getElementById("addMemberBtn")
const addMemberModal = document.getElementById("addMemberModal")
const addMemberForm = document.getElementById("addMemberForm")
const closeModalBtn = document.getElementById("closeModal")

// Check authentication
const user = localStorage.getItem("muscledesk-user")
if (!user) {
  window.location.href = "login.html"
}

// Modal management
addMemberBtn.addEventListener("click", () => {
  addMemberModal.classList.remove("hidden")
  addMemberModal.addEventListener("click", (e) => {
    if (e.target === addMemberModal) {
      addMemberModal.classList.add("hidden")
    }
  })
})

closeModalBtn.addEventListener("click", () => {
  addMemberModal.classList.add("hidden")
})

// Handle form submission
addMemberForm.addEventListener("submit", (e) => {
  e.preventDefault()
  console.log("[v0] New member added")
  addMemberModal.classList.add("hidden")
  addMemberForm.reset()
  showToast("Member added successfully!")
})

function showToast(message) {
  const toast = document.createElement("div")
  toast.className =
    "fixed bottom-4 right-4 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50"
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => toast.remove(), 3000)
}

// Keyboard shortcut to close modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !addMemberModal.classList.contains("hidden")) {
    addMemberModal.classList.add("hidden")
  }
})
