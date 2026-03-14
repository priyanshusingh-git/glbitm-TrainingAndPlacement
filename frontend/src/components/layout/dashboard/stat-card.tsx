import { Card, CardContent } from"@/components/ui/card"
import { cn } from"@/lib/utils"
import type { LucideIcon } from"lucide-react"

interface StatCardProps {
 title: string
 value: string | number
 subtitle?: string
 icon: LucideIcon
 trend?: {
 value: number
 positive: boolean
 }
 variant?:"default" |"primary" |"success" |"warning" |"accent"
 className?: string
}

export function StatCard({
 title,
 value,
 subtitle,
 icon: Icon,
 trend,
 variant ="default",
 className,
}: StatCardProps) {
 const variantStyles = {
 default:"bg-card",
 primary:"bg-brown-800/8 border-brown-800/20",
 success:"bg-success/10 border-success/20",
 warning:"bg-warning/10 border-warning/20",
 accent:"bg-accent/10 border-accent/20",
 }

 const iconStyles = {
 default:"bg-muted/12 text-muted-foreground",
 primary:"bg-brown-800/10 text-brown-800",
 success:"bg-success/20 text-success",
 warning:"bg-warning/20 text-warning-foreground",
 accent:"bg-accent/20 text-accent",
 }

 return (
 <Card className={cn("h-full border transition-shadow hover:shadow-md", variantStyles[variant], className)}>
 <CardContent className="p-6">
 <div className="flex items-start justify-between">
 <div className="space-y-2">
 <p className="text-sm font-medium text-muted-foreground">{title}</p>
 <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
 {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
 {trend && (
 <p
 className={cn(
"text-sm font-medium",
 trend.positive ?"text-success" :"text-destructive"
 )}
 >
 {trend.positive ?"+" :"-"}
 {Math.abs(trend.value)}% from last month
 </p>
 )}
 </div>
 <div className={cn("rounded-xl p-3", iconStyles[variant])}>
 <Icon className="h-6 w-6" />
 </div>
 </div>
 </CardContent>
 </Card>
 )
}
