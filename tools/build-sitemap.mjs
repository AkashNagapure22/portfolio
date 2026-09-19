#!/usr/bin/env node
// tools/build-sitemap.mjs — generates public/sitemap.xml for every indexable
// page across the domain family (www + 10 section sub-domains + blogs).
//
// Run:   npm run sitemap          (write sitemap.xml)
//        npm run sitemap:check    (verify every indexable page is listed)
//
// Exclusion rules (kept in sync with each page's <meta name="robots">):
//   - pages with "noindex" are skipped (404, access-denied, maintenance)
//   - template partials without a canonical URL are skipped
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const PUB = join(ROOT, 'public');
const OUT = join(PUB, 'sitemap.xml');
const CHECK = process.argv.includes('--check');
const WWW = 'https://www.akashnagapure.in';
const BLOGS = 'blogs.akashnagapure.in';

// Section sub-domain map (mirrors middleware.js): [host, priority, changefreq]
const SUBDOMAINS = {
  'Sub_Pages/Projects.html': ['blogs.akashnagapure.in', '0.9', 'weekly'],
  'Sub_Pages/Reading.html': ['reading.akashnagapure.in', '0.6', 'monthly'],
  'Sub_Pages/Coins.html': ['coins.akashnagapure.in', '0.6', 'monthly'],
  'Sub_Pages/HomeLab.html': ['homelab.akashnagapure.in', '0.7', 'monthly'],
  'Sub_Pages/resume.html': ['resume.akashnagapure.in', '0.7', 'monthly'],
  'Sub_Pages/Skills.html': ['skills.akashnagapure.in', '0.7', 'monthly'],
  'Sub_Pages/courses.html': ['courses.akashnagapure.in', '0.7', 'monthly'],
  'Sub_Pages/Game.html': ['gaming.akashnagapure.in', '0.6', 'monthly'],
  'Sub_Pages/Food.html': ['food.akashnagapure.in', '0.6', 'monthly'],
  'Sub_Pages/Puzzle.html': ['puzzle.akashnagapure.in', '0.6', 'monthly'],
};

// www root pages: [priority, changefreq]
const WWW_PAGES = {
  'index.html': ['0.9', 'weekly'],
  'public/changelog.html': ['0.7', 'weekly'],
  'public/faq.html': ['0.7', 'monthly'],
  'public/privacy.html': ['0.2', 'yearly'],
  'public/terms.html': ['0.2', 'yearly'],
};

const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');
const canonicalOf = (html) => (html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i) || [])[1] || '';
const isNoindex = (html) => /<meta\s+name="robots"[^>]*noindex/i.test(html);
const lastmod = (rel) => statSync(join(ROOT, rel)).mtime.toISOString().slice(0, 10);

const entries = [];
const skipped = [];

for (const [rel, [priority, changefreq]] of Object.entries(WWW_PAGES)) {
  if (!existsSync(join(ROOT, rel))) { skipped.push(`${rel} (missing)`); continue; }
  const html = read(rel);
  const loc = canonicalOf(html) || `${WWW}/${rel.replace(/^public\//, '').replace(/^index\.html$/, '')}`;
  entries.push({ loc, lastmod: lastmod(rel), changefreq, priority, host: 'www.akashnagapure.in' });
}

for (const [rel, [host, priority, changefreq]] of Object.entries(SUBDOMAINS)) {
  const full = `public/${rel}`;
  if (!existsSync(join(ROOT, full))) { skipped.push(`${full} (missing)`); continue; }
  const html = read(full);
  if (isNoindex(html)) { skipped.push(`${full} (noindex)`); continue; }
  entries.push({ loc: canonicalOf(html) || `https://${host}/`, lastmod: lastmod(full), changefreq, priority, host });
}

for (const name of readdirSync(join(PUB, 'Blogs')).filter((f) => f.endsWith('.html')).sort()) {
  const rel = `public/Blogs/${name}`;
  const html = read(rel);
  if (isNoindex(html)) { skipped.push(`${rel} (noindex)`); continue; }
  entries.push({ loc: canonicalOf(html) || `https://${BLOGS}/Blogs/${name}`, lastmod: lastmod(rel), changefreq: 'monthly', priority: '0.8', host: BLOGS });
}

// safety net: any other indexable top-level page with a canonical + no noindex
for (const name of readdirSync(PUB).filter((f) => f.endsWith('.html'))) {
  const rel = `public/${name}`;
  if (entries.some((e) => e.loc === `${WWW}/${name}`)) continue;
  const html = read(rel);
  if (isNoindex(html) || !canonicalOf(html)) { skipped.push(`${rel} (no canonical/noindex)`); continue; }
  entries.push({ loc: canonicalOf(html), lastmod: lastmod(rel), changefreq: 'monthly', priority: '0.5', host: 'www.akashnagapure.in' });
}

for (const t of ['public/template/footer-template.html', 'public/template/3d-background-template.html']) {
  if (existsSync(join(ROOT, t))) skipped.push(`${t} (template)`);
}

// www first, then blogs, then sub-domain hubs
const hostOrder = ['www.akashnagapure.in', BLOGS];
entries.sort((a, b) => {
  const an = hostOrder.indexOf(a.host), bn = hostOrder.indexOf(b.host);
  const av = an === -1 ? 99 : an, bv = bn === -1 ? 99 : bn;
  if (av !== bv) return av - bv;
  if (a.host !== b.host) return a.host.localeCompare(b.host);
  return a.loc.localeCompare(b.loc);
});

function groupByHost(list) {
  const out = [];
  let current = null;
  for (const e of list) {
    if (e.host !== current) { current = e.host; out.push(`  <!-- ${current} -->`); }
    out.push(`  <url><loc>${e.loc}</loc><lastmod>${e.lastmod}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`);
  }
  return out.join('\n');
}

const hosts = [...new Set(entries.map((e) => e.host))];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by tools/build-sitemap.mjs - do not edit by hand.
     Regenerate: npm run sitemap        Verify: npm run sitemap:check
     ${entries.length} URLs across ${hosts.length} hosts.
     Excluded on purpose: ${skipped.join(', ')} -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${groupByHost(entries)}
</urlset>
`;

if (CHECK) {
  const existing = existsSync(OUT) ? readFileSync(OUT, 'utf8') : '';
  const missing = entries.filter((e) => !existing.includes(`<loc>${e.loc}</loc>`));
  if (missing.length === 0) {
    console.log(`[sitemap] OK — all ${entries.length} indexable URLs present`);
    process.exit(0);
  }
  console.error(`[sitemap] DRIFT — ${missing.length} URL(s) missing from sitemap.xml:`);
  for (const m of missing) console.error('  - ' + m.loc);
  console.error('  run: npm run sitemap');
  process.exit(1);
}

writeFileSync(OUT, xml, 'utf8');
console.log(`[sitemap] wrote sitemap.xml — ${entries.length} URLs across ${hosts.length} hosts`);
console.log(`[sitemap] skipped: ${skipped.join(', ') || 'none'}`);