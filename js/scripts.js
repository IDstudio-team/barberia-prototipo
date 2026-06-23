/* ════════════════════════════════════════════════════════
   BARBA DUMAS — scripts.js  ·  v1.0.0
   Barbería de Lujo · Puebla, México

   Módulos:
   ──────────────────────────────────────────────────────
   01 · Utilidades globales
   02 · Preloader (pantalla de carga premium)
   03 · Navbar: clase .scrolled, hamburguesa, cierre
   04 · Hero: efecto Ken Burns + parallax sutil
   05 · Scroll Reveal: IntersectionObserver → .visible
   06 · Contadores animados (sección Nosotros)
   07 · Galería: lightbox con navegación y swipe
   08 · Formulario: validación + envío
   09 · Nav activo: resaltar sección en vista
   10 · Smooth scroll con offset de navbar
   11 · Año dinámico en footer
   ════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────────────
   01 · UTILIDADES GLOBALES
────────────────────────────────────────────────────── */

/**
 * Ejecuta fn() cuando el DOM está disponible.
 * Compatible con scripts cargados con "defer".
 */
const onReady = (fn) => {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
};

/** Agrega clase si condition es truthy, la quita si es falsy */
const setClass = (el, cls, condition) => {
  if (!el) return;
  condition ? el.classList.add(cls) : el.classList.remove(cls);
};

/** Verifica si el usuario prefiere movimiento reducido */
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Genera un delay como Promise */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ──────────────────────────────────────────────────────
   02 · PRELOADER — Pantalla de carga premium
────────────────────────────────────────────────────── */

function initPreloader() {
  const loader = document.createElement('div');
  loader.id = 'preloader';
  loader.setAttribute('aria-hidden', 'true');
  loader.setAttribute('role', 'presentation');

  Object.assign(loader.style, {
    position:       'fixed',
    inset:          '0',
    zIndex:         '99999',
    background:     '#0d0d0d',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    flexDirection:  'column',
    gap:            '1.8rem',
    transition:     'opacity 0.85s cubic-bezier(0.25,0.46,0.45,0.94)',
  });

  loader.innerHTML = `
    <div id="pl-logo" style="
      font-family:'Playfair Display',Georgia,serif;
      font-size: 2.2rem;
      font-weight: 900;
      color: #f0ead6;
      letter-spacing: 0.04em;
      opacity: 0;
      transform: translateY(14px);
      transition: opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s;
    ">
      Barba <em style="color:#c9a96e;font-style:italic;">Dumas</em>
    </div>
    <div id="pl-line" style="
      height: 1px;
      width: 0;
      background: linear-gradient(90deg,transparent,#c9a96e,transparent);
      opacity: 0;
      transition: width 1s ease 0.35s, opacity 0.6s ease 0.35s;
    "></div>
    <div id="pl-sub" style="
      font-family:'Cinzel',serif;
      font-size: 0.5rem;
      letter-spacing: 0.55em;
      color: rgba(201,169,110,0.55);
      text-transform: uppercase;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.6s ease 0.6s, transform 0.6s ease 0.6s;
    ">Barbería de Lujo · Puebla</div>
  `;

  document.body.prepend(loader);
  document.body.style.overflow = 'hidden';

  /* Animar elementos internos tras montarse */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const logo = document.getElementById('pl-logo');
      const line = document.getElementById('pl-line');
      const sub  = document.getElementById('pl-sub');
      if (logo) { logo.style.opacity = '1'; logo.style.transform = 'translateY(0)'; }
      if (line) { line.style.opacity = '1'; line.style.width = '64px'; }
      if (sub)  { sub.style.opacity  = '1'; sub.style.transform  = 'translateY(0)'; }
    });
  });

  /* Ocultar al cargar todos los recursos */
  const hide = () => {
    setTimeout(() => {
      loader.style.opacity = '0';
      document.body.style.overflow = '';
      setTimeout(() => loader.remove(), 900);
    }, 1000);
  };

  if (document.readyState === 'complete') {
    hide();
  } else {
    window.addEventListener('load', hide, { once: true });
  }
}

/* ──────────────────────────────────────────────────────
   03 · NAVBAR — Scroll · Hamburguesa · Cierre automático
────────────────────────────────────────────────────── */

