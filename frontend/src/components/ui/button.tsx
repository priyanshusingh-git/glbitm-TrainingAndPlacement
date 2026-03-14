import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
 // base
 'inline-flex items-center justify-center gap-2 font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50',
 {
 variants: {
 variant: {
 // GL Bajaj brand variants
 primary: 'bg-brown-800 text-cream hover:bg-brown-700 shadow-sm hover:-translate-y-0.5 hover:shadow-md',
 accent: 'bg-amber-500 text-brown-900 hover:bg-amber-400 shadow-amber hover:-translate-y-0.5',
 ghost: 'border border-brown-800/25 text-brown-800 hover:bg-brown-800/7 hover:border-brown-800/50',
 'ghost-dark': 'border border-white/20 text-white/85 hover:bg-white/7 hover:border-white/55',
 destructive: 'bg-red-600 text-white hover:bg-red-700',
 // Keep shadcn defaults for internal use
 outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
 link: 'text-brown-800 underline-offset-4 hover:underline',
 // Fallback variants if internal components use them
 default: 'bg-brown-800 text-cream hover:bg-brown-700 shadow-sm hover:-translate-y-0.5 hover:shadow-md',
 secondary: 'bg-amber-500 text-brown-900 hover:bg-amber-400 shadow-amber hover:-translate-y-0.5',
 },
 size: {
 sm: 'h-9 px-4 text-sm rounded-sm',
 md: 'h-11 px-8 text-sm rounded-sm',
 lg: 'h-13 px-10 text-base rounded-sm',
 icon: 'h-10 w-10 rounded-md',
 default: 'h-11 px-8 text-sm rounded-sm',
 'icon-sm': 'h-8 w-8 rounded-md',
 'icon-lg': 'h-11 w-11 rounded-md'
 },
 },
 defaultVariants: {
 variant: 'primary',
 size: 'md',
 },
 }
)

function Button({
 className,
 variant,
 size,
 asChild = false,
 ...props
}: React.ComponentProps<'button'> &
 VariantProps<typeof buttonVariants> & {
 asChild?: boolean
 }) {
 const Comp = asChild ? Slot : 'button'

 return (
 <Comp
 data-slot="button"
 className={cn(buttonVariants({ variant, size, className }))}
 {...props}
 />
 )
}

export { Button, buttonVariants }
