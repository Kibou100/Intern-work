/* ============================================================
   MONAL TECH — script.js
   Features: header scroll, mobile nav, reveal on scroll,
             radar blips, counter animation, testimonial
             slider, marquee duplication, form validation,
             year update, threat counter
   ============================================================ */

'use strict';

/* ── UTILITIES ─────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── DOM READY ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initYear();
  initHeader();
  initMobileNav();
  initReveal();
  initRadar();
  initCounters();
  initTestimonialSlider();
  initMarquee();
  initContactForm();
  initLoginForm();
  initThreatCounter();
});

/* ─────────────────────────────────────────────────────────────
   YEAR
───────────────────────────────────────────────────────────── */
function initYear() {
  const el = $('#year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ─────────────────────────────────────────────────────────────
   HEADER — shrink + colour on scroll
───────────────────────────────────────────────────────────── */
function initHeader() {
  const header = $('#header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ─────────────────────────────────────────────────────────────
   MOBILE NAV
───────────────────────────────────────────────────────────── */
function initMobileNav() {
  const toggle = $('#navToggle');
  const nav    = $('#nav');
  if (!toggle || !nav) return;

  const close = () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };
  const open = () => {
    nav.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  toggle.addEventListener('click', () => {
    nav.classList.contains('open') ? close() : open();
  });

  // Close on nav-link click
  $$('.nav__link', nav).forEach(link => link.addEventListener('click', close));

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
}

/* ─────────────────────────────────────────────────────────────
   REVEAL ON SCROLL
───────────────────────────────────────────────────────────── */
function initReveal() {
  const els = $$('.reveal');
  if (!els.length) return;

  // Stagger siblings inside the same parent
  const parents = new Map();
  els.forEach(el => {
    const key = el.parentElement;
    if (!parents.has(key)) parents.set(key, []);
    parents.get(key).push(el);
  });
  parents.forEach(children => {
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.09}s`;
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────────────────────────
   RADAR BLIPS
───────────────────────────────────────────────────────────── */
function initRadar() {
  const blipContainer = $('#radarBlips');
  if (!blipContainer) return;

  let blipCount = 0;

  function spawnBlip() {
    // Random polar coords (keep inside the circle)
    const angle  = Math.random() * Math.PI * 2;
    const radius = Math.random() * 46 + 4; // 4–50% from centre
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);

    // ~20% chance it's a "threat" blip
    const isThreat = Math.random() < 0.2;

    const blip = document.createElement('div');
    blip.className = `radar__blip ${isThreat ? 'radar__blip--threat' : 'radar__blip--safe'}`;
    blip.style.left = `${x}%`;
    blip.style.top  = `${y}%`;

    blipContainer.appendChild(blip);
    blipCount++;

    // Remove after animation
    blip.addEventListener('animationend', () => blip.remove(), { once: true });
  }

  // Spawn a blip roughly every rotation pass (sweep = 3s)
  setInterval(spawnBlip, 750);

  // Initial burst
  for (let i = 0; i < 3; i++) {
    setTimeout(spawnBlip, i * 200);
  }
}

/* ─────────────────────────────────────────────────────────────
   THREAT COUNTER (increments alongside radar blips)
───────────────────────────────────────────────────────────── */
function initThreatCounter() {
  const el = $('#threatCounter');
  if (!el) return;

  let count = 0;

  function pad(n) {
    return String(n).padStart(3, '0');
  }

  // Increment randomly — feels live
  function tick() {
    const delta = Math.floor(Math.random() * 3);
    count += delta;
    el.textContent = pad(count);
    setTimeout(tick, 600 + Math.random() * 1200);
  }
  tick();
}

/* ─────────────────────────────────────────────────────────────
   COUNTERS (hero stats)
───────────────────────────────────────────────────────────── */
function initCounters() {
  const els = $$('.js-count');
  if (!els.length) return;

  function animateCount(el) {
    const target   = parseInt(el.dataset.count, 10);
    const duration = 1600; // ms
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const ease     = 1 - (1 - progress) * (1 - progress);
      el.textContent = Math.round(ease * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  els.forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────────────────────────
   TESTIMONIAL SLIDER
───────────────────────────────────────────────────────────── */
function initTestimonialSlider() {
  const track    = $('#testimonialTrack');
  const prevBtn  = $('#prevBtn');
  const nextBtn  = $('#nextBtn');
  const dotsWrap = $('#sliderDots');
  if (!track || !prevBtn || !nextBtn || !dotsWrap) return;

  const slides = $$('.testimonial', track);
  let current  = 0;
  let autoTimer;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function goTo(idx) {
    current = (idx + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    $$('.slider-dot', dotsWrap).forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  nextBtn.addEventListener('click', () => { next(); resetAuto(); });
  prevBtn.addEventListener('click', () => { prev(); resetAuto(); });

  // Keyboard navigation when slider has focus
  track.parentElement.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { next(); resetAuto(); }
    if (e.key === 'ArrowLeft')  { prev(); resetAuto(); }
  });

  // Touch / swipe support
  let touchStartX = null;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  track.addEventListener('touchend', e => {
    if (touchStartX === null) return;
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) { delta > 0 ? next() : prev(); resetAuto(); }
    touchStartX = null;
  }, { passive: true });

  // Auto-advance
  function startAuto() {
    autoTimer = setInterval(next, 5000);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }
  startAuto();

  // Pause on hover / focus
  track.parentElement.addEventListener('mouseenter', () => clearInterval(autoTimer));
  track.parentElement.addEventListener('mouseleave', startAuto);
}

/* ─────────────────────────────────────────────────────────────
   MARQUEE — duplicate items for seamless scroll
───────────────────────────────────────────────────────────── */
function initMarquee() {
  const track = $('#marqueeTrack');
  if (!track) return;

  // Clone the existing items so the animation loops seamlessly
  const clone = track.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  track.parentElement.appendChild(clone);
}

/* ─────────────────────────────────────────────────────────────
   LOGIN FORM — client-side validation
───────────────────────────────────────────────────────────── */
function initLoginForm() {
  const form   = $('#loginForm');
  const status = $('#loginStatus');
  if (!form || !status) return;

  const existingToken = window.localStorage.getItem('mt-admin-token');
  if (existingToken) {
    window.location.href = '/dashboard.html';
    return;
  }

  const rules = {
    email:    { required: true, isEmail: true, label: 'Email' },
    password: { required: true, minLength: 8, label: 'Password' },
  };

  function getError(name, value) {
    const rule = rules[name];
    if (!rule) return '';
    if (rule.required && !value.trim()) return `${rule.label} is required.`;
    if (rule.minLength && value.trim().length < rule.minLength)
      return `${rule.label} must be at least ${rule.minLength} characters.`;
    if (rule.isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return 'Please enter a valid email address.';
    return '';
  }

  function validate(name, value) {
    const field    = form.elements[name];
    const errorEl  = $(`[data-error-for="${name}"]`, form);
    const errorMsg = getError(name, value);
    if (errorEl) errorEl.textContent = errorMsg;
    field.classList.toggle('error', !!errorMsg);
    return !errorMsg;
  }

  function validateAll() {
    return Object.keys(rules).map(name =>
      validate(name, (form.elements[name] || {}).value || '')
    ).every(Boolean);
  }

  Object.keys(rules).forEach(name => {
    const field = form.elements[name];
    if (!field) return;
    field.addEventListener('blur', () => validate(name, field.value));
    field.addEventListener('input', () => {
      if (field.classList.contains('error')) validate(name, field.value);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      status.className = 'form-status error-msg';
      status.textContent = 'Please fix the highlighted fields.';
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Signing in…';
    status.className = 'form-status';
    status.textContent = '';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          email: form.elements.email.value.trim(),
          password: form.elements.password.value.trim(),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        status.className = 'form-status error-msg';
        status.textContent = result.message || 'Invalid credentials.';
        btn.disabled = false;
        btn.innerHTML = `Sign in
          <svg class="btn__icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        return;
      }

      window.localStorage.setItem('mt-admin-token', result.token);
      status.className = 'form-status success';
      status.textContent = 'Welcome back. Redirecting…';
      setTimeout(() => { window.location.href = result.redirect || '/dashboard.html'; }, 900);
    } catch (error) {
      status.className = 'form-status error-msg';
      status.textContent = 'Unable to connect. Please try again.';
      btn.disabled = false;
      btn.innerHTML = `Sign in
        <svg class="btn__icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }
  });
}

/* ─────────────────────────────────────────────────────────────
   CONTACT FORM — client-side validation
───────────────────────────────────────────────────────────── */
function initContactForm() {
  const form   = $('#contactForm');
  const status = $('#formStatus');
  if (!form || !status) return;

  const rules = {
    name:    { required: true, minLength: 2,  label: 'Name' },
    email:   { required: true, isEmail: true, label: 'Email' },
    message: { required: true, minLength: 10, label: 'Message' },
  };

  function getError(name, value) {
    const rule = rules[name];
    if (!rule) return '';
    if (rule.required && !value.trim()) return `${rule.label} is required.`;
    if (rule.minLength && value.trim().length < rule.minLength)
      return `${rule.label} must be at least ${rule.minLength} characters.`;
    if (rule.isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return 'Please enter a valid email address.';
    return '';
  }

  // Live validation
  Object.keys(rules).forEach(name => {
    const field = form.elements[name];
    if (!field) return;
    field.addEventListener('blur', () => validate(name, field.value));
    field.addEventListener('input', () => {
      // Clear error once they start fixing it
      if (field.classList.contains('error')) validate(name, field.value);
    });
  });

  function validate(name, value) {
    const field    = form.elements[name];
    const errorEl  = $(`[data-error-for="${name}"]`, form);
    const errorMsg = getError(name, value);
    if (errorEl) errorEl.textContent = errorMsg;
    field.classList.toggle('error', !!errorMsg);
    return !errorMsg;
  }

  function validateAll() {
    return Object.keys(rules).map(name =>
      validate(name, (form.elements[name] || {}).value || '')
    ).every(Boolean);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    status.className = 'form-status';
    status.textContent = '';

    // Simulate async send (replace with real fetch/API call)
    await new Promise(r => setTimeout(r, 1400));

    status.textContent = '✓ Message sent! We\'ll be in touch shortly.';
    status.className = 'form-status success';
    form.reset();
    $$('.form-field__error', form).forEach(el => el.textContent = '');
    $$('.error', form).forEach(el => el.classList.remove('error'));

    btn.disabled = false;
    btn.innerHTML = `Send message
      <svg class="btn__icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
  });
}
