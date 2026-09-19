/* template-loader.js — runtime safety net for the canonical footer+cookie and
   3D square background. Every page already ships these inline (via
   tools/apply-templates.mjs). This loader NEVER replaces an existing footer or
   cookie banner (replacing caused the cookie prompt to appear then vanish within
   a second, and could leave a stray glowing horizontal strip). It only:
     1) Self-heals missing #three-bg-canvas / #cursor-trail-canvas + loads 3d-background.js
     2) Loads footer-common.js once
     3) ADDS footer/cookie ONLY if they are missing. Idempotent. */
(function () {
  'use strict';
  if (window.__tplBooted) return;
  window.__tplBooted = true;
  var FOOTER_URLS = ['/template/footer-template.html'];
  var BG_JS = '/assets/js/3d-background.js';
  var COMMON_JS = '/assets/js/footer-common.js';

  function loadScript(src) {
    if (document.querySelector('script[src="' + src + '"]')) return;
    var s = document.createElement('script');
    s.src = src; s.defer = true;
    document.body.appendChild(s);
  }

  function ensureBg() {
    var bg = document.getElementById('three-bg-canvas');
    if (!bg) {
      bg = document.createElement('canvas');
      bg.id = 'three-bg-canvas';
      bg.setAttribute('aria-hidden', 'true');
      document.body.insertBefore(bg, document.body.firstChild);
    }
    var trail = document.getElementById('cursor-trail-canvas');
    if (!trail) {
      trail = document.createElement('canvas');
      trail.id = 'cursor-trail-canvas';
      trail.setAttribute('aria-hidden', 'true');
      bg.parentNode.insertBefore(trail, bg.nextSibling);
    }
    loadScript(BG_JS);
  }

  function wireSubscribe() {
    var form = document.getElementById('footer-subscribe-form');
    if (!form || form.__wired) return;
    form.__wired = true;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (window.handleFooterSubscribe) window.handleFooterSubscribe(form);
    });
  }

  function ensureParts() {
    var needsFooter = !document.getElementById('site-footer') && !document.querySelector('footer');
    var needsCookie = !document.getElementById('cookie-banner');
    if (!needsFooter && !needsCookie) { wireSubscribe(); return; }
    fetchParts(0, needsFooter, needsCookie);
  }

  function fetchParts(i, needsFooter, needsCookie) {
    if (i >= FOOTER_URLS.length) { fallbackParts(needsFooter, needsCookie); return; }
    fetch(FOOTER_URLS[i], { credentials: 'same-origin' }).then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.text();
    }).then(function (html) {
      var applied = applyParts(html, needsFooter, needsCookie);
      if (!applied) fetchParts(i + 1, needsFooter, needsCookie);
      else wireSubscribe();
    }).catch(function () { fetchParts(i + 1, needsFooter, needsCookie); });
  }

  function applyParts(html, needsFooter, needsCookie) {
    if (html.indexOf('<footer') === -1) return false;
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    var applied = false;
    var bootRef = document.getElementById('cookie-banner')
      || document.querySelector('script[src*="footer-common"]')
      || document.body.lastElementChild;
    if (needsFooter) {
      var newFooter = tmp.querySelector('footer');
      if (newFooter) {
        if (bootRef && bootRef.parentNode) bootRef.parentNode.insertBefore(newFooter, bootRef);
        else document.body.appendChild(newFooter);
        applied = true;
      }
    }
    if (needsCookie) {
      var newCookie = tmp.querySelector('#cookie-banner');
      if (newCookie) {
        var f = document.getElementById('site-footer') || document.querySelector('footer');
        if (f && f.parentNode) f.parentNode.insertBefore(newCookie, f.nextSibling);
        else document.body.appendChild(newCookie);
        applied = true;
      }
    }
    return applied;
  }

  function fallbackParts(needsFooter, needsCookie) {
    if (needsCookie && !document.getElementById('cookie-banner')) {
      var b = document.createElement('div');
      b.id = 'cookie-banner';
      b.className = 'cookie-banner';
      b.innerHTML = '<div class="cookie-content"><div class="cookie-text"><p>By clicking &quot;Accept all cookies&quot; you consent to cookies being stored on your device to improve website functionality and analyze site usage.</p></div></div>' +
        '<div class="cookie-actions"><button id="deny-cookies-btn" type="button" class="btn btn-decline">Decline</button>' +
        '<button id="accept-cookies-btn" type="button" class="btn btn-accept">Accept all cookies</button></div>';
      document.body.appendChild(b);
    }
    if (needsFooter && !document.getElementById('footer-subscribe-form')) {
      var f = document.createElement('footer');
      f.id = 'site-footer';
      f.className = 'w-full bg-transparent border-t border-sky-500/20 relative z-10';
      f.innerHTML = '<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">' +
        '<p class="text-slate-500 text-sm">&copy; 2026 Akash Nagapure. All Rights Reserved.</p></div>';
      document.body.appendChild(f);
    }
    wireSubscribe();
  }

  function boot() {
    loadScript(COMMON_JS);
    ensureBg();
    setTimeout(ensureParts, 0);
    setTimeout(wireSubscribe, 1200);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();