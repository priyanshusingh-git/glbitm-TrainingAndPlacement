# GL Bajaj T&P Portal — Mobile-First + PWA Implementation

## SYSTEM CONTEXT

You are implementing mobile-first improvements and app-like behaviours for the GL Bajaj Institute Training & Placement Portal. This is a production Next.js 16 App Router project. Read every file before touching it. Never guess at file paths or component names — they are all specified below.

---

## REPO

`github.com/priyanshusingh-git/glbitm-TrainingAndPlacement` (main branch)

**Key facts about the codebase:**
- Stack: Next.js 16 App Router, Tailwind CSS v4, shadcn/ui, Firebase Auth
- Fonts: Fraunces (`--font-display`), Inter (`--font-body`), Fira Code (`--font-mono`) — all loaded in `src/app/layout.tsx`
- Design tokens in `src/app/globals.css` — never hardcode hex values, always use Tailwind token classes
- Page pattern: `page.tsx` is a thin wrapper importing from `src/modules/`. All logic lives in the module client component
- API client: `api.get/post/patch/delete` from `@/lib/api` — never use raw `fetch()`
- Brand colors: `bg-brown-900` (sidebar), `text-amber-500` (active/accent), `bg-background` (cream page bg)
- Student portal layout: `src/app/(student)/client-layout.tsx` → `DashboardLayout` from `src/components/layout/dashboard/dashboard-layout.tsx`
- The `DashboardLayout` already handles mobile sidebar correctly (Sheet drawer). The issues are inside page content, not the layout shell.

---

## TASK 1 — Bottom Navigation Bar (highest priority)

Create `src/components/layout/dashboard/bottom-nav.tsx`:

```tsx
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Briefcase, BookOpen, FileText, User } from "lucide-react"
import { cn } from "@/lib/utils"

const STUDENT_BOTTOM_NAV = [
  { label: "Home",     href: "/student",            icon: LayoutDashboard },
  { label: "Drives",   href: "/student/placements", icon: Briefcase       },
  { label: "Training", href: "/student/training",   icon: BookOpen        },
  { label: "Tests",    href: "/student/tests",      icon: FileText        },
  { label: "Profile",  href: "/student/profile",    icon: User            },
]

export function StudentBottomNav() {
  const pathname = usePathname()
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-5 h-16">
        {STUDENT_BOTTOM_NAV.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[10px] font-medium min-h-[44px] transition-all active:scale-95",
                isActive ? "text-amber-500" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-amber-500")} />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

Then edit `src/app/(student)/client-layout.tsx`:
- Import `StudentBottomNav` from the new file
- Render it inside the `DashboardLayout` after `{children}`

Then edit `src/components/layout/dashboard/dashboard-layout.tsx`:
- The `<main>` element currently has `className="page-shell pb-24 pt-6 md:pb-8 md:pt-8"` — change bottom padding to `pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-8`
- The floating Plus button (`md:hidden`, bottom-right) — wrap it so it only renders when `role !== "student"` since the bottom nav replaces it for students

---

## TASK 2 — Safe Area + Viewport

In `src/app/layout.tsx`, find the viewport meta tag and change it to:

```tsx
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

This is required for `env(safe-area-inset-bottom)` to work on iPhones with Face ID.

---

## TASK 3 — Student Dashboard Fixes

File: `src/modules/students/components/student-dashboard-client.tsx`

**3a — Stat cards grid — 1-col → 2-col at base:**
```tsx
// BEFORE
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
// AFTER
<div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
```

**3b — Hero banner padding — tighter on mobile:**
```tsx
// BEFORE: p-8
// AFTER:  p-5 md:p-8
```

**3c — Top bar — hide on mobile (header already has avatar):**
```tsx
// BEFORE: <div className="flex items-center justify-between">
// AFTER:  <div className="hidden md:flex items-center justify-between">
```

**3d — Stat card icon colors — replace off-brand colors:**

In `getIcon()` function, replace `text-blue-500`, `text-emerald-500`, `text-indigo-500` with brand tokens:
- Use `text-amber-500` for featured/primary metrics
- Use `text-muted-foreground` for neutral metrics
- Use `text-success` for positive/completion metrics

---

## TASK 4 — Touch Targets (44px minimum)

