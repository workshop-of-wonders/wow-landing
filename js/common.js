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
  /* Rangos sin encabezados de grupo: cada <option> lleva data-cur="COP" o "USD" y solo se muestran los de la moneda del país */
  var all = [].slice.call(budget.querySelectorAll('option[data-cur]'));
  all.forEach(function (o) { budget.removeChild(o); });
  function sync() {
    all.forEach(function (o) { if (o.parentNode === budget) budget.removeChild(o); });
    var v = country.value;
    var cur = v ? (v === 'Colombia' ? 'COP' : 'USD') : '';   /* Colombia: COP; cualquier otro país: USD */
    all.forEach(function (o) { var oc = o.getAttribute('data-cur'); if (cur && (oc === cur || oc === 'ANY')) budget.appendChild(o); });   /* "ANY": opción para cualquier país */
    budget.disabled = !v;
    placeholder.textContent = v ? 'Selecciona un rango' : 'Primero elige desde dónde nos contactas';
    budget.value = '';
  }
  country.addEventListener('change', sync);
  if (country.form) country.form.addEventListener('reset', function () { setTimeout(sync, 0); });
  sync();
})();

/* Desplegables del formulario de proyecto (".project-field select"): el navegador decide si la lista nativa abre hacia
   arriba o hacia abajo, y cerca del borde de la pantalla la abre hacia arriba. Aquí se reemplaza por una lista propia
   que SIEMPRE abre hacia abajo (con scroll interno si es larga). El <select> original se conserva oculto como fuente
   del valor (form.country.value, form.budget.value, etc.), así que el envío del formulario no cambia. */
(function () {
  var selects = [].slice.call(document.querySelectorAll('.project-field select'));
  if (!selects.length) return;
  var uid = 0;
  var openInst = null;

  function enhance(sel) {
    var id = 'cs' + (++uid);
    var wrap = document.createElement('div');
    wrap.className = 'cs';
    sel.parentNode.insertBefore(wrap, sel);
    wrap.appendChild(sel);
    sel.classList.add('cs-native');
    sel.setAttribute('tabindex', '-1');
    sel.setAttribute('aria-hidden', 'true');

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cs-btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    var list = document.createElement('ul');
    list.className = 'cs-list';
    list.id = id + '-list';
    list.setAttribute('role', 'listbox');
    list.hidden = true;
    btn.setAttribute('aria-controls', list.id);
    wrap.appendChild(btn);
    wrap.appendChild(list);

    var label = sel.id ? document.querySelector('label[for="' + sel.id + '"]') : null;
    if (label) {
      btn.setAttribute('aria-labelledby', label.id || (label.id = id + '-label'));
      label.addEventListener('click', function (e) { e.preventDefault(); if (!btn.disabled) btn.focus(); });
    }

    var items = [];
    var active = -1;
    var typed = '', typedAt = 0;

    function build() {
      list.innerHTML = '';
      items = [];
      [].slice.call(sel.options).forEach(function (o, i) {
        var li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.id = id + '-o' + i;
        li.textContent = o.textContent;
        li.dataset.index = String(i);
        if (!o.value && i === 0) li.classList.add('cs-placeholder');
        if (o.disabled) li.setAttribute('aria-disabled', 'true');
        list.appendChild(li);
        items.push(li);
      });
      refresh();
    }
    function refresh() {
      var o = sel.options[sel.selectedIndex];
      var isPlaceholder = !sel.value;
      btn.textContent = o ? o.textContent : '';
      btn.classList.toggle('is-placeholder', isPlaceholder);
      btn.disabled = sel.disabled;
      items.forEach(function (li, i) {
        var on = sel.options[i] && i === sel.selectedIndex;
        li.setAttribute('aria-selected', on ? 'true' : 'false');
        li.classList.toggle('is-selected', !!on);
      });
    }
    function setActive(i) {
      if (!items.length) return;
      active = Math.max(0, Math.min(items.length - 1, i));
      items.forEach(function (li, k) { li.classList.toggle('is-active', k === active); });
      btn.setAttribute('aria-activedescendant', items[active].id);
      var li = items[active];
      if (li.offsetTop < list.scrollTop) list.scrollTop = li.offsetTop;
      else if (li.offsetTop + li.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = li.offsetTop + li.offsetHeight - list.clientHeight;
    }
    function open() {
      if (btn.disabled) return;
      if (openInst && openInst !== inst) openInst.close();
      list.hidden = false;
      wrap.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      setActive(sel.selectedIndex >= 0 ? sel.selectedIndex : 0);
      openInst = inst;
      /* que la lista (siempre hacia abajo) quede a la vista dentro del modal */
      if (list.scrollIntoView) list.scrollIntoView({ block: 'nearest' });
    }
    function close() {
      list.hidden = true;
      wrap.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.removeAttribute('aria-activedescendant');
      if (openInst === inst) openInst = null;
    }
    function choose(i) {
      var o = sel.options[i];
      if (!o || o.disabled) return;
      sel.selectedIndex = i;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      refresh();
      close();
      btn.focus();
    }
    var inst = { close: close, wrap: wrap };

    btn.addEventListener('click', function () { if (list.hidden) open(); else close(); });
    list.addEventListener('mousedown', function (e) { e.preventDefault(); });
    list.addEventListener('click', function (e) {
      var li = e.target.closest('li');
      if (li) choose(parseInt(li.dataset.index, 10));
    });
    list.addEventListener('mousemove', function (e) {
      var li = e.target.closest('li');
      if (li) setActive(parseInt(li.dataset.index, 10));
    });
    btn.addEventListener('keydown', function (e) {
      var k = e.key;
      if (list.hidden) {
        if (k === 'ArrowDown' || k === 'ArrowUp' || k === 'Enter' || k === ' ') { e.preventDefault(); open(); }
        return;
      }
      if (k === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
      else if (k === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
      else if (k === 'Home') { e.preventDefault(); setActive(0); }
      else if (k === 'End') { e.preventDefault(); setActive(items.length - 1); }
      else if (k === 'Enter' || k === ' ') { e.preventDefault(); choose(active); }
      else if (k === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
      else if (k === 'Tab') { close(); }
      else if (k.length === 1) {
        var now = Date.now();
        typed = (now - typedAt > 700 ? '' : typed) + k.toLowerCase();
        typedAt = now;
        for (var j = 0; j < items.length; j++) {
          if (items[j].textContent.toLowerCase().indexOf(typed) === 0) { setActive(j); break; }
        }
      }
    });
    sel.addEventListener('change', refresh);
    if (sel.form) sel.form.addEventListener('reset', function () { setTimeout(refresh, 0); });
    new MutationObserver(build).observe(sel, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['disabled'] });
    build();
  }

  selects.forEach(enhance);
  document.addEventListener('mousedown', function (e) {
    if (openInst && !openInst.wrap.contains(e.target)) openInst.close();
  });
})();