function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');
  if (!navbar) return;

  /* ── 3a. Clase .scrolled al hacer scroll ── */
  const handleScroll = () => setClass(navbar, 'scrolled', window.scrollY > 60);
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Estado inicial

  /* ── 3b. Helpers abrir / cerrar menú ── */
  const isMenuOpen = () => navLinks?.classList.contains('open');

  const closeMenu = () => {
    navLinks?.classList.remove('open');
    navToggle?.classList.remove('active');
    navToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  const openMenu = () => {
    navLinks?.classList.add('open');
    navToggle?.classList.add('active');
    navToggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  /* ── 3c. Toggle al hacer clic en la hamburguesa ── */
  navToggle?.addEventListener('click', () => {
    isMenuOpen() ? closeMenu() : openMenu();
  });

  /* ── 3d. Cerrar al hacer clic en cualquier enlace del menú ── */
  navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* ── 3e. Cerrar al hacer clic fuera del menú ── */
  document.addEventListener('click', (e) => {
    if (
      isMenuOpen() &&
      !navLinks.contains(e.target) &&
      !navToggle?.contains(e.target)
    ) {
      closeMenu();
    }
  });

  /* ── 3f. Cerrar con tecla Escape ── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMenuOpen()) closeMenu();
  });
}

/* ──────────────────────────────────────────────────────
   04 · HERO — Ken Burns + Parallax sutil en background
────────────────────────────────────────────────────── */

function initHero() {
  const heroBg = document.getElementById('heroBg');
  if (!heroBg) return;

  /* ── 4a. Ken Burns: agregar clase .loaded via doble RAF
     El doble requestAnimationFrame garantiza que el navegador
     pinte el frame con scale(1.08) antes de iniciar la transición ── */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      heroBg.classList.add('loaded');
    });
  });

  /* ── 4b. Parallax sutil (solo en dispositivos no táctiles y sin
     preferencia de movimiento reducido) ──
     Modifica backgroundPositionY para no interferir con el
     transform: scale del Ken Burns en CSS */
  if (prefersReducedMotion() || 'ontouchstart' in window) return;

  const handleParallax = () => {
    if (window.scrollY > window.innerHeight) return;
    const shift = (window.scrollY * 0.18).toFixed(2);
    heroBg.style.backgroundPositionY = `calc(30% + ${shift}px)`;
  };

  window.addEventListener('scroll', handleParallax, { passive: true });
}

/* ──────────────────────────────────────────────────────
   05 · SCROLL REVEAL — IntersectionObserver → .visible
────────────────────────────────────────────────────── */

function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  /* Respetar preferencia del sistema */
  if (prefersReducedMotion()) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Una sola vez
        }
      });
    },
    {
      threshold:  0.12,
      rootMargin: '0px 0px -48px 0px',
    }
  );

  elements.forEach(el => observer.observe(el));
}

/* ──────────────────────────────────────────────────────
   06 · CONTADORES ANIMADOS — Sección "Nosotros"
────────────────────────────────────────────────────── */

function initCounters() {
  const statsBlock = document.querySelector('.about-stats');
  if (!statsBlock) return;

  const statNumbers = statsBlock.querySelectorAll('.stat-number');
  if (!statNumbers.length || prefersReducedMotion()) return;

  let triggered = false;

  /**
   * Lee el número objetivo y su formato de un .stat-number.
   * El span hijo (el "+") se preserva intacto como supHTML.
   */
  const parseTarget = (el) => {
    const raw    = (el.childNodes[0]?.textContent ?? '').trim();
    const supEl  = el.querySelector('span');
    const supHTML = supEl ? supEl.outerHTML : '';
    const isK    = raw.endsWith('K');
    const value  = isK
      ? parseFloat(raw) * 1000
      : (parseInt(raw, 10) || 0);
    return { value, isK, supHTML };
  };

  /**
   * Anima el conteo de 0 → target en ~duration ms con easing ease-out.
   */
  const animateCounter = (el, duration = 1700) => {
    const { value, isK, supHTML } = parseTarget(el);
    if (!value) return;

    const start = performance.now();

    const tick = (now) => {
      const t       = Math.min((now - start) / duration, 1);
      const eased   = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const current = Math.round(eased * value);

      let display;
      if (isK && current >= 1000) {
        const kVal = current / 1000;
        display = (kVal % 1 === 0 ? kVal.toFixed(0) : kVal.toFixed(1)) + 'K';
      } else {
        display = String(current);
      }

      el.innerHTML = display + supHTML;

      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      if (triggered) return;
      if (entries[0].isIntersecting) {
        triggered = true;
        statNumbers.forEach((el, i) => {
          setTimeout(() => animateCounter(el), i * 220);
        });
        observer.disconnect();
      }
    },
    { threshold: 0.45 }
  );

  observer.observe(statsBlock);
}

