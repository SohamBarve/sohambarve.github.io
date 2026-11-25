(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Dublin clock
  const clock = document.getElementById('clock');
  const tick = () => {
    clock.textContent = new Intl.DateTimeFormat('en-IE', {
      hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Dublin'
    }).format(new Date());
  };
  tick(); setInterval(tick, 15000);

  // Project rows open and close
  document.querySelectorAll('.row').forEach(row => {
    const body = row.querySelector('.row-body');
    const inner = document.createElement('div');
    inner.className = 'row-body-inner';
    while (body.firstChild) inner.appendChild(body.firstChild);
    body.appendChild(inner);
    const btn = row.querySelector('.row-head');
    btn.addEventListener('click', () => {
      const open = row.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
  });

  // Fade sections in as they scroll into view
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ASCII field behind the hero: characters ripple outward from the cursor
  const cv = document.getElementById('field');
  const ctx = cv.getContext('2d');
  const chars = ' .·:-=+*#%@';
  const cell = 14;
  let w, h, cols, rows, dpr;
  let mx = -1e4, my = -1e4, t = 0;

  const size = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = '11px "Geist Mono", monospace';
    ctx.textBaseline = 'top';
    cols = Math.ceil(w / cell); rows = Math.ceil(h / cell);
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const px = x * cell, py = y * cell;
        // slow interference of two waves, fading toward the bottom-left where the text sits
        let v = Math.sin(x * 0.11 + t * 0.6) * Math.cos(y * 0.15 - t * 0.4) * 0.5 + 0.5;
        v *= Math.min(1, (x / cols) * 1.6) * (1 - y / rows * 0.55);
        const d = Math.hypot(px - mx, py - my);
        if (d < 180) v += (1 - d / 180) * 0.9 * (0.6 + 0.4 * Math.sin(d * 0.08 - t * 4));
        if (v < 0.18) continue;
        const i = Math.min(chars.length - 1, Math.floor(v * chars.length));
        ctx.fillStyle = d < 180 ? `rgba(200,241,105,${Math.min(.9, v)})` : `rgba(236,235,230,${v * 0.35})`;
        ctx.fillText(chars[i], px, py);
      }
    }
  };

  const loop = () => { t += 0.016; draw(); if (visible) requestAnimationFrame(loop); };
  let visible = true;
  new IntersectionObserver(([e]) => {
    const was = visible; visible = e.isIntersecting;
    if (visible && !was && !reduce) requestAnimationFrame(loop);
  }).observe(cv);

  addEventListener('resize', () => { size(); if (reduce) draw(); });
  cv.parentElement.addEventListener('pointermove', e => {
    const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top;
  });
  cv.parentElement.addEventListener('pointerleave', () => { mx = my = -1e4; });

  size();
  if (reduce) draw(); else requestAnimationFrame(loop);
})();
