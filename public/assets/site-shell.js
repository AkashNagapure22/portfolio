window.SITE_EMAIL = 'info@akashnagapure.in';

function initGlobalCursorTrail() {
  if (document.querySelector('#site-global-cursor-canvas')) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'site-global-cursor-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100vw',
    height: '100vh',
    pointerEvents: 'none',
    zIndex: '99999',
    display: 'block'
  });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const trailCount = 18;
  const points = Array.from({ length: trailCount }, () => ({ x: window.innerWidth / 2, y: window.innerHeight / 2, dx: 0, dy: 0 }));
  let width = window.innerWidth;
  let height = window.innerHeight;
  let mouse = { x: width / 2, y: height / 2 };

  const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };

  const updatePointer = (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  };

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', updatePointer, { passive: true });
  window.addEventListener('touchmove', (event) => {
    if (event.touches && event.touches[0]) {
      mouse.x = event.touches[0].clientX;
      mouse.y = event.touches[0].clientY;
    }
  }, { passive: true });
  resize();

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    for (let i = 0; i < points.length; i += 1) {
      const current = points[i];
      if (i === 0) {
        current.dx += (mouse.x - current.x) * 0.18;
        current.dx *= 0.52;
        current.x += current.dx;
        current.dy += (mouse.y - current.y) * 0.18;
        current.dy *= 0.52;
        current.y += current.dy;
        ctx.moveTo(current.x, current.y);
      } else {
        const previous = points[i - 1];
        current.dx += (previous.x - current.x) * 0.18;
        current.dx *= 0.52;
        current.x += current.dx;
        current.dy += (previous.y - current.y) * 0.18;
        current.dy *= 0.52;
        current.y += current.dy;
        ctx.lineTo(current.x, current.y);
      }
    }
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGlobalCursorTrail, { once: true });
} else {
  initGlobalCursorTrail();
}

window.SITE_NAV_ITEMS = [
  { label: 'Home', href: '/', slug: 'home' },
  { label: 'Blogs', href: '/Blogs/index.html', slug: 'blogs' },
  { label: 'Projects', href: '/Sub_Pages/Projects.html', slug: 'projects' },
  { label: 'Skills', href: '/Sub_Pages/Skills.html', slug: 'skills' },
  { label: 'Reading', href: '/Sub_Pages/Reading.html', slug: 'reading' },
  { label: 'Coins', href: '/Sub_Pages/Coins.html', slug: 'coins' },
  { label: 'HomeLab', href: '/Sub_Pages/HomeLab.html', slug: 'homelab' },
  { label: 'Resume', href: '/Sub_Pages/resume.html', slug: 'resume' }
];

