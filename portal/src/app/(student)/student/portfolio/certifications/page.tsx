"use client";

import { useState, useEffect } from"react";
import { Button } from"@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from"@/components/ui/card";
import { Badge } from"@/components/ui/badge";
import { Plus, Award, CheckCircle2, Link as LinkIcon, Calendar } from"lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from"@/components/ui/dialog";
import { Label } from"@/components/ui/label";
import { Input } from"@/components/ui/input";
import { api } from"@/lib/api";
import { useToast } from"@/hooks/use-toast";
import { format } from"date-fns";
import { LoadingGrid } from"@/components/ui/loading-states";
import { EnhancedEmpty } from"@/components/ui/enhanced-empty";

interface Certification {
 id: string;
 title: string;
 issuer: string;
 issueDate: string;
 credentialUrl?: string;
 isVerified: boolean;
 skills: string[];
}

export default function CertificationsPage() {
 const [certs, setCerts] = useState<Certification[]>([]);
 const [loading, setLoading] = useState(true);
 const [addOpen, setAddOpen] = useState(false);
 const { toast } = useToast();

 // Form
 const [title, setTitle] = useState("");
 const [issuer, setIssuer] = useState("");
 const [issueDate, setIssueDate] = useState("");
 const [credentialUrl, setCredentialUrl] = useState("");
 const [skills, setSkills] = useState("");
 const [submitting, setSubmitting] = useState(false);

 const fetchCerts = async () => {
 try {
 setLoading(true);
 const data = await api.get("/portfolio/certifications");
 setCerts(Array.isArray(data) ? data : []);
 } catch (error) {
 toast({ title:"Error", description:"Failed to load certifications", variant:"destructive" });
 setCerts([]);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchCerts();
 }, []);

 const handleAdd = async (e: React.FormEvent) => {
 e.preventDefault();

 const skillsArray = skills.split(",").map(s => s.trim()).filter(Boolean);
 const tempId = `temp-${Date.now()}`;
 const newCert: Certification = {
 id: tempId,
 title,
 issuer,
 issueDate,
 credentialUrl,
 skills: skillsArray,
 isVerified: false
 };

 // 1. Optimistic Update
 setCerts(prev => [newCert, ...prev]);
 setAddOpen(false);
 resetForm();

 try {
 // 2. Background Sync
 const res = await api.post("/portfolio/certifications", {
 title: newCert.title,
 issuer: newCert.issuer,
 issueDate: newCert.issueDate,
 credentialUrl: newCert.credentialUrl,
 skills: newCert.skills
 });

 // 3. Reconcile
 setCerts(prev => prev.map(c => c.id === tempId ? res : c));
 toast({ title:"Success", description:"Certification added successfully" });
 } catch (error) {
 // 4. Rollback
 setCerts(prev => prev.filter(c => c.id !== tempId));
 toast({ title:"Error", description:"Failed to add certification", variant:"destructive" });
 }
 };

 const handleDelete = async (id: string) => {
 const previousCerts = [...certs];
 setCerts(prev => prev.filter(c => c.id !== id));

 try {
 await api.delete(`/portfolio/certifications/${id}`);
 toast({ title:"Success", description:"Certification deleted" });
 } catch (error: any) {
 // Ignore 404
 if (error.message?.includes("not found")) return;

 setCerts(previousCerts);
 toast({ title:"Error", description:"Failed to delete certification", variant:"destructive" });
 }
 };

 const resetForm = () => {
 setTitle("");
 setIssuer("");
 setIssueDate("");
 setCredentialUrl("");
 setSkills("");
 };

 return (
 <div className="space-y-8">
 <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Certifications</h1>
 <p className="text-muted-foreground mt-1 text-sm sm:text-base">
 Display your verified skills and credentials.
 </p>
 </div>
 <Dialog open={addOpen} onOpenChange={setAddOpen}>
 <DialogTrigger asChild>
 <Button className="flex items-center gap-2">
 <Plus className="h-4 w-4" /> Add Certification
 </Button>
 </DialogTrigger>
 <DialogContent>
 <DialogHeader>
 <DialogTitle>Add Certification</DialogTitle>
 <DialogDescription>
 Enter details from your certificate or license.
 </DialogDescription>
 </DialogHeader>
 <form onSubmit={handleAdd} className="space-y-4 py-4">
 <div className="space-y-2">
 <Label>Title</Label>
 <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. AWS Certified Solutions Architect" />
 </div>
 <div className="space-y-2">
 <Label>Issuing Organization</Label>
 <Input value={issuer} onChange={(e) => setIssuer(e.target.value)} required placeholder="e.g. Amazon Web Services" />
 </div>
 <div className="space-y-2">
 <Label>Issue Date</Label>
 <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
 </div>
 <div className="space-y-2">
 <Label>Credential URL</Label>
 <Input value={credentialUrl} onChange={(e) => setCredentialUrl(e.target.value)} placeholder="https://..." />
 </div>
 <div className="space-y-2">
 <Label>Skills Earned (comma separated)</Label>
 <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Cloud Computing, Security" />
 </div>
 <DialogFooter>
 <Button type="submit" disabled={submitting}>
 {submitting ?"Saving..." :"Save Certification"}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>
 </section>

 {loading ? (
 <LoadingGrid items={6} />
 ) : certs.length === 0 ? (
 <EnhancedEmpty
 icon={Award}
 title="No certifications added"
 description="Add professional certificates to validate your skills and stand out to recruiters."
 action={{ label:"Add Certification", onClick: () => setAddOpen(true) }}
 variant="illustrated"
 />
 ) : (
 <section className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
 {certs.map((cert) => (
 <Card
 key={cert.id}
 className="flex flex-col border-2 transition-all duration-300 hover:border-brown-800/30 hover:shadow-lg hover:shadow-primary/5"
 >
 <CardHeader className="pb-2">
 <div className="flex items-start justify-between gap-3">
 <CardTitle className="text-lg font-semibold leading-tight line-clamp-2 pr-8">
 {cert.title}
 </CardTitle>
 {cert.isVerified ? (
 <div className="shrink-0 rounded-full bg-green-500/15 p-1.5" title="Verified">
 <CheckCircle2 className="h-4 w-4 text-green-600" />
 </div>
 ) : (
 <div className="shrink-0 rounded-full bg-muted p-1.5" title="Unverified">
 <Award className="h-4 w-4 text-muted-foreground" />
 </div>
 )}
 </div>
 <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
 <Calendar className="h-3.5 w-3.5 shrink-0" />
 <span>Issued {format(new Date(cert.issueDate),"MMM yyyy")}</span>
 </div>
 </CardHeader>
 <CardContent className="flex-1 space-y-3">
 <p className="font-medium text-foreground">{cert.issuer}</p>
 {cert.skills?.length > 0 && (
 <div className="flex flex-wrap gap-1.5">
 {cert.skills.map((skill) => (
 <Badge key={skill} variant="secondary" className="text-xs font-normal">
 {skill}
 </Badge>
 ))}
 </div>
 )}
 </CardContent>
 <CardFooter className="border-t bg-muted/30 px-4 py-3 flex items-center justify-between gap-2">
 {cert.credentialUrl ? (
 <Button variant="outline" size="sm" className="gap-2" asChild>
 <a href={cert.credentialUrl} target="_blank" rel="noreferrer">
 <LinkIcon className="h-3.5 w-3.5" /> Show credential
 </a>
 </Button>
 ) : (
 <span className="text-xs text-muted-foreground">No link</span>
 )}
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleDelete(cert.id)}
 className="text-destructive hover:bg-destructive/10"
 >
 Delete
 </Button>
 </CardFooter>
 </Card>
 ))}
 </section>
 )}
 </div>
 );
}
