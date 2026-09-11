# Project: Akash Nagapure Portfolio

## Purpose

A dark-theme, performance-optimized static portfolio website for **Akash Nagapure**,
an Enterprise Fleet Architect specializing in Microsoft Intune, SCCM, VMware
virtualization, and cloud-native automation. The site showcases professional
experience, certifications, technical projects, blog articles, and hobby
interests (numismatics, gaming, reading, cooking, homelab).

## Key Facts

| Attribute | Value |
|---|---|
| **Primary domain** | https://www.akashnagapure.in |
| **Sub-domains** | blogs, reading, coins, homelab, resume, skills, courses, gaming, food, puzzle |
| **Build tool** | Vite 6 |
| **Hosting** | Vercel (serverless functions + static assets) |
| **Database** | Neon Serverless PostgreSQL (for API-backed features) |
| **Primary audience** | IT professionals, enterprise architects, recruiters |
| **Status** | Under active construction |
| **Copyright** | 2026 Akash Nagapure |

## Features at a Glance

1. **Interactive 3D particle field** — Three.js r128 canvas with mouse-trail interaction
2. **Animated cursor trail** — Smooth trailing line following cursor/touch
3. **Typewriter headline** — Rotating role descriptions
4. **Confetti celebrations** — Certification badges trigger canvas-confetti bursts
5. **Responsive dark theme** — Tailwind CSS with glass-morphism UI elements
6. **Subdomain routing** — Vercel middleware maps ten sub-domains to section pages
7. **Blog comment system** — Serverless API with Neon PostgreSQL storage
8. **Article ratings** — Helpful/not-helpful vote tracking (localStorage + API)
9. **Terminal-style contact form** — mailto-based submission with validation

## Tech Stack Summary

| Category | Technology |
|---|---|
| Build & Bundling | Vite 6, esbuild |
| Markup | HTML5 (static, multi-page) |
| Styling | Tailwind CSS (via CDN in dev, `@tailwindcss/vite` in build) |
| Scripting | Vanilla JavaScript (ES2022), no framework on the client |
| 3D Graphics | Three.js r128 |
| Animation | canvas-confetti 1.9.x |
| Icons | Lucide, Google Material Symbols |
| Fonts | Space Grotesk, Inter, Geist, JetBrains Mono, Plus Jakarta Sans |
| Backend (API) | Vercel Serverless Functions (Express-style handler) |
| Database | Neon Serverless PostgreSQL |
| Routing | Vercel `middleware.js` (subdomain → page rewrite) |
| Analytics | None (privacy-first; self-hosted tracking planned) |
| CI/CD | GitHub Actions (`deploy.yaml` on push to `main`) |

## Repository Layout

```
.
├── api/                    # Serverless API endpoints
├── public/                 # Static assets (served as-is by Vercel)
│   ├── Blogs/              # 24 technical blog articles
│   ├── Sub_Pages/          # 11 hobby & project sub-pages
│   ├── images/             # Icons, photos, cube puzzles, coins, food, etc.
│   ├── Main_page_data/     # Hero video, profile image, resume, logo
│   ├── robots.txt
│   └── sitemap.xml
├── assets/                 # Vendor build assets (canvas-confetti)
├── docs/                   # Project documentation
├── pages/                  # Design system reference (pages/DESIGN.md)
├── index.html              # Landing page (root entry point for Vite)
├── middleware.js           # Subdomain routing
├── vote-manager.js         # Shared client-side localStorage vote tracker
├── vite.config.ts          # Vite build configuration
├── vercel.json             # Vercel routing & security headers
├── tsconfig.json           # TypeScript checker config (JS allowed)
├── metadata.json           # Vercel/AI Studio metadata
└── package.json
```

## Deployment Flow

```
git push origin main
     │
     ▼
GitHub Actions (deploy.yaml)
     │
     ├── Checkout code
     ├── Setup Node.js 20
     ├── npm install
     ├── npm install @tailwindcss/oxide (Linux x64 native)
     └── npm run build  →  dist/
     │
     ▼
Vercel (serves dist/ + public/ + api/)
```
