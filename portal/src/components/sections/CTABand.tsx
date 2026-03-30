"use client"

import { ctaContent } from "@/data/landing"
import { AnimatedSection } from "@/components/ui/AnimatedSection"

export default function CTABand() {
  return (
    <section id="contact" className="bg-brown-100 px-4 py-14 sm:px-5 md:px-8 md:py-16 lg:px-[clamp(28px,5vw,80px)] lg:py-[84px] xl:px-[clamp(40px,6vw,80px)]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 grid gap-3 lg:grid-cols-2 lg:items-end lg:gap-10 lg:mb-12">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-700">
              <span className="h-0.5 w-5 rounded-full bg-gradient-to-r from-amber-700 to-amber-400" />
              {ctaContent.eyebrow}
            </div>
            <h2 className="section-h2">
              Ready to Hire
              <br />
              <span className="text-brown-600 italic">GL Bajaj Talent?</span>
            </h2>
          </div>
          <p className="max-w-[32rem] text-sm leading-[1.85] text-muted-foreground lg:justify-self-end">{ctaContent.subtitle}</p>
        </div>

        <div className="grid gap-7 lg:grid-cols-[1fr_0.95fr] lg:gap-12">
          <div>
            <h3 className="mb-5 font-display text-[24px] font-bold tracking-[-0.02em] text-brown-900">Placement Office Contacts</h3>

            <AnimatedSection className="flex flex-col gap-3">
              {ctaContent.contacts.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex items-start gap-3 rounded-md border border-border bg-white px-4 py-4 shadow-[0_2px_12px_rgba(81,41,18,0.07)] transition hover:-translate-y-0.5 hover:border-brown-800/20"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brown-800 to-brown-700 text-base text-white">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-amber-700">{item.label}</div>
                    <div className="mt-0.5 text-[12.5px] font-semibold text-brown-900">{item.value}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">{item.detail}</div>
                  </div>
                </a>
              ))}
            </AnimatedSection>
          </div>

          <AnimatedSection className="panel-dark-elevated rounded-[24px] p-8 md:p-9">
            <div className="absolute inset-0 bg-hero-gradient opacity-20" />
            <div className="absolute inset-0 bg-diagonal-lines opacity-10" />

            <div className="relative z-10">
              <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-400">Recruiter Actions</div>
              <h3 className="font-display text-[30px] font-bold leading-[1.08] tracking-[-0.03em] text-white">
                Start a drive, request the brochure,
                <br />
                or connect with the <span className="text-amber-400 italic">placement office</span>.
              </h3>
              <p className="mt-4 max-w-[30rem] text-[14px] leading-[1.8] text-white/52">
                Use the contact details to coordinate campus hiring, internship pipelines, or recruiter visits. The T&amp;P office manages scheduling, student communication, and drive logistics.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a href={ctaContent.primaryCta.href} className="btn-accent min-h-11 justify-center">
                  {ctaContent.primaryCta.label}
                </a>
                <a
                  href={ctaContent.secondaryCta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost-dark min-h-11 justify-center"
                >
                  {ctaContent.secondaryCta.label}
                </a>
              </div>

              <div className="mt-8 border-t border-white/8 pt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/28">
                {ctaContent.address}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
