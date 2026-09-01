(() => {
  const relocateGuides = () => {
    const staging = document.getElementById('guide-staging');
    if (!staging) return;
    const targets = {
      sccm: document.getElementById('sccm'),
      intune: document.getElementById('intune'),
      powershell: document.getElementById('powershell')
    };
    staging.querySelectorAll('a[href^="/Blogs/"]').forEach((card) => {
      const path = card.getAttribute('href') || '';
      const category = path.includes('/sccm-') ? 'sccm' : path.includes('/powershell-') ? 'powershell' : 'intune';
      const label = card.querySelector('span')?.textContent.trim() || 'Technical Guide';
      const title = card.querySelector('h3')?.textContent.trim() || 'Technical Guide';
      const description = card.querySelector('p')?.textContent.trim() || 'Open the complete implementation guide.';
      const accent = category === 'sccm' ? 'indigo' : category === 'powershell' ? 'teal' : 'sky';
      const visual = category === 'sccm' ? '/images/Main_Page_Images/project_sccm_1781110806653.avif' : category === 'powershell' ? '/images/Main_Page_Images/project_Modern-GPO-Alternatives.avif' : '/images/Blogs_Images/AutopatchA-Z.avif';
      const icons = category === 'sccm'
        ? [['server', 'Configuration Manager (SCCM)', 'text-indigo-400'], ['cloud', 'Microsoft Intune', 'text-sky-400']]
        : category === 'powershell'
          ? [['terminal', 'PowerShell', 'text-teal-400'], ['cloud', 'Microsoft Graph', 'text-sky-400']]
          : [['cloud', 'Microsoft Intune', 'text-sky-400'], ['layers', 'Windows Autopilot', 'text-indigo-400']];
      const iconMarkup = icons.map(([icon, label, color]) => `<div class="tooltip-container"><span class="tooltip-text">${label}</span><i data-lucide="${icon}" class="w-7 h-7 ${color}"></i></div>`).join('');
      card.className = `searchable-card py-6 border-b border-white/5 last:border-0 block group guide-feature-card`;
      card.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div class="lg:col-span-7 space-y-4">
            <div class="flex items-center gap-3"><span class="px-3 py-1 bg-${accent}-950/90 text-${accent}-300 border border-${accent}-500/50 text-[10px] font-mono font-bold rounded-lg uppercase shadow-lg">Published Guide</span><span class="text-xs text-sky-400 font-mono uppercase tracking-widest">• ${label}</span></div>
            <h3 class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">${title}</h3>
            <p class="text-slate-300 text-sm sm:text-base leading-relaxed font-light">${description}</p>
            <div class="pt-2"><span class="btn-live-project">READ GUIDE <i data-lucide="arrow-right" class="w-4 h-4"></i></span></div>
            <div class="pt-3 flex flex-wrap items-center gap-4">${iconMarkup}</div>
          </div>
          <div class="lg:col-span-5"><div class="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl bg-slate-900/60 group border border-slate-800"><img src="${visual}" alt="${title}" width="500" height="312" loading="lazy" class="w-full h-full object-cover filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-500" /></div></div>
        </div>`;
      targets[category]?.appendChild(card);
    });
    staging.remove();
    if (window.lucide) window.lucide.createIcons();
  };

  const canvas = document.getElementById('three-bg-canvas');
  const isMobile = window.innerWidth < 768;

  if (canvas && window.THREE) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.75));
    const count = isMobile ? 1200 : 2800;
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < positions.length; index += 3) {
      positions[index] = (Math.random() - 0.5) * 800;
      positions[index + 1] = (Math.random() - 0.5) * 2800;
      positions[index + 2] = (Math.random() - 0.5) * 600;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0x38bdf8, size: isMobile ? 1.3 : 1.1, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending }));
    const grid = new THREE.GridHelper(1400, isMobile ? 50 : 100, 0x0284c7, 0x0f172a);
    grid.position.y = -220;
    grid.material.transparent = true;
    grid.material.opacity = 0.22;
    scene.add(particles, grid);
    const animate = () => {
      requestAnimationFrame(animate);
      particles.rotation.y += 0.0007;
      grid.rotation.y += 0.0003;
      renderer.render(scene, camera);
    };
    animate();
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, { passive: true });
  }

  window.filterBlogCards = (query) => {
    const filter = query.toLowerCase().trim();
    const cards = document.querySelectorAll('.searchable-card');
    const categories = document.querySelectorAll('.blog-category-block');
    let visibleCount = 0;
    cards.forEach((card) => {
      const visible = card.innerText.toLowerCase().includes(filter);
      card.style.display = visible ? '' : 'none';
      if (visible) visibleCount += 1;
    });
    categories.forEach((category) => {
      category.style.display = category.querySelector('.searchable-card:not([style*="display: none"])') ? '' : 'none';
    });
    const emptyState = document.getElementById('search-empty-state');
    if (emptyState) emptyState.classList.toggle('hidden', visibleCount > 0 || !filter);
  };

  window.scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  document.addEventListener('DOMContentLoaded', () => {
    relocateGuides();
    if (window.lucide) window.lucide.createIcons();
    document.querySelectorAll('#back-to-top-btn').forEach((button) => {
      window.addEventListener('scroll', () => button.classList.toggle('hidden', window.scrollY <= 350), { passive: true });
    });
  });
})();