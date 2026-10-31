/* ===================== SECTION: where-we-are — JS START ===================== */
(function () {
  "use strict";
  var root = document.getElementById("ccb-where");
  if (!root || root.dataset.ccbWhereReady) return;
  root.dataset.ccbWhereReady = "1";


  /* ---------------- I18N — no visible text lives in the markup ---------------- */
  var I18N = {
    nl: {
      eyebrow1: "Amsterdam", line1: "Midden in de stad.",
      note1: "Je bent er al bijna, ook al weet je het nog niet.",
      eyebrow2: "Amsterdam Centraal", line2: "In de IJ-passage.",
      note2: "Binnen het station, naast de roltrappen.",
      eyebrow3: "City Center Barbershop", line3: "Twee minuten van je perron.",
      note3: "Loop gewoon binnen. Een afspraak is niet nodig."
    },
    en: {
      eyebrow1: "Amsterdam", line1: "Right in the middle of the city.",
      note1: "You are almost here already, even if you don't know it yet.",
      eyebrow2: "Amsterdam Centraal", line2: "Inside the IJ-passage.",
      note2: "Within the station, next to the escalators.",
      eyebrow3: "City Center Barbershop", line3: "Two minutes from your platform.",
      note3: "Just walk in. No appointment needed."
    }
  };

  var lang = (document.documentElement.lang || "nl").slice(0, 2);
  if (!I18N[lang]) lang = "nl";

  /* ---------------- the zoom ----------------
     Where the browser supports animation-timeline, CSS drives it natively and
     this code never runs. Everywhere else we scrub the same keyframes by
     seeking a paused animation, which keeps one definition of the motion.   */
  var track = root.querySelector(".ccb-where__track");
  var stage = root.querySelector(".ccb-where__stage");
  var scrubbed = root.querySelectorAll(".ccb-where__layer, .ccb-where__cap, .ccb-where__dot i");
  var nativeTimeline = CSS && CSS.supports && CSS.supports("animation-timeline: view()");

  if (!nativeTimeline) {
    var raf = 0;
    var seek = function () {
      raf = 0;
      var r = track.getBoundingClientRect();
      /* measure the stage, not the window. on a phone the window is taller
         than the pinned stage while the address bar is sliding away. */
      var span = r.height - stage.offsetHeight;
      var p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      for (var i = 0; i < scrubbed.length; i++) scrubbed[i].style.animationDelay = (-p) + "s";
    };
    var queue = function () { if (!raf) raf = requestAnimationFrame(seek); };
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue, { passive: true });
    seek();
  }


  function render() {
    var t = I18N[lang];
    root.querySelectorAll("[data-i]").forEach(function (el) {
      var v = t[el.dataset.i]; if (v) el.textContent = v;
    });
  }

  root.ccbSetLang = function (next) { if (I18N[next] && next !== lang) { lang = next; render(); } };

  render();
})();
/* ===================== SECTION: where-we-are — JS END ===================== */
