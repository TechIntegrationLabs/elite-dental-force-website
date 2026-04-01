/**
 * Elite Dental Force - Ultra Premium Interactions
 * GSAP + ScrollTrigger + Lenis + Custom Effects
 */

document.addEventListener('DOMContentLoaded', () => {
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger);

  // Initialize all systems
  initLenisScroll();
  initScrollProgress();
  initCursorGlow();
  initHeader();
  initMobileMenu();
  initHeroAnimations();
  initScrollAnimations();
  initMetricCounters();
  initMetricRings();
  initShowcase();
  initTimeline();
  initTiltCards();
  initMagneticButtons();
});


/**
 * Lenis Smooth Scroll
 */
function initLenisScroll() {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  });

  // Connect Lenis to GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  window._lenis = lenis;
}


/**
 * Scroll Progress Bar
 */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + '%';
  }, { passive: true });
}


/**
 * Cursor Glow Effect
 */
function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow || window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function updateGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    glow.style.left = glowX + 'px';
    glow.style.top = glowY + 'px';
    requestAnimationFrame(updateGlow);
  }

  updateGlow();
}


/**
 * Header - sticky + scroll state
 */
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}


/**
 * Mobile Menu
 */
function initMobileMenu() {
  const toggle = document.getElementById('mobileToggle');
  const nav = document.getElementById('nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    nav.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  });

  // Close on link click
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 900) {
        const parent = link.closest('.has-dropdown');
        if (parent) {
          e.preventDefault();
          parent.classList.toggle('active');
        }
      }
    });
  });

  // Close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('active')) {
      toggle.classList.remove('active');
      nav.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  });
}


/**
 * Hero Animations - Split text + staggered reveals
 */
function initHeroAnimations() {
  // Check for reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Split hero title into characters
  const heroTitle = document.querySelector('[data-split-text]');
  if (heroTitle) {
    const text = heroTitle.innerHTML;
    // Split into words first, then chars within words
    const words = text.split(/(\s+|&nbsp;)/);
    heroTitle.innerHTML = '';

    words.forEach(word => {
      if (word.match(/^\s+$/) || word === '&nbsp;') {
        heroTitle.innerHTML += ' ';
        return;
      }
      const wordSpan = document.createElement('span');
      wordSpan.style.display = 'inline-block';
      wordSpan.style.whiteSpace = 'nowrap';

      word.split('').forEach(char => {
        const charSpan = document.createElement('span');
        charSpan.className = 'char';
        charSpan.textContent = char;
        wordSpan.appendChild(charSpan);
      });

      heroTitle.appendChild(wordSpan);
    });

    // Animate characters
    gsap.to('.hero-title .char', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.02,
      ease: 'power3.out',
      delay: 0.3,
    });
  }

  // Animate other hero elements
  const heroElements = document.querySelectorAll('.hero [data-animate]');
  heroElements.forEach(el => {
    const delay = parseFloat(el.dataset.delay) || 0;
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay: delay,
      ease: 'power3.out',
    });
  });
}


/**
 * Scroll-triggered fade-up animations
 */
function initScrollAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-animate]').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  // All elements outside hero (hero is handled separately)
  const elements = document.querySelectorAll('[data-animate]:not(.hero [data-animate])');

  elements.forEach(el => {
    const delay = parseFloat(el.dataset.delay) || 0;

    gsap.to(el, {
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true,
      },
      opacity: 1,
      y: 0,
      duration: 0.7,
      delay: delay,
      ease: 'power3.out',
    });
  });
}


/**
 * Metric Counter Animation
 */
function initMetricCounters() {
  const counters = document.querySelectorAll('[data-counter]');

  counters.forEach(counter => {
    const target = parseInt(counter.dataset.counter);

    ScrollTrigger.create({
      trigger: counter,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          duration: 2,
          ease: 'power2.out',
          onUpdate: function() {
            counter.textContent = Math.round(this.progress() * target);
          },
        });
      },
    });
  });
}


/**
 * Metric Ring SVG Animation
 */
function initMetricRings() {
  const rings = document.querySelectorAll('.metric-ring-fill');
  const circumference = 2 * Math.PI * 54; // r=54

  rings.forEach(ring => {
    const percent = parseInt(ring.dataset.percent) || 0;
    const offset = circumference - (percent / 100) * circumference;

    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference;

    ScrollTrigger.create({
      trigger: ring,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(ring, {
          strokeDashoffset: offset,
          duration: 2,
          ease: 'power2.out',
        });
      },
    });
  });
}


/**
 * Platform Showcase - Step switcher
 */
function initShowcase() {
  const steps = document.querySelectorAll('.showcase-step');
  const images = document.querySelectorAll('.showcase-img');

  if (!steps.length || !images.length) return;

  steps.forEach(step => {
    step.addEventListener('click', () => {
      const index = step.dataset.step;

      // Update active step
      steps.forEach(s => s.classList.remove('active'));
      step.classList.add('active');

      // Update active image
      images.forEach(img => img.classList.remove('active'));
      const targetImg = document.querySelector(`.showcase-img[data-step="${index}"]`);
      if (targetImg) targetImg.classList.add('active');
    });
  });

  // Auto-cycle through steps
  let currentStep = 0;
  let autoInterval;

  function cycleSteps() {
    currentStep = (currentStep + 1) % steps.length;
    steps[currentStep].click();
  }

  function startAutoCycle() {
    autoInterval = setInterval(cycleSteps, 5000);
  }

  function stopAutoCycle() {
    clearInterval(autoInterval);
  }

  // Start auto-cycle, pause on hover
  const wrapper = document.querySelector('.showcase-wrapper');
  if (wrapper) {
    startAutoCycle();
    wrapper.addEventListener('mouseenter', stopAutoCycle);
    wrapper.addEventListener('mouseleave', () => {
      stopAutoCycle();
      startAutoCycle();
    });
  }
}


/**
 * Timeline - Animated line fill + step highlights
 */
function initTimeline() {
  const fill = document.getElementById('timelineFill');
  const steps = document.querySelectorAll('.timeline-step');

  if (!fill || !steps.length) return;

  // Animate line fill with scroll
  ScrollTrigger.create({
    trigger: '.timeline',
    start: 'top 70%',
    end: 'bottom 50%',
    scrub: 1,
    onUpdate: (self) => {
      fill.style.height = (self.progress * 100) + '%';
    },
  });

  // Highlight steps as they come into view
  steps.forEach(step => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        step.classList.add('in-view');
      },
    });
  });
}


/**
 * 3D Tilt Cards
 */
function initTiltCards() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const cards = document.querySelectorAll('[data-tilt]');

  cards.forEach(card => {
    const inner = card.querySelector('.bento-card-inner') ||
                  card.querySelector('.audience-card-inner') ||
                  card;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`;
      inner.style.transition = 'transform 0.1s ease';
    });

    card.addEventListener('mouseleave', () => {
      inner.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
      inner.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    });
  });
}


/**
 * Magnetic Buttons
 */
function initMagneticButtons() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const buttons = document.querySelectorAll('.magnetic-btn');

  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;

      const span = btn.querySelector('span');
      if (span) {
        span.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
      }
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';

      const span = btn.querySelector('span');
      if (span) {
        span.style.transform = 'translate(0, 0)';
        span.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      }

      setTimeout(() => {
        btn.style.transition = '';
        if (span) span.style.transition = '';
      }, 400);
    });
  });
}
