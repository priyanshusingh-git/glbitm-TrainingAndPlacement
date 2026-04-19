"use client"

import NextLink from "next/link"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { AuthBrandPanel } from "@/components/layout/auth-brand-panel"
import { MobileAuthHeader } from "@/components/layout/mobile-auth-header"

interface AuthShellProps {
  title: string
  description: string
  children: React.ReactNode
  asideTitle?: string
  asideDescription?: string
  className?: string
}

const highlights = [
  {
    icon: "🔐",
    title: "Secure credential handling",
    description: "Passwords are updated through protected identity flows and never sent in plain text.",
  },
  {
    icon: "📈",
    title: "One portal for every workflow",
    description: "Training, placement drives, and account management stay aligned inside one interface.",
  },
  {
    icon: "🛡️",
    title: "Recovery built for speed",
    description: "OTP-based recovery keeps the process short while preserving verification and auditability.",
  },
]

export function AuthShell({
  title,
  description,
  children,
  asideTitle = "Secure Access",
  asideDescription = "Access the GL Bajaj Training & Placement and CDC portal with the same brand and security system used across the platform.",
  className,
}: AuthShellProps) {
  return (
    <div className="min-h-screen bg-brown-50 text-foreground lg:grid lg:grid-cols-[1fr_1fr]">
      <AuthBrandPanel
        eyebrow={asideTitle}
        title={
          <>
            Access the
            <br />
            <span className="text-amber-500 italic">secure side</span>
            <br />
            of your portal.
          </>
        }
        description={asideDescription}
        bottom={
          <div className="space-y-3 rounded-md border border-white/9 bg-white/5 p-5">
            {highlights.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-lg bg-amber-500/12 text-[15px]">
                  {item.icon}
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-white/75">{item.title}</div>
                  <div className="text-[12px] leading-[1.5] text-white/40">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        }
      />

      <section className={cn("relative flex min-h-screen items-center justify-center overflow-y-auto bg-brown-50 px-6 py-10 md:px-10 lg:px-[5vw]", className)}>
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(232,160,32,0.08)_0%,transparent_70%)]" />

        <div className="relative z-10 w-full max-w-[400px]">
          <MobileAuthHeader />

          <NextLink
            href="/login"
            className="mb-7 inline-flex items-center gap-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-brown-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </NextLink>

          <div className="mb-7">
            <h1 className="mb-1 font-display text-[34px] font-bold leading-[1.1] tracking-[-0.025em] text-brown-900 [font-variation-settings:'opsz'_48,'SOFT'_0,'WONK'_0]">
              {title}
            </h1>
            <p className="text-sm font-light leading-[1.65] text-muted-foreground">{description}</p>
          </div>

          {children}
        </div>
      </section>
    </div>
  )
}
