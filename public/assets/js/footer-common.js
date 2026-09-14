/* ============================================================
   footer-common.js — single source of truth for footer behaviour
   (toast notifications, newsletter subscribe, cookie consent)
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- Toast notifications ---------------- */
  function showToast(msg, type) {
    var toast = document.getElementById('subscribe-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'subscribe-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      toast.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99999;max-width:340px;padding:14px 18px;border-radius:12px;font-family:JetBrains Mono,monospace;font-size:13px;line-height:1.4;color:#fff;box-shadow:0 12px 35px rgba(0,0,0,.55);opacity:0;transform:translateY(12px);transition:opacity .3s ease,transform .3s ease;pointer-events:none;display:flex;align-items:center;gap:10px;';
      document.body.appendChild(toast);
    }
    var colors = { success: 'linear-gradient(135deg,#065f46,#0ea5e9)', warn: 'linear-gradient(135deg,#78350f,#d97706)', error: 'linear-gradient(135deg,#7f1d1d,#ef4444)' };
    var icons = { success: '\u2713', warn: '\u24d8', error: '\u2715' };
    toast.style.background = colors[type] || colors.success;
    toast.innerHTML = '<span style="font-size:16px">' + (icons[type] || icons.success) + '</span><span>' + msg + '</span>';
    requestAnimationFrame(function () { toast.style.opacity = '1'; toast.style.transform = 'translateY(0)'; });
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toast.style.opacity = '0'; toast.style.transform = 'translateY(12px)'; }, 3800);
  }
  window.showToast = showToast;

  /* ---------------- Newsletter subscribe ---------------- */
  function handleFooterSubscribe(form) {
    var emailInput = form.querySelector('input[type="email"]');
    var email = emailInput ? emailInput.value.trim() : '';
    var btn = form.querySelector('button');
    if (!email) { showToast('Please enter your email address.', 'warn'); return; }
    if (btn) { btn.textContent = 'Subscribing...'; btn.disabled = true; }
    fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var msg, kind, label;
        if (data.success && data.alreadySubscribed) {
          msg = 'You are already subscribed with ' + email + '!'; kind = 'warn'; label = 'Already Subscribed';
        } else if (data.success) {
          msg = 'Subscribed successfully! Welcome aboard!'; kind = 'success'; label = 'Subscribed!';
        } else {
          msg = data.error || 'Subscription failed. Please try again.'; kind = 'error'; label = 'Failed';
        }
        showToast(msg, kind);
        if (emailInput) emailInput.value = '';
        if (btn) { btn.textContent = label; setTimeout(function () { btn.textContent = 'Subscribe'; }, 3200); }
      })
      .catch(function () {
        showToast('Network error - could not subscribe. Try again.', 'error');
        if (btn) { btn.textContent = 'Error'; setTimeout(function () { btn.textContent = 'Subscribe'; }, 2500); }
      })
      .finally(function () { if (btn) btn.disabled = false; });
  }
  window.handleFooterSubscribe = handleFooterSubscribe;

  /* ---------------- Cookie consent ---------------- */
  var COOKIE_KEY = 'cookie_consent';

  function safeStorage(key, value) {
    try { if (value === undefined) return localStorage.getItem(key); localStorage.setItem(key, value); }
    catch (e) { /* storage unavailable */ }
  }

  function injectCookieCss() {
    if (document.getElementById('footer-common-cookie-css')) return;
    var css = document.createElement('style');
    css.id = 'footer-common-cookie-css';
    css.textContent =
      /* Square cookie card, right-side, with text animations/effects (images untouched) */
      '.cookie-banner{position:fixed;right:20px;bottom:20px;width:290px;max-width:calc(100vw - 32px);background:rgba(15,23,42,.94);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(56,189,248,.4);border-radius:13px;padding:18px 20px;z-index:99999;font-family:inherit;box-shadow:0 16px 50px rgba(2,6,23,.65),0 0 22px rgba(56,189,248,.18);opacity:0;transform:translateY(22px) scale(.95) rotate(-1deg);transition:opacity .5s cubic-bezier(.16,1,.3,1),transform .5s cubic-bezier(.16,1,.3,1);display:flex;flex-direction:column;gap:12px}' +
      '.cookie-banner.show{opacity:1;transform:translateY(0) scale(1) rotate(0deg)}' +
      '.cookie-head{display:flex;align-items:center;gap:10px;animation:bannerFadeIn .6s ease both}' +
      '@keyframes bannerFadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}' +
      '.cookie-icon{font-size:22px;color:#38bdf8;filter:drop-shadow(0 0 10px rgba(56,189,248,.7));transition:filter .3s ease;flex-shrink:0}' +
      '.cookie-title{font-size:14px;font-weight:800;letter-spacing:.3px;background:linear-gradient(120deg,#38bdf8 0%,#818cf8 50%,#c084fc 100%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:shimmer 3.5s linear infinite;line-height:1.35}' +
      '@keyframes shimmer{to{background-position:200% center}}' +
      '.cookie-title-fallback{color:#fff;font-weight:800;text-shadow:0 0 14px rgba(56,189,248,.4)}' +
      '.cookie-text{font-size:12px;color:#cbd5e1;line-height:1.6;animation:textFadeIn .7s .12s ease both;opacity:0}' +
      '@keyframes textFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}' +
      '.cookie-text p{margin:0 0 6px;transition:color .3s ease;word-spacing:.3px;animation:textGlow 4s ease-in-out infinite alternate}' +
      '@keyframes textGlow{from{text-shadow:0 0 2px rgba(203,213,225,.08)}to{text-shadow:0 0 9px rgba(56,189,248,.22)}}' +
      '.cookie-text p:hover{color:#e2e8f0}' +
      '.cookie-text a{color:#38bdf8;text-decoration:none;font-weight:600;position:relative;transition:color .3s ease,letter-spacing .3s ease;animation:linkFadeIn .6s .22s ease both;opacity:0;display:inline-block}' +
      '@keyframes linkFadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}' +
      '.cookie-text a::before{content:"";position:absolute;left:0;bottom:-2px;width:0;height:2px;background:linear-gradient(90deg,#38bdf8,#818cf8,#c084fc);transition:width .3s ease;border-radius:2px;box-shadow:0 0 6px rgba(56,189,248,.5)}' +
      '.cookie-text a:hover{color:#a78bfa;text-shadow:0 0 10px rgba(167,139,250,.5);letter-spacing:.5px}' +
      '.cookie-text a:hover::before{width:100%}' +
      '.cookie-text a::after{content:"";position:absolute;inset:-3px;border:1px solid rgba(56,189,248,.15);border-radius:6px;opacity:0;transition:opacity .3s ease;pointer-events:none}' +
      '.cookie-text a:hover::after{opacity:1;animation:pulseBorder 1.5s ease-in-out infinite}' +
      '@keyframes pulseBorder{0%,100%{box-shadow:0 0 4px rgba(56,189,248,.2)}50%{box-shadow:0 0 10px rgba(56,189,248,.4)}}' +
      '.cookie-actions{display:flex;flex-direction:column;gap:8px;margin-top:2px;animation:actionsSlideIn .5s .2s ease both;opacity:0;transform:translateY(8px)}' +
      '@keyframes actionsSlideIn{from{opacity:0;transform:translateY(10px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}' +
      '.cookie-banner .btn{width:100%;padding:10px 14px;border-radius:10px;font-size:12.5px;font-weight:700;cursor:pointer;border:none;transition:all .25s ease;position:relative;overflow:hidden;text-transform:uppercase;letter-spacing:.3px}' +
      '.cookie-banner .btn::before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.1),transparent 60%);opacity:0;transition:opacity .3s ease;pointer-events:none}' +
      '.cookie-banner .btn:hover::before{opacity:1}' +
      '.cookie-banner .btn-decline{background:#1e293b;color:#94a3b8;border:1px solid #334155;box-shadow:0 2px 8px rgba(0,0,0,.25)}' +
      '.cookie-banner .btn-decline:hover{background:#334155;color:#e2e8f0;box-shadow:0 4px 14px rgba(0,0,0,.35);transform:translateY(-1px)}' +
      '.cookie-banner .btn-decline:active{transform:translateY(0) scale(.97)}' +
      '.cookie-banner .btn-accept{background:linear-gradient(135deg,#38bdf8,#6366f1);color:#fff;box-shadow:0 6px 18px rgba(56,189,248,.35);text-shadow:0 1px 2px rgba(0,0,0,.2)}' +
      '.cookie-banner .btn-accept:hover{filter:brightness(1.12);box-shadow:0 8px 24px rgba(56,189,248,.5);transform:translateY(-1px);text-shadow:0 2px 4px rgba(0,0,0,.3)}' +
      '.cookie-banner .btn-accept:active{transform:translateY(0) scale(.97)}' +
      '@media(max-width:640px){.cookie-banner{right:12px;left:12px;width:auto;bottom:12px;padding:16px;animation:none}.cookie-title{font-size:13.5px}.cookie-text{font-size:11.5px}}';
    document.head.appendChild(css);
  }

  function hideBanner(banner) {
    banner.style.transition = 'opacity .3s ease';
    banner.style.opacity = '0';
    setTimeout(function () { banner.style.display = 'none'; }, 300);
  }

  function wireCookies() {
    var banner = document.getElementById('cookie-banner');
    var acceptBtn = document.getElementById('accept-cookies-btn');
    var denyBtn = document.getElementById('deny-cookies-btn');

    var consent = safeStorage(COOKIE_KEY);

    if (consent && banner) { banner.style.display = 'none'; }
    else if (banner) { setTimeout(function () { banner.classList.add('show'); }, 1000); }

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        safeStorage(COOKIE_KEY, 'accepted');
        if (banner) hideBanner(banner);
        showToast('Preferences saved - cookies accepted. Thank you!', 'success');
      });
    }
    if (denyBtn) {
      denyBtn.addEventListener('click', function () {
        safeStorage(COOKIE_KEY, 'denied');
        if (banner) hideBanner(banner);
        showToast('Preferences saved - only essential cookies will be used.', 'warn');
      });
    }
  }

  /* ---------------- Wire up when ready ---------------- */
  function onReady(fn) {
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', fn); }
    else { fn(); }
  }

  onReady(function () {
    injectCookieCss();
    wireCookies();
    var form = document.getElementById('footer-subscribe-form');
    if (form && !form.dataset.commonWired) {
      form.dataset.commonWired = '1';
      form.addEventListener('submit', function (e) { e.preventDefault(); handleFooterSubscribe(form); });
    }
  });
})();
