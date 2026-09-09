/* ==========================================================================
   3D "Cooler / Cooldowner" interactive centerpiece — Three.js
   A pastel present-box "cooler" that you can drag-rotate; click/tap or the
   button pops the lid open, launches a birthday cake with glowing candles,
   spins faster, and fires confetti. Fully self-contained scene + manual
   orbit-style drag controls (no extra addons needed besides three.js core).
   ========================================================================== */
(function () {
  const canvas = document.getElementById('cooler-canvas');
  const openBtn = document.getElementById('cooler-open-btn');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 15.5);
  camera.lookAt(0, 0.2, 0);

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const p1 = new THREE.PointLight(0xffb6d5, 1.6, 60);
  p1.position.set(6, 8, 8);
  scene.add(p1);
  const p2 = new THREE.PointLight(0xffffff, 1.1, 60);
  p2.position.set(-6, 4, 6);
  scene.add(p2);
  const dir = new THREE.DirectionalLight(0xffffff, 0.5);
  dir.position.set(0, 10, 5);
  scene.add(dir);

  // Root group — the whole cooler, draggable to rotate
  const root = new THREE.Group();
  scene.add(root);

  // ---------- Cooler body (rounded box) ----------
  const bodyMat = new THREE.MeshPhongMaterial({ color: 0xff9bc0, shininess: 60, specular: 0x555555 });
  const bandMat = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 40 });
  const lidMat = new THREE.MeshPhongMaterial({ color: 0xff5c8a, shininess: 70 });

  const bodyGeo = new THREE.CylinderGeometry(3.1, 3.4, 3.6, 32);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = -0.4;
  root.add(body);

  // decorative band
  const bandGeo = new THREE.CylinderGeometry(3.15, 3.15, 0.7, 32);
  const band = new THREE.Mesh(bandGeo, bandMat);
  band.position.y = -0.4;
  root.add(band);

  // little heart dots around band
  const dotMat = new THREE.MeshPhongMaterial({ color: 0xff3366 });
  const dotCount = 10;
  for (let i = 0; i < dotCount; i++) {
    const a = (i / dotCount) * Math.PI * 2;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), dotMat);
    dot.position.set(Math.cos(a) * 3.2, -0.4, Math.sin(a) * 3.2);
    root.add(dot);
  }

  // Lid group (pivots open)
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, 1.4, -3.0);
  root.add(lidPivot);

  const lidGeo = new THREE.CylinderGeometry(3.35, 3.35, 0.6, 32);
  const lid = new THREE.Mesh(lidGeo, lidMat);
  lid.position.set(0, 0, 3.0);
  lidPivot.add(lid);

  // Lid handle
  const handleGeo = new THREE.TorusGeometry(0.5, 0.14, 12, 24);
  const handle = new THREE.Mesh(handleGeo, bandMat);
  handle.rotation.x = Math.PI / 2;
  handle.position.set(0, 0.35, 3.0);
  lidPivot.add(handle);

  // ---------- Cake (hidden inside, revealed & rises when opened) ----------
  const cakeGroup = new THREE.Group();
  cakeGroup.position.set(0, -1.6, 0);
  root.add(cakeGroup);

  const tierMat1 = new THREE.MeshPhongMaterial({ color: 0xfff0f6, shininess: 30 });
  const tierMat2 = new THREE.MeshPhongMaterial({ color: 0xffd6e8, shininess: 30 });
  const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 1.0, 32), tierMat1);
  tier1.position.y = 0.5;
  cakeGroup.add(tier1);
  const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.9, 32), tierMat2);
  tier2.position.y = 1.45;
  cakeGroup.add(tier2);

  // drip decoration
  const dripMat = new THREE.MeshPhongMaterial({ color: 0xff5c8a, shininess: 50 });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const drip = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), dripMat);
    drip.position.set(Math.cos(a) * 1.9, 1.0 - Math.random() * 0.3, Math.sin(a) * 1.9);
    cakeGroup.add(drip);
  }

  // candles
  const candleMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffcc55 });
  const flames = [];
  const candleCount = 5;
  for (let i = 0; i < candleCount; i++) {
    const a = (i / candleCount) * Math.PI * 2;
    const cx = Math.cos(a) * 0.7;
    const cz = Math.sin(a) * 0.7;
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.55, 8), candleMat);
    candle.position.set(cx, 2.2, cz);
    cakeGroup.add(candle);
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.24, 8), flameMat);
    flame.position.set(cx, 2.6, cz);
    cakeGroup.add(flame);
    flames.push(flame);

    const flameLight = new THREE.PointLight(0xffcc55, 0, 3);
    flameLight.position.set(cx, 2.7, cz);
    cakeGroup.add(flameLight);
    flames[flames.length - 1].userData.light = flameLight;
  }

  cakeGroup.scale.set(0.001, 0.001, 0.001); // start hidden
  cakeGroup.visible = false;

  // ---------- Sparkle ring floating above ----------
  const ringSparkles = new THREE.Group();
  root.add(ringSparkles);
  const glyphTex = makeSparkleTexture();
  const sparkleMat = new THREE.SpriteMaterial({ map: glyphTex, color: 0xffffff, transparent: true, depthWrite: false });
  for (let i = 0; i < 16; i++) {
    const spr = new THREE.Sprite(sparkleMat.clone());
    const a = (i / 16) * Math.PI * 2;
    spr.position.set(Math.cos(a) * 4.2, 1.8 + Math.sin(i) * 0.4, Math.sin(a) * 4.2);
    const s = 0.35 + Math.random() * 0.35;
    spr.scale.set(s, s, s);
    spr.userData.baseY = spr.position.y;
    spr.userData.phase = Math.random() * Math.PI * 2;
    ringSparkles.add(spr);
  }

  function makeSparkleTexture() {
    const size = 64;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    ctx.translate(size / 2, size / 2);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(4, 4, 0, size / 2);
      ctx.quadraticCurveTo(-4, 4, 0, 0);
    }
    ctx.fill();
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 2);
    grad.addColorStop(0, 'rgba(255,214,232,1)');
    grad.addColorStop(1, 'rgba(255,214,232,0)');
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = grad;
    ctx.fillRect(-size / 2, -size / 2, size, size);
    return new THREE.CanvasTexture(c);
  }

  // ---------- Drag-to-rotate interaction ----------
  let isDragging = false;
  let prevX = 0, prevY = 0;
  let velocityY = 0.004; // idle auto-rotate speed
  let targetVelocity = velocityY;

  function pointerDown(x, y) {
    isDragging = true;
    prevX = x; prevY = y;
    canvas.style.cursor = 'grabbing';
  }
  function pointerMove(x, y) {
    if (!isDragging) return;
    const dx = x - prevX;
    const dy = y - prevY;
    root.rotation.y += dx * 0.01;
    root.rotation.x += dy * 0.006;
    root.rotation.x = Math.max(-0.4, Math.min(0.4, root.rotation.x));
    velocityY = dx * 0.0015;
    prevX = x; prevY = y;
  }
  function pointerUp() {
    isDragging = false;
    canvas.style.cursor = 'grab';
  }

  canvas.addEventListener('mousedown', (e) => pointerDown(e.clientX, e.clientY));
  window.addEventListener('mousemove', (e) => pointerMove(e.clientX, e.clientY));
  window.addEventListener('mouseup', pointerUp);
  canvas.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    pointerDown(t.clientX, t.clientY);
  }, { passive: true });
  canvas.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    pointerMove(t.clientX, t.clientY);
  }, { passive: true });
  canvas.addEventListener('touchend', pointerUp);

  // ---------- Open / cooldown reveal animation ----------
  let opened = false;
  let openProgress = 0; // 0..1
  let lidTargetAngle = 0;

  function openCooler() {
    if (opened) {
      // little "pulse" celebration re-trigger
      triggerConfettiFromCanvas();
      return;
    }
    opened = true;
    lidTargetAngle = -Math.PI * 0.62;
    cakeGroup.visible = true;
    triggerConfettiFromCanvas();
  }

  function triggerConfettiFromCanvas() {
    if (typeof window.fireConfetti === 'function') {
      const rect = canvas.getBoundingClientRect();
      window.fireConfetti(rect.left + rect.width / 2, rect.top + rect.height * 0.35, 130);
    }
  }

  canvas.addEventListener('click', (e) => {
    // only treat as "open" click if it wasn't a drag (small movement)
    openCooler();
  });
  if (openBtn) {
    openBtn.addEventListener('click', openCooler);
  }

  // ---------- Animate loop ----------
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    const dt = clock.getDelta();

    if (!isDragging) {
      root.rotation.y += velocityY;
      velocityY += (targetVelocity - velocityY) * 0.02;
    }

    // lid opening tween
    lidPivot.rotation.x += (lidTargetAngle - lidPivot.rotation.x) * 0.08;

    // cake grow tween
    if (opened) {
      openProgress = Math.min(1, openProgress + dt * 0.9);
      const s = easeOutBack(openProgress);
      cakeGroup.scale.set(s, s, s);
      cakeGroup.position.y = -1.6 + openProgress * 1.3;

      flames.forEach((f, i) => {
        f.scale.setScalar(0.8 + Math.sin(t * 8 + i) * 0.2);
        if (f.userData.light) f.userData.light.intensity = 1.2 + Math.sin(t * 10 + i) * 0.4;
      });
    }

    // floating sparkle ring bob + spin
    ringSparkles.rotation.y -= 0.006;
    ringSparkles.children.forEach((spr, i) => {
      spr.position.y = spr.userData.baseY + Math.sin(t * 2 + spr.userData.phase) * 0.15;
      spr.material.opacity = 0.6 + Math.sin(t * 3 + i) * 0.4;
    });

    // gentle overall bob
    root.position.y = Math.sin(t * 1.2) * 0.12;

    renderer.render(scene, camera);
  }

  function easeOutBack(x) {
    const c1 = 1.4, c3 = c1 + 1;
    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }

  function onResize() {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }
  window.addEventListener('resize', onResize);

  animate();
})();
