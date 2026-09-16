# Design System

The design system has two layers:

1. **Token reference — "Cyber-Nexus"** (Material You / Material Design 3 semantics):
   the palette, type scale, shape and elevation tokens that were specified for the
   project. They live in this file — the former duplicate copies in `pages/` and
   `images/` were removed.
2. **Application** — how those tokens are realised in the live portfolio. The site
   is built with Tailwind utility classes, so the tokens act as the conceptual
   reference and Tailwind classes are the implementation.

---

## Token Reference — Cyber-Nexus

```yaml
name: Cyber-Nexus
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f21'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#849495'
  outline-variant: '#3a494b'
  surface-tint: '#00dbe7'
  primary: '#e1fdff'
  on-primary: '#00363a'
  primary-container: '#00f2ff'
  on-primary-container: '#006a71'
  inverse-primary: '#00696f'
  secondary: '#ebb2ff'
  on-secondary: '#520072'
  secondary-container: '#b600f8'
  on-secondary-container: '#fff6fc'
  tertiary: '#f9f5ff'
  on-tertiary: '#1100a9'
  tertiary-container: '#d8d7ff'
  on-tertiary-container: '#4241f5'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#74f5ff'
  primary-fixed-dim: '#00dbe7'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#f8d8ff'
  secondary-fixed-dim: '#ebb2ff'
  on-secondary-fixed: '#320047'
  on-secondary-fixed-variant: '#74009f'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2316de'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-margin: 24px
  gutter: 16px
  section-gap: 64px
```

### Type scale (spec)

| Token | Family | Size | Weight | Line height | Tracking |
|---|---|---|---|---|---|
| `display-lg` | Space Grotesk | 48px | 700 | 1.1 | -0.02em |
| `display-lg-mobile` | Space Grotesk | 32px | 700 | 1.2 | — |
| `headline-md` | Space Grotesk | 24px | 600 | 1.3 | — |
| `body-lg` | Inter | 18px | 400 | 1.6 | — |
| `body-md` | Inter | 16px | 400 | 1.5 | — |
| `label-sm` | Geist | 12px | 500 | 1 | 0.1em |

### Brand & Style

The system evokes a premium, high-octane digital environment inspired by gaming
culture and cyberpunk aesthetics. It prioritises immersion, depth and technical
sophistication to appeal to enthusiasts who value a "pro-grade" interface.

The visual style merges **Glassmorphism** with **Neo-Futurism**. The interface
relies on deep, layered blacks to provide a canvas for vibrant, high-energy neon
light sources. Elements appear as though they are projected onto semi-transparent
physical surfaces, using back-glows and refractive properties to create a sense of
three-dimensional space inside a digital screen.

### Colors

A "Void-and-Vapor" palette: absolute blacks and deep navy ensure infinite contrast
and visual comfort during long sessions.

- **Primary (Cyan):** critical actions, active states, primary data highlights — "Energy".
- **Secondary (Purple):** premium features, levelling indicators, rarity tiers — "Power".
- **Tertiary (Neon Blue):** supportive accents, progress bars, hover transitions — "Flow".
- **Functional gradients:** always move Secondary → Primary to simulate the
  chromatic shift of high-tech displays.

### Typography

- **Headlines:** **Space Grotesk** — geometric and futuristic; tight-tracked and
  occasionally uppercase to mimic a digital HUD.
- **Body:** **Inter** — maximum legibility against dark backgrounds.
- **Data/technical:** **Geist** — labels, monospaced data and micro-copy.
- **Visual treatment:** headlines may use a very subtle "glitch" text-shadow
  (1px cyan/magenta offset) at higher hierarchy levels.

### Layout & Spacing (spec)

A **12-column fluid grid** on desktop and a **4-column grid** on mobile, with "zone"
density: content-heavy areas (libraries) use a tight 16px gutter, while immersive
storytelling areas use wide 64px gaps. Components align to an 8px baseline grid.

### Elevation & Depth

Depth comes from **light emission and opacity**, not traditional shadows.

- **Level 0 (Base):** deep navy (#12121a).
- **Level 1 (Glass):** semi-transparent (15%) navy with 20px backdrop-blur.
- **Level 2 (Active):** as Level 1 plus a 1px inner stroke using a Primary →
  Secondary gradient.
- **Glows:** higher elevation elements emit a soft 20%-opacity outer glow in their
  accent colour, simulating light leaking from a screen.

### Shapes

"Hard-Tech" shape language: corners are softened slightly (4–12px) but never fully
rounded or organic. Standard containers use a 4px radius, large cards 8px.
Occasional 45° chamfered corners on buttons or decorative labels reinforce the
industrial aesthetic.

### Components (spec)

- **Glass cards:** `backdrop-filter: blur(20px)`, 1px top-down gradient border,
  hover state that triggers a glowing cyan outer shadow.
- **Glow buttons:** solid cyan with black text; on hover a vibrant cyan bloom.
  Secondary buttons are "ghost" style with a 1px purple border.
- **Animated progress bars:** dual-gradient fill (cyan → blue) with a scrolling
  scan-line texture.
- **Inputs:** dark, recessed backgrounds with a bottom-only border that glows and
  expands on focus.
- **Status chips:** neon-dot indicator beside uppercase Geist type; "live" states
  pulse subtly.
- **HUD sliders:** high-contrast tracks with a square thumb.