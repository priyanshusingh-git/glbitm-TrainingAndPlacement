"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { GLBajajReloadLoader } from "@/components/ui/glbajaj-reload-loader";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles: ("STUDENT" | "ADMIN" | "TRAINER" | "RECRUITER")[];
}

function getDashboardPath(role: string) {
  switch (role) {
    case "STUDENT": return "/student";
    case "ADMIN": return "/admin";
    case "TRAINER": return "/trainer";
    case "RECRUITER": return "/recruiter";
    default: return "/";
  }
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (user && !allowedRoles.includes(user.role)) {
      router.replace(getDashboardPath(user.role));
      return;
    }
    if (user?.mustChangePassword && pathname !== "/change-password") {
      router.replace("/change-password");
      return;
    }
  }, [isLoading, isAuthenticated, user, router, pathname, allowedRoles]);

  if (isLoading) {
    return <GLBajajReloadLoader />;
  }

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role) || (user.mustChangePassword && pathname !== "/change-password")) {
    return null;
  }

  return <>{children}</>;
}
