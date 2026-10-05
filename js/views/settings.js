/* ============================================================
   settings.js — settings view (theme, progress, reset)
   Exposes window.App.views.settings
   ============================================================ */
(function () {
  "use strict";

  window.App = window.App || {};
  window.App.views = window.App.views || {};

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function render() {
    var overall = window.App.progress.getOverallProgress();
    var theme = window.App.theme.current();
    return (
      "<section>" +
      '<h1 class="section-title">Settings</h1>' +
      '<p class="section-subtitle">Preferences and progress management.</p>' +
      '<div class="settings-group card">' +
      '<h2 class="card__title">Appearance</h2>' +
      '<p class="card__subtitle">Choose how JavaPath looks. Defaults to your system preference.</p>' +
      '<div class="settings-row">' +
      '<div class="settings-row__info">' +
      '<div class="settings-row__title">Theme</div>' +
      '<div class="settings-row__desc">Currently: ' +
      (theme === "dark" ? "Dark" : "Light") +
      "</div>" +
      "</div>" +
      '<button class="btn btn--secondary" type="button" id="settingsThemeToggle">Switch to ' +
      (theme === "dark" ? "Light" : "Dark") +
      "</button>" +
      "</div>" +
      "</div>" +
      '<div class="settings-group card">' +
      '<h2 class="card__title">Progress</h2>' +
      '<p class="card__subtitle">Your learning progress is saved in this browser only.</p>' +
      '<div class="settings-row">' +
      '<div class="settings-row__info">' +
      '<div class="settings-row__title">Overall completion</div>' +
      '<div class="settings-row__desc">' +
      overall.passed +
      " of " +
      overall.total +
      " topics passed (" +
      overall.percent +
      "%)</div>" +
      "</div>" +
      "</div>" +
      '<div class="settings-row" style="border-bottom:none">' +
      '<div class="settings-row__info">' +
      '<div class="settings-row__title">Reset progress</div>' +
      '<div class="settings-row__desc">Clears all quiz scores, completion status, and "continue where you left off". This cannot be undone.</div>' +
      "</div>" +
      '<button class="btn btn--danger" type="button" id="settingsResetBtn">Reset Progress</button>' +
      "</div>" +
      "</div>" +
      '<div class="settings-group card">' +
      '<h2 class="card__title">About</h2>' +
      '<p class="card__subtitle">JavaPath is a self-paced learning platform built with plain HTML, CSS, and vanilla JavaScript. No frameworks, no build tools — just open index.html.</p>' +
      '<p class="text-muted" style="font-size:0.85rem;margin:0">Pass mark: ' +
      window.App.progress.PASS_MARK +
      "%. Complete every topic in a phase to unlock its final quiz.</p>" +
      "</div>" +
      "</section>"
    );
  }

  function openResetModal() {
    var existing = document.getElementById("resetModal");
    if (existing) return;

    var wrap = document.createElement("div");
    wrap.className = "modal-backdrop";
    wrap.id = "resetModal";
    wrap.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="resetModalTitle">' +
      '<h3 class="modal__title" id="resetModalTitle">Reset all progress?</h3>' +
      '<p class="modal__body">This will delete every quiz score, completion status, and your "continue where you left off" pointer. This action cannot be undone.</p>' +
      '<div class="modal__actions">' +
      '<button class="btn btn--secondary" type="button" data-modal-cancel>Cancel</button>' +
      '<button class="btn btn--danger" type="button" data-modal-confirm>Yes, reset everything</button>' +
      "</div>" +
      "</div>";
    document.body.appendChild(wrap);

    // Trigger transition
    requestAnimationFrame(function () {
      wrap.classList.add("is-visible");
    });

    var lastFocused = document.activeElement;
    var confirmBtn = wrap.querySelector("[data-modal-confirm]");
    var cancelBtn = wrap.querySelector("[data-modal-cancel]");

    function closeModal() {
      wrap.classList.remove("is-visible");
      document.removeEventListener("keydown", onKey, true);
      setTimeout(function () {
        if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
        if (lastFocused && lastFocused.focus) lastFocused.focus();
      }, 200);
    }

    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
      }
      if (e.key === "Tab") {
        var focusables = [cancelBtn, confirmBtn];
        var idx = focusables.indexOf(document.activeElement);
        if (e.shiftKey && idx === 0) {
          e.preventDefault();
          focusables[focusables.length - 1].focus();
        } else if (!e.shiftKey && idx === focusables.length - 1) {
          e.preventDefault();
          focusables[0].focus();
        }
      }
    }

    confirmBtn.addEventListener("click", function () {
      window.App.progress.resetAll();
      closeModal();
      window.App.ui.toast("Progress reset.");
      window.App.ui.sidebar.render();
      window.App.ui.sidebar.markActive(window.location.hash);
      window.App.router.render();
    });
    cancelBtn.addEventListener("click", closeModal);
    wrap.addEventListener("click", function (e) {
      if (e.target === wrap) closeModal();
    });
    document.addEventListener("keydown", onKey, true);
    confirmBtn.focus();
  }

  function init() {
    var main = document.getElementById("mainContent");
    if (!main) return;
    main.addEventListener("click", function (e) {
      if (e.target.closest("#settingsThemeToggle")) {
        window.App.theme.toggle();
        window.App.router.render();
      }
      if (e.target.closest("#settingsResetBtn")) {
        openResetModal();
      }
    });
  }

  window.App.views.settings = {
    render: render,
    init: init,
  };
})();
