"use client"
import React, { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/data/landing";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-[500] h-[72px] bg-brown-900/95 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-[5vw]">
        {/* Logo */}
        <Link href="/" className="flex items-center no-underline h-full">
          <div className="relative w-[140px] h-[48px]">
            <img 
              src="/glbitm-logo.png" 
              alt="GL Bajaj Logo" 
              className="w-full h-full object-contain filter brightness-0 invert"
            />
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className="text-white/60 hover:text-amber-500 text-xs font-bold uppercase tracking-widest transition-base no-underline"
            >
              {link.name}
            </Link>
          ))}
          <Link href="/login" className="btn-accent py-2.5 px-6">
            Hire From Us
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-white hover:text-amber-500 transition-base z-[600]"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <div className={cn(
        "fixed inset-0 z-[550] bg-brown-900/98 backdrop-blur-xl transition-all duration-300 md:hidden flex flex-col items-center justify-center gap-8",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      )}>
        {navLinks.map((link) => (
          <Link 
            key={link.name} 
            href={link.href} 
            onClick={() => setIsOpen(false)} 
            className="text-white text-2xl font-display font-bold no-underline hover:text-amber-500 transition-base"
          >
            {link.name}
          </Link>
        ))}
        <Link 
          href="/login" 
          onClick={() => setIsOpen(false)} 
          className="btn-accent px-12 py-4 text-lg"
        >
          Hire From Us →
        </Link>
      </div>
    </>
  );
}
