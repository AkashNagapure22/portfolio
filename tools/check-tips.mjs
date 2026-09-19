/* verify zero WhatsApp references in any HTML (final check) */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const hits = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === '.git') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!/\.html$/i.test(name)) continue;
    if (/wa\.me|whatsapp/i.test(readFileSync(p, 'utf8'))) hits.push(relative(ROOT, p));
  }
}
walk(ROOT);
console.log(hits.length ? 'WHATSAPP STILL PRESENT IN:\n' + hits.join('\n') : 'NO WhatsApp references in any HTML');
process.exit(hits.length ? 1 : 0);


let problems = 0;
const api = readFileSync('api/comments.js', 'utf8');
const apiOk = api.includes('to_char(created_at at time zone') && api.includes('parent_id as "parent_id"');
console.log('api aliases + ISO date: ' + (apiOk ? 'OK' : 'MISSING'));
if (!apiOk) problems++;

for (const dir of ['public/Blogs', 'public/Sub_Pages']) {
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.html')) continue;
    const p = join(dir, f);
    const t = readFileSync(p, 'utf8');
    if (!t.includes('async function loadComments')) continue;
    const issues = [];
    // Projects.html uses its own inline renderer with `c.` vars + shorter loading text
    const projectsVariant = /c\.created_at \|\| c\.date/.test(t) && /Loading discussion\.\.\./i.test(t);
    if (!/comment\.date \|\| comment\.created_at|comment\.created_at \|\| comment\.date/.test(t) && !projectsVariant) issues.push('robust-date-missing');
    if (t.includes("escapeHTML(comment.author)") || /<strong>\$\{c\.author\}/.test(t)) issues.push('author-fallback-missing');
    if (!t.includes("/Loading discussion threads/i.test(c.textContent)") && !t.includes("/Loading discussion\\.\\.\\./i.test(c.textContent)")) issues.push('bootstrap-missing');
    if (issues.length) { problems++; console.log('[FAIL] ' + p + ' :: ' + issues.join(', ')); }
    else console.log('[ok] ' + p);
  }
}
console.log(problems ? ('PROBLEMS: ' + problems) : 'ALL COMMENT PAGES OK');
process.exit(problems ? 1 : 0);
