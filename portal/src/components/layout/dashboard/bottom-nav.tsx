"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Briefcase, BookOpen, FileText, User } from "lucide-react"
import { cn } from "@/lib/utils"

const STUDENT_BOTTOM_NAV = [
  { label: "Home",     href: "/student",            icon: LayoutDashboard },
  { label: "Drives",   href: "/student/placements", icon: Briefcase       },
  { label: "Training", href: "/student/training",   icon: BookOpen        },
  { label: "Tests",    href: "/student/tests",      icon: FileText        },
  { label: "Profile",  href: "/student/profile",    icon: User            },
]

export function StudentBottomNav() {
  const pathname = usePathname()
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5 h-16">
        {STUDENT_BOTTOM_NAV.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[10px] font-medium min-h-[44px] transition-all active:scale-95",
                isActive ? "text-amber-500" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-amber-500")} />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
