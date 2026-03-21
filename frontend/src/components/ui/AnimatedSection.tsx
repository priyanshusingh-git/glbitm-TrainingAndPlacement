'use client'
import { ReactNode } from 'react'

interface AnimatedSectionProps {
 children: ReactNode;
 className?: string;
 delay?: number;
}

const stagger = {
 visible: { transition: { staggerChildren: 0.12 } },
}

export function AnimatedSection({ children, className, delay = 0 }: AnimatedSectionProps) {
 return (
 <div
 className={className}
 data-delay={delay}
 >
 {children}
 </div>
 )
}

export const fadeUp = {
 hidden: { opacity: 0, y: 24 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } },
}

export const fadeIn = {
 hidden: { opacity: 0 },
 visible: { opacity: 1, transition: { duration: 0.6 } },
}
