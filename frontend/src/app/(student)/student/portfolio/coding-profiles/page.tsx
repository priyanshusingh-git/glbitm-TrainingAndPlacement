"use client";

import { useState, useEffect } from"react";
import { Button } from"@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from"@/components/ui/card";
import { Plus, RefreshCw, ExternalLink, Code } from"lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from"@/components/ui/dialog";
import { Label } from"@/components/ui/label";
import { Input } from"@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from"@/components/ui/select";
import { Badge } from"@/components/ui/badge";
import { api } from"@/lib/api";
import { useToast } from"@/hooks/use-toast";
import { LoadingGrid } from"@/components/ui/loading-states";
import { Progress } from"@/components/ui/progress";
import { EnhancedEmpty } from"@/components/ui/enhanced-empty";

const PLATFORMS = [
"LeetCode","CodeChef","Codeforces","HackerRank","GeeksforGeeks",
"AtCoder","InterviewBit","CodingNinjas","TopCoder","Other"
];

interface CodingProfile {
 id: string;
 platform: string;
 username: string;
 profileUrl?: string;
 statsJSON: string;
 isPrimary: boolean;
 monthlyGoal: number;
 lastFetched: string;
}

export default function CodingProfilesPage() {
 const [profiles, setProfiles] = useState<CodingProfile[]>([]);
 const [loading, setLoading] = useState(true);
 const [addOpen, setAddOpen] = useState(false);
 const { toast } = useToast();

 // Form states
 const [platform, setPlatform] = useState("");
 const [username, setUsername] = useState("");
 const [profileUrl, setProfileUrl] = useState("");
 const [monthlyGoal, setMonthlyGoal] = useState("0");
 const [submitting, setSubmitting] = useState(false);

 const fetchProfiles = async () => {
 try {
 setLoading(true);
 const data = await api.get("/portfolio/coding-profiles");
 setProfiles(Array.isArray(data) ? data : []);
 } catch (error) {
 console.error(error);
 toast({ title:"Error", description:"Failed to load profiles", variant:"destructive" });
 setProfiles([]);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchProfiles();
 }, []);

 const handleAdd = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!platform || !username) {
 toast({ title:"Error", description:"Platform and Username are required", variant:"destructive" });
 return;
 }

 const tempId = `temp-${Date.now()}`;
 const newProfile: CodingProfile = {
 id: tempId,
 platform,
 username,
 profileUrl,
 statsJSON:"{}",
 isPrimary: false,
 monthlyGoal: parseInt(monthlyGoal),
 lastFetched: new Date().toISOString()
 };

 // 1. Optimistic Update
 setProfiles(prev => [newProfile, ...prev]);
 setAddOpen(false);
 resetForm();

 try {
 // 2. Background Sync
 const res = await api.post("/portfolio/coding-profiles", {
 platform,
 username,
 profileUrl,
 monthlyGoal: parseInt(monthlyGoal)
 });

 // 3. Reconcile
 setProfiles(prev => prev.map(p => p.id === tempId ? res : p));
 toast({ title:"Success", description:"Profile added successfully" });
 } catch (error: any) {
 // 4. Rollback
 setProfiles(prev => prev.filter(p => p.id !== tempId));
 toast({ title:"Error", description: error.response?.data?.error ||"Failed to add profile", variant:"destructive" });
 }
 };

 const handleDelete = async (id: string) => {
 const previousProfiles = [...profiles];
 setProfiles(prev => prev.filter(p => p.id !== id));

 try {
 await api.delete(`/portfolio/coding-profiles/${id}`);
 toast({ title:"Success", description:"Profile deleted" });
 } catch (error: any) {
 if (error.message?.includes("not found")) return;
 setProfiles(previousProfiles);
 toast({ title:"Error", description:"Failed to delete profile", variant:"destructive" });
 }
 };

 const resetForm = () => {
 setPlatform("");
 setUsername("");
 setProfileUrl("");
 setMonthlyGoal("0");
 };

 return (
 <div className="space-y-8">
 <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Coding Profiles</h1>
 <p className="text-muted-foreground mt-1 text-sm sm:text-base">
 Track your coding practice across different platforms.
 </p>
 </div>
 <Dialog open={addOpen} onOpenChange={setAddOpen}>
 <DialogTrigger asChild>
 <Button className="flex items-center gap-2">
 <Plus className="h-4 w-4" /> Add Profile
 </Button>
 </DialogTrigger>
 <DialogContent>
 <DialogHeader>
 <DialogTitle>Add Coding Profile</DialogTitle>
 <DialogDescription>
 Connect a new coding platform to your portfolio.
 </DialogDescription>
 </DialogHeader>
 <form onSubmit={handleAdd} className="space-y-4 py-4">
 <div className="space-y-2">
 <Label htmlFor="platform">
 Platform
 <span className="text-destructive ml-1" aria-label="required">*</span>
 </Label>
 <Select value={platform} onValueChange={setPlatform} required>
 <SelectTrigger id="platform" aria-required="true">
 <SelectValue placeholder="Select platform" />
 </SelectTrigger>
 <SelectContent>
 {PLATFORMS.map(p => (
 <SelectItem key={p} value={p}>{p}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2">
 <Label htmlFor="username">
 Username
 <span className="text-destructive ml-1" aria-label="required">*</span>
 </Label>
 <Input
 id="username"
 value={username}
 onChange={(e) => setUsername(e.target.value)}
 placeholder="e.g. jdoe123"
 required
 aria-required="true"
 />
 </div>
 <div className="space-y-2">
 <Label>Profile URL (Optional)</Label>
 <Input value={profileUrl} onChange={(e) => setProfileUrl(e.target.value)} placeholder="https://leetcode.com/u/..." />
 </div>
 <div className="space-y-2">
 <Label>Monthly Goal (Problems)</Label>
 <Input type="number" value={monthlyGoal} onChange={(e) => setMonthlyGoal(e.target.value)} min="0" />
 </div>
 <DialogFooter>
 <Button type="submit" disabled={submitting || !platform || !username} aria-busy={submitting}>
 {submitting ? (
 <>
 <span className="mr-2">Adding...</span>
 </>
 ) : (
"Add Profile"
 )}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>


 </section>

 {loading ? (
 <LoadingGrid items={6} />
 ) : profiles.length === 0 ? (
 <EnhancedEmpty
 icon={Code}
 title="No profiles connected"
 description="Connect your coding accounts to track your progress and showcase your problem-solving skills."
 action={{
 label:"Connect Platform",
 onClick: () => setAddOpen(true)
 }}
 variant="illustrated"
 />
 ) : (
 <section className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
 {profiles.map((profile) => {
 let stats = { totalSolved: 0, easy: 0, medium: 0, hard: 0, rating: 0 };
 try {
 stats = typeof profile.statsJSON ==="string" ? JSON.parse(profile.statsJSON ||"{}") : profile.statsJSON;
 } catch {
 // keep defaults
 }
 const total = stats.totalSolved || 0;
 const goal = profile.monthlyGoal || 0;
 const progress = goal > 0 ? Math.min(100, Math.round((total / goal) * 100)) : 0;
 return (
 <Card
 key={profile.id}
 className="flex flex-col border-2 transition-all duration-300 hover:border-brown-800/30 hover:shadow-lg hover:shadow-primary/5"
 >
 <CardHeader className="pb-3">
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0 flex-1">
 <CardTitle className="text-lg sm:text-xl truncate">{profile.platform}</CardTitle>
 <CardDescription className="truncate">@{profile.username}</CardDescription>
 </div>
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brown-800/10">
 <Code className="h-5 w-5 text-brown-800" />
 </div>
 </div>
 </CardHeader>
 <CardContent className="flex-1 space-y-4">
 <div className="grid grid-cols-2 gap-4">
 <div className="rounded-lg bg-muted/50 p-3">
 <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Solved</p>
 <p className="text-2xl font-bold tabular-nums">{total}</p>
 </div>
 <div className="rounded-lg bg-muted/50 p-3">
 <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Monthly goal</p>
 <p className="text-2xl font-bold text-muted-foreground tabular-nums">{goal}</p>
 </div>
 </div>
 {goal > 0 && (
 <div className="space-y-1.5">
 <div className="flex justify-between text-xs text-muted-foreground">
 <span>Progress</span>
 <span>{progress}%</span>
 </div>
 <Progress value={progress} className="h-2" />
 </div>
 )}
 <div className="flex flex-wrap gap-2 text-sm">
 <span className="rounded bg-green-500/15 px-2 py-0.5 font-medium text-green-700">Easy {stats.easy || 0}</span>
 <span className="rounded bg-amber-500/15 px-2 py-0.5 font-medium text-amber-700">Med {stats.medium || 0}</span>
 <span className="rounded bg-red-500/15 px-2 py-0.5 font-medium text-red-700">Hard {stats.hard || 0}</span>
 </div>
 </CardContent>
 <CardFooter className="border-t bg-muted/30 px-4 py-3 flex items-center justify-between gap-2">
 <div className="flex gap-1">
 <Button variant="outline" size="icon" className="h-8 w-8" title="Refresh Stats" disabled>
 <RefreshCw className="h-4 w-4" />
 </Button>
 {profile.profileUrl && (
 <Button variant="outline" size="icon" className="h-8 w-8" asChild title="View Profile">
 <a href={profile.profileUrl} target="_blank" rel="noreferrer" aria-label={`View ${profile.platform} profile`}>
 <ExternalLink className="h-4 w-4" />
 </a>
 </Button>
 )}
 </div>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleDelete(profile.id)}
 className="text-destructive hover:bg-destructive/10"
 >
 Remove
 </Button>
 </CardFooter>
 </Card>
 );
 })}
 </section>
 )}
 </div>
 );
}
