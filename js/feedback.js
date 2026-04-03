/* ============================================
   ELITE DENTAL FORCE - FEEDBACK SYSTEM
   Region capture + Supabase submission
   ============================================ */

(function () {
  'use strict';

  const SUPABASE_URL = 'https://zdejveikmcmtkdvgpbzi.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkZWp2ZWlrbWNtdGtkdmdwYnppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc2ODQ1NDYsImV4cCI6MjA1MzI2MDU0Nn0.gVLMSQkjGbFjAWFHCMrFRPbhSFQe2sIP7kJmnFMy0e4';

  const CATEGORIES = ['Design', 'Content', 'Navigation', 'Bug', 'Suggestion'];

  let screenshotDataUrl = null;

  // ── Inject Styles ──
  const style = document.createElement('style');
  style.textContent = `
    /* Floating Trigger Button */
    .edf-fb-trigger {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99990;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 24px;
      background: var(--color-cyan, #00d4ff);
      color: var(--color-brand, #0f1d35);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0, 212, 255, 0.35);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      font-family: var(--font-body, 'Inter', sans-serif);
      font-weight: 600;
      font-size: 14px;
      white-space: nowrap;
    }
    .edf-fb-trigger:hover {
      width: 130px;
      box-shadow: 0 6px 28px rgba(0, 212, 255, 0.5);
    }
    .edf-fb-trigger svg {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      transition: margin 0.3s;
    }
    .edf-fb-trigger .edf-fb-label {
      max-width: 0;
      opacity: 0;
      overflow: hidden;
      transition: max-width 0.3s, opacity 0.25s 0.05s, margin 0.3s;
      margin-left: 0;
    }
    .edf-fb-trigger:hover .edf-fb-label {
      max-width: 90px;
      opacity: 1;
      margin-left: 6px;
    }

    /* Overlay for region capture */
    .edf-fb-overlay {
      position: fixed;
      inset: 0;
      z-index: 99991;
      cursor: crosshair;
      background: rgba(0, 0, 0, 0.25);
    }
    .edf-fb-overlay-hint {
      position: fixed;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 99992;
      background: var(--color-brand, #0f1d35);
      color: var(--color-text, #e8f0f8);
      font-family: var(--font-body, 'Inter', sans-serif);
      font-size: 14px;
      padding: 10px 20px;
      border-radius: 8px;
      border: 1px solid var(--border-subtle, rgba(255,255,255,0.09));
      box-shadow: var(--shadow-lg, 0 8px 32px rgba(0,0,0,0.5));
    }
    .edf-fb-selection {
      position: fixed;
      border: 2px solid var(--color-cyan, #00d4ff);
      background: rgba(0, 212, 255, 0.08);
      z-index: 99992;
      pointer-events: none;
    }

    /* Modal Backdrop */
    .edf-fb-backdrop {
      position: fixed;
      inset: 0;
      z-index: 99993;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.25s;
    }
    .edf-fb-backdrop.visible { opacity: 1; }

    /* Modal */
    .edf-fb-modal {
      background: var(--color-brand, #0f1d35);
      border: 1px solid var(--border-subtle, rgba(255,255,255,0.09));
      border-radius: 16px;
      width: 460px;
      max-width: 94vw;
      max-height: 90vh;
      overflow-y: auto;
      padding: 28px;
      box-shadow: var(--shadow-xl, 0 16px 64px rgba(0,0,0,0.6));
      transform: translateY(12px) scale(0.97);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: var(--font-body, 'Inter', sans-serif);
      color: var(--color-text, #e8f0f8);
      position: relative;
    }
    .edf-fb-backdrop.visible .edf-fb-modal {
      transform: translateY(0) scale(1);
    }
    .edf-fb-modal h3 {
      margin: 0 0 20px;
      font-family: var(--font-heading, 'Plus Jakarta Sans', sans-serif);
      font-size: 20px;
      font-weight: 700;
      color: var(--color-white, #fff);
    }

    /* Screenshot preview */
    .edf-fb-screenshot-wrap {
      margin-bottom: 18px;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid var(--border-subtle, rgba(255,255,255,0.09));
      max-height: 180px;
    }
    .edf-fb-screenshot-wrap img {
      width: 100%;
      display: block;
      object-fit: contain;
    }

    /* Category buttons */
    .edf-fb-categories {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }
    .edf-fb-cat-btn {
      padding: 6px 14px;
      border-radius: 20px;
      border: 1px solid var(--border-medium, rgba(255,255,255,0.14));
      background: transparent;
      color: var(--color-text-secondary, #94a3b8);
      font-family: var(--font-body, 'Inter', sans-serif);
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .edf-fb-cat-btn:hover {
      border-color: var(--color-cyan, #00d4ff);
      color: var(--color-cyan, #00d4ff);
    }
    .edf-fb-cat-btn.active {
      background: var(--color-cyan-dim, rgba(0,212,255,0.15));
      border-color: var(--color-cyan, #00d4ff);
      color: var(--color-cyan, #00d4ff);
      font-weight: 600;
    }

    /* Form fields */
    .edf-fb-field { margin-bottom: 14px; }
    .edf-fb-field label {
      display: block;
      font-size: 13px;
      color: var(--color-text-secondary, #94a3b8);
      margin-bottom: 5px;
    }
    .edf-fb-field input,
    .edf-fb-field textarea {
      width: 100%;
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid var(--border-subtle, rgba(255,255,255,0.09));
      background: var(--color-surface, #12203a);
      color: var(--color-text, #e8f0f8);
      font-family: var(--font-body, 'Inter', sans-serif);
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .edf-fb-field input:focus,
    .edf-fb-field textarea:focus {
      border-color: var(--color-cyan, #00d4ff);
    }
    .edf-fb-field textarea { resize: vertical; min-height: 90px; }

    /* Submit button */
    .edf-fb-submit {
      width: 100%;
      padding: 12px;
      border: none;
      border-radius: 10px;
      background: var(--color-cyan, #00d4ff);
      color: var(--color-brand, #0f1d35);
      font-family: var(--font-body, 'Inter', sans-serif);
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.15s;
    }
    .edf-fb-submit:hover { opacity: 0.9; transform: translateY(-1px); }
    .edf-fb-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    /* Close button */
    .edf-fb-close {
      position: absolute;
      top: 14px;
      right: 14px;
      background: none;
      border: none;
      color: var(--color-text-muted, #475569);
      cursor: pointer;
      padding: 4px;
      font-size: 22px;
      line-height: 1;
      transition: color 0.2s;
    }
    .edf-fb-close:hover { color: var(--color-text, #e8f0f8); }

    /* Success state */
    .edf-fb-success {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
    }
    .edf-fb-checkmark {
      width: 56px;
      height: 56px;
      color: var(--color-green, #00ffc8);
      margin-bottom: 16px;
      animation: edf-fb-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .edf-fb-success p {
      font-size: 16px;
      color: var(--color-text, #e8f0f8);
      margin: 0;
    }
    @keyframes edf-fb-pop {
      0% { transform: scale(0); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  // ── Create Trigger Button ──
  const trigger = document.createElement('button');
  trigger.className = 'edf-fb-trigger';
  trigger.setAttribute('aria-label', 'Send feedback');

  const triggerIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  triggerIcon.setAttribute('viewBox', '0 0 24 24');
  triggerIcon.setAttribute('fill', 'none');
  triggerIcon.setAttribute('stroke', 'currentColor');
  triggerIcon.setAttribute('stroke-width', '2');
  triggerIcon.setAttribute('stroke-linecap', 'round');
  triggerIcon.setAttribute('stroke-linejoin', 'round');
  const triggerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  triggerPath.setAttribute('d', 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z');
  triggerIcon.appendChild(triggerPath);
  trigger.appendChild(triggerIcon);

  const triggerLabel = document.createElement('span');
  triggerLabel.className = 'edf-fb-label';
  triggerLabel.textContent = 'Feedback';
  trigger.appendChild(triggerLabel);

  document.body.appendChild(trigger);

  // ── Region Capture ──
  trigger.addEventListener('click', startCapture);

  function startCapture() {
    trigger.style.display = 'none';

    const overlay = document.createElement('div');
    overlay.className = 'edf-fb-overlay';

    const hint = document.createElement('div');
    hint.className = 'edf-fb-overlay-hint';
    hint.textContent = 'Drag to select a region, or click anywhere to skip screenshot';

    document.body.appendChild(overlay);
    document.body.appendChild(hint);

    let startX, startY, selBox, dragging = false;

    overlay.addEventListener('mousedown', function (e) {
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      selBox = document.createElement('div');
      selBox.className = 'edf-fb-selection';
      document.body.appendChild(selBox);
    });

    overlay.addEventListener('mousemove', function (e) {
      if (!dragging || !selBox) return;
      var x = Math.min(e.clientX, startX);
      var y = Math.min(e.clientY, startY);
      var w = Math.abs(e.clientX - startX);
      var h = Math.abs(e.clientY - startY);
      selBox.style.left = x + 'px';
      selBox.style.top = y + 'px';
      selBox.style.width = w + 'px';
      selBox.style.height = h + 'px';
    });

    overlay.addEventListener('mouseup', function (e) {
      var endX = e.clientX;
      var endY = e.clientY;
      var w = Math.abs(endX - startX);
      var h = Math.abs(endY - startY);

      cleanup();

      if (w < 10 || h < 10) {
        screenshotDataUrl = null;
        openModal();
        return;
      }

      var rect = {
        x: Math.min(startX, endX) + window.scrollX,
        y: Math.min(startY, endY) + window.scrollY,
        width: w,
        height: h,
      };

      captureRegion(rect).then(function () { openModal(); });
    });

    overlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { cleanup(); trigger.style.display = ''; }
    });
    overlay.setAttribute('tabindex', '0');
    overlay.focus();

    function cleanup() {
      overlay.remove();
      hint.remove();
      if (selBox) selBox.remove();
    }
  }

  function captureRegion(rect) {
    return html2canvas(document.body, {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      scale: 1,
      useCORS: true,
      logging: false,
    }).then(function (canvas) {
      screenshotDataUrl = canvas.toDataURL('image/png');
    }).catch(function (err) {
      console.warn('Screenshot capture failed:', err);
      screenshotDataUrl = null;
    });
  }

  // ── Modal (built with safe DOM methods) ──
  function openModal() {
    var selectedCategory = null;

    var backdrop = document.createElement('div');
    backdrop.className = 'edf-fb-backdrop';

    var modal = document.createElement('div');
    modal.className = 'edf-fb-modal';

    // Close button
    var closeBtn = document.createElement('button');
    closeBtn.className = 'edf-fb-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '\u00D7';
    modal.appendChild(closeBtn);

    // Title
    var title = document.createElement('h3');
    title.textContent = 'Send Feedback';
    modal.appendChild(title);

    // Screenshot preview
    if (screenshotDataUrl) {
      var ssWrap = document.createElement('div');
      ssWrap.className = 'edf-fb-screenshot-wrap';
      var ssImg = document.createElement('img');
      ssImg.src = screenshotDataUrl;
      ssImg.alt = 'Screenshot preview';
      ssWrap.appendChild(ssImg);
      modal.appendChild(ssWrap);
    }

    // Category buttons
    var catWrap = document.createElement('div');
    catWrap.className = 'edf-fb-categories';
    CATEGORIES.forEach(function (c) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'edf-fb-cat-btn';
      btn.dataset.cat = c;
      btn.textContent = c;
      btn.addEventListener('click', function () {
        catWrap.querySelectorAll('.edf-fb-cat-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        selectedCategory = c;
      });
      catWrap.appendChild(btn);
    });
    modal.appendChild(catWrap);

    // Name field
    var nameField = document.createElement('div');
    nameField.className = 'edf-fb-field';
    var nameLabel = document.createElement('label');
    nameLabel.setAttribute('for', 'edf-fb-name');
    nameLabel.textContent = 'Name (optional)';
    var nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'edf-fb-name';
    nameInput.placeholder = 'Your name';
    nameField.appendChild(nameLabel);
    nameField.appendChild(nameInput);
    modal.appendChild(nameField);

    // Feedback textarea
    var fbField = document.createElement('div');
    fbField.className = 'edf-fb-field';
    var fbLabel = document.createElement('label');
    fbLabel.setAttribute('for', 'edf-fb-text');
    fbLabel.textContent = 'Feedback *';
    var fbText = document.createElement('textarea');
    fbText.id = 'edf-fb-text';
    fbText.placeholder = 'Describe your feedback...';
    fbField.appendChild(fbLabel);
    fbField.appendChild(fbText);
    modal.appendChild(fbField);

    // Submit button
    var submitBtn = document.createElement('button');
    submitBtn.className = 'edf-fb-submit';
    submitBtn.textContent = 'Submit Feedback';
    modal.appendChild(submitBtn);

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    requestAnimationFrame(function () { backdrop.classList.add('visible'); });

    // Close handlers
    closeBtn.addEventListener('click', function () { closeModal(backdrop); });
    backdrop.addEventListener('click', function (e) { if (e.target === backdrop) closeModal(backdrop); });

    // Submit handler
    submitBtn.addEventListener('click', function () {
      var feedbackText = fbText.value.trim();
      if (!feedbackText) {
        fbText.style.borderColor = '#ef4444';
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      var payload = {
        name: nameInput.value.trim() || null,
        category: selectedCategory || 'General',
        feedback: feedbackText,
        screenshot: screenshotDataUrl || null,
        page: window.location.href,
        viewport: window.innerWidth + 'x' + window.innerHeight,
        browser: navigator.userAgent,
        status: 'pending',
      };

      fetch(SUPABASE_URL + '/rest/v1/edf_feedback', {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(payload),
      }).then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        showSuccess(modal, backdrop);
      }).catch(function (err) {
        console.error('Feedback submission failed:', err);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Retry';
        submitBtn.style.background = '#ef4444';
      });
    });
  }

  function showSuccess(modal, backdrop) {
    // Clear modal content
    while (modal.firstChild) modal.removeChild(modal.firstChild);

    var successDiv = document.createElement('div');
    successDiv.className = 'edf-fb-success';

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'edf-fb-checkmark');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2.5');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M20 6 9 17l-5-5');
    svg.appendChild(path);
    successDiv.appendChild(svg);

    var msg = document.createElement('p');
    msg.textContent = 'Thank you for your feedback!';
    successDiv.appendChild(msg);

    modal.appendChild(successDiv);

    setTimeout(function () {
      closeModal(backdrop);
    }, 2200);
  }

  function closeModal(backdrop) {
    backdrop.classList.remove('visible');
    setTimeout(function () {
      backdrop.remove();
      trigger.style.display = '';
      screenshotDataUrl = null;
    }, 280);
  }
})();
