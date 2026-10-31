(function () {
  var nav = document.getElementById('ccb-prices-nav');
  var bar = document.getElementById('ccb-prices-bar');
  if (!nav || !bar) return;
  var items = Array.prototype.slice.call(nav.querySelectorAll('.nav-i'));
  var secs = Array.prototype.slice.call(document.querySelectorAll('.ccb-prices-board .sec'));

  function place(el) {
    bar.style.top = el.offsetTop + 'px';
    bar.style.height = el.offsetHeight + 'px';
  }
  function pick(el, focusMode) {
    items.forEach(function (i) { i.classList.toggle('on', i === el); });
    place(el);
    secs.forEach(function (s) {
      s.classList.toggle('dim', focusMode && s.getAttribute('data-t') !== el.getAttribute('data-t'));
    });
  }
  items.forEach(function (el) {
    el.addEventListener('mouseenter', function () { pick(el, true); });
    el.addEventListener('focus', function () { pick(el, true); });
    el.addEventListener('click', function () { pick(el, true); });
  });
  nav.addEventListener('mouseleave', function () {
    secs.forEach(function (s) { s.classList.remove('dim'); });
  });
  window.addEventListener('resize', function () {
    var active = nav.querySelector('.nav-i.on');
    if (active) place(active);
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { if (items[0]) place(items[0]); });
  }
  if (items[0]) place(items[0]);
})();
