/* ═══════════════════════════════════════════════════════════════
   LIFE SIMULATOR — DECISION IMPACT ENGINE
   app.js — Animations, Interactions, Simulator Logic
   ═══════════════════════════════════════════════════════════════ */

// ─── Wait for DOM ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // ── Register GSAP Plugins ──────────────────────────────────────
  gsap.registerPlugin(ScrollTrigger);

  // ── Init everything ────────────────────────────────────────────
  initStarfield();
  initNavbar();
  initHeroAnimations();
  initScrollAnimations();
  initSimulator();
  initHamburger();

});

/* ════════════════════════════════════════════════════════════════
   STARFIELD CANVAS
════════════════════════════════════════════════════════════════ */
function initStarfield() {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');

  let W, H, stars = [], shootingStars = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createStars(count) {
    stars = [];
    for (let i = 0; i < count; i++) {
      const depth = Math.random(); // 0 = far, 1 = close
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.3 + depth * 1.8,
        speed: 0.02 + depth * 0.08,
        opacity: 0.2 + depth * 0.8,
        twinkleSpeed: 0.005 + Math.random() * 0.015,
        twinklePhase: Math.random() * Math.PI * 2,
        color: getStarColor(),
      });
    }
  }

  function getStarColor() {
    const colors = ['255,255,255', '200,180,255', '180,210,255', '255,200,200'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function spawnShootingStar() {
    shootingStars.push({
      x: Math.random() * W,
      y: Math.random() * H * 0.5,
      len: 80 + Math.random() * 120,
      speed: 6 + Math.random() * 8,
      angle: Math.PI / 6 + Math.random() * Math.PI / 8,
      opacity: 1,
      life: 1,
    });
  }

  function drawStars() {
    ctx.clearRect(0, 0, W, H);

    // Static stars
    stars.forEach(s => {
      s.twinklePhase += s.twinkleSpeed;
      const twinkle = 0.6 + 0.4 * Math.sin(s.twinklePhase);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.color}, ${s.opacity * twinkle})`;
      ctx.fill();
    });

    // Shooting stars
    shootingStars.forEach((ss, i) => {
      ctx.save();
      ctx.translate(ss.x, ss.y);
      ctx.rotate(ss.angle);
      const grad = ctx.createLinearGradient(0, 0, ss.len, 0);
      grad.addColorStop(0, `rgba(255,255,255,0)`);
      grad.addColorStop(0.7, `rgba(200,180,255,${ss.opacity * 0.8})`);
      grad.addColorStop(1, `rgba(255,255,255,${ss.opacity})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(ss.len, 0);
      ctx.stroke();
      ctx.restore();

      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.life -= 0.012;
      ss.opacity = ss.life;

      if (ss.life <= 0) shootingStars.splice(i, 1);
    });

    // Random shooting star spawns
    if (Math.random() < 0.004) spawnShootingStar();

    requestAnimationFrame(drawStars);
  }

  window.addEventListener('resize', () => {
    resize();
    createStars(250);
  });

  resize();
  createStars(250);
  drawStars();
}

/* ════════════════════════════════════════════════════════════════
   NAVBAR — Scroll + Mobile
════════════════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Active link highlight on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (activeLink) activeLink.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  sections.forEach(s => observer.observe(s));
}

function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const overlay   = document.getElementById('navMobileOverlay');
  if (!hamburger) return;

  function openMenu() {
    overlay?.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    overlay?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    overlay?.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    overlay?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    hamburger.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close on mobile link click
  document.querySelectorAll('.nav-mobile-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !overlay?.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

/* ════════════════════════════════════════════════════════════════
   HERO ANIMATIONS — Page Load
════════════════════════════════════════════════════════════════ */
function initHeroAnimations() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Staggered page load sequence
  tl.fromTo('#navbar',
    { y: -80, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8 }
  )
  .fromTo('.hero-eyebrow',
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7 },
    '-=0.3'
  )
  .fromTo('.hero-heading',
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.9 },
    '-=0.5'
  )
  .fromTo('.hero-sub',
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7 },
    '-=0.5'
  )
  .fromTo('.hero-cta',
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7 },
    '-=0.4'
  )
  .fromTo('.hero-stats',
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6 },
    '-=0.3'
  )
  .fromTo('.hero-visual',
    { scale: 0.7, opacity: 0 },
    { scale: 1, opacity: 1, duration: 1.2, ease: 'back.out(1.5)' },
    '-=1'
  )
  .fromTo('.scroll-indicator',
    { opacity: 0 },
    { opacity: 1, duration: 0.6 },
    '-=0.3'
  );
}

/* ════════════════════════════════════════════════════════════════
   SCROLL ANIMATIONS — GSAP ScrollTrigger
════════════════════════════════════════════════════════════════ */
function initScrollAnimations() {

  // Generic section titles
  gsap.utils.toArray('.section-label, .section-title, .section-sub').forEach(el => {
    gsap.fromTo(el,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.8,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      }
    );
  });

  // Feature cards — stagger
  gsap.fromTo('.feature-card',
    { y: 60, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 0.8, stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.features-grid', start: 'top 80%', once: true }
    }
  );

  // How it works steps
  gsap.fromTo('.hiw-step',
    { x: -50, opacity: 0 },
    {
      x: 0, opacity: 1, duration: 0.8, stagger: 0.2,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.hiw-steps', start: 'top 80%', once: true }
    }
  );

  // Simulator section
  gsap.fromTo('.sim-box',
    { y: 60, opacity: 0, scale: 0.96 },
    {
      y: 0, opacity: 1, scale: 1, duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.simulator-section', start: 'top 75%', once: true }
    }
  );

  // About cards
  gsap.fromTo('.about-card',
    { y: 50, opacity: 0 },
    {
      y: 0, opacity: 1, duration: 0.7, stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.about-grid', start: 'top 80%', once: true }
    }
  );

  // Contact section
  gsap.fromTo('.contact-content',
    { x: -50, opacity: 0 },
    {
      x: 0, opacity: 1, duration: 0.9,
      scrollTrigger: { trigger: '.contact-section', start: 'top 78%', once: true }
    }
  );

  gsap.fromTo('.contact-form-wrap',
    { x: 50, opacity: 0 },
    {
      x: 0, opacity: 1, duration: 0.9,
      scrollTrigger: { trigger: '.contact-section', start: 'top 78%', once: true }
    }
  );

  // Parallax on hero orbs
  gsap.to('.orb-1', {
    y: -80,
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 2 }
  });

  gsap.to('.orb-2', {
    y: -50,
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.5 }
  });
}

/* ════════════════════════════════════════════════════════════════
   SIMULATOR ENGINE — Connected to Node.js / Groq Backend
   Backend URL: http://localhost:5000/api/simulate
════════════════════════════════════════════════════════════════ */

// ── Backend API URL — change this if your server runs elsewhere ──
const API_BASE_URL = 'https://vision-project-olive.vercel.app';

function initSimulator() {
  const input       = document.getElementById('decisionInput');
  const charCount   = document.getElementById('charCount');
  const simBtn      = document.getElementById('simulateBtn');
  const loading     = document.getElementById('simLoading');
  const output      = document.getElementById('simOutput');
  const resetBtn    = document.getElementById('resetBtn');
  const saveBtn     = document.getElementById('saveBtn');
  const progressBar = document.getElementById('progressBar');

  // ── Character counter ──────────────────────────────────────────
  input.addEventListener('input', () => {
    const len = input.value.length;
    charCount.textContent = len;
    if (len > 280)      charCount.style.color = '#ef4444';
    else if (len > 200) charCount.style.color = '#eab308';
    else                charCount.style.color = '';
  });

  // ── Simulate button ────────────────────────────────────────────
  simBtn.addEventListener('click', () => {
    const decision = input.value.trim();
    if (!decision) {
      shakeElement(input);
      showToast('Please enter a decision to simulate!');
      return;
    }
    if (decision.length < 10) {
      showToast('Please describe your decision in more detail.');
      return;
    }
    runSimulation(decision);
  });

  // Enter key submits (Shift+Enter for new line), Ctrl/Cmd+Enter also works
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!simBtn.disabled && input.value.trim().length >= 10) simBtn.click();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      simBtn.click();
    }
  });

  // ── Reset ──────────────────────────────────────────────────────
  resetBtn.addEventListener('click', () => {
    gsap.to(output, {
      y: 20, opacity: 0, duration: 0.4,
      onComplete: () => {
        output.classList.remove('visible');
        input.value = '';
        charCount.textContent = '0';
        gsap.to(input.closest('.sim-box'), { opacity: 1, pointerEvents: 'auto', duration: 0.4 });
      }
    });
  });

  // ── Save ───────────────────────────────────────────────────────
  saveBtn.addEventListener('click', () => {
    showToast('✓ Result saved to your journal!');
  });

  // ── Path card "Explore More" toggles ─────────────────────────────
  const outputPaths = document.querySelector('.output-paths');
  if (outputPaths) {
    outputPaths.addEventListener('click', (e) => {
      const btn = e.target.closest('.path-explore-btn');
      if (!btn) return;
      togglePathDetails(btn);
    });
  }

  // ── Core simulation function ───────────────────────────────────
  async function runSimulation(question) {
    // Dim input box, start loading
    gsap.to(input.closest('.sim-box'), { opacity: 0.4, pointerEvents: 'none', duration: 0.3 });
    output.classList.remove('visible');
    loading.classList.add('active');

    // Animate progress bar while waiting
    progressBar.style.width = '0';
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress > 88) { clearInterval(progressInterval); progress = 88; }
      progressBar.style.width = progress + '%';
    }, 300);

    // Build request payload — map frontend profile selectors
    // If your HTML has profile dropdowns, read them here.
    // Defaults are provided for a frictionless single-input experience.
    const payload = {
      question,
      skill: getProfileValue('profileSkill',  'Intermediate'),
      time:  getProfileValue('profileTime',   '4 hours/day'),
      money: getProfileValue('profileMoney',  'Medium'),
      risk:  getProfileValue('profileRisk',   'Medium'),
    };

    try {
      // ── POST to backend ────────────────────────────────────────
      const response = await fetch(`${API_BASE_URL}/api/simulate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const data = await response.json();

      clearInterval(progressInterval);
      progressBar.style.width = '100%';

      if (!response.ok || !data.success) {
        // Show backend validation/error message
        const errMsg = data.details
          ? data.details.join(' ')
          : (data.error || 'Simulation failed. Please try again.');
        showToast(`⚠ ${errMsg}`);
        resetLoadingState();
        return;
      }

      // ── Map rich backend response to frontend cards ────────────
      const result = mapBackendResponse(data);

      setTimeout(() => showResult(question, result), 350);

    } catch (err) {
      clearInterval(progressInterval);
      console.error('[Simulator] Fetch error:', err);
      showToast('⚠ Could not reach the server. Is the backend running?');
      resetLoadingState();
    }

    function resetLoadingState() {
      loading.classList.remove('active');
      progressBar.style.width = '0';
      gsap.to(input.closest('.sim-box'), { opacity: 1, pointerEvents: 'auto', duration: 0.4 });
    }
  }

  // ── Read optional profile selects (graceful fallback) ─────────
  function getProfileValue(elementId, defaultValue) {
    const el = document.getElementById(elementId);
    return (el && el.value) ? el.value : defaultValue;
  }

  // ── Map rich Groq response → flat display object ───────────────
  function mapBackendResponse(data) {
    const r   = data.result   || {};
    const a   = r.analysis    || {};
    const fv  = r.final_verdict || {};
    const sc  = r.scenarios   || [];

    const best      = sc.find(s => s.type === 'best')      || {};
    const realistic = sc.find(s => s.type === 'realistic') || {};
    const worst     = sc.find(s => s.type === 'worst')     || {};

    return {
      // Header meta
      confidence:   `${a.readiness_score ?? '—'}%`,
      paths:        (a.opportunity_score ?? 0) * 50 + 1000, // stylised number

      // Main summary
      outcome: a.summary || fv.reasoning || '—',

      // Three scenario paths (kept for Decision History compatibility)
      best_path:   `[${best.probability ?? '?'}% • ${best.timeline ?? '?'}] ${best.outcome || best.description || '—'}`,
      likely_path: `[${realistic.probability ?? '?'}% • ${realistic.timeline ?? '?'}] ${realistic.outcome || realistic.description || '—'}`,
      risk_path:   `[${worst.probability ?? '?'}% • ${worst.timeline ?? '?'}] ${worst.outcome || worst.description || '—'}`,

      // Same three paths, split into separate fields for the redesigned path cards
      best_prob:      best.probability      ?? null,
      best_timeline:  best.timeline         || '—',
      best_summary:   best.outcome || best.description || '—',

      likely_prob:     realistic.probability ?? null,
      likely_timeline: realistic.timeline    || '—',
      likely_summary:  realistic.outcome || realistic.description || '—',

      risk_prob:      worst.probability     ?? null,
      risk_timeline:  worst.timeline        || '—',
      risk_summary:   worst.outcome || worst.description || '—',

      // AI's understanding of the decision + location-aware intelligence
      decision_context:     r.decision_context     || null,
      context_intelligence: r.context_intelligence  || null,

      // Extra rich data stored for potential extended display
      _full: r,
    };
  }

  // ── Render result into DOM ─────────────────────────────────────
  function showResult(decision, result) {
    document.getElementById('outputDecision').textContent = decision;
    document.getElementById('confidence').textContent     = result.confidence || '—';
    document.getElementById('pathsCount').textContent     = (result.paths || 0).toLocaleString();
    document.getElementById('outputResult').textContent   = result.outcome    || '—';
    document.getElementById('pathBestProb').textContent     = result.best_prob   != null ? `${result.best_prob}%`   : '—';
    document.getElementById('pathBestTimeline').textContent = result.best_timeline   || '—';
    document.getElementById('pathBest').textContent         = result.best_summary    || '—';

    document.getElementById('pathLikelyProb').textContent     = result.likely_prob != null ? `${result.likely_prob}%` : '—';
    document.getElementById('pathLikelyTimeline').textContent = result.likely_timeline || '—';
    document.getElementById('pathLikely').textContent         = result.likely_summary  || '—';

    document.getElementById('pathRiskProb').textContent     = result.risk_prob   != null ? `${result.risk_prob}%`   : '—';
    document.getElementById('pathRiskTimeline').textContent = result.risk_timeline   || '—';
    document.getElementById('pathRisk').textContent         = result.risk_summary    || '—';

    // Collapse any previously-open "Explore More" details for the new result
    resetPathDetails();

    // Hide loading, reveal output card
    loading.classList.remove('active');
    progressBar.style.width = '0';
    output.classList.add('visible');

    // GSAP entrance animation
    gsap.fromTo(output,
      { y: 40, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.3)' }
    );

    gsap.fromTo('.path-card',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.12, duration: 0.5, delay: 0.4, ease: 'power2.out' }
    );

    setTimeout(() => {
      output.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);

    // ── Render all extended sections ────────────────────────────
    renderExtendedSections(result._full || {}, result, decision);

    // ── Auto-save to Decision History ──────────────────────────
    saveDecisionToHistory(decision, result);
  }
}

/* ════════════════════════════════════════════════════════════════
   EXTENDED SIMULATION SECTIONS
   All sections are appended AFTER existing results — no existing
   logic, labels, or structure is changed.
════════════════════════════════════════════════════════════════ */
function renderExtendedSections(raw, result, question) {
  const r   = raw;
  const a   = r.analysis       || {};
  const fv  = r.final_verdict  || {};
  const sc  = r.scenarios      || [];
  const ra  = r.risk_analysis  || {};
  const ti  = r.time_impact    || {};
  const tr  = r.tradeoff       || {};
  const dm  = r.decision_model_3d || {};

  const best      = sc.find(s => s.type === 'best')      || {};
  const good      = sc.find(s => s.type === 'good')      || {};
  const realistic = sc.find(s => s.type === 'realistic') || {};
  const bad       = sc.find(s => s.type === 'bad')       || {};
  const worst     = sc.find(s => s.type === 'worst')     || {};

  const opp  = a.opportunity_score  ?? 70;
  const risk = a.risk_score         ?? 45;
  const rdy  = a.readiness_score    ?? 60;
  const succ = a.success_probability ?? 65;
  const conf = a.confidence_score   ?? 75;

  // ── 0. DECISION CONTEXT + CONTEXT INTELLIGENCE ───────────────
  // Prefer the AI's own understanding; fall back to a light local
  // heuristic only if the backend didn't include it.
  const decisionContext = (r.decision_context && r.decision_context.decision_type)
    ? r.decision_context
    : deriveDecisionContext(question || a.summary || '');

  const contextIntel = (r.context_intelligence &&
      ((r.context_intelligence.highlights && r.context_intelligence.highlights.length) ||
       (r.context_intelligence.recommendations && r.context_intelligence.recommendations.items && r.context_intelligence.recommendations.items.length)))
    ? r.context_intelligence
    : deriveContextIntelligenceFallback(decisionContext, question || '');

  renderDecisionContext(decisionContext);
  renderContextIntelligence(contextIntel);

  // ── 1. EXTENDED PATH VARIATIONS ─────────────────────────────
  // Success variations — derived from best + good scenarios
  const successVars = [
    {
      name: 'Accelerated Success Path',
      icon: '⚡',
      prob: Math.min(99, Math.round((best.probability || 15) * 0.6)),
      desc: best.description
        ? `Everything aligns early. ${best.description.split('.')[0]}.`
        : 'Conditions align perfectly from the start, driving rapid momentum.',
      factor: best.milestones?.[0] || 'Early momentum and strong execution',
      type: 'success-high',
    },
    {
      name: 'Optimized Success Path',
      icon: '🌟',
      prob: best.probability || 15,
      desc: best.outcome || best.description || 'Optimal conditions lead to strong results.',
      factor: best.milestones?.[1] || 'Strategic planning and consistent effort',
      type: 'success-mid',
    },
    {
      name: 'Delayed Success Path',
      icon: '🕐',
      prob: Math.min(99, Math.round((good.probability || 25) * 0.8)),
      desc: good.description
        ? `Progress is solid but takes longer. ${good.description.split('.')[0]}.`
        : 'Success is achieved, but obstacles extend the timeline by several months.',
      factor: good.milestones?.[0] || 'External delays and resource constraints',
      type: 'success-low',
    },
  ];

  // Most likely variations — derived from realistic scenario
  const likelyVars = [
    {
      name: 'Stable Growth Path',
      icon: '📈',
      prob: Math.round((realistic.probability || 30) * 1.1),
      desc: 'Consistent, steady progress with manageable obstacles along the way.',
      factor: 'Discipline and structured daily execution',
      type: 'likely-high',
    },
    {
      name: 'Fluctuating Progress Path',
      icon: '〰️',
      prob: realistic.probability || 30,
      desc: realistic.outcome || realistic.description || 'Progress fluctuates but remains on track overall.',
      factor: realistic.milestones?.[0] || 'Market volatility and shifting priorities',
      type: 'likely-mid',
    },
    {
      name: 'Adaptive Outcome Path',
      icon: '🔄',
      prob: Math.round((realistic.probability || 30) * 0.75),
      desc: 'Strategy requires pivoting mid-journey but ultimately reaches a workable outcome.',
      factor: realistic.milestones?.[1] || 'Changing circumstances requiring course correction',
      type: 'likely-low',
    },
  ];

  // Risk variations — derived from bad + worst scenarios
  const riskVars = [
    {
      name: 'Early Setback Path',
      icon: '⚠️',
      prob: bad.probability || 20,
      desc: bad.description
        ? `Initial difficulties emerge. ${bad.description.split('.')[0]}.`
        : 'Early challenges slow momentum, requiring significant adjustment.',
      factor: bad.milestones?.[0] || 'Underestimated preparation requirements',
      type: 'risk-low',
    },
    {
      name: 'Recovery Possible Path',
      icon: '🔁',
      prob: Math.round((worst.probability || 10) * 1.5),
      desc: 'Significant setbacks occur, but recovery is achievable with revised strategy.',
      factor: worst.milestones?.[0] || 'Insufficient resources and time pressure',
      type: 'risk-mid',
    },
    {
      name: 'Complete Reset Path',
      icon: '💥',
      prob: worst.probability || 10,
      desc: worst.outcome || worst.description || 'The decision leads to a full restart scenario.',
      factor: worst.milestones?.[0] || 'Critical assumptions proved incorrect',
      type: 'risk-high',
    },
  ];

  renderVariationCards('extSuccessVariations', successVars);
  renderVariationCards('extLikelyVariations', likelyVars);
  renderVariationCards('extRiskVariations',   riskVars);

  // ── 2. AI ANALYSIS ───────────────────────────────────────────
  const analyses = [
    {
      icon: '🎓',
      label: 'Skills Impact',
      level: opp,
      color: opp >= 70 ? '#22c55e' : opp >= 45 ? '#eab308' : '#ef4444',
      text: opp >= 70
        ? 'Your skill level is well-matched to this decision. High competency reduces execution risk and accelerates results.'
        : opp >= 45
        ? 'Your skills are adequate but gaps exist. Targeted upskilling in key areas will significantly improve your outcome.'
        : 'Skill gaps are a major risk factor here. Focused learning before committing will protect you from early failure.',
    },
    {
      icon: '⏰',
      label: 'Time Availability',
      level: rdy,
      color: rdy >= 70 ? '#22c55e' : rdy >= 45 ? '#eab308' : '#ef4444',
      text: rdy >= 70
        ? 'You have sufficient time available. Consistent daily effort will compound into strong results over time.'
        : rdy >= 45
        ? 'Time is limited. Prioritizing this decision above lower-value activities will be critical to staying on track.'
        : 'Time pressure is a serious constraint. Consider a phased approach or delegating other commitments first.',
    },
    {
      icon: '💰',
      label: 'Financial Condition',
      level: conf,
      color: conf >= 70 ? '#22c55e' : conf >= 45 ? '#a855f7' : '#ef4444',
      text: conf >= 70
        ? 'Your financial position is strong. You have runway to absorb setbacks and invest in the right resources.'
        : conf >= 45
        ? 'Finances are workable but tight. Track spending carefully and avoid unnecessary costs during this journey.'
        : 'Financial stress will amplify other pressures. Build a safety buffer before making major commitments.',
    },
    {
      icon: '🛡️',
      label: 'Risk Tolerance',
      level: 100 - risk,
      color: risk <= 40 ? '#22c55e' : risk <= 65 ? '#eab308' : '#ef4444',
      text: risk <= 40
        ? 'Low risk profile. The downside of this decision is manageable and recoverable even in worst-case scenarios.'
        : risk <= 65
        ? 'Moderate risk level. Have a clear fallback plan ready so setbacks do not derail your overall progress.'
        : 'High risk detected. This decision requires careful staging — validate key assumptions before full commitment.',
    },
  ];

  const analysisGrid = document.getElementById('aiAnalysisGrid');
  if (analysisGrid) {
    analysisGrid.innerHTML = analyses.map(a => `
      <div class="ai-analysis-card ext-anim">
        <div class="aia-top">
          <span class="aia-icon">${a.icon}</span>
          <span class="aia-label">${a.label}</span>
          <span class="aia-score" style="color:${a.color}">${a.level}%</span>
        </div>
        <div class="aia-bar-wrap">
          <div class="aia-bar-track">
            <div class="aia-bar-fill" style="width:${a.level}%;background:${a.color}"></div>
          </div>
        </div>
        <p class="aia-text">${a.text}</p>
      </div>
    `).join('');
  }

  // ── 3. FUTURE TIMELINE ───────────────────────────────────────
  const timelineStages = [
    {
      period: 'Month 1–3',
      icon: '🚀',
      label: 'Launch Phase',
      events: ti.short_term || fv.action_steps?.[0] || 'Foundation building and initial momentum.',
      challenge: ra.time?.explanation || 'Adjusting to new routines and demands.',
      opportunity: tr.if_yes?.gains?.[0] || 'Early wins build confidence and signal.',
      status: 'Starting',
      statusColor: '#60a5fa',
    },
    {
      period: 'Month 4–6',
      icon: '⚙️',
      label: 'Build Phase',
      events: fv.action_steps?.[1] || 'Systems established, progress accelerating.',
      challenge: ra.effort_drain?.explanation || 'Sustaining effort as novelty fades.',
      opportunity: tr.if_yes?.gains?.[1] || 'Network effects and compounding skills.',
      status: 'Building',
      statusColor: '#a855f7',
    },
    {
      period: 'Month 7–12',
      icon: '📈',
      label: 'Growth Phase',
      events: ti.mid_term || fv.action_steps?.[2] || 'Measurable results and validation.',
      challenge: ra.financial?.explanation || 'Scaling challenges and resource needs.',
      opportunity: tr.if_yes?.gains?.[2] || 'Market recognition and new opportunities.',
      status: 'Growing',
      statusColor: '#22c55e',
    },
    {
      period: 'Year 2+',
      icon: '🌟',
      label: 'Mastery Phase',
      events: ti.long_term || fv.reasoning?.split('.')[0] || 'Established presence and compounding returns.',
      challenge: 'Maintaining edge and avoiding complacency.',
      opportunity: tr.if_yes?.gains?.[0] || 'Leadership positioning and deeper impact.',
      status: 'Thriving',
      statusColor: '#f59e0b',
    },
  ];

  const timelineTrack = document.getElementById('timelineTrack');
  if (timelineTrack) {
    timelineTrack.innerHTML = timelineStages.map((s, i) => `
      <div class="tl-item ext-anim" style="animation-delay:${i * 0.1}s">
        <div class="tl-dot" style="background:${s.statusColor}">
          <span>${s.icon}</span>
        </div>
        <div class="tl-content glass-card">
          <div class="tl-header">
            <span class="tl-period">${s.period}</span>
            <span class="tl-label">${s.label}</span>
            <span class="tl-status" style="color:${s.statusColor}">${s.status}</span>
          </div>
          <div class="tl-rows">
            <div class="tl-row"><span class="tl-row-icon">⚡</span><div><strong>Events:</strong> ${s.events}</div></div>
            <div class="tl-row"><span class="tl-row-icon">⚠</span><div><strong>Challenge:</strong> ${s.challenge}</div></div>
            <div class="tl-row"><span class="tl-row-icon">🌱</span><div><strong>Opportunity:</strong> ${s.opportunity}</div></div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ── 4. EMOTIONAL FORECAST ────────────────────────────────────
  const excitement   = Math.min(95, Math.round(opp * 0.85 + 20));
  const stress       = Math.min(95, Math.round(risk * 0.8 + 10));
  const confidence_e = Math.min(95, Math.round(conf * 0.75 + 15));
  const motivation   = Math.min(95, Math.round((opp + rdy) / 2 * 0.8 + 20));
  const satisfaction = Math.min(95, Math.round(succ * 0.75 + 15));

  const emotions = [
    { label: 'Excitement',   value: excitement,   icon: '🔥', color: '#f59e0b' },
    { label: 'Stress',       value: stress,       icon: '😤', color: '#ef4444' },
    { label: 'Confidence',   value: confidence_e, icon: '💪', color: '#a855f7' },
    { label: 'Motivation',   value: motivation,   icon: '⚡', color: '#60a5fa' },
    { label: 'Satisfaction', value: satisfaction, icon: '😊', color: '#22c55e' },
  ];

  const emotionGrid = document.getElementById('emotionGrid');
  if (emotionGrid) {
    emotionGrid.innerHTML = emotions.map((e, i) => `
      <div class="emotion-item ext-anim" style="animation-delay:${i * 0.08}s">
        <div class="em-top">
          <span class="em-icon">${e.icon}</span>
          <span class="em-label">${e.label}</span>
          <span class="em-pct" style="color:${e.color}">${e.value}%</span>
        </div>
        <div class="em-bar-track">
          <div class="em-bar-fill" data-width="${e.value}" style="background:${e.color}"></div>
        </div>
      </div>
    `).join('');

    // Animate bars after render
    setTimeout(() => {
      document.querySelectorAll('.em-bar-fill').forEach(el => {
        el.style.width = el.dataset.width + '%';
      });
    }, 300);
  }

  // ── 5. RECOMMENDED MISSIONS ──────────────────────────────────
  const steps = fv.action_steps || [];
  const readinessScore = rdy;

  const missions = [
    {
      step: steps[0] || 'Validate your core assumptions with real-world data before committing.',
      priority: 'Critical',
      priorityColor: '#ef4444',
      icon: '🎯',
    },
    {
      step: steps[1] || 'Build a minimum viable plan with clear milestones for the first 90 days.',
      priority: 'High',
      priorityColor: '#f59e0b',
      icon: '📋',
    },
    {
      step: steps[2] || 'Identify your top 3 skill gaps and dedicate focused time to close them.',
      priority: 'High',
      priorityColor: '#f59e0b',
      icon: '🎓',
    },
    {
      step: steps[3] || 'Connect with 2–3 people who have done something similar for guidance.',
      priority: 'Medium',
      priorityColor: '#a855f7',
      icon: '🤝',
    },
    {
      step: fv.warning || 'Define your exit criteria early — know when to pivot vs. persist.',
      priority: 'Medium',
      priorityColor: '#a855f7',
      icon: '⚠️',
    },
  ];

  const prepLevel = readinessScore >= 75 ? 'Well Prepared'
    : readinessScore >= 50 ? 'Moderately Prepared'
    : readinessScore >= 30 ? 'Needs Preparation'
    : 'Not Yet Ready';

  const missionsWrap = document.getElementById('missionsWrap');
  if (missionsWrap) {
    missionsWrap.innerHTML = `
      <div class="mission-meta">
        <div class="mission-readiness">
          <span class="mr-label">Readiness Score</span>
          <span class="mr-score">${readinessScore}<span class="mr-max">/100</span></span>
          <div class="mr-bar-track"><div class="mr-bar-fill" data-width="${readinessScore}" style="width:0%"></div></div>
          <span class="mr-level">${prepLevel}</span>
        </div>
      </div>
      <div class="mission-steps">
        ${missions.map((m, i) => `
          <div class="mission-step ext-anim" style="animation-delay:${i * 0.1}s">
            <div class="ms-num">${i + 1}</div>
            <div class="ms-icon">${m.icon}</div>
            <div class="ms-body">
              <p class="ms-text">${m.step}</p>
              <span class="ms-priority" style="color:${m.priorityColor};border-color:${m.priorityColor}40">${m.priority} Priority</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    setTimeout(() => {
      const mrFill = missionsWrap.querySelector('.mr-bar-fill');
      if (mrFill) mrFill.style.width = mrFill.dataset.width + '%';
    }, 400);
  }

  // GSAP animate all new sections
  if (typeof gsap !== 'undefined') {
    gsap.fromTo('.ext-section',
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.15, duration: 0.6, delay: 0.6, ease: 'power2.out' }
    );
  }
}