window.SITE_SEARCH_INDEX = [
  { title: 'Windows Autopatch & Hotpatch', url: '/Blogs/Autopatchblog.html', keywords: 'autopatch hotpatch intune windows updates' },
  { title: 'SCCM Application Model Design', url: '/Blogs/sccm-application-model.html', keywords: 'sccm application model detection dependency supersedence packaging' },
  { title: 'SCCM Content Distribution', url: '/Blogs/sccm-content-distribution.html', keywords: 'sccm content distribution point boundary transfer logs' },
  { title: 'SCCM Hardware Inventory', url: '/Blogs/sccm-hardware-inventory.html', keywords: 'sccm hardware inventory wmi collection reporting' },
  { title: 'SCCM Client Health Remediation', url: '/Blogs/sccm-client-health-remediation.html', keywords: 'sccm client health ccmexec remediation policy inventory' },
  { title: 'SCCM to Intune Migration Guardrails', url: '/Blogs/sccm-intune-migration-guardrails.html', keywords: 'sccm intune migration guardrails workloads pilot rollback' },
  { title: 'SCCM OSD Engineering', url: '/Blogs/sccm-osd-engineering.html', keywords: 'sccm osd operating system deployment task sequence drivers' },
  { title: 'SCCM Patch Management Lifecycle', url: '/Blogs/sccm-patch-management-lifecycle.html', keywords: 'sccm patch management software updates compliance rings' },
  { title: 'Intune Win32 Packaging', url: '/Blogs/intune-win32-packaging.html', keywords: 'win32 intune package deployment app' },
  { title: 'Intune Deployment Rings', url: '/Blogs/intune-advanced-deployment-rings.html', keywords: 'intune rings deployment update rollout' },
  { title: 'Intune Compliance Policy Architecture', url: '/Blogs/intune-compliance-policies.html', keywords: 'intune compliance policy conditional access remediation' },
  { title: 'Autopilot Troubleshooting', url: '/Blogs/intune-autopilot-troubleshooting.html', keywords: 'intune autopilot enrollment esp troubleshooting' },
  { title: 'PowerShell Compliance Automation', url: '/Blogs/powershell-compliance-automation.html', keywords: 'powershell compliance automation endpoint' },
  { title: 'PowerShell Intune Reporting', url: '/Blogs/powershell-intune-reporting.html', keywords: 'powershell intune graph reporting' },
  { title: 'PowerShell Remediation Scripts', url: '/Blogs/powershell-remediation-scripts.html', keywords: 'powershell remediation detection idempotent scripts' },
  { title: 'PowerShell Graph Authentication', url: '/Blogs/powershell-graph-authentication.html', keywords: 'powershell graph authentication permissions security' },
  { title: 'PowerShell Device Inventory', url: '/Blogs/powershell-device-inventory.html', keywords: 'powershell device inventory endpoint signals' },
  { title: 'Privacy Policy', url: '/Sub_Pages/privacy.html', keywords: 'privacy cookies data policy' },
  { title: 'Terms of Service', url: '/Sub_Pages/terms.html', keywords: 'terms service legal' },
  { title: 'Home', url: '/', keywords: 'home architecture portfolio' }
];

function resolveActiveNav() {
  const pathname = window.location.pathname.toLowerCase();
  const match = pathname.replace(/\/+$/, '');
  if (!match || match === '/') return 'home';
  if (match.includes('/blogs')) return 'blogs';
  if (match.includes('/sub_pages/projects')) return 'projects';
  if (match.includes('/sub_pages/skills')) return 'skills';
  if (match.includes('/sub_pages/reading')) return 'reading';
  if (match.includes('/sub_pages/coins')) return 'coins';
  if (match.includes('/sub_pages/homelab')) return 'homelab';
  if (match.includes('/sub_pages/resume')) return 'resume';
  return 'home';
}

function injectHeader() {
  document.querySelectorAll('[data-site-header]').forEach((node) => {
    const activeSlug = resolveActiveNav();
    const navMarkup = window.SITE_NAV_ITEMS.map((item) => `
      <a class="nav-link ${activeSlug === item.slug ? 'is-active' : ''}" href="${item.href}">${item.label}</a>
    `).join('');

    node.innerHTML = `
      <header class="site-header">
        <div class="inner">
          <a class="brand" href="/" aria-label="Home">
            <span class="brand-mark"><img src="/images/Main_Page_Images/Logo.avif" alt="Akash Nagapure logo" width="42" height="42" /></span>
            <span class="brand-copy"><strong>Akash Nagapure</strong><span>Fleet Architect</span></span>
          </a>
          <nav class="main-nav" aria-label="Main navigation">${navMarkup}</nav>
          <div class="site-actions">
            <a class="icon-button" href="/" aria-label="Home"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/></svg></a>
            <div class="search-shell">
              <svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="6"/><path d="M16 16 21 21"/></svg>
              <input id="site-search" type="search" placeholder="Quick search..." aria-label="Search site" />
              <div id="site-search-results" class="search-results" aria-live="polite"></div>
            </div>
          </div>
        </div>
      </header>
    `;
  });
  bindGlobalSearch();
}

function injectFooter() {
  document.querySelectorAll('[data-site-footer]').forEach((node) => {
    const year = new Date().getFullYear();
    node.innerHTML = `
      <footer class="site-footer">
        <div class="inner">
          <div class="brand" aria-label="Footer brand">
            <span class="brand-mark"><img src="/images/Main_Page_Images/Logo.avif" alt="Akash Nagapure logo" width="42" height="42" /></span>
            <span class="brand-copy"><strong>Akash Nagapure</strong><span>Precision Systems</span></span>
          </div>
          <div class="footer-links">
            <a href="https://www.linkedin.com/in/anagapure" target="_blank" rel="noreferrer">LinkedIn</a>
            <span>•</span>
            <a href="mailto:${window.SITE_EMAIL}">Email</a>
            <span>•</span>
            <a href="/Sub_Pages/privacy.html">Privacy</a>
            <span>•</span>
            <a href="/Sub_Pages/terms.html">Terms</a>
          </div>
          <div style="color: var(--muted); font-size: 0.7rem; letter-spacing: 0.18em; text-transform: uppercase;">© ${year}. All rights reserved.</div>
        </div>
      </footer>
    `;
  });
}

