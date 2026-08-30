"use client";

import Image from "next/image";
import { Loader2, Lock } from "lucide-react";
import { Heading } from "@/components/ui/heading";

export function UniversalSignOutOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/40 backdrop-blur-md text-white animate-fade-in duration-300">
      <div className="flex flex-col items-center max-w-sm text-center px-6 py-8 rounded-2xl bg-brown-900/90 border border-amber-500/30 shadow-2xl shadow-black/50 space-y-6 animate-scale-up">
        {/* Logo Shield Container with Pulsing Rings */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-24 w-24 rounded-full bg-amber-500/20 animate-ping" />
          <div className="absolute h-20 w-20 rounded-full border border-amber-500/40 animate-pulse" />
          <div className="relative h-16 w-16 rounded-full bg-brown-800 border-2 border-amber-500/50 flex items-center justify-center shadow-2xl shadow-amber-500/20">
            <Image
              src="/glbitm-logo.png"
              alt="GL Bajaj Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-1.5">
          <Heading variant="section-title" className="text-white flex items-center justify-center gap-2">
            <Lock className="h-5 w-5 text-amber-500" />
            Signing Out...
          </Heading>
          <p className="text-xs text-white/80">
            Securing your session credentials and clearing cache...
          </p>
        </div>

        {/* Animated Progress Loader Bar */}
        <div className="w-full space-y-2">
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 rounded-full animate-pulse" />
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-400/90 uppercase tracking-widest pt-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Redirecting to login
          </div>
        </div>
      </div>
    </div>
  );
}
