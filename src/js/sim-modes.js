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
  /* Memoria entre simuladores: las preguntas con "id" comparten respuesta (solo en el navegador de la persona, localStorage).
     W.detector además la llena leyendo la página real de la persona (/api/revisar, modo detect). */
  var MEM_KEY = 'wow_pg_answers', DET = { ga4: 1, gtm: 1, analytics: 1, pixel: 1, cookies: 1, gsc: 1, schema: 1, faq: 1, llms: 1, mobile: 1, contact: 1, seo: 1 };
  var LAB = { 1: 'Sí', 0.5: 'En parte', 0: 'No' }, BADGE = ' <em class="dt-badge">ya lo sabemos</em>';
  function memGet() { try { return JSON.parse(localStorage.getItem(MEM_KEY) || '{}') || {}; } catch (e) { return {}; } }
  function memPut(o) { try { var m = memGet(); Object.keys(o).forEach(function (k) { m[k] = o[k]; }); localStorage.setItem(MEM_KEY, JSON.stringify(m)); } catch (e) {} }
  function memClear() { try { localStorage.removeItem(MEM_KEY); } catch (e) {} }
  function known(c) { var m = memGet(); return c.qs.map(function (q) { return q.id && typeof m[q.id] === 'number' ? (m[q.id] >= 0.75 ? 1 : m[q.id] >= 0.25 ? 0.5 : 0) : null; }); }
  W.remember = function (c, a) { var o = {}; c.qs.forEach(function (q, k) { if (q.id && a[k] != null) o[q.id] = a[k]; }); memPut(o); };
  W.detector = function (sec, c, restart) {
    if (!c.qs.some(function (q) { return DET[q.id]; })) return;
    var id = 'dtU' + (++uid), f = el('form', 'dt'); f.noValidate = true;
    f.innerHTML = '<p class="dt-t"><b>¿Prefieres no responder todo?</b> Escribe el link de tu página y contestamos por ti lo que podamos ver en ella. Solo leemos la parte pública y no guardamos nada.</p>' +
      '<div class="dt-row"><label class="sr-only" for="' + id + '">Link de tu página</label><input id="' + id + '" type="text" inputmode="url" autocomplete="url" placeholder="www.tusitio.com"><button type="submit" class="btn btn-primary">Autocompletar</button></div><p class="dt-msg" role="status" aria-live="polite"></p>';
    var inp = f.querySelector('input'), btn = f.querySelector('button'), msg = f.querySelector('.dt-msg');
    function remembered() {
      var n = known(c).filter(function (v) { return v != null; }).length;
      if (!n) return;
      msg.textContent = '';
      msg.appendChild(document.createTextNode(n + (n === 1 ? ' respuesta ya estaba lista' : ' respuestas ya estaban listas') + ' (de otra herramienta o de tu página). Puedes cambiarlas. '));
      var b = el('button', 'dt-clear', 'Borrar y empezar de cero'); b.type = 'button';
      b.addEventListener('click', function () { memClear(); msg.textContent = 'Listo, empezamos de cero.'; restart(); });
      msg.appendChild(b);
    }
    remembered();
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var url = inp.value.trim();
      if (!url) { msg.textContent = 'Escribe el link de tu página, por ejemplo tusitio.com'; inp.focus(); return; }
      btn.disabled = true; msg.textContent = 'Leyendo tu página…';
      fetch('/api/revisar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: url, detect: true }) })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (d) {
          if (!d.success || !d.signals) throw new Error(d.error || 'error');
          memPut(d.signals);
          var got = c.qs.filter(function (q) { return q.id && typeof d.signals[q.id] === 'number'; }).length;
          track('sim_detect', { sim: sec.id, found: got });
          restart();
          msg.textContent = got ? 'Listo: contestamos ' + got + ' de ' + c.qs.length + ' preguntas con tu página. Revísalas y cámbialas si no son así.' : 'Leímos tu página, pero no pudimos responder ninguna de estas preguntas. Respóndelas tú.';
        })
        .catch(function () { msg.textContent = 'No pudimos leer esa página. Revisa el link o responde a mano.'; })
        .then(function () { btn.disabled = false; });
    });
    sec.appendChild(f);
  };
  function scoreOf(c, a) { return Math.round(c.qs.reduce(function (t, q, k) { return t + (a[k] == null ? 0 : q.w * a[k]); }, 0)); }
  function tierOf(c, total) { var cuts = [30, 60, 85, 101], i = cuts.findIndex(function (x) { return total < x; }); return c.tiers[i < 0 ? 3 : i]; }
  function ring(total) { return '<div class="sd-ring"><svg viewBox="0 0 200 200" aria-hidden="true"><circle class="sd-ring-bg" cx="100" cy="100" r="88"/><circle class="sd-ring-fg" cx="100" cy="100" r="88" style="stroke-dashoffset:' + (553 * (1 - total / 100)) + '"/></svg><div class="sd-score"><strong>' + total + '</strong><span>DE 100</span></div></div>'; }
  function lockSvg() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'; }

  /* ---------- velocímetro: aguja y color según la zona ---------- */
  var QZ = { max: 100, zones: [[30, '#ef4444'], [60, '#f97316'], [85, '#dce157'], [100, '#22c55e']], ticks: [0, 30, 60, 85, 100], fmt: function (v) { return String(Math.round(v)); }, unit: '/ 100' };
  W.QUIZ_DIAL = QZ;
  W.dial = function (host, o) {
    host.classList.add('dl');
    var cx = 110, cy = 112, R = 86;
    function pt(f, r) { return [cx - r * Math.cos(Math.PI * f), cy - r * Math.sin(Math.PI * f)]; }
    function arc(f0, f1) { var a = pt(f0, R), b = pt(f1, R); return 'M' + a[0].toFixed(2) + ' ' + a[1].toFixed(2) + ' A' + R + ' ' + R + ' 0 0 1 ' + b[0].toFixed(2) + ' ' + b[1].toFixed(2); }
    var arcs = '', prev = 0;
    o.zones.forEach(function (z) { var f = z[0] / o.max; arcs += '<path class="dl-z" d="' + arc(prev + 0.005, f - 0.005) + '" stroke="' + z[1] + '"/>'; prev = f; });
    var ticks = o.ticks.map(function (t) { var f = t / o.max, q = pt(f, R + 17); return '<text class="dl-t" x="' + q[0].toFixed(1) + '" y="' + (q[1] + 3).toFixed(1) + '" text-anchor="middle">' + (o.tickFmt ? o.tickFmt(t) : t) + '</text>'; }).join('');
    host.innerHTML = '<svg viewBox="0 0 220 128" aria-hidden="true">' + arcs + ticks + '<g class="dl-nd"><path d="M110 112 L105 107 L110 38 L115 107Z"/></g><circle class="dl-hub" cx="110" cy="112" r="9"/></svg><div class="dl-read"><b class="dl-n">0</b><span class="dl-u">' + (o.unit || '') + '</span></div><p class="dl-lab"></p>';
    var nd = host.querySelector('.dl-nd'), num = host.querySelector('.dl-n'), lab = host.querySelector('.dl-lab'), cur = 0, raf = 0;
    void nd.getBoundingClientRect();
    function zoneColor(v) { for (var i = 0; i < o.zones.length; i++) if (v <= o.zones[i][0]) return o.zones[i][1]; return o.zones[o.zones.length - 1][1]; }
    return {
      set: function (v, x) {
        v = Math.max(0, Math.min(o.max, v)); var f = v / o.max, to = v, from = cur;
        nd.style.transform = 'rotate(' + (-90 + 180 * f) + 'deg)'; num.style.color = zoneColor(v);
        cancelAnimationFrame(raf);
        if (reduce || from === to) num.textContent = o.fmt(to);
        else { var t0 = null; (function step(ts) { t0 = t0 || ts; var p = Math.min((ts - t0) / 900, 1), e = 1 - Math.pow(1 - p, 3); num.textContent = o.fmt(from + (to - from) * e); if (p < 1) raf = requestAnimationFrame(step); })(performance.now()); }
        cur = to; if (x && x.label != null) lab.textContent = x.label;
      }
    };
  };

  /* ---------- visualizaciones vivas (calculadoras y chequeos) ---------- */
  W.viz = {};
  var NF = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

  /* Pauta: embudo con partículas. Las que no caben en la banda siguiente se escapan por el costado (la geometría ES la conversión). */
  W.viz.funnel = function (host) {
    host.classList.add('fn');
    host.innerHTML = '<canvas class="fn-cv" aria-hidden="true"></canvas>';
    var cv = host.querySelector('canvas'), ctx = cv.getContext('2d');
    var Hh = 236, dpr = Math.min(2, window.devicePixelRatio || 1), Ww = 360;
    var BT = [8, 92, 176], BH = 30;                      /* tope de cada banda */
    var cur = [1, 0.3, 0.1], tgt = [1, 0.3, 0.1], vals = [0, 0, 0], rate = 14, parts = [], acc = 0, run = false, raf = 0, last = 0;
    var LAB = ['CLICS', 'CONTACTOS', 'VENTAS'], COL = ['#dce157', '#fbcfe8', '#fed7aa'];
    function size() { Ww = host.clientWidth || 360; cv.width = Ww * dpr; cv.height = Hh * dpr; cv.style.width = Ww + 'px'; cv.style.height = Hh + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw(); }
    function bw(i) { return Math.max(26, Ww * 0.9 * cur[i]); }
    function widthAt(y) {
      if (y <= BT[0] + BH) return bw(0);
      for (var i = 0; i < 2; i++) {
        var a = BT[i] + BH, b = BT[i + 1];
        if (y <= b) return bw(i) + (bw(i + 1) - bw(i)) * ((y - a) / (b - a));
        if (y <= b + BH) return bw(i + 1);
      }
      return bw(2);
    }
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
    function draw() {
      ctx.clearRect(0, 0, Ww, Hh); var cx = Ww / 2;
      /* paredes del embudo */
      ctx.beginPath(); ctx.moveTo(cx - bw(0) / 2, BT[0]); ctx.lineTo(cx + bw(0) / 2, BT[0]);
      for (var i = 0; i < 2; i++) { ctx.lineTo(cx + bw(i) / 2, BT[i] + BH); ctx.lineTo(cx + bw(i + 1) / 2, BT[i + 1]); ctx.lineTo(cx + bw(i + 1) / 2, BT[i + 1] + BH); }
      ctx.lineTo(cx + bw(2) / 2, Hh - 6);
      ctx.lineTo(cx - bw(2) / 2, Hh - 6); ctx.lineTo(cx - bw(2) / 2, BT[2] + BH);
      for (var j = 1; j >= 0; j--) { ctx.lineTo(cx - bw(j + 1) / 2, BT[j + 1]); ctx.lineTo(cx - bw(j) / 2, BT[j] + BH); ctx.lineTo(cx - bw(j) / 2, BT[j]); }
      ctx.closePath(); ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 1.5; ctx.stroke();
      /* bandas con etiqueta */
      for (var k = 0; k < 3; k++) {
        ctx.globalAlpha = .22; ctx.fillStyle = COL[k]; rr(cx - bw(k) / 2, BT[k], bw(k), BH, 10); ctx.fill(); ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff'; ctx.font = '700 11px ui-monospace, Menlo, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (bw(k) > 70) ctx.fillText(LAB[k] + ' ' + NF.format(vals[k]), cx, BT[k] + BH / 2);
        else { ctx.textAlign = 'left'; ctx.fillText(NF.format(vals[k]) + ' ' + LAB[k], cx + bw(k) / 2 + 8, BT[k] + BH / 2); }
      }
      /* partículas */
      parts.forEach(function (q) {
        ctx.globalAlpha = Math.max(0, q.a); ctx.fillStyle = q.leak ? '#fb923c' : (q.y > BT[2] + BH ? '#facc15' : '#dce157');
        ctx.beginPath(); ctx.arc(cx + q.d + q.x, q.y, q.leak ? 3 : (q.y > BT[2] + BH ? 4 : 3), 0, 6.283); ctx.fill();
      }); ctx.globalAlpha = 1;
    }
    function step(now) {
      if (!run) return; var dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      for (var i = 0; i < 3; i++) cur[i] += (tgt[i] - cur[i]) * Math.min(1, dt * 6);
      acc += rate * dt; while (acc >= 1) { acc--; parts.push({ d: (Math.random() - 0.5) * bw(0) * 0.98, x: 0, y: BT[0] - 4, vy: 62 + Math.random() * 26, leak: false, a: 1, vx: 0 }); }
      parts = parts.filter(function (q) {
        if (q.leak) { q.x += q.vx * dt; q.y += q.vy * dt * 1.4; q.a -= dt * 1.4; return q.a > 0; }
        q.y += q.vy * dt;
        if (Math.abs(q.d) > widthAt(q.y) / 2 - 2) { q.leak = true; q.vx = (q.d > 0 ? 1 : -1) * (26 + Math.random() * 34); q.x = 0; q.d = q.d > 0 ? widthAt(q.y) / 2 : -widthAt(q.y) / 2; }
        if (q.y > Hh - 8) return false;
        return true;
      });
      draw(); raf = requestAnimationFrame(step);
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { if (es[0].isIntersecting && !reduce) { if (!run) { run = true; last = 0; raf = requestAnimationFrame(step); } } else { run = false; cancelAnimationFrame(raf); } }, { threshold: 0.05 }).observe(host);
    else if (!reduce) { run = true; raf = requestAnimationFrame(step); }
    window.addEventListener('resize', size);
    return {
      update: function (r) {
        var x = r.raw; if (!x) return;
        vals = [x.clics, x.leads, x.ventas]; tgt = [1, Math.max(0.16, Math.sqrt(x.clics ? x.leads / x.clics : 0)), Math.max(0.1, Math.sqrt(x.clics ? x.ventas / x.clics : 0))];
        rate = 10 + Math.min(26, Math.log10(x.clics + 1) * 5);
        if (reduce || !run) { cur = tgt.slice(); size(); }
      }
    };
  };

  /* Carritos: 100 carritos. Compran / se van / los recuperas. */
  var CART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2 12h11l2-8H7"/><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/></svg>';
  W.viz.ecom = function (host) {
    host.classList.add('wf');
    var html = ''; for (var i = 0; i < 100; i++) html += '<i class="wf-c" style="--d:' + (i * 7) + 'ms">' + CART + '</i>';
    host.innerHTML = '<div class="wf-grid" aria-hidden="true">' + html + '</div><p class="wf-leg"></p>';
    var cells = host.querySelectorAll('.wf-c'), leg = host.querySelector('.wf-leg');
    return {
      update: function (r) {
        var x = r.raw; if (!x) return;
        var buy = Math.round((1 - x.ab) * 100), rec = Math.round((100 - buy) * x.rec / 100), lost = 100 - buy - rec;
        for (var i = 0; i < 100; i++) cells[i].className = 'wf-c ' + (i < buy ? 'is-buy' : i < buy + rec ? 'is-rec' : 'is-lost');
        leg.innerHTML = '<span class="wf-k is-buy"></span> Compran <b>' + buy + '</b><span class="wf-k is-rec"></span> Podrías recuperar <b>' + rec + '</b><span class="wf-k is-lost"></span> Se van <b>' + lost + '</b><small>De cada 100 personas que llenan el carrito</small>';
      }
    };
  };

  /* Diseño web: la web se arma sola con tus respuestas */
  var SB = {
    hero: ['Propuesta clara', '<span class="sb-h"></span><span class="sb-h sb-h2"></span><span class="sb-btn"></span>', 'sb-wide'],
    proof: ['Pruebas reales', '<span class="sb-st"></span><span class="sb-st"></span><span class="sb-st"></span>', 'sb-wide'],
    mobile: ['Celular', '<span class="sb-phone"></span>', ''],
    speed: ['Velocidad', '<span class="sb-speed"><i></i></span>', ''],
    contact: ['Contacto visible', '<span class="sb-btn"></span><span class="sb-btn sb-b2"></span>', ''],
    edit: ['Editable', '<span class="sb-pen"></span>', ''],
    seo: ['Aparece en Google', '<span class="sb-snip"></span>', ''],
    stats: ['Medición', '<span class="sb-chart"><i></i><i></i><i></i><i></i></span>', '']
  };
  var SBC = { hero: '#380757', proof: '#ec4899', mobile: '#2563eb', speed: '#9aa514', contact: '#f97316', edit: '#be185d', seo: '#16a34a', stats: '#0ea5e9' };
  W.site = function (c) {
    var aside = el('aside', 'sb'); aside.setAttribute('aria-label', 'Tu web, armándose con tus respuestas');
    var html = '<div class="sb-bar"><i></i><i></i><i></i><span>tuempresa.com</span></div><div class="sb-grid">';
    Object.keys(SB).forEach(function (k) { html += '<div class="sb-b ' + SB[k][2] + ' is-wait" data-v="' + k + '" style="--bc:' + SBC[k] + '"><span class="sb-t"></span><div class="sb-art">' + SB[k][1] + '</div><small>' + SB[k][0] + '</small></div>'; });
    aside.innerHTML = html + '</div><p class="sb-cap">Tu web se arma con lo que respondes: lo que falta se ve punteado.</p>';
    var blocks = {}; aside.querySelectorAll('.sb-b').forEach(function (b) { blocks[b.getAttribute('data-v')] = b; });
    return {
      el: aside,
      set: function (a) {
        c.qs.forEach(function (q, k) {
          var b = blocks[q.v]; if (!b) return; var v = a[k], t = b.querySelector('.sb-t');
          b.classList.remove('is-wait', 'is-yes', 'is-half', 'is-no');
          if (v == null) { b.classList.add('is-wait'); t.textContent = ''; }
          else if (v >= 0.99) { b.classList.add('is-yes'); t.innerHTML = '<i class="wck" aria-hidden="true"></i>'; }
          else if (v > 0) { b.classList.add('is-half'); t.textContent = '½'; }
          else { b.classList.add('is-no'); t.textContent = 'falta'; }
        });
      }
    };
  };

  /* Visibilidad: tu marca sube o baja en una página de resultados de Google */
  var POS = [28, 24, 19, 15, 12, 9, 7, 5, 4, 3, 2, 2, 1];
  var RIV = [['competidor-uno.co', 'Líderes del sector | Competidor 1', 'C1'], ['directorio-local.co', 'Ranking: los 10 mejores proveedores', 'D'], ['competidor-dos.co', 'Cotiza hoy | Competidor 2', 'C2'], ['foro-empresas.com', '¿Alguien recomienda un proveedor?', 'F'], ['competidor-tres.com', 'Expertos desde 2010 | Competidor 3', 'C3'], ['competidor-cuatro.com', 'Soluciones para tu empresa | Competidor 4', 'C4']];
  W.serp = function () {
    var box = el('div', 'sp');
    var rows = RIV.map(function (r, i) { return '<li class="sp-row"><span class="sp-rk"></span><span class="sp-av">' + r[2] + '</span><div><small>' + r[0] + '</small><strong>' + r[1] + '</strong></div></li>'; }).join('') +
      '<li class="sp-row sp-me"><span class="sp-rk"></span><span class="sp-av">TÚ</span><div><small>tumarca.com</small><strong>Tu marca: justo lo que tu cliente necesita</strong></div></li>';
    box.innerHTML = '<div class="sp-bar"><i></i><i></i><i></i><div>mejor servicio cerca de mí</div></div><ol class="sp-list">' + rows + '</ol><p class="sp-off" aria-live="polite"></p><div class="sp-stats"><div><small>TU PUESTO</small><b class="sp-pos">#28</b></div><div><small>PÁGINA</small><b class="sp-pg">3</b></div><div><small>ALCANCE</small><b class="sp-vis">MÍNIMO</b></div></div>';
    var li = box.querySelectorAll('.sp-row'), me = li[6], H = 58;
    function place(el2, slot) { el2.style.transform = 'translateY(' + slot * H + 'px)'; }
    return {
      el: box,
      set: function (score) {
        var p = POS[Math.max(0, Math.min(12, Math.round(score / 100 * 12)))], slot = p <= 6 ? p - 1 : -1, j = 0;
        for (var i = 0; i < 6; i++) { if (j === slot) j++; place(li[i], j); li[i].querySelector('.sp-rk').textContent = '#' + (j + 1); j++; }
        if (slot >= 0) { place(me, slot); me.classList.add('is-in'); me.querySelector('.sp-rk').textContent = '#' + p; } else { place(me, 6.4); me.classList.remove('is-in'); }
        box.querySelector('.sp-off').textContent = p > 10 ? 'Tu marca está en el puesto #' + p + ' (página ' + Math.ceil(p / 10) + '): pocos clientes llegan hasta ahí.' : p > 6 ? 'Tu marca está en el puesto #' + p + ': primera página, pero al final de la lista.' : p <= 3 ? '¡Estás entre los 3 primeros resultados!' : 'Ya estás en la primera página.';
        box.querySelector('.sp-pos').textContent = '#' + p; box.querySelector('.sp-pg').textContent = Math.ceil(p / 10); box.querySelector('.sp-vis').textContent = p <= 3 ? 'MÁXIMO' : p <= 10 ? 'MEDIO' : 'MÍNIMO';
      }
    };
  };

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
    W.remember(c, a);
    var total = scoreOf(c, a), t = tierOf(c, total);
    var gaps = c.qs.map(function (q, k) { return { q: q, k: k, lost: q.w * (1 - a[k]) }; }).filter(function (g) { return g.lost > 0.01; }).sort(function (x, y) { return y.lost - x.lost; });
    var strong = c.qs.filter(function (q, k) { return a[k] >= 0.99; });
    box.className = 'qz qz--r'; box.textContent = '';
    var card = el('div', 'qz-card qz-res');
    card.innerHTML = '<div class="qz-res-top"><div class="qz-dial"></div><div><h3>' + t[0] + '</h3><p>' + t[1] + '</p></div></div>' +
      scaleHtml(c, total, t) +
      '<p class="sd-steps-t">TU PRIMER PASO</p><ol class="qz-steps"><li>' + (gaps.length ? gaps[0].q.s + (a[gaps[0].k] === 0.5 ? ' (ya tienes una parte)' : '') : c.none) + '</li></ol>' +
      breakdownHtml(c, a) +
      (gaps.length ? '<p class="qz-weak">Tu punto más débil: <b>' + gaps[0].q.s + '</b>. Es lo primero que haríamos contigo.</p>' : '') +
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
    /* En /playground/<sim>.html el servidor recalcula el plan con las respuestas y guarda el uso: con esa clave el correo lleva el plan completo. */
    var runKey = null;
    if (/^\/playground\//.test(location.pathname)) {
      fetch('/api/simulador', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sim: location.pathname.split('/').pop().replace(/\.html$/, ''), answers: a }) })
        .then(function (r) { return r.json(); }).then(function (d) { runKey = d && d.runKey || null; }).catch(function () {});
    }
    window.WOWLead.mount(card.querySelector('.qz-lead'), {
      runKey: function () { return runKey; },
      okText: function (email, d) { return d && (d.emailed === 'sent' || d.emailed === 'dry-run') ? '¡Listo! Aquí está tu plan y también te lo enviamos a ' + email + '. Si no lo ves en unos minutos, revisa tu carpeta de spam.' : 'Aquí está tu plan completo. Si quieres que lo revisemos contigo, escríbenos.'; },
      tool: (c.title || sec.id), pitch: 'Te mostramos al instante tu plan completo: cada paso, en qué orden hacerlo y cuántos puntos sumas.',
      data: function () { return { sim: sec.id, page: location.pathname, score: total, tier: t[0], respuestas: a.join(','), prioridades: gaps.slice(0, 4).map(function (g) { return g.q.s; }) }; },
      onUnlock: full
    });

    var dl = W.dial(card.querySelector('.qz-dial'), QZ);
    dl.set(0, { label: 'Tu puntaje' });
    if (reduce) dl.set(total, { label: 'Tu puntaje' }); else setTimeout(function () { dl.set(total, { label: 'Tu puntaje' }); }, 250);
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
    W.detector(sec, c, function () { again(); });
    var pre = known(c), n = c.qs.length, per = c.per || 3, pages = Math.ceil(n / per), p = 0, a = pre.slice(), hud = W.hud(sec, c), box = el('div', 'qz qz--pg');
    var site = c.viz === 'site' ? W.site(c) : null, layout = el('div', 'pgd-wrap' + (site ? ' has-site' : ''));
    sec.appendChild(layout); layout.appendChild(box); if (site) { layout.appendChild(site.el); site.set([]); }
    function upd() { hud.set(a); if (site) site.set(a); }
    function again() { pre = known(c); a = pre.slice(); p = 0; hud.reset(); if (site) site.set([]); page(1); }
    function page(dir) {
      box.className = 'qz qz--pg'; box.textContent = '';
      var dots = ''; for (var d = 0; d < pages; d++) dots += '<i class="' + (d === p ? 'is-on' : d < p ? 'is-done' : '') + '"></i>';
      box.appendChild(el('div', 'pgd-top', '<span class="qz-count">PÁGINA ' + (p + 1) + ' DE ' + pages + '</span><span class="pgd-dots" aria-hidden="true">' + dots + '</span>'));
      var card = el('div', 'qz-card pgd-card' + (reduce ? '' : dir > 0 ? ' qz-from-r' : ' qz-from-l'));
      var from = p * per, to = Math.min(n, from + per);
      for (var k = from; k < to; k++) (function (k) {
        var row = el('fieldset', 'pgd-q'); row.appendChild(el('legend', null, c.qs[k].q + (pre[k] != null ? BADGE : '')));
        row.appendChild(opts(function (v) { a[k] = v; pre[k] = null; upd(); sync(); }, a[k]));
        card.appendChild(row);
      })(k);
      var foot = el('div', 'pgd-foot');
      var back = el('button', 'qz-back', p ? '<i class="wic wic-l" aria-hidden="true"></i> Atrás' : ''); back.type = 'button'; if (!p) back.style.visibility = 'hidden';
      var next = el('button', 'btn btn-primary', p === pages - 1 ? 'Ver mi resultado <i class="wic wic-r" aria-hidden="true"></i>' : 'Siguiente <i class="wic wic-r" aria-hidden="true"></i>'); next.type = 'button';
      foot.appendChild(back); foot.appendChild(next); card.appendChild(foot); box.appendChild(card);
      function sync() { var ok = true; for (var j = from; j < to; j++) if (a[j] == null) ok = false; next.disabled = !ok; }
      sync(); upd();
      back.addEventListener('click', function () { p--; page(-1); });
      next.addEventListener('click', function () { if (p < pages - 1) { p++; page(1); } else { hud.hide(); if (site) site.el.hidden = true; W.result(box, c, a, sec, function () { if (site) site.el.hidden = false; again(); }, H); } });
      if (dir) track('sim_page', { sim: sec.id, page: p + 1 });
    }
    page(0);
  };

  /* ---------- 2. Chatbot ---------- */
  W.modes.chat = function (sec, c, H) {
    H.head(sec, c);
    W.detector(sec, c, function () { start(); });
    var pre = [], n = c.qs.length, a = [], i = 0, hud = W.hud(sec, c), box = el('div', 'qz qz--ch');
    sec.appendChild(box);
    var REACT = { 1: ['¡Eso suma!', 'Bien, anotado.', 'Perfecto, sigamos.'], 0.5: ['Algo es algo.', 'Anotado: hay camino por recorrer.'], 0: ['Sin problema, ahí hay oportunidad.', 'Tranqui, lo vemos en tu plan.'] };
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function start() {
      pre = known(c); a = []; i = 0; hud.reset(); box.className = 'qz qz--ch'; box.textContent = '';
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
      function finish() { say('bot', 'Listo, ya hice las cuentas…', function () { setTimeout(function () { hud.hide(); W.result(box, c, a, sec, start, H); }, reduce ? 0 : 700); }); }
      function ask() {
        reply.textContent = '';
        if (pre[i] != null) {
          var kk = i; a[kk] = pre[kk]; hud.set(a);
          say('bot', (kk + 1) + '/' + n + ' · Esta ya la sabía: ' + c.qs[kk].q + ' → ' + LAB[pre[kk]], function () { i++; if (i < n) ask(); else finish(); });
          return;
        }
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
    W.detector(sec, c, function () { build(); });
    var n = c.qs.length, box = el('div', 'qz qz--sw');
    sec.appendChild(box);
    function build() {
      var pre = known(c);
      box.className = 'qz qz--sw'; box.textContent = '';
      var top = el('aside', 'sd-card rs-top'), dh = el('div', 'rs-dial'), live = el('p', 'sw-live'); live.setAttribute('aria-live', 'polite');
      top.appendChild(dh); top.appendChild(live); box.appendChild(top);
      var dial = W.dial(dh, QZ), ul = el('ul', 'sw-rows'), COL = ['lima', 'orange', 'magenta'];
      c.qs.forEach(function (q, i) {
        var li = el('li', 'toggle-item sw-row toggle-on-' + COL[i % 3]);
        li.innerHTML = '<button type="button" class="switch" role="switch" aria-checked="false"><span class="switch-label">OFF</span><span class="switch-knob"></span></button><span class="toggle-text"></span>';
        li.querySelector('.toggle-text').textContent = q.q;
        li.querySelector('.switch').setAttribute('aria-label', q.q);
        ul.appendChild(li);
      });
      box.appendChild(ul);
      var foot = el('div', 'sw-foot', '<button type="button" class="btn btn-primary sw-go">Ver mi diagnóstico <i class="wic wic-r" aria-hidden="true"></i></button>'); box.appendChild(foot);
      var card = foot, sw = ul.querySelectorAll('.switch');
      function upd() { var a = [].map.call(sw, function (s) { return s.classList.contains('is-on') ? 1 : 0; }), t = scoreOf(c, a); dial.set(t, { label: tierOf(c, t)[0] }); live.textContent = a.filter(function (x) { return x; }).length + ' de ' + n + ' encendidos'; return a; }
      function flip(s) { var on = !s.classList.contains('is-on'); s.classList.toggle('is-on', on); s.setAttribute('aria-checked', on ? 'true' : 'false'); s.querySelector('.switch-label').textContent = on ? 'ON' : 'OFF'; upd(); }
      [].forEach.call(sw, function (s) { s.addEventListener('click', function (e) { e.stopPropagation(); flip(s); }); s.parentNode.addEventListener('click', function () { flip(s); }); });
      pre.forEach(function (v, i) {
        if (v == null) return;
        var s = sw[i];
        if (v >= 0.5) { s.classList.add('is-on'); s.setAttribute('aria-checked', 'true'); s.querySelector('.switch-label').textContent = 'ON'; }
        s.parentNode.querySelector('.toggle-text').insertAdjacentHTML('beforeend', BADGE);
      });
      upd();
      card.querySelector('.sw-go').addEventListener('click', function () { W.result(box, c, upd(), sec, build, H); });
      track('sim_start', { sim: sec.id });
    }
    build();
  };

  /* ---------- 4. Caritas: qué tan de acuerdo estás ---------- */
  var FC = ['#ef4444', '#f97316', '#facc15', '#84cc16', '#22c55e'];
  var FLAB = ['Nada de acuerdo', 'Poco', 'Más o menos', 'De acuerdo', 'Totalmente'];
  /* Caritas IconoWoW (muy_mal, triste, neutral, feliz, muy_feliz): el color sube de rojo a verde y los ojos/boca quedan recortados */
  var FACES = [{"vb":"0 0 377.28 342.24","d":["M144.03,335c-39.87-10.39-87.72-33.25-115.6-62.63C1.59,244.09-7.93,203.61,7.17,167.04c13.13-31.8,39.63-59.14,67.04-80,34.23-26.05,71-47.98,110.5-65.15,36.74-15.97,80.17-27.38,119.36-19.12,19.96,4.21,36.41,15.57,47.06,32.95,19.45,31.73,28.02,67.76,25.8,105.19-1.89,31.84-9.46,61.87-21.83,91.11-25.46,60.21-73.79,106.03-141.16,109.83-23.85,1.35-46.24-.67-69.92-6.84ZM117.31,184.19c15.33-7.85,29.89-16.33,44.68-25.14,4.1-2.44,6.58-6.87,6.83-10.77.3-4.61-1.37-9.22-5.14-12.27l-35.85-28.99c-6.65-5.38-15.89-4.37-20.42,2.64-4.23,6.56-1.93,14.25,4.64,19.12,6.74,4.99,13.15,9.95,19.85,16.19l-26.02,14.85c-6.68,3.81-9.34,11.21-5.91,18.35,2.71,5.64,10.42,9.55,17.32,6.02ZM274.45,183.69c7.17,4.04,14.84,1.69,18.57-4.29,3.93-6.3,2.22-14.23-4.48-18.31l-26.17-15.94,23.33-19.49c5.44-4.55,4.32-12.84-.46-17.54-4.24-4.18-11.37-5.69-17.01-1.75-13.86,9.67-26.85,20.08-39.77,30.95-3.75,3.15-4.49,8.97-3.63,12.87.95,4.33,3.71,7.63,7.89,9.99l41.73,23.53ZM239.16,268.68c5.5,6.12,13.79,8.56,21.6,5.66,7.01-2.6,12.35-9.43,12.68-17.77.23-5.93-1.73-11.42-4.52-16.77-19.61-37.56-64.79-57.54-105.7-40.42-22.24,9.31-41.1,27.1-49.92,49.44-3.72,9.42,1.29,19.43,8.49,23.63,8.34,4.86,17.78,2.45,24.29-4.41,6.03-6.34,12.73-11.42,20.42-15.62,26.02-14.23,53.08-5.51,72.66,16.27Z"]},{"vb":"0 0 369.26 341.57","d":["M217.43,340.43c-60.72,6.42-123.73-14.51-170.67-52.48C6.13,255.1-14.53,200.45,11.64,152.5c7.88-14.44,18.21-26.3,30.52-37.63,34.79-32.01,73.44-58.98,115.14-81.52,45.96-24.84,116.01-47.39,163.6-22.63,15.35,7.98,26.06,21.01,33.09,36.93,8.18,18.51,12.95,37.88,14.49,58.46,3.71,49.55-5.81,98.87-27.78,143.39-24.44,49.51-67.46,85.03-123.27,90.93ZM252.16,123.63c-2.8-6.36-8.52-10.46-14.65-10.93s-12.47,3.08-16.07,8.7c-7.42,11.6-7.86,32.8-.26,43.93,3.8,5.57,9.7,9.02,16.17,8.37,18.44-1.85,23.39-30.55,14.81-50.07ZM158.92,145.2c.3-16.1-5.66-31.85-20.09-31.83-21.14.04-24.92,37.23-14.08,52.4,3.29,4.61,8,7.67,13.27,7.9,13.13.58,20.62-13.18,20.91-28.48ZM234.14,262.87c7.49,7.2,17.39,8.85,25.64,3.32,7.48-5.01,10.76-14.48,7.03-23.58-2.58-6.29-6.31-11.71-11.11-16.92-19.92-21.64-48.52-33.48-78.43-30.3-29.06,3.09-55.2,19.72-70.52,43.89-5.76,9.09-3.06,20.24,4.05,26.02,8.14,6.62,18.9,4.9,26.57-2.04,12.36-11.19,26.99-18.82,43.94-20.02,19.74-1.4,38.39,5.74,52.83,19.62Z"]},{"vb":"0 0 362.14 338.92","d":["M265.25,332.57c-68.17,18.82-150.03-6.48-207.28-46.02-27.96-19.31-48.68-44.85-55.83-78.23-8.65-40.38,9.76-74.7,38.64-102.38C87.52,61.18,151.86,18.28,215.58,4.15c22.57-5.01,45.08-5.72,67.41-.81,22.36,4.92,39.97,18.18,51.25,37.9,16.8,29.38,25.92,61.49,27.55,95.57,2.33,48.93-6.62,109.4-33.75,150.59-14.83,22.52-36.7,37.98-62.79,45.18ZM244.77,172.58c6.08-2.96,10.09-8.39,12.16-14.39,7.59-21.98.14-51.81-19.94-51.93-21.02-.13-29.58,35.12-17,57.87,4.95,8.95,15.58,12.93,24.77,8.46ZM153.79,163.48c7.2-14.28,7.1-31.86-.05-45.62-3.59-6.92-10.64-10.89-17.6-10.64-7.01.25-13.51,4.52-17,11.48-11.42,22.84-3.22,55.54,16.91,55.7,6.96.06,14.07-3.64,17.74-10.91ZM242.01,251.58c11.82-.04,19.5-11.3,19.43-21.06.12-11-7.55-19.41-18.76-22.17l-111.22.04c-12.02,3-19.67,12.37-18.57,23.95,1.02,10.62,9.97,19.62,21.64,19.58l107.47-.34Z"]},{"vb":"0 0 370.22 333.59","d":["M194.81,331.96c-43.26-4.89-83.52-19.66-119.8-42.14-33.28-20.62-60.52-51.1-71.15-88.92-16.1-57.31,20.62-102.09,65.86-133.58C119.07,32.97,182.03,5.37,242.39.57c20.2-1.6,39.63.1,58.62,6.05,22.42,7.02,39.07,22.07,48.82,43.35,8.53,18.61,13.38,37.7,16.77,58.16,7.88,47.47,2.98,95.24-15.52,139.68-8.04,19.32-18.99,36.46-33.96,51.07-32.91,32.11-76.47,38.27-122.31,33.08ZM128,146.2c11.35-2.08,20.62,4.4,25.96,13.56,2.39,4.11,5.4,7.98,10.69,8.18,7.85.29,14.22-7.55,12.53-15.77-2.92-14.22-11.97-26.65-24.4-34.14-25.64-15.47-55.37,2.77-65.06,30.31-1.76,5.01-1.05,10.57,2.02,14.51,2.58,3.32,6.15,4.86,10.16,4.47,9.92-.98,11.44-18.05,28.11-21.11ZM278.59,153.58c8.19,7.15,9.73,16.12,19.05,15.17,7.32-.75,12.26-9.39,9.65-17.39-8.26-25.37-33.7-41.75-58.43-31.56-17.48,7.2-33.45,29.11-27.86,41.83,1.8,4.09,5.35,6.51,8.99,6.84,10.02.91,11.08-9.74,20.41-16.25,8.75-6.1,19.88-5.88,28.18,1.37ZM236.86,203.13c-12.26,13.56-29.48,20.64-47.36,18.16-14.08-1.95-25.67-10.03-34.47-20.58-5.52-6.62-15-7.64-21.9-3.34-6.25,3.9-9.92,12.36-6.98,20.44,10.56,29.06,38.78,49.23,70.37,48.96,30.88-.26,59.06-19.75,70.14-47.89,3.38-8.59-1.42-17.76-8.04-21.13-7.94-4.04-15.71-1.33-21.77,5.37Z"]},{"vb":"0 0 451.75 412.56","d":["M247.81,410.22c-74.23,10.76-155.68-16.18-207.78-70.09C3.91,302.75-15.29,250.53,15.05,204.24c9.86-15.04,21.58-27.66,35.06-39.93,27.48-25.02,57.09-46.83,89.36-65.36,34.1-19.58,70.68-32.51,109.94-26.21,19.41,3.11,35.76,12.49,48.78,27.26,19.74,22.39,35.75,47.3,48.13,74.6,24.6,54.24,26.08,117.01-2.7,169.23-20.02,36.32-54.57,60.42-95.82,66.39ZM279.1,223.38c3.16,6.13,8.78,9.43,14.49,7.98s10.85-6.6,10.24-13.33c-1.67-18.4-13.73-34.7-30.62-42.03-26.99-11.72-58.93,9-66.9,36.22-1.93,6.59,2.64,13.31,7.55,15.3,6.64,2.68,12.4-.41,16.33-6.02,5.31-7.57,13-13.73,22.4-14.72,11.71-1.23,21.16,6.24,26.51,16.62ZM123.36,224.03c8.54.3,14.77,5.2,19.91,10.66,4.35,4.62,10.53,6.45,15.84,3.23,14.41-8.72-.6-30.93-18.79-41.23-14.88-8.43-32.9-7.22-46.09,3.94-16.01,13.55-25.79,41.75-13.29,50.95,3.01,2.21,6.88,2.86,10.6,1.35,4.87-1.97,6.95-6.58,8.62-11.36,3.48-9.96,11.61-17.95,23.2-17.54ZM223.58,338.71c18.5-16.5,30.16-39.71,33.6-64.33.89-6.34-1.54-12.34-5.68-16.16-3.74-3.44-9.29-5.5-15.13-4.43l-94.63,17.33c-8.92,1.63-14.62,11.72-12.07,20.58,5.2,18.09,15.85,34.25,30.15,46.39,20.39,17.3,43.62,18.59,63.76.62Z","M357.4,117.27c-1.43-8.96,2.66-17.83,10.19-22.37l50.33-30.34c11-6.63,24.81-1.89,30.78,8.36,6.24,10.7,2.69,25.53-8.89,31.3l-53.97,26.86c-5.82,2.89-11.81,3.01-18.05-.06-4.44-2.18-9.28-6.74-10.39-13.75Z","M322.66,84.64c-7.37-4.1-10.52-13.42-8.16-21.05l15.02-48.73c2.61-8.47,10.62-13.4,18.18-14.57,9.22-1.42,17.85,2.46,22.67,10.33,4.25,6.95,3.52,15.03.18,22.24l-19.31,41.69c-4.93,10.64-17.44,16.29-28.58,10.1Z","M422.39,183.06l-41.05-5.74c-6.63-.93-9.99-8.48-9.27-14.54.65-5.51,5.32-12.29,12.06-12.02l42.59,1.72c8.46.34,13.49,9.74,12.65,17-.91,7.8-7.97,14.84-16.98,13.58Z"]}];
  function face(m) { var f = FACES[m]; return '<svg viewBox="' + f.vb + '" fill="' + FC[m] + '" aria-hidden="true">' + f.d.map(function (d) { return '<path d="' + d + '"/>'; }).join('') + '</svg>'; }
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
      var foot = el('div', 'qz-foot', i ? '<button type="button" class="qz-back"><i class="wic wic-l" aria-hidden="true"></i> Atrás</button>' : '<span></span>'); card.appendChild(foot); box.appendChild(card);
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
      var foot = el('div', 'po-foot', '<span class="po-count" aria-live="polite"></span>'), go = el('button', 'btn btn-primary', 'Ver mi resultado <i class="wic wic-r" aria-hidden="true"></i>'); go.type = 'button'; go.disabled = true; foot.appendChild(go); box.appendChild(foot);
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
      var go = el('button', 'btn btn-primary', 'Ver mi resultado <i class="wic wic-r" aria-hidden="true"></i>'); go.type = 'button'; side.appendChild(go);
      var cells = [];
      cellQ.forEach(function (k, pos) {
        var b = el('button', 'tt-cell' + (k < 0 ? ' is-free' : '')); b.type = 'button';
        if (k < 0) { b.innerHTML = '<span class="tt-mark"><i class="wsp" aria-hidden="true"></i></span><small>Tu marca</small>'; b.disabled = true; state[pos] = 'X'; }
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
    W.detector(sec, c, function () { build(); });
    var n = c.qs.length, per = c.per || 4, pages = Math.ceil(n / per), box = el('div', 'qz qz--sl');
    sec.appendChild(box);
    function build() {
      box.className = 'qz qz--sl'; box.textContent = '';
      var p = 0, pre = known(c), a = c.qs.map(function (q, k) { return pre[k] != null ? pre[k] : 0; }), touched = c.qs.map(function (q, k) { return pre[k] != null; });
      var top = el('aside', 'sd-card rs-top'), dh = el('div', 'rs-dial'), liv = el('p', 'sw-live'); liv.setAttribute('aria-live', 'polite');
      top.appendChild(dh); top.appendChild(liv); box.appendChild(top);
      var dial = W.dial(dh, QZ), serp = c.viz === 'serp' ? W.serp() : null;
      liv.textContent = 'La aguja se mueve con cada slider.';
      var grid = el('div', 'sd-grid' + (serp ? '' : ' sd-one')), left = el('div', 'sl-left');
      grid.appendChild(left); if (serp) { var side = el('aside', 'sd-card sp-card'); side.appendChild(serp.el); grid.appendChild(side); }
      box.appendChild(grid);
      function live() { var t = scoreOf(c, a); dial.set(t, { label: tierOf(c, t)[0] }); if (serp) serp.set(t); }
      function page(dir) {
        left.textContent = '';
        var top = el('div', 'pgd-top'); top.innerHTML = '<span class="qz-count">PÁGINA ' + (p + 1) + ' DE ' + pages + '</span>'; left.appendChild(top);
        var list = el('div', 'sl-list' + (reduce ? '' : dir > 0 ? ' qz-from-r' : dir < 0 ? ' qz-from-l' : ''));
        for (var k = p * per; k < Math.min(n, p * per + per); k++) (function (k) {
          if (c.qs[k].yn) {                 /* pregunta de sí o no: botones en vez de slider */
            var yr = el('fieldset', 'pgd-q'); yr.appendChild(el('legend', null, c.qs[k].q + (pre[k] != null ? BADGE : '')));
            yr.appendChild(opts(function (v) { a[k] = v; pre[k] = null; touched[k] = true; live(); }, touched[k] ? a[k] : undefined));
            list.appendChild(yr); return;
          }
          var id = 'slq' + (++uid), v = Math.round(a[k] * 10), row = el('div', 'sl-row');
          row.innerHTML = '<label for="' + id + '">' + (c.qs[k].st || c.qs[k].q) + (pre[k] != null ? BADGE : '') + '</label><div class="sl-ctl"><input type="range" id="' + id + '" min="0" max="10" step="1" value="' + v + '" style="--p:' + v * 10 + '%"><output for="' + id + '">' + QT[v] + '</output></div><div class="sl-ends" aria-hidden="true"><span>Nada</span><span>Totalmente</span></div>';
          var inp = row.querySelector('input'), out = row.querySelector('output');
          inp.addEventListener('input', function () { var x = +inp.value; a[k] = x / 10; touched[k] = true; inp.style.setProperty('--p', x * 10 + '%'); out.textContent = QT[x]; live(); });
          list.appendChild(row);
        })(k);
        left.appendChild(list);
        var foot = el('div', 'pgd-foot'), back = el('button', 'qz-back', '<i class="wic wic-l" aria-hidden="true"></i> Atrás'); back.type = 'button'; if (!p) back.style.visibility = 'hidden';
        var next = el('button', 'btn btn-primary', p === pages - 1 ? 'Ver mi resultado <i class="wic wic-r" aria-hidden="true"></i>' : 'Siguiente <i class="wic wic-r" aria-hidden="true"></i>'); next.type = 'button';
        foot.appendChild(back); foot.appendChild(next); left.appendChild(foot);
        back.addEventListener('click', function () { p--; page(-1); });
        next.addEventListener('click', function () { if (p < pages - 1) { p++; page(1); } else W.result(box, c, a, sec, build, H); });
      }
      page(0); live(); track('sim_start', { sim: sec.id });
    }
    build();
  };
})();
