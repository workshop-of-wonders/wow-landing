/* Playground: filtro de herramientas por objetivo y por servicio (?servicio=seo). Sin JS se ven todas. */
(function () {
  var grid = document.getElementById('pgGrid');
  if (!grid) return;
  var NAMES = { 'diseno-web': 'Diseño web', 'ecommerce': 'Tiendas virtuales', 'diseno-grafico': 'Diseño gráfico', 'seo': 'SEO, GEO y AEO', 'seo-local': 'Google My Business', 'pauta-digital': 'Pauta digital', 'configuracion-analitica-tracking': 'Analítica y tracking', 'analitica-de-datos': 'Dashboards y datos' };
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.pg-card'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.pg-chip'));
  var count = document.getElementById('pgCount');
  var svc = '';
  try { svc = new URLSearchParams(location.search).get('servicio') || ''; } catch (e) {}
  if (!NAMES[svc]) svc = '';
  if (svc) {
    document.getElementById('pgSvcName').textContent = 'Playground de ' + NAMES[svc] + '.';
    document.getElementById('pgSvc').hidden = false;
    document.getElementById('pgTitle').textContent = 'Herramientas de ' + NAMES[svc];
    document.querySelector('.pg-chips').hidden = true;
  }
  function apply(f) {
    var n = 0;
    cards.forEach(function (c) {
      var show = svc ? c.getAttribute('data-svc') === svc : (f === 'todos' || c.getAttribute('data-need') === f);
      c.hidden = !show;
      if (show) n++;
    });
    chips.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-f') === f ? 'true' : 'false'); });
    count.textContent = n + (n === 1 ? ' herramienta' : ' herramientas');
    if (window.gtag) window.gtag('event', 'playground_filter', { filter: svc || f });
  }
  chips.forEach(function (b) { b.addEventListener('click', function () { apply(b.getAttribute('data-f')); }); });
  apply('todos');
  grid.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (a && window.gtag) window.gtag('event', 'playground_tool_click', { tool: a.getAttribute('href') });
  });
})();
