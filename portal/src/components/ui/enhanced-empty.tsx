import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia, EmptyContent } from"@/components/ui/empty"
import { Button } from"@/components/ui/button"
import { LucideIcon } from"lucide-react"
import { cn } from"@/lib/utils"

interface EnhancedEmptyProps {
 icon?: LucideIcon
 title: string
 description: string
 action?: {
 label: string
 onClick: () => void
 }
 className?: string
 variant?:"default" |"minimal" |"illustrated"
}

export function EnhancedEmpty({
 icon: Icon,
 title,
 description,
 action,
 className,
 variant ="default",
}: EnhancedEmptyProps) {
 if (variant ==="minimal") {
 return (
 <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
 {Icon && (
 <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
 <Icon className="h-6 w-6 text-muted-foreground" />
 </div>
 )}
 <h3 className="text-lg font-semibold mb-2">{title}</h3>
 <p className="text-sm text-muted-foreground mb-4 max-w-md">{description}</p>
 {action && (
 <Button variant="outline" onClick={action.onClick}>
 {action.label}
 </Button>
 )}
 </div>
 )
 }

 return (
 <Empty className={cn("border-2 border-dashed", className)}>
 <EmptyHeader>
 {Icon && (
 <EmptyMedia variant="icon">
 <Icon className="h-8 w-8 text-muted-foreground" />
 </EmptyMedia>
 )}
 <EmptyTitle>{title}</EmptyTitle>
 <EmptyDescription>{description}</EmptyDescription>
 </EmptyHeader>
 {action && (
 <EmptyContent>
 <Button onClick={action.onClick} variant="outline">
 {action.label}
 </Button>
 </EmptyContent>
 )}
 </Empty>
 )
}