/* ════════════════════════════════════════════════════════════════
   PATH CARD — "Explore More" expand / collapse
   Smoothly reveals the 3 sub-variations nested inside each of the
   Best Path / Most Likely / Risk Path cards.
════════════════════════════════════════════════════════════════ */
function togglePathDetails(btn) {
  const targetId = btn.getAttribute('data-target');
  const details   = document.getElementById(targetId);
  if (!details) return;

  const arrow = btn.querySelector('.pet-arrow');
  const label = btn.querySelector('.pet-label');
  const isOpen = details.classList.contains('open');

  if (isOpen) {
    // Closing — animate from current height down to 0
    details.style.maxHeight = details.scrollHeight + 'px';
    requestAnimationFrame(() => {
      details.style.maxHeight = '0px';
    });
    details.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    if (arrow) arrow.textContent = '▼';
    if (label) label.textContent = 'Explore More';
  } else {
    // Opening — animate from 0 up to the content's natural height
    details.classList.add('open');
    details.style.maxHeight = details.scrollHeight + 'px';
    btn.setAttribute('aria-expanded', 'true');
    if (arrow) arrow.textContent = '▲';
    if (label) label.textContent = 'Hide Details';

    // Once open, allow height to adapt freely (e.g. on resize)
    const onEnd = (ev) => {
      if (ev.propertyName === 'max-height' && details.classList.contains('open')) {
        details.style.maxHeight = 'none';
      }
      details.removeEventListener('transitionend', onEnd);
    };
    details.addEventListener('transitionend', onEnd);
  }
}

function resetPathDetails() {
  document.querySelectorAll('.path-details').forEach(d => {
    d.classList.remove('open');
    d.style.maxHeight = '0px';
  });
  document.querySelectorAll('.path-explore-btn').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
    const arrow = btn.querySelector('.pet-arrow');
    const label = btn.querySelector('.pet-label');
    if (arrow) arrow.textContent = '▼';
    if (label) label.textContent = 'Explore More';
  });
}

/* ════════════════════════════════════════════════════════════════
   DECISION CONTEXT ENGINE — render + fallback heuristics
   Primary source is the AI's own "decision_context" /
   "context_intelligence" JSON. The heuristics below only run if the
   backend response is missing them, so the section never breaks.
════════════════════════════════════════════════════════════════ */
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderDecisionContext(ctx) {
  const c = ctx || {};
  document.getElementById('ctxDecisionType').textContent   = c.decision_type   || '—';
  document.getElementById('ctxPrimaryGoal').textContent    = c.primary_goal    || '—';
  document.getElementById('ctxAnalysisFocus').textContent  = c.analysis_focus  || '—';

  const list = document.getElementById('ctxFactorsList');
  const factors = Array.isArray(c.factors_used) && c.factors_used.length
    ? c.factors_used
    : ['Skills', 'Time', 'Budget', 'Risk Level'];
  list.innerHTML = factors.map(f => `<span class="ctx-factor-chip">✔ ${escapeHtml(f)}</span>`).join('');
}

function renderContextIntelligence(intel) {
  const c = intel || {};
  const badge = document.getElementById('ctxIntelBadge');
  badge.textContent = c.location_detected ? c.location_detected : 'General Insight';

  const highlightsEl = document.getElementById('ctxHighlights');
  const highlights = Array.isArray(c.highlights) ? c.highlights : [];
  highlightsEl.innerHTML = highlights.map(h => `
    <div class="ctx-highlight">
      <span class="ctx-highlight-label">${escapeHtml(h.label)}</span>
      <span class="ctx-highlight-value">${escapeHtml(h.value)}</span>
    </div>
  `).join('');

  const recTitleEl = document.getElementById('ctxRecommendTitle');
  const recListEl  = document.getElementById('ctxRecommendList');
  const rec   = c.recommendations || {};
  const items = Array.isArray(rec.items) ? rec.items : [];
  recTitleEl.textContent = rec.title || 'Recommendations';
  recListEl.innerHTML = items.map(i => `<span class="ctx-recommend-item">${escapeHtml(i)}</span>`).join('');
}

// ── Local fallback: only used if the AI response omits decision_context ──
function deriveDecisionContext(question) {
  const q = (question || '').toLowerCase();

  const rules = [
    {
      type: 'Business', focus: 'Business Opportunity Analysis', goal: 'Start a Business',
      match: /\b(business|startup|start.up|open a (shop|store|restaurant)|entrepreneur|cloud kitchen|side hustle)\b/,
      factors: ['Skills', 'Time', 'Budget', 'Risk Level', 'Market Demand', 'Competition'],
    },
    {
      type: 'Relocation', focus: 'Relocation Readiness Analysis', goal: 'Relocate to a New Country',
      match: /\b(move to|relocate|immigrat|leave (pakistan|the country|my country)|migrat|leave the country)\b/,
      factors: ['Budget', 'Visa Difficulty', 'Job Market', 'Cost of Living', 'Safety', 'Quality of Life'],
    },
    {
      type: 'Education', focus: 'Education Pathway Analysis', goal: 'Study Abroad',
      match: /\b(study abroad|university|scholarship|master'?s|bachelor'?s|study in|college)\b/,
      factors: ['Budget', 'Tuition Costs', 'Scholarships', 'Career Prospects', 'Time', 'Location Fit'],
    },
    {
      type: 'Career', focus: 'Career Growth Analysis', goal: 'Advance a Career',
      match: /\b(career|job|software engineer|become a|switch careers|promotion|profession)\b/,
      factors: ['Skills', 'Time', 'Market Demand', 'Salary Potential', 'Risk Level', 'Growth Path'],
    },
    {
      type: 'Investment', focus: 'Investment Risk Analysis', goal: 'Make an Investment',
      match: /\b(invest|investment|stocks|crypto|mutual fund)\b/,
      factors: ['Budget', 'Risk Level', 'Time Horizon', 'Market Conditions', 'Diversification', 'Liquidity'],
    },
    {
      type: 'Real Estate', focus: 'Property Purchase Analysis', goal: 'Buy a House',
      match: /\b(buy a house|buy property|purchase a home|mortgage|real estate)\b/,
      factors: ['Budget', 'Location', 'Market Value', 'Financing', 'Risk Level', 'Long-Term Value'],
    },
    {
      type: 'Freelancing', focus: 'Freelance Viability Analysis', goal: 'Start Freelancing',
      match: /\b(freelance|freelancing|gig work|remote client work)\b/,
      factors: ['Skills', 'Time', 'Client Demand', 'Income Stability', 'Risk Level', 'Portfolio Strength'],
    },
  ];

  const hit = rules.find(rule => rule.match.test(q));
  if (hit) {
    return { decision_type: hit.type, primary_goal: hit.goal, analysis_focus: hit.focus, factors_used: hit.factors };
  }
  return {
    decision_type: 'General',
    primary_goal: 'Evaluate This Decision',
    analysis_focus: 'General Decision Analysis',
    factors_used: ['Skills', 'Time', 'Budget', 'Risk Level'],
  };
}

// ── Local fallback: only used if the AI response omits context_intelligence ──
function deriveLocation(question) {
  const q = question || '';
  const m = q.match(/\b(?:in|to|live in|living in|from)\s+([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+){0,2})/);
  return m ? m[1] : null;
}

function deriveContextIntelligenceFallback(ctx, question) {
  const location = deriveLocation(question);
  const type = ctx?.decision_type || 'General';

  const byType = {
    'Business': {
      highlights: [
        { label: 'Location', value: location || 'Not specified in your question' },
        { label: 'Business Environment', value: 'General conditions apply — results will sharpen once connected to live market data for your area.' },
        { label: 'Market Demand', value: 'Demand varies by niche — service and e-commerce businesses tend to have lower entry barriers.' },
        { label: 'Competition Level', value: 'Assume moderate competition unless you are entering a very saturated niche.' },
      ],
      recommendations: { title: 'Top Opportunities', items: ['Online Store', 'Service-Based Business', 'Consulting', 'Digital Products', 'Local Delivery Service'] },
    },
    'Relocation': {
      highlights: [
        { label: 'Target Location', value: location || 'Not specified in your question' },
        { label: 'Cost of Living', value: 'Varies widely by destination — factor this into your savings runway before committing.' },
        { label: 'Visa Difficulty', value: 'Depends heavily on the destination country and your qualifications.' },
        { label: 'Job Market', value: 'Research demand for your specific skill set in the target location before moving.' },
      ],
      recommendations: { title: 'Popular Destinations', items: ['Canada', 'Germany', 'UAE', 'United Kingdom', 'Australia'] },
    },
    'Education': {
      highlights: [
        { label: 'Target Location', value: location || 'Not specified in your question' },
        { label: 'Tuition Costs', value: 'Public universities abroad are typically more affordable than private institutions.' },
        { label: 'Scholarships', value: 'Merit and need-based scholarships can significantly offset costs — worth researching early.' },
        { label: 'Part-Time Work', value: 'Many study destinations allow limited part-time work to help cover living costs.' },
      ],
      recommendations: { title: 'Suggested Study Destinations', items: ['Germany', 'Canada', 'United Kingdom', 'Netherlands', 'Australia'] },
    },
    'Career': {
      highlights: [
        { label: 'Career Demand', value: 'Demand depends on the specific role and region — technical and healthcare roles are broadly resilient.' },
        { label: 'Required Skills', value: 'Focus on the core technical and soft skills most in-demand for this path.' },
        { label: 'Salary Potential', value: 'Varies by experience level, location, and specialization.' },
        { label: 'Future Growth', value: 'Consider how automation and industry trends may affect this role over the next 5 years.' },
      ],
      recommendations: { title: 'Career Recommendations', items: ['Build a portfolio', 'Get certified', 'Network in the field', 'Target growing companies', 'Upskill continuously'] },
    },
    'Investment': {
      highlights: [
        { label: 'Risk Profile', value: 'Match your investment choice to your actual risk tolerance and time horizon.' },
        { label: 'Diversification', value: 'Spreading investments reduces exposure to any single point of failure.' },
        { label: 'Liquidity', value: 'Consider how quickly you may need to access these funds.' },
      ],
      recommendations: { title: 'Considerations', items: ['Diversify across assets', 'Match risk to timeline', 'Keep an emergency fund', 'Review periodically'] },
    },
    'Real Estate': {
      highlights: [
        { label: 'Location', value: location || 'Not specified in your question' },
        { label: 'Financing', value: 'Compare mortgage terms carefully — small rate differences compound significantly over time.' },
        { label: 'Market Value', value: 'Research comparable sales in the area before making an offer.' },
      ],
      recommendations: { title: 'Considerations', items: ['Get pre-approved financing', 'Inspect thoroughly', 'Compare neighborhoods', 'Factor in maintenance costs'] },
    },
    'Freelancing': {
      highlights: [
        { label: 'Client Demand', value: 'Demand varies by skill and platform — a strong portfolio matters more than credentials.' },
        { label: 'Income Stability', value: 'Early months are typically the most volatile — a financial buffer helps.' },
        { label: 'Portfolio Strength', value: 'A focused, high-quality portfolio converts better than a broad, generic one.' },
      ],
      recommendations: { title: 'Recommendations', items: ['Build a niche portfolio', 'Start with one platform', 'Set clear rates', 'Keep 3-6 months of savings'] },
    },
  };

  const fallback = byType[type] || {
    highlights: [
      { label: 'Overview', value: 'This decision doesn\u2019t map to a specific category — the analysis below is kept general.' },
    ],
    recommendations: { title: 'Recommendations', items: ['Clarify your goal', 'List your constraints', 'Set a decision deadline'] },
  };

  return {
    location_detected: location,
    highlights: fallback.highlights,
    recommendations: fallback.recommendations,
  };
}

function renderVariationCards(containerId, variations) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = variations.map((v, i) => `
    <div class="ext-var-card ext-var-${v.type} ext-anim" style="animation-delay:${i * 0.1}s">
      <div class="evc-top">
        <span class="evc-icon">${v.icon}</span>
        <span class="evc-name">${v.name}</span>
        <span class="evc-prob">${v.prob}%</span>
      </div>
      <p class="evc-desc">${v.desc}</p>
      <div class="evc-factor">
        <span class="evc-factor-label">Key Factor:</span>
        <span class="evc-factor-text">${v.factor}</span>
      </div>
    </div>
  `).join('');
}

/* ════════════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
════════════════════════════════════════════════════════════════ */

// Shake animation for invalid input
function shakeElement(el) {
  gsap.fromTo(el,
    { x: -8 },
    { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)',
      keyframes: [
        { x: -8, duration: 0.07 },
        { x: 8,  duration: 0.07 },
        { x: -6, duration: 0.07 },
        { x: 6,  duration: 0.07 },
        { x: -3, duration: 0.07 },
        { x: 0,  duration: 0.07 },
      ]
    }
  );
  el.style.borderColor = '#ef4444';
  el.style.boxShadow = '0 0 20px rgba(239,68,68,0.3)';
  setTimeout(() => {
    el.style.borderColor = '';
    el.style.boxShadow = '';
  }, 1000);
}

// Toast notification
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// Button hover pulse effect
document.querySelectorAll('.btn-primary').forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    gsap.to(btn, { scale: 1.03, duration: 0.2 });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { scale: 1, duration: 0.2 });
  });
  btn.addEventListener('click', () => {
    gsap.fromTo(btn,
      { scale: 0.95 },
      { scale: 1, duration: 0.3, ease: 'back.out(3)' }
    );
  });
});

// Smooth nav link active state styling
const styleTag = document.createElement('style');
styleTag.textContent = `.nav-link.active { color: var(--purple-light); background: none; }`;
document.head.appendChild(styleTag);

/* ════════════════════════════════════════════════════════════════
   LIFE SIMULATOR v3 — Full Engine
   XP · Levels · Scores · Predictions · Decisions · Achievements
════════════════════════════════════════════════════════════════ */

