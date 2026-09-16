/* site-effects.js — site-wide scroll / click / text effects.
   Progressive enhancement: adds [data-fx] attributes + .fx-* classes at runtime.
   If JS or this file fail to load, the site renders exactly as before.
   Respects prefers-reduced-motion. Idempotent. */
(function () {
  'use strict';
  if (window.__fxBooted) return;
  window.__fxBooted = true;

  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ---- inject stylesheet once ---- */
  if (!document.getElementById('fx-css')) {
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

    /* ---------- scroll reveal ---------- */
    var revealSel = [
      'main > section', 'main > article', 'main > div',
      'main h1', 'main h2', 'main h3',
      '[class*="card"]', '.glass-card-3d',
      '.footer-col'
    ].join(',');

    /* ---------- flip tiles own their transforms ----------
       .flip-card* / .inventory-flip-* spin with rotateY(180deg) when clicked.
       The reveal + tilt effects below would otherwise write transforms onto
       those very elements: an inline transform on .flip-card-inner beats the
       "flipped" stylesheet rule, so the tile would wobble with the pointer
       instead of flipping, and the reveal transform would wipe the
       rotateY(180deg) that hides the back face. Skip them entirely.
       Click behaviour lives in /assets/js/flip-cards.js. */
    var FLIP_SEL = '.flip-card, .flip-card-container, .flip-card-inner, .flip-card-front, .flip-card-back, ' +
      '.inventory-flip-card, .inventory-flip-inner, .inventory-flip-front, .inventory-flip-back';
    function isFlip(el) {
      try { return !!(el && el.closest && el.closest(FLIP_SEL)); } catch (e) { return false; }
    }

    var io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('fx-in');
            io.unobserve(en.target);
          }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
    }

    var groups = new Map(); // parent -> count (for stagger delays)
    function tag(el, kind, i) {
      if (el.hasAttribute('data-fx')) return;
      el.setAttribute('data-fx', kind);
      var parent = el.parentElement;
      if (parent) {
        var n = (groups.get(parent) || 0);
        groups.set(parent, n + 1);
        var d = Math.min(n * 70, 420);
        if (d) el.style.transitionDelay = d + 'ms';
      }
      if (io) io.observe(el);
      else el.classList.add('fx-in');
    }

    try {
      main.querySelectorAll(':scope > section, :scope > article, :scope > div')
        .forEach(function (el) { tag(el, 'up'); });
      main.querySelectorAll('h1, h2, h3').forEach(function (el) { tag(el, 'up'); });
      document.querySelectorAll('.footer-col').forEach(function (el, i) {
        tag(el, i % 2 === 0 ? 'left' : 'right');
      });
      main.querySelectorAll('[class*="card"], .glass-card-3d').forEach(function (el) {
        if (isFlip(el)) return;
        tag(el, 'zoom');
      });
    } catch (e) {}

    /* Safety net: if anything was tagged but never intersected (e.g. layout
       surprise), reveal it shortly after so nothing stays invisible. */
    setTimeout(function () {
      document.querySelectorAll('[data-fx]:not(.fx-in)').forEach(function (el) {
        el.classList.add('fx-in');
      });
    }, 2600);

    /* ---------- 3D tilt on cards (pointer:fine devices only) ---------- */
    var finePointer = false;
    try { finePointer = window.matchMedia('(pointer: fine)').matches; } catch (e) {}
    if (finePointer) {
      var tilts = document.querySelectorAll('[class*="card"], .glass-card-3d');
      tilts.forEach(function (el) {
        if (el.hasAttribute('data-fx-tilt')) return;
        if (isFlip(el)) return; // no hover rotation on flip tiles
        el.setAttribute('data-fx-tilt', '1');
        el.classList.add('fx-tilt');
        el.addEventListener('mousemove', function (ev) {
          var r = el.getBoundingClientRect();
          var x = (ev.clientX - r.left) / r.width - 0.5;
          var y = (ev.clientY - r.top) / r.height - 0.5;
          el.classList.add('fx-tilt-on');
          el.style.transform = 'perspective(900px) rotateY(' + (x * 7).toFixed(2) + 'deg) rotateX(' + (-y * 7).toFixed(2) + 'deg) translateY(-4px)';
        });
        el.addEventListener('mouseleave', function () {
          el.classList.remove('fx-tilt-on');
          el.style.transform = '';
        });
      });
    }

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