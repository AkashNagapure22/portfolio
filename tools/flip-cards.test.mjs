#!/usr/bin/env node
/**
 * Regression tests for the hobby flip tiles
 * (public/assets/js/flip-cards.js).
 *
 * Run:  npm run test:flip   (or: node tools/flip-cards.test.mjs)
 *
 * Required behaviour, identical to the landing-page project cards:
 *   - a tile rotates only when it is clicked (never on hover)
 *   - opening a tile returns every other tile to its original position
 *   - clicking an open tile closes it again
 *
 * Part 1 drives the real file through an in-process DOM stub.
 * Part 2 statically verifies the four hobby pages stay wired to it.
 * Exit code 0 = everything passed.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'public', 'assets', 'js', 'flip-cards.js');
const PAGE_DIR = join(ROOT, 'public', 'Sub_Pages');
const PAGES = ['Coins', 'Food', 'Puzzle', 'courses'];

const TILE_SEL = '.flip-card-container, .flip-card, .inventory-flip-card';
const INTERACTIVE = 'a, button, input, textarea, select, label';

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

/* ---------------- minimal DOM stub ---------------- */

function node(tag, cls, children = []) {
  const el = {
    tagName: tag.toUpperCase(),
    parent: null,
    children: [],
    _cls: new Set(String(cls || '').split(/\s+/).filter(Boolean)),
    listeners: [],
  };
  el.classList = {
    contains: (c) => el._cls.has(c),
    add: (...cs) => cs.forEach((c) => el._cls.add(c)),
    remove: (...cs) => cs.forEach((c) => el._cls.delete(c)),
    toggle: (c) => (el._cls.has(c) ? (el._cls.delete(c), false) : (el._cls.add(c), true)),
  };
  el.matches = (sel) =>
    String(sel)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .some((s) => (s.startsWith('.') ? el._cls.has(s.slice(1)) : el.tagName === s.toUpperCase()));
  el.closest = (sel) => {
    let n = el;
    while (n) {
      if (n.matches(sel)) return n;
      n = n.parent;
    }
    return null;
  };
  el.addEventListener = (type) => el.listeners.push(type);
  for (const c of children) {
    c.parent = el;
    el.children.push(c);
  }
  return el;
}

function makePage(tileClass) {
  const tiles = [1, 2, 3].map(() => node('div', tileClass));
  const root = node('body', '', tiles);
  const all = [];
  (function walk(n) {
    all.push(n);
    n.children.forEach(walk);
  })(root);

  const listeners = [];
  const document = {
    querySelectorAll: (sel) => all.filter((n) => n.matches(sel)),
    addEventListener: (type, fn, capture) => listeners.push({ type, fn, capture: !!capture }),
  };
  return { root, tiles, doc: document, listeners };
}

const source = readFileSync(SRC, 'utf8');

/** Load the real flip-cards.js against a DOM stub. */
function boot(tileClass) {
  const page = makePage(tileClass);
  const sandbox = { document: page.doc, console };
  sandbox.window = sandbox;
  vm.runInNewContext(source, sandbox, { filename: SRC });
  return { ...page, win: sandbox };
}

const click = (tile, target) => ({ target: target || tile });

/* ---------------- Part 1: behaviour ---------------- */

console.log('flip-cards tests — behaviour (DOM stub)');

const food = boot('flip-card cursor-pointer');
check('window.toggleHobbyFlip is exported', typeof food.win.toggleHobbyFlip === 'function');
check('tiles were found by the selector', food.tiles.length === 3, 'found ' + food.tiles.length);

food.win.toggleHobbyFlip(food.tiles[0], click(food.tiles[0]));
check('clicking a tile rotates it (.flipped)', food.tiles[0].classList.contains('flipped'));
check('  other tiles stay in place', !food.tiles[1].classList.contains('flipped') && !food.tiles[2].classList.contains('flipped'));

food.win.toggleHobbyFlip(food.tiles[1], click(food.tiles[1]));
check('clicking another tile rotates that one', food.tiles[1].classList.contains('flipped'));
check('  the previously open tile reverts to its original position', !food.tiles[0].classList.contains('flipped'));

food.win.toggleHobbyFlip(food.tiles[1], click(food.tiles[1]));
check('clicking an open tile closes it again', !food.tiles[1].classList.contains('flipped'));

