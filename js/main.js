document.getElementById('year').textContent = new Date().getFullYear();

/* createFocusTrap is defined in js/common.js, loaded before this file. */

/* Nav turns solid purple once the hero is scrolled past */
(function () {
  var nav = document.querySelector('.nav');
  if (!nav) return;
  function updateNav() {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
})();

/* Hero mosaic: the "taller" door as a custom cursor, active only while the mouse is over
   a project card. It's position:fixed + pointer-events:none, so it never sits in the
   card's layout and a click always falls straight through to that card's existing
   [data-lightbox] handler, unchanged. Skipped entirely on touch (no real cursor there).

   The cards scroll on their own (the mosaic's auto-scroll animation), so a card can slide
   out from under a perfectly still mouse — or a new one can slide in — without any
   mouseenter/mouseleave ever firing. Relying on those events alone left the door stuck
   visible over content it wasn't over anymore. Instead, every frame re-checks with
   elementFromPoint whether a card is actually under the cursor right now, so the door
   can never drift out of sync with what's actually moving underneath it. */
(function () {
  if (window.matchMedia('(hover: none)').matches) return;
  var zone = document.querySelector('.hero-media');
  if (!zone) return;

  var cursor = document.createElement('div');
  cursor.className = 'door-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  /* .door-cursor is JS-positioned (translate only, every frame); the -50%/-50% centering
     and the enter/exit scale+opacity animation live on this inner wrapper instead, so the
     two transforms never fight over the same inline style */
  cursor.innerHTML =
    '<div class="door-cursor-inner">' +
      '<span class="door-cursor-spark door-cursor-spark-1">✦</span>' +
      '<span class="door-cursor-spark door-cursor-spark-2">✧</span>' +
      '<span class="door-cursor-frame">' +
        '<span class="door-cursor-leaf">' +
          '<span class="door-cursor-handle"></span>' +
          '<span class="door-cursor-mark-ring"><img src="design-system/logo/wow-mark-purple.svg" alt=""></span>' +
          '<span class="door-cursor-label"><span>ABRIR<br>TALLER</span><span class="door-cursor-arrow">↗</span></span>' +
        '</span>' +
      '</span>' +
    '</div>';
  document.body.appendChild(cursor);

  var mouseX = -9999, mouseY = -9999, curX = 0, curY = 0, raf = null, visible = false, moved = false;

  function isOverCard(x, y) {
    var el = document.elementFromPoint(x, y);
    return !!(el && el.closest && el.closest('.media-card'));
  }
  function setVisible(v) {
    if (v === visible) return;
    visible = v;
    cursor.classList.toggle('is-visible', v);
  }

  function render() {
    curX += (mouseX - curX) * 0.35;
    curY += (mouseY - curY) * 0.35;
    cursor.style.transform = 'translate(' + curX + 'px,' + curY + 'px)';
    setVisible(moved && isOverCard(mouseX, mouseY));
    raf = requestAnimationFrame(render);
  }

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!moved) { moved = true; curX = mouseX; curY = mouseY; }
    if (!raf) raf = requestAnimationFrame(render);
  });
  document.addEventListener('mouseleave', function () { setVisible(false); });
})();

/* Labs accordion: on touch/mobile, tap a panel to expand it (only one open at a time) */
document.querySelectorAll('.labs-panel').forEach(function (panel) {
  panel.addEventListener('click', function (e) {
    if (window.innerWidth > 900) return;
    var wasOpen = panel.classList.contains('is-open');
    document.querySelectorAll('.labs-panel').forEach(function (p) { p.classList.remove('is-open'); });
    if (!wasOpen) panel.classList.add('is-open');
  });
});

/* "Abrir el taller" door: reveals the rest of the Trabajo gallery from behind the door */
(function () {
  var doorBtn = document.getElementById('workDoorBtn');
  var hidden = document.getElementById('workHidden');
  if (!doorBtn || !hidden) return;
  doorBtn.addEventListener('click', function () {
    var isOpen = doorBtn.classList.toggle('is-open');
    doorBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    hidden.classList.toggle('is-open', isOpen);
  });

  /* The wiggle is a CSS infinite animation, but its timeline keeps running
     while the door is off-screen — so by the time it scrolls into view it
     could be anywhere in the cycle, sometimes looking static for a couple
     seconds. Restarting the animation the instant it becomes visible makes
     it wiggle right away, like it's asking to be opened. */
  var frame = doorBtn.querySelector('.work-door-frame');
  if (frame && 'IntersectionObserver' in window) {
    var seen = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !seen) {
          seen = true;
          frame.style.animation = 'none';
          void frame.offsetWidth;
          frame.style.animation = '';
        }
      });
    }, { threshold: 0.4 });
    io.observe(frame);
  }
})();

/* Marcas logos: hovering a logo we can tie to a real project subtly highlights that card
   in the gallery above — a secondary, elegant hint, not a navigation */
document.querySelectorAll('[data-match]').forEach(function (el) {
  var key = el.dataset.match;
  el.addEventListener('mouseenter', function () {
    document.querySelectorAll('[data-match="' + key + '"]').forEach(function (m) { m.classList.add('is-highlighted'); });
  });
  el.addEventListener('mouseleave', function () {
    document.querySelectorAll('[data-match="' + key + '"]').forEach(function (m) { m.classList.remove('is-highlighted'); });
  });
});

/* Figma-style collaborative cursor over the services diagram */
(function () {
  var section = document.getElementById('servicios');
  var cursor = document.getElementById('figmaCursor');
  if (!section || !cursor) return;
  var clickableSelector = 'a, button, [data-open-form], [onclick], [role="button"]';
  section.addEventListener('mousemove', function (e) {
    cursor.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
    cursor.classList.add('is-visible');
    cursor.classList.toggle('is-pointer', !!e.target.closest(clickableSelector));
  });
  section.addEventListener('mouseleave', function () {
    cursor.classList.remove('is-visible');
  });
})();

function setSwitch(btn, isOn) {
  btn.classList.toggle('is-on', isOn);
  btn.setAttribute('aria-pressed', isOn ? 'true' : 'false');
  btn.querySelector('.switch-label').textContent = isOn ? 'ON' : 'OFF';
  var item = btn.closest('.toggle-item');
  if (item) item.classList.toggle('text-hidden', !isOn);
}
document.querySelectorAll('.switch').forEach(function (btn) {
  btn.addEventListener('click', function () {
    btn.dataset.userSet = '1';
    setSwitch(btn, !btn.classList.contains('is-on'));
  });
});

