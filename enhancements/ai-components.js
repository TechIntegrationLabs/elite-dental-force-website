/**
 * EDF AI-Powered Interactive Components
 * Loaded as part of Full Pop version
 *
 * Components:
 * 1. ROI Calculator — sliders → animated savings projection
 * 2. Live Claim Status Feed — simulated real-time processing
 * 3. Eligibility Check Demo — interactive verification simulation
 */
(function() {
  'use strict';

  // Listen for cleanup
  window.addEventListener('edf-version-cleanup', function() {
    document.querySelectorAll('[data-edf-component]').forEach(function(el) { el.remove(); });
  });

  // ========================================
  // 1. ROI CALCULATOR
  // ========================================
  function buildROICalculator() {
    var target = document.querySelector('.cta-band');
    if (!target) return;

    var section = document.createElement('section');
    section.className = 'section edf-roi-section';
    section.setAttribute('data-edf-component', '');
    section.style.position = 'relative';

    var container = document.createElement('div');
    container.className = 'container';

    // Header
    var header = document.createElement('div');
    header.className = 'section-header';
    var overline = document.createElement('span');
    overline.className = 'overline';
    overline.textContent = 'ROI Calculator';
    var h2 = document.createElement('h2');
    h2.textContent = 'See Your Revenue Impact';
    var p = document.createElement('p');
    p.textContent = 'Estimate how much Elite Dental Force can save your practice annually.';
    header.appendChild(overline);
    header.appendChild(h2);
    header.appendChild(p);
    container.appendChild(header);

    // Calculator body
    var calc = document.createElement('div');
    calc.className = 'edf-roi-calc';

    // Sliders panel
    var sliders = document.createElement('div');
    sliders.className = 'edf-roi-sliders';

    var sliderData = [
      { id: 'providers', label: 'Number of Providers', min: 1, max: 50, value: 5, unit: '' },
      { id: 'claims', label: 'Monthly Claims', min: 100, max: 10000, value: 800, unit: '', step: 50 },
      { id: 'denial', label: 'Current Denial Rate', min: 5, max: 40, value: 18, unit: '%' }
    ];

    sliderData.forEach(function(s) {
      var group = document.createElement('div');
      group.className = 'edf-roi-slider-group';

      var labelRow = document.createElement('div');
      labelRow.className = 'edf-roi-label-row';
      var label = document.createElement('label');
      label.textContent = s.label;
      var valDisplay = document.createElement('span');
      valDisplay.className = 'edf-roi-val';
      valDisplay.id = 'edf-roi-val-' + s.id;
      valDisplay.textContent = s.value.toLocaleString() + s.unit;
      labelRow.appendChild(label);
      labelRow.appendChild(valDisplay);

      var input = document.createElement('input');
      input.type = 'range';
      input.id = 'edf-roi-' + s.id;
      input.min = s.min;
      input.max = s.max;
      input.value = s.value;
      if (s.step) input.step = s.step;
      input.className = 'edf-roi-range';

      input.addEventListener('input', function() {
        valDisplay.textContent = parseInt(this.value).toLocaleString() + s.unit;
        updateROI();
      });

      group.appendChild(labelRow);
      group.appendChild(input);
      sliders.appendChild(group);
    });

    // Results panel
    var results = document.createElement('div');
    results.className = 'edf-roi-results';

    var resultItems = [
      { id: 'saved-claims', label: 'Claims Saved from Denial', icon: 'shield' },
      { id: 'revenue', label: 'Additional Annual Revenue', icon: 'dollar' },
      { id: 'hours', label: 'Staff Hours Saved Yearly', icon: 'clock' }
    ];

    resultItems.forEach(function(r) {
      var item = document.createElement('div');
      item.className = 'edf-roi-result-item';

      var val = document.createElement('div');
      val.className = 'edf-roi-result-value';
      val.id = 'edf-roi-result-' + r.id;
      val.textContent = '—';

      var lab = document.createElement('div');
      lab.className = 'edf-roi-result-label';
      lab.textContent = r.label;

      item.appendChild(val);
      item.appendChild(lab);
      results.appendChild(item);
    });

    calc.appendChild(sliders);
    calc.appendChild(results);
    container.appendChild(calc);
    section.appendChild(container);

    // Insert before CTA band
    target.parentNode.insertBefore(section, target);

    // Initial calculation
    updateROI();
  }

  function updateROI() {
    var providers = parseInt(document.getElementById('edf-roi-providers').value);
    var claims = parseInt(document.getElementById('edf-roi-claims').value);
    var denialRate = parseInt(document.getElementById('edf-roi-denial').value);

    // EDF reduces denials by ~35%
    var monthlyDenials = claims * (denialRate / 100);
    var savedClaims = Math.round(monthlyDenials * 0.35);
    var avgClaimValue = 285; // industry average
    var annualRevenue = savedClaims * avgClaimValue * 12;
    var hoursPerClaim = 0.5; // hours to rework a denied claim
    var hoursSaved = Math.round(savedClaims * hoursPerClaim * 12);

    animateValue('edf-roi-result-saved-claims', savedClaims.toLocaleString() + '/mo');
    animateValue('edf-roi-result-revenue', '$' + annualRevenue.toLocaleString());
    animateValue('edf-roi-result-hours', hoursSaved.toLocaleString() + ' hrs');
  }

  function animateValue(id, newValue) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.transform = 'scale(1.08)';
    el.style.color = '#00ffc8';
    el.textContent = newValue;
    setTimeout(function() {
      el.style.transform = '';
      el.style.color = '';
    }, 300);
  }

  // ========================================
  // 2. LIVE CLAIM STATUS FEED
  // ========================================
  function buildClaimFeed() {
    var metricsSection = document.querySelector('.bg-light');
    if (!metricsSection) return;

    var feed = document.createElement('div');
    feed.className = 'edf-claim-feed';
    feed.setAttribute('data-edf-component', '');

    var feedHeader = document.createElement('div');
    feedHeader.className = 'edf-claim-feed-header';
    var dot = document.createElement('span');
    dot.className = 'edf-feed-dot';
    feedHeader.appendChild(dot);
    var headerText = document.createElement('span');
    headerText.textContent = 'Live Processing';
    feedHeader.appendChild(headerText);
    feed.appendChild(feedHeader);

    var feedBody = document.createElement('div');
    feedBody.className = 'edf-claim-feed-body';
    feedBody.id = 'edf-claim-feed-body';
    feed.appendChild(feedBody);

    // Insert after metrics grid
    var metricsGrid = metricsSection.querySelector('.metrics-grid');
    if (metricsGrid) {
      metricsGrid.parentNode.insertBefore(feed, metricsGrid.nextSibling);
    }

    // Start generating claims
    generateClaim();
    var interval = setInterval(function() {
      if (document.querySelector('.edf-claim-feed')) {
        generateClaim();
      } else {
        clearInterval(interval);
      }
    }, 3000);
  }

  var claimNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Davis', 'Garcia', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris'];
  var claimTypes = ['D0120 Periodic Eval', 'D0274 Bitewing X-rays', 'D1110 Prophylaxis', 'D2391 Composite Fill', 'D2740 Crown', 'D4341 Scaling/Root', 'D0150 Comprehensive Eval', 'D2750 Crown Porcelain'];
  var insurers = ['Delta Dental', 'MetLife', 'Cigna', 'Aetna', 'United Health', 'Guardian', 'Humana'];

  function generateClaim() {
    var body = document.getElementById('edf-claim-feed-body');
    if (!body) return;

    var name = claimNames[Math.floor(Math.random() * claimNames.length)];
    var type = claimTypes[Math.floor(Math.random() * claimTypes.length)];
    var insurer = insurers[Math.floor(Math.random() * insurers.length)];
    var amount = '$' + (Math.floor(Math.random() * 800) + 85);
    var isApproved = Math.random() > 0.12; // 88% approval with EDF

    var row = document.createElement('div');
    row.className = 'edf-claim-row edf-claim-entering';

    var left = document.createElement('div');
    left.className = 'edf-claim-left';

    var nameEl = document.createElement('span');
    nameEl.className = 'edf-claim-name';
    nameEl.textContent = 'Patient ' + name;
    left.appendChild(nameEl);

    var typeEl = document.createElement('span');
    typeEl.className = 'edf-claim-type';
    typeEl.textContent = type;
    left.appendChild(typeEl);

    var right = document.createElement('div');
    right.className = 'edf-claim-right';

    var amountEl = document.createElement('span');
    amountEl.className = 'edf-claim-amount';
    amountEl.textContent = amount;
    right.appendChild(amountEl);

    var statusEl = document.createElement('span');
    statusEl.className = 'edf-claim-status edf-status-pending';
    statusEl.textContent = 'Verifying...';
    right.appendChild(statusEl);

    row.appendChild(left);
    row.appendChild(right);

    // Add to top of feed
    body.insertBefore(row, body.firstChild);

    // Animate in
    requestAnimationFrame(function() {
      row.classList.remove('edf-claim-entering');
    });

    // Simulate processing
    setTimeout(function() {
      statusEl.textContent = 'Checking ' + insurer;
      statusEl.className = 'edf-claim-status edf-status-checking';
    }, 800);

    setTimeout(function() {
      if (isApproved) {
        statusEl.textContent = 'Approved';
        statusEl.className = 'edf-claim-status edf-status-approved';
      } else {
        statusEl.textContent = 'Flagged';
        statusEl.className = 'edf-claim-status edf-status-flagged';
      }
    }, 2200);

    // Remove old rows (keep 5 max)
    var rows = body.querySelectorAll('.edf-claim-row');
    if (rows.length > 5) {
      var last = rows[rows.length - 1];
      last.style.opacity = '0';
      last.style.height = '0';
      last.style.padding = '0';
      last.style.margin = '0';
      setTimeout(function() { last.remove(); }, 400);
    }
  }

  // ========================================
  // 3. ELIGIBILITY CHECK DEMO
  // ========================================
  function buildEligibilityDemo() {
    var howItWorks = document.querySelectorAll('.section')[2]; // "How It Works" section
    if (!howItWorks) return;

    var demo = document.createElement('div');
    demo.className = 'edf-elig-demo';
    demo.setAttribute('data-edf-component', '');

    var demoHeader = document.createElement('div');
    demoHeader.className = 'edf-elig-header';
    var headerTitle = document.createElement('h4');
    headerTitle.textContent = 'Try It: Eligibility Check';
    demoHeader.appendChild(headerTitle);
    var headerSub = document.createElement('p');
    headerSub.textContent = 'See how fast EDiFi verifies coverage';
    demoHeader.appendChild(headerSub);
    demo.appendChild(demoHeader);

    // Form
    var form = document.createElement('div');
    form.className = 'edf-elig-form';

    var selectGroup = document.createElement('div');
    selectGroup.className = 'edf-elig-field';
    var select = document.createElement('select');
    select.id = 'edf-elig-insurer';
    var insurerOptions = ['Select Insurance', 'Delta Dental', 'MetLife', 'Cigna', 'Aetna', 'Guardian'];
    insurerOptions.forEach(function(opt, i) {
      var o = document.createElement('option');
      o.value = i === 0 ? '' : opt;
      o.textContent = opt;
      if (i === 0) o.disabled = true;
      if (i === 0) o.selected = true;
      select.appendChild(o);
    });
    selectGroup.appendChild(select);

    var codeGroup = document.createElement('div');
    codeGroup.className = 'edf-elig-field';
    var codeSelect = document.createElement('select');
    codeSelect.id = 'edf-elig-procedure';
    var codeOptions = ['Select Procedure', 'D0120 — Periodic Eval', 'D2740 — Crown Porcelain', 'D4341 — Scaling/Root', 'D1110 — Prophylaxis'];
    codeOptions.forEach(function(opt, i) {
      var o = document.createElement('option');
      o.value = i === 0 ? '' : opt;
      o.textContent = opt;
      if (i === 0) o.disabled = true;
      if (i === 0) o.selected = true;
      codeSelect.appendChild(o);
    });
    codeGroup.appendChild(codeSelect);

    var btnGroup = document.createElement('div');
    btnGroup.className = 'edf-elig-field';
    var checkBtn = document.createElement('button');
    checkBtn.className = 'btn btn-primary';
    checkBtn.textContent = 'Verify Eligibility';
    checkBtn.addEventListener('click', runEligibilityCheck);
    btnGroup.appendChild(checkBtn);

    form.appendChild(selectGroup);
    form.appendChild(codeGroup);
    form.appendChild(btnGroup);
    demo.appendChild(form);

    // Result area
    var resultArea = document.createElement('div');
    resultArea.className = 'edf-elig-result';
    resultArea.id = 'edf-elig-result';
    demo.appendChild(resultArea);

    // Insert after workflow steps
    var workflowSteps = howItWorks.querySelector('.workflow-steps');
    if (workflowSteps) {
      workflowSteps.parentNode.insertBefore(demo, workflowSteps.nextSibling);
    }
  }

  function runEligibilityCheck() {
    var insurer = document.getElementById('edf-elig-insurer').value;
    var procedure = document.getElementById('edf-elig-procedure').value;
    var result = document.getElementById('edf-elig-result');
    if (!insurer || !procedure || !result) return;

    // Clear and show processing
    result.textContent = '';
    result.className = 'edf-elig-result active';

    var steps = [
      { text: 'Connecting to ' + insurer + '...', delay: 0 },
      { text: 'Verifying member coverage...', delay: 600 },
      { text: 'Checking ' + procedure.split(' — ')[0] + ' benefits...', delay: 1200 },
      { text: 'Calculating patient responsibility...', delay: 1800 }
    ];

    steps.forEach(function(step) {
      setTimeout(function() {
        var line = document.createElement('div');
        line.className = 'edf-elig-step';

        var spinner = document.createElement('span');
        spinner.className = 'edf-elig-spinner';
        line.appendChild(spinner);

        var text = document.createElement('span');
        text.textContent = step.text;
        line.appendChild(text);

        result.appendChild(line);

        // Mark previous step as done
        var allSteps = result.querySelectorAll('.edf-elig-step');
        if (allSteps.length > 1) {
          var prev = allSteps[allSteps.length - 2];
          var prevSpinner = prev.querySelector('.edf-elig-spinner');
          if (prevSpinner) {
            prevSpinner.className = 'edf-elig-check';
            prevSpinner.textContent = '\u2713';
          }
        }
      }, step.delay);
    });

    // Final result
    setTimeout(function() {
      // Mark last step done
      var allSteps = result.querySelectorAll('.edf-elig-step');
      var last = allSteps[allSteps.length - 1];
      if (last) {
        var s = last.querySelector('.edf-elig-spinner');
        if (s) { s.className = 'edf-elig-check'; s.textContent = '\u2713'; }
      }

      var coverage = Math.floor(Math.random() * 30) + 70; // 70-100%
      var copay = Math.floor(Math.random() * 40) + 15;
      var deductibleMet = Math.random() > 0.4;

      var card = document.createElement('div');
      card.className = 'edf-elig-card';

      var cardTitle = document.createElement('div');
      cardTitle.className = 'edf-elig-card-title';
      cardTitle.textContent = 'Eligible — Coverage Verified';
      card.appendChild(cardTitle);

      var details = [
        ['Coverage', coverage + '%'],
        ['Est. Copay', '$' + copay],
        ['Deductible', deductibleMet ? 'Met' : '$' + (Math.floor(Math.random() * 100) + 50) + ' remaining'],
        ['Verified', 'Real-time via EDiFi']
      ];

      details.forEach(function(d) {
        var row = document.createElement('div');
        row.className = 'edf-elig-card-row';
        var k = document.createElement('span');
        k.className = 'edf-elig-card-key';
        k.textContent = d[0];
        var v = document.createElement('span');
        v.className = 'edf-elig-card-val';
        v.textContent = d[1];
        row.appendChild(k);
        row.appendChild(v);
        card.appendChild(row);
      });

      var time = document.createElement('div');
      time.className = 'edf-elig-card-time';
      time.textContent = 'Verified in 2.4s — 50% faster than manual';
      card.appendChild(time);

      result.appendChild(card);
    }, 2600);
  }

  // ========================================
  // STYLES
  // ========================================
  function injectComponentStyles() {
    var style = document.createElement('style');
    style.setAttribute('data-edf-component', '');
    style.textContent = [

      /* --- ROI Calculator --- */
      '.edf-roi-section{padding:80px 0}',
      '.edf-roi-calc{display:grid;grid-template-columns:1fr 1fr;gap:48px;margin-top:48px;align-items:start}',
      '@media(max-width:768px){.edf-roi-calc{grid-template-columns:1fr;gap:32px}}',

      '.edf-roi-sliders{display:flex;flex-direction:column;gap:28px}',
      '.edf-roi-label-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}',
      '.edf-roi-label-row label{font-size:14px;font-weight:500;color:#94a3b8}',
      '.edf-roi-val{font-family:"JetBrains Mono","Fira Code",monospace;font-size:15px;font-weight:600;color:#00d4ff;min-width:60px;text-align:right}',

      '.edf-roi-range{-webkit-appearance:none;width:100%;height:6px;border-radius:3px;background:rgba(255,255,255,0.06);outline:none;cursor:pointer}',
      '.edf-roi-range::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#00d4ff;cursor:pointer;box-shadow:0 0 12px rgba(0,212,255,0.4);transition:transform .2s,box-shadow .2s}',
      '.edf-roi-range::-webkit-slider-thumb:hover{transform:scale(1.2);box-shadow:0 0 20px rgba(0,212,255,0.6)}',
      '.edf-roi-range::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#00d4ff;cursor:pointer;border:none;box-shadow:0 0 12px rgba(0,212,255,0.4)}',

      '.edf-roi-results{display:flex;flex-direction:column;gap:20px}',
      '.edf-roi-result-item{padding:24px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);text-align:center;transition:all .3s cubic-bezier(.16,1,.3,1)}',
      '.edf-roi-result-item:hover{border-color:rgba(0,212,255,0.15);box-shadow:0 0 30px rgba(0,212,255,0.04)}',
      '.edf-roi-result-value{font-family:"Space Grotesk",sans-serif;font-size:2.2rem;font-weight:700;color:#00ffc8;letter-spacing:-0.03em;transition:transform .3s cubic-bezier(.16,1,.3,1),color .3s}',
      '.edf-roi-result-label{font-size:13px;color:#64748b;margin-top:6px}',

      /* --- Claim Feed --- */
      '.edf-claim-feed{margin-top:40px;border-radius:12px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);overflow:hidden;max-width:680px;margin-left:auto;margin-right:auto}',
      '.edf-claim-feed-header{display:flex;align-items:center;gap:8px;padding:12px 20px;border-bottom:1px solid rgba(255,255,255,0.04);font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.06em}',
      '.edf-feed-dot{width:6px;height:6px;border-radius:50%;background:#00ffc8;box-shadow:0 0 8px rgba(0,255,200,0.5);animation:edf-dot-pulse 2s ease-in-out infinite}',
      '@keyframes edf-dot-pulse{0%,100%{opacity:1}50%{opacity:.4}}',
      '.edf-claim-feed-body{max-height:260px;overflow:hidden}',

      '.edf-claim-row{display:flex;justify-content:space-between;align-items:center;padding:10px 20px;border-bottom:1px solid rgba(255,255,255,0.03);transition:all .4s cubic-bezier(.16,1,.3,1);overflow:hidden}',
      '.edf-claim-entering{opacity:0;transform:translateY(-10px);height:0;padding:0 20px}',
      '.edf-claim-left{display:flex;flex-direction:column;gap:2px}',
      '.edf-claim-name{font-size:13px;font-weight:500;color:#e8f4f8}',
      '.edf-claim-type{font-size:11px;color:#64748b;font-family:"JetBrains Mono",monospace}',
      '.edf-claim-right{display:flex;align-items:center;gap:12px}',
      '.edf-claim-amount{font-size:13px;font-weight:600;color:#94a3b8;font-family:"JetBrains Mono",monospace}',
      '.edf-claim-status{font-size:11px;font-weight:600;padding:3px 10px;border-radius:100px;text-transform:uppercase;letter-spacing:0.04em;transition:all .3s}',
      '.edf-status-pending{color:#f59e0b;background:rgba(245,158,11,0.1)}',
      '.edf-status-checking{color:#00d4ff;background:rgba(0,212,255,0.1)}',
      '.edf-status-approved{color:#00ffc8;background:rgba(0,255,200,0.1)}',
      '.edf-status-flagged{color:#f87171;background:rgba(248,113,113,0.1)}',

      /* --- Eligibility Demo --- */
      '.edf-elig-demo{margin-top:48px;border-radius:16px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);padding:32px;max-width:600px;margin-left:auto;margin-right:auto}',
      '.edf-elig-header{text-align:center;margin-bottom:24px}',
      '.edf-elig-header h4{color:#fff;font-family:"Space Grotesk",sans-serif;margin-bottom:4px}',
      '.edf-elig-header p{font-size:13px;color:#64748b}',

      '.edf-elig-form{display:flex;gap:12px;flex-wrap:wrap}',
      '.edf-elig-field{flex:1;min-width:140px}',
      '.edf-elig-field select{width:100%;padding:10px 14px;border-radius:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);color:#e8f4f8;font-size:13px;font-family:inherit;cursor:pointer;transition:border-color .2s}',
      '.edf-elig-field select:focus{outline:none;border-color:rgba(0,212,255,0.3)}',
      '.edf-elig-field select option{background:#0d1a2d;color:#e8f4f8}',
      '.edf-elig-field .btn{width:100%;font-size:13px;padding:10px 16px}',

      '.edf-elig-result{margin-top:20px;display:none}',
      '.edf-elig-result.active{display:block}',

      '.edf-elig-step{display:flex;align-items:center;gap:10px;padding:6px 0;font-size:13px;color:#94a3b8;animation:edf-step-in .3s ease forwards}',
      '@keyframes edf-step-in{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}',

      '.edf-elig-spinner{width:16px;height:16px;border:2px solid rgba(0,212,255,0.2);border-top-color:#00d4ff;border-radius:50%;animation:edf-spin .6s linear infinite;flex-shrink:0}',
      '@keyframes edf-spin{to{transform:rotate(360deg)}}',
      '.edf-elig-check{width:16px;height:16px;display:flex;align-items:center;justify-content:center;color:#00ffc8;font-size:14px;font-weight:bold;flex-shrink:0}',

      '.edf-elig-card{margin-top:16px;border-radius:10px;background:rgba(0,255,200,0.04);border:1px solid rgba(0,255,200,0.15);padding:16px 20px;animation:edf-card-pop .4s cubic-bezier(.16,1,.3,1)}',
      '@keyframes edf-card-pop{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:none}}',
      '.edf-elig-card-title{font-size:14px;font-weight:700;color:#00ffc8;margin-bottom:12px}',
      '.edf-elig-card-row{display:flex;justify-content:space-between;padding:4px 0;font-size:13px}',
      '.edf-elig-card-key{color:#64748b}',
      '.edf-elig-card-val{color:#e8f4f8;font-weight:500;font-family:"JetBrains Mono",monospace;font-size:12px}',
      '.edf-elig-card-time{margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.04);font-size:12px;color:#00d4ff;font-family:"JetBrains Mono",monospace}'

    ].join('\n');
    document.head.appendChild(style);
  }

  // ========================================
  // INIT
  // ========================================
  function init() {
    injectComponentStyles();
    buildROICalculator();
    buildClaimFeed();
    buildEligibilityDemo();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
