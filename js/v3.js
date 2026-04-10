/* Elite Dental Force V3 — Enhanced Interactions
   AOS + Custom animations + Cursor glow + Parallax */
(function(){
  'use strict';

  // --- CURSOR GLOW (follows mouse globally) ---
  var glow = document.createElement('div');
  glow.id = 'cursor-glow';
  document.body.appendChild(glow);
  var mx = 0, my = 0, gx = 0, gy = 0;
  document.addEventListener('mousemove', function(e){ mx = e.clientX; my = e.clientY; });
  function updateGlow(){
    gx += (mx - gx) * 0.08;
    gy += (my - gy) * 0.08;
    glow.style.left = gx + 'px';
    glow.style.top = gy + 'px';
    requestAnimationFrame(updateGlow);
  }
  requestAnimationFrame(updateGlow);

  // --- SCROLL PROGRESS ---
  var pb = document.getElementById('scroll-progress');
  if(pb) window.addEventListener('scroll', function(){
    var st = window.pageYOffset || document.documentElement.scrollTop;
    var dh = document.documentElement.scrollHeight - window.innerHeight;
    pb.style.width = (dh > 0 ? (st / dh) * 100 : 0) + '%';
  }, {passive:true});

  // --- HEADER SHADOW + SHRINK ON SCROLL ---
  var hdr = document.getElementById('main-header');
  if(hdr) window.addEventListener('scroll', function(){
    if(window.pageYOffset > 50){
      hdr.style.boxShadow = '0 1px 20px rgba(0,0,0,.3),0 0 0 1px rgba(0,212,255,.04)';
      hdr.style.borderBottom = '1px solid rgba(0,212,255,.06)';
      hdr.style.height = '4.5rem';
    } else {
      hdr.style.boxShadow = '';
      hdr.style.borderBottom = '';
      hdr.style.height = '5rem';
    }
  }, {passive:true});

  // --- MOBILE MENU ---
  var mt = document.getElementById('mobile-toggle');
  var mm = document.getElementById('mobile-menu');
  if(mt && mm) mt.addEventListener('click', function(){ mm.classList.toggle('open'); });

  // --- 3D CARD TILT + SPOTLIGHT ---
  document.querySelectorAll('.tilt-card').forEach(function(c){
    var s = c.querySelector('.card-spotlight');
    c.addEventListener('mousemove', function(e){
      var r = c.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      c.style.transform = 'translateY(-6px) perspective(800px) rotateX(' + (-y * 5) + 'deg) rotateY(' + (x * 5) + 'deg)';
      if(s) s.style.background = 'radial-gradient(600px circle at ' + (e.clientX - r.left) + 'px ' + (e.clientY - r.top) + 'px, rgba(0,212,255,.06), transparent 40%)';
    });
    c.addEventListener('mouseleave', function(){ c.style.transform = ''; });
  });

  // --- MULTI-TYPE SCROLL REVEAL ---
  var revealTypes = ['.reveal-item', '.reveal-left', '.reveal-right', '.reveal-scale', '.reveal-blur'];
  var allRevealSelectors = revealTypes.join(',');

  var ro = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){
        var items = e.target.querySelectorAll(allRevealSelectors);
        items.forEach(function(i, n){
          i.style.animationDelay = (n * 0.1) + 's';
          i.classList.add('visible');
        });
        ro.unobserve(e.target);
      }
    });
  }, {threshold: 0.1, rootMargin: '0px 0px -60px 0px'});

  // Observe all containers that have reveal children
  document.querySelectorAll('.grid, .space-y-6, .space-y-8, .flex.flex-wrap, .stagger-children').forEach(function(g){
    if(g.querySelector(allRevealSelectors)) ro.observe(g);
  });

  // Also observe individual reveal items not inside grids
  var soloReveal = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('visible');
        soloReveal.unobserve(e.target);
      }
    });
  }, {threshold: 0.15, rootMargin: '0px 0px -40px 0px'});

  document.querySelectorAll(allRevealSelectors).forEach(function(el){
    // Only observe if not inside a grid/stagger parent
    var parent = el.parentElement;
    var isInsideGrid = parent && (parent.classList.contains('grid') || parent.classList.contains('stagger-children') || parent.classList.contains('space-y-6') || parent.classList.contains('space-y-8'));
    if(!isInsideGrid) soloReveal.observe(el);
  });

  // --- SECTION HEADER FADE ---
  var ho = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('visible'); ho.unobserve(e.target); }
    });
  }, {threshold: 0.2, rootMargin: '0px 0px -40px 0px'});
  document.querySelectorAll('.section-header-fade').forEach(function(h){ ho.observe(h); });

  // --- COUNTER ANIMATION (eased) ---
  function eoc(t){ return 1 - Math.pow(1 - t, 3); }
  var co = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){
        var el = e.target;
        var tg = parseInt(el.dataset.counter);
        var st = performance.now();
        var dur = 2500;
        function up(now){
          var p = Math.min((now - st) / dur, 1);
          el.textContent = Math.floor(eoc(p) * tg);
          if(p < 1) requestAnimationFrame(up);
          else el.textContent = tg;
        }
        el.textContent = '0';
        requestAnimationFrame(up);
        co.unobserve(el);
      }
    });
  }, {threshold: 0.5});
  document.querySelectorAll('[data-counter]').forEach(function(c){ co.observe(c); });

  // --- IMAGE REVEAL ON SCROLL ---
  var imgObs = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('revealed');
        imgObs.unobserve(e.target);
      }
    });
  }, {threshold: 0.2});
  document.querySelectorAll('.img-reveal').forEach(function(i){ imgObs.observe(i); });

  // --- MAGNETIC BUTTONS ---
  document.querySelectorAll('.magnetic-btn').forEach(function(b){
    b.addEventListener('mousemove', function(e){
      var r = b.getBoundingClientRect();
      b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.12 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.12 + 'px)';
    });
    b.addEventListener('mouseleave', function(){ b.style.transform = ''; });
  });

  // --- BUTTON RIPPLE ---
  document.querySelectorAll('.btn-shimmer').forEach(function(b){
    b.style.position = 'relative';
    b.style.overflow = 'hidden';
    b.addEventListener('click', function(e){
      var r = b.getBoundingClientRect();
      var rp = document.createElement('span');
      rp.className = 'btn-ripple';
      var sz = Math.max(r.width, r.height);
      rp.style.width = rp.style.height = sz + 'px';
      rp.style.left = (e.clientX - r.left - sz / 2) + 'px';
      rp.style.top = (e.clientY - r.top - sz / 2) + 'px';
      b.appendChild(rp);
      rp.addEventListener('animationend', function(){ rp.remove(); });
    });
  });

  // --- PARALLAX ON SCROLL ---
  var parallaxEls = document.querySelectorAll('.parallax-slow');
  if(parallaxEls.length) {
    window.addEventListener('scroll', function(){
      var sy = window.pageYOffset;
      parallaxEls.forEach(function(el){
        var r = el.getBoundingClientRect();
        if(r.top < window.innerHeight && r.bottom > 0){
          el.style.transform = 'translateY(' + ((r.top / window.innerHeight) * 30 - 15) + 'px)';
        }
      });
    }, {passive: true});
  }

  // --- FAQ ACCORDION ---
  document.querySelectorAll('.accordion-item').forEach(function(item){
    var trigger = item.querySelector('.accordion-trigger');
    if(trigger) trigger.addEventListener('click', function(){
      item.classList.toggle('open');
    });
  });

  // --- FORM SUBMIT VISUAL ---
  document.querySelectorAll('form').forEach(function(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      if(btn){
        var orig = btn.textContent;
        btn.textContent = 'Submitted!';
        btn.style.background = 'rgba(0,255,200,.2)';
        btn.style.color = '#00ffc8';
        setTimeout(function(){ btn.textContent = orig; btn.style.background = ''; btn.style.color = ''; }, 2000);
      }
    });
  });

  // --- INITIALIZE AOS (if loaded) ---
  if(typeof AOS !== 'undefined'){
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
      disable: 'mobile'
    });
  }

  // --- SMOOTH SCROLL FOR ANCHOR LINKS ---
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var target = document.querySelector(a.getAttribute('href'));
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });

})();
