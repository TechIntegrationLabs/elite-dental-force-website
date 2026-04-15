/**
 * EDF Preview — Feedback Widget
 * Posts to /api/feedback (Netlify function backed by Netlify Blobs).
 * Mirrors pair-dental's submit/dashboard contract: 7-state workflow,
 * dual approval, audit log, region screenshot, await+res.ok safety.
 */
(function () {
  "use strict";

  const ENDPOINT = "/api/feedback";
  const CATEGORIES = ["Design", "Content", "Navigation", "Bug", "Suggestion"];
  let pendingScreenshot = null;

  // ── Inject styles ──
  const css = `
    .edf-fb-trigger{position:fixed;bottom:24px;right:24px;z-index:99990;display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:24px;background:var(--color-cyan,#00d4ff);color:var(--color-brand,#0f1d35);border:none;cursor:pointer;box-shadow:0 4px 20px rgba(0,212,255,.35);transition:all .3s cubic-bezier(.4,0,.2,1);overflow:hidden;font-family:var(--font-body,'Inter',sans-serif);font-weight:600;font-size:14px;white-space:nowrap}
    .edf-fb-trigger:hover{width:130px;box-shadow:0 6px 28px rgba(0,212,255,.5)}
    .edf-fb-trigger svg{flex-shrink:0;width:20px;height:20px}
    .edf-fb-trigger .edf-fb-label{max-width:0;opacity:0;overflow:hidden;transition:max-width .3s,opacity .25s .05s,margin .3s;margin-left:0}
    .edf-fb-trigger:hover .edf-fb-label{max-width:90px;opacity:1;margin-left:6px}
    .edf-fb-overlay{position:fixed;inset:0;z-index:99991;cursor:crosshair;background:rgba(0,0,0,.25)}
    .edf-fb-overlay-hint{position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:99992;background:var(--color-brand,#0f1d35);color:var(--color-text,#e8f0f8);font-family:var(--font-body,'Inter',sans-serif);font-size:14px;padding:10px 20px;border-radius:8px;border:1px solid rgba(255,255,255,.09);box-shadow:0 8px 32px rgba(0,0,0,.5)}
    .edf-fb-selection{position:fixed;border:2px solid var(--color-cyan,#00d4ff);background:rgba(0,212,255,.08);z-index:99992;pointer-events:none}
    .edf-fb-backdrop{position:fixed;inset:0;z-index:99993;background:rgba(0,0,0,.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .25s}
    .edf-fb-backdrop.visible{opacity:1}
    .edf-fb-modal{background:var(--color-brand,#0f1d35);border:1px solid rgba(255,255,255,.09);border-radius:16px;width:460px;max-width:94vw;max-height:90vh;overflow-y:auto;padding:28px;box-shadow:0 16px 64px rgba(0,0,0,.6);transform:translateY(12px) scale(.97);transition:transform .3s cubic-bezier(.4,0,.2,1);font-family:var(--font-body,'Inter',sans-serif);color:var(--color-text,#e8f0f8);position:relative}
    .edf-fb-backdrop.visible .edf-fb-modal{transform:none}
    .edf-fb-modal h3{margin:0 0 20px;font-family:var(--font-heading,'Plus Jakarta Sans',sans-serif);font-size:20px;font-weight:700;color:#fff}
    .edf-fb-screenshot-wrap{margin-bottom:18px;border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,.09);max-height:180px}
    .edf-fb-screenshot-wrap img{width:100%;display:block;object-fit:contain}
    .edf-fb-categories{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
    .edf-fb-cat-btn{padding:6px 14px;border-radius:20px;border:1px solid rgba(255,255,255,.14);background:transparent;color:#94a3b8;font-family:var(--font-body,'Inter',sans-serif);font-size:13px;cursor:pointer;transition:all .2s}
    .edf-fb-cat-btn:hover{border-color:var(--color-cyan,#00d4ff);color:var(--color-cyan,#00d4ff)}
    .edf-fb-cat-btn.active{background:rgba(0,212,255,.15);border-color:var(--color-cyan,#00d4ff);color:var(--color-cyan,#00d4ff);font-weight:600}
    .edf-fb-field{margin-bottom:14px}
    .edf-fb-field label{display:block;font-size:13px;color:#94a3b8;margin-bottom:5px}
    .edf-fb-field input,.edf-fb-field textarea{width:100%;padding:10px 14px;border-radius:8px;border:1px solid rgba(255,255,255,.09);background:#12203a;color:var(--color-text,#e8f0f8);font-family:var(--font-body,'Inter',sans-serif);font-size:14px;outline:none;transition:border-color .2s;box-sizing:border-box}
    .edf-fb-field input:focus,.edf-fb-field textarea:focus{border-color:var(--color-cyan,#00d4ff)}
    .edf-fb-field textarea{resize:vertical;min-height:90px}
    .edf-fb-submit{width:100%;padding:12px;border:none;border-radius:10px;background:var(--color-cyan,#00d4ff);color:var(--color-brand,#0f1d35);font-family:var(--font-body,'Inter',sans-serif);font-size:15px;font-weight:700;cursor:pointer;transition:opacity .2s,transform .15s}
    .edf-fb-submit:hover{opacity:.9;transform:translateY(-1px)}
    .edf-fb-submit:disabled{opacity:.5;cursor:not-allowed;transform:none}
    .edf-fb-error-banner{margin-bottom:14px;padding:10px 14px;border-radius:8px;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.45);color:#fca5a5;font-size:13px;display:none}
    .edf-fb-error-banner.visible{display:block}
    .edf-fb-close{position:absolute;top:14px;right:14px;background:none;border:none;color:#475569;cursor:pointer;padding:4px;font-size:22px;line-height:1;transition:color .2s}
    .edf-fb-close:hover{color:#e8f0f8}
    .edf-fb-success{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;text-align:center}
    .edf-fb-checkmark{width:56px;height:56px;color:#00ffc8;margin-bottom:16px;animation:edf-fb-pop .4s cubic-bezier(.34,1.56,.64,1)}
    .edf-fb-success p{font-size:16px;color:var(--color-text,#e8f0f8);margin:0}
    @keyframes edf-fb-pop{0%{transform:scale(0);opacity:0}100%{transform:scale(1);opacity:1}}
  `;
  const styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── Trigger button ──
  const trigger = document.createElement("button");
  trigger.className = "edf-fb-trigger";
  trigger.setAttribute("aria-label", "Send feedback");
  trigger.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
  '<span class="edf-fb-label">Feedback</span>';
  document.body.appendChild(trigger);

  // ── Helpers ──
  function close(el) {
    el.classList.remove("visible");
    setTimeout(() => {
      el.remove();
      trigger.style.display = "";
      pendingScreenshot = null;
    }, 280);
  }

  async function loadHtml2Canvas() {
    if (window.html2canvas) return;
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function captureRegion(rect) {
    try {
      await loadHtml2Canvas();
      const canvas = await window.html2canvas(document.body, {
        x: rect.x, y: rect.y, width: rect.width, height: rect.height,
        scale: 1, useCORS: true, logging: false,
      });
      pendingScreenshot = canvas.toDataURL("image/png");
    } catch (err) {
      console.warn("[edf-fb] screenshot failed:", err);
      pendingScreenshot = null;
    }
  }

  // ── Modal ──
  function openModal() {
    let chosenCategory = null;
    const backdrop = document.createElement("div");
    backdrop.className = "edf-fb-backdrop";
    const modal = document.createElement("div");
    modal.className = "edf-fb-modal";

    const closeBtn = document.createElement("button");
    closeBtn.className = "edf-fb-close";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.textContent = "×";
    modal.appendChild(closeBtn);

    const title = document.createElement("h3");
    title.textContent = "Send Feedback";
    modal.appendChild(title);

    const errorBanner = document.createElement("div");
    errorBanner.className = "edf-fb-error-banner";
    modal.appendChild(errorBanner);

    if (pendingScreenshot) {
      const wrap = document.createElement("div");
      wrap.className = "edf-fb-screenshot-wrap";
      const img = document.createElement("img");
      img.src = pendingScreenshot;
      img.alt = "Screenshot preview";
      wrap.appendChild(img);
      modal.appendChild(wrap);
    }

    const catRow = document.createElement("div");
    catRow.className = "edf-fb-categories";
    CATEGORIES.forEach((cat) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "edf-fb-cat-btn";
      b.textContent = cat;
      b.addEventListener("click", () => {
        catRow.querySelectorAll(".edf-fb-cat-btn").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        chosenCategory = cat;
      });
      catRow.appendChild(b);
    });
    modal.appendChild(catRow);

    const nameField = document.createElement("div");
    nameField.className = "edf-fb-field";
    nameField.innerHTML = '<label for="edf-fb-name">Name (optional)</label><input type="text" id="edf-fb-name" placeholder="Your name">';
    modal.appendChild(nameField);

    const textField = document.createElement("div");
    textField.className = "edf-fb-field";
    textField.innerHTML = '<label for="edf-fb-text">Feedback *</label><textarea id="edf-fb-text" placeholder="Describe your feedback..."></textarea>';
    modal.appendChild(textField);

    const submit = document.createElement("button");
    submit.className = "edf-fb-submit";
    submit.textContent = "Submit Feedback";
    modal.appendChild(submit);

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    requestAnimationFrame(() => backdrop.classList.add("visible"));

    closeBtn.addEventListener("click", () => close(backdrop));
    backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(backdrop); });

    submit.addEventListener("click", async () => {
      const textArea = modal.querySelector("#edf-fb-text");
      const nameInput = modal.querySelector("#edf-fb-name");
      const feedbackText = textArea.value.trim();
      if (!feedbackText) {
        textArea.style.borderColor = "#ef4444";
        return;
      }
      submit.disabled = true;
      submit.textContent = "Sending...";
      errorBanner.classList.remove("visible");

      const payload = {
        name: nameInput.value.trim() || null,
        category: (chosenCategory || "general").toLowerCase(),
        feedback: feedbackText,
        screenshot: pendingScreenshot || null,
        page: window.location.pathname + window.location.hash,
        url: window.location.href,
        viewport: window.innerWidth + "x" + window.innerHeight,
        browser: navigator.userAgent,
        ts: Date.now(),
      };

      try {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          let detail = "";
          try { detail = (await res.json()).error || ""; } catch {}
          throw new Error("HTTP " + res.status + (detail ? " — " + detail : ""));
        }
        const json = await res.json();
        if (!json || !json.ok || !json.id) {
          throw new Error("Server did not confirm save");
        }
        // ── Success ──
        while (modal.firstChild) modal.removeChild(modal.firstChild);
        const success = document.createElement("div");
        success.className = "edf-fb-success";
        success.innerHTML =
          '<svg class="edf-fb-checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>' +
          '<p>Thank you for your feedback!</p>';
        modal.appendChild(success);
        setTimeout(() => close(backdrop), 2200);
      } catch (err) {
        console.error("[edf-fb] submission failed:", err);
        errorBanner.textContent = "Couldn't save your feedback: " + (err.message || "unknown error") + ". Click Retry.";
        errorBanner.classList.add("visible");
        submit.disabled = false;
        submit.textContent = "Retry";
        submit.style.background = "#ef4444";
        submit.style.color = "#fff";
      }
    });
  }

  // ── Region capture flow ──
  trigger.addEventListener("click", () => {
    trigger.style.display = "none";
    const overlay = document.createElement("div");
    overlay.className = "edf-fb-overlay";
    const hint = document.createElement("div");
    hint.className = "edf-fb-overlay-hint";
    hint.textContent = "Drag to select a region, or click anywhere to skip screenshot · Esc to cancel";
    document.body.appendChild(overlay);
    document.body.appendChild(hint);

    let dragging = false, startX, startY, sel;
    function cleanup() {
      overlay.remove(); hint.remove();
      if (sel) sel.remove();
    }
    overlay.addEventListener("mousedown", (e) => {
      dragging = true;
      startX = e.clientX; startY = e.clientY;
      sel = document.createElement("div");
      sel.className = "edf-fb-selection";
      document.body.appendChild(sel);
    });
    overlay.addEventListener("mousemove", (e) => {
      if (!dragging || !sel) return;
      const x = Math.min(e.clientX, startX), y = Math.min(e.clientY, startY);
      const w = Math.abs(e.clientX - startX), h = Math.abs(e.clientY - startY);
      sel.style.cssText += `;left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
    });
    overlay.addEventListener("mouseup", async (e) => {
      const w = Math.abs(e.clientX - startX), h = Math.abs(e.clientY - startY);
      cleanup();
      if (w < 10 || h < 10) {
        pendingScreenshot = null;
        openModal();
        return;
      }
      await captureRegion({
        x: Math.min(startX, e.clientX) + window.scrollX,
        y: Math.min(startY, e.clientY) + window.scrollY,
        width: w, height: h,
      });
      openModal();
    });
    document.addEventListener("keydown", function escHandler(e) {
      if (e.key === "Escape") {
        cleanup();
        trigger.style.display = "";
        document.removeEventListener("keydown", escHandler);
      }
    });
  });
})();
