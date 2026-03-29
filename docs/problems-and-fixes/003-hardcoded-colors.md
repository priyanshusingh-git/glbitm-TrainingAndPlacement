# Problem 003: Hardcoded Hex Colors in Components

**Date**: March 2026  
**Severity**: Architectural / Rule 1 Violation  
**Affected Files**: `src/app/page.tsx`, `src/modules/analytics/components/placement-analytics.tsx`

## Problem
The Design System's **Rule 1** states: *"Never write #512912, #E8A020, or any hex value directly in a component."*

Two files were found to contain hardcoded hex color values:

### Landing Page (`page.tsx`)
```tsx
// ❌ VIOLATION: Hardcoded hex values in gradient
bg-[linear-gradient(155deg,#3A1C0B_0%,#512912_52%,#6B3A1F_100%)]
```

### Analytics Charts (`placement-analytics.tsx`)
```tsx
// ❌ VIOLATION: Hardcoded hex for chart lines
stroke="#93c5fd"  // Not even a brand color!
fill="#cbd5e1"    // Generic slate gray
```

## Why This Matters
If the T&P office ever decides to update the brand color (e.g., a new Vice Chancellor prefers a slightly different shade), developers would need to hunt through every component file to find and replace hex values. With tokens, they change **one line** in `globals.css`.

The analytics charts were using completely off-brand colors (`#93c5fd` is a light blue, `#cbd5e1` is slate gray) that didn't belong in the warm brown/amber palette at all.

## Fix Applied

### Landing Page
```diff
- bg-[linear-gradient(155deg,#3A1C0B_0%,#512912_52%,#6B3A1F_100%)]
+ bg-[linear-gradient(155deg,rgb(var(--color-primary-900))_0%,rgb(var(--color-primary-800))_52%,rgb(var(--color-primary-700))_100%)]
```

### Analytics Charts
```diff
// Chart config
- color: "#93c5fd"     →  color: "var(--accent)"
- color: "#cbd5e1"     →  color: "var(--muted)"

// Inline styles
- stroke="#93c5fd"     →  stroke="var(--accent)"
- fill="#cbd5e1"       →  fill="var(--muted)"
```

## Result
The entire codebase now references colors exclusively through CSS variables and Tailwind tokens. A single edit in `globals.css` will cascade throughout the entire portal.
