import { useState } from"react"
import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/card"
import { Activity, UserPlus, FileCheck, Building2, ArrowRight, Clock, Trophy } from"lucide-react"
import { cn } from"@/lib/utils"
import { Badge } from"@/components/ui/badge"
import { formatDistanceToNow } from"date-fns"

interface RecentActivityProps {
 activities?: any[];
}

const getIcon = (type: string, iconStr: string) => {
 switch (iconStr) {
 case"Trophy": return <Trophy className="h-4 w-4 text-emerald-500" />;
 case"Building2": return <Building2 className="h-4 w-4 text-brown-800" />;
  case "UserPlus": return <UserPlus className="h-4 w-4 text-primary" />;
  case "FileCheck": return <FileCheck className="h-4 w-4 text-amber-500" />;
  default: return <Activity className="h-4 w-4 text-primary" />;
 }
}

const getBgColor = (type: string, iconStr: string) => {
 switch (iconStr) {
 case"Trophy": return"bg-emerald-500/10 border-emerald-500/20";
 case"Building2": return"bg-brown-800/10 border-brown-800/20";
  case "UserPlus": return "bg-primary/10 border-primary/20";
 case"FileCheck": return"bg-amber-500/10 border-amber-500/20";
 default: return"bg-muted/20 border-border/40";
 }
}

export function RecentActivity({ activities }: RecentActivityProps) {
 const [filter, setFilter] = useState("all");

 const displayActivities = activities && activities.length > 0 ? activities : [
 {
 id: 1,
 type:"placement",
 message:"Amit Kumar placed at CloudNine Tech",
 time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
 icon:"UserPlus",
 },
 {
 id: 2,
 type:"test",
 message:"Technical Aptitude Test results published",
 time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
 icon:"FileCheck",
 },
 {
 id: 3,
 type:"company",
 message:"TechCorp India registered for campus drive",
 time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
 icon:"Building2",
 }
 ];

 const filteredActivities = displayActivities.filter(a => filter ==="all" || a.type === filter);

 const formatTime = (timeStr: string) => {
 try {
 return formatDistanceToNow(new Date(timeStr), { addSuffix: true });
 } catch {
 return timeStr;
 }
 }

 return (
 <Card className="overflow-hidden">
 <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 bg-muted/10 pb-4">
 <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
  <div className="rounded-md border border-border/60 bg-primary/10 p-2 shadow-sm">
    <Activity className="h-5 w-5 text-primary" />
  </div>
 Live Feed
 </CardTitle>
 <div className="flex items-center gap-2">
  <div className="flex rounded-md border border-border/60 bg-card/90 p-1 shadow-sm">
    <button
      onClick={() => setFilter('all')}
      className={cn("rounded-sm px-3 py-1 text-xs font-medium transition-all duration-200", filter === 'all' ?"bg-primary/10 text-primary" :"text-muted-foreground hover:text-foreground")}
    >
      All
    </button>
    <button
      onClick={() => setFilter('placement')}
      className={cn("rounded-sm px-3 py-1 text-xs font-medium transition-all duration-200", filter === 'placement' ?"bg-primary/10 text-primary" :"text-muted-foreground hover:text-foreground")}
    >
      Placements
    </button>
    <button
      onClick={() => setFilter('company')}
      className={cn("rounded-sm px-3 py-1 text-xs font-medium transition-all duration-200", filter === 'company' ?"bg-primary/10 text-primary" :"text-muted-foreground hover:text-foreground")}
    >
      Companies
    </button>
  </div>
  <Badge variant="outline" className="hidden rounded-sm border-primary/20 bg-primary/5 text-[10px] font-semibold uppercase tracking-widest text-primary sm:flex">
    LIVE
  </Badge>
 </div>
 </CardHeader>
 <CardContent className="p-0">
 <div className="p-5 space-y-5">
 {filteredActivities.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
 <Activity className="h-8 w-8 text-muted-foreground/20" />
 <p className="text-sm text-muted-foreground/60">Quiet moment in the office</p>
 </div>
 ) : (
 <div className="space-y-5">
 {filteredActivities.map((activity) => (
 <div key={activity.id} className="flex items-start gap-4 group/activity relative p-1 animate-in slide-in-from-right-2 fade-in duration-300">
 <div className="h-full w-[1px] absolute left-[19px] top-10 bg-border/40 group-last/activity:hidden" />
 <div className={cn(
"h-10 w-10 shrink-0 rounded-md shadow-sm border flex items-center justify-center relative z-10 transition-transform duration-300 group-hover/activity:scale-110",
 getBgColor(activity.type, activity.icon)
 )}>
 {getIcon(activity.type, activity.icon)}
 </div>
 <div className="flex-1 space-y-1 pt-1">
 <p className="cursor-default text-sm font-medium leading-snug text-foreground transition-colors group-hover/activity:text-brown-800">
 {activity.message}
 </p>
 <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
 <Clock className="h-3 w-3" />
 <span>{formatTime(activity.time || activity.createdAt)}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}

  <div className="pt-4">
    <button className="group/more flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border/70 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/60 transition-all duration-200 hover:border-primary/40 hover:text-primary">
      Check Activity Logs
      <ArrowRight className="h-3.5 w-3.5 group-hover/more:translate-x-1 transition-transform" />
    </button>
  </div>
 </div>
 </CardContent>
 </Card>
 )
}
