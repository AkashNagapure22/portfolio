# Architecture

## High-Level Overview

Vercel Edge Network serves three layers: edge middleware for subdomain routing,
serverless API functions for dynamic data (Neon PostgreSQL), and a static file
layer (dist/ + public/) for all HTML, images, and assets.

## Build Pipeline

### Development (npm run dev)
- Vite Dev Server on port 3000 with HMR
- CSS transformed via @tailwindcss/vite
- JSX transformed via @vitejs/plugin-react

### Production Build (npm run build)
- Entry: index.html
- CSS: Tailwind JIT → optimized bundle
- JS: JSX → vanilla JS bundle (~710 bytes gzipped)
- Output: dist/index.html + dist/assets/

### Deployment (GitHub Actions to Vercel)
1. Checkout repository
2. Setup Node.js 20
3. npm install
4. npm install --os=linux --cpu=x64 @tailwindcss/oxide
5. npm run build
6. Vercel serves dist/, public/, api/, and middleware.js

## Middleware Layer

File: middleware.js (Vercel Edge Functions)

Intercepts requests on sub-domains and rewrites root path to the appropriate
sub-page. Skips static assets (paths with dots), /api/, /public, /images.

Subdomain → Page Mapping:
| Subdomain              | Target Page                  |
| blogs.akashnagapure.in | /Sub_Pages/Projects.html     |
| reading.akashnagapure.in | /Sub_Pages/Reading.html  |
| coins.akashnagapure.in | /Sub_Pages/Coins.html        |
| homelab.akashnagapure.in | /Sub_Pages/HomeLab.html  |
| resume.akashnagapure.in | /Sub_Pages/resume.html      |
| skills.akashnagapure.in | /Sub_Pages/Skills.html    |
| courses.akashnagapure.in | /Sub_Pages/courses.html  |
| gaming.akashnagapure.in | /Sub_Pages/Game.html       |
| food.akashnagapure.in   | /Sub_Pages/Food.html       |
| puzzle.akashnagapure.in | /Sub_Pages/Puzzle.html     |

## API Layer

Platform: Vercel Serverless Functions (Express-style handlers)

All API endpoints follow the same pattern:
1. Set CORS headers
2. Handle OPTIONS preflight
3. Validate POSTGRES_URL environment variable
4. Initialize Neon PostgreSQL connection
5. Dispatch on HTTP method (GET/POST/PATCH)
6. Return JSON response

### Database Schema (Neon PostgreSQL)

| Table                | Columns                                                           | Used By        |
| comments             | id, article_id, author, email, content, parent_id, likes, dislikes, created_at | api/comments.js |
| contact_submissions  | id, full_name, email, subject, message, created_at               | api/contact.js |
| votes                | article_id (PK), helpful, not_helpful                            | api/votes.js   |

### API Endpoints

- GET    /api/comments?article_id=X   — Fetch all comments for an article
- POST   /api/comments                — Create a new comment or reply
- PATCH  /api/comments                — Increment likes/dislikes on a comment
- POST   /api/contact                 — Save contact form submission
- GET    /api/projects                — List portfolio projects (static JSON)
- GET    /api/votes?article_id=X      — Fetch helpful/not-helpful vote counts
- POST   /api/votes                   — Record an article-level vote (up/down)

## Client-Side Architecture

### index.html (Landing Page)
- 3D Engine: Three.js r128 particle field on #three-bg-canvas
- Cursor Trail: Canvas 2D on #cursor-trail-canvas
- Interactions: smoothNav, toggleMobileNav, toggleFlip, triggerBadgeConfetti
- Animations: typewriter, chat assistant, scroll-triggered back-to-top

### Blog Pages (public/Blogs/*.html)
- Same 3D engine and cursor trail as landing page
- Comment system: loadComments, handleCommentSubmit, handleVote, postReply
- Article voting: loadVoteStats, vote buttons with localStorage deduplication
- Search: filterArticleContent() for filtering article sections
- Scroll spy: IntersectionObserver for nav link highlighting

### Sub-Pages (public/Sub_Pages/*.html)
- Same 3D engine and cursor trail
- Page-specific interactive components (coin filters, cube galleries, etc.)
- Comment system on some pages

### Shared Utilities
- vote-manager.js: VOTE_MANAGER object for localStorage-based vote tracking
  - Provides getUserId(), getVoteKey(), hasVoted(), recordVote()
  - Embedded inline in blog pages (also exists as standalone file for reference)

## Asset Pipeline

Source files in public/ (Blogs/, Sub_Pages/, images/) are served as-is by Vercel.
Only the root index.html is processed by Vite (output to dist/index.html).

## Configuration Files

| File           | Purpose                                            |
| vite.config.ts | Vite build config (React plugin, Tailwind, path alias @) |
| vercel.json    | Security headers, cache policy, clean URLs          |
| tsconfig.json  | TypeScript checker (allowJs, jsx: react-jsx)       |
| metadata.json  | Vercel/AI Studio app metadata                       |
| .gitignore     | Whitelist-based: * ignores all, ! exceptions tracked|
