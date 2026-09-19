# Akash Nagapure – Professional IT Portfolio

> Enterprise Fleet Architect | Microsoft Intune • SCCM • VMware

A performance-focused, dark-theme static portfolio website for **Akash Nagapure**, an IT professional specializing in Microsoft Endpoint Manager (Intune), SCCM, VMware virtualization, and cloud-native automation.

## Overview

Built as a static HTML/CSS/JavaScript site with a Vite-powered build pipeline, deployed on Vercel with edge-cached routing, subdomain-based section routing, and serverless API endpoints backed by Neon PostgreSQL.

The portfolio is **under active construction** and showcases:

- **Certifications** – Microsoft Azure & role-based badges with interactive confetti celebrations
- **Work Experience** – A detailed timeline across Medline Industries and Hexaware Technologies
- **Projects** – Case studies on Windows Autopatch, ServiceNow integration, VMware Horizon, and more
- **Hobbies** – Numismatics, gaming, reading, cooking, and homelab documentation
- **Blogs** – In-depth technical guides on SCCM, Intune, PowerShell, Azure Virtual Desktop, and more
- **Contact** – A terminal-style interface that launches a pre-filled email

## Preview

![Akash Nagapure portfolio landing page](docs/images/design-reference.png)

## Tech Stack

| Layer | Technology |
|---|---|
| Build | Vite 6 |
| Runtime | Vanilla HTML, CSS (Tailwind), JavaScript (ES2022) |
| 3D | Three.js r128 (interactive particle field) |
| Animations | canvas-confetti, CSS keyframes |
| Icons | Lucide, Material Symbols |
| Backend | Serverless API functions (Vercel) |
| Database | Neon Serverless PostgreSQL |
| Routing | Vercel middleware (subdomain → section redirects) |

## Getting Started

### Prerequisites

- **Node.js** >= 20
- A **Neon PostgreSQL** account (for comments, contact, and vote APIs)

### Installation

```bash
npm install
```

### Local Development

```bash
npm run dev
```

Serve on http://localhost:3000 (hot reload enabled).

### Environment Variables

Create a `.env.local` file:

```env
POSTGRES_URL=postgresql://user:password@host/dbname?sslmode=require
GEMINI_API_KEY=your-gemini-api-key  # used by certain server-side features
```

### Production Build

```bash
npm run build
```

## Project Structure

```
.
├── api/                  # Serverless API endpoints (Vercel Functions)
│   ├── comments.js       # CRUD + voting for blog comments
│   ├── contact.js        # Contact form submissions
│   ├── projects.js       # Projects showcase data
│   ├── subscribe.js      # Newsletter sign-ups
│   └── votes.js          # Article helpful/not-helpful vote stats
├── public/               # Static assets served directly
│   ├── Blogs/            # Technical blog articles (23 articles + hub)
│   ├── Sub_Pages/        # Hobby & project sub-pages (10 pages)
│   ├── images/           # All images, icons, and illustrations
│   ├── Main_page_data/   # Hero images, profile photo, logo, resume PDF
│   ├── assets/           # css/ + js/ runtime (site effects, flip cards, …)
│   ├── template/         # Built copy of the shared footer / 3D-background
│   ├── llms.txt          # AI answer-engine index (generated)
│   ├── robots.txt
│   └── sitemap.xml
├── docs/                 # Project documentation (+ docs/images/ reference shot)
├── scripts/
│   └── auto-sync.mjs     # `npm run sync` / `npm run watch` pipeline
├── template/             # Shared footer + 3D-background sources (inlined by tools/)
├── tools/                # Build, guard, test and SEO maintenance scripts
├── index.html            # Main landing page
├── middleware.js         # Subdomain routing middleware
├── vite.config.ts        # Vite build configuration
├── vercel.json           # Vercel deployment config
├── tsconfig.json         # TypeScript configuration
└── package.json
```

Everything above is tracked in git; `vote-manager.js` is embedded inline in the
pages and no longer exists as a standalone file.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run clean` | Remove the `dist/` directory |
| `npm run sync` | One-shot: inline templates → sitemap → llms.txt → SEO audit |
| `npm run watch` | Same pipeline, re-run on every source change |
| `npm run seo:check` | Sitemap drift + llms drift + structured data + meta audit |
| `npm run seo:meta` | Audit per-page titles/descriptions/OG/alt coverage |
| `npm run projects:check` | Verify the frozen Projects section is intact |
| `npm run test:guard` / `npm run test:flip` | Regression suites (21 + 40 cases) |

## License

&copy; 2026 Akash Nagapure. All rights reserved.

