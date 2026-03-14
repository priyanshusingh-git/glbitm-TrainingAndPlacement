import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/card"
import { Badge } from"@/components/ui/badge"
import { Button } from"@/components/ui/button"
import { Briefcase, Building2, MapPin, IndianRupee, ArrowRight, Clock } from"lucide-react"
import { cn } from"@/lib/utils"

interface PlacementSectionProps {
 placements?: any[];
}

export function PlacementSection({ placements }: PlacementSectionProps) {
 const opportunities = placements || [];

 return (
 <Card className="overflow-hidden">
 <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 bg-muted/10">
 <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
 <div className="rounded-xl border border-border/60 bg-brown-800/10 p-2 shadow-sm">
 <Briefcase className="h-5 w-5 text-brown-800" />
 </div>
 Active Opportunities
 </CardTitle>
 <Button variant="ghost" size="sm" className="text-xs font-medium text-brown-800 hover:bg-brown-800/10">
 All Drives <ArrowRight className="ml-1 h-3 w-3" />
 </Button>
 </CardHeader>
 <CardContent className="p-6 space-y-5">
 {opportunities.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
 <div className="p-4 rounded-full bg-muted/20">
 <Building2 className="h-8 w-8 text-muted-foreground/20" />
 </div>
 <p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-widest">No active placement drives</p>
 </div>
 ) : opportunities.map((opp) => (
 <div
 key={opp.id}
 className="premium-muted group/opp relative space-y-4 overflow-hidden rounded-2xl border border-border/60 p-5 transition-all duration-200 hover:border-brown-800/20 hover:bg-card-hover hover:shadow-md"
 >
 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/opp:opacity-20 transition-opacity">
 <Building2 className="h-12 w-12 text-brown-800" />
 </div>

 <div className="flex items-start justify-between relative">
 <div className="space-y-1">
 <div className="flex items-center gap-2">
 <p className="text-lg font-semibold leading-none tracking-tight text-foreground">{opp.role}</p>
 <Badge variant="outline" className="h-4 border-brown-800/30 bg-brown-800/5 py-0 text-[10px] font-semibold uppercase tracking-tight text-brown-800">
 {opp.package}
 </Badge>
 </div>
 <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
 <span className="flex items-center gap-1">
 <Building2 className="h-3 w-3" />
 {opp.company}
 </span>
 <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
 <span className="flex items-center gap-1">
 <MapPin className="h-3 w-3" />
 {opp.location}
 </span>
 </div>
 </div>
 <Badge
 variant={opp.applied ?"default" :"outline"}
 className={cn(
"px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest",
 opp.applied ?"bg-success/20 text-success border-success/20 hover:bg-success/30" :"bg-brown-800/5 text-brown-800 border-brown-800/20"
 )}
 >
 {opp.applied ?"Applied" :"Open"}
 </Badge>
 </div>

 <div className="flex items-center justify-between pt-4 border-t border-border/40 relative">
 <div className="flex items-center gap-2">
 <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/50 bg-card/80">
 <Clock className="h-3.5 w-3.5 text-muted-foreground" />
 </div>
 <div className="flex flex-col">
 <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Application Ends</span>
 <span className="text-xs font-bold text-muted-foreground">{opp.deadline}</span>
 </div>
 </div>
 {!opp.applied && (
 <Button size="sm" className="h-9 px-6 text-xs font-semibold uppercase tracking-wider">
 Apply Position
 </Button>
 )}
 </div>
 </div>
 ))}
 </CardContent>
 </Card>
 )
}
