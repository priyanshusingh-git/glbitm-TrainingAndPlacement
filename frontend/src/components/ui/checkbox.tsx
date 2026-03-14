'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { CheckIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function Checkbox({
 className,
 ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
 return (
 <CheckboxPrimitive.Root
 data-slot="checkbox"
 className={cn(
 'peer size-4 shrink-0 rounded-[4px] border border-border bg-background shadow-sm outline-none transition-[background-color,border-color,box-shadow] data-[state=checked]:border-brown-800 data-[state=checked]:bg-brown-800 data-[state=checked]:text-brown-800-foreground focus-visible:border-brown-800 focus-visible:ring-[4px] focus-visible:ring-amber-500/20 aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:cursor-not-allowed disabled:opacity-50',
 className,
 )}
 {...props}
 >
 <CheckboxPrimitive.Indicator
 data-slot="checkbox-indicator"
 className="flex items-center justify-center text-current transition-none"
 >
 <CheckIcon className="size-3.5" />
 </CheckboxPrimitive.Indicator>
 </CheckboxPrimitive.Root>
 )
}

export { Checkbox }
