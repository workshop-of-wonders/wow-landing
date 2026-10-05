document.getElementById('year').textContent = new Date().getFullYear();

/* createFocusTrap is defined in js/common.js, loaded before this file. */

/* Mobile nav burger is defined in js/common.js, loaded before this file. */

/* Project form modal: opens from any [data-open-form] trigger (same behavior as index.html) */
(function () {
  var modal = document.getElementById('projectModal');
  var closeBtn = document.getElementById('projectModalClose');
  var form = document.getElementById('projectForm');
  var thanks = document.getElementById('projectFormThanks');
  var submitBtn = document.getElementById('projectSubmitBtn');
  var formError = document.getElementById('projectFormError');
  if (!modal) return;
  var projectFormFocusTrap = createFocusTrap(modal, function () { return modal.classList.contains('is-open'); });

  // Time-trap: timestamp set when the modal opens. A submit that lands faster
  // than a human could plausibly fill the form (~2s) is treated as a bot.
  var openedAt = 0;
  var MIN_FILL_MS = 2000;

  function open() {
    form.style.display = '';
    thanks.classList.remove('is-visible');
    formError.classList.remove('is-visible');
    form.reset();
    clearFieldErrors();
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    projectFormFocusTrap.onOpen();
    openedAt = Date.now();
  }
  function close() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    projectFormFocusTrap.onClose();
  }
  document.querySelectorAll('[data-open-form]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); open(); });
  });
  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  function clearFieldErrors() {
    form.querySelectorAll('.project-field.has-error').forEach(function (f) { f.classList.remove('has-error'); });
  }
  function setFieldError(input) {
    var field = input.closest('.project-field');
    if (field) field.classList.add('has-error');
  }
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Real client-side validation beyond native :invalid (inconsistent across
  // browsers) — trims whitespace and shows inline messages per field.
  function validate() {
    clearFieldErrors();
    var ok = true;
    var emailVal = form.email.value.trim();
    form.email.value = emailVal;
    if (!emailVal || !EMAIL_RE.test(emailVal)) { setFieldError(form.email); ok = false; }
    var nameVal = form.name.value.trim();
    form.name.value = nameVal;
    if (!nameVal) { setFieldError(form.name); ok = false; }
    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    formError.classList.remove('is-visible');

    // Honeypot: hidden field a real visitor never fills. If it has a value,
    // silently pretend success without processing anything.
    var isBot = !!(form.website && form.website.value.trim());
    // Time-trap: same treatment for submits faster than a human could
    // reasonably fill the form — a first-line filter only, not a
    // replacement for server-side validation once a real backend exists.
    if (openedAt && (Date.now() - openedAt) < MIN_FILL_MS) isBot = true;

    if (isBot) {
      form.style.display = 'none';
      thanks.classList.add('is-visible');
      return;
    }

    if (!validate()) return;

    // Structured payload, ready for a real submit integration once one is defined.
    var projectRequest = {
      email: form.email.value,
      name: form.name.value,
      company: form.company.value,
      need: form.need.value,
      budget: form.budget.value,
      country: form.country ? form.country.value : '',
      details: form.details.value,
      page: location.pathname
    };

    // Submits to api/contact.js, which validates and saves the lead to the
    // `leads` table (reviewed from /admin — no email notification).
    var idleLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';
    fetch('/api/contact', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(projectRequest) })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.success) { form.style.display = 'none'; thanks.classList.add('is-visible'); }
        else { formError.classList.add('is-visible'); }
      })
      .catch(function () { formError.classList.add('is-visible'); })
      .finally(function () { submitBtn.disabled = false; submitBtn.textContent = idleLabel; });
  });
})();

/* FAQ accordion is defined in js/common.js, loaded before this file. */

/* Páginas de servicio: la tarjeta de "Qué es" se anima al entrar en pantalla. */
(function () {
  var els = document.querySelectorAll('.sp-callout');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { threshold: 0.25 });
  els.forEach(function (e) { io.observe(e); });
})();

/* "Qué hacemos" de SEO: según cuántos servicios se han cruzado al hacer scroll, la fila de la marca sube un lugar y las demás se recorren. */
(function () {
  var wrap = document.querySelector('.sp-climb');
  if (!wrap) return;
  var steps = [].slice.call(wrap.querySelectorAll('.sp-cstep'));
  var others = [].slice.call(wrap.querySelectorAll('.sp-r:not(.sp-r--me)'));
  var me = wrap.querySelector('.sp-r--me');
  var chip = me.querySelector('.me-chip');
  var total = others.length;
  var current = -1;
  function apply(s) {
    var slot = total - s;                       // 0 = primer lugar
    me.style.setProperty('--slot', slot);
    me.querySelector('.n').textContent = slot + 1;
    others.forEach(function (r, j) {
      var pos = j < slot ? j : j + 1;
      r.style.setProperty('--slot', pos);
      r.querySelector('.n').textContent = pos + 1;
    });
    chip.textContent = s ? steps[s - 1].getAttribute('data-label') : 'Punto de partida';
    me.classList.toggle('is-top', s === total);
    steps.forEach(function (st, i) { st.classList.toggle('is-active', i === s - 1); });
  }
  var ticking = false;
  function update() {
    ticking = false;
    var mid = window.innerHeight * 0.55, s = 0;
    steps.forEach(function (st) { if (st.getBoundingClientRect().top < mid) s++; });
    if (s !== current) { current = s; apply(s); }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

/* "Qué hacemos" de SEO: la pregunta del título se "escribe" en la barra de búsqueda la primera vez que se ve. */
(function () {
  var vis = document.querySelector('.sp-climb-vis');
  if (!vis) return;
  if (!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) { vis.classList.add('is-typing'); io.disconnect(); }
  }, { threshold: 0.5 });
  io.observe(vis);
})();
