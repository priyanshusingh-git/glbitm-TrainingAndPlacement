"use client"

import { useState } from"react"
import {
 format, addMonths, subMonths, startOfMonth,
 endOfMonth, startOfWeek, endOfWeek, isSameMonth,
 isSameDay, addDays, eachDayOfInterval
} from"date-fns"
import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/card"
import { Button } from"@/components/ui/button"
import { Badge } from"@/components/ui/badge"
import {
 ChevronLeft, ChevronRight, Calendar as CalendarIcon,
 Clock, MapPin, Presentation, User
} from"lucide-react"
import { cn } from"@/lib/utils"

interface TrainingCalendarProps {
 sessions: any[]
}

export function TrainingCalendar({ sessions }: TrainingCalendarProps) {
 const [currentMonth, setCurrentMonth] = useState(new Date())
 const [selectedDate, setSelectedDate] = useState(new Date())

 const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
 const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

 const renderHeader = () => {
 return (
 <div className="flex items-center justify-between mb-8 px-4">
 <div className="flex items-center gap-6">
 <div className="bg-brown-800/10 p-3 rounded-2xl border border-brown-800/20 shadow-lg shadow-primary/5">
 <CalendarIcon className="h-7 w-7 text-brown-800" />
 </div>
 <div>
 <h2 className="text-3xl font-black tracking-tighter uppercase">{format(currentMonth,"MMMM yyyy")}</h2>
 <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1">Operational Timeline & Logistics</p>
 </div>
 </div>
 <div className="flex items-center gap-2 bg-muted/20 backdrop-blur-md p-2 rounded-2xl border border-border/40">
 <Button variant="ghost" size="icon" onClick={prevMonth} className="h-10 w-10 hover:bg-background/50 rounded-xl">
 <ChevronLeft className="h-5 w-5" />
 </Button>
 <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())} className="font-black uppercase tracking-widest text-[9px] px-5 h-10 hover:bg-background/50 rounded-xl">
 Today
 </Button>
 <Button variant="ghost" size="icon" onClick={nextMonth} className="h-10 w-10 hover:bg-background/50 rounded-xl">
 <ChevronRight className="h-5 w-5" />
 </Button>
 </div>
 </div>
 )
 }

 const renderDays = () => {
 const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
 return (
 <div className="grid grid-cols-7 mb-4">
 {days.map((day, i) => (
 <div key={i} className="text-center text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/60 pb-2">
 {day}
 </div>
 ))}
 </div>
 )
 }

 const renderCells = () => {
 const monthStart = startOfMonth(currentMonth)
 const monthEnd = endOfMonth(monthStart)
 const startDate = startOfWeek(monthStart)
 const endDate = endOfWeek(monthEnd)

 const allDays = eachDayOfInterval({ start: startDate, end: endDate })

 return (
 <div className="grid grid-cols-7 gap-px bg-border/40 border border-border/40 rounded-[2.5rem] overflow-hidden shadow-2xl">
 {allDays.map((d, i) => {
 const isSelected = isSameDay(d, selectedDate)
 const isCurrentMonth = isSameMonth(d, monthStart)
 const daySessions = sessions.filter(s => isSameDay(new Date(s.date), d))

 return (
 <div
 key={i}
 className={cn(
"min-h-[140px] bg-background/40 backdrop-blur-sm p-4 transition-all cursor-pointer hover:bg-muted/10 group relative",
 !isCurrentMonth &&"bg-muted/5 opacity-40",
 isSelected &&"bg-brown-800/[0.03] ring-2 ring-amber-500/40 ring-inset z-10"
 )}
 onClick={() => setSelectedDate(d)}
 >
 <div className="flex justify-between items-start mb-3">
 <span className={cn(
"text-xs font-black h-8 w-8 flex items-center justify-center rounded-xl transition-all",
 isSameDay(d, new Date()) ?"bg-brown-800 text-brown-800-foreground shadow-lg shadow-primary/20 scale-110" :
 isSelected ?"text-brown-800 bg-brown-800/10 border border-brown-800/20 scale-105" :"text-foreground group-hover:bg-muted"
 )}>
 {format(d,"d")}
 </span>
 {daySessions.length > 0 && (
 <div className="h-1.5 w-1.5 rounded-full bg-brown-800 animate-pulse" />
 )}
 </div>

 <div className="space-y-1.5">
 {daySessions.slice(0, 3).map((s, idx) => (
 <div
 key={s.id}
 className={cn(
"text-[9px] p-2 rounded-lg border-l-2 font-black uppercase tracking-tight truncate leading-none shadow-sm",
 s.type === 'Technical' ?"bg-indigo-500/10 border-indigo-500/40 text-indigo-500" :
 s.type === 'Aptitude' ?"bg-amber-500/10 border-amber-500/40 text-amber-500" :
"bg-emerald-500/10 border-emerald-500/40 text-emerald-500"
 )}
 >
 {s.title}
 </div>
 ))}
 {daySessions.length > 3 && (
 <div className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest pl-1 mt-1">
 + {daySessions.length - 3} Units
 </div>
 )}
 </div>
 </div>
 )
 })}
 </div>
 )
 }

 const selectedDaySessions = sessions.filter(s => isSameDay(new Date(s.date), selectedDate))

 return (
 <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 animate-in fade-in duration-700">
 <div className="lg:col-span-3">
 {renderHeader()}
 {renderDays()}
 {renderCells()}
 </div>

 <div className="lg:col-span-1 space-y-8">
 <div className="relative group sticky top-24">
 <div className="absolute -inset-1 bg-gradient-to-b from-primary/20 to-transparent rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
 <Card className="relative bg-card/60 backdrop-blur-2xl border-border/40 shadow-2xl overflow-hidden rounded-[2.5rem]">
 <CardHeader className="bg-muted/20 border-b border-border/40 p-8">
 <div className="space-y-2">
 <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brown-800/80">Scheduled Operations</p>
 <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
 <Presentation className="h-6 w-6 text-brown-800" />
 {format(selectedDate,"MMM dd, yyyy")}
 </CardTitle>
 </div>
 </CardHeader>
 <CardContent className="p-8">
 <div className="space-y-5">
 {selectedDaySessions.length === 0 ? (
 <div className="text-center py-20 bg-muted/5 rounded-[2rem] border border-dashed border-border/40">
 <CalendarIcon className="h-10 w-10 mx-auto mb-4 text-muted-foreground/20" />
 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">No Active Missions</p>
 </div>
 ) : (
 selectedDaySessions.map(session => (
 <div key={session.id} className="group p-5 rounded-3xl border border-border/40 bg-background/40 hover:bg-background/60 hover:border-brown-800/40 transition-all duration-300 shadow-sm border-l-4 border-l-primary/40">
 <div className="flex flex-col gap-4">
 <div className="flex justify-between items-start">
 <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-brown-800/20 bg-brown-800/5 text-brown-800 rounded-md">{session.type}</Badge>
 <div className="flex items-center gap-1.5 text-[10px] text-brown-800 font-black uppercase tracking-widest">
 <Clock className="h-3 w-3" />
 {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </div>
 </div>

 <h4 className="font-black text-md leading-tight group-hover:text-brown-800 transition-colors uppercase tracking-tight">{session.title}</h4>

 <div className="space-y-3 pt-4 border-t border-border/20">
 <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wide">
 <div className="p-1.5 rounded-lg bg-muted/40"><User className="h-3 w-3 text-brown-800/60" /></div>
 <span>{session.trainer?.name || 'Unknown'}</span>
 </div>
 <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wide">
 <div className="p-1.5 rounded-lg bg-muted/40"><Presentation className="h-3 w-3 text-brown-800/60" /></div>
 <span>
 {session.sessionGroups?.length > 0
 ? (session.sessionGroups.length === 1
 ? session.sessionGroups[0].name
 : `${session.sessionGroups[0].name} + ${session.sessionGroups.length - 1} more`)
 : 'No Groups'}
 </span>
 </div>
 <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wide">
 <div className="p-1.5 rounded-lg bg-muted/40"><MapPin className="h-3 w-3 text-brown-800/60" /></div>
 <span className="truncate">{session.mode} ({session.location || 'N/A'})</span>
 </div>
 </div>
 </div>
 </div>
 ))
 )}
 </div>
 </CardContent>
 </Card>
 </div>
 </div>
 </div>
 )
}
