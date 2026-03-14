"use client"
import React from"react";
import { processSteps } from "@/data/landing";
import { AnimatedSection, fadeUp } from "@/components/ui/AnimatedSection";
import { motion } from "framer-motion";

export default function Process() {
  return (
    <section id="process" className="section-pad bg-muted overflow-hidden relative">
      <div className="absolute inset-0 bg-diagonal-lines opacity-5" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="section-tag">How It Works</div>
        <h2 className="section-h2">
          Your 6-step path to a <br />
          <span className="text-amber-600 italic">dream placement</span>
        </h2>
        <div className="gold-rule mb-14" />

        <AnimatedSection className="relative">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 relative z-10">
            {processSteps.map((s: { n: string; t: string; d: string }, i: number) => (
              <motion.div 
                key={i} 
                variants={fadeUp}
                className="text-center group"
              >
                <div className="w-14 h-14 mx-auto mb-6 rounded-sm bg-brown-900 border border-amber-500/30 grid place-items-center font-display text-xl font-bold text-amber-500 shadow-lg group-hover:scale-110 transition-base">
                  {s.n}
                </div>
                <h4 className="text-sm font-bold text-brown-900 mb-2">{s.t}</h4>
                <p className="text-muted-foreground text-xs leading-relaxed font-light px-2">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
