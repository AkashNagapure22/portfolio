// tools/fix-seo-meta.mjs — one-shot metadata repair for every page.
// Run: node tools/fix-seo-meta.mjs
//   1) removes duplicated Open Graph / Twitter <meta> tags (keep the first)
//   2) fills in any missing og:* / twitter:* tag from <title>, meta description
//      and rel=canonical (so shares and AI answer engines get complete cards)
//   3) applies the hand-written snippet rewrites in REWRITES (over-long titles
//      and descriptions that Google would truncate)
// Verify afterwards with: node tools/audit-seo-meta.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const DEFAULT_OG_IMAGE = 'https://www.akashnagapure.in/Main_page_data/akash_profile_1781110763642.avif';
const SKIP = /(^|\/)(404|access-denied|maintenance)\.html$|(^|\/)(footer|3d-background)-template\.html$/;

/* Over-long snippets Google truncates in the SERP. */
const REWRITES = {
  'index.html': {
    description:
      'Portfolio of Akash Nagapure — Enterprise Fleet Architect for Microsoft Intune, SCCM, Windows Autopilot, Windows 365, AVD and VMware at 35,000+ endpoints.',
  },
  'public/faq.html': {
    title: 'FAQ | Akash Nagapure — Intune, SCCM &amp; VMware Answers',
    description:
      'Answers from Akash Nagapure, Microsoft Certified EUC &amp; Intune Specialist: the technologies he covers, how to collaborate, and how to use the blog + newsletter.',
  },
  'public/Sub_Pages/HomeLab.html': {
    description:
      'Explore the enterprise systems engineering and self-hosted homelab environment of Akash Nagapure: MECM, Intune, VMware ESXi and Active Directory.',
  },
  'public/Sub_Pages/Projects.html': {
    description:
      'Explore in-depth tutorials and expert insights on Microsoft Intune, Configuration Manager, AVD, VMware, and cloud technologies by Akash Nagapure.',
  },
  'public/Sub_Pages/courses.html': {
    description:
      'Professional certifications, academy courses, and specialised technical training completed by Akash Nagapure across Microsoft, Pluralsight and Udemy.',
  },
};

function listHtml(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...listHtml(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const escapeAttr = (s) => String(s).replace(/"/g, '&quot;');
const metaLine = (key, content, indent) => `${indent}<meta property="${key}" content="${escapeAttr(content)}" />`;

const files = [...listHtml(join(ROOT, 'public')), join(ROOT, 'index.html')].sort();
let changed = 0;

for (const file of files) {
  const rel = relative(ROOT, file).replace(/\\/g, '/');
  if (SKIP.test(rel)) continue;

  const raw = readFileSync(file, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const BOM = raw.startsWith('\uFEFF') ? '\uFEFF' : '';
  let lines = raw.replace(/^\uFEFF/, '').split(/\r?\n/);

  /* 1) drop duplicate og / twitter metas, keeping the first occurrence */
  const metaKey = (l) => {
    const m = l.match(/<meta\b[^>]*\b(?:property|name)\s*=\s*["']([^"']+)["']/i);
    if (!m || !/^(og|twitter):/i.test(m[1])) return null;
    return m[1].toLowerCase();
  };
  const seen = new Set();
  let removed = 0;
  lines = lines.filter((l) => {
    const k = metaKey(l);
    if (!k) return true;
    if (seen.has(k)) { removed++; return false; }
    seen.add(k);
    return true;
  });

const html = lines.join('\n');
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1];
  const desc = (html.match(/<meta\b[^>]*\bname\s*=\s*["']description["'][^>]*\bcontent\s*=\s*["']([^"']*)/i) || [])[1];
  const canonical = (html.match(/<link\b[^>]*\brel\s*=\s*["']canonical["'][^>]*\bhref\s*=\s*["']([^"']*)/i) || [])[1];
  const existing = (key) =>
    (html.match(new RegExp('<meta\\b[^>]*\\bproperty\\s*=\\s*["\']' + key + '["\'][^>]*\\bcontent\\s*=\\s*["\']([^"\']*)', 'i')) || [])[1];

  /* 2) build the tags that are still missing */
  const wanted = {
    'og:type': existing('og:type') || 'website',
    'og:site_name': existing('og:site_name') || 'Akash Nagapure',
    'og:url': existing('og:url') || canonical,
    'og:title': existing('og:title') || title,
    'og:description': existing('og:description') || desc,
    'og:image': existing('og:image') || DEFAULT_OG_IMAGE,
    'twitter:card': existing('twitter:card') || 'summary_large_image',
    'twitter:url': existing('twitter:url') || canonical,
    'twitter:title': existing('twitter:title') || title,
    'twitter:description': existing('twitter:description') || desc,
    'twitter:image': existing('twitter:image') || existing('og:image') || DEFAULT_OG_IMAGE,
  };

  /* 3) apply the hand-written snippet rewrites */
  const rw = REWRITES[rel] || {};
  if (rw.title) {
    const before = lines.join('\n');
    lines = lines.map((l) => (/<title[^>]*>/i.test(l) ? `  <title>${rw.title}</title>` : l));
    if (lines.join('\n') !== before) {
      ['og:title', 'twitter:title'].forEach((k) => {
        const idx = lines.findIndex((l) => new RegExp('(?:property|name)\\s*=\\s*["\']' + k + '["\']', 'i').test(l));
        if (idx >= 0) lines[idx] = lines[idx].replace(/content\s*=\s*["'][^"']*["']/i, `content="${escapeAttr(rw.title)}"`);
      });
    }
  }
  if (rw.description) {
    let done = false;
    lines = lines.map((l) => {
      if (!done && /<meta\b[^>]*\bname\s*=\s*["']description["']/i.test(l)) {
        done = true;
        return l.replace(/content\s*=\s*["'][^"']*["']/i, `content="${escapeAttr(rw.description)}"`);
      }
      return l;
    });
    ['og:description', 'twitter:description'].forEach((k) => {
      const idx = lines.findIndex((l) => new RegExp('(?:property|name)\\s*=\\s*["\']' + k + '["\']', 'i').test(l));
      if (idx >= 0) lines[idx] = lines[idx].replace(/content\s*=\s*["'][^"']*["']/i, `content="${escapeAttr(rw.description)}"`);
    });
  }

  /* 4) insert whatever is still missing, next to the other share tags */
  const have = new Set(
    (lines.join('\n').match(/<meta\b[^>]*\b(?:property|name)\s*=\s*["']([^"']+)["']/gi) || []).map((t) =>
      (t.match(/["']([^"']+)["']/) || [])[1].toLowerCase(),
    ),
  );
  const missing = Object.keys(wanted).filter((k) => !have.has(k) && wanted[k]);
  if (missing.length) {
    let at = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (/<meta\b[^>]*\b(?:property|name)\s*=\s*["'](?:og:|twitter:)/i.test(lines[i])) { at = i + 1; break; }
    }
    if (at < 0) at = lines.findIndex((l) => /<link\b[^>]*rel\s*=\s*["']canonical["']/i.test(l)) + 1;
    if (at <= 0) at = lines.findIndex((l) => /<\/head>/i.test(l));
    lines.splice(at, 0, ...missing.map((k) => metaLine(k, wanted[k], '  ')), '');
  }

  const out = BOM + lines.join(eol);
  if (out !== raw) {
    writeFileSync(file, out, 'utf8');
    changed++;
    console.log(`[seo:meta] ${rel} — deduped ${removed}, added ${missing.length}`);
  }
}

console.log(`[seo:meta] repaired ${changed} page(s)`);