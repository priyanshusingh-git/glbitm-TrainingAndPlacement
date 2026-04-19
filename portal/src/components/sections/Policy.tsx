"use client"

import { useState } from "react"
import { policyGroups } from "@/data/landing"
import { AnimatedSection } from "@/components/ui/AnimatedSection"
import { cn } from "@/lib/utils"

export default function Policy() {
  const [expandedId, setExpandedId] = useState<string | null>(policyGroups[0]?.title || null)

  return (
    <section id="policy" className="bg-brown-100 px-4 py-14 sm:px-5 md:px-8 md:py-16 lg:px-[clamp(28px,5vw,80px)] lg:py-[84px] xl:px-[clamp(40px,6vw,80px)]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 grid gap-3 lg:grid-cols-2 lg:items-end lg:gap-10 lg:mb-12">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-700">
              <span className="h-0.5 w-5 rounded-full bg-gradient-to-r from-amber-700 to-amber-400" />
              Fair &amp; Transparent
            </div>
            <h2 className="section-h2">
              Placement Policy &amp;
              <br />
              <span className="text-brown-600 italic">Guidelines</span>
            </h2>
          </div>
          <p className="max-w-[33rem] text-sm leading-[1.85] text-muted-foreground lg:justify-self-end">
            Every student gets at least one shot at a strong opportunity. The Dream Company provision keeps ambition open while the placement office maintains clear participation rules.
            {" "}
            <a
              href="https://www.glbitm.org/placements"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brown-800 transition-colors hover:text-amber-700"
            >
              Read full policy →
            </a>
          </p>
        </div>

        <AnimatedSection className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
          {policyGroups.map((group) => {
            const isExpanded = expandedId === group.title;
            return (
              <article
                key={group.title}
                className="rounded-md border border-border bg-white p-5 md:p-6 shadow-[0_2px_12px_rgba(81,41,18,0.07)]"
              >
                <button 
                  onClick={() => {
                    if (typeof window !== "undefined" && window.innerWidth >= 768) return;
                    setExpandedId(isExpanded ? null : group.title);
                  }}
                  className="flex w-full items-center justify-between text-left cursor-pointer md:cursor-default"
                  aria-expanded={isExpanded}
                >
                  <h3 className="font-display text-[18px] md:text-[21px] font-bold tracking-[-0.02em] text-brown-900">
                    {group.icon} {group.title}
                  </h3>
                  <div className={cn("text-amber-600 text-[12px] transition-transform md:hidden", isExpanded && "rotate-90")}>
                    ▸
                  </div>
                </button>

                <div className={cn(
                  "overflow-hidden transition-all duration-300",
                  "md:mt-4 md:block", // Desktop: Always visible with margin
                  isExpanded ? "mt-4 block" : "hidden" // Mobile: Toggle visibility
                )}>
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-[11.5px] md:text-[12.5px] leading-[1.62] text-muted-foreground">
                        <span className="mt-1 shrink-0 font-bold text-amber-700">→</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            )
          })}
        </AnimatedSection>
      </div>
    </section>
  )
}
