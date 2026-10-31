// Minimal cookie-consent banner. Self-contained: no-ops if #ccb-cookie is missing.
(function () {
  var KEY = 'ccb-cookie-consent';
  var banner = document.getElementById('ccb-cookie');
  if (!banner) return;
  var stored;
  try { stored = localStorage.getItem(KEY); } catch (e) { stored = null; }
  if (!stored) banner.hidden = false;

  function set(value) {
    try { localStorage.setItem(KEY, value); } catch (e) {}
    banner.hidden = true;
  }

  banner.addEventListener('click', function (e) {
    if (e.target.closest('[data-cookie-accept]')) set('accepted');
    else if (e.target.closest('[data-cookie-decline]')) set('declined');
  });
})();
