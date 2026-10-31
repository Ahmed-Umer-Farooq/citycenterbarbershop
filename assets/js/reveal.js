// Generic scroll reveal: any element with [data-reveal] fades/rises into view once, the
// first time it crosses into the viewport. Zero dependencies, one small IntersectionObserver.
// Deliberately simple and declarative (just a few data attributes) so it's a 1:1 match for
// Elementor's built-in "Motion Effects > Entrance Animation" when this site gets rebuilt
// there - no bespoke per-section JS to reinvent, just re-tick the same settings per widget.
//
// Markup:
//   <div data-reveal>...</div>                    fade + rise, no delay
//   <div data-reveal data-reveal-delay="120">...</div>   same, 120ms late
//   <ul data-reveal-group data-reveal-step="70">          auto-stagger each direct child
//     <li>...</li><li>...</li>
//   </ul>
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function reveal(el, delay) {
    if (delay) el.style.transitionDelay = delay + "ms";
    el.classList.add("is-revealed");
  }

  var targets = [].slice.call(document.querySelectorAll("[data-reveal]"));

  document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
    var step = parseInt(group.dataset.revealStep, 10) || 80;
    [].slice.call(group.children).forEach(function (child, i) {
      child.setAttribute("data-reveal", "");
      child.dataset.revealDelay = i * step;
      targets.push(child);
    });
  });

  if (!targets.length) return;

  if (reduce) {
    targets.forEach(function (el) { reveal(el, 0); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      reveal(entry.target, parseInt(entry.target.dataset.revealDelay, 10) || 0);
      io.unobserve(entry.target);
    });
  }, { threshold: .2, rootMargin: "0px 0px -8% 0px" });

  targets.forEach(function (el) { io.observe(el); });
})();
