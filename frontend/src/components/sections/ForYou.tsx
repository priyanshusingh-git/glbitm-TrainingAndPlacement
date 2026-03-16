"use client"

import { certificationTracks, trainingModules } from "@/data/landing"
import { AnimatedSection, fadeUp } from "@/components/ui/AnimatedSection"
import { motion } from "framer-motion"

export default function ForYou() {
  return (
    <section id="training" className="bg-brown-50 px-4 py-14 sm:px-5 md:px-8 md:py-16 lg:px-[clamp(28px,5vw,80px)] lg:py-[84px] xl:px-[clamp(40px,6vw,80px)]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 grid gap-3 lg:grid-cols-2 lg:items-end lg:gap-10 lg:mb-12">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-700">
              <span className="h-0.5 w-5 rounded-full bg-gradient-to-r from-amber-700 to-amber-400" />
              T&amp;P Training Cell
            </div>
            <h2 className="section-h2">
              Year-Round Training
              <br />
              <span className="text-brown-600 italic">That Builds Careers</span>
            </h2>
          </div>
          <p className="max-w-[32rem] text-sm leading-[1.85] text-muted-foreground lg:justify-self-end">
            Not just pre-season cramming. A structured four-year programme of aptitude, technical, and soft-skill development anchored to what top recruiters actually test for.
          </p>
        </div>

        <div className="grid gap-7 lg:grid-cols-[1fr_0.95fr] lg:gap-11">
          <AnimatedSection className="flex flex-col gap-2.5">
            {trainingModules.map((module) => (
              <motion.div
                key={module.title}
                variants={fadeUp}
                className="flex items-start gap-3 rounded-2xl border border-border bg-white px-4 py-4 shadow-[0_2px_12px_rgba(81,41,18,0.07)] transition hover:translate-x-1 hover:border-brown-800/30"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brown-800 to-brown-700 text-base">
                  {module.icon}
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-brown-900">{module.title}</h3>
                  <p className="mt-1 text-[11.5px] leading-[1.65] text-muted-foreground">{module.description}</p>
                </div>
              </motion.div>
            ))}
          </AnimatedSection>

          <div>
            <div className="mb-4 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-700">
              <span className="h-0.5 w-5 rounded-full bg-gradient-to-r from-amber-700 to-amber-400" />
              Industry Certifications Offered
            </div>

            <AnimatedSection className="rounded-[24px] border border-border bg-white px-5 py-2 shadow-[0_2px_12px_rgba(81,41,18,0.07)]">
              {certificationTracks.map((track) => (
                <motion.div
                  key={track.title}
                  variants={fadeUp}
                  className="flex items-start gap-3 border-b border-border py-4 last:border-b-0"
                >
                  <div className="rounded-full bg-gradient-to-br from-brown-800 to-brown-700 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.05em] text-white">
                    {track.badge}
                  </div>
                  <div>
                    <div className="text-[12.5px] font-bold text-brown-900">{track.title}</div>
                    <div className="mt-0.5 text-[10.5px] text-muted-foreground">{track.description}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  )
}
