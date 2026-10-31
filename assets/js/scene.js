/* ===================== SECTION: scene — JS START =====================
   Team page's group photograph. Two jobs only:
     1. point at / focus a name -> spotlight that man in the photograph
     2. add .is-in when the section arrives, for browsers with no
        scroll-driven animation support (the CSS drives it where there is)

   Unlike the standalone export, the cast list is NOT built here: build.js
   renders the <li> markup from data/team.json, so the names and roles are
   real HTML (good for SEO, and it maps to an ACF repeater in WordPress).
   This script only reads each button's data-x / data-y spotlight position.

   Own IIFE, looks only inside its own root, no-ops when that root is
   absent - so it is harmless on every page that is not the team page.
   ===================================================================== */
(function () {
  "use strict";
  var root = document.getElementById("ccb-scene");
  if (!root || root.dataset.ccbSceneReady) return;
  root.dataset.ccbSceneReady = "1";

  var lit = root.querySelector("[data-lit]");
  var ring = root.querySelector("[data-ring]");
  var cast = root.querySelector("[data-cast]");
  if (!lit || !ring || !cast) return;

  /* point at a name and the room dims around that man. touch works too,
     because it listens for focus as well as hover. */
  function light(btn) {
    var x = btn.getAttribute("data-x");
    var y = btn.getAttribute("data-y");
    if (x === null || y === null) return;
    [lit, ring].forEach(function (el) {
      el.style.setProperty("--sx", x + "%");
      el.style.setProperty("--sy", y + "%");
    });
    root.classList.add("is-lit");
  }

  function dark() {
    root.classList.remove("is-lit");
  }

  ["pointerenter", "focusin"].forEach(function (ev) {
    cast.addEventListener(ev, function (e) {
      var b = e.target.closest("button[data-x]");
      if (b) light(b);
    }, true);
  });
  cast.addEventListener("pointerleave", dark);
  cast.addEventListener("focusout", function (e) {
    if (!cast.contains(e.relatedTarget)) dark();
  });
  /* tapping a name on a phone has no hover to end it, so a tap outside clears */
  cast.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-x]");
    if (b) light(b);
  });
  document.addEventListener("pointerdown", function (e) {
    if (!cast.contains(e.target)) dark();
  });

  /* the shutters and the corners are driven by the scroll in CSS where the
     browser supports it. this only handles the cast row, and stands in for
     the whole move where it does not. */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          root.classList.add("is-in");
          io.disconnect();
        }
      });
    }, { threshold: 0.3 });
    io.observe(root);
  } else {
    root.classList.add("is-in");
  }
})();
/* ===================== SECTION: scene — JS END ===================== */
