# GL BAJAJ INSTITUE OF TECHNOLOGY & MANAGEMENT
## Training & Placement + Career Development Centre Portal
### DESIGN SYSTEM MASTER REFERENCE — Version 2.0

> [!IMPORTANT]
> **Single Source of Truth**: This document supersedes all previous versions. It represents the production-ready specification for the GL Bajaj T&P Portal.

---

## 1. Brand Overview
The GL Bajaj T&P Portal is a high-authority, premium institutional interface serving four distinct user roles (Students, Admins, Trainers, and Recruiters). The design philosophy is: **Refined · Warm · Authoritative · Modern.**

### 1.1 Brand Identity
| Property | Value | Notes |
| :--- | :--- | :--- |
| **Primary Brand Color** | `#512912` (Dark Teak Brown) | Focus, Nav, Primary CTAs |
| **Accent Color** | `#E8A020` (Warm Amber Gold) | CTAs, Highlights, Active Icons, Stats |
| **Background** | `#FDF7EF` (Warm Cream) | Primary page background; avoids "stark white" sterile look |
| **Display Typeface** | **Fraunces** (Variable Serif) | Institutional authority; variable axis `opsz` 72 for sharp rendering |
| **Body Typeface** | **Inter** (Modern Sans-serif) | Global standard; features **tabular numerals** for data tables |
| **Mono Typeface** | **Fira Code** | Monospaced snippets for technical logs/code |

---

## 2. Color System
All colors are defined as RGB channel triplets in `globals.css`. Never use raw HEX values in components; use Tailwind tokens or CSS variables.

### 2.1 Primary — Brown Scale
| Token | Hex | Tailwind | Usage |
| :--- | :--- | :--- | :--- |
| **Brown-950** | `#0E0803` | `bg-brown-950` | Deep walnut backgrounds, darkest footer |
| **Brown-900** | `#3A1C0B` | `bg-brown-900` | Navbar bg, hero overlays, dark text |
| **Brown-800** ★ | `#512912` | `bg-brown-800` | **PORTAL PRIMARY** – Buttons, borders, headings |
| **Brown-100** | `#F2EAD8` | `bg-brown-100` | "Sand" – Neutral section bg, input containers |
| **Brown-50** | `#FDF7EF` | `bg-brown-50` | "Cream" – Page background, light surfaces |

### 2.2 Accent — Amber Gold
| Token | Hex | Tailwind | Usage |
| :--- | :--- | :--- | :--- |
| **Amber-900** | `#C07A10` | `text-amber-900` | Dark state links, hover accents |
| **Amber-500** ★ | `#E8A020` | `bg-amber-500` | **PORTAL ACCENT** – Primary CTAs, stat figures |

---

## 3. Typography System (v2.0)
The 2.0 system uses **Fraunces** for editorial confidence and **Inter** for information precision.

### 3.1 Fraunces — Variable Font Customization
Fraunces is tuned via `font-variation-settings`. Always match the `opsz` (optical size) to the `font-size` for maximum sharpness.

- **Hero Headings (h1)**: `opsz 72`, `wght 800`
- **Section Headers (h2)**: `opsz 48`, `wght 700`
- **Stat Numbers**: `opsz 52`, `wght 700`, `tabular-nums`

### 3.2 Inter — The Precision Engine
Inter is used for all UI labels, body text, and tables. 
- **Tabular Numerals**: Activated via `.tnum` or `font-variant-numeric: tabular-nums;` for all statistics and financial figures to ensure alignment in tables.

### 3.3 Applied Styles
| Element | Font | Size | Weight | Leading | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **h1** | Fraunces | 44px–76px | **800** | 1.04 | -0.03em |
| **h2** | Fraunces | 30px–54px | 700 | 1.06 | -0.025em |
| **h3** | Fraunces | 30px | 700 | 1.3 | -0.02em |
| **h4** | Inter | 20px | 700 | 1.3 | Normal |
| **p** | Inter | 16px | 400 | **1.75** | Normal |
| **Section Tag**| Inter | 14px | 700 | 1.3 | **0.15em UPPER** |

---

## 4. Spacing, Radius & Shadows
Used consistently across all 4 dashboards.

### 4.1 Spacing (9-Step Scale)
Reference Tailwind's standard `space-x / p-x / m-x` classes (multiples of 4px):
- **4px (space-1)**: Tight gaps, icon-to-text.
- **16px (space-4)**: Default component padding.
- **32px (space-8)**: **Standard Section Gap** (Login inputs, dashboard widgets).

### 4.2 Border Radius
- **6px (rounded-sm)**: Buttons, Input fields.
- **14px (rounded-md)**: Standard cards, panel overlays.
- **22px (rounded-lg)**: Large hero sections, CDC info components.

### 4.3 Shadow System
> [!TIP]
> **Brown-Tinted Shadows**: Our shadows are tinted with `#512912` at 8–15% opacity to keep them "Warm" rather than the "Grey/Muddy" shadows of generic apps.

---

