/* site-effects.js — site-wide scroll / click / section-transition effects.
   Progressive enhancement: adds [data-fx] attributes + .fx-* classes at runtime.
   If JS or this file fail to load, the site renders exactly as before.
   Respects prefers-reduced-motion. Idempotent. */
(function () {
  'use strict';
  if (window.__fxBooted) return;
  window.__fxBooted = true;

  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ---- inject stylesheet once (pages that already link it in <head> are skipped) ---- */
  if (!document.getElementById('fx-css') && !document.querySelector('link[rel="stylesheet"][href="/assets/css/site-effects.css"]')) {
    var l = document.createElement('link');
    l.id = 'fx-css'; l.rel = 'stylesheet'; l.href = '/assets/css/site-effects.css';
    document.head.appendChild(l);
  }
  if (reduce) return;

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var main = document.querySelector('main') || document.body;

    /* ---------- text colour effect: shimmer every gradient headline ---------- */
    try {
      main.querySelectorAll('[class*="bg-clip-text"]').forEach(function (el) {
        el.classList.add('fx-shimmer');
      });
    } catch (e) {}

    /* ---------- scroll reveal + section-to-section transitions ----------
       Every top-level section gets an animated entrance. Sections tagged with
       .fx-alt (or every second section) slide in from the opposite side, so
       moving from one section to the next feels like a 3D page transition.
       Headings rise, cards zoom — all staggered per parent. */
    var revealSel = [
      'main > section', 'main > article', 'main > div',
      'main h1', 'main h2', 'main h3',
      '[class*="card"]', '.glass-card-3d',
      '.footer-col'
    ].join(',');

    /* ---------- flip tiles own their transforms ----------
       .flip-card* / .inventory-flip-* spin with rotateY(180deg) when clicked.
       The scroll-reveal effect below would otherwise write a transform onto
       those very elements: an inline transform on .flip-card-inner beats the
       "flipped" stylesheet rule, so the tile would never flip at all,
       and the reveal transform would wipe the
       rotateY(180deg) that hides the back face. Skip them entirely.
       Click behaviour lives in /assets/js/flip-cards.js. */
    var FLIP_SEL = '.flip-card, .flip-card-container, .flip-card-inner, .flip-card-front, .flip-card-back, ' +
      '.inventory-flip-card, .inventory-flip-inner, .inventory-flip-front, .inventory-flip-back';
    function isFlip(el) {
      try { return !!(el && el.closest && el.closest(FLIP_SEL)); } catch (e) { return false; }
    }

    var io = null;
    var ioRepeat = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('fx-in');
            io.unobserve(en.target);
          }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
      // Sections re-animate every time they enter the viewport, so moving
      // section -> section always plays a transition (not just the 1st visit).
      ioRepeat = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) en.target.classList.add('fx-in');
          else en.target.classList.remove('fx-in');
        });
      }, { rootMargin: '-8% 0px -8% 0px', threshold: 0.08 });
    }

    var groups = new Map(); // parent -> count (for stagger delays)
    function tag(el, kind, i, repeat) {
      if (el.hasAttribute('data-fx')) return;
      el.setAttribute('data-fx', kind);
      var parent = el.parentElement;
      if (parent) {
        var n = (groups.get(parent) || 0);
        groups.set(parent, n + 1);
        var d = Math.min(n * 70, 420);
        if (d) el.style.transitionDelay = d + 'ms';
      }
      var watcher = (repeat && ioRepeat) ? ioRepeat : io;
      if (watcher) watcher.observe(el);
      else el.classList.add('fx-in');
    }

    try {
      var topSections = main.querySelectorAll(':scope > section, :scope > article, :scope > div');
      topSections.forEach(function (el, idx) {
        // Alternate entrance direction per section so consecutive sections
        // animate in from opposite sides (visible section-to-section motion).
        // `true` = repeat: replays every time the section re-enters view.
        var alt = el.classList.contains('fx-alt') || (idx % 2 === 1);
        tag(el, alt ? 'section-alt' : 'section', idx, true);
      });
      main.querySelectorAll('h1, h2, h3').forEach(function (el) { tag(el, 'up'); });
      document.querySelectorAll('.footer-col').forEach(function (el, i) {
        tag(el, i % 2 === 0 ? 'left' : 'right');
      });
      main.querySelectorAll('[class*="card"], .glass-card-3d').forEach(function (el) {
        if (isFlip(el)) return;
        // Blog/project grid + pagination own their visibility (6-per-page
        // paging toggles display:none). A reveal transform/opacity on them
        // fights paging: tiles pop up/down above the page numbers on every
        // page change. Leave them static so paging is instant and stable.
        try {
          if (el.closest && (el.closest('#blog-grid') || el.closest('#pagination-numbers') ||
            el.id === 'blog-grid' || el.id === 'pagination-numbers' ||
            el.id === 'search-empty-state' || el.classList.contains('searchable-card') ||
            el.classList.contains('blog-card') || el.classList.contains('filter-pill'))) return;
        } catch (e) {}
        tag(el, 'zoom');
      });
    } catch (e) {}

    /* ---------- active-section spotlight: the section in view lifts ---------- */
    try {
      var spot = null;
      if ('IntersectionObserver' in window) {
        spot = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) {
              main.querySelectorAll('.fx-active').forEach(function (el) {
                el.classList.remove('fx-active');
              });
              en.target.classList.add('fx-active');
            }
          });
        }, { rootMargin: '-38% 0px -38% 0px', threshold: 0 });
        topSections.forEach(function (el) { spot.observe(el); });
      }
    } catch (e) {}

    /* Safety net: if a one-shot element was tagged but never intersected
       (e.g. layout surprise), reveal it shortly after so nothing stays
       invisible. Repeat sections are excluded — they toggle on scroll. */
    setTimeout(function () {
      document.querySelectorAll('[data-fx="up"], [data-fx="zoom"], [data-fx="left"], [data-fx="right"]').forEach(function (el) {
        if (!el.classList.contains('fx-in')) el.classList.add('fx-in');
      });
    }, 2600);

    /* ---------- click ripple on buttons ---------- */
    document.addEventListener('click', function (ev) {
      var b = ev.target.closest('button, .btn, [class*="btn-"]');
      if (!b || b.hasAttribute('disabled')) return;
      b.classList.add('fx-ripple-host', 'fx-press');
      var rect = b.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var r = document.createElement('span');
      r.className = 'fx-ripple';
      r.style.width = r.style.height = size + 'px';
      r.style.left = (ev.clientX - rect.left - size / 2) + 'px';
      r.style.top = (ev.clientY - rect.top - size / 2) + 'px';
      b.appendChild(r);
      setTimeout(function () { r.remove(); }, 700);
    }, true);
  });
})();