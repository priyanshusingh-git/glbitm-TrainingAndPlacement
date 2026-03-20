"use client"

import { cdcFeatures, internshipCallout } from "@/data/landing"
import { AnimatedSection } from "@/components/ui/AnimatedSection"

export default function CDC() {
  return (
    <section id="cdc" className="bg-brown-900 px-4 py-14 text-white sm:px-5 md:px-8 md:py-16 lg:px-[clamp(28px,5vw,80px)] lg:py-[84px] xl:px-[clamp(40px,6vw,80px)]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mx-auto mb-10 max-w-[40rem] text-center lg:mb-12">
          <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-400">
            <span className="h-0.5 w-5 rounded-full bg-gradient-to-r from-amber-700 to-amber-400" />
            Career Development Centre
          </div>
          <h2 className="section-display-inverse">
            Skill Enhancement &amp;
            <br />
            <span className="text-amber-400 italic">CDC Programmes</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[32rem] text-sm leading-[1.85] text-white/46">
            Hackathons, live industry projects, and certification bootcamps - the kind of work that increasingly converts into internships and pre-placement offers.
          </p>
        </div>

        <AnimatedSection className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cdcFeatures.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/7 bg-white/5 px-5 py-5 transition hover:-translate-y-0.5 hover:border-amber-500/26 hover:bg-white/9"
            >
              <div className="mb-3 text-[22px]">{feature.icon}</div>
              <h3 className="font-display text-[22px] font-bold leading-[1.1] tracking-[-0.02em] text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-[12px] leading-[1.67] text-white/46">{feature.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {feature.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-amber-500/16 bg-amber-500/10 px-2 py-1 text-[9.5px] font-semibold text-amber-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </AnimatedSection>

        <div className="mt-8 grid gap-4 rounded-[24px] border border-white/7 bg-white/[0.042] px-4 py-6 text-center sm:px-5 md:grid-cols-[auto_1fr] md:text-left lg:mt-10 lg:grid-cols-[auto_1fr_auto] lg:gap-6 lg:px-8">
          <div>
            <div className="font-display text-[50px] font-bold leading-none tracking-[-0.04em] text-amber-400 lg:text-[58px]">
              {internshipCallout.value}
              <span className="ml-0.5 text-[0.44em]">{internshipCallout.suffix}</span>
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.08em] text-white/44">{internshipCallout.label}</div>
          </div>

          <p className="text-[13px] leading-[1.78] text-white/50">{internshipCallout.description}</p>

          <div className="hidden min-w-[190px] flex-col gap-2 lg:flex">
            {internshipCallout.cards.map((card) => (
              <div key={card.title} className="rounded-[10px] border border-amber-500/16 bg-amber-500/8 px-4 py-3">
                <div className="text-[11.5px] font-bold text-amber-300">{card.title}</div>
                <div className="mt-1 text-[10px] text-white/36">{card.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
