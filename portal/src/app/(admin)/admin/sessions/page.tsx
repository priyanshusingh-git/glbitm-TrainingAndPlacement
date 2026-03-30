"use client";

import { useState, useEffect } from"react";
import {
 Calendar,
 Plus,
 Clock,
 Users,
 MapPin,
 CheckCircle,
 MoreHorizontal,
 ChevronLeft,
 ChevronRight,
 Search,
 Filter,
 Calendar as CalendarIcon,
 AlertCircle,
 Copy,
 Trash2,
 RefreshCw
} from"lucide-react";
import { Button } from"@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from"@/components/ui/card";
import { Badge } from"@/components/ui/badge";
import { Input } from"@/components/ui/input";
import { Label } from"@/components/ui/label";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
 DialogFooter
} from"@/components/ui/dialog";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue
} from"@/components/ui/select";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from"@/components/ui/dropdown-menu";
import { Checkbox } from"@/components/ui/checkbox";
import { useToast } from"@/components/ui/use-toast";
import { api } from"@/lib/api";
import { cn } from"@/lib/utils";
import { TrainingCalendar } from"@/modules/training/components/calendar";
import { SessionWizard } from"@/app/(admin)/admin/sessions/session-wizard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from"@/components/ui/tabs";

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

const SESSION_TYPES = [
"Technical Core",
"Aptitude Hub",
"Verbal Hub",
"Soft Skills",
"Mock Interview",
"Assessment",
"Company Briefing"
];

const MODES = ["Offline","Online","Hybrid"];

