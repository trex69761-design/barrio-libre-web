(() => {
  const body = document.body;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Intro tipo pantalla de carga: solo la primera vez por sesión y se salta con un clic.
  const intro = document.querySelector('.intro');
  let seen = false;
  try { seen = sessionStorage.getItem('bl-intro') === '1'; } catch (e) {}
  const start = () => {
    if (!body.classList.contains('is-loading')) return;
    intro && intro.classList.add('is-done');
    body.classList.remove('is-loading');
    requestAnimationFrame(() => body.classList.add('is-ready'));
    try { sessionStorage.setItem('bl-intro', '1'); } catch (e) {}
  };
  if (reduced || seen) start();
  else {
    setTimeout(start, 1700);
    intro && intro.addEventListener('click', start);
    addEventListener('keydown', start, { once: true });
  }

  // Menú móvil
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  if (menuButton && nav) {
    const closeMenu = () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Abrir menú');
      nav.classList.remove('is-open');
    };
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      nav.classList.toggle('is-open', open);
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  }

  // Galería con anterior / siguiente
  const dialog = document.querySelector('.lightbox');
  const shots = [...document.querySelectorAll('.gallery-grid .image-open')];
  if (dialog && shots.length) {
    const preview = dialog.querySelector('img');
    const caption = dialog.querySelector('p');
    let current = 0;
    const show = i => {
      current = (i + shots.length) % shots.length;
      const img = shots[current].querySelector('img');
      preview.src = img.currentSrc || img.src;
      preview.alt = img.alt;
      caption.textContent = shots[current].closest('figure').querySelector('figcaption span').textContent;
    };
    shots.forEach((b, i) => b.addEventListener('click', () => { show(i); dialog.showModal(); }));
    dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
    dialog.querySelector('.prev').addEventListener('click', () => show(current - 1));
    dialog.querySelector('.next').addEventListener('click', () => show(current + 1));
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  // Manifiesto: las palabras se encienden al bajar
  const words = document.querySelector('[data-words]');
  let wordEls = [];
  if (words) {
    words.innerHTML = words.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
    wordEls = [...words.querySelectorAll('.w')];
    if (reduced) wordEls.forEach(w => w.classList.add('on'));
  }

  // Aparición de bloques
  const targets = document.querySelectorAll('.manifesto-foot, .features-head, .feature, .world-copy, .gallery-heading, .gallery-grid figure, .status-inner > *');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
    }), { threshold: 0.12 });
    targets.forEach((el, i) => {
      el.classList.add('reveal');
      el.style.setProperty('--reveal-delay', `${(i % 3) * 90}ms`);
      io.observe(el);
    });
  }

  // Barra de progreso, cabecera, parallax y sección activa
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  body.append(progress);
  const topbar = document.querySelector('.topbar');
  const worldImg = document.querySelector('.world-photo img');
  const links = [...document.querySelectorAll('#site-nav a')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href')));
  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    topbar.classList.toggle('is-scrolled', scrollY > 40);
    if (!reduced) {
      if (worldImg) {
        const r = worldImg.parentElement.getBoundingClientRect();
        const t = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        worldImg.style.transform = `translateY(${t * -8}%)`;
      }
    }
    if (wordEls.length) {
      const r = words.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
      const n = Math.round(p * wordEls.length);
      wordEls.forEach((w, i) => w.classList.toggle('on', reduced || i < n));
    }
    let active = -1;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) active = i; });
    links.forEach((a, i) => a.classList.toggle('is-active', i === active));
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
  addEventListener('resize', update);
  update();

  // Parallax suave del hero con el ratón (solo escritorio)
  const hero = document.querySelector('.hero');
  const heroImg = document.querySelector('.hero-image');
  if (hero && heroImg && !reduced && matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('mousemove', e => {
      const x = (e.clientX / innerWidth - 0.5) * -16;
      const y = (e.clientY / innerHeight - 0.5) * -10;
      heroImg.style.translate = `${x}px ${y}px`;
    });
  }
})();