/* ──────────────────────────────────────────────────────
   07 · GALERÍA LIGHTBOX
   Características: navegación prev/next, teclado, swipe táctil,
   cierre con clic en fondo o tecla Escape.
────────────────────────────────────────────────────── */

function initGalleryLightbox() {
  const items = document.querySelectorAll('.gallery-item');
  if (!items.length) return;

  /* Recopilar datos de imágenes */
  const gallery = Array.from(items).map(item => {
    const img = item.querySelector('img');
    return { src: img?.src ?? '', alt: img?.alt ?? '' };
  });

  let currentIdx = 0;

  /* ── Crear estructura del lightbox ── */
  const lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Galería de fotos — Barba Dumas');
  lb.style.cssText = `
    display: none;
    position: fixed;
    inset: 0;
    z-index: 9998;
    background: rgba(5,5,5,0.97);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 5rem 1.5rem 3.5rem;
    opacity: 0;
    transition: opacity 0.45s cubic-bezier(0.25,0.46,0.45,0.94);
    will-change: opacity;
  `;

  lb.innerHTML = `
    <!-- Botón cerrar -->
    <button id="lbClose" aria-label="Cerrar galería" style="
      position:absolute; top:1.4rem; right:1.8rem;
      background:none; border:none; cursor:pointer;
      font-family:'Cinzel',serif; font-size:0.58rem;
      letter-spacing:0.3em; text-transform:uppercase;
      color:#c9a96e; opacity:0.65;
      display:flex; align-items:center; gap:0.55rem;
      transition:opacity 0.3s;
      padding: 8px 0;
    ">
      <span style="font-size:1.3rem;line-height:1;font-family:sans-serif;">&#215;</span>Cerrar
    </button>

    <!-- Botón anterior -->
    <button id="lbPrev" aria-label="Imagen anterior" style="
      position:absolute; left:1.2rem; top:50%; transform:translateY(-50%);
      background:none; border:1px solid rgba(201,169,110,0.25);
      color:#c9a96e; font-size:1rem; width:46px; height:46px;
      cursor:pointer; display:flex; align-items:center; justify-content:center;
      transition:border-color 0.3s, background 0.3s;
      border-radius:0;
    ">&#8592;</button>

    <!-- Botón siguiente -->
    <button id="lbNext" aria-label="Imagen siguiente" style="
      position:absolute; right:1.2rem; top:50%; transform:translateY(-50%);
      background:none; border:1px solid rgba(201,169,110,0.25);
      color:#c9a96e; font-size:1rem; width:46px; height:46px;
      cursor:pointer; display:flex; align-items:center; justify-content:center;
      transition:border-color 0.3s, background 0.3s;
      border-radius:0;
    ">&#8594;</button>

    <!-- Imagen -->
    <img id="lbImg" src="" alt="" style="
      max-width: min(90vw, 1200px);
      max-height: 72vh;
      object-fit: contain;
      border: 1px solid rgba(201,169,110,0.12);
      display:block;
      transition: opacity 0.3s ease;
      will-change: opacity;
    " />

    <!-- Pie: contador + descripción -->
    <div style="
      margin-top:1.4rem; text-align:center;
      display:flex; flex-direction:column; gap:0.45rem;
    ">
      <span id="lbCounter" style="
        font-family:'Cinzel',serif; font-size:0.5rem;
        letter-spacing:0.4em; color:rgba(201,169,110,0.4);
      "></span>
      <span id="lbAlt" style="
        font-family:'Raleway',sans-serif; font-size:0.78rem;
        font-weight:300; color:rgba(201,169,110,0.55);
        max-width:500px; line-height:1.6;
      "></span>
    </div>
  `;

  document.body.appendChild(lb);

  const lbImg     = document.getElementById('lbImg');
  const lbClose   = document.getElementById('lbClose');
  const lbPrev    = document.getElementById('lbPrev');
  const lbNext    = document.getElementById('lbNext');
  const lbCounter = document.getElementById('lbCounter');
  const lbAlt     = document.getElementById('lbAlt');

  /* ── Helpers ── */
  const goTo = (index) => {
    currentIdx = ((index % gallery.length) + gallery.length) % gallery.length;
    const { src, alt } = gallery[currentIdx];

    lbImg.style.opacity = '0';
    setTimeout(() => {
      lbImg.src = src;
      lbImg.alt = alt;
      lbImg.style.opacity = '1';
    }, 220);

    lbCounter.textContent = `${currentIdx + 1}  ·  ${gallery.length}`;
    lbAlt.textContent     = alt;
  };

  const open = (index) => {
    lb.style.display = 'flex';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      lb.style.opacity = '1';
    }));
    goTo(index);
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  };

  const close = () => {
    lb.style.opacity = '0';
    setTimeout(() => {
      lb.style.display = 'none';
      document.body.style.overflow = '';
    }, 460);
  };

  const isOpen = () => lb.style.display === 'flex';

  /* ── Hover states en botones de navegación ── */
  [lbPrev, lbNext].forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.borderColor = 'rgba(201,169,110,0.75)';
      btn.style.background  = 'rgba(201,169,110,0.08)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.borderColor = 'rgba(201,169,110,0.25)';
      btn.style.background  = 'none';
    });
  });
  lbClose.addEventListener('mouseenter', () => lbClose.style.opacity = '1');
  lbClose.addEventListener('mouseleave', () => lbClose.style.opacity = '0.65');

  /* ── Abrir al hacer clic en cada ítem de la galería ── */
  items.forEach((item, i) => {
    item.addEventListener('click', () => open(i));
  });

  /* ── Controles ── */
  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', () => goTo(currentIdx - 1));
  lbNext.addEventListener('click', () => goTo(currentIdx + 1));

  /* Cerrar al hacer clic en el fondo */
  lb.addEventListener('click', (e) => {
    if (e.target === lb) close();
  });

  /* Navegación con teclado */
  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    switch (e.key) {
      case 'Escape':    close();                  break;
      case 'ArrowLeft': goTo(currentIdx - 1);     break;
      case 'ArrowRight':goTo(currentIdx + 1);     break;
    }
  });

  /* Swipe táctil */
  let touchX = 0;
  lb.addEventListener('touchstart', (e) => {
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 55) {
      diff > 0 ? goTo(currentIdx + 1) : goTo(currentIdx - 1);
    }
  });
}

