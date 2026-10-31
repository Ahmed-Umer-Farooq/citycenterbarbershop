// Pull-cord lamp switch -> site-wide dark theme. Self-contained: does nothing on pages
// without the lamp yet. The actual palette lives entirely in tokens.css; this file only
// flips the data-theme attribute, persists the choice, and plays the "pull" animation.
// The very first paint's theme is decided by the inline snippet in build.js's pageShell
// (it has to run before CSS paints, so it can't live in this deferred file) - this script
// just keeps the button's state and the pull gesture in sync after that.
(function () {
  "use strict";
  var KEY = "ccb-theme";
  var root = document.documentElement;
  var btn = document.getElementById("ccb-theme-toggle");
  if (!btn) return;

  // hint bubble + idle wiggle: shown on every single page load, no "seen it already"
  // memory - the request was explicitly "every refresh", not "first visit only". Only
  // thing that cuts it short on a given load is actually touching the lamp.
  var hint = document.querySelector("[data-lamp-hint]");
  if (hint) {
    var dismiss = function () { hint.classList.remove("is-visible"); };
    var showTimer = setTimeout(function () {
      hint.classList.add("is-visible");
      setTimeout(dismiss, 4500);
    }, 1400);
    btn.addEventListener("pointerdown", function () { clearTimeout(showTimer); dismiss(); }, { once: true });
  }

  function isDark() { return root.getAttribute("data-theme") === "dark"; }

  function syncLabel() {
    var dark = isDark();
    btn.setAttribute("aria-pressed", String(dark));
    var label = dark ? btn.dataset.labelOn : btn.dataset.labelOff;
    if (label) btn.setAttribute("aria-label", label);
  }
  syncLabel();

  btn.addEventListener("click", function () {
    if (isDark()) {
      root.removeAttribute("data-theme");
      try { localStorage.setItem(KEY, "light"); } catch (e) {}
    } else {
      root.setAttribute("data-theme", "dark");
      try { localStorage.setItem(KEY, "dark"); } catch (e) {}
    }
    syncLabel();

    btn.classList.remove("is-pulling");
    void btn.offsetWidth; // restart the pull keyframe on repeat clicks
    btn.classList.add("is-pulling");
  });

  btn.addEventListener("animationend", function () { btn.classList.remove("is-pulling"); });
})();
