'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

function Progress({
 className,
 value,
 ...props
}: React.ComponentProps<'progress'>) {
 return (
 <progress
 data-slot="progress"
 className={cn(
 'app-progress h-2 w-full overflow-hidden rounded-full bg-brown-800/20',
 className,
 )}
 max={100}
 value={value}
 {...props}
 />
 )
}

export { Progress }
