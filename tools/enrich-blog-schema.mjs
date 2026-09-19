#!/usr/bin/env node
// tools/enrich-blog-schema.mjs — upgrades every BlogPosting JSON-LD block in
// public/Blogs/*.html to the full article-rich-result shape and adds a
// BreadcrumbList plus SEO meta tags. Idempotent: re-run after adding articles.
//
// Run: npm run seo:blogs
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const DIR = join(ROOT, 'public', 'Blogs');
const WWW = 'https://www.akashnagapure.in';
const AUTHOR_IMG = `${WWW}/Main_page_data/akash_profile_1781110763642.avif`;
const LOGO = `${WWW}/Main_page_data/Logo.gif`;

const CATEGORY = [
  [/sccm|mecm/i, 'Microsoft Configuration Manager (SCCM)'],
  [/windows-365/i, 'Windows 365'],
  [/avd-/i, 'Azure Virtual Desktop'],
  [/vmware/i, 'VMware Horizon'],
  [/powershell/i, 'PowerShell & Microsoft Graph'],
  [/autopatch|intune|autopilot|win32/i, 'Microsoft Intune'],
];

const KEYWORDS = {
  'Microsoft Intune': 'Microsoft Intune, Intune administration, endpoint management, Windows Autopilot, Win32 app packaging, compliance policies, deployment rings, MDM, MEM, Intune troubleshooting',
  'Windows 365': 'Windows 365, Cloud PC, Windows 365 Enterprise, provisioning policy, Cloud PC monitoring, Intune, endpoint management',
  'Microsoft Configuration Manager (SCCM)': 'SCCM, MECM, Microsoft Configuration Manager, content distribution, application model, hardware inventory, OSD, patch management, client health, Intune migration',
  'Azure Virtual Desktop': 'Azure Virtual Desktop, AVD, FSLogix profile containers, host pool scaling, session hosts, virtual desktop infrastructure, Azure, Intune',
  'VMware Horizon': 'VMware Horizon, instant clones, DEM, Dynamic Environment Manager, profile management, VDI, virtual desktop, VMware vSphere',
  'PowerShell & Microsoft Graph': 'PowerShell, Microsoft Graph API, automation, Intune reporting, remediation scripts, device inventory, compliance automation, enterprise scripting',
};

const eolOf = (t) => ((t.match(/\r\n/g) || []).length > (t.match(/(?<!\r)\n/g) || []).length ? '\r\n' : '\n');

function gitDate(file, mode) {
  try {
    const cmd = mode === 'created'
      ? `git log --diff-filter=A --format=%ad --date=short -1 -- "${file}"`
      : `git log -1 --format=%ad --date=short -- "${file}"`;
    const out = execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim().split('\n')[0];
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : '';
  } catch { return ''; }
}

function wordCount(html) {
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ');
  return body.split(/\s+/).filter(Boolean).length;
}

const files = readdirSync(DIR).filter((f) => f.endsWith('.html')).sort();
let updated = 0;

for (const name of files) {
  const rel = `public/Blogs/${name}`;
  const path = join(DIR, name);
  let html = readFileSync(path, 'utf8');
  const eol = eolOf(html);

  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [, name])[1].trim();
  const headline = title.replace(/\s*\|\s*Akash Nagapure\s*$/i, '').trim();
  const description = (html.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || [, ''])[1].trim();
  const canonical = (html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i) || [, ''])[1].trim();
  const image = (html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) || [, AUTHOR_IMG])[1].trim();

  const section = (CATEGORY.find(([re]) => re.test(name)) || [, 'Enterprise Endpoint Management'])[1];
  const published = gitDate(rel, 'created') || gitDate(rel, 'modified') || statSync(path).mtime.toISOString().slice(0, 10);
  const modified = gitDate(rel, 'modified') || published;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline,
    description,
    url: canonical,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    datePublished: published,
    dateModified: modified,
    image: [image],
    articleSection: section,
    keywords: KEYWORDS[section] || '',
    wordCount: wordCount(html),
    inLanguage: 'en',
    author: {
      '@type': 'Person',
      name: 'Akash Nagapure',
      jobTitle: 'Microsoft Certified EUC & Intune Specialist',
      url: `${WWW}/`,
      sameAs: ['https://www.linkedin.com/in/anagapure', 'https://github.com/AkashNagapure22'],
    },
    publisher: {
      '@type': 'Organization',
      name: 'Akash Nagapure',
      url: `${WWW}/`,
      logo: { '@type': 'ImageObject', url: LOGO },
    },
    isPartOf: {
      '@type': 'Blog',
      name: 'Akash Nagapure — Enterprise Technical Blog',
      url: 'https://blogs.akashnagapure.in/',
    },
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${WWW}/` },
      { '@type': 'ListItem', position: 2, name: 'Technical Blogs', item: 'https://blogs.akashnagapure.in/' },
      { '@type': 'ListItem', position: 3, name: headline, item: canonical },
    ],
  };

  const pad = (obj) => JSON.stringify(obj, null, 2).split('\n').map((l, i) => (i === 0 ? l : '  ' + l)).join(eol);
  const managed =
    '<!-- seo:managed:start -->' + eol +
    '<script type="application/ld+json">' + eol +
    pad(schema) + eol +
    '</script>' + eol +
    '<script type="application/ld+json">' + eol +
    pad(breadcrumb) + eol +
    '</script>' + eol +
    '<!-- seo:managed:end -->';

  if (html.includes('<!-- seo:managed:start -->')) {
    html = html.replace(/<!-- seo:managed:start -->[\s\S]*?<!-- seo:managed:end -->/, managed);
  } else {
    const blockRe = /<script[^>]*application\/ld\+json[^>]*>[\s\S]*?<\/script>/i;
    if (!blockRe.test(html)) { console.warn(`[skip] ${rel} — no JSON-LD block`); continue; }
    html = html.replace(blockRe, managed);
  }

  const metaTags = [
    '<meta name="author" content="Akash Nagapure" />',
    '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />',
    `<meta name="keywords" content="${KEYWORDS[section] || ''}" />`,
    `<meta property="article:published_time" content="${published}" />`,
    `<meta property="article:modified_time" content="${modified}" />`,
    '<meta property="article:author" content="Akash Nagapure" />',
    `<meta property="article:section" content="${section}" />`,
  ].join(eol);

  if (html.includes('<!-- seo:meta:start -->')) {
    html = html.replace(/<!-- seo:meta:start -->[\s\S]*?<!-- seo:meta:end -->/, `<!-- seo:meta:start -->${eol}${metaTags}${eol}<!-- seo:meta:end -->`);
  } else {
    html = html.replace(/<\/head>/i, `<!-- seo:meta:start -->${eol}${metaTags}${eol}<!-- seo:meta:end -->${eol}</head>`);
  }

  writeFileSync(path, html, 'utf8');
  updated++;
}

console.log(`[seo:blogs] enriched ${updated} article(s)`);