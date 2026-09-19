/* FIX-RESUME: resolve 17 git conflict blocks.
   Rule: keep HEAD only for (a) OG/Twitter meta block, (b) hard-download blob JS,
   (c) button/container markup (matches .label/.container CSS). Everything else
   takes the clean 888a0ee side (fixes mojibake dashes) and drops blank-line noise. */
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'public/Sub_Pages/resume.html';
let html = readFileSync(FILE, 'utf8');
const before = (html.match(/<<<<<<</g) || []).length;

const picks = [
  'theirs', // 1: stray blank lines at top
  'ours',   // 2: KEEP HEAD OG/Twitter meta tags
  'ours',   // 3: KEEP HEAD .container/.label CSS
  'theirs', // 4-7: blank-line noise
  'theirs',
  'theirs',
  'theirs',
  'ours',   // 8: KEEP HEAD blob hard-download JS
  'ours',   // 9: KEEP HEAD button markup (matches .label CSS)
  'theirs', // 10-16: clean UTF-8 en-dash side
  'theirs',
  'theirs',
  'theirs',
  'theirs',
  'theirs',
  'theirs',
  'theirs', // 17: trailing blank-line noise
];

let idx = 0;
const lines = html.split('\n');
const out = [];
let i = 0;
while (i < lines.length) {
  if (lines[i].startsWith('<<<<<<< ')) {
    const ours = [];
    const theirs = [];
    i++;
    while (i < lines.length && lines[i].trim() !== '=======') { ours.push(lines[i]); i++; }
    if (i >= lines.length) { console.error('unterminated conflict'); process.exit(1); }
    i++; // skip =======
    while (i < lines.length && !lines[i].startsWith('>>>>>>>')) { theirs.push(lines[i]); i++; }
    if (i >= lines.length) { console.error('unterminated conflict'); process.exit(1); }
    i++; // skip >>>>>>>
    const want = picks[idx++] || 'theirs';
    // Drop lines that are pure whitespace when that side is only noise,
    // but keep meaningful content verbatim.
    const chosen = want === 'ours' ? ours : theirs;
    out.push(...chosen);
  } else {
    out.push(lines[i]);
    i++;
  }
}
html = out.join('\n');

if (idx !== picks.length) {
  console.error(`expected ${picks.length} conflicts, found ${idx}`);
  process.exit(1);
}
const after = (html.match(/<<<<<<</g) || []).length;
writeFileSync(FILE, html);
console.log(`conflicts before=${before} after-markers=${after} resolved=${idx}`);
