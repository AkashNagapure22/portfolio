# Design System

> The complete visual design specification lives in [`pages/DESIGN.md`](../pages/DESIGN.md)
> (a Material Design 3 / Material You "Cyber-Nexus" theme token file).
> This document describes how that design system is **applied** in the live portfolio.

## Color Palette (Applied)

| Role | Token | Hex | Usage |
|---|---|---|---|
| Background | `--background` | `#020617` | Page background (`<html>` + `<body>`) |
| Surface | `--surface` | `#131315` | Glass panels, cards |
| Primary (Cyan) | `--primary` | `#06b6d4` (Tailwind `sky-400`) | Primary actions, active links |
| Secondary (Purple) | `--secondary` | `#a855f7` (Tailwind `purple-400`) | Premium highlights, tech badges |
| Tertiary (Blue) | `--tertiary` | `#38bdf8` (Tailwind `sky-400`) | Progress bars, glows |
| On-surface | `--on-surface` | `#e5e1e4` | Primary text |
| Outline | `--outline` | `#94a3a8` (Tailwind `slate-400`) | Borders, secondary text |

**Note:** The `pages/DESIGN.md` tokens are defined but the actual HTML uses
Tailwind CSS utility classes (e.g., `bg-slate-900`, `text-sky-400`). The design
tokens serve as the conceptual reference; Tailwind classes are the implementation.

## Typography (Applied)

| Element | Font | Tailwind Class | Size | Weight |
|---|---|---|---|---|
| Logo / Name | Space Grotesk | `font-sans` | 6xl (72px) | `font-extrabold` |
| Role title | Inter | `font-mono` | `text-sm` | `font-bold` |
| Section headings | Space Grotesk | `font-sans` | 3xl–5xl | `font-extrabold` |
| Body text | Inter | `font-sans` | base–lg | `font-light` |
| Labels / data | JetBrains Mono | `font-mono` | xs–sm | `font-bold` |

**Note:** The `data` spec file references HelveticaNow Display, but the live site
uses Google Fonts: **Plus Jakarta Sans** and **JetBrains Mono** loaded via
`<link>` in `index.html`. Tailwind's default `font-sans` and `font-mono` map
to these.

## Visual Style: Glassmorphism + Neo-Futurism

The design merges **glassmorphism** (translucent surfaces with backdrop blur)
with **neo-futurism** (neon glows, geometric shapes). Deep blacks (#020617)
provide the canvas; vibrant cyan and purple accents provide energy.

Key applied techniques:
- `backdrop-blur` + `bg-opacity-75` or `rgba()` for glass panels
- `drop-shadow` filters for icons and cards
- Gradient text via `bg-clip-text text-transparent`
- `glow` effects via `shadow-[0_0_XXpx_rgba(...)]`
- `animate-pulse`, `animate-ping` for "live" indicators

## Layout & Spacing

- **Container**: `max-w-7xl mx-auto` (1280px max width)
- **Gutter**: `px-4 sm:px-8 lg:px-12`
- **Section gap**: `py-16 sm:py-24` (vertical rhythm)
- **Baseline grid**: 8px increments (Tailwind's default spacing scale)

## Component Inventory

| Component | Implementation |
|---|---|
| Glass card | `bg-slate-900/45 border border-slate-700/30 backdrop-blur` |
| Neon button | `bg-gradient-to-r from-sky-400 to-purple-500 hover:opacity-90` |
| Skill icon | `<img>` with `onerror` fallback + hover scale + tooltip span |
| Timeline node | `<div class="absolute w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_12px...]">` |
| Flip card | CSS `perspective` + `rotateY(180deg)` with `backface-visibility` |
| Status chip | `bg-emerald-950/40 border border-emerald-500/30` |
| Tech input | `bg-black/25 border-b-1 border-white/30 focus:border-cyan-400` |

## Animation Catalog

| Animation | Trigger | Duration | Ease |
|---|---|---|---|
| Name glow | Continuous | 4s | `ease-in-out infinite` |
| Ticker scroll | Continuous | 30s | `linear infinite` |
| Skills marquee | Hover pause | 16s | `ease-in-out infinite` |
| Orbit rotation | Continuous + hover pause | 40s | `linear infinite` |
| Flip card | Click toggle | 0.6s | `cubic-bezier(0.16,1,0.3,1)` |
| Badge confetti | Click | Burst | N/A |
| Cursor trail | Mouse move | Continuous | 0.25 dampening |
| Typewriter | Page load | 60ms/char | `step-end` cursor blink |
| Particle field | Continuous | N/A | 0.04 interpolation |

## 3D & Canvas Elements

| Canvas | ID | Purpose |
|---|---|---|
| Three.js | `three-bg-canvas` | Particle field + grid (z-index: 0) |
| Cursor trail | `cursor-trail-canvas` | Animated trailing line |
| Spline viewer | `<spline-viewer>` | 3D logo (watermark removed via JS) |

## Mobile Adaptations

- Particle count reduced from 4500 → 1500
- Grid segments reduced from 100 → 50
- Mouse-trail disabled on mobile (touch only)
- `backdrop-blur` reduced or removed on low-end devices
- Mobile drawer replaces desktop nav
