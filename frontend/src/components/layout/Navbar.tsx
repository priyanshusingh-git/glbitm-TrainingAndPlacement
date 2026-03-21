"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { navLinks } from "@/data/landing"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("placements")
  const [progress, setProgress] = useState(0)
  const [shadowed, setShadowed] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight

      setShadowed(scrollTop > 30)
      setProgress(maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0)

      const current = [...navLinks]
        .reverse()
        .find(({ section }) => {
          const node = document.getElementById(section)
          if (!node) return false
          return node.getBoundingClientRect().top <= 140
        })

      setActiveSection(current?.section || "placements")
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isOpen)
    return () => {
      document.body.classList.remove("overflow-hidden")
    }
  }, [isOpen])

  return (
    <>
      <nav
        className={cn(
          "fixed inset-x-0 top-0 z-[600] flex h-[68px] items-center justify-between border-b border-amber-500/15 bg-brown-900/95 px-[clamp(16px,5vw,80px)] backdrop-blur-xl transition-shadow duration-300",
          shadowed && "shadow-[0_4px_40px_rgba(0,0,0,0.55)]"
        )}
      >
        <progress
          aria-hidden="true"
          className="nav-progress pointer-events-none absolute bottom-0 left-0 h-0.5 w-full"
          max={100}
          value={progress}
        />

        <Link href="/" className="inline-flex items-center gap-3 no-underline">
          <div className="relative h-10 w-[52px] overflow-hidden rounded-[10px] border border-white/10 bg-white/5 shadow-[0_4px_16px_rgba(0,0,0,0.18)]">
            <Image
              src="/glbitm-logo.png"
              alt="GL Bajaj logo"
              fill
              sizes="52px"
              className="object-cover object-center"
              priority
            />
          </div>
          <div>
            <div className="text-[13px] font-semibold leading-[1.2] text-white">GL Bajaj Institute</div>
            <div className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.25em] text-amber-300/90">Training &amp; Placement · CDC</div>
          </div>
        </Link>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsOpen((current) => !current)}
          className="grid h-11 w-11 place-items-center rounded-lg border border-white/15 bg-white/8 text-white lg:hidden"
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div className="hidden items-center lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.section}
              href={link.href}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-[12.5px] font-medium text-white/50 transition-colors hover:bg-white/7 hover:text-white",
                activeSection === link.section && "bg-white/7 text-amber-400 hover:text-amber-400"
              )}
            >
              {link.name}
            </Link>
          ))}

          <a
            href="https://www.glbitm.org/placements"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md px-2.5 py-1.5 text-[11.5px] font-medium text-white/26 transition-colors hover:text-white/55"
          >
            Brochure ↗
          </a>

          <Link
            href="/login"
            className="ml-2 inline-flex items-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 px-4 py-2 text-[12.5px] font-bold text-brown-900 shadow-[0_6px_18px_rgba(232,160,32,0.38)] transition hover:-translate-y-0.5 hover:brightness-110"
          >
            Login
          </Link>
        </div>
      </nav>

      <div
        className={cn(
          "fixed left-0 right-0 top-[68px] z-[590] border-b border-amber-500/12 bg-brown-900/99 px-5 pb-5 pt-2 backdrop-blur-xl transition-transform duration-300 lg:hidden",
          isOpen ? "translate-y-0" : "-translate-y-[115%]"
        )}
      >
        <div className="flex flex-col">
          {navLinks.map((link) => (
            <Link
              key={link.section}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex min-h-11 items-center border-b border-white/5 py-0 text-[15px] text-white/65 transition-colors last:border-b-0",
                activeSection === link.section && "text-amber-400"
              )}
            >
              {link.name}
            </Link>
          ))}

          <a
            href="https://www.glbitm.org/placements"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex min-h-11 items-center border-b border-white/5 py-0 text-[15px] text-white/65 transition-colors hover:text-white"
          >
            Brochure ↗
          </a>

          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 px-3 text-sm font-bold text-brown-900"
          >
            Login
          </Link>
        </div>
      </div>
    </>
  )
}
