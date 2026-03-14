"use client"

import Link from "next/image"
import NextLink from "next/link"
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface AuthShellProps {
  title: string
  description: string
  children: React.ReactNode
  asideTitle?: string
  asideDescription?: string
  className?: string
}

const highlights = [
  "Placement, training, and testing workflows in one portal",
  "Industry-aligned skill upskilling and mock interview drills",
  "Real-time tracking of applications and selection status",
]

export function AuthShell({
  title,
  description,
  children,
  asideTitle = "GL Bajaj Career Portal",
  asideDescription = "Empowering students with industry-ready skills and global placement opportunities.",
  className,
}: AuthShellProps) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[45%_55%] bg-background selection:bg-amber-500/20">
      {/* ASIDE PANEL */}
      <section className="bg-brown-900 relative hidden lg:flex flex-col justify-between p-16 overflow-hidden text-white border-r border-white/5">
        <div className="absolute inset-0 bg-hero-gradient opacity-60" />
        <div className="absolute inset-0 bg-diagonal-lines opacity-20" />
        
        <div className="relative z-10">
          <NextLink href="/" className="inline-flex items-center gap-4 no-underline group">
                       <div className="w-12 h-12 rounded-sm bg-amber-500 grid place-items-center font-display font-bold text-xl text-brown-900 shadow-xl group-hover:scale-110 transition-base">GL</div>
            <div className="text-white font-bold text-lg leading-tight">
              GL Bajaj
              <span className="text-amber-500/60 block text-[10px] tracking-[0.3em] font-bold uppercase mt-1">T&P Portal</span>
            </div>
          </NextLink>
        </div>

        <div className="relative z-10 max-w-[440px]">
          <div className="eyebrow-dark mb-8 uppercase tracking-[0.2em]">{asideTitle}</div>
          <h1 className="font-display text-[48px] font-bold leading-[1.05] mb-8 tracking-tighter">
            Build your <span className="text-amber-500 italic">legacy</span> with us.
          </h1>
          <p className="text-white/50 text-lg leading-relaxed font-light mb-12">
            {asideDescription}
          </p>

          <div className="space-y-4">
            {highlights.map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-white/40 group">
                <ShieldCheck className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-base" />
                <span className="text-sm font-medium tracking-wide">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-white/20 text-[10px] font-bold uppercase tracking-widest pt-8 border-t border-white/5">
          <div>© {new Date().getFullYear()} GLBITM. Secure Portal.</div>
          <div className="flex gap-6">
            <span className="flex items-center gap-1.5"><ShieldCheck size={12}/> AES-256</span>
          </div>
        </div>
      </section>

      {/* FORM PANEL */}
      <section className={cn("flex flex-col justify-center p-8 md:p-16 lg:p-24 relative bg-background", className)}>
        <NextLink href="/login" className="absolute top-12 left-12 inline-flex items-center gap-2 text-brown-900 hover:text-amber-600 transition-base text-xs font-bold uppercase tracking-widest">
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </NextLink>

        <div className="w-full max-w-[420px] mx-auto">
          <div className="mb-10 space-y-3">
             <div className="eyebrow-dark border-amber-500/20 text-amber-600">Secure Access</div>
             <h1 className="section-h2 text-4xl">{title}</h1>
             <p className="text-muted-foreground text-sm font-light leading-relaxed">{description}</p>
          </div>

          {children}
        </div>
      </section>
    </div>
  )
}
