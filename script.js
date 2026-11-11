(() => {
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
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  }

  const dialog = document.querySelector('.lightbox');
  if (dialog) {
    const preview = dialog.querySelector('img');
    const caption = dialog.querySelector('p');
    document.querySelectorAll('.gallery-grid .image-open').forEach(button => {
      button.addEventListener('click', () => {
        const image = button.querySelector('img');
        preview.src = image.currentSrc || image.src;
        preview.alt = image.alt;
        caption.textContent = button.closest('figure').querySelector('figcaption span').textContent;
        dialog.showModal();
      });
    });
    dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
  }

  const revealTargets = document.querySelectorAll('.intro-copy, .intro-note, .world-photo, .world-copy, .pillar-grid article, .gallery-grid figure, .status-copy');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach((element, index) => {
      element.classList.add('reveal');
      element.style.setProperty('--reveal-delay', `${(index % 3) * 70}ms`);
      observer.observe(element);
    });
  }

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  let scheduled = false;
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    scheduled = false;
  };
  addEventListener('scroll', () => {
    if (!scheduled) {
      requestAnimationFrame(updateProgress);
      scheduled = true;
    }
  }, { passive: true });
  updateProgress();
})();
