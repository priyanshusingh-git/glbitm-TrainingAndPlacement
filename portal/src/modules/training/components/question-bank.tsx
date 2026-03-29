"use client"

import { useState, useEffect } from"react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from"@/components/ui/card"
import { Badge } from"@/components/ui/badge"
import { Button } from"@/components/ui/button"
import { Input } from"@/components/ui/input"
import { Label } from"@/components/ui/label"
import {
 Search, Filter, Plus, Pencil, Trash2,
 CheckCircle2, AlertCircle, Loader2, HelpCircle
} from"lucide-react"
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from"@/components/ui/table"
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from"@/components/ui/dialog"
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from"@/components/ui/select"
import { useToast } from"@/hooks/use-toast"
import { api } from"@/lib/api"
import { ScrollArea } from"@/components/ui/scroll-area"
import { Checkbox } from"@/components/ui/checkbox"

export function QuestionBank() {
 const [questions, setQuestions] = useState<any[]>([])
 const [loading, setLoading] = useState(true)
 const [searchQuery, setSearchQuery] = useState("")
 const [categoryFilter, setCategoryFilter] = useState("all")
 const [difficultyFilter, setDifficultyFilter] = useState("all")
 const { toast } = useToast()

 // Form State
 const [isOpen, setIsOpen] = useState(false)
 const [isSubmitting, setIsSubmitting] = useState(false)
 const [editingQuestion, setEditingQuestion] = useState<any>(null)
 const [formData, setFormData] = useState({
 text:"",
 type:"MCQ",
 difficulty:"MEDIUM",
 category:"Aptitude",
 explanation:"",
 options: [
 { text:"", isCorrect: false },
 { text:"", isCorrect: false },
 { text:"", isCorrect: false },
 { text:"", isCorrect: false }
 ]
 })

 useEffect(() => {
 fetchQuestions()
 }, [])

 const fetchQuestions = async () => {
 try {
 setLoading(true)
 const data = await api.get("/training/questions")
 setQuestions(data)
 } catch (error) {
 toast({ title:"Error", description:"Failed to load questions", variant:"destructive" })
 } finally {
 setLoading(false)
 }
 }

 const handleAddOption = () => {
 setFormData(prev => ({
 ...prev,
 options: [...prev.options, { text:"", isCorrect: false }]
 }))
 }

 const handleRemoveOption = (index: number) => {
 setFormData(prev => ({
 ...prev,
 options: prev.options.filter((_, i) => i !== index)
 }))
 }

 const handleOptionChange = (index: number, field: string, value: any) => {
 setFormData(prev => {
 const newOptions = [...prev.options]
 newOptions[index] = { ...newOptions[index], [field]: value }

 // If MCQ and setting isCorrect to true, unset others
 if (prev.type ==="MCQ" && field ==="isCorrect" && value === true) {
 newOptions.forEach((opt, i) => {
 if (i !== index) opt.isCorrect = false
 })
 }

 return { ...prev, options: newOptions }
 })
 }

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 if (!formData.text || !formData.category) {
 toast({ title:"Error", description:"Please fill required fields", variant:"destructive" })
 return
 }

 const correctCount = formData.options.filter(o => o.isCorrect).length
 if (correctCount === 0) {
 toast({ title:"Error", description:"Please select at least one correct option", variant:"destructive" })
 return
 }

 try {
 setIsSubmitting(true)
 if (editingQuestion) {
 await api.put(`/training/questions/${editingQuestion.id}`, formData)
 toast({ title:"Success", description:"Question updated successfully" })
 } else {
 await api.post("/training/questions", formData)
 toast({ title:"Success", description:"Question added to bank" })
 }
 setIsOpen(false)
 setEditingQuestion(null)
 resetForm()
 fetchQuestions()
 } catch (error) {
 toast({ title:"Error", description:"Failed to save question", variant:"destructive" })
 } finally {
 setIsSubmitting(false)
 }
 }

 const handleEdit = (q: any) => {
 setEditingQuestion(q)
 setFormData({
 text: q.text,
 type: q.type,
 difficulty: q.difficulty,
 category: q.category,
 explanation: q.explanation ||"",
 options: q.options.map((o: any) => ({ text: o.text, isCorrect: o.isCorrect }))
 })
 setIsOpen(true)
 }

 const handleDelete = async (id: string) => {
 if (!confirm("Are you sure you want to delete this question?")) return
 try {
 await api.delete(`/training/questions/${id}`)
 toast({ title:"Deleted", description:"Question removed from bank" })
 fetchQuestions()
 } catch (error) {
 toast({ title:"Error", description:"Failed to delete question", variant:"destructive" })
 }
 }

 const resetForm = () => {
 setFormData({
 text:"",
 type:"MCQ",
 difficulty:"MEDIUM",
 category:"Aptitude",
 explanation:"",
 options: [
 { text:"", isCorrect: false },
 { text:"", isCorrect: false },
 { text:"", isCorrect: false },
 { text:"", isCorrect: false }
 ]
 })
 }

 const filteredQuestions = questions.filter(q => {
 const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
 q.category.toLowerCase().includes(searchQuery.toLowerCase())
 const matchesCategory = categoryFilter ==="all" || q.category === categoryFilter
 const matchesDifficulty = difficultyFilter ==="all" || q.difficulty === difficultyFilter
 return matchesSearch && matchesCategory && matchesDifficulty
 })

 return (
 <Card className="border-none shadow-none bg-transparent">
 <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
 <div>
 <CardTitle className="text-xl">Question Bank</CardTitle>
 <CardDescription>Manage your repository of test questions.</CardDescription>
 </div>
 <Button onClick={() => { resetForm(); setEditingQuestion(null); setIsOpen(true); }}>
 <Plus className="mr-2 h-4 w-4" /> Add Question
 </Button>
 </CardHeader>
 <CardContent className="px-0">
 <div className="flex flex-col md:flex-row gap-4 mb-6">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
 <Input
 placeholder="Search questions or categories..."
 className="pl-9"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>
 <div className="flex gap-2">
 <Select value={categoryFilter} onValueChange={setCategoryFilter}>
 <SelectTrigger className="w-[150px]">
 <Filter className="mr-2 h-3 w-3" />
 <SelectValue placeholder="Category" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Categories</SelectItem>
 <SelectItem value="Aptitude">Aptitude</SelectItem>
 <SelectItem value="Technical">Technical</SelectItem>
 <SelectItem value="Coding">Coding</SelectItem>
 <SelectItem value="Verbal">Verbal</SelectItem>
 </SelectContent>
 </Select>
 <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
 <SelectTrigger className="w-[150px]">
 <AlertCircle className="mr-2 h-3 w-3" />
 <SelectValue placeholder="Difficulty" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All Difficulties</SelectItem>
 <SelectItem value="EASY">Easy</SelectItem>
 <SelectItem value="MEDIUM">Medium</SelectItem>
 <SelectItem value="HARD">Hard</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>

 <div className="rounded-xl border bg-background">
 <Table>
 <TableHeader>
 <TableRow className="hover:bg-transparent">
 <TableHead className="w-[40%]">Question Text</TableHead>
 <TableHead>Category</TableHead>
 <TableHead>Difficulty</TableHead>
 <TableHead>Type</TableHead>
 <TableHead className="text-right">Actions</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody>
 {loading ? (
 Array(5).fill(0).map((_, i) => (
 <TableRow key={i}>
 <TableCell colSpan={5} className="h-12 animate-pulse bg-muted/20" />
 </TableRow>
 ))
 ) : filteredQuestions.length === 0 ? (
 <TableRow>
 <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
 No questions found.
 </TableCell>
 </TableRow>
 ) : (
 filteredQuestions.map((q) => (
 <TableRow key={q.id}>
 <TableCell className="font-medium">
 <p className="line-clamp-1">{q.text}</p>
 </TableCell>
 <TableCell>
 <Badge variant="outline">{q.category}</Badge>
 </TableCell>
 <TableCell>
 <Badge
 variant="secondary"
 className={
 q.difficulty === 'EASY' ? 'bg-emerald-100 text-emerald-700' :
 q.difficulty === 'HARD' ? 'bg-rose-100 text-rose-700' :
 'bg-amber-100 text-amber-700'
 }
 >
 {q.difficulty}
 </Badge>
 </TableCell>
 <TableCell className="text-xs uppercase text-muted-foreground font-bold">
 {q.type}
 </TableCell>
 <TableCell className="text-right">
 <div className="flex justify-end gap-1">
 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(q)}>
 <Pencil className="h-4 w-4" />
 </Button>
 <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(q.id)}>
 <Trash2 className="h-4 w-4" />
 </Button>
 </div>
 </TableCell>
 </TableRow>
 ))
 )}
 </TableBody>
 </Table>
 </div>
 </CardContent>

 <Dialog open={isOpen} onOpenChange={setIsOpen}>
 <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
 <DialogHeader>
 <DialogTitle>{editingQuestion ?"Edit Question" :"Add New Question"}</DialogTitle>
 <DialogDescription>
 Create a reusable question for your assessments.
 </DialogDescription>
 </DialogHeader>

 <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-2 space-y-6 py-4">
 <div className="space-y-4">
 <div className="space-y-2">
 <Label htmlFor="text">Question Text *</Label>
 <Input
 id="text"
 value={formData.text}
 onChange={(e) => setFormData({ ...formData, text: e.target.value })}
 placeholder="Enter the question text..."
 required
 />
 </div>

 <div className="grid grid-cols-3 gap-4">
 <div className="space-y-2">
 <Label>Category</Label>
 <Select
 value={formData.category}
 onValueChange={(val) => setFormData({ ...formData, category: val })}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="Aptitude">Aptitude</SelectItem>
 <SelectItem value="Technical">Technical</SelectItem>
 <SelectItem value="Coding">Coding</SelectItem>
 <SelectItem value="Verbal">Verbal</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2">
 <Label>Difficulty</Label>
 <Select
 value={formData.difficulty}
 onValueChange={(val) => setFormData({ ...formData, difficulty: val })}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="EASY">Easy</SelectItem>
 <SelectItem value="MEDIUM">Medium</SelectItem>
 <SelectItem value="HARD">Hard</SelectItem>
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2">
 <Label>Type</Label>
 <Select
 value={formData.type}
 onValueChange={(val) => setFormData({ ...formData, type: val })}
 >
 <SelectTrigger>
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="MCQ">MCQ (Single Choice)</SelectItem>
 <SelectItem value="MSQ">MSQ (Multiple Choice)</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>

 <div className="space-y-3 pt-2">
 <div className="flex items-center justify-between">
 <Label className="text-sm font-bold">Options & Correct Answer</Label>
 <Button type="button" variant="outline" size="sm" onClick={handleAddOption} className="h-7 text-xs">
 <Plus className="w-3 h-3 mr-1" /> Add Option
 </Button>
 </div>
 <div className="space-y-2">
 {formData.options.map((opt, index) => (
 <div key={index} className="flex items-center gap-3 bg-muted/30 p-2 rounded-lg border border-transparent hover:border-border transition-all">
 <Checkbox
 id={`opt-${index}`}
 checked={opt.isCorrect}
 onCheckedChange={(checked) => handleOptionChange(index,"isCorrect", checked)}
 className="data-[state=checked]:bg-brown-800"
 />
 <Input
 placeholder={`Option ${index + 1}`}
 className="flex-1 h-8 text-sm focus-visible:ring-amber-500/20"
 value={opt.text}
 onChange={(e) => handleOptionChange(index,"text", e.target.value)}
 required
 />
 {formData.options.length > 2 && (
 <Button
 type="button"
 variant="ghost"
 size="icon"
 className="h-8 w-8 text-muted-foreground hover:text-destructive"
 onClick={() => handleRemoveOption(index)}
 >
 <Trash2 className="w-4 h-4" />
 </Button>
 )}
 </div>
 ))}
 </div>
 <p className="text-[11px] text-muted-foreground italic">
 {formData.type ==="MCQ" ?"Select one correct option." :"Select one or more correct options."}
 </p>
 </div>

 <div className="space-y-2 pt-2">
 <Label htmlFor="explanation" className="flex items-center gap-2">
 Explanation
 <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground">Optional</Badge>
 </Label>
 <Input
 id="explanation"
 value={formData.explanation}
 onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
 placeholder="Explain why the answer is correct..."
 />
 </div>
 </div>

 <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t mt-4">
 <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>Cancel</Button>
 <Button type="submit" disabled={isSubmitting}>
 {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editingQuestion ?"Update Question" :"Save to Bank"}
 </Button>
 </DialogFooter>
 </form>
 </DialogContent>
 </Dialog>
 </Card>
 )
}
