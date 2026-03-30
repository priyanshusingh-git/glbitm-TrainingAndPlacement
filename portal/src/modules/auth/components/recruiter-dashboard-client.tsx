"use client"

import { useEffect, useState } from"react"
import { api } from"@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from"@/components/ui/card"
import { Badge } from"@/components/ui/badge"
import { Calendar, Users, Clock, ArrowRight, Video, MapPin, Loader2 } from"lucide-react"
import { Button } from"@/components/ui/button"
import Link from"next/link"
import { format } from"date-fns"

interface DashboardData {
 assignments: any[]
 upcomingSessions: any[]
 recentSessions: any[]
}

function getSessionGroup(session: any) {
 return session?.group ?? session?.sessionGroups?.[0] ?? null
}

export default function TrainerDashboardPage() {
 const [data, setData] = useState<DashboardData | null>(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState("")

 useEffect(() => {
 const fetchData = async () => {
 try {
 const response = await api.get("/training/dashboard/trainer")
 setData(response)
 } catch (err: any) {
 setError(err.message ||"Failed to load dashboard")
 } finally {
 setLoading(false)
 }
 }
 fetchData()
 }, [])

 if (loading) {
 return (
    <div className="flex h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
    </div>
 )
 }

 if (error) {
 return (
 <div className="rounded-md border border-destructive/20 bg-destructive/5 p-6 text-center">
 <p className="text-sm text-destructive">Failed to load trainer dashboard: {error}</p>
 <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}>
 Retry
 </Button>
 </div>
 )
 }

 if (!data) return null

 return (
 <div className="space-y-6">
  <div className="flex flex-col gap-2">
    <h1 className="section-h2">Trainer Dashboard</h1>
    <p className="text-sm text-muted-foreground">Manage your training groups and sessions.</p>
  </div>

 {/* Stats Overview */}
 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <Card className="dashboard-card">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Assigned Groups</CardTitle>
      <div className="rounded-md bg-primary/10 p-2">
        <Users className="h-4 w-4 text-primary" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{data.assignments.length}</div>
      <p className="text-xs text-muted-foreground">Active cohorts</p>
    </CardContent>
  </Card>
  <Card className="dashboard-card">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
      <div className="rounded-md bg-amber-500/10 p-2">
        <Calendar className="h-4 w-4 text-amber-600" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{data.upcomingSessions.length}</div>
      <p className="text-xs text-muted-foreground">Scheduled for next 7 days</p>
    </CardContent>
  </Card>
 </div>

 <div className="grid gap-6 md:grid-cols-2">
 {/* Upcoming Schedule */}
  <Card className="col-span-1 border-border/50 bg-card overflow-hidden">
    <CardHeader className="border-b border-border/50 bg-muted/10">
      <CardTitle>Upcoming Schedule</CardTitle>
      <CardDescription>Your next scheduled sessions.</CardDescription>
    </CardHeader>
    <CardContent className="p-6">
      {data.upcomingSessions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No upcoming sessions scheduled.</p>
      ) : (
        <div className="space-y-4">
          {data.upcomingSessions.map((session: any) => {
            const group = getSessionGroup(session)
            return (
              <div key={session.id} className="premium-muted flex items-start space-x-4 rounded-md border border-border/50 p-4 transition-all duration-300 hover:bg-card-hover hover:border-primary/30">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground leading-none">{session.title}</p>
                    <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest">{session.type}</Badge>
                  </div>
                  <div className="flex items-center text-[10px] font-bold text-primary/70 gap-2 uppercase tracking-tight">
                    <Clock className="h-3.5 w-3.5" />
                    {format(new Date(session.date), "PPP p")}
                  </div>
                  <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Group: {group ? `${group.name} (${group.branch})` : "Unassigned"}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <Button variant="link" className="mt-4 px-0 text-primary font-bold uppercase tracking-widest text-[10px]" asChild>
        <Link href="/trainer/schedule">View full schedule <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
      </Button>
    </CardContent>
  </Card>

 {/* Assigned Groups */}
  <Card className="col-span-1 border-border/50 bg-card overflow-hidden">
    <CardHeader className="border-b border-border/50 bg-muted/10">
      <CardTitle>My Groups</CardTitle>
      <CardDescription>Cohorts you are training.</CardDescription>
    </CardHeader>
    <CardContent className="p-6">
      {data.assignments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No groups assigned yet.</p>
      ) : (
        <div className="space-y-4">
          {data.assignments.map((assignment: any) => (
            <div key={assignment.id} className="premium-muted flex items-center justify-between rounded-md border border-border/50 p-4 transition-all duration-300 hover:bg-card-hover hover:border-primary/30">
              <div>
                <p className="font-bold text-sm text-foreground">{assignment.group.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest">{assignment.type}</Badge>
                  <p className="text-[11px] text-muted-foreground">
                    {assignment.group.branch} {assignment.group.year}
                  </p>
                </div>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold uppercase tracking-widest">
                {assignment.group._count.students} Students
              </Badge>
            </div>
          ))}
        </div>
      )}
      <Button variant="link" className="mt-4 px-0 text-primary font-bold uppercase tracking-widest text-[10px]" asChild>
        <Link href="/trainer/groups">View all groups <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
      </Button>
    </CardContent>
  </Card>
 </div>
 </div>
 )
}