## 5. Dashboard Architecture (User Roles)
| Role | Portal Access | Core Responsibility |
| :--- | :--- | :--- |
| **Student** | `/student/*` | Profile building, training tracking, drive applications. |
| **Admin** | `/admin/*` | Full system control, analytics, student verification. |
| **Trainer** | `/trainer/*` | Batch mgmt, attendance, performance assessment. |
| **Recruiter** | `/recruiter/*` | Posting drives, shortlisting students, screening profiles. |

---

## 6. Project File Structure
The project uses a standard Next.js 16 structure nested within a `portal/` directory to maintain separation from institutional documentation.

```
portal/
├── src/
│   ├── app/
│   │   ├── globals.css           ← ALL design tokens
│   │   ├── layout.tsx            ← Root layout & font loading
│   │   └── (routes)/             ← Student, Admin, Trainer, Recruiter
│   ├── components/
│   │   ├── ui/                   ← Brand-owned shadcn components
│   │   └── layout/               ← Shared UI (Navbar, Footer)
│   ├── data/                     ← ALL static content (Rule 2)
│   ├── lib/                      ← API client, validators, utils
│   └── types/                    ← Global TS definitions
```

---

## 7. Project Foundation: The 3 Golden Rules

### 🟡 Rule 1: Never Hardcode Colors
Never write `#512912` or `rgb(81, 41, 18)` directly in JSX. 
- **Correct**: `className="bg-brown-800 text-brown-50"`
- **Why**: Allows instant project-wide brand updates via `globals.css`.

### 🟡 Rule 2: Separation of Content (Data Layer)
All text that isn't UI-driven (Testimonials, Stats, Recruiter Lists, FAQs) lives in `/src/data/`.
- **Correct**: `import { stats } from "@/data/stats"`
- **Why**: Allows non-developers to update site copy without touching layout code.

### 🟡 Rule 3: Owned Components
All `shadcn/ui` components are copied into `src/components/ui`. 
- **Guideline**: Do not treat them as locked libraries. Modify their HTML/CSS freely to match the GL Bajaj premium aesthetic.

---

## 8. Anti-Patterns: SaaS Design Drift

A recurring issue in development is the instinctive application of generic "SaaS Industry" templates. Our aesthetic is **Prestige Institutional**, which means we must actively reject certain modern tropes:

### 8.1 Reject Bubbly UI (Radius Discipline)
Modern tech apps use `rounded-2xl` or `rounded-full` everywhere. We do not.
- **Rule**: Max radius for components is `rounded-md` (14px). Inner widgets and icon boxes must be `rounded-sm` (6px). Only massive panels earn `rounded-lg` (22px).

### 8.2 Reject Generic Depth (Shadow Discipline)
Standard Tailwind shadows (`shadow-md`) are neutral black/grey, which makes the warm brown portal look "muddy" or dirty.
- **Rule**: All shadows must map to the custom variables in `globals.css` (e.g., `--shadow-md`) which are tinted with `#512912` at 10-15% opacity to retain warmth. 

### 8.3 Reject Loose Pacing
Do not use arbitrary gaps like `space-y-10` (40px) just because it "looks okay". 
- **Rule**: Strictly adhere to the 9-step baseline grid. The standard section divider is **always** `gap-8` (32px).

### 8.4 Reject Desktop-First Styling
The portal is built strictly on a **Mobile-First** responsive pattern.
- **Rule**: Never use `max-sm:` or `max-md:` properties to shrink standard desktop layouts. Always design the base CSS structure for a single vertical mobile column, then add `sm:`, `md:`, `lg:` utilities to expand the layout for larger screens (e.g., `flex-col md:flex-row`).

---

## 9. The 5 Industry-Standard Mobile Patterns
To prevent mobile pages from becoming excessively tall (the "scroll debt" problem), strictly follow these 5 structural patterns on mobile screens:

### 1. 2-Col Compact Grid
- **Use for**: Feature grids (Process, Guidance, CDC Skills).
- **Rule**: Never stack 6 full cards in 1 column. Use `grid-cols-2`. Show only the icon and title. Hide the body text (`hidden md:block`) and implement an expand/collapse toggle via React state to view the text on mobile.

### 2. 2×2 Stat Grid
- **Use for**: Key numbers and placement statistics.
- **Rule**: Stat blocks must *never* be 1-column on mobile. Always start with `grid-cols-2` at the base size.

### 3. Horizontal Scroll Strip
- **Use for**: Categories, filters, equal-priority strips.
- **Rule**: Use `flex w-full overflow-x-auto`. Always implement a right-fade mask overlay to provide a visual cue that the container is scrollable.

### 4. Progressive Disclosure (Accordion)
- **Use for**: Text-heavy policy lists, terms, or FAQs.
- **Rule**: Show only the section heading. Hide the heavy text inside a collapsible container that opens on tap. Do not force users to scroll past entire policy blocks.

### 5. 3-Col Logo Grid
- **Use for**: Recruiter grids and small square icons.
- **Rule**: Logo squares are compact. A 1-col or 2-col stack on mobile wastes horizontal space. Use `grid-cols-3` minimum for standard mobile screens.

---
**Document Status**: PRODUCTION READY (v2.1)
**Last Update**: 2026-03-31
