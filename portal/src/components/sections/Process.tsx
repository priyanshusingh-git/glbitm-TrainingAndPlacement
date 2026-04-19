"use client"

import { useState } from "react"
import { processSteps } from "@/data/landing"
import { AnimatedSection } from "@/components/ui/AnimatedSection"
import { cn } from "@/lib/utils"

export default function Process() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <section id="process" className="bg-brown-50 px-4 py-14 sm:px-5 md:px-8 md:py-16 lg:px-[clamp(28px,5vw,80px)] lg:py-[84px] xl:px-[clamp(40px,6vw,80px)]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 grid gap-3 lg:grid-cols-2 lg:items-end lg:gap-10 lg:mb-12">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-700">
              <span className="h-0.5 w-5 rounded-full bg-gradient-to-r from-amber-700 to-amber-400" />
              Step-by-Step
            </div>
            <h2 className="section-h2">
              The Placement
              <br />
              <span className="text-brown-600 italic">Process</span>
            </h2>
          </div>
          <p className="max-w-[32rem] text-sm leading-[1.85] text-muted-foreground lg:justify-self-end">
            A transparent, year-round journey from eligibility check to offer letter - designed around student readiness, recruiter coordination, and clarity at every step.
          </p>
        </div>

        <AnimatedSection className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {processSteps.map((step) => {
            const isExpanded = expandedId === step.n;
            return (
              <div
                key={step.n}
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth >= 768) return;
                  setExpandedId(isExpanded ? null : step.n);
                }}
                role="button"
                tabIndex={0}
                className="group relative overflow-hidden rounded-md border border-border bg-white px-4 py-4 md:px-5 md:py-6 shadow-[0_2px_12px_rgba(81,41,18,0.07)] transition hover:-translate-y-1 hover:shadow-[0_6px_32px_rgba(81,41,18,0.11)] cursor-pointer md:cursor-default"
              >
                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-brown-800 to-amber-500" />
                
                <div className="flex items-start justify-between">
                  <div className="mb-3 grid h-8 w-8 md:mb-4 md:h-9 md:w-9 place-items-center rounded-lg bg-gradient-to-br from-brown-800 to-brown-700 font-display text-[15px] md:text-[17px] font-bold text-white shrink-0">
                    {step.n}
                  </div>
                  <div className={cn("text-amber-600 text-[11px] transition-transform md:hidden", isExpanded && "rotate-90")}>
                    ▸
                  </div>
                </div>

                <h3 className="font-display text-[16px] md:text-[20px] font-bold leading-[1.12] tracking-[-0.02em] text-brown-900">
                  {step.t}
                </h3>
                <p className={cn(
                  "mt-2 text-[11.5px] md:text-[12.5px] leading-[1.72] text-muted-foreground",
                  isExpanded ? "block" : "hidden md:block"
                )}>
                  {step.d}
                </p>
              </div>
            )
          })}
        </AnimatedSection>
      </div>
    </section>
  )
}
