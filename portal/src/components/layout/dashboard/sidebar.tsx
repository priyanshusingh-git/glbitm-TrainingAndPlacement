"use client"

import { useState, useEffect } from "react"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebar } from "@/components/layout/dashboard/dashboard-layout"
import { studentNavItems, adminNavItems, trainerNavItems, recruiterNavItems } from "@/config/nav-items"
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import { LogOut, Loader2 } from "lucide-react"

interface SidebarProps {
  role: "student" | "admin" | "trainer" | "recruiter"
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen, expandOnHover, setNavigatingPath } = useSidebar()
  const { logout, isLoggingOut: authLoggingOut } = useAuth()
  const activeLoggingOut = isSigningOut || authLoggingOut;

  const navItems = role === "student"
    ? studentNavItems
    : role === "admin"
      ? adminNavItems
      : role === "recruiter"
        ? recruiterNavItems
        : trainerNavItems

  // Proactively pre-fetch all sidebar routes into browser memory on mount
  useEffect(() => {
    navItems.forEach((item: any) => {
      if (item.href) {
        router.prefetch(item.href)
      }
    })
  }, [navItems, router])

  useEffect(() => {
    setOptimisticPath(null)
  }, [pathname])

  // Close mobile nav on Escape key (accessibility — spec E.6.9)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [mobileOpen, setMobileOpen])

  const handleMouseEnter = () => {
    if (expandOnHover && collapsed) {
      setCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    if (expandOnHover && !collapsed) {
      setCollapsed(true);
    }
  };

  const handleLogout = async () => {
    if (activeLoggingOut) return;
    setIsSigningOut(true);
    try {
      await logout();
    } catch {
      setIsSigningOut(false);
    }
  };

  const NavContent = () => {
    const activePathname = optimisticPath || pathname;

    return (
      <div className="flex h-full flex-col bg-brown-900 text-white">
        <div className={cn("flex h-20 items-center transition-all duration-300", collapsed ? "justify-center" : "px-6")}>
          <Link href={role === "student" ? "/student" : role === "trainer" ? "/trainer" : role === "recruiter" ? "/recruiter" : "/admin"} className="flex items-center gap-3 overflow-hidden group">
            <div className={cn("relative shrink-0 transition-all duration-300", collapsed ? "h-10 w-10" : "h-10 w-10 ml-1")}>
              <Image 
                src="/glbitm-logo.png" 
                alt="GL Bajaj Logo" 
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-110"
                priority
              />
            </div>
            <div className={cn("flex flex-col justify-center transition-all duration-300 ml-1", (!collapsed || mobileOpen) ? "opacity-100" : "opacity-0 hidden")}>
              <span className="whitespace-nowrap text-[1.1rem] font-bold tracking-tight leading-none">GL Bajaj</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-500 mt-1.5 opacity-80 leading-none">Training & Placement</span>
            </div>
          </Link>
        </div>

        <TooltipProvider delayDuration={0}>
          <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2 custom-scrollbar" aria-label="Main Navigation">
            {navItems.map((item: any, index: number) => {
              if (item.hideInSidebar) return null;

              if (item.type === "header") {
                return (
                  <div
                    key={`header-${index}`}
                    className={cn(
                      index === 0 ? "mt-2 mb-2" : "mt-6 mb-2",
                      "px-3 transition-all duration-300",
                      (!collapsed || mobileOpen) ? "opacity-100" : "opacity-0 hidden"
                    )}
                  >
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50">
                      {item.label}
                    </h4>
                  </div>
                )
              }

              const isRootPath = item.href === "/student" || item.href === "/admin" || item.href === "/trainer" || item.href === "/recruiter";
              const isActive = isRootPath
                ? activePathname === item.href
                : activePathname === item.href || (item.items && item.items.some((subItem: any) => activePathname.startsWith(item.href) || activePathname === subItem.href));

              const isSidebarCollapsed = collapsed && !mobileOpen;

              const linkContent = (
                <Link
                  href={item.href}
                  prefetch={true}
                  onMouseEnter={() => router.prefetch(item.href)}
                  onClick={() => {
                    setOptimisticPath(item.href)
                    setMobileOpen(false)
                  }}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-md px-3 py-3 min-h-[44px] text-sm font-medium transition-all duration-200 overflow-hidden",
                    isActive
                      ? "bg-amber-500/15 text-white font-bold border border-amber-500/30"
                      : "text-white/80 hover:bg-white/10 hover:text-white",
                    isSidebarCollapsed && "justify-center px-2"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-md bg-amber-500 shadow-[0_0_10px_rgba(232,160,32,0.5)]" />
                  )}
                  <item.icon className={cn("h-5 w-5 shrink-0 transition-colors z-10", isActive ? "text-amber-500" : "text-white/70 group-hover:text-amber-400")} />
                  <span className={cn(
                    "truncate transition-all duration-300 z-10",
                    (!collapsed || mobileOpen) ? "opacity-100 max-w-[200px]" : "opacity-0 max-w-0 pointer-events-none hidden"
                  )}>
                    {item.label}
                  </span>
                  {item.count && (!collapsed || mobileOpen) && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-brown-900 z-10">
                      {item.count}
                    </span>
                  )}
                </Link>
              );

              if (isSidebarCollapsed) {
                return (
                  <Tooltip key={item.label}>
                    <TooltipTrigger asChild>
                      {linkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={14} className="bg-brown-900 text-white font-bold text-xs border border-white/10 shadow-xl px-3 py-1.5 rounded-md">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.label}>{linkContent}</div>;
            })}
          </nav>
        </TooltipProvider>

        <div className="mt-auto border-t border-white/5 p-4">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  disabled={activeLoggingOut}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-white/80 transition-all hover:bg-destructive/20 hover:text-red-300 disabled:opacity-70 disabled:cursor-not-allowed",
                    collapsed && !mobileOpen && "justify-center px-2",
                    activeLoggingOut && "bg-destructive/20 text-red-300 font-bold"
                  )}
                >
                  {activeLoggingOut ? (
                    <Loader2 className="h-5 w-5 shrink-0 animate-spin text-amber-500" />
                  ) : (
                    <LogOut className="h-5 w-5 shrink-0" />
                  )}
                  <span className={cn(
                    "truncate transition-all duration-300",
                    (!collapsed || mobileOpen) ? "opacity-100" : "opacity-0 hidden"
                  )}>
                    {activeLoggingOut ? "Signing Out..." : "Sign Out"}
                  </span>
                </button>
              </TooltipTrigger>
              {collapsed && !mobileOpen && (
                <TooltipContent side="right" sideOffset={14} className="bg-destructive text-destructive-foreground font-bold text-xs border border-destructive shadow-xl px-3 py-1.5 rounded-md">
                  {activeLoggingOut ? "Signing Out..." : "Sign Out"}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  };

  return (
    <>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-r border-sidebar-border bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Mobile navigation menu for accessing dashboard sections.
          </SheetDescription>
          <NavContent />
        </SheetContent>
      </Sheet>

      <aside
        onMouseEnter={expandOnHover ? handleMouseEnter : undefined}
        onMouseLeave={expandOnHover ? handleMouseLeave : undefined}
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-white/15 bg-brown-900 shadow-2xl transition-all duration-300 md:flex",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <NavContent />
      </aside>
    </>
  );
}
