/* 3d-background.js — canonical 3D square background + mouse effects.
   Source: /template/3d-background-template.html | Served: /assets/js/3d-background.js
   Applied to ALL pages via tools/apply-templates.mjs (inline canvases + script tag)
   + runtime self-heal below (creates missing canvases/CSS). Idempotent. */
(function () {
  'use strict';
  if (window.__bg3dBooted) return;
  window.__bg3dBooted = true;
  var THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  function ensureCss() {
    if (document.getElementById('bg3d-css')) return;
    var s = document.createElement('style');
    s.id = 'bg3d-css';
    s.textContent = '#three-bg-canvas{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:0;pointer-events:none;display:block}'
      + '#cursor-trail-canvas{position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9998;pointer-events:none;display:block}'
      + 'body>*:not(canvas):not(script):not(style){position:relative}header,main,footer{position:relative;z-index:10}';
    document.head.appendChild(s);
  }
  function ensureCanvases() {
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
      if (bg.nextSibling) bg.parentNode.insertBefore(trail, bg.nextSibling);
      else document.body.insertBefore(trail, document.body.firstChild.nextSibling);
    }
    return { bg: bg, trail: trail };
  }
  function loadThree(cb) {
    if (window.THREE) return cb();
    var ex = document.querySelector('script[src*="three.min.js"]');
    if (ex) { var t = 0; var iv = setInterval(function () { if (window.THREE || ++t > 100) { clearInterval(iv); cb(); } }, 100); return; }
    var s = document.createElement('script');
    s.src = THREE_URL;
    s.onload = cb; s.onerror = cb;
    document.head.appendChild(s);
  }
  function boot() {
    ensureCss();
    var c = ensureCanvases();
    initTrail(c.trail);
    loadThree(function () { if (window.THREE) initSquares(c.bg); });
  }
  /* ---- 2D cursor trail (spring line) ---- */
  function initTrail(canvas) {
    if (!canvas || canvas.__wired) return;
    canvas.__wired = true;
    try {
      var ctx = canvas.getContext('2d');
      var W = canvas.width = window.innerWidth, H = canvas.height = window.innerHeight;
      window.addEventListener('resize', function () { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; });
      var mx = W / 2, my = H / 2;
      window.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
      window.addEventListener('touchmove', function (e) { if (e.touches[0]) { mx = e.touches[0].clientX; my = e.touches[0].clientY; } }, { passive: true });
      var N = 20, pts = [];
      for (var i = 0; i < N; i++) pts.push({ x: mx, y: my, dx: 0, dy: 0 });
      (function draw() {
        requestAnimationFrame(draw);
        ctx.clearRect(0, 0, W, H);
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (var i = 1; i < N; i++) {
          var p = pts[i], q = pts[i - 1];
          p.dx += (q.x - p.x) * 0.25; p.dx *= 0.5; p.x += p.dx;
          p.dy += (q.y - p.y) * 0.25; p.dy *= 0.5; p.y += p.dy;
          ctx.lineTo(p.x, p.y);
        }
        var h = pts[0];
        h.dx += (mx - h.x) * 0.25; h.dx *= 0.5; h.x += h.dx;
        h.dy += (my - h.y) * 0.25; h.dy *= 0.5; h.y += h.dy;
        ctx.strokeStyle = 'rgba(56,189,248,0.6)';
        ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.stroke();
      })();
    } catch (e) {}
  }

  /* ---- 3D SQUARE particles + grid, mouse parallax ---- */
  function initSquares(canvas) {
    if (!canvas || canvas.__bg3d) return;
    canvas.__bg3d = true;
    try {
      var isMobile = window.innerWidth < 768;
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 50;
      var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !isMobile, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.75));
      var count = isMobile ? 1500 : 4500;
      var geo = new THREE.BufferGeometry();
      var pos = new Float32Array(count * 3);
      var k;
      for (k = 0; k < count * 3; k += 3) {
        pos[k] = (Math.random() - 0.5) * 800;
        pos[k + 1] = (Math.random() - 0.5) * 2800;
        pos[k + 2] = (Math.random() - 0.5) * 600;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      var sqTex = makeSquareTexture();
      var mat = new THREE.PointsMaterial({
        color: 0x38bdf8, size: isMobile ? 2.6 : 2.2, map: sqTex,
        transparent: true, opacity: 0.85, alphaTest: 0.15,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
      });
      var points = new THREE.Points(geo, mat);
      scene.add(points);
      var grid = new THREE.GridHelper(1400, isMobile ? 50 : 100, 0x0284c7, 0x0f172a);
      grid.position.y = -220;
      grid.material.transparent = true;
      grid.material.opacity = 0.22;
      scene.add(grid);
      var mouseX = 0, mouseY = 0, targetX = 0, targetY = 0, visible = true;
      if (!isMobile) {
        window.addEventListener('mousemove', function (e) {
          mouseX = (e.clientX - window.innerWidth / 2) * 0.0006;
          mouseY = (e.clientY - window.innerHeight / 2) * 0.0006;
        }, { passive: true });
      } else {
        window.addEventListener('touchmove', function (e) {
          if (e.touches[0]) {
            mouseX = (e.touches[0].clientX - window.innerWidth / 2) * 0.0006;
            mouseY = (e.touches[0].clientY - window.innerHeight / 2) * 0.0006;
          }
        }, { passive: true });
      }
      var rt;
      window.addEventListener('resize', function () {
        clearTimeout(rt);
        rt = setTimeout(function () {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        }, 150);
      }, { passive: true });
      document.addEventListener('visibilitychange', function () { visible = !document.hidden; });
      var clock = new THREE.Clock();
      (function animate() {
        requestAnimationFrame(animate);
        if (!visible) return;
        var t = clock.getElapsedTime();
        /* colour effect: particles drift cyan -> violet -> cyan */
        if (mat) { mat.color.setHSL(0.55 + 0.10 * Math.sin(t * 0.12), 0.85, 0.62); }
        targetX += (mouseX - targetX) * 0.04;
        targetY += (mouseY - targetY) * 0.04;
        points.rotation.y = t * 0.015 + targetX;
        points.rotation.x = t * 0.008 + targetY;
        grid.rotation.y = t * 0.003;
        camera.position.x = targetX * 40;
        camera.position.y = -targetY * 40;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
      })();
    } catch (e) {}
  }
  function makeSquareTexture() {
    var c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    var g = c.getContext('2d');
    var grad = g.createLinearGradient(0, 0, 64, 64);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.5, 'rgba(180,235,255,0.9)');
    grad.addColorStop(1, 'rgba(255,255,255,0.55)');
    g.fillStyle = grad;
    var pad = 10, s = 64 - pad * 2;
    g.fillRect(pad, pad, s - 4, s - 4);
    g.strokeStyle = 'rgba(255,255,255,0.9)';
    g.lineWidth = 3;
    g.strokeRect(pad + 2, pad + 2, s - 4, s - 4);
    var tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();