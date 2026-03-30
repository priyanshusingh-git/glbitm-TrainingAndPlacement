"use client"

import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AuthBrandPanelProps {
  eyebrow: string
  title: ReactNode
  description: string
  bottom: ReactNode
  decoText?: string
}

export function AuthBrandPanel({
  eyebrow,
  title,
  description,
  bottom,
  decoText = "GL",
}: AuthBrandPanelProps) {
  return (
    <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-white/5 bg-brown-900 px-[52px] py-12 text-white lg:flex lg:h-full">
      {/* Background Layers */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 bg-diagonal-lines opacity-[0.1]" />
      <div className="absolute inset-0 bg-grain opacity-[0.03]" />
      
      {/* Decorative Large Text */}
      <div className="pointer-events-none absolute -bottom-20 -right-8 select-none font-display text-[22rem] font-bold leading-none tracking-[-0.08em] text-amber-500/5 transition-opacity duration-1000">
        {decoText}
      </div>

      {/* Header / Logo */}
      <div className="relative z-10 animate-fade-in stagger-1">
        <Link href="/" className="group inline-flex items-center gap-4 no-underline">
          <div className="relative h-12 w-[60px] overflow-hidden rounded-md border border-white/10 bg-white/5 shadow-2xl transition-transform duration-500 group-hover:scale-105">
            <Image
              src="/glbitm-logo.png"
              alt="GL Bajaj logo"
              fill
              sizes="60px"
              className="object-cover object-center p-1.5"
              priority
            />
            <div className="absolute inset-0 bg-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <div className="text-[15px] font-bold leading-[1.2] tracking-tight text-white">GL Bajaj Institute</div>
            <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.25em] text-amber-400/90">T&amp;P · CDC Portal</div>
          </div>
        </Link>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-[25rem]">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 animate-fade-up stagger-2">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(232,160,32,0.8)] animate-pulse" />
          <span className="text-[11px] font-bold tracking-wider text-amber-400 uppercase">{eyebrow}</span>
        </div>
        
        <h1 className="mb-4 animate-fade-up stagger-3 font-display text-[clamp(2rem,3.5vw,3.25rem)] font-bold leading-[1.05] tracking-tight text-white [font-variation-settings:'opsz'_64,'SOFT'_0,'WONK'_0]">
          {title}
        </h1>
        
        <p className="max-w-[22.5rem] animate-fade-up stagger-4 text-[16px] font-light leading-relaxed text-white/50">
          {description}
        </p>
      </div>

      {/* Stats / Footer Area */}
      <div className="relative z-10 animate-fade-up stagger-5">
        {bottom}
      </div>
    </aside>
  )
}
