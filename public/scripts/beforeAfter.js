(function () {
  const containers = document.querySelectorAll('[data-before-after]');
  containers.forEach((c) => {
    const slider = c.querySelector('[data-ba-slider]');
    const wrap = c.querySelector('[data-ba-before-wrap]');
    const handle = c.querySelector('[data-ba-handle]');
    if (!slider || !wrap || !handle) return;
    const update = (val) => {
      wrap.style.width = val + '%';
      handle.style.left = val + '%';
    };
    slider.addEventListener('input', (e) => update(e.target.value));
    update(50);
  });
})();
