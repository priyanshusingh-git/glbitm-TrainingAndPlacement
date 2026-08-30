"use client"

import { useState, useEffect } from"react"
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogDescription,
} from"@/components/ui/dialog"
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from"@/components/ui/table"
import { Badge } from"@/components/ui/badge"
import { Button } from"@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from"@/components/ui/select"
import { Loader2, Search, Mail, User, CheckCircle2, XCircle, Clock } from"lucide-react"
import { Input } from"@/components/ui/input"
import { api } from"@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { LoadingTable } from "@/components/ui/loading-states"
import { EnhancedEmpty } from "@/components/ui/enhanced-empty"
import { Users } from "lucide-react"
import { Avatar, AvatarFallback } from"@/components/ui/avatar"

interface ApplicantsViewProps {
 driveId: string;
 driveRole: string;
 companyName: string;
 isOpen: boolean;
 onClose: () => void;
}

export function ApplicantsView({ driveId, driveRole, companyName, isOpen, onClose }: ApplicantsViewProps) {
 const [applicants, setApplicants] = useState<any[]>([])
 const [loading, setLoading] = useState(true)
 const [searchQuery, setSearchQuery] = useState("")
 const { toast } = useToast()

 useEffect(() => {
 if (isOpen && driveId) {
 fetchApplicants()
 }
 }, [isOpen, driveId])

 const fetchApplicants = async () => {
 try {
 setLoading(true)
 const data = await api.get(`/placements/applications?driveId=${driveId}`)
 setApplicants(data)
 } catch (error) {
 toast({
 title:"Error",
 description:"Failed to load applicants",
 variant:"destructive"
 })
 } finally {
 setLoading(false)
 }
 }

 const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
 // 1. Snapshot
 const previousApplicants = [...applicants];

 // 2. Optimistic Update
 setApplicants(prev => prev.map(app => app.id === applicationId ? { ...app, status: newStatus } : app));
 toast({ title:"Updated", description: `Student status set to ${newStatus}` });

 try {
 // 3. Background Sync
 await api.patch(`/placements/applications/${applicationId}`, { status: newStatus });
 } catch (error) {
 // 4. Rollback
 setApplicants(previousApplicants);
 toast({ title:"Error", description:"Failed to update status", variant:"destructive" });
 }
 }

 const filteredApplicants = applicants.filter(app =>
 app.student.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
 app.student.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
 )

 const getStatusBadge = (status: string) => {
 switch (status.toLowerCase()) {
 case 'applied': return <Badge variant="outline" className="border-brown-800/20 bg-brown-800/5 text-brown-800 uppercase text-[10px] font-bold px-2 py-0.5"><Clock className="w-3 h-3 mr-1" /> Applied</Badge>
 case 'shortlisted': return <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 uppercase text-[10px] font-bold px-2 py-0.5">Shortlisted</Badge>
 case 'offered':
 case 'placed': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 uppercase text-[10px] font-bold px-2 py-0.5"><CheckCircle2 className="w-3 h-3 mr-1" /> Offered</Badge>
 case 'rejected': return <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 uppercase text-[10px] font-bold px-2 py-0.5"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>
 default: return <Badge variant="outline" className="uppercase text-[10px] font-bold px-2 py-0.5">{status}</Badge>
 }
 }

 return (
 <Dialog open={isOpen} onOpenChange={onClose}>
 <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
 <DialogHeader>
 <div className="flex justify-between items-center pr-8">
 <div>
 <DialogTitle className="text-xl">{driveRole} at {companyName}</DialogTitle>
 <DialogDescription>Manage applicants and their recruitment stages.</DialogDescription>
 </div>
 <div className="flex items-center gap-2">
 <Badge variant="outline" className="text-brown-800 font-bold">
 {applicants.length} Total Applicants
 </Badge>
 </div>
 </div>
 </DialogHeader>

 <div className="flex items-center gap-2 mb-4 bg-muted/30 p-2 rounded-md mt-4">
 <Search className="w-4 h-4 text-muted-foreground ml-2" />
 <Input
 placeholder="Search by student name or email..."
 className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 h-8"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>

 <div className="flex-1 overflow-y-auto min-h-[300px]">
 {loading ? (
 <LoadingTable rows={5} cols={4} />
 ) : filteredApplicants.length === 0 ? (
 <EnhancedEmpty
 icon={Users}
 title="No applicants found"
 description="Try a different search query or wait for students to submit applications."
 variant="minimal"
 />
 ) : (
 <Table>
 <TableHeader className="bg-muted/50 sticky top-0 z-10">
 <TableRow>
 <TableHead>Student</TableHead>
 <TableHead>Application Status</TableHead>
 <TableHead className="text-right">Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {filteredApplicants.map((app) => (
 <TableRow key={app.id}>
 <TableCell>
 <div className="flex items-center gap-3">
 <Avatar className="h-9 w-9">
 <AvatarFallback className="bg-brown-800/5 text-brown-800 text-xs font-bold">
 {app.student.user?.name?.split(' ').map((n: string) => n[0]).join('') || 'S'}
 </AvatarFallback>
 </Avatar>
 <div className="flex flex-col">
 <span className="font-semibold text-sm leading-none">{app.student.user?.name}</span>
 <span className="text-xs text-muted-foreground mt-1">{app.student.user?.email}</span>
 </div>
 </div>
 </TableCell>
 <TableCell>
 {getStatusBadge(app.status)}
 </TableCell>
 <TableCell className="text-right">
 <Select
 defaultValue={app.status}
 onValueChange={(val) => handleStatusUpdate(app.id, val)}
 >
 <SelectTrigger className="w-[140px] h-8 text-xs ml-auto">
 <SelectValue placeholder="Update stage" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="applied">Applied</SelectItem>
 <SelectItem value="shortlisted">Shortlisted</SelectItem>
 <SelectItem value="interview">Interview</SelectItem>
 <SelectItem value="offered">Offered</SelectItem>
 <SelectItem value="rejected">Rejected</SelectItem>
 </SelectContent>
 </Select>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 )}
 </div>
 </DialogContent>
 </Dialog>
 )
}
