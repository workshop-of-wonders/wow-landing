/* Blog: búsqueda, filtros, paginación, revelado y parallax (externo por la CSP de vercel.json). */
(function () {
  var PAGE = 9, state = { f: '', q: '', p: 1 };
  var cards = [].slice.call(document.querySelectorAll('#bxGrid .bx-card'));
  var pills = [].slice.call(document.querySelectorAll('.bx-pill'));
  var inputs = [].slice.call(document.querySelectorAll('.bx-search input'));
  var count = document.getElementById('bxCount'), empty = document.getElementById('bxEmpty');
  var pg = document.getElementById('bxPg'), nums = document.getElementById('bxNums'), next = document.getElementById('bxNext');
  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, ''); }
  cards.forEach(function (c) { c._t = norm(c.textContent); });
  function render() {
    var q = norm(state.q).trim();
    var hits = cards.filter(function (c) { return (!state.f || c.dataset.cat === state.f) && (!q || c._t.indexOf(q) > -1); });
    var pages = Math.max(1, Math.ceil(hits.length / PAGE));
    if (state.p > pages) state.p = pages;
    cards.forEach(function (c) { c.hidden = true; });
    hits.slice((state.p - 1) * PAGE, state.p * PAGE).forEach(function (c) { c.hidden = false; });
    count.textContent = hits.length; empty.hidden = hits.length > 0;
    pg.textContent = 'Pág. ' + state.p + ' de ' + pages;
    nums.innerHTML = '';
    for (var i = 1; i <= pages; i++) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = i; b.className = 'bx-num' + (i === state.p ? ' is-on' : '');
      b.onclick = (function (n) { return function () { state.p = n; render(); document.getElementById('articulos').scrollIntoView({ behavior: 'smooth' }); }; })(i);
      nums.appendChild(b);
    }
    next.disabled = state.p >= pages;
    pills.forEach(function (x) { x.classList.toggle('is-on', x.dataset.f === state.f); });
  }
  pills.forEach(function (x) { x.addEventListener('click', function () { state.f = x.dataset.f; state.p = 1; render(); }); });
  inputs.forEach(function (i) { i.addEventListener('input', function () { state.q = i.value; state.p = 1; inputs.forEach(function (o) { if (o !== i) o.value = i.value; }); render(); }); });
  next.addEventListener('click', function () { state.p++; render(); document.getElementById('articulos').scrollIntoView({ behavior: 'smooth' }); });
  document.getElementById('bxReset').addEventListener('click', function () { state = { f: '', q: '', p: 1 }; inputs.forEach(function (i) { i.value = ''; }); render(); });
  document.querySelector('[data-hero-search]').addEventListener('submit', function (e) { e.preventDefault(); document.getElementById('articulos').scrollIntoView({ behavior: 'smooth' }); });
  [].forEach.call(document.querySelectorAll('.bx-sug'), function (s) { s.addEventListener('click', function () {
    inputs.forEach(function (i) { i.value = s.dataset.q; }); state.q = s.dataset.q; state.p = 1; render(); document.getElementById('articulos').scrollIntoView({ behavior: 'smooth' }); }); });
  render();
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rv = [].slice.call(document.querySelectorAll('.bx-rv'));
  if (rm || !('IntersectionObserver' in window)) { rv.forEach(function (e) { e.classList.add('is-in'); }); }
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (e, i) { e.classList.add('bx-hide'); e.style.setProperty('--i', i % 4); io.observe(e); });
    var sh = [].slice.call(document.querySelectorAll('.bx-sh')), hero = document.querySelector('.bx-hero');
    hero.addEventListener('pointermove', function (ev) {
      var r = hero.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width - .5, y = (ev.clientY - r.top) / r.height - .5;
      sh.forEach(function (n) { var d = +n.dataset.d; n.style.translate = (x * d) + 'px ' + (y * d) + 'px'; });
    });
  }
})();
