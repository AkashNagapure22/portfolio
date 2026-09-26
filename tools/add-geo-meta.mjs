#!/usr/bin/env node
// tools/add-geo-meta.mjs — idempotent inserter for the site geo block.
//
// After each indexable page's <link rel="canonical"> line it inserts:
//
//   <meta name="geo.region" content="IN-MH" />
//   <meta name="geo.placename" content="Pune, Maharashtra, India" />
//   <meta name="geo.position" content="18.5204;73.8567" />
//   <meta name="ICBM" content="18.5204, 73.8567" />
//
// Run: node tools/add-geo-meta.mjs
//
// The edit is byte-safe: files are handled as raw Buffers and only ASCII
// bytes are inserted (latin1 string mapping keeps byte offsets 1:1), so
// pages that are not valid UTF-8 (see tools/check-encoding.ps1) round-trip
// without corruption. Files that already carry geo.region, are noindex, or
// are the skipped utility pages/templates are left untouched.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SKIP = /(^|\/)(404|access-denied|maintenance)\.html$|(^|\/)(footer|3d-background)-template\.html$/;

const GEO = [
  '<meta name="geo.region" content="IN-MH" />',
  '<meta name="geo.placename" content="Pune, Maharashtra, India" />',
  '<meta name="geo.position" content="18.5204;73.8567" />',
  '<meta name="ICBM" content="18.5204, 73.8567" />',
];

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

const files = [...listHtml(join(ROOT, 'public')), join(ROOT, 'index.html')].sort();
let patched = 0;
const skipped = [];

for (const file of files) {
  const rel = relative(ROOT, file).replace(/\\/g, '/');
  if (SKIP.test(rel)) continue;

  const buf = readFileSync(file);
  const text = buf.toString('latin1'); // byte-preserving 1:1 string mapping
  if (/name\s*=\s*["']geo\.region["']/.test(text)) { skipped.push(`${rel} (already)`); continue; }
  if (/<meta\s+name=["']robots["'][^>]*noindex/i.test(text)) { skipped.push(`${rel} (noindex)`); continue; }

  /* locate the <link ... canonical ...> tag regardless of attribute order */
  const tagRe = /<link\b[^>]*>/gi;
  let tag;
  let canonical = null;
  while ((tag = tagRe.exec(text)) !== null) {
    if (/\brel\s*=\s*["']canonical["']/i.test(tag[0])) { canonical = tag; break; }
  }
  if (!canonical) { skipped.push(`${rel} (no canonical)`); continue; }

  const tagEnd = canonical.index + canonical[0].length;
  const nl = text.indexOf('\n', tagEnd);
  const lineStart = text.lastIndexOf('\n', canonical.index) + 1;
  const indent = (text.slice(lineStart, canonical.index).match(/^[ \t]*/) || [''])[0];
  const eol = nl >= 0 && text[nl - 1] === '\r' ? '\r\n' : '\n';
  const insert = GEO.map((l) => indent + l).join(eol) + eol;

  let out;
  if (nl < 0) {
    out = Buffer.concat([buf, Buffer.from(eol + insert, 'latin1')]);
  } else {
    const at = nl + 1;
    out = Buffer.concat([buf.subarray(0, at), Buffer.from(insert, 'latin1'), buf.subarray(at)]);
  }
  writeFileSync(file, out);
  patched++;
  console.log(`[geo] ${rel} — geo block inserted after canonical`);
}

console.log(`[geo] patched ${patched} page(s); skipped: ${skipped.join(', ') || 'none'}`);
