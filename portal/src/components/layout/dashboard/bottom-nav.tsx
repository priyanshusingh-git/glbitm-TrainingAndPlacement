"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { studentNavItems } from "@/config/nav-items"

export function StudentBottomNav() {
  const pathname = usePathname()
  
  // Extract items marked for bottom navigation
  const bottomNavItems = studentNavItems.filter((item: any) => item.bottomNav)

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5 h-16">
        {bottomNavItems.map((item: any) => {
          const isActive = pathname === item.href
          const label = item.bottomNavLabel || item.label
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
              <span className="truncate">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
