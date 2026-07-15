---
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
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.1em
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
---

## Brand & Style
The design system is engineered to evoke a premium, high-octane digital environment inspired by the cutting edge of gaming culture and cyberpunk aesthetics. It prioritizes immersion, depth, and technical sophistication to appeal to enthusiasts who value a "pro-grade" interface.

The visual style merges **Glassmorphism** with **Neo-Futurism**. The interface relies on deep, layered blacks to provide a canvas for vibrant, high-energy neon light sources. Elements appear as though they are projected onto semi-transparent physical surfaces, utilizing back-glows and refractive properties to create a sense of three-dimensional space within a digital screen.

## Colors
This design system utilizes a "Void-and-Vapor" palette. The foundation is built on absolute blacks and deep navy to ensure infinite contrast and visual comfort during long sessions.

- **Primary (Cyan):** Used for critical actions, active states, and primary data highlights. It represents "Energy."
- **Secondary (Purple):** Reserved for premium features, leveling indicators, and rarity tiers. It represents "Power."
- **Tertiary (Neon Blue):** Used for supportive accents, progress bars, and hover transitions. It represents "Flow."
- **Functional Gradients:** Gradients should always move from Secondary to Primary to simulate a chromatic shift common in high-tech displays.

## Typography
The typographic hierarchy balances technical precision with high-impact readability. 

- **Headlines:** Use **Space Grotesk** for its geometric, futuristic qualities. High-level headers should be tight-tracked and occasionally uppercase to mimic a digital HUD.
- **Body:** **Inter** provides maximum legibility against dark backgrounds, ensuring that dense game stats or descriptions remain clear.
- **Data/Technical:** **Geist** is used for labels, monospaced data, and micro-copy, providing a developer-centric, technical feel.
- **Visual Treatment:** Headlines may occasionally use a very subtle "glitch" text-shadow (1px cyan/magenta offset) at higher hierarchy levels.

## Layout & Spacing
The design system employs a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

Layouts are structured with "Zone" density. Content-heavy areas (like libraries) use a tight 16px gutter to maximize information density, while immersive storytelling areas (landing pages) use wide 64px gaps to allow the background glass effects to breathe. Components should be aligned to an 8px baseline grid to maintain rigorous technical alignment.

## Elevation & Depth
Depth is not achieved through traditional shadows, but through **light emission and opacity**.

- **Level 0 (Base):** Deep Navy (#12121a).
- **Level 1 (Glass):** Semi-transparent (15% opacity) navy with a 20px backdrop-blur.
- **Level 2 (Active):** Same as Level 1 but with a 1px inner-border (stroke) using a linear gradient of the Primary and Secondary colors.
- **Glows:** Higher elevation elements emit a soft, 20% opacity outer glow matching their primary accent color, simulating light leaking from a screen.

## Shapes
The shape language is "Hard-Tech." While corners are softened slightly (4px - 12px) to feel modern, they avoid being overly rounded or organic. 

- **Standard Containers:** 4px radius (Soft).
- **Large Cards:** 8px radius.
- **Special Elements:** Occasional 45-degree chamfered (clipped) corners are used on buttons or decorative labels to reinforce the "cyber" industrial aesthetic.

## Components
- **Glass Cards:** Feature a `backdrop-filter: blur(20px)`, a `1px` subtle top-down gradient border, and a hover state that triggers a glowing cyan outer shadow.
- **Glow Buttons:** Primary buttons are solid cyan with black text. On hover, they emit a vibrant cyan bloom. Secondary buttons are "Ghost" style with a 1px purple border.
- **Animated Progress Bars:** These feature a dual-gradient fill (Cyan to Blue) with a scrolling "scan-line" texture overlay that moves from left to right.
- **Inputs:** Dark, recessed backgrounds with a bottom-only border that glows and expands when focused.
- **Status Chips:** Use a neon-dot indicator next to uppercase Geist typography. "Live" states should have a subtle pulsing animation.
- **HUD Sliders:** Use high-contrast tracks with a square "thumb" handle, mimicking specialized hardware controls.