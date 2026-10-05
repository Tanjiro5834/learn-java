/* ============================================================
   quiz.js — quiz engine (topic quizzes + phase final quizzes)
   Exposes window.App.views.quiz
   ============================================================ */
(function () {
  "use strict";

  window.App = window.App || {};
  window.App.views = window.App.views || {};

  var state = null;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  /* ---------------- Quiz start ---------------- */

  function startTopicQuiz(phaseId, topicId) {
    var phase = window.App.progress.findPhase(phaseId);
    var topic = window.App.progress.findTopic(phaseId, topicId);
    if (!phase || !topic) return null;
    if (!topic.quiz || topic.quiz.length === 0) return null;
    state = {
      kind: "topic",
      phaseId: phaseId,
      topicId: topicId,
      phaseTitle: phase.title,
      topicTitle: topic.title,
      questions: topic.quiz.map(function (q, i) {
        return Object.assign({}, q, { _originalIndex: i });
      }),
      current: 0,
      answers: [],
      answered: false,
    };
    return state;
  }

  function startFinalQuiz(phaseId) {
    var phase = window.App.progress.findPhase(phaseId);
    if (
      !phase ||
      !phase.finalQuiz ||
      !phase.finalQuiz.questions ||
      phase.finalQuiz.questions.length === 0
    )
      return null;
    if (!window.App.progress.isFinalQuizUnlocked(phaseId)) return null;

    // Pull questions from every topic's quiz + any explicit finalQuiz questions.
    var pool = [];
    phase.topics.forEach(function (t) {
      if (t.quiz && t.quiz.length) {
        t.quiz.forEach(function (q) {
          pool.push(Object.assign({}, q, { _topicTitle: t.title }));
        });
      }
    });
    if (phase.finalQuiz.questions && phase.finalQuiz.questions.length) {
      phase.finalQuiz.questions.forEach(function (q) {
        pool.push(Object.assign({}, q));
      });
    }
    var shuffled = shuffle(pool).slice(0, Math.min(20, pool.length));

    state = {
      kind: "final",
      phaseId: phaseId,
      topicId: "__final__",
      phaseTitle: phase.title,
      topicTitle: phase.title + " — Final Quiz",
      questions: shuffled,
      current: 0,
      answers: [],
      answered: false,
    };
    return state;
  }

  /* ---------------- Rendering ---------------- */

  function renderHeader() {
    var total = state.questions.length;
    var current = state.current + 1;
    var pct = Math.round((state.current / total) * 100);
    var label = state.kind === "final" ? "Phase Final Quiz" : "Topic Quiz";
    return (
      '<div class="quiz-header">' +
      "<span>" +
      escapeHtml(label) +
      " · " +
      escapeHtml(state.phaseTitle) +
      "</span>" +
      '<span class="quiz-header__count">Question ' +
      current +
      " / " +
      total +
      "</span>" +
      "</div>" +
      '<div class="progress-bar"><div class="progress-bar__fill" style="width:' +
      pct +
      '%"></div></div>'
    );
  }

  function typeLabel(type) {
    switch (type) {
      case "multiple-choice":
        return "Multiple choice";
      case "code-output":
        return "What does this code output?";
      case "spot-the-bug":
        return "Spot the bug";
      default:
        return "Question";
    }
  }

  function optionLetter(i) {
    return String.fromCharCode(65 + i);
  }

  function renderQuestion() {
    var q = state.questions[state.current];
    var codeHtml = q.code
      ? '<div class="code-block" style="margin-bottom:16px"><pre><code>' +
        window.App.views.lesson.highlightJava(q.code) +
        "</code></pre></div>"
      : "";

    var optionsHtml = q.options
      .map(function (opt, i) {
        return (
          "<li>" +
          '<button class="quiz-option" type="button" data-option-index="' +
          i +
          '">' +
          '<span class="quiz-option__letter">' +
          optionLetter(i) +
          "</span>" +
          '<span class="quiz-option__text">' +
          escapeHtml(opt) +
          "</span>" +
          "</button>" +
          "</li>"
        );
      })
      .join("");

    var feedbackHtml = "";
    if (state.answered) {
      var last = state.answers[state.answers.length - 1];
      var isCorrect = last.selectedIndex === q.correctIndex;
      feedbackHtml =
        '<div class="quiz-feedback ' +
        (isCorrect ? "quiz-feedback--correct" : "quiz-feedback--wrong") +
        '">' +
        '<span class="quiz-feedback__title">' +
        (isCorrect
          ? "Correct!"
          : "Not quite — the correct answer is " +
            optionLetter(q.correctIndex) +
            ".") +
        "</span>" +
        escapeHtml(q.explanation || "") +
        "</div>";
    }

    var nextLabel =
      state.current === state.questions.length - 1
        ? "See Results"
        : "Next Question";
    var nextBtn = state.answered
      ? '<button class="btn btn--primary" type="button" data-quiz-next>' +
        nextLabel +
        "</button>"
      : '<button class="btn btn--primary" type="button" disabled>Select an answer</button>';

    return (
      '<div class="quiz-question">' +
      '<span class="quiz-question__type">' +
      escapeHtml(typeLabel(q.type)) +
      "</span>" +
      '<p class="quiz-question__text">' +
      escapeHtml(q.question) +
      "</p>" +
      codeHtml +
      '<ul class="quiz-options">' +
      optionsHtml +
      "</ul>" +
      feedbackHtml +
      '<div class="quiz-nav">' +
      '<button class="btn btn--secondary" type="button" data-quiz-quit>Quit</button>' +
      nextBtn +
      "</div>" +
      "</div>"
    );
  }

  function render() {
    if (!state) {
      return (
        '<div class="state-box">' +
        "<h2>Quiz unavailable</h2>" +
        "<p>This quiz could not be loaded or is locked.</p>" +
        '<a class="btn btn--secondary" href="#/dashboard">Back to dashboard</a>' +
        "</div>"
      );
    }
    return (
      '<div class="quiz-shell">' + renderHeader() + renderQuestion() + "</div>"
    );
  }

  /* ---------------- Interaction ---------------- */

  function selectOption(index) {
    if (state.answered) return;
    var q = state.questions[state.current];
    state.answers.push({ selectedIndex: index, correctIndex: q.correctIndex });
    state.answered = true;
  }

  function nextQuestion() {
    if (!state.answered) return;
    if (state.current < state.questions.length - 1) {
      state.current++;
      state.answered = false;
      window.App.router.render();
      return;
    }
    // Finish
    finish();
  }

  function finish() {
    var total = state.questions.length;
    var correct = state.answers.filter(function (a) {
      return a.selectedIndex === a.correctIndex;
    }).length;
    var percent = total === 0 ? 0 : Math.round((correct / total) * 100);

    var result = {
      kind: state.kind,
      phaseId: state.phaseId,
      topicId: state.topicId,
      phaseTitle: state.phaseTitle,
      topicTitle: state.topicTitle,
      questions: state.questions,
      answers: state.answers,
      correct: correct,
      total: total,
      percent: percent,
      passed: percent >= window.App.progress.PASS_MARK,
    };

    if (state.kind === "topic") {
      window.App.progress.recordQuizAttempt(
        state.phaseId,
        state.topicId,
        percent,
      );
    } else {
      window.App.progress.recordFinalQuizAttempt(state.phaseId, percent);
    }

    window.App.views.results.set(result);
    state = null;

    var route =
      result.kind === "topic"
        ? "#/results/" + result.phaseId + "/" + result.topicId
        : "#/results/" + result.phaseId + "/__final__";
    window.location.hash = route;
  }

  function quit() {
    state = null;
    window.location.hash = "#/dashboard";
  }

  function handleClick(e) {
    var optBtn = e.target.closest("[data-option-index]");
    if (optBtn && !state.answered) {
      var idx = Number(optBtn.getAttribute("data-option-index"));
      selectOption(idx);
      window.App.router.render();
      return;
    }
    if (e.target.closest("[data-quiz-next]")) {
      nextQuestion();
      return;
    }
    if (e.target.closest("[data-quiz-quit]")) {
      quit();
      return;
    }
  }

  function init() {
    var main = document.getElementById("mainContent");
    if (main) main.addEventListener("click", handleClick);
  }

  window.App.views.quiz = {
    startTopicQuiz: startTopicQuiz,
    startFinalQuiz: startFinalQuiz,
    render: render,
    init: init,
    getState: function () {
      return state;
    },
  };
})();
