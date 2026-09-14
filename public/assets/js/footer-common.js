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
      '.cookie-banner{position:fixed;bottom:0;left:0;width:100%;background:rgba(15,23,42,.95);backdrop-filter:blur(10px);border-top:2px solid #38bdf8;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;gap:20px;box-shadow:0 -4px 20px rgba(0,0,0,.5);z-index:99999;font-family:inherit;transform:translateY(100%);transition:transform .4s ease}' +
      '.cookie-banner.show{transform:translateY(0)}' +
      '.cookie-content{display:flex;align-items:center;gap:16px;flex:1}' +
      '.cookie-icon{font-size:28px;color:#38bdf8}' +
      '.cookie-text{font-size:13px;color:#cbd5e1;line-height:1.5;max-width:640px}' +
      '.cookie-text a{color:#38bdf8;text-decoration:none}.cookie-text a:hover{text-decoration:underline}' +
      '.cookie-actions{display:flex;gap:10px}' +
      '.cookie-banner .btn{padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .2s ease}' +
      '.cookie-banner .btn-decline{background:#1e293b;color:#94a3b8;border:1px solid #334155}.cookie-banner .btn-decline:hover{background:#334155}' +
      '.cookie-banner .btn-accept{background:#38bdf8;color:#fff}.cookie-banner .btn-accept:hover{background:#0ea5e9}' +
      '@media(max-width:640px){.cookie-banner{flex-direction:column;text-align:center;padding:12px}.cookie-content{flex-direction:column;gap:8px}.cookie-actions{width:100%;justify-content:center}}';
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
