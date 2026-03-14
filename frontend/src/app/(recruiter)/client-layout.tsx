"use client";

import React from"react"
import { DashboardLayout } from"@/components/layout/dashboard/dashboard-layout"
import { useAuth } from"@/contexts/auth-context"
import { usePathname } from"next/navigation"
import { RouteGuard } from"@/modules/auth/components/route-guard"
import { API_BASE_URL } from"@/lib/api"

export default function TrainerClientLayout({
 children,
 defaultCollapsed = false
}: {
 children: React.ReactNode
 defaultCollapsed?: boolean
}) {
 const { user } = useAuth();
 const adaptedUser = {
 name: user?.name ||"Trainer",
 email: user?.email ||"",
 initials: user?.name ? user.name.split("").map((n) => n[0]).join("").substring(0, 2) :"TR",
 avatar: user?.photoUrl
 ? (user.photoUrl.startsWith('http') ? user.photoUrl : `${API_BASE_URL}${user.photoUrl}`)
 : undefined,
 };

 return (
 <RouteGuard allowedRoles={["TRAINER"]}>
 <DashboardLayout role="trainer" user={adaptedUser} defaultCollapsed={defaultCollapsed}>
 {children}
 </DashboardLayout>
 </RouteGuard>
 )
}
