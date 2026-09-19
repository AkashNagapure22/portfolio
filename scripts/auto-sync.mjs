// scripts/auto-sync.mjs — keeps the generated artefacts in step with the sources.
//
//   npm run sync    → run the whole pipeline once and exit (CI / pre-commit)
//   npm run watch   → run it once, then again on every relevant source change
//
// Pipeline: inline the canonical footer/cookie/3D-background into every page,
// then regenerate sitemap.xml + llms.txt, then validate the structured data and
// audit the per-page SEO metadata. Uses only node built-ins (fs.watch), so it
// works without installing anything beyond Node itself.
import { spawnSync } from 'node:child_process';
import { watch } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const RUN_ONCE = process.argv.includes('--once');

const STEPS = [
  ['templates', 'tools/apply-templates.mjs'],
  ['sitemap', 'tools/build-sitemap.mjs'],
  ['llms', 'tools/build-llms-txt.mjs'],
  ['structured-data', 'tools/validate-structured-data.mjs'],
  ['seo-meta', 'tools/audit-seo-meta.mjs'],
];

/* Paths the pipeline writes itself — reacting to them would loop forever. */
const IGNORE = /(^|[\\/])(node_modules|dist|\.git)([\\/]|$)|(^|[\\/])(sitemap\.xml|llms\.txt|llms-full\.txt)$|^public[\\/]template[\\/]/;
const RELEVANT = /\.(html|mjs|js|css|md)$/i;

let running = false;
let queued = null;

function runPipeline(reason) {
  if (running) { queued = reason; return 0; }
  running = true;
  console.log(`\n[auto-sync] ${reason}`);
  let code = 0;
  for (const [name, script] of STEPS) {
    const r = spawnSync(process.execPath, [script], { cwd: ROOT, stdio: 'inherit', shell: false });
    if (r.status !== 0) {
      code = r.status || 1;
      console.error(`[auto-sync] step "${name}" failed (exit ${code}) — stopping.`);
      break;
    }
  }
  running = false;
  if (queued) { const next = queued; queued = null; setTimeout(() => runPipeline(next), 300); }
  return code;
}

if (RUN_ONCE) process.exit(runPipeline('full sync (once)'));

runPipeline('initial full sync');

let timer = null;
watch(ROOT, { recursive: true }, (_event, name) => {
  if (!name || IGNORE.test(name) || !RELEVANT.test(name)) return;
  clearTimeout(timer);
  timer = setTimeout(() => runPipeline(`changed: ${name}`), 400);
});

console.log('[auto-sync] watching for changes — Ctrl+C to stop.');