export default function AdminSessionsPage() {
 const { toast } = useToast();
 const [activeTab, setActiveTab] = useState("list");
 const [selectedYear, setSelectedYear] = useState(() => localStorage.getItem('training_selectedYear') || getYearOptions()[0]);
 const [selectedBranch, setSelectedBranch] = useState(() => localStorage.getItem('training_selectedBranch') ||"ALL");
 const [sessions, setSessions] = useState<any[]>([]);
 const [groups, setGroups] = useState<any[]>([]);
 const [groupMasters, setGroupMasters] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");
 const [selectedGroupForWeekly, setSelectedGroupForWeekly] = useState<any>(null);
 const [weeklyDialogOpen, setWeeklyDialogOpen] = useState(false);

 // Track selected module per group card
 const [cardModules, setCardModules] = useState<Record<string, string>>({});

 // Create Session States
 const [createDialogOpen, setCreateDialogOpen] = useState(false);

 useEffect(() => {
 fetchData();
 }, []);

 const fetchData = async () => {
 setLoading(true);
 try {
 const [sessionsData, groupsData, mastersData] = await Promise.all([
 api.get("/training/sessions"),
 api.get("/training/groups"),
 api.get("/training/group-masters")
 ]);
 setSessions(sessionsData);
 setGroups(groupsData);
 setGroupMasters(mastersData);
 } catch (error) {
 toast({
 title:"Fetch Failed",
 description:"Critical failure in retrieving operational data.",
 variant:"destructive"
 });
 } finally {
 setLoading(false);
 }
 };

 const onYearChange = (year: string) => {
 setSelectedYear(year);
 localStorage.setItem('training_selectedYear', year);
 };

 const filteredSessions = sessions.filter(s => {
 const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
 s.sessionGroups?.some((g: any) => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

 // Batch filtering (session.date year matches selectedYear)
 const sessionYear = new Date(s.date).getFullYear().toString();
 // Since we don't have a specific 'year' field on sessions, we check groups or date.
 // Actually, sessions often follow the group's year. Let's check groups first.
 const groupYears = s.sessionGroups?.map((g: any) => g.year) || [];
 const matchesYear = groupYears.includes(selectedYear) || (groupYears.length === 0 && sessionYear === selectedYear);

 // Branch filtering
 const groupBranches = s.sessionGroups?.map((g: any) => g.branch) || [];
 const matchesBranch = selectedBranch ==="ALL" || groupBranches.includes(selectedBranch) || groupBranches.includes("ALL");

 return matchesSearch && matchesYear && matchesBranch;
 });

 return (
 <div className="space-y-8 animate-in fade-in duration-500">
 {/* Header section */}
 <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 mt-2 gap-4">
 <div>
 <div className="flex items-center gap-3 mb-2">
 <Badge variant="outline" className="px-3 py-1 rounded-full border-brown-800/20 bg-brown-800/5 text-brown-800 text-xs font-semibold">
 <RefreshCw className="mr-2 h-3 w-3 animate-spin" /> Live Operations Hub
 </Badge>
 </div>
 <h1 className="text-3xl font-bold tracking-tight text-foreground">
 Manage <span className="text-brown-800 italic">Sessions</span>
 </h1>
 <p className="text-sm font-medium text-muted-foreground mt-1">
 Orchestrate complex training schedules, assign personnel, and monitor learning velocity across all cohorts.
 </p>
 </div>
 <div className="flex items-center gap-3">
 <Button onClick={() => setCreateDialogOpen(true)} className="h-10 rounded-md px-6 font-semibold text-sm shadow-sm transition-all">
 <Plus className="mr-2 h-4 w-4" /> Create Session
 </Button>
 </div>
 </div>

 {/* Main Content Area */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 {/* Search & Tabs */}
 <div className="lg:col-span-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex p-1 bg-muted border border-border rounded-md w-fit">
 <Button
 variant={activeTab === 'list' ? 'default' : 'ghost'}
 onClick={() => setActiveTab('list')}
 className="rounded-md px-6 font-bold text-sm h-8"
 > Dashboard View </Button>
 <Button
 variant={activeTab === 'calendar' ? 'default' : 'ghost'}
 onClick={() => setActiveTab('calendar')}
 className="rounded-md px-6 font-bold text-sm h-8"
 > Calendar view </Button>
 </div>

 <div className="flex items-center gap-3 flex-1 max-w-2xl">
 <Select value={selectedBranch} onValueChange={(val) => {
 setSelectedBranch(val);
 localStorage.setItem('training_selectedBranch', val);
 }}>
 <SelectTrigger className="h-10 w-[160px] rounded-md border-border bg-background font-bold text-sm font-medium focus:ring-amber-500/20">
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

 <div className="relative flex-1">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
 <Input
 placeholder="SEARCH BY TITLE OR COHORT..."
 className="pl-11 h-10 rounded-md bg-card border-border font-bold text-sm font-medium focus-visible:ring-amber-500/20"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>
 </div>
 </div>

 <div className="lg:col-span-12">
 <Tabs value={selectedYear} onValueChange={onYearChange} className="w-full">
 <TabsList className="bg-muted p-1.5 mb-10 h-10 rounded-md border border-border/20">
 {getYearOptions().map(year => (
 <TabsTrigger key={year} value={year} className="px-10 rounded-md data-[state=active]:bg-brown-800/10 data-[state=active]:text-brown-800 font-semibold text-sm transition-all">
 Batch of {year}
 </TabsTrigger>
 ))}
 </TabsList>
 </Tabs>
 </div>

 {activeTab === 'list' ? (
 <div className="lg:col-span-12 space-y-12">
 {loading ? (
 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
 {Array.from({ length: 6 }).map((_, i) => (
 <div key={i} className="h-[280px] rounded-md bg-muted animate-pulse border border-border" />
 ))}
 </div>
 ) : groups.filter(g => g.year === selectedYear).length === 0 ? (
 <Card className="bg-card border-dashed border-2 py-32 text-center rounded-md">
 <CardContent className="space-y-4">
 <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/20" />
 <div className="space-y-1">
 <p className="text-xl font-bold">No Active Cohorts</p>
 <p className="text-muted-foreground font-medium">Create groups for the Batch of {selectedYear} to start scheduling.</p>
 </div>
 </CardContent>
 </Card>
 ) : (
 groupMasters.map((master) => {
 const masterGroups = groups.filter(g =>
 g.name === master.name &&
 g.year === selectedYear &&
 (selectedBranch ==="ALL" || g.branch === selectedBranch || g.branch ==="ALL")
 );

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
 <Badge variant="outline" className="rounded-full px-4 py-1 border-brown-800/20 bg-brown-800/5 text-brown-800 text-sm font-semibold">
 {masterGroups.length} {masterGroups.length === 1 ? 'Cohort' : 'Cohorts'}
 </Badge>
 </div>

 <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
 {masterGroups.map((group) => {
 const currentModule = cardModules[group.id] ||"Technical";

 // Find session for TODAY and this module in this group
 const today = new Date();
 today.setHours(0, 0, 0, 0);

 const todaySession = sessions.find(s => {
 const sDate = new Date(s.date);
 sDate.setHours(0, 0, 0, 0);
 const moduleMatch = currentModule ==="Technical" ? s.type ==="Technical" :
 currentModule ==="Aptitude" ? s.type ==="Aptitude" :
 s.type === currentModule;
 return sDate.getTime() === today.getTime() &&
 moduleMatch &&
 s.sessionGroups?.some((sg: any) => sg.id === group.id);
 });

 return (
 <Card key={group.id} className="group relative flex flex-col shrink-0 w-[300px] md:w-[320px] overflow-hidden bg-card border-border hover:border-brown-800/40 transition-all duration-300 rounded-md snap-start shadow-sm">
 <CardHeader className="pb-4 pt-6">
 <div className="flex flex-col gap-4">
 <div className="flex items-center justify-between">
 <h4 className="text-xl font-bold tracking-tight text-brown-800">
 {group.branch} <span className="text-muted-foreground/40 font-medium">| {master.name}</span>
 </h4>
 <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-tighter border-brown-800/20 bg-brown-800/5 text-brown-800">
 ACTIVE COHORT
 </Badge>
 </div>

 <div className="flex bg-muted/50 p-1 rounded-md border border-border/40">
 {['Technical', 'Aptitude', 'Verbal'].map(mod => (
 <Button
 key={mod}
 variant="ghost"
 size="sm"
 onClick={() => setCardModules(prev => ({ ...prev, [group.id]: mod }))}
 className={cn(
"flex-1 h-7 text-[10px] font-bold rounded-sm transition-all",
 currentModule === mod ?"bg-background text-brown-800 shadow-sm" :"text-muted-foreground hover:bg-muted/80"
 )}
 >
 {mod}
 </Button>
 ))}
 </div>
 </div>
 </CardHeader>

 <CardContent className="flex-1 space-y-4">
 <div className="p-4 rounded-md bg-muted/30 border border-border/50 min-h-[120px] flex flex-col justify-center">
 {todaySession ? (
 <div className="space-y-3">
 <div className="flex items-center gap-2">
 <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
 <span className="text-[10px] font-bold text-emerald-500 uppercase">Live Today</span>
 </div>
 <h5 className="text-sm font-bold leading-tight line-clamp-2">{todaySession.title}</h5>
 <div className="flex items-center justify-between mt-2">
 <div className="flex items-center gap-1.5">
 <Clock className="h-3 w-3 text-brown-800" />
 <span className="text-[11px] font-bold">{todaySession.duration}m</span>
 </div>
 <span className="text-[11px] font-bold text-muted-foreground truncate max-w-[100px]">{todaySession.trainer.name}</span>
 </div>
 </div>
 ) : (
 <div className="text-center space-y-2 py-4">
 <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mx-auto opacity-40">
 <CalendarIcon className="h-4 w-4" />
 </div>
 <p className="text-[11px] font-bold text-muted-foreground/40 uppercase">No Session Today</p>
 </div>
 )}
 </div>
 </CardContent>

 <div className="p-4 pt-0">
 <Button
 onClick={() => {
 setSelectedGroupForWeekly(group);
 setWeeklyDialogOpen(true);
 }}
 className="w-full h-9 rounded-md bg-brown-800 hover:bg-brown-800/90 text-brown-800-foreground shadow-sm transition-all font-bold text-[11px] uppercase tracking-wider"
 >
 Manage Weekly Schedule
 </Button>
 </div>
 </Card>
 );
 })}
 </div>
 </div>
 );
 })
 )}
 </div>
 ) : (
 <div className="lg:col-span-12 rounded-md overflow-hidden border border-border bg-card p-2 shadow-md">
 <TrainingCalendar sessions={sessions} />
 </div>
 )}
 </div>

 {/* Weekly Schedule Dialog */}
 <Dialog open={weeklyDialogOpen} onOpenChange={setWeeklyDialogOpen}>
 <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none shadow-2xl">
 <DialogHeader className="p-8 bg-muted border-b">
 <div className="flex items-center gap-4">
 <div className="h-12 w-12 rounded-md bg-brown-800/10 flex items-center justify-center border border-brown-800/20">
 <CalendarIcon className="h-6 w-6 text-brown-800" />
 </div>
 <div>
 <DialogTitle className="text-2xl font-bold tracking-tight">
 {selectedGroupForWeekly?.branch} | <span className="text-brown-800 italic">{selectedGroupForWeekly?.name}</span>
 </DialogTitle>
 <DialogDescription className="text-sm font-medium">Operational Manifest for the Current Training Cycle</DialogDescription>
 </div>
 </div>
 </DialogHeader>

 <div className="flex-1 overflow-y-auto p-8">
 <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
 {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
 // Find sessions for this day of week (simplified - just showing logic)
 const daySessions = sessions.filter(s => {
 const date = new Date(s.date);
 const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
 return dayName === day && s.sessionGroups?.some((sg: any) => sg.id === selectedGroupForWeekly?.id);
 });

 return (
 <div key={day} className="space-y-3">
 <div className="text-center p-2 rounded-md bg-muted/50 border border-border/50">
 <span className="text-[10px] font-black uppercase text-brown-800 tracking-widest">{day}</span>
 </div>
 <div className="min-h-[200px] flex flex-col gap-2">
 {daySessions.length > 0 ? (
 daySessions.map(s => (
 <div key={s.id} className="p-3 rounded-md bg-card border border-border hover:border-brown-800/40 transition-all group">
 <Badge variant="outline" className="text-[8px] px-1 py-0 mb-1 border-brown-800/20 bg-brown-800/5 text-brown-800">
 {s.type}
 </Badge>
 <p className="text-[11px] font-bold line-clamp-2 leading-tight">{s.title}</p>
 <div className="mt-2 flex items-center justify-between text-[9px] text-muted-foreground font-medium">
 <span>{s.trainer.name.split(' ')[0]}</span>
 <span>{s.duration}m</span>
 </div>
 </div>
 ))
 ) : (
 <div className="flex-1 rounded-md border border-dashed border-border/60 flex items-center justify-center opacity-30">
 <span className="text-[9px] font-bold uppercase tracking-tighter">Empty</span>
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>

 <DialogFooter className="p-4 bg-muted/50 border-t">
 <Button variant="outline" className="h-10 rounded-md font-bold text-xs uppercase" onClick={() => setWeeklyDialogOpen(false)}>Close Manifest</Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>

 {/* CREATE DIALOG WIZARD */}
 <SessionWizard
 isOpen={createDialogOpen}
 onClose={() => setCreateDialogOpen(false)}
 onSuccess={fetchData}
 groups={groups}
 />
 </div>
 );
}
