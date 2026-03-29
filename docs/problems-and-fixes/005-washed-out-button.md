# Problem 005: Button Color Too Light / "Washed Out"

**Date**: March 2026  
**Severity**: Visual / UX  
**Affected Files**: All auth page buttons

## Problem
Before the "Institutional Polish" overhaul, the login button used an **opacity-based** disabled state:

```tsx
// ❌ OLD: Opacity-based state
"bg-brown-950/15 text-brown-400"
```

At 15% opacity, `Brown-950` over a cream background produced a **pale, grayish-beige** color that looked "washed out" and broken — as if the CSS had failed to load. It did not look like an intentional design choice.

## Root Cause
Using Tailwind's opacity modifier (`/15`) on a very dark color over a light background creates an unpredictable visual result. The resulting color is neither the brand brown nor a recognizable "disabled" state. It falls into a "no-man's land" that confuses users.

## Fix Applied: "Solid-State" Design
Replaced the opacity-based approach with explicit, solid colors for each state:

```diff
// Inactive state
- "bg-brown-950/15 text-brown-400"
+ "bg-brown-100/50 text-brown-400 border border-brown-200/60"
```

### Design Rationale
- **`bg-brown-100/50`** (Light Sand): A physical, visible, warm-toned background that clearly says "this is a button, but it's not active yet."
- **`border-brown-200/60`**: A subtle border gives the button visible edges, confirming it's a real UI element.
- **No opacity tricks**: The entire button uses solid, predictable colors that render identically on every screen.

## Result
The inactive button now looks "built but unpowered" — like a physical switch that hasn't been flipped yet — instead of "broken" or "missing CSS." This matches the 2025 industry trend of "High-Definition Solid States" where every UI component has a clear, intentional visual identity regardless of its state.
