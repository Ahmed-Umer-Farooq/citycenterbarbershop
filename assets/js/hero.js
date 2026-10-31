// Hero "scissors cut open". Desktop: CSS view-timeline on the 200vh section. Phones: CSS
// scroll-timeline (no pinning). Fallback where scroll timelines are missing: one rAF per
// scroll event sets animation.currentTime on the paused CSS animations, so no styles are
// recalculated per frame beyond that. ?p=0..1 in the URL freezes a frame for review.
// Self-contained: does nothing if .ccb-hero is missing.
(function () {
  function initHero(root) {
    if (!root || root.dataset.cut) return;
    root.dataset.cut = '1';
    const art = root.querySelector('.ccb-hero__art');
    const win = root.querySelector('.ccb-hero__window');
    const phone = matchMedia('(max-width: 760px)');
    const still = matchMedia('(prefers-reduced-motion: reduce)');
    const clamp = v => Math.min(1, Math.max(0, v || 0));
    const fit = () => {
      const w = art.clientWidth, h = art.clientHeight;
      root.style.setProperty('--ccb-k', (phone.matches ? w / 760 : Math.max(w / 1440, h / 900)).toFixed(4));
    };
    new ResizeObserver(fit).observe(art);
    fit();
    let anims = [];
    const setManual = on => {
      if (root.classList.contains('ccb-hero--manual') !== on) {
        root.classList.toggle('ccb-hero--manual', on);
        root.classList.add('ccb-hero--reset');
        void root.offsetWidth;
        root.classList.remove('ccb-hero--reset');
      }
      anims = on ? [...root.querySelectorAll('[data-scrub]')].flatMap(el => el.getAnimations()) : [];
    };
    const seek = p => { const t = p * 1000; for (const a of anims) a.currentTime = t; };
    const frozen = new URLSearchParams(location.search).get('p');
    if (frozen !== null) { setManual(true); seek(clamp(+frozen)); return; }
    if (CSS.supports('animation-timeline: scroll()')) return;
    let raf = 0, mode = '';
    const tick = () => {
      raf = 0;
      const m = still.matches ? 'still' : phone.matches ? 'phone' : 'desk';
      if (m !== mode) { mode = m; setManual(m !== 'still'); }
      if (m === 'still') return;
      let p;
      if (m === 'phone') p = clamp(scrollY / Math.max(240, win.offsetTop + win.offsetHeight / 2 - innerHeight / 2));
      else { const r = root.getBoundingClientRect(); p = clamp(-r.top / (r.height - innerHeight)); }
      seek(p);
    };
    const queue = () => { raf ||= requestAnimationFrame(tick); };
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', () => { mode = ''; queue(); }, { passive: true });
    tick();
  }

  initHero(document.querySelector('.ccb-hero'));
})();
