# Content Structure

## Site Map

```
akashnagapure.in/
├── / (index.html)                    — Landing page (hero, certs, experience, education, projects, hobbies, contact)
├── /changelog.html                   — Changelog page
├── /privacy.html                     — Privacy policy
├── /terms.html                       — Terms of service
├── /sitemap.xml
├── /robots.txt
│
├── /Sub_Pages/
│   ├── Projects.html                 — Portfolio project showcase
│   ├── Reading.html                  — Books & reading list
│   ├── Coins.html                    — Coin collection gallery
│   ├── Game.html                     — Gaming setup & puzzle documentation
│   ├── HomeLab.html                  — Homelab equipment & diagrams
│   ├── resume.html                   — Resume / CV
│   ├── Skills.html                   — Skills radar charts
│   ├── courses.html                  — Completed courses
│   ├── Food.html                     — Food showcase
│   └── Puzzle.html                   — Speedcube collection & records
│
├── /Blogs/
│   ├── Autopatchblog.html            — Windows Autopatch A-to-Z
│   ├── sccm-application-model.html
│   ├── sccm-content-distribution.html
│   ├── sccm-hardware-inventory.html
│   ├── sccm-client-health-remediation.html
│   ├── sccm-intune-migration-guardrails.html
│   ├── sccm-osd-engineering.html
│   ├── sccm-patch-management-lifecycle.html
│   ├── intune-win32-packaging.html
│   ├── intune-advanced-deployment-rings.html
│   ├── intune-compliance-policies.html
│   ├── intune-autopilot-troubleshooting.html
│   ├── powershell-compliance-automation.html
│   ├── powershell-intune-reporting.html
│   ├── powershell-remediation-scripts.html
│   ├── powershell-graph-authentication.html
│   ├── powershell-device-inventory.html
│   ├── avd-host-pool-scaling.html
│   ├── avd-fslogix-profile-containers.html
│   ├── vmware-horizon-instant-clones.html
│   ├── vmware-dem-profile-management.html
│   ├── windows-365-enterprise-provisioning.html
│   └── windows-365-resilience-monitoring.html
│
├── /api/                              — Serverless API endpoints
│   ├── comments.js
│   ├── contact.js
│   ├── projects.js
│   └── votes.js
│
└── /images/                           — All images, icons, illustrations
    ├── Main_Page_Images/
    ├── icons/
    ├── Cube_Images/
    ├── Food_Images/
    ├── lab/
    ├── Notes_And_Coins/
    ├── Skills/
    ├── Blogs_Images/
    └── Social/
```

## Section Breakdown: Landing Page (`index.html`)

### 1. Header (Nav)
- Logo + role badge ("Fleet Architect")
- Desktop nav links: Home, About me, Certifications, Work experience, Education & Core Values, Projects, Hobby, Contact me, Changelog
- Mobile hamburger button → overlay drawer

### 2. Hero (`#home`)
- "AVAILABLE FOR WORK" live status badge
- H1: "Akash Nagapure" with glow animation
- Typewriter subtitle (rotating: "Microsoft Intune & VMware Architect", etc.)
- Intro paragraph
- CTA buttons: Resume, Blogs
- Profile card with video background

### 3. About (`#about`)
- Two-column layout
- Left: "Architect Behind The Screens" bio
- Right: Location badge (Pune, India)

### 4. Certifications (`#certifications`)
- Header with "CREDENTIALS" label
- Grid of cert badges (AZ-900, AZ-104, AZ-140, etc.)
- Each badge: image + name + date, clickable for confetti

### 5. Work Experience (`#experience`)
- Vertical timeline
- Each role: company, title, dates, location
- Bullet points with tech highlights
- Skill icon carousel per role

### 6. Education & Core Values (`#education`)
- Education cards (academic background)
- Core values cards (engineering, zero-trust, automation)

### 7. Projects (`#projects`)
- Flip-card project showcase
- Frontend: title, image, description
- Backend: timeline, outcome, tech stack

### 8. Hobbies (`#hobbies`)
- Hobby cards: coins, gaming, reading, food, homelab
- Links to subdomains for detailed sections

### 9. Contact (`#contact`)
- Terminal-style "MAILBOX_TERMINAL" form
- Fields: name, email, subject, message
- mailto: submission
- Success banner

### 10. Footer
- Logo + name
- Links: LinkedIn, Contact Mail, Changelog, Privacy, Terms
- Copyright: "© 2026. All Rights Reserved. Engineered with Precision."

## Blog Article Structure

Each blog page (`public/Blogs/*.html`) contains:

1. **Header & Nav** — same as landing page
2. **Article metadata** — title, date, reading time, author
3. **Article content** — searchable blocks (`.searchable-block` class)
4. **Search filter** — input to filter content blocks
5. **Discussion section** — comments system using `/api/comments`
6. **Article vote bar** — helpful/not-helpful buttons using `/api/votes`
7. **3D background & cursor trail** — same as landing page
8. **Footer** — same as landing page

## Sub-page Structure

Sub-pages (`public/Sub_Pages/*.html`) share:
- Same header/nav with mobile drawer
- Same 3D background and cursor trail
- Same footer
- Page-specific content (coin gallery, food cards, puzzle tables, etc.)
- Comment system (using `/api/comments`) on some pages

## Content Ownership

| Content | Source | Owner |
|---|---|---|
| All text & images | `public/` static files | Akash Nagapure |
| Blog articles | `public/Blogs/*.html` | Akash Nagapure |
| Profile photo | `/Main_page_data/akash_profile_*.avif` | Akash Nagapure |
| Resume | `/Main_page_data/Akash_Resume.pdf` | Akash Nagapure |
| Design tokens | `pages/DESIGN.md` | Design system reference |
