const loginForm = document.getElementById("loginForm")
const otpSection = document.getElementById("otpSection")
const otpForm = document.getElementById("otpForm")
const otpInputs = document.querySelectorAll(".otp-input")
const resendBtn = document.getElementById("resendBtn")

let phoneNumber = ""

// Handle phone submission
loginForm.addEventListener("submit", (e) => {
  e.preventDefault()
  phoneNumber = document.getElementById("phone").value

  // Simulate OTP sending
  console.log("[v0] OTP sent to:", phoneNumber)

  loginForm.parentElement.classList.add("hidden")
  otpSection.classList.remove("hidden")

  otpInputs[0].focus()
})

// OTP input handling
otpInputs.forEach((input, index) => {
  input.addEventListener("input", (e) => {
    if (e.target.value.length > 0 && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus()
    }
  })

  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && index > 0 && e.target.value.length === 0) {
      otpInputs[index - 1].focus()
    }
  })
})

// Handle OTP verification
otpForm.addEventListener("submit", (e) => {
  e.preventDefault()
  const otp = Array.from(otpInputs)
    .map((input) => input.value)
    .join("")

  console.log("[v0] OTP verified:", otp)

  // Simulate successful login
  const userData = {
    phone: phoneNumber,
    name: "Arjun Joshi",
    role: "admin",
  }

  localStorage.setItem("muscledesk-user", JSON.stringify(userData))

  // Redirect to dashboard
  setTimeout(() => {
    window.location.href = "pages/dashboard.html"
  }, 300)
})

// Resend OTP
resendBtn.addEventListener("click", (e) => {
  e.preventDefault()
  console.log("[v0] OTP resent to:", phoneNumber)

  otpInputs.forEach((input) => (input.value = ""))
  otpInputs[0].focus()

  // Show toast notification
  showToast("OTP resent successfully!")
})

function showToast(message) {
  const toast = document.createElement("div")
  toast.className =
    "fixed bottom-4 right-4 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50"
  toast.textContent = message
  document.body.appendChild(toast)

  setTimeout(() => toast.remove(), 3000)
}
