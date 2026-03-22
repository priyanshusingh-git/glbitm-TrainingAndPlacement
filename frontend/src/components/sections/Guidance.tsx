"use client"

import { guidanceFeatures } from "@/data/landing"
import { AnimatedSection } from "@/components/ui/AnimatedSection"

export default function Guidance() {
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

        <AnimatedSection className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          {guidanceFeatures.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-border bg-white px-5 py-6 shadow-[0_2px_12px_rgba(81,41,18,0.07)] transition hover:-translate-y-1 hover:border-brown-400/35 hover:shadow-[0_6px_32px_rgba(81,41,18,0.11)]"
            >
              <div className="mb-3 text-2xl">{feature.icon}</div>
              <h3 className="font-display text-[22px] font-bold tracking-[-0.02em] text-brown-900">{feature.title}</h3>
              <p className="mt-2 hidden md:block text-[12.5px] leading-[1.72] text-muted-foreground">{feature.description}</p>
              {feature.cta && (
                <a
                  href={feature.cta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-xs font-semibold text-brown-800 transition-colors hover:text-amber-700"
                >
                  {feature.cta.label}
                </a>
              )}
            </article>
          ))}
        </AnimatedSection>
      </div>
    </section>
  )
}
