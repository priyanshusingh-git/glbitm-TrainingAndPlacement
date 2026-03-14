"use client"
import React from "react";
import { AnimatedSection, fadeIn } from "@/components/ui/AnimatedSection";
import { motion } from "framer-motion";
import { trustBadges } from "@/data/landing";

export default function TrustStrip() {
  return (
    <section className="bg-brown-900 py-20 px-[5vw] border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-diagonal-lines opacity-10" />
      <div className="max-w-7xl mx-auto relative z-10">
        <AnimatedSection className="flex flex-col items-center">
          <motion.div variants={fadeIn} className="text-white/20 text-[10px] tracking-[0.4em] uppercase mb-12 font-bold">
            Recognized By & Integrated With
          </motion.div>
          
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-10">
            {trustBadges.map((t, i) => (
              <motion.div 
                key={i} 
                variants={fadeIn}
                className="flex items-center gap-5 group"
              >
                               <div className="w-16 h-16 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center font-display text-xl font-bold text-amber-500 group-hover:bg-amber-500 group-hover:text-brown-900 group-hover:scale-110 transition-base shadow-lg">
                  {t.v}
                </div>
                <div>
                  <div className="text-white font-bold text-sm tracking-tight leading-tight mb-1">{t.v} India</div>
                  <div className="text-white/30 text-[10px] font-bold uppercase tracking-widest">{t.l}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
