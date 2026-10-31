// Sticky header + hamburger drawer. Self-contained: does nothing if .ccb-header is missing,
// so this file can be dropped into a single WordPress template part on its own.
(function () {
  function initHeader(header) {
    if (!header || header.dataset.init) return;
    header.dataset.init = '1';
    let limit = 8, raf = 0;
    const measure = () => {
      const hero = document.querySelector('.ccb-hero');
      limit = hero ? Math.max(8, hero.offsetTop + hero.offsetHeight - innerHeight - 2) : 8;
      update();
    };
    const update = () => { raf = 0; header.classList.toggle('is-solid', scrollY > limit); };
    addEventListener('scroll', () => { raf ||= requestAnimationFrame(update); }, { passive: true });
    addEventListener('resize', measure, { passive: true });
    measure();

    const burger = header.querySelector('.ccb-burger');
    const drawer = document.getElementById('ccb-drawer');
    if (!burger || !drawer) return;
    let timer = 0;
    const focusables = () => [...drawer.querySelectorAll('a[href], button:not([tabindex="-1"])')];
    const open = () => {
      clearTimeout(timer);
      drawer.hidden = false;
      void drawer.offsetWidth;
      drawer.classList.add('is-open');
      burger.setAttribute('aria-expanded', 'true');
      document.documentElement.style.overflow = 'hidden';
      setTimeout(() => drawer.querySelector('.ccb-drawer__close')?.focus({ preventScroll: true }), 60);
    };
    const close = (refocus = true) => {
      if (!drawer.classList.contains('is-open')) return;
      drawer.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = '';
      timer = setTimeout(() => { drawer.hidden = true; }, 450);
      if (refocus) burger.focus({ preventScroll: true });
    };
    burger.addEventListener('click', () => (drawer.classList.contains('is-open') ? close() : open()));
    drawer.addEventListener('click', e => {
      if (e.target.closest('.ccb-drawer__subtoggle')) return;
      if (e.target.closest('[data-drawer-close]')) close();
      else if (e.target.closest('a[href]')) close(false);
    });
    drawer.addEventListener('keydown', e => {
      if (e.key === 'Escape') return close();
      if (e.key !== 'Tab') return;
      const f = focusables(), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    matchMedia('(min-width: 1021px)').addEventListener('change', e => { if (e.matches) close(false); });

    initServicesSubmenu(header, drawer);
  }

  // Services "dropdown" (desktop nav) + inline sub-list (drawer): both click-triggered
  // disclosures, not hover - hover-only menus misfire on trackpads/touch and skip keyboard
  // users. Same open/close timing pattern as the drawer itself.
  function initServicesSubmenu(header, drawer) {
    // desktop: button + absolutely positioned panel
    const navItem = header.querySelector('.ccb-header__nav .ccb-nav__item--has-menu');
    const navCaret = navItem && navItem.querySelector('.ccb-nav__caret');
    const navMenu = navItem && navItem.querySelector('.ccb-nav__menu');
    if (navItem && navCaret && navMenu) {
      let navTimer = 0;
      const navOpen = () => {
        clearTimeout(navTimer);
        navMenu.hidden = false;
        void navMenu.offsetWidth;
        navMenu.classList.add('is-open');
        navCaret.setAttribute('aria-expanded', 'true');
      };
      const navClose = () => {
        if (!navMenu.classList.contains('is-open')) return;
        navMenu.classList.remove('is-open');
        navCaret.setAttribute('aria-expanded', 'false');
        navTimer = setTimeout(() => { navMenu.hidden = true; }, 300);
      };
      navCaret.addEventListener('click', e => {
        e.stopPropagation();
        navCaret.getAttribute('aria-expanded') === 'true' ? navClose() : navOpen();
      });
      document.addEventListener('click', e => { if (!navItem.contains(e.target)) navClose(); });
      navItem.addEventListener('focusout', e => {
        if (!navItem.contains(e.relatedTarget)) navClose();
      });
      navItem.addEventListener('keydown', e => { if (e.key === 'Escape') { navClose(); navCaret.focus(); } });
      navMenu.addEventListener('click', e => { if (e.target.closest('a[href]')) navClose(); });

      // hover, mouse only: touch/keyboard still use the click/focus path above. A short
      // close delay avoids the panel vanishing while the pointer travels diagonally
      // from the link down into the menu (the classic hover-menu "dead zone" problem).
      if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
        let hoverTimer = 0;
        const hoverOpen = () => { clearTimeout(hoverTimer); navOpen(); };
        const hoverClose = () => { hoverTimer = setTimeout(navClose, 220); };
        navItem.addEventListener('mouseenter', hoverOpen);
        navItem.addEventListener('mouseleave', hoverClose);
      }
    }

    // drawer: button + inline max-height list under the Services row
    const subToggle = drawer.querySelector('.ccb-drawer__subtoggle');
    const subMenu = drawer.querySelector('.ccb-drawer__submenu');
    if (subToggle && subMenu) {
      let subTimer = 0;
      subToggle.addEventListener('click', e => {
        e.stopPropagation();
        const isOpen = subToggle.getAttribute('aria-expanded') === 'true';
        clearTimeout(subTimer);
        if (isOpen) {
          subMenu.classList.remove('is-open');
          subToggle.setAttribute('aria-expanded', 'false');
          subTimer = setTimeout(() => { subMenu.hidden = true; }, 420);
        } else {
          subMenu.hidden = false;
          void subMenu.offsetWidth;
          subMenu.classList.add('is-open');
          subToggle.setAttribute('aria-expanded', 'true');
        }
      });
    }
  }

  initHeader(document.querySelector('.ccb-header'));
})();
