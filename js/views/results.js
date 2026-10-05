/* ============================================================
   results.js — results view with review of wrong answers
   Exposes window.App.views.results
   ============================================================ */
(function () {
  "use strict";

  window.App = window.App || {};
  window.App.views = window.App.views || {};

  var lastResult = null;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function set(result) {
    lastResult = result;
  }

  function get() {
    return lastResult;
  }

  function optionLetter(i) {
    return String.fromCharCode(65 + i);
  }

  function renderRing(percent, passed) {
    var radius = 60;
    var circ = 2 * Math.PI * radius;
    var offset = circ - (percent / 100) * circ;
    var color = passed ? "var(--color-success)" : "var(--color-danger)";
    return (
      '<div class="results-score__ring">' +
      '<svg viewBox="0 0 140 140" width="140" height="140">' +
      '<circle cx="70" cy="70" r="' +
      radius +
      '" fill="none" stroke="var(--color-border)" stroke-width="10"/>' +
      '<circle cx="70" cy="70" r="' +
      radius +
      '" fill="none" stroke="' +
      color +
      '" stroke-width="10" stroke-linecap="round" ' +
      'stroke-dasharray="' +
      circ.toFixed(2) +
      '" stroke-dashoffset="' +
      offset.toFixed(2) +
      '" transform="rotate(-90 70 70)"/>' +
      "</svg>" +
      '<div style="position:absolute;text-align:center">' +
      '<div class="results-score__pct">' +
      percent +
      "%</div>" +
      "</div>" +
      "</div>"
    );
  }

  function renderWrongAnswers(result) {
    var wrong = [];
    result.questions.forEach(function (q, i) {
      var ans = result.answers[i];
      if (!ans) return;
      if (ans.selectedIndex !== ans.correctIndex) {
        wrong.push({ q: q, ans: ans, index: i });
      }
    });

    if (wrong.length === 0) {
      return (
        '<div class="callout callout--success" style="margin-top:24px">' +
        "<strong>Perfect score.</strong> Every answer was correct. Review the explanations anyway to reinforce your understanding." +
        "</div>"
      );
    }

    var items = wrong
      .map(function (w) {
        var q = w.q;
        var selectedText = q.options[w.ans.selectedIndex];
        var correctText = q.options[w.ans.correctIndex];
        return (
          '<div class="review-item">' +
          '<p class="review-item__q">' +
          (w.index + 1) +
          ". " +
          escapeHtml(q.question) +
          "</p>" +
          '<div class="review-item__row">' +
          '<span class="label">Your answer</span>' +
          '<span class="val--wrong">' +
          optionLetter(w.ans.selectedIndex) +
          ". " +
          escapeHtml(selectedText) +
          "</span>" +
          "</div>" +
          '<div class="review-item__row">' +
          '<span class="label">Correct answer</span>' +
          '<span class="val--correct">' +
          optionLetter(w.ans.correctIndex) +
          ". " +
          escapeHtml(correctText) +
          "</span>" +
          "</div>" +
          '<div class="review-item__explain">' +
          escapeHtml(q.explanation || "") +
          "</div>" +
          "</div>"
        );
      })
      .join("");

    return (
      '<section style="margin-top:32px">' +
      '<h2 class="section-title">Review wrong answers</h2>' +
      '<p class="section-subtitle">' +
      wrong.length +
      " question" +
      (wrong.length === 1 ? "" : "s") +
      " to review.</p>" +
      '<div class="review-list">' +
      items +
      "</div>" +
      "</section>"
    );
  }

  function renderActions(result) {
    var retakeHref =
      result.kind === "topic"
        ? "#/quiz/" + result.phaseId + "/" + result.topicId
        : "#/quiz/" + result.phaseId + "/__final__";

    var nextHtml = "";
    if (result.kind === "topic" && result.passed) {
      var phase = window.App.progress.findPhase(result.phaseId);
      var next = null;
      if (phase) {
        var idx = phase.topics.findIndex(function (t) {
          return t.id === result.topicId;
        });
        if (idx >= 0 && idx < phase.topics.length - 1) {
          next = phase.topics[idx + 1];
        }
      }
      if (next) {
        nextHtml =
          '<a class="btn btn--primary" href="#/lesson/' +
          result.phaseId +
          "/" +
          next.id +
          '">Next Topic: ' +
          escapeHtml(next.title) +
          "</a>";
      } else if (window.App.progress.isFinalQuizUnlocked(result.phaseId)) {
        nextHtml =
          '<a class="btn btn--primary" href="#/quiz/' +
          result.phaseId +
          '/__final__">Phase Final Quiz</a>';
      } else {
        // Find next phase's first topic
        var phases = window.App.progress.getPhases();
        var pIdx = phases.findIndex(function (p) {
          return p.id === result.phaseId;
        });
        if (pIdx >= 0 && pIdx < phases.length - 1) {
          var nextPhase = phases[pIdx + 1];
          if (window.App.progress.isPhaseUnlocked(nextPhase.id)) {
            nextHtml =
              '<a class="btn btn--primary" href="#/lesson/' +
              nextPhase.id +
              "/" +
              nextPhase.topics[0].id +
              '">Next Phase: ' +
              escapeHtml(nextPhase.title) +
              "</a>";
          }
        }
      }
    } else if (result.kind === "final" && result.passed) {
      var phases2 = window.App.progress.getPhases();
      var pIdx2 = phases2.findIndex(function (p) {
        return p.id === result.phaseId;
      });
      if (pIdx2 >= 0 && pIdx2 < phases2.length - 1) {
        var np = phases2[pIdx2 + 1];
        nextHtml =
          '<a class="btn btn--primary" href="#/lesson/' +
          np.id +
          "/" +
          np.topics[0].id +
          '">Next Phase: ' +
          escapeHtml(np.title) +
          "</a>";
      } else {
        nextHtml =
          '<a class="btn btn--primary" href="#/dashboard">Back to dashboard</a>';
      }
    } else if (result.kind === "topic" && !result.passed) {
      nextHtml =
        '<a class="btn btn--primary" href="' + retakeHref + '">Retake Quiz</a>';
    } else {
      nextHtml =
        '<a class="btn btn--primary" href="#/dashboard">Back to dashboard</a>';
    }

    return (
      '<div class="results-actions">' +
      '<a class="btn btn--secondary" href="' +
      retakeHref +
      '">Retake</a>' +
      nextHtml +
      "</div>"
    );
  }

  function render(phaseId, topicId) {
    var result = lastResult;
    if (!result || result.phaseId !== phaseId || result.topicId !== topicId) {
      // Fall back to stored state if the user navigated directly to #/results/...
      var qs =
        topicId === "__final__"
          ? window.App.progress.getFinalQuizState(phaseId)
          : window.App.progress.getQuizState(phaseId, topicId);
      if (!qs) {
        return (
          '<div class="state-box">' +
          "<h2>No results to show</h2>" +
          "<p>Take the quiz first to see your results.</p>" +
          '<a class="btn btn--secondary" href="#/dashboard">Back to dashboard</a>' +
          "</div>"
        );
      }
      var phase = window.App.progress.findPhase(phaseId);
      var topic = window.App.progress.findTopic(phaseId, topicId);
      var title =
        topicId === "__final__"
          ? phase
            ? phase.title + " — Final Quiz"
            : "Final Quiz"
          : topic
            ? topic.title
            : topicId;
      result = {
        kind: topicId === "__final__" ? "final" : "topic",
        phaseId: phaseId,
        topicId: topicId,
        phaseTitle: phase ? phase.title : phaseId,
        topicTitle: title,
        questions: [],
        answers: [],
        correct: Math.round((qs.best / 100) * 10),
        total: 10,
        percent: qs.best,
        passed: qs.passed,
        summaryOnly: true,
      };
    }

    var passedLabel = result.passed ? "Passed" : "Not passed";
    var passNote = result.passed
      ? "Great work — this topic is marked complete."
      : "You need " +
        window.App.progress.PASS_MARK +
        "% to pass. Review the material and retake the quiz.";

    return (
      '<div class="results-shell">' +
      '<div class="results-score" style="position:relative">' +
      renderRing(result.percent, result.passed) +
      '<div class="results-score__label">' +
      passedLabel +
      "</div>" +
      '<div class="results-score__detail">' +
      result.correct +
      " of " +
      result.total +
      " correct · " +
      escapeHtml(result.topicTitle) +
      "</div>" +
      '<div class="results-score__detail" style="margin-top:6px">' +
      escapeHtml(passNote) +
      "</div>" +
      renderActions(result) +
      "</div>" +
      (result.summaryOnly ? "" : renderWrongAnswers(result)) +
      "</div>"
    );
  }

  window.App.views.results = {
    set: set,
    get: get,
    render: render,
  };
})();
