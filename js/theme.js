/* ============================================================
   theme.js — theme toggle + persistence
   Exposes window.App.theme
   ============================================================ */
(function () {
  "use strict";

  window.App = window.App || {};

  var STORAGE_KEY = "theme";
  var root = document.documentElement;

  function getStored() {
    return window.App.storage.get(STORAGE_KEY);
  }

  function getSystem() {
    try {
      return window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } catch (e) {
      return "light";
    }
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
  }

  function current() {
    return root.getAttribute("data-theme") || "light";
  }

  function set(theme) {
    apply(theme);
    window.App.storage.set(STORAGE_KEY, theme);
  }

  function toggle() {
    var next = current() === "dark" ? "light" : "dark";
    set(next);
    return next;
  }

  function init() {
    var stored = getStored();
    if (stored === "light" || stored === "dark") {
      apply(stored);
    } else {
      apply(getSystem());
    }

    var btn = document.getElementById("themeToggleBtn");
    if (btn) {
      btn.addEventListener("click", function () {
        toggle();
      });
    }

    try {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var listener = function (e) {
        if (!getStored()) apply(e.matches ? "dark" : "light");
      };
      if (mq.addEventListener) mq.addEventListener("change", listener);
      else if (mq.addListener) mq.addListener(listener);
    } catch (e) {
      /* ignore */
    }
  }

  window.App.theme = {
    init: init,
    toggle: toggle,
    set: set,
    current: current,
  };
})();
