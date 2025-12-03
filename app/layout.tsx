import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { GymProvider } from "@/context/GymContext"
import { Toaster } from "sonner"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MuscleDesk - Premium Gym Management",
  description: "Modern gym management SaaS platform for fitness centers. Manage members, payments, plans, and more.",
  generator: "v0.app",
  manifest: "/manifest.json",
  applicationName: "MuscleDesk",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MuscleDesk",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "MuscleDesk",
    title: "MuscleDesk - Premium Gym Management",
    description: "Modern gym management SaaS platform",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
}

export const viewport: Viewport = {
  themeColor: "#d4af37",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/service-worker.js')
                    .then(reg => {
                      console.log('[App] Service Worker registered successfully')
                      reg.addEventListener('updatefound', () => {
                        console.log('[App] New service worker version found')
                      })
                    })
                    .catch(err => console.error('[App] SW registration failed:', err))
                })
              }
            `,
          }}
        />
      </head>
      <body className={`font-sans antialiased`}>
        <ThemeProvider>
          <GymProvider>{children}</GymProvider>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
