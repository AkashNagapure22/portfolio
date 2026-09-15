#!/usr/bin/env node
/**
 * Projects Section Guard — the "#projects" block of index.html is frozen.
 *
 * The "Key Projects" cards on the landing page must not change unless that
 * change is explicitly requested. Bulk rewriters, formatters and console
 * round-trips have already corrupted the "→" glyphs inside these cards once
 * (they were saved as CP437 mojibake: "Î“Ã¥Ã†"), so the section is now compared
 * against a committed baseline before it can be committed or deployed.
 *
 * Usage:
 *   node tools/projects-guard.mjs                 verify against baseline (CI, pre-commit)
 *   node tools/projects-guard.mjs --heal          verify, restore baseline if the section drifted
 *   node tools/projects-guard.mjs --accept        freeze the current section as the new baseline
 *   node tools/projects-guard.mjs --file X --baseline Y   inspect another copy (tests)
 *
 * Escape hatches (use only when a change is really wanted):
 *   node tools/projects-guard.mjs --allow-projects-change    (env: ALLOW_PROJECTS_CHANGE=1)
 *   git commit --no-verify        (skips the pre-commit hook)
 *
 * Exit codes: 0 = section matches baseline, 1 = drift / corruption detected.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const flag = (...names) => names.some((n) => argv.includes(n));
const value = (name, fallback) => {
  const i = argv.indexOf(name);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
};

const FILE = value('--file', join(ROOT, 'index.html'));
const BASELINE = value('--baseline', join(ROOT, 'tools', 'projects-baseline.html'));
const HEAL = flag('--heal');
const ACCEPT = flag('--accept');
const OVERRIDE = flag('--allow-projects-change') || process.env.ALLOW_PROJECTS_CHANGE === '1';

const START = '<section id="projects"';
const END = '</section>';
const BOM = '\uFEFF';
const EXPECTED_CARDS = 6;

// Corrupted-character families that must never appear inside the section.
const CORRUPTION = [
  ['broken arrow/dash (CP437 round-trip)', /\u0393[\u00A0-\u00FF]/],
  ['broken box-drawing (CP437 round-trip)', /\u256C[\u0080-\u00FF]/],
  ['Windows-1252 round-trip (Ã¢â‚¬ family)', /\u00E2\u20AC/],
  ['double-encoded accent (Ã+x)', /\u00C3[\u0080-\u00BF]/],
  ['raw C1 control byte', /[\u0080-\u009F]/],
];

const tag = (m) => console.log('[projects-guard] ' + m);
const die = (m) => {
  console.error('[projects-guard] FAIL: ' + m);
  process.exit(1);
};
const stripEol = (t) => t.replace(/\r\n?/g, '\n').trim();
const snippet = (t, i) => JSON.stringify(t.slice(Math.max(0, i - 45), i + 45));

function readText(file) {
  if (!existsSync(file)) die('file not found: ' + file);
  const buf = readFileSync(file);
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buf);
  } catch {
    return die('not valid UTF-8: ' + relative(ROOT, file));
  }
}

/** Locate the protected section, keeping the exact byte offsets used for healing. */
function readSection(file) {
  const raw = readText(file);
  const bom = raw.startsWith(BOM);
  const body = bom ? raw.slice(1) : raw;
  const eol = body.includes('\r\n') ? '\r\n' : '\n';
  const start = body.indexOf(START);
  if (start === -1) die('no "' + START + '" section in ' + relative(ROOT, file));
  if (body.indexOf(START, start + 1) !== -1) die('more than one "' + START + '" section in ' + relative(ROOT, file));
  const closeAt = body.indexOf(END, start);
  if (closeAt === -1) die('unterminated "' + START + '" section in ' + relative(ROOT, file));
  const end = closeAt + END.length;
  const section = body.slice(start, end);
  if (section.slice(START.length).includes('<section')) die('nested <section> inside #projects — extend this guard before trusting it');
  return { bom, body, eol, start, end, section };
}

function corruptionProblems(section) {
  const problems = [];
  for (const [label, re] of CORRUPTION) {
    const m = re.exec(section);
    if (m) problems.push(label + ' → ' + JSON.stringify(section.slice(Math.max(0, m.index - 24), m.index + 24)));
  }
  return problems;
}

function structureProblems(section) {
  const count = (re) => (section.match(re) || []).length;
  const problems = [];
  const open = count(/<div\b/g);
  const close = count(/<\/div>/g);
  if (open !== close) problems.push('unbalanced <div>: ' + open + ' open vs ' + close + ' close');
  const cards = count(/class="flip-card-container/g);
  if (cards !== EXPECTED_CARDS) problems.push('expected ' + EXPECTED_CARDS + ' flip-card containers, found ' + cards);
  const fronts = count(/class="flip-card-front/g);
  const backs = count(/class="flip-card-back/g);
  if (fronts !== EXPECTED_CARDS || backs !== EXPECTED_CARDS) problems.push('expected ' + EXPECTED_CARDS + ' card fronts/backs, found ' + fronts + '/' + backs);
  if (!/id="projects"/.test(section)) problems.push('section id is no longer "projects"');
  return problems;
}

function firstDiff(a, b) {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i;
  return a.length === b.length ? -1 : n;
}

const target = readSection(FILE);
const corruption = corruptionProblems(target.section);
if (corruption.length) {
  die('corrupted characters inside #projects:\n  - ' + corruption.join('\n  - ') +
    '\n  use "node tools/projects-guard.mjs --heal" to restore the frozen baseline');
}
const structure = structureProblems(target.section);
if (structure.length) {
  die('#projects looks structurally broken:\n  - ' + structure.join('\n  - '));
}
const current = stripEol(target.section);

if (ACCEPT) {
  writeFileSync(BASELINE, current + '\n', 'utf8');
  tag('baseline updated from ' + relative(ROOT, FILE) + ' → ' + relative(ROOT, BASELINE) + ' (' + current.length + ' chars)');
  tag('this is the only supported way to change the protected #projects section');
  process.exit(0);
}

if (OVERRIDE) {
  tag('override active (--allow-projects-change / ALLOW_PROJECTS_CHANGE) — guard skipped');
  process.exit(0);
}

if (!existsSync(BASELINE)) die('baseline missing: ' + relative(ROOT, BASELINE) + ' (create it once with: npm run projects:accept)');
const baseline = stripEol(readText(BASELINE));

if (baseline === current) {
  tag('OK — ' + relative(ROOT, FILE) + ' #projects matches the frozen baseline');
  process.exit(0);
}

const offset = firstDiff(baseline, current);
const report = '#projects drifted from the frozen baseline' +
  '\n  baseline: ' + baseline.length + ' chars, file: ' + current.length + ' chars, first difference at offset ' + offset +
  '\n  baseline: ' + snippet(baseline, offset) +
  '\n  current : ' + snippet(current, offset);

if (!HEAL) {
  console.error('[projects-guard] FAIL: ' + report);
  console.error('[projects-guard] The #projects section is protected. If the change is intentional, run: npm run projects:accept');
  process.exit(1);
}

const restored = baseline.replace(/\n/g, target.eol);
const healed = target.body.slice(0, target.start) + restored + target.body.slice(target.end);
writeFileSync(FILE, (target.bom ? BOM : '') + healed, 'utf8');
tag('WARNING: ' + report);
tag('restored the frozen #projects section in ' + relative(ROOT, FILE) + ' from ' + relative(ROOT, BASELINE));
process.exit(0);