window.LifeTracker = null; // assigned below after full init
const LifeTracker = {

  habits: {
    sleep: 7, study: 5, screen: 3, exercise: 4,
    productivity: 6, social: 4, mental: 6,
  },

  xp: 600, level: 7, streak: 5,
  history: [], decisionLog: [],
  chart: null, chartType: 'radar',
  currentMode: 'balanced',

  // XP thresholds per level
  xpThresholds: [0,100,250,500,850,1300,1900,2700,3700,5000,7000],

  modes: {
    balanced:   { sleep:7, study:5, screen:3, exercise:4, productivity:6, social:4, mental:6 },
    exam:       { sleep:6, study:9, screen:2, exercise:2, productivity:8, social:2, mental:5 },
    lazy:       { sleep:9, study:1, screen:8, exercise:1, productivity:2, social:6, mental:3 },
    productive: { sleep:7, study:7, screen:2, exercise:5, productivity:9, social:3, mental:7 },
    career:     { sleep:6, study:6, screen:3, exercise:3, productivity:9, social:2, mental:5 },
    recovery:   { sleep:9, study:2, screen:3, exercise:3, productivity:3, social:5, mental:9 },
  },

  // Mode XP multipliers
  modeXpMultipliers: {
    balanced:1.0, exam:1.3, lazy:0.6, productive:1.4, career:1.2, recovery:0.9,
  },

  achievements: [
    { id:'early_bird',  emoji:'🌅', name:'Early Bird',    desc:'Sleep ≥ 8h',           unlocked:false },
    { id:'scholar',     emoji:'📚', name:'Scholar',       desc:'Study ≥ 8h',            unlocked:false },
    { id:'athlete',     emoji:'🏆', name:'Athlete',       desc:'Exercise ≥ 7h',         unlocked:false },
    { id:'focused',     emoji:'🎯', name:'Laser Focus',   desc:'Productivity ≥ 8h',     unlocked:false },
    { id:'digital_det', emoji:'📵', name:'Digital Detox', desc:'Screen ≤ 1h',           unlocked:false },
    { id:'balanced',    emoji:'⚖️', name:'Balance Master',desc:'All scores ≥ 60',       unlocked:false },
    { id:'elite',       emoji:'👑', name:'Elite Operator',desc:'Overall score ≥ 90',    unlocked:false },
    { id:'level10',     emoji:'🚀', name:'Legendary',     desc:'Reach Level 10',         unlocked:false },
  ],

  decisions: {
    grind:        { label:'Grind Session',      effects:{ study:+2, productivity:+2, mental:-1, screen:-1 }, xp:+80, icon:'🚀' },
    social_media: { label:'Social Media Binge', effects:{ screen:+3, productivity:-2, mental:-2, sleep:-1 }, xp:-40, icon:'📱' },
    workout:      { label:'Full Workout',        effects:{ exercise:+3, mental:+2, sleep:+1, productivity:+1 }, xp:+60, icon:'🏋️' },
    allnighter:   { label:'All-Nighter',         effects:{ study:+3, sleep:-4, mental:-3, productivity:-1 }, xp:+20, icon:'🌙' },
    meditate:     { label:'Meditate',            effects:{ mental:+3, sleep:+1, productivity:+1, screen:-1 }, xp:+50, icon:'🧘' },
    junkfood:     { label:'Junk Food Day',       effects:{ exercise:-2, mental:-2, productivity:-1, social:+1 }, xp:-25, icon:'🍔' },
  },

  insights: {
    high:    ['🚀 Elite performance detected! You\'re in the top 5% of life operators.',
              '⚡ Incredible habit stack. Your discipline score is legendary.',
              '🌟 Peak state achieved. Future simulations look exceptional.'],
    good:    ['💡 Strong foundation. Boost exercise 2h to unlock the next tier.',
              '📈 Good trajectory. Reducing screen time 1h = +12 focus score.',
              '🎯 Solid habits. Add 30min meditation to stabilize mental energy.'],
    average: ['⚠️ Average pattern. Push study + productivity to break the plateau.',
              '🔄 Balanced but stagnant. One strong habit can cascade improvements.',
              '💪 Growth potential detected. Consistent exercise unlocks all other scores.'],
    low:     ['🚨 Screen time is your #1 enemy right now. Cut by 3h immediately.',
              '😴 Sleep debt is compounding. This affects every other score.',
              '🔋 Critical energy deficit. Start with 20min walk + 7h sleep.'],
  },
};

// ── Scoring Engine v3 ──────────────────────────────────────────
function calcScores(h) {
  const clamp = v => Math.min(100, Math.max(0, Math.round(v)));
  const screenPenalty = 10 - h.screen;

  return {
    health:       clamp(h.sleep*3.0 + h.exercise*3.0 + screenPenalty*1.5 + h.mental*1.5 + h.social*1.0),
    focus:        clamp(h.sleep*2.5 + h.study*2.5 + screenPenalty*2.0 + h.productivity*2.0 + h.mental*1.0),
    productivity: clamp(h.study*2.5 + h.productivity*3.0 + screenPenalty*2.0 + h.exercise*1.5 + h.mental*1.0),
    happiness:    clamp(h.sleep*2.0 + h.social*2.5 + h.exercise*2.0 + h.mental*2.0 + screenPenalty*1.5),
    discipline:   clamp(h.study*2.0 + h.exercise*2.5 + screenPenalty*2.5 + h.productivity*2.5 + h.sleep*0.5),
    mental:       clamp(h.mental*3.5 + h.sleep*2.5 + h.exercise*1.5 + screenPenalty*1.5 + h.social*1.0),
    get overall() {
      return clamp((this.health+this.focus+this.productivity+this.happiness+this.discipline+this.mental)/6);
    },
  };
}

// ── Prediction Engine ──────────────────────────────────────────
function calcPredictions(h, scores) {
  const clamp = v => Math.min(100, Math.max(0, Math.round(v)));
  return {
    success:    clamp(scores.focus*0.35 + scores.productivity*0.35 + scores.discipline*0.30),
    burnout:    clamp((10-h.sleep)*8 + h.screen*5 + (10-h.mental)*5 + (10-h.social)*3 - h.exercise*4),
    productivity: clamp(scores.productivity*0.5 + scores.focus*0.3 + scores.discipline*0.2),
    energy:     clamp(scores.mental*0.4 + scores.health*0.35 + scores.happiness*0.25),
  };
}

// ── XP Engine ─────────────────────────────────────────────────
function calcXpFromHabits(h) {
  const mult = LifeTracker.modeXpMultipliers[LifeTracker.currentMode] || 1;
  const raw = (
    h.sleep*8 + h.study*12 + (10-h.screen)*10 +
    h.exercise*10 + h.productivity*12 + h.social*6 + h.mental*9
  );
  return Math.round(raw * mult);
}

function getLevel(xp) {
  const t = LifeTracker.xpThresholds;
  for (let i = t.length-1; i >= 0; i--) {
    if (xp >= t[i]) return i + 1;
  }
  return 1;
}

function getLevelTitle(lvl) {
  const titles = ['','Rookie','Explorer','Apprentice','Achiever','Focused','Strategist',
    'Life Operator','Champion','Visionary','Legendary'];
  return titles[Math.min(lvl, 10)] || 'Master';
}

function updateXpUI(animate = false) {
  const { xp, level } = LifeTracker;
  const t = LifeTracker.xpThresholds;
  const levelStart = t[Math.min(level-1, t.length-1)] || 0;
  const levelEnd   = t[Math.min(level,   t.length-1)] || levelStart + 1000;
  const pct = Math.min(100, ((xp - levelStart) / (levelEnd - levelStart)) * 100);

  const fillEl  = document.getElementById('xpFill');
  const currEl  = document.getElementById('xpCurrent');
  const nextEl  = document.getElementById('xpNext');
  const badgeEl = document.getElementById('levelBadge');

  if (fillEl) fillEl.style.width = pct + '%';
  if (currEl) currEl.textContent = xp;
  if (nextEl) nextEl.textContent = levelEnd;
  if (badgeEl) badgeEl.textContent = 'LVL ' + level;
}

// ── Achievement Engine ─────────────────────────────────────────
function checkAchievements(h, scores) {
  const a = LifeTracker.achievements;
  const prev = a.map(x => x.unlocked);

  a.find(x=>x.id==='early_bird').unlocked   = h.sleep >= 8;
  a.find(x=>x.id==='scholar').unlocked      = h.study >= 8;
  a.find(x=>x.id==='athlete').unlocked      = h.exercise >= 7;
  a.find(x=>x.id==='focused').unlocked      = h.productivity >= 8;
  a.find(x=>x.id==='digital_det').unlocked  = h.screen <= 1;
  a.find(x=>x.id==='balanced').unlocked     = Object.values(scores).every(v => typeof v==='number' && v >= 60);
  a.find(x=>x.id==='elite').unlocked        = scores.overall >= 90;
  a.find(x=>x.id==='level10').unlocked      = LifeTracker.level >= 10;

  // Notify newly unlocked
  a.forEach((ach, i) => {
    if (ach.unlocked && !prev[i]) {
      showToast(`🏆 Achievement Unlocked: ${ach.emoji} ${ach.name}!`);
    }
  });

  renderAchievements();
}

function renderAchievements() {
  const tray = document.getElementById('achievementTray');
  if (!tray) return;
  tray.innerHTML = '';
  LifeTracker.achievements.forEach(ach => {
    const el = document.createElement('div');
    el.className = 'achievement-badge' + (ach.unlocked ? '' : ' locked');
    el.textContent = ach.emoji;
    el.title = `${ach.name}: ${ach.desc}`;
    tray.appendChild(el);
  });
}

// ── Main UI Update ─────────────────────────────────────────────
window.updateLifeUI = function updateLifeUI() { _updateLifeUI(); };
function updateLifeUI() { window.updateLifeUI(); }
function _updateLifeUI() {
  const h = LifeTracker.habits;
  const s = calcScores(h);
  const p = calcPredictions(h, s);

  // Score bars
  const scoreMap = {
    health: s.health, focus: s.focus, productivity: s.productivity,
    wellbeing: s.happiness, discipline: s.discipline, mental: s.mental,
  };
  Object.entries(scoreMap).forEach(([key, val]) => {
    const bar = document.getElementById(`bar-${key}`);
    const num = document.getElementById(`num-${key}`);
    if (bar) {
      bar.style.width = val + '%';
      bar.style.background = val>=75
        ? 'linear-gradient(90deg,#a855f7,#06b6d4)'
        : val>=50
        ? 'linear-gradient(90deg,#7c3aed,#3b82f6)'
        : 'linear-gradient(90deg,#ef4444,#f97316)';
    }
    if (num) num.textContent = val;
  });

  // Overall ring
  const ringEl  = document.getElementById('lifeRingFill');
  const scoreEl = document.getElementById('overallScore');
  const tagEl   = document.getElementById('lifeScoreTag');

  if (ringEl) {
    const offset = 314 - (s.overall / 100) * 314;
    ringEl.style.strokeDashoffset = offset;
    ringEl.setAttribute('stroke',
      s.overall>=75 ? '#a855f7' : s.overall>=50 ? '#3b82f6' : '#ef4444');
  }
  if (scoreEl) {
    const from = parseInt(scoreEl.textContent) || 0;
    let curr = from;
    const step = (s.overall - from) / 12;
    const iv = setInterval(() => {
      curr += step;
      scoreEl.textContent = Math.round(curr);
      if (Math.abs(curr - s.overall) < 1) { scoreEl.textContent = s.overall; clearInterval(iv); }
    }, 30);
  }
  if (tagEl) {
    tagEl.textContent = s.overall>=85 ? '🌟 Elite Operator'
      : s.overall>=70 ? '✅ Good Balance'
      : s.overall>=50 ? '⚠️ Needs Improvement'
      : '🚨 Critical Zone';
  }

  // Predictions
  const preds = {
    success: p.success, burnout: p.burnout,
    productivity: p.productivity, energy: p.energy,
  };
  Object.entries(preds).forEach(([key, val]) => {
    const bar = document.getElementById(`pred-${key}`);
    const txt = document.getElementById(`pval-${key}`);
    if (bar) bar.style.width = val + '%';
    if (txt) txt.textContent = val + '%';
  });

  // XP from habits
  const newXp = calcXpFromHabits(h);
  const oldLevel = LifeTracker.level;
  LifeTracker.xp = newXp;
  LifeStatracker_updateLevel(oldLevel);
  updateXpUI();

  // Achievements
  checkAchievements(h, s);

  // Chart
  updateChart(s);

  // AI Insight
  updateInsight(s.overall);

  // Keep galaxy logbook score in sync with current habits
  syncGalaxyScoreLive();
}

function LifeStatracker_updateLevel(oldLevel) {
  LifeTracker.level = getLevel(LifeTracker.xp);
  if (LifeTracker.level > oldLevel) showLevelUp(LifeTracker.level);

  const titleEl = document.querySelector('.xp-title');
  if (titleEl) titleEl.textContent = getLevelTitle(LifeTracker.level);
}

// ── Level Up Toast ─────────────────────────────────────────────
function showLevelUp(level) {
  const toast = document.getElementById('levelupToast');
  const sub   = document.getElementById('levelupSub');
  if (!toast) return;
  if (sub) sub.textContent = `You reached Level ${level} — ${getLevelTitle(level)}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// ── Slider Display ─────────────────────────────────────────────
function updateSliderDisplay(habit, value) {
  const el = document.getElementById(`val-${habit}`);
  if (el) el.textContent = value + 'h';
  const slider = document.getElementById(`slider-${habit}`);
  if (slider) {
    const pct = (value / 10) * 100;
    slider.style.background = `linear-gradient(to right,#7c3aed 0%,#a855f7 ${pct}%,rgba(255,255,255,0.08) ${pct}%)`;
  }
}

// ── Chart Engine ───────────────────────────────────────────────
function initChart() {
  const canvas = document.getElementById('lifeChart');
  if (!canvas || !window.Chart) return;
  LifeTracker.chart = new Chart(canvas.getContext('2d'),
    buildChartConfig(LifeTracker.chartType, calcScores(LifeTracker.habits)));
}

function buildChartConfig(type, scores) {
  const labels = ['Health','Focus','Productivity','Happiness','Discipline','Mental'];
  const data   = [scores.health,scores.focus,scores.productivity,scores.happiness,scores.discipline,scores.mental];
  const colors = ['#a855f7','#60a5fa','#06b6d4','#34d399','#f59e0b','#ec4899'];
  const base   = {
    responsive:true, maintainAspectRatio:false,
    plugins:{
      legend:{display:false},
      tooltip:{
        backgroundColor:'rgba(6,9,26,0.9)',borderColor:'rgba(124,58,237,0.4)',borderWidth:1,
        titleColor:'#e2e8f0',bodyColor:'#94a3b8',titleFont:{family:'Orbitron',size:11},
      },
    },
  };

  if (type==='radar') return {
    type:'radar', data:{
      labels, datasets:[{
        label:'Life Scores', data,
        backgroundColor:'rgba(124,58,237,0.12)', borderColor:'#a855f7',
        borderWidth:2, pointBackgroundColor:colors, pointRadius:5, pointHoverRadius:8,
      }],
    },
    options:{...base, scales:{r:{
      min:0,max:100,
      grid:{color:'rgba(255,255,255,0.06)'},
      angleLines:{color:'rgba(255,255,255,0.06)'},
      ticks:{color:'#64748b',font:{size:8,family:'Orbitron'},stepSize:25,backdropColor:'transparent'},
      pointLabels:{color:'#94a3b8',font:{size:9,family:'Orbitron'}},
    }}},
  };

  if (type==='bar') return {
    type:'bar', data:{
      labels, datasets:[{
        label:'Score', data, backgroundColor:colors.map(c=>c+'99'),
        borderColor:colors, borderWidth:2, borderRadius:8,
      }],
    },
    options:{...base, scales:{
      x:{ticks:{color:'#64748b',font:{family:'Orbitron',size:8}},grid:{color:'rgba(255,255,255,0.04)'}},
      y:{min:0,max:100,ticks:{color:'#64748b',font:{size:8}},grid:{color:'rgba(255,255,255,0.04)'}},
    }},
  };

  // History line
  const hist = LifeTracker.history.slice(-10);
  return {
    type:'line', data:{
      labels: hist.length ? hist.map((_,i)=>`S${i+1}`) : ['Now'],
      datasets:[
        {label:'Health',       data:hist.map(h=>h.health),       borderColor:'#a855f7',tension:0.4,fill:false,pointRadius:3},
        {label:'Focus',        data:hist.map(h=>h.focus),        borderColor:'#60a5fa',tension:0.4,fill:false,pointRadius:3},
        {label:'Productivity', data:hist.map(h=>h.productivity), borderColor:'#06b6d4',tension:0.4,fill:false,pointRadius:3},
        {label:'Happiness',    data:hist.map(h=>h.happiness),    borderColor:'#34d399',tension:0.4,fill:false,pointRadius:3},
      ],
    },
    options:{...base, scales:{
      x:{ticks:{color:'#64748b',font:{size:8}},grid:{color:'rgba(255,255,255,0.04)'}},
      y:{min:0,max:100,ticks:{color:'#64748b',font:{size:8}},grid:{color:'rgba(255,255,255,0.04)'}},
    }},
  };
}

function updateChart(scores) {
  if (!LifeTracker.chart) return;
  const d = [scores.health,scores.focus,scores.productivity,scores.happiness,scores.discipline,scores.mental];
  if (LifeTracker.chartType!=='line') {
    LifeTracker.chart.data.datasets[0].data = d;
    LifeTracker.chart.update('active');
  }
}

function switchChartType(type) {
  LifeTracker.chartType = type;
  if (LifeTracker.chart) { LifeTracker.chart.destroy(); LifeTracker.chart = null; }
  initChart();
}

// ── AI Insight ─────────────────────────────────────────────────
function updateInsight(overall) {
  const el = document.getElementById('aiInsightText');
  if (!el) return;
  const pool = overall>=75 ? LifeTracker.insights.high
    : overall>=55 ? LifeTracker.insights.good
    : overall>=35 ? LifeTracker.insights.average
    : LifeTracker.insights.low;
  const msg = pool[Math.floor(Math.random() * pool.length)];
  gsap.to(el, { opacity:0, y:-6, duration:0.25, onComplete:() => {
    el.textContent = msg;
    gsap.to(el, { opacity:1, y:0, duration:0.35 });
  }});
}

// ── Scenario Modes ─────────────────────────────────────────────
function applyMode(mode) {
  const preset = LifeTracker.modes[mode];
  if (!preset) return;
  LifeTracker.currentMode = mode;
  Object.entries(preset).forEach(([habit, val]) => {
    LifeTracker.habits[habit] = val;
    const slider = document.getElementById(`slider-${habit}`);
    if (slider) slider.value = val;
    updateSliderDisplay(habit, val);
  });
  updateLifeUI();
  showToast(`✓ ${mode.charAt(0).toUpperCase()+mode.slice(1)} mode activated`);
}

// ── Decision Engine ────────────────────────────────────────────
function applyDecision(key) {
  const dec = LifeTracker.decisions[key];
  if (!dec) return;

  // Apply effects to habits (clamped 0-10)
  Object.entries(dec.effects).forEach(([habit, delta]) => {
    if (LifeTracker.habits[habit] !== undefined) {
      LifeTracker.habits[habit] = Math.min(10, Math.max(0, LifeTracker.habits[habit] + delta));
      const slider = document.getElementById(`slider-${habit}`);
      if (slider) slider.value = LifeTracker.habits[habit];
      updateSliderDisplay(habit, LifeTracker.habits[habit]);
    }
  });

  // Apply XP
  LifeTracker.xp = Math.max(0, LifeTracker.xp + dec.xp);

  // Update everything
  updateLifeUI();

  // Log entry
  const log = document.getElementById('decisionLog');
  if (log) {
    const placeholder = log.querySelector('.log-placeholder');
    if (placeholder) placeholder.remove();

    const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    const effects = Object.entries(dec.effects)
      .map(([h, v]) => `<span class="${v>0?'log-positive':'log-negative'}">${h} ${v>0?'+'+v:v}</span>`)
      .join(' · ');
    const xpStr = `<span class="${dec.xp>=0?'log-positive':'log-negative'}">${dec.xp>=0?'+'+dec.xp:dec.xp} XP</span>`;

    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `<span class="log-time">${time}</span><span>${dec.icon} <strong>${dec.label}</strong> — ${effects} · ${xpStr}</span>`;
    log.insertBefore(entry, log.firstChild);

    // Keep max 5 entries
    while (log.children.length > 5) log.removeChild(log.lastChild);
  }

  showToast(`${dec.icon} ${dec.label} applied!`);
}

// ── Memory ─────────────────────────────────────────────────────
function saveToMemory() {
  const scores = calcScores(LifeTracker.habits);
  LifeTracker.history.push({ ...scores, timestamp: Date.now() });
  if (LifeTracker.history.length > 20) LifeTracker.history.shift();
  // Save life journey snapshot for Growth Analytics
  saveLifeJourneySnapshot(scores);

  LifeTracker.streak++;
  const streakEl = document.getElementById('streakCount');
  if (streakEl) streakEl.textContent = LifeTracker.streak;

  try {
    localStorage.setItem('lifesim_v3', JSON.stringify({
      habits:  LifeTracker.habits,
      xp:      LifeTracker.xp,
      level:   LifeTracker.level,
      streak:  LifeTracker.streak,
      history: LifeTracker.history,
    }));
    showToast('✓ Progress saved! Streak extended 🔥');
    if (LifeTracker.chartType==='line') switchChartType('line');
  } catch(e) { showToast('⚠ Could not save'); }
}

function loadFromMemory() {
  try {
    const raw = localStorage.getItem('lifesim_v3');
    if (!raw) return;
    const mem = JSON.parse(raw);
    if (mem.habits)  Object.assign(LifeTracker.habits, mem.habits);
    if (mem.xp)      LifeTracker.xp = mem.xp;
    if (mem.level)   LifeTracker.level = mem.level;
    if (mem.streak)  LifeTracker.streak = mem.streak;
    if (mem.history) LifeTracker.history = mem.history;

    Object.entries(LifeTracker.habits).forEach(([habit, val]) => {
      const slider = document.getElementById(`slider-${habit}`);
      if (slider) slider.value = val;
      updateSliderDisplay(habit, val);
    });

    const streakEl = document.getElementById('streakCount');
    if (streakEl) streakEl.textContent = LifeTracker.streak;
    updateLifeUI();
  } catch(e) { console.warn('[LifeTracker v3] Load failed:', e); }
}

