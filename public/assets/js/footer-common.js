/* ============================================================
   footer-common.js — single source of truth for footer behaviour
   (toast notifications, newsletter subscribe, cookie consent)
   Loaded by every page via <script src="/assets/js/footer-common.js"></script>
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

    function injectCookieCss() {
    if (document.getElementById('footer-common-cookie-css')) return;
    var css = document.createElement('style');
    css.id = 'footer-common-cookie-css';
    css.textContent =
      /* Compact square card, anchored bottom-right (was a full-width bottom bar) */
      '.cookie-banner{position:fixed;right:18px;bottom:18px;width:320px;max-width:calc(100vw - 32px);background:rgba(15,23,42,.92);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(56,189,248,.35);border-radius:18px;padding:18px;z-index:99999;font-family:inherit;box-shadow:0 18px 50px rgba(2,6,23,.6),0 0 26px rgba(56,189,248,.18);opacity:0;transform:translateY(26px) scale(.96);transition:opacity .5s ease,transform .5s cubic-bezier(.16,1,.3,1);display:flex;flex-direction:column;gap:12px}' +
      '.cookie-banner.show{opacity:1;transform:translateY(0) scale(1)}' +
      '.cookie-head{display:flex;align-items:center;gap:10px}' +
      '.cookie-icon{font-size:24px;color:#38bdf8;filter:drop-shadow(0 0 8px rgba(56,189,248,.6))}' +
      '.cookie-title{font-size:14px;font-weight:700;color:#fff;letter-spacing:.2px}' +
      '.cookie-text{font-size:12.5px;color:#cbd5e1;line-height:1.55}' +
      '.cookie-text p{margin:0 0 6px}' +
      '.cookie-text a{color:#38bdf8;text-decoration:none;font-weight:600}' +
      '.cookie-text a:hover{text-decoration:underline}' +
      '.cookie-actions{display:flex;flex-direction:column;gap:8px;margin-top:2px}' +
      '.cookie-banner .btn{width:100%;padding:10px 14px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .2s ease}' +
      '.cookie-banner .btn-decline{background:#1e293b;color:#94a3b8;border:1px solid #334155}' +
      '.cookie-banner .btn-decline:hover{background:#334155;color:#e2e8f0}' +
      '.cookie-banner .btn-accept{background:linear-gradient(135deg,#38bdf8,#6366f1);color:#fff;box-shadow:0 6px 18px rgba(56,189,248,.35)}' +
      '.cookie-banner .btn-accept:hover{filter:brightness(1.08)}' +
      '@media(max-width:640px){.cookie-banner{right:12px;left:12px;width:auto;bottom:12px;padding:16px}}';
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

    /* Clone-replace buttons: sheds any legacy duplicate listeners */
    if (acceptBtn) { var a2 = acceptBtn.cloneNode(true); acceptBtn.parentNode.replaceChild(a2, acceptBtn); acceptBtn = a2; }
    if (denyBtn) { var d2 = denyBtn.cloneNode(true); denyBtn.parentNode.replaceChild(d2, denyBtn); denyBtn = d2; }

    var consent = null;
    try { consent = localStorage.getItem(COOKIE_KEY); } catch (e) { /* storage unavailable */ }

    if (consent && banner) { banner.style.display = 'none'; }
    else if (banner) { setTimeout(function () { banner.classList.add('show'); }, 1000); }

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        try { localStorage.setItem(COOKIE_KEY, 'accepted'); } catch (e) { }
        if (banner) hideBanner(banner);
        showToast('Preferences saved - cookies accepted. Thank you!', 'success');
      });
    }
    if (denyBtn) {
      denyBtn.addEventListener('click', function () {
        try { localStorage.setItem(COOKIE_KEY, 'denied'); } catch (e) { }
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
