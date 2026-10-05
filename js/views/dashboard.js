/* ============================================================
   dashboard.js — home view
   Exposes window.App.views.dashboard
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

  function topicName(phaseId, topicId) {
    if (topicId === "__final__") {
      var p = window.App.progress.findPhase(phaseId);
      return p ? p.title + " — Final Quiz" : "Final Quiz";
    }
    var t = window.App.progress.findTopic(phaseId, topicId);
    var ph = window.App.progress.findPhase(phaseId);
    if (!t) return topicId;
    return (ph ? ph.title + " · " : "") + t.title;
  }

  function renderPhaseCard(phase) {
    var unlocked = window.App.progress.isPhaseUnlocked(phase.id);
    var prog = window.App.progress.getPhaseProgress(phase.id);
    var complete = window.App.progress.isPhaseComplete(phase.id);
    var badge;
    if (complete) {
      badge = '<span class="badge badge--passed">Complete</span>';
    } else if (unlocked && prog.passed > 0) {
      badge = '<span class="badge badge--progress">In progress</span>';
    } else if (unlocked) {
      badge = '<span class="badge badge--accent">Ready</span>';
    } else {
      badge = '<span class="badge badge--locked">Locked</span>';
    }

    var firstTopic = phase.topics[0];
    var cta;
    if (!unlocked) {
      cta = '<button class="btn btn--secondary" disabled>Locked</button>';
    } else {
      // Find next incomplete topic
      var target = null;
      for (var i = 0; i < phase.topics.length; i++) {
        if (!window.App.progress.isTopicPassed(phase.id, phase.topics[i].id)) {
          target = phase.topics[i];
          break;
        }
      }
      if (target) {
        cta =
          '<a class="btn btn--primary" href="#/lesson/' +
          phase.id +
          "/" +
          target.id +
          '">' +
          (prog.passed === 0 ? "Start" : "Continue") +
          "</a>";
      } else if (window.App.progress.isFinalQuizUnlocked(phase.id)) {
        cta =
          '<a class="btn btn--primary" href="#/quiz/' +
          phase.id +
          '/__final__">Phase Final Quiz</a>';
      } else {
        cta =
          '<a class="btn btn--primary" href="#/lesson/' +
          phase.id +
          "/" +
          firstTopic.id +
          '">Review</a>';
      }
    }

    return (
      '<div class="phase-card' +
      (unlocked ? "" : " phase-card--locked") +
      '">' +
      '<div class="phase-card__head">' +
      '<span class="phase-card__num">' +
      phase.number +
      "</span>" +
      '<span class="phase-card__title">' +
      escapeHtml(phase.title) +
      "</span>" +
      badge +
      "</div>" +
      '<div class="text-muted" style="font-size:0.875rem">' +
      escapeHtml(phase.description || "") +
      "</div>" +
      '<div class="progress-row" style="margin-top:14px">' +
      '<span class="progress-row__value">' +
      prog.passed +
      " / " +
      prog.total +
      " topics</span>" +
      "</div>" +
      '<div class="progress-bar"><div class="progress-bar__fill" style="width:' +
      prog.percent +
      '%"></div></div>' +
      '<div class="phase-card__meta">' +
      "<span>" +
      prog.percent +
      "% complete</span>" +
      cta +
      "</div>" +
      "</div>"
    );
  }

  function renderRecent() {
    var recent = window.App.progress.getRecentScores(5);
    if (recent.length === 0) {
      return '<p class="text-muted">No quiz attempts yet. Start with Phase 1 → OOP Principles.</p>';
    }
    var rows = recent
      .map(function (r) {
        var cls = r.passed ? "badge--passed" : "badge--progress";
        var label = r.passed ? "Passed" : "Attempted";
        return (
          '<div class="settings-row">' +
          '<div class="settings-row__info">' +
          '<div class="settings-row__title">' +
          escapeHtml(topicName(r.phaseId, r.topicId)) +
          "</div>" +
          '<div class="settings-row__desc">Best ' +
          r.best +
          "% · " +
          r.attempts +
          " attempt" +
          (r.attempts === 1 ? "" : "s") +
          "</div>" +
          "</div>" +
          '<span class="badge ' +
          cls +
          '">' +
          label +
          "</span>" +
          "</div>"
        );
      })
      .join("");
    return rows;
  }

  function render() {
    var overall = window.App.progress.getOverallProgress();
    var next = window.App.progress.getNextTopic();
    var continueHref = "#/dashboard";
    var continueLabel = "Start learning";
    if (next) {
      if (next.topicId === "__final__") {
        continueHref = "#/quiz/" + next.phaseId + "/__final__";
        continueLabel = "Continue: Phase Final Quiz";
      } else {
        continueHref = "#/lesson/" + next.phaseId + "/" + next.topicId;
        continueLabel = "Continue where you left off";
      }
    }

    var phases = window.App.progress.getPhases();

    return (
      '<section class="dashboard__hero">' +
      "<h1>Welcome to JavaPath</h1>" +
      "<p>Learn Java from core fundamentals to job-ready as a Junior Java Developer. Self-paced lessons, quizzes after every topic, and a final quiz at the end of each phase.</p>" +
      '<div class="progress-row">' +
      '<span class="progress-row__label">Overall progress</span>' +
      '<span class="progress-row__value">' +
      overall.passed +
      " / " +
      overall.total +
      " topics · " +
      overall.percent +
      "%</span>" +
      "</div>" +
      '<div class="progress-bar" style="margin-bottom:18px"><div class="progress-bar__fill" style="width:' +
      overall.percent +
      '%"></div></div>' +
      '<div class="dashboard__hero-actions">' +
      '<a class="btn btn--primary btn--lg" href="' +
      continueHref +
      '">' +
      continueLabel +
      "</a>" +
      '<a class="btn btn--secondary btn--lg" href="#/settings">Settings</a>' +
      "</div>" +
      "</section>" +
      "<section>" +
      '<h2 class="section-title">Curriculum</h2>' +
      '<p class="section-subtitle">Phases unlock one after another. Pass each topic quiz (70%+) to progress.</p>' +
      '<div class="phase-list">' +
      phases.map(renderPhaseCard).join("") +
      "</div>" +
      "</section>" +
      '<section style="margin-top:32px">' +
      '<h2 class="section-title">Recent quiz scores</h2>' +
      '<p class="section-subtitle">Your most recent attempts across all topics.</p>' +
      '<div class="card">' +
      renderRecent() +
      "</div>" +
      "</section>"
    );
  }

  window.App.views.dashboard = { render: render };
})();
