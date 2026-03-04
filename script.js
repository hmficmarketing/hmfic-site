// HMFIC — script.js
// Smooth scroll, mobile nav, sticky nav shadow, form handling, video embeds

(function () {
  'use strict';

  // --- Mobile Nav Toggle ---
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close nav when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close nav on outside click
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // --- Sticky Nav Shadow ---
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        nav.style.boxShadow = '0 2px 20px rgba(0,0,0,0.3)';
      } else {
        nav.style.boxShadow = 'none';
      }
    }, { passive: true });
  }

  // --- Video Placeholder Click → Embed ---
  document.querySelectorAll('.video-placeholder').forEach(placeholder => {
    placeholder.addEventListener('click', function () {
      const videoId = this.dataset.videoId;
      if (!videoId || videoId === 'VIDEO_ID_1' || videoId.startsWith('VIDEO_ID_')) {
        // Placeholder — no real video yet
        return;
      }
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      this.parentElement.replaceChild(iframe, this);
    });
  });

  // --- Contact Form Handling ---
  const form = document.getElementById('applyForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
  const btnLoading = submitBtn ? submitBtn.querySelector('.btn-loading') : null;
  const successEl = document.getElementById('formSuccess');
  const errorEl = document.getElementById('formError');

  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Honeypot check
      if (form.querySelector('[name="_gotcha"]').value) return;

      // Set loading state
      submitBtn.disabled = true;
      if (btnText) btnText.style.display = 'none';
      if (btnLoading) btnLoading.style.display = 'inline';
      if (errorEl) errorEl.style.display = 'none';

      try {
        const data = Object.fromEntries(new FormData(form));
        const response = await fetch(form.action, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' }
        });

        if (response.ok) {
          form.style.display = 'none';
          if (successEl) successEl.style.display = 'block';
          // Scroll success into view
          if (successEl) successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          throw new Error('Server error');
        }
      } catch {
        if (errorEl) errorEl.style.display = 'block';
        submitBtn.disabled = false;
        if (btnText) btnText.style.display = 'inline';
        if (btnLoading) btnLoading.style.display = 'none';
      }
    });
  }

  // --- Stat Scramble (scroll-triggered) ---
  function scrambleText(el, finalText, duration) {
    const chars = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$%+–×';
    let frame = 0;
    const totalFrames = Math.ceil(duration / 40);

    const tick = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const revealCount = Math.floor(progress * finalText.length);

      el.textContent = finalText
        .split('')
        .map((ch, i) => {
          if (i < revealCount) return ch;
          if (ch === ' ' || ch === '–') return ch;
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      if (frame >= totalFrames) {
        clearInterval(tick);
        el.textContent = finalText;
      }
    }, 40);
  }

  const statsSection = document.querySelector('.about-stats');
  if (statsSection && 'IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          statsObserver.unobserve(entry.target);
          entry.target.querySelectorAll('.stat strong').forEach((el, i) => {
            const finalText = el.textContent;
            setTimeout(() => scrambleText(el, finalText, 900), i * 200);
          });
        }
      });
    }, { threshold: 0.6 });

    statsObserver.observe(statsSection);
  }

  // --- Scroll Animation (fade-in sections) ---
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.card, .why-card, .testimonial-card, .logo-item').forEach(el => {
      el.classList.add('fade-in');
      observer.observe(el);
    });
  }

})();
