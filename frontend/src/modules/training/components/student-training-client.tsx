"use client"

import { useState, useEffect } from"react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from"@/components/ui/card"
import { Badge } from"@/components/ui/badge"
import { Button } from"@/components/ui/button"
import { Progress } from"@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from"@/components/ui/tabs"
import { Calendar, Clock, Users, BookOpen, Video, MapPin, CheckCircle, AlertCircle, PlayCircle, FileText } from"lucide-react"
import { api } from"@/lib/api"
import { format } from"date-fns"
import { cn } from"@/lib/utils"
// import { supabase } from"@/lib/supabase" // Supabase removed

export default function TrainingPage() {
 const [data, setData] = useState<any>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 fetchDashboard();
 }, []);



 const fetchDashboard = async () => {
 try {
 const res = await api.get('/training/dashboard/student');
 setData(res);
 } catch (error) {
 console.error(error);
 } finally {
 setLoading(false);
 }
 }

 // TODO: Integrate Firebase Realtime or similar for live updates
 useEffect(() => {
 // if (!data || !data.group) return;
 // ... realtime logic removed
 }, [data?.group?.id]);

 if (loading) {
 return <div className="flex h-[50vh] items-center justify-center">Loading training data...</div>;
 }

 if (!data || !data.enrolled) {
 return (
 <div className="flex bg-muted/20 flex-col items-center justify-center p-8 rounded-lg mt-8 text-center border-2 border-dashed">
    <div className="bg-primary/10 p-4 rounded-full mb-4">
      <BookOpen className="h-8 w-8 text-primary" />
    </div>
 <h3 className="text-xl font-bold">Not Enrolled Yet</h3>
 <p className="text-muted-foreground mt-2 max-w-md">
 You have not been assigned to any training group. Please contact the CDC admin if you believe this is a mistake.
 </p>
 </div>
 )
 }

 const { group, sessions, stats, nextSession } = data;

 // Helper to filter sessions by type
 const getSessionsByType = (type: string) => {
 if (type === 'All') return sessions;
 return sessions.filter((s: any) => s.type === type);
 }

 return (
 <div className="space-y-6">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
    <h1 className="section-h2">My Training</h1>
    <p className="text-sm text-muted-foreground font-medium">
      {group.name} | {group.branch} - {group.year}
    </p>
 </div>
 <div className="flex items-center gap-2">
    <div className="bg-primary/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 border border-primary/20">
      <CheckCircle className="h-3.5 w-3.5" />
      Attendance: {stats.attendancePercentage}%
    </div>
 </div>
 </div>

 {/* TOP SUMMARY SECTION */}
 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
 {/* Next Session Card */}
 <Card className="col-span-2 bg-gradient-to-br from-primary/5 to-transparent border-brown-800/20">
 <CardHeader className="pb-2">
  <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-2">
    <Clock className="h-4 w-4" /> Up Next
  </CardTitle>
 </CardHeader>
 <CardContent>
 {nextSession ? (
 <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
 <div>
 <h3 className="text-xl font-bold">{nextSession.title}</h3>
 <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
 <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {format(new Date(nextSession.date),"EEEE, MMM d")}</span>
 <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {nextSession.startTime ? format(new Date(nextSession.startTime),"h:mm a") :"TBD"}</span>
 <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {nextSession.trainer.name}</span>
 </div>
 <Badge className="mt-3" variant={nextSession.type === 'Technical' ?"default" :"secondary"}>
 {nextSession.type}
 </Badge>
 </div>
 <div className="flex flex-col gap-2 min-w-[140px]">
 {nextSession.mode === 'Online' ? (
 <Button className="w-full">
 <Video className="mr-2 h-4 w-4" /> Join Link
 </Button>
 ) : (
    <div className="flex items-center gap-2 text-sm font-bold bg-background/50 p-2 rounded-xl border border-border/60 justify-center">
      <MapPin className="h-4 w-4 text-primary" />
      {nextSession.location || 'Campus'}
    </div>
 )}
 </div>
 </div>
 ) : (
 <div className="py-4 text-muted-foreground flex items-center gap-2">
 <CheckCircle className="h-5 w-5" /> No upcoming sessions scheduled.
 </div>
 )}
 </CardContent>
 </Card>

 {/* Stats Card */}
 <Card>
 <CardHeader>
 <CardTitle className="text-base">Progress Overview</CardTitle>
 </CardHeader>
 <CardContent className="space-y-4">
 <div>
 <div className="flex justify-between text-sm mb-1">
 <span className="text-muted-foreground">Attendance</span>
 <span className="font-bold">{stats.attendancePercentage}%</span>
 </div>
 <Progress value={stats.attendancePercentage} className="h-2" />
 </div>
 <div className="grid grid-cols-2 gap-4 pt-2">
 <div className="text-center p-2 bg-muted/40 rounded">
 <span className="block text-2xl font-bold">{stats.completedSessions}</span>
 <span className="text-xs text-muted-foreground">Completed</span>
 </div>
 <div className="text-center p-2 bg-muted/40 rounded">
 <span className="block text-2xl font-bold">{stats.totalSessions}</span>
 <span className="text-xs text-muted-foreground">Total</span>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* SESSIONS LIST */}
 <Tabs defaultValue="all" className="w-full">
 <TabsList className="mb-4">
 <TabsTrigger value="all" className="!outline-none !ring-0 !ring-offset-0 !focus-visible:ring-0 !focus-visible:ring-offset-0 !focus-visible:outline-none !focus-visible:border-transparent !shadow-none">All Sessions</TabsTrigger>
 <TabsTrigger value="technical" className="!outline-none !ring-0 !ring-offset-0 !focus-visible:ring-0 !focus-visible:ring-offset-0 !focus-visible:outline-none !focus-visible:border-transparent !shadow-none">Technical</TabsTrigger>
 <TabsTrigger value="aptitude" className="!outline-none !ring-0 !ring-offset-0 !focus-visible:ring-0 !focus-visible:ring-offset-0 !focus-visible:outline-none !focus-visible:border-transparent !shadow-none">Aptitude</TabsTrigger>
 <TabsTrigger value="verbal" className="!outline-none !ring-0 !ring-offset-0 !focus-visible:ring-0 !focus-visible:ring-offset-0 !focus-visible:outline-none !focus-visible:border-transparent !shadow-none">Verbal</TabsTrigger>
 </TabsList>

 {['all', 'technical', 'aptitude', 'verbal'].map((tab) => (
 <TabsContent key={tab} value={tab} className="space-y-4">
 {getSessionsByType(tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)).map((session: any) => {
 const isPast = new Date(session.date) < new Date();
 const isPresent = session.attendances && session.attendances.length > 0 && session.attendances[0].status === 'Present'; // Make sure backend returns 'Present'
 const isAbsent = isPast && !isPresent;

 return (
 <div key={session.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-4 rounded-lg border bg-card hover:border-brown-800/50 transition-colors">
 <div className="flex gap-4">
 <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-muted text-center shrink-0">
 <span className="text-xs font-semibold uppercase text-muted-foreground">{format(new Date(session.date),"MMM")}</span>
 <span className="text-lg font-bold">{format(new Date(session.date),"d")}</span>
 </div>
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <h4 className="font-semibold">{session.title}</h4>
 {isPast && (
 <Badge variant={isPresent ?"default" :"destructive"} className={cn("text-[10px] px-1.5 h-5", isPresent ?"bg-green-500 hover:bg-green-600" :"")}>
 {isPresent ?"Present" :"Absent"}
 </Badge>
 )}
 {!isPast && (
 <Badge variant="outline" className="text-[10px] px-1.5 h-5 border-blue-200 text-blue-600 bg-blue-50">
 Upcoming
 </Badge>
 )}
 </div>
 <p className="text-sm text-muted-foreground flex items-center gap-2">
 <span>{session.type}</span> •
 <span>{session.trainer.name}</span> •
 <span>{session.startTime ? format(new Date(session.startTime),"h:mm a") :"TBD"}</span>
 </p>
 </div>
 </div>

 <div className="flex items-center gap-3 w-full md:w-auto">
 {session.resources && session.resources.length > 0 && (
 <Button variant="ghost" size="sm" className="ml-auto md:ml-0">
 <FileText className="mr-2 h-4 w-4" /> Resources
 </Button>
 )}
 {session.mode === 'Online' && !isPast && (
 <Button size="sm" className="ml-auto md:ml-0">Join</Button>
 )}
 </div>
 </div>
 )
 })}
 {getSessionsByType(tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)).length === 0 && (
 <div className="text-center py-10 text-muted-foreground">
 No sessions found in this category.
 </div>
 )}
 </TabsContent>
 ))}
 </Tabs>
 </div>
 )
}
