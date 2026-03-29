"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronUp, House } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const DASHBOARD_PREFIXES = ["/admin", "/student", "/trainer", "/recruiter"]
const AUTH_PATHS = new Set([
  "/login",
  "/forgot-password",
  "/reset-password",
  "/change-password",
])

export function FloatingNavActions() {
  const pathname = usePathname()
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 280)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (
    DASHBOARD_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    AUTH_PATHS.has(pathname)
  ) {
    return null
  }

  const isHomePage = pathname === "/"

  return (
    <div className="fixed bottom-6 right-6 z-[640] flex flex-col items-end gap-3">
      {!isHomePage && (
        <Link
          href="/"
          aria-label="Go to first page"
          className="grid h-12 w-12 place-items-center rounded-full border border-amber-500/20 bg-brown-900/92 text-amber-400 shadow-[0_10px_28px_rgba(14,8,3,0.28)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-brown-800 hover:text-amber-300"
        >
          <House className="h-5 w-5" />
          <span className="sr-only">Go to first page</span>
        </Link>
      )}

      <button
        type="button"
        aria-label="Go to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={cn(
          "grid h-12 w-12 place-items-center rounded-full border border-amber-500/20 bg-gradient-to-br from-amber-500 to-amber-700 text-brown-900 shadow-[0_12px_32px_rgba(232,160,32,0.35)] transition duration-200 hover:-translate-y-0.5 hover:brightness-110",
          showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        )}
      >
        <ChevronUp className="h-5 w-5" />
        <span className="sr-only">Go to top</span>
      </button>
    </div>
  )
}
