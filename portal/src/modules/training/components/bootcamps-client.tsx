"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus, Calendar as CalendarIcon, Loader2,
  Trash2, Edit, MoreHorizontal,
  Users, Info
} from "lucide-react";
import { fetchBootcamps } from "@/services/training.client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { Bootcamp } from "@/types/training";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/layout/page-header";

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
        toast({ title: "Success", description: "Bootcamp updated successfully" });
      } else {
        await api.post('/bootcamps', payload);
        toast({ title: "Success", description: "Bootcamp scheduled successfully" });
      }

      setIsOpen(false);
      resetForm();
      loadBootcamps();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save bootcamp",
        variant: "destructive",
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
      toast({ title: "Deleted", description: "Bootcamp removed successfully" });
      loadBootcamps();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete bootcamp" });
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
      <PageHeader 
        title="Bootcamps Management"
        description="Schedule and manage intensive training programs for student cohorts."
        action={
          <Button onClick={handleCreateNew} className="shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Create Bootcamp
          </Button>
        }
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-md">
          <DialogHeader>
            <DialogTitle>{editingBootcamp ? "Edit Bootcamp" : "Schedule New Bootcamp"}</DialogTitle>
            <DialogDescription>
              {editingBootcamp ? "Update intensive training details." : "Add details for the new intensive training session."}
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
                className="rounded-sm"
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
                  className="rounded-sm"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label className="flex items-center gap-2">
                  Assigned Groups
                  {selectedGroupIds.length > 0 && (
                    <span className="bg-brown-800/10 text-brown-800 px-2 py-0.5 rounded-sm text-[10px] font-bold border border-brown-800/20">
                      {selectedGroupIds.length} Selected
                    </span>
                  )}
                </Label>
                <div className="border rounded-md p-3 space-y-2 max-h-[150px] overflow-y-auto bg-muted/30">
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
                          className="text-sm font-medium leading-none cursor-pointer"
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
                className="min-h-[100px] rounded-sm"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="rounded-sm">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingBootcamp ? "Save Changes" : "Schedule Bootcamp"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="premium-muted overflow-hidden rounded-md border border-border/60 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-transparent hover:bg-transparent border-b border-border/60">
              <TableHead className="font-bold text-foreground py-4">Bootcamp Program</TableHead>
              <TableHead className="font-bold text-foreground py-4">StartDate</TableHead>
              <TableHead className="font-bold text-foreground py-4">Aligned Cohorts</TableHead>
              <TableHead className="font-bold text-foreground py-4">Scope & Objectives</TableHead>
              <TableHead className="text-right font-bold text-foreground py-4 px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-brown-800/40" />
                  <p className="text-xs text-muted-foreground mt-4 font-medium uppercase tracking-widest">Retrieving Program Data</p>
                </TableCell>
              </TableRow>
            ) : bootcamps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <CalendarIcon className="h-8 w-8 text-muted-foreground/20" />
                    <p className="text-sm font-medium text-muted-foreground">No bootcamps scheduled for the current cycle.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              bootcamps.map((bootcamp: any) => (
                <TableRow key={bootcamp.id} className="group hover:bg-brown-800/[0.02] transition-colors border-b border-border/40 last:border-0">
                  <TableCell className="font-bold text-brown-800 py-5">{bootcamp.title}</TableCell>
                  <TableCell className="py-5">
                    <div className="flex items-center gap-2 font-medium text-sm">
                      <CalendarIcon className="h-3.5 w-3.5 text-brown-800/40" />
                      {format(new Date(bootcamp.date), "PPP")}
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    {bootcamp.assignedGroups?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {bootcamp.assignedGroups.map((g: any) => (
                          <div key={g.id} className="flex items-center gap-1.5 bg-brown-800/5 text-brown-800 px-2 py-0.5 rounded-sm text-[10px] font-bold border border-brown-800/10">
                            <Users className="h-3 w-3 opacity-60" />
                            {g.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground/40 italic text-xs">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[300px] text-[13px] text-muted-foreground leading-relaxed py-5" title={bootcamp.description}>
                    <div className="line-clamp-2">{bootcamp.description}</div>
                  </TableCell>
                  <TableCell className="text-right py-5 px-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-sm hover:bg-brown-800/10 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-md border-border p-2 shadow-lg">
                        <DropdownMenuItem onClick={() => handleEdit(bootcamp)} className="rounded-sm py-2 px-3 font-medium cursor-pointer">
                          <Edit className="mr-2 h-4 w-4 text-brown-800" /> Edit Program
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-sm py-2 px-3 font-medium cursor-pointer"
                          onClick={() => handleDelete(bootcamp.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Terminate Session
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
