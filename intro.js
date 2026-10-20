(() => {
  const intro = document.getElementById("intro");
  const wrap = document.getElementById("intro-wrap");
  const subtitleEl = document.getElementById("intro-subtitle");
  const enterBtn = document.getElementById("intro-enter");
  const path = document.getElementById("intro-path");
  const shape = intro?.querySelector("svg.shape");
  const canvas = document.getElementById("intro-bg");
  const flash = document.getElementById("access-flash");
  const warning = document.getElementById("access-warning");
  const continueBtn = document.getElementById("access-continue");
  if (!intro || !canvas) return;

  let entered = false;
  let raf = 0;
  const ctx = canvas.getContext("2d");
  const particles = [];
  const mouse = { x: 0.5, y: 0.5, vx: 0, vy: 0 };
  let lastX = 0.5;
  let lastY = 0.5;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function splat(nx, ny, power = 1) {
    const count = 10 + Math.floor(power * 8);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.4 + Math.random() * 1.8) * power;
      particles.push({
        x: nx * window.innerWidth,
        y: ny * window.innerHeight,
        vx: Math.cos(angle) * speed * 2.2,
        vy: Math.sin(angle) * speed * 2.2,
        life: 1,
        decay: 0.012 + Math.random() * 0.02,
        size: 18 + Math.random() * 42 * power,
        hue: Math.random() > 0.55 ? 352 : 190 + Math.random() * 30,
      });
    }
  }

  function tick() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.fillStyle = "rgba(7, 8, 9, 0.18)";
    ctx.fillRect(0, 0, w, h);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      const alpha = p.life * 0.45;
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      grad.addColorStop(0, `hsla(${p.hue}, 90%, 62%, ${alpha})`);
      grad.addColorStop(1, `hsla(${p.hue}, 90%, 40%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!entered && Math.random() < 0.04) {
      splat(Math.random(), Math.random(), 0.35);
    }

    raf = requestAnimationFrame(tick);
  }

  function onPointer(e) {
    const point = e.touches ? e.touches[0] : e;
    if (!point) return;
    const nx = point.clientX / window.innerWidth;
    const ny = point.clientY / window.innerHeight;
    mouse.vx = nx - lastX;
    mouse.vy = ny - lastY;
    lastX = nx;
    lastY = ny;
    mouse.x = nx;
    mouse.y = ny;
    const power = Math.min(2.2, 0.5 + Math.hypot(mouse.vx, mouse.vy) * 18);
    splat(nx, ny, power);
  }

  function loadIntro() {
    wrap.classList.add("in");
    const text = subtitleEl.getAttribute("original-content") || "";
    setTimeout(() => {
      subtitleEl.innerHTML = [...text]
        .map(
          (ch, i) =>
            `<span style="animation-delay:${(i + 1) * 0.05}s">${
              ch === " " ? "&nbsp;" : ch
            }</span>`
        )
        .join("");
    }, 280);
  }

  function showAccessWarning() {
    flash.classList.add("active");
    document.body.classList.add("is-access-flash");

    setTimeout(() => {
      flash.classList.remove("active");
      document.body.classList.remove("is-access-flash");
      warning.hidden = false;
      document.body.classList.add("is-warning");
    }, 520);
  }

  function finishEnterTransition() {
    intro.setAttribute("aria-hidden", "true");
    intro.style.pointerEvents = "none";
    cancelAnimationFrame(raf);
    showAccessWarning();
  }

  function enterSite() {
    if (entered) return;
    entered = true;

    const morphTo = path.getAttribute("data-path");
    if (shape) shape.style.transformOrigin = "50% 0%";

    if (window.anime) {
      anime({
        targets: intro,
        duration: 1100,
        easing: "easeInOutSine",
        translateY: "-200vh",
        complete: finishEnterTransition,
      });

      anime({
        targets: shape,
        scaleY: [
          { value: [0.8, 1.8], duration: 550, easing: "easeInQuad" },
          { value: 1, duration: 550, easing: "easeOutQuad" },
        ],
      });

      anime({
        targets: path,
        duration: 1100,
        easing: "easeOutQuad",
        d: morphTo,
      });
    } else {
      intro.classList.add("intro-exit");
      setTimeout(finishEnterTransition, 1100);
    }
  }

  continueBtn?.addEventListener("click", () => {
    warning.hidden = true;
    document.body.classList.remove("is-intro", "is-warning");
    document.body.classList.add("intro-done");
  });

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener(
    "pointerdown",
    (e) => {
      if (entered) return;
      onPointer(e);
      splat(
        e.clientX / window.innerWidth,
        e.clientY / window.innerHeight,
        1.6
      );
    },
    { passive: true }
  );

  enterBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    enterSite();
  });

  document.querySelectorAll(".intro-arrow").forEach((el) => {
    el.addEventListener("mouseenter", enterSite);
  });

  window.addEventListener(
    "wheel",
    (e) => {
      if (!entered && e.deltaY > 0) enterSite();
    },
    { passive: true }
  );

  let touchY = 0;
  window.addEventListener(
    "touchstart",
    (e) => {
      touchY = e.touches[0]?.pageY || 0;
    },
    { passive: true }
  );
  window.addEventListener(
    "touchend",
    (e) => {
      const endY = e.changedTouches[0]?.pageY || 0;
      if (!entered && touchY - endY > 50) enterSite();
    },
    { passive: true }
  );

  document.addEventListener("keydown", (e) => {
    if (entered) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      enterSite();
    }
  });

  ctx.fillStyle = "#070809";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  for (let i = 0; i < 6; i++) splat(Math.random(), Math.random(), 0.8);
  raf = requestAnimationFrame(tick);

  window.addEventListener("DOMContentLoaded", loadIntro);
  if (document.readyState !== "loading") loadIntro();
})();
