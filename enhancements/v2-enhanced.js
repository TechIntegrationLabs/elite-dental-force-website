/**
 * EDF V3: Full Pop — Enhanced Interactions
 * 3D card rotation, typing animation, scroll progress,
 * AI status indicators, staggered scroll reveals
 * Loaded dynamically by version-switcher.js
 */
(function() {
  'use strict';

  let cleanedUp = false;
  const cleanupFns = [];

  // Listen for version switch cleanup
  window.addEventListener('edf-version-cleanup', function() {
    cleanedUp = true;
    cleanupFns.forEach(fn => fn());
  });

  // --- SCROLL PROGRESS BAR ---
  function initScrollProgress() {
    const bar = document.createElement('div');
    bar.id = 'edf-scroll-progress';
    bar.setAttribute('data-edf-enhanced', '');
    document.body.appendChild(bar);

    function update() {
      if (cleanedUp) return;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    update();

    cleanupFns.push(() => {
      window.removeEventListener('scroll', update);
    });
  }

  // --- TYPING ANIMATION ON HERO ---
  function initTypingAnimation() {
    const h1 = document.querySelector('.hero-content h1');
    if (!h1) return;

    const originalText = h1.textContent;
    h1.textContent = '';
    h1.style.minHeight = '1.2em';

    const cursor = document.createElement('span');
    cursor.className = 'edf-typing-cursor';
    cursor.setAttribute('data-edf-enhanced', '');
    h1.appendChild(cursor);

    let charIndex = 0;
    const speed = 35;

    function type() {
      if (cleanedUp) {
        h1.textContent = originalText;
        return;
      }
      if (charIndex < originalText.length) {
        const textNode = document.createTextNode(originalText.charAt(charIndex));
        h1.insertBefore(textNode, cursor);
        charIndex++;
        setTimeout(type, speed + Math.random() * 20);
      } else {
        // Remove cursor after a delay
        setTimeout(() => {
          if (!cleanedUp && cursor.parentNode) {
            cursor.style.animation = 'edf-cursor-blink 0.8s step-end 3';
            cursor.addEventListener('animationend', () => {
              if (cursor.parentNode) cursor.remove();
            });
          }
        }, 1500);
      }
    }

    // Start after hero entrance animation completes
    setTimeout(type, 800);

    cleanupFns.push(() => {
      h1.textContent = originalText;
    });
  }

  // --- AI STATUS INDICATORS ---
  function initAIStatusIndicators() {
    // Add to hero badge area
    const heroBadge = document.querySelector('.hero-badge');
    if (heroBadge) {
      const status = document.createElement('div');
      status.className = 'edf-ai-status';
      status.setAttribute('data-edf-enhanced', '');

      const dot = document.createElement('span');
      dot.className = 'edf-status-dot';
      status.appendChild(dot);
      status.appendChild(document.createTextNode('AI Engine Active'));

      heroBadge.parentNode.insertBefore(status, heroBadge.nextSibling);
    }

    // Add to metrics section
    const metricsHeader = document.querySelector('.bg-light .section-header');
    if (metricsHeader) {
      const status = document.createElement('div');
      status.className = 'edf-ai-status';
      status.setAttribute('data-edf-enhanced', '');
      status.style.marginTop = '12px';

      const dot = document.createElement('span');
      dot.className = 'edf-status-dot';
      status.appendChild(dot);
      status.appendChild(document.createTextNode('Live Performance Data'));

      metricsHeader.appendChild(status);
    }
  }

  // --- 3D CARD ROTATION ON MOUSE MOVE ---
  function init3DCards() {
    const cards = document.querySelectorAll('.feature-card, .resource-card, .metric-card');

    cards.forEach(card => {
      card.addEventListener('mousemove', function(e) {
        if (cleanedUp) return;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        card.style.transform =
          'translateY(-8px) perspective(800px) rotateX(' + (-y * 6) + 'deg) rotateY(' + (x * 6) + 'deg)';
      });

      card.addEventListener('mouseleave', function() {
        card.style.transform = '';
      });
    });

    cleanupFns.push(() => {
      cards.forEach(card => { card.style.transform = ''; });
    });
  }

  // --- STAGGERED SCROLL REVEAL ---
  function initStaggeredReveal() {
    const containers = [
      { selector: '.grid', children: '.feature-card' },
      { selector: '.feature-grid', children: '.feature-card' },
      { selector: '.metrics-grid', children: '.metric-card' },
      { selector: '.resource-grid', children: '.resource-card' },
      { selector: '.workflow-steps', children: '.workflow-step' }
    ];

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const container = entry.target;
          const childSelector = container.dataset.edfChildren;
          const children = container.querySelectorAll(childSelector);

          children.forEach((child, i) => {
            child.style.animationDelay = (i * 0.1) + 's';
            child.classList.add('edf-visible');
          });

          observer.unobserve(container);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    containers.forEach(({ selector, children }) => {
      document.querySelectorAll(selector).forEach(container => {
        container.dataset.edfChildren = children;
        observer.observe(container);
      });
    });

    cleanupFns.push(() => {
      observer.disconnect();
      document.querySelectorAll('.edf-visible').forEach(el => {
        el.classList.remove('edf-visible');
        el.style.animationDelay = '';
        el.style.opacity = '';
        el.style.transform = '';
      });
    });
  }

  // --- ENHANCED COUNTER ANIMATION (eased, not linear) ---
  function initEnhancedCounters() {
    const counters = document.querySelectorAll('[data-counter]');

    // Ease-out cubic function
    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.dataset.counter);
          const duration = 2500;
          const start = performance.now();

          function update(now) {
            if (cleanedUp) { counter.textContent = target; return; }
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);
            counter.textContent = Math.floor(eased * target);

            if (progress < 1) {
              requestAnimationFrame(update);
            } else {
              counter.textContent = target;
            }
          }

          // Reset and animate
          counter.textContent = '0';
          requestAnimationFrame(update);
          observer.unobserve(counter);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));

    cleanupFns.push(() => {
      observer.disconnect();
      counters.forEach(c => { c.textContent = c.dataset.counter; });
    });
  }

  // --- PARALLAX ON HERO VISUAL ---
  function initHeroParallax() {
    const heroVisual = document.querySelector('.hero-visual .product-visual');
    if (!heroVisual) return;

    function onScroll() {
      if (cleanedUp) return;
      const scrollY = window.pageYOffset;
      if (scrollY < 800) {
        heroVisual.style.transform = 'translateY(' + (scrollY * 0.08) + 'px)';
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    cleanupFns.push(() => {
      window.removeEventListener('scroll', onScroll);
      heroVisual.style.transform = '';
    });
  }

  // --- MAGNETIC BUTTONS ---
  function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-primary.btn-lg');

    buttons.forEach(btn => {
      btn.addEventListener('mousemove', function(e) {
        if (cleanedUp) return;
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = 'translateY(-2px) translate(' + (x * 0.15) + 'px, ' + (y * 0.15) + 'px)';
      });

      btn.addEventListener('mouseleave', function() {
        btn.style.transform = '';
      });
    });

    cleanupFns.push(() => {
      buttons.forEach(btn => { btn.style.transform = ''; });
    });
  }

  // --- SMOOTH SECTION FADE ON SCROLL ---
  function initSectionFade() {
    const sections = document.querySelectorAll('.section .section-header');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

    sections.forEach(s => {
      s.style.opacity = '0';
      s.style.transform = 'translateY(30px)';
      s.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      observer.observe(s);
    });

    cleanupFns.push(() => {
      observer.disconnect();
      sections.forEach(s => {
        s.style.opacity = '';
        s.style.transform = '';
        s.style.transition = '';
      });
    });
  }

  // --- INIT ALL ---
  function init() {
    if (cleanedUp) return;
    initScrollProgress();
    initTypingAnimation();
    initAIStatusIndicators();
    init3DCards();
    initStaggeredReveal();
    initEnhancedCounters();
    initHeroParallax();
    initMagneticButtons();
    initSectionFade();
  }

  // Run when DOM is ready (script may be loaded dynamically after DOMContentLoaded)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
