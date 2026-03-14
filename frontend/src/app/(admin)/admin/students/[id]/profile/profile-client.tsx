"use client";

import { useEffect, useState } from"react";
import { useRouter, useSearchParams } from"next/navigation";
import { api } from"@/lib/api";
import { cn } from"@/lib/utils";
import { Button } from"@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from"@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from"@/components/ui/tabs";
import { Badge } from"@/components/ui/badge";
import { Label } from"@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from"@/components/ui/avatar";
import {
 User, GraduationCap, Briefcase, Code, Group,
 ArrowLeft, Loader2,
 Mail, Phone, MapPin, Calendar, Award,
 ExternalLink, CheckCircle2,
 Home, Building, AlertCircle, Users
} from"lucide-react";
import { useToast } from"@/components/ui/use-toast";

interface ProfileClientProps {
 id: string;
}

export default function ProfileClient({ id }: ProfileClientProps) {
 const router = useRouter();
 const searchParams = useSearchParams();
 const { toast } = useToast();
 const [loading, setLoading] = useState(true);
 const [student, setStudent] = useState<any>(null);

 useEffect(() => {
 fetchStudentData();
 }, [id]);

 useEffect(() => {
 if (student && searchParams.get("generate") ==="true") {
 const timer = setTimeout(() => {
 handleGenerateReport();
 }, 1000);
 return () => clearTimeout(timer);
 }
 }, [student, searchParams]);

 const fetchStudentData = async () => {
 try {
 setLoading(true);
 const data = await api.get(`/students/${id}`);
 setStudent(data);
 } catch (error) {
 console.error("Failed to fetch student data", error);
 toast({
 title:"Error",
 description:"Failed to load student profile details.",
 variant:"destructive"
 });
 } finally {
 setLoading(false);
 }
 };

 const handleGenerateReport = () => {
 window.print();
 };

 const getImageUrl = (path: string | null) => {
 if (!path) return"";
 if (path.startsWith('http')) return path;
 return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/student-photos/${path}`;
 };

 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
 <Loader2 className="h-10 w-10 animate-spin text-brown-800" />
 <p className="text-muted-foreground animate-pulse font-medium">Loading comprehensive profile...</p>
 </div>
 );
 }

 if (!student) {
 return (
 <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
 <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
 <AlertCircle className="h-8 w-8" />
 </div>
 <h2 className="text-xl font-bold">Student Not Found</h2>
 <p className="text-muted-foreground">The profile could not be loaded or doesn't exist.</p>
 <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
 </div>
 );
 }

 const SectionHeader = ({ title, description }: { title: string, description: string }) => (
 <div className="mb-6">
 <CardTitle className="text-xl font-bold">{title}</CardTitle>
 <CardDescription>{description}</CardDescription>
 </div>
 );

 return (
 <div className="document-page mx-auto max-w-7xl p-6 pb-20">
 <div className="document-hero relative overflow-hidden">
 <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
 <User className="h-64 w-64" />
 </div>

 <div className="relative flex flex-col md:flex-row gap-8 items-start md:items-center">
 <div className="relative group/avatar">
 <Avatar className="h-32 w-32 border-4 border-background shadow-2xl ring-2 ring-amber-500/20">
 <AvatarImage src={getImageUrl(student.photoUrl)} className="object-cover" />
 <AvatarFallback className="tone-primary text-3xl font-semibold">
 {student.name?.split("").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) ||"ST"}
 </AvatarFallback>
 </Avatar>
 <div className={cn(
"absolute bottom-1 right-1 h-6 w-6 rounded-full border-4 border-background shadow-lg",
 student.isProfileLocked ?"bg-success" :"bg-warning"
 )} />
 </div>

 <div className="flex-1 space-y-2">
 <div className="flex flex-wrap items-center gap-3">
 <h1 className="text-4xl font-bold tracking-tight text-foreground">{student.name ||"Unknown Student"}</h1>
 <Badge variant={student.isProfileLocked ?"success" :"warning"} className="px-3 py-1 font-bold uppercase text-[10px] tracking-widest shadow-sm">
 {student.isProfileLocked ?"Verified Profile" :"Awaiting Verification"}
 </Badge>
 </div>

 <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground font-semibold text-sm">
 <div className="flex items-center gap-2">
 <Badge variant="outline" className="h-6 bg-muted/50 border-border/50 font-bold text-[10px] tracking-tighter">ID</Badge>
 <span className="text-brown-800">{student.admissionId}</span>
 </div>
 <div className="flex items-center gap-2">
 <Badge variant="outline" className="h-6 bg-muted/50 border-border/50 font-bold text-[10px] tracking-tighter">ROLL</Badge>
 <span>{student.rollNo ||"N/A"}</span>
 </div>
 <div className="flex items-center gap-2">
 <Badge variant="outline" className="h-6 bg-brown-800/5 border-brown-800/20 font-bold text-[10px] tracking-tighter text-brown-800">{student.branch}</Badge>
 <span className="uppercase tracking-wide">{student.year} Batch</span>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 print:hidden">
 <Button variant="outline" className="flex-1 md:flex-none h-11 px-6 rounded-xl font-bold border-2 hover:bg-muted transition-all">
 <Mail className="h-4 w-4 mr-2" /> Message
 </Button>
 <Button
 onClick={handleGenerateReport}
 className="flex-1 md:flex-none h-11 px-6 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
 >
 Generate Report
 </Button>
 </div>
 </div>
 </div>

 <Tabs defaultValue="profile" className="w-full">
 <TabsList className="grid grid-cols-2 lg:grid-cols-5 h-auto p-1.5 bg-muted/40 rounded-xl border border-border/50 sticky top-4 z-20 backdrop-blur-xl transition-all shadow-lg shadow-black/5">
 {[
 { value:"profile", label:"Identity", icon: User },
 { value:"academic", label:"Academics", icon: GraduationCap },
 { value:"portfolio", label:"Portfolio", icon: Briefcase },
 { value:"coding", label:"Coding", icon: Code },
 { value:"group", label:"Cohort", icon: Group },
 ].map((tab) => (
 <TabsTrigger
 key={tab.value}
 value={tab.value}
 className="py-3 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md font-bold text-[10px] uppercase tracking-[0.15em] transition-all"
 >
 <tab.icon className="h-4 w-4 mr-2 opacity-70" /> {tab.label}
 </TabsTrigger>
 ))}
 </TabsList>

 <div className="mt-8">
 <TabsContent value="profile" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="grid lg:grid-cols-3 gap-8">
 <Card className="document-panel lg:col-span-2 overflow-hidden">
 <CardHeader className="border-b bg-muted/20">
 <SectionHeader
 title="Identity & Contact"
 description="Legal identification and direct communication channels"
 />
 </CardHeader>
 <CardContent className="grid sm:grid-cols-2 gap-10 p-8">
 {[
 { label:"Full Name", value: student.name, icon: User },
 { label:"Admission Email", value: student.user?.email, icon: Mail, primary: true },
 { label:"Personal Email", value: student.personalEmail, icon: Mail },
 { label:"Mobile Number", value: student.mobileNo, icon: Phone },
 { label:"Admission ID", value: student.admissionId, icon: Award, highlight: true },
 { label:"Roll Number", value: student.rollNo, icon: Award },
 ].map((item, idx) => (
 <div key={idx} className="space-y-2 group">
 <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 group-hover:text-brown-800/70 transition-colors">{item.label}</Label>
 <div className="flex items-center gap-3">
 {item.icon && <item.icon className={cn("h-4 w-4", item.primary ?"text-brown-800" :"text-muted-foreground/40")} />}
 <p className={cn(
"font-bold tracking-tight",
 item.highlight ?"text-brown-800 text-xl" :"text-foreground",
 item.primary ?"underline decoration-primary/20 underline-offset-4" :""
 )}>
 {item.value ||"—"}
 </p>
 </div>
 </div>
 ))}
 </CardContent>
 </Card>

 <Card className="document-panel overflow-hidden">
 <CardHeader className="border-b bg-muted/20">
 <SectionHeader
 title="Lineage"
 description="Guardian and parental control information"
 />
 </CardHeader>
 <CardContent className="space-y-6 p-8">
 {[
 { label:"Father", name: student.fatherName, mobile: student.fatherMobile, occupation: student.fatherOccupation },
 { label:"Mother", name: student.motherName, mobile: student.motherMobile, occupation: student.motherOccupation },
 ].map((parent, idx) => (
 <div key={idx} className="document-subtle space-y-4 p-5 group hover:border-brown-800/20">
 <div className="flex items-center justify-between">
 <Label className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">{parent.label}</Label>
 {parent.occupation && <Badge variant="outline" className="bg-background/50 text-[8px] font-bold uppercase">{parent.occupation}</Badge>}
 </div>
 <div>
 <p className="font-bold text-lg tracking-tight">{parent.name ||"—"}</p>
 {parent.mobile && (
 <div className="flex items-center gap-2 mt-1 text-muted-foreground font-semibold text-sm">
 <Phone className="h-3 w-3 opacity-50" />
 {parent.mobile}
 </div>
 )}
 </div>
 </div>
 ))}
 </CardContent>
 </Card>

 <Card className="document-panel lg:col-span-3 overflow-hidden">
 <CardHeader className="border-b bg-muted/20">
 <CardTitle className="text-xl font-bold flex items-center gap-2">
 <MapPin className="h-5 w-5 text-brown-800" /> Residential Matrix
 </CardTitle>
 </CardHeader>
 <CardContent className="grid md:grid-cols-2 gap-12 p-8">
 {[
 {
 label:"Present Domicile",
 icon: MapPin,
 addr: [student.presentHouseNo, student.presentLocality, student.presentCity, student.presentDistrict, student.presentState, student.presentPincode].filter(Boolean).join(",")
 },
 {
 label:"Permanent Domicile",
 icon: Home,
 addr: [student.permanentHouseNo, student.permanentLocality, student.permanentCity, student.permanentDistrict, student.permanentState, student.permanentPincode].filter(Boolean).join(",")
 }
 ].map((address, idx) => (
 <div key={idx} className="space-y-4">
 <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brown-800 flex items-center">
 <address.icon className="h-4 w-4 mr-2" /> {address.label}
 </h4>
 <div className="document-subtle p-6 leading-relaxed text-sm font-bold text-foreground/80 shadow-inner">
 {address.addr ||"No address data available"}
 </div>
 </div>
 ))}
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 <TabsContent value="academic" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="grid lg:grid-cols-2 gap-8">
 {[
 {
 title:"Secondary (X)",
 pct: student.class10Percentage,
 school: student.class10School,
 board: student.class10Board,
 year: student.class10Year,
 color:"bg-brown-800",
 accent:"text-brown-800",
 light:"tone-primary"
 },
 {
 title:"Higher Secondary (XII)",
 pct: student.class12Percentage,
 school: student.class12School,
 board: student.class12Board,
 year: student.class12Year,
 color:"bg-warning",
 accent:"text-warning",
 light:"tone-warning"
 }
 ].map((card, idx) => (
 <Card key={idx} className="document-panel overflow-hidden group">
 <div className={cn("h-2 w-full", card.color)} />
 <CardHeader className="flex flex-row items-center justify-between pb-6 pt-8">
 <div className="flex items-center gap-4">
 <div className={cn("h-12 w-12 rounded-xl border flex items-center justify-center shadow-lg shadow-black/5", card.light, card.accent)}>
 <Award className="h-6 w-6" />
 </div>
 <CardTitle className="text-2xl font-bold tracking-tight">{card.title}</CardTitle>
 </div>
 <div className="text-right">
 <div className={cn("text-3xl font-bold leading-none", card.accent)}>{card.pct}%</div>
 <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">Aggregate Score</span>
 </div>
 </CardHeader>
 <CardContent className="space-y-4 px-8 pb-8">
 <div className="document-subtle p-4 space-y-4">
 <div className="flex justify-between items-center">
 <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Institution</span>
 <span className="font-bold text-sm">{card.school ||"—"}</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Board</span>
 <Badge variant="outline" className="font-bold text-xs uppercase border-brown-800/20 bg-background">{card.board ||"—"}</Badge>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Year of Passing</span>
 <span className="font-bold text-sm tabular-nums">{card.year ||"—"}</span>
 </div>
 </div>
 </CardContent>
 </Card>
 ))}

 <Card className="lg:col-span-2 shadow-xl border-border/60 rounded-xl overflow-hidden bg-gradient-to-br from-card to-muted/20">
 <CardHeader className="border-b bg-muted/10 p-8">
 <div className="flex items-center justify-between">
 <div>
 <CardTitle className="text-2xl font-bold text-brown-800 uppercase tracking-tighter">University Chronology</CardTitle>
 <CardDescription className="text-sm font-bold opacity-70">Academic progression tracking through semesters</CardDescription>
 </div>
 <div className="text-right">
 <div className="text-5xl font-bold text-brown-800 leading-none tabular-nums drop-shadow-sm">{student.cgpa?.toFixed(2) ||"0.00"}</div>
 <span className="text-[10px] font-bold text-brown-800/60 uppercase tracking-[0.2em]">Cumulative GPA</span>
 </div>
 </div>
 </CardHeader>
 <CardContent className="p-0">
 <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 divide-x divide-y md:divide-y-0 border-b">
 {Array.from({ length: 8 }, (_, i) => {
 const semResult = student.semesterResults?.find((r: any) => r.semester === i + 1);
 const isFuture = (student.currentSemester || 1) < (i + 1);
 return (
 <div key={i} className={cn(
"flex flex-col items-center p-8 transition-all group relative overflow-hidden",
 isFuture ?"bg-muted/5 opacity-40 grayscale" :"bg-card hover:bg-brown-800/5 cursor-default"
 )}>
 {semResult?.sgpa >= 8.5 && !isFuture && (
 <div className="absolute top-0 right-0 p-1">
 <div className="h-4 w-4 bg-yellow-400 rounded-full flex items-center justify-center text-[8px] font-bold text-yellow-900 border-2 border-background shadow-sm">★</div>
 </div>
 )}
 <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] group-hover:text-brown-800 transition-colors">Sem {i + 1}</span>
 <span className={cn(
"text-3xl font-bold mt-3 transition-transform group-hover:scale-110 tabular-nums",
 semResult?.sgpa ?"text-foreground" :"text-muted-foreground/20"
 )}>{semResult?.sgpa ? semResult.sgpa.toFixed(2) :"—"}</span>
 {semResult?.backlogs > 0 && (
 <Badge variant="destructive" className="mt-3 text-[8px] font-bold uppercase px-2 py-0 border-2 border-background animate-pulse">
 {semResult.backlogs} Backlog
 </Badge>
 )}
 </div>
 );
 })}
 </div>
 <div className="p-8 flex justify-between items-center">
 <div className="flex gap-4">
 <div className="flex items-center gap-2">
 <div className="h-2 w-2 rounded-full bg-brown-800" />
 <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Current Intake: Sem {student.currentSemester ||"—"}</span>
 </div>
 <div className="flex items-center gap-2">
 <div className="h-2 w-2 rounded-full bg-destructive" />
 <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Active Backlogs: {student.semesterResults?.reduce((acc: number, r: any) => acc + (r.backlogs || 0), 0) || 0}</span>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 </TabsContent>

 <TabsContent value="portfolio" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <Card className="shadow-2xl border-border/60 rounded-xl overflow-hidden">
 <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b bg-gradient-to-r from-primary/10 to-transparent p-8">
 <div>
 <CardTitle className="text-3xl font-bold text-brown-800 uppercase tracking-tighter">Technical Registry</CardTitle>
 <CardDescription className="font-bold text-sm opacity-70">Historical project development and industry certifications</CardDescription>
 </div>
 <div className="mt-4 sm:mt-0 flex gap-4">
 <div className="text-center">
 <div className="text-2xl font-bold text-brown-800 leading-none">{student.projects?.length || 0}</div>
 <span className="text-[9px] font-bold uppercase opacity-50 tracking-widest text-brown-800">Projects</span>
 </div>
 <div className="h-8 w-[1px] bg-brown-800/20" />
 <div className="text-center">
 <div className="text-2xl font-bold text-brown-800 leading-none">{student.certifications?.length || 0}</div>
 <span className="text-[9px] font-bold uppercase opacity-50 tracking-widest text-brown-800">Certifications</span>
 </div>
 </div>
 </CardHeader>
 <CardContent className="p-8">
 {student.projects?.length > 0 || student.certifications?.length > 0 ? (
 <div className="grid lg:grid-cols-2 gap-10">
 <div className="space-y-6">
 <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brown-800 flex items-center">
 <Briefcase className="h-4 w-4 mr-3" /> Featured Projects
 </h3>
 <div className="space-y-4">
 {student.projects?.map((project: any) => (
 <div key={project.id} className="group p-6 rounded-xl border-2 border-muted bg-muted/10 hover:border-brown-800/30 hover:bg-brown-800/5 transition-all duration-300">
 <div className="flex items-start justify-between">
 <h4 className="font-bold text-xl tracking-tight leading-none mb-2">{project.title}</h4>
 <Badge className="bg-brown-800/10 text-brown-800 border-brown-800/20 text-[8px] font-bold uppercase tracking-widest">{project.status}</Badge>
 </div>
 <p className="text-sm text-muted-foreground font-medium italic mt-2 opacity-80 leading-relaxed capitalize">&quot;{project.description}&quot;</p>
 <div className="flex flex-wrap gap-2 mt-6">
 {project.techStack?.map((tech: string) => (
 <Badge key={tech} variant="secondary" className="px-3 py-1 text-[9px] font-bold bg-muted text-muted-foreground uppercase border-border/40 tracking-tighter">
 #{tech}
 </Badge>
 ))}
 </div>
 {project.githubLink && (
 <div className="mt-6 flex gap-4">
 <a href={project.githubLink} target="_blank" rel="noreferrer" className="text-xs font-bold flex items-center gap-1.5 text-brown-800 hover:underline transition-all">
 <Code className="h-3.5 w-3.5" /> Source Artifact <ExternalLink className="h-3.5 w-3.5 opacity-50 font-bold" />
 </a>
 </div>
 )}
 </div>
 ))}
 </div>
 </div>

 <div className="space-y-6">
 <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground flex items-center opacity-60">
 <Award className="h-4 w-4 mr-3" /> Credentials & Badges
 </h3>
 <div className="space-y-4">
 {student.certifications?.length > 0 ? (
 student.certifications.map((cert: any) => (
 <div key={cert.id} className="flex gap-4 p-5 rounded-xl border border-border/60 bg-card hover:shadow-xl hover:shadow-black/5 transition-all">
 <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
 <Award className="h-6 w-6 text-muted-foreground/50" />
 </div>
 <div className="flex-1">
 <div className="flex justify-between items-start">
 <h5 className="font-bold text-sm uppercase tracking-tight leading-tight">{cert.name}</h5>
 <span className="text-[10px] font-bold text-muted-foreground opacity-60 tabular-nums">{new Date(cert.issueDate).getFullYear()}</span>
 </div>
 <p className="text-[10px] font-bold text-muted-foreground mt-1">{cert.issuer}</p>
 {cert.credentialUrl && (
 <Button variant="link" className="p-0 h-auto text-[10px] font-bold mt-2 text-brown-800/70" asChild>
 <a href={cert.credentialUrl} target="_blank" rel="noreferrer">Verification Link <ExternalLink className="h-2.5 w-2.5 ml-1" /></a>
 </Button>
 )}
 </div>
 </div>
 ))
 ) : (
 <div className="text-center py-10 opacity-30 border-2 border-dashed rounded-xl">
 <Award className="h-8 w-8 mx-auto mb-3" />
 <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">No validated credentials</p>
 </div>
 )}
 </div>
 </div>
 </div>
 ) : (
 <div className="text-center py-32 flex flex-col items-center justify-center opacity-20 group">
 <Briefcase className="h-20 w-20 mb-6 transition-transform group-hover:scale-110 duration-500" />
 <p className="font-bold uppercase tracking-[0.4em] text-lg text-muted-foreground">Registry Empty</p>
 <p className="text-sm font-bold mt-2">No active projects or certifications recorded</p>
 </div>
 )}
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="coding" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <Card className="shadow-2xl border-border/60 rounded-xl overflow-hidden">
 <CardHeader className="bg-brown-800 p-10 relative">
 <Code className="absolute top-0 right-0 h-48 w-48 text-background/10 -mr-16 -mt-16" />
 <div className="relative">
 <h2 className="text-3xl font-bold text-brown-800-foreground uppercase tracking-tighter">Competitive Profile</h2>
 <p className="text-brown-800-foreground/70 font-bold tracking-tight mt-1 uppercase text-xs">Algorithmic performance across global platforms</p>
 </div>
 </CardHeader>
 <CardContent className="p-10 grid md:grid-cols-3 gap-10">
 {[
 { label:"LeetCode", key:"leetcodeId", icon:"L", color:"text-[#FFA116]", bg:"bg-[#FFA116]/10", border:"border-[#FFA116]/30", url: (id: string) => `https://leetcode.com/${id}` },
 { label:"GitHub", key:"githubId", icon:"G", color:"text-[#181717]", bg:"bg-[#181717]/10", border:"border-[#181717]/30", url: (id: string) => `https://github.com/${id}` },
 { label:"CodeChef", key:"codechefId", icon:"C", color:"text-[#5B4638]", bg:"bg-[#5B4638]/10", border:"border-[#5B4638]/30", url: (id: string) => `https://codechef.com/users/${id}` }
 ].map((plat) => (
 <div key={plat.label} className={cn("relative p-8 rounded-2xl border-2 bg-card transition-all hover:shadow-2xl hover:-translate-y-2 flex flex-col items-center text-center group", plat.border)}>
 <div className={cn("h-20 w-20 rounded-xl flex items-center justify-center text-3xl font-bold mb-6 shadow-lg shadow-black/5 transition-all group-hover:rotate-6", plat.bg)}>
 <span className={plat.color}>{plat.icon}</span>
 </div>
 <Label className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60 mb-2">{plat.label}</Label>
 <p className="font-bold text-2xl tracking-tighter text-foreground break-all">{student[plat.key] ||"UNLINKED"}</p>

 {student[plat.key] && (
 <a
 href={plat.url(student[plat.key])}
 target="_blank"
 rel="noreferrer"
 className="mt-6 font-bold text-[10px] uppercase tracking-widest text-brown-800 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 px-4 py-2 rounded-full border border-brown-800/20 bg-brown-800/5"
 >
 Audit Profile <ExternalLink className="h-3 w-3" />
 </a>
 )}
 </div>
 ))}
 </CardContent>
 </Card>
 </TabsContent>

 <TabsContent value="group" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="grid lg:grid-cols-2 gap-8">
 <Card className="shadow-2xl border-border/60 rounded-xl overflow-hidden">
 <CardHeader className="p-8 border-b bg-muted/10">
 <CardTitle className="text-2xl font-bold flex items-center gap-3 tracking-tighter">
 <Group className="h-6 w-6 text-brown-800" />
 COHORT ALIGNMENT
 </CardTitle>
 </CardHeader>
 <CardContent className="p-8 space-y-10">
 <div
 className="group p-8 rounded-xl border-2 border-brown-800/20 bg-brown-800/5 hover:bg-brown-800/10 transition-all cursor-pointer relative overflow-hidden active:scale-[0.98]"
 onClick={() => student.trainingGroupId && router.push(`/admin/training/groups/${student.trainingGroupId}`)}
 >
 <div className="absolute top-0 right-0 p-8 opacity-5">
 <Users className="h-32 w-32" />
 </div>
 <div className="flex items-center gap-6 relative">
 <div className="h-20 w-20 rounded-xl bg-brown-800 flex items-center justify-center text-brown-800-foreground shadow-xl shadow-primary/40 transition-transform group-hover:-rotate-3">
 <Users className="h-10 w-10" />
 </div>
 <div>
 <p className="text-[10px] font-bold text-brown-800 uppercase tracking-[0.3em] mb-2">Primary Training Group</p>
 <h4 className="text-3xl font-bold tracking-tight leading-none">{student.trainingGroup?.name ||"UNASSIGNED"}</h4>
 <div className="flex items-center gap-2 mt-3 text-xs font-bold text-brown-800 opacity-60 group-hover:opacity-100 transition-opacity">
 Manage this group <ArrowLeft className="h-4 w-4 rotate-180" />
 </div>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-6">
 <div className="p-6 rounded-xl border-2 border-muted bg-card group hover:border-brown-800/20 transition-all shadow-sm">
 <Label className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/50 mb-3 block">Deployment Batch</Label>
 <div className="flex items-center gap-2">
 <Calendar className="h-5 w-5 text-brown-800 opacity-50" />
 <p className="font-bold text-2xl tracking-tighter">{student.year ||"N/A"}</p>
 </div>
 </div>
 <div className="p-6 rounded-xl border-2 border-muted bg-card group hover:border-brown-800/20 transition-all shadow-sm">
 <Label className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/50 mb-3 block">Domain Branch</Label>
 <div className="flex items-center gap-2">
 <GraduationCap className="h-5 w-5 text-brown-800 opacity-50" />
 <p className="font-bold text-2xl tracking-tighter uppercase">{student.branch ||"N/A"}</p>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card className="shadow-2xl border-border/60 rounded-xl p-10 flex flex-col items-center justify-center bg-gradient-to-br from-card to-muted relative overflow-hidden group">
 <div className="absolute top-0 right-0 p-6">
 <CheckCircle2 className="h-10 w-10 text-brown-800/10" />
 </div>
 <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60 mb-12">Engagement Matrix</h3>

 <div className="relative h-64 w-64 flex items-center justify-center">
 <svg className="h-full w-full transform -rotate-90">
 <circle cx="128" cy="128" r="116" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-muted/20" />
 <circle cx="128" cy="128" r="116" stroke="currentColor" strokeWidth="16" fill="transparent" strokeDasharray={728} strokeDashoffset={728 - (728 * (student.attendancePercentage || 0)) / 100} strokeLinecap="round" className="text-brown-800 transition-all duration-1000 ease-out drop-shadow-[0_0_15px_rgba(var(--primary),0.4)]" />
 </svg>
 <div className="absolute flex flex-col items-center transition-transform group-hover:scale-110 duration-500">
 <span className="text-6xl font-bold tracking-tighter tabular-nums text-foreground">{student.attendancePercentage || 0}%</span>
 <span className="text-[10px] font-bold text-muted-foreground uppercase mt-2 tracking-widest opacity-60">Session Attendance</span>
 </div>
 </div>

 <div className="mt-12 flex flex-col items-center gap-4">
 <div className="text-[10px] font-bold text-brown-800 bg-brown-800/10 border border-brown-800/20 px-6 py-2.5 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-primary/5">
 {student.attendances?.length || 0} COMPLETED SESSIONS
 </div>
 <p className="text-[10px] font-bold text-muted-foreground italic">Aggregate calculated across all active modules</p>
 </div>
 </Card>
 </div>
 </TabsContent>
 </div>
 </Tabs >

 {/* Print-Only Dossier Content */}
 <div className="hidden print:block space-y-10">
 <div className="border-b-4 border-brown-800 pb-6 mb-8">
 <h1 className="text-4xl font-bold uppercase tracking-tighter text-brown-800">Student Dossier</h1>
 <p className="text-sm font-bold opacity-60">Confidential Academic & Technical Record</p>
 </div>

 <Card className="shadow-none border p-6 rounded-none">
 <CardHeader className="p-0 mb-6">
 <SectionHeader title="Identity Registry" description="Personal and contact information" />
 </CardHeader>
 <CardContent className="p-0 grid grid-cols-2 gap-x-12 gap-y-6">
 {[
 { l:"Full Name", v: student.name },
 { l:"Admission ID", v: student.admissionId },
 { l:"Roll Number", v: student.rollNo },
 { l:"Branch / Batch", v: `${student.branch} / ${student.year}` },
 { l:"Email", v: student.user?.email },
 { l:"Mobile", v: student.mobileNo },
 { l:"Current CGPA", v: student.cgpa?.toFixed(2) },
 { l:"Attendance", v: `${student.attendancePercentage || 0}%` },
 ].map((it, i) => (
 <div key={i} className="space-y-1">
 <Label className="text-[9px] uppercase font-bold text-muted-foreground/60">{it.l}</Label>
 <p className="font-bold text-sm tracking-tight">{it.v ||"—"}</p>
 </div>
 ))}
 </CardContent>
 </Card>

 <div className="grid grid-cols-2 gap-8">
 <Card className="shadow-none border p-6 rounded-none">
 <CardHeader className="p-0 mb-4 border-b pb-2">
 <h3 className="font-bold text-xs uppercase tracking-widest text-brown-800">Secondary Academics</h3>
 </CardHeader>
 <CardContent className="p-0 space-y-3">
 <div className="flex justify-between text-xs"><span>Class X:</span> <b>{student.class10Percentage}%</b></div>
 <div className="flex justify-between text-xs"><span>Class XII:</span> <b>{student.class12Percentage}%</b></div>
 </CardContent>
 </Card>
 <Card className="shadow-none border p-6 rounded-none">
 <CardHeader className="p-0 mb-4 border-b pb-2">
 <h3 className="font-bold text-xs uppercase tracking-widest text-brown-800">Cohort Context</h3>
 </CardHeader>
 <CardContent className="p-0 space-y-3">
 <div className="flex justify-between text-xs"><span>Group:</span> <b>{student.trainingGroup?.name ||"N/A"}</b></div>
 <div className="flex justify-between text-xs"><span>Semester:</span> <b>{student.currentSemester}</b></div>
 </CardContent>
 </Card>
 </div>

 <Card className="shadow-none border p-6 rounded-none">
 <CardHeader className="p-0 mb-4 border-b pb-2">
 <h3 className="font-bold text-xs uppercase tracking-widest text-brown-800">Technical Projects</h3>
 </CardHeader>
 <CardContent className="p-0 space-y-4">
 {student.projects?.map((p: any) => (
 <div key={p.id} className="pt-2">
 <p className="font-bold text-sm">{p.title} <span className="text-[10px] font-normal opacity-60 ml-2">({p.status})</span></p>
 <p className="text-xs text-muted-foreground">{p.description}</p>
 <p className="text-[9px] font-bold mt-1 uppercase text-brown-800/70">Tech: {p.techStack?.join(",")}</p>
 </div>
 ))}
 </CardContent>
 </Card>

 <Card className="shadow-none border p-6 rounded-none">
 <CardHeader className="p-0 mb-4 border-b pb-2">
 <h3 className="font-bold text-xs uppercase tracking-widest text-brown-800">Competitive Profiles</h3>
 </CardHeader>
 <CardContent className="p-0 grid grid-cols-3 gap-6">
 {[{ l:"LeetCode", v: student.leetcodeId }, { l:"GitHub", v: student.githubId }, { l:"CodeChef", v: student.codechefId }].map((p, i) => (
 <div key={i} className="text-center p-3 border">
 <p className="text-[8px] font-bold text-muted-foreground uppercase mb-1">{p.l}</p>
 <p className="font-bold text-xs">{p.v ||"—"}</p>
 </div>
 ))}
 </CardContent>
 </Card>
 </div>

 <style jsx global>{`
 @media print {
 @page {
 margin: 15mm;
 size: A4;
 }
 body {
 background-color: white !important;
 -webkit-print-color-adjust: exact;
 print-color-adjust: exact;
 font-size: 12pt;
 }
 .print\\:hidden, 
 nav, 
 button, 
 [role="tablist"],
 .sticky,
 aside {
 display: none !important;
 }
 .max-w-7xl {
 max-width: 100% !important;
 width: 100% !important;
 padding: 0 !important;
 margin: 0 !important;
 }
 /* Layout for print */
 .space-y-6, .space-y-8 {
 gap: 1.5rem !important;
 }
 .p-6, .p-8 {
 padding: 1rem !important;
 }
 .rounded-xl, .rounded-xl, .rounded-xl {
 border-radius: 4px !important;
 }
 .shadow-xl, .shadow-2xl, .shadow-lg, .shadow-md, .shadow-sm {
 box-shadow: none !important;
 border: 1px solid #e5e7eb !important;
 }
 /* Ensure all sections are visible in print */
 div[role="tabpanel"] {
 display: block !important;
 opacity: 1 !important;
 transform: none !important;
 animation: none !important;
 margin-top: 2rem !important;
 }
 .animate-in {
 animation: none !important;
 opacity: 1 !important;
 }
 /* Page breaks to keep sections together */
 .Card {
 page-break-inside: avoid;
 }
 h1, h2, h3, h4 {
 page-break-after: avoid;
 }
 /* Specific section spacing */
 [value="academic"], [value="portfolio"], [value="coding"], [value="group"] {
 page-break-before: always;
 }
 
 /* Background colors and text contrast for print */
 .bg-card { background-color: #fff !important; }
 .bg-muted\\/10 { background-color: #f9fafb !important; }
 .text-brown-800 { color: #2563eb !important; }
 .text-muted-foreground { color: #6b7280 !important; }
 
 /* Fix for avatar colors */
 .AvatarFallback { background-color: #f3f4f6 !important; color: #1f2937 !important; }
 }
 `}</style>
 </div >
 );
}
