"use client"

import React, { useState, createContext, useContext, useEffect } from "react"
import { Sidebar } from "@/components/layout/dashboard/sidebar"
import { Header } from "@/components/layout/dashboard/header"
import { DesignInspector } from "@/components/layout/dashboard/design-inspector"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarContextType {
  collapsed: boolean
  setCollapsed: (value: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (value: boolean) => void
  expandOnHover: boolean
  setExpandOnHover: (value: boolean) => void
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => { },
  mobileOpen: false,
  setMobileOpen: () => { },
  expandOnHover: false,
  setExpandOnHover: () => { },
})

export const useSidebar = () => useContext(SidebarContext)

interface DashboardLayoutProps {
  children: React.ReactNode
  role: "student" | "admin" | "trainer" | "recruiter"
  user: {
    name: string
    email: string
    avatar?: string
    initials: string
  }
  headerAction?: React.ReactNode
  defaultCollapsed?: boolean
}

export function DashboardLayout({ children, role, user, headerAction, defaultCollapsed = false }: DashboardLayoutProps) {
  const [collapsed, setCollapsedState] = useState(defaultCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandOnHover, setExpandOnHoverState] = useState(false)

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedExpand = localStorage.getItem("sidebar-expand-on-hover")
    if (savedExpand !== null) {
      setExpandOnHoverState(savedExpand === "true")
    }
  }, [])

  const setExpandOnHover = (value: boolean) => {
    setExpandOnHoverState(value)
    localStorage.setItem("sidebar-expand-on-hover", String(value))
  }

  const setCollapsed = (value: boolean) => {
    setCollapsedState(value)
    document.cookie = `sidebar-collapsed=${value}; path=/; max-age=31536000; SameSite=Lax`
  }

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        setCollapsed,
        mobileOpen,
        setMobileOpen,
        expandOnHover,
        setExpandOnHover,
      }}
    >
      <div className="dashboard-canvas min-h-screen">
        <Sidebar role={role} />
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            collapsed ? "md:ml-16" : "md:ml-64",
            "ml-0"
          )}
        >
          <Header role={role} user={user} headerAction={headerAction} />
          <main className="page-shell pb-[calc(4rem+env(safe-area-inset-bottom))] pt-6 md:pb-8 md:pt-8">
            {children}
          </main>
        </div>

        {role !== "student" && (
          <div className="md:hidden fixed bottom-6 right-6 z-40">
            <Button size="icon" className="interactive h-14 w-14 rounded-full shadow-glow">
              <Plus className="h-6 w-6" />
              <span className="sr-only">Quick Action</span>
            </Button>
          </div>
        )}

        <DesignInspector />
      </div>
    </SidebarContext.Provider>
  )
}
