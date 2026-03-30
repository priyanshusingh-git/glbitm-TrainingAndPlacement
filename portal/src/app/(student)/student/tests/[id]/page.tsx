"use client"

import { useState, useEffect, useCallback } from"react"
import { useParams, useRouter } from"next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from"@/components/ui/card"
import { Button } from"@/components/ui/button"
import { Badge } from"@/components/ui/badge"
import { Progress } from"@/components/ui/progress"
import {
 Clock, ChevronRight, ChevronLeft,
 CheckCircle2, AlertCircle, Loader2, Save
} from"lucide-react"
import { api } from"@/lib/api"
import { useToast } from"@/hooks/use-toast"
import { Checkbox } from"@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from"@/components/ui/radio-group"
import { Label } from"@/components/ui/label"
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

export default function TestPage() {
 const params = useParams()
 const router = useRouter()
 const { toast } = useToast()
 const [loading, setLoading] = useState(true)
 const [submitting, setSubmitting] = useState(false)
 const [test, setTest] = useState<any>(null)
 const [questions, setQuestions] = useState<any[]>([])
 const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
 const [answers, setAnswers] = useState<Record<string, string[]>>({})
 const [timeLeft, setTimeLeft] = useState<number>(0)
 const [isConfirmOpen, setIsConfirmOpen] = useState(false)

 useEffect(() => {
 fetchTestData()
 }, [params.id])

 const fetchTestData = async () => {
 try {
 setLoading(true)
 const data = await api.get(`/tests/${params.id}`)
 setTest(data)

 // Extract questions from TestQuestion Join Table
 const qs = data.questions?.map((tq: any) => ({
 ...tq.question,
 order: tq.order
 })) || []

 // Sort by order
 qs.sort((a: any, b: any) => a.order - b.order)
 setQuestions(qs)

 // Set Timer
 setTimeLeft(data.duration * 60)
 } catch (error) {
 toast({ title:"Error", description:"Failed to load test", variant:"destructive" })
 router.push("/student/tests")
 } finally {
 setLoading(false)
 }
 }

 // Timer Logic
 useEffect(() => {
 if (loading || !test || timeLeft <= 0) return

 const timer = setInterval(() => {
 setTimeLeft(prev => {
 if (prev <= 1) {
 clearInterval(timer)
 handleSubmit()
 return 0
 }
 return prev - 1
 })
 }, 1000)

 return () => clearInterval(timer)
 }, [loading, test, timeLeft])

 const handleAnswerChange = (questionId: string, options: string[]) => {
 setAnswers(prev => ({
 ...prev,
 [questionId]: options
 }))
 }

 const handleSubmit = async () => {
 try {
 setSubmitting(true)
 const submissionPayload = {
 answers: Object.entries(answers).map(([qid, opts]) => ({
 questionId: qid,
 selectedOptions: opts
 }))
 }

 await api.post(`/tests/${params.id}/submit`, submissionPayload)
 toast({ title:"Success", description:"Test submitted successfully" })
 router.push("/student/tests")
 } catch (error) {
 toast({ title:"Error", description:"Failed to submit test", variant:"destructive" })
 } finally {
 setSubmitting(false)
 setIsConfirmOpen(false)
 }
 }

 const formatTime = (seconds: number) => {
 const mins = Math.floor(seconds / 60)
 const secs = seconds % 60
 return `${mins}:${secs.toString().padStart(2, '0')}`
 }

 if (loading) {
 return (
 <div className="flex flex-col items-center justify-center min-h-screen gap-4">
 <Loader2 className="h-10 w-10 animate-spin text-brown-800" />
 <p className="text-muted-foreground animate-pulse">Initializing assessment portal...</p>
 </div>
 )
 }

 const currentQuestion = questions[currentQuestionIdx]
 if (!currentQuestion) return null

 const progress = ((currentQuestionIdx + 1) / questions.length) * 100
 const answeredCount = Object.keys(answers).length

 return (
 <div className="min-h-screen bg-muted/30 flex flex-col">
 {/* Header */}
 <header className="bg-background border-b h-16 sticky top-0 z-50 px-6 flex items-center justify-between shadow-sm">
 <div className="flex items-center gap-4">
 <div className="bg-brown-800/10 p-2 rounded-lg">
 <CheckCircle2 className="h-5 w-5 text-brown-800" />
 </div>
 <div>
 <h1 className="font-bold text-sm tracking-tight">{test.title}</h1>
 <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{test.type}</p>
 </div>
 </div>

 <div className="flex items-center gap-6">
 <div className="flex items-center gap-2 bg-muted px-4 py-1.5 rounded-full border">
 <Clock className={`h-4 w-4 ${timeLeft < 300 ? 'text-destructive animate-pulse' : 'text-brown-800'}`} />
 <span className={`font-mono font-bold text-sm ${timeLeft < 300 ? 'text-destructive' : 'text-foreground'}`}>
 {formatTime(timeLeft)}
 </span>
 </div>
 <Button variant="default" size="sm" onClick={() => setIsConfirmOpen(true)} className="font-bold px-6 shadow-lg shadow-primary/20">
 Finish Test
 </Button>
 </div>
 </header>

 <main className="flex-1 flex overflow-hidden">
 {/* Side Navigation */}
 <aside className="w-80 bg-background border-r flex flex-col hidden md:flex">
 <div className="p-6 border-b">
 <div className="flex items-center justify-between mb-2">
 <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Progress</span>
 <span className="text-xs font-black text-brown-800">{answeredCount}/{questions.length}</span>
 </div>
 <Progress value={(answeredCount / questions.length) * 100} className="h-1.5" />
 </div>
 <div className="flex-1 overflow-y-auto p-4">
 <div className="grid grid-cols-5 gap-2">
 {questions.map((q, idx) => (
 <button
 key={q.id}
 onClick={() => setCurrentQuestionIdx(idx)}
 className={`h-10 w-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all border-2 
 ${currentQuestionIdx === idx ? 'border-brown-800 bg-brown-800 text-brown-800-foreground shadow-lg scale-110 z-10' :
 answers[q.id] ? 'border-amber-500 bg-amber-50 text-amber-600' :
 'border-muted bg-background text-muted-foreground hover:border-muted-foreground/30'}
 `}
 >
 {idx + 1}
 </button>
 ))}
 </div>
 </div>
 <div className="p-6 border-t bg-muted/10">
 <div className="flex items-center gap-2 text-xs text-muted-foreground">
 <AlertCircle className="h-4 w-4" />
 <p>Do not refresh the page during the test.</p>
 </div>
 </div>
 </aside>

 {/* Question Area */}
 <section className="flex-1 overflow-y-auto p-8 lg:p-12 flex justify-center">
 <div className="max-w-3xl w-full space-y-8 animate-in slide-in-from-bottom-4 duration-500">
 <div className="space-y-2">
 <Badge variant="outline" className="text-[10px] uppercase font-bold text-brown-800 border-brown-800/20">
 Question {currentQuestionIdx + 1} of {questions.length}
 </Badge>
 <h2 className="text-2xl font-bold leading-tight text-foreground">
 {currentQuestion.text}
 </h2>
 </div>

 <div className="space-y-4">
 {currentQuestion.type ==="MCQ" ? (
 <RadioGroup
 value={answers[currentQuestion.id]?.[0] ||""}
 onValueChange={(val) => handleAnswerChange(currentQuestion.id, [val])}
 className="space-y-3"
 >
 {currentQuestion.options.map((opt: any) => (
 <div
 key={opt.id}
 className={`flex items-center gap-3 p-4 rounded-md border-2 transition-all cursor-pointer hover:bg-muted/50 
 ${answers[currentQuestion.id]?.[0] === opt.id ? 'border-brown-800 bg-brown-800/5 shadow-sm' : 'border-transparent bg-background shadow-xs'}
 `}
 onClick={() => handleAnswerChange(currentQuestion.id, [opt.id])}
 >
 <RadioGroupItem value={opt.id} id={opt.id} className="text-brown-800 border-brown-800/30" />
 <Label htmlFor={opt.id} className="text-base flex-1 cursor-pointer font-medium leading-normal">
 {opt.text}
 </Label>
 </div>
 ))}
 </RadioGroup>
 ) : (
 <div className="space-y-3">
 {currentQuestion.options.map((opt: any) => {
 const isSelected = (answers[currentQuestion.id] || []).includes(opt.id)
 return (
 <div
 key={opt.id}
 className={`flex items-center gap-3 p-4 rounded-md border-2 transition-all cursor-pointer hover:bg-muted/50 
 ${isSelected ? 'border-brown-800 bg-brown-800/5 shadow-sm' : 'border-transparent bg-background shadow-xs'}
 `}
 onClick={() => {
 const current = answers[currentQuestion.id] || []
 const updated = isSelected
 ? current.filter(id => id !== opt.id)
 : [...current, opt.id]
 handleAnswerChange(currentQuestion.id, updated)
 }}
 >
 <Checkbox checked={isSelected} id={opt.id} className="data-[state=checked]:bg-brown-800 rounded-md" />
 <Label htmlFor={opt.id} className="text-base flex-1 cursor-pointer font-medium leading-normal">
 {opt.text}
 </Label>
 </div>
 )
 })}
 </div>
 )}
 </div>

 <div className="pt-8 flex items-center justify-between border-t border-dashed">
 <Button
 variant="outline"
 disabled={currentQuestionIdx === 0}
 onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
 className="h-11 px-6 rounded-md hover:bg-background"
 >
 <ChevronLeft className="mr-2 h-4 w-4" /> Previous Question
 </Button>

 {currentQuestionIdx < questions.length - 1 ? (
 <Button
 onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
 className="h-11 px-6 rounded-md shadow-md"
 >
 Next Question <ChevronRight className="ml-2 h-4 w-4" />
 </Button>
 ) : (
 <Button
 onClick={() => setIsConfirmOpen(true)}
 className="h-11 px-8 rounded-md bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200"
 >
 Submit Final Answers <Save className="ml-2 h-4 w-4" />
 </Button>
 )}
 </div>
 </div>
 </section>
 </main>

 <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle>Are you ready to submit?</AlertDialogTitle>
 <AlertDialogDescription>
 You have answered {answeredCount} out of {questions.length} questions. You cannot change your answers after submission.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel>Keep Reviewing</AlertDialogCancel>
 <AlertDialogAction
 onClick={(e) => { e.preventDefault(); handleSubmit(); }}
 disabled={submitting}
 className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold"
 >
 {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> :"Submit Assessment"}
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div>
 )
}
