# Requirements

## Functional Requirements

### FR-1: Portfolio Landing Page
- **FR-1.1** Display a hero section with name, title, and typewriter animation
- **FR-1.2** Show a "AVAILABLE FOR WORK" status indicator
- **FR-1.3** Provide navigation to all sections (desktop + mobile drawer)
- **FR-1.4** Display a video introduction in a circular profile card
- **FR-1.5** Render a 3D interactive particle background (Three.js)
- **FR-1.6** Show a pulsing cursor trail following mouse/touch
- **FR-1.7** Display an AI chat assistant floating message sequence

### FR-2: Certifications
- **FR-2.1** Show certification badges in a responsive grid (2–5 columns)

### FR-3: Work Experience
- **FR-3.1** Display a vertical timeline of positions
- **FR-3.2** Show company, role, dates, and location for each role
- **FR-3.3** List bullet-point achievements with technology highlights
- **FR-3.4** Display technology skill icons with hover tooltips

### FR-4: Education & Core Values
- **FR-4.1** Display academic background and certifications
- **FR-4.2** Present core values in a glass-card layout

### FR-5: Projects
- **FR-5.1** Show project cards with 3D flip animation
- **FR-5.2** Display front: title, image, short description
- **FR-5.3** Display back: timeline, outcome, core technology stack

### FR-6: Hobbies
- **FR-6.1** Display hobby cards: coins, gaming, reading, food, homelab
- **FR-6.2** Link coins to subdomain (`coins.akashnagapure.in`)
- **FR-6.3** Link gaming to subdomain (`gaming.akashnagapure.in`)

### FR-7: Contact
- **FR-7.1** Display a terminal-style contact form
- **FR-7.2** Validate name, email, and message fields
- **FR-7.3** Launch a pre-filled `mailto:` on submit
- **FR-7.4** Show success banner after submission

### FR-8: Blog Articles
- **FR-8.1** Display article content with table of contents / scroll spy
- **FR-8.2** Provide article search/filter functionality
- **FR-8.3** Display comment threads with nested replies
- **FR-8.4** Allow posting new comments (name, email, content)
- **FR-8.5** Allow replying to comments
- **FR-8.6** Allow liking/disliking comments (localStorage + API)
- **FR-8.7** Show article helpful/not-helpful vote stats and buttons
- **FR-8.8** Persist vote state in localStorage to prevent duplicate votes

### FR-9: Sub-pages
- **FR-9.1** Coins — Coin collection gallery with filtering by country/type
- **FR-9.2** Food — Food recipe/photo showcase
- **FR-9.3** Gaming — Game setup and puzzle documentation
- **FR-9.4** HomeLab — Homelab rack diagram and equipment list
- **FR-9.5** Projects — Portfolio project showcase
- **FR-9.6** Puzzle — Speedcube collection and records
- **FR-9.7** Reading — Book/library tracking
- **FR-9.8** Skills — Technology skill radar charts
- **FR-9.9** Courses — Completed training courses
- **FR-9.10** Resume — Printable/downloadable resume

### FR-10: API Endpoints
- **FR-10.1** `GET /api/comments?article_id=X` — Fetch comments for an article
- **FR-10.2** `POST /api/comments` — Create a new comment or reply
- **FR-10.3** `PATCH /api/comments` — Increment likes/dislikes on a comment
- **FR-10.4** `POST /api/contact` — Save a contact form submission
- **FR-10.5** `GET /api/projects` — List portfolio projects
- **FR-10.6** `GET /api/votes?article_id=X` — Fetch helpful/not-helpful vote counts
- **FR-10.7** `POST /api/votes` — Record an article-level vote

### FR-11: Subdomain Routing
- **FR-11.1** `blogs.akashnagapure.in` ? `/Sub_Pages/Projects.html`
- **FR-11.2** `reading.akashnagapure.in` ? `/Sub_Pages/Reading.html`
- **FR-11.3** `coins.akashnagapure.in` ? `/Sub_Pages/Coins.html`
- **FR-11.4** `.homelab.akashnagapure.in` ? `/Sub_Pages/HomeLab.html`
- **FR-11.5** `resume.akashnagapure.in` ? `/Sub_Pages/resume.html`
- **FR-11.6** `skills.akashnagapure.in` ? `/Sub_Pages/Skills.html`
- **FR-11.7** `courses.akashnagapure.in` ? `/Sub_Pages/courses.html`
- **FR-11.8** `gaming.akashnagapure.in` ? `/Sub_Pages/Game.html`
- **FR-11.9** `food.akashnagapure.in` ? `/Sub_Pages/Food.html`
- **FR-11.10** `puzzle.akashnagapure.in` ? `/Sub_Pages/Puzzle.html`

## Non-Functional Requirements

### NFR-1: Performance
- **NFR-1.1** Page load time < 3 seconds on 3G (Core Web Vitals: LCP < 2.5s)
- **NFR-1.2** First contentful paint < 1.8 seconds
- **NFR-1.3** Use `loading="lazy"` on all non-critical images
- **NFR-1.4** Use `fetchpriority="high"` on hero image
- **NFR-1.5** Use `async`/`defer` for external scripts

### NFR-2: Responsiveness
- **NFR-2.1** Fully responsive on mobile, tablet, and desktop
- **NFR-2.2** Mobile breakpoint at 768px (`sm:` prefix in Tailwind)
- **NFR-2.3** Touch-friendly navigation on mobile
- **NFR-2.4** Canvas-based effects must degrade gracefully on mobile (reduced particle count)

### NFR-3: Accessibility
- **NFR-3.1** Semantic HTML5 sectioning (`<header>`, `<main>`, `<section>`, `<footer>`)
- **NFR-3.2** `aria-label` on interactive non-text elements
- **NFR-3.3** `loading="lazy"` and `onerror` fallbacks for images
- **NFR-3.4** Canvas elements marked `aria-hidden="true"`

### NFR-4: Security
- **NFR-4.1** CSP header set via `vercel.json`
- **NFR-4.2** CORS headers on all API endpoints
- **NFR-4.3** `X-Frame-Options: SAMEORIGIN` to prevent clickjacking
- **NFR-4.4** `Referrer-Policy: strict-origin-when-cross-origin`
- **NFR-4.5** `X-Content-Type-Options: nosniff`
- **NFR-4.6** `Cache-Control: no-cache` on HTML and API responses

### NFR-5: SEO
- **NFR-5.1** Meta title and description on every page
- **NFR-5.2** Open Graph tags (og:title, og:description, og:image, og:url)
- **NFR-5.3** Twitter Card tags
- **NFR-5.4** JSON-LD structured data (Person schema)
- **NFR-5.5** Canonical URL
- **NFR-5.6** `sitemap.xml` present and valid
- **NFR-5.7** `robots.txt` present

### NFR-6: Browser Support
- **NFR-6.1** Modern browsers (Chrome 90+, Firefox 88+, Safari 15+, Edge 90+)
- **NFR-6.2** ES2022 JavaScript features

### NFR-7: Reliability
- **NFR-7.1** Image `onerror` fallback to placeholder GIF
- **NFR-7.2** API errors caught gracefully with fallback UI
- **NFR-7.3** 3D/canvas effects must not block page rendering
- **NFR-7.4** `prefers-reduced-motion` consideration (planned enhancement)

## Out of Scope
- User authentication or admin dashboard
- Server-side rendering (static HTML only)
- Third-party analytics or tracking scripts
- E-commerce functionality beyond contact forms
