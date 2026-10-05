/* ============================================================
   sidebar.js — desktop sidebar rendering + collapse toggle
   Exposes window.App.ui.sidebar
   ============================================================ */
(function () {
  "use strict";

  window.App = window.App || {};
  window.App.ui = window.App.ui || {};

  var COLLAPSE_KEY = "sidebarCollapsed";
  var SVG = {
    chevron:
      '<svg class="nav-phase__chevron" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
    lock: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    circle:
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/></svg>',
    check:
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>',
    dot: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8" stroke-dasharray="3 3"/></svg>',
  };

  var openAccordions = {};

  function isCollapsed() {
    return window.App.storage.get(COLLAPSE_KEY) === "1";
  }

  function setCollapsed(collapsed) {
    window.App.storage.set(COLLAPSE_KEY, collapsed ? "1" : "0");
  }

  function topicStatusIcon(phaseId, topic) {
    if (!window.App.progress.isTopicUnlocked(phaseId, topic.id)) {
      return (
        '<span class="nav-topic__status" style="color:var(--color-text-faint)">' +
        SVG.lock +
        "</span>"
      );
    }
    if (window.App.progress.isTopicPassed(phaseId, topic.id)) {
      return (
        '<span class="nav-topic__status" style="color:var(--color-success)">' +
        SVG.check +
        "</span>"
      );
    }
    var qs = window.App.progress.getQuizState(phaseId, topic.id);
    if (qs && qs.attempts > 0) {
      return (
        '<span class="nav-topic__status" style="color:var(--color-warning)">' +
        SVG.dot +
        "</span>"
      );
    }
    return (
      '<span class="nav-topic__status" style="color:var(--color-text-faint)">' +
      SVG.circle +
      "</span>"
    );
  }

  function renderTopic(phaseId, topic) {
    var unlocked = window.App.progress.isTopicUnlocked(phaseId, topic.id);
    var passed = window.App.progress.isTopicPassed(phaseId, topic.id);
    var qs = window.App.progress.getQuizState(phaseId, topic.id);
    var title = topic.title;
    if (passed && qs) title += " (" + qs.best + "%)";
    var href = unlocked
      ? "#/lesson/" + phaseId + "/" + topic.id
      : "#/dashboard";
    var cls =
      "nav-topic" +
      (unlocked ? "" : " is-locked") +
      (passed ? " is-passed" : "");
    var aria = unlocked ? "" : ' aria-disabled="true" tabindex="-1"';
    var dataAttrs =
      ' data-nav-topic="' +
      phaseId +
      "/" +
      topic.id +
      '"' +
      (unlocked ? "" : ' data-locked="1"');
    return (
      "<li>" +
      '<a class="' +
      cls +
      '" href="' +
      href +
      '"' +
      aria +
      dataAttrs +
      ">" +
      topicStatusIcon(phaseId, topic) +
      '<span class="nav-topic__label">' +
      escapeHtml(title) +
      "</span>" +
      "</a>" +
      "</li>"
    );
  }

  function renderPhase(phase) {
    var unlocked = window.App.progress.isPhaseUnlocked(phase.id);
    var expanded =
      openAccordions[phase.id] === undefined
        ? phase.id === "phase-1"
        : openAccordions[phase.id];
    var topicsHtml = phase.topics
      .map(function (t) {
        return renderTopic(phase.id, t);
      })
      .join("");
    var num = phase.number;
    return (
      '<div class="nav-phase" data-phase="' +
      phase.id +
      '">' +
      '<button class="nav-phase__toggle" type="button" aria-expanded="' +
      (expanded ? "true" : "false") +
      '" data-accordion="' +
      phase.id +
      '">' +
      '<span class="nav-phase__num">' +
      num +
      "</span>" +
      '<span class="nav-phase__label">' +
      escapeHtml(phase.title) +
      "</span>" +
      SVG.chevron +
      "</button>" +
      '<ul class="nav-topics"' +
      (expanded ? "" : " hidden") +
      ">" +
      topicsHtml +
      "</ul>" +
      "</div>"
    );
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function render() {
    var nav = document.getElementById("sidebarNav");
    if (!nav) return;
    var phases = window.App.progress.getPhases();
    nav.innerHTML = phases.map(renderPhase).join("");
  }

  function markActive(hash) {
    var nav = document.getElementById("sidebarNav");
    if (!nav) return;
    var links = nav.querySelectorAll(".nav-topic");
    for (var i = 0; i < links.length; i++) {
      links[i].classList.remove("is-active");
    }
    if (!hash) return;
    var m = hash.match(/^#\/lesson\/([^/]+)\/([^/]+)/);
    if (m) {
      var target = nav.querySelector(
        '.nav-topic[data-nav-topic="' + m[1] + "/" + m[2] + '"]',
      );
      if (target) {
        target.classList.add("is-active");
        // Ensure its phase is expanded
        var phaseEl = target.closest(".nav-phase");
        if (phaseEl) {
          var phaseId = phaseEl.getAttribute("data-phase");
          openAccordions[phaseId] = true;
          var btn = phaseEl.querySelector(".nav-phase__toggle");
          var ul = phaseEl.querySelector(".nav-topics");
          if (btn) btn.setAttribute("aria-expanded", "true");
          if (ul) ul.hidden = false;
        }
      }
    }
  }

  function handleAccordionClick(e) {
    var btn = e.target.closest("[data-accordion]");
    if (!btn) return;
    var phaseId = btn.getAttribute("data-accordion");
    var expanded = btn.getAttribute("aria-expanded") === "true";
    var next = !expanded;
    openAccordions[phaseId] = next;
    btn.setAttribute("aria-expanded", next ? "true" : "false");
    var phaseEl = btn.closest(".nav-phase");
    if (phaseEl) {
      var ul = phaseEl.querySelector(".nav-topics");
      if (ul) ul.hidden = !next;
    }
  }

  function handleNavClick(e) {
    var link = e.target.closest("[data-nav-topic]");
    if (!link) return;
    if (link.getAttribute("data-locked") === "1") {
      e.preventDefault();
      window.App.ui.toast("Finish the previous topic to unlock this one.");
    }
  }

  function applyCollapsedState() {
    var sidebar = document.getElementById("sidebar");
    if (!sidebar) return;
    var collapsed = isCollapsed();
    sidebar.classList.toggle("is-collapsed", collapsed);
    var btn = document.getElementById("sidebarCollapseBtn");
    if (btn) btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
  }

  function init() {
    var nav = document.getElementById("sidebarNav");
    if (nav) {
      nav.addEventListener("click", function (e) {
        handleAccordionClick(e);
        handleNavClick(e);
      });
    }
    var btn = document.getElementById("sidebarCollapseBtn");
    if (btn) {
      btn.addEventListener("click", function () {
        var next = !isCollapsed();
        setCollapsed(next);
        applyCollapsedState();
      });
    }
    applyCollapsedState();
  }

  window.App.ui.sidebar = {
    init: init,
    render: render,
    markActive: markActive,
    applyCollapsedState: applyCollapsedState,
  };
})();
