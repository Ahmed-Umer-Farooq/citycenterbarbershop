// Live "open now" / "closed" text, computed client-side so it's always current - server-rendered
// text would go stale between deploys. Reads opening hours + this page's strings from a small
// inline JSON blob the build writes into <body data-hours> / data-status-*, so this file has
// no hard-coded Dutch or English in it. Self-contained: no-ops if those data attributes are absent.
(function () {
  var root = document.getElementById('ccb-root');
  if (!root || !root.dataset.hours) return;
  var hours = JSON.parse(root.dataset.hours);
  var strings = { openUntil: root.dataset.statusOpenUntil, opensAt: root.dataset.statusOpensAt, closed: root.dataset.statusClosed };

  function status() {
    var parts = {};
    new Intl.DateTimeFormat('en-GB', { timeZone: hours.timezone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date()).forEach(function (x) { parts[x.type] = x.value; });
    var day = hours.days[parts.weekday.toLowerCase().slice(0, 3)];
    var now = (+parts.hour) * 60 + (+parts.minute);
    var toMin = function (s) { var a = s.split(':'); return (+a[0]) * 60 + (+a[1]); };
    if (!day || !day.open) return [strings.closed, false];
    if (now < toMin(day.open)) return [strings.opensAt.replace('{time}', day.open), false];
    if (now < toMin(day.close)) return [strings.openUntil.replace('{time}', day.close), true];
    return [strings.closed, false];
  }

  function paint() {
    var s = status();
    document.querySelectorAll('[data-status-text]').forEach(function (el) { el.textContent = s[0]; });
    document.querySelectorAll('[data-live]').forEach(function (el) { el.hidden = !s[1]; });
    // One shared "are we open right now" signal, so other sections don't each
    // re-derive it from a second clock. The contact page's open/closed chip
    // reads this in CSS (see .ccb-contact__open-label in contact.css).
    root.dataset.open = s[1] ? '1' : '0';
  }

  paint();
  setInterval(paint, 60000);
})();
