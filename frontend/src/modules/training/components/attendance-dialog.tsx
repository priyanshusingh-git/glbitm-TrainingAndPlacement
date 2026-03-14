"use client"

import { useState, useEffect } from"react"
import {
 Dialog, DialogContent, DialogHeader,
 DialogTitle, DialogDescription, DialogFooter
} from"@/components/ui/dialog"
import { Button } from"@/components/ui/button"
import { Input } from"@/components/ui/input"
import {
 Table, TableBody, TableCell,
 TableHead, TableHeader, TableRow
} from"@/components/ui/table"
import { Badge } from"@/components/ui/badge"
import { Search, CheckCircle2, XCircle, Clock, AlertCircle, Loader2 } from"lucide-react"
import { api } from"@/lib/api"
import { useToast } from"@/components/ui/use-toast"
import { cn } from"@/lib/utils"

interface AttendanceDialogProps {
 open: boolean
 onOpenChange: (open: boolean) => void
 session: any
 onSuccess?: () => void
}

export function AttendanceDialog({ open, onOpenChange, session, onSuccess }: AttendanceDialogProps) {
 const { toast } = useToast()
 const [loading, setLoading] = useState(false)
 const [submitting, setSubmitting] = useState(false)
 const [students, setStudents] = useState<any[]>([])
 const [searchQuery, setSearchQuery] = useState("")

 useEffect(() => {
 if (open && session?.id) {
 fetchAttendance()
 }
 }, [open, session?.id])

 const fetchAttendance = async () => {
 setLoading(true)
 try {
 const data = await api.get(`/training/sessions/${session.id}/attendance`)
 // map status to existing attendance or default to null
 const list = data.map((s: any) => ({
 ...s,
 currentStatus: s.attendance?.status || null
 }))
 setStudents(list)
 } catch (error) {
 toast({ variant:"destructive", title:"Error", description:"Failed to load attendance list" })
 } finally {
 setLoading(false)
 }
 }

 const handleStatusChange = (studentId: string, status: string) => {
 setStudents(prev => prev.map(s =>
 s.id === studentId ? { ...s, currentStatus: status } : s
 ))
 }

 const markAllPresent = () => {
 setStudents(prev => prev.map(s => ({ ...s, currentStatus:"Present" })))
 }

 const handleSubmit = async () => {
 // filter out students without a status? No, maybe default to absent?
 // Let's only send those that have a status set.
 const attendances = students
 .filter(s => s.currentStatus)
 .map(s => ({
 studentId: s.id,
 status: s.currentStatus
 }))

 if (attendances.length === 0) {
 toast({ title:"No changes", description:"No attendance statuses were selected." })
 return
 }

 setSubmitting(true)
 try {
 await api.post(`/training/sessions/${session.id}/attendance`, { attendances })
 toast({ title:"Success", description:"Attendance saved successfully" })
 onSuccess?.()
 onOpenChange(false)
 } catch (error) {
 toast({ variant:"destructive", title:"Error", description:"Failed to save attendance" })
 } finally {
 setSubmitting(false)
 }
 }

 const filteredStudents = students.filter(s =>
 s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 s.admissionId.toLowerCase().includes(searchQuery.toLowerCase())
 )

 const STATUS_OPTIONS = [
 { value:"Present", color:"text-emerald-500", icon: CheckCircle2, bg:"bg-emerald-50" },
 { value:"Absent", color:"text-destructive", icon: XCircle, bg:"bg-red-50" },
 { value:"Late", color:"text-amber-500", icon: Clock, bg:"bg-amber-50" },
 { value:"Excused", color:"text-blue-500", icon: AlertCircle, bg:"bg-blue-50" }
 ]

 return (
 <Dialog open={open} onOpenChange={onOpenChange}>
 <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
 <DialogHeader className="p-6 border-b">
 <div className="flex justify-between items-start">
 <div>
 <DialogTitle className="text-xl font-bold">Mark Attendance</DialogTitle>
 <DialogDescription className="mt-1">
 {session?.title} • {session?.group?.name ||"Group"}
 </DialogDescription>
 </div>
 <Button variant="outline" size="sm" onClick={markAllPresent} className="font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200">
 Mark All Present
 </Button>
 </div>
 </DialogHeader>

 <div className="p-4 border-b bg-muted/20 flex gap-4">
 <div className="relative flex-1">
 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
 <Input
 placeholder="Search students..."
 className="pl-8 h-9 bg-background"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>
 <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
 <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Present: {students.filter(s => s.currentStatus ==="Present").length}</span>
 <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-destructive" /> Absent: {students.filter(s => s.currentStatus ==="Absent").length}</span>
 </div>
 </div>

 <div className="flex-1 overflow-y-auto px-1">
 {loading ? (
 <div className="flex flex-col items-center justify-center py-20 gap-4">
 <Loader2 className="h-8 w-8 animate-spin text-brown-800" />
 <p className="text-sm text-muted-foreground">Fetching student list...</p>
 </div>
 ) : (
 <Table>
 <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
 <TableRow>
 <TableHead className="w-[120px]">ID</TableHead>
 <TableHead>Student Name</TableHead>
 <TableHead className="text-center">Status</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {filteredStudents.map((student) => (
 <TableRow key={student.id} className="hover:bg-muted/30">
 <TableCell className="font-mono text-xs font-medium">{student.admissionId}</TableCell>
 <TableCell>
 <div className="flex flex-col">
 <span className="font-bold text-sm">{student.name}</span>
 <span className="text-[10px] text-muted-foreground">{student.branch}</span>
 </div>
 </TableCell>
 <TableCell>
 <div className="flex items-center justify-center gap-1">
 {STATUS_OPTIONS.map((opt) => {
 const isActive = student.currentStatus === opt.value
 const Icon = opt.icon
 return (
 <Button
 key={opt.value}
 variant="outline"
 size="sm"
 onClick={() => handleStatusChange(student.id, opt.value)}
 className={cn(
"h-8 px-2 gap-1.5 transition-all text-[10px] font-bold uppercase tracking-wider",
 isActive ? `${opt.bg} ${opt.color} border-${opt.color.split('-')[1]}-200` :"hover:bg-muted"
 )}
 >
 <Icon className={cn("h-3 w-3", isActive ? opt.color :"text-muted-foreground")} />
 {opt.value}
 </Button>
 )
 })}
 </div>
 </TableCell>
 </TableRow>
 ))}
 {filteredStudents.length === 0 && !loading && (
 <TableRow>
 <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
 No students matched your search.
 </TableCell>
 </TableRow>
 )}
 </TableBody>
 </Table>
 )}
 </div>

 <DialogFooter className="p-6 border-t bg-muted/10">
 <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
 <Button
 onClick={handleSubmit}
 disabled={submitting || loading}
 className="font-bold px-8"
 >
 {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> :"Save Attendance"}
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 )
}
