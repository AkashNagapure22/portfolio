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

  /* ---------- big transparent header (matches the footer) ----------
     Runs on every page, and even with reduced motion: transparency and
     sizing are not motion. Tags the top navigation bar with .fx-header,
     upgrades its size utilities, tags text links for the glow effect,
     and pads <main> so nothing hides under the taller fixed bar. */
  function upgradeHeaders() {
    try {
      var SIZE_MAP = {
        'h-16': 'h-24', 'h-12': 'h-16',
        'py-3.5': 'py-6', 'py-3': 'py-6', 'py-4': 'py-6',
        'h-9': 'h-14', 'w-9': 'w-14', 'w-10': 'w-14', 'h-10': 'h-14',
        'text-base': 'text-lg', 'sm:text-base': 'sm:text-xl',
        'text-[9px]': 'text-xs', 'text-[10px]': 'text-xs'
      };
      document.querySelectorAll('body > header, body > nav').forEach(function (h) {
        if (h.classList.contains('fx-header')) return;
        h.classList.add('fx-header');

        /* bigger bar: swap size utilities in a single pass (no chained swaps) */
        h.querySelectorAll('*').forEach(function (el) {
          var toks = Array.prototype.slice.call(el.classList);
          toks.forEach(function (t) {
            if (SIZE_MAP[t] && !el.classList.contains(SIZE_MAP[t])) {
              el.classList.replace(t, SIZE_MAP[t]);
            }
          });
          /* nav links: text-xs -> text-sm so words get bigger */
          if ((el.tagName === 'A' || el.tagName === 'BUTTON') && el.classList.contains('text-xs')) {
            el.classList.replace('text-xs', 'text-sm');
          }
        });

        /* word effect: glowing gradient underline on text nav links */
        h.querySelectorAll('a').forEach(function (a) {
          if (a.querySelector('img') || a.classList.contains('fx-nav-link')) return;
          a.classList.add('fx-nav-link');
        });
      });

      /* fixed bars are taller now — keep content clear of them */
      var bar = document.querySelector('body > .fx-header');
      var m = document.querySelector('main');
      if (bar && m) {
        var pos = getComputedStyle(bar).position;
        if (pos === 'fixed' || pos === 'sticky') {
          var pad = function () { m.style.paddingTop = (bar.offsetHeight + 40) + 'px'; };
          pad();
          setTimeout(pad, 350);  /* re-measure after Tailwind/webfonts settle */
          setTimeout(pad, 1000);
          window.addEventListener('resize', pad);
        }
      }

      /* transparent at rest like the footer; gentle scrim only while scrolled */
      var bars = document.querySelectorAll('.fx-header');
      if (bars.length) {
        var onScroll = function () {
          var sc = (window.pageYOffset || document.documentElement.scrollTop || 0) > 40;
          bars.forEach(function (b) { b.classList.toggle('fx-scrolled', sc); });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
      }
    } catch (e) {}
  }
  ready(upgradeHeaders);

  if (reduce) return;

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var main = document.querySelector('main') || document.body;

    /* ---------- text colour effect: shimmer every gradient headline ---------- */
    try {
      document.querySelectorAll('[class*="bg-clip-text"]:not(.cookie-title)').forEach(function (el) {
        el.classList.add('fx-shimmer');
      });
    } catch (e) {}

    /* ---------- word effect: word-by-word rise on page titles ----------
       Splits direct text nodes of every <h1> into .fx-word spans and tags
       element children (gradient words, icons) as single units. Words
       cascade in when the title scrolls into view ([data-fx] + .fx-in)
       and glow on hover. Gradient (bg-clip-text) children stay whole so
       their background-clip:text rendering is never broken. */
    try {
      var wIdx = 0;
      main.querySelectorAll('h1').forEach(function (h) {
        if (h.hasAttribute('data-fx-words')) return;
        h.setAttribute('data-fx-words', '1');
        wIdx = 0;
        Array.prototype.slice.call(h.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            if (!n.textContent.trim()) return;
            var frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (w) {
              if (!w) return;
              if (!w.trim()) { frag.appendChild(document.createTextNode(w)); return; }
              var s = document.createElement('span');
              s.className = 'fx-word';
              s.textContent = w;
              s.style.setProperty('--fx-w', wIdx++);
              frag.appendChild(s);
            });
            h.replaceChild(frag, n);
          } else if (n.nodeType === 1 && !n.classList.contains('fx-word')) {
            n.classList.add('fx-word');
            n.style.setProperty('--fx-w', wIdx++);
          }
        });
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
