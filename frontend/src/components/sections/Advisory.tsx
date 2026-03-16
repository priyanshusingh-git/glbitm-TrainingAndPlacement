"use client"

import { advisoryMembers } from "@/data/landing"
import { AnimatedSection, fadeUp } from "@/components/ui/AnimatedSection"
import { motion } from "framer-motion"

export default function Advisory() {
  return (
    <section id="advisory" className="bg-brown-100 px-4 py-14 sm:px-5 md:px-8 md:py-16 lg:px-[clamp(28px,5vw,80px)] lg:py-[84px] xl:px-[clamp(40px,6vw,80px)]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 grid gap-3 lg:grid-cols-2 lg:items-end lg:gap-10 lg:mb-12">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-700">
              <span className="h-0.5 w-5 rounded-full bg-gradient-to-r from-amber-700 to-amber-400" />
              Corporate Advisory Board
            </div>
            <h2 className="section-h2">
              Industry Leaders
              <br />
              <span className="text-brown-600 italic">Guide Our Curriculum</span>
            </h2>
          </div>
          <p className="max-w-[32rem] text-sm leading-[1.85] text-muted-foreground lg:justify-self-end">
            Senior professionals across product, consulting, and campus-hiring functions keep the training and placement roadmap tied to current industry expectations.
          </p>
        </div>

        <AnimatedSection className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {advisoryMembers.map((member) => (
            <motion.article
              key={member.name}
              variants={fadeUp}
              className="rounded-2xl border border-border bg-white px-4 py-5 text-center shadow-[0_2px_12px_rgba(81,41,18,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_32px_rgba(81,41,18,0.11)]"
            >
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-brown-800 to-brown-700 font-display text-base font-bold text-white">
                {member.initial}
              </div>
              <div className="text-[13px] font-bold text-brown-900">{member.name}</div>
              <div className="mt-1 text-[11px] leading-[1.5] text-muted-foreground">{member.role}</div>
              <div className="mt-3 inline-flex rounded-full bg-brown-100 px-3 py-1 text-[10px] font-bold text-brown-800">
                {member.company}
              </div>
            </motion.article>
          ))}
        </AnimatedSection>
      </div>
    </section>
  )
}
