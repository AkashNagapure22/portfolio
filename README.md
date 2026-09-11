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
│   └── votes.js          # Article helpful/not-helpful vote stats
├── public/               # Static assets served directly
│   ├── Blogs/            # Technical blog articles (24 articles)
│   ├── Sub_Pages/        # Hobby & project sub-pages
│   ├── images/           # All images, icons, and illustrations
│   ├── Main_page_data/   # Hero images, resume, video
│   ├── robots.txt
│   └── sitemap.xml
├── assets/               # Build-vendor assets (canvas-confetti)
├── docs/                 # Project documentation
├── index.html            # Main landing page
├── middleware.js         # Subdomain routing middleware
├── vote-manager.js       # Client-side localStorage vote tracking
├── vite.config.ts        # Vite build configuration
├── vercel.json           # Vercel deployment config
├── tsconfig.json         # TypeScript configuration
└── package.json
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 3000 |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run clean` | Remove the `dist/` directory |
| `npm run lint` | Static app placeholder (no-op) |

## License

&copy; 2026 Akash Nagapure. All rights reserved.

