"use client"
import React from "react";
import Link from "next/link";
import { AnimatedSection, fadeUp } from "@/components/ui/AnimatedSection";
import { motion } from "framer-motion";
import { ctaContent } from "@/data/landing";

export default function CTABand() {
  return (
    <section id="contact" className="section-pad bg-background overflow-hidden px-[5vw]">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="bg-brown-900 rounded-xl p-16 md:p-24 text-center relative overflow-hidden shadow-2xl border border-white/10">
          <div className="absolute inset-0 bg-hero-gradient opacity-20" />
          <div className="absolute inset-0 bg-diagonal-lines opacity-10" />
          
          <div className="relative z-10">
            <div className="eyebrow-dark mb-8">{ctaContent.eyebrow}</div>
            <motion.h2 variants={fadeUp} className="font-display text-[clamp(32px,5vw,60px)] font-bold text-white mb-8 leading-[1.1] tracking-tighter">
              Ready to <span className="text-amber-500 italic">accelerate</span> <br />
              your future success?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/50 text-xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              {ctaContent.subtitle}
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex gap-5 justify-center flex-wrap">
              <Link href="/login" className="btn-accent">
                {ctaContent.primaryCta}
              </Link>
              <a href="mailto:placement@glbitm.org" className="btn-ghost-dark">
                {ctaContent.secondaryCta}
              </a>
            </motion.div>
          </div>
        </AnimatedSection>
        
        <AnimatedSection className="mt-16 text-center">
          <motion.address variants={fadeUp} className="not-italic text-[10px] text-brown-900/40 font-bold tracking-[0.2em] uppercase">
            {ctaContent.address}
          </motion.address>
        </AnimatedSection>
      </div>
    </section>
  );
}
