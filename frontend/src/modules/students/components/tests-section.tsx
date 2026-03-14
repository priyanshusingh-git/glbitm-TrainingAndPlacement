"use client"

import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/card"
import { Badge } from"@/components/ui/badge"
import { Button } from"@/components/ui/button"
import { FileText, ArrowRight, TrendingUp, Clock } from"lucide-react"
import { cn } from"@/lib/utils"
import {
 ChartContainer,
 ChartTooltip,
 ChartTooltipContent,
} from"@/components/ui/chart"
import { Area, AreaChart, XAxis, YAxis } from"recharts"

interface TestsSectionProps {
 tests?: {
 recent: any[];
 upcoming: any[];
 }
}

const chartConfig = {
 score: {
 label:"Score",
 color:"var(--chart-1)",
 },
}

export function TestsSection({ tests }: TestsSectionProps) {
 const recentTests = tests?.recent || [];
 const upcomingTests = tests?.upcoming || [];

 // Mock trend data or calculate if available in history API
 const testResults = [
 { month:"Aug", score: 65 },
 { month:"Sep", score: 70 },
 { month:"Oct", score: 75 },
 { month:"Nov", score: 72 },
 { month:"Dec", score: 80 },
 { month:"Jan", score: 85 },
 ];


 return (
 <Card className="overflow-hidden">
 <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 bg-muted/10">
 <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
  <div className="rounded-xl border border-border/60 bg-primary/10 p-2 shadow-sm">
    <FileText className="h-5 w-5 text-primary" />
  </div>
 Tests & Analytics
 </CardTitle>
  <Button variant="ghost" size="sm" className="text-xs font-medium text-primary hover:bg-primary/10">
    Performance Report <ArrowRight className="ml-1 h-3 w-3" />
  </Button>
 </CardHeader>
 <CardContent className="p-6 space-y-8">
 <div className="premium-muted rounded-xl border border-border/60 p-4">
 <div className="mb-6 flex items-center justify-between">
 <div className="space-y-1">
 <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Skill Progression</p>
 <p className="text-sm font-semibold text-foreground">Score development over 6 months</p>
 </div>
 <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase text-emerald-500">
 <TrendingUp className="h-3 w-3" />
 <span>+15% Growth</span>
 </div>
 </div>
 <ChartContainer config={chartConfig} className="h-40 w-full">
 <AreaChart data={testResults} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <defs>
 <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
 <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
 </linearGradient>
 </defs>
 <XAxis
 dataKey="month"
 tickLine={false}
 axisLine={false}
 tick={{ fontSize: 10, fontWeight: 600, fill: 'var(--muted-foreground)' }}
 />
 <YAxis domain={[0, 100]} hide />
 <ChartTooltip content={<ChartTooltipContent />} />
 <Area
 type="monotone"
 dataKey="score"
 stroke="var(--primary)"
 strokeWidth={3}
 fill="url(#scoreGradient)"
 animationDuration={2000}
 />
 </AreaChart>
 </ChartContainer>
 </div>

 {/* Recent Tests */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-4">
 <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">Latest Reports</h4>
 <div className="space-y-3">
 {recentTests.length === 0 ? (
 <p className="text-sm text-muted-foreground italic text-center py-4 bg-muted/20 rounded-lg">No recent evaluations available.</p>
 ) : recentTests.map((test) => (
 <div
 key={test.id}
 className="premium-muted flex items-center justify-between rounded-xl border border-border/50 p-4 transition-all duration-300 hover:bg-card-hover"
 >
 <div className="space-y-1">
 <p className="font-bold text-sm text-foreground">{test.name}</p>
 <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground">
 <Clock className="h-3 w-3" />
 <span>{test.date}</span>
 </div>
 </div>
 <div className="text-right flex flex-col items-end gap-1.5">
 <div className="flex items-baseline gap-0.5 font-black text-foreground">
 <span className="text-lg">{test.score}</span>
 <span className="text-[10px] text-muted-foreground">/{test.total}</span>
 </div>
 <Badge
 variant="outline"
 className={cn(
"text-[9px] font-black uppercase tracking-tight h-5 px-1.5",
 test.score >= (test.total * 0.8)
 ?"bg-success/5 text-success border-success/20"
 :"bg-primary/5 text-primary border-primary/20"
 )}
 >
 {test.score >= (test.total * 0.8) ?"Elite" :"Cleared"}
 </Badge>
 </div>
 </div>
 ))}
 </div>
 </div>

 <div className="space-y-4">
 <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">Upcoming Evaluation</h4>
 {upcomingTests.length > 0 ? (
  <div className="premium-tint group/upcoming relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-primary/15 p-6 text-center">
    <div className="absolute top-0 right-0 p-2">
      <Clock className="h-12 w-12 text-primary/5 group-hover/upcoming:scale-125 transition-transform duration-700" />
    </div>
    <p className="mb-1 text-lg font-semibold text-foreground">{upcomingTests[0].name}</p>
    <p className="mb-4 flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
      {upcomingTests[0].date} • {upcomingTests[0].duration}
    </p>
 <Button className="w-full">
 Enroll Now
 </Button>
 </div>
 ) : (
 <div className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-border/40 rounded-xl space-y-2">
 <FileText className="h-8 w-8 text-muted-foreground/30" />
 <p className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest text-center">No tests scheduled</p>
 </div>
 )}
 </div>
 </div>
 </CardContent>
 </Card>
 )
}