// ── Init ───────────────────────────────────────────────────────
function initLifeTracker() {
  window.LifeTracker = LifeTracker; // expose globally for CosmicEngine hooks

  // Sliders
  document.querySelectorAll('.habit-slider').forEach(slider => {
    const habit = slider.dataset.habit;
    updateSliderDisplay(habit, slider.value);
    slider.addEventListener('input', () => {
      const val = parseInt(slider.value);
      LifeTracker.habits[habit] = val;
      updateSliderDisplay(habit, val);
      updateLifeUI();
      // Update mood on every slider change — this is what drives the orb color changes
      updateMoodEnvironment();
      updateMoodDesc();
      const tip = document.getElementById('habitTip');
      if (tip) {
        const tips = {
          sleep:        `😴 ${val}h — ${val>=8?'Perfect recovery':val>=6?'Adequate sleep':'Sleep debt risk'}`,
          study:        `📚 ${val}h — ${val>=8?'Scholar mode active':val>=5?'Good session':'Low learning input'}`,
          screen:       `📱 ${val}h — ${val<=1?'🏆 Digital Detox!':val<=3?'Healthy usage':'Focus is suffering'}`,
          exercise:     `🏃 ${val}h — ${val>=7?'Athlete tier':val>=3?'Active lifestyle':'Sedentary risk'}`,
          productivity: `🎯 ${val}h — ${val>=8?'Deep work master':val>=5?'Productive day':'Output is low'}`,
          social:       `🧑‍🤝‍🧑 ${val}h — ${val>=7?'Highly connected':val>=4?'Balanced social':'Isolation risk'}`,
          mental:       `🧠 ${val}h — ${val>=8?'Peak mental state':val>=5?'Good energy':'Mental fatigue risk'}`,
        };
        tip.textContent = tips[habit] || '💡 Adjust sliders to simulate your day';
      }
    });
  });

  // Mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyMode(btn.dataset.mode);
    });
  });

  // Decision buttons
  document.querySelectorAll('.decision-btn').forEach(btn => {
    btn.addEventListener('click', () => applyDecision(btn.dataset.decision));
  });

  // Save button
  const saveBtn = document.getElementById('saveHabitsBtn');
  if (saveBtn) saveBtn.addEventListener('click', saveToMemory);

  // Chart switcher
  const chartSel = document.getElementById('chartType');
  if (chartSel) chartSel.addEventListener('change', () => switchChartType(chartSel.value));

  loadFromMemory();
  renderAchievements();
  setTimeout(initChart, 300);
  updateLifeUI();
  // After habits are loaded, resync galaxy logbook scores to reflect actual habits
  setTimeout(() => {
    if (GalaxyEngine.saveSlots) {
      GalaxyEngine.saveSlots = GalaxyEngine.saveSlots.map(slot => {
        if (!slot || !slot.habits) return slot;
        // Overwrite stored habits with current live habits for slot 0 (auto-save)
        // and recompute score
        try {
          const h = slot.habits;
          const sc = calcScores(h);
          slot.overallScore = Math.min(100, Math.max(0, Math.round(
            (sc.health + sc.focus + sc.productivity + sc.happiness + sc.discipline + sc.mental) / 6
          )));
        } catch(e) {}
        return slot;
      });
      renderSaveSlots();
    }
  }, 600);

  // GSAP reveals
  const reveals = [
    ['.xp-bar-wrap',     { y:-30, opacity:0 }, '.life-tracker-section', 'top 88%'],
    ['.mode-selector',   { y:-20, opacity:0 }, '.life-tracker-section', 'top 85%'],
    ['.lt-sliders',      { x:-50, opacity:0 }, '.life-tracker-section', 'top 78%'],
    ['.lt-scores',       { y:40,  opacity:0 }, '.life-tracker-section', 'top 78%'],
    ['.lt-chart',        { x:50,  opacity:0 }, '.life-tracker-section', 'top 78%'],
    ['.prediction-row',  { y:40,  opacity:0 }, '.prediction-row',       'top 85%'],
    ['.decision-engine', { y:40,  opacity:0 }, '.decision-engine',      'top 90%'],
    ['.ai-insight',      { y:30,  opacity:0 }, '.ai-insight',           'top 92%'],
  ];

  reveals.forEach(([target, from, trigger, start]) => {
    gsap.fromTo(target, from,
      { ...Object.fromEntries(Object.keys(from).map(k => [k, k==='opacity' ? 1 : 0])),
        opacity:1, duration:0.9, ease:'power3.out',
        scrollTrigger:{ trigger, start, once:true } });
  });
}

document.addEventListener('DOMContentLoaded', () => { initLifeTracker(); });


/* ════════════════════════════════════════════════════════════════
   GALAXY MAP — CLEAN v2  (Premium · Simple · Beginner-Friendly)
   Central Orb Mood · 5 Core Nodes · Gradual Unlock · Decision Panel
════════════════════════════════════════════════════════════════ */

const GalaxyEngine = {
  canvas: null, ctx: null,
  width: 0, height: 0,

  // Camera — slow, stable movement only
  cam: { x: 0, y: 0, zoom: 1, targetZoom: 1 },
  drag: { active: false, startX: 0, startY: 0, camStartX: 0, camStartY: 0 },

  // State
  stars: [],
  selectedStar: null,
  hoveredStar: null,
  animFrame: null,
  particles: [],
  time: 0,

  // Central mood orb
  orb: { x: 0, y: 0, r: 38, pulse: 0, color: '#7c3aed', glow: 0.5 },

  // Save system
  saveSlots: [null, null, null, null],
  autoSave: true,

  // Analytics
  stabilityScore: 72,
  timelineBranches: 5,
  trajectoryChart: null,
  trajectoryHistory: [45, 52, 58, 65, 70, 72],

  // Core 5 life nodes — placed in a clean pentagon
  coreNodes: [
    { id:'sleep',       name:'Sleep',       icon:'😴', color:'#818cf8', habit:'sleep',
      desc:'Rest & recovery shapes your entire cosmic orbit.',
      tip:'Aim for 7–9 hours to keep all systems optimal.',
      unlockAt: 0, ring: 1 },
    { id:'study',       name:'Study',       icon:'📚', color:'#60a5fa', habit:'study',
      desc:'Knowledge is the fuel of your destiny engine.',
      tip:'Even 1–2 hours of focused study compounds over time.',
      unlockAt: 0, ring: 1 },
    { id:'health',      name:'Health',      icon:'💪', color:'#34d399', habit:'exercise',
      desc:'Physical strength anchors your mental universe.',
      tip:'Move your body daily — even a 20-min walk counts.',
      unlockAt: 0, ring: 1 },
    { id:'social',      name:'Social',      icon:'👥', color:'#f59e0b', habit:'social',
      desc:'Your connections define the stars around you.',
      tip:'Strong relationships boost happiness and resilience.',
      unlockAt: 0, ring: 1 },
    { id:'productivity',name:'Productivity',icon:'⚡', color:'#a855f7', habit:'productivity',
      desc:'Output is the trajectory of your cosmic journey.',
      tip:'Deep work sessions of 90+ minutes are most powerful.',
      unlockAt: 0, ring: 1 },
  ],

  // Second ring — unlocks after 3 core nodes clicked
  innerNodes: [
    { id:'mindset',   name:'Mindset',  icon:'🧠', color:'#c084fc', habit:'mental',
      desc:'Your inner world shapes the outer universe.',
      tip:'Meditation and reflection unlock hidden paths.',
      unlockAt: 3, ring: 2 },
    { id:'finance',   name:'Finance',  icon:'💰', color:'#86efac', habit:'productivity',
      desc:'Financial orbit determines your freedom trajectory.',
      tip:'Small consistent savings beat large random ones.',
      unlockAt: 3, ring: 2 },
    { id:'creativity',name:'Creativity',icon:'🎨', color:'#f0abfc', habit:'mental',
      desc:'Creative energy is a force multiplier in all fields.',
      tip:'Unstructured time sparks the most powerful ideas.',
      unlockAt: 3, ring: 2 },
  ],

  // Outer ring — unlocks after all core nodes clicked
  outerNodes: [
    { id:'legacy',    name:'Legacy',   icon:'🌟', color:'#fde68a', habit:'study',
      desc:'What you leave behind defines your cosmic imprint.',
      tip:'Legacy is built through consistent daily action.',
      unlockAt: 5, ring: 3 },
    { id:'mastery',   name:'Mastery',  icon:'👑', color:'#f97316', habit:'productivity',
      desc:'10,000 hours of focus collapse timelines.',
      tip:'Mastery requires deep work, not just hard work.',
      unlockAt: 5, ring: 3 },
  ],

  clickedCount: 0,

  // Cosmic events
  cosmicEvents: [
    { icon:'☄️', title:'METEOR EVENT',       desc:'A life disruption crosses your trajectory', effect:'stability', delta:-8 },
    { icon:'🌟', title:'SUPERNOVA',           desc:'Unexpected opportunity lights your path',   effect:'stability', delta:+12 },
    { icon:'🌀', title:'WORMHOLE DETECTED',  desc:'A shortcut to your goals opens',            effect:'branches',  delta:+1 },
    { icon:'🌈', title:'AURORA EVENT',        desc:'Inspiration boosts all frequencies',        effect:'stability', delta:+8 },
    { icon:'💫', title:'STARDUST SHOWER',     desc:'New skills crystallize from cosmic dust',   effect:'branches',  delta:+1 },
    { icon:'🌑', title:'DARK MATTER SURGE',  desc:'Unseen forces slow your momentum',          effect:'stability', delta:-5 },
  ],
};

// ── Build All Stars ────────────────────────────────────────────
function buildGalaxyStars(W, H) {
  const cx = W / 2, cy = H / 2;
  GalaxyEngine.orb.x = cx;
  GalaxyEngine.orb.y = cy;

  const stars = [];
  const allNodes = [
    ...GalaxyEngine.coreNodes,
    ...GalaxyEngine.innerNodes,
    ...GalaxyEngine.outerNodes,
  ];

  // Ring radii
  const radii = { 1: Math.min(W, H) * 0.24, 2: Math.min(W, H) * 0.38, 3: Math.min(W, H) * 0.46 };

  // Separate by ring
  const ring1 = allNodes.filter(n => n.ring === 1);
  const ring2 = allNodes.filter(n => n.ring === 2);
  const ring3 = allNodes.filter(n => n.ring === 3);

  function placeRing(nodes, r, angleOffset) {
    nodes.forEach((n, i) => {
      const a = angleOffset + (i / nodes.length) * Math.PI * 2;
      stars.push({
        ...n,
        x: cx + Math.cos(a) * r,
        y: cy + Math.sin(a) * r,
        size: n.ring === 1 ? 22 : n.ring === 2 ? 16 : 13,
        unlocked: n.unlockAt === 0,
        clicked: false,
        pulse: Math.random() * Math.PI * 2,
        hoverScale: 1,
        connections: ['orb'],
      });
    });
  }

  placeRing(ring1, radii[1], -Math.PI / 2);
  placeRing(ring2, radii[2], -Math.PI / 2 + Math.PI / ring2.length);
  placeRing(ring3, radii[3], -Math.PI / 2);

  return stars;
}

// ── Particles (subtle, sparse) ─────────────────────────────────
function buildParticles(W, H) {
  const pts = [];
  for (let i = 0; i < 60; i++) {
    pts.push({
      x: Math.random() * W, y: Math.random() * H,
      r: 0.5 + Math.random() * 1.2,
      op: 0.15 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
      speed: 0.004 + Math.random() * 0.008,
      color: ['255,255,255','200,180,255','180,220,255'][Math.floor(Math.random() * 3)],
    });
  }
  return pts;
}

// ── Get Orb Color From Mood ────────────────────────────────────
function getOrbMoodColor() {
  const mood = window.CosmicEngine ? CosmicEngine.mood : 'neutral';
  return {
    peak:    '#a855f7', euphoric: '#60a5fa',
    neutral: '#7c3aed', warning:  '#eab308', burnout: '#ef4444',
  }[mood] || '#7c3aed';
}

// ── Main Render ────────────────────────────────────────────────
function renderGalaxy() {
  const { ctx, width: W, height: H, cam, stars, particles, orb, time } = GalaxyEngine;
  if (!ctx) return;

  GalaxyEngine.time++;

  // Smooth zoom interpolation
  cam.zoom += (cam.targetZoom - cam.zoom) * 0.06;

  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.translate(cam.x, cam.y);
  ctx.scale(cam.zoom, cam.zoom);

  const t = GalaxyEngine.time;

  // ── Background particles ───────────────────────────────────
  particles.forEach(p => {
    p.phase += p.speed;
    const op = p.op * (0.6 + 0.4 * Math.sin(p.phase));
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.color},${op.toFixed(2)})`;
    ctx.fill();
  });

  // ── Constellation beams from orb to unlocked stars ─────────
  const unlockedStars = stars.filter(s => s.unlocked);
  unlockedStars.forEach(star => {
    const dx = star.x - orb.x, dy = star.y - orb.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Line opacity — dimmer for unclicked, brighter for clicked
    const lineOp = star.clicked ? 0.45 : 0.18;
    const lineW  = star.clicked ? 1.2 : 0.7;

    const grad = ctx.createLinearGradient(orb.x, orb.y, star.x, star.y);
    grad.addColorStop(0, hexToRgba(orb.color, lineOp * 0.6));
    grad.addColorStop(0.5, hexToRgba(star.color, lineOp));
    grad.addColorStop(1, hexToRgba(star.color, lineOp * 0.3));

    ctx.beginPath();
    ctx.moveTo(orb.x, orb.y);
    ctx.lineTo(star.x, star.y);
    ctx.strokeStyle = grad;
    ctx.lineWidth = lineW;
    ctx.stroke();

    // Travelling dot on beam (only for clicked paths)
    if (star.clicked) {
      const prog = ((t * 0.008) % 1);
      const px   = orb.x + dx * prog;
      const py   = orb.y + dy * prog;
      const dotOp = Math.sin(prog * Math.PI);
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${(dotOp * 0.8).toFixed(2)})`;
      ctx.fill();
    }
  });

  // ── Draw locked paths as faded dashed lines ────────────────
  stars.filter(s => !s.unlocked).forEach(star => {
    ctx.beginPath();
    ctx.moveTo(orb.x, orb.y);
    ctx.lineTo(star.x, star.y);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 8]);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // ── Central Mood Orb ──────────────────────────────────────
  orb.pulse += 0.025;
  orb.color = getOrbMoodColor();
  const orbPulse = 1 + 0.08 * Math.sin(orb.pulse);
  const orbR     = orb.r * orbPulse;

  // Outer glow rings (2 layers)
  for (let layer = 0; layer < 3; layer++) {
    const gR  = orbR * (1.8 + layer * 0.9);
    const gOp = (0.12 - layer * 0.035) * (0.8 + 0.2 * Math.sin(orb.pulse + layer));
    const g   = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, gR);
    g.addColorStop(0, hexToRgba(orb.color, gOp));
    g.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, gR, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }

  // Core orb
  const orbGrad = ctx.createRadialGradient(orb.x - orbR * 0.3, orb.y - orbR * 0.3, orbR * 0.05, orb.x, orb.y, orbR);
  orbGrad.addColorStop(0, '#ffffff');
  orbGrad.addColorStop(0.3, orb.color + 'ee');
  orbGrad.addColorStop(1, orb.color + '55');
  ctx.beginPath();
  ctx.arc(orb.x, orb.y, orbR, 0, Math.PI * 2);
  ctx.fillStyle = orbGrad;
  ctx.fill();

  // Orb label
  ctx.font = `bold 11px Orbitron, monospace`;
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('YOUR', orb.x, orb.y - 7);
  ctx.fillText('LIFE', orb.x, orb.y + 7);

  // ── Draw Stars ─────────────────────────────────────────────
  stars.forEach(star => {
    const isLocked  = !star.unlocked;
    const isHovered = GalaxyEngine.hoveredStar?.id === star.id;

    // Smooth hover scale
    const targetScale = isHovered ? 1.25 : 1;
    star.hoverScale   = star.hoverScale + (targetScale - star.hoverScale) * 0.12;

    star.pulse += 0.022;
    const ps   = 1 + (isLocked ? 0 : 0.07) * Math.sin(star.pulse);
    const r    = star.size * ps * star.hoverScale;

    if (isLocked) {
      // Locked — minimal, faded ghost
      ctx.beginPath();
      ctx.arc(star.x, star.y, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(100,100,130,0.15)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.font = `${r * 0.9}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.2;
      ctx.fillText(star.icon, star.x, star.y);
      ctx.globalAlpha = 1;
      ctx.font = `9px Orbitron, monospace`;
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillText('LOCKED', star.x, star.y + r + 12);
      return;
    }

    // Outer soft glow
    const glowR = r * (isHovered ? 3.2 : 2.6);
    const glowOp = isHovered ? 0.22 : 0.1;
    const glowG = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowR);
    glowG.addColorStop(0, hexToRgba(star.color, glowOp * 1.8));
    glowG.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(star.x, star.y, glowR, 0, Math.PI * 2);
    ctx.fillStyle = glowG;
    ctx.fill();

    // Core gradient
    const cg = ctx.createRadialGradient(star.x - r*0.3, star.y - r*0.3, r*0.05, star.x, star.y, r);
    cg.addColorStop(0, '#ffffff');
    cg.addColorStop(0.4, star.color);
    cg.addColorStop(1, star.color + '66');
    ctx.beginPath();
    ctx.arc(star.x, star.y, r, 0, Math.PI * 2);
    ctx.fillStyle = cg;
    ctx.fill();

    // Border ring
    ctx.strokeStyle = isHovered ? '#ffffff' : star.color + 'bb';
    ctx.lineWidth = isHovered ? 2 : 1;
    ctx.stroke();

    // Clicked: outer dashed orbit ring
    if (star.clicked) {
      const or2 = r + 7 + 3 * Math.sin(star.pulse * 1.5);
      ctx.beginPath();
      ctx.arc(star.x, star.y, or2, 0, Math.PI * 2);
      ctx.strokeStyle = star.color + 'aa';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Icon
    ctx.font = `${Math.max(12, r * 0.85)}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(star.icon, star.x, star.y);

    // Label below
    ctx.font = `600 ${Math.max(8, r * 0.5)}px Orbitron, monospace`;
    ctx.fillStyle = isHovered ? '#ffffff' : 'rgba(255,255,255,0.75)';
    ctx.fillText(star.name, star.x, star.y + r + 14);
  });

  ctx.restore();
  GalaxyEngine.animFrame = requestAnimationFrame(renderGalaxy);
}

// ── Hex → rgba helper ──────────────────────────────────────────
function hexToRgba(hex, alpha) {
  if (!hex || !hex.startsWith('#')) return `rgba(124,58,237,${alpha})`;
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── Hit Test ───────────────────────────────────────────────────
function hitTestStar(wx, wy) {
  return GalaxyEngine.stars.find(s => {
    if (!s.unlocked) return false;
    const dx = s.x - wx, dy = s.y - wy;
    return Math.sqrt(dx*dx + dy*dy) < s.size * 2.2;
  });
}

function screenToWorld(sx, sy) {
  const { cam } = GalaxyEngine;
  return { x: (sx - cam.x) / cam.zoom, y: (sy - cam.y) / cam.zoom };
}

// ── Decision Panel ─────────────────────────────────────────────
function openDecisionPanel(star) {
  const panel = document.getElementById('galaxyDecisionPanel');
  if (!panel) return;

  // Always use live LifeTracker.habits — window.LifeTracker is now always set
  const h = (window.LifeTracker && LifeTracker.habits) ? LifeTracker.habits : {};
  const habitVal = (h[star.habit] !== undefined && h[star.habit] !== null) ? h[star.habit] : 5;
  const scores   = (typeof calcScores === 'function' && Object.keys(h).length > 0) ? calcScores(h) : {};

  document.getElementById('dpStarIcon').textContent  = star.icon;
  document.getElementById('dpStarName').textContent  = star.name;
  document.getElementById('dpStarDesc').textContent  = star.desc;
  document.getElementById('dpStarTip').textContent   = '💡 ' + star.tip;
  document.getElementById('dpHabitVal').textContent  = habitVal + '/10';
  document.getElementById('dpHabitName').textContent = star.name + ' Level';

  const fill = document.getElementById('dpHabitFill');
  if (fill) fill.style.width = (habitVal * 10) + '%';

  const status = document.getElementById('dpStatus');
  if (status) {
    const level = habitVal >= 8 ? { txt:'🌟 Elite', cls:'dp-elite' }
      : habitVal >= 6 ? { txt:'✅ Strong', cls:'dp-good' }
      : habitVal >= 4 ? { txt:'⚖️ Average', cls:'dp-avg' }
      : { txt:'⚠️ Low', cls:'dp-low' };
    status.textContent  = level.txt;
    status.className    = 'dp-status ' + level.cls;
  }

  // Color the panel border to match the star
  panel.style.borderColor = star.color + '60';
  panel.style.setProperty('--dp-color', star.color);

  gsap.fromTo(panel,
    { opacity: 0, y: 20, scale: 0.97 },
    { opacity: 1, y: 0,  scale: 1, duration: 0.4, ease: 'back.out(1.4)' }
  );
  panel.classList.remove('hidden');
}

function closeDecisionPanel() {
  const panel = document.getElementById('galaxyDecisionPanel');
  if (!panel) return;
  gsap.to(panel, { opacity: 0, y: 10, duration: 0.25, onComplete: () => panel.classList.add('hidden') });
}

// ── Star Click ─────────────────────────────────────────────────
function onStarClick(star) {
  if (!star.unlocked) return;

  // Soft zoom toward clicked star
  const vp = document.querySelector('.galaxy-viewport');
  if (vp) {
    const vpCX = vp.clientWidth  / 2;
    const vpCY = vp.clientHeight / 2;
    const targetCamX = vpCX - star.x * GalaxyEngine.cam.zoom;
    const targetCamY = vpCY - star.y * GalaxyEngine.cam.zoom;
    gsap.to(GalaxyEngine.cam, { x: targetCamX * 0.3 + GalaxyEngine.cam.x * 0.7,
      y: targetCamY * 0.3 + GalaxyEngine.cam.y * 0.7, duration: 0.9, ease: 'power2.out' });
  }
  GalaxyEngine.cam.targetZoom = Math.min(1.4, GalaxyEngine.cam.zoom * 1.12);
  setTimeout(() => { GalaxyEngine.cam.targetZoom = GalaxyEngine.cam.zoom; }, 1200);

  // Mark clicked
  if (!star.clicked) {
    star.clicked = true;
    GalaxyEngine.clickedCount++;
    GalaxyEngine.stabilityScore = Math.min(100, GalaxyEngine.stabilityScore + 4);
    GalaxyEngine.timelineBranches++;

    // Unlock next ring when threshold reached
    unlockStarsForCount(GalaxyEngine.clickedCount);

    // XP bonus
    if (window.LifeTracker) { LifeTracker.xp += 60; updateXpUI(); }
    addStarLogEntry(star);
    updateGalaxyHUD();
    updateStabilityRing();
    updateTrajectoryChart();
  }

  GalaxyEngine.selectedStar = star;
  openDecisionPanel(star);

  // Brief warp flash on canvas
  const warpEl = document.getElementById('warpOverlay');
  const warpTx = document.getElementById('warpText');
  if (warpEl && warpTx) {
    warpTx.textContent = `✦ ${star.name.toUpperCase()} ACTIVATED`;
    warpEl.classList.add('active');
    setTimeout(() => warpEl.classList.remove('active'), 1200);
  }

  showToast(`${star.icon} ${star.name} node activated!`);
}

function unlockStarsForCount(count) {
  GalaxyEngine.stars.forEach(s => {
    if (!s.unlocked && count >= s.unlockAt) {
      s.unlocked = true;
      showCosmicNotification(`🔓 New node unlocked: ${s.icon} ${s.name}`, s.color || '#a855f7');
    }
  });
}

// ── Tooltip (hover) ────────────────────────────────────────────
function showStarTooltip(star, screenX, screenY) {
  const tt = document.getElementById('starTooltip');
  if (!tt) return;
  document.getElementById('ttIcon').textContent = star.icon;
  document.getElementById('ttName').textContent = star.name;
  document.getElementById('ttDesc').textContent = star.desc;

  const statsEl = document.getElementById('ttStats');
  if (statsEl) {
    const h = (window.LifeTracker && LifeTracker.habits) ? LifeTracker.habits : {};
    const raw = h[star.habit];
    const val = (raw !== undefined && raw !== null) ? raw : '—';
    statsEl.innerHTML = `<span class="tt-stat tt-pos">Current: ${val}/10</span>
      <span class="tt-stat ${star.clicked ? 'tt-pos' : 'tt-neg'}">${star.clicked ? '✓ Visited' : '⊙ Click to explore'}</span>`;
  }

  const vp = document.querySelector('.galaxy-viewport');
  const vpR = vp ? vp.getBoundingClientRect() : { left:0, top:0 };
  tt.style.left = Math.min(screenX - vpR.left + 18, (vp?.clientWidth||600) - 230) + 'px';
  tt.style.top  = Math.max(10, screenY - vpR.top - 50) + 'px';
  tt.classList.add('visible');
}

function hideStarTooltip() {
  document.getElementById('starTooltip')?.classList.remove('visible');
}

// ── Add custom star ────────────────────────────────────────────
function addDecisionStar() {
  const { width: W, height: H } = GalaxyEngine;
  const cx = W / 2, cy = H / 2;
  const all = [...GalaxyEngine.coreNodes, ...GalaxyEngine.innerNodes, ...GalaxyEngine.outerNodes];
  const t   = all[Math.floor(Math.random() * all.length)];
  const a   = Math.random() * Math.PI * 2;
  const r   = Math.min(W, H) * 0.35;

  GalaxyEngine.stars.push({
    id: 'custom_' + Date.now(),
    x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r,
    name: t.name, icon: t.icon, color: t.color,
    desc: t.desc, tip: t.tip, habit: t.habit,
    size: 14, unlocked: true, clicked: false,
    pulse: Math.random() * Math.PI * 2, hoverScale: 1,
    connections: ['orb'], ring: 2, unlockAt: 0,
  });
  GalaxyEngine.timelineBranches++;
  updateGalaxyHUD();
  showToast(`✦ ${t.icon} ${t.name} added to your galaxy`);
}

// ── Galaxy HUD ─────────────────────────────────────────────────
function updateGalaxyHUD() {
  const stabBar  = document.getElementById('stabilityBar');
  const stabVal  = document.getElementById('stabilityVal');
  const branches = document.getElementById('timelineBranches');
  if (stabBar)  stabBar.style.width = GalaxyEngine.stabilityScore + '%';
  if (stabVal)  stabVal.textContent = GalaxyEngine.stabilityScore + '%';
  if (branches) branches.textContent = GalaxyEngine.timelineBranches;
}

function updateStabilityRing() {
  const fill    = document.getElementById('stabilityRingFill');
  const score   = document.getElementById('stabilityScore');
  const insight = document.getElementById('stabilityInsight');
  const s = GalaxyEngine.stabilityScore;
  if (fill) {
    fill.style.strokeDashoffset = 251 - (s / 100) * 251;
    fill.style.stroke = s >= 70 ? '#a855f7' : s >= 45 ? '#3b82f6' : '#ef4444';
  }
  if (score) score.textContent = s;
  if (insight) {
    const msgs = [
      ['Your mental orbit is stabilizing ✦', 'Financial trajectory entering expansion phase', 'Cosmic alignment — peak performance ahead'],
      ['Timeline stability moderate — one strong decision shifts everything', 'Your orbit shows fluctuation — build one strong habit'],
      ['Orbital decay detected — seek recovery arc immediately', 'Critical instability — rest and recalibrate'],
    ];
    const pool = s >= 65 ? msgs[0] : s >= 40 ? msgs[1] : msgs[2];
    insight.textContent = pool[Math.floor(Date.now() / 10000) % pool.length];
  }
}

// ── Star Log ───────────────────────────────────────────────────
function addStarLogEntry(star) {
  const log = document.getElementById('starLog');
  if (!log) return;
  const ph = log.querySelector('.log-placeholder');
  if (ph) ph.remove();
  const entry = document.createElement('div');
  entry.className = 'star-log-entry';
  entry.innerHTML = `<span class="star-log-icon">${star.icon}</span>
    <div><span class="star-log-name">${star.name}</span><span>${star.tip}</span></div>`;
  log.insertBefore(entry, log.firstChild);
  while (log.children.length > 6) log.removeChild(log.lastChild);
}

// ── Cosmic Insights ────────────────────────────────────────────
function updateCosmicInsights() {
  const container = document.getElementById('cosmicInsightsList');
  if (!container) return;
  const s = GalaxyEngine.stabilityScore;
  const h = window.LifeTracker ? LifeTracker.habits : {};
  const insights = [
    { icon:'🌌', text:'Universe Stability at ' + s + '% — ' + (s>=70 ? 'well within optimal range' : 'recalibration recommended') },
    { icon:'😴', text:'Sleep: ' + (h.sleep ?? 5) + '/10 — ' + ((h.sleep ?? 5)>=7 ? 'Recovery orbit optimal' : 'Sleep debt is building') },
    { icon:'📚', text:'Study: ' + (h.study ?? 5) + '/10 — ' + ((h.study ?? 5)>=7 ? 'Knowledge trajectory excellent' : 'Boost learning input') },
    { icon:'⚡', text:'Productivity: ' + (h.productivity ?? 5) + '/10 — ' + ((h.productivity ?? 5)>=7 ? 'Output level: stellar' : 'Deep work sessions needed') },
    { icon:'🌟', text:(GalaxyEngine.clickedCount >= 5 ? 'All core nodes visited — outer paths unlocking' : `${GalaxyEngine.clickedCount}/5 core nodes explored — keep navigating`) },
    { icon:'🔭', text:'Nodes visited: ' + GalaxyEngine.clickedCount + ' — ' + GalaxyEngine.timelineBranches + ' timeline branches active' },
  ];
  container.innerHTML = insights.map(i => `
    <div class="cosmic-insight-item">
      <span class="ci-icon">${i.icon}</span>
      <span class="ci-text">${i.text}</span>
    </div>`).join('');
}

// ── Trajectory Chart ───────────────────────────────────────────
function initTrajectoryChart() {
  const canvas = document.getElementById('trajectoryChart');
  if (!canvas || !window.Chart) return;
  if (GalaxyEngine.trajectoryChart) { GalaxyEngine.trajectoryChart.destroy(); }

  GalaxyEngine.trajectoryChart = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels: GalaxyEngine.trajectoryHistory.map((_,i) => `T${i+1}`),
      datasets: [{
        data: GalaxyEngine.trajectoryHistory,
        borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,0.1)',
        fill: true, tension: 0.5, pointRadius: 3, pointBackgroundColor: '#a855f7',
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend:{display:false}, tooltip:{
        backgroundColor:'rgba(6,9,26,0.9)', titleColor:'#e2e8f0', bodyColor:'#94a3b8',
        titleFont:{family:'Orbitron',size:10} } },
      scales: {
        x: { ticks:{color:'#64748b',font:{size:8}}, grid:{color:'rgba(255,255,255,0.04)'} },
        y: { min:0, max:100, ticks:{color:'#64748b',font:{size:8}}, grid:{color:'rgba(255,255,255,0.04)'} },
      },
    },
  });
}

