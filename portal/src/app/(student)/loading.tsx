"use client";

import { usePathname } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingGrid, LoadingTable, LoadingProfile } from "@/components/ui/loading-states";

const studentRouteMeta: Record<string, { title: string; description: string; type: "grid" | "table" | "profile" }> = {
  "/student": {
    title: "Overview",
    description: "Welcome back! Here is a summary of your placement & training progress.",
    type: "grid",
  },
  "/student/training": {
    title: "Training",
    description: "View your training sessions, attendance, and schedules.",
    type: "grid",
  },
  "/student/bootcamps": {
    title: "Bootcamps",
    description: "Intensive training programs to accelerate your skills.",
    type: "grid",
  },
  "/student/tests": {
    title: "Tests & Results",
    description: "View your performance and upcoming assessments.",
    type: "grid",
  },
  "/student/placements": {
    title: "Placement Drives",
    description: "Explore active campus drives, view job requirements, and track your applications.",
    type: "grid",
  },
  "/student/profile": {
    title: "My Profile",
    description: "Manage your personal information, academic details, and resume.",
    type: "profile",
  },
  "/student/portfolio/projects": {
    title: "My Projects",
    description: "Showcase your software engineering projects to recruiters.",
    type: "grid",
  },
  "/student/portfolio/certifications": {
    title: "Certifications",
    description: "Add professional certificates to validate your skills.",
    type: "grid",
  },
  "/student/portfolio/coding-profiles": {
    title: "Coding Profiles",
    description: "Connect LeetCode, CodeChef, and HackerRank profiles.",
    type: "grid",
  },
  "/student/portfolio/hackathons": {
    title: "Hackathons",
    description: "Log your competitive programming and hackathon achievements.",
    type: "grid",
  },
  "/student/updates": {
    title: "Updates",
    description: "Placement, training, and account activity in one focused feed.",
    type: "table",
  },
};

export default function StudentLoading() {
  const pathname = usePathname();
  const meta = studentRouteMeta[pathname] || {
    title: "Loading...",
    description: "Fetching your content, please wait...",
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
