"use client"

import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import NumbersBar from "@/components/sections/NumbersBar"
import ForYou from "@/components/sections/ForYou"
import Recruiters from "@/components/sections/Recruiters"
import CDC from "@/components/sections/CDC"
import Process from "@/components/sections/Process"
import Policy from "@/components/sections/Policy"
import Advisory from "@/components/sections/Advisory"
import Guidance from "@/components/sections/Guidance"
import Testimonials from "@/components/sections/Testimonials"
import TrustStrip from "@/components/sections/TrustStrip"
import CTABand from "@/components/sections/CTABand"
import { heroContent, heroHighlights } from "@/data/landing"

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-brown-50 font-body text-foreground selection:bg-amber-500/20">
      <Navbar />

      <section
        id="hero"
        aria-label="Hero"
        className="relative flex min-h-screen items-center overflow-hidden bg-[linear-gradient(155deg,#3A1C0B_0%,#512912_52%,#6B3A1F_100%)] px-4 pb-12 pt-24 sm:px-5 sm:pb-14 md:px-8 md:pb-16 lg:px-[clamp(28px,5vw,80px)] lg:pb-20 lg:pt-32 xl:px-[clamp(40px,6vw,80px)]"
      >
        <div className="absolute -right-16 -top-28 h-[min(560px,140vw)] w-[min(560px,140vw)] rounded-full bg-amber-500/12 blur-[80px]" />
        <div className="absolute bottom-10 left-[7%] h-[min(340px,90vw)] w-[min(340px,90vw)] rounded-full bg-white/5 blur-[80px]" />
        <div className="absolute bottom-32 right-[28%] h-[min(180px,50vw)] w-[min(180px,50vw)] rounded-full bg-amber-500/8 blur-[80px]" />

        <div className="relative z-10 mx-auto grid w-full max-w-[1200px] gap-7 lg:grid-cols-[1fr_370px] lg:gap-16">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="hero-badge mb-5">
              <div className="live-dot" />
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-amber-400">{heroContent.eyebrow}</span>
            </div>

            <h1 className="hero-display-inverse max-w-[12ch]">
              Where <span className="text-amber-400 italic">{heroContent.emphasis}</span>
              <br />
              Meets Opportunity
            </h1>

            <p className="display-copy-inverse mt-5 max-w-[31rem] text-[14px] leading-[1.85] md:text-[14.5px]">
              {heroContent.subtitle}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-start">
              <Link href={heroContent.primaryCta.href} className="btn-accent min-h-11 justify-center px-6 py-3.5">
                {heroContent.primaryCta.label}
              </Link>
              <Link href={heroContent.secondaryCta.href} className="btn-ghost-dark min-h-11 justify-center px-6 py-3.5">
                {heroContent.secondaryCta.label}
              </Link>
            </div>
          </div>

          <div className="panel-dark-glass animate-in fade-in slide-in-from-bottom-3 duration-700 overflow-hidden rounded-[24px] border border-white/10 bg-white/6 p-0 backdrop-blur-[10px] lg:block">
            <div className="hidden px-6 pb-0 pt-6 text-[9px] font-bold uppercase tracking-[0.25em] text-white/30 lg:block">
              Placement Highlights 2024
            </div>
            <div className="flex overflow-x-auto lg:block lg:overflow-visible">
              {heroHighlights.map((item, index) => (
                <div
                  key={item.label}
                  className="flex min-w-[150px] flex-col gap-2 border-r border-white/6 px-4 py-4 last:border-r-0 lg:min-w-0 lg:flex-row lg:items-center lg:border-r-0 lg:border-b lg:px-6 lg:py-4 lg:last:border-b-0"
                >
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-amber-500/12 text-[14px]">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-display text-[22px] font-bold leading-none tracking-[-0.02em] text-white lg:text-[26px]">
                      {item.prefix && <span className="mr-0.5 text-[0.52em] text-white/45">{item.prefix}</span>}
                      {item.value}
                      {item.suffix && <span className="ml-0.5 text-[0.44em] font-bold text-amber-400">{item.suffix}</span>}
                    </div>
                    <div className="mt-1 text-[10px] tracking-[0.03em] text-white/42">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <NumbersBar />
      <Process />
      <Policy />
      <ForYou />
      <CDC />
      <Recruiters />
      <Advisory />
      <Guidance />
      <Testimonials />
      <TrustStrip />
      <CTABand />
      <Footer />
    </div>
  )
}
