/* 3d-background.js — canonical DYNAMIC 3D square background.
   Particle field drifts + rotates, grid breathes, and the whole pattern
   follows the mouse (pointer parallax) like a real 3D site. Only the
   heavy animation pauses when the tab is hidden or reduced-motion is on.
   The lightweight cursor trail still parks its rAF loop when idle.
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
    var reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    loadThree(function () { if (window.THREE) initSquares(c.bg, reduce); });
    /* The cursor trail is pure decoration: skip it for reduced-motion users. */
    if (!reduce) initTrail(c.trail);
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
      window.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; kick(); }, { passive: true });
      window.addEventListener('touchmove', function (e) { if (e.touches[0]) { mx = e.touches[0].clientX; my = e.touches[0].clientY; } kick(); }, { passive: true });
      var N = 20, pts = [];
      for (var i = 0; i < N; i++) pts.push({ x: mx, y: my, dx: 0, dy: 0 });
      /* Draw only while the trail is still settling. When the pointer stops the
         points converge, the line collapses to a dot and the rAF loop parks
         itself until the next pointer move (no idle CPU burn). */
      var running = false;
      function draw() {
        var settled = true;
        ctx.clearRect(0, 0, W, H);
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (var i = 1; i < N; i++) {
          var p = pts[i], q = pts[i - 1];
          p.dx += (q.x - p.x) * 0.25; p.dx *= 0.5; p.x += p.dx;
          p.dy += (q.y - p.y) * 0.25; p.dy *= 0.5; p.y += p.dy;
          if (Math.abs(p.dx) > 0.4 || Math.abs(p.dy) > 0.4) settled = false;
          ctx.lineTo(p.x, p.y);
        }
        var h = pts[0];
        h.dx += (mx - h.x) * 0.25; h.dx *= 0.5; h.x += h.dx;
        h.dy += (my - h.y) * 0.25; h.dy *= 0.5; h.y += h.dy;
        if (Math.abs(h.dx) > 0.4 || Math.abs(h.dy) > 0.4) settled = false;
        ctx.strokeStyle = 'rgba(56,189,248,0.6)';
        ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.stroke();
        if (settled) { running = false; return; }
        requestAnimationFrame(draw);
      }
      function kick() {
        if (!running) { running = true; requestAnimationFrame(draw); }
      }
    } catch (e) {}
  }

  /* ---- DYNAMIC 3D SQUARE particles + grid, mouse-follow parallax ---- */
  function initSquares(canvas, reduceMotion) {
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
      var count = isMobile ? 600 : 1800;
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
      /* Dynamic 3D field v2: two parallax particle layers + wireframe shapes
         + scrolling grid floor + fog depth. Camera eases toward the pointer
         AND dollies with page scroll, so the pattern visibly follows the
         mouse and reacts when moving section to section. */
      var pointer = { x: 0, y: 0 };
      var target = { x: 0, y: 0 };
      var scrollTarget = 0;
      var scrollSmooth = 0;
      function readScroll() {
        try {
          var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          scrollTarget = Math.min(1, Math.max(0, (window.scrollY || window.pageYOffset || 0) / max));
        } catch (e) { scrollTarget = 0; }
      }
      window.addEventListener('mousemove', function (e) {
        target.x = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
        target.y = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
      }, { passive: true });
      window.addEventListener('touchmove', function (e) {
        if (!e.touches[0]) return;
        target.x = (e.touches[0].clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
        target.y = (e.touches[0].clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
      }, { passive: true });
      window.addEventListener('scroll', readScroll, { passive: true });
      window.addEventListener('resize', readScroll, { passive: true });
      readScroll();
      camera.lookAt(scene.position);
      // Depth cue: distant squares fade into the night background.
      try { scene.fog = new THREE.FogExp2(0x020617, 0.0016); } catch (e) {}
      // Layer 2: fine glowing dust that drifts sideways (parallax against layer 1).
      var count2 = isMobile ? 250 : 700;
      var geo2 = new THREE.BufferGeometry();
      var pos2 = new Float32Array(count2 * 3);
      for (var d = 0; d < count2 * 3; d += 3) {
        pos2[d] = (Math.random() - 0.5) * 900;
        pos2[d + 1] = (Math.random() - 0.5) * 1600;
        pos2[d + 2] = -120 - Math.random() * 420;
      }
      geo2.setAttribute('position', new THREE.BufferAttribute(pos2, 3));
      var dust = new THREE.Points(geo2, new THREE.PointsMaterial({
        color: 0x7dd3fc, size: isMobile ? 1.4 : 1.1, map: sqTex,
        transparent: true, opacity: 0.55, alphaTest: 0.05,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
      }));
      scene.add(dust);
      // Layer 3: slow wireframe shapes (3D-site feel) that orbit + follow mouse.
      var shapes = new THREE.Group();
      try {
        var wireMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.28 });
        var shapesDef = [
          new THREE.IcosahedronGeometry(46, 0),
          new THREE.OctahedronGeometry(60, 0),
          new THREE.TorusGeometry(52, 5, 8, 28),
          new THREE.BoxGeometry(64, 64, 64)
        ];
        for (var s = 0; s < shapesDef.length; s++) {
          var line = new THREE.LineSegments(new THREE.WireframeGeometry(shapesDef[s]), wireMat);
          var ang = (s / shapesDef.length) * Math.PI * 2;
          line.position.set(Math.cos(ang) * 210, -40 + (s - 1.5) * 90, -160 - s * 70);
          line.userData.spin = 0.12 + s * 0.05;
          shapes.add(line);
        }
        scene.add(shapes);
      } catch (e) {}
      if (reduceMotion) {
        renderer.render(scene, camera);
      } else {
        var clock = (window.THREE.Clock) ? new THREE.Clock() : null;
        var running = true;
        document.addEventListener('visibilitychange', function () {
          running = !document.hidden;
          if (running) requestAnimationFrame(tick);
        });
        (function tick() {
          if (!running) return;
          var t = clock ? clock.getElapsedTime() : (Date.now() / 1000);
          pointer.x += (target.x - pointer.x) * 0.06;
          pointer.y += (target.y - pointer.y) * 0.06;
          scrollSmooth += (scrollTarget - scrollSmooth) * 0.07;
          var p = geo.attributes.position.array;
          for (var j = 1; j < p.length; j += 3) {
            p[j] += 0.55;
            if (p[j] > 1400) p[j] = -1400;
          }
          geo.attributes.position.needsUpdate = true;
          var q = geo2.attributes.position.array;
          for (var m = 0; m < q.length; m += 3) {
            q[m] += 0.45 + pointer.x * 0.7;
            if (q[m] > 460) q[m] = -460;
            if (q[m] < -460) q[m] = 460;
          }
          geo2.attributes.position.needsUpdate = true;
          points.rotation.y = t * 0.06 + pointer.x * 0.35;
          points.rotation.x = pointer.y * 0.22 + scrollSmooth * 0.55;
          dust.rotation.y = -t * 0.03 + pointer.x * 0.55;
          dust.rotation.x = pointer.y * 0.3;
          if (shapes.children.length) {
            for (var si = 0; si < shapes.children.length; si++) {
              var sh = shapes.children[si];
              sh.rotation.x = t * sh.userData.spin + pointer.y * 0.5;
              sh.rotation.y = t * (sh.userData.spin * 1.3) + pointer.x * 0.7;
              sh.position.y += Math.sin(t * 0.7 + si * 1.7) * 0.18;
            }
            shapes.rotation.y = pointer.x * 0.18;
          }
          grid.position.z = (scrollSmooth * 260) % 140;
          grid.material.opacity = 0.16 + Math.sin(t * 0.9) * 0.06 + scrollSmooth * 0.06;
          camera.position.x += (pointer.x * 12 - camera.position.x) * 0.06;
          camera.position.y += ((-pointer.y * 8 + 2) - camera.position.y) * 0.06;
          camera.position.z = 50 - scrollSmooth * 14;
          camera.lookAt(scene.position);
          renderer.render(scene, camera);
          requestAnimationFrame(tick);
        })();
      }
      var rt;
      window.addEventListener('resize', function () {
        clearTimeout(rt);
        rt = setTimeout(function () {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
          if (reduceMotion) renderer.render(scene, camera);
        }, 150);
      }, { passive: true });
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