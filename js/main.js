const fragmentSlots = [
  { slot: '#header-slot', file: 'html/header.html' },
  { slot: '#hero-slot', file: 'html/hero.html' },
  { slot: '#services-slot', file: 'html/services.html' },
  { slot: '#portfolio-slot', file: 'html/portfolio.html' },
  { slot: '#process-slot', file: 'html/process.html' },
  { slot: '#contact-slot', file: 'html/contact.html' },
  { slot: '#footer-slot', file: 'html/footer.html' },
];

const loadFragment = async (slotSelector, file) => {
  const slot = document.querySelector(slotSelector);

  if (!slot) {
    return;
  }

  try {
    const response = await fetch(file, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`No se pudo cargar ${file}`);
    }

    slot.innerHTML = await response.text();
  } catch (error) {
    slot.innerHTML = `<div class="fragment-fallback" role="alert">No se pudo cargar <strong>${file}</strong>. Abre el sitio desde un servidor local para ver todos los fragmentos.</div>`;
    console.error(error);
  }
};

const boot = async () => {
  await Promise.allSettled(fragmentSlots.map(({ slot, file }) => loadFragment(slot, file)));

  const revealItems = document.querySelectorAll('.reveal');
  const topbar = document.querySelector('.topbar');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelectorAll('.nav a[href^="#"]');
  const sectionIds = Array.from(navLinks)
    .map((link) => link.getAttribute('href'))
    .filter(Boolean)
    .map((href) => document.querySelector(href))
    .filter(Boolean);

  const setMenuOpen = (isOpen) => {
    if (!topbar || !navToggle) {
      return;
    }

    topbar.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  };

  if (navToggle && topbar) {
    navToggle.addEventListener('click', () => {
      setMenuOpen(!topbar.classList.contains('is-open'));
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 760) {
          setMenuOpen(false);
        }
      });
    });
  }

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.18,
      })
    : null;

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 90, 360)}ms`;

    if (observer) {
      observer.observe(item);
    } else {
      item.classList.add('is-visible');
    }
  });

  const updateActiveNav = () => {
    const midpoint = window.innerHeight * 0.35;

    sectionIds.forEach((section) => {
      const link = document.querySelector(`.nav a[href="#${section.id}"]`);

      if (!link) {
        return;
      }

      const bounds = section.getBoundingClientRect();
      const isActive = bounds.top <= midpoint && bounds.bottom >= midpoint;
      link.classList.toggle('is-active', isActive);
    });
  };

  let lastScrollY = window.scrollY;
  let scrollTicking = false;

  const updateTopbarVisibility = () => {
    if (!topbar) {
      return;
    }

    const currentScrollY = window.scrollY;

    if (topbar.classList.contains('is-open')) {
      topbar.classList.remove('is-hidden');
      lastScrollY = currentScrollY;
      scrollTicking = false;
      return;
    }

    const directionDelta = currentScrollY - lastScrollY;
    const goingDown = directionDelta > 8;
    const goingUp = directionDelta < -8;

    if (currentScrollY < 72 || goingUp) {
      topbar.classList.remove('is-hidden');
    } else if (goingDown && currentScrollY > 96) {
      topbar.classList.add('is-hidden');
      setMenuOpen(false);
    }

    lastScrollY = currentScrollY;
    scrollTicking = false;
  };

  const requestTopbarVisibilityUpdate = () => {
    if (scrollTicking) {
      return;
    }

    scrollTicking = true;
    window.requestAnimationFrame(updateTopbarVisibility);
  };

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  window.addEventListener('scroll', requestTopbarVisibilityUpdate, { passive: true });
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 760) {
      setMenuOpen(false);
    }

    requestTopbarVisibilityUpdate();
  }, { passive: true });
  window.addEventListener('load', updateActiveNav);
  window.addEventListener('load', updateTopbarVisibility);
  updateActiveNav();
  updateTopbarVisibility();
};

boot().catch((error) => {
  console.error(error);
});