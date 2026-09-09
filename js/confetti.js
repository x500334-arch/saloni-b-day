/* Simple canvas 2D confetti burst, triggered on demand */
(function () {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let running = false;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const colors = ['#ff5c8a', '#ff9bc0', '#ffd6e8', '#c9a8ff', '#8be8cf', '#ffd76e', '#ffffff'];

  function spawnBurst(x, y, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 3;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        life: 0,
        shape: Math.random() > 0.5 ? 'rect' : 'circle'
      });
    }
    if (!running) {
      running = true;
      requestAnimationFrame(loop);
    }
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.vy += 0.18; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;
      p.life += 1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - p.life / 140);
      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
    particles = particles.filter(p => p.life < 140 && p.y < canvas.height + 50);
    if (particles.length > 0) {
      requestAnimationFrame(loop);
    } else {
      running = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Expose a global helper
  window.fireConfetti = function (originX, originY, count) {
    const x = originX !== undefined ? originX : canvas.width / 2;
    const y = originY !== undefined ? originY : canvas.height / 2;
    spawnBurst(x, y, count || 140);
  };

  // Gentle ambient burst shortly after load
  window.addEventListener('load', () => {
    setTimeout(() => {
      window.fireConfetti(canvas.width * 0.2, canvas.height * 0.15, 60);
      window.fireConfetti(canvas.width * 0.8, canvas.height * 0.15, 60);
    }, 900);
  });
})();
