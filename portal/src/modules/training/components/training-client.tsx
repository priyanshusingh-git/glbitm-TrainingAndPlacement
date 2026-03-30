"use client"

import { useState, useEffect } from"react"
import { useRouter, useSearchParams } from"next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from"@/components/ui/card"
import { Badge } from"@/components/ui/badge"
import { Button } from"@/components/ui/button"
import { Input } from"@/components/ui/input"
import { Textarea } from"@/components/ui/textarea"
import { Progress } from"@/components/ui/progress"
import { Plus, Search, Filter, MoreHorizontal, Users, BookOpen, Calendar, ArrowRight, CheckCircle, Clock, XCircle, UserPlus, MapPin, Pencil, Trash2, Presentation, AlertCircle, ChevronUp, ChevronDown, CheckSquare } from"lucide-react"
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from"@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from"@/components/ui/tabs"
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from"@/components/ui/dialog"
import { Checkbox } from"@/components/ui/checkbox"
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from"@/components/ui/select"
import { Label } from"@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from"@/components/ui/popover"
import { ScrollArea } from"@/components/ui/scroll-area" // Added
import { TrainingCalendar as CalendarComponent } from"@/modules/training/components/calendar"
import { format } from"date-fns"
import { cn } from"@/lib/utils"
import { api } from"@/lib/api"
import { useToast } from"@/components/ui/use-toast"
import { useAuth } from"@/contexts/auth-context"
import { PageHeader } from"@/components/layout/page-header"
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

const BRANCHES = [
"CSE","CSAI","CSDS","CSAIML","AIML","AIDS","IT","ECE","EEE","ME"
];

const getYearOptions = () => {
 const currentYear = new Date().getFullYear();
 return [
 (currentYear + 3).toString(),
 (currentYear + 2).toString(),
 (currentYear + 1).toString(),
 currentYear.toString()
 ];
};