/* Hub diagram: each pill is a link straight to its service page. */
var hubDiagramEl = document.getElementById('hubDiagram');
var hubPills = [].slice.call(document.querySelectorAll('.hub-pill'));

/* Draw a connector line from every pill to the center W, redrawn whenever the layout changes */
(function () {
  var svg = document.getElementById('hubArrows');
  var center = document.getElementById('hubCenter');
  if (!svg || !center) return;
  var svgNS = 'http://www.w3.org/2000/svg';

  function drawLines() {
    var diagramRect = hubDiagramEl.getBoundingClientRect();
    var w = diagramRect.width;
    var h = diagramRect.height;
    if (!w || !h) return;
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.innerHTML = '';
    var centerRect = center.getBoundingClientRect();
    var cx = centerRect.left - diagramRect.left + centerRect.width / 2;
    var cy = centerRect.top - diagramRect.top + centerRect.height / 2;
    hubPills.forEach(function (pill) {
      var r = pill.getBoundingClientRect();
      var px = r.left - diagramRect.left + r.width / 2;
      var py = r.top - diagramRect.top + r.height / 2;
      var line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', cx);
      line.setAttribute('y1', cy);
      line.setAttribute('x2', px);
      line.setAttribute('y2', py);
      line.setAttribute('stroke', '#dce157');
      line.setAttribute('stroke-opacity', '0.4');
      line.setAttribute('stroke-width', '1.5');
      svg.appendChild(line);
    });
  }

  drawLines();
  window.addEventListener('resize', drawLines);
  window.addEventListener('load', drawLines);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawLines);
  setTimeout(drawLines, 300);
})();
/* hub-pill and nav-dropdown-link are now real <a href> links straight to
   each service's own page, so no popup/description JS is needed here
   anymore — the browser's default navigation handles the click. */

/* Automatic Editorial Horizontal Collage System — generic, reusable, no
   per-project knowledge. Given any list of image URLs it measures each
   image's real aspect ratio, decides which ones deserve to span both rows
   (a "tall" module) vs. sit in a single row, computes each item's pixel
   width from --pc-row-h so the image is never cropped/stretched, then lets
   CSS grid's own dense packing (grid-auto-flow: column dense, defined in
   styles.css on .project-collage) fill the 2-row strip with no gaps. */
