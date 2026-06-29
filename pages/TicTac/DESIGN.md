---
name: Lumina Nexus
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#ffb0cd'
  on-secondary: '#640039'
  secondary-container: '#aa0266'
  on-secondary-container: '#ffbad3'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00a572'
  on-tertiary-container: '#00311f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#ffd9e4'
  secondary-fixed-dim: '#ffb0cd'
  on-secondary-fixed: '#3e0022'
  on-secondary-fixed-variant: '#8c0053'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-game:
    fontFamily: Inter
    fontSize: 84px
    fontWeight: '800'
    lineHeight: 100px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 0.5rem
  sm: 1rem
  md: 1.5rem
  lg: 2.5rem
  xl: 4rem
  container-max: 1200px
  game-board-gap: 12px
---

## Brand & Style
The design system is built on a **Glassmorphic** aesthetic, blending the depth of space with the precision of digital neon. It targets a modern gaming audience that values immersion, speed, and high-fidelity visuals. The interface should feel like a holographic projection floating over a vast, dark expanse.

The visual narrative is defined by:
- **Translucency:** Layered frosted surfaces that maintain context while providing focus.
- **Vibrancy:** Neon accents that pulse with energy against a dark, low-energy background.
- **Precision:** Clean lines and high-contrast typography that ensure the competitive aspect of the game remains sharp and legible.

## Colors
The palette is centered on a "Deep Midnight" (#0f172a) foundation. This dark canvas allows the vibrant game elements to pop with maximum luminosity.

- **Primary (Electric Blue):** Used for "X" game pieces, primary actions, and active states.
- **Secondary (Neon Pink):** Used for "O" game pieces and critical notifications.
- **Surface Layers:** Surfaces are not solid. They use a semi-transparent white (8-12% opacity) combined with a heavy backdrop blur (20px+) to create the frosted glass effect.
- **Accents:** Neon colors should utilize a subtle outer glow (drop-shadow) to simulate light emission.

## Typography
The typography uses **Inter** for its systematic clarity and high legibility in low-light environments. **Geist** is introduced for labels and technical data to reinforce the "developer-tool" precision of the gaming interface.

Game pieces (X and O) utilize the `display-game` style, emphasizing weight and impact. All headlines should favor tighter letter spacing to maintain a modern, "locked-in" feel. Text on glass surfaces should always be white (#FFFFFF) or high-contrast grey (#94a3b8) to ensure WCAG compliance against blurred backgrounds.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for the central game board to ensure mechanical consistency, while the surrounding UI remains fluid.

- **Centering:** The primary game board is always vertically and horizontally centered in the viewport.
- **Rhythm:** A strict 8px linear scale governs all padding and margins.
- **Desktop:** A 12-column grid with 24px gutters. The game board typically occupies the central 6 columns.
- **Mobile:** Transition to a single-column layout with 16px side margins. The game board scales proportionally to fit the width of the screen.

## Elevation & Depth
Depth is achieved through **Glassmorphism** rather than traditional shadows.

1.  **Backdrop Blur:** Every "raised" surface must apply a `backdrop-filter: blur(24px)`.
2.  **Inner Glow:** Surfaces feature a 1px solid white stroke at 12% opacity to define the edges, mimicking the way light catches the rim of glass.
3.  **Z-Axis Stacking:** 
    - *Level 0 (Background):* Deep midnight gradient.
    - *Level 1 (Panels):* 8% opacity glass.
    - *Level 2 (Modals/Popovers):* 16% opacity glass with a subtle outer glow in the primary color.

## Shapes
This design system uses a **Rounded** (0.5rem) language to balance the "tech" feel with approachable gameplay. 

- **Standard Elements:** Buttons and input fields use a 0.5rem (8px) radius.
- **Game Grid:** The individual cells of the game board use 1rem (16px) radius to create distinct "pockets" for the game pieces.
- **Pill Elements:** Toggle switches and status badges use fully rounded (pill) shapes to differentiate from structural components.

## Components

### Game Board
The grid should consist of 9 glass cells. Each cell has a subtle hover state where the background opacity increases to 15%. When a piece (X or O) is placed, it should appear with a "bloom" effect (a soft glow using the piece's signature color).

### Buttons
- **Primary:** Solid Electric Blue with white text. Apply a subtle outer glow of the same color.
- **Secondary (Glass):** Frosted glass background with a white 1px border. 
- **Icon Buttons:** Circular glass surfaces with centered SVG icons.

### Inputs & Toggles
- **Input Fields:** Semi-transparent dark background with a 1px border that illuminates in Electric Blue upon focus.
- **Toggle Switch:** Pill-shaped track. The "thumb" should be a solid white circle that glows when toggled to the "on" position.

### Cards
Cards are the primary container. They must have a `backdrop-filter: blur(20px)` and a thin, translucent border. Content within cards should have generous padding (`lg` spacing) to maintain the airy, minimalist feel.