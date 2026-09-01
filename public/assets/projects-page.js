(() => {
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
    if (window.lucide) window.lucide.createIcons();
    document.querySelectorAll('#back-to-top-btn').forEach((button) => {
      window.addEventListener('scroll', () => button.classList.toggle('hidden', window.scrollY <= 350), { passive: true });
    });
  });
})();