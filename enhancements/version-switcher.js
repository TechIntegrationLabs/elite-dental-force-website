/**
 * EDF Version Toggle
 * Top-right toggle button: Original ↔ Pop
 */
(function() {
  'use strict';

  var POP = {
    css: 'enhancements/v2-full-pop.css',
    js: ['enhancements/v2-enhanced.js', 'enhancements/ai-components.js']
  };

  var isPopActive = sessionStorage.getItem('edf-version') === 'pop';
  var loadedCSS = null;
  var loadedJSList = [];
  var toggleBtn = null;

  function getBasePath() {
    var scripts = document.querySelectorAll('script[src*="version-switcher"]');
    if (scripts.length > 0) {
      var src = scripts[0].getAttribute('src');
      var idx = src.indexOf('enhancements/');
      if (idx >= 0) return src.substring(0, idx);
    }
    return '';
  }

  function createToggle() {
    toggleBtn = document.createElement('button');
    toggleBtn.id = 'edf-toggle';
    toggleBtn.setAttribute('aria-label', 'Toggle enhanced design');
    updateToggleUI();
    toggleBtn.addEventListener('click', function() { toggle(); });
    document.body.appendChild(toggleBtn);
  }

  function updateToggleUI() {
    if (!toggleBtn) return;
    // Clear
    while (toggleBtn.firstChild) toggleBtn.removeChild(toggleBtn.firstChild);

    var track = document.createElement('span');
    track.className = 'edf-toggle-track' + (isPopActive ? ' on' : '');

    var knob = document.createElement('span');
    knob.className = 'edf-toggle-knob';
    track.appendChild(knob);
    toggleBtn.appendChild(track);

    var label = document.createElement('span');
    label.className = 'edf-toggle-label';
    label.textContent = isPopActive ? 'Pop' : 'Original';
    toggleBtn.appendChild(label);
  }

  function toggle() {
    if (isPopActive) {
      deactivatePop();
    } else {
      activatePop();
    }
    isPopActive = !isPopActive;
    sessionStorage.setItem('edf-version', isPopActive ? 'pop' : 'original');
    updateToggleUI();
  }

  function activatePop() {
    var basePath = getBasePath();

    loadedCSS = document.createElement('link');
    loadedCSS.rel = 'stylesheet';
    loadedCSS.href = basePath + POP.css;
    loadedCSS.id = 'edf-enhancement-css';
    document.head.appendChild(loadedCSS);

    POP.js.forEach(function(src, i) {
      var script = document.createElement('script');
      script.src = basePath + src;
      script.id = 'edf-enhancement-js-' + i;
      document.body.appendChild(script);
      loadedJSList.push(script);
    });

    document.body.classList.add('edf-full-pop');
  }

  function deactivatePop() {
    if (loadedCSS) { loadedCSS.remove(); loadedCSS = null; }
    loadedJSList.forEach(function(s) { s.remove(); });
    loadedJSList = [];
    document.body.classList.remove('edf-full-pop');
    document.querySelectorAll('[data-edf-enhanced]').forEach(function(el) { el.remove(); });
    document.querySelectorAll('[data-edf-component]').forEach(function(el) { el.remove(); });
    window.dispatchEvent(new CustomEvent('edf-version-cleanup'));
  }

  function autoLoad() {
    if (isPopActive) activatePop();
  }

  function injectStyles() {
    var style = document.createElement('style');
    style.id = 'edf-version-switcher-styles';
    style.textContent = [
      '#edf-toggle{position:fixed;top:16px;right:16px;z-index:99999;display:flex;align-items:center;gap:10px;padding:8px 14px 8px 10px;background:rgba(13,26,45,0.85);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.08);border-radius:100px;cursor:pointer;font-family:"Inter",-apple-system,sans-serif;transition:all .3s cubic-bezier(.16,1,.3,1);box-shadow:0 2px 12px rgba(0,0,0,0.3)}',
      '#edf-toggle:hover{border-color:rgba(0,212,255,0.25);box-shadow:0 4px 20px rgba(0,0,0,0.4),0 0 20px rgba(0,212,255,0.06)}',

      '.edf-toggle-track{position:relative;width:36px;height:20px;border-radius:10px;background:rgba(255,255,255,0.08);transition:background .3s cubic-bezier(.16,1,.3,1);flex-shrink:0}',
      '.edf-toggle-track.on{background:rgba(0,212,255,0.25)}',

      '.edf-toggle-knob{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#94a3b8;transition:all .3s cubic-bezier(.16,1,.3,1);box-shadow:0 1px 4px rgba(0,0,0,0.3)}',
      '.edf-toggle-track.on .edf-toggle-knob{left:18px;background:#00d4ff;box-shadow:0 0 10px rgba(0,212,255,0.5)}',

      '.edf-toggle-label{font-size:12px;font-weight:600;color:#94a3b8;letter-spacing:0.03em;transition:color .3s}',
      '.edf-toggle-track.on ~ .edf-toggle-label{color:#00d4ff}',

      '@media(max-width:480px){#edf-toggle{top:auto;bottom:16px;right:16px}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  document.addEventListener('DOMContentLoaded', function() {
    injectStyles();
    createToggle();
    autoLoad();
  });
})();
