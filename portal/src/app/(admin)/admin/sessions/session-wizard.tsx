"use client"

import { useState, useEffect, useMemo } from"react"
import {
 Dialog, DialogContent, DialogDescription,
 DialogFooter, DialogHeader, DialogTitle
} from"@/components/ui/dialog"
import { Button } from"@/components/ui/button"
import { Input } from"@/components/ui/input"
import { Label } from"@/components/ui/label"
import { Badge } from"@/components/ui/badge"
import { ScrollArea } from"@/components/ui/scroll-area"
import {
 Search, ChevronRight, ChevronLeft, Calendar,
 Clock, Users, BookOpen, MapPin, Loader2, CheckCircle2,
 Filter, Info
} from"lucide-react"
import { api } from"@/lib/api"
import { useToast } from"@/components/ui/use-toast"
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from"@/components/ui/select"
import { Checkbox } from"@/components/ui/checkbox"
import { cn } from"@/lib/utils"

const MODULES = ["Technical","Aptitude","Verbal","Soft Skills","Guest Lecture","Mock Interview","Other"]
const WEEKDAYS = [
 { label:"M", value: 1, full:"Monday" },
 { label:"T", value: 2, full:"Tuesday" },
 { label:"W", value: 3, full:"Wednesday" },
 { label:"T", value: 4, full:"Thursday" },
 { label:"F", value: 5, full:"Friday" },
 { label:"S", value: 6, full:"Saturday" },
]

interface SessionWizardProps {
 isOpen: boolean
 onClose: () => void
 onSuccess: () => void
 groups: any[] // full group objects from prisma
}

