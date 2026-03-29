# Problem 001: Button Looked "Flat Black"

**Date**: March 2026  
**Severity**: Visual / Brand  
**Affected Files**: All auth page buttons (`login`, `forgot-password`, `change-password`, `student/change-password`)

## Problem
The primary "Enter Portal Securely" button used `bg-brown-950` (`#0E0803`) as its active background color. While technically a "brown," this color has an RGB value of `(14, 8, 3)` — so close to pure black `(0, 0, 0)` that on 90% of consumer displays (non-calibrated monitors, laptop screens, phone displays), it rendered as indistinguishable from flat black.

This defeated the purpose of the GL Bajaj "Heritage Brown" branding. A student landing on the login page would perceive a generic black button instead of the warm, institutional teak/walnut identity.

## Root Cause
The design system's `Brown-950` token was originally calibrated for **extreme depth use cases** (like deep footers or shadow tints), not for **interactive foreground elements** like buttons. Applying it to a button was technically "on-brand" but visually incorrect because screens cannot differentiate `(14, 8, 3)` from `(0, 0, 0)`.

## Fix Applied

### Step 1: Warmed the Dark Tokens (globals.css)
```diff
- --color-primary-950: 14 8 3;   /* #0E0803 — too cold, indistinguishable from black */
- --color-primary-900: 58 28 11;  /* #3A1C0B */
+ --color-primary-950: 18 10 5;   /* #120A05 — warm deep cocoa */
+ --color-primary-900: 55 25 8;   /* #371908 — warm walnut */
```
Added subtle red/yellow saturation so that even the darkest tokens carry a "chocolate/teak" undertone.

### Step 2: Shifted Button Scale (All Auth Pages)
```diff
- bg-brown-950 text-brown-50 hover:bg-brown-900 shadow-amber-900/10
+ bg-brown-900 text-brown-50 hover:bg-brown-800 shadow-amber-900/15
```
- **Base**: Moved from `950` → `900`. Now renders as "Deep Coffee/Walnut" — clearly brown.
- **Hover**: Moved from `900` → `800` (the **Main Brand Color**). Feels like the button "lights up" to the institutional core.
- **Shadow**: Increased amber intensity from `/10` → `/15` for a stronger "Golden Glow."

## Result
The button now reads as unmistakably **brown** on all screens while maintaining high contrast against the cream background. The hover transition from deep walnut to brand teak creates a premium "awakening" effect.

## Prevention
`Brown-950` is now reserved for:
- Shadow depth tinting
- Extreme contrast small text (fine print)
- Deep footer backgrounds

It should **never** be used as a primary background for interactive elements.
