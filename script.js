const header = document.querySelector("[data-header]");
const navDock = document.querySelector(".nav-dock");
const menuToggle = document.querySelector(".menu-toggle");
const cursor = document.querySelector(".cursor-follower");
const clickableTargets = document.querySelectorAll("a, button, .service-card");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const setHeaderState = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 40);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;

    event.preventDefault();
    navDock.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");

    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  });
});

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  navDock.classList.toggle("is-open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const delay = [...entry.target.parentElement.children].indexOf(entry.target) * 75;
    entry.target.style.transitionDelay = `${Math.min(delay, 360)}ms`;
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.16, rootMargin: "0px 0px -70px 0px" });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

if (!prefersReducedMotion && cursor) {
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let cursorX = pointerX;
  let cursorY = pointerY;

  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    cursor.style.opacity = "1";
  }, { passive: true });

  clickableTargets.forEach((target) => {
    target.addEventListener("pointerenter", () => cursor.classList.add("is-active"));
    target.addEventListener("pointerleave", () => cursor.classList.remove("is-active"));
  });

  const renderCursor = () => {
    cursorX += (pointerX - cursorX) * 0.18;
    cursorY += (pointerY - cursorY) * 0.18;
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(renderCursor);
  };

  renderCursor();
}

document.querySelectorAll(".magnetic").forEach((element) => {
  element.addEventListener("pointermove", (event) => {
    if (prefersReducedMotion || window.matchMedia("(pointer: coarse)").matches) return;

    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    element.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
  });

  element.addEventListener("pointerleave", () => {
    element.style.transform = "";
  });
});

document.querySelector(".lead-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const note = document.querySelector("[data-form-note]");
  note.textContent = "Inquiry prepared. Contact Spreadwise directly by email or phone to submit your brief.";
});

const canvas = document.querySelector("[data-constellation]");

if (canvas && !prefersReducedMotion) {
  const context = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let particles = [];

  const createParticles = () => {
    const count = Math.min(90, Math.max(36, Math.floor(width / 22)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.34,
      vy: (Math.random() - 0.5) * 0.34,
      r: Math.random() * 1.8 + 0.7
    }));
  };

  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    createParticles();
  };

  const draw = () => {
    context.clearRect(0, 0, width, height);

    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;

      context.beginPath();
      context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      context.fillStyle = index % 3 === 0 ? "rgba(255, 140, 0, 0.72)" : "rgba(255, 77, 61, 0.62)";
      context.fill();

      for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
        const next = particles[nextIndex];
        const distance = Math.hypot(particle.x - next.x, particle.y - next.y);
        if (distance > 150) continue;

        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(next.x, next.y);
        context.strokeStyle = `rgba(255, 255, 255, ${0.12 * (1 - distance / 150)})`;
        context.lineWidth = 1;
        context.stroke();
      }
    });

    requestAnimationFrame(draw);
  };

  resizeCanvas();
  draw();
  window.addEventListener("resize", resizeCanvas, { passive: true });
}
