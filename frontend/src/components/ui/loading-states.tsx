import { Skeleton } from"@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from"@/components/ui/card"
import { Spinner } from"@/components/ui/spinner"
import { cn } from"@/lib/utils"

interface LoadingCardProps {
 className?: string
 showHeader?: boolean
}

export function LoadingCard({ className, showHeader = true }: LoadingCardProps) {
 return (
 <Card className={cn("animate-in fade-in-50", className)}>
 {showHeader && (
 <CardHeader>
 <Skeleton className="h-6 w-48" />
 <Skeleton className="h-4 w-32 mt-2" />
 </CardHeader>
 )}
 <CardContent>
 <div className="space-y-3">
 <Skeleton className="h-4 w-full" />
 <Skeleton className="h-4 w-5/6" />
 <Skeleton className="h-4 w-4/6" />
 </div>
 </CardContent>
 </Card>
 )
}

export function LoadingTable({
 rows = 5,
 cols = 4,
 columnWidths: _columnWidths
}: {
 rows?: number;
 cols?: number;
 columnWidths?: string[];
}) {
 const delayClasses = ["delay-0", "delay-100", "delay-150", "delay-200", "delay-300", "delay-500"]
 return (
 <div className="space-y-4 w-full">
 {/* Header */}
 <div
 className="flex items-center gap-4 rounded-t-xl border-b border-border/60 bg-muted/10 px-4 py-3"
 >
 {Array.from({ length: cols }).map((_, i) => (
 <div
 key={i}
 className="flex-1"
 >
 <Skeleton className="h-4 w-24 bg-muted-foreground/20" />
 </div>
 ))}
 </div>
 {/* Rows */}
 <div className="space-y-2">
 {Array.from({ length: rows }).map((_, rowIdx) => (
 <div
 key={rowIdx}
 className={cn("animate-in fade-in-50 slide-in-from-bottom-2 flex items-center gap-4 rounded-lg px-4 py-3 transition-colors duration-500 hover:bg-muted/10", delayClasses[Math.min(rowIdx, delayClasses.length - 1)])}
 >
 {Array.from({ length: cols }).map((_, colIdx) => (
 <div
 key={colIdx}
 className="flex-1"
 >
 {colIdx === 0 ? (
 <div className="flex items-center gap-3">
 <Skeleton className="h-10 w-10 rounded-full bg-muted-foreground/10" />
 <div className="space-y-2">
 <Skeleton className="h-4 w-32 bg-muted-foreground/10" />
 <Skeleton className="h-3 w-24 bg-muted-foreground/10" />
 </div>
 </div>
 ) : colIdx === cols - 1 ? (
 <div className="flex justify-end">
 <Skeleton className="h-8 w-8 rounded-full bg-muted-foreground/10" />
 </div>
 ) : (
 <div className="space-y-2">
 <Skeleton className="h-4 w-full max-w-[120px] bg-muted-foreground/10" />
 <Skeleton className="h-3 w-full max-w-[80px] bg-muted-foreground/10" />
 </div>
 )}
 </div>
 ))}
 </div>
 ))}
 </div>
 </div>
 )
}

export function LoadingGrid({ items = 6, className }: { items?: number; className?: string }) {
 const delayClasses = ["delay-0", "delay-100", "delay-150", "delay-200", "delay-300", "delay-500"]
 return (
 <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
 {Array.from({ length: items }).map((_, i) => (
 <LoadingCard
 key={i}
 className={cn("animate-in fade-in-50", delayClasses[Math.min(i, delayClasses.length - 1)])}
 />
 ))}
 </div>
 )
}

interface LoadingSpinnerProps {
 size?:"sm" |"md" |"lg"
 text?: string
 className?: string
}

export function LoadingSpinner({ size ="md", text, className }: LoadingSpinnerProps) {
 const sizeClasses = {
 sm:"h-4 w-4",
 md:"h-8 w-8",
 lg:"h-12 w-12",
 }

 return (
 <div className={cn("flex flex-col items-center justify-center gap-3 py-8", className)}>
 <Spinner className={sizeClasses[size]} />
 {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
 </div>
 )
}

export function LoadingPage({ message ="Loading..." }: { message?: string }) {
 return (
 <div className="flex min-h-[400px] items-center justify-center">
 <div className="flex flex-col items-center gap-4">
 <Spinner className="h-10 w-10" />
 <p className="text-muted-foreground">{message}</p>
 </div>
 </div>
 )
}
