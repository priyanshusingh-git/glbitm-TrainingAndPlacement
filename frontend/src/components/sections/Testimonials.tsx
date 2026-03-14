"use client"
import React from"react";
import { landingTestimonials } from "@/data/landing";
import { AnimatedSection, fadeUp } from "@/components/ui/AnimatedSection";
import { motion } from "framer-motion";

export default function Testimonials() {
  return (
    <section id="testimonials" className="section-pad bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="section-tag">Success Stories</div>
        <h2 className="section-h2">
          Words from our <br />
          <span className="text-amber-600 italic">brilliant graduates</span>
        </h2>
        <div className="gold-rule mb-16" />

        <AnimatedSection className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {landingTestimonials.map((t: { q: string; i: string; n: string; r: string; c: string }, i: number) => (
            <motion.div 
              key={i} 
              variants={fadeUp}
              className="card-base p-10 flex flex-col justify-between transition-base hover:-translate-y-2 relative group overflow-hidden"
            >
              <div className="absolute top-8 right-8 text-amber-500/5 font-display text-[140px] leading-none select-none pointer-events-none group-hover:text-amber-500/10 transition-base">
                &quot;
              </div>
              
              <div className="relative z-10">
                <div className="text-lg leading-relaxed text-muted-foreground italic font-light mb-10">
                  &quot;{t.q}&quot;
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full shrink-0 border-2 border-white shadow-md overflow-hidden bg-brown-900 grid place-items-center font-display text-lg font-bold text-white uppercase">
                    {t.i}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-brown-900 leading-none mb-1">{t.n}</div>
                    <div className="text-xs text-muted-foreground font-medium">
                      {t.r} <span className="text-amber-600 font-bold">@ {t.c}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
}
