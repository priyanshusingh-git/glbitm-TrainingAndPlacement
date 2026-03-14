import React from "react";
import Link from "next/link";
import { footerLinks } from "@/data/landing";

export default function Footer() {
  return (
    <footer className="bg-brown-900 pt-20 px-[5vw] pb-10 text-white relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-white/5" />
      <div className="absolute inset-0 bg-diagonal-lines opacity-5" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-16 lg:gap-24 mb-16">
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <div className="relative w-[140px] h-[48px]">
                <img 
                  src="/glbitm-logo.png" 
                  alt="GL Bajaj Logo" 
                  className="w-full h-full object-contain filter brightness-0 invert"
                />
              </div>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed font-light max-w-sm">
              GL Bajaj&apos;s Training & Placement Cell and Career Development Centre are dedicated to transforming raw talent into industry-ready professionals through year-round training and global connections.
            </p>
          </div>

          <div>
            <h5 className="text-[10px] tracking-[0.2em] uppercase text-amber-500 mb-6 font-bold">University</h5>
            <div className="flex flex-col gap-3">
              {footerLinks.university.map(link => (
                <a key={link.name} href={link.href} className="text-white/40 hover:text-amber-500 no-underline text-xs font-medium transition-base uppercase tracking-wider">{link.name}</a>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-[10px] tracking-[0.2em] uppercase text-amber-500 mb-6 font-bold">Portals</h5>
            <div className="flex flex-col gap-3">
              {footerLinks.portals.map(link => (
                <Link key={link.name} href={link.href} className="text-white/40 hover:text-amber-500 no-underline text-xs font-medium transition-base uppercase tracking-wider">{link.name}</Link>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-[10px] tracking-[0.2em] uppercase text-amber-500 mb-6 font-bold">Contact</h5>
            <div className="flex flex-col gap-4 text-white/40 text-xs font-medium uppercase tracking-wider">
              <a href={`mailto:${footerLinks.contact.email}`} className="hover:text-amber-500 no-underline transition-base">{footerLinks.contact.email}</a>
              <p className="leading-relaxed">
                {footerLinks.contact.phone}<br />
                {footerLinks.contact.address.split(',').map((line, i) => <React.Fragment key={i}>{line}<br /></React.Fragment>)}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-white/20 text-[11px] font-bold uppercase tracking-[0.1em] gap-4">
          <div>© {new Date().getFullYear()} GL Bajaj Institute of Technology & Management.</div>
          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-amber-500 transition-base">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-amber-500 transition-base">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
