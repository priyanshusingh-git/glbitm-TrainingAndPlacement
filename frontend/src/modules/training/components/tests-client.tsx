"use client";

import { useEffect, useState } from"react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from"@/components/ui/card";
import { Badge } from"@/components/ui/badge";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { Label } from"@/components/ui/label";
import {
 Search, Filter, MoreHorizontal, FileText, Plus, Clock, Users,
 Calendar, CheckCircle2, Loader2, PlayCircle, AlertCircle,
 Pencil, Trash2, ChevronRight, BarChart3, TrendingUp, History
} from"lucide-react";
import { Checkbox } from"@/components/ui/checkbox";
import { ScrollArea } from"@/components/ui/scroll-area";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from"@/components/ui/dialog";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from"@/components/ui/select";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from"@/components/ui/dropdown-menu";
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
} from"@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from"@/components/ui/tabs";
import { PageHeader } from"@/components/layout/page-header";
import { fetchTests, createTest } from"@/services/training.client";
import { Test } from"@/types/training";
import { format, isAfter, isBefore, addMinutes } from"date-fns";
import { useToast } from"@/components/ui/use-toast";
import { API_URL } from"@/lib/api";
import { QuestionBank } from"@/modules/training/components/question-bank";
import { TestWizard } from"@/modules/training/components/test-wizard";

