"use client"
import React from 'react'
import { GraduationCap, Briefcase, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { AnimatedSection, fadeUp } from '@/components/ui/AnimatedSection'
import { motion } from 'framer-motion'

export default function ForYou() {
  return (
    <section id="for-you" className="section-pad bg-muted overflow-hidden relative">
      <div className="absolute inset-0 bg-diagonal-lines opacity-5" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="section-tag">Get Started</div>
        <h2 className="section-h2">
          Who are you <br />
          <span className="text-amber-600 italic">here for?</span>
        </h2>
        <div className="gold-rule mb-14" />
        
        <AnimatedSection className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Students Card */}
          <motion.div variants={fadeUp} className="card-dark p-12 flex flex-col justify-between group min-h-[400px] border-white/10 bg-brown-900">
             <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
             <div>
              <div className="w-16 h-16 rounded-sm bg-white/10 flex items-center justify-center mb-8 text-3xl border border-white/10 shadow-inner">
                🎓
              </div>
              <h3 className="font-display text-3xl font-bold text-white mb-4">
                I&apos;m a Student
              </h3>
              <p className="text-white/60 text-lg leading-relaxed font-light max-w-sm">
                Access aptitude training, mock interviews, resume clinics, soft-skills coaching, industry mentorships — and direct exposure to 500+ companies recruiting on campus.
              </p>
            </div>
            <Link href="/login" className="btn-accent self-start mt-8">
              Start Your Journey →
            </Link>
          </motion.div>

          {/* For Recruiters Card */}
          <motion.div variants={fadeUp} className="card-base p-12 flex flex-col justify-between group min-h-[400px]">
             <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-brown-900/5 rounded-full blur-3xl pointer-events-none" />
             <div>
              <div className="w-16 h-16 rounded-sm bg-muted flex items-center justify-center mb-8 text-3xl border border-border shadow-inner">
                🏢
              </div>
              <h3 className="font-display text-3xl font-bold text-brown-900 mb-4">
                I&apos;m a Recruiter
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed font-light max-w-sm">
                Partner with GL Bajaj to access pre-screened, industry-ready graduates in CSE, AI/ML, ECE, Mechanical and MBA. On-campus or virtual drives — your choice.
              </p>
            </div>
            <Link href="/login" className="btn-primary self-start mt-8">
              Schedule a Drive →
            </Link>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  )
}
