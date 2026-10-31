// Shared "Book now" wiring for every page. Two independent, self-contained parts:
//
// 1. One link, one disabled state. Every Book now button (header, drawer, hero, sticky
//    bar, and the inner-page hero buttons) reads data/site.json's bookUrl through
//    #ccb-root's data-site attribute instead of a hardcoded href. While bookUrl is empty
//    or "TODO" every one of them goes aria-disabled and unclickable instead of linking
//    anywhere - no placeholder link, nothing pointing at the old site.
//
// 2. The phone sticky bar hides itself whenever another booking band is already in view
//    (hero actions, the location block's buttons, the footer), so the visitor is never
//    shown two sets of booking buttons on screen at once.
(function () {
  "use strict";
  var root = document.getElementById("ccb-root");
  if (!root || !root.dataset.site) return;
  var site;
  try { site = JSON.parse(root.dataset.site); } catch (e) { return; }

  var url = site.bookUrl;
  var isSet = !!url && url !== "TODO";
  var links = document.querySelectorAll("[data-book-link]");
  for (var i = 0; i < links.length; i++) {
    var a = links[i];
    if (isSet) {
      a.href = url;
      a.removeAttribute("aria-disabled");
      a.classList.remove("is-disabled");
    } else {
      a.removeAttribute("href");
      a.setAttribute("aria-disabled", "true");
      a.classList.add("is-disabled");
      a.addEventListener("click", function (e) { e.preventDefault(); });
    }
  }
})();

(function () {
  "use strict";
  var bar = document.querySelector(".ccb-sticky-bar");
  if (!bar || !("IntersectionObserver" in window)) return;

  var selectors = ["#ccb-hero .ccb-hero__actions", "#ccb-find .ccb-find__act", "#ccb-foot"];
  var watched = [];
  for (var i = 0; i < selectors.length; i++) {
    var el = document.querySelector(selectors[i]);
    if (el) watched.push(el);
  }
  if (!watched.length) return;

  var visible = watched.map(function () { return false; });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var idx = watched.indexOf(entry.target);
      if (idx > -1) visible[idx] = entry.isIntersecting;
    });
    bar.classList.toggle("is-hidden", visible.indexOf(true) > -1);
  }, { threshold: .15 });
  watched.forEach(function (el) { io.observe(el); });
})();
