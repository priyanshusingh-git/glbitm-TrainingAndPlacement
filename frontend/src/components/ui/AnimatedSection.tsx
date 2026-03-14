'use client'
import { motion, useInView, type Variants } from 'framer-motion'
import { useRef, ReactNode } from 'react'

interface AnimatedSectionProps {
 children: ReactNode;
 className?: string;
 delay?: number;
}

const stagger = {
 visible: { transition: { staggerChildren: 0.12 } },
}

export function AnimatedSection({ children, className, delay = 0 }: AnimatedSectionProps) {
 const ref = useRef(null)
 const inView = useInView(ref, { once: true, margin: '-80px' })

 return (
 <motion.div
 ref={ref}
 variants={stagger}
 initial="hidden"
 animate={inView ? 'visible' : 'hidden'}
 className={className}
 transition={{ delay }}
 >
 {children}
 </motion.div>
 )
}

export const fadeUp: Variants = {
 hidden: { opacity: 0, y: 24 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: 'easeOut' } },
}

export const fadeIn: Variants = {
 hidden: { opacity: 0 },
 visible: { opacity: 1, transition: { duration: 0.6 } },
}
