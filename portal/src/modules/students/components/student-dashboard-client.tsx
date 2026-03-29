"use client";

import { useAuth } from"@/contexts/auth-context";
import { StudentOverview } from"@/modules/students/components/student-overview"
import { TrainingSection } from"@/modules/students/components/training-section"
import { TestsSection } from"@/modules/students/components/tests-section"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, Bell, Briefcase, Trophy, CheckCircle, BookOpen, Building2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/lib/utils";
import { api } from "@/lib/api";
import { PlacementPipeline } from "./placement-pipeline";
import { cn } from "@/lib/utils";

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get("/dashboard/student");
        setDashboardData(data);
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
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
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-300">
      {/* Top Bar for Desktop */}
      <div className="hidden md:flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="section-h2">Dashboard Overview</h2>
          <p className="text-sm text-muted-foreground">{`Welcome back, ${user?.name?.split(' ')[0]} — Placement Season 2024-25`}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="h-10 w-64 rounded-sm border border-border/60 bg-white pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <button onClick={() => router.push('/student/profile')} className="transition-transform hover:scale-105 active:scale-95">
            <Avatar className="h-10 w-10 rounded-sm border border-border/60 shadow-sm">
              <AvatarImage src={getImageUrl(user?.photoUrl)} alt={user?.name} className="object-cover" />
              <AvatarFallback className="rounded-sm bg-brown-900 font-display font-bold text-cream">
                {user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || "RS"}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-xl bg-brown-900 bg-hero-gradient p-5 md:p-8 text-white shadow-lg transition-base hover:shadow-brown-900/20">
        <div className="absolute inset-0 bg-diagonal-lines opacity-20" />
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="flex flex-col gap-2">
            <span className="eyebrow-dark">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 mr-2 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              Placement Season Active
            </span>
            <h1 className="font-display text-4xl font-bold md:text-5xl text-white">
              {(() => {
                const hour = new Date().getHours();
                if (hour < 12) return "Good morning";
                if (hour < 17) return "Good afternoon";
                return "Good evening";
              })()}, <span className="italic text-amber-500">{user?.name?.split(' ')[0] || "Student"}!</span>
            </h1>
            <p className="text-lg text-white/70 max-w-xl">
              {dashboardData?.overview?.message || "Welcome to your placement dashboard."}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            {[
              { label: "CGPA", value: dashboardData?.overview?.cgpa ?? "—" },
              { label: "Attendance", value: dashboardData?.overview?.attendancePercentage ? `${dashboardData.overview.attendancePercentage}%` : "—" },
              { label: "Applied", value: dashboardData?.placements?.length ?? 0 },
            ].map((metric) => (
              <div key={metric.label} className="stat-bubble bg-white/5 border-white/10">
                <span className="font-display text-2xl font-bold text-amber-500">{metric.value}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">{metric.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Trophy className="h-6 w-6 text-amber-500" />}
          label="Training Level"
          value={dashboardData?.overview?.trainingLevel || "—"}
          badge="Progress"
          badgeColor="amber"
        />
        <StatCard
          icon={<Briefcase className="h-6 w-6 text-amber-500" />}
          label="Drives Applied"
          value={dashboardData?.overview?.eligibleDrives ?? "—"}
          badge="Active"
          badgeColor="amber"
        />
        <StatCard
          icon={<CheckCircle className="h-6 w-6 text-muted-foreground" />}
          label="Avg Test Score"
          value={dashboardData?.overview?.avgTestScore ? `${dashboardData.overview.avgTestScore}%` : "—"}
          badge="Score"
          badgeColor="muted"
        />
        <StatCard
          icon={<BookOpen className="h-6 w-6 text-muted-foreground" />}
          label="Problems Solved"
          value={dashboardData?.overview?.problemsSolved ?? "—"}
          badge="Coding"
          badgeColor="muted"
        />
      </div>

      {/* Pipeline and Upcoming Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Mock pipeline remains using local data if it's too complex to map, but user didn't specify refactoring pipelineData */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold font-display">{`Placement Pipeline`}</h3>
            <button className="text-xs font-bold text-primary hover:underline">View Details</button>
          </div>
          <PlacementPipeline 
            company={dashboardData?.currentPipeline?.company || "No active pipeline"} 
            role={dashboardData?.currentPipeline?.role || ""} 
            stages={dashboardData?.currentPipeline?.stages || []} 
          />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-display">Upcoming Drives</h3>
            <button className="text-xs font-bold text-primary hover:underline">View All</button>
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

function getIcon(tag: string, color: string) {
  const colorClass = color === 'amber' || color === 'blue'
    ? 'text-amber-500'
    : 'text-muted-foreground';
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
    amber: "bg-amber-500/10 text-amber-700",
    muted: "bg-muted text-muted-foreground",
    // keep others as fallback mapped to muted
    blue: "bg-muted text-muted-foreground",
    emerald: "bg-muted text-muted-foreground",
    indigo: "bg-muted text-muted-foreground",
  }

  return (
    <div className="dashboard-card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/30">
          {icon}
        </div>
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ring-inset", badgeColors[badgeColor] || badgeColors.muted)}>
          {badge}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="font-display text-4xl font-bold">{value}</span>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
    </div>
  )
}

function DriveItem({ name, role, package: pkg, date }: { name: string, role: string, package: string, date: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 pb-4 last:border-0 last:pb-0">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/30">
           <Building2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold">{name}</span>
          <span className="text-[11px] text-muted-foreground">{role}</span>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm font-bold text-emerald-600">{pkg}</span>
        <span className="text-[10px] text-muted-foreground">{date}</span>
      </div>
    </div>
  )
}
