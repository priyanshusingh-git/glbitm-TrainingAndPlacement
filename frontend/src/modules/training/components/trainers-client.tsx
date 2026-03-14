"use client"

import { useState, useEffect } from"react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from"@/components/ui/card"
import { Button } from"@/components/ui/button"
import { Input } from"@/components/ui/input"
import { Label } from"@/components/ui/label"
import {
 UserPlus, Search, Mail, User, Copy, Loader2, Trash2, AlertTriangle,
 Pencil, Filter, MoreHorizontal, FileDown, CheckCircle2, Shield,
 RotateCcw, Building2, MapPin, Globe, Phone, Plus, ExternalLink
} from"lucide-react"
import { motion, AnimatePresence } from"framer-motion"
import { cn } from"@/lib/utils"
import { Badge } from"@/components/ui/badge"
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from"@/components/ui/table"
import { LoadingTable } from"@/components/ui/loading-states"
import { EnhancedEmpty } from"@/components/ui/enhanced-empty"
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from"@/components/ui/dropdown-menu"
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from"@/components/ui/select"
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from"@/components/ui/dialog"


import { api } from"@/lib/api"
import { useToast } from"@/components/ui/use-toast"
import { Avatar, AvatarFallback } from"@/components/ui/avatar"
import { PasswordInput } from"@/components/ui/password-input"
import {
 AlertDialog,
 AlertDialogAction,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
} from"@/components/ui/alert-dialog"




