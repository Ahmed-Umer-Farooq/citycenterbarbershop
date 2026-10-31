(function () {
  var root = document.getElementById("ccb-foot");
  if (!root || root.dataset.ready) return;
  root.dataset.ready = "1";

  /* ---------------- DATA ----------------
     Real facts come from data/site.json and data/hours.json (rendered onto
     #ccb-root as data-site / data-hours by build.js - the same two files the
     "Where we are" section on the home page reads, so the footer can never
     drift out of sync with the rest of the site). The literals below are only
     a fallback so the footer never renders empty if that root is missing. */
  var TODO = "TODO";
  var isSet = function (v) { return !!v && v !== TODO; };

  var ccbRoot = document.getElementById("ccb-root");
  var SITE_RAW = {};
  var HOURS_RAW = null;
  try { SITE_RAW = JSON.parse((ccbRoot && ccbRoot.dataset.site) || "{}"); } catch (e) {}
  try { HOURS_RAW = JSON.parse((ccbRoot && ccbRoot.dataset.hours) || "null"); } catch (e) {}

  var DAY_KEYS = { 0: "sun", 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri", 6: "sat" };
  var hoursByWeekday = {};
  if (HOURS_RAW && HOURS_RAW.days) {
    Object.keys(DAY_KEYS).forEach(function (wd) {
      var d = HOURS_RAW.days[DAY_KEYS[wd]];
      if (d) hoursByWeekday[wd] = [d.open, d.close];
    });
  }

  var DATA = {
    tel: isSet(SITE_RAW.phone) ? SITE_RAW.phone : "",
    telDisplay: isSet(SITE_RAW.phone_display) ? SITE_RAW.phone_display : (isSet(SITE_RAW.phone) ? SITE_RAW.phone : ""),
    whatsapp: isSet(SITE_RAW.whatsapp) ? SITE_RAW.whatsapp : "",
    mapsUrl: isSet(SITE_RAW.maps_url) ? SITE_RAW.maps_url : "https://maps.google.com/?q=Amsterdam+Centraal+IJ-passage",
    instagram: isSet(SITE_RAW.instagram_url) ? SITE_RAW.instagram_url : "",
    facebook: isSet(SITE_RAW.facebook_url) ? SITE_RAW.facebook_url : "",
    kvk: isSet(SITE_RAW.kvk) ? SITE_RAW.kvk : "",
    timeZone: (HOURS_RAW && HOURS_RAW.timezone) || "Europe/Amsterdam",
    hours: Object.keys(hoursByWeekday).length ? hoursByWeekday : {
      1: ["09:00", "21:00"], 2: ["09:00", "21:00"], 3: ["09:00", "21:00"],
      4: ["09:00", "21:00"], 5: ["09:00", "21:00"],
      6: ["09:00", "20:00"], 0: ["09:00", "20:00"]
    }
  };

  /* ---------------- I18N — no visible text lives in the markup ---------------- */
  var I18N = {
    nl: {
      blurb: "Barbershop in Amsterdam Centraal. Fades, klassieke knipbeurten en baardverzorging. Loop gerust binnen.",
      menuTitle: "Menu", contactTitle: "Contact", hoursTitle: "Openingstijden",
      menu: [["Home", "/", "home"], ["Diensten", "/diensten/", "services"], ["Prijzen", "/prijzen/", "prices"],
             ["Team", "/team/", "team"], ["Galerij", "/galerij/", "gallery"], ["Contact", "/contact/", "contact"]],
      call: "Bel ons", whatsapp: "WhatsApp", address: "IJ-passage, Amsterdam Centraal",
      todo: "nog te bevestigen",
      rowWeek: "Maandag tot vrijdag", rowWeekend: "Zaterdag en zondag", to: "tot",
      openPill: "Nu open", closedPill: "Gesloten",
      closesAt: "sluit om %s", opensAt: "opent %s om %s",
      days: ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"],
      tomorrow: "morgen",
      stripTitle: "Vlak naast Amsterdam Centraal", stripCta: "Route openen",
      kvk: "KVK nog te bevestigen",
      copy: "© %s City Center Barbershop",
      legal: [["Privacy", "#"], ["Voorwaarden", "#"]],
      backTop: "Naar boven",
      socials: "Volg ons"
    },
    en: {
      blurb: "Barbershop inside Amsterdam Centraal. Fades, classic cuts and beard care. Just walk in.",
      menuTitle: "Menu", contactTitle: "Contact", hoursTitle: "Opening hours",
      menu: [["Home", "/en/", "home"], ["Services", "/en/services/", "services"], ["Prices", "/en/prices/", "prices"],
             ["Team", "/en/team/", "team"], ["Gallery", "/en/gallery/", "gallery"], ["Contact", "/en/contact/", "contact"]],
      call: "Call us", whatsapp: "WhatsApp", address: "IJ-passage, Amsterdam Centraal",
      todo: "to be confirmed",
      rowWeek: "Monday to Friday", rowWeekend: "Saturday and Sunday", to: "to",
      openPill: "Open now", closedPill: "Closed",
      closesAt: "closes at %s", opensAt: "opens %s at %s",
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      tomorrow: "tomorrow",
      stripTitle: "Right next to Amsterdam Centraal", stripCta: "Get directions",
      kvk: "KVK to be confirmed",
      copy: "© %s City Center Barbershop",
      legal: [["Privacy", "#"], ["Terms", "#"]],
      backTop: "Back to top",
      socials: "Follow us"
    }
  };

  var lang = (document.documentElement.lang || "nl").slice(0, 2);
  if (!I18N[lang]) lang = "nl";

  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); };

  var NAVI = {};
  document.getElementById("ccb-foot-nav").content.querySelectorAll("svg")
    .forEach(function (s) { NAVI[s.dataset.k] = s; });
  var navIco = function (k) {
    var n = NAVI[k].cloneNode(true); n.removeAttribute("data-k"); n.setAttribute("aria-hidden", "true"); return n;
  };

  var ICONS = {};
  document.getElementById("ccb-foot-icons").content.querySelectorAll("svg")
    .forEach(function (s) { ICONS[s.dataset.k] = s; });
  var ico = function (k) { var n = ICONS[k].cloneNode(true); n.removeAttribute("data-k"); n.setAttribute("aria-hidden", "true"); return n; };

  /* ---------------- hours, in Amsterdam time ---------------- */
  function amsterdamNow() {
    var f = new Intl.DateTimeFormat("en-GB", {
      timeZone: DATA.timeZone, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false
    }).formatToParts(new Date());
    var get = function (t) { return (f.find(function (x) { return x.type === t; }) || {}).value; };
    var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { day: days[get("weekday")], mins: (+get("hour")) * 60 + (+get("minute")) };
  }
  var toMins = function (hm) { var p = hm.split(":"); return (+p[0]) * 60 + (+p[1]); };

  function paint() {
    var t = I18N[lang], now = amsterdamNow();
    var weekend = now.day === 0 || now.day === 6;

    root.querySelector("[data-hours]").innerHTML =
      '<div class="ccb-foot__hrow ' + (weekend ? "" : "is-today") + '"><span>' + esc(t.rowWeek) +
        "</span><b>" + DATA.hours[1][0] + " " + esc(t.to) + " " + DATA.hours[1][1] + "</b></div>" +
      '<div class="ccb-foot__hrow ' + (weekend ? "is-today" : "") + '"><span>' + esc(t.rowWeekend) +
        "</span><b>" + DATA.hours[6][0] + " " + esc(t.to) + " " + DATA.hours[6][1] + "</b></div>";

    var today = DATA.hours[now.day];
    var isOpen = today && now.mins >= toMins(today[0]) && now.mins < toMins(today[1]);
    root.querySelector("[data-status]").classList.toggle("is-closed", !isOpen);
    root.querySelector("[data-status-pill]").textContent = isOpen ? t.openPill : t.closedPill;

    var txt;
    if (isOpen) {
      txt = t.closesAt.replace("%s", today[1]);
    } else {
      var d = now.day, hops = 0;
      if (!(today && now.mins < toMins(today[0]))) {
        do { d = (d + 1) % 7; hops++; } while (!DATA.hours[d] && hops < 7);
      }
      var when = hops === 0 ? "" : (hops === 1 ? t.tomorrow : t.days[d]);
      txt = t.opensAt.replace("%s", when).replace("%s", DATA.hours[d][0]).replace(/\s+/g, " ").trim();
    }
    root.querySelector("[data-status-text]").textContent = txt;
  }

  /* the current page's own path, so the matching footer menu link can carry
     aria-current="page" (the CSS already styles that gold) - build.js has no
     server-rendered loop over these links since the menu is drawn here, so
     the match happens client-side instead, against location.pathname. */
  function samePath(a, b) {
    var norm = function (p) { return p.replace(/\/index\.html$/, "/").replace(/\/+$/, "/") || "/"; };
    return norm(a) === norm(b);
  }

  function render() {
    var t = I18N[lang];

    root.querySelectorAll("[data-i]").forEach(function (el) {
      var v = t[el.dataset.i]; if (v) el.textContent = v;
    });

    /* socials */
    var soc = root.querySelector("[data-socials]");
    soc.innerHTML = "";
    soc.setAttribute("aria-label", t.socials);
    [["instagram", DATA.instagram, "Instagram"], ["whatsapp", DATA.whatsapp ? "https://wa.me/" + DATA.whatsapp.replace(/\D/g, "") : "", "WhatsApp"],
     ["facebook", DATA.facebook, "Facebook"]].forEach(function (s) {
      var a = document.createElement("a");
      a.className = "ccb-foot__soc"; a.href = s[1] || "#"; a.setAttribute("aria-label", s[2]);
      if (s[1] && s[1] !== "#") { a.target = "_blank"; a.rel = "noopener"; }
      a.appendChild(ico(s[0])); soc.appendChild(a);
    });

    /* menu */
    var menu = root.querySelector("[data-menu]");
    menu.innerHTML = "";
    t.menu.forEach(function (m) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.className = "ccb-foot__link"; a.href = m[1];
      if (samePath(location.pathname, m[1])) a.setAttribute("aria-current", "page");
      a.appendChild(navIco(m[2]));
      /* the label is split into letters so each one can roll on its own.
         the real word stays readable to screen readers via aria-label.   */
      var roll = document.createElement("span");
      roll.className = "ccb-roll"; roll.setAttribute("aria-hidden", "true");
      m[0].split("").forEach(function (ch, i) {
        var s = document.createElement("span");
        s.className = "l"; s.style.setProperty("--i", i);
        s.dataset.l = ch; s.textContent = ch;
        roll.appendChild(s);
      });
      a.appendChild(roll);
      a.setAttribute("aria-label", m[0]);
      li.appendChild(a); menu.appendChild(li);
    });

    /* contact */
    var rows = root.querySelector("[data-contact]");
    rows.innerHTML = "";
    var add = function (iconKey, label, href) {
      var li = document.createElement("li"); li.className = "ccb-foot__row";
      var box = document.createElement("span"); box.className = "ccb-foot__ico"; box.appendChild(ico(iconKey));
      li.appendChild(box);
      if (href) {
        var a = document.createElement("a"); a.href = href; a.textContent = label; li.appendChild(a);
      } else {
        var sp = document.createElement("span"); sp.textContent = label;
        if (label.indexOf(t.todo) !== -1) sp.className = "ccb-foot__todo";
        li.appendChild(sp);
      }
      rows.appendChild(li);
    };
    add("phone", DATA.telDisplay || (t.call + ": " + t.todo), DATA.tel ? "tel:" + DATA.tel.replace(/\s/g, "") : "");
    add("whatsapp", DATA.whatsapp || (t.whatsapp + ": " + t.todo), DATA.whatsapp ? "https://wa.me/" + DATA.whatsapp.replace(/\D/g, "") : "");
    add("pin", t.address, DATA.mapsUrl);

    /* strip and legal */
    root.querySelector("[data-maps]").href = DATA.mapsUrl;
    root.querySelector("[data-copy]").textContent =
      t.copy.replace("%s", new Date().getFullYear());
    root.querySelector('[data-i="kvk"]').textContent = DATA.kvk ? "KVK " + DATA.kvk : t.kvk;
    root.querySelector("[data-legal]").innerHTML = t.legal.map(function (l) {
      return '<a href="' + esc(l[1]) + '">' + esc(l[0]) + "</a>";
    }).join("");

    paint();
  }

  /* the logo and the columns lift in once, when the footer comes into view */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { root.classList.add("is-in"); io.disconnect(); } });
    }, { threshold: .18 });
    io.observe(root);
  } else {
    root.classList.add("is-in");
  }

  root.querySelector("[data-top]").addEventListener("click", function (e) {
    e.preventDefault();
    var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });

  root.ccbSetLang = function (next) { if (I18N[next] && next !== lang) { lang = next; render(); } };

  render();
  setInterval(paint, 60000);   // keep "open now" honest while the tab stays open
})();
