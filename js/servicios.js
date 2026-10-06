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

/* WORKSHOP: muro curvo en perspectiva. Cada casilla tiene una posición continua p respecto al centro; de |p| salen sus tres medidas, tomadas de la imagen de
   referencia de la dueña: ancho del elemento (casi constante al centro y creciendo de golpe hacia los extremos), ángulo rotateY (de cara al centro, ~52° en
   |p|=3) y proporción alto/ancho. La x sale de integrar el ancho visible (ancho·cos del ángulo) + hueco, así el espaciado es parejo. N casos y M=2N
   casillas (las copias son decorativas y reenvían el clic al original). Avanza sola, pausable con mouse, foco o botón (WCAG 2.2.2), y se arrastra. */
(function () {
  var stage = document.getElementById('spCurve');
  if (!stage) return;
  var track = stage.querySelector('.sp-cv-track');
  var toggle = document.getElementById('spCurveToggle');
  var caption = document.getElementById('spCvCaption');
  var originals = [].slice.call(track.querySelectorAll('.sp-cv-item'));
  var N = originals.length, M = N * 2;
  var slots = originals.slice();
  for (var k = N; k < M; k++) {
    var src = originals[k % N];
    var cl = src.cloneNode(true);
    cl.setAttribute('aria-hidden', 'true');
    var cc = cl.querySelector('.sp-cv-card');
    cc.removeAttribute('data-project');            // así project-popup.js no lo trata como un caso más
    cc.setAttribute('data-clone', '');
    cc.addEventListener('click', (function (orig) { return function () { orig.click(); }; })(src.querySelector('.sp-cv-card')));
    track.appendChild(cl);
    slots.push(cl);
  }
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce && toggle) toggle.hidden = true;
  var SPEED = 0.16;                   // casos por segundo (≈ 6 s por caso)
  var offset = 0, target = null, last = null, visible = true, shown = -1;
  var hold = { hover: false, focus: false, manual: false, drag: false };
  var w0, gap, cardH, table = [], STEP = 0.05, PMAX = 7.5, spacing = 100;
  function paused() { return reduce || hold.hover || hold.focus || hold.manual || hold.drag; }
  function wEl(ap) { return w0 * (1 + 0.045 * Math.pow(Math.min(ap, 3.3), 3.4)); }
  function ang(ap) { return Math.min(58, 52 * Math.pow(Math.min(ap, 3.6) / 3, 1.7)); }
  function ratio(ap) { return Math.max(0.95, 1.45 - 0.41 * Math.pow(Math.min(ap, 3.3) / 3, 1.6)); }
  function vis(ap) { return wEl(ap) * Math.cos(ang(ap) * Math.PI / 180); }
  function measure() {
    var W = stage.clientWidth;
    var k = W < 720 ? W / 931 * 1.6 : Math.min(1.1, W / 931 * 0.7);
    w0 = 87 * k; gap = 8 * k + 2;
    cardH = Math.round(wEl(3.3) * ratio(3.3) * 1.18);
    stage.style.setProperty('--cv-h', (cardH + 10) + 'px');
    table = [0];
    for (var i = 1; i <= PMAX / STEP; i++) table.push(table[i - 1] + (vis((i - 0.5) * STEP) + gap) * STEP);
    spacing = table[Math.round(2 / STEP)] / 2;
  }
  function xOf(ap) {
    var f = Math.min(ap, PMAX - STEP) / STEP, i = Math.floor(f);
    return table[i] + (table[i + 1] - table[i]) * (f - i);
  }
  function layout() {
    var best = 0, bd = 1e9;
    for (var i = 0; i < M; i++) {
      var p = (((i - offset) % M) + M + M / 2) % M - M / 2;
      var ap = Math.abs(p), sg = p < 0 ? -1 : 1;
      if (ap < bd) { bd = ap; best = i; }
      var w = wEl(ap), h = w * ratio(ap), x = sg * xOf(ap);
      var el = slots[i];
      el.style.width = w + 'px';
      el.style.transform = 'translate3d(' + (x - w / 2) + 'px,0,0)';
      var hide = ap > 5.8;
      el.style.visibility = hide ? 'hidden' : 'visible';
      el.style.zIndex = String(100 - Math.round(ap * 10));
      var card = el.firstElementChild;
      card.style.height = h + 'px';
      card.style.top = ((cardH - h) / 2) + 'px';
      card.style.transform = 'perspective(600px) rotateY(' + (-sg * ang(ap)) + 'deg)';
    }
    var idx = best % N;
    if (idx !== shown && caption) { shown = idx; setCaption(idx); }
  }
  function setCaption(idx) {
    var it = originals[idx];
    caption.classList.add('is-swap');
    setTimeout(function () {
      caption.querySelector('b').textContent = '#' + it.getAttribute('data-n');
      caption.querySelector('span').textContent = it.querySelector('.sp-cv-card').getAttribute('data-project');
      caption.querySelector('small').textContent = it.getAttribute('data-what');
      caption.classList.remove('is-swap');
    }, shown === idx && caption.querySelector('span').textContent === '' ? 0 : 160);
  }
  function frame(ts) {
    if (last === null) last = ts;
    var dt = Math.min(0.1, (ts - last) / 1000);
    last = ts;
    if (visible) {
      if (target !== null) {
        offset += (target - offset) * Math.min(1, dt * 6);
        if (Math.abs(target - offset) < 0.002) { offset = target; target = null; }
      } else if (!paused()) offset += SPEED * dt;
      layout();
    }
    requestAnimationFrame(frame);
  }
  // arrastrar
  var startX = 0, startOff = 0, moved = 0, pid = null;
  stage.addEventListener('pointerdown', function (e) { pid = e.pointerId; startX = e.clientX; startOff = offset; moved = 0; target = null; });
  stage.addEventListener('pointermove', function (e) {
    if (pid !== e.pointerId) return;
    var dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    if (moved > 6) { hold.drag = true; stage.classList.add('is-drag'); offset = startOff - dx / spacing; if (reduce) layout(); }
  });
  function endDrag(e) { if (pid !== e.pointerId) return; pid = null; hold.drag = false; stage.classList.remove('is-drag'); }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  // si se arrastró, el clic que sigue no debe abrir un caso
  stage.addEventListener('click', function (e) { if (moved > 6) { e.stopPropagation(); e.preventDefault(); moved = 0; } }, true);
  stage.addEventListener('mouseenter', function () { hold.hover = true; });
  stage.addEventListener('mouseleave', function () { hold.hover = false; });
  // foco de teclado: pausa y centra la tarjeta enfocada
  stage.addEventListener('focusin', function (e) {
    var item = e.target.closest && e.target.closest('.sp-cv-item');
    if (!item || !(e.target.matches && e.target.matches(':focus-visible'))) return;
    hold.focus = true;
    var idx = originals.indexOf(item);
    target = idx + Math.round((offset - idx) / M) * M;
  });
  stage.addEventListener('focusout', function () { hold.focus = false; });
  // al cerrar un caso el foco vuelve a la tarjeta: si el mouse ya no está encima, se reanuda
  document.addEventListener('pointermove', function () { if (hold.focus && !stage.matches(':hover')) hold.focus = false; });
  if (toggle) toggle.addEventListener('click', function () {
    hold.manual = !hold.manual;
    toggle.setAttribute('aria-pressed', hold.manual ? 'true' : 'false');
    toggle.querySelector('.sp-cv-ic').textContent = hold.manual ? '▶' : '❚❚';
    toggle.querySelector('.sp-cv-tx').textContent = hold.manual ? 'Reanudar' : 'Pausar';
  });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; last = null; }).observe(stage);
  document.addEventListener('visibilitychange', function () { last = null; });
  window.addEventListener('resize', function () { measure(); layout(); });
  measure(); layout();
  requestAnimationFrame(frame);
})();