var ProjectCollage = (function () {
  // Real brand typefaces (from the client's brand board) that are also
  // freely available on Google Fonts — used for the kinetic type tile
  // instead of the site's own display font, so it shows each project's
  // actual typography: "Aa" in the brand's primary face, "123" in its
  // secondary one. Most brands only had one of their two real fonts
  // available on Google Fonts, so "secondary" just falls back to
  // "primary" for those — only Seed Capital and Orbit have a genuinely
  // distinct second face available.
  var TYPE_FONT_BY_SLUG = {
    'seed-capital': { primary: "'Open Sans', sans-serif", primaryWeight: 800, secondary: "'Montserrat', sans-serif", secondaryWeight: 600 },
    'arlo': { primary: "'Bree Serif', serif" },
    'indeleble': { primary: "'Bree Serif', serif" },
    'pretty-pets': { primary: "'Quicksand', sans-serif", primaryWeight: 700 },
    'clinica-del-cerebro': { primary: "'Poppins', sans-serif", primaryWeight: 600 },
    'lamparas-milan': { primary: "'Coustard', serif" },
    'tatas-photos': { primary: "'Poppins', sans-serif", primaryWeight: 600 },
    'am-studios': { primary: "'Poppins', sans-serif", primaryWeight: 600 },
    'aja-waffles': { primary: "'Fredoka', sans-serif", primaryWeight: 600 },
    'orbit': { primary: "'Teko', sans-serif", primaryWeight: 500, secondary: "'Teko', sans-serif", secondaryWeight: 700 },
    'prepapp': { primary: "'Fredoka', sans-serif", primaryWeight: 600 }
  };

  function loadImage(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }

  // The static "Aa123" type-specimen image is just two flat color halves —
  // sampled here so the kinetic tile below can reuse each brand's own two
  // colors instead of a generic palette.
  function sampleTwoColors(img) {
    try {
      var c = document.createElement('canvas');
      c.width = 20; c.height = 20;
      var ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, 20, 20);
      // Sample near the corners, not the center — the specimen's bold white
      // "Aa 123" glyphs sit in the middle of each half, so a center sample
      // picks up text pixels and washes the color out.
      var d1 = ctx.getImageData(2, 2, 1, 1).data;
      var d2 = ctx.getImageData(17, 2, 1, 1).data;
      return ['rgb(' + d1[0] + ',' + d1[1] + ',' + d1[2] + ')', 'rgb(' + d2[0] + ',' + d2[1] + ',' + d2[2] + ')'];
    } catch (e) {
      return ['#7c3aed', '#ec4899'];
    }
  }

  // A single flat card's own background color, sampled from its corner
  // pixel — used to color the card itself so it reads as a seamless
  // extension of the art rather than a mismatched default. Takes the most
  // common color across a whole grid of samples, not just one corner
  // pixel: several taglines repeat their text edge-to-edge (by design, so
  // a short phrase still fills the card), so any single fixed point can
  // land on a letterform instead of the actual background — the
  // background still covers most of the image, so the mode wins.
  function sampleCornerColor(img) {
    try {
      var size = 12;
      var c = document.createElement('canvas');
      c.width = size; c.height = size;
      var ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      var data = ctx.getImageData(0, 0, size, size).data;
      var counts = {};
      var best = null, bestCount = 0;
      for (var i = 0; i < data.length; i += 4) {
        // Quantize slightly so anti-aliased near-duplicates of the same
        // color still count as one bucket.
        var key = (data[i] >> 3) + ',' + (data[i + 1] >> 3) + ',' + (data[i + 2] >> 3);
        counts[key] = (counts[key] || 0) + 1;
        if (counts[key] > bestCount) { bestCount = counts[key]; best = [data[i], data[i + 1], data[i + 2]]; }
      }
      return best ? 'rgb(' + best[0] + ',' + best[1] + ',' + best[2] + ')' : null;
    } catch (e) {
      return null;
    }
  }

  // Standard CSS3 named colors, used only to label each swatch with a
  // real, recognizable color name (nearest match by RGB distance) instead
  // of a raw hex code — the swatch itself still uses the brand's exact hex.
  var CSS_NAMED_COLORS = [["#F0F8FF","alice blue"],["#FAEBD7","antique white"],["#00FFFF","aqua"],["#7FFFD4","aquamarine"],["#F0FFFF","azure"],["#F5F5DC","beige"],["#FFE4C4","bisque"],["#000000","black"],["#FFEBCD","blanched almond"],["#0000FF","blue"],["#8A2BE2","blue violet"],["#A52A2A","brown"],["#DEB887","burlywood"],["#5F9EA0","cadet blue"],["#7FFF00","chartreuse"],["#D2691E","chocolate"],["#FF7F50","coral"],["#6495ED","cornflower blue"],["#FFF8DC","cornsilk"],["#DC143C","crimson"],["#00008B","dark blue"],["#008B8B","dark cyan"],["#B8860B","dark goldenrod"],["#A9A9A9","dark gray"],["#006400","dark green"],["#BDB76B","dark khaki"],["#8B008B","dark magenta"],["#556B2F","dark olive green"],["#FF8C00","dark orange"],["#9932CC","dark orchid"],["#8B0000","dark red"],["#E9967A","dark salmon"],["#8FBC8F","dark sea green"],["#483D8B","dark slate blue"],["#2F4F4F","dark slate gray"],["#00CED1","dark turquoise"],["#9400D3","dark violet"],["#FF1493","deep pink"],["#00BFFF","deep sky blue"],["#696969","dim gray"],["#1E90FF","dodger blue"],["#B22222","firebrick"],["#FFFAF0","floral white"],["#228B22","forest green"],["#FF00FF","magenta"],["#DCDCDC","gainsboro"],["#F8F8FF","ghost white"],["#FFD700","gold"],["#DAA520","goldenrod"],["#808080","gray"],["#008000","green"],["#ADFF2F","green yellow"],["#F0FFF0","honeydew"],["#FF69B4","hot pink"],["#CD5C5C","indian red"],["#4B0082","indigo"],["#FFFFF0","ivory"],["#F0E68C","khaki"],["#E6E6FA","lavender"],["#FFF0F5","lavender blush"],["#7CFC00","lawn green"],["#FFFACD","lemon chiffon"],["#ADD8E6","light blue"],["#F08080","light coral"],["#E0FFFF","light cyan"],["#FAFAD2","light goldenrod yellow"],["#D3D3D3","light gray"],["#90EE90","light green"],["#FFB6C1","light pink"],["#FFA07A","light salmon"],["#20B2AA","light sea green"],["#87CEFA","light sky blue"],["#778899","light slate gray"],["#B0C4DE","light steel blue"],["#FFFFE0","light yellow"],["#00FF00","lime"],["#32CD32","lime green"],["#FAF0E6","linen"],["#800000","maroon"],["#66CDAA","medium aquamarine"],["#0000CD","medium blue"],["#BA55D3","medium orchid"],["#9370DB","medium purple"],["#3CB371","medium sea green"],["#7B68EE","medium slate blue"],["#00FA9A","medium spring green"],["#48D1CC","medium turquoise"],["#C71585","medium violet red"],["#191970","midnight blue"],["#F5FFFA","mint cream"],["#FFE4E1","misty rose"],["#FFE4B5","moccasin"],["#FFDEAD","navajo white"],["#000080","navy"],["#FDF5E6","old lace"],["#808000","olive"],["#6B8E23","olive drab"],["#FFA500","orange"],["#FF4500","orange red"],["#DA70D6","orchid"],["#EEE8AA","pale goldenrod"],["#98FB98","pale green"],["#AFEEEE","pale turquoise"],["#DB7093","pale violet red"],["#FFEFD5","papaya whip"],["#FFDAB9","peach puff"],["#CD853F","peru"],["#FFC0CB","pink"],["#DDA0DD","plum"],["#B0E0E6","powder blue"],["#800080","purple"],["#FF0000","red"],["#BC8F8F","rosy brown"],["#4169E1","royal blue"],["#8B4513","saddle brown"],["#FA8072","salmon"],["#F4A460","sandy brown"],["#2E8B57","sea green"],["#FFF5EE","seashell"],["#A0522D","sienna"],["#C0C0C0","silver"],["#87CEEB","sky blue"],["#6A5ACD","slate blue"],["#708090","slate gray"],["#FFFAFA","snow"],["#00FF7F","spring green"],["#4682B4","steel blue"],["#D2B48C","tan"],["#008080","teal"],["#D8BFD8","thistle"],["#FF6347","tomato"],["#40E0D0","turquoise"],["#EE82EE","violet"],["#F5DEB3","wheat"],["#FFFFFF","white"],["#F5F5F5","white smoke"],["#FFFF00","yellow"],["#9ACD32","yellow green"]];
  function nearestColorName(hex) {
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    var best = null, bestDist = Infinity;
    CSS_NAMED_COLORS.forEach(function (entry) {
      var nr = parseInt(entry[0].slice(1, 3), 16), ng = parseInt(entry[0].slice(3, 5), 16), nb = parseInt(entry[0].slice(5, 7), 16);
      var dist = (r - nr) * (r - nr) + (g - ng) * (g - ng) + (b - nb) * (b - nb);
      if (dist < bestDist) { bestDist = dist; best = entry[1]; }
    });
    return best.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  // Full brand palettes, sampled straight from the client's brand board PDF
  // (the same source as TYPE_FONT_BY_SLUG) — one swatch tile per real color.
  var COLORS_BY_SLUG = {
    'seed-capital': ['#FFBD58', '#00C2CB', '#61B333', '#F1F4F4', '#D0CD08', '#2D4672'],
    'tin-t': ['#20989D', '#D0085C', '#D0CD08', '#08D033', '#505858', '#DEE9EB'],
    'arlo': ['#FBA35C', '#528BBA', '#2A507D'],
    'indeleble': ['#833C85', '#4E1781'],
    'pretty-pets': ['#A778E7', '#FABE65', '#E3F78F', '#5CE1E6', '#2D4674', '#FFFFFF'],
    'clinica-del-cerebro': ['#030083', '#5CE1E6', '#004AAC', '#005281', '#FFBD58', '#FFFFFF'],
    'lamparas-milan': ['#52000D', '#C69538', '#505858', '#DEE9EB', '#E3D5CC'],
    'tatas-photos': ['#000000', '#FFFFFF'],
    'am-studios': ['#000000', '#212121', '#FFABD8', '#FFFFFF', '#86B0FF'],
    'aja-waffles': ['#01B6A6', '#FDD924', '#D95C00', '#FFEFDB'],
    'orbit': ['#000000', '#DEE9EB', '#505858', '#73616F'],
    'prepapp': ['#0C448E', '#F6A728', '#DD8B17'],
    'geco': ['#3F721D', '#74B053', '#80CC29', '#F58003', '#583B40', '#F1F7F6']
  };

  function normalize(images) {
    return images.map(function (item) {
      return typeof item === 'string' ? { src: item, priority: 1 } : { src: item.src, priority: item.priority || 1 };
    });
  }

  // Bumped on every render() call so a slow, still-in-flight render from a
  // previously-clicked project can detect it's stale (a newer one started)
  // and bail out without ever touching the DOM — otherwise, switching
  // quickly between two projects while the first is still loading its
  // images could let the first one "win" the race and overwrite the second's
  // freshly-rendered collage after the fact, making the whole thing look
  // stuck/out of sync.
  var renderToken = 0;

  async function render(container, images, opts) {
    opts = opts || {};
    var myToken = ++renderToken;
    var rowHVar = getComputedStyle(container).getPropertyValue('--pc-row-h') || '190px';
    var rowH = parseFloat(rowHVar) || 190;
    var items = normalize(images);
    // Clear immediately (instead of only right before the final DOM build,
    // after every image has finished loading) and show a lightweight
    // loading state — otherwise the *previous* project's collage just sits
    // there frozen for however long this one's images take to fetch, which
    // reads as the UI being stuck rather than loading.
    container.innerHTML = '';
    container.classList.add('is-loading');
    if (!items.length) { container.classList.remove('is-loading'); return; }

    // Fetch the main image set and the tagline/pattern probes in parallel
    // (they used to run one after another, adding their fetch time on top
    // of the main set's instead of overlapping with it).
    var slugGuess = null;
    for (var gi = 0; gi < items.length; gi++) {
      var gm = items[gi].src.match(/portfolio\/([^/]+)\/type\.webp$/);
      if (gm) { slugGuess = gm[1]; break; }
    }
    var loadedPromise = Promise.all(items.map(function (it) { return loadImage(it.src); }));
    var taglinePromise = slugGuess ? loadImage('design-system/portfolio/' + slugGuess + '/tagline.webp') : Promise.resolve(null);
    var patternPromise = slugGuess ? loadImage('design-system/portfolio/' + slugGuess + '/pattern.webp') : Promise.resolve(null);
    var loaded = await loadedPromise;
    if (myToken !== renderToken) return; // a newer render started meanwhile — discard this one
    var pieces = items.map(function (it, i) {
      var img = loaded[i];
      var ratio = img ? (img.naturalWidth || 1) / (img.naturalHeight || 1) : 4 / 3;
      return { src: it.src, priority: it.priority, ratio: ratio, img: img };
    });

    // Append one square swatch tile per real brand color (from the brand
    // board PDF) — found via the same portfolio/<slug>/type.webp path
    // already in this project's image set, so no extra data is needed per
    // work-item.
    var slugForColors = null;
    var typePieceForPhrase = null;
    var slugForPhrase = null;
    for (var pi = 0; pi < pieces.length; pi++) {
      var m = pieces[pi].src.match(/portfolio\/([^/]+)\/type\.webp$/);
      if (m) {
        if (!typePieceForPhrase && pieces[pi].img) { typePieceForPhrase = pieces[pi]; slugForPhrase = m[1]; }
        if (!slugForColors && COLORS_BY_SLUG[m[1]]) slugForColors = m[1];
      }
    }
    if (slugForColors) {
      // All the brand's colors stacked in one tall card (like a paint-chip
      // strip) — one tile, not one tile per color.
      var paletteRatio = 1;
      pieces.push({ src: 'palette:' + slugForColors, priority: 1, ratio: paletteRatio, img: null, isPalette: true, colors: COLORS_BY_SLUG[slugForColors] });
    }
    // A tagline card — the project's own hand-designed tagline graphic
    // (design-system/portfolio/<slug>/tagline.webp, not every brand has
    // one), scrolling sideways as an endless marquee. Probed directly by
    // path, same "no extra data needed per item" approach as the pattern
    // and palette tiles.
    if (slugForPhrase) {
      var taglineImg = await taglinePromise;
      if (myToken !== renderToken) return;
      if (taglineImg) {
        var taglineRatio = (taglineImg.naturalWidth || 1) / (taglineImg.naturalHeight || 1);
        // Sample the graphic's own corner pixel as the card's background —
        // the art is a flat brand-color card itself, so the strip of card
        // showing through the gap between the two looping copies should
        // read as the same color, not a mismatched default.
        var taglineBg = sampleCornerColor(taglineImg);
        pieces.push({ src: 'tagline:' + slugForPhrase, priority: 1, ratio: taglineRatio, img: null, isTaglineImg: true, taglineSrc: taglineImg.src, taglineBg: taglineBg });
      }
    }
    // A spinning pattern card — the brand's own seamless print pattern
    // (from design-system/portfolio/<slug>/pattern.webp, not every brand
    // has one), tiled and rotating forever. Probed directly by path
    // instead of requiring it in each work-item's data-images — same
    // "no extra data needed per item" approach as the palette tile.
    if (slugForPhrase) {
      var patternImg = await patternPromise;
      if (myToken !== renderToken) return;
      if (patternImg) {
        pieces.push({ src: 'pattern:' + slugForPhrase, priority: 1, ratio: 1, img: null, isPattern: true, patternSrc: patternImg.src, colorImg: typePieceForPhrase.img });
      }
    }

    // Every piece is one row tall by default — no .pc-span2 — with two
    // exceptions: a single image (nothing to share the strip with, so it
    // gets the full 2-row height instead of sitting tiny up top) and
    // portrait/vertical images (ratio < 0.85 — naturally read better tall
    // than squeezed into one short row).
    var gap = parseFloat(getComputedStyle(container).getPropertyValue('--pc-gap')) || 3;
    var isSingle = pieces.length === 1;
    // Logo/icon assets are flat marks on their own transparent canvas, not
    // photos — filling the tile edge-to-edge like a photo crops right up to
    // the mark with no breathing room. These get a padded card treatment
    // instead (see .pc-item-logo in styles.css).
    var isLogoAsset = /\/(?:portfolio\/[^/]+\/(?:logo|icon)|clients\/[^/]+)\.webp$/;
    // Icon marks specifically (not every brand has one, unlike logo) are
    // always square symbols, not wordmarks — force the tile to a true 1:1
    // instead of following the logo clamp range below (1:1–1:2.2), which
    // exists for wordmarks and would only ever narrow an icon down, never
    // widen it, but shouldn't apply to a mark meant to read as a square.
    var isIconAsset = /\/portfolio\/[^/]+\/icon\.webp$/;
    var isTypeAsset = /\/type\.webp$/;
    container.innerHTML = '';
    container.classList.remove('is-loading');
    var builtItems = [];
    pieces.forEach(function (piece) {
      var isLogo = isLogoAsset.test(piece.src);
      var isIcon = isIconAsset.test(piece.src);
      var isType = isTypeAsset.test(piece.src);
      var isTall = !isLogo && !isType && !piece.isPalette && !piece.isTaglineImg && !piece.isPattern && (isSingle || piece.ratio < 0.85);
      var height = isTall ? (rowH * 2 + gap) : rowH;
      // Wordmarks are often much wider than tall (e.g. a ~9:1 logo) — forcing
      // every logo tile to a 1:1 square shrinks those down to near-illegible.
      // Follow the real ratio like photos do, just clamped to a sane 1:1–1:2.2
      // range so a square icon doesn't go narrower than square either. Icon
      // marks specifically always get the true 1:1, ignoring their own
      // (possibly slightly off-square) file ratio.
      var width = isIcon ? height : (isLogo ? Math.round(height * Math.max(1, Math.min(2.2, piece.ratio))) : Math.round(height * piece.ratio));
      // Tagline card stays a 1:1 square like the other generated tiles
      // (palette/pattern) — the art itself scrolls 3 spaced-out copies
      // through that square window rather than the card growing to fit
      // all 3 at once.
      if (piece.isTaglineImg) {
        piece.taglineGapPx = Math.round(gap * 2.5);
        width = height;
      }
      var el = document.createElement('div');
      el.style.width = width + 'px';
      el.style.height = height + 'px';
      // Generated 1:1 tiles (palette/pattern/tagline) are deliberately always
      // square by design — excluded from the "promote a lone leftover item to
      // full height" pass below, which only applies to real photos/logos/type
      // specimens that just follow their own aspect ratio.
      var promotable = !piece.isPalette && !piece.isPattern && !piece.isTaglineImg;
      if (piece.isPalette) {
        // Several small vertical strips side by side in one card (same
        // multi-column marquee technique as the hero), each scrolling the
        // full color list at its own speed/direction for an organic feel,
        // instead of one single wide column.
        el.className = 'pc-item pc-item-palette';
        var COLS = 3;
        var durations = [16, 22, 19];
        for (var ci = 0; ci < COLS; ci++) {
          var col = document.createElement('div');
          col.className = 'pc-palette-col';
          var track = document.createElement('div');
          track.className = 'pc-palette-track';
          track.style.animationDuration = durations[ci % durations.length] + 's';
          track.style.animationDirection = (ci % 2 === 1) ? 'reverse' : 'normal';
          // Rotate the start point per column so the three columns aren't
          // showing the same colors in the same order side by side.
          var shift = (ci * Math.max(1, Math.floor(piece.colors.length / COLS))) % piece.colors.length;
          var colColors = piece.colors.slice(shift).concat(piece.colors.slice(0, shift));
          colColors.concat(colColors).forEach(function (hex) {
            var chip = document.createElement('div');
            // Middle column's label sits at the bottom (default); the two
            // flanking columns have it top-left, same as the middle's own
            // left-aligned start.
            chip.className = 'pc-palette-chip' + (ci === 1 ? '' : ' pc-palette-chip-top');
            chip.style.background = hex;
            var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
            var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            chip.style.color = luminance > 0.6 ? '#1a1a1a' : '#fff';
            // Left column is color-only, no label — too cramped to read at
            // that width and looked messy.
            if (ci !== 0) {
              var title = document.createElement('span'); title.className = 'pc-swatch-title'; title.textContent = nearestColorName(hex);
              var hexEl = document.createElement('span'); hexEl.className = 'pc-swatch-hex'; hexEl.textContent = hex;
              chip.appendChild(title);
              chip.appendChild(hexEl);
            }
            track.appendChild(chip);
          });
          col.appendChild(track);
          el.appendChild(col);
        }
        builtItems.push({ el: el, isTall: isTall, promotable: promotable, ratio: piece.ratio, isLogo: isLogo, isIcon: isIcon });
        return;
      }
      if (piece.isPattern) {
        // The brand's own seamless pattern, tiled and spinning forever.
        // Sized off rowH so the tile scale stays consistent regardless
        // of how big/small the card renders.
        el.className = 'pc-item pc-item-pattern';
        var patternColors = piece.colorImg ? sampleTwoColors(piece.colorImg) : ['#7c3aed', '#ec4899'];
        el.style.background = patternColors[0];
        var tileSize = Math.round(rowH * 1.4);
        var scroll = document.createElement('div'); scroll.className = 'pc-pattern-scroll';
        scroll.style.backgroundImage = 'url(' + piece.patternSrc + ')';
        scroll.style.backgroundSize = tileSize + 'px';
        // Animate by exactly one tile width so the loop has no visible
        // seam — a fixed % or rotation would either jump-cut or blur the
        // pattern into unrecognizable noise mid-spin.
        scroll.style.setProperty('--pattern-tile-w', tileSize + 'px');
        el.appendChild(scroll);
        builtItems.push({ el: el, isTall: isTall, promotable: promotable, ratio: piece.ratio, isLogo: isLogo, isIcon: isIcon });
        return;
      }
      if (piece.isTaglineImg) {
        // The project's own hand-designed tagline graphic: 3 copies
        // visible at once, spaced apart, looping sideways forever. Two
        // full groups of 3 sit back to back and the whole track shifts
        // by exactly one group's width (-50%) -- same duplicated-track
        // technique as the pattern/palette tiles, just with a group of 3
        // as the repeat unit instead of a single image.
        el.className = 'pc-item pc-item-tagline-img';
        if (piece.taglineBg) el.style.background = piece.taglineBg;
        var taglineTrack = document.createElement('div'); taglineTrack.className = 'pc-tagline-scroll';
        for (var tgi = 0; tgi < 6; tgi++) {
          var taglineEl = document.createElement('img');
          taglineEl.className = 'pc-tagline-scroll-img';
          taglineEl.src = piece.taglineSrc;
          taglineEl.alt = '';
          taglineEl.style.marginRight = piece.taglineGapPx + 'px';
          taglineTrack.appendChild(taglineEl);
        }
        el.appendChild(taglineTrack);
        builtItems.push({ el: el, isTall: isTall, promotable: promotable, ratio: piece.ratio, isLogo: isLogo, isIcon: isIcon });
        return;
      }
      if (isType && piece.img) {
        // Kinetic type specimen instead of the static "Aa123" image — same
        // two brand colors (sampled from the source image), animated, set
        // in the brand's own real typeface where that's on Google Fonts.
        el.className = 'pc-item pc-item-type';
        var colors = sampleTwoColors(piece.img);
        el.style.setProperty('--pc-c1', colors[0]);
        el.style.setProperty('--pc-c2', colors[1]);
        var slugMatch = piece.src.match(/portfolio\/([^/]+)\/type\.webp$/);
        var fonts = slugMatch && TYPE_FONT_BY_SLUG[slugMatch[1]];
        var l1 = document.createElement('span'); l1.className = 'pc-type-line'; l1.textContent = 'Aa';
        var l2 = document.createElement('span'); l2.className = 'pc-type-line'; l2.textContent = '123';
        if (fonts) {
          l1.style.fontFamily = fonts.primary;
          if (fonts.primaryWeight) l1.style.fontWeight = fonts.primaryWeight;
          l2.style.fontFamily = fonts.secondary || fonts.primary;
          if (fonts.secondaryWeight || fonts.primaryWeight) l2.style.fontWeight = fonts.secondaryWeight || fonts.primaryWeight;
        }
        el.appendChild(l1);
        el.appendChild(l2);
        builtItems.push({ el: el, isTall: isTall, promotable: promotable, ratio: piece.ratio, isLogo: isLogo, isIcon: isIcon });
        return;
      }
      el.className += 'pc-item' + (isTall ? ' pc-span2' : '') + (isLogo ? ' pc-item-logo' : '');
      var img = document.createElement('img');
      img.src = piece.src;
      img.alt = opts.alt || '';
      img.loading = 'lazy';
      el.appendChild(img);
      builtItems.push({ el: el, isTall: isTall, promotable: promotable, ratio: piece.ratio, isLogo: isLogo, isIcon: isIcon });
    });
    // Group items into column wrappers instead of relying on CSS Grid's
    // dense auto-placement: a grid column's track width is the MAX of
    // every item packed into it, so a narrow item sharing a column with a
    // wide one rendered inside a too-wide track, leaving a visible empty
    // gap next to it. A .pc-span2 item fills a column alone; two regular
    // items stack into one column together — each column is flex-sized to
    // only its own contents, so no cross-item width mismatch is possible.
    // A short item that ends up alone in a column (no partner to stack
    // with) instead of being promoted would render at half the height of
    // every other column — an oddly short, visually "incomplete" card. If
    // it's a real photo/logo/type tile (not one of the always-square
    // generated tiles), stretch it to the full 2-row height instead, so
    // every column is always a complete, full-height card.
    function promoteIfLone(item) {
      if (!item.promotable) return;
      var newHeight = rowH * 2 + gap;
      var newWidth = item.isIcon ? newHeight
        : (item.isLogo ? Math.round(newHeight * Math.max(1, Math.min(2.2, item.ratio))) : Math.round(newHeight * item.ratio));
      item.el.style.height = newHeight + 'px';
      item.el.style.width = newWidth + 'px';
    }
    var pendingShort = null;
    var columns = [];
    builtItems.forEach(function (item) {
      if (item.isTall) {
        if (pendingShort) { promoteIfLone(pendingShort); columns.push([pendingShort]); pendingShort = null; }
        columns.push([item]);
      } else if (pendingShort) {
        columns.push([pendingShort, item]);
        pendingShort = null;
      } else {
        pendingShort = item;
      }
    });
    if (pendingShort) { promoteIfLone(pendingShort); columns.push([pendingShort]); }
    columns.forEach(function (col) {
      var colEl = document.createElement('div');
      colEl.className = 'pc-col';
      col.forEach(function (item) { colEl.appendChild(item.el); });
      container.appendChild(colEl);
    });
  }

  return { render: render };
})();

