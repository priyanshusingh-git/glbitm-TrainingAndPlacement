import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
 return (
 <input
 type={type}
 data-slot="input"
 className={cn(
 'file:text-foreground placeholder:text-muted-foreground selection:bg-amber-500/35 selection:text-brown-900 h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-base shadow-sm outline-none transition-[background-color,border-color,box-shadow] duration-200 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
 'hover:border-border focus-visible:border-brown-800 focus-visible:ring-4 focus-visible:ring-amber-500/20',
 'aria-invalid:border-destructive aria-invalid:ring-destructive/15',
 className,
 )}
 {...props}
 />
 )
}

export { Input }
