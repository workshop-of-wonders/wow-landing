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


/* Formulario de proyecto: el presupuesto depende de desde dónde nos contactan. "Colombia" muestra los rangos en
   COP y cualquier otro país (o "Otro país") los rangos en USD; mientras no se elija, el presupuesto queda desactivado. Sin JavaScript el
   desplegable muestra ambos grupos (cada rango lleva su moneda). Compartido por todas las páginas con el formulario. */
(function () {
  var country = document.getElementById('pfCountry');
  var budget = document.getElementById('pfBudget');
  if (!country || !budget) return;
  var placeholder = budget.options[0];
  var groups = { co: null, intl: null };
  [].slice.call(budget.querySelectorAll('optgroup')).forEach(function (g) {
    if (/COP/.test(g.label)) groups.co = g; else if (/USD/.test(g.label)) groups.intl = g;
    budget.removeChild(g);
  });
  function sync() {
    ['co', 'intl'].forEach(function (k) { if (groups[k] && groups[k].parentNode === budget) budget.removeChild(groups[k]); });
    var v = country.value ? (country.value === 'Colombia' ? 'co' : 'intl') : '';   /* Colombia: COP; cualquier otro país: USD */
    if (v && groups[v]) budget.appendChild(groups[v]);
    budget.disabled = !v;
    placeholder.textContent = v ? 'Selecciona un rango' : 'Primero elige desde dónde nos contactas';
    budget.value = '';
  }
  country.addEventListener('change', sync);
  if (country.form) country.form.addEventListener('reset', function () { setTimeout(sync, 0); });
  sync();
})();
