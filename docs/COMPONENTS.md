# Components

## UI Components

### Header and Navigation
- Desktop nav: logo + role badge + nav links + Changelog link
- Mobile drawer: hamburger menu toggles overlay with same links
- Sticky behavior: hides on scroll down (transforms up by 100%)
- Status ticker: "under construction" animated banner
- Interaction: `smoothNav(event, id)` for anchor scrolling

### Hero Section
- Availability badge: pulsing emerald dot with "AVAILABLE FOR WORK"
- Name: large H1 with text-glow animation
- Typewriter: rotating role titles
- Profile card: circular video element (Avideo.mp4) with scale hover effect
- CTA buttons: Resume (external subdomain), Blogs (external subdomain)

### Certifications
- Grid layout: 2 cols mobile, 3 cols tablet, 5 cols desktop
- Each badge: AVIF icon image + name + date below
- Image fallback: `onerror` replaces with placeholder.gif
- Click interaction: `triggerBadgeConfetti()` — canvas-confetti burst
- Fallback: if confetti lib not loaded, lazy-loads it; if still fails, CSS pulse animation

### Experience Timeline
- Vertical timeline with dot nodes on the left
- Each entry: role title (left), date range (right)
- Bullet points with inline tech keyword highlights (colored spans)
- Skill icon carousel: horizontal auto-scrolling marquee with hover pause + scale

### Education and Core Values
- Cards with glass-morphism styling (backdrop-blur, border gradient)
- Education: degree, institution, year range
- Core Values: icon + title + description

### Projects (Flip Cards)
- 3D flip on click using CSS perspective and transform-style
- Front face: project image, Case ID badge, title, short description
- Back face: execution timeline, key outcome, core tech stack
- Only one card open at a time (others auto-reset)

### Hobbies
- Grid of hobby cards linking to subdomains
- Each card: image + label + external link

### Contact (Terminal Form)
- Styled as "MAILBOX_TERMINAL" with terminal icon
- Fields: name, email, subject, message (all required except subject)
- Real-time validation: `checkFormValidity()` toggles button disabled state
- Submission: `launchDirectMail()` opens mailto: with pre-filled body
- Success banner: green emerald panel with checkmark icon

### Footer
- Logo SVG + name + copyright
- Links: LinkedIn, Contact Mail, Changelog, Privacy Policy, Terms of Service

### Back-to-Top Button
- Fixed bottom-right, appears after 350px scroll
- Circular with sky-blue border and glow

## Interactive Components

### 3D Particle Background (Three.js)
- Canvas: `#three-bg-canvas` (aria-hidden)
- 4500 particles (desktop) / 1500 (mobile) with additive blending
- Cyan color (#38bdf8), size 1.1 (desktop) / 1.3 (mobile)
- GridHelper ground plane at y=-220
- Mouse parallax (desktop only) with spring interpolation (0.04)
- Visibility pause: stops rendering when tab is hidden
- Resize: debounced 150ms, updates camera aspect and renderer size

### Cursor Trail
- Canvas: `#cursor-trail-canvas` (aria-hidden)
- 20 connected points with spring physics (dampening 0.25, decay 0.5)
- Cyan stroke (#38bdf8, width 2.5, rounded caps)
- Mouse and touch support
- Continuous RAF animation loop

### Spline 3D Logo
- `<spline-viewer>` element embedded in hero
- Watermark and logo elements removed via JS every 500ms interval

### Chat Assistant
- `#chat-container` with 5 rotating message phrases
- Word-by-word typing animation (80ms per word)
- 5-second pause between message cycles
- Color-coded: sky-400 (first), indigo-200 (middle), emerald-400 (last)

## Blog Article Components

### Article Search
- Input field with oninput -> `filterArticleContent(query)`
- Targets `.searchable-block` elements, shows/hides on text match

### Scroll Spy
- `IntersectionObserver` watching `section.searchable-block[id]` and `#discussion`
- Root margin: -20% 0px -60% 0px (trigger zone)
- Adds `.active-link` class to matching nav link

### Comments System
- GET `/api/comments?article_id=X` — loads all comments + replies
- POST `/api/comments` — creates top-level comment or nested reply
- PATCH `/api/comments` — increments like/dislike on a comment
- `escapeHTML()` prevents XSS in user-submitted content
- localStorage `VOTE_MANAGER` prevents duplicate votes

### Article Vote Bar
- GET `/api/votes?article_id=X` — returns helpful and not_helpful counts
- POST `/api/votes` — increments counter based on vote (up/down)
- Display: "N people found this helpful" or "Be the first to rate"
- Post-vote: opacity 0.5 + pointer-events none on clicked button
