# Changelog

All notable changes to this portfolio project are documented in this file.

The version format is `v<major>.<minor>.<patch>` (e.g., v3.2.0).
Versions are mirrored in the live changelog page at
https://www.akashnagapure.in/changelog.html

---

## [Unreleased] — v3.6.0

### Summary
Structure + performance + metadata pass: duplicate folders and files removed,
the `npm run sync` / `npm run watch` scripts implemented, the randomly wandering
3D tiles and the pointer-tilt effect removed, the resume button made
download-only, and complete OG/Twitter coverage added across all 43 pages.

### Added
- **`scripts/auto-sync.mjs`** — implements the `npm run sync` (`--once`) and
  `npm run watch` commands `package.json` referenced but that never existed:
  apply-templates → sitemap → llms.txt → structured-data → SEO meta audit, plus a
  debounced `fs.watch` loop (node built-in, no extra dependency) that ignores the
  files the pipeline generates itself.
- **`tools/audit-seo-meta.mjs`** (`npm run seo:meta`, now also part of
  `npm run seo:check`): per-page audit of title/description length, canonical,
  OG/Twitter coverage, duplicated share tags, `<h1>` count, `<img alt>` and the meta keywords budget (≤ 20 phrases / ≤ 600 chars).
- **`tools/fix-seo-meta.mjs`** — the bulk repair used for this release (dedupe
  share tags, fill missing `og:*` / `twitter:*` from the page's own title,
  description and canonical, apply shortened snippets).
- **`docs/images/design-reference.png`** — the design reference screenshot, kept
  next to the docs that describe the design system.
- **`tools/add-geo-meta.mjs`** — idempotent inserter of the site geo block
  (`geo.region` IN-MH, `geo.placename` Pune, `geo.position`, `ICBM`) after each
  indexable page's canonical link. Byte-safe (raw Buffer + ASCII-only insert),
  so the pages that are not valid UTF-8 round-trip without corruption.

### Changed
- **Project structure**: removed the duplicate `pages/` and `images/` folders
  (`pages/DESIGN.md` and `images/DESIGN.md` were byte-identical leftovers of
  `docs/DESIGN.md`; both `screen.png` copies were unreferenced by any page), and
  deleted the stale `public/Sub_Pages/footer-template.html` duplicate. The footer
  template now has exactly two copies: `template/` (source) and `public/template/`
  (shipped). `template-loader.js`, `robots.txt`, `tools/build-sitemap.mjs` and the
  docs all point at the single canonical path.
- **`.gitignore`**: whitelisted `scripts/`, the new tools, `docs/images/`,
  `llms*.txt`, `site.webmanifest` and `robots.txt`; dropped the stale
  `public/Sub_Pages/footer-template.html` negation.
- **`public/assets/js/3d-background.js`**: the particle field is painted once
  (and on resize) instead of running a 60 fps loop with random rotation, colour
  cycling and pointer parallax. Particle count 4500 → 1800 (desktop) and
  1500 → 600 (mobile); the cursor trail's rAF loop parks itself when the pointer
  stops, and the trail is skipped entirely for `prefers-reduced-motion`.
- **`public/assets/js/site-effects.js` + `site-effects.css`**: removed the
  pointer-tilt effect (cards no longer rotate or shift as the cursor moves over
  them) and the unused `.fx-progress` / `.fx-float` rules; the runtime stylesheet
  injector now skips pages that already link the CSS, so it is no longer fetched
  twice per page.
- **`index.html`**: deleted ~170 lines of dead `__legacy_*_DISABLED` 3D/cursor
  code, removed the random arrow-nudge/twinkle loop that fired on a 1–4 s timer,
  bounded the Spline watermark interval (it used to run every 500 ms forever), and
  deferred the three.js, Lucide and canvas-confetti CDN scripts.

- **`public/Sub_Pages/resume.html`**: the Download/Open toggle is now a single
  `Download Resume` button. The PDF is fetched as a blob and saved through an
  object URL, so the browser can only save the file — it never opens the built-in
  PDF viewer (with an anchor fallback if `fetch` is unavailable). ~60 lines of
  dead toggle CSS (`.input`, `.square`, `:checked` state) removed.
- **SEO metadata**: deduplicated repeated OG/Twitter blocks (Food, Game, HomeLab,
  Projects, Reading and courses each carried 5 duplicates), added the missing
  `og:title` / `og:description` / `og:image` and Twitter cards on resume,
  changelog, privacy and terms, and shortened the title/descriptions that search
  engines would truncate (index, FAQ, HomeLab, Projects, courses).
