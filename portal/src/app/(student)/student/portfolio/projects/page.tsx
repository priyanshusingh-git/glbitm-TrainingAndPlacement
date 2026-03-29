"use client";

import { useState, useEffect } from"react";
import { Button } from"@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from"@/components/ui/card";
import { Plus, Github, ExternalLink, Star, FolderGit2 } from"lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from"@/components/ui/dialog";
import { Label } from"@/components/ui/label";
import { Input } from"@/components/ui/input";
import { Textarea } from"@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from"@/components/ui/select";
import { Badge } from"@/components/ui/badge";
import { api } from"@/lib/api";
import { useToast } from"@/hooks/use-toast";
import { LoadingGrid, LoadingSpinner } from"@/components/ui/loading-states";
import { EnhancedEmpty } from"@/components/ui/enhanced-empty";

interface Project {
 id: string;
 title: string;
 description: string;
 techStack: string[];
 githubLink?: string;
 liveLink?: string;
 status: string;
 featured: boolean;
}

export default function ProjectsPage() {
 const [projects, setProjects] = useState<Project[]>([]);
 const [loading, setLoading] = useState(true);
 const [addOpen, setAddOpen] = useState(false);
 const { toast } = useToast();

 // Form
 const [title, setTitle] = useState("");
 const [description, setDescription] = useState("");
 const [techStack, setTechStack] = useState("");
 const [githubLink, setGithubLink] = useState("");
 const [liveLink, setLiveLink] = useState("");
 const [status, setStatus] = useState("In Progress");
 const [submitting, setSubmitting] = useState(false);

 const fetchProjects = async () => {
 try {
 setLoading(true);
 const data = await api.get("/portfolio/projects");
 setProjects(Array.isArray(data) ? data : []);
 } catch (error) {
 toast({ title:"Error", description:"Failed to load projects", variant:"destructive" });
 setProjects([]);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchProjects();
 }, []);

 const handleAdd = async (e: React.FormEvent) => {
 e.preventDefault();

 // 1. Prepare Optimistic Data
 const stackArray = techStack.split(",").map(s => s.trim()).filter(Boolean);
 const tempId = `temp-${Date.now()}`;
 const newProject: Project = {
 id: tempId,
 title,
 description,
 techStack: stackArray,
 githubLink,
 liveLink,
 status,
 featured: false
 };

 // 2. Optimistic Update
 setProjects(prev => [newProject, ...prev]);
 setAddOpen(false);
 resetForm();

 try {
 // 3. Background Sync
 const res = await api.post("/portfolio/projects", {
 title: newProject.title,
 description: newProject.description,
 techStack: newProject.techStack,
 githubLink: newProject.githubLink,
 liveLink: newProject.liveLink,
 status: newProject.status
 });

 // 4. Reconcile (Replace temp ID with real one)
 setProjects(prev => prev.map(p => p.id === tempId ? res : p));
 toast({ title:"Success", description:"Project added successfully" });
 } catch (error) {
 // 5. Rollback
 setProjects(prev => prev.filter(p => p.id !== tempId));
 toast({ title:"Error", description:"Failed to add project", variant:"destructive" });
 // Ideally restore form state here if needed, but keeping it simple for now
 }
 };

 const handleDelete = async (id: string) => {
 // Optimistic Delete
 const previousProjects = [...projects];
 setProjects(prev => prev.filter(p => p.id !== id));

 try {
 await api.delete(`/portfolio/projects/${id}`);
 toast({ title:"Success", description:"Project deleted" });
 } catch (error: any) {
 // Ignore 404
 if (error.message?.includes("not found")) return;

 // Rollback
 setProjects(previousProjects);
 toast({ title:"Error", description:"Failed to delete project", variant:"destructive" });
 }
 };

 const resetForm = () => {
 setTitle("");
 setDescription("");
 setTechStack("");
 setGithubLink("");
 setLiveLink("");
 setStatus("In Progress");
 };

 const getStatusColor = (status: string) => {
 switch (status) {
 case"Completed": return"default";
 case"In Progress": return"secondary";
 case"Planned": return"outline";
 default: return"secondary";
 }
 };

 return (
 <div className="space-y-8">
 <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Projects</h1>
 <p className="text-muted-foreground mt-1 text-sm sm:text-base">
 Showcase your academic and personal projects.
 </p>
 </div>
 <Dialog open={addOpen} onOpenChange={setAddOpen}>
 <DialogTrigger asChild>
 <Button className="flex items-center gap-2">
 <Plus className="h-4 w-4" /> Add Project
 </Button>
 </DialogTrigger>
 <DialogContent className="sm:max-w-[500px]">
 <DialogHeader>
 <DialogTitle>Add New Project</DialogTitle>
 <DialogDescription>
 Share details about what you've built.
 </DialogDescription>
 </DialogHeader>
 <form onSubmit={handleAdd} className="space-y-4 py-4">
 <div className="space-y-2">
 <Label>Project Title</Label>
 <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. E-commerce API" />
 </div>
 <div className="space-y-2">
 <Label>Description</Label>
 <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Brief description of the problem and solution..." />
 </div>
 <div className="space-y-2">
 <Label>Tech Stack (comma separated)</Label>
 <Input value={techStack} onChange={(e) => setTechStack(e.target.value)} placeholder="React, Node.js, PostgreSQL" />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label>GitHub Link</Label>
 <Input value={githubLink} onChange={(e) => setGithubLink(e.target.value)} placeholder="https://github.com/..." />
 </div>
 <div className="space-y-2">
 <Label>Live Demo Link</Label>
 <Input value={liveLink} onChange={(e) => setLiveLink(e.target.value)} placeholder="https://..." />
 </div>
 </div>
 <div className="space-y-2">
 <Label>Status</Label>
 <Select value={status} onValueChange={setStatus}>
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="Completed">Completed</SelectItem>
 <SelectItem value="In Progress">In Progress</SelectItem>
 <SelectItem value="Planned">Planned</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <DialogFooter>
 <Button type="submit" disabled={submitting} aria-busy={submitting}>
 {submitting ? (
 <>
 <span className="mr-2">Saving...</span>
 </>
 ) : (
"Save Project"
 )}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>
 </section>

 {
 loading ? (
 <LoadingGrid items={6} />
 ) : projects.length === 0 ? (
 <EnhancedEmpty
 icon={FolderGit2}
 title="No projects yet"
 description="Add projects to demonstrate your practical skills and showcase your work to potential employers."
 action={{
 label:"Add Project",
 onClick: () => setAddOpen(true)
 }}
 variant="illustrated"
 />
 ) : (
 <section className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
 {projects.map((project) => (
 <Card
 key={project.id}
 className="group flex flex-col relative overflow-hidden border-2 transition-all duration-300 hover:border-brown-800/30 hover:shadow-lg hover:shadow-primary/5"
 >
 {project.featured && (
 <div className="absolute top-3 right-3 z-10 rounded-full bg-brown-800/10 p-1.5" title="Featured">
 <Star className="h-4 w-4 text-brown-800 fill-primary" />
 </div>
 )}
 <CardHeader className="pb-2">
 <div className="pr-8">
 <CardTitle className="text-lg sm:text-xl line-clamp-2 leading-tight" title={project.title}>
 {project.title}
 </CardTitle>
 <Badge variant={getStatusColor(project.status) as any} className="mt-2 w-fit text-xs">
 {project.status}
 </Badge>
 </div>
 </CardHeader>
 <CardContent className="flex-1 space-y-4 pb-4">
 <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
 {project.description}
 </p>
 {project.techStack?.length > 0 && (
 <div className="flex flex-wrap gap-1.5">
 {project.techStack.map((tech) => (
 <Badge key={tech} variant="secondary" className="text-xs font-normal">
 {tech}
 </Badge>
 ))}
 </div>
 )}
 </CardContent>
 <CardFooter className="border-t bg-muted/30 px-4 py-3 flex items-center justify-between gap-2">
 <div className="flex gap-1">
 {project.githubLink && (
 <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" asChild>
 <a href={project.githubLink} target="_blank" rel="noreferrer" aria-label="Open GitHub">
 <Github className="h-4 w-4" />
 </a>
 </Button>
 )}
 {project.liveLink && (
 <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" asChild>
 <a href={project.liveLink} target="_blank" rel="noreferrer" aria-label="Open live demo">
 <ExternalLink className="h-4 w-4" />
 </a>
 </Button>
 )}
 </div>
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleDelete(project.id)}
 className="text-destructive hover:bg-destructive/10 shrink-0"
 >
 Delete
 </Button>
 </CardFooter>
 </Card>
 ))}
 </section>
 )
 }
 </div >
 );
}