export default function AdminTestsPage() {
 const [tests, setTests] = useState<Test[]>([]);
 const [loading, setLoading] = useState(true);
 const [isWizardOpen, setIsWizardOpen] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [searchQuery, setSearchQuery] = useState("");
 const [typeFilter, setTypeFilter] = useState("all");
 const [groupSearchQuery, setGroupSearchQuery] = useState("");
 const { toast } = useToast();

 // Form State
 const [editingTest, setEditingTest] = useState<Test | null>(null);
 const [deletingTest, setDeletingTest] = useState<Test | null>(null);
 const [groups, setGroups] = useState<{ id: string, name: string }[]>([]);
 const [formData, setFormData] = useState({
 title:"",
 type:"Aptitude",
 date:"",
 duration: 60,
 totalMarks: 100,
 testUrl:"",
 platform:"",
 groupIds: [] as string[]
 });

 useEffect(() => {
 loadTests();
 loadGroups();
 }, []);

 const loadGroups = async () => {
 try {
 const res = await fetch(`${API_URL}/training/groups`, {
 credentials: 'include'
 });
 if (res.ok) {
 const data = await res.json();
 setGroups(data);
 }
 } catch (error) {
 console.error("Failed to load groups:", error);
 }
 };

 const loadTests = async () => {
 setLoading(true);
 try {
 const data = await fetchTests();
 setTests(data);
 } catch (error) {
 console.error(error);
 toast({
 variant:"destructive",
 title:"Error",
 description:"Failed to load assessments",
 });
 } finally {
 setLoading(false);
 }
 };

 const handleFormSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSubmitting(true);
 try {
 const url = editingTest
 ? `${API_URL}/tests/${editingTest.id}`
 : `${API_URL}/tests`;

 const method = editingTest ? 'PUT' : 'POST';

 const res = await fetch(url, {
 method,
 headers: {
 'Content-Type': 'application/json',
 },
 credentials: 'include',
 body: JSON.stringify({
 ...formData,
 date: new Date(formData.date).toISOString()
 })
 });

 if (!res.ok) throw new Error("Operation failed");

 toast({
 title:"Success",
 description: editingTest ?"Test updated successfully" :"Test created successfully",
 });

 setIsWizardOpen(false);
 setEditingTest(null);
 setGroupSearchQuery("");
 resetForm();
 loadTests();
 } catch (error) {
 toast({
 variant:"destructive",
 title:"Error",
 description:"Failed to process request",
 });
 } finally {
 setIsSubmitting(false);
 }
 };

 const handleDelete = async () => {
 if (!deletingTest) return;
 try {
 const res = await fetch(`${API_URL}/tests/${deletingTest.id}`, {
 method: 'DELETE',
 credentials: 'include'
 });

 if (!res.ok) throw new Error("Deletion failed");

 toast({
 title:"Deleted",
 description:"Assessment has been removed",
 });
 loadTests();
 } catch (error) {
 toast({
 variant:"destructive",
 title:"Error",
 description:"Failed to delete test",
 });
 } finally {
 setDeletingTest(null);
 }
 };

 const resetForm = () => {
 setFormData({
 title:"",
 type:"Aptitude",
 date:"",
 duration: 60,
 totalMarks: 100,
 testUrl:"",
 platform:"",
 groupIds: []
 });
 setGroupSearchQuery("");
 setEditingTest(null);
 };

 const openEditDialog = (test: Test) => {
 setEditingTest(test);
 setIsWizardOpen(true);
 };

 const getTestStatus = (test: Test) => {
 const now = new Date();
 const testDate = new Date(test.date);
 const endDate = addMinutes(testDate, test.duration);

 if (isAfter(testDate, now)) return"Scheduled";
 if (isBefore(endDate, now)) return"Completed";
 return"Ongoing";
 };

 const filteredTests = tests.filter(test => {
 const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase());
 const matchesType = typeFilter ==="all" || test.type === typeFilter;
 return matchesSearch && matchesType;
 });

 const stats = {
 total: tests.length,
 upcoming: tests.filter(t => getTestStatus(t) ==="Scheduled").length,
 completed: tests.filter(t => getTestStatus(t) ==="Completed").length,
 ongoing: tests.filter(t => getTestStatus(t) ==="Ongoing").length,
 };

 return (
 <div className="space-y-6 animate-in fade-in duration-500">
 <PageHeader
 title="Assessments & Tests"
 description="Manage standardized tests, coding challenges, and track results."
 action={
 <Button onClick={() => { setEditingTest(null); setIsWizardOpen(true); }} className="shadow-lg shadow-primary/20">
 <Plus className="mr-2 h-4 w-4" /> New Assessment
 </Button>
 }
 />

 {/* Stats Grid */}
 <div className="grid gap-4 md:grid-cols-4">
 <Card className="bg-brown-800/5 border-brown-800/10 transition-all hover:bg-brown-800/10 backdrop-blur-sm">
 <CardContent className="p-4 flex items-center gap-4">
 <div className="p-2 bg-brown-800/20 rounded-lg">
 <BarChart3 className="h-5 w-5 text-brown-800" />
 </div>
 <div>
 <p className="text-xs font-medium text-muted-foreground uppercase">Total Tests</p>
 <h3 className="text-xl font-bold">{stats.total}</h3>
 </div>
 </CardContent>
 </Card>
 <Card className="bg-amber-500/5 border-amber-500/10 transition-all hover:bg-amber-500/10 backdrop-blur-sm">
 <CardContent className="p-4 flex items-center gap-4">
 <div className="p-2 bg-amber-500/20 rounded-lg">
 <Calendar className="h-5 w-5 text-amber-500" />
 </div>
 <div>
 <p className="text-xs font-medium text-muted-foreground uppercase">Scheduled</p>
 <h3 className="text-xl font-bold">{stats.upcoming}</h3>
 </div>
 </CardContent>
 </Card>
 <Card className="bg-indigo-500/5 border-indigo-500/10 transition-all hover:bg-indigo-500/10 backdrop-blur-sm">
 <CardContent className="p-4 flex items-center gap-4">
 <div className="p-2 bg-indigo-500/20 rounded-lg">
 <PlayCircle className="h-5 w-5 text-indigo-500" />
 </div>
 <div>
 <p className="text-xs font-medium text-muted-foreground uppercase">Active Now</p>
 <h3 className="text-xl font-bold">{stats.ongoing}</h3>
 </div>
 </CardContent>
 </Card>
 <Card className="bg-emerald-500/5 border-emerald-500/10 transition-all hover:bg-emerald-500/10 backdrop-blur-sm">
 <CardContent className="p-4 flex items-center gap-4">
 <div className="p-2 bg-emerald-500/20 rounded-lg">
 <CheckCircle2 className="h-5 w-5 text-emerald-500" />
 </div>
 <div>
 <p className="text-xs font-medium text-muted-foreground uppercase">Completed</p>
 <h3 className="text-xl font-bold">{stats.completed}</h3>
 </div>
 </CardContent>
 </Card>
 </div>

 <Tabs defaultValue="all" className="space-y-4">
 <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-muted/30 p-2 rounded-xl border">
 <TabsList className="bg-transparent h-9 p-0">
 <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">All Tests</TabsTrigger>
 <TabsTrigger value="scheduled" className="data-[state=active]:bg-background">Scheduled</TabsTrigger>
 <TabsTrigger value="active" className="data-[state=active]:bg-background text-indigo-500">Active</TabsTrigger>
 <TabsTrigger value="completed" className="data-[state=active]:bg-background">Completed</TabsTrigger>
 <TabsTrigger value="bank" className="data-[state=active]:bg-background border-l ml-1 pl-3">Question Bank</TabsTrigger>
 </TabsList>

 <div className="flex items-center gap-2">
 <div className="relative w-full md:w-64">
 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
 <Input
 placeholder="Search assessments..."
 className="pl-9 h-9 bg-background focus-visible:ring-amber-500/20 transition-all"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>
 <Select value={typeFilter} onValueChange={setTypeFilter}>
 <SelectTrigger className="h-9 w-[130px] bg-background">
 <Filter className="mr-2 h-3 w-3" />
 <SelectValue placeholder="All Types" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Types</SelectItem>
 <SelectItem value="Aptitude">Aptitude</SelectItem>
 <SelectItem value="Technical">Technical</SelectItem>
 <SelectItem value="Coding">Coding</SelectItem>
 <SelectItem value="Verbal">Verbal</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>

 {["all","scheduled","active","completed"].map((tab) => (
 <TabsContent key={tab} value={tab} className="mt-0">
 {loading ? (
 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
 {[1, 2, 3].map(i => (
 <div key={i} className="h-[200px] bg-muted/50 animate-pulse rounded-xl border border-dashed" />
 ))}
 </div>
 ) : (
 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
 {filteredTests
 .filter(t => tab ==="all" || getTestStatus(t).toLowerCase() === (tab ==="active" ?"ongoing" : tab))
 .length === 0 ? (
 <Card className="col-span-full py-12 border-dashed bg-muted/10">
 <CardContent className="flex flex-col items-center justify-center text-center space-y-3">
 <div className="p-4 bg-muted/50 rounded-full">
 <FileText className="h-8 w-8 text-muted-foreground" />
 </div>
 <div>
 <h3 className="font-semibold text-lg">No assessments found</h3>
 <p className="text-muted-foreground max-w-xs mx-auto">
 There are no tests matching your current filters or in this category.
 </p>
 </div>
 <Button variant="outline" onClick={() => { setSearchQuery(""); setTypeFilter("all"); }}>
 Clear Filters
 </Button>
 </CardContent>
 </Card>
 ) : (
 filteredTests
 .filter(t => tab ==="all" || getTestStatus(t).toLowerCase() === (tab ==="active" ?"ongoing" : tab))
 .map((test) => (
 <TestCard
 key={test.id}
 test={test}
 status={getTestStatus(test)}
 onEdit={() => openEditDialog(test)}
 onDelete={() => setDeletingTest(test)}
 />
 ))
 )}
 </div>
 )}
 </TabsContent>
 ))}

 <TabsContent value="bank" className="mt-6">
 <QuestionBank />
 </TabsContent>
 </Tabs>

 <TestWizard
 isOpen={isWizardOpen}
 onClose={() => setIsWizardOpen(false)}
 onSuccess={() => { loadTests(); setIsWizardOpen(false); }}
 initialData={editingTest}
 />

 {/* Delete Alert */}
 <AlertDialog open={!!deletingTest} onOpenChange={(val) => !val && setDeletingTest(null)}>
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
 <AlertDialogDescription>
 This will permanently delete the assessment"**{deletingTest?.title}**" and all recorded student results for this test. This action cannot be undone.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel>Cancel</AlertDialogCancel>
 <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
 Delete Assessment
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div >
 );
}

