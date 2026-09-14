/* template-loader.js — runtime guarantee that the canonical footer+cookie
   and 3D square background are present on EVERY page, without fail.
   1) Self-heals #three-bg-canvas / #cursor-trail-canvas + loads 3d-background.js
   2) Fetches /template/footer-template.html and swaps/creates #site-footer + #cookie-banner
   3) Loads /assets/js/footer-common.js for subscribe + cookie behaviour.
   Safe to include on all pages. Idempotent. */
(function () {
  'use strict';
  if (window.__tplBooted) return;
  window.__tplBooted = true;
  var FOOTER_URLS = ['/template/footer-template.html', '/Sub_Pages/footer-template.html'];
  var BG_JS = '/assets/js/3d-background.js';
  var COMMON_JS = '/assets/js/footer-common.js';
  function loadScript(src, id) {
    if (id && document.getElementById(id)) return;
    if (document.querySelector('script[src=\"' + src + '\"]')) return;
    var s = document.createElement('script');
    if (id) s.id = id;
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
    loadScript(BG_JS, 'bg3d-js');
  }
  function wireSubscribe(root) {
    var form = (root && root.querySelector ? root.querySelector('#footer-subscribe-form') : null) || document.getElementById('footer-subscribe-form');
    if (!form || form.__wired) return;
    form.__wired = true;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (window.handleFooterSubscribe) window.handleFooterSubscribe(form);
    });
  }
  function swapFooter(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    var newFooter = tmp.querySelector('footer');
    var newCookie = tmp.querySelector('#cookie-banner');
    var cur = document.getElementById('site-footer') || document.querySelector('footer');
    if (newFooter) {
      if (cur) cur.replaceWith(newFooter);
      else {
        var anchor = document.getElementById('cookie-banner') || document.querySelector('script[src*=\"footer-common\"]') || null;
        if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(newFooter, anchor);
        else document.body.appendChild(newFooter);
      }
    }
    var curCookie = document.getElementById('cookie-banner');
    if (newCookie) {
      if (curCookie) curCookie.replaceWith(newCookie);
      else {
        var f = document.getElementById('site-footer') || document.querySelector('footer');
        if (f && f.parentNode) f.parentNode.insertBefore(newCookie, f.nextSibling);
        else document.body.appendChild(newCookie);
      }
    }
    wireSubscribe(document);
    if (window.lucide && window.lucide.createIcons) { try { window.lucide.createIcons(); } catch (e) {} }
  }
  function fetchFooter(i) {
    i = i || 0;
    if (i >= FOOTER_URLS.length) { wireSubscribe(document); return; }
    fetch(FOOTER_URLS[i], { credentials: 'same-origin' }).then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.text();
    }).then(function (html) {
      if (html && html.indexOf('<footer') !== -1) swapFooter(html);
      else fetchFooter(i + 1);
    }).catch(function () { fetchFooter(i + 1); });
  }
  function boot() {
    ensureBg();
    loadScript(COMMON_JS, 'footer-common-js');
    fetchFooter(0);
    setTimeout(function () { wireSubscribe(document); }, 1500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
