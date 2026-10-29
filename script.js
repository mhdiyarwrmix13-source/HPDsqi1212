// افکت جشن: ذرات نورانی و کاغذرنگی ملایم
// برای خاموش کردن افکت، مقدار CELEBRATION_ENABLED را false کن.
const CELEBRATION_ENABLED = true;

(() => {
  if (!CELEBRATION_ENABLED) return;

  const canvas = document.getElementById("celebration-canvas");
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  let width = 0;
  let height = 0;
  let particles = [];
  let animationId;

  const colors = ["#8be3ff", "#d7f5ff", "#8da9ff", "#ffffff", "#66cfff"];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles = Array.from({ length: Math.min(75, Math.floor(width / 17)) }, () => makeParticle(true));
  }

  function makeParticle(randomY = false) {
    return {
      x: Math.random() * width,
      y: randomY ? Math.random() * height : -10,
      size: Math.random() * 3 + 1,
      speedY: Math.random() * 0.65 + 0.25,
      speedX: (Math.random() - 0.5) * 0.5,
      alpha: Math.random() * 0.55 + 0.2,
      phase: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      confetti: Math.random() > 0.72,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.025
    };
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.phase) * 0.25;
      p.phase += 0.012;
      p.rotation += p.spin;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.confetti) {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 2.2);
      } else {
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      if (p.y > height + 12 || p.x < -12 || p.x > width + 12) {
        Object.assign(p, makeParticle(false));
      }
    }
    animationId = requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(animationId);
    else draw();
  });

  resize();
  draw();
})();