function bindGlobalSearch() {
  const input = document.getElementById('site-search');
  const resultsBox = document.getElementById('site-search-results');
  if (!input || !resultsBox) return;
  const renderMatches = (query) => {
    const q = query.trim().toLowerCase();
    if (!q) {
      resultsBox.classList.remove('open');
      resultsBox.innerHTML = ''; return;
    }
    const matches = window.SITE_SEARCH_INDEX.filter((item) => item.title.toLowerCase().includes(q) || item.keywords.toLowerCase().includes(q)).slice(0, 7);
    if (!matches.length) {
      resultsBox.innerHTML = '<div class="search-result-item" style="opacity:0.7;">No matching guide found</div>';
      resultsBox.classList.add('open');
      return;
    }
    resultsBox.innerHTML = matches.map((item) => `
      <a class="search-result-item" href="${item.url}">
        <span>${item.title}</span>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>
      </a>
    `).join('');
    resultsBox.classList.add('open');
  };
  input.addEventListener('input', (event) => renderMatches(event.target.value));
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.search-shell')) {
      resultsBox.classList.remove('open');
    }
  });
}

function initThreeBackground() {
  if (typeof THREE === 'undefined') return;
  const canvas = document.getElementById('three-bg-canvas');
  if (!canvas || canvas.dataset.ready === 'true') return;
  canvas.dataset.ready = 'true';
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 55;
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: !isMobile, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.3 : 1.8));
  renderer.setSize(window.innerWidth, window.innerHeight);
  const count = isMobile ? 1000 : 2600;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 900;
    positions[i + 1] = (Math.random() - 0.5) * 2200;
    positions[i + 2] = (Math.random() - 0.5) * 380;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0x67e8f9, size: isMobile ? 1.2 : 1.05, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false });
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);
  const grid = new THREE.GridHelper(1400, isMobile ? 36 : 70, 0x22d3ee, 0x0f172a);
  grid.position.y = -260; grid.material.transparent = true; grid.material.opacity = 0.24;
  scene.add(grid);
  let mouseX = 0; let mouseY = 0; let targetX = 0; let targetY = 0;
  if (!isMobile) {
    window.addEventListener('pointermove', (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 0.9;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 0.9;
    }, { passive: true });
  }
  const tick = () => {
    requestAnimationFrame(tick);
    targetX += (mouseX - targetX) * 0.025;
    targetY += (mouseY - targetY) * 0.025;
    particles.rotation.y += 0.0007;
    particles.rotation.x = targetY;
    grid.rotation.y += 0.0008;
    renderer.render(scene, camera);
  };
  requestAnimationFrame(tick);
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, { passive: true });
}

function initVoteButtons() {
  const buttons = document.querySelectorAll('.vote-button');
  if (!buttons.length) return;
  const readState = (articleId) => {
    try {
      return JSON.parse(localStorage.getItem(`vote_state_${articleId}`) || 'null');
    } catch (error) {
      return null;
    }
  };
  const setVote = (button, value) => {
    const articleId = button.dataset.article || 'default';
    const state = { value, at: Date.now() };
    localStorage.setItem(`vote_state_${articleId}`, JSON.stringify(state));
    buttons.forEach((el) => {
      if (el.dataset.article === articleId) {
        const isSelected = el.dataset.vote === value;
        el.classList.toggle('is-voted', isSelected);
        el.setAttribute('aria-pressed', String(isSelected));
      }
    });
  };
  buttons.forEach((button) => {
    const articleId = button.dataset.article || 'default';
    const current = readState(articleId);
    if (current && current.value === button.dataset.vote) {
      button.classList.add('is-voted');
      button.setAttribute('aria-pressed', 'true');
    }
    button.addEventListener('click', () => {
      const currentState = readState(articleId);
      if (currentState && currentState.value) {
        setVote(button, currentState.value);
        return;
      }
      setVote(button, button.dataset.vote);
    });
  });
}

