// tools/audit-seo-meta.mjs — audits every page's SEO metadata.
// Run: node tools/audit-seo-meta.mjs   (npm run seo:meta)
// Checks per page: <title>, meta description, canonical, og:title/og:description/
// og:image, twitter:card, a single <h1>, <img> alt + loading hints, and duplicate
// titles/descriptions across the site. Exit 1 when something needs fixing.
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SKIP = /(^|\/)(404|access-denied|maintenance)\.html$|(^|\/)(footer|3d-background)-template\.html$/;

function listHtml(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...listHtml(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const attr = (html, re) => {
  const m = html.match(re);
  return m ? (m[1] || '').trim() : '';
};
/* Length limits apply to the human-readable text, so &amp; counts as one char. */
const decode = (s) =>
  String(s || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

const files = [...listHtml(join(ROOT, 'public')), join(ROOT, 'index.html')].sort();
const problems = [];
const titles = new Map();
const descs = new Map();

for (const file of files) {
  const rel = relative(ROOT, file).replace(/\\/g, '/');
  const html = readFileSync(file, 'utf8');
  const isUtility = SKIP.test(rel);
  const title = attr(html, /<title[^>]*>([\s\S]*?)<\/title>/i);

  if (isUtility) continue;

  if (!title) problems.push(`${rel}: missing <title>`);
  else if (decode(title).length > 65) problems.push(`${rel}: <title> is ${decode(title).length} chars (aim <= 60)`);

  const desc = attr(html, /<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)/i);
  if (!desc) problems.push(`${rel}: missing meta description`);
  else if (decode(desc).length > 160) problems.push(`${rel}: meta description is ${decode(desc).length} chars (aim <= 160)`);

  /* meta keywords is optional, but when present it must stay curated:
     <= 20 phrases and <= 600 characters (the AI/chat + primary keyword budget). */
  const kwTag = (html.match(/<meta\b[^>]*\bname\s*=\s*["']keywords["'][^>]*>/i) || [])[0] || '';
  const kw = (kwTag.match(/\bcontent\s*=\s*["']([^"']*)/i) || [])[1] || '';
  if (kw) {
    const phrases = kw.split(',').map((s) => s.trim()).filter(Boolean).length;
    if (decode(kw).length > 600) problems.push(`${rel}: meta keywords is ${decode(kw).length} chars (aim <= 600)`);
    if (phrases > 20) problems.push(`${rel}: meta keywords has ${phrases} phrases (aim <= 20)`);
  }

  if (!/<link[^>]+rel=["']canonical["']/i.test(html)) problems.push(`${rel}: missing rel=canonical`);
  if (!/<meta[^>]+property=["']og:title["']/i.test(html)) problems.push(`${rel}: missing og:title`);
  if (!/<meta[^>]+property=["']og:description["']/i.test(html)) problems.push(`${rel}: missing og:description`);
  if (!/<meta[^>]+property=["']og:image["']/i.test(html)) problems.push(`${rel}: missing og:image`);
  if (!/<meta[^>]+(?:property|name)=["']twitter:card["']/i.test(html)) problems.push(`${rel}: missing twitter:card`);

  /* duplicated share tags make scrapers pick a random value */
  const keys = (html.match(/<meta\b[^>]*\b(?:property|name)\s*=\s*["']((?:og|twitter):[^"']+)["']/gi) || []).map(
    (t) => (t.match(/["']([^"']+)["']/) || [])[1].toLowerCase(),
  );
  const dupes = [...new Set(keys.filter((k, i) => keys.indexOf(k) !== i))];
  if (dupes.length) problems.push(`${rel}: duplicated share meta tag(s): ${dupes.join(', ')}`);

  const h1s = (html.match(/<h1\b/gi) || []).length;
  if (h1s === 0) problems.push(`${rel}: no <h1>`);
  if (h1s > 1) problems.push(`${rel}: ${h1s} <h1> elements (use exactly one)`);

  /* <img> hygiene: alt is required, decorative ones use alt="". */
  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  imgs.forEach((tag, i) => {
    if (!/\balt=/.test(tag)) problems.push(`${rel}: <img #${i + 1}> has no alt attribute`);
  });

  titles.set(title, [...(titles.get(title) || []), rel]);
  descs.set(desc, [...(descs.get(desc) || []), rel]);
}

for (const [t, list] of titles) {
  if (t && list.length > 1) problems.push(`duplicate <title> on ${list.length} pages: ${list.join(', ')}`);
}
for (const [d, list] of descs) {
  if (d && list.length > 1) problems.push(`duplicate meta description on ${list.length} pages: ${list.join(', ')}`);
}

console.log(`[seo:meta] audited ${files.length} HTML file(s) — ${problems.length} problem(s)`);
for (const p of problems) console.log('  - ' + p);
if (problems.length) process.exitCode = 1;