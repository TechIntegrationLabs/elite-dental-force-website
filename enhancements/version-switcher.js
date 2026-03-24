/**
 * EDF Version Switcher
 * Fixed button in bottom-left corner with dropdown menu
 * Dynamically loads/unloads enhancement CSS and JS
 */
(function() {
  'use strict';

  const VERSIONS = [
    { id: 'original', label: 'Original', description: 'Current production site', css: null, js: [] },
    { id: 'polished', label: 'Polished', description: 'Typography, shadows, texture, easing', css: 'enhancements/v2-polished.css', js: [] },
    { id: 'full-pop', label: 'Full Pop', description: 'All enhancements + AI components + interactions', css: 'enhancements/v2-full-pop.css', js: ['enhancements/v2-enhanced.js', 'enhancements/ai-components.js'] }
  ];

  let dropdownOpen = false;
  let currentVersion = sessionStorage.getItem('edf-version') || 'original';
  let loadedCSS = null;
  let loadedJSList = [];
  let fabEl = null;
  let dropEl = null;

  function getBasePath() {
    var scripts = document.querySelectorAll('script[src*="version-switcher"]');
    if (scripts.length > 0) {
      var src = scripts[0].getAttribute('src');
      var idx = src.indexOf('enhancements/');
      if (idx >= 0) return src.substring(0, idx);
    }
    return '';
  }

  // --- Build the fixed FAB + dropdown ---
  function createFAB() {
    // Container
    fabEl = document.createElement('div');
    fabEl.id = 'edf-fab';

    // Dropdown (built above the button)
    dropEl = document.createElement('div');
    dropEl.id = 'edf-fab-dropdown';

    VERSIONS.forEach(v => {
      var btn = document.createElement('button');
      btn.className = 'edf-fab-option' + (v.id === currentVersion ? ' active' : '');
      btn.dataset.version = v.id;

      var name = document.createElement('span');
      name.className = 'edf-fab-opt-name';
      name.textContent = v.label;
      btn.appendChild(name);

      if (v.id === currentVersion) {
        var dot = document.createElement('span');
        dot.className = 'edf-fab-opt-dot';
        btn.appendChild(dot);
      }

      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        switchVersion(this.dataset.version);
      });
      dropEl.appendChild(btn);
    });

    fabEl.appendChild(dropEl);

    // The button itself
    var trigger = document.createElement('button');
    trigger.id = 'edf-fab-btn';
    trigger.setAttribute('aria-label', 'Switch design version');

    // Icon: layers/stack icon via SVG
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    var p1 = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    p1.setAttribute('points', '12 2 2 7 12 12 22 7 12 2');
    var pl1 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    pl1.setAttribute('points', '2 17 12 22 22 17');
    var pl2 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    pl2.setAttribute('points', '2 12 12 17 22 12');
    svg.appendChild(p1);
    svg.appendChild(pl1);
    svg.appendChild(pl2);
    trigger.appendChild(svg);

    // Label text
    var label = document.createElement('span');
    label.id = 'edf-fab-label';
    label.textContent = getCurrentLabel();
    trigger.appendChild(label);

    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleDropdown();
    });

    fabEl.appendChild(trigger);
    document.body.appendChild(fabEl);

    // Close dropdown when clicking elsewhere
    document.addEventListener('click', function() {
      if (dropdownOpen) closeDropdown();
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && dropdownOpen) closeDropdown();
    });
  }

  function getCurrentLabel() {
    var v = VERSIONS.find(function(x) { return x.id === currentVersion; });
    return v ? v.label : 'Original';
  }

  function toggleDropdown() {
    if (dropdownOpen) { closeDropdown(); } else { openDropdown(); }
  }

  function openDropdown() {
    dropdownOpen = true;
    dropEl.classList.add('open');
    fabEl.classList.add('open');
  }

  function closeDropdown() {
    dropdownOpen = false;
    dropEl.classList.remove('open');
    fabEl.classList.remove('open');
  }

  // --- Version switching ---
  function switchVersion(versionId) {
    var version = VERSIONS.find(function(v) { return v.id === versionId; });
    if (!version) return;

    var basePath = getBasePath();

    // Remove current enhancements
    if (loadedCSS) { loadedCSS.remove(); loadedCSS = null; }
    loadedJSList.forEach(function(s) { s.remove(); });
    loadedJSList = [];
    document.body.classList.remove('edf-polished', 'edf-full-pop');
    document.querySelectorAll('[data-edf-enhanced]').forEach(function(el) { el.remove(); });
    document.querySelectorAll('[data-edf-component]').forEach(function(el) { el.remove(); });
    window.dispatchEvent(new CustomEvent('edf-version-cleanup'));

    // Load new version
    if (version.css) {
      loadedCSS = document.createElement('link');
      loadedCSS.rel = 'stylesheet';
      loadedCSS.href = basePath + version.css;
      loadedCSS.id = 'edf-enhancement-css';
      document.head.appendChild(loadedCSS);
    }

    if (version.js && version.js.length) {
      version.js.forEach(function(jsSrc, i) {
        var script = document.createElement('script');
        script.src = basePath + jsSrc;
        script.id = 'edf-enhancement-js-' + i;
        document.body.appendChild(script);
        loadedJSList.push(script);
      });
    }

    if (versionId !== 'original') {
      document.body.classList.add('edf-' + versionId);
    }

    currentVersion = versionId;
    sessionStorage.setItem('edf-version', versionId);

    // Update dropdown UI
    updateDropdownUI();

    // Update label
    var label = document.getElementById('edf-fab-label');
    if (label) label.textContent = getCurrentLabel();

    closeDropdown();
    showToast('Switched to: ' + version.label);
  }

  function updateDropdownUI() {
    if (!dropEl) return;
    dropEl.querySelectorAll('.edf-fab-option').forEach(function(btn) {
      var isActive = btn.dataset.version === currentVersion;
      btn.classList.toggle('active', isActive);
      var dot = btn.querySelector('.edf-fab-opt-dot');
      if (dot) dot.remove();
      if (isActive) {
        var newDot = document.createElement('span');
        newDot.className = 'edf-fab-opt-dot';
        btn.appendChild(newDot);
      }
    });
  }

  function showToast(message) {
    var existing = document.getElementById('edf-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.id = 'edf-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(function() { toast.classList.add('visible'); });
    setTimeout(function() {
      toast.classList.remove('visible');
      setTimeout(function() { toast.remove(); }, 300);
    }, 2000);
  }

  function autoLoad() {
    if (currentVersion !== 'original') switchVersion(currentVersion);
  }

  // --- Styles ---
  function injectStyles() {
    var style = document.createElement('style');
    style.id = 'edf-version-switcher-styles';
    style.textContent = [
      /* FAB container */
      '#edf-fab{position:fixed;bottom:20px;left:20px;z-index:99999;font-family:"Inter",-apple-system,sans-serif}',

      /* Trigger button */
      '#edf-fab-btn{display:flex;align-items:center;gap:8px;padding:10px 16px;background:#0d1a2d;color:#00d4ff;border:1px solid rgba(0,212,255,.2);border-radius:100px;font-size:13px;font-weight:600;cursor:pointer;transition:all .3s cubic-bezier(.16,1,.3,1);box-shadow:0 4px 20px rgba(0,0,0,.4),0 0 20px rgba(0,212,255,.06);backdrop-filter:blur(12px);white-space:nowrap}',
      '#edf-fab-btn:hover{border-color:rgba(0,212,255,.4);box-shadow:0 4px 24px rgba(0,0,0,.5),0 0 30px rgba(0,212,255,.12);transform:translateY(-2px)}',
      '#edf-fab.open #edf-fab-btn{border-color:rgba(0,212,255,.4);background:#0f2035}',
      '#edf-fab-btn svg{flex-shrink:0}',
      '#edf-fab-label{letter-spacing:.02em}',

      /* Dropdown */
      '#edf-fab-dropdown{position:absolute;bottom:calc(100% + 8px);left:0;min-width:220px;background:#0d1a2d;border:1px solid rgba(0,212,255,.15);border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.5),0 0 40px rgba(0,212,255,.06);overflow:hidden;opacity:0;transform:translateY(8px) scale(.95);pointer-events:none;transition:all .25s cubic-bezier(.16,1,.3,1)}',
      '#edf-fab-dropdown.open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}',

      /* Options */
      '.edf-fab-option{display:flex;align-items:center;justify-content:space-between;width:100%;padding:12px 16px;border:none;background:none;color:#94a3b8;font-size:14px;font-weight:500;cursor:pointer;transition:all .2s;text-align:left;font-family:inherit}',
      '.edf-fab-option:hover{background:rgba(0,212,255,.06);color:#e8f4f8}',
      '.edf-fab-option.active{color:#00d4ff}',
      '.edf-fab-option + .edf-fab-option{border-top:1px solid rgba(255,255,255,.04)}',

      /* Active dot */
      '.edf-fab-opt-dot{width:6px;height:6px;border-radius:50%;background:#00d4ff;box-shadow:0 0 8px rgba(0,212,255,.6);flex-shrink:0}',

      /* Toast */
      '#edf-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:#0d1a2d;color:#00d4ff;padding:12px 24px;border-radius:100px;font-size:14px;font-weight:500;border:1px solid rgba(0,212,255,.2);box-shadow:0 8px 32px rgba(0,0,0,.4),0 0 20px rgba(0,212,255,.08);opacity:0;transition:all .3s cubic-bezier(.16,1,.3,1);z-index:100001;pointer-events:none;font-family:"Inter",-apple-system,sans-serif}',
      '#edf-toast.visible{opacity:1;transform:translateX(-50%) translateY(0)}',

      /* Mobile */
      '@media(max-width:480px){#edf-fab-btn{padding:8px 12px;font-size:12px}#edf-fab-dropdown{min-width:180px}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  // Boot
  document.addEventListener('DOMContentLoaded', function() {
    injectStyles();
    createFAB();
    autoLoad();
  });
})();
