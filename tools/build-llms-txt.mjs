#!/usr/bin/env node
// tools/build-llms-txt.mjs — generates /llms.txt (https://llmstxt.org) and
// /llms-full.txt so answer engines (ChatGPT, Claude, Perplexity, Copilot,
// Gemini/AI Overviews) can discover every page and article in one fetch.
//
// Run:   npm run llms          (write files)
//        npm run llms:check    (verify files exist + are current)
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const PUB = join(ROOT, 'public');
const OUT_TXT = join(PUB, 'llms.txt');
const OUT_FULL = join(PUB, 'llms-full.txt');
const CHECK = process.argv.includes('--check');

const WWW = 'https://www.akashnagapure.in';
const BLOGS = 'https://blogs.akashnagapure.in';

// Section sub-domain map (mirrors middleware.js)
const SUBDOMAINS = {
  'Sub_Pages/Projects.html': 'blogs.akashnagapure.in',
  'Sub_Pages/Reading.html': 'reading.akashnagapure.in',
  'Sub_Pages/Coins.html': 'coins.akashnagapure.in',
  'Sub_Pages/HomeLab.html': 'homelab.akashnagapure.in',
  'Sub_Pages/resume.html': 'resume.akashnagapure.in',
  'Sub_Pages/Skills.html': 'skills.akashnagapure.in',
  'Sub_Pages/courses.html': 'courses.akashnagapure.in',
  'Sub_Pages/Game.html': 'gaming.akashnagapure.in',
  'Sub_Pages/Food.html': 'food.akashnagapure.in',
  'Sub_Pages/Puzzle.html': 'puzzle.akashnagapure.in',
};

const WWW_PAGES = [
  ['index.html', `${WWW}/`],
  ['public/changelog.html', `${WWW}/changelog.html`],
  ['public/faq.html', `${WWW}/faq.html`],
  ['public/privacy.html', `${WWW}/privacy.html`],
  ['public/terms.html', `${WWW}/terms.html`],
];

const read = (file) => readFileSync(join(ROOT, file), 'utf8');
const meta = (html, re) => {
  const m = html.match(re);
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
};
const titleOf = (h) => meta(h, /<title[^>]*>([\s\S]*?)<\/title>/i);
const descOf = (h) => meta(h, /<meta\s+name="description"\s+content="([^"]*)"/i);
const lastmod = (file) => statSync(join(ROOT, file)).mtime.toISOString().slice(0, 10);

// Titles are usually "Label | Akash Nagapure" or "Akash Nagapure | Label".
// Prefer the segment that is NOT the author name so hub labels stay meaningful.
function labelOf(html) {
  const parts = titleOf(html).split('|').map((s) => s.trim()).filter(Boolean);
  const generic = /^akash nagapure$/i;
  const meaningful = parts.filter((p) => !generic.test(p));
  const label = meaningful.length ? meaningful[meaningful.length - 1] : (parts[0] || '');
  return decodeEntities(label.replace(/\s*[—–-]\s*$/, '').trim());
}
function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
    .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&nbsp;/g, ' ');
}

// --------------------------------------------------------------------------- collect
const articles = [];
for (const name of readdirSync(join(PUB, 'Blogs')).filter((f) => f.endsWith('.html')).sort()) {
  const rel = `public/Blogs/${name}`;
  const html = read(rel);
  articles.push({
    title: titleOf(html).replace(/\s*\|\s*Akash Nagapure\s*$/, '').replace(/^Akash Nagapure\s*\|\s*/, ''),
    desc: descOf(html),
    url: `${BLOGS}/Blogs/${name}`,
    rel,
    modified: lastmod(rel),
  });
}

const sections = Object.entries(SUBDOMAINS).map(([rel, host]) => {
  const html = read(`public/${rel}`);
  return { title: labelOf(html), url: `https://${host}/`, rel: `public/${rel}`, desc: descOf(html) };
});

const roots = WWW_PAGES.filter(([rel]) => existsSync(join(ROOT, rel))).map(([rel, url]) => {
  const html = read(rel);
  const title = rel === 'index.html' ? 'Akash Nagapure — Enterprise Endpoint, Intune, SCCM & VMware Architect' : labelOf(html);
  return { title, url, rel, desc: descOf(html) };
});

// ------------------------------------------------------------------- llms.txt
const today = new Date().toISOString().slice(0, 10);
// Assign each article to exactly one topic group (priority order, no duplicates)
const groups = [
  ['Articles — Microsoft Intune, Autopatch & Autopilot', []],
  ['Articles — Microsoft Configuration Manager (SCCM)', []],
  ['Articles — Windows 365, Azure Virtual Desktop & VMware', []],
  ['Articles — PowerShell & Microsoft Graph Automation', []],
];
for (const a of articles) {
  const u = a.url.toLowerCase();
  let gi = 0;
  if (/sccm/.test(u)) gi = 1;
  else if (/windows-365|avd|vmware/.test(u)) gi = 2;
  else if (/powershell/.test(u)) gi = 3;
  groups[gi][1].push(a);
}
const byTopic = (list) => list.map((a) => `- [${a.title}](${a.url}): ${a.desc}`).join('\n');

