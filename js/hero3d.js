/* ==========================================================================
   Hero 3D "HAPPY BIRTHDAY" headline — Three.js
   Renders extruded 3D text, glowing red-pink, slow rotation + mouse parallax,
   plus a soft particle field behind it for depth.
   ========================================================================== */
(function () {
  const canvas = document.getElementById('hero-text-canvas');
  const wrap = document.getElementById('hero-3d-canvas');
  if (!canvas || !wrap || typeof THREE === 'undefined') return;

  let renderer, scene, camera, textGroup, particles;
  let mouseX = 0, mouseY = 0;
  let bgRenderer, bgScene, bgCamera, bgParticles;

  function initBackground() {
    bgScene = new THREE.Scene();
    bgCamera = new THREE.PerspectiveCamera(60, wrap.clientWidth / wrap.clientHeight, 0.1, 1000);
    bgCamera.position.z = 60;

    bgRenderer = new THREE.WebGLRenderer({ canvas: wrap, alpha: true, antialias: true });
    bgRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    bgRenderer.setSize(wrap.clientWidth, wrap.clientHeight);

    const count = 260;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 160;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 80 - 20;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const sprite = makeGlowSprite();
    const mat = new THREE.PointsMaterial({
      size: 3.2,
      map: sprite,
      transparent: true,
      opacity: 0.85,
      color: new THREE.Color('#ff9bc0'),
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    bgParticles = new THREE.Points(geo, mat);
    bgScene.add(bgParticles);
  }

  function makeGlowSprite() {
    const size = 64;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.4, 'rgba(255,180,210,0.8)');
    grad.addColorStop(1, 'rgba(255,180,210,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }

  function initText() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 46);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    // Lights for glow / shading
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.PointLight(0xff6699, 2.2, 200);
    key.position.set(20, 20, 40);
    scene.add(key);
    const rim = new THREE.PointLight(0xffffff, 1.4, 200);
    rim.position.set(-30, -10, 30);
    scene.add(rim);

    textGroup = new THREE.Group();
    scene.add(textGroup);

    const loader = new THREE.FontLoader();
    loader.load(
      'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/fonts/helvetiker_bold.typeface.json',
      (font) => buildText(font),
      undefined,
      () => buildFallback()
    );
  }

  function buildText(font) {
    const lines = ['HAPPY', 'BIRTHDAY'];
    const sizeBase = canvas.clientWidth < 500 ? 5.4 : 7.2;
    const depth = sizeBase * 0.32;

    const matFront = new THREE.MeshPhongMaterial({ color: 0xff3366, emissive: 0xff3366, emissiveIntensity: 0.35, shininess: 90 });
    const matSide = new THREE.MeshPhongMaterial({ color: 0xd6003f, shininess: 40 });

    let totalHeight = 0;
    const meshes = [];

    lines.forEach((line) => {
      const geo = new THREE.TextGeometry(line, {
        font: font,
        size: sizeBase,
        height: depth,
        curveSegments: 8,
        bevelEnabled: true,
        bevelThickness: 0.5,
        bevelSize: 0.35,
        bevelSegments: 3
      });
      geo.computeBoundingBox();
      const width = geo.boundingBox.max.x - geo.boundingBox.min.x;
      geo.translate(-width / 2, 0, -depth / 2);

      const mesh = new THREE.Mesh(geo, [matFront, matSide]);
      meshes.push(mesh);
    });

    const lineGap = sizeBase * 1.25;
    totalHeight = lineGap * (lines.length - 1);
    meshes.forEach((mesh, i) => {
      mesh.position.y = totalHeight / 2 - i * lineGap;
      textGroup.add(mesh);
    });

    animate();
  }

  // Fallback if font CDN fails: simple glowing plane with canvas texture text
  function buildFallback() {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 320;
    const ctx = c.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 120px "Baloo 2", sans-serif';
    ctx.fillStyle = '#ff3366';
    ctx.shadowColor = '#ff5c8a';
    ctx.shadowBlur = 30;
    ctx.fillText('HAPPY', c.width / 2, 110);
    ctx.fillText('BIRTHDAY', c.width / 2, 230);
    const tex = new THREE.CanvasTexture(c);
    const geo = new THREE.PlaneGeometry(60, 18.75);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    const mesh = new THREE.Mesh(geo, mat);
    textGroup.add(mesh);
    animate();
  }

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  }

  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    if (textGroup) {
      textGroup.rotation.y = Math.sin(t * 0.5) * 0.28 + mouseX * 0.35;
      textGroup.rotation.x = Math.cos(t * 0.4) * 0.08 + mouseY * 0.15;
      textGroup.position.y = Math.sin(t * 1.1) * 1.4;
    }
    renderer.render(scene, camera);

    if (bgParticles) {
      bgParticles.rotation.y = t * 0.02;
      bgParticles.rotation.x = t * 0.01;
      bgRenderer.render(bgScene, bgCamera);
    }
  }

  function onResize() {
    if (renderer) {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }
    if (bgRenderer) {
      bgCamera.aspect = wrap.clientWidth / wrap.clientHeight;
      bgCamera.updateProjectionMatrix();
      bgRenderer.setSize(wrap.clientWidth, wrap.clientHeight);
    }
  }

  window.addEventListener('resize', onResize);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      onMouseMove(e.touches[0]);
    }
  }, { passive: true });

  initBackground();
  initText();
})();