function updateTrajectoryChart() {
  if (!GalaxyEngine.trajectoryChart) return;
  const hist = GalaxyEngine.trajectoryHistory;
  hist.push(GalaxyEngine.stabilityScore);
  if (hist.length > 10) hist.shift();
  GalaxyEngine.trajectoryChart.data.labels = hist.map((_,i)=>`T${i+1}`);
  GalaxyEngine.trajectoryChart.data.datasets[0].data = [...hist];
  GalaxyEngine.trajectoryChart.update('active');
}

// ── Save / Load ────────────────────────────────────────────────
function buildSaveData() {
  // Always use the live current habits — never fall back to hardcoded defaults
  // Fallback defaults only if LifeTracker truly not initialized yet
  const liveHabits = (window.LifeTracker && window.LifeTracker.habits && Object.keys(window.LifeTracker.habits).length > 0)
    ? { ...window.LifeTracker.habits }
    : { sleep:7, study:5, screen:3, exercise:4, productivity:6, social:4, mental:6 };

  // Compute overall as a plain integer (getters don't survive JSON serialization)
  let overallScore = 0;
  try {
    const s = calcScores(liveHabits);
    overallScore = Math.min(100, Math.max(0, Math.round(
      (s.health + s.focus + s.productivity + s.happiness + s.discipline + s.mental) / 6
    )));
  } catch(e) {}

  return {
    savedAt:      new Date().toISOString(),
    stability:    GalaxyEngine.stabilityScore,
    branches:     GalaxyEngine.timelineBranches,
    clickedCount: GalaxyEngine.clickedCount,
    starClicked:  GalaxyEngine.stars.filter(s=>s.clicked).map(s=>s.id),
    habits:       liveHabits,
    xp:           (window.LifeTracker ? LifeTracker.xp    : 0) || 0,
    level:        (window.LifeTracker ? LifeTracker.level : 1) || 1,
    streak:       (window.LifeTracker ? LifeTracker.streak: 0) || 0,
    overallScore,
    personality:  (window.CosmicEngine ? CosmicEngine.personality.title : 'Explorer'),
  };
}

function renderSaveSlots() {
  const container = document.getElementById('saveSlots');
  if (!container) return;
  container.innerHTML = '';
  GalaxyEngine.saveSlots.forEach((slot, i) => {
    const el = document.createElement('div');
    el.className = 'save-slot' + (slot ? ' occupied' : '');
    if (slot) {
      const d = new Date(slot.savedAt);
      // Always recompute score live from saved habits
      // Never trust stored overallScore — it may be stale from the getter-serialization bug
      let liveScore = slot.overallScore || 0;
      try {
        if (slot.habits) {
          const sc = calcScores(slot.habits);
          liveScore = Math.min(100, Math.max(0, Math.round(
            (sc.health + sc.focus + sc.productivity + sc.happiness + sc.discipline + sc.mental) / 6
          )));
          slot.overallScore = liveScore; // patch stale value in memory
        }
      } catch(e) {}
      el.innerHTML = `<span class="save-slot-icon">🌌</span>
        <span class="save-slot-name">Universe ${i+1}</span>
        <span class="save-slot-score">${liveScore}/100</span>
        <span class="save-slot-time">${d.toLocaleDateString()} ${d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>`;
      el.title = 'Click to load';
      el.addEventListener('click', () => loadGalaxy(i));
    } else {
      el.innerHTML = `<span class="save-slot-icon">🔲</span>
        <span class="save-slot-name">Empty Slot ${i+1}</span>
        <span class="save-slot-time">No save yet</span>`;
      el.addEventListener('click', () => saveGalaxy(i));
    }
    container.appendChild(el);
  });
}

function saveGalaxy(idx) {
  GalaxyEngine.saveSlots[idx] = buildSaveData();
  try {
    localStorage.setItem('lifesim_galaxy_v2', JSON.stringify(GalaxyEngine.saveSlots));
    renderSaveSlots();
    const el = document.getElementById('lastSaveTime');
    if (el) el.textContent = 'Saved: ' + new Date().toLocaleTimeString();
    showToast(`✦ Universe ${idx+1} saved to Galactic Logbook!`);
  } catch(e) { showToast('⚠ Save failed'); }
}

function saveGalaxyAuto() { saveGalaxy(0); }

// ── Live Galaxy Score Sync ─────────────────────────────────────
// Updates the displayed score in all occupied save slots to reflect
// the current live habit values — called every time sliders change
function syncGalaxyScoreLive() {
  if (!GalaxyEngine.saveSlots) return;
  let changed = false;
  GalaxyEngine.saveSlots.forEach(slot => {
    if (!slot) return;
    try {
      const h = window.LifeTracker ? { ...LifeTracker.habits } : slot.habits;
      if (!h) return;
      const sc = calcScores(h);
      const newScore = Math.min(100, Math.max(0, Math.round(
        (sc.health + sc.focus + sc.productivity + sc.happiness + sc.discipline + sc.mental) / 6
      )));
      if (slot.overallScore !== newScore) {
        slot.overallScore = newScore;
        slot.habits = { ...h }; // keep habits in sync too
        changed = true;
      }
    } catch(e) {}
  });
  if (changed) renderSaveSlots();
}

function loadGalaxy(idx) {
  const slot = GalaxyEngine.saveSlots[idx];
  if (!slot) { showToast('⚠ No save in this slot'); return; }
  GalaxyEngine.stabilityScore   = slot.stability  || 72;
  GalaxyEngine.timelineBranches = slot.branches   || 5;
  GalaxyEngine.clickedCount     = slot.clickedCount || 0;

  // Restore clicked star state
  if (slot.starClicked) {
    GalaxyEngine.stars.forEach(s => { s.clicked = slot.starClicked.includes(s.id); });
    unlockStarsForCount(GalaxyEngine.clickedCount);
  }

  if (window.LifeTracker && slot.habits) {
    Object.assign(LifeTracker.habits, slot.habits);
    LifeTracker.xp     = slot.xp     || 0;
    LifeTracker.level  = slot.level  || 1;
    LifeTracker.streak = slot.streak || 0;
    Object.entries(LifeTracker.habits).forEach(([h,v]) => {
      const sl = document.getElementById(`slider-${h}`);
      if (sl) sl.value = v;
      updateSliderDisplay(h, v);
    });
    updateLifeUI();
  }
  updateGalaxyHUD(); updateStabilityRing();
  showToast(`✦ Universe ${idx+1} loaded — Continue your journey!`);
}

function loadSavedGalaxies() {
  try {
    const raw = localStorage.getItem('lifesim_galaxy_v2');
    if (raw) {
      const loaded = JSON.parse(raw);
      // Recompute overallScore live for every slot — fixes stale 58/100 bug
      // where old saves had the getter value frozen before the serialization fix
      GalaxyEngine.saveSlots = loaded.map(slot => {
        if (!slot || !slot.habits) return slot;
        try {
          const sc = calcScores(slot.habits);
          slot.overallScore = Math.min(100, Math.max(0, Math.round(
            (sc.health + sc.focus + sc.productivity + sc.happiness + sc.discipline + sc.mental) / 6
          )));
        } catch(e) {}
        return slot;
      });
    }
    renderSaveSlots();
  } catch(e) { renderSaveSlots(); }
}

// ── Cosmic Events ──────────────────────────────────────────────
function triggerRandomCosmicEvent() {
  const ev = GalaxyEngine.cosmicEvents[Math.floor(Math.random() * GalaxyEngine.cosmicEvents.length)];
  const el = document.getElementById('cosmicEvent');
  const icon = document.getElementById('ceIcon');
  const title = document.getElementById('ceTitle');
  const desc  = document.getElementById('ceDesc');
  if (!el) return;
  if (icon)  icon.textContent  = ev.icon;
  if (title) title.textContent = ev.title;
  if (desc)  desc.textContent  = ev.desc;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 4500);
  if (ev.effect === 'stability') GalaxyEngine.stabilityScore = Math.min(100, Math.max(0, GalaxyEngine.stabilityScore + ev.delta));
  if (ev.effect === 'branches')  GalaxyEngine.timelineBranches = Math.max(1, GalaxyEngine.timelineBranches + ev.delta);
  updateGalaxyHUD(); updateStabilityRing(); updateTrajectoryChart();
}

// ── Warp Cinematic ─────────────────────────────────────────────
function triggerWarpCinematic(star, onDone) {
  const cin  = document.getElementById('warpCinematic');
  const narr = document.getElementById('warpNarrative');
  const wc   = document.getElementById('warpCanvas');
  if (!cin || !narr || !wc) { onDone && onDone(); return; }

  const msgs = {
    sleep:'You chose rest… your recovery orbit stabilizes all systems.',
    study:'You chose knowledge… your skill constellation expands.',
    health:'You chose vitality… your physical orbit strengthens.',
    social:'You chose connection… new stars enter your galaxy.',
    productivity:'You chose focus… your output trajectory accelerates.',
    mindset:'You chose clarity… your inner universe aligns.',
    finance:'You chose prosperity… your resource trajectory grows.',
    creativity:'You chose expression… new dimensions open before you.',
    legacy:'You chose impact… your cosmic imprint grows permanent.',
    mastery:'You chose mastery… 10,000 hours of focused destiny.',
  };
  narr.textContent = msgs[star.id] || `You chose ${star.name}… a new timeline crystallizes.`;

  const ctx2 = wc.getContext('2d');
  wc.width = window.innerWidth; wc.height = window.innerHeight;
  let f = 0;
  function drawWarp() {
    ctx2.fillStyle = `rgba(0,0,0,${f < 15 ? 0.08 : 0.14})`;
    ctx2.fillRect(0, 0, wc.width, wc.height);
    for (let i = 0; i < 12; i++) {
      const x = wc.width / 2, y = wc.height / 2;
      const angle = Math.random() * Math.PI * 2;
      const len = 100 + Math.random() * 300;
      const grad = ctx2.createLinearGradient(x, y, x + Math.cos(angle)*len, y + Math.sin(angle)*len);
      grad.addColorStop(0, hexToRgba(star.color, 0.8));
      grad.addColorStop(1, 'transparent');
      ctx2.strokeStyle = grad; ctx2.lineWidth = 1 + Math.random() * 1.5;
      ctx2.beginPath(); ctx2.moveTo(x, y);
      ctx2.lineTo(x + Math.cos(angle)*len, y + Math.sin(angle)*len);
      ctx2.stroke();
    }
    f++;
    if (f < 55) requestAnimationFrame(drawWarp);
  }
  cin.classList.add('active');
  drawWarp();

  // Typewriter
  const text = narr.textContent; narr.textContent = ''; let ci = 0;
  const iv = setInterval(() => { narr.textContent += text[ci]; ci++; if (ci >= text.length) clearInterval(iv); }, 45);
  setTimeout(() => { cin.classList.remove('active'); onDone && onDone(); }, 3000);
}

