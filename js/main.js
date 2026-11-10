/* ADV SRL — interacciones */
(() => {
  // Número de WhatsApp (formato internacional sin "+" ni espacios)
  const WHATSAPP = "5493834603994";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Preloader ---------- */
  document.body.classList.add("is-loading");
  const finishLoading = () => {
    const pre = $(".preloader");
    pre?.classList.add("is-done");
    document.body.classList.remove("is-loading");
    setTimeout(() => document.body.classList.add("is-ready"), 250);
    setTimeout(() => pre?.remove(), 1200);
  };
  window.addEventListener("load", () => setTimeout(finishLoading, reduceMotion ? 0 : 900));
  setTimeout(finishLoading, 3500); // por si alguna imagen tarda

  /* ---------- Año ---------- */
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Header, progreso, WhatsApp flotante ---------- */
  const header = $("#header");
  const progress = $(".scroll-progress");
  const waFloat = $(".wa-float");
  let lastY = 0;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    header.classList.toggle("is-scrolled", y > 40);
    header.classList.toggle("is-hidden", y > lastY && y > 500 && !nav.classList.contains("is-open"));
    waFloat.classList.toggle("is-visible", y > window.innerHeight * 0.6);
    lastY = y;
  };

  /* ---------- Menú móvil ---------- */
  const burger = $("#burger");
  const nav = $("#nav");
  const toggleMenu = (open) => {
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.body.classList.toggle("menu-open", open);
  };
  burger.addEventListener("click", () => toggleMenu(!nav.classList.contains("is-open")));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => toggleMenu(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && toggleMenu(false));

  /* ---------- Link activo según sección ---------- */
  const links = $$(".nav__link");
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${entry.target.id}`));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  $$("section[id]").forEach((s) => sectionObserver.observe(s));

  /* ---------- Hero slideshow ---------- */
  const slides = $$(".hero__slide");
  const dots = $$(".hero__dots button");
  let current = 0;
  let timer;
  const goTo = (i) => {
    slides[current].classList.remove("is-active");
    dots[current].classList.remove("is-active");
    current = (i + slides.length) % slides.length;
    slides[current].classList.add("is-active");
    dots[current].classList.add("is-active");
  };
  const autoplay = () => {
    clearInterval(timer);
    if (!reduceMotion) timer = setInterval(() => goTo(current + 1), 6000);
  };
  dots.forEach((d, i) => d.addEventListener("click", () => { goTo(i); autoplay(); }));
  autoplay();

  /* ---------- Animaciones al hacer scroll ---------- */
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.style.transitionDelay = `${el.dataset.delay || 0}ms`;
        el.classList.add("is-visible");
        obs.unobserve(el);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );
  $$(".reveal").forEach((el) => revealObserver.observe(el));

  /* ---------- Contadores ---------- */
  const countObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const end = parseInt(el.dataset.count, 10);
        obs.unobserve(el);
        if (reduceMotion) { el.textContent = end; return; }
        const start = performance.now();
        const dur = 1600;
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.6 }
  );
  $$("[data-count]").forEach((el) => countObserver.observe(el));

  /* ---------- Pestañas flota / equipos ---------- */
  const tabBtns = $$(".tabs__btn");
  const selectTab = (btn) => {
    tabBtns.forEach((b) => {
      const on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on);
      b.tabIndex = on ? 0 : -1;
      const panel = $(`#${b.getAttribute("aria-controls")}`);
      panel.hidden = !on;
      panel.classList.toggle("is-active", on);
    });
  };
  tabBtns.forEach((btn, i) => {
    btn.addEventListener("click", () => selectTab(btn));
    btn.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const next = tabBtns[(i + (e.key === "ArrowRight" ? 1 : -1) + tabBtns.length) % tabBtns.length];
      selectTab(next);
      next.focus();
    });
  });

  /* ---------- Parallax suave ---------- */
  const parallaxEls = $$(".parallax");
  const onParallax = () => {
    if (reduceMotion || window.innerWidth < 700) return;
    parallaxEls.forEach((el) => {
      const rect = el.parentElement.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const speed = parseFloat(el.dataset.speed) || 0.1;
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
      const target = el.querySelector("img") || el;
      target.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
  };

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); onParallax(); ticking = false; });
  }, { passive: true });
  onScroll();
  onParallax();

  /* ---------- Formulario de presupuesto → WhatsApp ---------- */
  const form = $("#quoteForm");
  const note = $("#formNote");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    let valid = true;

    $$("[required]", form).forEach((input) => {
      const ok = input.value.trim() !== "";
      input.closest(".field").classList.toggle("is-invalid", !ok);
      if (!ok) valid = false;
    });

    if (!valid) {
      note.textContent = "Complete los campos obligatorios (*).";
      note.className = "form__note is-error";
      return;
    }

    const servicios = data.getAll("servicio").join(", ") || "A definir";
    const fecha = data.get("fecha")
      ? new Date(data.get("fecha") + "T00:00").toLocaleDateString("es-AR")
      : "A definir";

    const msg = [
      "*Solicitud de cotización — Web ADV SRL*",
      "",
      `*Nombre:* ${data.get("nombre")}`,
      data.get("empresa").trim() ? `*Empresa / proyecto:* ${data.get("empresa").trim()}` : "",
      `*Teléfono:* ${data.get("telefono")}`,
      `*Destino / sitio:* ${data.get("destino")}`,
      `*Servicio:* ${servicios}`,
      `*Carga / equipo:* ${data.get("tipo")}`,
      `*Inicio estimado:* ${fecha}`,
      data.get("mensaje").trim() ? `*Detalle:* ${data.get("mensaje").trim()}` : "",
    ].filter(Boolean).join("\n");

    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
    note.textContent = "¡Listo! Se abrió WhatsApp con su consulta. Solo resta enviarla.";
    note.className = "form__note is-ok";
  });

  $$("[required]", form).forEach((input) =>
    input.addEventListener("input", () => input.closest(".field").classList.remove("is-invalid"))
  );

  /* ---------- Lightbox de proyectos ---------- */
  const items = $$(".gallery__item");
  const lb = $("#lightbox");
  const lbImg = $("img", lb);
  let lbIndex = 0;

  const showLb = (i) => {
    lbIndex = (i + items.length) % items.length;
    const item = items[lbIndex];
    lbImg.src = item.dataset.full;
    lbImg.alt = $("img", item).alt;
  };
  const openLb = (i) => {
    showLb(i);
    lb.hidden = false;
    document.body.classList.add("menu-open");
    requestAnimationFrame(() => lb.classList.add("is-open"));
    $(".lightbox__close", lb).focus();
  };
  const closeLb = () => {
    lb.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    setTimeout(() => (lb.hidden = true), 350);
    items[lbIndex].focus();
  };

  items.forEach((item, i) => {
    item.tabIndex = 0;
    item.setAttribute("role", "button");
    item.addEventListener("click", () => openLb(i));
    item.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), openLb(i)));
  });
  $(".lightbox__close", lb).addEventListener("click", closeLb);
  $(".lightbox__prev", lb).addEventListener("click", () => showLb(lbIndex - 1));
  $(".lightbox__next", lb).addEventListener("click", () => showLb(lbIndex + 1));
  lb.addEventListener("click", (e) => e.target === lb && closeLb());
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowRight") showLb(lbIndex + 1);
    if (e.key === "ArrowLeft") showLb(lbIndex - 1);
  });

  // Swipe en el lightbox (móvil)
  let touchX = 0;
  lb.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1));
  });
})();
