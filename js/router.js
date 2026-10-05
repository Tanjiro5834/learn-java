/* ============================================================
   router.js — hash-based routing
   Exposes window.App.router
   ============================================================ */
(function () {
  "use strict";

  window.App = window.App || {};

  function parseHash(hash) {
    var clean = (hash || "").replace(/^#\/?/, "");
    var parts = clean.split("/").filter(function (p) {
      return p !== "";
    });
    return {
      path: parts[0] || "dashboard",
      params: parts.slice(1),
    };
  }

  function titleFor(path, params) {
    if (path === "dashboard") return "Dashboard";
    if (path === "settings") return "Settings";
    if (path === "lesson") {
      var topic = window.App.progress.findTopic(params[0], params[1]);
      return topic ? topic.title : "Lesson";
    }
    if (path === "quiz") {
      if (params[1] === "__final__") {
        var ph = window.App.progress.findPhase(params[0]);
        return ph ? ph.title + " — Final Quiz" : "Final Quiz";
      }
      var t = window.App.progress.findTopic(params[0], params[1]);
      return t ? t.title + " — Quiz" : "Quiz";
    }
    if (path === "results") {
      return "Results";
    }
    return "JavaPath";
  }

  function render() {
    var hash = window.location.hash || "#/dashboard";
    var route = parseHash(hash);
    var main = document.getElementById("mainContent");
    if (!main) return;

    var html;
    switch (route.path) {
      case "dashboard":
        html = window.App.views.dashboard.render();
        break;

      case "settings":
        html = window.App.views.settings.render();
        break;

      case "lesson":
        html = window.App.views.lesson.render(route.params[0], route.params[1]);
        break;

      case "quiz":
        html = renderQuizRoute(route.params[0], route.params[1]);
        break;

      case "results":
        html = window.App.views.results.render(
          route.params[0],
          route.params[1],
        );
        break;

      default:
        html =
          '<div class="state-box">' +
          "<h2>Page not found</h2>" +
          "<p>The route <code>#/" +
          String(route.path).replace(/[<>&"]/g, "") +
          "</code> does not exist.</p>" +
          '<a class="btn btn--primary" href="#/dashboard">Back to dashboard</a>' +
          "</div>";
    }

    main.innerHTML = html;
    main.setAttribute("tabindex", "-1");
    // Move focus to main for a11y on route change (but avoid scrolling away on first load)
    try {
      main.focus({ preventScroll: false });
    } catch (e) {
      /* ignore */
    }

    // Update topbar title
    var titleEl = document.getElementById("topbarTitle");
    if (titleEl) titleEl.textContent = titleFor(route.path, route.params);

    // Update progress ring
    updateTopbarProgress();

    // Update sidebar active state
    window.App.ui.sidebar.markActive(hash);

    // Scroll to top on route change
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function renderQuizRoute(phaseId, topicId) {
    // Locked route guard
    if (topicId === "__final__") {
      if (!window.App.progress.isFinalQuizUnlocked(phaseId)) {
        return lockedRedirect(
          "This phase final quiz is locked. Pass every topic in the phase first.",
        );
      }
      var s = window.App.views.quiz.startFinalQuiz(phaseId);
      if (!s) return lockedRedirect("This final quiz is not available yet.");
      return window.App.views.quiz.render();
    }

    if (!window.App.progress.isTopicUnlocked(phaseId, topicId)) {
      return lockedRedirect(
        "This quiz is locked. Pass the previous topic first.",
      );
    }
    var topic = window.App.progress.findTopic(phaseId, topicId);
    if (!topic) {
      return (
        '<div class="state-box">' +
        "<h2>Quiz not found</h2>" +
        "<p>This topic does not exist.</p>" +
        '<a class="btn btn--secondary" href="#/dashboard">Back to dashboard</a>' +
        "</div>"
      );
    }
    if (!topic.quiz || topic.quiz.length === 0) {
      return (
        '<div class="state-box">' +
        "<h2>Quiz coming soon</h2>" +
        "<p>The quiz for this topic has not been written yet.</p>" +
        '<a class="btn btn--secondary" href="#/dashboard">Back to dashboard</a>' +
        "</div>"
      );
    }
    var started = window.App.views.quiz.startTopicQuiz(phaseId, topicId);
    if (!started) {
      return (
        '<div class="state-box">' +
        "<h2>Quiz unavailable</h2>" +
        '<a class="btn btn--secondary" href="#/dashboard">Back to dashboard</a>' +
        "</div>"
      );
    }
    return window.App.views.quiz.render();
  }

  function lockedRedirect(message) {
    // Redirect to dashboard after a short notice. We render a notice,
    // then the hashchange to dashboard replaces it.
    setTimeout(function () {
      window.location.hash = "#/dashboard";
    }, 50);
    return (
      '<div class="state-box">' +
      '<div class="state-box__icon">' +
      '<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>' +
      "</div>" +
      "<h2>Locked</h2>" +
      "<p>" +
      message +
      "</p>" +
      '<a class="btn btn--primary" href="#/dashboard">Back to dashboard</a>' +
      "</div>"
    );
  }

  function updateTopbarProgress() {
    var overall = window.App.progress.getOverallProgress();
    var ring = document.getElementById("topbarProgressRing");
    var text = document.getElementById("topbarProgressText");
    if (ring) {
      var circ = 2 * Math.PI * 15;
      var offset = circ - (overall.percent / 100) * circ;
      ring.setAttribute("stroke-dashoffset", offset.toFixed(2));
    }
    if (text) text.textContent = overall.percent + "%";
  }

  function onHashChange() {
    // Guard: if there's no hash, default to dashboard
    if (
      !window.location.hash ||
      window.location.hash === "#" ||
      window.location.hash === "#/"
    ) {
      window.location.hash = "#/dashboard";
      return;
    }
    render();
  }

  function init() {
    window.addEventListener("hashchange", onHashChange);
    if (
      !window.location.hash ||
      window.location.hash === "#" ||
      window.location.hash === "#/"
    ) {
      window.location.hash = "#/dashboard";
    } else {
      render();
    }
  }

  window.App.router = {
    init: init,
    render: render,
    navigate: function (hash) {
      window.location.hash = hash;
    },
  };
})();
