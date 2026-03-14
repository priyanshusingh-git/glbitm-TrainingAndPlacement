'use client'
import { useInView, animate } from 'framer-motion'
import { useEffect, useRef } from 'react'

export function StatCounter({ value, suffix = '', decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
 const ref = useRef<HTMLSpanElement>(null)
 const inView = useInView(ref, { once: true, margin: '-50px' })

 useEffect(() => {
 if (!inView || !ref.current) return
 const controls = animate(0, value, {
 duration: 1.8,
 ease: 'easeOut',
 onUpdate: (v) => {
 if (ref.current) ref.current.textContent = v.toFixed(decimals) + suffix
 },
 })
 return () => controls.stop()
 }, [inView, value, suffix, decimals])

 return <span ref={ref} className="tabular-nums">0{suffix}</span>
}
