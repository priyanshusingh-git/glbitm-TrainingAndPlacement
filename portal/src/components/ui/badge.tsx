import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
 'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 :ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
 {
 variants: {
 variant: {
 default:
 'border-transparent bg-brown-800 text-brown-800-foreground hover:bg-brown-800/80 transition-all duration-300',
 secondary:
 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-300',
 destructive:
 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 transition-all duration-300',
 success:
 'border-transparent bg-success/15 text-success hover:bg-success/25 transition-all duration-300',
 warning:
 'border-transparent bg-warning/15 text-warning hover:bg-warning/25 transition-all duration-300',
 error:
 'border-transparent bg-error/15 text-error hover:bg-error/25 transition-all duration-300',
 achievement:
 'border-transparent bg-achievement/15 text-achievement hover:bg-achievement/25 transition-all duration-300',
 outline:
 'text-foreground border-border hover:bg-accent hover:text-accent-foreground transition-all duration-300',
 },
 },
 defaultVariants: {
 variant: 'default',
 },
 },
)

function Badge({
 className,
 variant,
 asChild = false,
 ...props
}: React.ComponentProps<'span'> &
 VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
 const Comp = asChild ? Slot : 'span'

 return (
 <Comp
 data-slot="badge"
 className={cn(badgeVariants({ variant }), className)}
 {...props}
 />
 )
}

export { Badge, badgeVariants }
