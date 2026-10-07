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
  var els = document.querySelectorAll('.sp-callout, .sp-reveal');
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

/* WORKSHOP: carrusel curvo en perspectiva (guía de la dueña). 7 casos = 7 tarjetas, una por caso y sin copias: máximo 7 a la vez. Cada tarjeta tiene una
   posición continua p respecto al centro; de |p| salen sus medidas, interpoladas entre las 4 posiciones de la guía (centro grande y plano; ±1 pequeñas;
   ±2 más altas e inclinadas; ±3 muy inclinadas y desvanecidas). Un clic en cualquier tarjeta abre su caso.
   Avanza solo cada ~4.5 s (pausable con mouse, foco o botón; WCAG 2.2.2), con flechas, puntos, arrastre y teclado. Con movimiento reducido no avanza solo. */
(function () {
  var stage = document.getElementById('spCurve');
  if (!stage) return;
  var track = stage.querySelector('.sp-cv-track');
  var toggle = document.getElementById('spCurveToggle');
  var dots = [].slice.call(document.querySelectorAll('#spCvDots button'));
  var items = [].slice.call(track.querySelectorAll('.sp-cv-item'));
  var N = items.length;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce && toggle) toggle.hidden = true;
  // medidas de la guía (ancho de diseño 1983px): ancho del elemento, alto, ángulo, separación del centro y opacidad, para |p| = 0, 1, 2, 3
  var T = { w: [445, 252, 330, 270], h: [345, 332, 440, 400], a: [0, 14, 26, 54], x: [0, 352, 640, 860], o: [1, 1, 1, .55] };
  var R = Math.max(1, Math.floor((N - 1) / 2));            // cuántas tarjetas se ven a cada lado (3 con 7 casos)
  var RS = R >= 3 ? 1 : 3 / R;                              // con menos casos se estira la escala para que la más lejana quede como el borde de la guía
  var k = 1, offset = 0, target = null, last = null, visible = true, acc = 0, moved = 0, current = -1;
  var hold = { hover: false, focus: false, manual: false, drag: false };
  function paused() { return reduce || hold.hover || hold.focus || hold.manual || hold.drag; }
  function lerp(arr, ap) {
    if (ap >= 3) return arr[3] + (arr[3] - arr[2]) * Math.min(ap - 3, .6) * .5;
    var i = Math.floor(ap), f = ap - i;
    f = f * f * (3 - 2 * f);
    return arr[i] + (arr[i + 1] - arr[i]) * f;
  }
  function measure() {
    var W = stage.clientWidth;
    k = W < 720 ? 0.56 : Math.min(1.05, Math.max(0.6, W / 1983));
    stage.style.setProperty('--cv-h', Math.round(T.h[2] * 1.2 * k + 24) + 'px');
  }
  function layout() {
    var best = 0, bd = 9;
    for (var i = 0; i < N; i++) {
      var p = (((i - offset) % N) + N + N / 2) % N - N / 2;
      var ap = Math.abs(p), sg = p < 0 ? -1 : 1;
      if (ap < bd) { bd = ap; best = i; }
      var rk = Math.min(ap * RS, 3.6);
      var w = lerp(T.w, rk) * k, h = lerp(T.h, rk) * k, ang = lerp(T.a, rk), x = sg * lerp(T.x, rk) * k;
      var op = (rk >= 3 ? .55 : lerp(T.o, rk)) * Math.max(0, Math.min(1, (R + 0.5 - ap) / 0.5));
      var el = items[i];
      el.style.width = w + 'px';
      el.style.transform = 'translate3d(' + (x - w / 2) + 'px,0,0)';
      el.style.opacity = op;
      el.style.visibility = op <= 0.01 ? 'hidden' : 'visible';
      el.style.zIndex = String(100 - Math.round(ap * 10));
      var card = el.firstElementChild;
      card.style.height = h + 'px';
      card.style.top = ((stage.querySelector('.sp-cv-track').clientHeight - h) / 2) + 'px';
      card.style.fontSize = Math.max(11, w * 0.046) + 'px';
      card.style.transform = 'perspective(' + Math.round(760 * k) + 'px) rotateY(' + (-sg * ang) + 'deg)';
      var fh = Math.max(0, Math.min(1, 1 - rk / 0.9));       // en el centro se ve la foto horizontal; hacia los lados, la vertical
      card.children[0].style.opacity = fh; card.children[1].style.opacity = 1 - fh;
    }
    if (best !== current) { current = best; dots.forEach(function (d, n) { d.setAttribute('aria-current', n === best ? 'true' : 'false'); }); }
  }
  function goTo(n) { var base = Math.round(target !== null ? target : offset); target = base + (((n - base) % N) + N + N / 2) % N - N / 2; acc = -1.5; if (reduce) { offset = target; target = null; layout(); } }
  function step(d) { var base = Math.round(target !== null ? target : offset); target = base + d; acc = -1.5; if (reduce) { offset = target; target = null; layout(); } }
  function frame(ts) {
    if (last === null) last = ts;
    var dt = Math.min(0.1, (ts - last) / 1000);
    last = ts;
    if (visible) {
      if (target !== null) {
        offset += (target - offset) * Math.min(1, dt * 5.5);
        if (Math.abs(target - offset) < 0.002) { offset = target; target = null; }
      } else if (!paused()) {
        acc += dt;
        if (acc >= 4.5) { acc = 0; step(1); }
      }
      layout();
    }
    requestAnimationFrame(frame);
  }
  // flechas y puntos
  var prev = document.getElementById('spCvPrev'), next = document.getElementById('spCvNext');
  if (prev) prev.addEventListener('click', function () { step(-1); });
  if (next) next.addEventListener('click', function () { step(1); });
  dots.forEach(function (d, n) { d.addEventListener('click', function () { goTo(n); }); });
  // arrastrar: al soltar se acomoda en el caso más cercano
  var startX = 0, startOff = 0, pid = null;
  stage.addEventListener('pointerdown', function (e) { pid = e.pointerId; startX = e.clientX; startOff = offset; moved = 0; target = null; });
  stage.addEventListener('pointermove', function (e) {
    if (pid !== e.pointerId) return;
    var dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    if (moved > 6) { hold.drag = true; stage.classList.add('is-drag'); offset = startOff - dx / (330 * k); if (reduce) layout(); }
  });
  function endDrag(e) {
    if (pid !== e.pointerId) return;
    pid = null; stage.classList.remove('is-drag');
    if (hold.drag) { hold.drag = false; target = Math.round(offset); acc = -1.5; if (reduce) { offset = target; target = null; layout(); } }
  }
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);
  // clics: tras arrastrar no se abre nada; en cualquier tarjeta (central o lateral) un clic abre el caso (lo hace project-popup.js)
  stage.addEventListener('click', function (e) {
    if (moved > 6) { e.stopPropagation(); e.preventDefault(); moved = 0; }
  }, true);
  stage.addEventListener('mouseenter', function () { hold.hover = true; });
  stage.addEventListener('mouseleave', function () { hold.hover = false; });
  // foco de teclado en una tarjeta: pausa y la lleva al centro
  stage.addEventListener('focusin', function (e) {
    var item = e.target.closest && e.target.closest('.sp-cv-item');
    if (!item || !(e.target.matches && e.target.matches(':focus-visible'))) return;
    hold.focus = true; goTo(items.indexOf(item));
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

/* Puntos calientes (diseño web, SEO local y GEO): al pasar el mouse o enfocar un elemento de la lista se ilumina su lugar en la maqueta (mismo data-hs-t). */
(function () {
  [].forEach.call(document.querySelectorAll('[data-hs-group]'), function (g) {
    var triggers = [].slice.call(g.querySelectorAll('li[data-hs-t], .of-src[data-hs-t]'));
    function on(t) {
      [].forEach.call(g.querySelectorAll('[data-hs-t]'), function (e) { e.classList.toggle('is-on', e.getAttribute('data-hs-t') === t); });
    }
    triggers.forEach(function (li) {
      li.addEventListener('mouseenter', function () { on(li.getAttribute('data-hs-t')); });
      li.addEventListener('focusin', function () { on(li.getAttribute('data-hs-t')); });
      li.addEventListener('click', function () { on(li.getAttribute('data-hs-t')); });
    });
    [].forEach.call(g.querySelectorAll('.of-pin, .of-cite'), function (p) {
      p.addEventListener('mouseenter', function () { on(p.getAttribute('data-hs-t')); });
    });
    if (triggers.length) on(triggers[0].getAttribute('data-hs-t'));
    // rotan solos (sin depender del mouse): avanzan cada ~3 s mientras la maqueta está en pantalla y no se la está tocando
    var reduceHs = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (triggers.length > 1 && !reduceHs && 'IntersectionObserver' in window) {
      var idx = 0, vis = false, touching = false, timerHs = null;
      g.addEventListener('mouseenter', function () { touching = true; });
      g.addEventListener('mouseleave', function () { touching = false; });
      g.addEventListener('focusin', function () { touching = true; });
      g.addEventListener('focusout', function () { touching = false; });
      new IntersectionObserver(function (en) {
        vis = en[0].isIntersecting;
        if (vis && !timerHs) timerHs = setInterval(function () {
          if (touching) return;
          idx = (idx + 1) % triggers.length; on(triggers[idx].getAttribute('data-hs-t'));
        }, 3000);
        else if (!vis) { clearInterval(timerHs); timerHs = null; }
      }, { threshold: 0.3 }).observe(g);
    }
  });
})();

/* Escenas animadas de la sección de oferta (.seq). Un solo motor para todas: cuando la escena entra en pantalla avanza sola por sus pasos y repite;
   fuera de pantalla se detiene; el mouse encima la pausa. El CSS de cada escena reacciona a las clases que pone aquí:
   data-step="n", .cur-n (paso actual) y .on-1…on-n (pasos ya alcanzados, acumulativos).
   data-mode="build": 0 → n, se mantiene y reinicia (la escena se "construye"); data-mode="cycle": 1 → n y vuelve a 1 (rota entre pantallas).
   Con prefers-reduced-motion queda en su estado final (build) o en el primer paso (cycle). Un clic en [data-go="n"] salta a ese paso. */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  [].forEach.call(document.querySelectorAll('[data-seq]'), function (el) {
    var N = parseInt(el.getAttribute('data-steps'), 10) || 1;
    var ms = parseInt(el.getAttribute('data-ms'), 10) || 1600;
    var build = el.getAttribute('data-mode') === 'build';
    var i = build ? 0 : 1, timer = null, visible = false, hover = false;
    el.style.setProperty('--ms', ms + 'ms');
    function set(n) {
      i = n; el.setAttribute('data-step', n);
      for (var k = 1; k <= N; k++) { el.classList.toggle('on-' + k, k <= n); el.classList.toggle('cur-' + k, k === n); }
    }
    function tick() {                              // modo cycle: 1 → n → 1
      if (hover) return;
      set(i >= N ? 1 : i + 1);
    }
    function build_tick() {                        // modo build: 0 → n, pausa en el estado completo y reinicio
      if (hover) return;
      if (i === N) { i = N + 1; return; }
      if (i > N) { set(0); return; }
      set(i + 1);
    }
    function start() { if (timer || reduce) return; timer = setInterval(build ? build_tick : tick, ms); }
    function stop() { clearInterval(timer); timer = null; }
    set(reduce ? (build ? N : 1) : (build ? 0 : 1));
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting; el.classList.toggle('is-live', visible);
        if (visible) { if (build && i === 0 && !reduce) setTimeout(function () { if (visible) set(1); }, 500); start(); } else stop();
      }, { threshold: 0.35 }).observe(el);
    } else { set(build ? N : 1); }
    [].forEach.call(el.querySelectorAll('[data-go]'), function (b) {
      b.addEventListener('click', function () { set(parseInt(b.getAttribute('data-go'), 10)); stop(); if (visible) start(); });
    });
  });
})();

