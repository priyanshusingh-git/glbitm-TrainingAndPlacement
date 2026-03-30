"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LoadingGrid, LoadingTable } from "@/components/ui/loading-states"
import { EmptyState } from "@/components/ui/empty-state"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  BriefcaseBusiness, Building2, Calendar, MapPin, SearchX,
  IndianRupee, Users, Clock, CheckCircle2, Award, UserCheck
} from "lucide-react"

interface DashboardData {
  company: {
    id: string
    name: string
    industry?: string
    status: string
  } | null
  stats: {
    totalDrives: number
    ongoingDrives: number
    completedDrives: number
    totalShortlisted: number
  }
  activeDrives: Array<{
    id: string
    role: string
    ctc?: string
    location?: string
    date: string
    status: string
    _count: { applications: number }
  }>
  shortlistedCandidates: Array<{
    id: string
    status: string
    appliedAt: string
    student: {
      user: { name: string; email: string }
      branch: string
      rollNo: string
    }
    drive: { role: string }
  }>
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
}

export default function RecruiterDashboardClient() {
  const { toast } = useToast()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await api.get("/recruiter/dashboard")
      setData(res)
    } catch (error) {
      toast({ title: "Error", description: "Failed to load dashboard data.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="h-20 w-1/3 bg-muted/20 animate-pulse rounded-md" />
        <LoadingGrid items={4} />
        <div className="h-64 bg-muted/20 animate-pulse rounded-md mt-6" />
      </div>
    )
  }

  if (!data?.company) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <PageHeader title="Recruiter Dashboard" description="Welcome to the recruitment portal." />
        <Card className="border-border/60">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-md bg-amber-500/10 p-4 mb-4">
              <SearchX className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">No Company Linked</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Your account has not been linked to a specific company profile yet. 
              Please contact the placement cell admin to link your email ({data?.company !== undefined ? 'verified' : 'pending'}) to your organization.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader 
        title={`Company Dashboard`} 
        description={`Welcome back to your recruitment workspace for ${data.company.name}.`} 
      />

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Drives</CardTitle>
            <BriefcaseBusiness className="h-4 w-4 text-brown-800" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalDrives}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ongoing Drives</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.ongoingDrives}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Drives</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.completedDrives}</div>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-brown-900/5 hover:bg-brown-900/10 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-brown-900">Total Shortlisted</CardTitle>
            <UserCheck className="h-4 w-4 text-brown-900" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-brown-900">{data.stats.totalShortlisted}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="drives" className="space-y-4">
        <TabsList>
          <TabsTrigger value="drives">Active Drives</TabsTrigger>
          <TabsTrigger value="candidates">Recent Shortlists</TabsTrigger>
        </TabsList>
        
        <TabsContent value="drives" className="space-y-4 m-0">
          {data.activeDrives.length === 0 ? (
            <EmptyState
              icon={BriefcaseBusiness}
              title="No active drives"
              description="You have no scheduled or ongoing placement drives right now."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.activeDrives.map(drive => (
                <Card key={drive.id} className="border-border/60 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base font-bold">{drive.role}</CardTitle>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider",
                          drive.status === 'ongoing'
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-700"
                            : "border-brown-800/30 bg-brown-800/10 text-brown-800"
                        )}
                      >
                        {drive.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {format(new Date(drive.date), 'dd MMM yyyy, h:mm a')}
                      </span>
                      {drive.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {drive.location}
                        </span>
                      )}
                      {drive.ctc && (
                        <span className="flex items-center gap-1.5">
                          <IndianRupee className="h-3.5 w-3.5" />
                          {drive.ctc}
                        </span>
                      )}
                    </div>
                    <div className="pt-3 border-t border-border/40 mt-3! flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> 
                        {drive._count.applications} Applications
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="candidates" className="m-0">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle>Recent Shortlists & Offers</CardTitle>
              <CardDescription>Candidates moving forward in your recruitment processes.</CardDescription>
            </CardHeader>
            <CardContent>
              {data.shortlistedCandidates.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground italic">
                  No candidates have been shortlisted yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {data.shortlistedCandidates.map(app => (
                    <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-md border border-border/40 hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border/60">
                          <AvatarFallback className="bg-brown-800/10 text-brown-800 text-xs font-bold">
                            {getInitials(app.student.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">{app.student.user.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            {app.student.branch} • {app.student.rollNo}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold tracking-wider",
                            app.status === 'PLACED' ? "border-success bg-success/10 text-success" :
                            app.status === 'OFFERED' ? "border-amber-500 bg-amber-500/10 text-amber-700" :
                            "border-brown-800 bg-brown-800/10 text-brown-800"
                          )}
                        >
                          {app.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          for {app.drive.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
