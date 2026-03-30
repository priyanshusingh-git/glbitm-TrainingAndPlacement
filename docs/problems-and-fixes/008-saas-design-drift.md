# Problem: SaaS Design Drift (Lost Institutional Authority)

## Description
Over time, the dashboards (Admin and Student) suffered from "SaaS Design Drift." Developers instinctively applied generic, modern web application styling patterns such as:
- **Bubbly Geometry**: Heavy use of `rounded-2xl` and `rounded-xl`, making elements look like consumer mobile apps rather than an authoritative portal.
- **Rhythmic Degradation**: Using arbitrary large spacings (e.g., `space-y-10` / 40px) instead of the strict 9-step baseline grid (`gap-8` / 32px), making layouts feel disjointed.
- **Generic Depth**: Relying on Tailwind's default `$shadow-` utilities, which render cold, neutral grey dropshadows.
- **Rogue Typography**: Hardcoding uppercase tracking values (`tracking-[0.2em]`) instead of utilizing the defined global classes.

This eroded the "Refined · Warm · Authoritative" core brand identity of the GL Bajaj portal, making it look like a generic tech startup tool rather than a premium academic institution platform.

## Solution

To restore the **"Prestige Institutional"** design paradigm, a strict visual hierarchy refactor was enforced globally:

### 1. Enforced Authoritative Geometry
All excessive border radiuses were stripped back to a rigid 3-tier system:
- **`rounded-sm` (6px)**: For internal icon boxes, interactive inputs, and buttons.
- **`rounded-md` (14px)**: The maximum allowed for standard surface cards and Bento Grids.
- **`rounded-lg` (22px)**: Reserved strictly for massive Hero panels.

### 2. Standardized Spacing Rhythm
Replaced rogue vertical mappings (`space-y-10`) with the strict standard 32px section gap (`gap-8`), ensuring the Admin dashboard flows identically to the Student interface.

### 3. Enforced Warm Depth
Removed generic shadows in favor of brand-tinted variables (e.g., `--shadow-md: rgba(81, 41, 18, 0.12)`) so the portal feels "warm" and grounded instead of "muddy."

### 4. Normalized Editorial Typography
Banned manual utility injection for section markers. All eyebrows and tags must now use the global `<span className="section-tag">` to perfectly track the `Inter` font according to the institutional styling guide.
