"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Heading } from "@/components/ui/heading";

export function GLBajajReloadLoader() {
  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-brown-900 text-white animate-fade-in duration-200">
      <div className="flex flex-col items-center max-w-lg text-center px-8 space-y-8 animate-fade-up">
        {/* Enlarged Shield Logo with Dual Radar Glow */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-40 w-40 rounded-full bg-amber-500/15 animate-ping" />
          <div className="absolute h-32 w-32 rounded-full border-2 border-amber-500/30 animate-pulse" />
          <div className="relative h-28 w-28 md:h-32 md:w-32 rounded-full bg-brown-800 border-2 border-amber-500/60 flex items-center justify-center shadow-2xl shadow-amber-500/20 p-4">
            <Image
              src="/glbitm-logo.png"
              alt="GL Bajaj Logo"
              width={96}
              height={96}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Full College Name */}
        <div className="space-y-2 max-w-lg">
          <Heading as="h2" className="font-display text-xl md:text-2xl font-bold tracking-tight text-white leading-snug">
            G.L. Bajaj Institute of Technology & Management
          </Heading>
          <p className="text-xs md:text-sm font-bold uppercase tracking-[0.25em] text-amber-500 pt-1">
            Training & Placement
          </p>
        </div>

        {/* Sleek Loading Status Stream */}
        <div className="w-52 space-y-2">
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 rounded-full animate-pulse" />
          </div>
          <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-amber-400/90 uppercase tracking-widest pt-1">
            <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
            Loading Workspace
          </div>
        </div>
      </div>
    </div>
  );
}
