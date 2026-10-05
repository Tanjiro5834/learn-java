/* ============================================================
   app.js — application bootstrap
   ============================================================ */
(function () {
  "use strict";

  window.App = window.App || {};

  /* -------- toast helper (used across views) -------- */
  function toast(message, duration) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    requestAnimationFrame(function () {
      el.classList.add("is-visible");
    });
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      el.classList.remove("is-visible");
      setTimeout(function () {
        el.hidden = true;
      }, 300);
    }, duration || 2600);
  }

  window.App.ui = window.App.ui || {};
  window.App.ui.toast = toast;

  /* -------- global keyboard shortcuts -------- */
  function initShortcuts() {
    document.addEventListener("keydown", function (e) {
      // "/" focuses the first topic in the sidebar (quick jump helper)
      if (e.key === "/" && !isTypingTarget(e.target)) {
        var firstTopic = document.querySelector(".nav-topic:not(.is-locked)");
        if (firstTopic) {
          e.preventDefault();
          firstTopic.focus();
        }
      }
    });
  }

  function isTypingTarget(el) {
    if (!el) return false;
    var tag = el.tagName;
    return (
      tag === "INPUT" ||
      tag === "TEXTAREA" ||
      tag === "SELECT" ||
      el.isContentEditable
    );
  }

  /* -------- boot -------- */
  function boot() {
    window.App.progress.load();
    window.App.theme.init();
    window.App.ui.sidebar.init();
    window.App.ui.drawer.init();
    window.App.views.lesson.initCopyButtons(document);
    window.App.views.quiz.init();
    window.App.views.settings.init();
    initShortcuts();

    // Initial sidebar render + router boot
    window.App.ui.sidebar.render();
    window.App.router.init();

    // Re-render sidebar when progress changes (after quiz finish, results view already re-routes)
    window.addEventListener("hashchange", function () {
      window.App.ui.sidebar.render();
      window.App.ui.sidebar.markActive(window.location.hash);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
