"use client";

import { useEffect, useState } from"react";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { Label } from"@/components/ui/label";
import { Textarea } from"@/components/ui/textarea";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from"@/components/ui/dialog";
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from"@/components/ui/table";
import {
 Plus, Calendar as CalendarIcon, Loader2,
 Trash2, Edit, MoreHorizontal, GraduationCap,
 Users, Info, Laptop, AlertCircle
} from"lucide-react";
import { fetchBootcamps, createBootcamp } from"@/services/training.client";
import {
 Select, SelectContent, SelectItem,
 SelectTrigger, SelectValue
} from"@/components/ui/select";
import {
 DropdownMenu, DropdownMenuContent, DropdownMenuItem,
 DropdownMenuTrigger
} from"@/components/ui/dropdown-menu";
import { api } from"@/lib/api";
import { Bootcamp } from"@/types/training";
import { format } from"date-fns";
import { useToast } from"@/hooks/use-toast"; // Assuming hook exists

export default function AdminBootcampsPage() {
 const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
 const [loading, setLoading] = useState(true);
 const [isOpen, setIsOpen] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const { toast } = useToast();

 // Form State
 const [title, setTitle] = useState("");
 const [description, setDescription] = useState("");
 const [date, setDate] = useState("");
 const [groups, setGroups] = useState<any[]>([]);
 const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
 const [editingBootcamp, setEditingBootcamp] = useState<any>(null);
 const [isDeleting, setIsDeleting] = useState(false);

 useEffect(() => {
 loadBootcamps();
 loadGroups();
 }, []);

 const loadGroups = async () => {
 try {
 const data = await api.get('/training/groups');
 setGroups(data);
 } catch (error) {
 console.error(error);
 }
 };

 const loadBootcamps = async () => {
 try {
 const data = await fetchBootcamps();
 setBootcamps(data);
 } catch (error) {
 console.error(error);
 } finally {
 setLoading(false);
 }
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setIsSubmitting(true);
 try {
 const payload = {
 title,
 description,
 date,
 groupIds: selectedGroupIds
 };

 if (editingBootcamp) {
 await api.put(`/bootcamps/${editingBootcamp.id}`, payload);
 toast({ title:"Success", description:"Bootcamp updated successfully" });
 } else {
 await api.post('/bootcamps', payload);
 toast({ title:"Success", description:"Bootcamp scheduled successfully" });
 }

 setIsOpen(false);
 resetForm();
 loadBootcamps();
 } catch (error) {
 toast({
 title:"Error",
 description:"Failed to save bootcamp",
 variant:"destructive",
 });
 } finally {
 setIsSubmitting(false);
 }
 };

 const handleDelete = async (id: string) => {
 if (!confirm("Are you sure you want to delete this bootcamp?")) return;

 setIsDeleting(true);
 try {
 await api.delete(`/bootcamps/${id}`);
 toast({ title:"Deleted", description:"Bootcamp removed successfully" });
 loadBootcamps();
 } catch (error) {
 toast({ variant:"destructive", title:"Error", description:"Failed to delete bootcamp" });
 } finally {
 setIsDeleting(false);
 }
 };

 const handleEdit = (bootcamp: any) => {
 setEditingBootcamp(bootcamp);
 setTitle(bootcamp.title);
 setDescription(bootcamp.description);
 setDate(new Date(bootcamp.date).toISOString().split('T')[0]);
 setSelectedGroupIds(bootcamp.assignedGroups?.map((g: any) => g.id) || []);
 setIsOpen(true);
 };

 const handleCreateNew = () => {
 setEditingBootcamp(null);
 resetForm();
 setIsOpen(true);
 };

 const resetForm = () => {
 setTitle("");
 setDescription("");
 setDate("");
 setSelectedGroupIds([]);
 };

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold tracking-tight">Bootcamps Management</h1>
 <p className="text-muted-foreground">Schedule and manage intensive training programs.</p>
 </div>
 <Dialog open={isOpen} onOpenChange={setIsOpen}>
 <Button onClick={handleCreateNew}>
 <Plus className="mr-2 h-4 w-4" /> Create Bootcamp
 </Button>
 <DialogContent className="sm:max-w-[425px]">
 <DialogHeader>
 <DialogTitle>{editingBootcamp ?"Edit Bootcamp" :"Schedule New Bootcamp"}</DialogTitle>
 <DialogDescription>
 {editingBootcamp ?"Update intensive training details." :"Add details for the new intensive training session."}
 </DialogDescription>
 </DialogHeader>
 <form onSubmit={handleSubmit} className="space-y-4 py-4">
 <div className="space-y-2">
 <Label htmlFor="title">Title</Label>
 <Input
 id="title"
 value={title}
 onChange={(e) => setTitle(e.target.value)}
 placeholder="e.g. Full Stack Development"
 required
 />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label htmlFor="date">Start Date</Label>
 <Input
 id="date"
 type="date"
 value={date}
 onChange={(e) => setDate(e.target.value)}
 required
 />
 </div>
 <div className="space-y-2 col-span-2">
 <Label className="flex items-center gap-2">
 Assigned Groups
 {selectedGroupIds.length > 0 && (
                  <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">
                    {selectedGroupIds.length} Selected
                  </span>
 )}
 </Label>
 <div className="border rounded-md p-3 space-y-2 max-h-[150px] overflow-y-auto bg-muted/50">
 {groups.length === 0 ? (
 <p className="text-xs text-muted-foreground italic">No groups available</p>
 ) : (
 groups.map(g => (
 <div key={g.id} className="flex items-center space-x-2">
 <input
 type="checkbox"
 id={`group-${g.id}`}
 checked={selectedGroupIds.includes(g.id)}
 onChange={(e) => {
 if (e.target.checked) {
 setSelectedGroupIds(prev => [...prev, g.id]);
 } else {
 setSelectedGroupIds(prev => prev.filter(id => id !== g.id));
 }
 }}
 className="h-4 w-4 rounded border-gray-300 text-brown-800 focus:ring-amber-500 cursor-pointer"
 />
 <label
 htmlFor={`group-${g.id}`}
 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
 >
 {g.name}
 </label>
 </div>
 ))
 )}
 </div>
 <p className="text-[10px] text-muted-foreground flex items-center gap-1">
 <Info className="h-3 w-3" /> Select one or more groups to link with this bootcamp.
 </p>
 </div>
 </div>
 <div className="space-y-2">
 <Label htmlFor="description">Description</Label>
 <Textarea
 id="description"
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 placeholder="Bootcamp objectives & curriculum..."
 className="min-h-[100px]"
 required
 />
 </div>
 <DialogFooter>
 <Button type="submit" disabled={isSubmitting}>
 {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
 {editingBootcamp ?"Save Changes" :"Schedule"}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>
 </div>

 <div className="border rounded-md">
 <Table>
 <TableHeader>
 <TableRow className="bg-muted/50">
 <TableHead className="font-bold">Bootcamp Program</TableHead>
 <TableHead className="font-bold">Date</TableHead>
 <TableHead className="font-bold">Aligned Group</TableHead>
 <TableHead className="font-bold">Description</TableHead>
 <TableHead className="text-right font-bold">Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {loading ? (
 <TableRow>
 <TableCell colSpan={5} className="h-32 text-center">
 <Loader2 className="h-8 w-8 animate-spin mx-auto text-brown-800" />
 </TableCell>
 </TableRow>
 ) : bootcamps.length === 0 ? (
 <TableRow>
 <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
 No bootcamps scheduled yet.
 </TableCell>
 </TableRow>
 ) : (
 bootcamps.map((bootcamp: any) => (
 <TableRow key={bootcamp.id} className="hover:bg-muted/30">
 <TableCell className="font-bold text-brown-800">{bootcamp.title}</TableCell>
 <TableCell>
 <div className="flex items-center gap-2">
 <CalendarIcon className="h-4 w-4 text-muted-foreground" />
 {format(new Date(bootcamp.date),"PPP")}
 </div>
 </TableCell>
 <TableCell>
 {bootcamp.assignedGroups?.length > 0 ? (
 <div className="flex flex-wrap gap-1">
 {bootcamp.assignedGroups.map((g: any) => (
                    <div key={g.id} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium border border-primary/20">
 <Users className="h-3 w-3" />
 {g.name}
 </div>
 ))}
 </div>
 ) : (
 <span className="text-muted-foreground italic text-xs">No groups assigned</span>
 )}
 </TableCell>
 <TableCell className="max-w-[250px] text-sm text-muted-foreground" title={bootcamp.description}>
 <div className="line-clamp-2">{bootcamp.description}</div>
 </TableCell>
 <TableCell className="text-right">
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="ghost" size="icon">
 <MoreHorizontal className="h-4 w-4" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end">
 <DropdownMenuItem onClick={() => handleEdit(bootcamp)}>
 <Edit className="mr-2 h-4 w-4" /> Edit Details
 </DropdownMenuItem>
 <DropdownMenuItem
 className="text-destructive focus:bg-destructive/10 focus:text-destructive"
 onClick={() => handleDelete(bootcamp.id)}
 >
 <Trash2 className="mr-2 h-4 w-4" /> Delete Bootcamp
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </TableCell>
 </TableRow>
 ))
 )}
 </TableBody>
 </Table>
 </div>
 </div>
 );
}
