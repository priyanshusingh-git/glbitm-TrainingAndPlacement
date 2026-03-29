"use client"

import { useState, useEffect, use } from"react"
import { useRouter } from"next/navigation"
import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
 CardDescription
} from"@/components/ui/card"
import { Badge } from"@/components/ui/badge"
import { Button } from"@/components/ui/button"
import { Input } from"@/components/ui/input"
import {
 Users,
 Calendar,
 ArrowLeft,
 UserPlus,
 BookOpen,
 MoreHorizontal,
 Search,
 Clock,
 CheckCircle,
 XCircle,
 MapPin,
 GraduationCap,
 Presentation,
 ClipboardList,
 Pencil,
 Trash2,
 Plus,
 ArrowRight,
 Filter,
 SearchCode,
 Settings2,
 AlertCircle,
 Check,
 X,
 UploadCloud,
 Loader2
} from"lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from"@/components/ui/tabs"
import { api } from"@/lib/api"
import { useToast } from"@/components/ui/use-toast"
import { useAuth } from"@/contexts/auth-context"
import * as XLSX from"xlsx"
import { AttendanceDialog } from"@/modules/training/components/attendance-dialog"
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow
} from"@/components/ui/table"
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from"@/components/ui/dropdown-menu"
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from"@/components/ui/dialog"
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from"@/components/ui/select"
import {
 Command,
 CommandEmpty,
 CommandGroup,
 CommandInput,
 CommandItem,
 CommandList,
} from"@/components/ui/command"
import { Label } from"@/components/ui/label"
import { Textarea } from"@/components/ui/textarea"
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
} from"@/components/ui/alert-dialog"
import { cn } from"@/lib/utils"

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = use(params);
 const router = useRouter();
 const { toast } = useToast();
 const { user } = useAuth();

 const [group, setGroup] = useState<any>(null);
 const [sessions, setSessions] = useState<any[]>([]);
 const [trainers, setTrainers] = useState<any[]>([]);
 const [allStudents, setAllStudents] = useState<any[]>([]);
 const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
 const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);
 const [selectedTrainerType, setSelectedTrainerType] = useState<string>("");
 const [loading, setLoading] = useState(true);
 const [studentSearch, setStudentSearch] = useState("");
 const [studentSelectorSearch, setStudentSelectorSearch] = useState("");
 const [trainerSelectorSearch, setTrainerSelectorSearch] = useState("");
 const [attendanceOpen, setAttendanceOpen] = useState(false);
 const [assignStudentOpen, setAssignStudentOpen] = useState(false);
 const [assignTrainerOpen, setAssignTrainerOpen] = useState(false);
 const [createSessionOpen, setCreateSessionOpen] = useState(false);
 const [selectedSession, setSelectedSession] = useState<any>(null);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [isParsing, setIsParsing] = useState(false);

 useEffect(() => {
 fetchGroupDetails();
 fetchGroupSessions();
 fetchTrainers();
 fetchAllStudents();
 }, [id]);

 const fetchGroupDetails = async () => {
 setLoading(true);
 try {
 const data = await api.get(`/training/groups/${id}`);
 setGroup(data);
 } catch (error) {
 console.error(error);
 toast({ variant:"destructive", title:"Error", description:"Failed to fetch group details" });
 } finally {
 setLoading(false);
 }
 };

 const fetchGroupSessions = async () => {
 try {
 const data = await api.get(`/training/sessions?groupId=${id}`);
 setSessions(data);
 } catch (error) {
 console.error(error);
 }
 };

 const fetchTrainers = async () => {
 try {
 const data = await api.get('/training/trainers');
 setTrainers(data || []);
 } catch (error) {
 console.error(error);
 }
 };

 const fetchAllStudents = async () => {
 try {
 const data = await api.get('/students');
 setAllStudents(data || []);
 } catch (error) {
 console.error(error);
 }
 };

 const handleDeleteSession = async (sessionId: string) => {
 const previousSessions = [...sessions];
 setSessions(prev => prev.filter(s => s.id !== sessionId));

 try {
 await api.delete(`/training/sessions/${sessionId}`);
 toast({ title:"Success", description:"Session deleted successfully" });
 } catch (error: any) {
 setSessions(previousSessions);
 toast({ variant:"destructive", title:"Deletion Failed", description: error.message });
 }
 };

 const handleRemoveTrainer = async (assignmentId: string) => {
 const previousGroup = { ...group };
 setGroup((prev: any) => ({
 ...prev,
 trainers: prev.trainers.filter((t: any) => t.id !== assignmentId)
 }));

 try {
 await api.delete(`/training/groups/assign-trainer?id=${assignmentId}`);
 toast({ title:"Success", description:"Trainer removed successfully" });
 } catch (error: any) {
 setGroup(previousGroup);
 toast({ variant:"destructive", title:"Removal Failed", description: error.message });
 }
 };

 const handleRemoveStudent = async (studentId: string, admissionId: string) => {
 const previousGroup = { ...group };
 setGroup((prev: any) => ({
 ...prev,
 students: prev.students.filter((s: any) => s.id !== studentId),
 _count: { ...prev._count, students: prev._count.students - 1 }
 }));

 try {
 await api.delete(`/training/groups/${id}/assign`, {
 body: { studentIds: [admissionId] }
 });
 toast({ title:"Success", description:"Student removed successfully" });
 } catch (error: any) {
 setGroup(previousGroup);
 toast({ variant:"destructive", title:"Removal Failed", description: error.message });
 }
 };

 if (loading) {
 return (
 <div className="flex items-center justify-center min-h-[400px]">
 <div className="h-12 w-12 border-4 border-brown-800/20 border-t-primary rounded-full animate-spin" />
 </div>
 );
 }

 if (!group) {
 return (
 <div className="flex flex-col items-center justify-center py-24 space-y-4">
 <div className="p-4 rounded-full bg-destructive/10">
 <XCircle className="h-12 w-12 text-destructive" />
 </div>
 <div className="text-center">
 <h2 className="text-2xl font-black uppercase tracking-tight">Group not found</h2>
 <p className="text-muted-foreground mt-1">The requested training group does not exist or has been removed.</p>
 </div>
 <Button onClick={() => router.back()} variant="outline" className="rounded-xl px-8 font-bold uppercase tracking-widest text-[10px]">
 <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
 </Button>
 </div>
 );
 }

 const filteredStudents = group.students?.filter((s: any) =>
 (s.name ||"").toLowerCase().includes((studentSearch ||"").toLowerCase()) ||
 (s.admissionId ||"").toLowerCase().includes((studentSearch ||"").toLowerCase())
 ) || [];

 const filteredAllStudents = allStudents.filter(s => {
 if (!group) return false;
 if (group.branch !=="ALL" && s.branch !== group.branch) return false;
 return true;
 });

 const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 const reader = new FileReader();
 reader.onload = (evt) => {
 try {
 const bstr = evt.target?.result;
 const wb = XLSX.read(bstr, { type: 'array' });
 const wsname = wb.SheetNames[0];
 const ws = wb.Sheets[wsname];
 const data = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });

 // Assuming Admission Numbers are in the first column
 const parsedIds = data
 .map((row: any) => row[0]?.toString().trim())
 .filter(Boolean);

 const validParsedIds = parsedIds.filter(id =>
 filteredAllStudents.some(s => s.admissionId.toLowerCase() === id.toLowerCase()) &&
 !group?.students?.some((s: any) => s.admissionId.toLowerCase() === id.toLowerCase())
 );

 // Merge without duplicates respecting current selection
 setSelectedStudentIds(prev => Array.from(new Set([...prev, ...validParsedIds])));

 toast({ title:"File Parsed", description: `Found ${validParsedIds.length} valid new students matching branch criteria.` });
 } catch (error) {
 toast({ variant:"destructive", title:"Parsing Error", description:"Failed to read the file. Ensure it's a valid CSV/Excel file." });
 }
 };
 reader.readAsArrayBuffer(file);
 };

 return (
 <div className="document-page pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
 <div className="document-hero flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="space-y-4">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => router.push('/admin/training')}
 className="-ml-3 h-10 px-4 font-semibold text-sm text-muted-foreground hover:text-brown-800 transition-all"
 >
 <ArrowLeft className="mr-2 h-4 w-4" /> Back to Training
 </Button>
 <div className="flex flex-col gap-2">
 <div className="flex items-center gap-3">
 <h1 className="text-3xl font-bold tracking-tight text-foreground">
 {group.name} <span className="text-brown-800 italic">Batch</span>
 </h1>
 <Badge variant="outline" className="px-3 py-1 rounded-full border-brown-800/20 bg-brown-800/10 text-brown-800 text-xs font-semibold">
 {group.branch} • {group.year}
 </Badge>
 </div>
 <p className="text-sm font-medium text-muted-foreground mt-1 max-w-2xl">
 {group.description ||"Core training group for academic advancement and career placement readiness."}
 </p>
 </div>
 </div>
 </div>


 <Tabs defaultValue="overview" className="space-y-6">
 <div className="flex items-center justify-between border-b border-border pb-1">
 <TabsList className="mb-2 h-11">
 <TabsTrigger value="overview" className="px-6 text-sm font-semibold">Overview</TabsTrigger>
 <TabsTrigger value="students" className="px-6 text-sm font-semibold">Students ({group._count.students})</TabsTrigger>
 <TabsTrigger value="sessions" className="px-6 text-sm font-semibold">Sessions ({sessions.length})</TabsTrigger>
 <TabsTrigger value="trainers" className="px-6 text-sm font-semibold">Trainers ({group.trainers.length})</TabsTrigger>
 </TabsList>
 </div>

 {/* OVERVIEW TAB */}
 <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
 <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
 <Card className="document-panel lg:col-span-2 overflow-hidden">
 <CardHeader className="border-b border-border bg-muted/20 pb-8">
 <div className="flex items-center justify-between">
 <div className="space-y-1">
 <CardTitle className="text-xl font-semibold uppercase tracking-[0.18em]">Group Details</CardTitle>
 <CardDescription>Comprehensive information and configuration for this group.</CardDescription>
 </div>
 <Settings2 className="h-6 w-6 text-muted-foreground/30" />
 </div>
 </CardHeader>
 <CardContent className="pt-8 space-y-8">
 <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
 {[
 { label:"Batch Year", value: `${group.year}`, icon: Calendar },
 { label:"Department", value: group.branch, icon: MapPin },
 { label:"Created On", value: new Date(group.createdAt).toLocaleDateString(), icon: Clock },
 { label:"Status", value:"Active", icon: CheckCircle },
 ].map((spec, i) => (
 <div key={i} className="space-y-2 group/spec">
 <div className="flex items-center gap-2 text-muted-foreground/60 group-hover/spec:text-brown-800 transition-colors">
 <spec.icon className="h-3.5 w-3.5" />
 <span className="text-[10px] font-semibold uppercase tracking-[0.15em]">{spec.label}</span>
 </div>
 <p className="text-lg font-semibold tracking-tight">{spec.value}</p>
 </div>
 ))}
 </div>
 <div className="pt-8 border-t border-border">
 <h4 className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">Training Description</h4>
 <p className="document-subtle p-6 text-sm font-medium italic leading-relaxed text-foreground/80">
 {group.description ||"No description defined for this group. Training protocols are currently active across all assigned modules."}
 </p>
 </div>
 </CardContent>
 </Card>

 <Card className="document-panel overflow-hidden">
 <CardHeader className="tone-primary border-b pb-4">
 <CardTitle className="text-lg font-semibold uppercase tracking-[0.18em] text-brown-800">Active Trainers</CardTitle>
 </CardHeader>
 <CardContent className="pt-6">
 {group.trainers.length === 0 ? (
 <div className="rounded-3xl border-2 border-dashed border-border bg-muted/30 py-12 text-center">
 <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50">No Trainers Assigned</p>
 <Button variant="link" size="sm" className="mt-2 text-brown-800 font-bold text-[10px] uppercase tracking-widest">Assign Now</Button>
 </div>
 ) : (
 <div className="space-y-4">
 {group.trainers.slice(0, 4).map((t: any) => (
 <div key={t.id} className="document-subtle group/mentor flex items-center justify-between p-4 hover:border-brown-800/20">
 <div className="flex items-center gap-4">
 <div className="tone-primary flex h-10 w-10 items-center justify-center rounded-xl border font-semibold group-hover/mentor:scale-110 transition-transform">
 {(t.trainer.name ||"T")[0]}
 </div>
 <div>
 <p className="text-sm font-semibold uppercase tracking-tight">{t.trainer.name}</p>
 <Badge variant="outline" className="tone-primary mt-1 h-5 border text-[9px] font-semibold uppercase tracking-[0.1em]">
 {t.type}
 </Badge>
 </div>
 </div>
 </div>
 ))}
 {group.trainers.length > 4 && (
 <Button variant="ghost" className="w-full text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
 View +{group.trainers.length - 4} More Trainers
 </Button>
 )}
 </div>
 )}
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 {/* STUDENTS TAB */}
 <TabsContent value="students" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
 <Card className="document-panel overflow-hidden">
 <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 pb-8 px-8 pt-8">
 <div className="space-y-1">
 <CardTitle className="text-xl font-semibold uppercase tracking-[0.18em]">Enrolled Students</CardTitle>
 <CardDescription>Managing {group._count.students} students in this group.</CardDescription>
 </div>
 <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
 <div className="relative w-full md:w-64 group">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brown-800 transition-colors" />
 <Input
 placeholder="Search..."
 className="pl-11 h-12 rounded-2xl border-border bg-muted/50 focus:bg-background transition-all font-medium"
 value={studentSearch}
 onChange={(e) => setStudentSearch(e.target.value)}
 />
 </div>
 <Button
 onClick={() => setAssignStudentOpen(true)}
 className="h-10 px-6 rounded-md shadow-sm font-semibold text-sm w-full md:w-auto"
 >
 <UserPlus className="mr-2 h-4 w-4" /> Assign Students
 </Button>
 </div>
 </CardHeader>
 <CardContent className="px-1 border-t border-border">
 <Table>
 <TableHeader className="bg-muted/30">
 <TableRow className="hover:bg-transparent border-border/20">
 <TableHead className="py-4 px-8 font-semibold text-sm text-muted-foreground/70">Admission ID</TableHead>
 <TableHead className="py-4 font-semibold text-sm text-muted-foreground/70">Student Name</TableHead>
 <TableHead className="py-4 font-semibold text-sm text-muted-foreground/70">Email Address</TableHead>
 <TableHead className="py-4 font-semibold text-sm text-muted-foreground/70">Branch</TableHead>
 <TableHead className="py-4 px-8 text-right font-semibold text-sm text-muted-foreground/70">Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {filteredStudents.length === 0 ? (
 <TableRow>
 <TableCell colSpan={5} className="h-48 text-center bg-muted/5">
 <div className="flex flex-col items-center justify-center space-y-3 opacity-40">
 <SearchCode className="h-10 w-10 text-muted-foreground" />
 <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">No students found</p>
 </div>
 </TableCell>
 </TableRow>
 ) : (
 filteredStudents.map((student: any) => (
 <TableRow key={student.id} className="group/row hover:bg-muted/50 transition-all border-border/20">
 <TableCell className="py-5 px-8 font-mono text-xs font-bold text-muted-foreground group-hover/row:text-brown-800 transition-colors">{student.admissionId}</TableCell>
 <TableCell className="py-5">
 <div className="flex items-center gap-3">
 <div className="tone-primary flex h-8 w-8 items-center justify-center rounded-lg border text-[10px] font-semibold">
 {(student.name ||"S")[0]}
 </div>
 <span className="text-xs font-semibold uppercase tracking-tight">{student.name}</span>
 </div>
 </TableCell>
 <TableCell className="py-5 text-xs text-muted-foreground italic">{student.user?.email}</TableCell>
 <TableCell className="py-5">
 <Badge variant="outline" className="h-5 rounded-md border border-border bg-background px-3 text-[9px] font-semibold uppercase tracking-wider transition-all group-hover/row:border-brown-800/20 group-hover/row:bg-brown-800/10 group-hover/row:text-brown-800">
 {student.branch}
 </Badge>
 </TableCell>
 <TableCell className="py-5 px-8 text-right">
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl opacity-0 group-hover/row:opacity-100 focus:opacity-100 transition-all hover:bg-brown-800/10">
 <MoreHorizontal className="h-4.5 w-4.5" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-56 rounded-2xl border-border p-2 shadow-2xl">
 <DropdownMenuLabel className="px-2 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Operations</DropdownMenuLabel>
 <DropdownMenuItem onClick={() => router.push(`/admin/students/${student.id}/profile`)} className="rounded-xl py-3 focus:bg-brown-800/10">
 <Users className="mr-2 h-4 w-4 text-brown-800" /> <span className="font-bold text-xs uppercase tracking-wider">View Profile</span>
 </DropdownMenuItem>
 <DropdownMenuSeparator className="bg-border/40" />
 <DropdownMenuItem
 className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-xl py-3"
 onClick={() => handleRemoveStudent(student.id, student.admissionId)}
 >
 <Trash2 className="mr-2 h-4 w-4" /> <span className="font-bold text-xs uppercase tracking-wider">Remove from Group</span>
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </TableCell>
 </TableRow>
 ))
 )}
 </TableBody>
 </Table>
 </CardContent>
 </Card>
 </TabsContent>

 {/* SESSIONS TAB */}
 <TabsContent value="sessions" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
 <Card className="document-panel overflow-hidden">
 <CardHeader className="pb-8 pt-8 px-8 border-b border-border">
 <div className="flex items-center justify-between">
 <div className="space-y-1">
 <CardTitle className="text-xl font-semibold uppercase tracking-[0.18em]">Training Sessions</CardTitle>
 <CardDescription>History and upcoming scheduled sessions.</CardDescription>
 </div>
 <Button
 onClick={() => setCreateSessionOpen(true)}
 size="sm"
 className="h-10 px-6 rounded-xl font-semibold text-sm shadow-sm"
 >
 <Plus className="mr-2 h-4 w-4" /> New Session
 </Button>
 </div>
 </CardHeader>
 <CardContent className="pt-8 px-8">
 <div className="space-y-8">
 {sessions.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-muted/5 rounded-xl border-2 border-dashed border-border text-center">
 <div className="p-4 rounded-full bg-brown-800/10">
 <BookOpen className="h-12 w-12 text-brown-800/30" />
 </div>
 <div className="text-center">
 <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">No Sessions Found</p>
 <p className="text-sm text-muted-foreground mt-1 max-w-xs">No training sessions have been logged for this group yet.</p>
 </div>
 </div>
 ) : (
 <div className="grid gap-6">
 {sessions.map((session) => (
 <div key={session.id} className="document-subtle group relative rounded-xl p-6 hover:bg-card hover:shadow-xl hover:shadow-primary/5">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
 <div className="flex items-start gap-4">
 <div className={cn(
"p-4 rounded-2xl shadow-inner transition-all transform",
 session.status === 'completed' ?"tone-success border" :
 session.status === 'scheduled' ?"tone-primary border" :"tone-neutral border"
 )}>
 {session.status === 'completed' ? <CheckCircle className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
 </div>
 <div className="space-y-1">
 <div className="flex items-center gap-3">
 <h4 className="text-xl font-semibold uppercase tracking-tight transition-colors group-hover:text-brown-800">{session.title}</h4>
 <Badge variant="outline" className="tone-primary h-5 rounded-md border px-3 text-[9px] font-semibold uppercase tracking-[0.1em]">
 {session.type}
 </Badge>
 </div>
 <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-2">
 <span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-brown-800/60" /> {new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
 <span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-brown-800/60" /> {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
 <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-brown-800/60" /> {session.mode} • {session.location || 'N/A'}</span>
 </div>
 </div>
 </div>

 <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-border/20">
 <div className="flex flex-col items-start md:items-end gap-1">
 <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">Assigned Trainer</span>
 <p className="text-sm font-semibold uppercase text-brown-800/80">{session.trainer.name}</p>
 </div>
 <div className="flex items-center gap-2">
 <Button
 variant="outline"
 size="sm"
 className="h-10 rounded-xl border-border px-5 text-sm font-semibold transition-all hover:bg-brown-800 hover:text-brown-800-foreground"
 onClick={() => {
 setSelectedSession(session);
 setAttendanceOpen(true);
 }}
 >
 <ClipboardList className="mr-2 h-4 w-4" /> Attendance
 </Button>
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-brown-800/10 transition-all opacity-0 group-hover:opacity-100">
 <MoreHorizontal className="h-4.5 w-4.5" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-56 rounded-2xl border-border p-2 shadow-2xl">
 <DropdownMenuItem className="rounded-xl py-3 focus:bg-brown-800/10">
 <Pencil className="mr-2 h-4 w-4" /> <span className="font-bold text-xs uppercase tracking-wider">Edit Session</span>
 </DropdownMenuItem>
 <DropdownMenuSeparator className="bg-border/40" />
 <DropdownMenuItem
 className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-xl py-3"
 onClick={() => handleDeleteSession(session.id)}
 >
 <Trash2 className="mr-2 h-4 w-4" /> <span className="font-bold text-xs uppercase tracking-wider">Delete Session</span>
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </CardContent>
 </Card>
 </TabsContent>

 {/* TRAINERS TAB */}
 <TabsContent value="trainers" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
 <Card className="document-panel overflow-hidden">
 <CardHeader className="pb-8 pt-8 px-8 flex flex-row items-center justify-between border-b border-border">
 <div className="space-y-1">
 <CardTitle className="text-xl font-semibold uppercase tracking-[0.18em]">Assigned Trainers</CardTitle>
 <CardDescription>Mentors and instructors assigned to this group.</CardDescription>
 </div>
 <Button
 onClick={() => setAssignTrainerOpen(true)}
 size="sm"
 className="h-10 px-6 rounded-xl font-semibold text-sm shadow-sm"
 >
 <UserPlus className="mr-2 h-4 w-4" /> Assign Trainer
 </Button>
 </CardHeader>
 <CardContent className="pt-0 px-8 pb-8">
 <div className="grid gap-6 md:grid-cols-2">
 {group.trainers.length === 0 ? (
 <div className="col-span-2 flex flex-col items-center justify-center py-24 space-y-4 bg-muted/5 rounded-xl border-2 border-dashed border-border text-center">
 <div className="p-4 rounded-full bg-brown-800/10">
 <UserPlus className="h-12 w-12 text-brown-800/30" />
 </div>
 <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">No Trainers Assigned</p>
 </div>
 ) : (
 group.trainers.map((t: any) => (
 <Card key={t.id} className="document-subtle group/mcard relative overflow-hidden rounded-xl transition-all duration-500 hover:shadow-xl hover:shadow-primary/10">
 <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full bg-brown-800/10 opacity-0 group-hover/mcard:opacity-100 transition-opacity duration-700" />
 <CardContent className="p-6">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-5">
 <div className="tone-primary flex h-16 w-16 items-center justify-center rounded-2xl border text-3xl font-semibold shadow-xl shadow-primary/10 transition-all group-hover/mcard:scale-105">
 {(t.trainer.name ||"T")[0]}
 </div>
 <div className="space-y-1">
 <h4 className="text-lg font-semibold uppercase tracking-tight">{t.trainer.name}</h4>
 <p className="text-xs text-muted-foreground font-medium italic">{t.trainer.email}</p>
 <Badge className="tone-primary mt-2 h-5 rounded-md border px-3 text-[9px] font-semibold uppercase tracking-[0.15em]">
 {t.type} Specialized
 </Badge>
 </div>
 </div>
 </div>
 <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-border/20">
 <Button variant="ghost" className="h-10 px-6 rounded-xl font-semibold text-xs hover:bg-brown-800/10 text-muted-foreground hover:text-brown-800 transition-all">
 View Details
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={() => handleRemoveTrainer(t.id)}
 className="h-10 px-6 rounded-xl text-destructive hover:bg-destructive shadow-sm hover:text-white border-destructive/20 font-semibold text-xs transition-all"
 >
 Remove Trainer
 </Button>
 </div>
 </CardContent>
 </Card>
 ))
 )}
 </div>
 </CardContent>
 </Card>
 </TabsContent>
 </Tabs>

 <AttendanceDialog
 open={attendanceOpen}
 onOpenChange={setAttendanceOpen}
 session={selectedSession}
 onSuccess={fetchGroupSessions}
 />

 {/* Assign Students Modal */}
 <Dialog open={assignStudentOpen} onOpenChange={setAssignStudentOpen}>
 <DialogContent className="sm:max-w-[550px] rounded-xl border-border bg-card/95 p-0 overflow-hidden">
 <DialogHeader className="p-8 bg-muted/50 border-b border-border">
 <div className="p-3 w-fit rounded-2xl bg-brown-800/10 border border-brown-800/20 mb-4">
 <Users className="h-6 w-6 text-brown-800" />
 </div>
 <DialogTitle className="text-2xl font-semibold uppercase tracking-[0.18em]">Select <span className="text-brown-800 italic">Students</span></DialogTitle>
 <DialogDescription className="text-sm font-medium">Search and select students to assign to this cohort.</DialogDescription>
 </DialogHeader>
 <form onSubmit={async (e: any) => {
 e.preventDefault();
 if (selectedStudentIds.length === 0) {
 toast({ variant:"destructive", title:"Error", description:"Please select at least one student." });
 return;
 }
 setIsSubmitting(true);

 try {
 await api.post(`/training/groups/${id}/assign`, { studentIds: selectedStudentIds });
 toast({ title:"Success", description: `${selectedStudentIds.length} students assigned successfully` });
 setAssignStudentOpen(false);
 setSelectedStudentIds([]);
 fetchGroupDetails();
 } catch (error: any) {
 toast({ variant:"destructive", title:"Error", description: error.message ||"Failed to assign students" });
 } finally {
 setIsSubmitting(false);
 }
 }} className="p-8 space-y-6">
 <div className="space-y-4">
 <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
 <Label className="font-semibold text-sm text-muted-foreground/60 ml-2">Search Students</Label>
 <div className="flex items-center gap-2 max-w-[250px]">
 {isParsing && <Loader2 className="h-4 w-4 animate-spin text-brown-800 shrink-0" />}
 <Input
 id="file-upload"
 type="file"
 accept=".xlsx, .xls, .csv"
 disabled={isParsing}
 className="h-10 text-xs cursor-pointer"
 onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 setIsParsing(true);
 // Reset the value so the same file can be uploaded again if needed
 e.target.value = '';

 // Small timeout to allow React to render the loading state
 setTimeout(() => {
 const reader = new FileReader();
 reader.onload = (evt) => {
 try {
 const buffer = evt.target?.result;
 const wb = XLSX.read(buffer, { type: 'array' });
 const wsname = wb.SheetNames[0];
 const ws = wb.Sheets[wsname];
 const data = XLSX.utils.sheet_to_json<any>(ws, { header: 1 });

 const parsedIds: string[] = [];
 data.forEach((row: any) => {
 const cells = Array.isArray(row) ? row : Object.values(row);
 cells.forEach(cell => {
 if (cell) parsedIds.push(cell.toString().trim());
 });
 });

 const filteredAllStudents = allStudents.filter(s => {
 if (!group) return false;
 if (group.branch !=="ALL" && s.branch !== group.branch) return false;
 return true;
 });

 const validParsedIds = parsedIds.filter(id =>
 filteredAllStudents.some(s => s.admissionId.toLowerCase() === id.toLowerCase()) &&
 !group?.students?.some((s: any) => s.admissionId.toLowerCase() === id.toLowerCase())
 );

 // Merge without duplicates respecting current selection
 setSelectedStudentIds(prev => Array.from(new Set([...prev, ...validParsedIds])));

 if (validParsedIds.length > 0) {
 toast({ title:"File Parsed", description: `Found ${validParsedIds.length} valid new students matching branch criteria.` });
 } else {
 toast({ variant:"destructive", title:"No Students Found", description:"Could not find any new students matching the group criteria in the file." });
 }
 } catch (error) {
 toast({ variant:"destructive", title:"Parsing Error", description:"Failed to read the file." });
 } finally {
 setIsParsing(false);
 }
 };
 reader.readAsArrayBuffer(file);
 }, 100);
 }}
 />
 </div>
 </div>

 <Command className="rounded-2xl border border-border bg-background/50 overflow-hidden">
 <CommandInput
 placeholder={group?.branch ==="ALL" ?"Search by name or Admission ID..." : `Search ${group?.branch} students...`}
 value={studentSelectorSearch}
 onValueChange={setStudentSelectorSearch}
 className="h-10 border-none ring-0 focus:ring-0"
 />
 <CommandList className="max-h-[250px] scrollbar-hide">
 <CommandEmpty className="py-6 font-semibold text-sm text-muted-foreground/40">No students found.</CommandEmpty>
 <CommandGroup>
 {allStudents
 .filter(s => {
 if (group && group.branch !=="ALL" && s.branch !== group.branch) return false;
 const search = studentSelectorSearch.toLowerCase();
 const studentName = (s.name ||"").toLowerCase();
 const studentAdmissionId = (s.admissionId ||"").toLowerCase();
 return studentName.includes(search) || studentAdmissionId.includes(search);
 })
 .map(student => {
 const isSelected = selectedStudentIds.includes(student.admissionId);
 const isAlreadyInGroup = group?.students?.some((s: any) => s.admissionId === student.admissionId);

 return (
 <CommandItem
 key={student.id}
 onSelect={() => {
 if (isAlreadyInGroup) return;
 setSelectedStudentIds(prev =>
 isSelected
 ? prev.filter(id => id !== student.admissionId)
 : [...prev, student.admissionId]
 );
 }}
 disabled={isAlreadyInGroup}
 className={cn(
"flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all mb-1",
 isSelected ?"bg-brown-800/10 text-brown-800" :"hover:bg-muted/50",
 isAlreadyInGroup &&"opacity-50 cursor-not-allowed grayscale"
 )}
 >
 <div className="flex items-center gap-3">
 <div className="h-8 w-8 rounded-lg bg-background border border-border flex items-center justify-center font-black text-[10px]">
 {(student.name ||"S")[0]}
 </div>
 <div className="flex flex-col">
 <span className="font-bold text-xs uppercase tracking-tight">{student.name}</span>
 <span className="text-[10px] text-muted-foreground font-mono">{student.admissionId} • {student.branch}</span>
 </div>
 </div>
 {isSelected && <Check className="h-4 w-4 text-brown-800" />}
 {isAlreadyInGroup && <Badge variant="secondary" className="text-[8px] uppercase tracking-widest py-0">Member</Badge>}
 </CommandItem>
 );
 })}
 </CommandGroup>
 </CommandList>
 </Command>

 {/* Selection Preview */}
 {selectedStudentIds.length > 0 && (
 <div className="space-y-3">
 <div className="flex items-center justify-between px-2">
 <Label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">Selected ({selectedStudentIds.length})</Label>
 <Button
 variant="ghost"
 size="sm"
 type="button"
 onClick={() => setSelectedStudentIds([])}
 className="h-6 px-2 text-[9px] font-semibold uppercase tracking-widest text-destructive hover:bg-destructive/10"
 >
 Clear All
 </Button>
 </div>
 <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-muted/50 border border-border min-h-[60px]">
 {selectedStudentIds.map(id => {
 const student = allStudents.find(s => s.admissionId === id);
 return (
 <Badge
 key={id}
 className="flex items-center gap-2 rounded-xl bg-brown-800 py-1.5 pl-3 pr-1 text-[9px] font-semibold uppercase tracking-widest text-brown-800-foreground shadow-sm"
 >
 {student?.name || id}
 <button
 onClick={() => setSelectedStudentIds(prev => prev.filter(sid => sid !== id))}
 className="flex h-4 w-4 items-center justify-center rounded-lg bg-background/35 transition-colors hover:bg-background/55"
 >
 <X className="h-2.5 w-2.5" />
 </button>
 </Badge>
 );
 })}
 </div>
 </div>
 )}

 <div className="tone-warning flex gap-3 rounded-2xl border p-4">
 <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
 <p className="text-[10px] font-semibold uppercase tracking-wider leading-relaxed">
 Target students will be decoupled from their current cohorts and synchronized with this group instantly.
 </p>
 </div>
 </div>
 <div className="pt-2 flex gap-3">
 <Button type="button" variant="ghost" onClick={() => setAssignStudentOpen(false)} className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-[10px]">Cancel</Button>
 <Button type="submit" disabled={isSubmitting || selectedStudentIds.length === 0} className="flex-[2] h-12 rounded-xl shadow-sm font-bold uppercase tracking-widest text-[10px]">
 {isSubmitting ?"Processing..." : `Assign ${selectedStudentIds.length} Students`}
 </Button>
 </div>
 </form>
 </DialogContent>
 </Dialog>

 {/* Assign Trainer Modal */}
 <Dialog open={assignTrainerOpen} onOpenChange={(open) => {
 setAssignTrainerOpen(open);
 if (!open) {
 setSelectedTrainerId(null);
 setSelectedTrainerType("");
 setTrainerSelectorSearch("");
 }
 }}>
 <DialogContent className="sm:max-w-[480px] rounded-xl border-border bg-card/95 p-0 overflow-hidden shadow-2xl">
 <DialogHeader className="p-8 bg-violet-500/5 border-b border-border">
 <div className="p-4 w-fit rounded-[1.25rem] bg-violet-500/10 border border-violet-500/20 mb-6 transition-transform duration-500">
 <UserPlus className="h-7 w-7 text-violet-500" />
 </div>
 <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
 <span className="uppercase tracking-widest text-foreground/40 text-xs font-black absolute -top-2">Assignment</span>
 Assign <span className="text-violet-500 italic">Trainer</span>
 </DialogTitle>
 <DialogDescription className="text-sm font-medium text-muted-foreground mt-2">Designate an expert trainer to lead a specific cohort module.</DialogDescription>
 </DialogHeader>
 <form onSubmit={async (e: any) => {
 e.preventDefault();
 if (!selectedTrainerId || !selectedTrainerType) {
 toast({ variant:"destructive", title:"Wait!", description:"Please select both a module and a trainer." });
 return;
 }
 setIsSubmitting(true);

 try {
 await api.post('/training/groups/assign-trainer', {
 groupId: id,
 trainerId: selectedTrainerId,
 type: selectedTrainerType
 });
 toast({ title:"Success", description:"Trainer successfully synchronized with group." });
 setAssignTrainerOpen(false);
 setSelectedTrainerId(null);
 setSelectedTrainerType("");
 fetchGroupDetails();
 } catch (error: any) {
 toast({ variant:"destructive", title:"Error", description: error.message ||"Failed to finalize assignment" });
 } finally {
 setIsSubmitting(false);
 }
 }} className="p-8 space-y-8">
 <div className="space-y-6">
 {/* Module Selection */}
 <div className="space-y-3">
 <Label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 ml-2">1. Select Module Type</Label>
 <div className="grid grid-cols-3 gap-2">
 {["Technical","Aptitude","Verbal"].map((type) => (
 <button
 key={type}
 type="button"
 onClick={() => {
 setSelectedTrainerType(type);
 setSelectedTrainerId(null); // Reset trainer when type changes
 }}
 className={cn(
"h-12 rounded-xl border font-semibold text-sm transition-all duration-300",
 selectedTrainerType === type
 ?"bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-500/20 scale-[1.02]"
 :"bg-background/50 border-border text-muted-foreground hover:border-violet-500/30 hover:bg-violet-500/5"
 )}
 >
 {type}
 </button>
 ))}
 </div>
 </div>

 {/* Trainer Search */}
 <div className={cn("space-y-3 transition-all duration-500", !selectedTrainerType &&"opacity-40 grayscale pointer-events-none")}>
 <Label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 ml-2">2. Search Qualified Trainer</Label>

 <Command shouldFilter={false} className="rounded-2xl border border-border bg-background/50 overflow-hidden shadow-inner">
 <CommandInput
 placeholder={selectedTrainerType ? `Search ${selectedTrainerType} experts...` :"Select a module first..."}
 value={trainerSelectorSearch}
 onValueChange={setTrainerSelectorSearch}
 className="h-10 border-none ring-0 focus:ring-0"
 />
 <CommandList className="max-h-[200px] scrollbar-hide">
 <CommandEmpty className="py-8 flex flex-col items-center gap-2 opacity-40">
 <SearchCode className="h-8 w-8" />
 <span className="text-[10px] font-black uppercase tracking-widest">No matching trainers found.</span>
 </CommandEmpty>
 <CommandGroup>
 {trainers
 .filter(t => {
 if (!selectedTrainerType) return true;
 const type = (t.trainerProfile?.trainerType ||"").toLowerCase();
 const spec = (t.trainerProfile?.specialization ||"").toLowerCase();
 const target = selectedTrainerType.toLowerCase();

 if (target ==="verbal") {
 return type.includes("verbal") || spec.includes("verbal") || type ==="soft skills";
 }
 // Strict matching for Technical and Aptitude
 return type === target || spec.includes(target);
 })
 .filter(t => {
 const search = trainerSelectorSearch.toLowerCase();
 if (!search) return true;
 return (t.name ||"").toLowerCase().includes(search) ||
 (t.trainerProfile?.specialization ||"").toLowerCase().includes(search);
 })
 .map(trainer => (
 <CommandItem
 key={trainer.id}
 onSelect={() => setSelectedTrainerId(trainer.id)}
 className={cn(
"flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all mb-1 mx-1",
 selectedTrainerId === trainer.id ?"bg-violet-500/10 text-violet-600 scale-[0.98]" :"hover:bg-muted/50"
 )}
 >
 <div className="flex items-center gap-4">
 <div className="h-10 w-10 rounded-[0.9rem] bg-violet-500/10 border border-violet-500/20 flex items-center justify-center font-black text-xs text-violet-600">
 {(trainer.name ||"T")[0]}
 </div>
 <div className="flex flex-col">
 <span className="font-bold text-xs uppercase tracking-tight">{trainer.name}</span>
 <div className="flex items-center gap-2 mt-0.5">
 <Badge variant="outline" className="text-[8px] uppercase tracking-tighter py-0 px-1 border-violet-500/20 text-violet-500/70">
 {trainer.trainerProfile?.trainerType ||"General"}
 </Badge>
 <span className="text-[9px] text-muted-foreground/60 font-medium italic">{trainer.trainerProfile?.specialization ||"Expert"}</span>
 </div>
 </div>
 </div>
 {selectedTrainerId === trainer.id && (
 <div className="h-6 w-6 rounded-full bg-violet-600 flex items-center justify-center animate-in zoom-in duration-300">
 <Check className="h-3 w-3 text-white" />
 </div>
 )}
 </CommandItem>
 ))}
 </CommandGroup>
 </CommandList>
 </Command>
 </div>

 <div className="flex gap-4 p-5 rounded-3xl bg-violet-500/5 border border-violet-500/10 items-start">
 <Settings2 className="h-5 w-5 text-violet-500 shrink-0 mt-0.5" />
 <p className="text-[10px] font-bold text-violet-500/80 uppercase tracking-widest leading-relaxed">
 The selected trainer will be granted administrative access to this cohort's performance metrics and session logs.
 </p>
 </div>
 </div>

 <div className="pt-2 flex gap-4">
 <Button type="button" variant="ghost" onClick={() => setAssignTrainerOpen(false)} className="flex-1 h-14 rounded-2xl font-semibold text-sm hover:bg-muted/50 transition-colors">Abort</Button>
 <Button
 type="submit"
 disabled={isSubmitting || !selectedTrainerId}
 className="flex-[2] h-14 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white shadow-xl shadow-violet-500/30 font-black uppercase tracking-widest text-[11px] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
 >
 {isSubmitting ?"Synchronizing..." :"Finalize Assignment"}
 </Button>
 </div>
 </form>
 </DialogContent>
 </Dialog>
 </div>
 )
}
