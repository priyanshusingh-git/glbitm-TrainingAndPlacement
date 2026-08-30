"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Briefcase, Building2, MapPin, IndianRupee, Clock, Search, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { PlacementDrive } from "@/types/training"
import { format } from "date-fns"
import { PageHeader } from "@/components/layout/page-header"
import { EnhancedEmpty } from "@/components/ui/enhanced-empty"
import { LoadingGrid } from "@/components/ui/loading-states"

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
      setDrives(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to load placement drives",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (driveId: string) => {
    try {
      setApplyingId(driveId)
      await api.post(`/placements/${driveId}/apply`, {})
      toast({
        title: "Application Submitted",
        description: "You have successfully registered for this drive.",
      })
      fetchDrives() // Refresh state
    } catch (error: any) {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to apply for drive.",
        variant: "destructive"
      })
    } finally {
      setApplyingId(null)
    }
  }

  const filteredDrives = drives.filter(d => 
    d.company?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const ongoingDrives = filteredDrives.filter(d => d.status === 'ONGOING')
  const appliedDrives = filteredDrives.filter(d => d.applications && d.applications.length > 0)

  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-up stagger-1">
      <PageHeader
        title="Placement Drives"
        description="Explore active campus drives, view job requirements, and track your applications."
      />

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search company or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full space-y-6">
        <TabsList className="w-full sm:w-auto h-auto min-h-0 justify-start rounded-md border border-border/70 bg-card p-1 mb-6 flex overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden gap-1 shadow-xs scroll-smooth">
          <TabsTrigger
            value="all"
            className="group h-auto rounded-sm px-4 py-2 text-xs font-semibold text-muted-foreground transition-all duration-200 data-[state=active]:bg-brown-800 data-[state=active]:text-cream data-[state=active]:shadow-xs hover:bg-muted/50 hover:text-foreground flex items-center justify-center gap-2"
          >
            <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground group-data-[state=active]:text-amber-300 transition-colors" />
            <span>Active Drives</span>
            <span className="ml-1 rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-bold font-mono group-data-[state=active]:bg-amber-500/20 group-data-[state=active]:text-amber-200 group-data-[state=active]:border group-data-[state=active]:border-amber-500/30">
              {ongoingDrives.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="applied"
            className="group h-auto rounded-sm px-4 py-2 text-xs font-semibold text-muted-foreground transition-all duration-200 data-[state=active]:bg-brown-800 data-[state=active]:text-cream data-[state=active]:shadow-xs hover:bg-muted/50 hover:text-foreground flex items-center justify-center gap-2"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-muted-foreground group-data-[state=active]:text-amber-300 transition-colors" />
            <span>Applied Drives</span>
            <span className="ml-1 rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-bold font-mono group-data-[state=active]:bg-amber-500/20 group-data-[state=active]:text-amber-200 group-data-[state=active]:border group-data-[state=active]:border-amber-500/30">
              {appliedDrives.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {loading ? (
            <LoadingGrid items={6} />
          ) : ongoingDrives.length === 0 ? (
            <EnhancedEmpty
              icon={Briefcase}
              title="No Active Placement Drives"
              description="There are currently no active placement drives open for application."
              variant="illustrated"
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {ongoingDrives.map((drive) => (
                <JobCard key={drive.id} drive={drive} onApply={() => handleApply(drive.id)} applying={applyingId === drive.id} />
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="applied" className="space-y-6">
          {appliedDrives.length === 0 ? (
            <EnhancedEmpty
              icon={Briefcase}
              title="No Applications Submitted"
              description="You haven't applied to any placement drives yet. Explore active drives to submit applications."
              variant="illustrated"
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {appliedDrives.map((drive) => (
                <JobCard key={drive.id} drive={drive} onApply={() => handleApply(drive.id)} applying={applyingId === drive.id} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function JobCard({ drive, onApply, applying }: { drive: DriveWithStatus, onApply: () => void, applying: boolean }) {
  const isApplied = drive.applications && drive.applications.length > 0;
  const applicationStatus = isApplied ? drive.applications![0].status : null;

  return (
    <Card className={`flex flex-col active:scale-[0.98] transition-transform`}>
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-brown-800/10">
            <Building2 className="h-6 w-6 text-brown-800" />
          </div>
          {isApplied ? (
            <Badge 
              variant={
                applicationStatus === 'shortlisted' ? 'default' :
                applicationStatus === 'rejected' ? 'destructive' : 'secondary'
              } 
              className={applicationStatus === 'shortlisted' ? 'bg-success/15 text-success hover:bg-success/20 border-success/20' : ''}
            >
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
            <span className="tabular-nums">{drive.ctc}</span>
          </div>
        </div>

        {drive.eligibilityCriteria && (
          <div className="flex items-center gap-2 p-2 rounded-sm bg-muted text-xs">
            <AlertCircle className="h-3 w-3" />
            <span>Eligibility: {drive.eligibilityCriteria}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
            <Clock className="h-3.5 w-3.5" />
            <span className="tabular-nums">Date: {format(new Date(drive.date), 'MMM dd')}</span>
          </div>

          {!isApplied && (
            <Button size="default" onClick={onApply} disabled={applying}>
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
