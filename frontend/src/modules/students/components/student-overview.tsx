"use client"

import { BentoGrid, BentoGridItem } from"@/components/layout/dashboard/bento-grid"
import { BookOpen, Trophy, Code2, Briefcase, TrendingUp } from"lucide-react"
import { cn } from"@/lib/utils"

interface OverviewProps {
 overview?: {
 trainingLevel: string;
 avgTestScore: number;
 problemsSolved: number;
 eligibleDrives: number;
 }
}

export function StudentOverview({ overview }: OverviewProps) {
 const items = [
 {
 title:"Training Progress",
 description: (
 <div className="flex flex-col gap-1 mt-2">
 <span className="text-3xl font-bold text-foreground font-display">{overview?.trainingLevel || 'Level 1'}</span>
 <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Top 10% of Batch</span>
 </div>
 ),
 header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-500/20 via-blue-500/5 to-transparent border border-blue-500/20 relative overflow-hidden group/header">
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1),transparent)]" />
 <BookOpen className="absolute -bottom-2 -right-2 h-24 w-24 text-blue-500/10 group-hover/header:scale-110 transition-transform duration-500" />
 </div>,
 icon: <BookOpen className="h-4 w-4 text-blue-500" />,
 className:"md:col-span-1",
 },
 {
 title:"Test Performance",
 description: (
 <div className="flex flex-col gap-1 mt-2">
 <div className="flex items-baseline gap-1">
 <span className="text-3xl font-bold text-foreground font-display">{overview?.avgTestScore || 0}</span>
 <span className="text-sm font-semibold text-emerald-500 font-display">%</span>
 </div>
 <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Consistency improving</span>
 </div>
 ),
 header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent border border-emerald-500/20 relative overflow-hidden group/header">
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.1),transparent)]" />
 <Trophy className="absolute -bottom-2 -right-2 h-24 w-24 text-emerald-500/10 group-hover/header:scale-110 transition-transform duration-500" />
 </div>,
 icon: <Trophy className="h-4 w-4 text-emerald-500" />,
 className:"md:col-span-1",
 },
 {
 title:"Problems Solved",
 description: (
 <div className="flex flex-col gap-1 mt-2">
 <span className="text-3xl font-bold text-foreground font-display">{overview?.problemsSolved || 0}</span>
 <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Across platforms</span>
 </div>
 ),
 header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-amber-500/20 via-amber-500/5 to-transparent border border-amber-500/20 relative overflow-hidden group/header">
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.1),transparent)]" />
 <Code2 className="absolute -bottom-2 -right-2 h-24 w-24 text-amber-500/10 group-hover/header:scale-110 transition-transform duration-500" />
 </div>,
 icon: <Code2 className="h-4 w-4 text-amber-500" />,
 className:"md:col-span-1",
 },
 {
 title:"Placement Eligibility",
 description: (
 <div className="flex flex-col gap-1 mt-2">
 <span className="text-3xl font-bold text-foreground font-display">{overview?.eligibleDrives || 0}</span>
 <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Upcoming drives</span>
 </div>
 ),
 header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-500/20 via-purple-500/5 to-transparent border border-purple-500/20 relative overflow-hidden group/header">
 <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.1),transparent)]" />
 <Briefcase className="absolute -bottom-2 -right-2 h-24 w-24 text-purple-500/10 group-hover/header:scale-110 transition-transform duration-500" />
 </div>,
 icon: <Briefcase className="h-4 w-4 text-purple-500" />,
 className:"md:col-span-1",
 },
 ];

 return (
 <BentoGrid className="max-w-full gap-4">
 {items.map((item, i) => (
 <BentoGridItem
 key={i}
 title={<span className="text-sm font-semibold text-muted-foreground">{item.title}</span>}
 description={item.description}
 header={item.header}
 icon={item.icon}
 className={cn(
"hover:border-primary/20 transition-all duration-200",
 item.className
 )}
 />
 ))}
 </BentoGrid>
 )
}
