# GL Bajaj T&P — Component Architecture
## Stack: Next.js 14 + Tailwind + shadcn/ui + Framer Motion

---

## 1. Project Setup

```bash
# Create Next.js app
npx create-next-app@latest glbajaj-tnp --typescript --tailwind --app

# Add shadcn/ui
npx shadcn-ui@latest init

# shadcn init answers:
# Style:              Default
# Base color:         Stone   (we override everything via tokens anyway)
# CSS variables:      Yes     ← critical

# Install only the shadcn components you actually need:
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add sheet        # mobile nav drawer
npx shadcn-ui@latest add accordion    # FAQ section
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add label
npx shadcn-ui@latest add toast

# Animation
npm install framer-motion

# Icons
npm install lucide-react

# Fonts (via next/font — faster than Google CDN)
# Already handled in layout.tsx below
```

---

## 2. Font Setup — layout.tsx

```tsx
import { Cormorant_Garamond, Outfit } from 'next/font/google'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${outfit.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

---

## 3. Component Map — What to Use For What

| Need                        | Use                          | Notes                              |
|-----------------------------|------------------------------|------------------------------------|
| Buttons                     | shadcn `Button` + custom variants | Override with brand tokens      |
| Cards                       | `.card-base` utility class   | Or shadcn `Card` restyled          |
| Modal / Enquiry form        | shadcn `Dialog`              | Fully accessible, zero styling     |
| Mobile nav drawer           | shadcn `Sheet`               | Slides from side                   |
| FAQ accordion               | shadcn `Accordion`           | Animated, keyboard accessible      |
| Tabs (Student / Recruiter)  | shadcn `Tabs`                | Use for dashboard-style content    |
| Toast notifications         | shadcn `Toast`               | Form submission feedback           |
| Page transitions            | Framer Motion `AnimatePresence` | Route change animations         |
| Scroll animations           | Framer Motion `useInView`    | Fade-up on scroll                  |
| Icons                       | `lucide-react`               | Consistent 24px line icons         |
| Company ticker              | Pure CSS animation           | No library needed                  |
| Stats counter               | Framer Motion + `useInView`  | Counts up when scrolled into view  |

---

## 4. Folder Structure

```
src/
├── app/
│   ├── layout.tsx          # fonts, metadata, providers
│   ├── page.tsx            # landing page (composes sections)
│   ├── globals.css         # ← our token file lives here
│   └── (routes)/
│       ├── recruiters/
│       └── students/
│
├── components/
│   ├── ui/                 # shadcn components (auto-generated, edit freely)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   │
│   ├── layout/             # site-wide layout pieces
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   │
│   └── sections/           # landing page sections
│       ├── Hero.tsx
│       ├── StatsTicker.tsx
│       ├── NumbersBar.tsx
│       ├── ForYou.tsx
│       ├── Recruiters.tsx
│       ├── CDC.tsx
│       ├── Process.tsx
│       ├── Testimonials.tsx
│       ├── TrustStrip.tsx
│       └── ContactCTA.tsx
│
├── lib/
│   └── utils.ts            # shadcn cn() helper
│
└── data/
    ├── recruiters.ts        # recruiter list as data, not hardcoded JSX
    ├── stats.ts             # placement stats
    └── testimonials.ts      # testimonial content
```

---

## 5. shadcn Button — Override Example

After running `npx shadcn-ui@latest add button`, open
`src/components/ui/button.tsx` and extend the variants:

```tsx
import { cva } from 'class-variance-authority'

const buttonVariants = cva(
  // base
  'inline-flex items-center justify-center gap-2 font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50',
  {
    variants: {
      variant: {
        // GL Bajaj brand variants
        primary:   'bg-brown-800 text-cream hover:bg-brown-700 shadow-sm hover:-translate-y-0.5 hover:shadow-md',
        accent:    'bg-amber-500 text-brown-900 hover:bg-amber-400 shadow-amber hover:-translate-y-0.5',
        ghost:     'border border-brown-800/25 text-brown-800 hover:bg-brown-800/7 hover:border-brown-800/50',
        'ghost-dark': 'border border-white/20 text-white/85 hover:bg-white/7 hover:border-white/55',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        // Keep shadcn defaults for internal use
        outline:   'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        link:      'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm:   'h-9  px-4 text-sm  rounded-sm',
        md:   'h-11 px-8 text-sm  rounded-sm',
        lg:   'h-13 px-10 text-base rounded-sm',
        icon: 'h-10 w-10 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)
```

---

## 6. Framer Motion — Scroll Fade Pattern

Use this pattern for every section to animate on scroll:

```tsx
'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.65, ease: 'easeOut' } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
}

export function AnimatedSection({ children, className }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Usage:
// <AnimatedSection>
//   <motion.h2 variants={fadeUp}>Heading</motion.h2>
//   <motion.p  variants={fadeUp}>Subtext</motion.p>
// </AnimatedSection>
```

---

## 7. Stats Counter Component

```tsx
'use client'
import { useInView, useMotionValue, useSpring, animate } from 'framer-motion'
import { useEffect, useRef } from 'react'

export function StatCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView || !ref.current) return
    const controls = animate(0, value, {
      duration: 1.8,
      ease: 'easeOut',
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = v.toFixed(1) + suffix
      },
    })
    return () => controls.stop()
  }, [inView, value, suffix])

  return <span ref={ref}>0{suffix}</span>
}

// Usage:
// <StatCounter value={94} suffix="%" />   → counts from 0 to 94%
// <StatCounter value={42} suffix="L" />   → counts from 0 to 42L
```

---

## 8. The 3 Rules to Maintain Long-Term

1. **Never hardcode `#512912`** anywhere in JSX — always use `brown-800` or `text-brown-800`.
   If the brand color ever changes, you update ONE line in `globals.css`.

2. **All content lives in `/data/`** — not hardcoded in components.
   Recruiter names, stats, testimonials are all arrays you edit without touching JSX.

3. **shadcn components live in `/components/ui/`** — edit them freely.
   They're your code, not a library. When shadcn releases updates, you choose what to adopt.
