// tools/apply-templates.mjs — single command that inlines the canonical
// footer (+cookie) and 3D square background into EVERY page, without fail.
// Run:  node tools/apply-templates.mjs
// It also fixes the stray "async" SyntaxError line that was killing page scripts.
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const TPL_DIR = join(ROOT, 'template');
const PUB_TPL_DIR = join(ROOT, 'public', 'template');

const footerSrc = readFileSync(join(TPL_DIR, 'footer-template.html'), 'utf8');
const bgSrc = readFileSync(join(TPL_DIR, '3d-background-template.html'), 'utf8').trim();

const THREE_CDN = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>';
const BG_JS_TAG = '<script src="/assets/js/3d-background.js" defer></script>';
const COMMON_JS_TAG = '<script src="/assets/js/footer-common.js" defer></script>';
const LOADER_TAG = '<script src="/assets/js/template-loader.js" defer></script>';
const FX_CSS_TAG = '<link rel="stylesheet" href="/assets/css/site-effects.css">';
const FX_JS_TAG = '<script src="/assets/js/site-effects.js" defer></script>';

/* Find a block <tag ...>...</tag>, optionally requiring id="...". Returns {start,end} or null. */
function findBlock(html, tag, id) {
  const openRe = new RegExp('<' + tag + '\\b[^>]*' + (id ? 'id=[\"\']' + id + '[\"\']' : '') + '[^>]*>', 'i');
  const m = openRe.exec(html);
  if (!m) return null;
  let start = m.index;
  // include a directly-preceding HTML comment (e.g. <!-- Cookie Consent Banner -->)
  const before = html.slice(Math.max(0, start - 300), start);
  const cm = before.match(/<!--[\s\S]*?-->\s*$/);
  if (cm && /cookie|footer|background|3d/i.test(cm[0])) start = start - cm[0].length;
  const tagRe = new RegExp('<\\/?' + tag + '\\b[^>]*>', 'gi');
  tagRe.lastIndex = m.index;
  let depth = 0, tok;
  while ((tok = tagRe.exec(html)) !== null) {
    if (tok[0][1] === '/') depth--;
    else depth++;
    if (depth === 0) return { start, end: tagRe.lastIndex };
    if (tagRe.lastIndex > m.index + 200000) break; // sanity cap
  }
  return null;
}

function extractFooterParts(src) {
  const f = findBlock(src, 'footer', null);
  const c = findBlock(src, 'div', 'cookie-banner');
  if (!f) throw new Error('footer block missing in template');
  return {
    footer: src.slice(f.start, f.end).trim(),
    cookie: (c ? src.slice(c.start, c.end).trim() : ''),
  };
}
const PARTS = extractFooterParts(footerSrc);

/* Recursively list *.html under dir, skipping node_modules/dist/template dirs. */
function listHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist') continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (p === TPL_DIR || p === PUB_TPL_DIR) continue;
      listHtml(p, out);
    } else if (/\.html$/i.test(name)) out.push(p);
  }
  return out;
}

