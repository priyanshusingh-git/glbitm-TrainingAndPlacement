"use client"

import { useEffect, useState } from"react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from"@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from"@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from"@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, LineChart, Line, PieChart, Pie, Cell } from"recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from"@/components/ui/chart"
import { Download, TrendingUp, Users, Building2, Award, Loader2 } from"lucide-react"
import { Button } from"@/components/ui/button"
import { api } from"@/lib/api"
import { useToast } from"@/hooks/use-toast"
import { AnalyticsDetailed } from"@/types/training"
import { PageHeader } from"@/components/layout/page-header"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const chartConfig = {
 placed: { label:"Placed", color:"var(--primary)" },
 total: { label:"Total Students", color:"#93c5fd" },
 count: { label:"Students", color:"var(--primary)" },
 percentage: { label:"Placement %", color:"var(--primary)" },
 avgPackage: { label:"Avg Package (LPA)", color:"#93c5fd" },
}

export default function AnalyticsPage() {
 const [data, setData] = useState<AnalyticsDetailed | null>(null)
 const [loading, setLoading] = useState(true)
 const { toast } = useToast()

 useEffect(() => {
 fetchAnalytics()
 }, [])

 const fetchAnalytics = async () => {
 try {
 setLoading(true)
 const result = await api.get('/analytics/detailed')
 setData(result)
 } catch (error) {
 console.error("Failed to fetch analytics:", error)
 toast({
 title:"Error",
 description:"Failed to load analytics data.",
 variant:"destructive"
 })
 } finally {
 setLoading(false)
 }
 }

 if (loading) {
 return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>
 }

 if (!data) return <div>No data available</div>

 return (
 <div className="space-y-6">
 <PageHeader
 title="Analytics & Reports"
 description="Data-driven insights into placement performance and student progress."
 action={
 <div className="flex items-center gap-2">
 <Select defaultValue="2025-26">
 <SelectTrigger className="w-[180px]">
 <SelectValue placeholder="Select Year" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="2025-26">Academic Year 2025-26</SelectItem>
 <SelectItem value="2024-25">Academic Year 2024-25</SelectItem>
 <SelectItem value="2023-24">Academic Year 2023-24</SelectItem>
 </SelectContent>
 </Select>
 <Button variant="outline">
 <Download className="mr-2 h-4 w-4" /> Export Report
 </Button>
 </div>
 }
 />

 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Total Placed</CardTitle>
 <Users className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{data.stats?.totalPlaced || 0}</div>
 <p className="text-xs text-muted-foreground">
 <span className="text-success inline-flex items-center gap-1">
 <TrendingUp className="h-3 w-3" /> Live
 </span> stats
 </p>
 </CardContent>
 </Card>
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Placement Rate</CardTitle>
 <Award className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{data.stats?.placementRate ||"0%"}</div>
 <p className="text-xs text-muted-foreground">
 Based on eligible students
 </p>
 </CardContent>
 </Card>
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Average Package</CardTitle>
 <Building2 className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{data.stats?.avgPackage ||"0 LPA"}</div>
 <p className="text-xs text-muted-foreground">
 Across all departments
 </p>
 </CardContent>
 </Card>
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Companies Database</CardTitle>
 <Building2 className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{data.stats?.companiesCount || 0}</div>
 <p className="text-xs text-muted-foreground">
 Registered recruiters
 </p>
 </CardContent>
 </Card>
 </div>

 <Tabs defaultValue="placements" className="w-full">
 <TabsList>
 <TabsTrigger value="placements">Placement Stats</TabsTrigger>
 <TabsTrigger value="departments">Department Wise</TabsTrigger>
 <TabsTrigger value="skills">Skill Analysis</TabsTrigger>
 </TabsList>

 <TabsContent value="placements" className="space-y-6">
 <div className="grid gap-6 md:grid-cols-2">
 <Card>
 <CardHeader>
 <CardTitle>Year Evaluation</CardTitle>
 <CardDescription>Placement Percentage vs Average Package Trend</CardDescription>
 </CardHeader>
 <CardContent>
 <ChartContainer config={chartConfig} className="h-[300px] w-full">
 <LineChart data={data.yearlyTrend}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} />
 <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={10} />
 <YAxis yAxisId="left" tickLine={false} axisLine={false} />
 <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} />
 <ChartTooltip content={<ChartTooltipContent />} />
 <Legend />
 <Line yAxisId="left" type="monotone" dataKey="percentage" stroke="var(--primary)" strokeWidth={2} name="Placement %" />
 <Line yAxisId="right" type="monotone" dataKey="avgPackage" stroke="#93c5fd" strokeWidth={2} name="Avg Package" />
 </LineChart>
 </ChartContainer>
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle>Salary Distribution</CardTitle>
 <CardDescription>Number of students by package range</CardDescription>
 </CardHeader>
 <CardContent>
 <ChartContainer config={chartConfig} className="h-[300px] w-full">
 <BarChart data={data.salaryData}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} />
 <XAxis dataKey="range" tickLine={false} axisLine={false} tickMargin={10} />
 <YAxis tickLine={false} axisLine={false} />
 <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
 <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
 </BarChart>
 </ChartContainer>
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 <TabsContent value="departments" className="space-y-6">
 <Card>
 <CardHeader>
 <CardTitle>Department-wise Breakdown</CardTitle>
 <CardDescription>Total eligible students vs Placed students</CardDescription>
 </CardHeader>
 <CardContent>
 <ChartContainer config={chartConfig} className="h-[400px] w-full">
 <BarChart data={data.placementData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} />
 <XAxis dataKey="dept" tickLine={false} axisLine={false} tickMargin={10} />
 <YAxis tickLine={false} axisLine={false} />
 <ChartTooltip content={<ChartTooltipContent />} />
 <Legend />
 <Bar dataKey="placed" fill="var(--primary)" name="Placed" radius={[4, 4, 0, 0]} />
 <Bar dataKey="total" fill="#93c5fd" name="Total Students" radius={[4, 4, 0, 0]} />
 </BarChart>
 </ChartContainer>
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="skills" className="space-y-6">
 <Card>
 <CardHeader>
 <CardTitle>Top Skills</CardTitle>
 <CardDescription>Number of students certified/proficient in top skills</CardDescription>
 </CardHeader>
 <CardContent>
 <ChartContainer config={chartConfig} className="h-[400px] w-full">
 <BarChart data={data.skillsData} layout="vertical">
 <CartesianGrid strokeDasharray="3 3" horizontal={false} />
 <XAxis type="number" hide />
 <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} width={100} />
 <ChartTooltip content={<ChartTooltipContent />} />
 <Bar dataKey="students" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={32} />
 </BarChart>
 </ChartContainer>
 </CardContent>
 </Card>
 </TabsContent>
 </Tabs>
 </div>
 )
}
