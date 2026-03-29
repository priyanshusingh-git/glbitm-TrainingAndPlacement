"use client";

import React from"react"
import { DashboardLayout } from"@/components/layout/dashboard/dashboard-layout"
import { useAuth } from"@/contexts/auth-context"
import { RouteGuard } from"@/modules/auth/components/route-guard"
import { getImageUrl } from"@/lib/utils"

export default function AdminClientLayout({
 children,
 defaultCollapsed = false
}: {
 children: React.ReactNode
 defaultCollapsed?: boolean
}) {
 const { user } = useAuth();

 const adaptedUser = {
 name: user?.name ||"Admin",
 email: user?.email ||"",
 initials: user?.name ? user.name.split("").map((n) => n[0]).join("").substring(0, 2) :"AD",
    avatar: getImageUrl(user?.photoUrl),
 };

 return (
 <RouteGuard allowedRoles={["ADMIN"]}>
 <DashboardLayout role="admin" user={adaptedUser} defaultCollapsed={defaultCollapsed}>
 {children}
 </DashboardLayout>
 </RouteGuard>
 )
}
