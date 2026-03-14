"use client"
import React from"react";
import { topRecruiters, otherRecruiters } from "@/data/landing";
import { AnimatedSection, fadeUp } from "@/components/ui/AnimatedSection";
import { motion } from "framer-motion";

export default function Recruiters() {
  return (
    <section id="recruiters" className="section-pad bg-background">
      <div className="max-w-7xl mx-auto text-center">
        <div className="section-tag">Our Network</div>
        <h2 className="section-h2 mx-auto">
          A preferred choice of <br />
          <span className="text-amber-600 italic">500+ global</span> recruiters
        </h2>
        <div className="gold-rule mx-auto mb-14" />

        <AnimatedSection className="flex flex-wrap justify-center gap-3">
          {/* Top Recruiters - Brand/Gold Pills */}
          {topRecruiters.map((company, i) => (
            <motion.div 
              key={`top-${i}`} 
              variants={fadeUp}
              className="r-pill-featured"
            >
              {company}
            </motion.div>
          ))}

          {/* Other Recruiters - White Pills */}
          {otherRecruiters.map((company: string, i: number) => (
            <motion.div 
              key={`other-${i}`} 
              variants={fadeUp}
              className="r-pill"
            >
              {company}
            </motion.div>
          ))}
          
          <motion.div 
            variants={fadeUp}
            className="px-6 py-2 rounded-full text-sm font-bold bg-brown-900 text-white shadow-lg cursor-default"
          >
            + 490 More Recruiter Partners
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}
