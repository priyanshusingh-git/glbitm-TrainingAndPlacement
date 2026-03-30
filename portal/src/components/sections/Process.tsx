"use client"

import { processSteps } from "@/data/landing"
import { AnimatedSection } from "@/components/ui/AnimatedSection"

export default function Process() {
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

        <AnimatedSection className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          {processSteps.map((step) => (
            <div
              key={step.n}
              className="group relative overflow-hidden rounded-md border border-border bg-white px-5 py-6 shadow-[0_2px_12px_rgba(81,41,18,0.07)] transition hover:-translate-y-1 hover:shadow-[0_6px_32px_rgba(81,41,18,0.11)]"
            >
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-brown-800 to-amber-500" />
              <div className="mb-4 grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brown-800 to-brown-700 font-display text-[17px] font-bold text-white">
                {step.n}
              </div>
              <h3 className="font-display text-[20px] font-bold leading-[1.12] tracking-[-0.02em] text-brown-900">
                {step.t}
              </h3>
              <p className="mt-2 hidden md:block text-[12.5px] leading-[1.72] text-muted-foreground">{step.d}</p>
            </div>
          ))}
        </AnimatedSection>
      </div>
    </section>
  )
}
