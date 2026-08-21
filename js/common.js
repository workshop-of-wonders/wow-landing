/* Minimal modal focus trap: keeps Tab/Shift+Tab cycling within `modalEl`
   while `isOpen()` returns true, and restores focus to whatever triggered
   the modal when it closes. Shared by index.html, portafolio.html and
   servicios.html — used by their case-study lightbox and/or project-form
   modal. */
function createFocusTrap(modalEl, isOpen) {
  var lastFocused = null;
  function focusables() {
    return Array.prototype.slice.call(
      modalEl.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !isOpen()) return;
    var items = focusables();
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
  return {
    onOpen: function () {
      lastFocused = document.activeElement;
      var items = focusables();
      if (items.length) items[0].focus();
    },
    onClose: function () {
      if (lastFocused && lastFocused.focus) lastFocused.focus();
      lastFocused = null;
    }
  };
}