function TestCard({ test, status, onEdit, onDelete }: { test: Test, status: string, onEdit: () => void, onDelete: () => void }) {
 const statusConfig = {
 Scheduled: { class:"bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
 Ongoing: { class:"bg-indigo-100 text-indigo-700 border-indigo-200 animate-pulse", icon: PlayCircle },
 Completed: { class:"bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 }
 };

 const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Scheduled;
 const StatusIcon = config.icon;

 return (
 <Card className="group relative overflow-hidden transition-all hover:shadow-xl border-brown-800/5">
 <div className={`absolute top-0 right-0 h-16 w-16 -mr-8 -mt-8 rounded-full ${status === 'Ongoing' ? 'bg-indigo-500/10' : 'bg-brown-800/5'} transition-transform`} />

 <CardHeader className="pb-3 border-b border-muted/50 bg-muted/10">
 <div className="flex justify-between items-start mb-2">
 <Badge variant="secondary" className="font-bold uppercase text-[9px] tracking-widest px-2 py-0.5 bg-background/50 backdrop-blur-sm border-brown-800/10 text-brown-800/80">
 {test.type}
 </Badge>
 <Badge className={`${config.class} border shadow-sm text-[9px] font-bold uppercase transition-all flex items-center gap-1.5 px-2 py-0.5`}>
 <StatusIcon className="h-3 w-3" />
 {status}
 </Badge>
 </div>
 <div className="space-y-0.5">
 <CardTitle className="text-lg font-bold group-hover:text-brown-800 transition-colors line-clamp-1">{test.title}</CardTitle>
 <CardDescription className="flex items-center gap-2 text-xs">
 <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {test.duration} mins</span>
 <span className="text-muted-foreground">•</span>
 <span className="flex items-center gap-1 font-semibold text-brown-800">{test.totalMarks} Marks</span>
 </CardDescription>
 </div>
 </CardHeader>

 <CardContent className="pt-4 space-y-4 bg-gradient-to-b from-transparent to-muted/20">
 <div className="space-y-3">
 <div className="flex items-center justify-between text-xs">
 <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Date & Time</span>
 <span className="font-medium">{format(new Date(test.date),"MMM d, yyyy • h:mm a")}</span>
 </div>
 <div className="flex items-center justify-between text-xs">
 <span className="text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Submissions</span>
 <span className="font-bold text-brown-800">{(test as any)._count?.results || 0} Students</span>
 </div>
 <div className="flex items-center justify-between text-xs">
 <span className="text-muted-foreground flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Created By</span>
 <span className="font-medium truncate max-w-[120px]">{test.creator?.name ||"CDC Admin"}</span>
 </div>
 </div>

 <div className="pt-2 border-t border-dashed border-brown-800/10">
 <div className="flex flex-wrap gap-1.5 mt-1">
 {!test.assignedGroups || test.assignedGroups.length === 0 ? (
 <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200/50 font-bold uppercase tracking-tighter">Global Access</Badge>
 ) : (
 test.assignedGroups.map(g => (
 <Badge key={g.id} variant="secondary" className="text-[9px] bg-brown-800/5 text-brown-800 border-brown-800/10 font-bold lowercase px-2">
 {g.name}
 </Badge>
 ))
 )}
 </div>
 </div>

 {test.testUrl && (
 <div className="pt-2">
 <a
 href={test.testUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center justify-center gap-2 w-full py-2 bg-indigo-500/10 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-500/20 transition-all border border-indigo-200/50"
 >
 <FileText className="h-3 w-3" />
 {test.platform || 'Open Test Link'}
 </a>
 </div>
 )}

 <div className="pt-2 flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1">
 <div className="flex gap-1">
 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-brown-800 hover:bg-brown-800/10" onClick={onEdit}>
 <Pencil className="h-4 w-4" />
 </Button>
 <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={onDelete}>
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 <Button size="sm" variant="outline" className="h-8 gap-1 text-[11px] font-bold group-hover:bg-brown-800 group-hover:text-brown-800-foreground transition-all">
 View Results <ChevronRight className="h-3.3 w-3" />
 </Button>
 </div>
 </CardContent>
 </Card>
 );
}
