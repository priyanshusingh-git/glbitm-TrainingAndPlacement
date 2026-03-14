"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from"@/components/ui/card"
import { Badge } from"@/components/ui/badge"
import { Button } from"@/components/ui/button"
import { Input } from"@/components/ui/input"
import { Award, Search, Upload, Download, ExternalLink, ShieldCheck, Clock, Calendar } from"lucide-react"

const certifications = [
 {
 id: 1,
 name:"AWS Certified Cloud Practitioner",
 issuer:"Amazon Web Services",
 issueDate:"Dec 15, 2025",
 expiryDate:"Dec 15, 2028",
 credentialId:"AWS-CCP-2025-1234",
 link:"https://aws.amazon.com/verify",
 status:"verified",
 },
 {
 id: 2,
 name:"Meta Front-End Developer Professional Certificate",
 issuer:"Coursera",
 issueDate:"Nov 20, 2025",
 expiryDate: null,
 credentialId:"COURSERA-META-5678",
 link:"https://coursera.org/verify/123",
 status:"verified",
 },
 {
 id: 3,
 name:"Python for Data Science",
 issuer:"IBM",
 issueDate:"Oct 10, 2025",
 expiryDate: null,
 credentialId:"IBM-DS-9012",
 link:"https://ibm.com/badges/123",
 status:"verified",
 },
 {
 id: 4,
 name:"Advanced React Patterns",
 issuer:"Udemy",
 issueDate:"Jan 05, 2026",
 expiryDate: null,
 credentialId:"UDEMY-REACT-3456",
 link:"",
 status:"pending",
 },
]

export default function CertificationsPage() {
 return (
 <div className="space-y-6">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h1 className="text-2xl font-bold tracking-tight">Certifications</h1>
 <p className="text-muted-foreground">
 Manage and showcase your professional certifications and achievements.
 </p>
 </div>
 <Button className="flex items-center gap-2">
 <Upload className="h-4 w-4" /> Upload Certificate
 </Button>
 </div>

 <div className="flex items-center gap-4">
 <div className="relative flex-1 md:max-w-sm">
 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
 <Input
 type="search"
 placeholder="Search certifications..."
 className="pl-8"
 />
 </div>
 </div>

 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
 {certifications.map((cert) => (
 <Card key={cert.id} className="relative overflow-hidden">
 <div className="absolute top-0 right-0 p-3">
 {cert.status === 'verified' ? (
 <ShieldCheck className="h-5 w-5 text-success opacity-80" />
 ) : (
 <Clock className="h-5 w-5 text-warning opacity-80" />
 )}
 </div>
 <CardHeader className="pb-3">
 <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brown-800/10">
 <Award className="h-6 w-6 text-brown-800" />
 </div>
 <CardTitle className="text-base line-clamp-2 min-h-[48px]">{cert.name}</CardTitle>
 <CardDescription>{cert.issuer}</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="grid gap-2 text-sm">
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground">Issued</span>
 <span className="font-medium">{cert.issueDate}</span>
 </div>
 {cert.expiryDate && (
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground">Expires</span>
 <span className="font-medium">{cert.expiryDate}</span>
 </div>
 )}
 <div className="flex items-center justify-between">
 <span className="text-muted-foreground">Credential ID</span>
 <span className="font-mono text-xs text-foreground/80">{cert.credentialId.slice(0, 12)}...</span>
 </div>
 </div>

 <div className="flex items-center gap-2 pt-2">
 <Badge
 variant={cert.status ==="verified" ?"default" :"secondary"}
 className={cert.status ==="verified" ?"bg-success/15 text-success hover:bg-success/20 border-success/20" :"bg-warning/15 text-warning hover:bg-warning/20 border-warning/20"}
 >
 {cert.status ==="verified" ?"Verified" :"Pending Verification"}
 </Badge>
 </div>
 </CardContent>
 <CardContent className="border-t p-4">
 <div className="flex gap-2">
 {cert.link && (
 <Button variant="outline" size="sm" className="flex-1" asChild>
 <a href={cert.link} target="_blank" rel="noopener noreferrer">
 <ExternalLink className="mr-2 h-3.5 w-3.5" /> Verify
 </a>
 </Button>
 )}
 <Button variant="ghost" size="sm" className="flex-1">
 <Download className="mr-2 h-3.5 w-3.5" /> Download
 </Button>
 </div>
 </CardContent>
 </Card>
 ))}

 {/* Upload Placeholder */}
 <button className="group relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 text-center hover:bg-muted/50 transition-colors h-full min-h-[300px]">
 <div className="rounded-full bg-muted group-hover:bg-background p-4 transition-colors">
 <Upload className="h-6 w-6 text-muted-foreground" />
 </div>
 <div className="space-y-1">
 <h3 className="font-semibold text-lg">Upload Certificate</h3>
 <p className="text-sm text-muted-foreground px-4">
 Add a new certification to your profile for verification
 </p>
 </div>
 </button>
 </div>
 </div>
 )
}
