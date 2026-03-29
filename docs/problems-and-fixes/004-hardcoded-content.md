# Problem 004: Hardcoded Content in JSX Components

**Date**: March 2026  
**Severity**: Architectural / Rule 2 Violation  
**Affected Files**: `login/page.tsx`, `forgot-password/page.tsx`, `change-password/page.tsx`, `placement-analytics.tsx`

## Problem
The Design System's **Rule 2** states: *"All content lives in `/data/`. Recruiter names, placement statistics, testimonial quotes — none of these are hardcoded inside JSX."*

Multiple files contained static data embedded directly in the React component logic:

### Authentication Pages
The `<AuthBrandPanel>` component received hardcoded strings for:
- `eyebrow` ("Placement Season 2024–25")
- `title` (JSX with brand styling)
- `description` (paragraph text)
- `bottom` (statistics array or info cards)

```tsx
// ❌ VIOLATION: Content trapped inside the component file
<AuthBrandPanel
  eyebrow="Placement Season 2024–25"
  title={<>Your Career Journey Starts <span>Right Here.</span></>}
  description="Access the GL Bajaj CDC portal..."
/>
```

### Analytics Dashboard
Placement trend data and department distribution arrays were hardcoded:
```tsx
// ❌ VIOLATION: Data trapped inside component
const placementData = [
  { month: "Aug", placed: 12, offers: 18 },
  // ...
]
```

## Why This Matters
When the T&P office needs to update statistics for next semester (new placement rate, new CTC figures), they would need to open React component files and edit JSX — a risky operation that could break the rendering logic.

## Fix Applied

### Created `src/data/auth.tsx`
Exported centralized objects for all authentication branding:
- `authBrandContent` — Login page panel content
- `authBrandStats` — The statistics array (92% Placed, 600+ Companies, ₹58L CTC)
- `forgotPasswordBrandContent` — Forgot password panel content
- `changePasswordBrandContent` — Change password panel content

### Created `src/data/stats.ts`
Exported analytics data:
- `placementData` — Monthly hiring velocity
- `departmentData` — Branch-wise distribution

### Updated Components
```tsx
// ✅ COMPLIANT: Content imported from /data/
import { authBrandContent, authBrandStats } from "@/data/auth"

<AuthBrandPanel {...authBrandContent} />
```

## Result
To update placement stats for a new academic year, the T&P office edits **two data files** (`auth.tsx` and `stats.ts`) without touching any rendering components.
