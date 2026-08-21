document.getElementById('year').textContent = new Date().getFullYear();

/* createFocusTrap is defined in js/common.js, loaded before this file. */

/* Mobile nav burger: toggles the floating glass menu (same behavior as index.html) */
(function () {
  var burger = document.getElementById('navBurger');
  var menu = document.getElementById('navMobileMenu');
  var closeBtn = document.getElementById('navMobileClose');
  if (!burger || !menu) return;
  function setOpen(isOpen) {
    burger.classList.toggle('is-open', isOpen);
    burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    menu.classList.toggle('is-open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setOpen(!menu.classList.contains('is-open')); });
  if (closeBtn) closeBtn.addEventListener('click', function () { setOpen(false); });
  menu.addEventListener('click', function (e) { if (e.target === menu) setOpen(false); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
})();

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

/* ------------------------------------------------------------------
   ProjectCollage + case-study lightbox — copied verbatim from
   index.html (same IIFEs, same DOM ids) so project cards here open the
   exact same editorial collage lightbox as the home page. Keep the two
   copies in sync if either changes; see CHANGELOG.md.
   ------------------------------------------------------------------ */
var ProjectCollage = (function () {
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

  function sampleTwoColors(img) {
    try {
      var c = document.createElement('canvas');
      c.width = 20; c.height = 20;
      var ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, 20, 20);
      var d1 = ctx.getImageData(2, 2, 1, 1).data;
      var d2 = ctx.getImageData(17, 2, 1, 1).data;
      return ['rgb(' + d1[0] + ',' + d1[1] + ',' + d1[2] + ')', 'rgb(' + d2[0] + ',' + d2[1] + ',' + d2[2] + ')'];
    } catch (e) {
      return ['#7c3aed', '#ec4899'];
    }
  }

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
        var key = (data[i] >> 3) + ',' + (data[i + 1] >> 3) + ',' + (data[i + 2] >> 3);
        counts[key] = (counts[key] || 0) + 1;
        if (counts[key] > bestCount) { bestCount = counts[key]; best = [data[i], data[i + 1], data[i + 2]]; }
      }
      return best ? 'rgb(' + best[0] + ',' + best[1] + ',' + best[2] + ')' : null;
    } catch (e) {
      return null;
    }
  }

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

  var renderToken = 0;

  async function render(container, images, opts) {
    opts = opts || {};
    var myToken = ++renderToken;
    var rowHVar = getComputedStyle(container).getPropertyValue('--pc-row-h') || '190px';
    var rowH = parseFloat(rowHVar) || 190;
    var items = normalize(images);
    container.innerHTML = '';
    container.classList.add('is-loading');
    if (!items.length) { container.classList.remove('is-loading'); return; }

    var slugGuess = null;
    for (var gi = 0; gi < items.length; gi++) {
      var gm = items[gi].src.match(/portfolio\/([^/]+)\/type\.webp$/);
      if (gm) { slugGuess = gm[1]; break; }
    }
    var loadedPromise = Promise.all(items.map(function (it) { return loadImage(it.src); }));
    var taglinePromise = slugGuess ? loadImage('design-system/portfolio/' + slugGuess + '/tagline.webp') : Promise.resolve(null);
    var patternPromise = slugGuess ? loadImage('design-system/portfolio/' + slugGuess + '/pattern.webp') : Promise.resolve(null);
    var loaded = await loadedPromise;
    if (myToken !== renderToken) return;
    var pieces = items.map(function (it, i) {
      var img = loaded[i];
      var ratio = img ? (img.naturalWidth || 1) / (img.naturalHeight || 1) : 4 / 3;
      return { src: it.src, priority: it.priority, ratio: ratio, img: img };
    });

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
      var paletteRatio = 1;
      pieces.push({ src: 'palette:' + slugForColors, priority: 1, ratio: paletteRatio, img: null, isPalette: true, colors: COLORS_BY_SLUG[slugForColors] });
    }
    if (slugForPhrase) {
      var taglineImg = await taglinePromise;
      if (myToken !== renderToken) return;
      if (taglineImg) {
        var taglineRatio = (taglineImg.naturalWidth || 1) / (taglineImg.naturalHeight || 1);
        var taglineBg = sampleCornerColor(taglineImg);
        pieces.push({ src: 'tagline:' + slugForPhrase, priority: 1, ratio: taglineRatio, img: null, isTaglineImg: true, taglineSrc: taglineImg.src, taglineBg: taglineBg });
      }
    }
    if (slugForPhrase) {
      var patternImg = await patternPromise;
      if (myToken !== renderToken) return;
      if (patternImg) {
        pieces.push({ src: 'pattern:' + slugForPhrase, priority: 1, ratio: 1, img: null, isPattern: true, patternSrc: patternImg.src, colorImg: typePieceForPhrase.img });
      }
    }

    var gap = parseFloat(getComputedStyle(container).getPropertyValue('--pc-gap')) || 3;
    var isSingle = pieces.length === 1;
    var isLogoAsset = /\/(?:portfolio\/[^/]+\/(?:logo|icon)|clients\/[^/]+)\.webp$/;
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
      var width = isIcon ? height : (isLogo ? Math.round(height * Math.max(1, Math.min(2.2, piece.ratio))) : Math.round(height * piece.ratio));
      if (piece.isTaglineImg) {
        piece.taglineGapPx = Math.round(gap * 2.5);
        width = height;
      }
      var el = document.createElement('div');
      el.style.width = width + 'px';
      el.style.height = height + 'px';
      var promotable = !piece.isPalette && !piece.isPattern && !piece.isTaglineImg;
      if (piece.isPalette) {
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
          var shift = (ci * Math.max(1, Math.floor(piece.colors.length / COLS))) % piece.colors.length;
          var colColors = piece.colors.slice(shift).concat(piece.colors.slice(0, shift));
          colColors.concat(colColors).forEach(function (hex) {
            var chip = document.createElement('div');
            chip.className = 'pc-palette-chip' + (ci === 1 ? '' : ' pc-palette-chip-top');
            chip.style.background = hex;
            var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
            var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            chip.style.color = luminance > 0.6 ? '#1a1a1a' : '#fff';
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
        el.className = 'pc-item pc-item-pattern';
        var patternColors = piece.colorImg ? sampleTwoColors(piece.colorImg) : ['#7c3aed', '#ec4899'];
        el.style.background = patternColors[0];
        var tileSize = Math.round(rowH * 1.4);
        var scroll = document.createElement('div'); scroll.className = 'pc-pattern-scroll';
        scroll.style.backgroundImage = 'url(' + piece.patternSrc + ')';
        scroll.style.backgroundSize = tileSize + 'px';
        scroll.style.setProperty('--pattern-tile-w', tileSize + 'px');
        el.appendChild(scroll);
        builtItems.push({ el: el, isTall: isTall, promotable: promotable, ratio: piece.ratio, isLogo: isLogo, isIcon: isIcon });
        return;
      }
      if (piece.isTaglineImg) {
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

(function () {
  var lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  var collageEl = document.getElementById('lightboxCollage');
  var title = document.getElementById('lightboxTitle');
  var category = document.getElementById('lightboxCategory');
  var desc = document.getElementById('lightboxDesc');
  var tagsBlock = document.getElementById('lightboxTagsBlock');
  var CATEGORY_TO_LAB = {
    'Estrategia de marca': 'DEFINE - Core Lab',
    'Identidad y diseño de marca': 'CREA - Brand & Experience Lab',
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
        try { images = JSON.parse(el.dataset.images); } catch (e) { images = [mainImg]; }
      } else {
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
      var labOrder = ['DEFINE - Core Lab', 'CREA - Brand & Experience Lab', 'CRECE - Insight Lab'];
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

  var EDGE_ZONE = 90;
  var MAX_SPEED = 16;
  var edgeDir = 0;
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
