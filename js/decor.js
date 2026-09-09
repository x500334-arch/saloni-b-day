/* Floating balloons + sparkles scattered across the page (DOM-based, lightweight) */
(function () {
  const layer = document.getElementById('decor-canvas');
  if (!layer) return;

  const balloonColors = [
    'linear-gradient(160deg,#ff8fb1,#ff5c8a)',
    'linear-gradient(160deg,#ffd6e8,#ff9bc0)',
    'linear-gradient(160deg,#e6d9ff,#c9a8ff)',
    'linear-gradient(160deg,#d6fff2,#8be8cf)',
    'linear-gradient(160deg,#fff0b3,#ffd76e)'
  ];

  const sparkleGlyphs = ['✨', '⭐', '💫', '🎀', '💗'];

  function rand(min, max) { return Math.random() * (max - min) + min; }

  // Balloons
  const balloonCount = window.innerWidth < 700 ? 6 : 12;
  for (let i = 0; i < balloonCount; i++) {
    const b = document.createElement('div');
    b.className = 'balloon';
    b.style.left = rand(0, 96) + 'vw';
    b.style.background = balloonColors[i % balloonColors.length];
    const dur = rand(14, 26);
    b.style.animationDuration = dur + 's';
    b.style.animationDelay = '-' + rand(0, dur) + 's';
    b.style.width = rand(40, 70) + 'px';
    b.style.height = (rand(40, 70) * 1.25) + 'px';
    layer.appendChild(b);
  }

  // Sparkles
  const sparkleCount = window.innerWidth < 700 ? 10 : 22;
  for (let i = 0; i < sparkleCount; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.textContent = sparkleGlyphs[Math.floor(Math.random() * sparkleGlyphs.length)];
    s.style.left = rand(0, 98) + 'vw';
    s.style.top = rand(0, 98) + 'vh';
    s.style.animationDuration = rand(1.6, 3.4) + 's';
    s.style.animationDelay = '-' + rand(0, 3) + 's';
    layer.appendChild(s);
  }
})();
