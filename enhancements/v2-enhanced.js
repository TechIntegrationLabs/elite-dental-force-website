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

  // --- 3D CARD ROTATION + SPOTLIGHT ON MOUSE MOVE ---
  function init3DCards() {
    const cards = document.querySelectorAll('.feature-card, .resource-card, .metric-card');

    cards.forEach(card => {
      // Add spotlight overlay element
      const spotlight = document.createElement('div');
      spotlight.className = 'edf-spotlight';
      card.insertBefore(spotlight, card.firstChild);

      card.addEventListener('mousemove', function(e) {
        if (cleanedUp) return;
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;

        // 3D rotation
        card.style.transform =
          'translateY(-8px) perspective(800px) rotateX(' + (-y * 6) + 'deg) rotateY(' + (x * 6) + 'deg)';

        // Spotlight follows mouse
        spotlight.style.background =
          'radial-gradient(600px circle at ' + px + 'px ' + py + 'px, rgba(0, 212, 255, 0.06), transparent 40%)';
      });

      card.addEventListener('mouseleave', function() {
        card.style.transform = '';
      });
    });

    cleanupFns.push(() => {
      cards.forEach(card => {
        card.style.transform = '';
        const sl = card.querySelector('.edf-spotlight');
        if (sl) sl.remove();
      });
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

  // --- FLOATING GRADIENT ORBS ---
  function initFloatingOrbs() {
    const sections = document.querySelectorAll('.section');
    const orbConfigs = [
      { cls: 'edf-orb--cyan', w: 300, h: 300, top: '10%', left: '-5%' },
      { cls: 'edf-orb--purple', w: 250, h: 250, top: '60%', right: '-3%' },
      { cls: 'edf-orb--green', w: 200, h: 200, top: '30%', right: '10%' }
    ];

    // Add orbs to alternating sections
    sections.forEach((section, i) => {
      if (i % 2 === 0 && i < 6) {
        const config = orbConfigs[i % orbConfigs.length];
        const orb = document.createElement('div');
        orb.className = 'edf-orb ' + config.cls;
        orb.setAttribute('data-edf-enhanced', '');
        orb.style.width = config.w + 'px';
        orb.style.height = config.h + 'px';
        if (config.top) orb.style.top = config.top;
        if (config.left) orb.style.left = config.left;
        if (config.right) orb.style.right = config.right;
        section.style.position = 'relative';
        section.style.overflow = 'hidden';
        section.appendChild(orb);
      }
    });
  }

  // --- BUTTON CLICK RIPPLE ---
  function initButtonRipple() {
    const buttons = document.querySelectorAll('.btn');

    function handleClick(e) {
      if (cleanedUp) return;
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'edf-ripple';
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', function() { ripple.remove(); });
    }

    buttons.forEach(btn => btn.addEventListener('click', handleClick));

    cleanupFns.push(() => {
      buttons.forEach(btn => btn.removeEventListener('click', handleClick));
    });
  }

  // --- CLIP-PATH SECTION REVEALS ---
  function initClipReveals() {
    const splits = document.querySelectorAll('.split-section');
    if (!splits.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('edf-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    splits.forEach(s => observer.observe(s));

    cleanupFns.push(() => {
      observer.disconnect();
      splits.forEach(s => {
        s.classList.remove('edf-revealed');
        s.style.opacity = '';
        s.style.clipPath = '';
      });
    });
  }

  // --- SCROLL HINT ARROW ---
  function initScrollHint() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const hint = document.createElement('div');
    hint.className = 'edf-scroll-hint';
    hint.setAttribute('data-edf-enhanced', '');

    const arrow = document.createElement('div');
    arrow.className = 'edf-scroll-hint-arrow';
    hint.appendChild(arrow);

    const text = document.createElement('span');
    text.textContent = 'scroll';
    hint.appendChild(text);

    hero.appendChild(hint);

    // Fade out on scroll
    function onScroll() {
      if (cleanedUp) return;
      var scrollY = window.pageYOffset;
      hint.style.opacity = Math.max(0, 1 - scrollY / 200);
      if (scrollY > 300 && hint.parentNode) hint.remove();
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    cleanupFns.push(() => {
      window.removeEventListener('scroll', onScroll);
    });
  }

  // --- SMOOTH IMAGE REVEAL ON SCROLL ---
  function initImageReveals() {
    const images = document.querySelectorAll('.product-visual');

    images.forEach(img => {
      img.style.clipPath = 'inset(8% 4% 8% 4% round 8px)';
      img.style.transition = 'clip-path 1s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.clipPath = 'inset(0% 0% 0% 0% round 8px)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    images.forEach(img => observer.observe(img));

    cleanupFns.push(() => {
      observer.disconnect();
      images.forEach(img => {
        img.style.clipPath = '';
        img.style.transition = '';
      });
    });
  }

  // --- INIT ALL ---
  function init() {
    if (cleanedUp) return;
    initScrollProgress();
    initTypingAnimation();
    init3DCards();
    initStaggeredReveal();
    initEnhancedCounters();
    initHeroParallax();
    initMagneticButtons();
    initSectionFade();
    initFloatingOrbs();
    initButtonRipple();
    initClipReveals();
    initScrollHint();
    initImageReveals();
  }

  // Run when DOM is ready (script may be loaded dynamically after DOMContentLoaded)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
