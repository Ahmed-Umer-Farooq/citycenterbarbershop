// "Find your style" filterable gallery (home page). Self-contained: does nothing if
// #ccb-styles is missing. No visible text is hard-coded here beyond the data below -
// styling copy comes from this file's I18N table, matched by <html lang>.
//
// TODO before launch: fill in DATA.bookingBase / each style's freshaUrl and real prices.
(function () {
  "use strict";
  var root = document.getElementById("ccb-styles");
  if (!root) return;
  if (root.dataset.ccbStylesReady) return;
  root.dataset.ccbStylesReady = "1";

  var DATA = {
    bookingBase: "https://www.fresha.com/", // TODO: real Fresha link
    imgBase: "/assets/img/styles/",
    iconBase: "/assets/img/icons/",
    filters: [
      { id: "all", icon: "all" },
      { id: "skin", icon: "skin" },
      { id: "taper", icon: "taper" },
      { id: "scissor", icon: "scissor" },
      { id: "curly", icon: "curly" },
      { id: "afro", icon: "afro" },
      { id: "beard", icon: "beard" },
      { id: "women", icon: "women" }
    ],
    styles: [
      { id: "skin-fade", img: "skin-fade", tags: ["skin", "afro"], price: 32, mins: 30, freshaUrl: null },
      { id: "taper-fade", img: "taper-fade", tags: ["taper"], price: 32, mins: 30, freshaUrl: null },
      { id: "scissor-cut", img: "scissor-cut", tags: ["scissor"], price: 45, mins: 45, freshaUrl: null },
      { id: "curls", img: "curls", tags: ["curly", "scissor"], price: 38, mins: 40, freshaUrl: null },
      { id: "afro", img: "afro", tags: ["afro", "curly", "women"], price: 40, mins: 45, freshaUrl: null },
      { id: "beard", img: "beard", tags: ["beard"], price: 25, mins: 20, freshaUrl: null }
    ]
  };

  var I18N = {
    nl: {
      title: "Vind jouw stijl",
      sub: "Kies een stijl, bekijk de prijs en boek direct.",
      more: "Bekijk de volledige galerij",
      empty: "Geen stijlen in dit filter.",
      book: "Boek deze stijl",
      from: "vanaf",
      min: "min",
      filterLabel: "Filter op stijl",
      filters: { all: "Alles", skin: "Skin fade", taper: "Taper fade", scissor: "Schaarknippen",
                 curly: "Krullen", afro: "Afro en getextureerd", beard: "Baard", women: "Dames" },
      styles: {
        "skin-fade": { name: "Skin fade en textuur", alt: "Strakke skin fade met getextureerde bovenkant" },
        "taper-fade": { name: "Klassieke taper fade", alt: "Klassieke taper fade met zijscheiding" },
        "scissor-cut": { name: "Moderne schaarknipbeurt", alt: "Moderne schaarknipbeurt met golvend haar" },
        "curls": { name: "Gedefinieerde krullen", alt: "Gedefinieerde krullen met korte zijkanten" },
        "afro": { name: "Natuurlijke afro vorm", alt: "Natuurlijke afro, strak in vorm geknipt" },
        "beard": { name: "Baard trimmen en vormen", alt: "Verzorgde volle baard, strak afgelijnd" }
      }
    },
    en: {
      title: "Find your style",
      sub: "Pick a style, see the price and book it.",
      more: "See the full gallery",
      empty: "No styles in this filter.",
      book: "Book this style",
      from: "from",
      min: "min",
      filterLabel: "Filter by style",
      filters: { all: "All", skin: "Skin fade", taper: "Taper fade", scissor: "Scissor cut",
                 curly: "Curly", afro: "Afro and textured", beard: "Beard", women: "Women" },
      styles: {
        "skin-fade": { name: "Skin fade and texture", alt: "Crisp skin fade with a textured top" },
        "taper-fade": { name: "Classic taper fade", alt: "Classic taper fade with a side part" },
        "scissor-cut": { name: "Modern scissor cut", alt: "Modern scissor cut on wavy hair" },
        "curls": { name: "Defined curls", alt: "Defined curls with short sides" },
        "afro": { name: "Natural afro shape", alt: "Natural afro, neatly shaped" },
        "beard": { name: "Beard trim and shape", alt: "Groomed full beard with a clean line" }
      }
    }
  };

  /* remaining thin gold line icons used inside the cards (filter chips use the real
     icon images cropped from the reference set instead - see filterIcon() below) */
  var ICONS = {
    arrow: '<path class="ln" d="M5 12h14M13 6l6 6-6 6"/>',
    cal:   '<rect class="ln" x="3.5" y="5" width="17" height="15" rx="2.5"/><path class="ln" d="M8 3v4M16 3v4M3.5 10h17"/>'
  };

  var svg = function (name, extra) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"' +
           (extra ? ' class="' + extra + '"' : '') + '>' + ICONS[name] + '</svg>';
  };
  var filterIcon = function (name) {
    return '<img class="ccb-styles__chip-icon" src="' + DATA.iconBase + name + '.png" alt="" aria-hidden="true" width="26" height="22" loading="eager" decoding="async">';
  };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); };

  var filtersEl = root.querySelector("[data-styles-filters]");
  var gridEl = root.querySelector("[data-styles-grid]");
  var lang = (document.documentElement.lang || "nl").slice(0, 2);
  if (!I18N[lang]) lang = "nl";
  var active = "all";

  function bookUrl(style) { return style.freshaUrl || DATA.bookingBase; }

  function render() {
    var t = I18N[lang];

    root.querySelector('[data-i18n="title"]').textContent = t.title;
    root.querySelector('[data-i18n="sub"]').textContent = t.sub;
    root.querySelector('[data-i18n="empty"]').textContent = t.empty;
    root.querySelector('[data-i18n-text="more"]').textContent = t.more;
    filtersEl.setAttribute("aria-label", t.filterLabel);

    filtersEl.innerHTML = DATA.filters.map(function (f) {
      return '<button type="button" class="ccb-styles__chip" data-filter="' + f.id + '"' +
             ' aria-pressed="' + (f.id === active) + '">' +
             filterIcon(f.icon) + "<span>" + esc(t.filters[f.id]) + "</span></button>";
    }).join("");

    gridEl.innerHTML = DATA.styles.map(function (s) {
      var c = t.styles[s.id];
      var src = DATA.imgBase + s.img;
      return '<li class="ccb-styles__card" data-tags="' + s.tags.join(" ") + '">' +
        '<a class="ccb-styles__link" href="' + esc(bookUrl(s)) + '"' +
          ' data-track="book_style_' + s.id + '" rel="noopener">' +
          '<span class="ccb-styles__media">' +
            '<img src="' + src + '.webp"' +
            ' width="880" height="1408" loading="lazy" decoding="async" alt="' + esc(c.alt) + '">' +
            '<span class="ccb-styles__cta">' + svg("cal") + esc(t.book) + "</span>" +
          "</span>" +
          '<span class="ccb-styles__body">' +
            '<span class="ccb-styles__name">' + esc(c.name) + "</span>" +
            '<span class="ccb-styles__meta">' + esc(t.from) + " &euro;" + s.price +
              " &middot; " + s.mins + " " + esc(t.min) + "</span>" +
            svg("arrow", "ccb-styles__arrow") +
          "</span>" +
        "</a></li>";
    }).join("");

    applyFilter(active, false);
    observeCards();
  }

  /* scroll-in reveal for each card's curtain-open photo (.in, see styles-gallery.css) -
     same mechanism as the services page cards, staggered by column so a row opens
     left-to-right instead of all at once */
  var cardIo = null;
  function observeCards() {
    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(gridEl.querySelectorAll(".ccb-styles__card"), function (c) { c.classList.add("in"); });
      return;
    }
    if (cardIo) cardIo.disconnect();
    cardIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var card = entry.target;
        var cols = matchMedia("(max-width: 600px)").matches ? 2 : matchMedia("(max-width: 680px)").matches ? 3 : matchMedia("(max-width: 860px)").matches ? 4 : 6;
        var i = Array.prototype.indexOf.call(gridEl.children, card);
        card.style.setProperty("--ccb-d", ((i % cols) * 90) + "ms");
        card.classList.add("in");
        cardIo.unobserve(card);
      });
    }, { threshold: .18, rootMargin: "0px 0px -8% 0px" });
    Array.prototype.forEach.call(gridEl.querySelectorAll(".ccb-styles__card"), function (c) { cardIo.observe(c); });
  }

  function applyFilter(id, animate) {
    active = id;
    var cards = gridEl.querySelectorAll(".ccb-styles__card");
    var shown = 0;

    Array.prototype.forEach.call(cards, function (card, i) {
      var match = id === "all" || card.dataset.tags.split(" ").indexOf(id) > -1;
      if (match) shown++;

      if (!animate) {
        card.hidden = !match;
        card.classList.toggle("is-out", !match);
        card.style.transitionDelay = "";
        return;
      }

      if (match) {
        card.hidden = false;
        card.style.transitionDelay = (i * 25) + "ms";
        requestAnimationFrame(function () { card.classList.remove("is-out"); });
      } else {
        card.style.transitionDelay = "";
        card.classList.add("is-out");
        setTimeout(function () { if (card.classList.contains("is-out")) card.hidden = true; }, 250);
      }
    });

    root.classList.toggle("is-empty", shown === 0);

    Array.prototype.forEach.call(filtersEl.querySelectorAll(".ccb-styles__chip"), function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.filter === id));
    });

    if (animate) gridEl.scrollTo({ left: 0, behavior: "smooth" });
  }

  filtersEl.addEventListener("click", function (e) {
    var btn = e.target.closest(".ccb-styles__chip");
    if (btn && btn.dataset.filter !== active) applyFilter(btn.dataset.filter, true);
  });

  render();
})();
