"use client"
import React from"react";
import Link from"next/link";
import { AnimatedSection, fadeUp, fadeIn } from"@/components/ui/AnimatedSection";
import { motion } from"framer-motion";

import { heroContent, numbersContent } from "@/data/landing";

function HeroStat({ icon, label, value }: { icon: string, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-white/10 last:border-0 hover:bg-white/5 px-2 rounded-md transition-base">
      <div className="w-10 h-10 rounded-sm bg-amber-500/10 flex items-center justify-center text-xl shadow-inner border border-amber-500/20">
        {icon}
      </div>
      <div>
        <div className="font-display text-2xl font-bold text-white leading-none tracking-tight">{value}</div>
        <div className="text-white/40 text-[10px] font-bold uppercase tracking-wider mt-1">{label}</div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-brown-900 overflow-hidden flex items-center pt-24 pb-16 px-[5vw]">
      {/* Brand Backgrounds */}
      <div className="absolute inset-0 bg-hero-gradient opacity-60" />
      <div className="absolute inset-0 bg-diagonal-lines opacity-20" />
      
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-16 xl:gap-24 items-center">
          <AnimatedSection>
            <motion.div variants={fadeIn} className="eyebrow-dark">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              {heroContent.eyebrow}
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="font-display text-white text-[clamp(42px,6vw,72px)] font-bold leading-[1.02] tracking-tighter mb-8">
              {heroContent.title.split(' ').map((word, i) => 
                word === 'Excellence' || word === 'Next-Gen' ? <span key={i} className="text-amber-500 italic">{word} </span> : word + ' '
              )}
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-white/70 text-lg leading-relaxed max-w-[540px] mb-10 font-light">
              {heroContent.subtitle}
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-wrap gap-5">
              <Link href="/login" className="btn-accent">
                {heroContent.ctaPrimary} →
              </Link>
              <Link href="#placements" className="btn-ghost-dark">
                {heroContent.ctaSecondary}
              </Link>
            </motion.div>
          </AnimatedSection>
          
          <AnimatedSection className="hidden lg:block">
            <div className="card-dark p-8 shadow-2xl relative overflow-hidden group border-white/10">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-base" />
              
              <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
                Placement Highlights 2024
              </div>
              
              <div className="space-y-1 relative z-10">
                {numbersContent.map((stat, idx) => (
                  <HeroStat 
                    key={idx} 
                    icon={idx === 0 ? "🏆" : idx === 1 ? "🏢" : idx === 2 ? "📊" : "🎓"} 
                    label={stat.label} 
                    value={stat.value + stat.suffix} 
                  />
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <span className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest">NIRF Accredited Institution</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
