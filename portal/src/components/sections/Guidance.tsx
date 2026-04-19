"use client"

import { useState } from "react"
import { guidanceFeatures } from "@/data/landing"
import { AnimatedSection } from "@/components/ui/AnimatedSection"
import { cn } from "@/lib/utils"

export default function Guidance() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <section id="guidance" className="bg-brown-50 px-4 py-14 sm:px-5 md:px-8 md:py-16 lg:px-[clamp(28px,5vw,80px)] lg:py-[84px] xl:px-[clamp(40px,6vw,80px)]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 grid gap-3 lg:grid-cols-2 lg:items-end lg:gap-10 lg:mb-12">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-700">
              <span className="h-0.5 w-5 rounded-full bg-gradient-to-r from-amber-700 to-amber-400" />
              Career Guidance &amp; Support
            </div>
            <h2 className="section-h2">
              Beyond Placement
              <br />
              <span className="text-brown-600 italic">Lifelong Career Support</span>
            </h2>
          </div>
          <p className="max-w-[33rem] text-sm leading-[1.85] text-muted-foreground lg:justify-self-end">
            The T&amp;P Cell does not stop at the offer letter. Guidance spans higher studies, mentoring, alumni access, entrepreneurship support, and long-term professional readiness.
          </p>
        </div>

        <AnimatedSection className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {guidanceFeatures.map((feature) => {
            const isExpanded = expandedId === feature.title;
            return (
              <article
                key={feature.title}
                onClick={() => {
                  if (typeof window !== "undefined" && window.innerWidth >= 768) return;
                  setExpandedId(isExpanded ? null : feature.title);
                }}
                role="button"
                tabIndex={0}
                className="group relative rounded-md border border-border bg-white px-4 py-4 md:px-5 md:py-6 shadow-[0_2px_12px_rgba(81,41,18,0.07)] transition hover:-translate-y-1 hover:border-brown-400/35 hover:shadow-[0_6px_32px_rgba(81,41,18,0.11)] cursor-pointer md:cursor-default"
              >
                <div className="flex items-start justify-between">
                  <div className="mb-2 md:mb-3 text-[20px] md:text-2xl shrink-0">{feature.icon}</div>
                  <div className={cn("text-amber-600 text-[11px] transition-transform md:hidden", isExpanded && "rotate-90")}>
                    ▸
                  </div>
                </div>
                
                <h3 className="font-display text-[16px] md:text-[22px] font-bold tracking-[-0.02em] text-brown-900">{feature.title}</h3>
                
                <p className={cn(
                  "mt-2 text-[11.5px] md:text-[12.5px] leading-[1.72] text-muted-foreground transition-all duration-300",
                  isExpanded ? "block" : "hidden md:block"
                )}>
                  {feature.description}
                </p>
                
                {feature.cta && (
                  <a
                    href={feature.cta.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "mt-3 inline-block text-xs font-semibold text-brown-800 transition-colors hover:text-amber-700",
                      isExpanded ? "block" : "hidden md:inline-block"
                    )}
                  >
                    {feature.cta.label}
                  </a>
                )}
              </article>
            )
          })}
        </AnimatedSection>
      </div>
    </section>
  )
}
