"use client"

import { useEffect, useState } from"react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from"@/components/ui/card"
import { Badge } from"@/components/ui/badge"
import { Button } from"@/components/ui/button"
import { Input } from"@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from"@/components/ui/tabs"
import { Briefcase, Building2, MapPin, IndianRupee, Clock, Search, Filter, CheckCircle2, XCircle, AlertCircle, Loader2 } from"lucide-react"
import { useToast } from"@/hooks/use-toast"
import { api } from"@/lib/api"
import { PlacementDrive } from"@/types/training"
import { format } from"date-fns"

// Extend PlacementDrive to include application status from backend
interface DriveWithStatus extends PlacementDrive {
 applications?: { status: string }[];
}

export default function PlacementsPage() {
 const [drives, setDrives] = useState<DriveWithStatus[]>([])
 const [loading, setLoading] = useState(true)
 const [searchQuery, setSearchQuery] = useState("")
 const [applyingId, setApplyingId] = useState<string | null>(null)
 const { toast } = useToast()

 useEffect(() => {
 fetchDrives()
 }, [])

 const fetchDrives = async () => {
 try {
 setLoading(true)
 const data = await api.get('/placements')
 setDrives(data)
 } catch (error) {
 console.error("Failed to fetch drives:", error)
 } finally {
 setLoading(false)
 }
 }

 const handleApply = async (driveId: string) => {
 // 1. Snapshot previous state
 const previousDrives = [...drives];

 // 2. Optimistic Update
 setDrives(prev => prev.map(drive => {
 if (drive.id === driveId) {
 return {
 ...drive,
 applications: [{ status: 'applied' }] // Mock application
 };
 }
 return drive;
 }));

 // Optimistically set applyingId to null immediately to remove loader
 setApplyingId(null);
 toast({ title:"Success", description:"Applied successfully!" });

 try {
 // 3. Background Sync
 await api.post(`/placements/${driveId}/apply`, {});

 // 4. Reconcile (Optional: Fetch/Refresh to get real ID/data if needed, 
 // but for status 'applied', the optimistic update is usually sufficient until next fetch)
 // fetchDrives(); 
 } catch (error: any) {
 // 5. Rollback
 setDrives(previousDrives);
 toast({ title:"Error", description: error.message ||"Failed to apply", variant:"destructive" });
 }
 };

 const filteredDrives = drives.filter(drive =>
 drive.company?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 drive.role.toLowerCase().includes(searchQuery.toLowerCase())
 )

 const ongoingDrives = filteredDrives.filter(d => d.status === 'ongoing' || d.status === 'scheduled')
 const appliedDrives = filteredDrives.filter(d => d.applications && d.applications.length > 0)

 return (
 <div className="space-y-6 animate-in fade-in duration-300">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h1 className="text-2xl font-bold tracking-tight">Placement Drives</h1>
 <p className="text-muted-foreground">
 Explore and apply for campus placement opportunities.
 </p>
 </div>
 <div className="flex gap-2">
 <Button variant="outline">
 Resume Builder
 </Button>
 </div>
 </div>

 <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
 <div className="relative w-full sm:w-[350px]">
 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
 <Input
 type="search"
 placeholder="Search companies, roles..."
 className="pl-8"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>
 <div className="flex items-center gap-2 w-full sm:w-auto">
 <Button variant="outline" size="sm" className="ml-auto sm:ml-0">
 <Filter className="mr-2 h-4 w-4" /> Filter
 </Button>
 </div>
 </div>

 <Tabs defaultValue="all" className="w-full">
 <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 mb-6">
 <TabsTrigger value="all" className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-brown-800 data-[state=active]:text-foreground data-[state=active]:shadow-none !outline-none !ring-0 !ring-offset-0 !focus-visible:ring-0 !focus-visible:ring-offset-0 !focus-visible:outline-none !focus-visible:border-transparent">
 All Drives
 </TabsTrigger>
 <TabsTrigger value="applied" className="relative rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-brown-800 data-[state=active]:text-foreground data-[state=active]:shadow-none !outline-none !ring-0 !ring-offset-0 !focus-visible:ring-0 !focus-visible:ring-offset-0 !focus-visible:outline-none !focus-visible:border-transparent">
 Applied ({appliedDrives.length})
 </TabsTrigger>
 </TabsList>

 <TabsContent value="all" className="space-y-6">
 {loading ? (
 <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
 ) : (
 <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
 {ongoingDrives.length === 0 && <div className="col-span-full text-center text-muted-foreground">No active drives found.</div>}
 {ongoingDrives.map((drive) => (
 <JobCard key={drive.id} drive={drive} onApply={() => handleApply(drive.id)} applying={applyingId === drive.id} />
 ))}
 </div>
 )}
 </TabsContent>
 <TabsContent value="applied" className="space-y-6">
 <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
 {appliedDrives.length === 0 && <div className="col-span-full text-center text-muted-foreground">You haven't applied to any drives yet.</div>}
 {appliedDrives.map((drive) => (
 <JobCard key={drive.id} drive={drive} onApply={() => handleApply(drive.id)} applying={applyingId === drive.id} />
 ))}
 </div>
 </TabsContent>
 </Tabs>
 </div>
 )
}

function JobCard({ drive, onApply, applying }: { drive: DriveWithStatus, onApply: () => void, applying: boolean }) {
 const isApplied = drive.applications && drive.applications.length > 0;
 const applicationStatus = isApplied ? drive.applications![0].status : null;

 return (
 <Card className={`flex flex-col`}>
 <CardHeader>
 <div className="flex justify-between items-start mb-2">
 <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brown-800/10">
 <Building2 className="h-6 w-6 text-brown-800" />
 </div>
 {isApplied ? (
 <Badge variant={
 applicationStatus === 'shortlisted' ? 'default' :
 applicationStatus === 'rejected' ? 'destructive' : 'secondary'
 } className={applicationStatus === 'shortlisted' ? 'bg-success hover:bg-success/90' : ''}>
 {applicationStatus || 'Applied'}
 </Badge>
 ) : (
 <Badge variant="outline">{drive.status}</Badge>
 )}
 </div>
 <CardTitle className="text-lg">{drive.role}</CardTitle>
 <CardDescription className="font-medium text-foreground/80">{drive.company?.name}</CardDescription>
 </CardHeader>
 <CardContent className="flex-1 space-y-4">
 <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
 <div className="flex items-center gap-1">
 <Briefcase className="h-3.5 w-3.5" />
 <span>Full-time</span>
 </div>
 <div className="flex items-center gap-1">
 <MapPin className="h-3.5 w-3.5" />
 <span>{drive.location}</span>
 </div>
 <div className="flex items-center gap-1 font-semibold text-foreground">
 <IndianRupee className="h-3.5 w-3.5" />
 <span>{drive.ctc}</span>
 </div>
 </div>

 {drive.eligibilityCriteria && (
 <div className="flex items-center gap-2 p-2 rounded bg-muted text-xs">
 <AlertCircle className="h-3 w-3" />
 <span>Eligibility: {drive.eligibilityCriteria}</span>
 </div>
 )}
 </CardContent>
 <CardFooter className="border-t pt-4">
 <div className="flex items-center justify-between w-full">
 <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
 <Clock className="h-3.5 w-3.5" />
 <span>Date: {format(new Date(drive.date), 'MMM dd')}</span>
 </div>

 {!isApplied && (
 <Button className="min-h-[44px]" onClick={onApply} disabled={applying}>
 {applying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
 Apply Now
 </Button>
 )}
 {isApplied && (
 <Button size="sm" variant="outline" disabled>Applied</Button>
 )}
 </div>
 </CardFooter>
 </Card>
 )
}