export function SessionWizard({ isOpen, onClose, onSuccess, groups }: SessionWizardProps) {
 const [step, setStep] = useState(1)
 const [loading, setLoading] = useState(false)
 const [searchQuery, setSearchQuery] = useState("")
 const { toast } = useToast()

 const [formData, setFormData] = useState({
 batch:"",
 sessionType:"group" as"single" |"group",
 module:"Technical",
 groupType:"ALL",
 branch:"ALL",
 groupIds: [] as string[],
 startDate:"",
 startTime:"09:10",
 endTime:"10:50",
 repeatDays: [] as number[],
 trainerOverrides: {} as Record<string, string>,
 occurrences: 1
 })

 const [availableTrainers, setAvailableTrainers] = useState<any[]>([])

 useEffect(() => {
 if (!isOpen) {
 resetForm()
 } else {
 fetchTrainers()
 }
 }, [isOpen])

 const fetchTrainers = async () => {
 try {
 const data = await api.get("/training/trainers")
 setAvailableTrainers(data)
 } catch (error) {
 console.error("Failed to fetch trainers")
 }
 }

 const resetForm = () => {
 setFormData({
 batch:"",
 sessionType:"group",
 module:"Technical",
 groupType:"ALL",
 branch:"ALL",
 groupIds: [],
 startDate:"",
 startTime:"09:10",
 endTime:"10:50",
 repeatDays: [],
 trainerOverrides: {},
 occurrences: 1
 })
 setStep(1)
 }

 const batches = useMemo(() => Array.from(new Set(groups.map(g => g.year))).sort(), [groups])
 const branches = useMemo(() => Array.from(new Set(groups.map(g => g.branch))).sort(), [groups])

 const filteredGroups = useMemo(() => {
 return groups.filter(g => {
 const matchesBatch = !formData.batch || g.year === formData.batch
 const matchesBranch = formData.branch ==="ALL" || g.branch === formData.branch
 const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 g.branch.toLowerCase().includes(searchQuery.toLowerCase())
 return matchesBatch && matchesBranch && matchesSearch
 })
 }, [groups, formData.batch, formData.branch, searchQuery])

 const handleNext = () => {
 if (step === 1) {
 if (!formData.batch) {
 toast({ title:"Required", description:"Please select a target batch." })
 return
 }
 setStep(2)
 } else if (step === 2) {
 if (formData.groupIds.length === 0) {
 toast({ title:"Required", description:"Select at least one group." })
 return
 }
 setStep(3)
 } else if (step === 3) {
 if (!formData.startDate || !formData.startTime || !formData.endTime) {
 toast({ title:"Required", description:"Complete scheduling parameters." })
 return
 }
 setStep(4)
 }
 }

 const toggleDay = (day: number) => {
 setFormData(prev => ({
 ...prev,
 repeatDays: prev.repeatDays.includes(day)
 ? prev.repeatDays.filter(d => d !== day)
 : [...prev.repeatDays, day].sort()
 }))
 }

 const selectWorkingDays = () => {
 setFormData(prev => ({ ...prev, repeatDays: [1, 2, 3, 4, 5] }))
 }

 const handleSubmit = async () => {
 try {
 setLoading(true)

 // Format time correctly using local time conversion
 const [startH, startM] = formData.startTime.split(':')
 const [endH, endM] = formData.endTime.split(':')

 const startD = new Date(formData.startDate)
 startD.setHours(parseInt(startH), parseInt(startM), 0, 0)

 const endD = new Date(formData.startDate)
 endD.setHours(parseInt(endH), parseInt(endM), 0, 0)

 const duration = Math.round((endD.getTime() - startD.getTime()) / 60000)

 const payload = {
 title: formData.sessionType ==="single" ? `Special Session (${formData.module})` : `${formData.module} Training`,
 type: formData.module,
 duration,
 mode:"Offline",
 date: startD.toISOString(),
 startTime: startD.toISOString(),
 groupIds: formData.groupIds,
 repeatDays: formData.repeatDays,
 occurrences: formData.occurrences,
 trainerOverrides: formData.trainerOverrides,
 isGroupSession: formData.sessionType ==="group"
 }

 await api.post("/training/sessions", payload)

 toast({ title:"Success", description:"Schedule has been committed to the operations registry." })
 onSuccess()
 onClose()
 } catch (error: any) {
 toast({ title:"Failed", description: error.message ||"Failed to finalize schedule.", variant:"destructive" })
 } finally {
 setLoading(false)
 }
 }

 return (
 <Dialog open={isOpen} onOpenChange={(val) => { if (!val) onClose() }}>
 <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0 border-none shadow-2xl">
 <DialogHeader className="p-8 pb-4 bg-muted/30 border-b">
 <div className="flex items-center gap-3 mb-4">
 {[1, 2, 3, 4].map(s => (
 <div key={s} className={cn("h-1.5 flex-1 rounded-full transition-all duration-500", step >= s ? 'bg-brown-800 shadow-[0_0_8px_rgba(var(--primary),0.5)]' : 'bg-muted')} />
 ))}
 </div>
 <div className="flex justify-between items-start">
 <div className="space-y-1">
 <DialogTitle className="text-2xl font-bold tracking-tight">
 {step === 1 &&"Phase 1: Session Initiation"}
 {step === 2 &&"Phase 2: Group Targeting"}
 {step === 3 &&"Phase 3: Temporal Planning"}
 {step === 4 &&"Phase 4: Personnel Calibration"}
 </DialogTitle>
 <DialogDescription className="text-sm font-medium">
 {step === 1 &&"Identify the scope and module for this educational thread."}
 {step === 2 &&"Choose which cohorts will participate in this operation."}
 {step === 3 &&"Define the temporal bounds and recurrence patterns."}
 {step === 4 &&"Finalize trainer assignments and review the manifest."}
 </DialogDescription>
 </div>
 <Badge variant="secondary" className="font-mono px-3 py-1 uppercase tracking-wider text-[10px]">Registry Build v2</Badge>
 </div>
 </DialogHeader>

 <div className="flex-1 overflow-y-auto px-8 py-6">
 {step === 1 && (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="grid grid-cols-2 gap-8">
 <div className="space-y-4">
 <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Target Batch / Year</Label>
 <Select value={formData.batch} onValueChange={(v) => setFormData({ ...formData, batch: v })}>
 <SelectTrigger className="h-12 text-base font-semibold border-2 focus:ring-amber-500/20">
 <SelectValue placeholder="Select Year" />
 </SelectTrigger>
 <SelectContent>
 {batches.map(b => <SelectItem key={b} value={b} className="font-bold">{b}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-4">
 <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Session Architecture</Label>
 <div className="grid grid-cols-2 gap-2 bg-muted/50 p-1.5 rounded-xl border-2">
 <Button
 variant={formData.sessionType ==="single" ?"default" :"ghost"}
 className={cn("h-10 font-bold text-sm rounded-lg", formData.sessionType ==="single" &&"shadow-md")}
 onClick={() => setFormData({ ...formData, sessionType:"single" })}
 > Single Event </Button>
 <Button
 variant={formData.sessionType ==="group" ?"default" :"ghost"}
 className={cn("h-10 font-bold text-sm rounded-lg", formData.sessionType ==="group" &&"shadow-md")}
 onClick={() => setFormData({ ...formData, sessionType:"group" })}
 > Group Series </Button>
 </div>
 </div>
 </div>

 {formData.sessionType ==="group" && (
 <div className="space-y-4 pt-4 border-t border-dashed animate-in zoom-in-95 duration-300">
 <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Course Module</Label>
 <div className="grid grid-cols-4 gap-3">
 {MODULES.map(m => (
 <Button
 key={m}
 variant={formData.module === m ?"default" :"outline"}
 className={cn("h-11 font-bold text-xs uppercase tracking-tight transition-all",
 formData.module === m ?"border-brown-800 bg-brown-800 shadow-lg scale-[1.02]" :"hover:border-brown-800/50"
 )}
 onClick={() => setFormData({ ...formData, module: m })}
 > {m} </Button>
 ))}
 </div>
 </div>
 )}

 <div className="p-6 rounded-2xl bg-brown-800/5 border-2 border-brown-800/10 flex items-start gap-4">
 <Info className="h-6 w-6 text-brown-800 shrink-0 mt-0.5" />
 <div className="space-y-1">
 <p className="font-bold text-sm text-brown-800">Strategic Initialization</p>
 <p className="text-xs font-medium text-muted-foreground leading-relaxed">Selecting 'Group Series' will enable multi-day scheduling in Phase 3. Single events are best for ad-hoc guest lectures or unique workshops.</p>
 </div>
 </div>
 </div>
 )}

 {step === 2 && (
 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full overflow-hidden">
 <div className="grid grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label className="text-xs font-bold uppercase text-muted-foreground">Branch Filter</Label>
 <Select value={formData.branch} onValueChange={(v) => setFormData({ ...formData, branch: v })}>
 <SelectTrigger className="h-10 font-bold border-2"><SelectValue /></SelectTrigger>
 <SelectContent>
 <SelectItem value="ALL">All Branches</SelectItem>
 {branches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
 </SelectContent>
 </Select>
 </div>
 <div className="space-y-2">
 <Label className="text-xs font-bold uppercase text-muted-foreground">Search Registry</Label>
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
 <Input
 className="h-10 pl-9 font-bold border-2"
 placeholder="G1, G2, etc..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>
 </div>
 </div>

 <div className="flex items-center justify-between px-1">
 <p className="text-xs font-bold uppercase text-muted-foreground">Deploy to {formData.groupIds.length} targets</p>
 <Button variant="link" className="h-auto p-0 text-xs font-bold text-brown-800" onClick={() => setFormData({ ...formData, groupIds: filteredGroups.map(g => g.id) })}> Select All Shown </Button>
 </div>

 <ScrollArea className="flex-1 rounded-2xl border-2 bg-muted/10 p-4">
 <div className="grid grid-cols-2 gap-3">
 {filteredGroups.map(g => {
 const isSelected = formData.groupIds.includes(g.id)
 return (
 <div
 key={g.id}
 onClick={() => {
 setFormData(prev => ({
 ...prev,
 groupIds: isSelected ? prev.groupIds.filter(id => id !== g.id) : [...prev.groupIds, g.id]
 }))
 }}
 className={cn(
"flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer group",
 isSelected ?"bg-brown-800/5 border-brown-800 shadow-sm" :"bg-background hover:border-brown-800/30"
 )}
 >
 <Checkbox checked={isSelected} className={cn("rounded-md border-2", isSelected &&"bg-brown-800 border-brown-800")} />
 <div className="flex flex-col">
 <span className="font-bold text-sm tracking-tight">{g.name} <span className="text-brown-800 italic">({g.branch})</span></span>
 <span className="text-[10px] font-bold text-muted-foreground uppercase">{g.year} Batch</span>
 </div>
 </div>
 )
 })}
 </div>
 </ScrollArea>
 </div>
 )}

 {step === 3 && (
 <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="grid grid-cols-3 gap-6">
 <div className="space-y-3">
 <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2 font-mono">
 <Calendar className="h-4 w-4 text-brown-800" /> Start Date
 </Label>
 <Input type="date" className="h-12 font-bold border-2" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
 </div>
 <div className="space-y-3">
 <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2 font-mono">
 <Clock className="h-4 w-4 text-brown-800" /> Start Time
 </Label>
 <Input type="time" className="h-12 font-bold border-2" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
 </div>
 <div className="space-y-3">
 <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2 font-mono">
 <Clock className="h-4 w-4 text-brown-800" /> End Time
 </Label>
 <Input type="time" className="h-12 font-bold border-2" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
 </div>
 </div>

 <div className="p-8 rounded-3xl bg-muted/40 border-2 space-y-8">
 <div className="flex items-center justify-between">
 <div className="space-y-1">
 <h4 className="text-base font-bold tracking-tight text-brown-800">Repetition Engine</h4>
 <p className="text-xs font-bold text-muted-foreground uppercase tracking-tight">Select specific weekdays for deployment.</p>
 </div>
 <Button variant="outline" size="sm" className="h-9 px-4 font-bold text-xs ring-offset-2 hover:bg-brown-800 hover:text-white transition-all" onClick={selectWorkingDays}>
 Select All Working Days
 </Button>
 </div>

 <div className="flex justify-between gap-2">
 {WEEKDAYS.map(day => {
 const isSelected = formData.repeatDays.includes(day.value)
 return (
 <div
 key={day.value}
 onClick={() => toggleDay(day.value)}
 className={cn(
"flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all",
 isSelected ?"bg-brown-800 border-brown-800 shadow-lg -translate-y-1" :"bg-card border-border hover:border-brown-800/40"
 )}
 >
 <span className={cn("text-lg font-black", isSelected ?"text-white" :"text-muted-foreground/30")}>{day.label}</span>
 <Badge variant={isSelected ?"secondary" :"outline"} className="font-mono text-[9px] px-1">{day.full.slice(0, 3)}</Badge>
 </div>
 )
 })}
 </div>

 <div className="flex items-center justify-between pt-4 border-t border-dashed">
 <div className="space-y-1">
 <Label className="text-xs font-bold uppercase text-muted-foreground font-mono">Weeks to Schedule</Label>
 <p className="text-[10px] font-bold text-muted-foreground italic">Operation will repeat for X consecutive weeks.</p>
 </div>
 <div className="flex items-center gap-4">
 <Input
 type="number"
 min={1} max={52}
 className="w-20 h-10 font-bold border-2 text-center"
 value={formData.occurrences}
 onChange={(e) => setFormData({ ...formData, occurrences: parseInt(e.target.value) })}
 />
 <Badge variant="default" className="h-8 px-4 font-bold shadow-sm">
 {formData.repeatDays.length * formData.occurrences} TOTAL SESSIONS
 </Badge>
 </div>
 </div>
 </div>
 </div>
 )}

 {step === 4 && (
 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="bg-emerald-500/10 border-2 border-emerald-500/20 rounded-2xl p-6 flex items-start gap-4">
 <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
 <div className="space-y-1">
 <p className="font-bold text-sm text-emerald-600 uppercase">Operational Summary Ready</p>
 <p className="text-xs font-medium text-muted-foreground">The registry will instantiate <strong>{formData.repeatDays.length * formData.occurrences}</strong> sessions for <strong>{formData.groupIds.length}</strong> cohorts. Trainers are overridable below for each cohort.</p>
 </div>
 </div>

 <div className="space-y-4">
 <Label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Personnel Calibration (Optional)</Label>
 <ScrollArea className="h-[30vh] rounded-2xl border-2 bg-muted/5 p-4">
 <div className="space-y-3">
 {formData.groupIds.map(id => {
 const group = groups.find(g => g.id === id)
 return (
 <div key={id} className="flex items-center justify-between p-4 bg-background rounded-xl border-2">
 <div className="flex items-center gap-3">
 <div className="h-8 w-8 rounded-lg bg-brown-800/10 flex items-center justify-center font-bold text-xs text-brown-800">{group?.name.slice(0, 2)}</div>
 <span className="font-bold text-sm">{group?.name} <span className="italic text-brown-800">({group?.branch})</span></span>
 </div>
 <Select
 value={formData.trainerOverrides[id] ||"AUTO"}
 onValueChange={(val) => setFormData(prev => ({
 ...prev,
 trainerOverrides: { ...prev.trainerOverrides, [id]: val }
 }))}
 >
 <SelectTrigger className="w-[200px] h-10 font-bold text-xs border-2">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="AUTO" className="font-bold">✨ Use Default Trainer</SelectItem>
 {availableTrainers.map(t => (
 <SelectItem key={t.id} value={t.id} className="text-xs font-semibold">{t.name}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 )
 })}
 </div>
 </ScrollArea>
 </div>

 <div className="p-6 rounded-2xl bg-muted/30 border-2 flex items-center gap-6">
 <div className="h-12 w-12 rounded-xl bg-brown-800 flex items-center justify-center text-white shadow-lg">
 <BookOpen className="h-6 w-6" />
 </div>
 <div className="space-y-1 flex-1">
 <p className="text-sm font-bold">{formData.module} Series Manifest</p>
 <p className="text-xs font-bold text-muted-foreground uppercase">{formData.startDate} @ {formData.startTime} - {formData.endTime}</p>
 </div>
 </div>
 </div>
 )}
 </div>

 <DialogFooter className="p-8 bg-muted/30 border-t flex items-center gap-4">
 {step > 1 && (
 <Button variant="outline" className="h-12 px-6 font-bold border-2 hover:bg-muted" onClick={() => setStep(step - 1)} disabled={loading}>
 <ChevronLeft className="mr-2 h-4 w-4" /> Go Back
 </Button>
 )}
 <div className="ml-auto flex items-center gap-3">
 <Button variant="ghost" className="h-12 px-6 font-bold" onClick={onClose} disabled={loading}>Cancel</Button>
 {step < 4 ? (
 <Button className="h-12 px-8 font-bold shadow-lg" onClick={handleNext}>
 Continue <ChevronRight className="ml-2 h-4 w-4" />
 </Button>
 ) : (
 <Button className="h-12 px-10 font-black shadow-xl bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSubmit} disabled={loading}>
 {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> :"INSTANTIATE SESSIONS"}
 </Button>
 )}
 </div>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 )
}
