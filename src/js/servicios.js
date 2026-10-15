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
})();

/* SEO: simulador de posiciones en el tiempo */
(function () {
  var list = document.getElementById('ssList');
  if (!list) return;
  var range = document.getElementById('ssRange'), off = document.getElementById('ssOff');
  var pos = [28, 24, 19, 15, 12, 9, 7, 5, 4, 3, 2, 2, 1];
  var rivals = [['competidor-uno.co', 'Líderes del sector | Competidor 1', 'C1'], ['directorio-local.co', 'Ranking: los 10 mejores proveedores', 'D'], ['competidor-dos.co', 'Cotiza hoy | Competidor 2', 'C2'], ['foro-empresas.com', '¿Alguien recomienda un proveedor?', 'F'], ['competidor-tres.com', 'Expertos desde 2010 | Competidor 3', 'C3'], ['competidor-cuatro.com', 'Soluciones para tu empresa | Competidor 4', 'C4']];
  function row(rank, d, me) {
    var li = document.createElement('li');
    li.className = 'ss-row' + (me ? ' ss-row--me' : '');
    li.innerHTML = '<span class="ss-rk">#' + rank + '</span><span class="ss-av">' + d[2] + '</span><div><small>' + d[0] + '</small><strong>' + d[1] + '</strong></div>';
    return li;
  }
  function update() {
    var m = +range.value, p = pos[m], shown = Math.min(p, 6), r = 0;
    list.innerHTML = '';
    for (var i = 1; i <= 6; i++) {
      list.appendChild(i === shown && p <= 6 ? row(i, ['tumarca.com', 'Tu marca: justo lo que tu cliente necesita', 'TÚ'], true) : row(i, rivals[r++], false));
    }
    off.hidden = p <= 6;
    if (p > 6) off.textContent = 'Tu marca está en el puesto #' + p + ' · pocos clientes llegan hasta ahí.';
    document.getElementById('ssMonth').textContent = m === 0 ? 'INICIO' : 'MES ' + m;
    document.getElementById('ssPos').textContent = '#' + p;
    document.getElementById('ssPage').textContent = Math.ceil(p / 10);
    document.getElementById('ssVis').textContent = p <= 3 ? 'MÁXIMO' : p <= 10 ? 'MEDIO' : 'MÍNIMO';
  }
  range.addEventListener('input', update);
  update();
})();

