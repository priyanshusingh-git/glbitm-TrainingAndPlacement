"use client"

import { cn } from"@/lib/utils"

export const BentoGrid = ({
 className,
 children,
}: {
 className?: string
 children?: React.ReactNode
}) => {
 return (
 <div
 className={cn(
"mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4",
 className
 )}
 >
 {children}
 </div>
 )
}

export const BentoGridItem = ({
 className,
 title,
 description,
 header,
 icon,
 onClick,
}: {
 className?: string
 title?: string | React.ReactNode
 description?: string | React.ReactNode
 header?: React.ReactNode
 icon?: React.ReactNode
 onClick?: () => void
}) => {
 return (
 <div
 className={cn(
"group/bento premium-muted row-span-1 flex flex-col justify-between space-y-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-[border-color,box-shadow,transform,background-color] duration-200 hover:bg-card-hover hover:border-brown-800/20 hover:shadow-md",
 className
 )}
 onClick={onClick}
 >
 {header}
 <div className="transition duration-200 group-hover/bento:translate-x-1">
 {icon}
 <div className="mb-1 mt-2 font-display text-lg font-bold text-foreground leading-tight">
 {title}
 </div>
 <div className="text-xs font-normal text-muted-foreground font-body">
 {description}
 </div>
 </div>
 </div>
 )
}
