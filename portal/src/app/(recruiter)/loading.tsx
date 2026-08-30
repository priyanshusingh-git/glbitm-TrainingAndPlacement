"use client";

import { usePathname } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingGrid, LoadingTable, LoadingProfile } from "@/components/ui/loading-states";

const recruiterRouteMeta: Record<string, { title: string; description: string; type: "grid" | "table" | "profile" }> = {
  "/recruiter": {
    title: "Company Dashboard",
    description: "Welcome back to your recruitment workspace.",
    type: "grid",
  },
  "/trainer": {
    title: "Trainer Dashboard",
    description: "Manage your assigned training groups, student attendance, and daily session schedules.",
    type: "grid",
  },
  "/trainer/groups": {
    title: "My Training Groups",
    description: "View student cohorts and training progress.",
    type: "grid",
  },
  "/trainer/schedule": {
    title: "My Schedule",
    description: "View upcoming training sessions and timetable.",
    type: "grid",
  },
  "/trainer/profile": {
    title: "Trainer Profile",
    description: "Manage your trainer credentials and account info.",
    type: "profile",
  },
  "/trainer/settings": {
    title: "Trainer Settings",
    description: "Configure your notification preferences and schedule availability.",
    type: "grid",
  },
};

export default function RecruiterLoading() {
  const pathname = usePathname();
  const meta = recruiterRouteMeta[pathname] || {
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
      ) : (
        <LoadingGrid items={6} />
      )}
    </div>
  );
}