- **`package.json`**: `clean` is cross-platform again (Node `fs.rmSync` instead of
  `rm -rf`), `seo:meta` added, and `seo:check` extended with the meta audit.
- **Docs**: README and `docs/PROJECT.md` structures rewritten to the real tree;
  `ARCHITECTURE`, `COMPONENTS`, `CONTENT` and `SEO` updated for the template
  paths, the removed effects and the new audit tooling.
- **SEO geo + AI keywords**: geo block (`geo.region`/`geo.placename`/
  `geo.position`/`ICBM`, Pune 18.5204;73.8567) added to all 38 indexable pages,
  `og:locale` `en_US` → `en_IN` on index + FAQ, and four answer-engine phrases
  appended to the homepage `meta keywords` (20 phrases / 549 chars — inside the
  budget the audit now enforces). `public/sitemap.xml` regenerated (38 URLs,
  `lastmod` refreshed).

### Verified
- `npm run seo:meta` → 0 problems across 43 pages (was 61).
- `npm run seo:check` green (sitemap drift + llms drift + structured data + meta).
- `npm run projects:check`, `test:guard` (21/21) and `test:flip` (40/40) green.
- Geo block present on 38/38 indexable pages; `npm run seo:meta` still 0 problems with the keywords budget active.

---

## [Unreleased] — v3.5.0

### Summary
Full SEO + Answer-Engine (AI visibility) release: every page got keyword-rich
meta, valid JSON-LD and breadcrumbs; robots.txt explicitly welcomes AI crawlers;
new `llms.txt`/`llms-full.txt` discovery files; sitemap generator rebuilt and
regenerated; FAQ expanded from 3 to 9 questions; docs rewritten.

### Added
- **`public/llms.txt` + `public/llms-full.txt`**: LLM discovery indexes (author
  E-E-A-T, core pages, 10 hubs, all 23 articles by family, citation policy).
- **`tools/build-llms-txt.mjs`** (`npm run llms`, `npm run llms:check`).
- **`tools/build-sitemap.mjs`** (`npm run sitemap`, `npm run sitemap:check`) —
  the generator the old sitemap header referenced but never existed.
- **`tools/enrich-blog-schema.mjs`** (`npm run seo:blogs`): full BlogPosting
  schema + breadcrumbs + article meta on all 23 guides.
- **`tools/enrich-hub-schema.mjs`** (`npm run seo:hubs`): CollectionPage /
  ProfilePage + breadcrumbs on the 10 Sub_Pages; blog hub gained an ItemList
  of all 23 articles.
- **`tools/validate-structured-data.mjs`** (`npm run seo:validate`): JSON-LD
  validity + required-field gate across all 41 pages.
- **`docs/AEO.md`**: answer-engine strategy (crawler matrix, llms.txt, E-E-A-T,
  citation patterns, monitoring prompts).
- **FAQ page**: 6 new visible Q&A (expertise, article usage, availability),
  full 9-question FAQPage schema, keyword meta, breadcrumbs.
- **`index.html`**: `@graph` WebSite + ProfilePage + Person (knowsAbout[13],
  sameAs, worksFor), keyword/author/robots/theme-color meta, OG enrichments.
- **`public/robots.txt`**: explicit allow-list for 25 AI/LLM crawler agents;
  noindex utility pages + template partials disallowed to protect crawl budget.

### Changed
- **`docs/SEO.md`**: rewritten to match the shipped site (38-URL inventory,
  meta matrix, schema inventory, keyword strategy, validation checklist).
- **`docs/CONTENT.md`**: llms.txt / llms-full.txt added to the site map.
- **`public/sitemap.xml`**: regenerated via the new generator (38 URLs, 11 hosts).
- **Blog heads**: added `datePublished`/`dateModified` (from git history),
  image, keywords, `mainEntityOfPage`, author/publisher, OG `article:*` tags.

### Verified
- `npm run seo:check` passes (sitemap drift + llms drift + structured data).
- Validator covers 69 JSON-LD blocks across 41 pages with 0 problems.
- `npm run projects:check`, `test:guard` (21/21), `test:flip` (40/40),
  `check-encoding` all green.

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
- **`public/Sub_Pages/Puzzle.html` — dead flip-tile handler**: removed the leftover `window.toggleFlipCard` definition. An earlier session had already rewired every puzzle tile to the shared `toggleHobbyFlip` from `/assets/js/flip-cards.js` (the handler that closes other tiles on click and ignores hover), so `toggleFlipCard` was unreachable. npm run test:flip is now 40/40.
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
