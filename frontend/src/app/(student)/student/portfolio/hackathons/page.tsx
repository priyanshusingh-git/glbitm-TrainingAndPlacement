"use client";

import { useState, useEffect } from"react";
import { Button } from"@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from"@/components/ui/card";
import { Plus, Trophy, Calendar, Users, Award } from"lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from"@/components/ui/dialog";
import { Label } from"@/components/ui/label";
import { Input } from"@/components/ui/input";
import { Textarea } from"@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from"@/components/ui/select";
import { Badge } from"@/components/ui/badge";
import { api } from"@/lib/api";
import { useToast } from"@/hooks/use-toast";
import { format } from"date-fns";
import { LoadingGrid } from"@/components/ui/loading-states";
import { EnhancedEmpty } from"@/components/ui/enhanced-empty";

interface Hackathon {
 id: string;
 name: string;
 organizer: string;
 date: string;
 mode: string;
 teamName?: string;
 role?: string;
 problemStatement: string;
 position?: string;
 techStack: string[];
}

export default function HackathonsPage() {
 const [hackathons, setHackathons] = useState<Hackathon[]>([]);
 const [loading, setLoading] = useState(true);
 const [addOpen, setAddOpen] = useState(false);
 const { toast } = useToast();

 // Form
 const [name, setName] = useState("");
 const [organizer, setOrganizer] = useState("");
 const [date, setDate] = useState("");
 const [mode, setMode] = useState("Online");
 const [teamName, setTeamName] = useState("");
 const [role, setRole] = useState("");
 const [problemStatement, setProblemStatement] = useState("");
 const [solution, setSolution] = useState("");
 const [techStack, setTechStack] = useState("");
 const [position, setPosition] = useState("Participant");
 const [submitting, setSubmitting] = useState(false);

 const fetchHackathons = async () => {
 try {
 setLoading(true);
 const data = await api.get("/portfolio/hackathons");
 setHackathons(Array.isArray(data) ? data : []);
 } catch (error) {
 toast({ title:"Error", description:"Failed to load hackathons", variant:"destructive" });
 setHackathons([]);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchHackathons();
 }, []);

 const handleAdd = async (e: React.FormEvent) => {
 e.preventDefault();

 const stackArray = techStack.split(",").map(s => s.trim()).filter(Boolean);
 const tempId = `temp-${Date.now()}`;
 const newHackathon: Hackathon = {
 id: tempId,
 name,
 organizer,
 date,
 mode,
 teamName,
 role,
 problemStatement,
 techStack: stackArray,
 position
 };

 // 1. Optimistic Update
 setHackathons(prev => [newHackathon, ...prev]);
 setAddOpen(false);
 resetForm();

 try {
 // 2. Background Sync
 const res = await api.post("/portfolio/hackathons", {
 name,
 organizer,
 date,
 mode,
 teamName,
 role,
 problemStatement,
 solution,
 techStack: stackArray,
 position
 });

 // 3. Reconcile
 setHackathons(prev => prev.map(h => h.id === tempId ? res : h));
 toast({ title:"Success", description:"Hackathon added successfully" });
 } catch (error) {
 // 4. Rollback
 setHackathons(prev => prev.filter(h => h.id !== tempId));
 toast({ title:"Error", description:"Failed to add hackathon", variant:"destructive" });
 }
 };

 const handleDelete = async (id: string) => {
 const previousHackathons = [...hackathons];
 setHackathons(prev => prev.filter(h => h.id !== id));

 try {
 await api.delete(`/portfolio/hackathons/${id}`);
 toast({ title:"Success", description:"Entry deleted" });
 } catch (error: any) {
 if (error.message?.includes("not found")) return;
 setHackathons(previousHackathons);
 toast({ title:"Error", description:"Failed to delete entry", variant:"destructive" });
 }
 };

 const resetForm = () => {
 setName("");
 setOrganizer("");
 setDate("");
 setMode("Online");
 setTeamName("");
 setRole("");
 setProblemStatement("");
 setSolution("");
 setTechStack("");
 setPosition("Participant");
 };

 return (
 <div className="space-y-8">
 <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Hackathons</h1>
 <p className="text-muted-foreground mt-1 text-sm sm:text-base">
 Document your participation and achievements in hackathons.
 </p>
 </div>
 <Dialog open={addOpen} onOpenChange={setAddOpen}>
 <DialogTrigger asChild>
 <Button className="flex items-center gap-2">
 <Plus className="h-4 w-4" /> Log Hackathon
 </Button>
 </DialogTrigger>
 <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
 <DialogHeader>
 <DialogTitle>Log Hackathon Participation</DialogTitle>
 <DialogDescription>
 Add details about the event and your project.
 </DialogDescription>
 </DialogHeader>
 <form onSubmit={handleAdd} className="space-y-4 py-4">
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label>Hackathon Name</Label>
 <Input value={name} onChange={(e) => setName(e.target.value)} required />
 </div>
 <div className="space-y-2">
 <Label>Organizer</Label>
 <Input value={organizer} onChange={(e) => setOrganizer(e.target.value)} required placeholder="e.g. MLH, Devfolio" />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label>Date</Label>
 <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
 </div>
 <div className="space-y-2">
 <Label>Mode</Label>
 <Select value={mode} onValueChange={setMode}>
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="Online">Online</SelectItem>
 <SelectItem value="Offline">Offline</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label>Team Name</Label>
 <Input value={teamName} onChange={(e) => setTeamName(e.target.value)} />
 </div>
 <div className="space-y-2">
 <Label>Your Role</Label>
 <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Frontend, Backend, etc." />
 </div>
 </div>
 <div className="space-y-2">
 <Label>Problem Statement</Label>
 <Textarea value={problemStatement} onChange={(e) => setProblemStatement(e.target.value)} required />
 </div>
 <div className="space-y-2">
 <Label>Solution Summary</Label>
 <Textarea value={solution} onChange={(e) => setSolution(e.target.value)} />
 </div>
 <div className="space-y-2">
 <Label>Tech Stack (comma separated)</Label>
 <Input value={techStack} onChange={(e) => setTechStack(e.target.value)} />
 </div>
 <div className="space-y-2">
 <Label>Result / Position</Label>
 <Select value={position} onValueChange={setPosition}>
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="Participant">Participant</SelectItem>
 <SelectItem value="Winner">Winner (1st)</SelectItem>
 <SelectItem value="Runner-up">Runner-up (2nd/3rd)</SelectItem>
 <SelectItem value="Finalist">Finalist</SelectItem>
 <SelectItem value="Top 10">Top 10</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <DialogFooter>
 <Button type="submit" disabled={submitting}>
 {submitting ?"Saving..." :"Save Entry"}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>


 </section>

 {loading ? (
 <LoadingGrid items={6} />
 ) : hackathons.length === 0 ? (
 <EnhancedEmpty
 icon={Trophy}
 title="No hackathons logged"
 description="Add your hackathon experiences to showcase your competitive coding and teamwork."
 action={{ label:"Log Hackathon", onClick: () => setAddOpen(true) }}
 variant="illustrated"
 />
 ) : (
 <section className="space-y-5">
 {hackathons.map((h) => (
 <Card
 key={h.id}
 className="border-2 transition-all duration-300 hover:border-brown-800/30 hover:shadow-lg hover:shadow-primary/5 overflow-hidden"
 >
 <CardHeader className="pb-3">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
 <div className="min-w-0 flex-1">
 <div className="flex flex-wrap items-center gap-2">
 <CardTitle className="text-xl leading-tight">{h.name}</CardTitle>
 {h.position && h.position !=="Participant" && (
 <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
 <Trophy className="h-3 w-3" />
 {h.position}
 </span>
 )}
 </div>
 <CardDescription className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
 <span className="flex items-center gap-1">
 <Calendar className="h-3.5 w-3.5 shrink-0" />
 {format(new Date(h.date),"PPP")}
 </span>
 <span className="flex items-center gap-1">
 <Users className="h-3.5 w-3.5 shrink-0" />
 {h.organizer}
 </span>
 <span className="rounded bg-muted px-1.5 py-0.5 text-xs">{h.mode}</span>
 </CardDescription>
 </div>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleDelete(h.id)}
 className="text-destructive hover:bg-destructive/10 shrink-0"
 >
 Delete
 </Button>
 </div>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="grid gap-4 md:grid-cols-2">
 <div>
 <h4 className="text-sm font-semibold mb-1.5">Problem</h4>
 <p className="text-sm text-muted-foreground line-clamp-3">{h.problemStatement}</p>
 </div>
 <div className="space-y-3">
 {h.teamName && (
 <div>
 <h4 className="text-sm font-semibold">Team: {h.teamName}</h4>
 <p className="text-xs text-muted-foreground">Role: {h.role ||"Member"}</p>
 </div>
 )}
 {h.techStack?.length > 0 && (
 <div>
 <h4 className="text-sm font-semibold mb-1.5">Tech</h4>
 <div className="flex flex-wrap gap-1.5">
 {h.techStack.map((t) => (
 <Badge key={t} variant="secondary" className="text-xs font-normal">
 {t}
 </Badge>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>
 </CardContent>
 </Card>
 ))}
 </section>
 )}
 </div>
 );
}
