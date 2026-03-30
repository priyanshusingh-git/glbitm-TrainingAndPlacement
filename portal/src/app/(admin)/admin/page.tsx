"use client";

import { useState, useEffect } from "react";
import { PageHeader, SectionHeader } from "@/components/layout/page-header"
import { Users, Building2, UserPlus, FileSpreadsheet, Send } from "lucide-react";
import { getAdminDashboardStats, AdminDashboardData } from "@/services/dashboard.service";
import { AdminOverview } from "@/modules/analytics/components/admin-overview";
import { PlacementAnalytics } from "@/modules/analytics/components/placement-analytics";
import { RecentActivity } from "@/modules/analytics/components/recent-activity";
import { StudentTable } from "@/modules/students/components/student-table";
import { CompanySection } from "@/modules/companies/components/company-section";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminQuickActions } from "@/data/dashboard";

const iconMap: Record<string, any> = { UserPlus, Building2, FileSpreadsheet, Send };

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await getAdminDashboardStats();
        setData(stats);
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Clean Dashboard Header */}
      <div className="animate-fade-up stagger-1">
        <PageHeader
          title="Overview"
          description="Orchestrate placements, track performance, and manage operations across the platform."
          action={
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {adminQuickActions.map((action, idx) => {
                const IconComponent = iconMap[action.iconName];
                return (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap bg-card/80 border-border/60 hover:bg-card-hover hover:border-brown-800/20 transition-all shadow-sm group"
                  >
                    <div className={cn("mr-2 flex h-5 w-5 items-center justify-center rounded-sm transition-colors", action.bgClass, "group-hover:bg-brown-800/15")}>
                      <IconComponent className={cn("h-3.5 w-3.5", action.colorClass)} />
                    </div>
                    {action.label}
                  </Button>
                );
              })}
              <Button size="sm" className="whitespace-nowrap shadow-sm shadow-amber-500/20">
                <Plus className="mr-2 h-4 w-4" />
                Global Search
              </Button>
            </div>
          }
        />
      </div>

      {/* Main Stats Grid */}
      <div className="xl:col-span-4 space-y-8 mt-2 animate-fade-up stagger-2">
        <AdminOverview overview={data?.overview} />

        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PlacementAnalytics analytics={data?.placementAnalytics} />
          </div>
          <RecentActivity activities={data?.recentActivity} />
        </div>
      </div>

      <div className="space-y-8 pt-4 animate-fade-up stagger-3">
        <SectionHeader
          title="Active Directory"
          description="Manage registered student profiles"
          icon={<Users />}
        />
        <StudentTable />
      </div>

      <div className="space-y-8 animate-fade-up stagger-4">
        <SectionHeader
          title="Corporate Hub"
          description="Registered placement partners"
          icon={<Building2 />}
        />
        <CompanySection companies={data?.companies} />
      </div>
    </div>
  )
}
