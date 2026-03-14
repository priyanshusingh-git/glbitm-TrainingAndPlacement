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
}

export function TestWizard({ isOpen, onClose, onSuccess, initialData }: TestWizardProps) {
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

 const selectedQuestions = questions.filter(q => formData.questionIds.includes(q.id))
 const totalSelectedMarks = selectedQuestions.length * 10 // Assuming 10 marks per question for now or we could store marks per question

 return (
 <Dialog open={isOpen} onOpenChange={(val) => { if (!val) onClose() }}>
 <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
 <DialogHeader className="p-6 pb-2">
 <div className="flex items-center gap-2 mb-2">
 <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-brown-800' : 'bg-muted'}`} />
 <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-brown-800' : 'bg-muted'}`} />
 <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? 'bg-brown-800' : 'bg-muted'}`} />
 </div>
 <DialogTitle className="flex items-center gap-2">
 {step === 1 &&"General Information"}
 {step === 2 &&"Select Questions"}
 {step === 3 &&"Final Review"}
 <Badge variant="outline" className="ml-auto font-mono text-[10px]">Step {step}/3</Badge>
 </DialogTitle>
 <DialogDescription>
 {step === 1 &&"Set the basic parameters and schedule for your assessment."}
 {step === 2 &&"Browse and select questions from the repository to add to this test."}
 {step === 3 &&"Review the structure and confirm the deployment settings."}
 </DialogDescription>
 </DialogHeader>

 <div className="flex-1 overflow-hidden px-6">
 {step === 1 && (
 <div className="space-y-4 py-4">
 <div className="space-y-2">
 <Label htmlFor="title">Assessment Title *</Label>
 <Input
 id="title"
 value={formData.title}
 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
 placeholder="e.g. Full Stack Technical Round"
 />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label>Category</Label>
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
 <Label>Scheduled Date & Time *</Label>
 <Input
 type="datetime-local"
 value={formData.date}
 onChange={(e) => setFormData({ ...formData, date: e.target.value })}
 />
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label>Duration (Minutes) *</Label>
 <Input
 type="number"
 value={formData.duration}
 onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
 />
 </div>
 <div className="space-y-2">
 <Label>Point System</Label>
 <div className="pt-2">
 <Badge variant="secondary" className="px-3 py-1">Auto-calculate per question</Badge>
 </div>
 </div>
 </div>
 </div>
 )}

 {step === 2 && (
 <div className="py-4 flex flex-col h-full overflow-hidden gap-4">
 <div className="flex items-center gap-2">
 <div className="relative flex-1">
 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
 <Input
 placeholder="Search question bank..."
 className="pl-9 h-9"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>
 <Badge variant="default" className="h-9 px-4">
 {formData.questionIds.length} Selected
 </Badge>
 </div>

 <ScrollArea className="flex-1 rounded-lg border bg-muted/20">
 <div className="p-1 space-y-1">
 {questions.filter(q => q.text.toLowerCase().includes(searchQuery.toLowerCase())).map((q) => {
 const isSelected = formData.questionIds.includes(q.id)
 return (
 <div
 key={q.id}
 onClick={() => toggleQuestion(q.id)}
 className={`flex items-start gap-3 p-3 rounded-md cursor-pointer border-2 transition-all ${isSelected ? 'border-brown-800 bg-brown-800/5 shadow-sm' : 'border-transparent hover:bg-background h-16'}`}
 >
 <div className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center ${isSelected ? 'bg-brown-800 border-brown-800 text-white' : 'border-muted-foreground/30'}`}>
 {isSelected && <CheckCircle2 className="h-3 w-3" />}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-medium line-clamp-1">{q.text}</p>
 <div className="flex items-center gap-2 mt-1">
 <Badge variant="outline" className="text-[9px] uppercase">{q.category}</Badge>
 <Badge variant="secondary" className="text-[9px] uppercase">{q.difficulty}</Badge>
 </div>
 </div>
 </div>
 )
 })}
 </div>
 </ScrollArea>
 </div>
 )}

 {step === 3 && (
 <div className="py-4 space-y-6 overflow-y-auto max-h-[50vh]">
 <div className="grid grid-cols-3 gap-4">
 <Card className="p-3 bg-brown-800/5 border-brown-800/10">
 <Label className="text-[10px] uppercase text-muted-foreground">Type</Label>
 <p className="font-bold text-sm">{formData.type}</p>
 </Card>
 <Card className="p-3 bg-indigo-500/5 border-indigo-500/10">
 <Label className="text-[10px] uppercase text-muted-foreground">Questions</Label>
 <p className="font-bold text-sm">{formData.questionIds.length}</p>
 </Card>
 <Card className="p-3 bg-amber-500/5 border-amber-500/10">
 <Label className="text-[10px] uppercase text-muted-foreground">Duration</Label>
 <p className="font-bold text-sm">{formData.duration}m</p>
 </Card>
 </div>

 <div className="space-y-3">
 <Label className="flex items-center gap-2">
 <HelpCircle className="w-4 h-4 text-brown-800" />
 Test Structure
 </Label>
 {selectedQuestions.map((q, idx) => (
 <div key={q.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg border group animate-in fade-in slide-in-from-right-1 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
 <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center border-brown-800/20 bg-background text-[10px] font-bold">
 {idx + 1}
 </Badge>
 <p className="text-sm flex-1 truncate">{q.text}</p>
 <Badge variant="secondary" className="text-[9px]">{q.difficulty}</Badge>
 </div>
 ))}
 {selectedQuestions.length === 0 && (
 <p className="text-sm text-center py-8 text-muted-foreground italic border-2 border-dashed rounded-xl">
 No questions selected. Go back to step 2.
 </p>
 )}
 </div>
 </div>
 )}
 </div>

 <DialogFooter className="p-6 border-t bg-muted/20">
 {step > 1 && (
 <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={loading}>
 <ChevronLeft className="mr-2 h-4 w-4" /> Previous
 </Button>
 )}
 <div className="ml-auto flex gap-2">
 <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
 {step < 3 ? (
 <Button
 onClick={() => {
 if (step === 1 && !formData.title) {
 toast({ title:"Error", description:"Please enter a title", variant:"destructive" })
 return
 }
 setStep(step + 1)
 }}
 >
 Next <ChevronRight className="ml-2 h-4 w-4" />
 </Button>
 ) : (
 <Button onClick={handleSubmit} disabled={loading || selectedQuestions.length === 0} className="min-w-[120px]">
 {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : initialData ?"Update Test" :"Finish & Deploy"}
 </Button>
 )}
 </div>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 )
}