function enhanceArticleTemplate() {
  document.querySelectorAll('.article-shell').forEach((article) => {
    article.classList.add('article-template');
    article.querySelectorAll('.article-body section').forEach((section, index) => {
      section.style.setProperty('--section-index', index);
    });
    const headings = [...article.querySelectorAll('.article-body section > h2')];
    if (headings.length > 2 && !article.querySelector('.toc')) {
      const toc = document.createElement('nav');
      toc.className = 'toc';
      toc.setAttribute('aria-label', 'Table of contents');
      toc.innerHTML = '<h2>Table of contents</h2><ol></ol>';
      const list = toc.querySelector('ol');
      headings.forEach((heading, index) => {
        const id = heading.id || `article-section-${index + 1}`;
        heading.id = id;
        const item = document.createElement('li');
        item.innerHTML = `<a href="#${id}">${heading.textContent}</a>`;
        list.appendChild(item);
      });
      article.querySelector('.article-body').before(toc);
    }
  });
}

function initArticleComments() {
  const isBlogArticle = window.location.pathname.startsWith('/Blogs/')
    && !window.location.pathname.endsWith('/Blogs/')
    && !window.location.pathname.endsWith('/Blogs/index.html')
    && !window.location.pathname.endsWith('/Blogs/Autopatchblog.html');
  if (!isBlogArticle) return;
  const article = document.querySelector('.article-shell');
  if (!article || article.querySelector('.article-comments')) return;
  const articleId = window.location.pathname.split('/').pop().replace(/\.html$/, '').toLowerCase() || 'home';
  const section = document.createElement('section');
  section.className = 'article-comments';
  section.dataset.articleId = articleId;
  section.innerHTML = `
    <h2>Technical discussion</h2>
    <p class="article-comments-intro">Ask a question or share an implementation note. This discussion is tracked under article ID <strong>${articleId}</strong>.</p>
    <form class="comment-form">
      <input name="author" type="text" maxlength="80" placeholder="Your name or handle" required />
      <input name="email" type="email" maxlength="160" placeholder="Your email address" required />
      <textarea name="content" maxlength="4000" placeholder="Share a question or implementation note..." required></textarea>
      <button type="submit">Post comment</button>
    </form>
    <div class="comment-list" aria-live="polite"><p class="article-comments-intro">Loading discussion...</p></div>
  `;
  article.appendChild(section);
  const form = section.querySelector('form');
  const list = section.querySelector('.comment-list');
  const escape = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const render = (comments) => {
    if (!comments.length) {
      list.innerHTML = '<p class="article-comments-intro">No comments yet. Start the discussion.</p>';
      return;
    }
    list.innerHTML = comments.map((comment) => `
      <article class="comment-item">
        <header><span>${escape(comment.author)}</span><time>${escape(comment.date || '')}</time></header>
        <p>${escape(comment.content)}</p>
      </article>
    `).join('');
  };
  const load = async () => {
    try {
      const response = await fetch(`/api/comments?article_id=${encodeURIComponent(articleId)}`, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Unable to load comments');
      render(await response.json());
    } catch (error) {
      list.innerHTML = '<p class="article-comments-intro">Discussion is temporarily unavailable.</p>';
    }
  };
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const button = form.querySelector('button');
    button.disabled = true;
    button.textContent = 'Posting...';
    try {
      const response = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ author: data.get('author'), email: data.get('email'), content: data.get('content'), article_id: articleId }) });
      if (!response.ok) throw new Error('Unable to post comment');
      form.reset();
      await load();
    } catch (error) {
      list.innerHTML = '<p class="article-comments-intro">Your comment could not be posted. Please try again.</p>';
    } finally {
      button.disabled = false;
      button.textContent = 'Post comment';
    }
  });
  load();
}

document.addEventListener('DOMContentLoaded', () => {
  injectHeader();
  injectFooter();
  initThreeBackground();
  initVoteButtons();
  enhanceArticleTemplate();
  initArticleComments();
});
