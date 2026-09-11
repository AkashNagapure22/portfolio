# Features

## Complete Feature Catalog

### 1. Dynamic 3D Background
- **Technology**: Three.js r128
- **Description**: Full-screen particle field with a floating grid plane that
  responds to mouse movement with smooth spring-interpolated parallax.
- **Performance**: Automatically reduces particle count (4500→1500) and
  disables mouse parallax on mobile devices.
- **Optimisation**: Pauses rendering entirely when the tab is hidden
  (`document.visibilitychange` event). Debounced resize handling (150ms).

### 2. Animated Cursor Trail
- **Technology**: Canvas 2D API
- **Description**: A smooth trailing line composed of 20 spring-connected
  points that follows the cursor or touch position.
- **UX**: Cyan stroke (#38bdf8) with rounded caps and 0.25 dampening factor.

### 3. Typewriter Headline
- **Technology**: Vanilla JavaScript `setTimeout` loop
- **Description**: Rotating role titles displayed character-by-character in the
  hero section, with a blinking cursor animation.
- **Phrases**: "Microsoft Intune & VMware Architect",
  "Securing endpoints and scaling cloud virtualization",
  "Building automated, zero-trust enterprise workplaces."

### 4. Certification Badge Confetti
- **Technology**: canvas-confetti 1.9.x (lazy-loaded from CDN)
- **Description**: Clicking any certification badge triggers a multi-burst
  confetti celebration.
- **Fallback**: If confetti is unavailable, the badge pulses with a CSS
  animation. Lazy-loads the confetti library on first click if not preloaded.

### 5. Experience Timeline
- **Technology**: HTML + CSS (Tailwind)
- **Description**: Vertical timeline showing work history at Hexaware
  Technologies and Medline Industries, with detailed responsibility bullets
  and technology-specific icon carousels for each role.

### 6. Interactive Project Flip Cards
- **Technology**: CSS 3D transforms (`perspective`, `rotateY`)
- **Description**: Project cards that flip 180° on click to reveal technical
  details: execution timeline, key outcomes, and core technology stack.
- **UX**: Only one card can be flipped at a time; clicking elsewhere resets.

### 7. Terminal-Style Contact Form
- **Technology**: HTML form + `mailto:` API
- **Description**: A retro terminal-themed contact form styled with monospace
  fonts and green-on-black aesthetics.
- **Validation**: Real-time field validation enables/disables the submit button.
- **Submission**: Generates a pre-filled `mailto:` link with the user's input
  encoded as the email body and subject.

### 8. Blog Article Comments System
- **Technology**: Serverless API (`/api/comments`) + Neon PostgreSQL
- **Description**: Full comment system on all 24 blog articles with nested
  replies, like/dislike voting, and XSS-safe HTML escaping.
- **Features**:
  - Post top-level comments and nested replies
  - Like/dislike any comment (PATCH to API)
  - HTML-escape all user content to prevent XSS
  - LocalStorage-based vote deduplication

### 9. Article Helpfulness Voting
- **Technology**: Serverless API (`/api/votes`) + Neon PostgreSQL + localStorage
- **Description**: Readers can vote "helpful" or "not helpful" on each blog
  article, with counts displayed publicly and per-user vote state persisted
  in localStorage to prevent duplicate voting.

### 10. Article Search & Filter
- **Technology**: JavaScript `String.includes()` + `IntersectionObserver`
- **Description**: A search input that filters article content blocks in real
  time. A scroll-spy highlights the currently visible section in the
  navigation menu.

### 11. Subdomain-Based Routing
- **Technology**: Vercel Edge Middleware (`middleware.js`)
- **Description**: Ten sub-domains each map to a dedicated section page:
  `blogs.`, `reading.`, `coins.`, `homelab.`, `resume.`, `skills.`,
  `courses.`, `gaming.`, `food.`, `puzzle.`
- **Example**: Visiting `coins.akashnagapure.in` serves the Coins collection
    page from `/Sub_Pages/Coins.html`.

### 12. Chat Assistant Overlay
- **Technology**: Vanilla JavaScript (sequential typing animation)
- **Description**: An AI assistant chat bubble that cycles through five
  friendly message phrases, typing word-by-word and cycling every 5 seconds.

### 13. Back-to-Top Button
- **Technology**: JavaScript scroll listener + CSS transition
- **Description**: A circular button that fades in after scrolling 350px
  down the page and smoothly scrolls to the top when clicked.

### 14. Status Ticker
- **Technology**: CSS animation (`@keyframes` marquee)
- **Description**: A horizontal ticker at the top of the page showing
  "STATUS: 🚧 The website is still under construction..."
  that pauses on hover.

### 15. Dark Theme with Glassmorphism
- **Technology**: Tailwind CSS utility classes
- **Description**: A deep-night themed UI (background #020617) with
  translucent glass-panel cards, neon glow effects, and
  gradient text highlights.

### 16. Responsive Design
- **Technology**: Tailwind CSS responsive prefixes (sm:, md:, lg:)
- **Description**: Fully responsive layout that adapts from mobile
  (4-column grid) to desktop (12-column grid) with touch-friendly
  navigation and reduced visual effects on low-end devices.

### 17. Image Lazy Loading with Fallbacks
- **Technology**: Native `loading="lazy"` + `onerror` handler
- **Description**: All non-critical images use native lazy loading.
  If an image fails to load, a placeholder GIF is substituted automatically.

### 18. Vite Build Optimisation
- **Technology**: Vite 6 + esbuild
- **Description**: Production build minifies CSS/JS, code-splits assets,
  and generates a small 710-byte JS bundle for the root landing page.

## Feature-to-Requirement Mapping

| Feature | Requirement(s) |
|---|---|
| Dynamic 3D Background | FR-1.5 |
| Animated Cursor Trail | FR-1.6 |
| Typewriter Headline | FR-1.1 |
| Certification Confetti | FR-2.2 |
| Experience Timeline | FR-3 |
| Project Flip Cards | FR-5 |
| Terminal Contact Form | FR-7 |
| Blog Comments | FR-8.3–8.6 |
| Article Voting | FR-8.7–8.8, FR-10.6–10.7 |
| Article Search & Scroll Spy | FR-8.1–8.2 |
| Subdomain Routing | FR-11 |
| Chat Assistant | FR-1.7 |
| Back-to-Top Button | — |
| Status Ticker | FR-1.1 |
| Dark Theme | NFR-2, NFR-3 |
| Responsive Design | NFR-2 |
| Image Lazy Loading | NFR-1.3 |
| Vite Build | NFR-1.1–1.2 |

