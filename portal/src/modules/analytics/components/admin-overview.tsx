"use client"

import { BentoGrid, BentoGridItem } from"@/components/layout/dashboard/bento-grid"
import { Users, UserCheck, TrendingUp, Building2 } from"lucide-react"
import { cn } from"@/lib/utils"

interface AdminOverviewProps {
 overview?: {
 totalStudents: string;
 placedStudents: string;
 avgScore: string;
 activeCompanies: number;
 }
}

export function AdminOverview({ overview }: AdminOverviewProps) {
 const items = [
 {
 title:"Total Students",
 tone:"tone-primary",
 hover:"hover:border-primary/30",
 description: (
 <div className="flex flex-col gap-1 mt-2">
 <span className="text-2xl font-bold text-foreground">{overview?.totalStudents || 0}</span>
 <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Registered Batch</span>
 </div>
 ),
 header: <div className="tone-primary flex h-full min-h-[6rem] w-full flex-1 rounded-xl border relative overflow-hidden group/header">
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.12),transparent)]" />
    <Users className="absolute -bottom-2 -right-2 h-24 w-24 text-primary/10 group-hover/header:scale-110 transition-transform duration-500" />
 </div>,
  icon: <Users className="h-4 w-4 text-primary" />,
 className:"md:col-span-1",
 },
 {
 title:"Placed Students",
 tone:"tone-success",
 hover:"hover:border-success/30",
 description: (
 <div className="flex flex-col gap-1 mt-2">
 <span className="text-2xl font-bold text-foreground">{overview?.placedStudents || 0}</span>
 <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Successful Offers</span>
 </div>
 ),
 header: <div className="tone-success flex h-full min-h-[6rem] w-full flex-1 rounded-xl border relative overflow-hidden group/header">
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.12),transparent)]" />
 <UserCheck className="absolute -bottom-2 -right-2 h-24 w-24 text-success/10 group-hover/header:scale-110 transition-transform duration-500" />
 </div>,
 icon: <UserCheck className="h-4 w-4 text-success" />,
 className:"md:col-span-1",
 },
 {
 title:"Average Score",
 tone:"tone-accent",
 hover:"hover:border-accent/30",
 description: (
 <div className="flex flex-col gap-1 mt-2">
 <span className="text-2xl font-bold text-foreground">{overview?.avgScore || '0%'}</span>
 <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Assessment Mean</span>
 </div>
 ),
 header: <div className="tone-accent flex h-full min-h-[6rem] w-full flex-1 rounded-xl border relative overflow-hidden group/header">
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.12),transparent)]" />
 <TrendingUp className="absolute -bottom-2 -right-2 h-24 w-24 text-accent/10 group-hover/header:scale-110 transition-transform duration-500" />
 </div>,
 icon: <TrendingUp className="h-4 w-4 text-accent" />,
 className:"md:col-span-1",
 },
 {
 title:"Active Companies",
 tone:"tone-warning",
 hover:"hover:border-warning/30",
 description: (
 <div className="flex flex-col gap-1 mt-2">
 <span className="text-2xl font-bold text-foreground">{overview?.activeCompanies || 0}</span>
 <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Recruiting Partners</span>
 </div>
 ),
 header: <div className="tone-warning flex h-full min-h-[6rem] w-full flex-1 rounded-xl border relative overflow-hidden group/header">
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.12),transparent)]" />
 <Building2 className="absolute -bottom-2 -right-2 h-24 w-24 text-warning/10 group-hover/header:scale-110 transition-transform duration-500" />
 </div>,
 icon: <Building2 className="h-4 w-4 text-warning" />,
 className:"md:col-span-1",
 },
 ]

 return (
 <BentoGrid className="max-w-full gap-4">
 {items.map((item, i) => (
 <BentoGridItem
 key={i}
  title={<span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">{item.title}</span>}
  description={<div className="font-display text-2xl font-bold text-brown-900 mt-1">{item.description}</div>}
 header={item.header}
 icon={item.icon}
 className={cn(
"transition-base border-border/50 hover:shadow-lg",
 item.hover,
 item.className
 )}
 />
 ))}
 </BentoGrid>
 )
}
