"use client";

import React from"react";
import Navbar from"@/components/layout/Navbar";
import Footer from"@/components/layout/Footer";
import Hero from"@/components/sections/Hero";
import NumbersBar from"@/components/sections/NumbersBar";
import ForYou from"@/components/sections/ForYou";
import Recruiters from"@/components/sections/Recruiters";
import CDC from"@/components/sections/CDC";
import Process from"@/components/sections/Process";
import Testimonials from"@/components/sections/Testimonials";
import TrustStrip from"@/components/sections/TrustStrip";
import CTABand from"@/components/sections/CTABand";

export default function Home() {
 return (
 <div className="min-h-screen bg-cream text-foreground overflow-x-hidden font-body selection:bg-amber-500/30">
 <Navbar />
 <Hero />
 <NumbersBar />
 <ForYou />
 <Recruiters />
 <CDC />
 <Process />
 <Testimonials />
 <TrustStrip />
 <CTABand />
 <Footer />
 </div>
 );
}
