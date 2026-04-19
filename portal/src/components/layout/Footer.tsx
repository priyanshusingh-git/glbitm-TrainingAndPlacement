import Image from "next/image"
import Link from "next/link"
import { footerLinks } from "@/data/landing"

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-brown-900 px-4 pb-5 pt-10 text-white sm:px-6 lg:px-[max(80px,calc((100vw-1200px)/2))]">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8 grid gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-9">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 no-underline">
              <div className="relative h-10 w-[52px] shrink-0 overflow-hidden rounded-[10px] border border-white/10 bg-white/5 shadow-[0_4px_16px_rgba(0,0,0,0.18)]">
                <Image
                  src="/glbitm-logo.png"
                  alt="GL Bajaj logo"
                  fill
                  sizes="52px"
                  className="object-cover object-center"
                />
              </div>
              <div>
                <div className="text-[14px] font-semibold leading-[1.15] text-white">GL Bajaj Institute</div>
                <div className="mt-0.5 text-[8.5px] uppercase tracking-[0.24em] text-amber-500/50">Training &amp; Placement · CDC</div>
              </div>
            </Link>

            <p className="mt-3 max-w-[18rem] text-[11.5px] leading-[1.72] text-white/36">
              {footerLinks.overview}
            </p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {footerLinks.credentials.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[9.5px] font-semibold text-white/46"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/28">Quick Links</h4>
            <div className="flex flex-col gap-1.5">
              {footerLinks.quick.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="inline-block py-1 text-xs text-white/48 transition-colors hover:text-amber-400"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/28">CDC</h4>
            <div className="flex flex-col gap-1.5">
              {footerLinks.cdc.map((link) =>
                link.external ? (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block py-1 text-xs text-white/48 transition-colors hover:text-amber-400"
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="inline-block py-1 text-xs text-white/48 transition-colors hover:text-amber-400"
                  >
                    {link.name}
                  </Link>
                )
              )}
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <h4 className="mb-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/28">Contact</h4>
            <div className="space-y-2 text-xs text-white/48">
              <a href={`mailto:${footerLinks.contact.email}`} className="block transition-colors hover:text-amber-400">
                {footerLinks.contact.email}
              </a>
              <a href={`tel:${footerLinks.contact.phone.replace(/\s+/g, "")}`} className="block transition-colors hover:text-amber-400">
                {footerLinks.contact.phone}
              </a>
              <p className="leading-[1.7] text-white/48">{footerLinks.contact.address}</p>
              <a
                href={footerLinks.contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-colors hover:text-amber-400"
              >
                Visit main website ↗
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 border-t border-white/6 pt-4 text-center md:flex-row md:justify-between md:text-left">
          <p className="text-[10.5px] text-white/24">
            © {new Date().getFullYear()} GL Bajaj Institute of Technology &amp; Management. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[10.5px]">
            <Link href="/login" className="text-amber-500/55 transition-colors hover:text-amber-400">
              Portal Login
            </Link>
            <a
              href="https://www.glbitm.org/placements"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-500/55 transition-colors hover:text-amber-400"
            >
              Placement Page ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
