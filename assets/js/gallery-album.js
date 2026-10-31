/* ===================== SECTION: gallery-album — JS START =====================
   The gallery page's leather photo album, and the filter chips under it.

   A vanilla re-implementation of the "Gallery Album" design export, which was
   a React class component driven by a 69 KB dc-runtime. Same state machine,
   same timings, same page-pairing maths - no framework.

   One book at every width: the two-page spread, which is what the export's
   responsive ("auto") layout renders. Below 760px the book simply gets
   smaller and the arrows move underneath it - that swap is pure CSS, so this
   script has no breakpoint logic at all. (The export's one-cut-per-page
   variant only appears under its opt-in "single" layout, so it is not built.)

   What this script owns:
     - the open sequence: closed -> lifting -> opening -> open
     - turning leaves (arrows, click zones, arrow keys, swipe)
     - building the leaves
     - the page counter, the arrows' disabled state, and the first-page nudge
     - the grid's filter chips
   What it does NOT own: the grid itself and all visible copy. build.js
   renders those from data/gallery.json and data/strings.*.json, so the styles
   are real HTML and the gallery still works with JavaScript switched off.

   Own IIFE, looks only inside its own root, no-ops when that root is absent.
   ========================================================================= */
(function () {
  "use strict";
  var root = document.getElementById("ccb-gallery");
  if (!root || root.dataset.ccbGalleryReady) return;
  root.dataset.ccbGalleryReady = "1";

  /* ---------------- the grid's filter chips ----------------
     Independent of the album: it still works when the album is hidden for
     reduced motion, which is exactly when the grid is the whole gallery. */
  var chipBox = root.querySelector("[data-chips]");
  var items = root.querySelectorAll("[data-type]");
  if (chipBox) {
    chipBox.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      var want = btn.getAttribute("data-filter");
      chipBox.querySelectorAll("button[data-filter]").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      items.forEach(function (li) {
        li.hidden = !(want === "all" || li.getAttribute("data-type") === want);
      });
    });
  }

  /* ---------------- the album ---------------- */
  var album = document.getElementById("ccb-album");
  if (!album) return;

  var CUTS;
  try {
    CUTS = JSON.parse(album.getAttribute("data-cuts") || "[]");
  } catch (err) {
    CUTS = [];
  }
  if (!CUTS.length) return;

  var BOOK_LABEL = album.getAttribute("data-t-book") || "";
  var COUNTER_TPL = album.getAttribute("data-t-counter") || "{a} / {total}";
  var TURN = "transform 750ms cubic-bezier(.22,1,.36,1)";

  /* reduced motion: no book at all, just the grid - same as the export */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  album.hidden = false;

  var state = { phase: "closed", open: false, turned: 0, moving: -1, shade: false };
  var timers = {};
  function later(key, fn, ms) { clearTimeout(timers[key]); timers[key] = setTimeout(fn, ms); }

  var leafBox = album.querySelector("[data-leaves]");
  var counters = album.querySelectorAll("[data-counter]");
  var intro = album.querySelector("[data-intro]");
  var end = album.querySelector("[data-end]");

  function leafCount() { return Math.ceil(CUTS.length / 2); }
  function maxTurn() { return leafCount(); }

  function el(tag, cls) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  }

  /* one face of a leaf: the paper, the page number, the photo, the caption,
     the booking link, and the sweep of shadow while it turns. */
  function buildFace(side, cut) {
    var face = el("div", "ccb-album__face ccb-album__face--" + side);
    face.setAttribute("data-face", "");
    var paper = el("div", "ccb-album__paper");

    if (cut) {
      var page = el("div", "ccb-album__page");

      var num = el("span", "ccb-album__num");
      num.textContent = cut.num;
      page.appendChild(num);

      var img = el("img", "ccb-album__photo");
      img.src = cut.src;
      img.alt = cut.alt;
      img.loading = "lazy";
      img.decoding = "async";
      img.draggable = false;
      page.appendChild(img);

      var cap = el("div", "ccb-album__caption");
      var h3 = el("h3", "ccb-album__name");
      h3.textContent = cut.name;
      cap.appendChild(h3);
      var meta = el("p", "ccb-album__meta");
      meta.textContent = cut.meta;
      cap.appendChild(meta);
      page.appendChild(cap);

      /* build.js resolved this href already (and left it empty when
         site.json's bookUrl is still TODO). booking.js has long finished its
         own sweep by the time this leaf exists, so apply its rule here: no
         link to give, no href - aria-disabled instead of a dead placeholder. */
      var a = el("a", "ccb-album__book-btn");
      a.textContent = BOOK_LABEL;
      a.setAttribute("data-track", "book_gallery_album");
      if (cut.book) {
        a.href = cut.book;
      } else {
        a.setAttribute("aria-disabled", "true");
        a.classList.add("is-disabled");
        a.addEventListener("click", function (e) { e.preventDefault(); });
      }
      page.appendChild(a);

      paper.appendChild(page);
    }

    var shade = el("div", "ccb-album__shade");
    paper.appendChild(shade);
    face.appendChild(paper);
    return face;
  }

  /* Leaf k sits on the spine: its front face is the right page and carries
     cut 2k; its back face is pre-rotated 180deg so it lands on the left page
     carrying cut 2k+1. After t turns: left = cut 2t-1, right = cut 2t. */
  function buildLeaves() {
    if (!leafBox) return;
    leafBox.textContent = "";
    var n = leafCount();
    for (var k = 0; k < n; k++) {
      var leaf = el("div", "ccb-album__leaf");
      leaf.appendChild(buildFace("front", vm(2 * k)));
      leaf.appendChild(buildFace("back", vm(2 * k + 1)));
      leaf.addEventListener("transitionend", onLeafEnd);
      leafBox.appendChild(leaf);
    }
  }

  function vm(i) {
    var c = CUTS[i];
    if (!c) return null;
    return { src: c.src, alt: c.alt, name: c.name, meta: c.meta, num: String(i + 1), book: c.book };
  }

  /* ---------------- paint the current state onto the DOM ---------------- */
  function paint() {
    var n = leafCount();
    var total = CUTS.length;
    var tn = state.turned;

    album.setAttribute("data-phase", state.phase);
    album.classList.toggle("is-open", state.open);
    /* the first-page nudge: fills in the next arrow and shows the swipe hint
       while the reader has not turned anything yet. CSS only acts on it
       below the breakpoint, where the hint belongs. */
    album.classList.toggle("is-start", state.open && tn === 0);

    var leaves = leafBox ? leafBox.children : [];
    for (var k = 0; k < leaves.length; k++) {
      var leaf = leaves[k];
      var isTurned = k < tn;
      var isMoving = k === state.moving;

      leaf.style.transform = isTurned ? "rotateY(-180deg)" : "rotateY(0deg)";
      leaf.style.zIndex = isMoving ? 100 : isTurned ? k + 1 : n - k + 1;
      leaf.style.transition = TURN;
      leaf.style.setProperty("--shade", isMoving && state.shade ? 1 : 0);

      setFace(leaf.children[0], state.open && k === tn);
      setFace(leaf.children[1], state.open && k === tn - 1);
    }

    if (intro) setFace(intro, state.open && tn === 0);
    if (end) setFace(end, state.open && tn === n);

    var label;
    if (tn === 0) {
      label = "1";
    } else {
      var l = 2 * tn, r = 2 * tn + 1;
      label = r <= total ? l + "–" + r : String(Math.min(l, total));
    }
    var text = COUNTER_TPL.replace("{a}", label).replace("{total}", String(total));
    counters.forEach(function (c) { c.textContent = text; });

    var prevOff = !state.open || tn === 0;
    var nextOff = state.open && tn >= maxTurn();
    album.querySelectorAll("[data-prev]").forEach(function (b) { b.disabled = prevOff; });
    album.querySelectorAll("[data-next]").forEach(function (b) { b.disabled = nextOff; });
    album.querySelectorAll("[data-zone-prev]").forEach(function (z) { z.classList.toggle("is-disabled", prevOff); });
    album.querySelectorAll("[data-zone-next]").forEach(function (z) { z.classList.toggle("is-disabled", nextOff); });
  }

  /* A page that is turned away is not just invisible, it must not be
     reachable - by a screen reader or by Tab. inert covers both. */
  function setFace(node, visible) {
    node.setAttribute("aria-hidden", visible ? "false" : "true");
    node.inert = !visible;
  }

  /* ---------------- opening ----------------
     closed -> lifting (a flat cover fades in over the right page)
            -> opening (it swings on the spine)
            -> open */
  function open() {
    if (state.open) return;
    if (io) { io.disconnect(); io = null; }
    clearTimeout(timers.auto);
    state.open = true;
    state.phase = "lifting";
    paint();
    later("phase1", function () { state.phase = "opening"; paint(); }, 480);
    later("phase2", function () { state.phase = "open"; paint(); }, 480 + 1650);
  }

  /* ---------------- turning ---------------- */
  function turn(dir) {
    if (!state.open) { if (dir > 0) open(); return; }
    if (state.phase !== "open") return;
    if (state.moving >= 0) return;          // one turn at a time
    var idx, turned;
    if (dir > 0 && state.turned < maxTurn()) { idx = state.turned; turned = state.turned + 1; }
    else if (dir < 0 && state.turned > 0) { idx = state.turned - 1; turned = state.turned - 1; }
    else return;

    state.moving = idx;
    state.turned = turned;
    state.shade = true;
    paint();

    later("shade", function () { state.shade = false; paint(); }, 375);
    // fallback, in case transitionend never arrives
    later("lock", function () { state.moving = -1; paint(); }, 1100);
  }

  function onLeafEnd(e) {
    if (e.target !== e.currentTarget || e.propertyName !== "transform") return;
    clearTimeout(timers.lock);
    state.moving = -1;
    state.shade = false;
    paint();
  }

  /* ---------------- input ---------------- */
  album.querySelectorAll("[data-open]").forEach(function (b) {
    b.addEventListener("click", open);
  });
  album.querySelectorAll("[data-prev], [data-zone-prev]").forEach(function (b) {
    b.addEventListener("click", function () { turn(-1); });
  });
  album.querySelectorAll("[data-next], [data-zone-next]").forEach(function (b) {
    b.addEventListener("click", function () { turn(1); });
  });

  album.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); turn(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); turn(-1); }
  });

  /* swipe. The book is only about half a phone screen tall, so a vertical
     drag has to stay a page scroll - only a clearly horizontal one turns. */
  var tx = null, ty = null;
  album.addEventListener("touchstart", function (e) {
    var t = e.touches[0];
    tx = t.clientX; ty = t.clientY;
  }, { passive: true });
  album.addEventListener("touchend", function (e) {
    if (tx === null) return;
    var t = e.changedTouches[0];
    var dx = t.clientX - tx, dy = t.clientY - ty;
    tx = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) turn(dx < 0 ? 1 : -1);
  }, { passive: true });

  /* ---------------- open itself when scrolled to ----------------
     Only when the visitor actually scrolls it into view. If it is already
     fully on screen when the page loads, it waits for a tap - otherwise the
     book would open behind the fold, before anyone had seen it closed.

     Not on phones. Below the breakpoint the album is only a few hundred
     pixels tall, so it clears the 98%-visible threshold the moment it is
     scrolled to and opens on its own every time - the closed album, which is
     the invitation to look, is never seen. There it waits to be tapped, the
     way it does on a desktop screen. */
  var io = null, wasOut = false;
  if ("IntersectionObserver" in window && !window.matchMedia("(max-width: 760px)").matches) {
    io = new IntersectionObserver(function (entries) {
      var e = entries[0];
      clearTimeout(timers.auto);
      if (e.intersectionRatio < 0.98) { wasOut = true; return; }
      if (wasOut) later("auto", open, 700);
    }, { threshold: [0, 0.98, 1] });
    io.observe(album);
  }

  buildLeaves();
  paint();
})();
/* ===================== SECTION: gallery-album — JS END ===================== */
