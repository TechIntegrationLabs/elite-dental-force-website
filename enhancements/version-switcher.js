/**
 * EDF Version Switcher
 * Triple-click the logo to reveal secret version menu
 * Dynamically loads/unloads enhancement CSS and JS
 */
(function() {
  'use strict';

  const VERSIONS = [
    { id: 'original', label: 'Original', description: 'Current production site', css: null, js: null },
    { id: 'polished', label: 'Polished', description: 'Typography, shadows, texture, easing', css: 'enhancements/v2-polished.css', js: null },
    { id: 'full-pop', label: 'Full Pop', description: 'All enhancements + AI feel + interactions', css: 'enhancements/v2-full-pop.css', js: 'enhancements/v2-enhanced.js' }
  ];

  let clickCount = 0;
  let clickTimer = null;
  let menuEl = null;
  let currentVersion = sessionStorage.getItem('edf-version') || 'original';
  let loadedCSS = null;
  let loadedJS = null;

  function getBasePath() {
    // Find path relative to the version-switcher.js script location
    var scripts = document.querySelectorAll('script[src*="version-switcher"]');
    if (scripts.length > 0) {
      var src = scripts[0].getAttribute('src');
      // src is like "enhancements/version-switcher.js" or "../enhancements/..." or "../../enhancements/..."
      // We need the prefix before "enhancements/"
      var idx = src.indexOf('enhancements/');
      if (idx >= 0) return src.substring(0, idx);
    }
    return '';
  }

  // --- DOM builders (no innerHTML) ---

  function createMenu() {
    const root = document.createElement('div');
    root.id = 'edf-version-menu';

    const backdrop = document.createElement('div');
    backdrop.className = 'edf-vm-backdrop';
    root.appendChild(backdrop);

    const panel = document.createElement('div');
    panel.className = 'edf-vm-panel';

    // Header
    const header = document.createElement('div');
    header.className = 'edf-vm-header';
    const title = document.createElement('div');
    title.className = 'edf-vm-title';
    const dot = document.createElement('span');
    dot.className = 'edf-vm-dot';
    title.appendChild(dot);
    title.appendChild(document.createTextNode(' Design Versions'));
    header.appendChild(title);
    const closeBtn = document.createElement('button');
    closeBtn.className = 'edf-vm-close';
    closeBtn.textContent = '\u00d7';
    header.appendChild(closeBtn);
    panel.appendChild(header);

    // Body
    const body = document.createElement('div');
    body.className = 'edf-vm-body';
    VERSIONS.forEach(v => {
      const btn = document.createElement('button');
      btn.className = 'edf-vm-option' + (v.id === currentVersion ? ' active' : '');
      btn.dataset.version = v.id;

      const name = document.createElement('div');
      name.className = 'edf-vm-option-name';
      name.textContent = v.label;
      btn.appendChild(name);

      const desc = document.createElement('div');
      desc.className = 'edf-vm-option-desc';
      desc.textContent = v.description;
      btn.appendChild(desc);

      if (v.id === currentVersion) {
        const badge = document.createElement('div');
        badge.className = 'edf-vm-active-badge';
        badge.textContent = 'Active';
        btn.appendChild(badge);
      }

      btn.addEventListener('click', function() { switchVersion(this.dataset.version); });
      body.appendChild(btn);
    });
    panel.appendChild(body);

    // Footer
    const footer = document.createElement('div');
    footer.className = 'edf-vm-footer';
    footer.textContent = 'Triple-click logo to toggle this menu';
    panel.appendChild(footer);

    root.appendChild(panel);

    // Close handlers
    backdrop.addEventListener('click', closeMenu);
    closeBtn.addEventListener('click', closeMenu);

    return root;
  }

  // Triple-click detection
  function initTripleClick() {
    const logos = document.querySelectorAll('.logo');
    logos.forEach(logo => {
      logo.addEventListener('click', function(e) {
        clickCount++;
        if (clickCount === 1) {
          clickTimer = setTimeout(() => { clickCount = 0; }, 600);
        }
        if (clickCount === 3) {
          e.preventDefault();
          e.stopPropagation();
          clearTimeout(clickTimer);
          clickCount = 0;
          toggleMenu();
        }
      });
    });
  }

  function toggleMenu() {
    if (menuEl) { closeMenu(); return; }
    menuEl = createMenu();
    document.body.appendChild(menuEl);
    requestAnimationFrame(() => menuEl.classList.add('visible'));
    document.addEventListener('keydown', escHandler);
  }

  function closeMenu() {
    if (menuEl) {
      menuEl.classList.remove('visible');
      const el = menuEl;
      menuEl = null;
      setTimeout(() => el.remove(), 300);
    }
    document.removeEventListener('keydown', escHandler);
  }

  function escHandler(e) { if (e.key === 'Escape') closeMenu(); }

  // Switch between versions
  function switchVersion(versionId) {
    const version = VERSIONS.find(v => v.id === versionId);
    if (!version) return;

    const basePath = getBasePath();

    // Remove current enhancements
    if (loadedCSS) { loadedCSS.remove(); loadedCSS = null; }
    if (loadedJS) { loadedJS.remove(); loadedJS = null; }
    document.body.classList.remove('edf-polished', 'edf-full-pop');
    document.querySelectorAll('[data-edf-enhanced]').forEach(el => el.remove());
    window.dispatchEvent(new CustomEvent('edf-version-cleanup'));

    // Load new version
    if (version.css) {
      loadedCSS = document.createElement('link');
      loadedCSS.rel = 'stylesheet';
      loadedCSS.href = basePath + version.css;
      loadedCSS.id = 'edf-enhancement-css';
      document.head.appendChild(loadedCSS);
    }

    if (version.js) {
      loadedJS = document.createElement('script');
      loadedJS.src = basePath + version.js;
      loadedJS.id = 'edf-enhancement-js';
      document.body.appendChild(loadedJS);
    }

    if (versionId !== 'original') {
      document.body.classList.add('edf-' + versionId);
    }

    currentVersion = versionId;
    sessionStorage.setItem('edf-version', versionId);

    // Update menu UI
    if (menuEl) {
      menuEl.querySelectorAll('.edf-vm-option').forEach(btn => {
        const isActive = btn.dataset.version === versionId;
        btn.classList.toggle('active', isActive);
        const badge = btn.querySelector('.edf-vm-active-badge');
        if (badge) badge.remove();
        if (isActive) {
          const newBadge = document.createElement('div');
          newBadge.className = 'edf-vm-active-badge';
          newBadge.textContent = 'Active';
          btn.appendChild(newBadge);
        }
      });
    }

    showToast('Switched to: ' + version.label);
  }

  function showToast(message) {
    const existing = document.getElementById('edf-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'edf-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  function autoLoad() {
    if (currentVersion !== 'original') switchVersion(currentVersion);
  }

  // Inject menu + toast styles
  function injectStyles() {
    const style = document.createElement('style');
    style.id = 'edf-version-switcher-styles';
    style.textContent = [
      '#edf-version-menu{position:fixed;inset:0;z-index:100000;opacity:0;transition:opacity .3s cubic-bezier(.16,1,.3,1);font-family:"Inter",-apple-system,sans-serif}',
      '#edf-version-menu.visible{opacity:1}',
      '.edf-vm-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(8px)}',
      '.edf-vm-panel{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(.95);background:#0d1a2d;border:1px solid rgba(0,212,255,.2);border-radius:16px;width:420px;max-width:90vw;box-shadow:0 24px 80px rgba(0,0,0,.6),0 0 60px rgba(0,212,255,.08);transition:transform .3s cubic-bezier(.16,1,.3,1);overflow:hidden}',
      '#edf-version-menu.visible .edf-vm-panel{transform:translate(-50%,-50%) scale(1)}',
      '.edf-vm-header{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.06)}',
      '.edf-vm-title{display:flex;align-items:center;gap:10px;font-size:14px;font-weight:600;color:#e8f4f8;letter-spacing:.02em;text-transform:uppercase}',
      '.edf-vm-dot{width:8px;height:8px;border-radius:50%;background:#00d4ff;box-shadow:0 0 12px rgba(0,212,255,.6);animation:edf-dot-pulse 2s ease-in-out infinite}',
      '@keyframes edf-dot-pulse{0%,100%{opacity:1}50%{opacity:.4}}',
      '.edf-vm-close{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;color:#94a3b8;font-size:20px;transition:all .2s;cursor:pointer;background:none;border:none}',
      '.edf-vm-close:hover{background:rgba(255,255,255,.06);color:#fff}',
      '.edf-vm-body{padding:16px;display:flex;flex-direction:column;gap:8px}',
      '.edf-vm-option{display:block;width:100%;text-align:left;padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);color:#e8f4f8;cursor:pointer;transition:all .25s cubic-bezier(.16,1,.3,1);position:relative}',
      '.edf-vm-option:hover{background:rgba(0,212,255,.06);border-color:rgba(0,212,255,.2);transform:translateY(-2px);box-shadow:0 4px 20px rgba(0,0,0,.3)}',
      '.edf-vm-option.active{background:rgba(0,212,255,.08);border-color:rgba(0,212,255,.3);box-shadow:0 0 30px rgba(0,212,255,.06)}',
      '.edf-vm-option-name{font-size:16px;font-weight:600;margin-bottom:4px}',
      '.edf-vm-option-desc{font-size:13px;color:#94a3b8}',
      '.edf-vm-active-badge{position:absolute;top:16px;right:16px;font-size:11px;font-weight:600;color:#00d4ff;background:rgba(0,212,255,.1);padding:3px 10px;border-radius:100px;letter-spacing:.04em;text-transform:uppercase}',
      '.edf-vm-footer{padding:14px 24px;border-top:1px solid rgba(255,255,255,.04);font-size:12px;color:#64748b;text-align:center}',
      '#edf-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:#0d1a2d;color:#00d4ff;padding:12px 24px;border-radius:100px;font-size:14px;font-weight:500;border:1px solid rgba(0,212,255,.2);box-shadow:0 8px 32px rgba(0,0,0,.4),0 0 20px rgba(0,212,255,.08);opacity:0;transition:all .3s cubic-bezier(.16,1,.3,1);z-index:100001;pointer-events:none;font-family:"Inter",-apple-system,sans-serif}',
      '#edf-toast.visible{opacity:1;transform:translateX(-50%) translateY(0)}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // Boot
  document.addEventListener('DOMContentLoaded', function() {
    injectStyles();
    initTripleClick();
    autoLoad();
  });
})();
