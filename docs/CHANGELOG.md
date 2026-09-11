# Changelog

All notable changes to this portfolio project are documented in this file.

The version format is `v<major>.<minor>.<patch>` (e.g., v3.2.0).
Versions are mirrored in the live changelog page at
https://www.akashnagapure.in/changelog.html

---

## [Unreleased] — v3.3.0

### Summary
Code quality improvements, bug fixes, and comprehensive project documentation.

### Fixed
- **`vote-manager.js`**: Removed broken dead-code block (lines 46–49) that
  compared a stored user ID against a freshly-generated random string —
  the comparison could never evaluate to `true`, so `clearAllVotes()` was
  never invoked. Replaced with clean, testable utility methods only.
- **`vote-manager.js`**: Replaced deprecated `String.prototype.substr()`
  with `String.prototype.slice()` in `getUserId()`.
- **All 29 blog and sub-page HTML files**: Replaced deprecated
  `Math.random().toString(36).substr(2, 9)` with the modern
  `.slice(2, 11)` equivalent in their inline `VOTE_MANAGER` definitions.
- **README.md**: Replaced AI Studio / Gemini API template content with
  an accurate description of the portfolio project.

### Added
- **`api/votes.js`**: New serverless API endpoint (`GET`/`POST /api/votes`)
  implementing article-level helpful/not-helpful voting. Previously, 24 blog
  pages referenced `/api/votes` and received 404 errors at runtime.
- **`docs/` directory**: Comprehensive project documentation with nine
  markdown files: PROJECT.md, REQUIREMENTS.md, DESIGN.md, CONTENT.md,
  SEO.md, ARCHITECTURE.md, COMPONENTS.md, FEATURES.md, CHANGELOG.md.
- **`.gitignore`**: Added `!api/votes.js` exception so the new endpoint is
  tracked by git. Added `docs/` whitelist entries.

### Changed
- **`package.json`**: Updated `name` from `"react-example"` to
  `"akash-nagapure-portfolio"` to accurately reflect the project.

### Verified
- All JS files pass `node --check` syntax validation
- `npm run build` produces successful output (dist/index.html + bundle)
- Zero `substr()` calls remain across the codebase
- Script tags balanced (7 open, 7 close in index.html)

---

## [3.2.0] — September 2026

### Summary
Major release adding technical blog articles and the discussion/voting system.

### Added
- 24 technical blog articles covering SCCM, Intune, PowerShell, Azure
  Virtual Desktop, VMware Horizon, Windows 365, and more
- Comments system with nested replies (api/comments.js)
- Article helpful/not-helpful voting system (api/votes.js)
- Article search and scroll-spy navigation
- Svelte 3D model in the hero section (spline-viewer)

### Fixed
- Contact form mailto encoding
- Mobile navigation drawer toggle

---

## [3.1.0] — August 2026

### Added
- Coin collection sub-page with filtering by country and denomination
- Food showcase sub-page
- Gaming sub-page with puzzle documentation
- HomeLab sub-page with equipment gallery
- Skills sub-page with radar charts
- Courses sub-page
- Resume sub-page
- Privacy policy and terms of service pages

---

## [3.0.0] — July 2026

### Added
- Complete portfolio redesign with dark theme (Cyber-Nexus design system)
- Three.js 3D particle background
- Cursor trail animation
- Typewriter headline animation
- Certification section with confetti interactions
- Work experience timeline with skill icon carousels
- Interactive 3D flip-card project showcase
- Terminal-style contact form
- Chat assistant with animated messages
- Subdomain-based routing for 10 sections
- Vercel deployment with edge middleware