**4a.** `src/app/(student)/student/placements/placements-client.tsx` — Apply Now button:
```tsx
// BEFORE: <Button size="sm" onClick={onApply}>
// AFTER:  <Button className="min-h-[44px]" onClick={onApply}>
```

**4b.** `src/app/(student)/student/tests/page.tsx` — Start Assessment button:
```tsx
// BEFORE: className="w-full mt-4 h-10 font-bold..."
// AFTER:  className="w-full mt-4 min-h-[44px] font-bold..."
```

**4c.** `src/components/layout/dashboard/sidebar.tsx` — nav item links:
```tsx
// BEFORE: "group flex items-center gap-3 rounded-md px-3 py-2.5..."
// AFTER:  "group flex items-center gap-3 rounded-md px-3 py-3 min-h-[44px]..."
```

---

## TASK 5 — Page Transitions

Add `animate-in fade-in duration-300` to the root div of pages that are missing it:

- `src/app/(student)/student/placements/placements-client.tsx`:
```tsx
// BEFORE: <div className="space-y-6">
// AFTER:  <div className="space-y-6 animate-in fade-in duration-300">
```

- `src/modules/training/components/student-training-client.tsx`:
```tsx
// BEFORE: <div className="space-y-6">
// AFTER:  <div className="space-y-6 animate-in fade-in duration-300">
```

---

## TASK 6 — Admin Portal Bug Fixes (3 changes only)

**6a.** `src/modules/students/components/students-client.tsx` — Student Database table overflows on mobile. Find the div wrapping the `<Table>` component (it has `className` containing `overflow-hidden rounded-xl border`) and add `overflow-x-auto` to it or wrap it in `<div className="overflow-x-auto">`.

**6b.** `src/components/layout/dashboard/bento-grid.tsx` — AdminOverview stat cards 1-col on mobile:
```tsx
// BEFORE: "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
// AFTER:  "mx-auto grid max-w-7xl grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4"
```

**6c.** `src/modules/training/components/tests-client.tsx` — Tests stat cards 1-col on mobile:
```tsx
// BEFORE: "grid gap-4 md:grid-cols-4"
// AFTER:  "grid gap-4 grid-cols-2 md:grid-cols-4"
```

---

## TASK 7 — PWA: Web App Manifest

Create `src/app/manifest.ts`:

```ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GL Bajaj Training & Placement Portal',
    short_name: 'GL Bajaj T&P',
    description: 'Training & Placement portal for GL Bajaj Institute — drives, shortlists, offers.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#3A1C0B',
    theme_color: '#3A1C0B',
    icons: [
      { src: '/icons/icon-72x72.png',   sizes: '72x72',   type: 'image/png' },
      { src: '/icons/icon-96x96.png',   sizes: '96x96',   type: 'image/png' },
      { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
      { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
    categories: ['education', 'productivity'],
    lang: 'en-IN',
    prefer_related_applications: false,
  }
}
```

Then generate icons. Run this in the project root:
```bash
npx pwa-asset-generator public/glbitm-logo.png public/icons --background "#3A1C0B" --padding "10%"
```

---

## TASK 8 — PWA: Service Worker

Install:
```bash
npm install @serwist/next serwist
```

Edit `next.config.ts` — wrap the existing config:
```ts
import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
})

export default withSerwist({
  // keep all existing config here unchanged
})
```

Create `src/app/sw.ts`:
```ts
import { defaultCache } from '@serwist/next/worker'
import { installSerwist } from 'serwist'

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (string | { url: string; revision: string })[]
}

installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: /^\/(?:student|admin|recruiter|trainer)(?:\/|$)/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'portal-pages',
        networkTimeoutSeconds: 5,
        expiration: { maxAgeSeconds: 30 * 60 },
      },
    },
    {
      matcher: /^\/api\/(?:placements|students|training|dashboard|notifications)/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-data',
        expiration: { maxAgeSeconds: 30 * 60 },
      },
    },
    {
      matcher: /^\/api\/(?:auth|upload)/,
      handler: 'NetworkOnly',
    },
    {
      matcher: /\.(?:js|css|woff2|woff|ttf)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: { maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      matcher: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: { maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [{ url: '/offline', matcher: /\.(html|json)$/ }],
  },
})

self.addEventListener('push', (event) => {
  const data = event.data?.json()
  if (!data) return
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      data: { url: data.url },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data?.url || '/student'))
})
```

