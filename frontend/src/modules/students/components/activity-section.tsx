"use client"

import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/card"
import { Badge } from"@/components/ui/badge"
import { Code2, Github, Award, FolderKanban } from"lucide-react"
import { cn } from"@/lib/utils"
import {
 ChartContainer,
 ChartTooltip,
 ChartTooltipContent,
} from"@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis } from"recharts"

interface ActivitySectionProps {
 activity?: {
 coding: any[];
 projects: any[];
 certifications: any[];
 }
}

const chartConfig = {
 problems: {
 label:"Problems",
 color:"var(--chart-2)",
 },
}

export function ActivitySection({ activity }: ActivitySectionProps) {
 const codingActivity = activity?.coding || [];
 const projects = activity?.projects || [];
 const certifications = activity?.certifications || [];

 const totalProblems = codingActivity.reduce((acc, curr) => acc + curr.problems, 0);

 return (
 <Card className="overflow-hidden">
 <CardHeader className="border-b border-border/60 bg-muted/10">
 <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
 <div className="rounded-xl border border-border/60 bg-brown-800/10 p-2 shadow-sm">
 <Code2 className="h-5 w-5 text-brown-800" />
 </div>
 Achievements & Activity
 </CardTitle>
 </CardHeader>
 <CardContent className="p-6 space-y-10">
 <div className="premium-muted group relative overflow-hidden rounded-2xl border border-border/60 p-5">
 <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
 <Github className="h-24 w-24 text-brown-800" />
 </div>

 <div className="mb-6 flex items-center justify-between relative">
 <div className="space-y-1">
 <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">Algorithm Practice</p>
 <p className="text-sm font-semibold text-foreground">Weekly solving trend</p>
 </div>
 <div className="flex items-center gap-3">
 <div className="text-right">
 <p className="text-2xl font-semibold leading-none text-foreground">{totalProblems}</p>
 <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Solved</p>
 </div>
 <div className="h-8 w-[1px] bg-border/40" />
 <Github className="h-6 w-6 text-muted-foreground/40" />
 </div>
 </div>
 <ChartContainer config={chartConfig} className="h-40 w-full px-2">
 <BarChart data={codingActivity}>
 <XAxis
 dataKey="day"
 tickLine={false}
 axisLine={false}
 tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--muted-foreground)' }}
 />
 <YAxis hide />
 <ChartTooltip content={<ChartTooltipContent />} />
 <Bar
 dataKey="problems"
 fill="var(--primary)"
 radius={[4, 4, 0, 0]}
 barSize={32}
 />
 </BarChart>
 </ChartContainer>
 </div>

 <div className="grid gap-8 sm:grid-cols-2">
 {/* Projects */}
 <div className="space-y-5">
 <div className="flex items-center justify-between">
 <h4 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
 <FolderKanban className="h-3 w-3 text-brown-800" />
 Portfolio Highlights
 </h4>
 <Badge variant="outline" className="text-[9px] font-semibold border-border/60">TOP 3</Badge>
 </div>
 <div className="space-y-4">
 {projects.length === 0 ? (
 <div className="py-8 bg-muted/10 rounded-xl border border-dashed border-border/40 flex flex-col items-center justify-center opacity-40">
 <FolderKanban className="h-6 w-6 mb-2" />
 <p className="text-xs font-bold uppercase tracking-widest">No Projects Found</p>
 </div>
 ) : projects.map((project: any) => (
 <div key={project.id} className="premium-muted group/proj rounded-xl border border-border/50 p-4 transition-all duration-300 hover:bg-card-hover hover:border-brown-800/30">
 <div className="flex items-center justify-between mb-3">
 <p className="font-bold text-sm text-foreground group-hover/proj:text-brown-800 transition-colors">{project.name}</p>
 <div className={cn(
"h-2 w-2 rounded-full",
 project.status ==="Completed" ?"bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]" :"bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
 )} />
 </div>
 <div className="flex flex-wrap gap-1.5 leading-none">
 {project.tech.map((tech: string) => (
 <span key={tech} className="rounded-md border border-border/50 bg-card/80 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
 {tech}
 </span>
 ))}
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Certifications */}
 <div className="space-y-5">
 <h4 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
 <Award className="h-3 w-3 text-brown-800" />
 Verified Credentials
 </h4>
 <div className="space-y-4">
 {certifications.length === 0 ? (
 <div className="py-8 bg-muted/10 rounded-xl border border-dashed border-border/40 flex flex-col items-center justify-center opacity-40">
 <Award className="h-6 w-6 mb-2" />
 <p className="text-xs font-bold uppercase tracking-widest">No Credentials Added</p>
 </div>
 ) : certifications.map((cert: any) => (
 <div key={cert.id} className="premium-muted group/cert flex gap-4 rounded-xl border border-border/50 p-4 transition-all duration-300 hover:bg-card-hover">
 <div className="h-10 w-10 rounded-lg bg-brown-800/10 border border-brown-800/20 flex items-center justify-center shrink-0 group-hover/cert:scale-110 transition-transform">
 <Award className="h-5 w-5 text-brown-800" />
 </div>
 <div className="space-y-1">
 <p className="font-bold text-sm text-foreground line-clamp-1">{cert.name}</p>
 <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
 {cert.issuer} <span className="mx-1">•</span> {cert.date}
 </p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 )
}
