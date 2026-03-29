"use client"

import { useState, useEffect } from"react"
import { useParams, useRouter } from"next/navigation"
import { api } from"@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from"@/components/ui/card"
import { Button } from"@/components/ui/button"
import { Badge } from"@/components/ui/badge"
import { Avatar, AvatarFallback } from"@/components/ui/avatar"
import { ArrowLeft, Check, X, Clock, Calendar, Users, Save } from"lucide-react"
import { useToast } from"@/components/ui/use-toast"
import { format } from"date-fns"
import { Loader2 } from"lucide-react"

export default function AttendancePage() {
 const params = useParams();
 const sessionId = params.sessionId as string;
 const router = useRouter();
 const { toast } = useToast();

 const [session, setSession] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [students, setStudents] = useState<any[]>([]);
 const [attendance, setAttendance] = useState<Record<string, 'Present' | 'Absent'>>({});
 const [submitting, setSubmitting] = useState(false);

 useEffect(() => {
 const fetchSessionDetails = async () => {
 try {
 const data = await api.get(`/training/sessions/${sessionId}`);
 setSession(data);

 // Initialize students and existing attendance
 const primaryGroup = data.group ?? data.sessionGroups?.[0];
 if (primaryGroup?.students) {
 setStudents(primaryGroup.students);

 // Pre-fill attendance if already marked
 const initialAttendance: Record<string, 'Present' | 'Absent'> = {};
 // Default to Present for everyone if new, or load existing
 primaryGroup.students.forEach((student: any) => {
 const existingRecord = data.attendances?.find((a: any) => a.studentId === student.id);
 initialAttendance[student.id] = existingRecord ? existingRecord.status : 'Present';
 });
 setAttendance(initialAttendance);
 }
 } catch (error) {
 console.error(error);
 toast({ variant:"destructive", title:"Error", description:"Failed to load session details" });
 } finally {
 setLoading(false);
 }
 };

 if (sessionId) {
 fetchSessionDetails();
 }
 }, [sessionId]);

 const handleMark = (studentId: string, status: 'Present' | 'Absent') => {
 setAttendance(prev => ({
 ...prev,
 [studentId]: status
 }));
 };

 const handleMarkAll = (status: 'Present' | 'Absent') => {
 const newAttendance = { ...attendance };
 students.forEach(s => newAttendance[s.id] = status);
 setAttendance(newAttendance);
 }

 const handleSubmit = async () => {
 setSubmitting(true);
 try {
 const records = Object.entries(attendance).map(([studentId, status]) => ({
 studentId,
 status
 }));

 await api.post('/training/attendance/bulk', {
 sessionId,
 records
 });

 toast({ title:"Success", description:"Attendance saved successfully" });
 router.push('/trainer/schedule');
 } catch (error: any) {
 console.error(error);
 toast({ variant:"destructive", title:"Error", description:"Failed to save attendance" });
 } finally {
 setSubmitting(false);
 }
 };

 if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
 if (!session) return <div className="p-8 text-center text-muted-foreground">Session not found</div>;
 const primaryGroup = session.group ?? session.sessionGroups?.[0] ?? null;
 const canSubmitAttendance = Boolean(primaryGroup) && students.length > 0;

 const presentCount = Object.values(attendance).filter(s => s === 'Present').length;
 const totalCount = students.length;

 return (
 <div className="space-y-6 container mx-auto py-8 max-w-4xl">
 <div className="flex items-center gap-4 mb-6">
 <Button variant="ghost" size="icon" onClick={() => router.back()}>
 <ArrowLeft className="h-4 w-4" />
 </Button>
 <div>
 <h1 className="text-2xl font-bold tracking-tight">Mark Attendance</h1>
 <p className="text-muted-foreground flex items-center gap-2 text-sm">
 <Calendar className="h-3 w-3" /> {format(new Date(session.date),"PPP")} •
 <Clock className="h-3 w-3" /> {session.startTime ? format(new Date(session.startTime),"p") :"TBD"}
 </p>
 </div>
 <div className="ml-auto flex items-center gap-2">
 <Badge variant="outline" className="px-3 py-1 text-base">
 {presentCount} / {totalCount} Present
 </Badge>
 </div>
 </div>

 <Card>
 <CardHeader>
 <div className="flex justify-between items-start">
 <div>
 <CardTitle>{session.title}</CardTitle>
 <CardDescription className="flex items-center gap-2 mt-1">
 <Users className="h-3 w-3" /> {primaryGroup ? `${primaryGroup.name} (${primaryGroup.branch} - ${primaryGroup.year})` :"No group assigned"}
 </CardDescription>
 </div>
 <div className="flex gap-2">
 <Button size="sm" variant="outline" onClick={() => handleMarkAll('Present')} disabled={!canSubmitAttendance}>Mark All Present</Button>
 <Button size="sm" variant="outline" onClick={() => handleMarkAll('Absent')} disabled={!canSubmitAttendance}>Mark All Absent</Button>
 </div>
 </div>
 </CardHeader>
 <CardContent>
 {!canSubmitAttendance ? (
 <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
 Attendance cannot be marked because this session has no assigned group or enrolled students.
 </div>
 ) : (
 <div className="space-y-2">
 {students.map((student) => (
 <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
 <div className="flex items-center gap-3">
 <Avatar className="h-8 w-8">
 <AvatarFallback>{student.name?.charAt(0) || 'S'}</AvatarFallback>
 </Avatar>
 <div>
 <p className="font-medium text-sm">{student.name}</p>
 <p className="text-xs text-muted-foreground">{student.rollNo || 'No Roll No'}</p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <Button
 size="sm"
 variant={attendance[student.id] === 'Present' ? 'default' : 'outline'}
 onClick={() => handleMark(student.id, 'Present')}
 className={attendance[student.id] === 'Present' ? 'bg-green-600 hover:bg-green-700' : ''}
 >
 <Check className="h-4 w-4 mr-1" /> Present
 </Button>
 <Button
 size="sm"
 variant={attendance[student.id] === 'Absent' ? 'destructive' : 'outline'}
 onClick={() => handleMark(student.id, 'Absent')}
 >
 <X className="h-4 w-4 mr-1" /> Absent
 </Button>
 </div>
 </div>
 ))}
 </div>
 )}
 </CardContent>
 </Card>

 <div className="flex justify-end pt-4">
 <Button size="lg" onClick={handleSubmit} disabled={submitting || !canSubmitAttendance}>
 {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
 Save Attendance
 </Button>
 </div>
 </div>
 )
}
