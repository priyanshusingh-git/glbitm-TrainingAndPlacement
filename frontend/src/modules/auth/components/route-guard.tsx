"use client"

import { useEffect } from"react"
import { useRouter, usePathname } from"next/navigation"
import { useAuth } from"@/contexts/auth-context"

interface RouteGuardProps {
 children: React.ReactNode
 allowedRoles: ("STUDENT" |"ADMIN" |"TRAINER" |"RECRUITER")[]
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
 const { user, isAuthenticated, isLoading } = useAuth()
 const router = useRouter()
 const pathname = usePathname()

 useEffect(() => {
 if (isLoading) return

 // 1. Not Authenticated -> Redirect to Login
 if (!isAuthenticated) {
 router.replace("/login")
 return
 }

 // 2. Authenticated but Wrong Role -> Redirect to Dashboard
 if (user && !allowedRoles.includes(user.role)) {
 // Prevent infinite loops if user is already on a page but wrong role
 // e.g. Student tries to access /admin -> send to /student
 if (user.role ==="STUDENT") {
 router.replace("/student")
 } else if (user.role ==="ADMIN") {
 router.replace("/admin")
 } else if (user.role ==="TRAINER") {
 router.replace("/trainer")
 } else if (user.role ==="RECRUITER") {
 router.replace("/recruiter")
 } else {
 router.replace("/") // Fallback
 }
 return
 }

 // 3. Enforce Password Change
 if (user && user.mustChangePassword) {
 // Check against both paths during transition or just the new one
 if (pathname !=="/change-password") {
 router.replace("/change-password")
 }
 return
 }
 }, [isAuthenticated, isLoading, user, router, pathname, allowedRoles])

 // Show loading state while checking
 if (isLoading) {
 return <div className="flex h-screen items-center justify-center">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown-800"></div>
 </div>
 }

 // Don't render anything if not authenticated or wrong role
 if (!isAuthenticated || (user && !allowedRoles.includes(user.role))) {
 return null
 }

 // Strict Blocking: If password change is required, DO NOT render the protected content (children).
 // Only allow rendering if we are already on the change-password page.
 if (user && user.mustChangePassword && pathname !=="/change-password") {
 return null
 }

 return <>{children}</>
}