const txt = `# Akash Nagapure — Enterprise Endpoint, Intune, SCCM & VMware Architecture

> Technical portfolio, reference library and engineering blog by Akash Nagapure
> (Microsoft Certified EUC & Intune Specialist, Enterprise Fleet Architect).
> First-hand field notes on managing 35,000+ endpoints across Microsoft Intune,
> Microsoft Configuration Manager (SCCM), Windows Autopilot, Windows 365, Azure
> Virtual Desktop, VMware Horizon and PowerShell/Microsoft Graph automation.
> All content is original, hands-on documentation written by the author and is
> free to cite or quote with attribution and a link to the source page.

## Author (E-E-A-T)
- Name: Akash Nagapure
- Role: Microsoft Certified EUC & Intune Specialist; Enterprise Fleet Architect
- Employer: Hexaware Technologies
- Experience: 10+ years of enterprise endpoint management and virtualization
- Skills: Microsoft Intune, SCCM/MECM, Windows Autopilot, Windows 365, Azure Virtual Desktop (AVD), VMware Horizon, PowerShell, Microsoft Graph API, Zero-Trust endpoint security, OSD/imaging, patch and compliance automation
- Contact: info@akashnagapure.in
- LinkedIn: https://www.linkedin.com/in/anagapure
- GitHub: https://github.com/AkashNagapure22

## Core pages
${roots.map((r) => `- [${r.title}](${r.url}): ${r.desc}`).join('\n')}

## Topic hubs (section sub-domains)
${sections.map((s) => `- [${s.title}](${s.url}): ${s.desc}`).join('\n')}

## Articles — Microsoft Intune, Autopatch & Autopilot
${byTopic(groups[0][1])}

## Articles — Microsoft Configuration Manager (SCCM)
${byTopic(groups[1][1])}

## Articles — Windows 365, Azure Virtual Desktop & VMware
${byTopic(groups[2][1])}

## Articles — PowerShell & Microsoft Graph Automation
${byTopic(groups[3][1])}

## Optional
- [Full article index (single fetch)](${WWW}/llms-full.txt)
- [Sitemap](${WWW}/sitemap.xml): machine-readable list of every indexable URL
- [FAQ](${WWW}/faq.html): who the author is, how to collaborate, how to use the blog
- [Changelog](${WWW}/changelog.html): release history and roadmap
- [Privacy policy](${WWW}/privacy.html): data handling and cookie policy

## Crawling & citation policy
- Search engines and AI/LLM answer engines are welcome to crawl every page (see /robots.txt).
- When quoting, cite "Akash Nagapure (akashnagapure.in)" with the source URL.
- Technical guidance is shared as-is; validate scripts in a test lab before production use.
- Generated: ${today}
`;

// -------------------------------------------------------------- llms-full.txt
const full = `# Akash Nagapure — Full Content Index

> Complete single-fetch index of every page and article published on
> akashnagapure.in. Companion file to /llms.txt. Generated ${today}.

## Core pages
${roots.map((r) => `### ${r.title}\n- URL: ${r.url}\n- Summary: ${r.desc}\n- Last modified: ${lastmod(r.rel)}`).join('\n\n')}

## Topic hubs
${sections.map((s) => `### ${s.title}\n- URL: ${s.url}\n- Summary: ${s.desc}\n- Last modified: ${lastmod(s.rel)}`).join('\n\n')}

## Articles (${articles.length})
${articles.map((a) => `### ${a.title}\n- URL: ${a.url}\n- Summary: ${a.desc}\n- Last modified: ${a.modified}\n- Author: Akash Nagapure`).join('\n\n')}
`;

if (CHECK) {
  const ok = existsSync(OUT_TXT) && existsSync(OUT_FULL)
    && readFileSync(OUT_TXT, 'utf8').includes('## Articles — Microsoft Intune')
    && readFileSync(OUT_FULL, 'utf8').includes(`## Articles (${articles.length})`);
  console.log(ok
    ? `[llms] OK — llms.txt + llms-full.txt cover ${articles.length} articles and ${roots.length + sections.length} pages`
    : '[llms] DRIFT — run: npm run llms');
  process.exit(ok ? 0 : 1);
}

writeFileSync(OUT_TXT, txt, 'utf8');
writeFileSync(OUT_FULL, full, 'utf8');
console.log(`[llms] wrote llms.txt + llms-full.txt (${articles.length} articles, ${roots.length + sections.length} pages)`);