// ── Init Galaxy Engine v2 ──────────────────────────────────────
function initGalaxyEngine() {
  const canvas = document.getElementById('galaxyCanvas');
  if (!canvas) return;

  const vp = canvas.parentElement;
  GalaxyEngine.canvas = canvas;
  GalaxyEngine.width  = canvas.width  = vp.clientWidth;
  GalaxyEngine.height = canvas.height = vp.clientHeight;
  GalaxyEngine.ctx    = canvas.getContext('2d');

  GalaxyEngine.stars     = buildGalaxyStars(GalaxyEngine.width, GalaxyEngine.height);
  GalaxyEngine.particles = buildParticles(GalaxyEngine.width, GalaxyEngine.height);

  // ── Mouse events ─────────────────────────────────────────────
  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const { x, y } = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const star = hitTestStar(x, y);
    if (star) {
      if (!star._cinematicPlayed) {
        star._cinematicPlayed = true;
        onStarClick(star);
        triggerWarpCinematic(star, () => { updateCosmicInsights(); updateTrajectoryChart(); });
      } else {
        onStarClick(star);
        updateCosmicInsights();
      }
    }
  });

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const { x, y } = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const star = hitTestStar(x, y);
    GalaxyEngine.hoveredStar = star || null;
    if (star) { canvas.style.cursor = 'pointer'; showStarTooltip(star, e.clientX, e.clientY); }
    else       { canvas.style.cursor = GalaxyEngine.drag.active ? 'grabbing' : 'grab'; hideStarTooltip(); }
    if (GalaxyEngine.drag.active) {
      GalaxyEngine.cam.x = GalaxyEngine.drag.camStartX + (e.clientX - GalaxyEngine.drag.startX);
      GalaxyEngine.cam.y = GalaxyEngine.drag.camStartY + (e.clientY - GalaxyEngine.drag.startY);
    }
  });

  canvas.addEventListener('mousedown', e => {
    GalaxyEngine.drag = { active:true, startX:e.clientX, startY:e.clientY,
      camStartX:GalaxyEngine.cam.x, camStartY:GalaxyEngine.cam.y };
  });
  canvas.addEventListener('mouseup',    () => { GalaxyEngine.drag.active = false; });
  canvas.addEventListener('mouseleave', () => { GalaxyEngine.drag.active = false; hideStarTooltip(); });

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.92 : 1.09; // Slower, gentler zoom
    GalaxyEngine.cam.targetZoom = Math.min(2.2, Math.max(0.5, GalaxyEngine.cam.zoom * delta));
  }, { passive: false });

  // Touch
  canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      GalaxyEngine.drag = { active:true, startX:t.clientX, startY:t.clientY,
        camStartX:GalaxyEngine.cam.x, camStartY:GalaxyEngine.cam.y };
    }
  });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 1 && GalaxyEngine.drag.active) {
      const t = e.touches[0];
      GalaxyEngine.cam.x = GalaxyEngine.drag.camStartX + (t.clientX - GalaxyEngine.drag.startX);
      GalaxyEngine.cam.y = GalaxyEngine.drag.camStartY + (t.clientY - GalaxyEngine.drag.startY);
    }
  }, { passive: false });
  canvas.addEventListener('touchend', () => { GalaxyEngine.drag.active = false; });

  // HUD buttons
  document.getElementById('zoomInBtn')?.addEventListener('click',  () => { GalaxyEngine.cam.targetZoom = Math.min(2.2, GalaxyEngine.cam.zoom * 1.2); });
  document.getElementById('zoomOutBtn')?.addEventListener('click', () => { GalaxyEngine.cam.targetZoom = Math.max(0.5, GalaxyEngine.cam.zoom * 0.82); });
  document.getElementById('resetViewBtn')?.addEventListener('click',() => { GalaxyEngine.cam = {x:0,y:0,zoom:1,targetZoom:1}; });
  document.getElementById('addStarBtn')?.addEventListener('click',  () => addDecisionStar());

  // Save/Load
  // saveGalaxyBtn removed — Galaxy Logbook removed
  // autoSaveToggle removed — Galaxy Logbook removed

  // Decision panel close
  document.getElementById('dpCloseBtn')?.addEventListener('click', closeDecisionPanel);

  // Auto-save every 90s
  // Auto-save removed — Galaxy Logbook removed

  // Cosmic events every 50s
  // triggerRandomCosmicEvent intervals removed — cosmic events panel removed

  // Resize
  window.addEventListener('resize', () => {
    GalaxyEngine.width  = canvas.width  = vp.clientWidth;
    GalaxyEngine.height = canvas.height = vp.clientHeight;
    GalaxyEngine.stars  = buildGalaxyStars(GalaxyEngine.width, GalaxyEngine.height);
    GalaxyEngine.particles = buildParticles(GalaxyEngine.width, GalaxyEngine.height);
  });

  // Start render
  renderGalaxy();

  // Init everything
  // loadSavedGalaxies() — Galaxy Logbook removed
  updateGalaxyHUD();
  updateStabilityRing();
  updateCosmicInsights();
  setTimeout(initTrajectoryChart, 500);

  // GSAP reveals
  gsap.fromTo('.galaxy-viewport', { scale:0.95, opacity:0 },
    { scale:1, opacity:1, duration:1.2, ease:'back.out(1.4)',
      scrollTrigger:{ trigger:'.galaxy-viewport', start:'top 80%', once:true }});
  gsap.fromTo('.analytics-card', { y:40, opacity:0 },
    { y:0, opacity:1, stagger:0.12, duration:0.8, ease:'power3.out',
      scrollTrigger:{ trigger:'.cosmic-analytics', start:'top 80%', once:true }});
}

document.addEventListener('DOMContentLoaded', () => { initGalaxyEngine(); });


/* ════════════════════════════════════════════════════════════════
   COSMIC LIFE SIMULATOR v4
   Personality System · Consequence Engine · Random Events v2 ·
   Universe Progression · Mood Environment · Audio Feedback
════════════════════════════════════════════════════════════════ */

// ── Cosmic Engine State ────────────────────────────────────────
const CosmicEngine = {

  // Personality system
  personality: {
    title:      'The Explorer',
    discipline: 40,
    reputation: 50,
    emotional:  60,
    social:     50,
    intelligence: 50,
    traits:     [],
    history:    [],
  },

  // Consequence stacking
  consequences: [],
  eventHistory: [],

  // Universe progression
  universe: {
    level:      1,
    sector:     'Alpha Quadrant',
    completion: 0,
    unlockedSectors: ['Alpha Quadrant'],
    secretsFound: 0,
    prestigeCount: 0,
  },

  // Mood state (affects visual environment)
  mood: 'neutral',   // neutral | peak | burnout | warning | euphoric

  // Rare event cooldowns
  lastRareEvent: 0,

  // Personality title map
  personalityTitles: [
    { id: 'visionary',    title: 'The Visionary',      condition: h => h.study >= 7 && h.productivity >= 7, color: '#60a5fa' },
    { id: 'lost_soul',    title: 'The Lost Soul',       condition: h => h.screen >= 7 && h.exercise <= 2,   color: '#ef4444' },
    { id: 'strategist',   title: 'The Strategist',      condition: h => h.productivity >= 8 && h.mental >= 6, color: '#a855f7' },
    { id: 'cosmic_leader',title: 'The Cosmic Leader',   condition: h => h.social >= 7 && h.productivity >= 7, color: '#f59e0b' },
    { id: 'ascetic',      title: 'The Ascetic',         condition: h => h.screen <= 1 && h.exercise >= 6,   color: '#34d399' },
    { id: 'burnout',      title: 'The Burnout',         condition: h => h.sleep <= 4 && h.mental <= 3,      color: '#ef4444' },
    { id: 'renaissance',  title: 'The Renaissance Soul',condition: h => Object.values(h).filter(v=>v>=5).length >= 6, color: '#06b6d4' },
    { id: 'night_owl',    title: 'The Night Owl',       condition: h => h.study >= 7 && h.sleep <= 5,       color: '#8b5cf6' },
  ],

  // Extended random events
  rareEvents: [
    { id:'mentor',     icon:'🧙', title:'COSMIC MENTOR',          desc:'A wise figure enters your timeline. Wisdom +15.',    effect:'intelligence', delta:+15, rarity:0.15 },
    { id:'signal',     icon:'📡', title:'MYSTERIOUS SIGNAL',      desc:'A transmission from an unknown future self...',      effect:'mood',  mood:'euphoric', rarity:0.10 },
    { id:'collapse',   icon:'💥', title:'MENTAL COLLAPSE',        desc:'Burnout cascades across your timeline. Reset rest.', effect:'stability', delta:-15, rarity:0.12 },
    { id:'hidden',     icon:'🌀', title:'HIDDEN UNIVERSE',        desc:'You discovered a secret dimension of possibility.',   effect:'universe', rarity:0.08 },
    { id:'lucky',      icon:'⭐', title:'LUCKY CONVERGENCE',      desc:'Three timelines align. XP +200.',                    effect:'xp', delta:200, rarity:0.13 },
    { id:'disaster',   icon:'☄️', title:'COSMIC CATASTROPHE',    desc:'A life disruption tears through your trajectory.',   effect:'stability', delta:-20, rarity:0.10 },
    { id:'oracle',     icon:'🔭', title:'ORACLE TRANSMISSION',    desc:'"Your peak is closer than you think…"',             effect:'insight', rarity:0.14 },
    { id:'awakening',  icon:'🌅', title:'COSMIC AWAKENING',       desc:'Sudden clarity unlocks a hidden path.',              effect:'branches', delta:3, rarity:0.12 },
    { id:'void',       icon:'🌑', title:'THE VOID SPEAKS',        desc:'Silence reveals what noise was hiding.',             effect:'mental_boost', rarity:0.06 },
  ],

  // Delayed consequences queue
  delayedEffects: [],
};

// ── Personality Engine ─────────────────────────────────────────
function updatePersonality() {
  if (!window.LifeTracker || !LifeTracker.habits) return;
  const h = LifeTracker.habits;
  // Guard: if habits are all default zeros, skip — not initialized yet
  if (Object.keys(h).length === 0) return;
  const p = CosmicEngine.personality;

  // Update stats from habits
  p.discipline    = Math.round(h.study * 8 + h.exercise * 7 + (10 - h.screen) * 5);
  p.intelligence  = Math.round(h.study * 10 + h.mental * 7 + h.productivity * 3);
  p.emotional     = Math.round(h.mental * 8 + h.social * 7 + h.sleep * 5);
  p.social        = Math.round(h.social * 10 + h.exercise * 5);

  // Clamp all
  ['discipline','intelligence','emotional','social'].forEach(k => {
    p[k] = Math.min(100, Math.max(0, p[k]));
  });

  // Determine personality title
  const matched = CosmicEngine.personalityTitles.find(pt => pt.condition(h));
  const newTitle = matched ? matched.title : 'The Explorer';
  if (newTitle !== p.title) {
    p.title = newTitle;
    showCosmicNotification(`🧬 Personality Shift: You are now "${newTitle}"`, matched?.color || '#a855f7');
    p.history.push({ title: newTitle, time: Date.now() });
  }

  // Update UI
  renderPersonalityUI();
  updateMoodEnvironment();
}

function renderPersonalityUI() {
  const el = document.getElementById('cosmicPersonalityTitle');
  const badge = document.getElementById('cosmicPersonalityBadge');
  const matched = CosmicEngine.personalityTitles.find(pt => pt.title === CosmicEngine.personality.title);
  if (el) {
    el.textContent = CosmicEngine.personality.title;
    el.style.color = matched?.color || '#a855f7';
  }
  if (badge) {
    const p = CosmicEngine.personality;
    badge.innerHTML = `
      <div class="cp-stat"><span>🧠</span><span>${p.intelligence}</span><span>Intel</span></div>
      <div class="cp-stat"><span>⚡</span><span>${p.discipline}</span><span>Discipline</span></div>
      <div class="cp-stat"><span>💚</span><span>${p.emotional}</span><span>Emotional</span></div>
      <div class="cp-stat"><span>🌐</span><span>${p.social}</span><span>Social</span></div>
    `;
  }
}

// ── Mood Environment Engine ────────────────────────────────────
function updateMoodEnvironment() {
  if (!window.LifeTracker || !LifeTracker.habits) return;
  const h = LifeTracker.habits;
  // Compute overall explicitly (don't rely on getter surviving edge cases)
  const sc = calcScores(h);
  const overall = Math.round((sc.health + sc.focus + sc.productivity + sc.happiness + sc.discipline + sc.mental) / 6);
  const prevMood = CosmicEngine.mood;

  if (overall >= 85)      CosmicEngine.mood = 'peak';
  else if (overall >= 65) CosmicEngine.mood = 'euphoric';
  else if (overall >= 45) CosmicEngine.mood = 'neutral';
  else if (overall >= 25) CosmicEngine.mood = 'warning';
  else                    CosmicEngine.mood = 'burnout';

  applyMoodTheme(CosmicEngine.mood, prevMood);

  // Update mood bar text/color in LifeTracker UI
  const moodEl = document.getElementById('moodLabel') || document.getElementById('cosmicMoodText');
  const moodColors = { peak:'#a855f7', euphoric:'#60a5fa', neutral:'#7c3aed', warning:'#eab308', burnout:'#ef4444' };
  const moodLabels = { peak:'🌟 Peak State', euphoric:'✨ Thriving', neutral:'⚖️ Balanced', warning:'⚠️ Warning', burnout:'🔥 Burnout' };
  if (moodEl) {
    moodEl.textContent = moodLabels[CosmicEngine.mood] || CosmicEngine.mood;
    moodEl.style.color = moodColors[CosmicEngine.mood] || '#a855f7';
  }
}

function applyMoodTheme(mood, prevMood) {
  const msgs = {
    peak:     '🌟 Peak cosmic alignment detected',
    euphoric: '✨ Your universe is thriving',
    neutral:  null,
    warning:  '⚠️ Timeline instability rising',
    burnout:  '🔴 Burnout detected — seek recovery arc',
  };
  const moodColors = {
    peak:     '#a855f7',
    euphoric: '#60a5fa',
    neutral:  '#7c3aed',
    warning:  '#eab308',
    burnout:  '#ef4444',
  };

  // Remove all mood classes from body, add new one
  document.body.classList.remove('mood-peak','mood-euphoric','mood-neutral','mood-warning','mood-burnout');
  document.body.classList.add('mood-' + mood);

  // Update mood indicator bar if present
  const moodBar = document.getElementById('moodIndicatorBar');
  const moodLabel = document.getElementById('moodIndicatorLabel');
  const moodIcon  = document.getElementById('moodIndicatorIcon');
  const icons = { peak:'🌟', euphoric:'✨', neutral:'⚖️', warning:'⚠️', burnout:'🔴' };
  const labels = { peak:'Peak', euphoric:'Thriving', neutral:'Balanced', warning:'Warning', burnout:'Burnout' };
  if (moodBar)   { moodBar.style.background = moodColors[mood]; moodBar.style.width = { peak:'100%', euphoric:'80%', neutral:'60%', warning:'35%', burnout:'15%' }[mood]; }
  if (moodLabel) moodLabel.textContent = labels[mood] || mood;
  if (moodIcon)  moodIcon.textContent  = icons[mood]  || '⚖️';

  // Only show notification when mood actually changes
  if (mood !== prevMood && msgs[mood]) {
    showCosmicNotification(msgs[mood], moodColors[mood]);
  }
}

// ── Consequence System ─────────────────────────────────────────
function checkConsequences() {
  if (!window.LifeTracker) return;
  const h = LifeTracker.habits;

  // Consequence stacking
  const newConsequences = [];

  if (h.sleep <= 4 && h.study >= 7) {
    newConsequences.push({ id:'sleepdebt_study', label:'☕ Sleep debt building — focus will crash soon', severity:'warning' });
  }
  if (h.screen >= 8) {
    newConsequences.push({ id:'screen_overload', label:'📱 Screen overload — mental fatigue accelerating', severity:'danger' });
    // Delayed consequence
    CosmicEngine.delayedEffects.push({ applyAfter: Date.now() + 30000, effect: () => {
      if (window.LifeTracker) {
        LifeTracker.habits.mental = Math.max(0, LifeTracker.habits.mental - 1);
        const sl = document.getElementById('slider-mental');
        if (sl) { sl.value = LifeTracker.habits.mental; updateSliderDisplay('mental', LifeTracker.habits.mental); }
        updateLifeUI();
        showCosmicNotification('📱 Screen overload consequence: -1 Mental Energy', '#ef4444');
      }
    }});
  }
  if (h.exercise >= 7 && h.sleep >= 7) {
    newConsequences.push({ id:'peak_body', label:'🏆 Peak physical state — all health scores amplified', severity:'positive' });
  }
  if (h.mental <= 2) {
    newConsequences.push({ id:'mental_crisis', label:'🧠 Mental crisis approaching — hidden dark timeline risk', severity:'danger' });
    if (Math.random() < 0.3) triggerDarkTimeline();
  }

  CosmicEngine.consequences = newConsequences;
  // renderConsequences() — panel removed
}

function triggerDarkTimeline() {
  showCosmicNotification('🌑 Dark Timeline Detected — your mental orbit is collapsing', '#ef4444');
  if (GalaxyEngine) {
    GalaxyEngine.stabilityScore = Math.max(0, GalaxyEngine.stabilityScore - 10);
    updateGalaxyHUD();
    updateStabilityRing();
  }
}

function renderConsequences() {
  const el = document.getElementById('cosmicConsequences');
  if (!el) return;
  el.innerHTML = CosmicEngine.consequences.length === 0
    ? '<p class="consequence-empty">✦ No active consequences. Your timeline is stable.</p>'
    : CosmicEngine.consequences.map(c => `
        <div class="consequence-item severity-${c.severity}">
          <span>${c.label}</span>
        </div>`).join('');
}

function processDelayedEffects() {
  const now = Date.now();
  CosmicEngine.delayedEffects = CosmicEngine.delayedEffects.filter(e => {
    if (now >= e.applyAfter) { e.effect(); return false; }
    return true;
  });
}

// ── Universe Progression ───────────────────────────────────────
function updateUniverseProgression() {
  if (!window.LifeTracker) return;
  const scores = calcScores(LifeTracker.habits);
  const u = CosmicEngine.universe;

  // Completion based on overall score + stars clicked
  const starsClicked = GalaxyEngine ? GalaxyEngine.stars.filter(s => s.clicked).length : 0;
  u.completion = Math.min(100, Math.round(scores.overall * 0.6 + starsClicked * 4));

  // Level up universe
  const newLevel = Math.floor(u.completion / 20) + 1;
  if (newLevel > u.level) {
    u.level = newLevel;
    unlockNewSector(u.level);
  }

  // Unlock sectors
  const sectors = ['Alpha Quadrant','Beta Nebula','Gamma Void','Delta Horizon','Omega Realm'];
  u.sector = sectors[Math.min(u.level - 1, sectors.length - 1)];

  renderUniverseUI();
}

function unlockNewSector(level) {
  const sectors = ['Alpha Quadrant','Beta Nebula','Gamma Void','Delta Horizon','Omega Realm'];
  const newSector = sectors[Math.min(level - 1, sectors.length - 1)];
  if (!CosmicEngine.universe.unlockedSectors.includes(newSector)) {
    CosmicEngine.universe.unlockedSectors.push(newSector);
    showCosmicNotification(`🌌 New Sector Unlocked: ${newSector}!`, '#06b6d4');
    CosmicEngine.universe.secretsFound++;
  }
}

function renderUniverseUI() {
  const u = CosmicEngine.universe;
  const levelEl = document.getElementById('universeLevel');
  const sectorEl = document.getElementById('universeSector');
  const completionEl = document.getElementById('universeCompletion');
  const completionBarEl = document.getElementById('universeCompletionBar');
  const secretsEl = document.getElementById('universeSecrets');

  if (levelEl) levelEl.textContent = `Universe ${u.level}`;
  if (sectorEl) sectorEl.textContent = u.sector;
  if (completionEl) completionEl.textContent = u.completion + '%';
  if (completionBarEl) completionBarEl.style.width = u.completion + '%';
  if (secretsEl) secretsEl.textContent = u.secretsFound;
}

// ── Rare Event System v2 ───────────────────────────────────────
function triggerRareEvent() {
  const now = Date.now();
  if (now - CosmicEngine.lastRareEvent < 30000) return;

  const eligible = CosmicEngine.rareEvents.filter(e => Math.random() < e.rarity);
  if (eligible.length === 0) return;

  const ev = eligible[Math.floor(Math.random() * eligible.length)];
  CosmicEngine.lastRareEvent = now;
  CosmicEngine.eventHistory.push({ ...ev, time: new Date().toLocaleTimeString() });

  // Show cosmic notification
  showCosmicNotification(`${ev.icon} ${ev.title}: ${ev.desc}`, '#a855f7', 5000);

  // Apply effect
  switch(ev.effect) {
    case 'intelligence':
      CosmicEngine.personality.intelligence = Math.min(100, CosmicEngine.personality.intelligence + ev.delta);
      renderPersonalityUI();
      break;
    case 'stability':
      if (GalaxyEngine) {
        GalaxyEngine.stabilityScore = Math.min(100, Math.max(0, GalaxyEngine.stabilityScore + (ev.delta || 0)));
        updateGalaxyHUD(); updateStabilityRing();
      }
      break;
    case 'xp':
      if (window.LifeTracker) { LifeTracker.xp += ev.delta || 0; updateXpUI(); }
      break;
    case 'universe':
      CosmicEngine.universe.secretsFound++;
      unlockNewSector(CosmicEngine.universe.level + 1);
      renderUniverseUI();
      break;
    case 'branches':
      if (GalaxyEngine) { GalaxyEngine.timelineBranches += ev.delta || 0; updateGalaxyHUD(); }
      break;
    case 'mood':
      CosmicEngine.mood = ev.mood || 'euphoric';
      applyMoodTheme(CosmicEngine.mood);
      break;
    case 'mental_boost':
      if (window.LifeTracker) {
        LifeTracker.habits.mental = Math.min(10, LifeTracker.habits.mental + 2);
        const sl = document.getElementById('slider-mental');
        if (sl) { sl.value = LifeTracker.habits.mental; updateSliderDisplay('mental', LifeTracker.habits.mental); }
        updateLifeUI();
      }
      break;
  }

  // renderEventHistory() — panel removed
}

function renderEventHistory() {
  const el = document.getElementById('cosmicEventHistory');
  if (!el) return;
  const recent = CosmicEngine.eventHistory.slice(-5).reverse();
  el.innerHTML = recent.length === 0
    ? '<p class="consequence-empty">No cosmic events yet.</p>'
    : recent.map(e => `
        <div class="event-history-item">
          <span class="eh-icon">${e.icon}</span>
          <div>
            <span class="eh-title">${e.title}</span>
            <span class="eh-time">${e.time}</span>
          </div>
        </div>`).join('');
}

// ── Cosmic Notification ────────────────────────────────────────
function showCosmicNotification(msg, color, duration) {
  // Notifications removed by user request
}

// ── Prestige / Rebirth System ──────────────────────────────────
function triggerPrestige() {
  if (!window.LifeTracker) return;
  if (LifeTracker.level < 10) {
    showCosmicNotification('⚠️ Reach Level 10 to unlock Prestige Rebirth', '#ef4444');
    return;
  }
  CosmicEngine.universe.prestigeCount++;
  LifeTracker.xp = 0;
  LifeTracker.level = 1;
  GalaxyEngine.stabilityScore = 50;
  GalaxyEngine.timelineBranches = 7;
  CosmicEngine.universe.completion = 0;
  updateXpUI();
  updateGalaxyHUD();
  updateStabilityRing();
  renderUniverseUI();
  showCosmicNotification(`🔄 PRESTIGE ${CosmicEngine.universe.prestigeCount}! New universe cycle begins.`, '#f59e0b', 5000);
  triggerWarpFullscreen('PRESTIGE REBIRTH — A NEW UNIVERSE BEGINS');
}

function triggerWarpFullscreen(message) {
  const cin = document.getElementById('warpCinematic');
  const narr = document.getElementById('warpNarrative');
  if (!cin || !narr) return;
  narr.textContent = message;
  cin.classList.add('active');
  setTimeout(() => cin.classList.remove('active'), 3500);
}

