# SEO Strategy

Living document — kept in sync with the shipped `<head>` of every page.
Validate everything with `npm run seo:check`.

## URL inventory (38 URLs × 11 hosts — `public/sitemap.xml`)

| Host | Pages |
|---|---|
| `www.akashnagapure.in` | `/` (prioritised 0.9/weekly), `changelog.html`, `faq.html`, `privacy.html`, `terms.html` |
| `blogs.akashnagapure.in` | hub root + 23 article pages (`/Blogs/*.html`, priority 0.8) |
| `reading`, `coins`, `homelab`, `resume`, `skills`, `courses`, `gaming`, `food`, `puzzle` (+ blogs hub) | 10 section roots via `middleware.js` subdomain rewrite |

Excluded on purpose (noindex + robots Disallow + no canonical): `404.html`, `access-denied.html`, `maintenance.html`, `template/footer-template.html`, `template/3d-background-template.html` (the latter two are also the only copy of the templates now — the stale `public/Sub_Pages/footer-template.html` duplicate is gone).
Generator: `tools/build-sitemap.mjs` (`npm run sitemap`, `npm run sitemap:check`).
Meta coverage: `tools/audit-seo-meta.mjs` (`npm run seo:meta`) checks title/description length, canonical, OG/Twitter tags, duplicate snippets, one `<h1>` per page and `<img alt>` coverage; `tools/fix-seo-meta.mjs` repairs dedupe/gaps in bulk.

## Meta matrix (every page has all of these)

| Tag | Homepage example | Rule |
|---|---|---|
| `<title>` | `Akash Nagapure \| Microsoft Intune, SCCM & VMware Architect` | `Primary keyword \| Akash Nagapure` on content pages |
| description | 140–160 chars with primary + secondary keywords | unique per page, duplicated nowhere |
| keywords | person + tech stack + long-tail queries | curated per page family (see keyword map) |
| author / robots | `Akash Nagapure` / `index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1` | all indexable pages |
| canonical | absolute URL on its own host | matches sitemap `<loc>` exactly |
| OG + Twitter | `og:site_name`, `og:locale`, `og:image:alt`, `article:*` on articles | `article:published_time`, `article:modified_time`, `article:section`, `article:author` on all 23 guides |
| theme-color | `#020617` | homepage (PWA chrome) |

## Structured data inventory (`npm run seo:validate`)

| Page type | Schema | Required fields enforced |
|---|---|---|
| `/` (index.html) | `@graph`: `WebSite` + `ProfilePage` + `Person` (with `knowsAbout[13]`, `sameAs`, `worksFor`, `email`) | url, name, publisher, mainEntity |
| `faq.html` | `FAQPage` (9 questions) + `about[]` + `author` + `BreadcrumbList` | mainEntity × every question |
| 23 articles (`/Blogs/*.html`) | `BlogPosting` (dates, image, keywords, section, wordCount, author, publisher+logo, `isPartOf` Blog) + `BreadcrumbList` | headline, description, author, datePublished, url |
| 8 hub pages (`/Sub_Pages/*.html`) | `CollectionPage` (blog hub carries `hasPart` → `ItemList` of all 23 articles) + `BreadcrumbList` | url, name |
| Skills / Resume | `ProfilePage` + `mainEntity: Person` + `BreadcrumbList` | mainEntity, name |
| Generators | `tools/enrich-blog-schema.mjs`, `tools/enrich-hub-schema.mjs` (idempotent) | `npm run seo:blogs`, `npm run seo:hubs` |

## Keyword strategy

**Primary (person + flagship skills):** Akash Nagapure · Microsoft Intune architect · SCCM administrator · MECM engineer · VMware Horizon architect · Azure Virtual Desktop expert · Windows 365 Cloud PC · Windows Autopilot specialist · enterprise fleet architect · EUC specialist.

**Secondary (per article section):** Intune compliance policies · deployment rings · Win32 app packaging · Autopilot troubleshooting · Autopatch & rebootless Hotpatching · SCCM content distribution · application model · hardware inventory · OSD engineering · patch management lifecycle · co-management migration guardrails · FSLogix profile containers · AVD host pool scaling · VMware DEM · Horizon instant clones · Microsoft Graph PowerShell automation · Intune reporting · remediation scripts · device inventory · zero-trust endpoint security.

**Long-tail / question queries (FAQ + AEO targets):** "who is Akash Nagapure" · "Intune compliance policy architecture" · "Autopilot deployment errors fix" · "SCCM content distribution troubleshooting" · "Win32 app packaging Intune" · "Windows Autopatch rebootless Hotpatch guide" · "PowerShell Graph Intune reporting" · "FSLogix profile containers AVD" · "VMware Horizon instant clones best practices" · "Hexaware Intune fleet architect".

Rules: keywords go in `meta keywords` + `article:` tags + JSON-LD `keywords`/`knowsAbout`/`about`; never keyword-stuff visible copy.

## robots.txt

`User-agent: *` is allowed everything except the noindex utility pages and template partials. AI/LLM crawlers are **explicitly listed** per engine family (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, Claude-SearchBot, anthropic-ai, PerplexityBot, Perplexity-User, Google-Extended, GoogleOther, Applebot(+Extended), Bingbot, DuckAssistBot, Amazonbot, meta-externalagent, FacebookBot, Bytespider, cohere-ai, MistralAI-User, YouBot, AI2Bot, Timpibot, CCBot). Sitemap advertised at the bottom. See `docs/AEO.md` for the crawler matrix.

## llms.txt (AI discovery file)

`public/llms.txt` + `public/llms-full.txt` follow the [llms.txt](https://llmstxt.org) convention: author E-E-A-T block, core pages, all 10 topic hubs and all 23 articles grouped by family, plus crawling & citation policy. Generated by `tools/build-llms-txt.mjs` (`npm run llms`, `npm run llms:check`); always regenerated when a page is added/renamed.

## Performance SEO (unchanged)

- AVIF images with GIF fallbacks, `loading="lazy"` offscreen, `fetchpriority="high"` on hero
- Preconnect to Google Fonts; defer/async third-party scripts
- `Cache-Control: no-cache` on `.html` via `vercel.json` (fresh content always wins over stale SERP snapshots)

## Validation & monitoring

- `npm run seo:check` = sitemap drift + llms drift + JSON-LD validity (run before every release)
- Google Search Console: submit `sitemap.xml`, watch Coverage + Enhancements (FAQ/Article/Breadcrumb reports) + Core Web Vitals
- Rich Results Test + Schema Markup Validator on: `/`, `/faq.html`, one article per section, one hub page
- Monthly: re-run `npm run sitemap` + `npm run llms` so `lastmod` stays truthful
