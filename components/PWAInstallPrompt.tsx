"use client"

import { useState, useEffect } from "react"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if already installed
    const isInstalled =
      window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true

    if (isInstalled) {
      return
    }

    // Check if user dismissed the prompt before
    const isDismissed = localStorage.getItem("pwa-install-dismissed")
    if (isDismissed) {
      const dismissedTime = Number.parseInt(isDismissed, 10)
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)

      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return
      }
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Show prompt after 3 seconds
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return
    }

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setShowPrompt(false)
      localStorage.removeItem("pwa-install-dismissed")
    }

    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("pwa-install-dismissed", Date.now().toString())
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-card border-2 border-accent shadow-2xl rounded-2xl p-4 max-w-sm relative">
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 w-6 h-6 bg-muted hover:bg-muted/80 rounded-full flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X size={14} className="text-muted-foreground" />
        </button>

        <div className="flex gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-accent to-accent/70 rounded-xl flex items-center justify-center flex-shrink-0">
            <Download size={24} className="text-accent-foreground" />
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-foreground mb-1">Install MuscleDesk</h3>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">Get faster access and work offline</p>

            <button
              onClick={handleInstall}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-sm py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Install Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
