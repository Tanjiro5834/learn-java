/* ============================================================
   drawer.js — mobile slide-in drawer with focus trap
   Exposes window.App.ui.drawer
   ============================================================ */
(function () {
  "use strict";

  window.App = window.App || {};
  window.App.ui = window.App.ui || {};

  var drawer, backdrop, hamburger, closeBtn;
  var isOpen = false;
  var lastFocused = null;

  var FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function open() {
    if (isOpen) return;
    isOpen = true;
    lastFocused = document.activeElement;
    backdrop.hidden = false;
    // Force reflow so transition runs
    void backdrop.offsetWidth;
    backdrop.classList.add("is-visible");
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    hamburger.classList.add("is-open");
    hamburger.setAttribute("aria-expanded", "true");
    document.body.classList.add("drawer-open");
    var first = drawer.querySelector(FOCUSABLE);
    if (first) first.focus();
    document.addEventListener("keydown", onKeydown, true);
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    backdrop.classList.remove("is-visible");
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    hamburger.classList.remove("is-open");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("drawer-open");
    document.removeEventListener("keydown", onKeydown, true);
    var onEnd = function () {
      if (!isOpen) backdrop.hidden = true;
      backdrop.removeEventListener("transitionend", onEnd);
    };
    backdrop.addEventListener("transitionend", onEnd);
    setTimeout(function () {
      if (!isOpen) backdrop.hidden = true;
    }, 350);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function toggle() {
    isOpen ? close() : open();
  }

  function onKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === "Tab") {
      var focusables = Array.prototype.slice
        .call(drawer.querySelectorAll(FOCUSABLE))
        .filter(function (el) {
          return el.offsetParent !== null;
        });
      if (focusables.length === 0) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function init() {
    drawer = document.getElementById("mobileDrawer");
    backdrop = document.getElementById("drawerBackdrop");
    hamburger = document.getElementById("hamburgerBtn");
    closeBtn = document.getElementById("drawerCloseBtn");
    if (!drawer || !backdrop || !hamburger) return;

    hamburger.addEventListener("click", toggle);
    backdrop.addEventListener("click", close);
    if (closeBtn) closeBtn.addEventListener("click", close);

    // Close on nav selection
    drawer.addEventListener("click", function (e) {
      var link = e.target.closest('a[href^="#/"]');
      if (link) close();
    });

    // Close if viewport crosses to desktop
    try {
      var mq = window.matchMedia("(min-width: 1024px)");
      var listener = function (e) {
        if (e.matches) close();
      };
      if (mq.addEventListener) mq.addEventListener("change", listener);
      else if (mq.addListener) mq.addListener(listener);
    } catch (e) {
      /* ignore */
    }
  }

  window.App.ui.drawer = {
    init: init,
    open: open,
    close: close,
    toggle: toggle,
  };
})();
