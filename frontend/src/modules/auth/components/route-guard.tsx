"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface RouteGuardProps {
  children: React.ReactNode
  allowedRoles: ("STUDENT" | "ADMIN" | "TRAINER" | "RECRUITER")[]
}

function getDashboardPath(role: string) {
  switch (role) {
    case "STUDENT": return "/student"
    case "ADMIN": return "/admin"
    case "TRAINER": return "/trainer"
    case "RECRUITER": return "/recruiter"
    default: return "/"
  }
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) { router.replace("/login"); return }
    if (user && !allowedRoles.includes(user.role)) {
      router.replace(getDashboardPath(user.role)); return
    }
    if (user?.mustChangePassword && pathname !== "/change-password") {
      router.replace("/change-password"); return
    }
  }, [isLoading, isAuthenticated, user, router, pathname, allowedRoles])

  // Show spinner for ALL non-confirmed states — never render children until sure
  if (isLoading) return <Spinner />
  if (!isAuthenticated) return <Spinner />   // Redirect is in flight
  if (!user || !allowedRoles.includes(user.role)) return <Spinner />
  if (user.mustChangePassword && pathname !== "/change-password") return <Spinner />

  return <>{children}</>
}

function Spinner() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown-800"></div>
    </div>
  )
}
