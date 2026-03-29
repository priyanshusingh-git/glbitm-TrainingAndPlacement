"use client";

import React from"react"
import { DashboardLayout } from"@/components/layout/dashboard/dashboard-layout"
import { useAuth } from"@/contexts/auth-context"
import { usePathname } from"next/navigation"
import { RouteGuard } from"@/modules/auth/components/route-guard"
import { getImageUrl } from"@/lib/utils"

export default function TrainerClientLayout({
 children,
 defaultCollapsed = false
}: {
 children: React.ReactNode
 defaultCollapsed?: boolean
}) {
 const { user } = useAuth();
 const pathname = usePathname();
 const isRecruiterRoute = pathname.startsWith("/recruiter");
 const adaptedUser = {
 name: user?.name || (isRecruiterRoute ? "Recruiter" : "Trainer"),
 email: user?.email ||"",
 initials: user?.name ? user.name.split("").map((n) => n[0]).join("").substring(0, 2) : isRecruiterRoute ? "RC" : "TR",
    avatar: getImageUrl(user?.photoUrl),
 };
 const allowedRoles: ("TRAINER" | "RECRUITER")[] = isRecruiterRoute ? ["RECRUITER"] : ["TRAINER"];
 const dashboardRole = isRecruiterRoute ? "recruiter" as const : "trainer" as const;

 return (
 <RouteGuard allowedRoles={allowedRoles}>
 <DashboardLayout role={dashboardRole} user={adaptedUser} defaultCollapsed={defaultCollapsed}>
 {children}
 </DashboardLayout>
 </RouteGuard>
 )
}
