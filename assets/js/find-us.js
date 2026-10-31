/* ===================== SECTION: find-us — JS START ===================== */
(function () {
  var root = document.getElementById("ccb-find");
  if (!root || root.dataset.ready) return;
  root.dataset.ready = "1";

  /* ---------------- DATA — the only place facts live ----------------
     TODO before launch: real phone number, real Google listing, the real
     walking times, and the real landmark for stop three.               */
  var DATA = {
    tel: "+31000000000",
    mapsUrl: "https://maps.google.com/?q=Amsterdam+Centraal+IJ-passage",
    timeZone: "Europe/Amsterdam",
    legs: ["1", "1"],                                    // minutes between stops
    hours: { 1: ["09:00", "21:00"], 2: ["09:00", "21:00"], 3: ["09:00", "21:00"],
             4: ["09:00", "21:00"], 5: ["09:00", "21:00"],
             6: ["09:00", "20:00"], 0: ["09:00", "20:00"] }
  };

  /* ---------------- read the real facts from the site's own data files -----
     data/site.json supplies tel + mapsUrl (written onto this section's root
     as data-tel / data-maps-url by build.js), data/hours.json supplies the
     week (written onto #ccb-root as data-hours, same blob status.js reads).
     A "TODO" placeholder value is treated as absent, so the section still
     renders with the fallbacks above rather than a dead link or empty hours. */
  (function readSiteData() {
    var tel = root.dataset.tel;
    if (tel && tel !== "TODO") DATA.tel = tel;

    var mapsUrl = root.dataset.mapsUrl;
    if (mapsUrl && mapsUrl !== "TODO") DATA.mapsUrl = mapsUrl;

    var ccbRoot = document.getElementById("ccb-root");
    if (ccbRoot && ccbRoot.dataset.hours) {
      try {
        var hours = JSON.parse(ccbRoot.dataset.hours);
        if (hours.timezone) DATA.timeZone = hours.timezone;
        if (hours.days) {
          var map = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
          var next = {};
          var complete = true;
          Object.keys(map).forEach(function (key) {
            var day = hours.days[key];
            if (day && day.open && day.close) next[map[key]] = [day.open, day.close];
            else complete = false;
          });
          if (complete) DATA.hours = next;
        }
      } catch (e) { /* malformed data-hours: keep the fallback week above */ }
    }
  })();

  /* ---------------- I18N — no visible text lives in the markup ---------------- */
  var I18N = {
    nl: {
      eyebrow: "City Center Barbershop · Amsterdam Centraal",
      title: "Zo vind je ons",
      sub: "Twee minuten van je perron.",
      stops: [
        ["Verlaat je perron", "Volg de borden naar de uitgang IJ-zijde."],
        ["Loop de IJ-passage in", "Rechtdoor, langs de kaartautomaten."],
        ["Wij zitten aan je linkerhand", "TODO: exacte plek bevestigen met de klant."]
      ],
      leg: "%s min lopen",
      call: "Bel ons", maps: "Open in Google Maps",
      openPill: "Nu open", closedPill: "Gesloten",
      closesAt: "sluit om <b>%s</b>", opensAt: "opent %s om <b>%s</b>",
      rowWeek: "Maandag tot vrijdag", rowWeekend: "Zaterdag en zondag", to: "tot",
      days: ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"],
      tomorrow: "morgen",
      trust: ["Zonder afspraak welkom", "Pinnen en contactloos", "Nederlands, Engels en Arabisch"]
    },
    en: {
      eyebrow: "City Center Barbershop · Amsterdam Centraal",
      title: "How to find us",
      sub: "Two minutes from your platform.",
      stops: [
        ["Leave your platform", "Follow the signs to the IJ-side exit."],
        ["Walk the IJ-passage", "Straight ahead, past the ticket machines."],
        ["We are on your left", "TODO: confirm the exact spot with the client."]
      ],
      leg: "%s min walk",
      call: "Call us", maps: "Open in Google Maps",
      openPill: "Open now", closedPill: "Closed",
      closesAt: "closes at <b>%s</b>", opensAt: "opens %s at <b>%s</b>",
      rowWeek: "Monday to Friday", rowWeekend: "Saturday and Sunday", to: "to",
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      tomorrow: "tomorrow",
      trust: ["Walk-ins welcome", "Card and contactless", "Dutch, English and Arabic spoken"]
    }
  };

  var lang = (document.documentElement.lang || "nl").slice(0, 2);
  if (!I18N[lang]) lang = "nl";

  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); };

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
    var isWeekend = now.day === 0 || now.day === 6;

    root.querySelector("[data-rows]").innerHTML =
      '<p class="ccb-find__row ' + (isWeekend ? "" : "is-today") + '">' +
        esc(t.rowWeek) + "  <b>" + DATA.hours[1][0] + " " + esc(t.to) + " " + DATA.hours[1][1] + "</b></p>" +
      '<p class="ccb-find__row ' + (isWeekend ? "is-today" : "") + '">' +
        esc(t.rowWeekend) + "  <b>" + DATA.hours[6][0] + " " + esc(t.to) + " " + DATA.hours[6][1] + "</b></p>";

    var today = DATA.hours[now.day];
    var isOpen = today && now.mins >= toMins(today[0]) && now.mins < toMins(today[1]);
    root.querySelector("[data-status]").classList.toggle("is-closed", !isOpen);
    root.querySelector("[data-status-pill]").textContent = isOpen ? t.openPill : t.closedPill;

    var closes = root.querySelector("[data-closes]");
    if (isOpen) {
      closes.innerHTML = t.closesAt.replace("%s", today[1]);
    } else {
      var d = now.day, hops = 0;
      if (!(today && now.mins < toMins(today[0]))) {
        do { d = (d + 1) % 7; hops++; } while (!DATA.hours[d] && hops < 7);
      }
      var when = hops === 0 ? "" : (hops === 1 ? t.tomorrow : t.days[d]);
      closes.innerHTML = t.opensAt.replace("%s", esc(when)).replace("%s", DATA.hours[d][0]).replace(/\s+/g, " ").trim();
    }
  }

  function render() {
    var t = I18N[lang];

    root.querySelectorAll("[data-i]").forEach(function (el) {
      var v = t[el.dataset.i]; if (v) el.textContent = v;
    });

    /* Ring centres measured off the drawing itself: 321, 1404 and 2494 of
       2752 across, which is 80.3, 351 and 623.5 in its traced space.     */
    var CX = [80.3, 351, 623.5], ART_W = 688, ART_H = 101, R = 101/2;
    var pct = function (i) { return (CX[i] / ART_W * 100).toFixed(2) + "%"; };

    root.querySelector("[data-pins]").innerHTML =
      t.stops.map(function (s, i) {
        var leg = i > 0
          ? '<span class="ccb-find__leg" style="--x:' +
            ((CX[i - 1] + CX[i]) / 2 / ART_W * 100).toFixed(2) + '%">' +
            esc(t.leg.replace("%s", DATA.legs[i - 1])) + "</span>"
          : "";
        return leg + '<div class="ccb-find__pin" style="--x:' + pct(i) + '"><b>' +
               esc(s[0]) + "</b><span>" + esc(s[1]) + "</span></div>";
      }).join("");

    root.querySelector("[data-stops]").innerHTML =
      t.stops.map(function (s, i) {
        var leg = i > 0 ? "<i>" + esc(t.leg.replace("%s", DATA.legs[i - 1])) + "</i>" : "";
        return '<li class="ccb-find__stop">' +
          '<svg class="ccb-find__mark" viewBox="' + (CX[i] - R).toFixed(1) + ' 0 ' + ART_H + ' ' + ART_H +
          '" aria-hidden="true"><use href="#ccb-marks"/></svg>' +
          '<div class="ccb-find__slabel">' + leg + "<b>" + esc(s[0]) + "</b><span>" + esc(s[1]) + "</span></div></li>";
      }).join("");

    root.querySelector("[data-trust]").innerHTML =
      t.trust.map(function (x) { return "<span>" + esc(x) + "</span>"; }).join("");

    root.querySelector("[data-maps]").href = DATA.mapsUrl;
    root.querySelector("[data-tel]").href = "tel:" + DATA.tel.replace(/\s/g, "");
    paint();
  }

  /* ---------------- reveal: the track draws itself once, on arrival ---------------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { root.classList.add("is-in"); io.disconnect(); } });
    }, { threshold: .22 });
    io.observe(root);
  } else {
    root.classList.add("is-in");
  }

  root.ccbSetLang = function (next) { if (I18N[next] && next !== lang) { lang = next; render(); } };

  render();
  setInterval(paint, 60000);   // keep "open now" honest while the tab stays open
})();
/* ===================== SECTION: find-us — JS END ===================== */
