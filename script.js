(() => {
  const toast = document.getElementById("toast");
  const modal = document.getElementById("piece-modal");
  const panels = {
    profile: document.getElementById("panel-profile"),
    history: document.getElementById("panel-history"),
    emergency: document.getElementById("panel-emergency"),
    about: document.getElementById("panel-about"),
    careers: document.getElementById("panel-careers"),
    "corp-contact": document.getElementById("panel-corp-contact"),
  };

  let toastTimer = 0;
  let glitching = false;
  let activePanel = null;

  function showToast(msg) {
    toast.hidden = false;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.hidden = true;
      }, 250);
    }, 1800);
  }

  function revealTimeline() {
    const timeline = document.getElementById("timeline");
    if (!timeline) return;
    [...timeline.children].forEach((li) => li.classList.remove("visible"));
    [...timeline.children].forEach((li, i) => {
      setTimeout(() => li.classList.add("visible"), 80 + i * 140);
    });
  }

  function openPanel(name) {
    const panel = panels[name];
    if (!panel) return;

    Object.entries(panels).forEach(([key, el]) => {
      if (!el) return;
      el.hidden = key !== name;
    });

    activePanel = name;
    document.body.classList.add("panel-open");
    document.body.style.overflow = "hidden";

    if (name === "history") revealTimeline();
  }

  function closePanel() {
    Object.values(panels).forEach((el) => {
      if (el) el.hidden = true;
    });
    activePanel = null;
    document.body.classList.remove("panel-open");
    if (modal?.hidden !== false) {
      document.body.style.overflow = "";
    }
  }

  function openPieceModal() {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    showToast("FRAGMENT UNLOCKED · PIECE 1");
  }

  function closePieceModal() {
    modal.hidden = true;
    if (!activePanel) document.body.style.overflow = "";
  }

  function triggerGlitchThenReveal() {
    if (glitching) return;
    glitching = true;
    document.body.classList.add("is-glitching");

    setTimeout(() => {
      document.body.classList.remove("is-glitching");
      openPieceModal();
      glitching = false;
    }, 580);
  }

  document.querySelectorAll("[data-open-panel]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openPanel(btn.getAttribute("data-open-panel"));
    });
  });

  document.querySelectorAll("[data-close-panel]").forEach((el) => {
    el.addEventListener("click", closePanel);
  });

  document.getElementById("nav-home")?.addEventListener("click", closePanel);

  document.querySelectorAll(".redact").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("redact-project")) {
        btn.classList.add("is-open");
        triggerGlitchThenReveal();
        setTimeout(() => btn.classList.remove("is-open"), 2400);
        return;
      }

      const open = btn.classList.toggle("is-open");
      if (open) {
        showToast("⚠ CLEARANCE INSUFFICIENT");
        setTimeout(() => btn.classList.remove("is-open"), 2200);
      }
    });
  });

  modal?.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closePieceModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (modal && !modal.hidden) {
      closePieceModal();
      return;
    }
    if (activePanel) closePanel();
  });
})();
