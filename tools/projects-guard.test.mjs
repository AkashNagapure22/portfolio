#!/usr/bin/env node
/**
 * Regression tests for tools/projects-guard.mjs.
 *
 * Run:  npm run test:guard   (or: node tools/projects-guard.test.mjs)
 *
 * Every fixture is written to a temp directory, so the repository working tree
 * is never modified. Exit code 0 = all tests passed.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GUARD = join(ROOT, 'tools', 'projects-guard.mjs');
const BASELINE = join(ROOT, 'tools', 'projects-baseline.html');
const INDEX = join(ROOT, 'index.html');

const SECTION = /<section id="projects"[\s\S]*?<\/section>/;
const MOJIBAKE_ARROW = '\u0393\u00E5\u00C6'; // what "→" becomes after a CP437 round-trip

const tmp = mkdtempSync(join(tmpdir(), 'projects-guard-test-'));
const original = readFileSync(INDEX);
const originalText = original.toString('utf8');
const match = SECTION.exec(originalText);
if (!match) {
  console.error('Cannot run guard tests: no #projects section in ' + INDEX);
  process.exit(1);
}
const [sectionText] = match;

let passed = 0;
const failures = [];
const check = (name, condition, detail) => {
  if (condition) {
    passed++;
    console.log('  ok   ' + name);
  } else {
    failures.push(name + (detail ? ' — ' + detail : ''));
    console.log('  FAIL ' + name + (detail ? ' — ' + detail : ''));
  }
};
const guard = (file, args = [], baseline = BASELINE) =>
  spawnSync(process.execPath, [GUARD, '--file', file, '--baseline', baseline, ...args], { encoding: 'utf8' });
const exitOf = (file, args = [], baseline = BASELINE) => guard(file, args, baseline).status;
const body = (mutation) => {
  const mangled = mutation(sectionText);
  if (mangled === sectionText) throw new Error('test fixture did not change the section');
  return Buffer.from(originalText.replace(sectionText, mangled), 'utf8');
};
const fixture = (name, bytes) => {
  const file = join(tmp, name);
  writeFileSync(file, bytes);
  return file;
};
const readTmp = (file) => readFileSync(file);

console.log('projects-guard tests (temp dir: ' + tmp + ')');

console.log('\nverification');
check('clean index.html matches the frozen baseline (exit 0)', exitOf(INDEX) === 0);
check('missing baseline is reported (exit 1)', exitOf(INDEX, [], join(tmp, 'nope.html')) === 1);
const dup = spawnSync(process.execPath, [GUARD, '--file', INDEX, '--baseline', BASELINE, '--baseline', BASELINE], { encoding: 'utf8' });
check('a duplicated flag is rejected (exit 1)', dup.status === 1);

console.log('\ncorruption detection');
const drift = fixture('drift.html', body((s) => s.replace('SCCM to Intune Migration', 'SCCM to Intune Migration (edited)')));
const moji = fixture('moji.html', body((s) => s.replace(/\u2192/g, MOJIBAKE_ARROW)));
const broken = fixture('broken.html', body((s) => s.replace('</div>', '')));
check('edited section is rejected (exit 1)', exitOf(drift) === 1);
check('mojibake arrows are rejected (exit 1)', exitOf(moji) === 1);
check('unbalanced structure is rejected (exit 1)', exitOf(broken) === 1);
check('rejection output names the problem', /drifted|CP437|unbalanced/.test(guard(moji).stderr + guard(broken).stderr));

console.log('\nhealing');
check('--heal reports success on a drifted file (exit 0)', exitOf(drift, ['--heal']) === 0);
check('  drifted file is byte-identical to index.html after healing', readTmp(drift).equals(original));
check('--heal reports success on a mojibake file (exit 0)', exitOf(moji, ['--heal']) === 0);
check('  mojibake file is byte-identical to index.html after healing', readTmp(moji).equals(original));
check('--heal reports success on a broken file (exit 0)', exitOf(broken, ['--heal']) === 0);
check('  broken file is byte-identical to index.html after healing', readTmp(broken).equals(original));
check('  healed file passes a strict verify (exit 0)', exitOf(moji) === 0);
check('--heal is a no-op on a clean file (exit 0)', exitOf(INDEX, ['--heal']) === 0 && readFileSync(INDEX).equals(original));

console.log('\nfreezing and overrides');
const badBaseline = join(tmp, 'bad-baseline.html');
const corrupted = fixture('corrupted.html', body((s) => s.replace(/\u2192/g, MOJIBAKE_ARROW)));
check('--accept refuses a mojibake section (exit 1)', guard(corrupted, ['--accept'], badBaseline).status === 1);
check('  no baseline file was written', !existsSync(badBaseline));
const goodBaseline = join(tmp, 'good-baseline.html');
check('--accept freezes a clean section (exit 0)', guard(INDEX, ['--accept'], goodBaseline).status === 0);
check('  frozen baseline matches the live section', readFileSync(goodBaseline, 'utf8').replace(/\r?\n/g, '\n').trim() === sectionText.replace(/\r?\n/g, '\n').trim());
check('  the repository baseline was not touched by the tests', readFileSync(BASELINE, 'utf8').replace(/\r?\n/g, '\n').trim() === sectionText.replace(/\r?\n/g, '\n').trim());
check('--allow-projects-change skips the check (exit 0)', exitOf(drift, ['--allow-projects-change']) === 0);

rmSync(tmp, { recursive: true, force: true });
console.log('\n' + passed + ' passed, ' + failures.length + ' failed');
if (failures.length) {
  console.error('\nFailures:\n  - ' + failures.join('\n  - '));
  process.exit(1);
}