---

## TASK 9 — PWA: Offline Page

Create `src/app/offline/page.tsx`:

```tsx
export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center bg-background">
      <div className="text-5xl">📡</div>
      <h1 className="font-display text-3xl font-bold text-foreground">You're offline</h1>
      <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
        No internet connection. Pages you've previously visited are still available.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="min-h-[44px] rounded-lg bg-brown-900 px-6 text-sm font-semibold text-white active:scale-95 transition-transform"
      >
        Try again
      </button>
    </div>
  )
}
```

---

## TASK 10 — PWA: Install Banner

Create `src/components/shared/PWAInstallBanner.tsx`:

```tsx
"use client"
import { useEffect, useState } from "react"
import { X, Download } from "lucide-react"

export function PWAInstallBanner() {
  const [prompt, setPrompt] = useState<any>(null)
  const [dismissed, setDismissed] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent))
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) { setDismissed(true); return }
    const handler = (e: any) => { e.preventDefault(); setPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (dismissed || (!prompt && !isIOS)) return null

  return (
    <div className="md:hidden fixed bottom-[calc(4rem+env(safe-area-inset-bottom)+8px)] left-4 right-4 z-50 rounded-xl border border-border/60 bg-background/98 p-4 shadow-lg backdrop-blur-xl">
      <button onClick={() => setDismissed(true)} className="absolute right-3 top-3 p-1 min-h-[44px] min-w-[44px] flex items-center justify-center">
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brown-900">
          <span className="font-display text-sm font-bold text-amber-500">GL</span>
        </div>
        <div className="flex-1 pr-6">
          <p className="text-sm font-semibold text-foreground">Add to Home Screen</p>
          {isIOS ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Tap <strong>Share</strong> then <strong>Add to Home Screen</strong>
            </p>
          ) : (
            <>
              <p className="mt-1 text-xs text-muted-foreground">
                Install for faster access and offline support
              </p>
              <button
                onClick={async () => { await prompt.prompt(); setDismissed(true) }}
                className="mt-2 flex items-center gap-1.5 rounded-md bg-brown-900 px-3 py-1.5 text-xs font-semibold text-white active:scale-95 transition-transform"
              >
                <Download className="h-3.5 w-3.5" /> Install App
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
```

Add `<PWAInstallBanner />` to `src/app/(student)/client-layout.tsx` — render it after `<StudentBottomNav />`.

---

## CONSTRAINTS

- Do not change any API routes
- Do not modify `src/lib/`, `src/services/`, `src/types/`, or any auth logic
- Do not change the admin portal sidebar or header
- Do not add any new npm packages beyond `@serwist/next` and `serwist`
- Preserve all existing Tailwind classes — only add, never remove unless explicitly instructed
- Every new component must use tokens from `globals.css` — no hardcoded hex, no raw `blue-500` / `emerald-500` / `violet-*`
- Do not touch the landing page HTML file — that is a separate task

---

## VERIFICATION CHECKLIST

After implementing all tasks, confirm each of these:

- [ ] Bottom nav visible at 360px, hidden at md (768px+)
- [ ] Tapping each bottom nav item navigates correctly, amber active state shows
- [ ] Bottom nav does not overlap page content — safe-area padding applied
- [ ] On iPhone, content is not hidden behind the home indicator bar
- [ ] Student stat cards are 2-col at 360px
- [ ] Hero banner padding is tighter on mobile (p-5 not p-8)
- [ ] Top bar (search + avatar) hidden on mobile
- [ ] Admin student table scrolls horizontally on mobile — no full-page overflow
- [ ] Admin bento stat cards are 2-col at 360px
- [ ] Admin tests stat cards are 2-col at 360px
- [ ] Apply Now button is at least 44px tall
- [ ] Start Assessment button is at least 44px tall
- [ ] Sidebar nav items are at least 44px tall
- [ ] Placements and Training pages have animate-in fade-in on root div
- [ ] `/manifest.json` returns valid JSON (visit in browser)
- [ ] DevTools → Application → Manifest — no errors, icons load
- [ ] DevTools → Application → Service Workers — shows "activated and running"
- [ ] `/offline` page renders correctly when visited directly
- [ ] PWA install banner appears on Android Chrome after second visit (or immediately if prompted)
