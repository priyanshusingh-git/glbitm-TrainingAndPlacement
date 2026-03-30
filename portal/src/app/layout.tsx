import React from"react"
import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { cn } from "@/lib/utils"
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
 title: 'GLBITM CDC - Career Development Centre',
 description: 'Official Career Development Centre Platform of GL Bajaj Institute of Technology & Management for Training and Placements',
 generator: 'v0.app',
 icons: {
 icon: [
 {
 url: '/glbitm-logo.png',
 href: '/glbitm-logo.png',
 }
 ],
 apple: '/glbitm-logo.png',
 },
}

import { Fira_Code, Fraunces, Inter } from"next/font/google"
import { AuthProvider } from"@/contexts/auth-context"
import { NotificationProvider } from"@/contexts/notification-context"
import { Toaster } from"@/components/ui/toaster"
import { FloatingNavActions } from "@/components/layout/floating-nav-actions"

const fraunces = Fraunces({
 subsets: ["latin"],
 weight: ["400","600","700","800"],
 style: ["normal","italic"],
 variable: '--font-display',
 display: 'swap',
})

const inter = Inter({
 subsets: ["latin"],
 weight: ["300","400","500","600","700"],
 variable: '--font-body',
 display: 'swap',
})

const firaCode = Fira_Code({
 subsets: ["latin"],
 weight: ["400"],
 variable: '--font-mono',
 display: 'swap',
})

export default function RootLayout({
 children,
}: {
 children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(fraunces.variable, inter.variable, firaCode.variable, "scroll-smooth")}>
      <body suppressHydrationWarning className="font-body antialiased text-foreground selection:bg-amber-500/20">
        <AuthProvider>
          <NotificationProvider>
            {children}
            <FloatingNavActions />
          </NotificationProvider>
        </AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
