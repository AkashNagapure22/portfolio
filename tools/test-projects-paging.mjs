#!/usr/bin/env node
/* Paging smoke test: extracts the PAGE_SIZE script from Projects.html,
   runs it against 23 fake cards, asserts 6-per-page behaviour. */
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync('public/Sub_Pages/Projects.html', 'utf8');
const m = html.match(/<script>\s*const PAGE_SIZE[\s\S]*?document\.addEventListener\('DOMContentLoaded', applyPaging\);\s*<\/script>/);
if (!m) { console.error('PAGING SCRIPT NOT FOUND'); process.exit(1); }
const src = m[0].replace(/^<script>/, '').replace(/<\/script>$/, '');

const cards = Array.from({ length: 23 }, (_, i) => ({
  cat: ['intune', 'sccm', 'w365'][i % 3],
  style: {},
  innerText: 'article ' + i,
  getAttribute(k) { return k === 'data-category' ? this.cat : null; },
}));
let paginationHTML = '';
const els = {
  'pagination-numbers': {
    set innerHTML(v) { paginationHTML = v; },
    get innerHTML() { return paginationHTML; },
    appendChild(c) { paginationHTML += '[' + c.textContent + ']'; },
  },
  'prev-btn': {},
  'next-btn': {},
  'blog-grid': { scrollIntoView() {} },
  'search-empty-state': { classList: { toggle() {} } },
};
const sandbox = {
  console,
  document: {
    querySelectorAll: (s) => (s === '.searchable-card' ? cards : []),
    getElementById: (id) => els[id] || null,
    createElement: () => ({
      _t: '', _f: null,
      set textContent(v) { this._t = v; },
      get textContent() { return this._t; },
      setAttribute() {},
      set className(v) { this._c = v; },
      set onclick(f) { this._f = f; },
    }),
    addEventListener: () => {},
  },
  window: {},
};
vm.createContext(sandbox);
vm.runInContext(src + '\nthis.__t = { applyPaging, changePage, matchingCards };', sandbox);
const T = sandbox.__t;
const visible = () => cards.filter((c) => c.style.display !== 'none').length;
const fails = [];
const eq = (label, got, want) => {
  console.log(label + ' = ' + got + (got === want ? ' OK' : ' FAIL (want ' + want + ')'));
  if (got !== want) fails.push(label);
};

T.applyPaging();
eq('page1 visible', visible(), 6);
eq('page buttons (23/6)', paginationHTML, '[1][2][3][4]');
T.changePage(4, false);
eq('page4 visible (23 = 6+6+6+5)', visible(), 5);
T.changePage(99, false);
eq('guarded bad page keeps page4', visible(), 5); // out-of-range ignored
T.changePage(1, false);
eq('back to page1', visible(), 6);
if (fails.length) { console.error('FAIL: ' + fails.join(', ')); process.exit(1); }
console.log('paging smoke test passed');