/* ──────────────────────────────────────────────────────
   08 · FORMULARIO DE CONTACTO
   Validación en tiempo real + envío simulado para prototipo.
   Ver comentarios para activar Netlify Forms / Formspree.
────────────────────────────────────────────────────── */

function initContactForm() {
  const form    = document.getElementById('contactForm');
  const formMsg = document.getElementById('formMsg');
  if (!form || !formMsg) return;

  /* ── Mostrar mensaje de estado ── */
  const showMsg = (text, isError = false) => {
    formMsg.textContent    = text;
    formMsg.style.display  = 'block';
    formMsg.style.color    = isError ? '#c0392b' : 'var(--gold)';
    setTimeout(() => {
      formMsg.style.display = 'none';
    }, 6000);
  };

  /* ── Validación de campos ── */
  const validate = () => {
    const nombre  = form.querySelector('#nombre');
    const email   = form.querySelector('#email');
    const mensaje = form.querySelector('#mensaje');

    if (!nombre?.value.trim()) {
      showMsg('Por favor ingresa tu nombre completo.', true);
      nombre?.focus(); return false;
    }
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email?.value.trim() || !emailRx.test(email.value)) {
      showMsg('Ingresa un correo electrónico válido.', true);
      email?.focus(); return false;
    }
    if (!mensaje?.value.trim() || mensaje.value.trim().length < 10) {
      showMsg('El mensaje debe tener al menos 10 caracteres.', true);
      mensaje?.focus(); return false;
    }
    return true;
  };

  /* ── Envío del formulario ── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const btn = form.querySelector('button[type="submit"]');
    const originalLabel = btn?.textContent ?? 'Enviar Mensaje';

    /* Estado de carga */
    if (btn) {
      btn.textContent = 'Enviando…';
      btn.disabled    = true;
      btn.style.opacity = '0.6';
    }

    /* ════════════════════════════════════════════════════
       OPCIONES DE INTEGRACIÓN PARA PRODUCCIÓN:
       ──────────────────────────────────────────────────
       A) NETLIFY FORMS (recomendado si se sube a Netlify)
          1. Agrega el atributo `netlify` al <form> en el HTML:
             <form id="contactForm" netlify data-netlify="true" ...>
          2. Agrega un campo oculto dentro del form:
             <input type="hidden" name="form-name" value="contacto">
          3. El formulario funcionará automáticamente.
             Netlify enviará notificaciones al correo configurado.
          4. Para usar este script: elimina el bloque "PROTOTIPO"
             de abajo y descomenta el bloque "NETLIFY".

       B) FORMSPREE (sin configuración de servidor)
          1. Crea cuenta en https://formspree.io
          2. Crea un nuevo form y copia tu endpoint (ej: xyzabcde)
          3. Descomenta y completa el bloque "FORMSPREE" de abajo.

       C) EMAILJS (sin backend, gratis hasta 200 mensajes/mes)
          1. Crea cuenta en https://www.emailjs.com
          2. Configura Service, Template y Public Key
          3. Añade al <head>:
             <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
          4. Descomentar el bloque "EMAILJS" de abajo.
       ════════════════════════════════════════════════════ */

    /* ── PROTOTIPO: simula envío de 1.8s ── */
    await wait(1800);
    form.reset();
    showMsg('¡Mensaje recibido! Te contactaremos a la brevedad. Gracias por escribirnos.');

    /* ── NETLIFY FORMS (descomentar en producción)
    try {
      const body = new FormData(form);
      const res  = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(body).toString(),
      });
      if (!res.ok) throw new Error('Error Netlify');
      form.reset();
      showMsg('¡Mensaje enviado! Te contactaremos a la brevedad.');
    } catch {
      showMsg('Error al enviar. Contáctanos directamente por WhatsApp.', true);
    }
    */

    /* ── FORMSPREE (descomentar y reemplazar TU_ENDPOINT)
    try {
      const res = await fetch('https://formspree.io/f/TU_ENDPOINT', {
        method: 'POST',
        body:    new FormData(form),
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error('Error Formspree');
      form.reset();
      showMsg('¡Mensaje enviado! Te contactaremos a la brevedad.');
    } catch {
      showMsg('Error al enviar. Contáctanos directamente por WhatsApp.', true);
    }
    */

    /* ── EMAILJS (descomentar y configurar)
    try {
      await emailjs.sendForm('TU_SERVICE_ID', 'TU_TEMPLATE_ID', form, 'TU_PUBLIC_KEY');
      form.reset();
      showMsg('¡Mensaje enviado! Te contactaremos a la brevedad.');
    } catch {
      showMsg('Error al enviar. Contáctanos directamente por WhatsApp.', true);
    }
    */

    /* Restaurar botón */
    if (btn) {
      btn.textContent   = originalLabel;
      btn.disabled      = false;
      btn.style.opacity = '1';
    }
  });

  /* ── Validación visual en tiempo real (feedback de borde) ── */
  form.querySelectorAll('.form-input, .form-textarea').forEach(field => {
    field.addEventListener('blur', () => {
      if (field.required && !field.value.trim()) {
        field.style.borderColor = 'rgba(192,57,43,0.55)';
      }
    });
    field.addEventListener('input', () => {
      if (field.value.trim()) {
        field.style.borderColor = '';
      }
    });
  });
}