/* Case-study modal: click a work item or client logo for an editorial
   image collage (built by ProjectCollage above) + name, category, summary
   and tags */
(function () {
  var lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  var collageEl = document.getElementById('lightboxCollage');
  var title = document.getElementById('lightboxTitle');
  var category = document.getElementById('lightboxCategory');
  var desc = document.getElementById('lightboxDesc');
  var tagsBlock = document.getElementById('lightboxTagsBlock');
  /* Category-name → Lab mapping, mirrors servicios.html's sections */
  var CATEGORY_TO_LAB = {
    'Experiencia digital': 'CREA - Brand & Experience Lab',
    'Crecimiento y marketing digital': 'CRECE - Insight Lab'
  };
  var workEl = document.getElementById('lightboxWork');
  var workBlock = document.getElementById('lightboxWorkBlock');
  var closeBtn = document.getElementById('lightboxClose');
  var lightboxFocusTrap = createFocusTrap(lightbox, function () { return lightbox.classList.contains('is-open'); });

  document.querySelectorAll('[data-lightbox]').forEach(function (el) {
    el.addEventListener('click', function () {
      var mainImg = el.dataset.img;
      var images;
      if (el.dataset.images) {
        // A project can list its own set of images as JSON, e.g.
        // data-images='["a.png","b.png",{"src":"c.png","priority":2}]'
        try { images = JSON.parse(el.dataset.images); } catch (e) { images = [mainImg]; }
      } else {
        // No per-project set: show only this project's own image instead of
        // padding the collage with unrelated projects' photos.
        images = [mainImg];
      }
      ProjectCollage.render(collageEl, images, { alt: el.dataset.title || '', phrase: el.dataset.tagline || el.dataset.desc || '' }).then(updatePcNav);

      title.textContent = el.dataset.title || '';
      category.textContent = (el.dataset.category || '').toUpperCase();
      desc.textContent = el.dataset.desc || '';
      if (el.dataset.work) {
        workEl.textContent = el.dataset.work;
        workBlock.style.display = '';
      } else {
        workBlock.style.display = 'none';
      }
      tagsBlock.innerHTML = '';
      var rawParts = (el.dataset.capabilities ? el.dataset.capabilities.split('·') : (el.dataset.desc || '').split(/,| y /i))
        .map(function (t) { return t.trim(); }).filter(Boolean);
      var labOrder = ['CREA - Brand & Experience Lab', 'CRECE - Insight Lab'];
      var labMarkers = rawParts.filter(function (t) { return labOrder.indexOf(t) !== -1; });
      var categoryTags = rawParts.filter(function (t) { return labOrder.indexOf(t) === -1; });
      var groups = labMarkers.length
        ? labMarkers.slice().sort(function (a, b) { return labOrder.indexOf(a) - labOrder.indexOf(b); }).map(function (lab) {
            return { lab: lab, tags: categoryTags.filter(function (t) { return CATEGORY_TO_LAB[t] === lab; }) };
          })
        : [{ lab: null, tags: categoryTags }];
      groups.forEach(function (group) {
        if (group.lab === null && !group.tags.length) return;
        var groupEl = document.createElement('div');
        groupEl.className = 'lightbox-lab-group';
        var label = document.createElement('p');
        label.className = 'lightbox-label';
        label.textContent = group.lab || 'Capacidades';
        groupEl.appendChild(label);
        var tagsEl = document.createElement('div');
        tagsEl.className = 'lightbox-tags';
        group.tags.forEach(function (tag) {
          var pill = document.createElement('span');
          pill.className = 'lightbox-tag';
          pill.textContent = tag;
          tagsEl.appendChild(pill);
        });
        groupEl.appendChild(tagsEl);
        tagsBlock.appendChild(groupEl);
      });
      tagsBlock.style.display = tagsBlock.children.length ? '' : 'none';
      lightbox.classList.add('is-open');
      lightboxFocusTrap.onOpen();
    });
  });
  function close() { lightbox.classList.remove('is-open'); lightboxFocusTrap.onClose(); }
  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  /* No visible scrollbar (see .project-collage in styles.css) — instead,
     getting the mouse near the collage's left/right edge auto-scrolls it in
     that direction for as long as it stays there, plus two round arrow
     buttons for an explicit click-driven option. Native touch/trackpad
     scrolling and keyboard arrows still work untouched underneath. */
  var navPrev = document.getElementById('pcNavPrev');
  var navNext = document.getElementById('pcNavNext');

  function updatePcNav() {
    var max = collageEl.scrollWidth - collageEl.clientWidth;
    navPrev.classList.toggle('is-hidden', max <= 1 || collageEl.scrollLeft <= 1);
    navNext.classList.toggle('is-hidden', max <= 1 || collageEl.scrollLeft >= max - 1);
  }
  collageEl.addEventListener('scroll', updatePcNav, { passive: true });
  window.addEventListener('resize', updatePcNav);

  navPrev.addEventListener('click', function () {
    collageEl.scrollBy({ left: -collageEl.clientWidth * 0.8, behavior: 'smooth' });
  });
  navNext.addEventListener('click', function () {
    collageEl.scrollBy({ left: collageEl.clientWidth * 0.8, behavior: 'smooth' });
  });

  var EDGE_ZONE = 90; // px from the left/right edge that counts as "near it"
  var MAX_SPEED = 16; // px/frame right at the very edge
  var edgeDir = 0; // -1 left, 0 none, 1 right
  var edgeSpeed = 0;
  var rafId = null;

  function edgeScrollTick() {
    if (edgeDir !== 0) {
      collageEl.scrollLeft += edgeDir * edgeSpeed;
      rafId = requestAnimationFrame(edgeScrollTick);
    } else {
      rafId = null;
    }
  }
  /* Bound to the wrapper (which also contains the two pc-nav buttons),
     not collageEl itself — the buttons sit visually on top of collageEl's
     edges, and binding to collageEl meant hovering a button fired collageEl's
     mouseleave (pointer now "over" the button, a sibling), stopping the
     auto-scroll right where the client most wanted it to keep going. */
  var collageWrap = collageEl.parentElement;
  collageWrap.addEventListener('mousemove', function (e) {
    var rect = collageEl.getBoundingClientRect();
    var distFromLeft = e.clientX - rect.left;
    var distFromRight = rect.right - e.clientX;
    var prevDir = edgeDir;
    if (distFromLeft < EDGE_ZONE) {
      edgeDir = -1;
      edgeSpeed = MAX_SPEED * (1 - Math.max(distFromLeft, 0) / EDGE_ZONE);
    } else if (distFromRight < EDGE_ZONE) {
      edgeDir = 1;
      edgeSpeed = MAX_SPEED * (1 - Math.max(distFromRight, 0) / EDGE_ZONE);
    } else {
      edgeDir = 0;
    }
    if (edgeDir !== 0 && prevDir === 0 && rafId === null) rafId = requestAnimationFrame(edgeScrollTick);
  });
  collageWrap.addEventListener('mouseleave', function () { edgeDir = 0; });
})();

