"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Plus,
  Github,
  ExternalLink,
  Star,
  FolderGit2,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  Layers,
  Globe,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TagInput } from "@/components/ui/tag-input";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { LoadingGrid } from "@/components/ui/loading-states";
import { EnhancedEmpty } from "@/components/ui/enhanced-empty";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";

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

const COMMON_TECH_STACKS = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "Python",
  "Tailwind CSS",
  "PostgreSQL",
  "MongoDB",
  "Docker",
  "AWS",
  "GraphQL",
  "Express.js",
  "Prisma",
  "FastAPI",
  "Redis",
];

const STATUS_OPTIONS = [
  {
    value: "Completed",
    label: "Completed",
    icon: CheckCircle2,
    colorClass: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
  },
  {
    value: "In Progress",
    label: "In Progress",
    icon: Clock,
    colorClass: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
  },
  {
    value: "Planned",
    label: "Planned",
    icon: Calendar,
    colorClass: "bg-muted text-muted-foreground border-border",
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const { toast } = useToast();

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStackTags, setTechStackTags] = useState<string[]>([]);
  const [githubLink, setGithubLink] = useState("");
  const [liveLink, setLiveLink] = useState("");
  const [status, setStatus] = useState("In Progress");
  const [featured, setFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await api.get("/portfolio/projects");
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load projects", variant: "destructive" });
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openAddDialog = () => {
    setEditingProject(null);
    setTitle("");
    setDescription("");
    setTechStackTags([]);
    setGithubLink("");
    setLiveLink("");
    setStatus("In Progress");
    setFeatured(false);
    setIsDialogOpen(true);
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setTitle(project.title);
    setDescription(project.description);
    setTechStackTags(Array.isArray(project.techStack) ? project.techStack : []);
    setGithubLink(project.githubLink || "");
    setLiveLink(project.liveLink || "");
    setStatus(project.status || "In Progress");
    setFeatured(project.featured || false);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({ title: "Validation Error", description: "Project title is required", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    if (editingProject) {
      // ─── EDIT FLOW ──────────────────────────────────────────────────────────
      const updatedData: Project = {
        ...editingProject,
        title: title.trim(),
        description: description.trim(),
        techStack: techStackTags,
        githubLink: githubLink.trim() || undefined,
        liveLink: liveLink.trim() || undefined,
        status,
        featured,
      };

      const prevProjects = [...projects];
      setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? updatedData : p)));
      setIsDialogOpen(false);

      try {
        const res = await api.put(`/portfolio/projects/${editingProject.id}`, {
          title: updatedData.title,
          description: updatedData.description,
          techStack: updatedData.techStack,
          githubLink: updatedData.githubLink,
          liveLink: updatedData.liveLink,
          status: updatedData.status,
          featured: updatedData.featured,
        });
        setProjects((prev) => prev.map((p) => (p.id === editingProject.id ? res : p)));
        toast({ title: "Success", description: "Project updated successfully" });
      } catch (error) {
        setProjects(prevProjects);
        toast({ title: "Error", description: "Failed to update project", variant: "destructive" });
      } finally {
        setSubmitting(false);
      }
    } else {
      // ─── ADD FLOW ───────────────────────────────────────────────────────────
      const tempId = `temp-${Date.now()}`;
      const newProject: Project = {
        id: tempId,
        title: title.trim(),
        description: description.trim(),
        techStack: techStackTags,
        githubLink: githubLink.trim() || undefined,
        liveLink: liveLink.trim() || undefined,
        status,
        featured,
      };

      setProjects((prev) => [newProject, ...prev]);
      setIsDialogOpen(false);

      try {
        const res = await api.post("/portfolio/projects", {
          title: newProject.title,
          description: newProject.description,
          techStack: newProject.techStack,
          githubLink: newProject.githubLink,
          liveLink: newProject.liveLink,
          status: newProject.status,
          featured: newProject.featured,
        });
        setProjects((prev) => prev.map((p) => (p.id === tempId ? res : p)));
        toast({ title: "Success", description: "Project added successfully" });
      } catch (error) {
        setProjects((prev) => prev.filter((p) => p.id !== tempId));
        toast({ title: "Error", description: "Failed to add project", variant: "destructive" });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    const previousProjects = [...projects];
    setProjects((prev) => prev.filter((p) => p.id !== id));

    try {
      await api.delete(`/portfolio/projects/${id}`);
      toast({ title: "Success", description: "Project removed" });
    } catch (error: any) {
      if (error.message?.includes("not found")) return;
      setProjects(previousProjects);
      toast({ title: "Error", description: "Failed to delete project", variant: "destructive" });
    }
  };

  const getStatusBadge = (projectStatus: string) => {
    const matched = STATUS_OPTIONS.find((s) => s.value === projectStatus) || STATUS_OPTIONS[1];
    const Icon = matched.icon;
    return (
      <Badge variant="outline" className={cn("gap-1 text-xs font-semibold px-2 py-0.5 rounded-sm", matched.colorClass)}>
        <Icon className="h-3 w-3" />
        <span>{matched.label}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-up">
      <PageHeader
        title="My Projects"
        description="Showcase your academic and personal software engineering projects."
        action={
          <Button onClick={openAddDialog} className="flex items-center gap-2 shadow-sm font-semibold cursor-pointer">
            <Plus className="h-4 w-4" /> Add Project
          </Button>
        }
      />

      {/* ─── ADD / EDIT PROJECT DIALOG ────────────────────────────────────── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto p-0 gap-0 border-border/80 shadow-xl">
          <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-brown-800/10 text-brown-800 border border-brown-800/20">
                <FolderGit2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold font-display text-foreground">
                  {editingProject ? "Edit Project" : "Add New Project"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {editingProject
                    ? "Update project details, repository links, and technology stack."
                    : "Showcase your software applications, architecture, and practical engineering skills."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 1. Core Project Information */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
                  <span>
                    Project Title <span className="text-destructive">*</span>
                  </span>
                  <span className="text-[11px] font-normal text-muted-foreground font-mono">
                    {title.length}/100
                  </span>
                </Label>
                <Input
                  value={title}
                  maxLength={100}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Distributed Task Queue & Orchestrator"
                  className="h-10 rounded-sm bg-card border-border/80 focus-visible:ring-amber-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
                  <span>
                    Description & Overview <span className="text-destructive">*</span>
                  </span>
                  <span className="text-[11px] font-normal text-muted-foreground font-mono">
                    {description.length}/500
                  </span>
                </Label>
                <Textarea
                  value={description}
                  maxLength={500}
                  rows={3}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Describe the architectural challenges solved, core features, and real-world impact..."
                  className="rounded-sm bg-card border-border/80 resize-none text-sm leading-relaxed focus-visible:ring-amber-500/20"
                />
              </div>
            </div>

            {/* 2. Technology Stack Tags */}
            <div className="space-y-2 rounded-md border border-border/60 bg-muted/20 p-4">
              <Label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-brown-800" />
                <span>Technologies & Frameworks</span>
              </Label>
              <TagInput
                tags={techStackTags}
                onChange={setTechStackTags}
                suggestions={COMMON_TECH_STACKS}
                placeholder="Type tech name and hit Enter (e.g. React, Docker)..."
              />
            </div>

            {/* 3. External Links */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Repository & Deployment Links
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-1">
                    <Github className="h-3.5 w-3.5 text-foreground" /> GitHub Repository
                  </span>
                  <Input
                    type="url"
                    value={githubLink}
                    onChange={(e) => setGithubLink(e.target.value)}
                    placeholder="https://github.com/user/repo"
                    className="h-9 rounded-sm bg-card text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-1">
                    <Globe className="h-3.5 w-3.5 text-amber-600" /> Live Demo URL
                  </span>
                  <Input
                    type="url"
                    value={liveLink}
                    onChange={(e) => setLiveLink(e.target.value)}
                    placeholder="https://my-app.vercel.app"
                    className="h-9 rounded-sm bg-card text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 4. Status Selection */}
            <div className="space-y-2 pt-1 border-t border-border/50">
              <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Project Status
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {STATUS_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = status === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setStatus(opt.value)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1.5 rounded-sm border p-2.5 text-xs font-semibold transition-all cursor-pointer",
                        isSelected
                          ? "border-brown-800 bg-brown-800/10 text-brown-900 shadow-xs ring-1 ring-brown-800"
                          : "border-border/70 bg-card text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isSelected ? "text-brown-800" : "text-muted-foreground")} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border/50 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={submitting}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="min-w-[120px] font-semibold cursor-pointer"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </span>
                ) : editingProject ? (
                  "Save Changes"
                ) : (
                  "Publish Project"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── PROJECTS LIST VIEW ───────────────────────────────────────────── */}
      {loading ? (
        <LoadingGrid items={6} />
      ) : projects.length === 0 ? (
        <EnhancedEmpty
          icon={FolderGit2}
          title="No projects yet"
          description="Add projects to demonstrate your practical skills and showcase your work to potential employers."
          action={{
            label: "Add Project",
            onClick: openAddDialog,
          }}
          variant="illustrated"
          className="mt-6 md:mt-8"
        />
      ) : (
        <section className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="group flex flex-col relative overflow-hidden border border-border/60 bg-card transition-all duration-300 hover:border-brown-800/30 hover:shadow-lg hover:shadow-primary/5"
            >
              {project.featured && (
                <div className="absolute top-3 right-3 z-10 rounded-full bg-amber-500/10 p-1.5 border border-amber-500/20" title="Featured Project">
                  <Star className="h-4 w-4 text-amber-600 fill-amber-500" />
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3 pr-6">
                  <div>
                    <CardTitle className="text-lg font-bold font-display leading-tight line-clamp-2 text-foreground" title={project.title}>
                      {project.title}
                    </CardTitle>
                    <div className="mt-2">{getStatusBadge(project.status)}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4 pb-4">
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {project.description}
                </p>
                {project.techStack?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.techStack.map((tech) => (
                      <Badge
                        key={tech}
                        variant="secondary"
                        className="bg-brown-800/5 text-brown-900 border border-brown-800/15 text-[11px] font-medium px-2 py-0.5 rounded-xs"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-border/50 bg-muted/20 px-4 py-3 flex items-center justify-between gap-2">
                <div className="flex gap-1.5">
                  {project.githubLink && (
                    <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 hover:border-brown-800/40" asChild>
                      <a href={project.githubLink} target="_blank" rel="noreferrer" aria-label="Open GitHub">
                        <Github className="h-4 w-4 text-foreground" />
                      </a>
                    </Button>
                  )}
                  {project.liveLink && (
                    <Button variant="outline" size="icon" className="h-8 w-8 shrink-0 hover:border-amber-500/40" asChild>
                      <a href={project.liveLink} target="_blank" rel="noreferrer" aria-label="Open live demo">
                        <ExternalLink className="h-4 w-4 text-amber-600" />
                      </a>
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(project)}
                    className="h-8 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(project.id)}
                    className="h-8 text-xs font-semibold text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