export default function AdminTrainingPage() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const { toast } = useToast();
 const { user } = useAuth();

 // Initialize states from URL -> LocalStorage -> Default
 const [activeTab, setActiveTab] = useState("overview");
 const [selectedYear, setSelectedYear] = useState<string>("");
 const [selectedBranch, setSelectedBranch] = useState<string>("ALL");

 // Initial Load: Restore from URL or LocalStorage
 useEffect(() => {
 const urlTab = searchParams.get('tab');
 const urlYear = searchParams.get('year');
 const storedTab = localStorage.getItem('training_activeTab');
 const storedYear = localStorage.getItem('training_selectedYear');
 const storedBranch = localStorage.getItem('training_selectedBranch');

 if (urlTab) setActiveTab(urlTab);
 else if (storedTab) setActiveTab(storedTab);

 if (urlYear) setSelectedYear(urlYear);
 else if (storedYear) setSelectedYear(storedYear);

 if (storedBranch) setSelectedBranch(storedBranch);
 }, []);

 // Sync state with URL when it changes (e.g. Back button)
 useEffect(() => {
 const tab = searchParams.get('tab');
 const year = searchParams.get('year');
 if (tab && tab !== activeTab) setActiveTab(tab);
 if (year && year !== selectedYear) setSelectedYear(year);
 }, [searchParams]);

 // Update URL and LocalStorage when tab changes
 const onTabChange = (value: string) => {
 setActiveTab(value);
 localStorage.setItem('training_activeTab', value);

 const year = searchParams.get('year') || selectedYear;
 const url = value === 'groups' && year
 ? `/admin/training?tab=${value}&year=${year}`
 : `/admin/training?tab=${value}`;
 router.replace(url, { scroll: false });
 };

 const [stats, setStats] = useState({
 totalGroups: 0,
 totalTrainers: 0,
 activeSessionsToday: 0,
 studentsInTraining: 0
 });

 // Data States
 const [groups, setGroups] = useState<any[]>([]);
 const [groupMasters, setGroupMasters] = useState<any[]>([]); // New State
 const [sessions, setSessions] = useState<any[]>([]);
 const [trainers, setTrainers] = useState<any[]>([]);
 const [loading, setLoading] = useState(false);

 // Form States
 const [createGroupOpen, setCreateGroupOpen] = useState(false);
 const [createGroupYear, setCreateGroupYear] = useState<string>(new Date().getFullYear().toString());
 const [editGroupOpen, setEditGroupOpen] = useState(false);
 const [deleteGroupOpen, setDeleteGroupOpen] = useState(false);
 const [createSessionOpen, setCreateSessionOpen] = useState(false);
 const [assignTrainerOpen, setAssignTrainerOpen] = useState(false);
 const [assignStudentOpen, setAssignStudentOpen] = useState(false);

 // Editing State
 const [editingGroup, setEditingGroup] = useState<any>(null);
 const [deletingGroup, setDeletingGroup] = useState<any>(null);

 // Selection States
 const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
 const [date, setDate] = useState<Date | undefined>(new Date());
 const [selectedBranches, setSelectedBranches] = useState<string[]>([]); // New
 const [customGroupName, setCustomGroupName] = useState(""); // New
 const [selectedMasterName, setSelectedMasterName] = useState(""); // New
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [manageIdentitiesOpen, setManageIdentitiesOpen] = useState(false); // New Dialog State
 const [isCreatingIdentity, setIsCreatingIdentity] = useState(false); // Loading state
 const [deletingIdentityId, setDeletingIdentityId] = useState<string | null>(null); // Loading state

 // TODO: Integrate Firebase Realtime or similar for live updates
 useEffect(() => {
 // if (!user?.id) return;
 // ... realtime logic removed
 }, [user?.id]);

 // Fetch initial data
 useEffect(() => {
 fetchStats();
 fetchGroups();
 fetchGroupMasters(); // New
 fetchTrainers();
 fetchSessions();
 }, []);

 // Set initial selected year if not set
 // Set initial selected year if not set or sync from URL
 useEffect(() => {
 const yearParam = searchParams.get('year');
 if (yearParam && yearParam !== selectedYear) {
 setSelectedYear(yearParam);
 } else if (!selectedYear && groups.length > 0 && !yearParam) {
 // Only set default if NO url param and NO current selection
 const years = getYearOptions();
 const defaultYear = years.find(y => groups.some(g => g.year === y)) || years[0];
 setSelectedYear(defaultYear);
 // Optional: Set URL for default? Maybe better not to clutter unless user clicks
 }
 }, [groups, selectedYear, searchParams]);

 const onYearChange = (year: string) => {
 setSelectedYear(year);
 localStorage.setItem('training_selectedYear', year);
 // Persist both tab and year
 router.replace(`/admin/training?tab=groups&year=${year}`, { scroll: false });
 }

 const fetchStats = async () => {
 try {
 const data = await api.get('/training/stats');
 setStats(data);
 } catch (error) {
 console.error(error);
 }
 }

 const fetchGroups = async () => {
 setLoading(true);
 try {
 const data = await api.get('/training/groups');
 setGroups(data);
 } catch (error) {
 console.error(error);
 } finally {
 setLoading(false);
 }
 }

 const fetchGroupMasters = async () => {
 try {
 const data = await api.get('/training/group-masters');
 setGroupMasters(data);
 } catch (error) {
 console.error("Failed to fetch masters", error);
 }
 }

 const handleReorderMasters = async (index: number, direction: 'up' | 'down') => {
 if ((direction === 'up' && index === 0) || (direction === 'down' && index === groupMasters.length - 1)) return;

 const newMasters = [...groupMasters];
 const swapIndex = direction === 'up' ? index - 1 : index + 1;

 // Swap
 [newMasters[index], newMasters[swapIndex]] = [newMasters[swapIndex], newMasters[index]];

 // Update local state immediately for UI responsiveness
 setGroupMasters(newMasters);

 // Prepare payload with new orders (index based)
 const updates = newMasters.map((m, i) => ({ id: m.id, order: i }));

 try {
 await api.put('/training/group-masters', { masters: updates });
 } catch (error: any) {
 toast({ variant:"destructive", title:"Reorder Failed", description: error.message });
 fetchGroupMasters(); // Revert on error
 }
 }

 const fetchTrainers = async () => {
 try {
 const data = await api.get('/training/trainers');
 setTrainers(data);
 } catch (error) {
 console.error(error);
 }
 }

 const fetchSessions = async (groupId?: string) => {
 try {
 const endpoint = groupId ? `/training/sessions?groupId=${groupId}` : '/training/sessions';
 const data = await api.get(endpoint);
 setSessions(data);
 } catch (error) {
 console.error(error);
 }
 }

 // Actions
 const handleCreateGroup = async (e: any) => {
 e.preventDefault();
 const formData = new FormData(e.target);

 const name = selectedMasterName === 'custom' ? customGroupName : selectedMasterName;

 if (!name) {
 toast({ variant:"destructive", title:"Error", description:"Group name is required" });
 return;
 }

 if (selectedBranches.length === 0) {
 toast({ variant:"destructive", title:"Error", description:"At least one branch must be selected" });
 return;
 }

 const occupiedBranchesForYear = groups.filter(g => g.year === formData.get('year') && g.name === name).map(g => g.branch);

 // Filter out any branches that somehow got selected but are actually occupied
 const targetBranches = selectedBranches.filter(b => !occupiedBranchesForYear.includes(b));

 if (targetBranches.length === 0) {
 toast({ variant:"destructive", title:"Error", description:"All selected branches are already assigned to this group name." });
 return;
 }

 const tempIds = targetBranches.map((_, i) => `temp-${Date.now()}-${i}`);

 const newGroups = targetBranches.map((b, i) => ({
 id: tempIds[i],
 name: name,
 branch: b,
 year: formData.get('year'),
 description: formData.get('description'),
 createdAt: new Date().toISOString(),
 _count: { students: 0 },
 trainers: []
 }));

 // 1. Optimistic Update
 setGroups(prev => [...newGroups, ...prev]);
 setCreateGroupOpen(false); // Close immediately

 // Reset form state immediately
 setCustomGroupName('');
 setSelectedMasterName('');
 setSelectedBranches([]);

 // 2. Background Sync
 try {
 const data = {
 name,
 branches: targetBranches,
 year: formData.get('year'),
 description: formData.get('description')
 };

 const responseGroups = await api.post('/training/groups', data);

 // Handle array response (if multiple) or single object
 const realGroups = Array.isArray(responseGroups) ? responseGroups : [responseGroups];

 // 3. Reconcile
 setGroups(prev => {
 // Filter out temp IDs
 let next = prev.filter(g => !tempIds.includes(g.id));
 // Add the real verified objects from the backend mapping
 return [...realGroups, ...next];
 });

 toast({
 title:"Success",
 description: targetBranches.length > 1 ? `Created ${realGroups.length} groups successfully` :"Group created successfully",
 className:"bg-green-500/10 border-green-500/20 text-green-500",
 });

 // Silent Refetch for stats/masters
 fetchGroupMasters();
 fetchStats();
 } catch (error: any) {
 console.error("Create failed:", error);
 // 4. Rollback
 setGroups(prev => prev.filter(g => !tempIds.includes(g.id)));
 toast({ variant:"destructive", title:"Creation Failed", description: error.message });
 }
 }

 const handleEditGroup = async (e: any) => {
 e.preventDefault();
 if (!editingGroup) return;

 const formData = new FormData(e.target);
 const updates = {
 name: formData.get('name'),
 branch: formData.get('branch'),
 year: formData.get('year'),
 description: formData.get('description')
 };

 const originalGroup = { ...editingGroup };
 const updatedGroup = { ...originalGroup, ...updates };

 // 1. Optimistic Update
 setGroups(prev => prev.map(g => g.id === originalGroup.id ? updatedGroup : g));
 setEditGroupOpen(false);
 setEditingGroup(null);

 try {
 await api.put(`/training/groups/${originalGroup.id}`, updates);
 toast({ title:"Success", description:"Group updated successfully" });
 } catch (error: any) {
 // 2. Rollback
 setGroups(prev => prev.map(g => g.id === originalGroup.id ? originalGroup : g));
 toast({ variant:"destructive", title:"Update Failed", description: error.message });
 }
 }

 const handleDeleteGroup = async () => {
 if (!deletingGroup) return;

 const groupId = deletingGroup.id;
 const previousGroups = [...groups];

 // 1. Optimistic Update
 setGroups(prev => prev.filter(g => g.id !== groupId));
 setDeleteGroupOpen(false);
 setDeletingGroup(null);

 try {
 await api.delete(`/training/groups/${groupId}`);
 toast({ title:"Success", description:"Group deleted successfully" });
 fetchStats(); // Silent update
 } catch (error: any) {
 // Ignore 404
 if (error.message && error.message.includes("not found")) return;

 // 2. Rollback
 setGroups(previousGroups);
 toast({ variant:"destructive", title:"Deletion Failed", description: error.message });
 }
 }

 const handleAssignTrainer = async (e: any) => {
 e.preventDefault();
 const formData = new FormData(e.target);
 if (!selectedGroup) return;

 const trainerId = formData.get('trainerId') as string;
 const type = formData.get('type') as string;

 const trainer = trainers.find(t => t.id === trainerId);
 if (!trainer) return;

 const optimisticTrainerEntry = {
 id: `temp-${Date.now()}`,
 type,
 trainer: {
 id: trainer.id,
 name: trainer.name,
 email: trainer.email
 }
 };

 const previousGroups = [...groups];

 // 1. Optimistic Update
 setGroups(prev => prev.map(g => {
 if (g.id === selectedGroup) {
 return {
 ...g,
 trainers: [...g.trainers, optimisticTrainerEntry]
 };
 }
 return g;
 }));
 setAssignTrainerOpen(false);

 try {
 const data = {
 groupId: selectedGroup,
 trainerId,
 type
 };
 await api.post('/training/groups/assign-trainer', data);
 toast({ title:"Success", description:"Trainer assigned successfully" });

 // Silent sync
 fetchGroups();
 } catch (error: any) {
 // 2. Rollback
 setGroups(previousGroups);
 toast({ variant:"destructive", title:"Assignment Failed", description: error.message });
 }
 }

 const handleAssignStudents = async (e: any) => {
 e.preventDefault();
 const formData = new FormData(e.target);
 if (!selectedGroup) return;

 const studentIds = (formData.get('studentIds') as string).split(',').map(s => s.trim()).filter(s => s);

 try {
 await api.post(`/training/groups/${selectedGroup}/assign`, { studentIds });
 toast({ title:"Success", description:"Students assigned successfully" });
 setAssignStudentOpen(false);
 fetchGroups();
 } catch (error: any) {
 toast({ variant:"destructive", title:"Error", description: error.message ||"Failed to assign students" });
 }
 }

 const handleCreateSession = async (e: any) => {
 e.preventDefault();
 const formData = new FormData(e.target);

 const newSession = {
 id: `temp-${Date.now()}`,
 groupId: formData.get('groupId'),
 trainerId: formData.get('trainerId'),
 title: formData.get('title'),
 type: formData.get('type'),
 date: date?.toISOString(),
 duration: formData.get('duration'),
 mode: formData.get('mode'),
 location: formData.get('location'),
 createdAt: new Date().toISOString()
 };

 // 1. Optimistic Update
 setSessions(prev => [newSession, ...prev]);
 setCreateSessionOpen(false);

 // Optimistic Stat Update (Create a simplistic check for"Today" if needed, 
 // but for now just clearing the loading state is enough for"Instant" feel)

 try {
 const data = { ...newSession };
 await api.post('/training/sessions', data);

 toast({ title:"Success", description:"Session scheduled successfully" });
 fetchSessions();
 fetchStats();
 } catch (error: any) {
 // 2. Rollback
 setSessions(prev => prev.filter(s => s.id !== newSession.id));
 toast({ variant:"destructive", title:"Scheduling Failed", description: error.message });
 }
 }

 const occupiedBranchesForYear = groups.filter(g => g.year === createGroupYear && g.name === selectedMasterName).map(g => g.branch);
 const isAllBranchesTaken = occupiedBranchesForYear.includes("ALL");

 return (
 <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
 <PageHeader
 title="Training Programs"
 description="Manage technical and aptitude training batches, trainers, and student progress."
 />

 <Tabs defaultValue={activeTab} value={activeTab} className="space-y-6" onValueChange={onTabChange}>
 <div className="sticky top-0 z-20 py-2 bg-background mb-4">
 <div className="flex items-center justify-between">
 <TabsList className="h-11 p-1">
 <TabsTrigger value="overview" className="px-8 font-semibold text-sm">Overview</TabsTrigger>
 <TabsTrigger value="groups" className="px-8 font-semibold text-sm">Groups</TabsTrigger>
 </TabsList>

 {activeTab === 'groups' && (
 <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
 <Select value={selectedBranch} onValueChange={(val) => {
 setSelectedBranch(val);
 localStorage.setItem('training_selectedBranch', val);
 }}>
 <SelectTrigger className="h-10 w-[160px] bg-card font-semibold text-sm">
 <Filter className="mr-2 h-3.5 w-3.5" />
 <SelectValue placeholder="Branch" />
 </SelectTrigger>
 <SelectContent className="rounded-md border-border">
 <SelectItem value="ALL" className="font-bold text-sm">All Branches</SelectItem>
 {BRANCHES.map(branch => (
 <SelectItem key={branch} value={branch} className="font-bold text-sm">{branch}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 <div className="h-8 w-px bg-border/40 mx-1" />
 <Button onClick={() => setCreateGroupOpen(true)} className="h-10 px-6 rounded-md shadow-sm font-semibold text-sm">
 <Plus className="mr-2 h-4 w-4" /> New Group
 </Button>
 </div>
 )}
 </div>
 </div>

 {/* OVERVIEW TAB */}
 <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
 {[
 { label:"Total Groups", value: stats.totalGroups, icon: Users, color:"from-blue-500 to-cyan-500" },
 { label:"Sessions Today", value: stats.activeSessionsToday, icon: Clock, color:"from-amber-500 to-orange-500" },
 { label:"Active Trainers", value: stats.totalTrainers, icon: UserPlus, color:"from-emerald-500 to-teal-500" },
 { label:"Students Enrolled", value: stats.studentsInTraining, icon: BookOpen, color:"from-violet-500 to-purple-500" },
 ].map((item, idx) => (
          <Card key={idx} className="relative overflow-hidden bg-card border-border group hover:border-primary/40 transition-all duration-300">
 <div className={cn("absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity bg-gradient-to-br", item.color)} />
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <span className="text-sm font-semibold text-muted-foreground/70">{item.label}</span>
 <div className={cn("p-2 rounded-md bg-gradient-to-br opacity-80", item.color)}>
 <item.icon className="h-3.5 w-3.5 text-white" />
 </div>
 </CardHeader>
 <CardContent>
 <div className="text-3xl font-semibold tracking-tighter">{item.value}</div>
 <div className="flex items-center gap-1 mt-1">
 <div className="h-1 w-1 rounded-full bg-emerald-500" />
 <span className="text-sm font-bold text-emerald-500">System Tracked</span>
 </div>
 </CardContent>
 </Card>
 ))}
 </div>

 <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
 <Card className="lg:col-span-2 bg-card border-border">
 <CardHeader>
 <div className="flex items-center justify-between">
 <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
 <Badge variant="outline" className="text-sm font-bold">Live Feed</Badge>
 </div>
 </CardHeader>
 <CardContent>
 <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
 <div className="p-4 rounded-md bg-brown-800/5 border border-brown-800/10">
            <Clock className="h-8 w-8 text-primary/40" />
 </div>
 <div className="space-y-1">
 <p className="font-bold text-foreground">Syncing historical logs...</p>
 <p className="text-xs text-muted-foreground max-w-[200px]">New sessions and enrollments will appear here in real-time.</p>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card className="bg-brown-800/5 border-brown-800/10 relative overflow-hidden group">
 <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
 <CardHeader>
            <CardTitle className="text-lg font-semibold text-primary/80">Training Pro-Tip</CardTitle>
 </CardHeader>
 <CardContent className="space-y-4 relative">
 <p className="text-sm font-medium leading-relaxed">
"Consolidate your technical batches based on assessment scores to maximize trainer impact. Use the 'Groups' view to monitor branch-wise progression."
 </p>
 <div className="pt-4 border-t border-brown-800/10">
 <Button variant="link" className="p-0 h-auto text-sm font-semibold text-brown-800">
 Learn best practices <ArrowRight className="ml-1 h-3 w-3" />
 </Button>
 </div>
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 {/* GROUPS TAB */}
 <TabsContent value="groups" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

 {loading ? (
 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
 {Array.from({ length: 6 }).map((_, i) => (
 <div key={i} className="h-[280px] rounded-md border border-border/60 bg-card animate-pulse" />
 ))}
 </div>
 ) : (
 <Tabs value={selectedYear} onValueChange={onYearChange} className="w-full">
 <TabsList className="mb-10 h-11 p-1">
 {getYearOptions().map(year => (
 <TabsTrigger key={year} value={year} className="px-10 font-semibold text-sm transition-all">
 Batch of {year}
 </TabsTrigger>
 ))}
 </TabsList>
 {getYearOptions().map(year => (
 <TabsContent key={year} value={year} className="space-y-12 animate-in fade-in zoom-in-95 duration-500">
 {/* Master Groups Sections */}
 {groupMasters.map((master, index) => {
 const masterGroups = groups.filter(g =>
 g.name === master.name &&
 g.year === year &&
 (selectedBranch ==="ALL" || g.branch === selectedBranch || g.branch ==="ALL")
 );
 // Skip if no groups (Optional: Keep empty sections if desired, but user likely wants to see data)
 // For now, let's show section if it exists in master, but maybe empty state if desired. 
 // Let's hide if empty to keep UI clean, or show empty placeholder if specifically needed.
 // User said"all groups of g1 ... should be there".

 if (masterGroups.length === 0) return null;

 return (
 <div key={master.id} className="space-y-6 pb-8 border-b border-border last:border-0">
 <div className="flex items-center gap-4 px-2 group/header">
 <div className="flex items-center gap-3">
 <div className="h-8 w-8 rounded-md bg-brown-800/10 flex items-center justify-center border border-brown-800/20">
 <Users className="h-4 w-4 text-brown-800" />
 </div>
 <h3 className="text-2xl font-semibold tracking-tight text-foreground">{master.name}</h3>
 </div>
 <div className="h-px flex-1 bg-gradient-to-r from-border/60 to-transparent" />

 {/* Reorder Controls */}
 <div className="flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
 <Button
 variant="ghost"
 size="icon"
 disabled={index === 0}
 onClick={() => handleReorderMasters(index, 'up')}
 className="h-8 w-8 rounded-md"
 >
 <ChevronUp className="h-4 w-4 text-muted-foreground" />
 </Button>
 <Button
 variant="ghost"
 size="icon"
 disabled={index === groupMasters.length - 1}
 onClick={() => handleReorderMasters(index, 'down')}
 className="h-8 w-8 rounded-md"
 >
 <ChevronDown className="h-4 w-4 text-muted-foreground" />
 </Button>
 </div>

 <Badge variant="outline" className="rounded-sm px-4 py-1 border-brown-800/20 bg-brown-800/5 text-brown-800 text-sm font-semibold">
 {masterGroups.length} {masterGroups.length === 1 ? 'Cohort' : 'Cohorts'}
 </Badge>
 </div>

 <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
 {masterGroups.map((group) => (
 <Card key={group.id} className="premium-muted group relative flex w-[300px] shrink-0 snap-start flex-col overflow-hidden rounded-md border border-border/60 hover:border-brown-800/30 hover:bg-card-hover hover:shadow-md md:w-[350px]">
 <div className="absolute top-0 right-0 p-6 z-10">
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="icon" className="h-10 w-10 rounded-md bg-card/90 opacity-0 transition-opacity hover:bg-brown-800/10 group-hover:opacity-100">
 <MoreHorizontal className="h-5 w-5" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-56 rounded-md border-border p-2 shadow-md">
 <DropdownMenuLabel className="text-sm font-semibold text-muted-foreground/60 px-2 py-3">Operations</DropdownMenuLabel>
 <DropdownMenuItem onClick={() => router.push(`/admin/training/groups/${group.id}`)} className="rounded-md py-3 focus:bg-brown-800/10">
 <Presentation className="mr-2 h-4 w-4 text-brown-800" /> <span className="font-bold text-xs">Command View</span>
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => { setEditingGroup(group); setEditGroupOpen(true); }} className="rounded-md py-3">
 <Pencil className="mr-2 h-4 w-4" /> <span className="font-bold text-xs">Configure Details</span>
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => { setSelectedGroup(group.id); setAssignTrainerOpen(true); }} className="rounded-md py-3">
 <UserPlus className="mr-2 h-4 w-4" /> <span className="font-bold text-xs">Deploy Instructor</span>
 </DropdownMenuItem>
 <DropdownMenuSeparator className="bg-border/40" />
 <DropdownMenuItem
 className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-md py-3"
 onClick={() => { setDeletingGroup(group); setDeleteGroupOpen(true); }}
 >
 <Trash2 className="mr-2 h-4 w-4" /> <span className="font-bold text-xs">Terminate Group</span>
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>

 <CardHeader className="pb-4 relative pt-10">
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-2">
 <div className="h-1.5 w-1.5 rounded-full bg-brown-800" />
 <span className="text-sm font-semibold text-brown-800/80">
 {group.branch === 'ALL' ? 'Universal Scope' : `${group.branch} Branch`}
 </span>
 </div>
 </div>
 <CardTitle className="text-2xl font-semibold tracking-tight leading-tight group-hover:text-brown-800 transition-colors duration-300">
 {group.branch === 'ALL' ? 'All Branches' : group.branch}
 </CardTitle>
 <div className="flex items-center gap-4 mt-3">
 <div className="flex items-center gap-1.5">
 <Users className="h-3.5 w-3.5 text-muted-foreground/60" />
 <span className="text-sm font-bold text-foreground/70">{group._count.students} Enrolled</span>
 </div>
 </div>
 </CardHeader>

 <CardContent className="flex-1 space-y-6">
 {group.description && (
 <p className="text-xs font-medium text-muted-foreground leading-relaxed line-clamp-2 px-1">
 {group.description}
 </p>
 )}

 <div className="space-y-3 border-t border-border/60 pt-6">
 <span className="text-sm font-semibold text-muted-foreground/50">Instructor Grid</span>
 {group.trainers.length === 0 ? (
 <div className="p-4 rounded-md bg-muted border border-dashed border-border/60 flex flex-col items-center justify-center gap-2">
 <UserPlus className="h-4 w-4 text-muted-foreground/40" />
 <p className="text-xs font-bold text-muted-foreground/60">Awaiting Trainers</p>
 </div>
 ) : (
 <div className="grid gap-2">
 {group.trainers.slice(0, 2).map((t: any) => (
 <div key={t.id} className="flex items-center justify-between p-3 rounded-md bg-background/40 border border-border group/trainer">
 <div className="flex items-center gap-2">
 <span className="h-1 w-1 rounded-full bg-brown-800/40 group-hover/trainer:bg-brown-800 transition-colors" />
 <span className="text-sm font-bold text-foreground/80">{t.type}</span>
 </div>
 <span className="text-sm font-semibold text-brown-800/80 truncate max-w-[100px]">{t.trainer.name.split(' ')[0]}</span>
 </div>
 ))}
 {group.trainers.length > 2 && (
 <p className="text-xs font-semibold text-center text-muted-foreground/60">+{group.trainers.length - 2} more instructors</p>
 )}
 </div>
 )}
 </div>
 </CardContent>

 <div className="p-6 pt-0 bg-gradient-to-t from-background/40 to-transparent">
 <Button
 onClick={() => router.push(`/admin/training/groups/${group.id}`)}
 className="w-full h-10 rounded-md bg-brown-800/5 hover:bg-brown-800 text-brown-800 hover:text-brown-800-foreground border border-brown-800/20 transition-all font-semibold text-sm font-medium group/cta"
 >
 Manage Group <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover/cta:translate-x-1" />
 </Button>
 </div>
 </Card>
 ))}
 </div>
 </div>
 );
 })}

 {/* Uncategorized / Orphaned Groups */}
 {groups.filter(g => g.year === year && !groupMasters.some(m => m.name === g.name)).length > 0 && (
 <div className="space-y-6 pb-8">
 <div className="flex items-center gap-4 px-2">
 <div className="flex items-center gap-3">
 <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center border border-border">
 <BookOpen className="h-4 w-4 text-muted-foreground" />
 </div>
 <h3 className="text-2xl font-semibold tracking-tight text-muted-foreground">Miscellaneous</h3>
 </div>
 <div className="h-px flex-1 bg-gradient-to-r from-border/60 to-transparent" />
 </div>
 <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
 {groups.filter(g => g.year === year && !groupMasters.some(m => m.name === g.name)).map(group => (
 <Card key={group.id} className="group relative flex flex-col shrink-0 w-[300px] md:w-[350px] overflow-hidden bg-card border-border hover:border-brown-800/40 hover:shadow-md hover:shadow-primary/5 transition-all duration-500 rounded-md snap-start">
 <div className="absolute top-0 right-0 p-6 z-10">
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="icon" className="h-10 w-10 rounded-md bg-background backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brown-800/10">
 <MoreHorizontal className="h-5 w-5" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-56 rounded-md border-border p-2 shadow-md">
 <DropdownMenuLabel className="text-sm font-semibold text-muted-foreground/60 px-2 py-3">Operations</DropdownMenuLabel>
 <DropdownMenuItem onClick={() => router.push(`/admin/training/groups/${group.id}`)} className="rounded-md py-3 focus:bg-brown-800/10">
 <Presentation className="mr-2 h-4 w-4 text-brown-800" /> <span className="font-bold text-xs">Command View</span>
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => { setEditingGroup(group); setEditGroupOpen(true); }} className="rounded-md py-3">
 <Pencil className="mr-2 h-4 w-4" /> <span className="font-bold text-xs">Configure Details</span>
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => { setSelectedGroup(group.id); setAssignTrainerOpen(true); }} className="rounded-md py-3">
 <UserPlus className="mr-2 h-4 w-4" /> <span className="font-bold text-xs">Deploy Instructor</span>
 </DropdownMenuItem>
 <DropdownMenuSeparator className="bg-border/40" />
 <DropdownMenuItem
 className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-md py-3"
 onClick={() => { setDeletingGroup(group); setDeleteGroupOpen(true); }}
 >
 <Trash2 className="mr-2 h-4 w-4" /> <span className="font-bold text-xs">Terminate Group</span>
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>

 <CardHeader className="pb-4 relative pt-10">
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-2">
 <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
 <span className="text-sm font-semibold text-secondary-foreground/80">
 {group.branch === 'ALL' ? 'Universal Access' : `${group.branch} Branch`}
 </span>
 </div>
 </div>
 <CardTitle className="text-2xl font-semibold tracking-tight leading-tight group-hover:text-brown-800 transition-colors duration-300">{group.name}</CardTitle>
 <div className="flex items-center gap-4 mt-3">
 <div className="flex items-center gap-1.5">
 <Users className="h-3.5 w-3.5 text-muted-foreground/60" />
 <span className="text-sm font-bold text-foreground/70">{group._count.students} Enrolled</span>
 </div>
 </div>
 </CardHeader>

 <CardContent className="flex-1 space-y-6">
 {group.description && (
 <p className="text-xs font-medium text-muted-foreground leading-relaxed line-clamp-2 px-1">
 {group.description}
 </p>
 )}

 <div className="space-y-3 pt-6 border-t border-border">
 <span className="text-sm font-semibold text-muted-foreground/50">Instructor Grid</span>
 {group.trainers.length === 0 ? (
 <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border/60 bg-card/70 p-4">
 <UserPlus className="h-4 w-4 text-muted-foreground/40" />
 <p className="text-xs font-bold text-muted-foreground/60">Awaiting Trainers</p>
 </div>
 ) : (
 <div className="grid gap-2">
 {group.trainers.slice(0, 2).map((t: any) => (
 <div key={t.id} className="flex items-center justify-between rounded-md border border-border/60 bg-card/80 p-3 group/trainer">
 <div className="flex items-center gap-2">
 <span className="h-1 w-1 rounded-full bg-brown-800/40 group-hover/trainer:bg-brown-800 transition-colors" />
 <span className="text-sm font-bold text-foreground/80">{t.type}</span>
 </div>
 <span className="text-sm font-semibold text-brown-800/80 truncate max-w-[100px]">{t.trainer.name.split(' ')[0]}</span>
 </div>
 ))}
 {group.trainers.length > 2 && (
 <p className="text-xs font-semibold text-center text-muted-foreground/60">+{group.trainers.length - 2} more instructors</p>
 )}
 </div>
 )}
 </div>
 </CardContent>

 <div className="bg-gradient-to-t from-card/60 to-transparent p-6 pt-0">
 <Button
 onClick={() => router.push(`/admin/training/groups/${group.id}`)}
 className="group/cta h-10 w-full rounded-md border border-brown-800/20 bg-brown-800/8 font-semibold text-brown-800 transition-all hover:bg-brown-800 hover:text-brown-800-foreground"
 >
 Manage Students <ArrowRight className="ml-2 h-3.5 w-3.5 transition-transform group-hover/cta:translate-x-1" />
 </Button>
 </div>
 </Card>
 ))}
 </div>
 </div>
 )}

 {/* Empty State */}
 {groups.filter(g => g.year === year).length === 0 && (
 <div className="py-32 text-center rounded-md border-2 border-dashed border-border bg-muted backdrop-blur-sm animate-in fade-in duration-700">
 {/* ... existing empty state ... */}
 <div className="p-6 rounded-md bg-brown-800/5 border border-brown-800/10 inline-block mb-6">
 <BookOpen className="h-10 w-12 text-brown-800/20" />
 </div>
 <h3 className="text-2xl font-semibold tracking-tight text-foreground/60">Zero Cohorts Detected</h3>
 <p className="text-muted-foreground mt-2 max-w-sm mx-auto font-medium">No training groups have been instantiated for the batch of {year}.</p>
 <Button onClick={() => setCreateGroupOpen(true)} className="mt-8 h-10 rounded-md px-10 font-bold text-sm font-medium">
 Initiate First Group
 </Button>
 </div>
 )}
 </TabsContent>
 ))}
 </Tabs>
 )}
 </TabsContent>
 </Tabs>

 {/* DIALOGS */}

 {/* Create Group Dialog */}
 <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
 <DialogContent className="sm:max-w-[500px] rounded-md border-border bg-card p-0 overflow-hidden">
 <DialogHeader className="p-8 bg-muted border-b border-border">
 <div className="p-3 w-fit rounded-md bg-brown-800/10 border border-brown-800/20 mb-4">
 <Plus className="h-6 w-6 text-brown-800" />
 </div>
 <DialogTitle className="text-2xl font-semibold">Instantiate <span className="text-brown-800 italic">Cohort</span></DialogTitle>
 <DialogDescription className="text-sm font-medium">Define a new operational training group.</DialogDescription>
 </DialogHeader>
 <form onSubmit={handleCreateGroup} className="p-8 space-y-6">
 <div className="space-y-4">
 {/* 1. Batch Class (First as requested) */}
 <div className="space-y-2">
 <Label className="text-sm font-semibold text-sm font-medium text-muted-foreground">Batch Class</Label>
 <Select name="year" required value={createGroupYear} onValueChange={setCreateGroupYear}>
 <SelectTrigger className="h-10 rounded-md bg-background border-border font-bold"><SelectValue placeholder="Select Year" /></SelectTrigger>
 <SelectContent className="rounded-md border-border shadow-md">
 {getYearOptions().map(year => (
 <SelectItem key={year} value={year} className="rounded-md py-2.5 font-bold text-sm font-medium">{year}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 {/* 2. Identity Selection */}
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <Label className="text-sm font-semibold text-sm font-medium text-muted-foreground">Registry Name</Label>
 <Button
 type="button"
 variant="link"
 onClick={() => setManageIdentitiesOpen(true)}
 className="h-auto p-0 text-sm font-bold text-brown-800/80 hover:text-brown-800"
 >
 Manage Identities
 </Button>
 </div>

 <Select onValueChange={setSelectedMasterName} value={selectedMasterName || undefined}>
 <SelectTrigger className="h-10 rounded-md bg-background border-border font-bold">
 <SelectValue placeholder="Select Group Identity" />
 </SelectTrigger>
 <SelectContent className="rounded-md border-border shadow-md max-h-[200px]">
 {groupMasters.map(m => (
 <SelectItem key={m.id} value={m.name} className="font-bold text-sm">{m.name}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 {/* 3. Branch Selection (Multi-Select Dropdown) */}
 <div className="space-y-2">
 <Label className="text-sm font-semibold text-sm font-medium text-muted-foreground">Operational Branches</Label>
 <Popover>
 <PopoverTrigger asChild>
 <Button
 variant="outline"
 role="combobox"
 className={cn(
"w-full h-10 rounded-md bg-background border-border font-bold justify-between hover:bg-background/80 transition-all",
 selectedBranches.length === 0 &&"text-muted-foreground"
 )}
 >
 <span className="truncate">
 {selectedBranches.length > 0
 ? `${selectedBranches.length} Branch${selectedBranches.length > 1 ? 'es' : ''} Selected (${selectedBranches.join(', ')})`
 :"Select Branches"}
 </span>
 <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
 </Button>
 </PopoverTrigger>
 <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-md border-border shadow-md" align="start">
 <div className="flex flex-col max-h-[300px] overflow-y-auto p-2">
 <div
 className={cn(
"flex items-center gap-3 rounded-md p-2 hover:bg-muted cursor-pointer transition-colors border-b border-border mb-1 pb-3",
 BRANCHES.filter(b => !occupiedBranchesForYear.includes(b)).length === 0 &&"opacity-50 pointer-events-none"
 )}
 onClick={() => {
 const available = BRANCHES.filter(b => !occupiedBranchesForYear.includes(b));
 if (selectedBranches.length === available.length && available.length > 0) {
 setSelectedBranches([]);
 } else {
 setSelectedBranches(available);
 }
 }}
 >
 <Checkbox
 checked={selectedBranches.length === BRANCHES.filter(b => !occupiedBranchesForYear.includes(b)).length && selectedBranches.length > 0}
 disabled={BRANCHES.filter(b => !occupiedBranchesForYear.includes(b)).length === 0}
 className="h-4 w-4 rounded-sm"
 onChange={() => { }} // dummy to avoid warning, controlled by parent click
 />
 <span className="text-sm font-bold flex-1 text-brown-800">Select All Available</span>
 </div>

 {BRANCHES.map(branch => {
 const isTaken = occupiedBranchesForYear.includes(branch) || isAllBranchesTaken;
 return (
 <div
 key={branch}
 className={cn(
"flex items-center gap-3 rounded-md p-2 transition-colors",
 isTaken ?"opacity-40 cursor-not-allowed bg-muted" :"hover:bg-muted cursor-pointer",
 selectedBranches.includes(branch) && !isTaken &&"bg-brown-800/5"
 )}
 onClick={() => {
 if (isTaken) return;
 setSelectedBranches(prev =>
 prev.includes(branch) ? prev.filter(b => b !== branch) : [...prev, branch]
 );
 }}
 >
 <Checkbox
 checked={selectedBranches.includes(branch) || isTaken}
 disabled={isTaken}
 className="h-4 w-4 rounded-sm data-[state=checked]:bg-brown-800"
 onChange={() => { }} // dummy
 />
 <div className="flex-1 flex justify-between items-center">
 <span className="text-sm font-bold">{branch}</span>
 {isTaken && <span className="text-xs font-bold text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded-sm">Assigned</span>}
 </div>
 </div>
 )
 })}
 </div>
 </PopoverContent>
 </Popover>
 </div>

 {/* 4. Description */}
 <div className="space-y-2">
 <Label className="text-sm font-semibold text-sm font-medium text-muted-foreground">Abstract</Label>
 <Textarea name="description" placeholder="Briefly describe the purpose of this group..." className="rounded-md bg-background border-border min-h-[100px] font-medium" />
 </div>
 </div>

 <div className="pt-4 flex gap-3">
 <Button type="button" variant="ghost" onClick={() => setCreateGroupOpen(false)} disabled={isSubmitting} className="flex-1 h-10 rounded-md font-bold text-sm font-medium">Abandon</Button>
 <Button type="submit" disabled={isSubmitting} className="flex-[2] h-10 rounded-md shadow-sm font-bold text-sm font-medium">
 {isSubmitting ? (
 <>
 <Clock className="mr-2 h-3.5 w-3.5 animate-spin" /> Initializes...
 </>
 ) : (
"Confirm Redline"
 )}
 </Button>
 </div>
 </form>
 </DialogContent>
 </Dialog>

 {/* Assign Trainer Dialog */}
 <Dialog open={assignTrainerOpen} onOpenChange={setAssignTrainerOpen}>
 <DialogContent className="sm:max-w-[450px] rounded-md border-border bg-card p-0 overflow-hidden">
 <DialogHeader className="p-8 bg-muted border-b border-border">
 <div className="p-3 w-fit rounded-md bg-violet-500/10 border border-violet-500/20 mb-4">
 <UserPlus className="h-6 w-6 text-violet-500" />
 </div>
 <DialogTitle className="text-2xl font-semibold">Deploy <span className="text-violet-500 italic">Personnel</span></DialogTitle>
 <DialogDescription className="text-sm font-medium">Assign a specialized instructor to this cohort.</DialogDescription>
 </DialogHeader>
 <form onSubmit={handleAssignTrainer} className="p-8 space-y-6">
 <div className="space-y-2">
 <Label className="text-sm font-semibold text-sm font-medium text-muted-foreground">Mission Module</Label>
 <Select name="type" required>
 <SelectTrigger className="h-10 rounded-md bg-background border-border font-bold"><SelectValue placeholder="Select Module" /></SelectTrigger>
 <SelectContent className="rounded-md">
 <SelectItem value="Verbal" className="font-bold text-sm font-medium">Verbal Hub</SelectItem>
 <SelectItem value="Aptitude" className="font-bold text-sm font-medium">Aptitude Hub</SelectItem>
 <SelectItem value="Technical" className="font-bold text-sm font-medium">Technical Core</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2">
 <Label className="text-sm font-semibold text-sm font-medium text-muted-foreground">Elite Instructor</Label>
 <Select name="trainerId" required>
 <SelectTrigger className="h-10 rounded-md bg-background border-border font-bold"><SelectValue placeholder="Select Trainer" /></SelectTrigger>
 <SelectContent className="rounded-md">
 {trainers.map(t => (
 <SelectItem key={t.id} value={t.id} className="font-bold text-sm">{t.name}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <div className="pt-4 flex gap-3">
 <Button type="button" variant="ghost" onClick={() => setAssignTrainerOpen(false)} className="flex-1 h-10 rounded-md font-bold text-sm font-medium">Cancel</Button>
 <Button type="submit" className="flex-[2] h-10 rounded-md bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20 font-bold text-sm font-medium">Deploy Unit</Button>
 </div>
 </form>
 </DialogContent>
 </Dialog>

 {/* Edit Group Dialog */}
 <Dialog open={editGroupOpen} onOpenChange={setEditGroupOpen}>
 <DialogContent className="sm:max-w-[500px] rounded-md border-border bg-card p-0 overflow-hidden">
 <DialogHeader className="p-8 bg-muted border-b border-border">
 <div className="p-3 w-fit rounded-md bg-amber-500/10 border border-amber-500/20 mb-4">
 <Pencil className="h-6 w-6 text-amber-500" />
 </div>
 <DialogTitle className="text-2xl font-semibold">Configure <span className="text-amber-500 italic">Parameters</span></DialogTitle>
 <DialogDescription className="text-sm font-medium">Modify existing cohort specifications.</DialogDescription>
 </DialogHeader>
 {editingGroup && (
 <form onSubmit={handleEditGroup} className="p-8 space-y-6">
 <div className="space-y-2">
 <Label className="text-sm font-semibold text-sm font-medium text-muted-foreground">Identifier</Label>
 <Input name="name" defaultValue={editingGroup.name} className="h-10 rounded-md bg-background border-border font-bold" required />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label className="text-sm font-semibold text-sm font-medium text-muted-foreground">Branch</Label>
 <Select name="branch" defaultValue={editingGroup.branch} required>
 <SelectTrigger className="h-10 rounded-md bg-background border-border font-bold"><SelectValue /></SelectTrigger>
 <SelectContent className="rounded-md">
 {BRANCHES.map(branch => (
 <SelectItem key={branch} value={branch} className="font-bold text-sm">{branch}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2">
 <Label className="text-sm font-semibold text-sm font-medium text-muted-foreground">Batch</Label>
 <Select name="year" defaultValue={editingGroup.year} required>
 <SelectTrigger className="h-10 rounded-md bg-background border-border font-bold"><SelectValue /></SelectTrigger>
 <SelectContent className="rounded-md">
 {getYearOptions().map(year => (
 <SelectItem key={year} value={year} className="font-bold text-sm">{year}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>
 <div className="space-y-2">
 <Label className="text-sm font-semibold text-sm font-medium text-muted-foreground">Abstract</Label>
 <Textarea
 name="description"
 placeholder="Briefly describe the purpose of this group..."
 className="rounded-md bg-background border-border min-h-[100px] font-medium"
 defaultValue={editingGroup.description ||""}
 />
 </div>
 <div className="pt-4 flex gap-3">
 <Button type="button" variant="ghost" onClick={() => setEditGroupOpen(false)} className="flex-1 h-10 rounded-md font-bold text-sm font-medium">Cancel</Button>
 <Button type="submit" className="flex-[2] h-10 rounded-md bg-brown-800 hover:bg-brown-900 text-brown-50 shadow-lg shadow-amber-900/15 font-bold text-sm font-medium">Update Registry</Button>
 </div>
 </form>
 )}
 </DialogContent>
 </Dialog>

 {/* Delete Group AlertDialog */}
 <AlertDialog open={deleteGroupOpen} onOpenChange={setDeleteGroupOpen}>
 <AlertDialogContent className="rounded-md border-border bg-card p-8">
 <AlertDialogHeader className="space-y-6">
 <div className="mx-auto p-4 rounded-md bg-destructive/10 border border-destructive/20 w-fit">
 <Trash2 className="h-8 w-8 text-destructive animate-bounce" />
 </div>
 <div className="space-y-2 text-center">
 <AlertDialogTitle className="text-3xl font-semibold">Confirm <span className="text-destructive">Termination</span></AlertDialogTitle>
 <AlertDialogDescription className="text-sm font-medium leading-relaxed">
 You are about to strip <span className="text-foreground font-semibold bg-muted px-2 py-0.5 rounded-md"> {deletingGroup?.name} </span> from the central registry.
 This process is irreversible and will result in total data loss for this cohort.
 </AlertDialogDescription>
 </div>
 </AlertDialogHeader>
 <AlertDialogFooter className="mt-10 sm:justify-center gap-3">
 <AlertDialogCancel onClick={() => setDeletingGroup(null)} className="h-10 rounded-md px-8 font-bold text-sm font-medium border-border">Abort Protocol</AlertDialogCancel>
 <AlertDialogAction
 onClick={handleDeleteGroup}
 className="h-10 rounded-md px-8 bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold text-sm font-medium shadow-lg shadow-destructive/20"
 >
 Execute Termination
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>

 {/* Assign Students Dialog */}
 <Dialog open={assignStudentOpen} onOpenChange={setAssignStudentOpen}>
 <DialogContent className="sm:max-w-[550px] rounded-md border-border bg-card p-0 overflow-hidden">
 <DialogHeader className="p-8 bg-muted border-b border-border">
 <div className="p-3 w-fit rounded-md bg-brown-800/10 border border-brown-800/20 mb-4">
 <Users className="h-6 w-6 text-brown-800" />
 </div>
 <DialogTitle className="text-2xl font-semibold">Batch <span className="text-brown-800 italic">Enrollment</span></DialogTitle>
 <DialogDescription className="text-sm font-medium">Reassign multiple students into this operational group.</DialogDescription>
 </DialogHeader>
 <form onSubmit={handleAssignStudents} className="p-8 space-y-6">
 <div className="space-y-4">
 <Label className="text-sm font-semibold text-muted-foreground/60 ml-2">Admission ID Registry (Comma Separated)</Label>
 <div className="relative group">
 <Textarea
 name="studentIds"
 placeholder="e.g. ADM001, ADM002, ADM003"
 className="min-h-[220px] rounded-md bg-background border-border focus:border-brown-800/40 focus:ring-amber-500/10 p-6 font-mono text-xs leading-relaxed transition-all scrollbar-hide"
 required
 />
 <div className="absolute bottom-4 right-4 text-xs font-bold text-muted-foreground/40 px-2 py-1 rounded bg-muted">
 Raw ID Feed
 </div>
 </div>
 <div className="flex gap-3 p-4 rounded-md bg-amber-500/5 border border-amber-500/10">
 <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
 <p className="text-sm font-bold text-amber-500/80 leading-relaxed">
 Note: Target students will be automatically decoupled from their current cohorts and synchronized with this group instantly.
 </p>
 </div>
 </div>
 <div className="pt-2 flex gap-3">
 <Button type="button" variant="ghost" onClick={() => setAssignStudentOpen(false)} className="flex-1 h-10 rounded-md font-bold text-sm font-medium">Decline</Button>
 <Button type="submit" className="flex-[2] h-10 rounded-md shadow-sm font-bold text-sm font-medium">Synchronize Cohort</Button>
 </div>
 </form>
 </DialogContent>
 </Dialog>

 {/* Manage Identities Dialog (New) */}
 <Dialog open={manageIdentitiesOpen} onOpenChange={setManageIdentitiesOpen}>
 <DialogContent className="sm:max-w-[400px] rounded-md border-border bg-card p-0 overflow-hidden">
 <DialogHeader className="p-6 bg-muted border-b border-border">
 <DialogTitle className="text-lg font-semibold">Group <span className="text-brown-800 italic">Registry</span></DialogTitle>
 <DialogDescription className="text-xs font-medium">Create or remove group identifiers.</DialogDescription>
 </DialogHeader>
 <div className="p-6 space-y-6">
 {/* Creation Input */}
 <div className="flex gap-2">
 <Input
 placeholder="New Identity (e.g. ALPHA)"
 value={customGroupName}
 disabled={isCreatingIdentity}
 onChange={(e) => setCustomGroupName(e.target.value.toUpperCase())}
 className="h-10 rounded-md bg-background font-bold text-xs"
 onKeyDown={async (e) => {
 if (e.key === 'Enter') {
 e.preventDefault();
 if (!customGroupName.trim() || isCreatingIdentity) return;

 const tempId = `temp-${Date.now()}`;
 const optimisticMaster = {
 id: tempId,
 name: customGroupName,
 createdAt: new Date().toISOString(),
 order: groupMasters.length
 };

 // 1. Optimistic Update (Instant)
 setGroupMasters(prev => [...prev, optimisticMaster]);
 setCustomGroupName('');

 // 2. Background API Call
 setIsCreatingIdentity(true);
 try {
 const realMaster = await api.post('/training/group-masters', { name: optimisticMaster.name });

 // 3. Reconcile (Replace temp with real)
 setGroupMasters(prev => prev.map(m => m.id === tempId ? realMaster : m));
 toast({ title:"Identity Created", description: `${realMaster.name} has been registered.` });
 } catch (error: any) {
 // 4. Rollback on Error
 setGroupMasters(prev => prev.filter(m => m.id !== tempId));
 setCustomGroupName(optimisticMaster.name); // Restore input
 console.error("Creation failed:", error);
 toast({ variant:"destructive", title:"Creation Failed", description: error.message });
 } finally {
 setIsCreatingIdentity(false);
 }
 }
 }}
 />
 <Button
 size="icon"
 type="button"
 disabled={isCreatingIdentity || !customGroupName.trim()}
 className="h-10 w-10 shrink-0 rounded-md shadow-sm"
 onClick={async () => {
 if (!customGroupName.trim() || isCreatingIdentity) return;

 const tempId = `temp-${Date.now()}`;
 const optimisticMaster = {
 id: tempId,
 name: customGroupName,
 createdAt: new Date().toISOString(),
 order: groupMasters.length
 };

 // 1. Optimistic Update (Instant)
 setGroupMasters(prev => [...prev, optimisticMaster]);
 setCustomGroupName('');

 // 2. Background API Call
 setIsCreatingIdentity(true);
 try {
 const realMaster = await api.post('/training/group-masters', { name: optimisticMaster.name });

 // 3. Reconcile (Replace temp with real)
 setGroupMasters(prev => prev.map(m => m.id === tempId ? realMaster : m));
 toast({ title:"Identity Created", description: `${realMaster.name} has been registered.` });
 } catch (error: any) {
 // 4. Rollback on Error
 setGroupMasters(prev => prev.filter(m => m.id !== tempId));
 setCustomGroupName(optimisticMaster.name); // Restore input
 console.error("Creation failed:", error);
 toast({ variant:"destructive", title:"Creation Failed", description: error.message });
 } finally {
 setIsCreatingIdentity(false);
 }
 }}
 >
 {isCreatingIdentity ? <div className="h-4 w-4 rounded-full border-2 border-brown-800-foreground border-t-transparent animate-spin" /> : <Plus className="h-4 w-4" />}
 </Button>
 </div>

 <div className="h-px bg-border/40" />

 {/* List */}
 <ScrollArea className="h-[300px] pr-4">
 <div className="space-y-2">
 {/* Optimistic"Creating..." item could be added here if needed, but button spinner is usually enough */}
 {groupMasters.map((master, index) => (
 <div key={master.id} className="flex items-center justify-between p-3 rounded-md bg-muted border border-transparent hover:border-border transition-colors group">
 <div className="flex items-center gap-3">
 {/* Reorder Controls */}
 <div className="flex flex-col -gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
 <Button
 variant="ghost"
 size="icon"
 className="h-3 w-3 rounded-full hover:bg-background/80"
 disabled={index === 0}
 onClick={(e) => {
 e.stopPropagation();
 handleReorderMasters(index, 'up');
 }}
 >
 <ChevronUp className="h-2 w-2 text-muted-foreground" />
 </Button>
 <Button
 variant="ghost"
 size="icon"
 className="h-3 w-3 rounded-full hover:bg-background/80"
 disabled={index === groupMasters.length - 1}
 onClick={(e) => {
 e.stopPropagation();
 handleReorderMasters(index, 'down');
 }}
 >
 <ChevronDown className="h-2 w-2 text-muted-foreground" />
 </Button>
 </div>

 <div className="h-8 w-8 rounded-md bg-brown-800/10 flex items-center justify-center border border-brown-800/20">
 <span className="text-sm font-semibold text-brown-800">{master.name.substring(0, 2)}</span>
 </div>
 <div className="flex flex-col">
 <span className="text-xs font-bold">{master.name}</span>
 <span className="text-xs text-muted-foreground font-medium">
 {master.createdAt ? format(new Date(master.createdAt),"dd MMM yyyy") : 'Recently'}
 </span>
 </div>
 </div>
 <Button
 variant="ghost"
 size="icon"
 type="button"
 disabled={deletingIdentityId === master.id || master.id.startsWith('temp-')}
 className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md opacity-0 group-hover:opacity-100 transition-all disabled:opacity-100"
 onClick={async (e) => {
 e.stopPropagation();

 // Client-side Validation (Industry Standard)
 // Check if this identity is currently in use to prevent optimistic rollback
 const activeUsage = groups.filter(g => g.name === master.name).length;
 if (activeUsage > 0) {
 toast({
 variant:"destructive",
 title:"Cannot Delete Identity",
 description: `This identity is currently assigned to ${activeUsage} active group(s). You must delete those groups first.`
 });
 return;
 }

 const masterId = master.id;
 const previousMasters = [...groupMasters];

 // 1. Show Loading State
 setDeletingIdentityId(masterId);

 // 2. Optimistic Update (Instant Removal)
 setGroupMasters(prev => prev.filter(m => m.id !== masterId));
 if (selectedMasterName === master.name) setSelectedMasterName("");

 try {
 await api.delete(`/training/group-masters?id=${masterId}`);
 toast({ title:"Identity Removed", description: `${master.name} has been deleted.` });
 } catch (error: any) {
 // Ignore 404 (Identity not found) as it means it's already deleted
 if (error.message === 'Identity not found') {
 return;
 }

 console.error("Deletion failed:", error);

 // 2. Rollback on Error
 setGroupMasters(previousMasters);

 // Enhanced Error Messaging
 if (error.message.includes("existing group(s)")) {
 toast({
 variant:"destructive",
 title:"Deletion Blocked",
 description:"This identity is in use. Please refresh the page to see active groups."
 });
 } else {
 // Fallback for other errors (e.g. database constraints)
 toast({
 variant:"destructive",
 title:"Deletion Failed",
 description: error.message ||"Cannot delete this group identity. It may still be referenced by existing records."
 });
 }
 } finally {
 setDeletingIdentityId(null);
 }
 }}
 >
 {deletingIdentityId === master.id ? (
 <div className="h-3.5 w-3.5 rounded-full border-2 border-destructive border-t-transparent animate-spin" />
 ) : (
 <Trash2 className="h-3.5 w-3.5" />
 )}
 </Button>
 </div>
 ))}
 {groupMasters.length === 0 && (
 <div className="py-12 text-center">
 <div className="inline-flex h-10 w-12 items-center justify-center rounded-md bg-muted mb-3">
 <AlertCircle className="h-5 w-5 text-muted-foreground/50" />
 </div>
 <p className="text-xs font-bold text-muted-foreground/50">No Identities Registered</p>
 </div>
 )}
 </div>
 </ScrollArea>
 </div>
 <DialogFooter className="p-4 bg-muted border-t border-border">
 <Button variant="ghost" className="w-full text-xs font-bold" onClick={() => setManageIdentitiesOpen(false)}>Close Registry</Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>

 </div>
 )
}
