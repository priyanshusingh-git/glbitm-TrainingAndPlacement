"use client"

import { recruiterCategories, recruiterShowcase } from "@/data/landing"
import { AnimatedSection } from "@/components/ui/AnimatedSection"

export default function Recruiters() {
  return (
    <section id="recruiters" className="bg-brown-50 px-4 py-14 sm:px-5 md:px-8 md:py-16 lg:px-[clamp(28px,5vw,80px)] lg:py-[84px] xl:px-[clamp(40px,6vw,80px)]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 grid gap-3 lg:grid-cols-2 lg:items-end lg:gap-10 lg:mb-12">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-700">
              <span className="h-0.5 w-5 rounded-full bg-gradient-to-r from-amber-700 to-amber-400" />
              Our Recruiters
            </div>
            <h2 className="section-h2">
              600+ Companies
              <br />
              <span className="text-brown-600 italic">Recruit From GLBITM</span>
            </h2>
          </div>
          <p className="max-w-[33rem] text-sm leading-[1.85] text-muted-foreground lg:justify-self-end">
            From global product giants to fast-growing startups across IT services, consulting, finance, and core engineering. The recruiter network spans every academic year and multiple hiring formats.
          </p>
        </div>

        <AnimatedSection className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4 [mask-image:linear-gradient(to_right,white_80%,transparent)] sm:[mask-image:none]">
          {recruiterCategories.map((category) => (
            <div
              key={category.title}
              className="min-w-[240px] sm:min-w-0 rounded-md border border-border bg-white px-4 py-4 shadow-[0_2px_12px_rgba(81,41,18,0.07)]"
            >
              <div className="font-display text-[18px] font-bold text-brown-900">
                {category.icon} {category.title}
              </div>
              <ul className="mt-3 space-y-1.5">
                {category.companies.map((company) => (
                  <li key={company} className="flex items-center gap-2 text-[12px] text-muted-foreground">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                    <span>{company}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </AnimatedSection>

        <AnimatedSection className="mt-6 grid gap-2.5 grid-cols-3 sm:grid-cols-4 lg:grid-cols-6">
          {recruiterShowcase.map((company) => (
            <div
              key={`${company.initial}-${company.name}`}
              className="flex flex-col items-center gap-1.5 rounded-md border border-border bg-white px-3 py-4 text-center shadow-[0_2px_12px_rgba(81,41,18,0.07)] transition hover:-translate-y-0.5 hover:border-brown-800/25"
            >
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brown-800 to-brown-700 font-display text-[15px] font-bold text-white">
                {company.initial}
              </div>
              <div className="text-[10.5px] font-semibold text-brown-900">{company.name}</div>
              <div className="text-[9px] text-muted-foreground">{company.sector}</div>
            </div>
          ))}
        </AnimatedSection>

        <p className="mt-5 text-center text-[13px] text-muted-foreground">
          and{" "}
          <strong className="font-display text-[18px] font-bold text-brown-900">588+ more companies</strong> across IT,
          finance, core engineering, consulting, and e-commerce
        </p>
      </div>
    </section>
  )
}
