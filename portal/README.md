# GL Bajaj Training & Placement Portal

The official Training & Placement (T&P) Portal for **G.L. Bajaj Institute of Technology & Management**.

---

## 🏛️ System Overview

The portal supports four specialized user roles with tailored workflows:
- **Students (`/student/*`)**: Training schedule, bootcamps, test assessments, recruitment drives, portfolio showcases (Projects, Certifications, Coding Profiles, Hackathons).
- **Administrators (`/admin/*`)**: Complete institutional control, analytics & reports, batch management, student/trainer directories, session scheduling, recruiter management, audit activity logs.
- **Trainers (`/trainer/*`)**: Assigned batch cohorts, daily schedule calendar, live attendance marking sheets.
- **Recruiters (`/recruiter/*`)**: Active recruitment drives, applicant shortlisting, interview coordination.

---

## ⚡ Navigation Architecture & 0ms Loading Mechanism

### Instant Tab Switching
The portal features an optimistic layout coordination engine between `SidebarContext`, `dashboard-layout.tsx`, and `loading-states.tsx`:
1. **Frame 0 Link Click**: The sidebar immediately sets `navigatingPath` in `SidebarContext`. The active highlight pill shifts instantly without waiting for network or component compilation.
2. **Instant View Swapping**: `DashboardLayout` unmounts the old page and renders the destination tab's exact `PageHeader` (title & subtitle) and layout-matched skeleton component.
3. **Seamless Mount**: When Next.js finishes loading the route, `navigatingPath` clears, transitioning into the interactive page with zero layout shift (CLS).

### Design-System Skeleton Registry (`@/components/ui/loading-states`)
- **`<HeroBannerSkeleton />`**: Deep espresso brown Good Morning banner with gold stat bubble placeholders.
- **`<AnalyticsSkeleton />`**: 4 top stat cards + 2 chart containers.
- **`<LoadingTable />`**: Table row placeholders with avatar circles and badge pills.
- **`<LoadingProfile />`**: Profile cover banner, avatar, credential tags, and tabs grid.
- **`<LoadingGrid />`**: Multi-column responsive card grid.
- **`<TestTakerSkeleton />`**: Assessment timer, question header, and option choices.
- **`<DetailHeaderSkeleton />`**: Breadcrumbs, action header, and sub-tabs.
- **`<GLBajajReloadLoader />`**: Initial session verification splash screen.
- **`<SignOutAnimationOverlay />`**: Frosted glass logout animation.

---

## 🎨 Design System Master Reference

All UI tokens and components adhere to **Version 2.3** of the Design System:
- **Primary Brand Color**: `#512912` (`bg-brown-800`, `text-brown-800`)
- **Accent Gold**: `#E8A020` (`bg-amber-500`, `text-amber-500`)
- **Cream Background**: `#FDF7EF` (`bg-brown-50`)
- **Typography**: `Fraunces` for display headings, `Inter` with tabular numbers (`.tnum`) for data grids, and `Fira Code` for code blocks.
- **Border Radius Discipline**: `rounded-sm` (6px) for inputs/buttons, `rounded-md` (14px) for cards, `rounded-lg` (22px) for hero panels.

---

## 🛠️ Development & Production

```bash
# Install dependencies
npm install

# Run local development server (with on-demand compilation)
npm run dev

# Run TypeScript validation across all routes
npx tsc --noEmit

# Build and start in Production Mode (instant 0ms transitions)
npm run build
npm run start
```
