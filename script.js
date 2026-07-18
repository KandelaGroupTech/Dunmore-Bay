/* ─────────────────────────────────────────────────────────────────────────────
   Dunmore Bay Advisors — JavaScript
   ───────────────────────────────────────────────────────────────────────────── */

// ── Sticky header ─────────────────────────────────────────────────────────────
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── Mobile nav ────────────────────────────────────────────────────────────────
const burger   = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

burger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  burger.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    burger.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ── Scroll-reveal ─────────────────────────────────────────────────────────────
const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealEls = document.querySelectorAll(
  '.service-card, .process__step, .whyus__point, .whyus__card, ' +
  '.about__content, .about__image-col, .trust__item, .contact__content, ' +
  '.contact__form, .section__header, .gap__compare, .journey'
);

// Directional variants: side columns slide in from their own side
const revealDirections = [
  ['.about__image-col', 'reveal--left'],
  ['.about__content',   'reveal--right'],
  ['.whyus__card',      'reveal--right'],
  ['.contact__content', 'reveal--left'],
  ['.contact__form',    'reveal--right'],
  ['.service-card',     'reveal--scale'],
];

revealDirections.forEach(([selector, cls]) => {
  document.querySelectorAll(selector).forEach(el => el.classList.add(cls));
});

revealEls.forEach((el, i) => {
  el.classList.add('reveal');
  // Stagger siblings inside the same parent
  const siblings = Array.from(el.parentElement.children).filter(c =>
    c.classList.contains('reveal')
  );
  const idx = siblings.indexOf(el);
  if (idx > 0 && idx < 6) {
    el.classList.add(`reveal--delay-${idx}`);
  }
});

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealEls.forEach(el => revealObserver.observe(el));

// ── Active nav link on scroll ─────────────────────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav__links a[href^="#"]');

const sectionObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(
          `.nav__links a[href="#${entry.target.id}"]`
        );
        if (active) active.classList.add('active');
      }
    });
  },
  { threshold: 0.4 }
);

sections.forEach(s => sectionObserver.observe(s));

// ── Contact form ──────────────────────────────────────────────────────────────
const form = document.getElementById('contactForm');

form.addEventListener('submit', e => {
  e.preventDefault();

  // Basic validation
  let valid = true;
  form.querySelectorAll('[required]').forEach(field => {
    field.style.borderColor = '';
    if (!field.value.trim()) {
      field.style.borderColor = '#c0392b';
      valid = false;
    }
  });

  if (!valid) return;

  // Simulate send (replace with your real endpoint / EmailJS / Formspree)
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  setTimeout(() => {
    form.innerHTML = `
      <div class="form-success">
        <div class="form-success__icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </div>
        <h3>Message Received</h3>
        <p>Thank you for reaching out. We will respond within one business day.</p>
      </div>
    `;
  }, 1200);
});

// ── Scroll progress bar ───────────────────────────────────────────────────────
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.appendChild(progressBar);

// ── Hero parallax + progress (single rAF-throttled scroll handler) ────────────
const heroBg    = document.querySelector('.hero__bg');
const heroInner = document.querySelector('.hero__inner');
let ticking = false;

function onScrollFrame() {
  const y = window.scrollY;

  // Progress bar
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;

  // Parallax only while the hero is on screen
  if (!prefersReducedMotion && y < window.innerHeight) {
    heroBg.style.transform    = `translateY(${y * 0.35}px)`;
    heroInner.style.transform = `translateY(${y * 0.15}px)`;
    heroInner.style.opacity   = 1 - (y / window.innerHeight) * 0.3;
  }

  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(onScrollFrame);
  }
}, { passive: true });

// ── Animated stat counters ────────────────────────────────────────────────────
// Parses values like "15+", "$2B+", "100%" and counts up when scrolled into view
const counters = document.querySelectorAll('.trust__number');

function animateCounter(el) {
  const match = el.textContent.match(/^([^0-9]*)([\d.]+)(.*)$/);
  if (!match) return;
  const [, prefix, numStr, suffix] = match;
  const target = parseFloat(numStr);
  const duration = 1600;
  const start = performance.now();

  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    el.textContent = prefix + Math.round(target * eased) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

if (!prefersReducedMotion) {
  const counterObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach(c => counterObserver.observe(c));
}

// ── Smooth scroll polyfill for older Safari ───────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Text Rotator (Questions) ──────────────────────────────────────────────────
const questions = document.querySelectorAll('.questions__question');
let currentQuestionIndex = 0;

if (questions.length > 0 && !prefersReducedMotion) {
  setInterval(() => {
    questions[currentQuestionIndex].classList.remove('active');
    currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
    questions[currentQuestionIndex].classList.add('active');
  }, 8000); // 8 seconds per question
}
