"use client"

import { useEffect, useState } from"react"
import { api } from"@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from"@/components/ui/card"
import { Badge } from"@/components/ui/badge"
import { Users, Loader2, ArrowLeft } from"lucide-react"
import { Button } from"@/components/ui/button"
import Link from"next/link"

export default function TrainerGroupsPage() {
 const [assignments, setAssignments] = useState<any[]>([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState("")

 useEffect(() => {
 const fetchGroups = async () => {
 try {
 // Determine user ID from token or context in a real app, 
 // but our dashboard endpoint returns assignments. 
 // A dedicated endpoint for assignments might be cleaner, 
 // but let's reuse the dashboard one or fetch groups with filter.
 // Reusing dashboard for now as it contains assignments.
 const response = await api.get("/training/dashboard/trainer")
 setAssignments(response.assignments)
 } catch (err: any) {
 setError(err.message ||"Failed to load groups")
 } finally {
 setLoading(false)
 }
 }
 fetchGroups()
 }, [])

 if (loading) return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
 if (error) {
 return (
 <div className="rounded-md border border-destructive/20 bg-destructive/5 p-6 text-center">
 <p className="text-sm text-destructive">Failed to load groups: {error}</p>
 <Button className="mt-4" variant="outline" onClick={() => window.location.reload()}>
 Retry
 </Button>
 </div>
 )
 }

 return (
 <div className="space-y-6">
  <div className="flex items-center gap-4">
    <Button variant="ghost" size="icon" className="hover:bg-primary/10 text-primary" asChild>
      <Link href="/trainer"><ArrowLeft className="h-4 w-4" /></Link>
    </Button>
    <div className="flex flex-col gap-1">
      <h1 className="section-h2">My Groups</h1>
      <p className="text-sm text-muted-foreground font-medium">Cohorts you are currently training.</p>
    </div>
  </div>

 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
 {assignments.length === 0 ? (
 <div className="col-span-full text-center py-12 text-muted-foreground">
 No groups assigned to you yet.
 </div>
 ) : (
      assignments.map((assignment: any) => (
        <Card key={assignment.id} className="dashboard-card overflow-hidden group">
          <CardHeader className="pb-3 border-b border-border/50 bg-muted/10">
            <div className="flex justify-between items-start mb-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold uppercase tracking-widest">{assignment.type}</Badge>
              <div className="rounded-md bg-muted/50 p-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="text-xl font-bold font-display">{assignment.group.name}</CardTitle>
            <CardDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground/60">{assignment.group.branch} • Year {assignment.group.year}</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex items-center justify-between p-3 rounded-md bg-muted/30 border border-border/40">
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50">Students Enrolled</span>
              <span className="text-lg font-bold text-foreground">{assignment.group._count.students}</span>
            </div>
          </CardContent>
        </Card>
      ))
 )}
 </div>
 </div>
 )
}
