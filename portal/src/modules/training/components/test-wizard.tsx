"use client"

import { useState, useEffect } from"react"
import {
 Dialog, DialogContent, DialogDescription,
 DialogFooter, DialogHeader, DialogTitle
} from"@/components/ui/dialog"
import { Card, CardContent } from"@/components/ui/card"
import { Button } from"@/components/ui/button"
import { Input } from"@/components/ui/input"
import { Label } from"@/components/ui/label"
import { Badge } from"@/components/ui/badge"
import { Checkbox } from"@/components/ui/checkbox"
import { ScrollArea } from"@/components/ui/scroll-area"
import {
 Search, ChevronRight, ChevronLeft, Plus,
 Trash2, GripVertical, CheckCircle2, Clock,
 FileText, HelpCircle, Loader2
} from"lucide-react"
import { api } from"@/lib/api"
import { useToast } from"@/hooks/use-toast"
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from"@/components/ui/select"

interface TestWizardProps {
 isOpen: boolean
 onClose: () => void
 onSuccess: () => void
 initialData?: any
 groups?: { id: string, name: string }[]
}

export function TestWizard({ isOpen, onClose, onSuccess, initialData, groups = [] }: TestWizardProps) {
 const [step, setStep] = useState(1)
 const [loading, setLoading] = useState(false)
 const [questions, setQuestions] = useState<any[]>([])
 const [searchQuery, setSearchQuery] = useState("")
 const { toast } = useToast()

 const [formData, setFormData] = useState({
 title:"",
 type:"Aptitude",
 date:"",
 duration: 60,
 totalMarks: 0,
 testUrl:"",
 platform:"",
 groupIds: [] as string[],
 questionIds: [] as string[]
 })

 useEffect(() => {
 if (initialData) {
 setFormData({
 title: initialData.title ||"",
 type: initialData.type ||"Aptitude",
 date: initialData.date ? new Date(initialData.date).toISOString().slice(0, 16) :"",
 duration: initialData.duration || 60,
 totalMarks: initialData.totalMarks || 0,
 testUrl: initialData.testUrl ||"",
 platform: initialData.platform ||"",
 groupIds: initialData.assignedGroups?.map((g: any) => g.id) || [],
 questionIds: initialData.questions?.map((q: any) => q.questionId) || []
 })
 } else {
 resetForm()
 }
 if (isOpen) fetchQuestions()
 }, [initialData, isOpen])

 const fetchQuestions = async () => {
 try {
 const data = await api.get("/training/questions")
 setQuestions(data)
 } catch (error) {
 console.error(error)
 }
 }

 const resetForm = () => {
 setFormData({
 title:"",
 type:"Aptitude",
 date:"",
 duration: 60,
 totalMarks: 0,
 testUrl:"",
 platform:"",
 groupIds: [],
 questionIds: []
 })
 setStep(1)
 }

 const toggleQuestion = (id: string) => {
 setFormData(prev => ({
 ...prev,
 questionIds: prev.questionIds.includes(id)
 ? prev.questionIds.filter(qid => qid !== id)
 : [...prev.questionIds, id]
 }))
 }

 const handleSubmit = async () => {
 try {
 setLoading(true)
 const payload = {
 ...formData,
 date: new Date(formData.date).toISOString()
 }

 if (initialData) {
 await api.put(`/tests/${initialData.id}`, payload)
 } else {
 await api.post("/tests", payload)
 }

 toast({ title:"Success", description: `Assessment ${initialData ? 'updated' : 'created'} successfully` })
 onSuccess()
 onClose()
 } catch (error) {
 toast({ title:"Error", description:"Failed to save assessment", variant:"destructive" })
 } finally {
 setLoading(false)
 }
 }

 return (
 <Dialog open={isOpen} onOpenChange={(val) => { if (!val) onClose() }}>
 <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
 <DialogHeader className="p-6 pb-2">
 <DialogTitle>
 {initialData ? "Edit Assessment" : "Create New Assessment"}
 </DialogTitle>
 <DialogDescription>
 Set the basic parameters and schedule for your external assessment.
 </DialogDescription>
 </DialogHeader>

 <div className="flex-1 overflow-hidden px-6">
 <div className="space-y-4 py-4">
 <div className="space-y-2">
 <Label htmlFor="title">Assessment Title *</Label>
 <Input
 id="title"
 value={formData.title}
 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
 placeholder="e.g. CoCubes Round 1 (Aptitude)"
 />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label>Assessment Type</Label>
 <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
 <SelectTrigger><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="Aptitude">Aptitude</SelectItem>
 <SelectItem value="Technical">Technical</SelectItem>
 <SelectItem value="Coding">Coding</SelectItem>
 <SelectItem value="Verbal">Verbal</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2">
 <Label>Assessment Platform</Label>
 <Input 
 value={formData.platform}
 onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
 placeholder="e.g. HackerRank"
 />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label>Date Conducted *</Label>
 <Input
 type="datetime-local"
 value={formData.date}
 onChange={(e) => setFormData({ ...formData, date: e.target.value })}
 />
 </div>
 <div className="space-y-2">
 <Label>Total Marks *</Label>
 <Input
 type="number"
 value={formData.totalMarks}
 onChange={(e) => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
 />
 </div>
 <div className="space-y-2">
 <Label>Assign to Groups (Optional)</Label>
 <ScrollArea className="h-[120px] rounded-md border p-4">
 <div className="grid grid-cols-2 gap-4">
 {groups.length === 0 ? (
 <p className="text-sm text-muted-foreground col-span-2 text-center py-4">No groups available. Create a training group first.</p>
 ) : (
 groups.map(group => (
 <div key={group.id} className="flex items-center space-x-2">
 <Checkbox
 id={`group-${group.id}`}
 checked={formData.groupIds.includes(group.id)}
 onCheckedChange={(checked: boolean) => {
 setFormData(prev => ({
 ...prev,
 groupIds: checked
 ? [...prev.groupIds, group.id]
 : prev.groupIds.filter(id => id !== group.id)
 }))
 }}
 />
 <label htmlFor={`group-${group.id}`} className="text-sm cursor-pointer truncate max-w-[200px]" title={group.name}>
 {group.name}
 </label>
 </div>
 ))
 )}
 </div>
 </ScrollArea>
 </div>
 </div>
 </div>
 </div>

 <DialogFooter className="p-6 border-t bg-muted/20">
 <div className="ml-auto flex gap-2">
 <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
 <Button onClick={handleSubmit} disabled={loading || !formData.title || !formData.date}>
 {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : initialData ? "Update Assessment" : "Create Assessment"}
 </Button>
 </div>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 )
}
