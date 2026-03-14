import React from"react"
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { cn } from "@/lib/utils"
import './globals.css'

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

import { Cormorant_Garamond, Outfit } from"next/font/google"
import { AuthProvider } from"@/contexts/auth-context"
import { NotificationProvider } from"@/contexts/notification-context"
import { Toaster } from"@/components/ui/toaster"

const cormorantGaramond = Cormorant_Garamond({
 subsets: ["latin"],
 weight: ["600","700"],
 style: ["normal","italic"],
 variable: '--font-display',
 display: 'swap',
})

const outfit = Outfit({
 subsets: ["latin"],
 weight: ["300","400","500","600","700"],
 variable: '--font-body',
 display: 'swap',
})

export default function RootLayout({
 children,
}: {
 children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn(cormorantGaramond.variable, outfit.variable, "scroll-smooth")}>
      <body className="font-body antialiased text-foreground selection:bg-amber-500/20">
        <AuthProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
