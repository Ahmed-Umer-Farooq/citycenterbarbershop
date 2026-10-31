// "Our services" section (home page): filter chips, scroll-in reveal, and a short
// cinematic transition on click before navigating to the prices page. Self-contained,
// no-ops if the section is absent. Progressive enhancement only - with JS off every
// card is already visible and every link is a normal <a href>.
(function () {
  "use strict";
  var root = document.getElementById("ccb-services");
  if (!root) return;
  if (root.dataset.ccbServicesReady) return;
  root.dataset.ccbServicesReady = "1";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var grid = root.querySelector(".ccb-services__grid");
  var filtersEl = root.querySelector(".ccb-services__filters");
  var cards = [].slice.call(grid.querySelectorAll(".ccb-services__card"));
  var active = "all";

  // scroll reveal: the filter bar fades in first (as its own section comes into view,
  // separate from the hero above it), then the cards stagger in by grid position.
  function revealIn() {
    if (reduce) {
      if (filtersEl) filtersEl.classList.add("in");
      cards.forEach(function (c) { c.classList.add("in"); });
      return;
    }
    if (filtersEl) {
      var filtersIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          filtersEl.classList.add("in");
          filtersIo.unobserve(filtersEl);
        });
      }, { threshold: .4 });
      filtersIo.observe(filtersEl);
    }
    var cols = getComputedStyle(grid).gridTemplateColumns.split(" ").length || 4;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var card = entry.target;
        var i = cards.indexOf(card);
        card.style.transitionDelay = ((i % cols) * 70) + "ms";
        card.classList.add("in");
        io.unobserve(card);
      });
    }, { threshold: .18, rootMargin: "0px 0px -8% 0px" });
    cards.forEach(function (c) { if (!c.classList.contains("in")) io.observe(c); });
  }
  revealIn();

  // filter chips: toggle which service's card is shown
  function applyFilter(id) {
    if (!id || id === active) return;
    active = id;

    if (filtersEl) {
      filtersEl.querySelectorAll(".ccb-services__chip").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.filter === id));
      });
    }

    var shown = 0;
    cards.forEach(function (card) {
      var match = active === "all" || card.dataset.service === active;
      card.classList.toggle("is-filtered-out", !match);
      card.classList.remove("in");
      if (match) shown++;
    });
    root.classList.toggle("is-empty", shown === 0);

    // re-stagger the reveal for whatever is now visible
    requestAnimationFrame(function () {
      var visible = cards.filter(function (c) { return !c.classList.contains("is-filtered-out"); });
      visible.forEach(function (c, i) {
        c.style.transitionDelay = reduce ? "0ms" : (i * 55) + "ms";
        requestAnimationFrame(function () { c.classList.add("in"); });
      });
    });
  }

  if (filtersEl) {
    filtersEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".ccb-services__chip");
      if (btn) applyFilter(btn.dataset.filter);
    });
  }

  // deep link from the header's services dropdown/sub-list (#service-id): jump straight
  // to that service already filtered, instead of landing on the full unfiltered grid.
  var validIds = cards.map(function (c) { return c.dataset.service; });
  function applyHash() {
    var id = (location.hash || "").slice(1);
    if (validIds.indexOf(id) === -1) return;
    applyFilter(id);
    requestAnimationFrame(function () {
      root.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  }
  applyHash();
  window.addEventListener("hashchange", applyHash);

  // click: a brief cinematic collapse-toward-card, then navigate. Uses the View
  // Transitions API for a smooth cross-fade into the next page when the browser
  // supports it; otherwise just plays the local CSS transition before following the link.
  root.querySelectorAll(".ccb-services__link").forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (reduce || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      var card = link.closest(".ccb-services__card");
      if (!card || root.classList.contains("is-leaving")) return;
      e.preventDefault();
      var go = function () { window.location.href = link.href; };

      if (document.startViewTransition) {
        document.startViewTransition(function () {
          root.classList.add("is-leaving");
          card.classList.add("is-clicked");
        });
        setTimeout(go, 420);
        return;
      }
      root.classList.add("is-leaving");
      card.classList.add("is-clicked");
      setTimeout(go, 420);
    });
  });
})();
