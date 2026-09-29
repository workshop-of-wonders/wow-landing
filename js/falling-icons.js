/* Falling icons playground: lives in its own zone between contact and
   footer, always draggable. Matter.js (79KB, third-party CDN) used to
   load as a blocking <script> at the very top of this block, which
   meant every bit of site JS below it — lightbox, nav, language toggle,
   mega menu, all of it, none of which needs Matter at all — sat waiting
   on that one external fetch to finish before any of it could run.
   Loaded lazily instead: only fetched once this section actually
   scrolls near the viewport (initFallingIcons runs once it's ready),
   so the rest of the page's interactivity no longer depends on it.

   Shared by index.html's #contacto and every servicios/*.html and
   labs/*.html page's .svc-contact CTA — one copy here instead of a
   duplicated block per page. Icon paths are root-absolute (leading
   "/") so they resolve the same whether this runs from the site root
   or from a page nested under servicios/ or labs/. */
function initFallingIcons() {
  var canvas = document.getElementById('fallingCanvas');
  var zone = document.querySelector('.icon-playground');
  if (!canvas || !zone || typeof Matter === 'undefined') return;

  var Engine = Matter.Engine, Render = Matter.Render, World = Matter.World,
      Bodies = Matter.Bodies, Mouse = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint;

  var iconSources = [
    { src: '/design-system/icons/icon-star.svg', w: 1080, h: 1350 },
    { src: '/design-system/icons/icon-swoosh.svg', w: 1080, h: 1350 },
    { src: '/design-system/icons/icon-arch.svg', w: 1080, h: 1350 },
    { src: '/design-system/icons/icon-bloom.svg', w: 1080, h: 1350 },
    { src: '/design-system/logo/wow-mark-purple.svg', w: 227.14, h: 257.27 }
  ];
  var ICON_SIZE = zone.offsetWidth < 500 ? 62 : 101;

  var engine = Engine.create();
  engine.world.gravity.y = 0.85;

  var width = zone.offsetWidth;
  var height = zone.offsetHeight;
  canvas.width = width;
  canvas.height = height;

  var render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
      width: width,
      height: height,
      wireframes: false,
      background: 'transparent'
    }
  });
  Render.setPixelRatio(render, window.devicePixelRatio || 1);

  var walls = [];
  function buildWalls() {
    World.remove(engine.world, walls);
    var t = 60;
    walls = [
      Bodies.rectangle(width / 2, height + t / 2, width + t * 2, t, { isStatic: true, label: 'floor' }),
      Bodies.rectangle(-t / 2, height / 2, t, height * 3, { isStatic: true }),
      Bodies.rectangle(width + t / 2, height / 2, t, height * 3, { isStatic: true })
    ];
    World.add(engine.world, walls);
  }
  buildWalls();

  var icons = [];
  function clearIcons() {
    if (icons.length) World.remove(engine.world, icons);
    icons = [];
  }

  function spawnIcons() {
    clearIcons();
    iconSources.forEach(function (icon, i) {
      var startX = 50 + Math.random() * (width - 100);
      var startY = -100 - Math.random() * 1600;
      var size = ICON_SIZE * (0.9 + Math.random() * 0.5);
      var scale = size / Math.max(icon.w, icon.h);
      var body = Bodies.circle(startX, startY, size / 2, {
        restitution: 0.9,
        friction: 0.25,
        frictionAir: 0.008,
        density: 0.0015,
        angle: Math.random() * Math.PI * 2,
        render: {
          sprite: {
            texture: icon.src,
            xScale: scale,
            yScale: scale
          }
        }
      });
      icons.push(body);
      setTimeout(function () {
        World.add(engine.world, body);
      }, i * 130 + Math.random() * 200);
    });
  }

  /* Falls as soon as this zone is reached, and re-falls (new random spots) every visit */
  if ('IntersectionObserver' in window) {
    var wasVisible = false;
    var spawnObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !wasVisible) {
          wasVisible = true;
          spawnIcons();
        } else if (!entry.isIntersecting) {
          wasVisible = false;
        }
      });
    }, { threshold: 0.2 });
    spawnObserver.observe(zone);
  } else {
    spawnIcons();
  }

  var mouse = Mouse.create(render.canvas);
  /* Render.setPixelRatio scales the canvas for crisp rendering on HiDPI/scaled displays (e.g. Windows
     125% scaling), but Matter's Mouse module doesn't know about that scale unless told explicitly —
     without this, mouse.position drifts out of sync with the physics world and dragging never grabs
     an icon. */
  mouse.pixelRatio = render.options.pixelRatio;
  var mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: { stiffness: 0.15, render: { visible: false } }
  });
  World.add(engine.world, mouseConstraint);
  render.mouse = mouse;

  /* Keep icons inside the zone horizontally during fast drags (side walls can otherwise be tunnelled through).
     Only clamps X — the floor is a real body with restitution, so vertical bouncing is left to the physics
     solver instead of being damped here every frame. */
  Matter.Events.on(engine, 'afterUpdate', function () {
    icons.forEach(function (body) {
      var r = body.circleRadius || 30;
      var x = Math.min(Math.max(body.position.x, r), width - r);
      if (x !== body.position.x) {
        Matter.Body.setPosition(body, { x: x, y: body.position.y });
        Matter.Body.setVelocity(body, { x: body.velocity.x * 0.4, y: body.velocity.y });
      }
    });
  });

  /* Release the dragged icon the instant the mouse/touch/pointer lifts (or leaves the window mid-drag),
     so the next click always grabs a fresh icon instead of staying attached to the previous one */
  function releaseDrag() {
    mouseConstraint.constraint.bodyB = null;
    mouse.button = -1;
  }
  ['mouseup', 'touchend', 'touchcancel', 'pointerup'].forEach(function (evt) {
    document.addEventListener(evt, releaseDrag, { passive: true });
  });
  window.addEventListener('blur', releaseDrag);

  Engine.run(engine);
  Render.run(render);

  window.addEventListener('resize', function () {
    width = zone.offsetWidth;
    height = zone.offsetHeight;
    canvas.width = width;
    canvas.height = height;
    render.options.width = width;
    render.options.height = height;
    Render.setPixelRatio(render, window.devicePixelRatio || 1);
    mouse.pixelRatio = render.options.pixelRatio;
    buildWalls();
  });
}

// Lazy-load Matter.js only once the falling-icons zone is within 600px of
// the viewport, instead of fetching it unconditionally on every page load
// regardless of whether the visitor ever scrolls that far.
(function () {
  var zone = document.querySelector('.icon-playground');
  if (!zone) return;
  var loaded = false;
  function loadMatter() {
    if (loaded) return;
    loaded = true;
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/matter-js@0.19.0/build/matter.min.js';
    s.integrity = 'sha384-OqQP3UcU7efkEYDRjGmQou2uEvzGFGRtwdYXTjnupeB9cWogSgQ4BOhyklFBYbBR';
    s.crossOrigin = 'anonymous';
    s.onload = initFallingIcons;
    document.body.appendChild(s);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) {
        loadMatter();
        io.disconnect();
      }
    }, { rootMargin: '600px 0px' });
    io.observe(zone);
  } else {
    loadMatter();
  }
})();