/* Hub "W": types itself in on first view, hover reveals the full WoW logo, click opens the project form */
(function () {
  var hubCenter = document.getElementById('hubCenter');
  if (!hubCenter) return;
  var w = document.getElementById('hubW');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { w.classList.add('is-typed'); obs.disconnect(); }
      });
    }, { threshold: 0.4 });
    obs.observe(hubCenter);
  } else {
    w.classList.add('is-typed');
  }
  hubCenter.addEventListener('click', function () {
    window.openProjectForm();
  });
})();

/* Mobile nav burger is defined in js/common.js, loaded before this file. */

/* Project form modal: opens from any [data-open-form] trigger */
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

  window.openProjectForm = function (prefill) {
    form.style.display = '';
    thanks.classList.remove('is-visible');
    formError.classList.remove('is-visible');
    form.reset();
    clearFieldErrors();
    if (prefill) document.getElementById('pfDetails').value = prefill;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    projectFormFocusTrap.onOpen();
    openedAt = Date.now();
  };
  function close() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    projectFormFocusTrap.onClose();
  }
  document.querySelectorAll('[data-open-form]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      window.openProjectForm();
    });
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

  // Real client-side validation beyond native :invalid (which renders
  // inconsistently across browsers) — trims whitespace and shows inline
  // messages next to each offending field.
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

    // Honeypot: a hidden field a real visitor never fills. If it has a
    // value, silently pretend success without processing anything, so a
    // bot never learns the trap tripped.
    var isBot = !!(form.website && form.website.value.trim());
    // Time-trap: submits faster than a human could reasonably fill the
    // form are treated the same way — a first-line filter only, not a
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
      details: form.details.value,
      lang: document.documentElement.lang,
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

