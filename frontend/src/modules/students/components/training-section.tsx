import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/card"
import { Badge } from"@/components/ui/badge"
import { Progress } from"@/components/ui/progress"
import { Clock, Users } from"lucide-react"

interface TrainingSectionProps {
 training?: {
 batches: any[];
 upcomingSessions: any[];
 }
}

export function TrainingSection({ training }: TrainingSectionProps) {
 const trainingBatches = training?.batches || [];
 const upcomingSessions = training?.upcomingSessions || [];

 return (
 <Card className="overflow-hidden group">
 <CardHeader className="border-b border-border/60 bg-muted/10">
 <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
  <div className="rounded-xl border border-border/60 bg-primary/10 p-2 shadow-sm">
    <Users className="h-5 w-5 text-primary" />
  </div>
 Training Batches
 </CardTitle>
 </CardHeader>
 <CardContent className="p-0">
 <div className="p-6 space-y-6">
 {/* Training Progress */}
 <div className="space-y-5">
 {trainingBatches.length === 0 ? (
 <p className="text-sm text-muted-foreground italic">No active training batches.</p>
 ) : trainingBatches.map((batch) => (
 <div key={batch.id} className="premium-muted space-y-3 rounded-xl border border-border/60 p-4 transition-colors duration-200 hover:bg-card-hover">
 <div className="flex items-start justify-between">
 <div>
 <h4 className="font-semibold text-foreground">{batch.name}</h4>
 <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
 <Users className="h-3 w-3" /> {batch.instructor}
 </p>
 </div>
  <Badge
    variant={batch.status ==="completed" ?"default" :"secondary"}
    className={batch.status ==="completed" ?"bg-success/20 text-success border-success/20 hover:bg-success/30" :"bg-primary/10 text-primary border-primary/20"}
  >
 {batch.status ==="completed" ?"Completed" :"Active"}
 </Badge>
 </div>
 <div className="space-y-2">
 <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
 <span>Course Progress</span>
 <span>{batch.progress}%</span>
 </div>
 <Progress value={batch.progress} className="h-1.5" />
 </div>
 <div className="flex items-center gap-3 text-[10px] font-medium text-muted-foreground">
 <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50 border border-border/40">
 Attendance: {batch.attendance}%
 </span>
 </div>
 </div>
 ))}
 </div>

 {/* Upcoming Sessions */}
 <div className="border-t border-border/40 pt-6">
 <div className="flex items-center justify-between mb-4">
 <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Upcoming Sessions</h4>
 <Badge variant="outline" className="text-[10px] font-semibold border-border/60">NEXT 48H</Badge>
 </div>
 <div className="space-y-3">
 {upcomingSessions.length === 0 ? (
 <p className="text-sm text-muted-foreground italic">No upcoming sessions scheduled.</p>
 ) : upcomingSessions.map((session: any) => (
 <div
 key={session.id}
 className="premium-muted group/session flex items-center gap-4 rounded-xl border border-border/60 p-3 transition-all duration-200 hover:border-brown-800/20 hover:bg-card-hover"
 >
  <div className="flex flex-col items-center justify-center h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
    <span className="text-xs font-bold text-primary">FEB</span>
    <span className="text-lg font-black text-primary leading-none">18</span>
  </div>
 <div className="flex-1 min-w-0">
 <p className="truncate text-sm font-semibold text-foreground">{session.title}</p>
 <div className="mt-1 flex items-center gap-3 text-[10px] font-medium text-muted-foreground">
 <div className="flex items-center gap-1">
 <Clock className="h-3 w-3" />
 <span>{session.time}</span>
 </div>
 <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
 <span>{session.duration}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 )
}
