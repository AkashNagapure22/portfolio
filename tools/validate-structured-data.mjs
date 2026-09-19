#!/usr/bin/env node
// tools/validate-structured-data.mjs — parses every application/ld+json block in
// every shipped page and fails if JSON is invalid or a required field is missing.
//
// Run: npm run seo:validate
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const PUB = join(ROOT, 'public');

function listHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { listHtml(p, out); continue; }
    if (/\.html$/i.test(name) && !/template/i.test(p)) out.push(p);
  }
  return out;
}

const files = [join(ROOT, 'index.html'), ...listHtml(PUB)];
const problems = [];
let blocks = 0;
const types = new Map();

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const rel = relative(ROOT, file).replace(/\\/g, '/');
  const re = /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    blocks++;
    let data;
    try {
      data = JSON.parse(m[1].trim());
    } catch (e) {
      problems.push(`${rel}: invalid JSON-LD (${e.message})`);
      continue;
    }
    const nodes = Array.isArray(data) ? data : [data];
    const hadGraph = nodes.some((n) => n && Array.isArray(n['@graph']));
    const flat = [];
    for (const node of nodes) {
      if (node && Array.isArray(node['@graph'])) {
        for (const g of node['@graph']) flat.push(g);
      } else {
        flat.push(node);
      }
    }
    for (const node of flat) {
      const t = node['@type'] || '(no @type)';
      types.set(t, (types.get(t) || 0) + 1);
      // @context is only required on top-level blocks (@graph members inherit it)
      if (!node['@context'] && !hadGraph) problems.push(`${rel}: ${t} missing @context`);

      // required fields per schema type
      const req = {
        FAQPage: ['mainEntity'],
        BlogPosting: ['headline', 'description', 'author', 'datePublished', 'url'],
        ProfilePage: ['mainEntity'],
        WebSite: ['url', 'name', 'publisher'],
        BreadcrumbList: ['itemListElement'],
        Person: ['name'],
      }[t] || [];
      for (const f of req) {
        if (node[f] === undefined) problems.push(`${rel}: ${t} missing "${f}"`);
      }
      // noindex pages must not ship structured data that promises indexing
      if (/noindex/i.test(html) && ['BlogPosting', 'FAQPage', 'WebSite'].includes(t)) {
        problems.push(`${rel}: ${t} present on a noindex page`);
      }
    }
  }
}

console.log(`[seo] scanned ${files.length} pages — ${blocks} JSON-LD block(s)`);
for (const [t, n] of [...types.entries()].sort()) console.log(`  ${t}: ${n}`);

if (problems.length) {
  console.error(`\n[seo] ${problems.length} problem(s):`);
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
console.log('[seo] OK — all structured data valid');