// ── Mood Description Updater ──────────────────────────────────
function updateMoodDesc() {
  const el = document.getElementById('moodIndDesc');
  if (!el) return;
  const descs = {
    peak:     '🌟 Elite cosmic alignment — your universe is at maximum power',
    euphoric: '✨ Strong positive trajectory — keep building momentum',
    neutral:  '⚖️ Stable balance — adjust habits to reach peak state',
    warning:  '⚠️ Timeline instability detected — improve sleep or reduce screen time',
    burnout:  '🔴 Critical zone — your galaxy is collapsing. Seek recovery arc now',
  };
  el.textContent = descs[CosmicEngine.mood] || descs.neutral;
}

// ── Cosmic Panel HTML Injection ────────────────────────────────
function injectCosmicPanel() {
  const aiInsight = document.getElementById('aiInsight');
  if (!aiInsight || document.getElementById('cosmicPanel')) return;

  const panel = document.createElement('div');
  panel.id = 'cosmicPanel';
  panel.style.cssText = 'margin-top:1.5rem;';
  panel.innerHTML = `
    <div class="cosmic-panels-grid" style="grid-template-columns:1fr;">
      <!-- Personality Panel only -->
      <div class="cosmic-panel glass-card">
        <div class="cp-header">
          <span>🧬</span>
          <h4>Personality Evolution</h4>
        </div>
        <div id="cosmicPersonalityTitle" class="cp-title">The Explorer</div>
        <div id="cosmicPersonalityBadge" class="cp-badge-grid"></div>
      </div>
    </div>
  `;

  aiInsight.parentNode.insertBefore(panel, aiInsight.nextSibling);
}

// ── Init Cosmic Engine ─────────────────────────────────────────
function initCosmicEngine() {
  injectCosmicPanel();

  // Wire prestige button
  document.addEventListener('click', e => {
    if (e.target && e.target.id === 'prestigeBtn') triggerPrestige();
  });

  // Hook into LifeTracker slider updates via window.updateLifeUI
  // window.updateLifeUI is defined in the LifeTracker section — we wrap it here
  const _orig = window.updateLifeUI;
  window.updateLifeUI = function() {
    _orig && _orig();
    // Run cosmic updates after life UI updates
    updatePersonality();
    checkConsequences();
    // updateUniverseProgression() — panel removed
  };

  // Rare events every 35 seconds
  setInterval(triggerRareEvent, 35000);
  setTimeout(triggerRareEvent, 12000); // first one at 12s

  // Delayed consequence processor every 5s
  setInterval(processDelayedEffects, 5000);

  // Initial render
  renderPersonalityUI();
  // renderUniverseUI() — panel removed
  // renderConsequences() — panel removed

  // Initial personality + mood — fire immediately AND after delay to ensure DOM ready
  updateMoodEnvironment();
  updateMoodDesc();
  setTimeout(() => {
    updatePersonality();
    updateMoodEnvironment();
    updateMoodDesc();
    // updateUniverseProgression() — panel removed
  }, 800);

  // Expose to window
  window.CosmicEngine = CosmicEngine;
}

document.addEventListener('DOMContentLoaded', () => {
  // Delay slightly so initLifeTracker's DOM injections complete first
  setTimeout(() => { initCosmicEngine(); }, 200);
});

/* ════════════════════════════════════════════════════════════════
   CONTACT FORM VALIDATION
════════════════════════════════════════════════════════════════ */
function initContactForm() {
  const nameEl    = document.getElementById('contactName');
  const emailEl   = document.getElementById('contactEmail');
  const msgEl     = document.getElementById('contactMessage');
  const submitBtn = document.getElementById('contactSubmitBtn');
  const successEl = document.getElementById('form-success');
  if (!nameEl || !emailEl || !msgEl || !submitBtn) return;

  function validateField(input, errorId, rules) {
    const val = input.value.trim();
    const errEl = document.getElementById(errorId);
    for (const rule of rules) {
      if (!rule.test(val)) {
        input.classList.add('invalid'); input.classList.remove('valid');
        if (errEl) errEl.textContent = rule.msg;
        return false;
      }
    }
    input.classList.remove('invalid'); input.classList.add('valid');
    if (errEl) errEl.textContent = '';
    return true;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function validateAll() {
    const a = validateField(nameEl,  'err-name',    [
      { test: v => v.length > 0,  msg: 'Name is required.' },
      { test: v => v.length >= 2, msg: 'Name must be at least 2 characters.' },
    ]);
    const b = validateField(emailEl, 'err-email', [
      { test: v => v.length > 0,    msg: 'Email is required.' },
      { test: v => emailRegex.test(v), msg: 'Please enter a valid email (e.g. john@gmail.com).' },
    ]);
    const c = validateField(msgEl,   'err-message', [
      { test: v => v.length > 0,   msg: 'Message is required.' },
      { test: v => v.length >= 10, msg: 'Message must be at least 10 characters.' },
    ]);
    return a && b && c;
  }

  // Real-time validation on blur
  [nameEl, emailEl, msgEl].forEach(el => {
    el.addEventListener('blur', validateAll);
    el.addEventListener('input', () => {
      if (el.classList.contains('invalid')) validateAll();
    });
  });

  submitBtn.addEventListener('click', () => {
    if (!validateAll()) {
      shakeElement(submitBtn);
      return;
    }
    submitBtn.textContent = '✓ Sent!';
    submitBtn.disabled = true;
    if (successEl) successEl.style.display = 'block';
    setTimeout(() => {
      submitBtn.textContent = 'Send Message';
      submitBtn.disabled = false;
      nameEl.value = ''; emailEl.value = ''; msgEl.value = '';
      [nameEl, emailEl, msgEl].forEach(el => { el.classList.remove('valid','invalid'); });
      if (successEl) successEl.style.display = 'none';
    }, 4000);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initContactForm();
  initCompareMode();
  initHistoryPanel();
  initJourneyPanel();
  initAutoReset();
  initGuideModal();
});

/* ════════════════════════════════════════════════════════════════
   V2 FEATURES — Decision History, Battle, Life Journey,
                 Growth Analytics, Onboarding
   All features use localStorage. No existing code modified.
════════════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────────────────
   FEATURE 1 — DECISION HISTORY
────────────────────────────────────────────────────────────── */
const DH_KEY = 'die_decision_history_v1';

function loadDecisionHistory() {
  try { return JSON.parse(localStorage.getItem(DH_KEY)) || []; }
  catch(e) { return []; }
}
function saveDHToStorage(arr) {
  try { localStorage.setItem(DH_KEY, JSON.stringify(arr)); } catch(e) {}
}

function saveDecisionToHistory(decision, result) {
  const history = loadDecisionHistory();
  const r = result._full || {};
  const a = r.analysis || {};
  const fv = r.final_verdict || {};
  const entry = {
    id:             Date.now(),
    decision:       decision,
    date:           new Date().toISOString(),
    score:          a.success_probability || a.readiness_score || 0,
    confidence:     a.confidence_score || 0,
    recommendation: fv.recommendation || '—',
    outcome:        a.summary || fv.reasoning || '—',
    best_path:      result.best_path || '—',
    likely_path:    result.likely_path || '—',
    risk_path:      result.risk_path || '—',
    warning:        fv.warning || '',
    _full:          r,
  };
  history.unshift(entry);
  if (history.length > 50) history.pop();
  saveDHToStorage(history);
  renderDecisionHistory();
}

function initDecisionHistory() {
  const searchEl = document.getElementById('historySearch');
  const sortEl   = document.getElementById('historySort');
  const clearBtn = document.getElementById('historyClearAll');
  if (!searchEl) return;

  searchEl.addEventListener('input',  renderDecisionHistory);
  sortEl.addEventListener('change',   renderDecisionHistory);
  clearBtn.addEventListener('click',  () => {
    if (!confirm('Clear all decision history? This cannot be undone.')) return;
    localStorage.removeItem(DH_KEY);
    renderDecisionHistory();
    showToast('History cleared.');
  });
  renderDecisionHistory();
}

function renderDecisionHistory() {
  const grid    = document.getElementById('historyGrid');
  const emptyEl = document.getElementById('historyEmpty');
  const search  = (document.getElementById('historySearch')?.value || '').toLowerCase();
  const sort    = document.getElementById('historySort')?.value || 'newest';
  if (!grid) return;

  let history = loadDecisionHistory();

  // Filter
  if (search) history = history.filter(h => h.decision.toLowerCase().includes(search));

  // Sort
  if (sort === 'oldest')  history = [...history].reverse();
  else if (sort === 'highest') history.sort((a,b) => b.score - a.score);
  else if (sort === 'lowest')  history.sort((a,b) => a.score - b.score);

  // Clear existing cards (keep empty msg)
  [...grid.querySelectorAll('.history-card')].forEach(el => el.remove());

  if (history.length === 0) {
    if (emptyEl) emptyEl.style.display = 'flex';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  history.forEach((entry, i) => {
    const d = new Date(entry.date);
    const dateStr = d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    const timeStr = d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
    const scoreColor = entry.score >= 70 ? '#22c55e' : entry.score >= 45 ? '#eab308' : '#ef4444';
    const recColor   = entry.recommendation === 'Proceed' ? '#22c55e'
                     : entry.recommendation === 'Proceed with Caution' ? '#eab308' : '#ef4444';

    const card = document.createElement('div');
    card.className = 'history-card glass-card ext-anim';
    card.style.animationDelay = `${i * 0.05}s`;
    card.innerHTML = `
      <div class="hc-header">
        <div class="hc-meta">
          <span class="hc-date">📅 ${dateStr} · ${timeStr}</span>
          <span class="hc-rec" style="color:${recColor}">${entry.recommendation}</span>
        </div>
        <div class="hc-score" style="color:${scoreColor}">${entry.score}<span>/100</span></div>
      </div>
      <p class="hc-decision">${entry.decision}</p>
      <p class="hc-outcome">${entry.outcome}</p>
      <div class="hc-paths">
        <span class="hc-path hc-best">↑ ${entry.best_path}</span>
        <span class="hc-path hc-likely">→ ${entry.likely_path}</span>
        <span class="hc-path hc-risk">↓ ${entry.risk_path}</span>
      </div>
      ${entry.warning ? `<div class="hc-warning">⚠ ${entry.warning}</div>` : ''}
      <div class="hc-actions">
        <button class="btn btn-ghost btn-sm" onclick="replayDecision(${entry.id})">↩ Replay</button>
        <button class="btn btn-ghost btn-sm hc-delete" onclick="deleteHistoryEntry(${entry.id})">🗑 Delete</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function deleteHistoryEntry(id) {
  const history = loadDecisionHistory().filter(h => h.id !== id);
  saveDHToStorage(history);
  renderDecisionHistory();
  showToast('Entry deleted.');
}

function replayDecision(id) {
  const entry = loadDecisionHistory().find(h => h.id === id);
  if (!entry) return;
  const inputEl = document.getElementById('decisionInput');
  if (inputEl) {
    inputEl.value = entry.decision;
    document.getElementById('charCount').textContent = entry.decision.length;
    document.getElementById('simulator')?.scrollIntoView({behavior:'smooth'});
    showToast('Decision loaded — click Simulate to run again.');
  }
}

/* ──────────────────────────────────────────────────────────────
   FEATURE 2 — DECISION BATTLE
────────────────────────────────────────────────────────────── */
function initDecisionBattle() {
  const battleBtn = document.getElementById('battleBtn');
  if (!battleBtn) return;
  battleBtn.addEventListener('click', runDecisionBattle);
}

async function runDecisionBattle() {
  const aEl = document.getElementById('battleInputA');
  const bEl = document.getElementById('battleInputB');
  const loading = document.getElementById('battleLoading');
  const result  = document.getElementById('battleResult');
  if (!aEl || !bEl) return;

  const decA = aEl.value.trim();
  const decB = bEl.value.trim();

  if (!decA || !decB) { showToast('Please enter both decisions to compare.'); return; }
  if (decA.length < 5 || decB.length < 5) { showToast('Please describe each decision in more detail.'); return; }

  loading.style.display = 'flex';
  result.innerHTML = '';
  result.classList.remove('visible');

  try {
    const [resA, resB] = await Promise.all([
      fetchSimulation(decA),
      fetchSimulation(decB),
    ]);

    loading.style.display = 'none';

    if (!resA || !resB) {
      showToast('⚠ Battle simulation failed. Is the backend running?');
      return;
    }

    renderBattleResult(decA, decB, resA, resB, result);
  } catch(e) {
    loading.style.display = 'none';
    showToast('⚠ Battle simulation failed. Check backend connection.');
  }
}

async function fetchSimulation(question) {
  try {
    const payload = {
      question,
      skill: 'Intermediate',
      time:  '4 hours/day',
      money: 'Medium',
      risk:  'Medium',
    };
    const res = await fetch(`${API_BASE_URL}/api/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) return null;
    return data.result || null;
  } catch(e) { return null; }
}

function renderBattleResult(decA, decB, rA, rB, container) {
  const aA = rA.analysis || {};
  const aB = rB.analysis || {};
  const fvA = rA.final_verdict || {};
  const fvB = rB.final_verdict || {};

  const metrics = [
    { key: 'success_probability', label: 'Success Probability', icon: '🎯' },
    { key: 'opportunity_score',   label: 'Opportunity Score',   icon: '💡' },
    { key: 'readiness_score',     label: 'Readiness Score',     icon: '⚡' },
    { key: 'risk_score',          label: 'Risk Level',          icon: '⚠️', invert: true },
    { key: 'confidence_score',    label: 'Confidence Score',    icon: '💪' },
  ];

  let aWins = 0; let bWins = 0;
  const rows = metrics.map(m => {
    const vA = aA[m.key] || 0;
    const vB = aB[m.key] || 0;
    const betterA = m.invert ? vA < vB : vA > vB;
    const betterB = m.invert ? vB < vA : vB > vA;
    if (betterA) aWins++;
    if (betterB) bWins++;
    const colA = betterA ? '#22c55e' : betterB ? '#ef4444' : '#94a3b8';
    const colB = betterB ? '#22c55e' : betterA ? '#ef4444' : '#94a3b8';
    return `
      <div class="br-row">
        <span class="br-val" style="color:${colA}">${vA}${m.invert?'':''}</span>
        <span class="br-metric">${m.icon} ${m.label}</span>
        <span class="br-val" style="color:${colB}">${vB}</span>
      </div>`;
  }).join('');

  const winner  = aWins > bWins ? 'A' : bWins > aWins ? 'B' : null;
  const winnerDec = winner === 'A' ? decA : winner === 'B' ? decB : null;
  const winnerBadge = winner
    ? `<div class="br-winner-badge">🏆 Winner: <strong>${winnerDec}</strong></div>`
    : `<div class="br-winner-badge">🤝 It's a Draw</div>`;

  container.innerHTML = `
    <div class="battle-cards">
      <div class="bc-side bc-a glass-card">
        <div class="bc-label tag-a">A</div>
        <p class="bc-title">${decA}</p>
        <p class="bc-rec">${fvA.recommendation || '—'}</p>
        <p class="bc-reason">${(fvA.reasoning||'').split('.')[0]}.</p>
        <div class="bc-score">${aA.success_probability || 0}<span>/100</span></div>
        <div class="bc-wins">${aWins} metric${aWins !== 1 ? 's' : ''} won</div>
      </div>
      <div class="bc-center">
        <div class="bc-vs">VS</div>
        ${winnerBadge}
        <div class="br-metrics">${rows}</div>
      </div>
      <div class="bc-side bc-b glass-card">
        <div class="bc-label tag-b">B</div>
        <p class="bc-title">${decB}</p>
        <p class="bc-rec">${fvB.recommendation || '—'}</p>
        <p class="bc-reason">${(fvB.reasoning||'').split('.')[0]}.</p>
        <div class="bc-score">${aB.success_probability || 0}<span>/100</span></div>
        <div class="bc-wins">${bWins} metric${bWins !== 1 ? 's' : ''} won</div>
      </div>
    </div>
    <div style="text-align:center;margin-top:1.5rem">
      <button class="btn btn-ghost" onclick="document.getElementById('battleResult').innerHTML='';
        document.getElementById('battleInputA').value='';
        document.getElementById('battleInputB').value='';">
        ↩ Compare Again
      </button>
    </div>
  `;
  container.classList.add('visible');
  if (typeof gsap !== 'undefined') {
    gsap.fromTo(container, {y:30,opacity:0},{y:0,opacity:1,duration:0.6,ease:'power2.out'});
  }
}

/* ──────────────────────────────────────────────────────────────
   FEATURE 3 — ONBOARDING
────────────────────────────────────────────────────────────── */
const OB_KEY = 'die_onboarding_done_v1';

const OB_STEPS = [
  {
    icon: '🚀',
    title: 'Welcome to Decision Intelligence Engine',
    desc: 'An AI-powered system that simulates the future of any decision you face — mapping every possible outcome before you live it.',
  },
  {
    icon: '🧮',
    title: 'Decision Simulator',
    desc: 'Type any life decision and our AI analyzes thousands of parallel outcomes, giving you Best Path, Most Likely, and Risk Path scenarios.',
  },
  {
    icon: '📊',
    title: 'Life Tracker',
    desc: 'Track your daily habits — sleep, study, exercise, productivity and more. Watch your life score update in real time as you adjust.',
  },
  {
    icon: '🌌',
    title: 'Galaxy Map',
    desc: 'Visualize your habits as a galaxy. Each star represents a life area. Click any star to see how it impacts your overall trajectory.',
  },
  {
    icon: '📋',
    title: 'Decision History',
    desc: 'Every simulation you run is saved automatically. Search, filter, and replay any past decision to track how your thinking evolves.',
  },
  {
    icon: '⚔️',
    title: 'Decision Battle',
    desc: 'Can\'t choose between two options? Enter both and let the AI run a head-to-head battle simulation with a clear winner declared.',
  },
  {
    icon: '🌟',
    title: 'Ready to Begin Your Journey',
    desc: 'Your cosmic dashboard is ready. Every decision you simulate brings you closer to clarity. Start with a real decision you\'re facing right now.',
    isLast: true,
  },
];

function initOnboarding() {
  if (localStorage.getItem(OB_KEY)) return;
  const overlay = document.getElementById('onboardingOverlay');
  if (!overlay) return;

  let current = 0;

  function render() {
    const step = OB_STEPS[current];
    const stepsEl = document.getElementById('obSteps');
    const dotsEl  = document.getElementById('obDots');
    const nextBtn = document.getElementById('obNext');
    const prevBtn = document.getElementById('obPrev');

    stepsEl.innerHTML = `
      <div class="ob-step ext-anim">
        <div class="ob-icon">${step.icon}</div>
        <h2 class="ob-title">${step.title}</h2>
        <p class="ob-desc">${step.desc}</p>
        <div class="ob-progress">${current + 1} of ${OB_STEPS.length}</div>
      </div>
    `;
    dotsEl.innerHTML = OB_STEPS.map((_, i) =>
      `<span class="ob-dot ${i === current ? 'ob-dot-active' : ''}"></span>`
    ).join('');

    nextBtn.textContent = step.isLast ? '🚀 Launch My Journey' : 'Next →';
    prevBtn.style.visibility = current === 0 ? 'hidden' : 'visible';
  }

  function close() {
    localStorage.setItem(OB_KEY, '1');
    overlay.hidden = true;
  }

  document.getElementById('obNext').addEventListener('click', () => {
    if (current >= OB_STEPS.length - 1) { close(); return; }
    current++;
    render();
  });
  document.getElementById('obPrev').addEventListener('click', () => {
    if (current > 0) { current--; render(); }
  });
  document.getElementById('obSkip').addEventListener('click', close);

  overlay.hidden = false;
  render();
}

/* ──────────────────────────────────────────────────────────────
   FEATURE 4 — LIFE JOURNEY (Life Tracker History)
────────────────────────────────────────────────────────────── */
const LJ_KEY = 'die_life_journey_v1';

function saveLifeJourneySnapshot(scores) {
  try {
    const data = JSON.parse(localStorage.getItem(LJ_KEY)) || [];
    const overall = Math.round(
      (scores.health + scores.focus + scores.productivity +
       scores.happiness + scores.discipline + scores.mental) / 6
    );
    data.unshift({
      date:         new Date().toISOString(),
      health:       scores.health,
      focus:        scores.focus,
      productivity: scores.productivity,
      happiness:    scores.happiness,
      discipline:   scores.discipline,
      mental:       scores.mental,
      overall,
    });
    if (data.length > 100) data.pop();
    localStorage.setItem(LJ_KEY, JSON.stringify(data));
    renderLifeJourney();
    renderGrowthAnalytics();
  } catch(e) {}
}

function initLifeJourney() {
  const clearBtn = document.getElementById('journeyClearAll');
  if (clearBtn) clearBtn.addEventListener('click', () => {
    if (!confirm('Clear all life journey history?')) return;
    localStorage.removeItem(LJ_KEY);
    renderLifeJourney();
    renderGrowthAnalytics();
    showToast('Life Journey cleared.');
  });

  document.querySelectorAll('.jf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.jf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderLifeJourney(btn.dataset.filter);
    });
  });
  renderLifeJourney();
}

function renderLifeJourney(filter = 'all') {
  const grid = document.getElementById('journeyGrid');
  if (!grid) return;

  let data = [];
  try { data = JSON.parse(localStorage.getItem(LJ_KEY)) || []; } catch(e) {}

  // Filter
  if (filter === 'week') {
    const cutoff = Date.now() - 7 * 24 * 3600 * 1000;
    data = data.filter(d => new Date(d.date).getTime() > cutoff);
  } else if (filter === 'month') {
    const cutoff = Date.now() - 30 * 24 * 3600 * 1000;
    data = data.filter(d => new Date(d.date).getTime() > cutoff);
  }

  grid.innerHTML = '';

  if (data.length === 0) {
    grid.innerHTML = `<div class="history-empty"><span class="he-icon">📈</span><p>No snapshots yet. Save your Life Tracker to begin.</p></div>`;
    return;
  }

  data.forEach((snap, i) => {
    const d = new Date(snap.date);
    const dateStr = d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
    const timeStr = d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
    const col = snap.overall >= 70 ? '#22c55e' : snap.overall >= 45 ? '#eab308' : '#ef4444';

    const card = document.createElement('div');
    card.className = 'journey-card glass-card ext-anim';
    card.style.animationDelay = `${i * 0.04}s`;
    card.innerHTML = `
      <div class="jc-header">
        <span class="jc-date">📅 ${dateStr} · ${timeStr}</span>
        <span class="jc-score" style="color:${col}">${snap.overall}/100</span>
      </div>
      <div class="jc-bars">
        ${['health','focus','productivity','happiness','discipline','mental'].map(k => `
          <div class="jc-bar-row">
            <span class="jc-bar-label">${k.charAt(0).toUpperCase()+k.slice(1)}</span>
            <div class="jc-bar-track"><div class="jc-bar-fill" style="width:${snap[k]}%;background:var(--purple-light)"></div></div>
            <span class="jc-bar-val">${snap[k]}</span>
          </div>`).join('')}
      </div>
    `;
    grid.appendChild(card);
  });
}

