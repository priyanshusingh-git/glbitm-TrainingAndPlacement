"use client";

import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, Briefcase, Trophy, CheckCircle, BookOpen, Building2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/lib/utils";
import { api } from "@/lib/api";
import { PlacementPipeline } from "./placement-pipeline";
import { cn } from "@/lib/utils";
import { getStudentGreeting, dashboardBanner, statCards } from "@/data/dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { getAblyClient } from "@/contexts/ably-context";

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await api.get("/dashboard/student");
      setDashboardData(data);
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  // Listen for real-time updates for this specific student
  useEffect(() => {
    if (!user?.id) return;

    const ablyClient = getAblyClient();
    if (!ablyClient) return;

    const channel = ablyClient.channels.get(`student-${user.id}`);
    const onUpdate = () => fetchData(true);
    
    channel.subscribe("data-update", onUpdate);
    return () => {
      channel.unsubscribe("data-update", onUpdate);
    };
  }, [user?.id, fetchData]);

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  const { timeOfDay, name } = getStudentGreeting(user?.name);

  // Map hero metrics securely from data + api response
  const heroMetrics = [
    { label: dashboardBanner.metrics[0].label, value: dashboardData?.overview?.cgpa ?? dashboardBanner.metrics[0].fallback },
    { label: dashboardBanner.metrics[1].label, value: dashboardData?.overview?.attendancePercentage ? `${dashboardData.overview.attendancePercentage}${dashboardBanner.metrics[1].suffix}` : dashboardBanner.metrics[1].fallback },
    { label: dashboardBanner.metrics[2].label, value: dashboardData?.placements?.length ?? dashboardBanner.metrics[2].fallback },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Dynamic Header Unified with Design System */}
      <div className="animate-fade-up stagger-1">
        <PageHeader 
          title="Dashboard Overview"
          description={`Welcome back, ${name} — ${dashboardBanner.status}`}
          action={
            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search drive or resource..." 
                  className="h-10 w-48 lg:w-64 rounded-sm border border-border/60 bg-white pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-medium"
                />
              </div>
              <button 
                onClick={() => router.push('/student/profile')} 
                className="transition-transform hover:scale-105 active:scale-95 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-sm"
              >
                <Avatar className="h-10 w-10 rounded-sm border border-border/60 shadow-sm">
                  <AvatarImage src={getImageUrl(user?.photoUrl)} alt={user?.name} className="object-cover" />
                  <AvatarFallback className="rounded-sm bg-brown-900 font-display font-bold text-brown-50">
                    {user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || "RS"}
                  </AvatarFallback>
                </Avatar>
              </button>
            </div>
          }
        />
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-md bg-brown-900 bg-hero-gradient p-5 md:p-8 text-white shadow-lg shadow-brown-900/10 transition-base hover:shadow-brown-900/20 animate-fade-up stagger-2">
        <div className="absolute inset-0 bg-diagonal-lines opacity-20" />
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="flex flex-col gap-2">
            <span className="eyebrow-dark">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 mr-2 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              {dashboardBanner.status}
            </span>
            <h1 className="font-display text-4xl font-bold md:text-5xl text-white">
              {timeOfDay}, <span className="italic text-amber-500">{name}!</span>
            </h1>
            <p className="text-lg text-white/70 max-w-xl">
              {dashboardData?.overview?.message || dashboardBanner.message}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            {heroMetrics.map((metric) => (
              <div key={metric.label} className="stat-bubble bg-white/5 border-white/10">
                <span className="font-display text-2xl font-bold text-amber-500 tabular-nums">{metric.value}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">{metric.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 animate-fade-up stagger-3">
        {statCards.map((cardConfig) => {
          let value = dashboardData?.overview?.[cardConfig.id] ?? "—";
          if (cardConfig.suffix && value !== "—") value = `${value}${cardConfig.suffix}`;

          return (
            <StatCard
              key={cardConfig.id}
              icon={getIcon(cardConfig.tag, cardConfig.badgeColor)}
              label={cardConfig.label}
              value={value.toString()}
              badge={cardConfig.badge}
              badgeColor={cardConfig.badgeColor}
            />
          )
        })}
      </div>

      {/* Pipeline and Upcoming Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 animate-fade-up stagger-4">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="section-h3 text-brown-800">Placement Pipeline</h3>
            <button className="text-xs font-bold text-brown-800 hover:text-amber-500 hover:underline transition-colors">View Details</button>
          </div>
          <PlacementPipeline 
            company={dashboardData?.currentPipeline?.company || "No active pipeline"} 
            role={dashboardData?.currentPipeline?.role || ""} 
            stages={dashboardData?.currentPipeline?.stages || []} 
          />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="section-h3 text-brown-800">Upcoming Drives</h3>
            <button className="text-xs font-bold text-brown-800 hover:text-amber-500 hover:underline transition-colors">View All</button>
          </div>
          <div className="card-base p-6 flex flex-col gap-4">
            {dashboardData?.placements?.length > 0 ? (
              dashboardData.placements.slice(0, 3).map((drive: any) => (
                <DriveItem
                  key={drive.id}
                  name={drive.company?.name || "Company"}
                  role={drive.role}
                  package={drive.ctc}
                  date={drive.date ? new Date(drive.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "TBD"}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming drives at the moment.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function getIcon(tag: string, badgeColor: string) {
  const colorClass = badgeColor === 'amber' ? 'text-amber-500' : 'text-brown-800';
  const iconProps = { className: cn("h-6 w-6", colorClass) };

  switch (tag) {
    case 'Trophy': return <Trophy {...iconProps} />;
    case 'Briefcase': return <Briefcase {...iconProps} />;
    case 'CheckCircle': return <CheckCircle {...iconProps} />;
    case 'BookOpen': return <BookOpen {...iconProps} />;
    default: return <Briefcase {...iconProps} />;
  }
}

function StatCard({ icon, label, value, badge, badgeColor }: { icon: React.ReactNode, label: string, value: string, badge: string, badgeColor: string }) {
  const badgeColors: Record<string, string> = {
    amber: "bg-amber-500/10 text-amber-700 ring-amber-500/20",
    brown: "bg-brown-800/5 text-brown-800 ring-brown-800/20",
    muted: "bg-muted text-muted-foreground ring-border/50",
  }

  return (
    <div className="dashboard-card flex flex-col gap-4 transition-all duration-300 hover:shadow-md hover:border-brown-800/30 hover:-translate-y-0.5 group">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-muted/40 group-hover:bg-brown-800/5 transition-colors">
          {icon}
        </div>
        <span className={cn("rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset", badgeColors[badgeColor] || badgeColors.muted)}>
          {badge}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="font-display text-4xl font-bold tabular-nums text-foreground">{value}</span>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}

function DriveItem({ name, role, package: pkg, date }: { name: string, role: string, package: string, date: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 pb-4 last:border-0 last:pb-0 group">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted/30 group-hover:bg-brown-800/10 transition-colors">
           <Building2 className="h-5 w-5 text-muted-foreground group-hover:text-brown-800 transition-colors" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground">{name}</span>
          <span className="text-[11px] text-muted-foreground">{role}</span>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm font-bold text-amber-500 tabular-nums">{pkg}</span>
        <span className="text-[10px] text-muted-foreground tabular-nums">{date}</span>
      </div>
    </div>
  )
}
