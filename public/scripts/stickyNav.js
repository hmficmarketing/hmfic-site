(function () {
  const nav = document.querySelector('[data-sticky-nav]');
  if (!nav) return;
  const links = Array.from(nav.querySelectorAll('a[data-anchor]'));
  const targets = links
    .map((l) => {
      const sel = l.getAttribute('data-anchor');
      return sel ? document.querySelector(sel) : null;
    })
    .filter(Boolean);

  if (targets.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          links.forEach((l) => {
            l.setAttribute('aria-current', l.getAttribute('data-anchor') === id ? 'true' : 'false');
          });
        }
      });
    },
    { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
  );
  targets.forEach((t) => observer.observe(t));
})();
