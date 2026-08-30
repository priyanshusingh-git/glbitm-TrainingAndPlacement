"use client";

import { usePathname } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingGrid, LoadingTable, LoadingProfile, AnalyticsSkeleton } from "@/components/ui/loading-states";

const adminRouteMeta: Record<string, { title: string; description: string; type: "grid" | "table" | "profile" | "analytics" }> = {
  "/admin": {
    title: "Overview",
    description: "Orchestrate placements, track performance, and manage operations across the platform.",
    type: "grid",
  },
  "/admin/analytics": {
    title: "Analytics & Reports",
    description: "Data-driven insights into placement performance and student progress.",
    type: "analytics",
  },
  "/admin/students": {
    title: "Manage Students",
    description: "Manage student records, track placement status, and academic progress.",
    type: "table",
  },
  "/admin/trainers": {
    title: "Manage Trainers",
    description: "Manage trainer assignments, schedules, and cohort allocations.",
    type: "table",
  },
  "/admin/training": {
    title: "Training Groups",
    description: "Configure student training groups and branch cohorts.",
    type: "grid",
  },
  "/admin/sessions": {
    title: "Manage Sessions",
    description: "Schedule, manage, and monitor training cohorts and sessions across departments.",
    type: "grid",
  },
  "/admin/bootcamps": {
    title: "Bootcamps Management",
    description: "Schedule and manage intensive training programs for student cohorts.",
    type: "table",
  },
  "/admin/tests": {
    title: "Tests & Assessments",
    description: "Create and publish technical and aptitude assessments.",
    type: "grid",
  },
  "/admin/companies": {
    title: "Companies",
    description: "Manage recruiting companies and corporate relationships.",
    type: "grid",
  },
  "/admin/placements": {
    title: "Placements",
    description: "Manage active recruitment drives, applications, and offers.",
    type: "grid",
  },
  "/admin/recruiters": {
    title: "Recruiters",
    description: "Manage company recruiter accounts and access credentials.",
    type: "table",
  },
  "/admin/activity": {
    title: "Activity Log",
    description: "Audit trail of system events, student actions, and admin operations.",
    type: "table",
  },
  "/admin/settings": {
    title: "Settings",
    description: "Configure system administration preferences and portal controls.",
    type: "grid",
  },
  "/admin/updates": {
    title: "Updates & Notices",
    description: "Broadcast updates and notifications to students and faculty.",
    type: "table",
  },
};

export default function AdminLoading() {
  const pathname = usePathname();
  const meta = adminRouteMeta[pathname] || {
    title: "Loading...",
    description: "Fetching section data, please wait...",
    type: "grid",
  };

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-up">
      <PageHeader title={meta.title} description={meta.description} />
      {meta.type === "table" ? (
        <LoadingTable rows={6} cols={5} />
      ) : meta.type === "profile" ? (
        <LoadingProfile />
      ) : meta.type === "analytics" ? (
        <AnalyticsSkeleton />
      ) : (
        <LoadingGrid items={6} />
      )}
    </div>
  );
}
