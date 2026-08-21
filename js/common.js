/* Minimal modal focus trap: keeps Tab/Shift+Tab cycling within `modalEl`
   while `isOpen()` returns true, and restores focus to whatever triggered
   the modal when it closes. Shared by index.html, portafolio.html and
   servicios.html — used by their case-study lightbox and/or project-form
   modal. */
function createFocusTrap(modalEl, isOpen) {
  var lastFocused = null;
  function focusables() {
    return Array.prototype.slice.call(
      modalEl.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !isOpen()) return;
    var items = focusables();
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
  return {
    onOpen: function () {
      lastFocused = document.activeElement;
      var items = focusables();
      if (items.length) items[0].focus();
    },
    onClose: function () {
      if (lastFocused && lastFocused.focus) lastFocused.focus();
      lastFocused = null;
    }
  };
}

/* FAQ accordion. Shared by index.html and servicios.html — a no-op on
   pages (like portafolio.html) with no .svc-faq-q elements. */
(function () {
  document.querySelectorAll('.svc-faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.svc-faq-item');
      var wasOpen = item.classList.contains('is-open');
      document.querySelectorAll('.svc-faq-item').forEach(function (i) {
        i.classList.remove('is-open');
        i.querySelector('.svc-faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

/* Mobile nav burger: toggles the floating glass menu. Shared by all pages —
   a no-op if #navBurger/#navMobileMenu aren't present. */
(function () {
  var burger = document.getElementById('navBurger');
  var menu = document.getElementById('navMobileMenu');
  var closeBtn = document.getElementById('navMobileClose');
  if (!burger || !menu) return;
  function setOpen(isOpen) {
    burger.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    menu.classList.toggle('is-open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }
  burger.addEventListener('click', function () {
    setOpen(!menu.classList.contains('is-open'));
  });
  if (closeBtn) closeBtn.addEventListener('click', function () { setOpen(false); });
  menu.addEventListener('click', function (e) {
    if (e.target === menu) setOpen(false);
  });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setOpen(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });
})();