/* Utility: how far scrolled through an element, 0 (just entering bottom) to 1 (just leaving top) */
function scrollProgress(el) {
  var rect = el.getBoundingClientRect();
  var vh = window.innerHeight;
  var total = rect.height + vh;
  var passed = vh - rect.top;
  return Math.max(0, Math.min(1, passed / total));
}

/* Utility: progress through a sticky-pinned section's pin duration specifically, 0 to 1 */
function pinProgress(outerEl) {
  var rect = outerEl.getBoundingClientRect();
  var vh = window.innerHeight;
  var pinDistance = rect.height - vh;
  if (pinDistance <= 0) return 1;
  return Math.max(0, Math.min(1, -rect.top / pinDistance));
}

/* Switches turn on progressively as you scroll through "cómo pensamos"; turning one off hides its text */
var togglePin = document.querySelector('.toggle-pin');
var toggleSection = document.querySelector('.toggle-section');
var toggleItems = toggleSection ? [].slice.call(toggleSection.querySelectorAll('.toggle-item')) : [];
toggleItems.forEach(function (item) {
  setSwitch(item.querySelector('.switch'), false);
});

/* Reveal method steps + fly the rocket along the timeline, synced to scroll */
var methodPin = document.querySelector('.method-pin');
var methodSection = document.querySelector('.method');
var rocketEl = document.getElementById('methodRocket');
var loopProgressEl = document.getElementById('methodLoopProgress');
var loopProgressCircumference = 201.06; // 2 * PI * r(32), matches the SVG circle's radius
var dotEls = methodSection ? [].slice.call(methodSection.querySelectorAll('.loop-dot')) : [];
var stepEls = methodSection ? [].slice.call(methodSection.querySelectorAll('.method-step')) : [];

