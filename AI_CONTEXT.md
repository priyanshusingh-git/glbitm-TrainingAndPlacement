# AI Context — GL Bajaj T&P / CDC Portal (Scorlo)

> **PURPOSE**: This file provides rules, constraints, and architectural context for any AI
> assistant (Copilot, Cursor, Claude, Gemini, etc.) working on this codebase. Read this
> file in full before generating or modifying any code.

---

## 1. Project Identity

- **Project**: GL Bajaj Institute Training & Placement + Career Development Centre Portal
- **Internal Name**: Scorlo
- **Stack**: Next.js 16 · Tailwind CSS v4 · shadcn/ui · Framer Motion · Prisma · Context-based Auth
- **Dashboards**: Student · T&P Admin · CDC Trainer · Recruiter
- **Design Language**: "Prestige Institutional" — warm, authoritative, premium

---

## 2. The 3 Golden Rules (MANDATORY)

These are non-negotiable architectural rules. Violating them is a blocking issue.

### Rule 1 — NEVER hardcode colors
```
❌ NEVER: style={{ color: '#512912' }}
❌ NEVER: className="bg-[#3A1C0B]"
❌ NEVER: stroke="#93c5fd"

✅ ALWAYS: className="bg-brown-800"
✅ ALWAYS: stroke="var(--primary)"
✅ ALWAYS: className="text-amber-500"
```
All colors are defined as CSS variables in `src/app/globals.css` and mapped to Tailwind
tokens. If a new color is needed, add it to `globals.css` first, then use the token.

### Rule 2 — All content lives in `/src/data/`
```
❌ NEVER: Hardcode text, statistics, or data arrays inside JSX components
✅ ALWAYS: Create/update a file in src/data/ and import it

Existing data files:
  src/data/auth.tsx        — Auth panel branding (title, description, stats)
  src/data/landing.ts      — Landing page hero content, highlights
  src/data/stats.ts        — Placement analytics data (charts)
  src/data/recruiters.ts   — Recruiter company names
  src/data/testimonials.ts — Student testimonials
  src/data/process.ts      — Placement process steps
  src/data/dashboard.ts    — Dashboard widget content
```

### Rule 3 — Own your components
shadcn/ui components live in `src/components/ui/` as **editable source files**, not
npm dependencies. You can freely modify them. Never install shadcn components as
packages — always copy them in with `npx shadcn-ui@latest add [name]`.

---

## 3. Color Palette (The Brand)

The portal uses a **warm brown + amber gold** palette. Never use cold grays, blues,
or generic "SaaS" colors.

### Primary Scale (Brown — GL Bajaj Heritage)
| Token | Hex | Usage |
|:------|:------|:------|
| `brown-950` | #120A05 | Shadows, extreme depth ONLY. **Never for buttons.** |
| `brown-900` | #371908 | Active button base, hero backgrounds |
| `brown-800` ★ | #512912 | **MAIN BRAND** — button hover, headings, borders |
| `brown-700` | #6B3A1F | Gradient endpoints, secondary hover |
| `brown-400` | #D2A078 | Inactive text, placeholder hints |
| `brown-100` | #F2EAD8 | Inactive button bg ("Light Sand") |
| `brown-50` | #FDF7EF | Page background ("Cream") |

### Accent Scale (Amber Gold)
| Token | Hex | Usage |
|:------|:------|:------|
| `amber-500` ★ | #E8A020 | **MAIN ACCENT** — CTAs, stat numbers, golden glow |
| `amber-700` | #C07A10 | Italic accent text |
| `amber-400` | #F5BB40 | Eyebrow labels on dark backgrounds |