/* ──────────────────────────────────────────────────────
   09 · ENLACE ACTIVO EN NAVBAR — Sección en pantalla
────────────────────────────────────────────────────── */

function initActiveNavLinks() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('#navLinks a[href^="#"]:not(.nav-cta)');
  if (!sections.length || !links.length) return;

  const getHref = (el) => el.getAttribute('href');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = `#${entry.target.id}`;
          links.forEach(link => {
            link.style.color = getHref(link) === id ? 'var(--gold)' : '';
          });
        }
      });
    },
    {
      threshold:  0.30,
      rootMargin: '-80px 0px -30% 0px',
    }
  );

  sections.forEach(s => observer.observe(s));
}

/* ──────────────────────────────────────────────────────
   10 · SMOOTH SCROLL — Con compensación del navbar fijo
   (el CSS tiene scroll-behavior:smooth pero no compensa
   la altura del navbar fijo; este script lo corrige)
────────────────────────────────────────────────────── */

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return;

      const target = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();

      const navH = document.getElementById('navbar')?.offsetHeight ?? 0;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;

      window.scrollTo({ top, behavior: 'smooth' });

      /* Actualizar hash en URL sin salto */
      history.pushState(null, '', hash);
    });
  });
}

/* ──────────────────────────────────────────────────────
   11 · AÑO DINÁMICO EN FOOTER
────────────────────────────────────────────────────── */