var mobileTimelineQuery = window.matchMedia('(max-width: 1299px)');

function updateScrollScrubs() {
  /* re-read on every call (not cached at load) so rotating a phone or resizing across the breakpoint doesn't leave the scroll math out of sync with the CSS */
  var isMobileTimeline = mobileTimelineQuery.matches;
  if (toggleSection && toggleItems.length) {
    /* .toggle-section isn't sticky-pinned on mobile, so it can't eat extra scroll like the desktop pin does. Instead, tie progress to the section's own entry: 0 when it's just touching the bottom of the viewport, 1 once it's fully on screen (top and bottom both visible) — so the OFF→ON animation rides the same scroll that brings the section into view and is done by the time it has fully arrived, instead of requiring extra swipes once there. */
    var tProg;
    if (isMobileTimeline) {
      var toggleRect = toggleSection.getBoundingClientRect();
      var vh = window.innerHeight;
      tProg = Math.max(0, Math.min(1, (vh - toggleRect.top) / toggleRect.height));
    } else {
      tProg = togglePin ? pinProgress(togglePin) : scrollProgress(toggleSection);
    }
    var revealCount = Math.floor(tProg * (toggleItems.length + 1));
    /* the first switch is always on by default on mobile, just like the first process card */
    if (isMobileTimeline) revealCount = Math.max(1, revealCount);
    toggleItems.forEach(function (item, i) {
      var shouldBeOn = i < revealCount;
      var btn = item.querySelector('.switch');
      /* auto-drive the switch both ways with scroll, until the user has manually touched it */
      if (!btn.dataset.userSet && shouldBeOn !== btn.classList.contains('is-on')) {
        setSwitch(btn, shouldBeOn);
      }
    });
  }

  if (methodSection && stepEls.length) {
    /* .method isn't sticky-pinned on mobile either, so — same fix as the philosophy switches — tie progress to the section's own entry: 0 when it's just touching the bottom of the viewport, 1 once it's fully on screen. The card-by-card reveal then rides the scroll that brings the section into view, instead of requiring extra swipes once there. */
    var mProg;
    if (isMobileTimeline) {
      var methodRect = methodSection.getBoundingClientRect();
      var methodVh = window.innerHeight;
      mProg = Math.max(0, Math.min(1, (methodVh - methodRect.top) / methodRect.height));
    } else {
      mProg = methodPin ? pinProgress(methodPin) : scrollProgress(methodSection);
    }
    methodSection.classList.toggle('in-view', mProg > 0.05);
    if (!isMobileTimeline && rocketEl) {
      /* Fly the rocket clockwise around the circle, starting at the top (12 o'clock,
         above card 1) — standard math angle convention (0deg = 3 o'clock, increasing
         clockwise in screen/SVG space since y grows downward) means "start at top" is
         -90deg, and a full lap is +360deg of progress. Only position moves — rotation
         is fixed in CSS (.method-rocket), the glyph keeps the same sideways heading
         all the way around instead of turning to face its direction of travel. */
      var angleDeg = -90 + mProg * 360;
      var angleRad = angleDeg * Math.PI / 180;
      var rocketX = 50 + 32 * Math.cos(angleRad);
      var rocketY = 50 + 32 * Math.sin(angleRad);
      rocketEl.style.left = rocketX + '%';
      rocketEl.style.top = rocketY + '%';
    }
    if (!isMobileTimeline && loopProgressEl) {
      loopProgressEl.style.strokeDashoffset = (loopProgressCircumference * (1 - mProg)).toFixed(2);
    }
    /* Desktop: card i sits at dot i, and the rocket's angle formula above
       (angleDeg = -90 + mProg*360) puts it exactly on dot i when
       mProg === i/N — so the card and its dot use that same fraction as
       their reveal threshold, instead of an offset guess, to make the card
       pop in right as the rocket arrives at its dot. */
    var stepThreshold = function (i) {
      return i / stepEls.length;
    };
    stepEls.forEach(function (step, i) {
      step.classList.toggle('in-view', mProg > stepThreshold(i));
    });
    dotEls.forEach(function (dot, i) {
      dot.classList.toggle('lit', mProg > i / dotEls.length);
    });
  }
}