/* servicios.html: pestañas de las zonas del taller (una a la vez; el contenido sigue en el HTML) */
(function () {
  var list = document.querySelector('.sv-tablist');
  if (!list) return;
  var tabs = [].slice.call(list.querySelectorAll('[role="tab"]'));
  function show(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var p = document.getElementById(t.getAttribute('aria-controls'));
      if (p) p.hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(t); });
    t.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
      if (n === null) return;
      e.preventDefault();
      show(tabs[(n + tabs.length) % tabs.length], true);
    });
  });
  function fromHash() {
    var h = (location.hash || '').slice(1);
    var hit = tabs.filter(function (t) { return t.getAttribute('aria-controls') === h; })[0];
    if (hit) show(hit);
  }
  fromHash();
  window.addEventListener('hashchange', fromHash);

  // rotan solas cada ~7 s mientras la sección está en pantalla; si la persona elige una pestaña, se detiene el automático
  var reduceT = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MS = 7000, timerT = null, autoT = !reduceT && !location.hash;
  list.style.setProperty('--tabms', MS + 'ms');
  function nextTab() {
    var i = tabs.findIndex(function (t) { return t.getAttribute('aria-selected') === 'true'; });
    show(tabs[(i + 1) % tabs.length]);
  }
  function stopTabs() { clearInterval(timerT); timerT = null; list.classList.remove('is-auto'); }
  function userPicked() { autoT = false; stopTabs(); }
  list.addEventListener('click', userPicked);
  list.addEventListener('keydown', userPicked);
  if (autoT && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      if (!autoT) return;
      if (en[0].isIntersecting) { list.classList.add('is-auto'); if (!timerT) timerT = setInterval(nextTab, MS); }
      else stopTabs();
    }, { threshold: 0.35 }).observe(document.querySelector('.sv-folder'));
  }
})();
