/* ═══════════════════════════════════════════════════════════
   ROELOF JUNIOR HAAR — PORTFOLIO
   script.js

   TABLE OF CONTENTS
   1.  Custom Cursor
   2.  Navigation (hide on scroll down, show on scroll up)
   3.  Hero Entrance Animation
   4.  Scroll Reveal (IntersectionObserver)
   5.  Skill Bar Animation
   6.  Contact Form (async Formspree submission)
   7.  Init
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────
   1. Custom Cursor
───────────────────────────────────────── */
function initCursor() {
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');

  if (!dot || !ring) return;

  // On touch-only devices the cursor elements are hidden via CSS,
  // but we still bail early to skip event listeners.
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = -100, mouseY = -100; // start off-screen
  let ringX  = -100, ringY  = -100;

  // Move dot instantly, ring with a smooth lag via lerp in rAF
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
  });

  // Lerp factor — lower = more lag
  const LERP = 0.10;

  function animateRing() {
    ringX += (mouseX - ringX) * LERP;
    ringY += (mouseY - ringY) * LERP;
    ring.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Scale up cursor on interactive elements
  const interactiveSelector = 'a, button, [role="button"], input, textarea, label, .project-card';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) {
      document.body.classList.add('cursor--hover');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelector)) {
      document.body.classList.remove('cursor--hover');
    }
  });

  // Hide cursor elements when mouse leaves the viewport
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
}

/* ─────────────────────────────────────────
   2. Navigation — hide on scroll down, show on scroll up
───────────────────────────────────────── */
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  let lastScrollY = 0;
  let ticking     = false;
  const THRESHOLD = 80; // px from top before hiding starts

  function updateNav() {
    const currentY = window.scrollY;

    if (currentY > THRESHOLD) {
      if (currentY > lastScrollY) {
        nav.classList.add('nav--hidden');    // scrolling down
      } else {
        nav.classList.remove('nav--hidden'); // scrolling up
      }
    } else {
      nav.classList.remove('nav--hidden');   // near top
    }

    lastScrollY = currentY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }, { passive: true });
}

/* ─────────────────────────────────────────
   3. Hero Entrance Animation
───────────────────────────────────────── */
function initHeroAnimation() {
  const words  = document.querySelectorAll('.hero__word');
  const role   = document.querySelector('.hero__role');
  const scroll = document.querySelector('.hero__scroll');

  const BASE_DELAY = 120; // ms offset before first word appears

  words.forEach((word, i) => {
    setTimeout(() => {
      word.classList.add('is-visible');
    }, BASE_DELAY + i * 90);
  });

  // Role subtitle appears after all name words have revealed
  if (role) {
    setTimeout(() => {
      role.classList.add('is-visible');
    }, BASE_DELAY + words.length * 90 + 200);
  }

  // Scroll cue is last
  if (scroll) {
    setTimeout(() => {
      scroll.classList.add('is-visible');
    }, BASE_DELAY + words.length * 90 + 620);
  }
}

/* ─────────────────────────────────────────
   4. Scroll Reveal (IntersectionObserver)
───────────────────────────────────────── */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  // Respect prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealEls.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // trigger once only
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealEls.forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────
   5. Skill Bar Animation
───────────────────────────────────────── */
function initSkillBars() {
  const bars = document.querySelectorAll('.skill__bar');
  if (!bars.length) return;

  // For reduced-motion users, set bars to full width immediately
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    bars.forEach(bar => {
      bar.style.width = `${bar.dataset.width || 0}%`;
    });
    return;
  }

  let animated = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          bars.forEach((bar, i) => {
            const target = bar.dataset.width || '0';
            setTimeout(() => {
              bar.style.width = `${target}%`;
            }, i * 130);
          });
          observer.disconnect();
        }
      });
    },
    { threshold: 0.4 }
  );

  const skillsContainer = document.querySelector('.skills') || document.querySelector('#about');
  if (skillsContainer) observer.observe(skillsContainer);
}

/* ─────────────────────────────────────────
   6. Contact Form — async Formspree submission
───────────────────────────────────────── */
function initContactForm() {
  const form   = document.getElementById('contactForm');
  const btn    = document.getElementById('formBtn');
  const status = document.getElementById('formStatus');

  if (!form || !btn || !status) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput    = form.querySelector('#name');
    const emailInput   = form.querySelector('#email');
    const messageInput = form.querySelector('#message');

    // Basic required-field validation
    if (
      !nameInput.value.trim() ||
      !emailInput.value.trim() ||
      !messageInput.value.trim()
    ) {
      setStatus('Please fill in all fields.', 'error');
      return;
    }

    // Email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
      setStatus('Please enter a valid email address.', 'error');
      return;
    }

    // Enter sending state
    btn.disabled    = true;
    btn.textContent = 'SENDING...';
    setStatus('', 'clear');

    try {
      const response = await fetch(form.action, {
        method:  'POST',
        body:    new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (response.ok) {
        btn.textContent = 'MESSAGE SENT \u2713';
        setStatus("Thanks! I\u2019ll be in touch soon.", 'success');
        form.reset();

        // Reset the button label after 6 s
        setTimeout(() => {
          btn.textContent = 'SEND MESSAGE \u2192';
          btn.disabled    = false;
          setStatus('', 'clear');
        }, 6000);

      } else {
        const data = await response.json().catch(() => ({}));
        const msg  = (data?.errors || []).map(err => err.message).join(', ')
          || 'Something went wrong. Please try again.';
        setStatus(msg, 'error');
        btn.textContent = 'SEND MESSAGE \u2192';
        btn.disabled    = false;
      }

    } catch (err) {
      console.error('Form error:', err);
      setStatus('Network error. Please check your connection and try again.', 'error');
      btn.textContent = 'SEND MESSAGE \u2192';
      btn.disabled    = false;
    }
  });

  // Clear error messages while the user is typing
  form.addEventListener('input', () => {
    if (status.textContent && !status.textContent.includes('\u2713')) {
      setStatus('', 'clear');
    }
  });

  function setStatus(msg, type) {
    status.textContent = msg;
    if (type === 'error')   status.style.color = 'var(--red)';
    if (type === 'success') status.style.color = '#3a9e5f';
    if (type === 'clear')   status.style.color = '';
  }
}

/* ─────────────────────────────────────────
   7. Video fallback links
───────────────────────────────────────── */
function initVideoFallbackLinks() {
  const videoBlocks = document.querySelectorAll('.video-block');
  if (!videoBlocks.length) return;

  videoBlocks.forEach((block) => {
    if (block.querySelector('.video-block__cta')) return;

    const iframe = block.querySelector('iframe[src*="youtube.com/embed/"]');
    const info = block.querySelector('.video-block__info');
    if (!iframe || !info) return;

    const match = iframe.src.match(/embed\/([^?&"/]+)/);
    if (!match?.[1]) return;

    const videoId = match[1];
    const link = document.createElement('a');
    link.href = `https://www.youtube.com/watch?v=${videoId}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'video-block__cta';
    link.textContent = 'Bekijk op YouTube';

    info.appendChild(link);
  });
}

/* ─────────────────────────────────────────
   8. Init
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initNav();
  initHeroAnimation();
  initScrollReveal();
  initSkillBars();
  initContactForm();
  initVideoFallbackLinks();
});
