"use client"
import React from"react";
import { numbersContent, tickerRecruiters } from "@/data/landing";
import { StatCounter } from "@/components/ui/StatCounter";
import { AnimatedSection, fadeUp } from "@/components/ui/AnimatedSection";
import { motion } from "framer-motion";

export default function NumbersBar() {
  return (
    <section id="numbers" className="relative z-20">
      {/* Ticker Strip */}
      <div className="bg-amber-500 overflow-hidden py-3 whitespace-nowrap border-y border-brown-900/10">
        <div className="flex animate-ticker whitespace-nowrap">
          {[...Array(3)].map((_, i) => (
            <React.Fragment key={i}>
              {tickerRecruiters.map(company => (
                <div key={`${i}-${company}`} className="inline-flex items-center gap-4 px-8 text-xs font-bold uppercase tracking-widest text-brown-900">
                  {company}
                  <div className="w-1.5 h-1.5 rounded-full bg-brown-900/20 shadow-inner" />
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Numbers Section */}
      <div className="bg-brown-900 py-20 px-[5vw] relative overflow-hidden">
        <div className="absolute inset-0 bg-diagonal-lines opacity-10" />
        <div className="grid grid-cols-2 md:grid-cols-4 max-w-7xl mx-auto gap-8 md:gap-0 relative z-10">
          {numbersContent.map((stat: { label: string; value: string; suffix: string }, i: number) => (
            <div key={i} className="text-center px-6 border-r border-white/5 last:border-r-0">
              <div className="stat-number">
                <StatCounter value={parseFloat(stat.value)} suffix={stat.suffix} decimals={stat.value.includes('.') ? 1 : 0} />
              </div>
              <div className="text-white/40 text-[11px] font-bold uppercase tracking-[0.2em] mt-3">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
