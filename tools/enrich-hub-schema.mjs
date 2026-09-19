#!/usr/bin/env node
// tools/enrich-hub-schema.mjs — normalises structured data on the section hub
// pages (public/Sub_Pages/*.html). Replaces the inconsistent BlogPosting /
// bare ProfilePage blocks with the correct type per page and adds breadcrumbs.
// Idempotent: re-run after editing a hub page.
//
// Run: npm run seo:hubs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const DIR = join(ROOT, 'public', 'Sub_Pages');
const BLOG_DIR = join(ROOT, 'public', 'Blogs');
const WWW = 'https://www.akashnagapure.in';
const LOGO = `${WWW}/Main_page_data/Logo.gif`;

// Per-page: schema type + the "about" topic + breadcrumb label
const CONFIG = {
  'Projects.html': { type: 'CollectionPage', about: 'Enterprise endpoint management, Microsoft Intune, SCCM and VMware guides', label: 'Technical Blogs' },
  'Skills.html': { type: 'ProfilePage', about: 'Enterprise endpoint management and virtualization skills', label: 'Skills & Technical Arsenal' },
  'resume.html': { type: 'ProfilePage', about: 'Professional curriculum vitae', label: 'Resume / CV' },
  'courses.html': { type: 'CollectionPage', about: 'Professional certifications and technical training', label: 'Certifications & Training' },
  'HomeLab.html': { type: 'CollectionPage', about: 'Enterprise systems engineering homelab', label: 'HomeLab' },
  'Coins.html': { type: 'CollectionPage', about: 'Numismatic coin and banknote collecting', label: 'Coin Collection' },
  'Reading.html': { type: 'CollectionPage', about: 'Books and reading', label: 'Reading' },
  'Game.html': { type: 'CollectionPage', about: 'Gaming and puzzle documentation', label: 'Gaming' },
  'Food.html': { type: 'CollectionPage', about: 'Culinary and food exploration', label: 'Food' },
  'Puzzle.html': { type: 'CollectionPage', about: 'Speedcubing and mechanical puzzles', label: 'Speedcubing' },
};

const eolOf = (t) => ((t.match(/\r\n/g) || []).length > (t.match(/(?<!\r)\n/g) || []).length ? '\r\n' : '\n');
const gitDate = (rel) => {
  try {
    const out = execSync(`git log -1 --format=%ad --date=short -- "${rel}"`, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : '';
  } catch { return ''; }
};

const PERSON = {
  '@type': 'Person',
  name: 'Akash Nagapure',
  jobTitle: 'Microsoft Certified EUC & Intune Specialist',
  url: `${WWW}/`,
  sameAs: ['https://www.linkedin.com/in/anagapure', 'https://github.com/AkashNagapure22'],
  knowsAbout: ['Microsoft Intune', 'Microsoft Configuration Manager (SCCM)', 'Windows Autopilot', 'Windows 365', 'Azure Virtual Desktop', 'VMware Horizon', 'PowerShell automation', 'Microsoft Graph API', 'Zero-Trust endpoint security'],
};
const PUBLISHER = { '@type': 'Organization', name: 'Akash Nagapure', url: `${WWW}/`, logo: { '@type': 'ImageObject', url: LOGO } };

// Blog hub: list every published article so answer engines can traverse it
const articleList = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.html')).sort().map((f) => {
  const html = readFileSync(join(BLOG_DIR, f), 'utf8');
  const url = (html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i) || [, ''])[1];
  const name = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, f])[1].replace(/\s*\|\s*Akash Nagapure\s*$/i, '').trim();
  return { '@type': 'BlogPosting', headline: name, url };
});

let updated = 0;
for (const [name, cfg] of Object.entries(CONFIG)) {
  const rel = `public/Sub_Pages/${name}`;
  const path = join(DIR, name);
  let html;
  try { html = readFileSync(path, 'utf8'); } catch { console.warn(`[skip] ${rel} — not found`); continue; }
  const eol = eolOf(html);

  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, name])[1].replace(/\s+/g, ' ').trim();
  const description = (html.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || [, ''])[1].replace(/\s+/g, ' ').trim();
  const canonical = (html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i) || [, ''])[1].trim();
  const modified = gitDate(rel);

  const page = {
    '@context': 'https://schema.org',
    '@type': cfg.type,
    name: title,
    description,
    url: canonical,
    inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', name: 'Akash Nagapure', url: `${WWW}/` },
    about: { '@type': 'Thing', name: cfg.about },
    author: PERSON,
    publisher: PUBLISHER,
  };
  if (modified) page.dateModified = modified;

  if (cfg.type === 'ProfilePage') {
    page.mainEntity = { ...PERSON, '@type': 'Person' };
  }
  if (name === 'Projects.html') {
    page.hasPart = { '@type': 'ItemList', numberOfItems: articleList.length, itemListElement: articleList };
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${WWW}/` },
      { '@type': 'ListItem', position: 2, name: cfg.label, item: canonical },
    ],
  };

  const pad = (obj) => JSON.stringify(obj, null, 2).split('\n').map((l, i) => (i === 0 ? l : '  ' + l)).join(eol);
  const managed =
    '<!-- seo:managed:start -->' + eol +
    '<script type="application/ld+json">' + eol + pad(page) + eol + '</script>' + eol +
    '<script type="application/ld+json">' + eol + pad(breadcrumb) + eol + '</script>' + eol +
    '<!-- seo:managed:end -->';

  if (html.includes('<!-- seo:managed:start -->')) {
    html = html.replace(/<!-- seo:managed:start -->[\s\S]*?<!-- seo:managed:end -->/, managed);
  } else {
    const blockRe = /<script[^>]*application\/ld\+json[^>]*>[\s\S]*?<\/script>/i;
    if (blockRe.test(html)) {
      html = html.replace(blockRe, managed);
    } else if (/<\/head>/i.test(html)) {
      html = html.replace(/<\/head>/i, managed + eol + '</head>');
    } else { console.warn(`[skip] ${rel} — no </head> to inject into`); continue; }
  }

  writeFileSync(path, html, 'utf8');
  updated++;
}

console.log(`[seo:hubs] normalised ${updated} hub page(s) — blog hub lists ${articleList.length} articles`);