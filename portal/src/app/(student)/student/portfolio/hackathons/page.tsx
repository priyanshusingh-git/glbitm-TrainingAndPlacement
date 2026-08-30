"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trophy,
  Calendar,
  Users,
  Award,
  Edit2,
  Trash2,
  Globe,
  MapPin,
  Sparkles,
  Layers,
  Flame,
  Code2,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { LoadingGrid } from "@/components/ui/loading-states";
import { EnhancedEmpty } from "@/components/ui/enhanced-empty";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";

interface Hackathon {
  id: string;
  name: string;
  organizer: string;
  date: string;
  mode: string;
  teamName?: string;
  role?: string;
  problemStatement: string;
  solution?: string;
  position?: string;
  techStack: string[];
}

const POSITION_OPTIONS = [
  { value: "Winner", label: "Winner (1st)", emoji: "🏆", colorClass: "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-300 ring-1 ring-amber-500" },
  { value: "Runner-up", label: "Runner-Up", emoji: "🥈", colorClass: "border-slate-400 bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-200 ring-1 ring-slate-400" },
  { value: "Top 10", label: "Top 10", emoji: "🎖️", colorClass: "border-brown-800 bg-brown-800/10 text-brown-900 ring-1 ring-brown-800" },
  { value: "Finalist", label: "Finalist", emoji: "⭐", colorClass: "border-blue-500 bg-blue-500/10 text-blue-900 dark:text-blue-300 ring-1 ring-blue-500" },
  { value: "Participant", label: "Participant", emoji: "🚀", colorClass: "border-border bg-card text-muted-foreground" },
];

