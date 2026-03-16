"use client"

import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

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
    <aside className="relative hidden min-h-screen flex-col justify-between overflow-hidden border-r border-white/5 bg-brown-900 px-[52px] py-12 text-white lg:flex">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_110%_20%,rgba(232,160,32,0.13)_0%,transparent_55%),radial-gradient(ellipse_60%_80%_at_-10%_80%,rgba(14,8,3,0.5)_0%,transparent_55%)]" />
      <div className="absolute inset-0 bg-diagonal-lines opacity-[0.13]" />
      <div className="pointer-events-none absolute -bottom-20 -right-8 select-none font-display text-[22rem] font-bold leading-none tracking-[-0.08em] text-amber-500/5">
        {decoText}
      </div>

      <div className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-4 no-underline">
          <div className="relative h-12 w-[60px] overflow-hidden rounded-[12px] border border-white/10 bg-white/5 shadow-[0_4px_16px_rgba(0,0,0,0.22)]">
            <Image
              src="/glbitm-logo.png"
              alt="GL Bajaj logo"
              fill
              sizes="60px"
              className="object-cover object-center"
              priority
            />
          </div>
          <div>
            <div className="text-[15px] font-semibold leading-[1.2] text-white">GL Bajaj Institute</div>
            <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.25em] text-amber-300/90">T&amp;P · CDC Portal</div>
          </div>
        </Link>
      </div>

      <div className="relative z-10 max-w-[25rem]">
        <div className="hero-badge mb-6">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[11px] font-semibold tracking-[0.03em] text-amber-400 normal-case">{eyebrow}</span>
        </div>
        <div className="mb-4 font-display text-[clamp(2rem,3.5vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.03em] text-white [font-variation-settings:'opsz'_64,'SOFT'_0,'WONK'_0]">
          {title}
        </div>
        <p className="max-w-[22.5rem] text-[15px] font-light leading-[1.75] text-white/55">{description}</p>
      </div>

      <div className="relative z-10">{bottom}</div>
    </aside>
  )
}