function initFooterYear() {
  const el = document.getElementById('footerYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* ══════════════════════════════════════════════════════
   INICIALIZACIÓN — Punto de entrada principal
════════════════════════════════════════════════════════ */

onReady(() => {
  /* El preloader se lanza primero */
  initPreloader();

  /* Core UI */
  initNavbar();
  initHero();
  initScrollReveal();

  /* Animaciones de contenido */
  initCounters();
  initGalleryLightbox();

  /* Formularios e interacciones */
  initContactForm();
  initActiveNavLinks();
  initSmoothScroll();

  /* Datos dinámicos */
  initFooterYear();

  /* Log de confirmación en consola (solo desarrollo) */
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    console.log(
      '%c🪒 Barba Dumas%c — scripts.js cargado correctamente.',
      'color:#c9a96e;font-family:serif;font-size:1.1rem;font-weight:bold;',
      'color:#7a7060;font-size:0.8rem;'
    );
  }
});

/* ══════════════════════════════════════════════════════
   FORMULARIO DE CITAS — Google Calendar via Apps Script
══════════════════════════════════════════════════════ */
(function () {
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx5TtxqERkgegqKrL6iNkblZ-nXxrM2kraWBHrcLmzcgPzRKQK20bKCks7JZ8DVGBM/exec';

  const form      = document.getElementById('citaForm');
  const msgEl     = document.getElementById('citaMsg');
  const submitBtn = document.getElementById('citaSubmitBtn');

  if (!form) return;

  const dtInput = document.getElementById('citaFechaHora');
  if (dtInput) {
    const ahora  = new Date();
    const offset = ahora.getTimezoneOffset() * 60000;
    const localISO = new Date(ahora - offset).toISOString().slice(0, 16);
    dtInput.min = localISO;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const nombre    = document.getElementById('citaNombre').value.trim();
    const servicio  = document.getElementById('citaServicio');
    const fechaHora = document.getElementById('citaFechaHora').value;

    if (!nombre || !servicio.value || !fechaHora) {
      mostrarMsg('Por favor completa todos los campos requeridos.', 'error');
      return;
    }

    const duracion = parseInt(
      servicio.options[servicio.selectedIndex].dataset.dur
    ) || 60;

    submitBtn.disabled    = true;
    submitBtn.textContent = 'Agendando…';
    mostrarMsg('', '');

    const payload = {
      nombre:    nombre,
      telefono:  document.getElementById('citaTelefono').value.trim(),
      servicio:  servicio.value,
      barbero:   document.getElementById('citaBarbero').value,
      fechaHora: new Date(fechaHora).toISOString(),
      duracion:  duracion
    };

    try {
      const params = new URLSearchParams({
        nombre:    payload.nombre,
        telefono:  payload.telefono,
        servicio:  payload.servicio,
        barbero:   payload.barbero,
        fechaHora: payload.fechaHora,
        duracion:  String(payload.duracion)
      });

      await fetch(APPS_SCRIPT_URL + '?' + params.toString(), {
        method: 'GET',
        mode:   'no-cors'
      });

      mostrarMsg('✦ ¡Cita confirmada! Te esperamos en Barba Dumas.', 'success');
      form.reset();

    } catch (err) {
      mostrarMsg('Error de conexión. Intenta por WhatsApp o llámanos directamente.', 'error');
      console.error('Fetch error:', err);
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = 'Confirmar Cita';
    }
  });

  function mostrarMsg(texto, tipo) {
    msgEl.textContent  = texto;
    msgEl.style.display = texto ? 'block' : 'none';
    msgEl.style.color   = tipo === 'error' ? '#e07070' : 'var(--gold)';
  }

})();