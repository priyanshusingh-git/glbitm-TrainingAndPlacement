"use client"

import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/card"
import { BarChart3, TrendingUp, Info, Download } from"lucide-react"
import { Button } from"@/components/ui/button"
import { exportToCSV } from"@/lib/export-utils"
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from"@/components/ui/select"
import {
 ChartContainer,
 ChartTooltip,
 ChartTooltipContent,
 ChartLegend,
 ChartLegendContent,
} from"@/components/ui/chart"
import {
 Bar,
 BarChart,
 Line,
 XAxis,
 YAxis,
 CartesianGrid,
 Area,
 AreaChart,
} from"recharts"

interface PlacementAnalyticsProps {
 analytics?: any[];
}

const placementData = [
 { month:"Aug", placed: 12, offers: 18 },
 { month:"Sep", placed: 25, offers: 35 },
 { month:"Oct", placed: 48, offers: 62 },
 { month:"Nov", placed: 89, offers: 112 },
 { month:"Dec", placed: 142, offers: 178 },
 { month:"Jan", placed: 342, offers: 420 },
]

const departmentData = [
 { department:"CSE", placed: 156, total: 380 },
 { department:"IT", placed: 89, total: 280 },
 { department:"ECE", placed: 52, total: 320 },
 { department:"EE", placed: 28, total: 180 },
 { department:"ME", placed: 17, total: 87 },
]

const placementChartConfig = {
 placed: {
 label:"Students Placed",
 color:"var(--primary)",
 },
 offers: {
 label:"Total Offers",
 color:"#93c5fd",
 },
}

const departmentChartConfig = {
 placed: {
 label:"Placed",
 color:"var(--primary)",
 },
 total: {
 label:"Total Students",
 color:"#cbd5e1",
 },
}

export function PlacementAnalytics({ analytics }: PlacementAnalyticsProps) {
 const currentData = analytics || placementData;
 const suffix ="2025-26"

 const handleExport = () => {
 exportToCSV(currentData, 'Placement_Analytics', [
 { key: 'month', label: 'Month' },
 { key: 'placed', label: 'Students Placed' },
 { key: 'offers', label: 'Total Offers Provided' }
 ])
 }

 return (
 <Card className="overflow-hidden">
 <CardHeader className="flex flex-col justify-between gap-4 border-b border-border/60 bg-muted/10 pb-4 sm:flex-row sm:items-center">
 <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
 <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
    <div className="rounded-xl border border-border/60 bg-primary/10 p-2 shadow-sm">
      <BarChart3 className="h-5 w-5 text-primary" />
    </div>
 Analytics
 </CardTitle>
 <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase text-emerald-500">
 <TrendingUp className="h-3 w-3" />
 <span>+22% YoY</span>
 </div>
 </div>
 <div className="flex items-center gap-2 self-end sm:self-auto">
 <Select defaultValue="this-year">
 <SelectTrigger className="h-8 w-[130px] border-border/70 text-xs font-medium">
 <SelectValue placeholder="Period" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="this-year">Session 25-26</SelectItem>
 <SelectItem value="last-year">Session 24-25</SelectItem>
 <SelectItem value="all-time">All Time</SelectItem>
 </SelectContent>
 </Select>
 <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-medium" onClick={handleExport}>
 <Download className="h-3 w-3" />
 Export
 </Button>
 </div>
 </CardHeader>
 <CardContent className="p-5 space-y-8">
 <div className="premium-muted rounded-2xl border border-border/60 p-4">
 <div className="mb-6 flex items-center justify-between">
 <div className="space-y-1">
 <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">Recruitment Velocity</p>
 <p className="text-sm font-semibold text-foreground">Hiring trend for session {suffix}</p>
 </div>
 </div>
 <ChartContainer config={placementChartConfig} className="h-64 w-full">
 <AreaChart data={currentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <defs>
 <linearGradient id="placedGradient" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
 <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/20" />
 <XAxis
 dataKey="month"
 tickLine={false}
 axisLine={false}
 tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--muted-foreground)' }}
 />
 <YAxis
 tickLine={false}
 axisLine={false}
 tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--muted-foreground)' }}
 />
 <ChartTooltip content={<ChartTooltipContent />} />
 <ChartLegend content={<ChartLegendContent />} />
 <Area
 type="monotone"
 dataKey="placed"
 stroke="var(--primary)"
 strokeWidth={3}
 fill="url(#placedGradient)"
 animationDuration={2000}
 />
 <Line
 type="monotone"
 dataKey="offers"
 stroke="#93c5fd"
 strokeWidth={2}
 strokeDasharray="4 4"
 dot={false}
 />
 </AreaChart>
 </ChartContainer>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="space-y-5">
  <h4 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
    <Info className="h-3 w-3 text-primary" />
    Branch Distribution
  </h4>
 <ChartContainer config={departmentChartConfig} className="h-48 w-full">
 <BarChart data={departmentData} layout="vertical" margin={{ left: -10 }}>
 <XAxis type="number" hide />
 <YAxis
 type="category"
 dataKey="department"
 tickLine={false}
 axisLine={false}
 tick={{ fontSize: 10, fontWeight: 800, fill: 'var(--foreground)' }}
 width={40}
 />
 <ChartTooltip content={<ChartTooltipContent />} />
 <Bar
 dataKey="total"
 fill="#cbd5e1"
 radius={[0, 4, 4, 0]}
 opacity={0.5}
 barSize={16}
 />
 <Bar
 dataKey="placed"
 fill="var(--primary)"
 radius={[0, 4, 4, 0]}
 barSize={16}
 />
 </BarChart>
 </ChartContainer>
 </div>

 <div className="premium-tint flex flex-col justify-center space-y-3 rounded-2xl border border-brown-800/15 p-5 text-center">
 <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brown-800/70">Milestone Reached</p>
 <h3 className="text-3xl font-semibold text-foreground">92%</h3>
 <p className="text-sm text-muted-foreground leading-relaxed">
 Overall placement percentage reached for the current graduating batch.
 </p>
  <div className="pt-2">
    <div className="h-2 w-full overflow-hidden rounded-full bg-primary/10">
      <div className="h-full w-[92%] bg-primary" />
    </div>
  </div>
 </div>
 </div>
 </CardContent>
 </Card>
 )
}
