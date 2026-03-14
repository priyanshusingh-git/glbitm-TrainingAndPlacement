"use client"
import React from"react";
import { cdcFeatures, cdcImpactStats } from "@/data/landing";
import { AnimatedSection, fadeUp } from "@/components/ui/AnimatedSection";
import { StatCounter } from "@/components/ui/StatCounter";
import { motion } from "framer-motion";

export default function CDC() {
  return (
    <section id="cdc" className="section-pad bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="section-tag">Career Development Centre</div>
        <h2 className="section-h2">
          More than placement — <br />
          <span className="text-amber-600 italic">a career launchpad</span>
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed font-light max-w-[500px] mt-6 mb-16">
          Our subsidiary CDC runs year-round programs that transform raw talent into industry-ready professionals, well before graduation.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-16 items-center">
          <AnimatedSection className="flex flex-col gap-2">
            {cdcFeatures.map((f, i) => (
              <motion.div 
                key={i} 
                variants={fadeUp}
                className="flex gap-6 items-start p-6 rounded-md border border-transparent hover:border-border hover:bg-white/50 transition-base group"
              >
                <div className="w-12 h-12 rounded-sm shrink-0 bg-brown-900/5 grid place-items-center text-2xl border border-transparent group-hover:border-brown-900/10 group-hover:bg-white shadow-sm transition-base">
                  {f.i}
                </div>
                <div>
                  <h4 className="font-bold text-lg text-brown-900 mb-1">{f.t}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed font-light">{f.d}</p>
                </div>
              </motion.div>
            ))}
          </AnimatedSection>

          <AnimatedSection className="relative">
            <motion.div variants={fadeUp} className="bg-brown-900 rounded-xl p-10 relative overflow-hidden shadow-2xl border border-white/10">
              {/* Decorative background logo shadow */}
              <div className="absolute -right-8 -bottom-10 font-display text-[180px] font-bold text-white/[0.03] leading-none select-none pointer-events-none">
                CDC
              </div>

              <div className="relative z-10">
                <div className="eyebrow-dark mb-6">CDC Impact 2024</div>
                <h3 className="font-display text-3xl font-bold text-white leading-snug mb-8">
                  Building <span className="text-amber-500 italic">career-ready</span> professionals since Day 1
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {cdcImpactStats.map((stat: { num: number; unit: string; l: string }, i: number) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-sm p-6 backdrop-blur-sm hover:bg-white/10 transition-base group">
                      <div className="font-display text-3xl font-bold text-amber-500 leading-none group-hover:scale-110 transition-base origin-left">
                        <StatCounter value={stat.num} suffix={stat.unit} />
                      </div>
                      <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">{stat.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
