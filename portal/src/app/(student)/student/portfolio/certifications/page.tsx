"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Award,
  CheckCircle2,
  ExternalLink,
  Calendar,
  Building2,
  Edit2,
  Trash2,
  ShieldCheck,
  Sparkles,
  Layers,
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
import { TagInput } from "@/components/ui/tag-input";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { LoadingGrid } from "@/components/ui/loading-states";
import { EnhancedEmpty } from "@/components/ui/enhanced-empty";
import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";

interface Certification {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
  isVerified: boolean;
  skills: string[];
}

const COMMON_ISSUERS = [
  "Amazon Web Services (AWS)",
  "Google Cloud",
  "Microsoft Azure",
  "Meta",
  "Oracle",
  "Cisco",
  "IBM",
  "Coursera",
  "Linux Foundation",
  "HackerRank",
];

const COMMON_SKILLS = [
  "Cloud Architecture",
  "Cybersecurity",
  "DevOps",
  "Machine Learning",
  "Data Analytics",
  "System Design",
  "Kubernetes",
  "Docker",
  "Python",
  "Java",
  "Networking",
];

export default function CertificationsPage() {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);
  const { toast } = useToast();

  // Form State
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");
  const [skillTags, setSkillTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchCerts = async () => {
    try {
      setLoading(true);
      const data = await api.get("/portfolio/certifications");
      setCerts(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load certifications", variant: "destructive" });
      setCerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const openAddDialog = () => {
    setEditingCert(null);
    setTitle("");
    setIssuer("");
    setIssueDate(new Date().toISOString().split("T")[0]);
    setCredentialUrl("");
    setSkillTags([]);
    setIsDialogOpen(true);
  };

  const openEditDialog = (cert: Certification) => {
    setEditingCert(cert);
    setTitle(cert.title);
    setIssuer(cert.issuer);
    setIssueDate(cert.issueDate ? new Date(cert.issueDate).toISOString().split("T")[0] : "");
    setCredentialUrl(cert.credentialUrl || "");
    setSkillTags(Array.isArray(cert.skills) ? cert.skills : []);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !issuer.trim()) {
      toast({ title: "Validation Error", description: "Title and Issuing Organization are required", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    if (editingCert) {
      // ─── EDIT FLOW ──────────────────────────────────────────────────────────
      const updatedData: Certification = {
        ...editingCert,
        title: title.trim(),
        issuer: issuer.trim(),
        issueDate: issueDate || new Date().toISOString(),
        credentialUrl: credentialUrl.trim() || undefined,
        skills: skillTags,
      };

      const prevCerts = [...certs];
      setCerts((prev) => prev.map((c) => (c.id === editingCert.id ? updatedData : c)));
      setIsDialogOpen(false);

      try {
        const res = await api.put(`/portfolio/certifications/${editingCert.id}`, {
          title: updatedData.title,
          issuer: updatedData.issuer,
          issueDate: updatedData.issueDate,
          credentialUrl: updatedData.credentialUrl,
          skills: updatedData.skills,
        });
        setCerts((prev) => prev.map((c) => (c.id === editingCert.id ? res : c)));
        toast({ title: "Success", description: "Certification updated successfully" });
      } catch (error) {
        setCerts(prevCerts);
        toast({ title: "Error", description: "Failed to update certification", variant: "destructive" });
      } finally {
        setSubmitting(false);
      }
    } else {
      // ─── ADD FLOW ───────────────────────────────────────────────────────────
      const tempId = `temp-${Date.now()}`;
      const newCert: Certification = {
        id: tempId,
        title: title.trim(),
        issuer: issuer.trim(),
        issueDate: issueDate || new Date().toISOString(),
        credentialUrl: credentialUrl.trim() || undefined,
        skills: skillTags,
        isVerified: false,
      };

      setCerts((prev) => [newCert, ...prev]);
      setIsDialogOpen(false);

      try {
        const res = await api.post("/portfolio/certifications", {
          title: newCert.title,
          issuer: newCert.issuer,
          issueDate: newCert.issueDate,
          credentialUrl: newCert.credentialUrl,
          skills: newCert.skills,
        });
        setCerts((prev) => prev.map((c) => (c.id === tempId ? res : c)));
        toast({ title: "Success", description: "Certification added successfully" });
      } catch (error) {
        setCerts((prev) => prev.filter((c) => c.id !== tempId));
        toast({ title: "Error", description: "Failed to add certification", variant: "destructive" });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    const previousCerts = [...certs];
    setCerts((prev) => prev.filter((c) => c.id !== id));

    try {
      await api.delete(`/portfolio/certifications/${id}`);
      toast({ title: "Success", description: "Certification removed" });
    } catch (error: any) {
      if (error.message?.includes("not found")) return;
      setCerts(previousCerts);
      toast({ title: "Error", description: "Failed to delete certification", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-up">
      <PageHeader
        title="Certifications"
        description="Display your verified skills and credentials."
        action={
          <Button onClick={openAddDialog} className="flex items-center gap-2 shadow-sm font-semibold cursor-pointer">
            <Plus className="h-4 w-4" /> Add Certification
          </Button>
        }
      />

      {/* ─── ADD / EDIT CERTIFICATION DIALOG ──────────────────────────────── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto p-0 gap-0 border-border/80 shadow-xl">
          <DialogHeader className="p-6 pb-4 border-b border-border/50 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-brown-800/10 text-brown-800 border border-brown-800/20">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold font-display text-foreground">
                  {editingCert ? "Edit Certification" : "Add Certification"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {editingCert
                    ? "Update credential details and validated competency skills."
                    : "Add licenses, industry credentials, and skill certifications."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* 1. Certification Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Certification Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. AWS Certified Solutions Architect – Associate"
                className="h-10 rounded-sm bg-card border-border/80"
              />
            </div>

            {/* 2. Issuing Organization with Quick Picks */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center justify-between">
                <span>
                  Issuing Organization <span className="text-destructive">*</span>
                </span>
              </Label>
              <Input
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                required
                placeholder="e.g. Amazon Web Services, Google Cloud, Meta"
                className="h-10 rounded-sm bg-card border-border/80"
              />

              {/* Quick suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-muted-foreground mr-1 uppercase tracking-wider">
                  Popular:
                </span>
                {COMMON_ISSUERS.slice(0, 5).map((commonIssuer) => (
                  <button
                    key={commonIssuer}
                    type="button"
                    onClick={() => setIssuer(commonIssuer)}
                    className="inline-flex items-center gap-1 rounded-sm border border-border/70 bg-muted/40 px-2 py-0.5 text-xs font-medium text-muted-foreground hover:border-amber-500/50 hover:bg-amber-500/10 hover:text-brown-800 transition-all cursor-pointer"
                  >
                    {commonIssuer}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Issue Date & Credential URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Issue Date <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    required
                    className="h-10 rounded-sm bg-card border-border/80"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Credential URL / ID
                </Label>
                <div className="relative">
                  <Input
                    type="url"
                    value={credentialUrl}
                    onChange={(e) => setCredentialUrl(e.target.value)}
                    placeholder="https://www.credly.com/..."
                    className="h-10 rounded-sm bg-card border-border/80 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 4. Skills Validated Tags */}
            <div className="space-y-2 rounded-md border border-border/60 bg-muted/20 p-4">
              <Label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-brown-800" />
                <span>Skills Validated by Certificate</span>
              </Label>
              <TagInput
                tags={skillTags}
                onChange={setSkillTags}
                suggestions={COMMON_SKILLS}
                placeholder="Type skill and press Enter (e.g. Cloud, Docker)..."
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
                ) : editingCert ? (
                  "Save Changes"
                ) : (
                  "Add Certificate"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── CERTIFICATIONS LIST VIEW ─────────────────────────────────────── */}
      {loading ? (
        <LoadingGrid items={6} />
      ) : certs.length === 0 ? (
        <EnhancedEmpty
          icon={Award}
          title="No certifications added"
          description="Add professional certificates to validate your skills and stand out to recruiters."
          action={{
            label: "Add Certification",
            onClick: openAddDialog,
          }}
          variant="illustrated"
          className="mt-6 md:mt-8"
        />
      ) : (
        <section className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {certs.map((cert) => (
            <Card
              key={cert.id}
              className="flex flex-col border border-border/60 bg-card transition-all duration-300 hover:border-brown-800/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 pr-6">
                    <CardTitle className="text-lg font-bold font-display leading-tight line-clamp-2 text-foreground">
                      {cert.title}
                    </CardTitle>
                    <p className="text-sm font-semibold text-brown-800 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{cert.issuer}</span>
                    </p>
                  </div>
                  {cert.isVerified ? (
                    <div className="shrink-0 rounded-full bg-emerald-500/15 p-1.5 text-emerald-600" title="Verified by T&P Office">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="shrink-0 rounded-full bg-muted p-1.5 text-muted-foreground" title="Self-reported">
                      <Award className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 font-medium">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Issued{" "}
                    {cert.issueDate ? format(new Date(cert.issueDate), "MMMM yyyy") : "N/A"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 pb-4">
                {cert.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {cert.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-brown-800/5 text-brown-900 border border-brown-800/15 text-[11px] font-medium px-2 py-0.5 rounded-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-border/50 bg-muted/20 px-4 py-3 flex items-center justify-between gap-2">
                {cert.credentialUrl ? (
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-semibold hover:border-amber-500/40" asChild>
                    <a href={cert.credentialUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 text-amber-600" /> Verify Credential
                    </a>
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground italic">No link provided</span>
                )}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(cert)}
                    className="h-8 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(cert.id)}
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