/* Simuladores por servicio: <section data-sim> + <script type="application/json"> con la configuración */
(function () {
  var fmt = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });
  function val(n, f) { n = isFinite(n) ? n : 0; return f === 'money' ? '$' + fmt.format(Math.round(n)) : f === 'pct' ? (Math.round(n * 10) / 10).toString().replace('.', ',') + '%' : fmt.format(Math.round(n)); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function head(sec, c) {
    head.n = (head.n || 0) + 1;
    var tid = 'simTitle' + (head.n > 1 ? head.n : '');
    sec.setAttribute('aria-labelledby', tid);
    var h = el('div', 'sd-head', '<p class="eyebrow">' + c.eyebrow + '</p><h2 id="' + tid + '">' + c.title + '</h2><p class="sd-sub">' + c.sub + '</p>');
    sec.appendChild(h);
  }
  function cta(c) { return '<a href="#contacto" class="btn btn-primary" data-open-form>' + c.cta + ' <span aria-hidden="true">→</span></a>'; }

  /* Chequeo tipo quiz: una pregunta a la vez (Sí = 100 % del peso, En parte = 50 %, No = 0). */
  var ANS = [['Sí', 1, 'yes'], ['En parte', 0.5, 'half'], ['No', 0, 'no']];
  function buildCheck(sec, c) {
    head(sec, c);
    var n = c.qs.length, cuts = [30, 60, 85, 101], a = [], i = 0, uid = head.n;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var box = el('div', 'qz'); box.setAttribute('aria-live', 'polite');
    sec.appendChild(box);
    function score() { return Math.round(c.qs.reduce(function (t, q, k) { return t + (a[k] == null ? 0 : q.w * a[k]); }, 0)); }
    function ring(total) { return '<div class="sd-ring"><svg viewBox="0 0 200 200" aria-hidden="true"><circle class="sd-ring-bg" cx="100" cy="100" r="88"/><circle class="sd-ring-fg" cx="100" cy="100" r="88" style="stroke-dashoffset:' + (553 * (1 - total / 100)) + '"/></svg><div class="sd-score"><strong>' + total + '</strong><span>DE 100</span></div></div>'; }
    function intro() {
      box.className = 'qz qz--in';
      box.innerHTML = '<div class="qz-card qz-intro"><p class="qz-meta">' + n + ' PREGUNTAS · MENOS DE 2 MINUTOS</p><h3>Responde con sinceridad: el resultado solo sirve si es real.</h3><p>Tu puntaje y tus prioridades aparecen al terminar. El cálculo ocurre en tu pantalla.</p><button type="button" class="btn btn-primary qz-start">Empezar <span aria-hidden="true">→</span></button></div>';
      box.querySelector('.qz-start').addEventListener('click', function () { i = 0; a = []; question(1); if (window.gtag) window.gtag('event', 'sim_start', { sim: sec.id, page: location.pathname }); });
    }
    function question(dir) {
      var q = c.qs[i];
      box.className = 'qz qz--q';
      box.innerHTML =
        '<div class="qz-top"><span class="qz-count">PREGUNTA ' + (i + 1) + ' DE ' + n + '</span><div class="qz-bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + n + '" aria-valuenow="' + i + '"><i style="width:' + (i / n * 100) + '%"></i></div></div>' +
        '<div class="qz-card qz-q' + (reduce ? '' : dir > 0 ? ' qz-from-r' : ' qz-from-l') + '"><h3 class="qz-text" id="qzq' + uid + '" tabindex="-1">' + q.q + '</h3><div class="qz-ans" role="group" aria-labelledby="qzq' + uid + '"></div>' +
        '<div class="qz-foot">' + (i ? '<button type="button" class="qz-back">← Atrás</button>' : '<span></span>') + '<span class="qz-hint">Atajos: 1 · 2 · 3</span></div></div>';
      var wrap = box.querySelector('.qz-ans');
      ANS.forEach(function (o, k) {
        var b = el('button', 'qz-opt qz-' + o[2] + (a[i] === o[1] ? ' is-on' : ''), '<kbd>' + (k + 1) + '</kbd><span>' + o[0] + '</span>'); b.type = 'button';
        b.addEventListener('click', function () { pick(o[1], b); });
        wrap.appendChild(b);
      });
      var back = box.querySelector('.qz-back');
      if (back) back.addEventListener('click', function () { i--; question(-1); });
      if (dir) box.querySelector('.qz-text').focus({ preventScroll: true });
    }
    function pick(v, b) {
      if (box.classList.contains('is-busy')) return;
      a[i] = v; b.classList.add('is-on'); box.classList.add('is-busy');
      setTimeout(function () {
        box.classList.remove('is-busy');
        if (i < n - 1) { i++; question(1); } else result();
      }, reduce ? 0 : 260);
    }
    function result() {
      if (window.WOWSim && window.WOWLead) return window.WOWSim.result(box, c, a, sec, intro, { cta: cta, el: el });
      var total = score(), t = c.tiers[cuts.findIndex(function (x) { return total < x; })] || c.tiers[3];
      var gaps = c.qs.map(function (q, k) { return { q: q, k: k, lost: q.w * (1 - a[k]) }; }).filter(function (g) { return g.lost > 0; }).sort(function (x, y) { return y.lost - x.lost; });
      var strong = c.qs.filter(function (q, k) { return a[k] === 1; });
      box.className = 'qz qz--r';
      box.innerHTML = '<div class="qz-card qz-res"><div class="qz-res-top">' + ring(0) + '<div><h3>' + t[0] + '</h3><p>' + t[1] + '</p></div></div>' +
        '<div class="qz-cols"><div><p class="sd-steps-t">POR DÓNDE EMPEZAR</p><ol class="qz-steps"></ol></div>' +
        '<div><p class="sd-steps-t">LO QUE YA HACES BIEN</p><ul class="qz-good"></ul></div></div>' +
        '<div class="qz-act">' + cta(c) + '<button type="button" class="btn qz-share">Copiar mi resultado</button><button type="button" class="qz-again">Repetir</button></div></div>';
      var steps = box.querySelector('.qz-steps'), good = box.querySelector('.qz-good');
      (gaps.length ? gaps.slice(0, 3).map(function (g) { return g.q.s + (a[g.k] === 0.5 ? ' (ya tienes una parte)' : ''); }) : [c.none]).forEach(function (x) { steps.appendChild(el('li', null, x)); });
      (strong.length ? strong.slice(0, 4).map(function (q) { return q.s.replace(/^[A-ZÁÉÍÓÚ]/, function (m) { return m; }); }) : ['Aún no marcaste ninguno como completo: es normal, ahí está la oportunidad.']).forEach(function (x) { good.appendChild(el('li', null, strong.length ? '✓ ' + x : x)); });
      /* el puntaje sube contando hasta el valor final */
      var fg = box.querySelector('.sd-ring-fg'), num = box.querySelector('.sd-score strong');
      if (reduce) { num.textContent = total; fg.style.strokeDashoffset = 553 * (1 - total / 100); }
      else {
        var t0 = null;
        (function step(ts) { t0 = t0 || ts; var p = Math.min((ts - t0) / 1100, 1), e = 1 - Math.pow(1 - p, 3); num.textContent = Math.round(total * e); fg.style.strokeDashoffset = 553 * (1 - total * e / 100); if (p < 1) requestAnimationFrame(step); })(performance.now());
      }
      box.querySelector('.qz-again').addEventListener('click', intro);
      box.querySelector('.qz-share').addEventListener('click', function (e) {
        var txt = 'Mi resultado en "' + c.title + '": ' + total + '/100 · ' + t[0] + '. Pruébalo: ' + location.href.split('#')[0] + '#' + sec.id;
        var b = e.currentTarget, o = b.textContent, done = function () { b.textContent = '¡Copiado!'; setTimeout(function () { b.textContent = o; }, 1400); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, function () {});
      });
      if (window.gtag) window.gtag('event', 'sim_complete', { sim: sec.id, page: location.pathname, score: total });
    }
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('qz--q') || e.ctrlKey || e.metaKey || e.altKey) return;
      var r = sec.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var k = ({ '1': 0, '2': 1, '3': 2 })[e.key];
      if (k == null) return;
      var b = box.querySelectorAll('.qz-opt')[k]; if (b) b.click();
    });
    intro();
  }

  var models = {
    funnel: function (v) {
      var clics = v.inv / v.cpc, leads = clics * v.conv / 100, ventas = leads * v.cierre / 100, ing = ventas * v.ticket;
      var roas = v.inv ? ing / v.inv : 0, alt = v.inv ? (clics * (v.conv + 1) / 100 * v.cierre / 100 * v.ticket) / v.inv : 0;
      return {
        label: 'Ingresos por cada $1 invertido', big: (Math.round(roas * 10) / 10).toString().replace('.', ',') + 'x',
        kpis: [['CLICS', val(clics)], ['CONTACTOS', val(leads)], ['VENTAS AL MES', val(ventas)], ['COSTO POR VENTA', ventas > 0 ? val(v.inv / ventas, 'money') : '—']],
        hint: (roas < 1 ? 'Con estos números la pauta no se paga sola: antes de subir inversión, revisa el eslabón más débil. ' : 'Con estos números la pauta se paga. ') +
          'Si tu página convirtiera 1 punto más (' + val(v.conv + 1, 'pct') + '), el retorno subiría a ' + (Math.round(alt * 10) / 10).toString().replace('.', ',') + 'x sin gastar más en anuncios.',
        how: 'Clics = inversión ÷ costo por clic. Contactos = clics × % que deja sus datos. Ventas = contactos × % que cierra. Ingresos = ventas × valor promedio. Retorno (ROAS) = ingresos ÷ inversión. Supone que tus números se mantienen; en la práctica, al subir la inversión el costo por clic suele subir.',
        raw: { clics: clics, leads: leads, ventas: ventas, roas: roas },
        dial: { v: roas, label: 'Por cada $1 invertido recuperas' },
        viz: [['Clics', clics, 1], ['Contactos', leads, Math.sqrt(clics ? leads / clics : 0)], ['Ventas', ventas, Math.sqrt(clics ? ventas / clics : 0)]],
        scen: function () {
          function r(o) { var w = {}; for (var k in v) w[k] = v[k]; for (var k2 in o) w[k2] = o[k2]; var cl = w.inv / w.cpc, ing2 = cl * w.conv / 100 * w.cierre / 100 * w.ticket; return [w.inv ? ing2 / w.inv : 0, ing2]; }
          var base = r({}), fmtx = function (x) { return (Math.round(x * 10) / 10).toString().replace('.', ',') + 'x'; };
          return [['Hoy', base], ['Tu página convierte 1 punto más', r({ conv: v.conv + 1 })], ['Tu costo por clic baja 20 %', r({ cpc: v.cpc * 0.8 })], ['Cierras 5 puntos más', r({ cierre: Math.min(100, v.cierre + 5) })], ['Tu ticket promedio sube 10 %', r({ ticket: v.ticket * 1.1 })], ['Las cuatro mejoras juntas', r({ conv: v.conv + 1, cpc: v.cpc * 0.8, cierre: Math.min(100, v.cierre + 5), ticket: v.ticket * 1.1 })]].map(function (x) { return [x[0], fmtx(x[1][0]), val(x[1][1], 'money') + ' / mes']; });
        }
      };
    },
    cro: function (v) {
      var hoy = v.vis * v.conv / 100, nuevo = hoy * (1 + v.mej / 100), extra = nuevo - hoy;
      return {
        label: 'Ingresos extra al año', big: val(extra * v.ticket * 12, 'money'),
        kpis: [['CONVERSIONES HOY', val(hoy)], ['CON LA MEJORA', val(nuevo)], ['EXTRA AL MES', val(extra)], ['INGRESO EXTRA AL MES', val(extra * v.ticket, 'money')]],
        hint: 'Lograr lo mismo comprando tráfico implicaría ' + val(v.vis * v.mej / 100) + ' visitas más cada mes. Mejorar la página aprovecha las que ya tienes.'
      };
    },
    ecom: function (v) {
      var ab = Math.min(v.ab, 95) / 100, pedidos = v.vis * v.conv / 100, carritos = pedidos / (1 - ab), aband = carritos - pedidos, rec = aband * v.rec / 100;
      return {
        label: 'Ventas recuperables al mes', big: val(rec * v.ticket, 'money'),
        kpis: [['PEDIDOS HOY', val(pedidos)], ['CARRITOS ABANDONADOS', val(aband)], ['PEDIDOS RECUPERADOS', val(rec)], ['INGRESOS ACTUALES', val(pedidos * v.ticket, 'money')]],
        hint: 'Cada carrito abandonado ya mostró intención de compra. Recuperar solo el ' + val(v.rec, 'pct') + ' equivale a ' + val(rec * v.ticket * 12, 'money') + ' al año.',
        how: 'Pedidos = visitas × % que compra. Carritos = pedidos ÷ (1 − % que abandona). Abandonados = carritos − pedidos. Recuperables = abandonados × % que logras recuperar. Ingresos = recuperables × valor promedio. Es una estimación: la recuperación real depende de tus correos, recordatorios y oferta.',
        raw: { ab: ab, rec: v.rec },
        dial: { v: (1 - ab) * 100, label: 'De cada 100 carritos terminan en compra' },
        viz: [['Pedidos hoy', pedidos, carritos ? pedidos / carritos : 0], ['Carritos abandonados', aband, carritos ? aband / carritos : 0], ['Recuperables', rec, carritos ? rec / carritos : 0]],
        scen: function () { return [5, 10, 15, 20, 25, 30].map(function (pc) { var rr = aband * pc / 100; return ['Recuperas el ' + pc + ' % de los carritos', val(rr) + ' pedidos', val(rr * v.ticket, 'money') + ' / mes · ' + val(rr * v.ticket * 12, 'money') + ' / año']; }); }
      };
    }
  };

  var DIALS = {
    funnel: { max: 6, zones: [[1, '#ef4444'], [2, '#f97316'], [3, '#dce157'], [6, '#22c55e']], ticks: [0, 1, 2, 3, 6], tickFmt: function (v) { return v + 'x' }, fmt: function (v) { return (Math.round(v * 10) / 10).toString().replace('.', ',') + 'x'; }, unit: '' },
    ecom: { max: 100, zones: [[20, '#ef4444'], [35, '#f97316'], [50, '#dce157'], [100, '#22c55e']], ticks: [0, 20, 35, 50, 100], tickFmt: function (v) { return v + '%' }, fmt: function (v) { return Math.round(v) + '%'; }, unit: '' }
  };
  function buildCalc(sec, c) {
    head(sec, c);
    var card = el('aside', 'sd-card sc-top', '<div class="sc-dial"></div><div class="sc-res"><small class="sc-lab"></small><strong class="sc-big"></strong><div class="sc-kpis"></div></div><div class="sc-foot"><p class="sc-hint"></p><details class="sc-how"><summary>Cómo lo calculamos</summary><p></p></details>' + cta(c) + '</div>');
    card.setAttribute('aria-live', 'polite'); card.classList.add('sc-m-' + c.model);
    sec.appendChild(card);
    var grid = el('div', 'sd-grid sc-grid'), box = el('div', 'sc-inputs'), vals = {}, outs = {};
    c.inputs.forEach(function (n, i) {
      vals[n.k] = n.v;
      var row = el('div', 'sc-in', '<div class="sc-in-l"><label for="simin' + i + '">' + n.l + '</label><output id="simo' + i + '"></output></div><input type="range" id="simin' + i + '" min="' + n.min + '" max="' + n.max + '" step="' + n.step + '" value="' + n.v + '">');
      outs[n.k] = row.querySelector('output');
      row.querySelector('input').addEventListener('input', function (e) { vals[n.k] = +e.target.value; update(); });
      box.appendChild(row);
    });
    var panel = el('aside', 'sd-card sc-viz-card', '<div class="sc-viz" aria-hidden="true"></div>');
    grid.appendChild(box); grid.appendChild(panel); sec.appendChild(grid);
    var dial = window.WOWSim && window.WOWSim.dial && DIALS[c.model] ? window.WOWSim.dial(card.querySelector('.sc-dial'), DIALS[c.model]) : null;
    if (!dial) card.querySelector('.sc-dial').remove();
    var cvz = window.WOWSim && window.WOWSim.viz && window.WOWSim.viz[c.model] ? window.WOWSim.viz[c.model](panel.querySelector('.sc-viz')) : null;
    var lastR = null, gate = el('div', 'sc-gate'), lockBox = el('div', 'sc-lock');
    sec.appendChild(gate);
    if (window.WOWLead) {
      lockBox.innerHTML = '<p class="qz-lock-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg> Escenarios con tus números: qué pasa si mejoras cada eslabón</p>';
      var leadBox = el('div', 'sc-lead'); gate.appendChild(leadBox); gate.appendChild(lockBox);
      window.WOWLead.mount(leadBox, {
        tool: c.title, pitch: 'Te mostramos al instante qué pasa con tus números si mejoras cada eslabón, y cuál conviene mover primero.',
        data: function () { return { sim: sec.id, page: location.pathname, entradas: vals }; },
        onUnlock: function () {
          if (!lastR || !lastR.scen) return;
          var rows = lastR.scen();
          lockBox.innerHTML = '<p class="sd-steps-t">TUS ESCENARIOS</p><table class="sc-scen"><tbody>' + rows.map(function (r, i) { return '<tr' + (i === 0 ? ' class="is-base"' : '') + '><th scope="row">' + r[0] + '</th><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>'; }).join('') + '</tbody></table><p class="sc-note-s">Cálculo de referencia con los números que ingresaste.</p>';
        }
      });
    }
    function update() {
      c.inputs.forEach(function (n) { outs[n.k].textContent = val(vals[n.k], n.f); });
      var r = models[c.model](vals); lastR = r;
      var vz = panel.querySelector('.sc-viz');
      if (dial && r.dial) dial.set(r.dial.v, { label: r.dial.label });
      if (cvz) { vz.removeAttribute('aria-hidden'); cvz.update(r); }
      else if (r.viz) {
        if (vz.children.length !== r.viz.length) vz.innerHTML = r.viz.map(function () { return '<div class="sc-bar"><span></span><i></i></div>'; }).join('');
        r.viz.forEach(function (b, i) { var row = vz.children[i]; row.firstChild.textContent = b[0] + ' · ' + val(b[1]); row.lastChild.style.width = Math.max(3, Math.min(100, b[2] * 100)) + '%'; });
      }
      card.querySelector('.sc-how p').textContent = r.how || '';
      card.querySelector('.sc-lab').textContent = r.label;
      card.querySelector('.sc-big').textContent = r.big;
      card.querySelector('.sc-kpis').innerHTML = r.kpis.map(function (k) { return '<div><small>' + k[0] + '</small><strong>' + k[1] + '</strong></div>'; }).join('');
      card.querySelector('.sc-hint').textContent = r.hint;
    }
    update();
  }

  document.querySelectorAll('section[data-sim]').forEach(function (sec) {
    var s = sec.querySelector('script[type="application/json"]'), c;
    try { c = JSON.parse(s.textContent); } catch (e) { return; }
    s.remove();
    var mode = c.type !== 'calc' && c.mode && window.WOWSim && window.WOWLead && window.WOWSim.modes[c.mode];
    if (mode) mode(sec, c, { head: head, cta: cta, el: el });
    else (c.type === 'calc' ? buildCalc : buildCheck)(sec, c);
    sec.insertAdjacentHTML('beforeend', '<p class="ss-note sc-note">SIMULACIÓN DE REFERENCIA · LOS RESULTADOS REALES DEPENDEN DE TU NEGOCIO Y DE TU MERCADO</p>');
  });
})();