var scrubTicking = false;
window.addEventListener('scroll', function () {
  if (scrubTicking) return;
  scrubTicking = true;
  requestAnimationFrame(function () {
    updateScrollScrubs();
    scrubTicking = false;
  });
}, { passive: true });
window.addEventListener('resize', updateScrollScrubs);
updateScrollScrubs();

/* Falling icons playground: lives in its own zone between contact and
   footer, always draggable. Matter.js (79KB, third-party CDN) used to
   load as a blocking <script> at the very top of this block, which
   meant every bit of site JS below it — lightbox, nav, language toggle,
   mega menu, all of it, none of which needs Matter at all — sat waiting
   on that one external fetch to finish before any of it could run.
   Loaded lazily instead: only fetched once this section actually
   scrolls near the viewport (initFallingIcons runs once it's ready),
   so the rest of the page's interactivity no longer depends on it. */
function initFallingIcons() {
  var canvas = document.getElementById('fallingCanvas');
  var zone = document.querySelector('.icon-playground');
  if (!canvas || !zone || typeof Matter === 'undefined') return;

  var Engine = Matter.Engine, Render = Matter.Render, World = Matter.World,
      Bodies = Matter.Bodies, Mouse = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint;

  var iconSources = [
    { src: 'design-system/icons/icon-star.svg', w: 1080, h: 1350 },
    { src: 'design-system/icons/icon-swoosh.svg', w: 1080, h: 1350 },
    { src: 'design-system/icons/icon-arch.svg', w: 1080, h: 1350 },
    { src: 'design-system/icons/icon-bloom.svg', w: 1080, h: 1350 },
    { src: 'design-system/logo/wow-mark-purple.svg', w: 227.14, h: 257.27 }
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

/* FAQ accordion is defined in js/common.js, loaded before this file. */
