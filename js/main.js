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

  const response = await fetch(file, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`No se pudo cargar ${file}`);
  }

  slot.innerHTML = await response.text();
};

const boot = async () => {
  await Promise.all(fragmentSlots.map(({ slot, file }) => loadFragment(slot, file)));

const revealItems = document.querySelectorAll('.reveal');
const navLinks = document.querySelectorAll('.nav a[href^="#"]');
const sectionIds = Array.from(navLinks)
  .map((link) => link.getAttribute('href'))
  .filter(Boolean)
  .map((href) => document.querySelector(href))
  .filter(Boolean);

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

window.addEventListener('scroll', updateActiveNav, { passive: true });
window.addEventListener('load', updateActiveNav);
updateActiveNav();
};

boot().catch((error) => {
  console.error(error);
});