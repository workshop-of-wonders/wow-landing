(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ICONS = [
    '/design-system/icons/icon-star.svg',
    '/design-system/icons/icon-bloom.svg',
    '/design-system/icons/icon-arch.svg',
    '/design-system/icons/icon-swoosh.svg'
  ];

  // ---------- Parallax de íconos + spotlight siguiendo el cursor ----------
  var floaters = Array.prototype.slice.call(document.querySelectorAll('.floater'));
  var spotlight = document.getElementById('spotlight');

  function onPointer(x, y) {
    var nx = x / window.innerWidth - 0.5;
    var ny = y / window.innerHeight - 0.5;
    spotlight.style.setProperty('--mx', x + 'px');
    spotlight.style.setProperty('--my', y + 'px');
    if (reduceMotion) return;
    floaters.forEach(function (el) {
      var d = parseFloat(el.dataset.depth || '0.5');
      el.style.setProperty('--px', (-nx * 60 * d).toFixed(1) + 'px');
      el.style.setProperty('--py', (-ny * 60 * d).toFixed(1) + 'px');
    });
  }
  window.addEventListener('pointermove', function (e) { onPointer(e.clientX, e.clientY); }, { passive: true });

  // En celular: inclinar el teléfono mueve los íconos.
  window.addEventListener('deviceorientation', function (e) {
    if (e.gamma == null || e.beta == null) return;
    var x = (Math.max(-30, Math.min(30, e.gamma)) / 60 + 0.5) * window.innerWidth;
    var y = (Math.max(-30, Math.min(30, e.beta - 40)) / 60 + 0.5) * window.innerHeight;
    onPointer(x, y);
  }, { passive: true });

  // ---------- Explosión de íconos al tocar ----------
  var sparks = [];
  var running = false;

  function burst(x, y, count, power) {
    if (reduceMotion) return;
    for (var i = 0; i < count; i++) {
      var img = document.createElement('img');
      img.src = ICONS[Math.floor(Math.random() * ICONS.length)];
      img.alt = '';
      img.className = 'spark';
      var size = 16 + Math.random() * 30;
      img.style.setProperty('--size', size + 'px');
      document.body.appendChild(img);
      var angle = Math.random() * Math.PI * 2;
      var speed = (4 + Math.random() * 7) * power;
      sparks.push({
        el: img, x: x - size / 2, y: y - size / 2,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 4 * power,
        rot: Math.random() * 360, vr: (Math.random() - 0.5) * 18,
        life: 0, max: 70 + Math.random() * 40
      });
    }
    if (!running) { running = true; requestAnimationFrame(tick); }
  }

  function tick() {
    for (var i = sparks.length - 1; i >= 0; i--) {
      var s = sparks[i];
      s.vy += 0.32;
      s.vx *= 0.985;
      s.x += s.vx; s.y += s.vy; s.rot += s.vr; s.life++;
      var t = s.life / s.max;
      s.el.style.transform = 'translate3d(' + s.x + 'px,' + s.y + 'px,0) rotate(' + s.rot + 'deg) scale(' + (1 - t * 0.4) + ')';
      s.el.style.opacity = String(1 - t * t);
      if (s.life >= s.max) { s.el.remove(); sparks.splice(i, 1); }
    }
    if (sparks.length) requestAnimationFrame(tick);
    else running = false;
  }

  document.addEventListener('pointerdown', function (e) {
    if (e.target.closest('a, button, input, label, form')) return;
    burst(e.clientX, e.clientY, 12, 1);
  });

  // La palabra "maravilloso" cambia de color y dispara íconos.
  var wowWord = document.getElementById('wowWord');
  var wowColors = ['#dce157', '#ec4899', '#f97316', '#a5d8ff'];
  var wowIdx = 0;
  function poke() {
    wowIdx = (wowIdx + 1) % wowColors.length;
    wowWord.style.color = wowColors[wowIdx];
    var r = wowWord.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 18, 1.1);
  }
  wowWord.addEventListener('click', poke);
  wowWord.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poke(); }
  });

  // ---------- Barra de progreso "armando el sitio" ----------
  var fill = document.getElementById('progressFill');
  var label = document.getElementById('progressLabel');
  var pct = document.getElementById('progressPct');
  var steps = [
    'Puliendo píxeles',
    'Afinando el WOW',
    'Conectando ideas',
    'Mezclando colores',
    'Ajustando tornillos',
    'Encendiendo el taller'
  ];
  var value = 0;
  var step = 0;
  function advance() {
    // Sube rápido al principio y se queda "casi listo" (entre 86% y 94%).
    value = value < 80 ? value + 12 + Math.random() * 10 : 86 + Math.random() * 8;
    value = Math.min(value, 94);
    fill.style.width = value.toFixed(0) + '%';
    pct.textContent = value.toFixed(0) + '%';
    label.style.opacity = '0';
    setTimeout(function () {
      label.textContent = steps[step % steps.length];
      label.style.opacity = '1';
      step++;
    }, 300);
  }
  setTimeout(advance, 700);
  setInterval(advance, 2600);

  // ---------- Acceso del equipo ----------
  var toggle = document.getElementById('teamToggle');
  var form = document.getElementById('gateForm');
  var input = document.getElementById('gateInput');
  var msg = document.getElementById('gateMsg');
  var btn = form.querySelector('.gate-btn');
  var btnText = form.querySelector('.gate-btn-text');

  document.getElementById('gateNext').value = location.pathname + location.search.replace(/[?&]clave=error/, '');

  function openGate(open) {
    toggle.checked = open;
    toggle.setAttribute('aria-expanded', String(open));
    form.hidden = !open;
    if (open) setTimeout(function () { input.focus(); }, 50);
  }
  toggle.addEventListener('change', function () { openGate(toggle.checked); });

  function showError(text) {
    msg.textContent = text;
    msg.classList.add('is-error');
    form.classList.remove('shake');
    void form.offsetWidth;
    form.classList.add('shake');
    input.select();
  }

  // Si llegó por el formulario sin JS con clave equivocada.
  if (/[?&]clave=error/.test(location.search)) {
    openGate(true);
    showError('Esa no es la palabra mágica. Intenta de nuevo.');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!input.value) return;
    btn.disabled = true;
    btnText.textContent = 'Abriendo…';
    msg.textContent = '';
    msg.classList.remove('is-error');

    fetch(form.action, {
      method: 'POST',
      headers: { 'x-wow-gate': 'fetch' },
      body: new FormData(form),
      credentials: 'same-origin'
    }).then(function (res) {
      return res.json().catch(function () { return { ok: false }; }).then(function (data) {
        if (res.ok && data.ok) {
          msg.textContent = '¡Listo, pasa al taller! ✦';
          var r = form.getBoundingClientRect();
          burst(r.left + r.width / 2, r.top, 40, 1.4);
          document.body.classList.add('is-open');
          setTimeout(function () { location.replace(data.next || '/'); }, 1200);
        } else {
          btn.disabled = false;
          btnText.textContent = 'Entrar';
          showError('Esa no es la palabra mágica. Intenta de nuevo.');
        }
      });
    }).catch(function () {
      btn.disabled = false;
      btnText.textContent = 'Entrar';
      showError('No pudimos conectar. Revisa tu internet e intenta otra vez.');
    });
  });
})();
