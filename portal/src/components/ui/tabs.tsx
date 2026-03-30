'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/lib/utils'

function Tabs({
 className,
 ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
 return (
 <TabsPrimitive.Root
 data-slot="tabs"
 className={cn('flex flex-col gap-2', className)}
 {...props}
 />
 )
}

function TabsList({
 className,
 ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
 return (
 <TabsPrimitive.List
 data-slot="tabs-list"
 className={cn(
 'inline-flex h-11 w-fit items-center justify-center rounded-md border border-border/60 bg-card/90 p-1 text-muted-foreground shadow-sm',
 className,
 )}
 {...props}
 />
 )
}

function TabsTrigger({
 className,
 ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
 return (
 <TabsPrimitive.Trigger
 data-slot="tabs-trigger"
 className={cn(
"inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-sm border border-transparent px-3 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-[background-color,border-color,color,box-shadow] disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-border/70 data-[state=active]:bg-card-hover data-[state=active]:text-foreground data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
 className,
 )}
 {...props}
 />
 )
}

function TabsContent({
 className,
 ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
 return (
 <TabsPrimitive.Content
 data-slot="tabs-content"
 className={cn('flex-1 outline-none', className)}
 {...props}
 />
 )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
