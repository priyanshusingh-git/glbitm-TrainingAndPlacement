"use client";

import React from"react"
import { DashboardLayout } from"@/components/layout/dashboard/dashboard-layout"
import { useAuth } from"@/contexts/auth-context"
import { RouteGuard } from"@/modules/auth/components/route-guard"
import { Toaster } from"@/components/ui/toaster"
import { getImageUrl } from"@/lib/utils"
import { StudentBottomNav } from"@/components/layout/dashboard/bottom-nav"
import { PWAInstallBanner } from"@/components/shared/PWAInstallBanner"

export default function StudentClientLayout({
 children,
 defaultCollapsed = false
}: {
 children: React.ReactNode
 defaultCollapsed?: boolean
}) {
 const { user } = useAuth();

 const adaptedUser = {
 name: user?.name ||"Student",
 email: user?.email ||"",
 initials: user?.name ? user.name.split("").map((n) => n[0]).join("").substring(0, 2) :"ST",
 avatar: getImageUrl(user?.photoUrl),
 };

 return (
 <RouteGuard allowedRoles={["STUDENT"]}>
 <DashboardLayout role="student" user={adaptedUser} defaultCollapsed={defaultCollapsed}>
 {children}
 </DashboardLayout>
 <StudentBottomNav />
 <PWAInstallBanner />
 <Toaster />
 </RouteGuard>
 )
}
