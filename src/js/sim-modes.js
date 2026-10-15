/* Formatos de simulador del Playground (páginas de servicio).
   servicios.js llama modes[c.mode](sec, c, H) para cada <section data-sim> cuyo JSON trae "mode".
   Todos los formatos terminan en W.result(): puntaje + primer paso gratis y, con el correo, el diagnóstico completo (WOWLead). */
(function () {
  var W = window.WOWSim = { modes: {} };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var uid = 0;
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function track(n, p) { if (window.gtag) window.gtag('event', n, p || {}); }
  var ANS = [['Sí', 1, 'yes'], ['En parte', 0.5, 'half'], ['No', 0, 'no']];
  function scoreOf(c, a) { return Math.round(c.qs.reduce(function (t, q, k) { return t + (a[k] == null ? 0 : q.w * a[k]); }, 0)); }
  function tierOf(c, total) { var cuts = [30, 60, 85, 101], i = cuts.findIndex(function (x) { return total < x; }); return c.tiers[i < 0 ? 3 : i]; }
  function ring(total) { return '<div class="sd-ring"><svg viewBox="0 0 200 200" aria-hidden="true"><circle class="sd-ring-bg" cx="100" cy="100" r="88"/><circle class="sd-ring-fg" cx="100" cy="100" r="88" style="stroke-dashoffset:' + (553 * (1 - total / 100)) + '"/></svg><div class="sd-score"><strong>' + total + '</strong><span>DE 100</span></div></div>'; }
  function lockSvg() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'; }

  /* ---------- marcador en vivo ---------- */
  W.hud = function (sec, c) {
    var n = c.qs.length, h = el('div', 'hud');
    h.setAttribute('role', 'status');
    h.innerHTML = '<div class="hud-score"><small>PUNTOS ACUMULADOS</small><b class="hud-n">0</b><span>/ 100</span><em class="hud-pop" aria-hidden="true"></em></div>' +
      '<div class="hud-meter" aria-hidden="true"><i class="hud-fill"></i><s style="left:30%"></s><s style="left:60%"></s><s style="left:85%"></s></div>' +
      '<div class="hud-prog"><small class="hud-ans"></small><div class="hud-pbar" aria-hidden="true"><i></i></div></div>';
    sec.appendChild(h);
    var num = h.querySelector('.hud-n'), fill = h.querySelector('.hud-fill'), pop = h.querySelector('.hud-pop'), ans = h.querySelector('.hud-ans'), pb = h.querySelector('.hud-pbar i');
    var cur = 0, raf = 0;
    function count(to) {
      cancelAnimationFrame(raf); var from = +num.textContent || 0;
      if (reduce || from === to) { num.textContent = to; return; }
      var t0 = null; (function step(ts) { t0 = t0 || ts; var p = Math.min((ts - t0) / 380, 1); num.textContent = Math.round(from + (to - from) * p); if (p < 1) raf = requestAnimationFrame(step); })(performance.now());
    }
    var api = {
      set: function (a, answered) {
        var t = scoreOf(c, a), k = answered != null ? answered : a.filter(function (x) { return x != null; }).length;
        count(t); fill.style.width = t + '%'; pb.style.width = (k / n * 100) + '%'; ans.textContent = k + ' de ' + n + ' respondidas';
        if (t > cur && !reduce) { pop.textContent = '+' + (t - cur); pop.classList.remove('is-go'); void pop.offsetWidth; pop.classList.add('is-go'); }
        cur = t;
      },
      reset: function () { cur = 0; h.hidden = false; api.set([], 0); },
      hide: function () { h.hidden = true; }
    };
    api.set([], 0);
    return api;
  };

  /* ---------- resultado común ---------- */
  var RANGES = ['0 a 29', '30 a 59', '60 a 84', '85 a 100'];
  function scaleHtml(c, total, t) {
    var segs = [30, 30, 25, 15].map(function (w, i) { return '<div class="qz-seg qz-seg' + i + '" style="flex:' + w + '"><span>' + RANGES[i] + '</span></div>'; }).join('');
    return '<div class="qz-scale"><div class="qz-sc-bar" aria-hidden="true">' + segs + '<i class="qz-mark" style="left:' + Math.min(99, total) + '%"><b>' + total + '</b></i></div><p class="qz-sc-t">Estás en el nivel: <b>' + t[0] + '</b></p></div>';
  }
  function breakdownHtml(c, a) {
    var rows = c.qs.map(function (q, k) {
      var got = Math.round(q.w * a[k] * 10) / 10, cls = a[k] >= 0.99 ? 'full' : a[k] > 0 ? 'half' : 'none';
      return '<li class="qz-br qz-br-' + cls + '"><span class="qz-br-n">' + q.s + '</span><span class="qz-br-p">' + (got % 1 ? got.toFixed(1) : got) + ' / ' + q.w + '</span><span class="qz-br-b" aria-hidden="true"><i style="width:' + Math.round(a[k] * 100) + '%"></i></span></li>';
    }).join('');
    return '<details class="qz-how" open><summary>Cómo se calculó tu puntaje</summary><ul class="qz-brl">' + rows + '</ul><p class="qz-how-n">Cada criterio pesa según su impacto en resultados. Sí suma el 100 % de su peso, En parte el 50 % y No cero; la suma da tu puntaje sobre 100. Es un diagnóstico de referencia basado en buenas prácticas, no una auditoría: para revisar tu caso con datos reales lo hacemos contigo.</p></details>';
  }
  W.result = function (box, c, a, sec, again, H) {
    var total = scoreOf(c, a), t = tierOf(c, total);
    var gaps = c.qs.map(function (q, k) { return { q: q, k: k, lost: q.w * (1 - a[k]) }; }).filter(function (g) { return g.lost > 0.01; }).sort(function (x, y) { return y.lost - x.lost; });
    var strong = c.qs.filter(function (q, k) { return a[k] >= 0.99; });
    box.className = 'qz qz--r'; box.textContent = '';
    var card = el('div', 'qz-card qz-res');
    card.innerHTML = '<div class="qz-res-top">' + ring(0) + '<div><h3>' + t[0] + '</h3><p>' + t[1] + '</p></div></div>' +
      scaleHtml(c, total, t) +
      '<p class="sd-steps-t">TU PRIMER PASO</p><ol class="qz-steps"><li>' + (gaps.length ? gaps[0].q.s + (a[gaps[0].k] === 0.5 ? ' (ya tienes una parte)' : '') : c.none) + '</li></ol>' +
      breakdownHtml(c, a) +
      '<div class="qz-lead"></div><div class="qz-lock"></div>' +
      '<div class="qz-act">' + H.cta(c) + '<button type="button" class="btn qz-share">Copiar mi resultado</button><button type="button" class="qz-again">Repetir</button></div>';
    box.appendChild(card);

    var lock = card.querySelector('.qz-lock');
    function phase(title, list, extra) {
      var g = list.reduce(function (s, x) { return s + x.lost; }, 0);
      return '<div class="qz-phase"><p class="qz-ph-t"><b>' + title + '</b>' + (extra || '') + '</p><ul>' + list.map(function (x) { return '<li>' + x.q.s + (a[x.k] === 0.5 ? ' <em>(ya tienes una parte)</em>' : '') + '<span>+' + Math.round(x.lost) + ' pts</span></li>'; }).join('') + '</ul></div>';
    }
    function teaser() {
      lock.innerHTML = '<div class="qz-blur" aria-hidden="true"><p class="qz-ph-t"><b>Fase 1 · Primeros 30 días</b></p><ul><li>' + (gaps[1] ? gaps[1].q.s : 'Tu plan personalizado') + '</li><li>████████████ ██████</li></ul><p class="qz-ph-t"><b>Fase 2 · Meses 2 y 3</b></p><ul><li>█████████ ████████ ███</li></ul></div><p class="qz-lock-note">' + lockSvg() + ' Tu plan completo en 3 fases, con los puntos que sumas en cada una</p>';
    }
    function full() {
      var p1 = gaps.slice(1, 4), p2 = gaps.slice(4, 7), p3 = gaps.slice(7);
      var first = gaps[0] ? [gaps[0]] : [];
      var ph1 = first.concat(p1), gain1 = ph1.reduce(function (s, x) { return s + x.lost; }, 0);
      var html = '<div class="qz-plan"><p class="sd-steps-t">TU DIAGNÓSTICO COMPLETO</p>';
      if (ph1.length) html += phase('Fase 1 · Primeros 30 días', ph1, '<i>Pasarías de ' + total + ' a ' + Math.min(100, Math.round(total + gain1)) + '</i>');
      if (p2.length) html += phase('Fase 2 · Meses 2 y 3', p2);
      if (p3.length) html += phase('Fase 3 · Después', p3);
      if (!gaps.length) html += '<p>' + c.none + '</p>';
      if (strong.length) html += '<div class="qz-phase"><p class="qz-ph-t"><b>Lo que ya haces bien</b></p><ul class="qz-good">' + strong.map(function (q) { return '<li>✓ ' + q.s + '</li>'; }).join('') + '</ul></div>';
      lock.innerHTML = html + '</div>';
      track('sim_unlock', { sim: sec.id });
    }
    teaser();
    window.WOWLead.mount(card.querySelector('.qz-lead'), {
      tool: (c.title || sec.id), pitch: 'Te mostramos al instante tu plan completo: cada paso, en qué orden hacerlo y cuántos puntos sumas.',
      data: function () { return { sim: sec.id, page: location.pathname, score: total, tier: t[0], respuestas: a.join(','), prioridades: gaps.slice(0, 4).map(function (g) { return g.q.s; }) }; },
      onUnlock: full
    });

    var fg = card.querySelector('.sd-ring-fg'), num = card.querySelector('.sd-score strong');
    if (reduce) { num.textContent = total; fg.style.strokeDashoffset = 553 * (1 - total / 100); }
    else { var t0 = null; (function step(ts) { t0 = t0 || ts; var p = Math.min((ts - t0) / 1100, 1), e = 1 - Math.pow(1 - p, 3); num.textContent = Math.round(total * e); fg.style.strokeDashoffset = 553 * (1 - total * e / 100); if (p < 1) requestAnimationFrame(step); })(performance.now()); }
    card.querySelector('.qz-again').addEventListener('click', again);
    card.querySelector('.qz-share').addEventListener('click', function (e) {
      var txt = 'Mi resultado en "' + c.title + '": ' + total + '/100 · ' + t[0] + '. Pruébalo: ' + location.href.split('#')[0] + '#' + sec.id, b = e.currentTarget, o = b.textContent;
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { b.textContent = '¡Copiado!'; setTimeout(function () { b.textContent = o; }, 1400); }, function () {});
    });
    track('sim_complete', { sim: sec.id, page: location.pathname, score: total });
    var top = box.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.5) box.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
  };

  function opts(onPick, cur) {
    var wrap = el('div', 'pg-opts', ''); wrap.setAttribute('role', 'group');
    ANS.forEach(function (o) {
      var b = el('button', 'pg-opt pg-' + o[2] + (cur === o[1] ? ' is-on' : ''), o[0]); b.type = 'button'; b.setAttribute('aria-pressed', cur === o[1] ? 'true' : 'false');
      b.addEventListener('click', function () { onPick(o[1]); wrap.querySelectorAll('.pg-opt').forEach(function (x) { x.classList.remove('is-on'); x.setAttribute('aria-pressed', 'false'); }); b.classList.add('is-on'); b.setAttribute('aria-pressed', 'true'); });
      wrap.appendChild(b);
    });
    return wrap;
  }

  /* ---------- 1. Encuesta por páginas ---------- */
  W.modes.paged = function (sec, c, H) {
    H.head(sec, c);
    var n = c.qs.length, per = c.per || 3, pages = Math.ceil(n / per), p = 0, a = [], hud = W.hud(sec, c), box = el('div', 'qz qz--pg');
    sec.appendChild(box);
    function again() { a = []; p = 0; hud.reset(); page(1); }
    function page(dir) {
      box.className = 'qz qz--pg'; box.textContent = '';
      var dots = ''; for (var d = 0; d < pages; d++) dots += '<i class="' + (d === p ? 'is-on' : d < p ? 'is-done' : '') + '"></i>';
      box.appendChild(el('div', 'pgd-top', '<span class="qz-count">PÁGINA ' + (p + 1) + ' DE ' + pages + '</span><span class="pgd-dots" aria-hidden="true">' + dots + '</span>'));
      var card = el('div', 'qz-card pgd-card' + (reduce ? '' : dir > 0 ? ' qz-from-r' : ' qz-from-l'));
      var from = p * per, to = Math.min(n, from + per);
      for (var k = from; k < to; k++) (function (k) {
        var row = el('fieldset', 'pgd-q'); row.appendChild(el('legend', null, c.qs[k].q));
        row.appendChild(opts(function (v) { a[k] = v; hud.set(a); sync(); }, a[k]));
        card.appendChild(row);
      })(k);
      var foot = el('div', 'pgd-foot');
      var back = el('button', 'qz-back', p ? '← Atrás' : ''); back.type = 'button'; if (!p) back.style.visibility = 'hidden';
      var next = el('button', 'btn btn-primary', p === pages - 1 ? 'Ver mi resultado →' : 'Siguiente →'); next.type = 'button';
      foot.appendChild(back); foot.appendChild(next); card.appendChild(foot); box.appendChild(card);
      function sync() { var ok = true; for (var j = from; j < to; j++) if (a[j] == null) ok = false; next.disabled = !ok; }
      sync(); hud.set(a);
      back.addEventListener('click', function () { p--; page(-1); });
      next.addEventListener('click', function () { if (p < pages - 1) { p++; page(1); } else { hud.hide(); W.result(box, c, a, sec, again, H); } });
      if (dir) track('sim_page', { sim: sec.id, page: p + 1 });
    }
    page(0);
  };

  /* ---------- 2. Chatbot ---------- */
  W.modes.chat = function (sec, c, H) {
    H.head(sec, c);
    var n = c.qs.length, a = [], i = 0, hud = W.hud(sec, c), box = el('div', 'qz qz--ch');
    sec.appendChild(box);
    var REACT = { 1: ['¡Eso suma!', 'Bien, anotado.', 'Perfecto, sigamos.'], 0.5: ['Algo es algo.', 'Anotado: hay camino por recorrer.'], 0: ['Sin problema, ahí hay oportunidad.', 'Tranqui, lo vemos en tu plan.'] };
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function start() {
      a = []; i = 0; hud.reset(); box.className = 'qz qz--ch'; box.textContent = '';
      var chat = el('div', 'ch'), log = el('div', 'ch-log'), reply = el('div', 'ch-reply');
      log.setAttribute('role', 'log'); log.setAttribute('aria-live', 'polite');
      chat.appendChild(el('div', 'ch-bar', '<i></i><b>WOW-bot</b><small>en línea</small>')); chat.appendChild(log); chat.appendChild(reply); box.appendChild(chat);
      function say(who, text, cb) {
        function put() {
          var m = el('div', 'ch-msg ch-' + who); m.textContent = text; log.appendChild(m); log.scrollTop = log.scrollHeight; if (cb) cb();
        }
        if (who === 'me' || reduce) return put();
        var ty = el('div', 'ch-msg ch-bot ch-typing', '<i></i><i></i><i></i>'); log.appendChild(ty); log.scrollTop = log.scrollHeight;
        setTimeout(function () { ty.remove(); put(); }, 550 + Math.min(text.length * 8, 500));
      }
      function ask() {
        reply.textContent = '';
        say('bot', (i + 1) + '/' + n + ' · ' + c.qs[i].q, function () {
          ANS.forEach(function (o) {
            var b = el('button', 'ch-quick', o[0]); b.type = 'button';
            b.addEventListener('click', function () {
              reply.textContent = ''; a[i] = o[1]; hud.set(a); say('me', o[0]);
              var r = pick(REACT[o[1]]); i++;
              if (i < n) say('bot', r, ask); else say('bot', r, function () { say('bot', 'Listo, ya hice las cuentas…', function () { setTimeout(function () { hud.hide(); W.result(box, c, a, sec, start, H); }, reduce ? 0 : 700); }); });
            });
            reply.appendChild(b);
          });
          var f = reply.querySelector('button'); if (f) f.focus({ preventScroll: true });
        });
      }
      say('bot', 'Hola, soy WOW-bot. Te hago ' + n + ' preguntas rápidas y te doy tu resultado. Respóndeme con sinceridad.', function () { say('bot', '¿Listo?', function () {
        var go = el('button', 'ch-quick', 'Vamos'); go.type = 'button'; go.addEventListener('click', function () { reply.textContent = ''; say('me', 'Vamos'); ask(); track('sim_start', { sim: sec.id }); }); reply.appendChild(go); go.focus({ preventScroll: true });
      }); });
    }
    start();
  };

  /* ---------- 3. Tablero de switches ---------- */
  W.modes['switch'] = function (sec, c, H) {
    H.head(sec, c);
    var n = c.qs.length, box = el('div', 'qz qz--sw');
    sec.appendChild(box);
    function build() {
      box.className = 'qz qz--sw'; box.textContent = '';
      var grid = el('div', 'sd-grid'), ul = el('ul', 'sw-rows'), COL = ['lima', 'orange', 'magenta'];
      c.qs.forEach(function (q, i) {
        var li = el('li', 'toggle-item sw-row toggle-on-' + COL[i % 3]);
        li.innerHTML = '<button type="button" class="switch" role="switch" aria-checked="false"><span class="switch-label">OFF</span><span class="switch-knob"></span></button><span class="toggle-text"></span>';
        li.querySelector('.toggle-text').textContent = q.q;
        li.querySelector('.switch').setAttribute('aria-label', q.q);
        ul.appendChild(li);
      });
      var card = el('aside', 'sd-card sw-card', ring(0) + '<p class="sw-live" aria-live="polite"></p><button type="button" class="btn btn-primary sw-go">Ver mi diagnóstico <span aria-hidden="true">→</span></button>');
      grid.appendChild(ul); grid.appendChild(card); box.appendChild(grid);
      var sw = ul.querySelectorAll('.switch'), fg = card.querySelector('.sd-ring-fg'), num = card.querySelector('.sd-score strong'), live = card.querySelector('.sw-live');
      function upd() { var a = [].map.call(sw, function (s) { return s.classList.contains('is-on') ? 1 : 0; }), t = scoreOf(c, a); num.textContent = t; fg.style.strokeDashoffset = 553 * (1 - t / 100); live.textContent = a.filter(function (x) { return x; }).length + ' de ' + n + ' encendidos · ' + tierOf(c, t)[0]; return a; }
      function flip(s) { var on = !s.classList.contains('is-on'); s.classList.toggle('is-on', on); s.setAttribute('aria-checked', on ? 'true' : 'false'); s.querySelector('.switch-label').textContent = on ? 'ON' : 'OFF'; upd(); }
      [].forEach.call(sw, function (s) { s.addEventListener('click', function (e) { e.stopPropagation(); flip(s); }); s.parentNode.addEventListener('click', function () { flip(s); }); });
      upd();
      card.querySelector('.sw-go').addEventListener('click', function () { W.result(box, c, upd(), sec, build, H); });
      track('sim_start', { sim: sec.id });
    }
    build();
  };

  /* ---------- 4. Caritas: qué tan de acuerdo estás ---------- */
  var FC = ['#ef4444', '#f97316', '#facc15', '#84cc16', '#22c55e'];
  var MOUTH = ['M30 72 Q50 50 70 72', 'M32 68 Q50 58 68 68', 'M32 65 H68', 'M32 60 Q50 74 68 60', 'M28 56 Q50 88 72 56Z'];
  var FLAB = ['Nada de acuerdo', 'Poco', 'Más o menos', 'De acuerdo', 'Totalmente'];
  function face(m) { return '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="' + FC[m] + '" stroke="#1a1320" stroke-width="3"/><circle cx="36" cy="40" r="5" fill="#1a1320"/><circle cx="64" cy="40" r="5" fill="#1a1320"/><path d="' + MOUTH[m] + '" fill="' + (m === 4 ? '#1a1320' : 'none') + '" stroke="#1a1320" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
  W.modes.faces = function (sec, c, H) {
    H.head(sec, c);
    var n = c.qs.length, a = [], i = 0, hud = W.hud(sec, c), box = el('div', 'qz qz--fc');
    sec.appendChild(box);
    function again() { a = []; i = 0; hud.reset(); q(1); }
    function q(dir) {
      box.className = 'qz qz--fc'; box.textContent = '';
      box.appendChild(el('div', 'qz-top', '<span class="qz-count">FRASE ' + (i + 1) + ' DE ' + n + '</span><div class="qz-bar"><i style="width:' + (i / n * 100) + '%"></i></div>'));
      var card = el('div', 'qz-card fc-card' + (reduce ? '' : dir > 0 ? ' qz-from-r' : ' qz-from-l'));
      card.appendChild(el('p', 'fc-lead', 'Qué tan de acuerdo estás con esta frase:'));
      var h = el('h3', 'qz-text', '“' + (c.qs[i].st || c.qs[i].q) + '”'); h.tabIndex = -1; card.appendChild(h);
      var row = el('div', 'fc-row'); row.setAttribute('role', 'group'); row.setAttribute('aria-label', 'Qué tan de acuerdo estás');
      for (var m = 0; m < 5; m++) (function (m) {
        var b = el('button', 'fc-face' + (a[i] === m / 4 ? ' is-on' : ''), face(m) + '<span>' + FLAB[m] + '</span>'); b.type = 'button'; b.setAttribute('aria-label', FLAB[m]);
        b.addEventListener('click', function () {
          if (box.classList.contains('is-busy')) return; a[i] = m / 4; hud.set(a); b.classList.add('is-on', 'is-pop'); box.classList.add('is-busy');
          setTimeout(function () { box.classList.remove('is-busy'); if (i < n - 1) { i++; q(1); } else { hud.hide(); W.result(box, c, a, sec, again, H); } }, reduce ? 0 : 380);
        });
        row.appendChild(b);
      })(m);
      card.appendChild(row);
      var foot = el('div', 'qz-foot', i ? '<button type="button" class="qz-back">← Atrás</button>' : '<span></span>'); card.appendChild(foot); box.appendChild(card);
      var bk = card.querySelector('.qz-back'); if (bk) bk.addEventListener('click', function () { i--; q(-1); });
      if (dir) h.focus({ preventScroll: true });
      if (dir && i === 0) track('sim_start', { sim: sec.id });
    }
    q(0);
  };

  /* ---------- 5. Post-its que se arrastran ---------- */
  W.modes.postit = function (sec, c, H) {
    H.head(sec, c);
    var n = c.qs.length, hud = W.hud(sec, c), box = el('div', 'qz qz--po');
    sec.appendChild(box);
    var COLS = [['Sí lo hago', 1, 'yes'], ['En parte', 0.5, 'half'], ['Todavía no', 0, 'no']];
    function build() {
      box.className = 'qz qz--po'; box.textContent = '';
      var a = [], sel = null, drag = null; hud.reset();
      box.appendChild(el('p', 'po-help', 'Arrastra cada post-it a la columna que mejor lo describa. En el celular: toca el post-it y luego la columna.'));
      var pile = el('div', 'po-pile'); pile.setAttribute('aria-label', 'Post-its por ordenar'); box.appendChild(pile);
      var cols = el('div', 'po-cols'); box.appendChild(cols);
      var foot = el('div', 'po-foot', '<span class="po-count" aria-live="polite"></span>'), go = el('button', 'btn btn-primary', 'Ver mi resultado →'); go.type = 'button'; go.disabled = true; foot.appendChild(go); box.appendChild(foot);
      var drops = COLS.map(function (col) { var s = el('section', 'po-col po-' + col[2], '<h4>' + col[0] + '</h4><div class="po-drop"></div>'); s._v = col[1]; cols.appendChild(s); return s; });
      var count = foot.querySelector('.po-count');
      function refresh() { var done = a.filter(function (v) { return v != null; }).length; count.textContent = done + ' de ' + n + ' pegados'; go.disabled = done < n; }
      function place(note, col) { var k = +note.getAttribute('data-k'); a[k] = col._v; hud.set(a); col.querySelector('.po-drop').appendChild(note); note.classList.remove('is-sel'); sel = null; refresh(); }
      c.qs.forEach(function (q, k) {
        var note = el('button', 'po-note po-c' + (k % 4)); note.type = 'button'; note.setAttribute('data-k', k); note.style.setProperty('--r', ((k * 37) % 9 - 4) + 'deg'); note.textContent = q.q;
        pile.appendChild(note);
      });
      function colAt(x, y) { var e = document.elementFromPoint(x, y); return e && e.closest && e.closest('.po-col'); }
      box.addEventListener('pointerdown', function (e) {
        var note = e.target.closest && e.target.closest('.po-note'); if (!note || (e.pointerType === 'mouse' && e.button !== 0)) return;
        drag = { note: note, id: e.pointerId, x0: e.clientX, y0: e.clientY, on: false, ghost: null }; try { note.setPointerCapture(e.pointerId); } catch (err) {}
      });
      box.addEventListener('pointermove', function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        if (!drag.on && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 7) {
          drag.on = true; var r = drag.note.getBoundingClientRect(), g = drag.note.cloneNode(true); g.className += ' po-ghost'; g.style.width = r.width + 'px'; g.style.height = r.height + 'px'; drag.dx = e.clientX - r.left; drag.dy = e.clientY - r.top; document.body.appendChild(g); drag.ghost = g; drag.note.classList.add('is-lifted');
        }
        if (drag.on) { drag.ghost.style.transform = 'translate(' + (e.clientX - drag.dx) + 'px,' + (e.clientY - drag.dy) + 'px) rotate(3deg)'; drops.forEach(function (d) { d.classList.remove('is-over'); }); var col = colAt(e.clientX, e.clientY); if (col) col.classList.add('is-over'); }
      });
      function end(e) {
        if (!drag || e.pointerId !== drag.id) return;
        var d = drag; drag = null;
        if (d.on) {
          d.ghost.remove(); d.note.classList.remove('is-lifted'); drops.forEach(function (x) { x.classList.remove('is-over'); });
          var col = colAt(e.clientX, e.clientY); if (col) place(d.note, col); d.note._dragged = true;
        } else if (e.type === 'pointerup') { if (sel && sel !== d.note && d.note.closest('.po-col')) return; /* el clic de la columna coloca el post-it elegido */ if (sel) sel.classList.remove('is-sel'); sel = (sel === d.note) ? null : d.note; if (sel) sel.classList.add('is-sel'); }
      }
      box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
      drops.forEach(function (col) { col.addEventListener('click', function () { if (sel) place(sel, col); }); });
      box.addEventListener('keydown', function (e) { var note = e.target.closest && e.target.closest('.po-note'); var k = ({ '1': 0, '2': 1, '3': 2 })[e.key]; if (note && k != null) { place(note, drops[k]); note.focus(); } });
      go.addEventListener('click', function () { hud.hide(); W.result(box, c, a, sec, build, H); });
      refresh(); track('sim_start', { sim: sec.id });
    }
    build();
  };

  /* ---------- 6. Rayuela ---------- */
  W.modes.hop = function (sec, c, H) {
    H.head(sec, c);
    var n = c.qs.length, hud = W.hud(sec, c), box = el('div', 'qz qz--hp');
    sec.appendChild(box);
    function build() {
      box.className = 'qz qz--hp'; box.textContent = '';
      var a = [], i = 0, busy = false; hud.reset();
      var wrap = el('div', 'hp'), board = el('div', 'hp-board'), panel = el('div', 'qz-card hp-panel');
      var pat = [1, 1, 2, 1, 2, 1, 2, 1], rows = [], idx = 0, r = 0;
      while (idx < n) { var size = Math.min(pat[r % pat.length], n - idx), row = []; for (var s = 0; s < size; s++) row.push(idx++); rows.push(row); r++; }
      board.appendChild(el('div', 'hp-sky', 'CIELO'));
      var sq = [];
      rows.slice().reverse().forEach(function (row) { var d = el('div', 'hp-row'); row.forEach(function (k) { var b = el('b', 'hp-sq', String(k + 1)); sq[k] = b; d.appendChild(b); }); board.appendChild(d); });
      var start = el('div', 'hp-start', 'INICIO'); board.appendChild(start);
      var stone = el('span', 'hp-stone', '<i></i>'); board.appendChild(stone);
      wrap.appendChild(board); wrap.appendChild(panel); box.appendChild(wrap);
      function spot(target) { var b = board.getBoundingClientRect(), t = target.getBoundingClientRect(); return 'translate(' + (t.left - b.left + t.width / 2 - 15) + 'px,' + (t.top - b.top + t.height / 2 - 15) + 'px)'; }
      function hopTo(target) { stone.style.transform = spot(target); if (!reduce) { stone.classList.remove('is-hop'); void stone.offsetWidth; stone.classList.add('is-hop'); } }
      function show() {
        panel.textContent = '';
        panel.appendChild(el('p', 'qz-meta', 'CASILLA ' + (i + 1) + ' DE ' + n));
        var h = el('h3', 'qz-text', c.qs[i].q); h.tabIndex = -1; panel.appendChild(h);
        var ans = el('div', 'qz-ans');
        ANS.forEach(function (o, k) {
          var b = el('button', 'qz-opt qz-' + o[2], '<kbd>' + (k + 1) + '</kbd><span>' + o[0] + '</span>'); b.type = 'button';
          b.addEventListener('click', function () {
            if (busy) return; busy = true; a[i] = o[1]; hud.set(a); sq[i].classList.add('is-' + o[2]); b.classList.add('is-on');
            var last = i === n - 1; i++;
            setTimeout(function () { hopTo(last ? board.querySelector('.hp-sky') : sq[i]); }, reduce ? 0 : 180);
            setTimeout(function () { busy = false; if (last) { board.querySelector('.hp-sky').classList.add('is-won'); setTimeout(function () { hud.hide(); W.result(box, c, a, sec, build, H); }, reduce ? 0 : 500); } else show(); }, reduce ? 0 : 800);
          });
          ans.appendChild(b);
        });
        panel.appendChild(ans);
        panel.appendChild(el('p', 'hp-hint', 'Tu piedra salta a la siguiente casilla. Atajos: 1 · 2 · 3'));
      }
      stone.style.transition = 'none'; stone.style.transform = spot(start); void stone.offsetWidth; stone.style.transition = '';
      hopTo(sq[0]); show();
      var onKey = function (e) { if (!box.isConnected) return document.removeEventListener('keydown', onKey); var k = ({ '1': 0, '2': 1, '3': 2 })[e.key]; if (k == null || busy || e.ctrlKey || e.metaKey || e.altKey) return; var rc = sec.getBoundingClientRect(); if (rc.bottom < 0 || rc.top > innerHeight) return; var b = panel.querySelectorAll('.qz-opt')[k]; if (b) b.click(); };
      document.addEventListener('keydown', onKey);
      window.addEventListener('resize', function () { if (box.isConnected && !busy) stone.style.transform = spot(i < n ? sq[i] : board.querySelector('.hp-sky')); });
      track('sim_start', { sim: sec.id });
    }
    build();
  };

  /* ---------- 7. Tres en línea ---------- */
  W.modes.tictac = function (sec, c, H) {
    H.head(sec, c);
    var n = c.qs.length, hud = W.hud(sec, c), box = el('div', 'qz qz--tt');
    sec.appendChild(box);
    var LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    var X = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M8 8l24 24M32 8L8 32" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>';
    var O = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="12" fill="none" stroke="currentColor" stroke-width="6"/></svg>';
    function build() {
      box.className = 'qz qz--tt'; box.textContent = '';
      var a = [], state = [], cellQ = [0, 1, 2, 3, -1, 4, 5, 6, 7], lines = 0, touched = {}; hud.reset();
      var wrap = el('div', 'tt'), board = el('div', 'tt-board'), side = el('div', 'qz-card tt-side');
      side.innerHTML = '<p class="qz-meta">TRES EN LÍNEA</p><h3 class="qz-text">Marca lo que ya tienes</h3><p class="tt-rule">Toca una casilla: <b>X</b> = lo tengo · <b>O</b> = en parte · vacía = todavía no. Si juntas 3 en línea, tu marca está bien amarrada.</p><p class="tt-detail" aria-live="polite">Toca o pasa el cursor por una casilla para ver la pregunta completa.</p><p class="tt-lines" aria-live="polite"></p>';
      var go = el('button', 'btn btn-primary', 'Ver mi resultado →'); go.type = 'button'; side.appendChild(go);
      var cells = [];
      cellQ.forEach(function (k, pos) {
        var b = el('button', 'tt-cell' + (k < 0 ? ' is-free' : '')); b.type = 'button';
        if (k < 0) { b.innerHTML = '<span class="tt-mark">✦</span><small>Tu marca</small>'; b.disabled = true; state[pos] = 'X'; }
        else { b.innerHTML = '<span class="tt-mark"></span><small>' + (c.qs[k].t || c.qs[k].s) + '</small>'; b.setAttribute('aria-label', c.qs[k].q + ' — vacío'); a[k] = 0;
          b.addEventListener('click', function () { var s = state[pos]; s = !s ? 'X' : s === 'X' ? 'O' : null; state[pos] = s; a[k] = s === 'X' ? 1 : s === 'O' ? 0.5 : 0; touched[k] = 1; hud.set(a, Object.keys(touched).length); b.className = 'tt-cell' + (s ? ' is-' + s : ''); b.querySelector('.tt-mark').innerHTML = s === 'X' ? X : s === 'O' ? O : ''; b.setAttribute('aria-label', c.qs[k].q + ' — ' + (s === 'X' ? 'lo tengo' : s === 'O' ? 'en parte' : 'vacío')); detail(k); lineCheck(true); });
          b.addEventListener('mouseenter', function () { detail(k); }); b.addEventListener('focus', function () { detail(k); }); }
        cells[pos] = b; board.appendChild(b);
      });
      var det = side.querySelector('.tt-detail'), ln = side.querySelector('.tt-lines');
      function detail(k) { det.textContent = c.qs[k].q; }
      function lineCheck(anim) {
        var done = LINES.filter(function (L) { return L.every(function (p) { return state[p] === 'X'; }); });
        cells.forEach(function (b) { b.classList.remove('is-line'); }); done.forEach(function (L) { L.forEach(function (p) { cells[p].classList.add('is-line'); }); });
        if (anim && done.length > lines) { ln.textContent = '¡Tres en línea!'; ln.classList.remove('is-pop'); void ln.offsetWidth; ln.classList.add('is-pop'); track('sim_line', { sim: sec.id }); }
        else ln.textContent = done.length ? done.length + (done.length === 1 ? ' línea completa' : ' líneas completas') : '';
        lines = done.length;
      }
      go.addEventListener('click', function () { hud.hide(); W.result(box, c, a, sec, build, H); });
      wrap.appendChild(board); wrap.appendChild(side); box.appendChild(wrap); track('sim_start', { sim: sec.id });
    }
    build();
  };

  /* ---------- 8. Sliders: qué tanto ---------- */
  var QT = ['Nada', 'Casi nada', 'Poco', 'Poco', 'Más o menos', 'Más o menos', 'Más o menos', 'Bastante', 'Bastante', 'Casi todo', 'Totalmente'];
  W.modes.sliders = function (sec, c, H) {
    H.head(sec, c);
    var n = c.qs.length, per = c.per || 4, pages = Math.ceil(n / per), box = el('div', 'qz qz--sl');
    sec.appendChild(box);
    function build() {
      box.className = 'qz qz--sl'; box.textContent = '';
      var p = 0, a = c.qs.map(function () { return 0; }), touched = c.qs.map(function () { return false; });
      var grid = el('div', 'sd-grid'), left = el('div', 'sl-left'), card = el('aside', 'sd-card sw-card', ring(0) + '<p class="sw-live">Mueve los sliders y mira cómo sube tu puntaje.</p>');
      grid.appendChild(left); grid.appendChild(card); box.appendChild(grid);
      var fg = card.querySelector('.sd-ring-fg'), num = card.querySelector('.sd-score strong');
      function live() { var t = scoreOf(c, a); num.textContent = t; fg.style.strokeDashoffset = 553 * (1 - t / 100); card.querySelector('.sw-live').textContent = 'Con lo que marcas hoy: ' + tierOf(c, t)[0]; }
      function page(dir) {
        left.textContent = '';
        var top = el('div', 'pgd-top'); top.innerHTML = '<span class="qz-count">PÁGINA ' + (p + 1) + ' DE ' + pages + '</span>'; left.appendChild(top);
        var list = el('div', 'sl-list' + (reduce ? '' : dir > 0 ? ' qz-from-r' : dir < 0 ? ' qz-from-l' : ''));
        for (var k = p * per; k < Math.min(n, p * per + per); k++) (function (k) {
          var id = 'slq' + (++uid), v = Math.round(a[k] * 10), row = el('div', 'sl-row');
          row.innerHTML = '<label for="' + id + '">' + (c.qs[k].st || c.qs[k].q) + '</label><div class="sl-ctl"><input type="range" id="' + id + '" min="0" max="10" step="1" value="' + v + '" style="--p:' + v * 10 + '%"><output for="' + id + '">' + QT[v] + '</output></div><div class="sl-ends" aria-hidden="true"><span>Nada</span><span>Totalmente</span></div>';
          var inp = row.querySelector('input'), out = row.querySelector('output');
          inp.addEventListener('input', function () { var x = +inp.value; a[k] = x / 10; touched[k] = true; inp.style.setProperty('--p', x * 10 + '%'); out.textContent = QT[x]; live(); });
          list.appendChild(row);
        })(k);
        left.appendChild(list);
        var foot = el('div', 'pgd-foot'), back = el('button', 'qz-back', '← Atrás'); back.type = 'button'; if (!p) back.style.visibility = 'hidden';
        var next = el('button', 'btn btn-primary', p === pages - 1 ? 'Ver mi resultado →' : 'Siguiente →'); next.type = 'button';
        foot.appendChild(back); foot.appendChild(next); left.appendChild(foot);
        back.addEventListener('click', function () { p--; page(-1); });
        next.addEventListener('click', function () { if (p < pages - 1) { p++; page(1); } else W.result(box, c, a, sec, build, H); });
      }
      page(0); live(); track('sim_start', { sim: sec.id });
    }
    build();
  };
})();
