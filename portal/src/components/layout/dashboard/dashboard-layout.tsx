"use client"

import React, { useState, createContext, useContext, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/layout/dashboard/sidebar"
import { Header } from "@/components/layout/dashboard/header"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { LoadingGrid, LoadingTable, LoadingProfile, HeroBannerSkeleton, AnalyticsSkeleton } from "@/components/ui/loading-states"

interface SidebarContextType {
  collapsed: boolean
  setCollapsed: (value: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (value: boolean) => void
  expandOnHover: boolean
  setExpandOnHover: (value: boolean) => void
  navigatingPath: string | null
  setNavigatingPath: (path: string | null) => void
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  setCollapsed: () => { },
  mobileOpen: false,
  setMobileOpen: () => { },
  expandOnHover: false,
  setExpandOnHover: () => { },
  navigatingPath: null,
  setNavigatingPath: () => { },
})

export const useSidebar = () => useContext(SidebarContext)

const routeMetadata: Record<string, { title: string; description: string; type: "grid" | "table" | "profile" | "analytics" }> = {
  "/student": { title: "Overview", description: "Welcome back! Here is a summary of your placement & training progress.", type: "grid" },
  "/student/training": { title: "Training", description: "View your training sessions, attendance, and schedules.", type: "grid" },
  "/student/bootcamps": { title: "Bootcamps", description: "Intensive training programs to accelerate your skills.", type: "grid" },
  "/student/tests": { title: "Tests & Results", description: "View your performance and upcoming assessments.", type: "grid" },
  "/student/placements": { title: "Placement Drives", description: "Explore active campus drives, view job requirements, and track your applications.", type: "grid" },
  "/student/profile": { title: "My Profile", description: "Manage your personal information, academic details, and resume.", type: "profile" },
  "/student/portfolio/projects": { title: "My Projects", description: "Showcase your software engineering projects to recruiters.", type: "grid" },
  "/student/portfolio/certifications": { title: "Certifications", description: "Add professional certificates to validate your skills.", type: "grid" },
  "/student/portfolio/coding-profiles": { title: "Coding Profiles", description: "Connect LeetCode, CodeChef, and HackerRank profiles.", type: "grid" },
  "/student/portfolio/hackathons": { title: "Hackathons", description: "Log your competitive programming and hackathon achievements.", type: "grid" },
  "/student/updates": { title: "Updates", description: "Placement, training, and account activity in one focused feed.", type: "table" },
  "/admin": { title: "Overview", description: "Orchestrate placements, track performance, and manage operations across the platform.", type: "grid" },
  "/admin/analytics": { title: "Analytics & Reports", description: "Data-driven insights into placement performance and student progress.", type: "analytics" },
  "/admin/students": { title: "Manage Students", description: "Manage student records, track placement status, and academic progress.", type: "table" },
  "/admin/trainers": { title: "Manage Trainers", description: "Manage trainer assignments, schedules, and cohort allocations.", type: "table" },
  "/admin/training": { title: "Training Groups", description: "Configure student training groups and branch cohorts.", type: "grid" },
  "/admin/sessions": { title: "Manage Sessions", description: "Schedule, manage, and monitor training cohorts and sessions across departments.", type: "grid" },
  "/admin/bootcamps": { title: "Bootcamps Management", description: "Schedule and manage intensive training programs for student cohorts.", type: "table" },
  "/admin/tests": { title: "Tests & Assessments", description: "Create and publish technical and aptitude assessments.", type: "grid" },
  "/admin/companies": { title: "Companies", description: "Manage recruiting companies and corporate relationships.", type: "grid" },
  "/admin/placements": { title: "Placements", description: "Manage active recruitment drives, applications, and offers.", type: "grid" },
  "/admin/recruiters": { title: "Recruiters", description: "Manage company recruiter accounts and access credentials.", type: "table" },
  "/admin/activity": { title: "Activity Log", description: "Audit trail of system events, student actions, and admin operations.", type: "table" },
  "/admin/settings": { title: "Settings", description: "Configure system administration preferences and portal controls.", type: "grid" },
  "/admin/updates": { title: "Updates & Notices", description: "Broadcast updates and notifications to students and faculty.", type: "table" },
  "/recruiter": { title: "Company Dashboard", description: "Welcome back to your recruitment workspace.", type: "grid" },
  "/trainer": { title: "Trainer Dashboard", description: "Manage your assigned training groups, student attendance, and daily session schedules.", type: "grid" },
  "/trainer/groups": { title: "My Training Groups", description: "View student cohorts and training progress.", type: "grid" },
  "/trainer/schedule": { title: "My Schedule", description: "View upcoming training sessions and timetable.", type: "grid" },
  "/trainer/profile": { title: "Trainer Profile", description: "Manage your trainer credentials and account info.", type: "profile" },
  "/trainer/settings": { title: "Trainer Settings", description: "Configure your notification preferences and schedule availability.", type: "grid" },
};

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
  const pathname = usePathname()
  const [collapsed, setCollapsedState] = useState(defaultCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandOnHover, setExpandOnHoverState] = useState(false)
  const [navigatingPath, setNavigatingPath] = useState<string | null>(null)

  // Clear instant navigating state as soon as pathname updates
  useEffect(() => {
    setNavigatingPath(null)
  }, [pathname])

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

  const isNavigating = Boolean(navigatingPath && navigatingPath !== pathname)
  const navMeta = isNavigating && navigatingPath ? routeMetadata[navigatingPath] : null

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        setCollapsed,
        mobileOpen,
        setMobileOpen,
        expandOnHover,
        setExpandOnHover,
        navigatingPath,
        setNavigatingPath,
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
            {isNavigating && navMeta ? (
              <div className="flex flex-col gap-8 pb-12 animate-fade-up">
                {navigatingPath === "/student" ? (
                  <>
                    <HeroBannerSkeleton />
                    <LoadingGrid items={4} />
                  </>
                ) : navigatingPath === "/admin/analytics" ? (
                  <>
                    <PageHeader title={navMeta.title} description={navMeta.description} />
                    <AnalyticsSkeleton />
                  </>
                ) : (
                  <>
                    <PageHeader title={navMeta.title} description={navMeta.description} />
                    {navMeta.type === "table" ? (
                      <LoadingTable rows={6} cols={5} />
                    ) : navMeta.type === "profile" ? (
                      <LoadingProfile />
                    ) : (
                      <LoadingGrid items={6} />
                    )}
                  </>
                )}
              </div>
            ) : (
              children
            )}
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
      </div>
    </SidebarContext.Provider>
  )
}