export default function AdminTrainersPage() {
 const { toast } = useToast();
 const [trainers, setTrainers] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [createTrainerOpen, setCreateTrainerOpen] = useState(false);
 const [editTrainerOpen, setEditTrainerOpen] = useState(false);
 const [editingTrainer, setEditingTrainer] = useState<any>(null);
 const [searchQuery, setSearchQuery] = useState("");
 const [trainerTypeFilter, setTrainerTypeFilter] = useState<string>("all");
 const [newTrainerCredentials, setNewTrainerCredentials] = useState<{ email: string, password: string } | null>(null);
 const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
 const [credentialsOpen, setCredentialsOpen] = useState(false);
 const [trainerToDelete, setTrainerToDelete] = useState<string | null>(null);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [isDeleting, setIsDeleting] = useState(false);
 const [fetchError, setFetchError] = useState(false);





 useEffect(() => {
 fetchTrainers();
 }, []);

 const fetchTrainers = async () => {
 try {
 setLoading(true);
 setFetchError(false);
 const data = await api.get('/training/trainers');
 setTrainers(data);
 } catch (error) {
 console.error(error);
 setFetchError(true);
 toast({ variant:"destructive", title:"Error", description:"Failed to fetch trainers" });
 } finally {
 setLoading(false);
 }
 }

 const handleCreateTrainer = async (e: any) => {
 e.preventDefault();
 const formData = new FormData(e.target);
 const data = {
 name: formData.get('name'),
 email: formData.get('email'),
 trainerType: formData.get('trainerType'),
 specialization: formData.get('specialization'),
 department: formData.get('department'),
 mobileNo: formData.get('mobileNo'),
 experience: formData.get('experience')
 };
 try {
 setIsSubmitting(true);
 const response = await api.post('/training/trainers', data);
 toast({ title:"Success", description:"Trainer added successfully" });

 if (response.credentials) {
 setNewTrainerCredentials(response.credentials);
 setCredentialsOpen(true);
 }

 setCreateTrainerOpen(false);
 fetchTrainers();
 } catch (error: any) {
 toast({ variant:"destructive", title:"Error", description: error.message });
 } finally {
 setIsSubmitting(false);
 }
 }

 const handleUpdateTrainer = async (e: any) => {
 e.preventDefault();
 if (!editingTrainer) return;

 const formData = new FormData(e.target);
 const data = {
 name: formData.get('name'),
 email: formData.get('email'),
 trainerType: formData.get('trainerType'),
 specialization: formData.get('specialization'),
 department: formData.get('department'),
 mobileNo: formData.get('mobileNo'),
 experience: formData.get('experience')
 };

 try {
 setIsSubmitting(true);
 await api.put(`/training/trainers/${editingTrainer.id}`, data);
 toast({ title:"Success", description:"Trainer updated successfully" });
 setEditTrainerOpen(false);
 fetchTrainers();
 } catch (error: any) {
 toast({ variant:"destructive", title:"Error", description: error.message });
 } finally {
 setIsSubmitting(false);
 }
 }

 const handleConfirmDelete = async () => {
 if (!trainerToDelete) return;
 try {
 setIsDeleting(true);
 await api.delete(`/training/trainers/${trainerToDelete}`);
 toast({ title:"Success", description:"Trainer deleted" });
 fetchTrainers();
 } catch (error: any) {
 toast({ variant:"destructive", title:"Error", description: error.message });
 } finally {
 setIsDeleting(false);
 setIsDeleteDialogOpen(false);
 setTrainerToDelete(null);
 }
 }

 const handleDeleteClick = (id: string, name: string) => {
 setTrainerToDelete(id);
 setIsDeleteDialogOpen(true);
 }

 const handleEditClick = (trainer: any) => {
 setEditingTrainer(trainer);
 setEditTrainerOpen(true);
 }

 const copyToClipboard = (text: string) => {
 navigator.clipboard.writeText(text);
 toast({ title:"Copied", description:"Copied to clipboard" });
 }

 const filteredTrainers = trainers.filter(t => {

 const matchesSearch = t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
 t.email.toLowerCase().includes(searchQuery.toLowerCase());
 const matchesType = trainerTypeFilter ==="all" || t.trainerProfile?.trainerType === trainerTypeFilter;
 return matchesSearch && matchesType;
 });


 return (
 <div className="space-y-6">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div>
 <h1 className="text-2xl font-bold tracking-tight">Manage Trainers</h1>
 <p className="text-muted-foreground">
 Add and remove training staff members.
 </p>
 </div>
 <Button onClick={() => setCreateTrainerOpen(true)}>
 <UserPlus className="mr-2 h-4 w-4" /> Add New Trainer
 </Button>
 </div>

 <Card>
 <CardHeader>
 <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
 <div>
 <CardTitle>Trainers Directory</CardTitle>
 <CardDescription>
 Total Trainers: {trainers.length}
 </CardDescription>
 </div>
 <div className="flex flex-wrap items-center gap-2">
 <div className="relative">
 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
 <Input
 placeholder="Search trainers..."
 className="pl-9 w-[200px] lg:w-[300px]"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>
 <Select value={trainerTypeFilter} onValueChange={setTrainerTypeFilter}>
 <SelectTrigger className="w-[160px]">
 <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
 <SelectValue placeholder="Trainer Type" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Types</SelectItem>
 <SelectItem value="Technical">Technical</SelectItem>
 <SelectItem value="Soft Skills">Soft Skills</SelectItem>
 <SelectItem value="Aptitude">Aptitude</SelectItem>
 <SelectItem value="Other">Other</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 </CardHeader>
 <CardContent>
 {loading ? (
 <div className="py-10">
 <LoadingTable rows={6} cols={5} />
 </div>
 ) : fetchError ? (
 <div className="text-center py-20 border-2 border-dashed rounded-xl bg-destructive/5 border-destructive/20">
 <div className="bg-destructive/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
 <AlertTriangle className="h-6 w-6 text-destructive" />
 </div>
 <h3 className="text-lg font-semibold text-destructive">Connection Error</h3>
 <p className="text-muted-foreground max-w-sm mx-auto mb-6">We couldn't reach the server to load trainer records.</p>
 <Button onClick={fetchTrainers} variant="outline" className="gap-2">
 <RotateCcw className="h-4 w-4" />
 Retry Loading
 </Button>
 </div>
 ) : filteredTrainers.length === 0 ? (
 <div className="py-20">
 <EnhancedEmpty
 icon={Search}
 title="No trainers found"
 description={searchQuery ? `We couldn't find any trainers matching"${searchQuery}". Try a different search term or filter.` :"No trainers have been added to the platform yet."}
 action={!searchQuery ? {
 label:"Add New Trainer",
 onClick: () => setCreateTrainerOpen(true)
 } : undefined}
 />
 </div>
 ) : (
 <div className="rounded-md border overflow-hidden">
 <Table>
 <TableHeader className="bg-muted/50">
 <TableRow>
 <TableHead className="w-[200px]">Trainer</TableHead>
 <TableHead>Email</TableHead>
 <TableHead>Type</TableHead>
 <TableHead className="text-center">Status</TableHead>
 <TableHead className="text-right">Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 <AnimatePresence mode="popLayout">
 {filteredTrainers.map((trainer) => (
 <motion.tr key={trainer.id}
 className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
 layout
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 >
 <TableCell>
 <div className="flex items-center gap-3">
 <Avatar className="h-9 w-9 ring-2 ring-background">
                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                      {trainer.name?.charAt(0) || 'T'}
                    </AvatarFallback>
 </Avatar>
 <div className="flex flex-col">
 <span className="font-semibold text-sm leading-none">{trainer.name}</span>
 </div>
 </div>
 </TableCell>
 <TableCell className="text-sm">
 {trainer.email}
 </TableCell>
 <TableCell>
 {trainer.trainerProfile?.trainerType ? (
                    <Badge variant="outline" className="font-medium bg-primary/5 text-primary border-primary/20">
                      {trainer.trainerProfile.trainerType}
                    </Badge>
 ) : (
 <span className="text-xs text-muted-foreground italic">Not set</span>
 )}
 </TableCell>
 <TableCell className="text-center">
 <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold">
 Active
 </Badge>
 </TableCell>
 <TableCell className="text-right">
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" className="h-8 w-8 p-0">
 <MoreHorizontal className="h-4 w-4" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-[160px]">
 <DropdownMenuLabel>Actions</DropdownMenuLabel>
 <DropdownMenuItem onClick={() => handleEditClick(trainer)}>
 <Pencil className="mr-2 h-4 w-4" /> Edit Profile
 </DropdownMenuItem>
 <DropdownMenuSeparator />
 <DropdownMenuItem
 className="text-destructive focus:text-destructive focus:bg-destructive/10"
 onClick={() => handleDeleteClick(trainer.id, trainer.name)}
 >
 <Trash2 className="mr-2 h-4 w-4" /> Delete Account
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </TableCell>
 </motion.tr>
 ))}
 </AnimatePresence>
 </TableBody>
 </Table>
 </div>
 )}
 </CardContent>
 </Card>


 {/* Create Trainer Dialog */}
 <Dialog open={createTrainerOpen} onOpenChange={setCreateTrainerOpen}>
 <DialogContent className="max-w-2xl">
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2">
 <UserPlus className="h-5 w-5 text-brown-800" />
 Add New Trainer
 </DialogTitle>
 <DialogDescription>Create a new trainer account with a detailed profile.</DialogDescription>
 </DialogHeader>
 <form onSubmit={handleCreateTrainer} className="space-y-6">
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2 col-span-2 md:col-span-1">
 <Label>Full Name</Label>
 <Input name="name" placeholder="e.g. John Doe" required />
 </div>
 <div className="space-y-2 col-span-2 md:col-span-1">
 <Label>Trainer Type</Label>
 <Select name="trainerType" defaultValue="Technical">
 <SelectTrigger>
 <SelectValue placeholder="Select type" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="Technical">Technical</SelectItem>
 <SelectItem value="Soft Skills">Soft Skills</SelectItem>
 <SelectItem value="Aptitude">Aptitude</SelectItem>
 <SelectItem value="Other">Other</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2 col-span-2 md:col-span-1">
 <Label>Email</Label>
 <Input name="email" type="email" placeholder="john@example.com" required autoComplete="new-email" />
 </div>
 <div className="space-y-2 col-span-2 md:col-span-1">
 <Label>Mobile Number</Label>
 <Input name="mobileNo" placeholder="10-digit number" />
 </div>
 <div className="space-y-2 col-span-2 md:col-span-1">
 <Label>Specialization</Label>
 <Input name="specialization" placeholder="e.g. Java, Python, UI/UX" />
 </div>
 <div className="space-y-2 col-span-2 md:col-span-1">
 <Label>Department</Label>
 <Input name="department" placeholder="e.g. Engineering, Arts" />
 </div>
 <div className="space-y-2 col-span-2">
 <Label>Experience</Label>
 <Input name="experience" placeholder="e.g. 5 years in backend development" />
 </div>
 </div>
 <DialogFooter>
 <Button type="button" variant="outline" onClick={() => setCreateTrainerOpen(false)}>Cancel</Button>
 <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
 {isSubmitting ? (
 <>
 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
 Creating...
 </>
 ) : (
"Create Account"
 )}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>

 {/* Edit Trainer Dialog */}
 <Dialog open={editTrainerOpen} onOpenChange={setEditTrainerOpen}>
 <DialogContent className="max-w-2xl">
 <DialogHeader className="pb-4">
 <DialogTitle className="text-xl font-bold">Edit Trainer Details</DialogTitle>
 <DialogDescription>Update trainer's personal and professional information.</DialogDescription>
 </DialogHeader>
 {editingTrainer && (
 <form onSubmit={handleUpdateTrainer} className="space-y-6 pt-2">
 <div className="grid grid-cols-2 gap-x-6 gap-y-4">
 <div className="space-y-1.5">
 <Label className="text-sm font-semibold">Full Name <span className="text-rose-500">*</span></Label>
 <Input
 name="name"
 defaultValue={editingTrainer.name}
 required
 className="h-10 rounded-xl border-input"
 />
 </div>
 <div className="space-y-1.5">
 <Label className="text-sm font-semibold">Trainer Type <span className="text-rose-500">*</span></Label>
 <Select name="trainerType" defaultValue={editingTrainer.trainerProfile?.trainerType ||"Technical"}>
 <SelectTrigger className="h-10 rounded-xl border-input">
 <SelectValue placeholder="Select type" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="Technical">Technical</SelectItem>
 <SelectItem value="Soft Skills">Soft Skills</SelectItem>
 <SelectItem value="Aptitude">Aptitude</SelectItem>
 <SelectItem value="Other">Other</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-1.5">
 <Label className="text-sm font-semibold">Email <span className="text-rose-500">*</span></Label>
 <Input
 name="email"
 type="email"
 defaultValue={editingTrainer.email}
 required
 className="h-10 rounded-xl border-input"
 disabled
 />
 </div>
 <div className="space-y-1.5">
 <Label className="text-sm font-semibold">Mobile Number</Label>
 <Input
 name="mobileNo"
 defaultValue={editingTrainer.trainerProfile?.mobileNo ||""}
 className="h-10 rounded-xl border-input"
 />
 </div>
 <div className="space-y-1.5">
 <Label className="text-sm font-semibold">Specialization</Label>
 <Input
 name="specialization"
 defaultValue={editingTrainer.trainerProfile?.specialization ||""}
 className="h-10 rounded-xl border-input"
 />
 </div>
 <div className="space-y-1.5">
 <Label className="text-sm font-semibold">Department</Label>
 <Input
 name="department"
 defaultValue={editingTrainer.trainerProfile?.department ||""}
 className="h-10 rounded-xl border-input"
 />
 </div>
 <div className="space-y-1.5 col-span-2">
 <Label className="text-sm font-semibold">Experience</Label>
 <Input
 name="experience"
 defaultValue={editingTrainer.trainerProfile?.experience ||""}
 className="h-10 rounded-xl border-input"
 />
 </div>
 </div>
 <DialogFooter className="pt-6 border-t mt-6">
 <Button
 type="button"
 variant="outline"
 onClick={() => setEditTrainerOpen(false)}
 className="rounded-xl h-10 px-6 font-medium"
 >
 Cancel
 </Button>
 <Button
 type="submit"
 disabled={isSubmitting}
 className="min-w-[140px] rounded-xl h-10 font-medium"
 >
 {isSubmitting ? (
 <>
 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
 Updating...
 </>
 ) : (
"Save Changes"
 )}
 </Button>
 </DialogFooter>
 </form>
 )}
 </DialogContent>
 </Dialog>


 {/* Success/Credentials Dialog */}
 <Dialog open={credentialsOpen} onOpenChange={setCredentialsOpen}>
 <DialogContent>
 <DialogHeader>
 <DialogTitle className="text-green-600">Trainer Created Successfully</DialogTitle>
 <DialogDescription>
 Please share these credentials with the trainer. They have also been sent via email (if configured).
 </DialogDescription>
 </DialogHeader>

 {newTrainerCredentials && (
 <div className="space-y-4 p-4 bg-muted/50 rounded-xl border">
 <div className="space-y-1">
 <Label className="text-xs text-muted-foreground uppercase">Email</Label>
 <div className="flex items-center justify-between gap-2 p-2 bg-background border rounded">
 <span className="font-mono text-sm">{newTrainerCredentials.email}</span>
 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(newTrainerCredentials.email)}>
 <Copy className="h-3 w-3" />
 </Button>
 </div>
 </div>
 <div className="space-y-1">
 <Label className="text-xs text-muted-foreground uppercase">Password</Label>
 <div className="flex items-center justify-between gap-2 p-2 bg-background border rounded">
 <span className="font-mono text-sm">{newTrainerCredentials.password}</span>
 <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(newTrainerCredentials.password)}>
 <Copy className="h-3 w-3" />
 </Button>
 </div>
 </div>
 </div>
 )}

 <DialogFooter>
 <Button onClick={() => setCredentialsOpen(false)}>Done</Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>

 {/* Delete Confirmation Dialog */}
 <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle className="flex items-center gap-2">
 <AlertTriangle className="h-5 w-5 text-destructive" />
 Are you absolutely sure?
 </AlertDialogTitle>
 <AlertDialogDescription>
 This action cannot be undone. This will permanently delete the trainer's account
 and remove their access to the platform.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel disabled={isDeleting} onClick={() => setTrainerToDelete(null)}>Cancel</AlertDialogCancel>
 <AlertDialogAction
 onClick={handleConfirmDelete}
 disabled={isDeleting}
 className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
 >
 {isDeleting ? (
 <>
 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
 Deleting...
 </>
 ) : (
"Delete Trainer Account"
 )}
 </AlertDialogAction>
 </AlertDialogFooter>

 </AlertDialogContent>
 </AlertDialog>
 </div >

 )
}
