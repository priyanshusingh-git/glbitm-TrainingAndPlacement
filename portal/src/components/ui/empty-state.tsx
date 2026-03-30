"use client"

import * as React from"react"
import { LucideIcon } from"lucide-react"
import { cn } from"@/lib/utils"
import { Button } from"@/components/ui/button"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
 icon?: LucideIcon
 title: string
 description: string
 action?: {
 label: string
 onClick: () => void
 icon?: LucideIcon
 }
 variant?:"default" |"minimal" |"card"
}

export function EmptyState({
 icon: Icon,
 title,
 description,
 action,
 variant ="default",
 className,
 ...props
}: EmptyStateProps) {
 return (
 <div
 className={cn(
"flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500",
 variant ==="default" &&"py-20 px-4",
 variant ==="minimal" &&"py-10 px-2",
 variant ==="card" &&"py-16 px-6 border-2 border-dashed rounded-md bg-muted/5",
 className
 )}
 {...props}
 >
 <div className="relative mb-6">
 {/* Background Decorative Element */}
 <div className="absolute inset-0 -m-4 bg-brown-800/5 rounded-full blur-2xl animate-pulse" />

 {/* Icon Container */}
 <div className="relative flex h-20 w-20 items-center justify-center rounded-md bg-gradient-to-br from-background to-muted border border-border/50 shadow-xl shadow-primary/5">
 {Icon ? (
 <Icon className="h-10 w-10 text-brown-800/60" />
 ) : (
 <div className="h-10 w-10 rounded-full border-4 border-dashed border-muted-foreground/20" />
 )}
 </div>
 </div>

 <div className="max-w-md space-y-2">
 <h3 className="text-xl font-bold tracking-tight text-foreground/90">
 {title}
 </h3>
 <p className="text-sm text-muted-foreground leading-relaxed">
 {description}
 </p>
 </div>

 {action && (
 <div className="mt-8">
 <Button
 onClick={action.onClick}
 className="rounded-md px-8 h-11 font-semibold transition-all hover:shadow-lg hover:shadow-primary/20"
 >
 {action.icon && <action.icon className="mr-2 h-4 w-4" />}
 {action.label}
 </Button>
 </div>
 )}
 </div>
 )
}
