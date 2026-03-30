"use client";

import React from"react";
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogDescription,
} from"@/components/ui/dialog";
import { Badge } from"@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from"@/components/ui/avatar";
import { PlacementStudent } from"@/services/placement.client";
import { Quote, Briefcase, GraduationCap, Calendar, DollarSign, Linkedin } from"lucide-react";

interface StudentDetailModalProps {
 student: PlacementStudent | null;
 isOpen: boolean;
 onClose: () => void;
}

export function StudentDetailModal({ student, isOpen, onClose }: StudentDetailModalProps) {
 if (!student) return null;

 return (
 <Dialog open={isOpen} onOpenChange={onClose}>
 <DialogContent className="document-panel sm:max-w-[600px] overflow-hidden p-0">
 <DialogHeader className="sr-only">
 <DialogTitle>{student.name}'s Profile</DialogTitle>
 <DialogDescription>Student academic and placement details</DialogDescription>
 </DialogHeader>
 <div className="document-hero relative h-32 rounded-none border-x-0 border-t-0">
 <div className="absolute -bottom-12 left-8 overflow-hidden rounded-full border-4 border-background shadow-xl">
 <Avatar className="h-24 w-24 rounded-none">
 <AvatarImage src={student.image} alt={student.name} />
 <AvatarFallback className="tone-primary text-2xl font-semibold">
 {student.name.split(' ').map(n => n[0]).join('')}
 </AvatarFallback>
 </Avatar>
 </div>
 </div>

 <div className="pt-16 px-8 pb-8 space-y-6">
 <div className="flex justify-between items-start">
 <div>
 <h2 className="text-3xl font-semibold tracking-tight text-foreground">{student.name}</h2>
 <p className="text-brown-800 font-semibold uppercase tracking-widest text-xs">Roll No: {student.rollNo}</p>
 </div>
 {student.linkedin && (
 <a
 href={student.linkedin}
 target="_blank"
 rel="noopener noreferrer"
 className="tone-primary rounded-full border p-2 hover:bg-brown-800/15"
 >
 <Linkedin className="h-5 w-5" />
 </a>
 )}
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="document-subtle p-4 flex items-center gap-3">
 <div className="tone-primary h-10 w-10 rounded-md border flex items-center justify-center">
 <Briefcase className="h-5 w-5" />
 </div>
 <div>
 <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Company</p>
 <p className="font-bold text-foreground">{student.company}</p>
 </div>
 </div>
 <div className="document-subtle p-4 flex items-center gap-3">
 <div className="tone-primary h-10 w-10 rounded-md border flex items-center justify-center">
 <DollarSign className="h-5 w-5" />
 </div>
 <div>
 <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Package</p>
 <p className="font-bold text-brown-800">{student.package}</p>
 </div>
 </div>
 <div className="document-subtle p-4 flex items-center gap-3">
 <div className="tone-primary h-10 w-10 rounded-md border flex items-center justify-center">
 <GraduationCap className="h-5 w-5" />
 </div>
 <div>
 <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Department</p>
 <p className="font-bold text-foreground">{student.branch}</p>
 </div>
 </div>
 <div className="document-subtle p-4 flex items-center gap-3">
 <div className="tone-primary h-10 w-10 rounded-md border flex items-center justify-center">
 <Calendar className="h-5 w-5" />
 </div>
 <div>
 <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Batch Year</p>
 <p className="font-bold text-foreground">{student.year}</p>
 </div>
 </div>
 </div>

 {student.quote && (
 <div className="tone-accent relative rounded-md border p-6 text-center italic">
 <Quote className="absolute -top-3 -left-3 h-8 w-8 text-accent/30" />
 <p className="text-sm font-medium text-foreground/80">"{student.quote}"</p>
 </div>
 )}

 <div className="flex justify-center pt-2">
 <Badge variant="outline" className="tone-success rounded-full px-4 py-1.5 font-semibold uppercase tracking-widest text-[10px]">
 Verified Placement
 </Badge>
 </div>
 </div>
 </DialogContent>
 </Dialog>
 );
}
