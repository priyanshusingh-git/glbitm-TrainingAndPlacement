"use client"

import { useEffect, useState } from"react"
import { api } from"@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from"@/components/ui/card"
import { Badge } from"@/components/ui/badge"
import { Calendar, Clock, MapPin, Loader2, ArrowLeft, Video } from"lucide-react"
import { Button } from"@/components/ui/button"
import Link from"next/link"
import { format, isPast } from"date-fns"
import { cn } from"@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from"@/components/ui/tabs"
import { useAuth } from"@/contexts/auth-context"

export default function TrainerSchedulePage() {
 const { user } = useAuth()
 const [sessions, setSessions] = useState<any[]>([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState("")

 useEffect(() => {
 const fetchSchedule = async () => {
 if (!user) return;
 try {
 // Fetch all sessions for this trainer
 // We need to pass the trainer ID. Since we are logged in, 
 // the backend verifies the token but our generic /sessions 
 // endpoint allows filtering by trainerId.
 // However, we don't have the ID easily accessible in client 
 // unless we decode token or store it. 
 // Alternatively, we reuse the dashboard endpoint or 
 // make /sessions smart enough to filter by"me" if role is trainer.
 // Let's rely on the dashboard endpoint which returns UPCOMING and RECENT.
 // Ideally we want ALL. Let's update backend to support"my sessions".
 // For now, let's use the dashboard data which gives upcoming/recent.
 // OR better: use the sessions endpoint with a filter if we know our ID,
 // or update backend to infer it.
 // Let's try fetching dashboard data for now as a safe bet.
 const response = await api.get("/training/dashboard/trainer")
 setSessions([...response.upcomingSessions, ...response.recentSessions])
 } catch (err: any) {
 setError(err.message ||"Failed to load schedule")
 } finally {
 setLoading(false)
 }
 }
 fetchSchedule()
 }, [user])

 if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
 if (error) {
 return (
 <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
 <p className="text-sm text-destructive">Failed to load schedule: {error}</p>
 <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}>
 Retry
 </Button>
 </div>
 )
 }

 const upcoming = sessions.filter(s => !isPast(new Date(s.date))).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
 const past = sessions.filter(s => isPast(new Date(s.date))).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

 return (
 <div className="space-y-6">
  <div className="flex items-center gap-4">
    <Button variant="ghost" size="icon" className="hover:bg-primary/10 text-primary" asChild>
      <Link href="/trainer"><ArrowLeft className="h-4 w-4" /></Link>
    </Button>
    <div className="flex flex-col gap-1">
      <h1 className="section-h2">My Schedule</h1>
      <p className="text-sm text-muted-foreground font-medium">Manage your training sessions.</p>
    </div>
  </div>

 <Tabs defaultValue="upcoming" className="space-y-4">
 <TabsList>
 <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
 <TabsTrigger value="past">Past</TabsTrigger>
 </TabsList>

 <TabsContent value="upcoming" className="space-y-4">
 {upcoming.length === 0 ? (
 <p className="text-muted-foreground py-8">No upcoming sessions.</p>
 ) : (
 upcoming.map((session: any) => (
 <SessionCard key={session.id} session={session} />
 ))
 )}
 </TabsContent>

 <TabsContent value="past" className="space-y-4">
 {past.length === 0 ? (
 <p className="text-muted-foreground py-8">No past sessions.</p>
 ) : (
 past.map((session: any) => (
 <SessionCard key={session.id} session={session} isPast />
 ))
 )}
 </TabsContent>
 </Tabs>
 </div>
 )
}

function SessionCard({ session, isPast }: { session: any, isPast?: boolean }) {
 const group = session?.group ?? session?.sessionGroups?.[0] ?? null
 const canMarkAttendance = Boolean(group)

 return (
 <Card className={cn(isPast &&"opacity-75")}>
 <CardHeader className="pb-3">
    <div className="flex justify-between items-start">
      <Badge className={cn("text-[10px] font-bold uppercase tracking-widest", isPast ? "bg-muted text-muted-foreground border-muted-foreground/20" : "bg-primary/10 text-primary border-primary/20")}>{session.type}</Badge>
      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-border/60">{session.status}</Badge>
    </div>
 <CardTitle className="mt-2">{session.title}</CardTitle>
 <CardDescription>
 {group ? `${group.name} (${group.branch})` :"No group assigned"}
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
 <div className="flex items-center gap-2">
 <Calendar className="h-4 w-4" />
 {format(new Date(session.date),"PPP")}
 </div>
 <div className="flex items-center gap-2">
 <Clock className="h-4 w-4" />
 {session.startTime ? format(new Date(session.startTime),"p") :"TBD"} ({session.duration ?? 0} min)
 </div>
 <div className="flex items-center gap-2">
 {session.mode ==="Online" ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
 {session.mode} ({session.location || 'N/A'})
 </div>
 </div>
  <div className="mt-4 flex justify-end">
    <Button size="sm" disabled={!canMarkAttendance} asChild={canMarkAttendance} className={cn("btn-primary h-9 px-4 text-[11px] font-bold uppercase tracking-widest", !canMarkAttendance && "bg-muted text-muted-foreground/40")}>
      {canMarkAttendance ? (
        <Link href={`/trainer/attendance/${session.id}`}>
          Mark Attendance
        </Link>
      ) : (
        <span>No Group Assigned</span>
      )}
    </Button>
  </div>
 </CardContent>
 </Card>
 )
}