const courses = boot('flip-card-container h-[220px] course-card');
courses.win.toggleHobbyFlip(courses.tiles[0], click(courses.tiles[0]));
check('.flip-card-container uses .is-flipped (courses convention)', courses.tiles[0].classList.contains('is-flipped'));
check('  it never sets .flipped on a container', !courses.tiles[0].classList.contains('flipped'));
courses.win.toggleHobbyFlip(courses.tiles[1], click(courses.tiles[1]));
check('  opening a second container closes the first', !courses.tiles[0].classList.contains('is-flipped'));

const coins = boot('inventory-flip-card cursor-pointer vault-item');
coins.win.toggleHobbyFlip(coins.tiles[0], click(coins.tiles[0]));
check('.inventory-flip-card uses .flipped (Coins/Puzzle convention)', coins.tiles[0].classList.contains('flipped'));
coins.win.toggleHobbyFlip(coins.tiles[2], click(coins.tiles[2]));
check('  opening another tile closes the first', !coins.tiles[0].classList.contains('flipped'));

/* mixed conventions: .is-flipped and .flipped must reset each other */
const mixed = boot('flip-card-container');
mixed.tiles[0].classList.add('is-flipped');
mixed.win.toggleHobbyFlip(mixed.tiles[1], click(mixed.tiles[1]));
check('opening a second .flip-card-container tile resets the previous one (.is-flipped)',
  !mixed.tiles[0].classList.contains('is-flipped') && mixed.tiles[1].classList.contains('is-flipped'));

/* interactive elements inside a tile keep their own behaviour */
const link = node('a', 'text-sky-400');
link.parent = food.tiles[2];
food.tiles[2].children.push(link);
food.win.toggleHobbyFlip(food.tiles[2], click(food.tiles[2], link));
check('clicking a link inside a tile does not rotate it', !food.tiles[2].classList.contains('flipped'));
const btn = node('button', '');
btn.parent = food.tiles[2];
food.tiles[2].children.push(btn);
food.win.toggleHobbyFlip(food.tiles[2], click(food.tiles[2], btn));
check('clicking a button inside a tile does not rotate it', !food.tiles[2].classList.contains('flipped'));

/* capture-phase safety net: a legacy inline handler cannot leave a tile open */
const legacy = boot('flip-card');
legacy.tiles[0].classList.add('flipped');
const capture = legacy.listeners.find((l) => l.type === 'click' && l.capture);
check('a capture-phase click listener is registered', !!capture);
check('  it closes other tiles before the tile own handler runs',
  !!capture && (capture.fn(click(legacy.tiles[1])), !legacy.tiles[0].classList.contains('flipped')));

/* rotation must be click-only: the module installs no pointer/hover listeners */
check('no hover/pointer listeners are installed (rotation is click-only)',
  legacy.listeners.every((l) => l.type === 'click'),
  legacy.listeners.map((l) => l.type).join(', '));

/* ---------------- Part 2: the hobby pages stay wired ---------------- */

console.log('\nflip-cards tests — page wiring');

for (const page of PAGES) {
  const file = join(PAGE_DIR, page + '.html');
  const html = readFileSync(file, 'utf8');
  const wired = (html.match(/onclick="toggleHobbyFlip\(this, event\)"/g) || []).length;
  check(page + '.html loads /assets/js/flip-cards.js', html.includes('src="/assets/js/flip-cards.js"'));
  check('  ' + wired + ' tiles call toggleHobbyFlip(this, event)', wired > 0);
  check('  no legacy inline class toggle remains',
    !/onclick="this\.classList\.toggle\('(?:is-)?flipped'\)"/.test(html));
  check('  no legacy toggleFlipCard handler remains', !html.includes('toggleFlipCard'));
  check('  flip tiles are clickable (cursor-pointer)',
    /class="[^"]*(?:flip-card|inventory-flip-card)[^"]*cursor-pointer/.test(html));
}

/* the landing-page project cards keep their own exclusive toggle */
const landing = readFileSync(join(ROOT, 'index.html'), 'utf8');
check('index.html defines window.toggleFlip for the project cards',
  landing.includes('window.toggleFlip = function'));
check('  it returns the other project cards to their original position',
  /window\.toggleFlip = function[\s\S]{0,400}?classList\.remove\('is-flipped'\)/.test(landing));

console.log('\n' + passed + ' passed, ' + failures.length + ' failed');
if (failures.length) {
  console.error('\nFailures:\n  - ' + failures.join('\n  - '));
  process.exit(1);
}