### CRITICAL: Brown-950 is NOT for interactive elements
`Brown-950` (#120A05) is nearly black and will look like "flat black" on most screens.
It is reserved for shadows and extreme contrast text only. For buttons and interactive
elements, use `brown-900` (base) → `brown-800` (hover).

---

## 4. Typography

| Role | Font | Variable | Notes |
|:-----|:-----|:---------|:------|
| Display (h1–h3) | **Fraunces** | `--font-display` | Variable serif. Use `font-display` class. Supports `opsz` axis. |
| Body / UI | **Inter** | `--font-body` | Default on `<body>`. Has tabular numerals (`tnum`). |
| Monospace | **Fira Code** | `--font-mono` | Code snippets only. |

**Font loading**: Fonts are loaded via `next/font/google` in `src/app/layout.tsx`.
Never import fonts via `<link>` tags or CSS `@import`.

---

## 5. Button Design System

All primary CTA buttons across the portal follow a strict 3-state system:

### Active (form is valid)
```
bg-brown-900 text-brown-50 hover:bg-brown-800
shadow-lg shadow-amber-900/15 hover:shadow-amber-500/20
hover:-translate-y-0.5
```

### Inactive (form is empty/invalid)
```
bg-brown-100/50 text-brown-400 border border-brown-200/60
cursor-not-allowed shadow-none
```
This must look "built but unpowered" — never use opacity tricks on dark colors.

### Success
```
bg-emerald-600 text-white
```

---

## 6. Form Validation Rules

**Use "Lazy Validation" (blur-event logic). Never use eager validation.**

```
❌ NEVER: Show errors while user is still typing
❌ NEVER: Show "required" error on page load or empty blur
✅ ALWAYS: Show errors only after user has typed AND blurred (left the field)
✅ ALWAYS: On form submit, force-mark all fields as touched
```

The pattern:
```tsx
const handleBlur = () => {
  if (value.trim().length > 0) {           // Only if user actually typed something
    setTouched(prev => ({ ...prev, fieldName: true }))
    setErrors(prev => ({ ...prev, fieldName: validate(value) }))
  }
}
```

---

## 7. File Structure Conventions

```
portal/
├── src/
│   ├── app/
│   │   ├── globals.css           ← ALL design tokens. The single source of truth.
│   │   ├── layout.tsx            ← Font loading, providers, metadata
│   │   ├── page.tsx              ← Landing page
│   │   ├── (auth)/               ← Login, forgot-password, change-password
│   │   ├── (student)/            ← Student dashboard routes
│   │   ├── (admin)/              ← T&P Admin dashboard routes
│   │   ├── (recruiter)/          ← Recruiter dashboard routes
│   │   └── api/                  ← API route handlers
│   ├── components/
│   │   ├── ui/                   ← shadcn components (OWNED source code)
│   │   ├── layout/               ← Navbar, Footer, Sidebar, AuthBrandPanel
│   │   └── sections/             ← Landing page sections (Hero, CDC, Process, etc.)
│   ├── data/                     ← ALL static content (Rule 2)
│   ├── contexts/                 ← React contexts (AuthContext, NotificationContext)
│   ├── hooks/                    ← Custom React hooks
│   ├── lib/                      ← Utilities (api client, validators, cn helper)
│   ├── modules/                  ← Feature modules (students, analytics, etc.)
│   ├── services/                 ← Backend service integrations
│   └── types/                    ← TypeScript type definitions
```

---

## 8. Styling Conventions

### Use Tailwind tokens, not arbitrary values
```
❌ NEVER: className="p-[13px] text-[#333]"
✅ ALWAYS: className="p-3 text-foreground"
```

### Use the `cn()` utility for conditional classes
```tsx
import { cn } from "@/lib/utils"

className={cn(
  "base-classes",
  condition && "conditional-classes",
  variant === "active" ? "active-classes" : "inactive-classes"
)}
```

### Custom CSS utility classes (defined in globals.css)
Use these instead of writing inline classes:
- `.btn-primary` — Brown-800 filled button
- `.btn-accent` — Amber-500 CTA button
- `.btn-ghost-light` / `.btn-ghost-dark` — Outline buttons
- `.card-base` — Standard white card with brand shadow
- `.section-tag` — Small uppercase tag above section headings
- `.section-h2` — Responsive h2 with display font
- `.gold-rule` — Short amber underline below h2 elements
- `.auth-input` — Styled input for authentication forms
- `.auth-label` — Styled label for authentication forms

### Shadows are brand-tinted
All shadows use the brand brown (#512912) instead of neutral black:
```
--shadow-sm: 0 2px 8px rgba(81,41,18,0.08)
--shadow-md: 0 8px 24px rgba(81,41,18,0.12)
--shadow-lg: 0 20px 50px rgba(81,41,18,0.16)
--shadow-amber: 0 10px 28px rgba(232,160,32,0.40)
```

---

## 9. Animation Conventions

### Entry animations
Use staggered `animate-fade-up` with delay classes (`stagger-1` through `stagger-6`):
```tsx
<div className="animate-fade-up stagger-1">First element</div>
<div className="animate-fade-up stagger-2">Second element</div>
```

### Transitions
```
--transition-fast: 150ms ease     ← toggles, checkboxes
--transition-base: 220ms ease     ← hover, focus, color changes
--transition-slow: 400ms ease     ← page-level state changes
--transition-spring: 300ms cubic-bezier(0.34, 1.56, 0.64, 1)  ← bouncy press
```

### Accessibility
Always respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  .animate-ticker { animation: none !important; }
}
```

---

## 10. Z-Index Scale

Never use arbitrary z-index values. Use the defined scale:
| Token | Value | Layer |
|:------|:------|:------|
| `--z-base` | 0 | Default flow |
| `--z-raised` | 10 | Floating elements |
| `--z-dropdown` | 100 | Dropdowns, tooltips |
| `--z-sticky` | 200 | Sticky navbar |
| `--z-overlay` | 300 | Backdrop overlays |
| `--z-modal` | 400 | Modals, drawers |
| `--z-toast` | 500 | Toast notifications |

---

## 11. Known Pitfalls (Read docs/problems-and-fixes/)

1. **Brown-950 looks black** — Never use for buttons. Use brown-900 instead.
2. **Opacity on dark colors looks "washed out"** — Use solid colors for disabled states.
3. **Eager validation shames users** — Always use blur-event + touched-state logic.
4. **Hardcoded hex breaks theme updates** — Always use Tailwind tokens or CSS vars.
5. **Content in JSX breaks maintainability** — Always put text/data in `/src/data/`.
6. **Phantom Captcha on Localhost** — Always check `hcaptchaSiteKey` before enforcing captcha required states.
7. **Clear-text Passwords in Emails** — NEVER include temporary passwords in any email template or queue payload. Use Magic Links.
8. **SaaS Design Drift** — Never use bubbly `rounded-2xl` or generic tailwind grey shadows. Enforce strict `rounded-md` and brown-tinted `--shadow-md` to maintain the authoritative 'Prestige Institutional' aesthetic.

---

## 14. Authentication & Induction (The Magic Link Flow)

### 14.1 New Student Induction
New students are bulk-imported or created without a password. 
- Generated: `magicToken` (48h expiry) stored in Prisma.
- Communicated: A secure, one-click Magic Link in the welcome email.
- Action: On click, they are verified, authenticated, and redirected to `/change-password`.

### 14.2 Admin Password Resets
Admins can trigger a password reset for any user.
- Action: Purges the old password, generates a `magicToken`.
- Link: Sent via email; one-time use ONLY (deleted on successful sign-in).

### 14.3 Self-Heal UX (Resend induction)
If an induction link is lost or expired, the Login page implements a **contextual** recovery flow.
- Triggers only when a login attempt fails for a user with `mustChangePassword = true`.
- Displays a specialized error with a "Resend Link" action.

---

## 15. Environment Variables

| Variable | Purpose |
|:---------|:--------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `DATABASE_URL` | Prisma database connection string |
| `JWT_SECRET` | Secret for native session signing |
| `EMAIL_USER` / `EMAIL_PASS` | SMTP credentials for notifications |

---

## 16. Serverless Optimization & Timeouts

The portal is designed for **Vercel / Next.js Serverless** infrastructure. This imposes a strict **10s–30s execution timeout** on all API routes. 

### 16.1 The Problem
Operations like bulk importing 2,000+ students, generating hundreds of Magic Links, or uploading large Excel files will **FAIL** if processed synchronously.

### 16.2 Optimization Patterns (REQUIRED)

| Pattern | Usage | Benefit |
|:--------|:------|:--------|
| **Client-Side Parsing** | `xlsx` in browser | Offloads CPU work to student/admin machine. Server receives clean JSON, not raw files. |
| **Async Workers (QStash)** | `Triggering Events` | Long tasks (Email blasts, Heavy CSVs) are pushed to QStash and processed in the background. |
| **Object Offloading (R2)** | `Cloudflare R2` | Large files are uploaded to R2 FIRST. The API only handles the file URL. |

### 16.3 When to use which?
- **Small (1-100 rows)**: Direct API call is acceptable.
- **Medium (100-500 rows)**: Use Client-side parsing + Direct API.
- **Large (500-5,000+ rows)**: Use R2 Upload + QStash Eventual Processing.

---

## 17. Reference Documents

For deeper technical specifications, consult:
- `docs/DESIGN_SYSTEM_v2.md` — **Master Reference** (Colors, Fonts, Spacing, Architecture)
- `docs/problems-and-fixes/` — Documented issues and their solutions
- `AI_CONTEXT.md` — This file (Rules and Conventions)
