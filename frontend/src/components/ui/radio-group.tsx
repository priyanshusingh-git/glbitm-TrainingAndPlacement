'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { CircleIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function RadioGroup({
 className,
 ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
 return (
 <RadioGroupPrimitive.Root
 data-slot="radio-group"
 className={cn('grid gap-3', className)}
 {...props}
 />
 )
}

function RadioGroupItem({
 className,
 ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
 return (
 <RadioGroupPrimitive.Item
 data-slot="radio-group-item"
 className={cn(
 'aspect-square size-4 shrink-0 rounded-full border border-border bg-background text-brown-800 shadow-sm transition-[background-color,border-color,box-shadow] outline-none focus-visible:border-brown-800 focus-visible:ring-[4px] focus-visible:ring-amber-500/20 aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50',
 className,
 )}
 {...props}
 >
 <RadioGroupPrimitive.Indicator
 data-slot="radio-group-indicator"
 className="relative flex items-center justify-center"
 >
 <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
 </RadioGroupPrimitive.Indicator>
 </RadioGroupPrimitive.Item>
 )
}

export { RadioGroup, RadioGroupItem }