const COMMON_HACKATHON_STACKS = [
  "React",
  "Next.js",
  "TypeScript",
  "Python",
  "FastAPI",
  "Node.js",
  "Tailwind CSS",
  "OpenAI API",
  "TensorFlow",
  "Flutter",
  "PostgreSQL",
  "MongoDB",
  "Firebase",
  "Solidity",
];

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState<Hackathon | null>(null);
  const { toast } = useToast();

  // Form State
  const [name, setName] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [date, setDate] = useState("");
  const [mode, setMode] = useState("Online");
  const [teamName, setTeamName] = useState("");
  const [role, setRole] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [solution, setSolution] = useState("");
  const [techStackTags, setTechStackTags] = useState<string[]>([]);
  const [position, setPosition] = useState("Participant");
  const [submitting, setSubmitting] = useState(false);

  const fetchHackathons = async (silent = false) => {
    try {
      if (!silent && hackathons.length === 0) setLoading(true);
      const data = await api.get("/portfolio/hackathons");
      setHackathons(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load hackathons", variant: "destructive" });
      setHackathons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  const openAddDialog = () => {
    setEditingHackathon(null);
    setName("");
    setOrganizer("");
    setDate(new Date().toISOString().split("T")[0]);
    setMode("Online");
    setTeamName("");
    setRole("");
    setProblemStatement("");
    setSolution("");
    setTechStackTags([]);
    setPosition("Participant");
    setIsDialogOpen(true);
  };

  const openEditDialog = (h: Hackathon) => {
    setEditingHackathon(h);
    setName(h.name);
    setOrganizer(h.organizer);
    setDate(h.date ? new Date(h.date).toISOString().split("T")[0] : "");
    setMode(h.mode || "Online");
    setTeamName(h.teamName || "");
    setRole(h.role || "");
    setProblemStatement(h.problemStatement || "");
    setSolution(h.solution || "");
    setTechStackTags(Array.isArray(h.techStack) ? h.techStack : []);
    setPosition(h.position || "Participant");
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !organizer.trim() || !problemStatement.trim()) {
      toast({
        title: "Validation Error",
        description: "Hackathon Name, Organizer, and Problem Statement are required",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    if (editingHackathon) {
      // ─── EDIT FLOW ──────────────────────────────────────────────────────────
      const updatedData: Hackathon = {
        ...editingHackathon,
        name: name.trim(),
        organizer: organizer.trim(),
        date: date || new Date().toISOString(),
        mode,
        teamName: teamName.trim() || undefined,
        role: role.trim() || undefined,
        problemStatement: problemStatement.trim(),
        solution: solution.trim() || undefined,
        position,
        techStack: techStackTags,
      };

      const prevHackathons = [...hackathons];
      setHackathons((prev) => prev.map((h) => (h.id === editingHackathon.id ? updatedData : h)));
      setIsDialogOpen(false);

      try {
        const res = await api.put(`/portfolio/hackathons/${editingHackathon.id}`, {
          name: updatedData.name,
          organizer: updatedData.organizer,
          date: updatedData.date,
          mode: updatedData.mode,
          teamName: updatedData.teamName,
          role: updatedData.role,
          problemStatement: updatedData.problemStatement,
          solution: updatedData.solution,
          position: updatedData.position,
          techStack: updatedData.techStack,
        });
        setHackathons((prev) => prev.map((h) => (h.id === editingHackathon.id ? res : h)));
        toast({ title: "Success", description: "Hackathon entry updated successfully" });
      } catch (error) {
        setHackathons(prevHackathons);
        toast({ title: "Error", description: "Failed to update hackathon", variant: "destructive" });
      } finally {
        setSubmitting(false);
      }
    } else {
      // ─── ADD FLOW ───────────────────────────────────────────────────────────
      const tempId = `temp-${Date.now()}`;
      const newHackathon: Hackathon = {
        id: tempId,
        name: name.trim(),
        organizer: organizer.trim(),
        date: date || new Date().toISOString(),
        mode,
        teamName: teamName.trim() || undefined,
        role: role.trim() || undefined,
        problemStatement: problemStatement.trim(),
        solution: solution.trim() || undefined,
        position,
        techStack: techStackTags,
      };

      setHackathons((prev) => [newHackathon, ...prev]);
      setIsDialogOpen(false);

      try {
        const res = await api.post("/portfolio/hackathons", {
          name: newHackathon.name,
          organizer: newHackathon.organizer,
          date: newHackathon.date,
          mode: newHackathon.mode,
          teamName: newHackathon.teamName,
          role: newHackathon.role,
          problemStatement: newHackathon.problemStatement,
          solution: newHackathon.solution,
          position: newHackathon.position,
          techStack: newHackathon.techStack,
        });
        setHackathons((prev) => prev.map((h) => (h.id === tempId ? res : h)));
        toast({ title: "Success", description: "Hackathon logged successfully" });
      } catch (error) {
        setHackathons((prev) => prev.filter((h) => h.id !== tempId));
        toast({ title: "Error", description: "Failed to log hackathon", variant: "destructive" });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    const previousHackathons = [...hackathons];
    setHackathons((prev) => prev.filter((h) => h.id !== id));

    try {
      await api.delete(`/portfolio/hackathons/${id}`);
      toast({ title: "Success", description: "Entry removed" });
    } catch (error: any) {
      if (error.message?.includes("not found")) return;
      setHackathons(previousHackathons);
      toast({ title: "Error", description: "Failed to delete entry", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-up">
      <PageHeader
        title="Hackathons"
        description="Document your participation and achievements in hackathons."
        action={
          <Button onClick={openAddDialog} className="flex items-center gap-2 shadow-sm font-semibold cursor-pointer">
            <Plus className="h-4 w-4" /> Log Hackathon
          </Button>
        }
      />

      {/* ─── ADD / EDIT HACKATHON DIALOG ──────────────────────────────────── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto p-0 gap-0 border-border/80 shadow-xl">
          <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-500/10 text-amber-700 border border-amber-500/20">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold font-display text-foreground">
                  {editingHackathon ? "Edit Hackathon" : "Log Hackathon"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {editingHackathon
                    ? "Update event participation details, problem statement, and outcomes."
                    : "Showcase your competitive building, hackathon milestones, and teamwork."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 1. Event Name & Organizer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Hackathon Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Smart India Hackathon 2025"
                  className="h-10 rounded-sm bg-card border-border/80"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Organizer / Host <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  required
                  placeholder="e.g. AICTE, Devfolio, MLH"
                  className="h-10 rounded-sm bg-card border-border/80"
                />
              </div>
            </div>

            {/* 2. Date & Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Date of Event <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="h-10 rounded-sm bg-card border-border/80"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Event Mode
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {["Online", "Offline"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 h-10 rounded-sm border text-xs font-semibold transition-all cursor-pointer",
                        mode === m
                          ? "border-brown-800 bg-brown-800/10 text-brown-900 ring-1 ring-brown-800"
                          : "border-border/70 bg-card text-muted-foreground hover:bg-muted/40"
                      )}
                    >
                      {m === "Online" ? <Globe className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                      <span>{m}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Team & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Team Name
                </Label>
                <Input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Binary Beasts (Team of 4)"
                  className="h-10 rounded-sm bg-card border-border/80"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Your Role & Contribution
                </Label>
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Lead Backend Engineer & Architect"
                  className="h-10 rounded-sm bg-card border-border/80"
                />
              </div>
            </div>

            {/* 4. Problem & Solution */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Problem Statement <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  value={problemStatement}
                  rows={2}
                  onChange={(e) => setProblemStatement(e.target.value)}
                  required
                  placeholder="Briefly state the challenge or prompt presented in the hackathon..."
                  className="rounded-sm bg-card border-border/80 resize-none text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Solution Built
                </Label>
                <Textarea
                  value={solution}
                  rows={2}
                  onChange={(e) => setSolution(e.target.value)}
                  placeholder="Explain the prototype or system architecture your team delivered within the time limit..."
                  className="rounded-sm bg-card border-border/80 resize-none text-sm"
                />
              </div>
            </div>

            {/* 5. Result / Position Selector */}
            <div className="space-y-2 pt-1 border-t border-border/50">
              <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Achievement / Standing
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {POSITION_OPTIONS.map((opt) => {
                  const isSelected = position === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPosition(opt.value)}
                      className={cn(
                        "flex items-center gap-2 rounded-sm border p-2.5 text-xs font-semibold transition-all cursor-pointer",
                        isSelected
                          ? opt.colorClass
                          : "border-border/70 bg-card text-muted-foreground hover:bg-muted/40"
                      )}
                    >
                      <span className="text-base">{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Tech Stack Tag Input */}
            <div className="space-y-2 rounded-md border border-border/60 bg-muted/20 p-4">
              <Label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-brown-800" />
                <span>Tech Stack Used</span>
              </Label>
              <TagInput
                tags={techStackTags}
                onChange={setTechStackTags}
                suggestions={COMMON_HACKATHON_STACKS}
                placeholder="Type tech name and hit Enter (e.g. Next.js, OpenAI)..."
              />
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
                ) : editingHackathon ? (
                  "Save Changes"
                ) : (
                  "Log Hackathon"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── HACKATHONS LIST VIEW ─────────────────────────────────────────── */}
      {loading ? (
        <LoadingGrid items={6} />
      ) : hackathons.length === 0 ? (
        <EnhancedEmpty
          icon={Trophy}
          title="No hackathons logged"
          description="Add your hackathon experiences to showcase your competitive coding and teamwork."
          action={{
            label: "Log Hackathon",
            onClick: openAddDialog,
          }}
          variant="illustrated"
          className="mt-6 md:mt-8"
        />
      ) : (
        <section className="space-y-5">
          {hackathons.map((h) => {
            const matchedPos = POSITION_OPTIONS.find((p) => p.value === h.position);
            return (
              <Card
                key={h.id}
                className="border border-border/60 bg-card transition-all duration-300 hover:border-brown-800/30 hover:shadow-lg hover:shadow-primary/5 overflow-hidden"
              >
                <CardHeader className="pb-3 bg-muted/10 border-b border-border/40">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-xl font-bold font-display text-foreground leading-tight">
                          {h.name}
                        </CardTitle>
                        {matchedPos && h.position !== "Participant" && (
                          <Badge variant="outline" className={cn("gap-1 font-semibold text-xs py-0.5", matchedPos.colorClass)}>
                            <span>{matchedPos.emoji}</span>
                            <span>{matchedPos.label}</span>
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          {h.date ? format(new Date(h.date), "MMMM yyyy") : "N/A"}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-brown-800">
                          <Award className="h-3.5 w-3.5 shrink-0" />
                          {h.organizer}
                        </span>
                        <span className="flex items-center gap-1">
                          {h.mode === "Online" ? <Globe className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                          {h.mode}
                        </span>
                        {h.teamName && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {h.teamName} {h.role ? `(${h.role})` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Problem Statement
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {h.problemStatement}
                      </p>
                    </div>
                    {h.solution && (
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                          Solution Prototype
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {h.solution}
                        </p>
                      </div>
                    )}
                  </div>

                  {h.techStack?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {h.techStack.map((tech) => (
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
                <CardFooter className="border-t border-border/50 bg-muted/20 px-4 py-2.5 flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(h)}
                    className="h-8 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(h.id)}
                    className="h-8 text-xs font-semibold text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
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