function patchOne(file) {
  let html = readFileSync(file, 'utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const orig = html;
  // 1) Neutralise stray "async" SyntaxError line inside page scripts
  //    (it may sit directly before </script> OR before a blank line + </script>)
  html = html.replace(/^[ \t]*async[ \t]*\r?\n(?=[ \t]*\r?\n?[ \t]*<\/script>)/gm, '');
  // 2) Ensure <body> exists (404-style stubs put content in <head>).
  //    IMPORTANT: <head> ends at the FIRST </head>. Everything after it belongs in body.
  //    So: split head/body correctly, then move any head-trapped footer/cookie/style/script markup into body.
  let headCloseIdx = html.search(/<\/head\s*>/i);
  let bodyOpen = html.search(/<body\b[^>]*>/i);
  if (headCloseIdx !== -1 && (bodyOpen === -1 || bodyOpen < headCloseIdx)) {
    // No <body> between <head> and content (or no body at all): insert <body> right after </head>.
    html = html.replace(/<\/head\s*>/i, '</head>\n<body>');
    bodyOpen = html.search(/<body\b[^>]*>/i);
  }
  // (B) Error-shell pages (404/403/maintenance): they have NO </head> and NO <body>.
  //      Rebuild a minimal valid shell ONCE (guarded by ERROR-SHELL marker so reruns are no-ops).
  const isErrorShell = /public[\\\/](404|access-denied|maintenance)\.html$|_rec_(404|access-denied|maintenance)\.html$/.test(file);
  if (isErrorShell && html.indexOf('ERROR-SHELL') === -1 && html.search(/<\/head\s*>/i) === -1 && html.search(/<body\b/i) === -1) {
    const headOpenEnd = html.search(/<head\b[^>]*>/i);
    if (headOpenEnd !== -1) {
      const openTagEnd = html.indexOf('>', headOpenEnd) + 1;
      const headInner = html.slice(openTagEnd);
      // headInner currently holds meta + footer + cookie + scripts with no closers.
      // Split it: metadata stays in head; everything from the first footer/cookie/canvas/script
      // that belongs in body moves to body.
      const bodyStartMarks = ['<footer', '<canvas', '<div id="cookie-banner', '<div id="cookie-banner', '<script src="/assets', '<script src="https://cdnjs', '<main', '<header', '<!-- Canonical footer', '<!-- Canonical 3D'];
      let splitAt = -1;
      for (const mk of bodyStartMarks) {
        const i = headInner.toLowerCase().indexOf(mk.toLowerCase());
        if (i !== -1 && (splitAt === -1 || i < splitAt)) splitAt = i;
      }
      let metaPart = headInner, bodyPart = '';
      if (splitAt !== -1) { metaPart = headInner.slice(0, splitAt); bodyPart = headInner.slice(splitAt); }
      // strip any legacy cookie <style>/<script> + stray </body></html> +
      // template comments (they get re-added canonically later) from both parts
      metaPart = metaPart.replace(/<style>[\s\S]*?\.cookie-banner[\s\S]*?<\/style\s*>/gi, '');
      metaPart = metaPart.replace(/<!--\s*Canonical (footer|3D animation background)[\s\S]*?-->/gi, '');
      bodyPart = bodyPart.replace(/<\/body\s*>/gi, '').replace(/<\/html\s*>/gi, '');
      const is403 = /access-denied/i.test(file);
      const isMaint = /maintenance/i.test(file);
      const code = is403 ? 'ERROR 403' : isMaint ? 'MAINTENANCE' : 'ERROR 404';
      const h1 = is403 ? 'Access restricted' : isMaint ? 'Temporarily offline' : 'Page not found';
      const msg = is403 ? 'You do not have permission to view this resource. If you believe this is a mistake, please contact support.'
        : isMaint ? 'This section is undergoing scheduled maintenance. Please check back shortly.'
        : 'The requested resource could not be found. It may have moved, or the link is outdated.';
      const shell =
        '\n  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />\n</head>\n' +
        '<!-- ERROR-SHELL:START (minimal header + message; canonical footer/cookie/bg injected by tools/apply-templates.mjs) -->\n' +
        '<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between overflow-x-hidden">\n' +
        '<header class="w-full z-50 bg-slate-950/30 backdrop-blur-xl border-b border-white/10 py-4 px-6 sm:px-12 relative">\n' +
        '  <div class="max-w-7xl mx-auto flex items-center justify-between">\n' +
        '    <a href="https://www.akashnagapure.in" class="flex items-center space-x-3 text-sky-400 hover:text-white transition-colors">\n' +
        '      <span class="w-10 h-10 rounded-xl bg-slate-900 border border-sky-500/30 flex items-center justify-center overflow-hidden shadow-md">\n' +
        '        <img src="/Main_page_data/Logo.gif" alt="Logo" class="w-full h-full object-cover" onerror="this.onerror=null; this.src=\'/Main_page_data/placeholder.gif\';" />\n' +
        '      </span>\n' +
        '      <span class="flex flex-col">\n' +
        '        <strong class="font-sans font-extrabold text-white text-sm sm:text-base tracking-tight">Akash Nagapure</strong>\n' +
        '        <span class="font-mono text-[10px] text-sky-400 uppercase tracking-widest">Fleet Architect</span>\n' +
        '      </span>\n' +
        '    </a>\n' +
        '  </div>\n' +
        '</header>\n' +
        '<main class="flex-grow w-full relative z-10 flex items-center justify-center px-6 py-20 text-center">\n' +
        '  <div class="max-w-lg">\n' +
        '    <p class="font-mono text-sky-400 text-sm tracking-widest mb-3">' + code + '</p>\n' +
        '    <h1 class="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">' + h1 + '</h1>\n' +
        '    <p class="text-slate-400 text-sm leading-relaxed mb-8">' + msg + '</p>\n' +
        '    <a href="https://www.akashnagapure.in" class="inline-block px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-lg transition-all">Back to home</a>\n' +
        '  </div>\n' +
        '</main>\n' +
        '<!-- ERROR-SHELL:END -->\n' +
        bodyPart;
      const htmlOpenEnd = html.indexOf('>', headOpenEnd) + 1;
      html = html.slice(0, htmlOpenEnd) + '\n' + metaPart + shell;
      // fall through to the normal steps below (bg insert, footer swap, scripts, closers)
    }
  }
  // 3) Relocate cookie banner wrongly placed inside <head> to before </body>
  //    (depth-aware: the banner contains nested divs, so naive regex would shred it)
  const headMatch = html.match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i);
  if (headMatch) {
    let headInner = headMatch[1];
    const moveOut = [];
    let hb;
    while ((hb = findBlock(headInner, 'div', 'cookie-banner')) !== null) {
      moveOut.push(headInner.slice(hb.start, hb.end));
      headInner = headInner.slice(0, hb.start) + '\n' + headInner.slice(hb.end);
    }
    // also sweep orphan cookie fragments (partial banners left by older runs)
    const orphanRe = /<!--\s*Cookie Consent Banner[\s\S]*?-->[\s\S]*?(<\/div\s*>\s*){1,4}/i;
    let om;
    while ((om = orphanRe.exec(headInner)) !== null) {
      // only treat as orphan if there is no intact banner opening left
      if (!/id=["']cookie-banner["']/i.test(om[0])) {
        headInner = headInner.replace(om[0], '\n');
      } else break;
    }
    if (moveOut.length) {
      html = html.replace(headMatch[0], headMatch[0].replace(headMatch[1], headInner));
      const bc = html.search(/<\/body\s*>/i);
      html = html.slice(0, bc) + '\n' + moveOut.join('\n') + '\n' + html.slice(bc);
    }
  }
  // 2b) Remove invalid "<script><header ...>" garbage blocks (pre-existing in privacy/terms).
  //      A <script> block containing raw HTML markup is a guaranteed SyntaxError that kills page JS.
  html = html.replace(/<script\b[^>]*>\s*<header\b[\s\S]*?<\/script\s*>/gi, '');
  // 3b) Remove legacy inline cookie <style> and cookie <script> blocks from <head>/top
  //      (canonical behaviour now lives in footer-common.js which injects its own CSS)
  html = html.replace(/<style>[\s\S]*?\.cookie-banner[\s\S]*?<\/style\s*>/gi, '');
  html = html.replace(/<script>[\s\S]*?cookie-banner[\s\S]*?<\/script\s*>/gi, (mm) => {
    // only strip it if it looks like the legacy cookie-consent script, not page logic
    if (/cookieConsent|cookie_consent|enableNonEssentialCookies/i.test(mm)) return '';
    return mm;
  });
  // 4) Background: remove ALL existing bg comment+canvas remnants, insert ONE canonical block after <body>
  html = html.replace(/<!--\s*Canonical 3D animation background[\s\S]*?-->/gi, '');
  html = html.replace(/<canvas\b[^>]*id=["'](?:three-bg-canvas|cursor-trail-canvas)["'][^>]*>\s*(?:<\/canvas\s*>)?/gi, '');
  html = html.replace(/(<body\b[^>]*>)/i, '$1\n\n' + bgSrc);
  // 5) Neutralise legacy per-page 3D init so canonical JS owns the canvases
  html = html.replace(/function\s+init3DBackground\s*\(\)/g, 'function __legacy_init3DBackground_DISABLED()');
  html = html.replace(/function\s+animate3DBackground\s*\(\)/g, 'function __legacy_animate3DBackground_DISABLED()');
  html = html.replace(/function\s+initCursorTrail\s*\(\)/g, 'function __legacy_initCursorTrail_DISABLED()');
  html = html.replace(/function\s+init3DStarBackground\s*\(\)/g, 'function __legacy_init3DStarBackground_DISABLED()');
  html = html.replace(/(^|[^\w$])(init3DBackground|animate3DBackground|initCursorTrail|init3DStarBackground)\s*\(\s*\)\s*;?/g, '$1void 0');
  if (html !== orig) { writeFileSync(file, html, 'utf8'); return 'patched'; }
  return 'ok';
}

function patchTwo(file) {
  let html = readFileSync(file, 'utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const orig = html;
  // 6) Replace footer + cookie blocks with canonical template parts
  const fb = findBlock(html, 'footer', null);
  if (fb) { html = html.slice(0, fb.start) + PARTS.footer + html.slice(fb.end); }
  else {
    const bc = html.search(/<\/body\s*>/i);
    html = html.slice(0, bc) + '\n' + PARTS.footer + '\n' + html.slice(bc);
  }
  // 6b) Collapse cookie banners depth-aware (banner has nested divs).
  //      Remove every existing banner, then insert exactly one canonical banner after footer.
  let cb2;
  while ((cb2 = findBlock(html, 'div', 'cookie-banner')) !== null) {
    html = html.slice(0, cb2.start) + '\n' + html.slice(cb2.end);
  }
  // sweep orphan cookie fragments (shredded banner leftovers: comment + stray closing divs/buttons)
  html = html.replace(/<!--\s*Cookie Consent Banner[\s\S]*?-->\s*(?:<div\b[^>]*>[\s\S]{0,4000}?)?(?:<\/div\s*>\s*){1,3}\s*(?:<div\b[^>]*>[\s\S]{0,2000}?<\/div\s*>\s*)?/gi, (mm) => {
    if (/id=["']cookie-banner["']/i.test(mm) || /<footer\b/i.test(mm)) return mm;
    // only strip when it sits inside <head> or directly before the footer comment
    return '\n';
  });
  // re-insert exactly one canonical cookie banner after footer
  html = html.replace(/(<\/footer\s*>)/i, '$1\n\n' + PARTS.cookie);
  // 7) Ensure required scripts exist exactly once before </body>
  //    First normalise legacy non-defer variants to the canonical defer tags.
  html = html.replace(/<script\s+src=["']\/assets\/js\/footer-common\.js["'][^>]*>\s*<\/script\s*>/gi, COMMON_JS_TAG);
  html = html.replace(/<script\s+src=["']\/assets\/js\/3d-background\.js["'][^>]*>\s*<\/script\s*>/gi, BG_JS_TAG);
  html = html.replace(/<script\s+src=["']\/assets\/js\/template-loader\.js["'][^>]*>\s*<\/script\s*>/gi, LOADER_TAG);
  function ensureOnce(tag) {
    const esc = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const count = (html.match(new RegExp(esc, 'g')) || []).length;
    if (count === 0) {
      const bc = html.search(/<\/body\s*>/i);
      html = html.slice(0, bc) + '\n' + tag + '\n' + html.slice(bc);
    } else if (count > 1) {
      let first = true;
      html = html.replace(new RegExp(esc, 'g'), (mm) => (first ? (first = false, mm) : ''));
    }
  }
  if (!/three(\.min)?\.js/i.test(html)) {
    const bc = html.search(/<\/body\s*>/i);
    html = html.slice(0, bc) + '\n' + THREE_CDN + '\n' + html.slice(bc);
  }
  ensureOnce(BG_JS_TAG);
  ensureOnce(COMMON_JS_TAG);
  ensureOnce(LOADER_TAG);
  ensureOnce(FX_CSS_TAG);
  ensureOnce(FX_JS_TAG);
  // 8) Repair pages where </main> came AFTER footer: move stray </main> before footer
  const mainClose = html.search(/<\/main\s*>/i);
  const footerOpen = html.search(/<footer\b/i);
  if (mainClose !== -1 && footerOpen !== -1 && mainClose > footerOpen) {
    html = html.replace(/<\/main\s*>/i, '');
    html = html.replace(/(<footer\b)/i, '</main>\n\n$1');
  }
  if (html !== orig) { writeFileSync(file, html, 'utf8'); return 'patched'; }
  return 'ok';
}

function main() {
  mkdirSync(PUB_TPL_DIR, { recursive: true });
  copyFileSync(join(TPL_DIR, 'footer-template.html'), join(PUB_TPL_DIR, 'footer-template.html'));
  copyFileSync(join(TPL_DIR, '3d-background-template.html'), join(PUB_TPL_DIR, '3d-background-template.html'));
  const files = listHtml(ROOT).filter((p) => {
    const r = relative(ROOT, p).replace(/\\/g, '/');
    if (r.startsWith('template/') || r.startsWith('public/template/')) return false;
    /* Never touch the repo's own tooling/docs: tools/projects-baseline.html is a
       frozen snapshot (rewriting it corrupted the projects guard) and the docs
       contain no deployable pages. */
    if (r.startsWith('tools/') || r.startsWith('docs/') || r.startsWith('scripts/')) return false;
    if (/(^|\/)(footer-template|3d-background-template)\.html$/.test(r)) return false;
    return true;
  });
  let patched = 0;
  for (const f of files) {
    try {
      const s1 = patchOne(f);
      const s2 = patchTwo(f);
      if (s1 === 'patched' || s2 === 'patched') {
        patched++;
        console.log('[patched] ' + relative(ROOT, f));
      } else {
        console.log('[ok]      ' + relative(ROOT, f));
      }
    } catch (e) { console.log('[ERROR] ' + relative(ROOT, f) + ' :: ' + e.message); }
  }
  console.log('Done. ' + patched + '/' + files.length + ' files updated.');
}
main();
