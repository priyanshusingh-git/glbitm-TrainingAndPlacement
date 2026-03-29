"use client";

import { useState, useEffect } from"react";
import { PageHeader, SectionHeader } from"@/components/layout/page-header"
import { Users, Building2, UserPlus, FileSpreadsheet, Send } from"lucide-react";
import { getAdminDashboardStats, AdminDashboardData } from"@/services/dashboard.service";
import { AdminOverview } from"@/modules/analytics/components/admin-overview";
import { PlacementAnalytics } from"@/modules/analytics/components/placement-analytics";
import { RecentActivity } from"@/modules/analytics/components/recent-activity";
import { StudentTable } from"@/modules/students/components/student-table";
import { CompanySection } from"@/modules/companies/components/company-section";
import { Button } from"@/components/ui/button";
import { Loader2, Plus } from"lucide-react";
import { cn } from"@/lib/utils";

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

 const quickActions = [
 { label:"New Student", icon: UserPlus, color:"text-blue-500", bg:"bg-blue-500/10" },
 { label:"Add Company", icon: Building2, color:"text-emerald-500", bg:"bg-emerald-500/10" },
 { label:"Import Data", icon: FileSpreadsheet, color:"text-amber-500", bg:"bg-amber-500/10" },
 { label:"Send Notice", icon: Send, color:"text-violet-500", bg:"bg-violet-500/10" },
 ]

 return (
 <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
 {/* Clean Dashboard Header */}
 <PageHeader
 title="Overview"
 description="Orchestrate placements, track performance, and manage operations across the platform."
 action={
 <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
 {quickActions.map((action, idx) => (
 <Button
 key={idx}
 variant="outline"
 size="sm"
 className="whitespace-nowrap bg-card/80 border-border/60 hover:bg-card-hover"
 >
 <action.icon className={cn("mr-2 h-4 w-4", action.color)} />
 {action.label}
 </Button>
 ))}
 <Button size="sm" className="whitespace-nowrap shadow-sm shadow-primary/20">
 <Plus className="mr-2 h-4 w-4" />
 Global Search
 </Button>
 </div>
 }
 />

 {/* Main Stats Grid */}
 <div className="xl:col-span-4 space-y-8 mt-2">
 <AdminOverview overview={data?.overview} />

 <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
 <div className="lg:col-span-2">
 <PlacementAnalytics analytics={data?.placementAnalytics} />
 </div>
 <RecentActivity activities={data?.recentActivity} />
 </div>
 </div>

 <div className="space-y-8 pt-4">
 <SectionHeader
 title="Active Directory"
 description="Manage registered student profiles"
 icon={<Users />}
 />
 <StudentTable />
 </div>

 <div className="space-y-8">
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
