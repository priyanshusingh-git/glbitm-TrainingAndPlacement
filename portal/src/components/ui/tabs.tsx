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
        'inline-flex h-auto min-h-0 w-fit items-center justify-start rounded-md border border-border/70 bg-card p-1 text-muted-foreground shadow-xs overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden gap-1',
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
        'group inline-flex h-auto flex-1 items-center justify-center gap-2 rounded-sm border border-transparent px-3.5 py-2 text-xs font-semibold text-muted-foreground whitespace-nowrap transition-all duration-200 hover:bg-muted/50 hover:text-foreground disabled:pointer-events-none disabled:opacity-40 data-[state=active]:bg-brown-800 data-[state=active]:text-cream data-[state=active]:shadow-xs [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4 [&_svg]:transition-colors data-[state=active]:[&_svg]:text-amber-300',
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
