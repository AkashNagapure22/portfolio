# Changelog

All notable changes to this portfolio project are documented in this file.

The version format is `v<major>.<minor>.<patch>` (e.g., v3.2.0).
Versions are mirrored in the live changelog page at
https://www.akashnagapure.in/changelog.html

---

## [Unreleased] — v3.4.0

### Summary
The frozen "Key Projects" section of `index.html` was restored after a
CP437 round-trip corrupted it, and is now protected by a committed baseline,
a guard script, a local pre-commit hook and a deploy-time check.
Footer subscribe form wired to the database, cookie consent rewritten to honour
accept/decline, and the `api/` folder un-ignored so serverless endpoints deploy.

### Fixed
- **`index.html` — `#projects` section (mojibake)**: An unattended
  PowerShell/Python read-write round-trip re-encoded the file in CP437, which
  turned every `→` (UTF-8 `E2 86 92`) inside the six project cards into the
  6-byte sequence `Î“Ã¥Ã†` (`CE 93 C3 A5 C3 86`). All six telemetry lines
  rendered as garbage. The section was restored from commit `41ff402`
  (`git checkout 41ff402 -- index.html`); the file is again byte-identical to
  that revision apart from the intended content.
- **`api/subscribe.js` was never deployed**: `.gitignore` line 196 contained
  the broad rule `api/*` with only `!api/comments.js`, `!api/contact.js`,
  `!api/projects.js`, and `!api/votes.js` as exceptions. `api/subscribe.js` was
  therefore ignored by git and absent from the Vercel deployment, so every
  footer subscribe request returned 404. Added `!api/subscribe.js` (and a
  corrected `!.github/` line that had been concatenated onto the previous entry).
- **`api/subscribe.js`**: Rewrote the handler to match the `subscribers` table
  schema (`id`, `email`, `subscribed_at`). Added CORS + OPTIONS preflight
  handling, an HTTP 405 guard for non-POST methods, safe body parsing
  (string or object), email normalisation (trim + lower-case), server-side
  regex validation, and `ON CONFLICT (email) DO NOTHING` deduplication that
  reports `alreadySubscribed: true`. The table is now created with
  `CREATE TABLE IF NOT EXISTS` on demand.
- **All 42 HTML files — inline subscribe handler**: The success check
  `if (data.success || res.ok)` referenced `res`, which is out of scope inside
  the second `.then()` callback, throwing a `ReferenceError` on every
  submission. Replaced with `if (data.success)`.
- **All 42 HTML files — cookie consent**: Replaced the legacy
  `handleAcceptCookie()` / `handleDeclineCookie()` pair (which did nothing but
  hide the banner) with the requested `DOMContentLoaded` implementation using
  `#accept-cookies-btn` / `#deny-cookies-btn`. Accept now writes
  `localStorage.cookieConsent = 'accepted'` and sets the
  `non_essential_consent` cookie for one year; Decline writes `'denied'` and
  expires that cookie (`max-age=0`). The legacy `cookie_consent` key is still
  read as a fallback so returning visitors keep their previous choice, and the
  banner reveal logic was consolidated into a single 1-second delayed
  `.show` class toggle.
- **`public/Sub_Pages/Projects.html`**: Removed a duplicated trailing copy of
  the entire document (two `<!DOCTYPE html>` declarations and two closing
  `</html>` tags) that caused the browser to discard the second half of the
  page. File truncated at the first well-formed end of document.

### Added
- **`tools/projects-guard.mjs`**: Diff-based guard for the frozen `#projects`
  section of `index.html`. Compares the section against
  `tools/projects-baseline.html`, rejects CP437/Windows-1252 mojibake and
  broken card structure, prints the first differing offset, and can restore the
  baseline (`--heal`) or re-freeze it after an intentional edit (`--accept`).
  `--file`/`--baseline` allow testing against other copies. Exit 0 = matches.
- **`tools/projects-baseline.html`**: Committed baseline of the frozen section
  (newline-normalised, no BOM), whitelisted in `.gitignore`.
- **`tools/install-guard-hooks.ps1`**: Installs `.git/hooks/pre-commit`, which
  heals the section, re-stages the repair so the commit cannot record the
  corrupted copy, and blocks the commit if the section cannot be repaired.
- **`npm run projects:check` / `npm run projects:accept` / `npm run test:guard`**:
  Scripts wrapping the guard's verify and re-freeze modes, plus the guard's
  21-case regression suite (`tools/projects-guard.test.mjs`, runs in a temp dir).
- **`docs/PROJECTS-SECTION-GUARD.md`**: Documents why the section is frozen,
  what the guard checks, and the supported way to change it on purpose.

### Changed
- **`docs/`**: ARCHITECTURE.md now documents the `subscribers` table, the
  `POST /api/subscribe` endpoint, the shared footer composition, and the
  cookie consent model. COMPONENTS.md gained full Footer, Newsletter Subscribe
  Form, and Cookie Consent Banner sections. FEATURES.md gained features 19 and
  20 with an updated requirement mapping. REQUIREMENTS.md gained FR-10.8,
  FR-12 (Newsletter Subscription) and FR-13 (Cookie Consent).
- **`dist/`**: Regenerated via `npm run build` so the deployed output matches
  `public/` and `index.html`.

### Verified
- `node --check tools/projects-guard.mjs` passes
- `node tools/projects-guard.mjs` reports the `#projects` section of
  `index.html` as identical to `tools/projects-baseline.html` (6 clean `→`,
  0 mojibake sequences, 82/82 balanced `<div>`, 6 flip cards)
- Simulated drift, mojibake and broken-structure copies are all rejected
  (exit 1); `--heal` restores each of them byte-for-byte; `--accept` refuses to
  freeze a broken section
- `node --check api/subscribe.js` passes
- `npm run build` succeeds (dist/index.html 136.91 kB, bundle 0.71 kB)
- 85 HTML files contain the new `accept-cookies-btn` handler; zero references
  to `handleAcceptCookie`/`handleDeclineCookie` or `data.success || res.ok` remain
- Exactly one `<!DOCTYPE html>` per page across `public/` and `dist/`
- No footer contains the old `flex items-center gap-2.5 group` pattern or a
  duplicated "Akash Nagapure" label

---

## [Unreleased] — v3.3.0

### Summary
Code quality improvements, bug fixes, and comprehensive project documentation.

### Fixed
- **All 36 HTML files**: Removed redundant "Akash Nagapure" text from footer. The name now appears only once in the copyright line, eliminating duplication with the logo alt text.
- **FAQ page**: Fixed broken footer structure — removed misplaced `</main>` tag that was after `</html>`, added proper `</main>` before footer to ensure full-width display.
- **Projects page**: Removed standalone "STAY UPDATED — NEWSLETTER" section (duplicate subscribe form). The footer subscribe form is now the single subscription point.
- **Footer template** (`footer-template.html`): Updated to remove redundant name text.
- **sitemap.xml**: Added missing FAQ page entry.
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