/* ──────────────────────────────────────────────────────────────
   FEATURE 5 — GROWTH ANALYTICS
────────────────────────────────────────────────────────────── */
let analyticsChartInstance = null;

function initGrowthAnalytics() {
  const metricSel = document.getElementById('analyticsMetric');
  if (metricSel) metricSel.addEventListener('change', renderGrowthAnalytics);
  renderGrowthAnalytics();
}

function renderGrowthAnalytics() {
  let data = [];
  try { data = JSON.parse(localStorage.getItem(LJ_KEY)) || []; } catch(e) {}

  renderAnalyticsSummary(data);
  renderAnalyticsChart(data);
  renderAnalyticsRecords(data);
}

function renderAnalyticsSummary(data) {
  const el = document.getElementById('analyticsSummary');
  if (!el) return;

  if (data.length === 0) {
    el.innerHTML = '';
    return;
  }

  const scores    = data.map(d => d.overall);
  const highest   = Math.max(...scores);
  const current   = scores[0];
  const average   = Math.round(scores.reduce((a,b)=>a+b,0) / scores.length);
  const improve   = scores.length > 1 ? current - scores[scores.length - 1] : 0;
  const cats      = ['health','focus','productivity','happiness','discipline','mental'];
  const avgCat    = k => Math.round(data.reduce((s,d)=>s+(d[k]||0),0)/data.length);
  const catAvgs   = cats.map(k => ({k, v: avgCat(k)}));
  const best      = catAvgs.reduce((a,b)=>b.v>a.v?b:a);
  const weakest   = catAvgs.reduce((a,b)=>b.v<a.v?b:a);

  const cards = [
    { icon:'🏆', label:'Highest Score',   val: highest,   color:'#22c55e' },
    { icon:'📍', label:'Current Score',   val: current,   color:'#60a5fa' },
    { icon:'📊', label:'Average Score',   val: average,   color:'#a855f7' },
    { icon:'📈', label:'Improvement',     val: (improve>=0?'+':'')+improve, color: improve>=0?'#22c55e':'#ef4444' },
    { icon:'⭐', label:'Best Category',   val: best.k,    color:'#f59e0b' },
    { icon:'⚠️', label:'Weakest Area',    val: weakest.k, color:'#ef4444' },
  ];

  el.innerHTML = `<div class="analytics-cards">${
    cards.map(c => `
      <div class="ac-card glass-card">
        <span class="ac-icon">${c.icon}</span>
        <span class="ac-label">${c.label}</span>
        <span class="ac-val" style="color:${c.color}">${c.val}</span>
      </div>`).join('')
  }</div>`;
}

function renderAnalyticsChart(data) {
  const canvas  = document.getElementById('analyticsChart');
  const emptyEl = document.getElementById('analyticsEmpty');
  const metricEl= document.getElementById('analyticsMetric');
  if (!canvas) return;

  if (data.length < 2) {
    canvas.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'flex';
    return;
  }
  canvas.style.display = 'block';
  if (emptyEl) emptyEl.style.display = 'none';

  const metric = metricEl?.value || 'overall';
  const labels = data.map(d => {
    const dt = new Date(d.date);
    return dt.toLocaleDateString('en-US',{month:'short',day:'numeric'});
  }).reverse();
  const values = data.map(d => d[metric] || 0).reverse();

  if (analyticsChartInstance) analyticsChartInstance.destroy();
  analyticsChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: metric.charAt(0).toUpperCase() + metric.slice(1),
        data: values,
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168,85,247,0.12)',
        borderWidth: 2,
        pointBackgroundColor: '#a855f7',
        pointRadius: 4,
        fill: true,
        tension: 0.4,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color:'#64748b', font:{size:10} }, grid: { color:'rgba(255,255,255,0.04)' } },
        y: { min:0, max:100, ticks: { color:'#64748b', font:{size:10} }, grid: { color:'rgba(255,255,255,0.06)' } },
      },
    },
  });
}

function renderAnalyticsRecords(data) {
  const el = document.getElementById('analyticsRecords');
  if (!el) return;
  if (data.length === 0) { el.innerHTML = ''; return; }

  const cats = ['health','focus','productivity','happiness','discipline','mental','overall'];
  const records = cats.map(k => {
    const vals = data.map(d => d[k] || 0);
    return { k, best: Math.max(...vals), avg: Math.round(vals.reduce((a,b)=>a+b,0)/vals.length) };
  });

  // Streak calc
  let streak = 0;
  const sorted = [...data].sort((a,b) => new Date(b.date)-new Date(a.date));
  let prev = null;
  for (const snap of sorted) {
    const d = new Date(snap.date);
    d.setHours(0,0,0,0);
    if (!prev) { streak = 1; prev = d; continue; }
    const diff = (prev - d) / (1000*3600*24);
    if (diff <= 1.5) { streak++; prev = d; }
    else break;
  }

  el.innerHTML = `
    <div class="ar-header">
      <h3 class="ar-title">📊 Personal Records</h3>
      <span class="ar-streak">🔥 ${streak}-day streak</span>
    </div>
    <div class="ar-grid">
      ${records.map(r => `
        <div class="ar-item">
          <span class="ar-cat">${r.k.charAt(0).toUpperCase()+r.k.slice(1)}</span>
          <div class="ar-scores">
            <span class="ar-best">Best: <strong>${r.best}</strong></span>
            <span class="ar-avg">Avg: ${r.avg}</span>
          </div>
        </div>`).join('')}
    </div>
  `;
}

/* ════════════════════════════════════════════════════════════════
   V3 INLINE FEATURES
   Compare Mode · History Panel · Journey Panel · Auto Reset
   All inline — no page navigation
════════════════════════════════════════════════════════════════ */

/* ── FEATURE 1: COMPARE MODE ─────────────────────────────────── */
function initCompareMode() {
  const compareBtn   = document.getElementById('compareBtn');
  const exitBtn      = document.getElementById('compareExitBtn');
  const runBtn       = document.getElementById('runCompareBtn');
  const panel        = document.getElementById('compareModePanel');
  const normalInput  = document.getElementById('decisionInput');
  const simFooter    = document.querySelector('.sim-footer');
  const simBtn       = document.getElementById('simulateBtn');
  if (!compareBtn || !panel) return;

  function enterCompare() {
    normalInput.style.display = 'none';
    panel.style.display = 'block';
    simBtn.style.display = 'none';
    compareBtn.style.display = 'none';
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(panel, { opacity:0, y:10 }, { opacity:1, y:0, duration:0.35 });
    }
  }

  function exitCompare() {
    normalInput.style.display = '';
    panel.style.display = 'none';
    simBtn.style.display = '';
    compareBtn.style.display = '';
    document.getElementById('cmpResultOverlay').style.display = 'none';
    document.getElementById('cmpInputA').value = '';
    document.getElementById('cmpInputB').value = '';
  }

  compareBtn.addEventListener('click', enterCompare);
  exitBtn.addEventListener('click', exitCompare);

  runBtn.addEventListener('click', async () => {
    const decA = document.getElementById('cmpInputA').value.trim();
    const decB = document.getElementById('cmpInputB').value.trim();
    if (!decA || !decB) { showToast('Please enter both decisions.'); return; }
    if (decA.length < 5 || decB.length < 5) { showToast('Describe each decision in more detail.'); return; }

    runBtn.disabled = true;
    runBtn.textContent = '⏳ Simulating…';

    try {
      // const [rA, rB] = await Promise.all([fetchSimulation(decA), fetchSimulation(decB)]);
      const rA = await fetchSimulation(decA);
      const rB = await fetchSimulation(decB);
      if (!rA || !rB) { showToast('⚠ Simulation failed. Is backend running?'); return; }
      showCompareResult(decA, decB, rA, rB);
    } catch(e) {
      showToast('⚠ Compare failed. Check backend connection.');
    } finally {
      runBtn.disabled = false;
      runBtn.textContent = '⚔ Run Comparison';
    }
  });
}

function showCompareResult(decA, decB, rA, rB) {
  const overlay = document.getElementById('cmpResultOverlay');
  const inner   = document.getElementById('cmpResultInner');
  if (!overlay || !inner) return;

  const aA = rA.analysis || {};
  const aB = rB.analysis || {};
  const fvA = rA.final_verdict || {};
  const fvB = rB.final_verdict || {};

  const metrics = [
    { key:'success_probability', label:'Success Prob.',   icon:'🎯', invert:false },
    { key:'opportunity_score',   label:'Opportunity',     icon:'💡', invert:false },
    { key:'readiness_score',     label:'Readiness',       icon:'⚡', invert:false },
    { key:'risk_score',          label:'Risk Level',      icon:'⚠️', invert:true  },
    { key:'confidence_score',    label:'Confidence',      icon:'💪', invert:false },
  ];

  let aW = 0, bW = 0;
  const rows = metrics.map(m => {
    const vA = aA[m.key] || 0, vB = aB[m.key] || 0;
    const wA = m.invert ? vA < vB : vA > vB;
    const wB = m.invert ? vB < vA : vB > vA;
    if (wA) aW++; if (wB) bW++;
    const cA = wA ? '#22c55e' : wB ? '#ef4444' : '#94a3b8';
    const cB = wB ? '#22c55e' : wA ? '#ef4444' : '#94a3b8';
    return `<div class="cmp-row">
      <span class="cmp-rv" style="color:${cA}">${vA}</span>
      <span class="cmp-rm">${m.icon} ${m.label}</span>
      <span class="cmp-rv" style="color:${cB}">${vB}</span>
    </div>`;
  }).join('');

  const winner = aW > bW ? decA : bW > aW ? decB : null;
  const badge  = winner
    ? `<div class="cmp-winner-badge">🏆 ${winner}</div>`
    : `<div class="cmp-winner-badge">🤝 Draw</div>`;

  inner.innerHTML = `
    <div class="cmp-res-header">
      <span class="cmp-res-title">⚔ Battle Result</span>
      <button class="sp-close" onclick="document.getElementById('cmpResultOverlay').style.display='none'">✕</button>
    </div>
    ${badge}
    <div class="cmp-sides">
      <div class="cmp-side cmp-side-a">
        <span class="cmp-tag cmp-tag-a">A</span>
        <p class="cmp-side-title">${decA}</p>
        <div class="cmp-big-score" style="color:${aW>=bW?'#22c55e':'#ef4444'}">${aA.success_probability||0}</div>
        <p class="cmp-side-rec">${fvA.recommendation||'—'}</p>
        <p class="cmp-side-wins">${aW} wins</p>
      </div>
      <div class="cmp-metrics">${rows}</div>
      <div class="cmp-side cmp-side-b">
        <span class="cmp-tag cmp-tag-b">B</span>
        <p class="cmp-side-title">${decB}</p>
        <div class="cmp-big-score" style="color:${bW>aW?'#22c55e':'#ef4444'}">${aB.success_probability||0}</div>
        <p class="cmp-side-rec">${fvB.recommendation||'—'}</p>
        <p class="cmp-side-wins">${bW} wins</p>
      </div>
    </div>
    <div style="text-align:center;margin-top:1.25rem">
      <button class="btn btn-ghost btn-sm" onclick="
        document.getElementById('cmpInputA').value='';
        document.getElementById('cmpInputB').value='';
        document.getElementById('cmpResultOverlay').style.display='none';
      ">↩ Compare Again</button>
    </div>
  `;
  overlay.style.display = 'flex';
  if (typeof gsap !== 'undefined') {
    gsap.fromTo(inner, { y:30, opacity:0 }, { y:0, opacity:1, duration:0.45, ease:'power2.out' });
  }
}

/* ── FEATURE 2 & 3: SLIDE PANEL HELPER ───────────────────────── */
function openSlidePanel(modalId, backdropId, renderFn) {
  const modal    = document.getElementById(modalId);
  const backdrop = document.getElementById(backdropId);
  if (!modal) return;

  modal.classList.add('sp-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (renderFn) renderFn();

  backdrop?.addEventListener('click', () => closeSlidePanel(modalId, backdropId), { once:true });
  const closeBtn = modal.querySelector('.sp-close');
  if (closeBtn) closeBtn.onclick = () => closeSlidePanel(modalId, backdropId);
}

function closeSlidePanel(modalId, backdropId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('sp-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* ── FEATURE 3: HISTORY PANEL ────────────────────────────────── */
function initHistoryPanel() {
  const btn = document.getElementById('historyPanelBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    openSlidePanel('historyModal', 'historyBackdrop', renderHistoryPanel);
  });
  document.getElementById('historyModalSearch')?.addEventListener('input', renderHistoryPanel);
  document.getElementById('historyModalSort')?.addEventListener('change', renderHistoryPanel);
  document.getElementById('historyModalClose')?.addEventListener('click', () => closeSlidePanel('historyModal','historyBackdrop'));
  document.getElementById('historyModalClear')?.addEventListener('click', () => {
    if (!confirm('Clear all decision history?')) return;
    localStorage.removeItem(DH_KEY);
    renderHistoryPanel();
    showToast('History cleared.');
  });
}

function renderHistoryPanel() {
  const body   = document.getElementById('historyModalBody');
  const search = document.getElementById('historyModalSearch')?.value.toLowerCase() || '';
  const sort   = document.getElementById('historyModalSort')?.value || 'newest';
  if (!body) return;

  let history = loadDecisionHistory();
  if (search) history = history.filter(h => h.decision.toLowerCase().includes(search));
  if (sort === 'oldest')  history = [...history].reverse();
  else if (sort === 'highest') history.sort((a,b) => b.score - a.score);
  else if (sort === 'lowest')  history.sort((a,b) => a.score - b.score);

  if (!history.length) {
    body.innerHTML = '<div class="sp-empty"><span>🌌</span><p>No simulations yet. Run your first decision above.</p></div>';
    return;
  }

  body.innerHTML = history.map(entry => {
    const d = new Date(entry.date);
    const ds = d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
    const ts = d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
    const sc = entry.score >= 70 ? '#22c55e' : entry.score >= 45 ? '#eab308' : '#ef4444';
    const rc = entry.recommendation === 'Proceed' ? '#22c55e'
             : entry.recommendation === 'Proceed with Caution' ? '#eab308' : '#ef4444';
    return `
    <div class="sp-history-card">
      <div class="sphc-top">
        <div>
          <div class="sphc-date">📅 ${ds} · ${ts}</div>
          <div class="sphc-rec" style="color:${rc}">${entry.recommendation}</div>
        </div>
        <div class="sphc-score" style="color:${sc}">${entry.score}<span>/100</span></div>
      </div>
      <p class="sphc-decision">${entry.decision}</p>
      <p class="sphc-outcome">${entry.outcome}</p>
      <div class="sphc-actions">
        <button class="btn btn-ghost btn-sm" onclick="replayFromPanel(${entry.id})">↩ Replay</button>
        <button class="btn btn-ghost btn-sm sphc-del" onclick="deleteFromPanel(${entry.id})">🗑 Delete</button>
      </div>
    </div>`;
  }).join('');
}

function replayFromPanel(id) {
  closeSlidePanel('historyModal','historyBackdrop');
  replayDecision(id);
}
function deleteFromPanel(id) {
  deleteHistoryEntry(id);
  renderHistoryPanel();
}

/* ── FEATURE 2: JOURNEY PANEL ────────────────────────────────── */
function initJourneyPanel() {
  const btn = document.getElementById('journeyPanelBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    openSlidePanel('journeyModal', 'journeyBackdrop', () => renderJourneyPanel('all'));
  });
  document.getElementById('journeyModalClose')?.addEventListener('click', () => closeSlidePanel('journeyModal','journeyBackdrop'));
  document.getElementById('journeyModalClear')?.addEventListener('click', () => {
    if (!confirm('Clear all life journey history?')) return;
    localStorage.removeItem(LJ_KEY);
    renderJourneyPanel('all');
    showToast('Life Journey cleared.');
  });
  document.querySelectorAll('#journeyModal .jf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#journeyModal .jf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderJourneyPanel(btn.dataset.filter);
    });
  });
}

function renderJourneyPanel(filter='all') {
  const body = document.getElementById('journeyModalBody');
  if (!body) return;

  let data = [];
  try { data = JSON.parse(localStorage.getItem(LJ_KEY)) || []; } catch(e) {}

  if (filter === 'week') {
    const cut = Date.now() - 7*24*3600*1000;
    data = data.filter(d => new Date(d.date).getTime() > cut);
  } else if (filter === 'month') {
    const cut = Date.now() - 30*24*3600*1000;
    data = data.filter(d => new Date(d.date).getTime() > cut);
  }

  if (!data.length) {
    body.innerHTML = '<div class="sp-empty"><span>📈</span><p>No snapshots yet. Save your Life Tracker to begin.</p></div>';
    return;
  }

  body.innerHTML = data.map(snap => {
    const d   = new Date(snap.date);
    const ds  = d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
    const ts  = d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
    const col = snap.overall >= 70 ? '#22c55e' : snap.overall >= 45 ? '#eab308' : '#ef4444';
    const bars = ['health','focus','productivity','happiness','discipline','mental'].map(k => `
      <div class="jc-bar-row">
        <span class="jc-bar-label">${k.charAt(0).toUpperCase()+k.slice(1)}</span>
        <div class="jc-bar-track"><div class="jc-bar-fill" style="width:${snap[k]}%;background:var(--purple-light)"></div></div>
        <span class="jc-bar-val">${snap[k]}</span>
      </div>`).join('');
    return `
    <div class="sp-journey-card">
      <div class="jc-header">
        <span class="jc-date">📅 ${ds} · ${ts}</span>
        <span class="jc-score" style="color:${col}">${snap.overall}/100</span>
      </div>
      <div class="jc-bars">${bars}</div>
    </div>`;
  }).join('');
}

/* ── FEATURE 4: AUTO RESET ───────────────────────────────────── */
function initAutoReset() {
  const output    = document.getElementById('simOutput');
  const input     = document.getElementById('decisionInput');
  const charCount = document.getElementById('charCount');
  const simSection= document.getElementById('simulator');
  if (!output || !input) return;

  // IDs of elements that should NOT trigger a reset when clicked
  const SAFE_IDS = [
    'simOutput','resetBtn','saveBtn','historyPanelBtn','compareBtn',
    'historyModal','historyBackdrop','journeyModal','journeyBackdrop',
    'guideOverlay','cmpResultOverlay','onboardingOverlay',
  ];

  function isInsideSafeZone(el) {
    if (!el) return false;
    // Inside the simulator section
    if (simSection && simSection.contains(el)) return true;
    // Inside any of the safe overlay elements
    for (const id of SAFE_IDS) {
      const safeEl = document.getElementById(id);
      if (safeEl && safeEl.contains(el)) return true;
    }
    // Inside any slide-panel or modal overlay
    if (el.closest('.slide-panel, .guide-overlay, .onboarding-overlay, .cmp-result-overlay')) return true;
    return false;
  }

  function doAutoReset() {
    if (!output.classList.contains('visible')) return;
    // Fade out result then clear state
    if (typeof gsap !== 'undefined') {
      gsap.to(output, {
        opacity: 0, y: 16, duration: 0.4,
        onComplete: () => {
          output.classList.remove('visible');
          output.style.cssText = '';
          input.value = '';
          input.style.cssText = '';
          if (charCount) {
            charCount.textContent = '0';
            charCount.style.color = '';
          }
          // Restore sim box if it was faded
          const simBox = input.closest('.sim-box');
          if (simBox) {
            simBox.style.opacity = '';
            simBox.style.pointerEvents = '';
          }
        }
      });
    } else {
      output.classList.remove('visible');
      output.style.cssText = '';
      input.value = '';
      if (charCount) { charCount.textContent = '0'; charCount.style.color = ''; }
    }
  }

  // Click outside: immediate reset (no delay — that was the bug)
  document.addEventListener('click', (e) => {
    if (!output.classList.contains('visible')) return;
    if (isInsideSafeZone(e.target)) return;
    // Small timeout so button clicks inside sim still register before reset
    setTimeout(doAutoReset, 150);
  });

  // Touch outside (mobile): same logic
  document.addEventListener('touchstart', (e) => {
    if (!output.classList.contains('visible')) return;
    if (isInsideSafeZone(e.target)) return;
    setTimeout(doAutoReset, 150);
  }, { passive: true });

  // Nav link clicks: reset immediately with short delay for scroll animation
  document.querySelectorAll('.nav-link, .nav-mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      if (output.classList.contains('visible')) setTimeout(doAutoReset, 300);
    });
  });
}

/* ════════════════════════════════════════════════════════════════
   HOW TO USE GUIDE MODAL
════════════════════════════════════════════════════════════════ */
function initGuideModal() {
  const overlay    = document.getElementById('guideOverlay');
  const closeBtn   = document.getElementById('guideClose');
  const closeBot   = document.getElementById('guideCloseBottom');
  const navBtn     = document.getElementById('guideNavBtn');
  const mobileBtn  = document.getElementById('guideMobileBtn');
  const tabs       = document.querySelectorAll('.guide-tab');
  const panels     = document.querySelectorAll('.guide-panel');
  if (!overlay) return;

  function openGuide() {
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    if (typeof gsap !== 'undefined') {
      gsap.fromTo('.guide-modal',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
    }
  }

  function closeGuide() {
    overlay.hidden = true;
    document.body.style.overflow = '';
  }

  navBtn?.addEventListener('click', openGuide);
  mobileBtn?.addEventListener('click', openGuide);
  closeBtn?.addEventListener('click', closeGuide);
  closeBot?.addEventListener('click', closeGuide);

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeGuide();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) closeGuide();
  });

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.querySelector(`.guide-panel[data-panel="${tab.dataset.tab}"]`);
      if (target) target.classList.add('active');
    });
  });
}
