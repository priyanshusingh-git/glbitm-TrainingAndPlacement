"use client"

import { campusCard, teamMembers } from "@/data/landing"
import { AnimatedSection, fadeUp } from "@/components/ui/AnimatedSection"
import { motion } from "framer-motion"

export default function TrustStrip() {
  return (
    <section id="team" className="bg-brown-50 px-4 py-14 sm:px-5 md:px-8 md:py-16 lg:px-[clamp(28px,5vw,80px)] lg:py-[84px] xl:px-[clamp(40px,6vw,80px)]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 grid gap-3 lg:grid-cols-2 lg:items-end lg:gap-10 lg:mb-12">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-700">
              <span className="h-0.5 w-5 rounded-full bg-gradient-to-r from-amber-700 to-amber-400" />
              Meet the Team
            </div>
            <h2 className="section-h2">
              The People Behind
              <br />
              <span className="text-brown-600 italic">Every Placement</span>
            </h2>
          </div>
          <p className="max-w-[32rem] text-sm leading-[1.85] text-muted-foreground lg:justify-self-end">
            The T&amp;P Cell works year-round to coordinate drives, align training, manage recruiter relationships, and support students beyond the offer letter.
          </p>
        </div>

        <AnimatedSection className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {teamMembers.map((member) => (
            <motion.article
              key={member.name}
              variants={fadeUp}
              className="flex items-start gap-3 rounded-2xl border border-border bg-white px-4 py-5 shadow-[0_2px_12px_rgba(81,41,18,0.07)] transition hover:border-brown-400/40 hover:shadow-[0_6px_32px_rgba(81,41,18,0.11)]"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] bg-gradient-to-br from-brown-800 to-amber-700 font-display text-base font-bold text-white">
                {member.initial}
              </div>
              <div>
                <div className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-amber-700">{member.role}</div>
                <div className="font-display text-[19px] font-bold leading-[1.1] tracking-[-0.02em] text-brown-900">{member.name}</div>
                <div className="mt-1 text-[11px] leading-[1.7] text-muted-foreground">
                  {member.detail}
                  <br />
                  <a
                    href={`tel:${member.phone.replace(/\s+/g, "")}`}
                    className="text-brown-800 transition-colors hover:text-amber-700"
                  >
                    {member.phone}
                  </a>
                </div>
              </div>
            </motion.article>
          ))}

          <motion.article
            variants={fadeUp}
            className="flex items-start gap-3 rounded-2xl border border-transparent bg-gradient-to-br from-brown-900 to-brown-800 px-4 py-5 text-white shadow-[0_6px_32px_rgba(81,41,18,0.16)]"
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] bg-amber-500/20 text-lg">📍</div>
            <div>
              <div className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-amber-400/70">{campusCard.role}</div>
              <div className="font-display text-[19px] font-bold leading-[1.1] tracking-[-0.02em] text-white">{campusCard.name}</div>
              <div className="mt-1 text-[11px] leading-[1.7] text-white/48">
                {campusCard.description}
                <br />
                <a
                  href={campusCard.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400/75 transition-colors hover:text-amber-300"
                >
                  www.glbitm.org →
                </a>
              </div>
            </div>
          </motion.article>
        </AnimatedSection>
      </div>
    </section>
  )
}
