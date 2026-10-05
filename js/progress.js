/* ============================================================
   progress.js — completion, locking, scores, navigation helpers
   Exposes window.App.progress
   ============================================================ */
(function () {
  "use strict";

  window.App = window.App || {};

  var PASS_MARK = 70;
  var STORAGE_KEY = "progress";

  /* Shape stored in localStorage:
     {
       quizzes: {
         "phase-1/oop": { best: 90, attempts: 2, passed: true, lastAt: 1712345678901 }
       },
       completed: { "phase-1/oop": true, ... },
       finalQuizzes: { "phase-1": { best: 85, attempts: 1, passed: true } },
       lastVisited: { phaseId, topicId, at }
     }
  */

  function defaults() {
    return {
      quizzes: {},
      completed: {},
      finalQuizzes: {},
      lastVisited: null,
    };
  }

  var state = null;

  function load() {
    var stored = window.App.storage.getJSON(STORAGE_KEY, null);
    if (!stored || typeof stored !== "object") {
      state = defaults();
      return state;
    }
    state = {
      quizzes:
        stored.quizzes && typeof stored.quizzes === "object"
          ? stored.quizzes
          : {},
      completed:
        stored.completed && typeof stored.completed === "object"
          ? stored.completed
          : {},
      finalQuizzes:
        stored.finalQuizzes && typeof stored.finalQuizzes === "object"
          ? stored.finalQuizzes
          : {},
      lastVisited: stored.lastVisited || null,
    };
    return state;
  }

  function persist() {
    window.App.storage.setJSON(STORAGE_KEY, state);
  }

  function ensureLoaded() {
    if (!state) load();
    return state;
  }

  function quizKey(phaseId, topicId) {
    return phaseId + "/" + topicId;
  }

  function finalKey(phaseId) {
    return phaseId;
  }

  /* -------------------- Data accessors -------------------- */

  function getPhases() {
    return window.APP_DATA && window.APP_DATA.phases
      ? window.APP_DATA.phases
      : [];
  }

  function findPhase(phaseId) {
    var phases = getPhases();
    for (var i = 0; i < phases.length; i++) {
      if (phases[i].id === phaseId) return phases[i];
    }
    return null;
  }

  function findTopic(phaseId, topicId) {
    var phase = findPhase(phaseId);
    if (!phase) return null;
    for (var i = 0; i < phase.topics.length; i++) {
      if (phase.topics[i].id === topicId) return phase.topics[i];
    }
    return null;
  }

  /* -------------------- Quiz state -------------------- */

  function getQuizState(phaseId, topicId) {
    ensureLoaded();
    var k = quizKey(phaseId, topicId);
    return state.quizzes[k] || null;
  }

  function recordQuizAttempt(phaseId, topicId, percent) {
    ensureLoaded();
    var k = quizKey(phaseId, topicId);
    var existing = state.quizzes[k] || { best: 0, attempts: 0, passed: false };
    var passed = percent >= PASS_MARK;
    state.quizzes[k] = {
      best: Math.max(existing.best || 0, percent),
      attempts: (existing.attempts || 0) + 1,
      passed: existing.passed || passed,
      lastAt: Date.now(),
    };
    if (passed) {
      state.completed[k] = true;
    }
    persist();
    return state.quizzes[k];
  }

  function isTopicPassed(phaseId, topicId) {
    var q = getQuizState(phaseId, topicId);
    return !!(q && q.passed);
  }

  function isTopicUnlocked(phaseId, topicId) {
    var phase = findPhase(phaseId);
    if (!phase) return false;

    // First topic of phase 1 is always unlocked
    var phaseIndex = getPhases().indexOf(phase);
    var topicIndex = phase.topics.findIndex(function (t) {
      return t.id === topicId;
    });

    if (phaseIndex === 0 && topicIndex === 0) return true;

    // A phase itself is unlocked if all topics of the previous phase are passed
    // and the previous phase's final quiz is passed (if a final quiz exists).
    if (!isPhaseUnlocked(phaseId)) return false;

    // Within a phase, a topic is unlocked if it is first OR the previous topic is passed.
    if (topicIndex === 0) return true;
    var prev = phase.topics[topicIndex - 1];
    return isTopicPassed(phaseId, prev.id);
  }

  function isPhaseUnlocked(phaseId) {
    var phases = getPhases();
    var idx = -1;
    for (var i = 0; i < phases.length; i++) {
      if (phases[i].id === phaseId) {
        idx = i;
        break;
      }
    }
    if (idx <= 0) return true;

    var prev = phases[idx - 1];
    // All topics in previous phase must be passed
    for (var j = 0; j < prev.topics.length; j++) {
      if (!isTopicPassed(prev.id, prev.topics[j].id)) return false;
    }
    // If previous phase has a final quiz defined, it must be passed.
    if (
      prev.finalQuiz &&
      prev.finalQuiz.questions &&
      prev.finalQuiz.questions.length > 0
    ) {
      var fq = getFinalQuizState(prev.id);
      if (!fq || !fq.passed) return false;
    }
    return true;
  }

  function isPhaseComplete(phaseId) {
    var phase = findPhase(phaseId);
    if (!phase) return false;
    for (var i = 0; i < phase.topics.length; i++) {
      if (!isTopicPassed(phaseId, phase.topics[i].id)) return false;
    }
    if (
      phase.finalQuiz &&
      phase.finalQuiz.questions &&
      phase.finalQuiz.questions.length > 0
    ) {
      var fq = getFinalQuizState(phaseId);
      if (!fq || !fq.passed) return false;
    }
    return true;
  }

  function isFinalQuizUnlocked(phaseId) {
    var phase = findPhase(phaseId);
    if (!phase) return false;
    if (
      !phase.finalQuiz ||
      !phase.finalQuiz.questions ||
      phase.finalQuiz.questions.length === 0
    )
      return false;
    for (var i = 0; i < phase.topics.length; i++) {
      if (!isTopicPassed(phaseId, phase.topics[i].id)) return false;
    }
    return true;
  }

  function getFinalQuizState(phaseId) {
    ensureLoaded();
    return state.finalQuizzes[finalKey(phaseId)] || null;
  }

  function recordFinalQuizAttempt(phaseId, percent) {
    ensureLoaded();
    var k = finalKey(phaseId);
    var existing = state.finalQuizzes[k] || {
      best: 0,
      attempts: 0,
      passed: false,
    };
    var passed = percent >= PASS_MARK;
    state.finalQuizzes[k] = {
      best: Math.max(existing.best || 0, percent),
      attempts: (existing.attempts || 0) + 1,
      passed: existing.passed || passed,
      lastAt: Date.now(),
    };
    persist();
    return state.finalQuizzes[k];
  }

  /* -------------------- Progress metrics -------------------- */

  function getPhaseProgress(phaseId) {
    var phase = findPhase(phaseId);
    if (!phase) return { passed: 0, total: 0, percent: 0 };
    var passed = 0;
    for (var i = 0; i < phase.topics.length; i++) {
      if (isTopicPassed(phaseId, phase.topics[i].id)) passed++;
    }
    var total = phase.topics.length;
    return {
      passed: passed,
      total: total,
      percent: total === 0 ? 0 : Math.round((passed / total) * 100),
    };
  }

  function getOverallProgress() {
    var phases = getPhases();
    var totalTopics = 0;
    var passedTopics = 0;
    phases.forEach(function (p) {
      p.topics.forEach(function (t) {
        totalTopics++;
        if (isTopicPassed(p.id, t.id)) passedTopics++;
      });
    });
    return {
      passed: passedTopics,
      total: totalTopics,
      percent:
        totalTopics === 0 ? 0 : Math.round((passedTopics / totalTopics) * 100),
    };
  }

  /* -------------------- "Continue where you left off" -------------------- */

  function setLastVisited(phaseId, topicId) {
    ensureLoaded();
    state.lastVisited = { phaseId: phaseId, topicId: topicId, at: Date.now() };
    persist();
  }

  function getLastVisited() {
    ensureLoaded();
    return state.lastVisited;
  }

  function getNextTopic() {
    var phases = getPhases();
    for (var i = 0; i < phases.length; i++) {
      var phase = phases[i];
      if (!isPhaseUnlocked(phase.id)) continue;
      for (var j = 0; j < phase.topics.length; j++) {
        var topic = phase.topics[j];
        if (
          !isTopicPassed(phase.id, topic.id) &&
          isTopicUnlocked(phase.id, topic.id)
        ) {
          return { phaseId: phase.id, topicId: topic.id };
        }
      }
      if (isFinalQuizUnlocked(phase.id)) {
        return { phaseId: phase.id, topicId: "__final__" };
      }
    }
    return null;
  }

  /* -------------------- Recent scores -------------------- */

  function getRecentScores(limit) {
    ensureLoaded();
    var entries = [];
    Object.keys(state.quizzes).forEach(function (key) {
      var q = state.quizzes[key];
      if (!q || !q.lastAt) return;
      var parts = key.split("/");
      entries.push({
        phaseId: parts[0],
        topicId: parts[1],
        best: q.best,
        attempts: q.attempts,
        passed: q.passed,
        lastAt: q.lastAt,
        kind: "topic",
      });
    });
    Object.keys(state.finalQuizzes).forEach(function (key) {
      var q = state.finalQuizzes[key];
      if (!q || !q.lastAt) return;
      entries.push({
        phaseId: key,
        topicId: "__final__",
        best: q.best,
        attempts: q.attempts,
        passed: q.passed,
        lastAt: q.lastAt,
        kind: "final",
      });
    });
    entries.sort(function (a, b) {
      return b.lastAt - a.lastAt;
    });
    return entries.slice(0, limit || 5);
  }

  /* -------------------- Reset -------------------- */

  function resetAll() {
    state = defaults();
    window.App.storage.remove(STORAGE_KEY);
  }

  window.App.progress = {
    PASS_MARK: PASS_MARK,
    load: load,
    getPhases: getPhases,
    findPhase: findPhase,
    findTopic: findTopic,
    getQuizState: getQuizState,
    recordQuizAttempt: recordQuizAttempt,
    isTopicPassed: isTopicPassed,
    isTopicUnlocked: isTopicUnlocked,
    isPhaseUnlocked: isPhaseUnlocked,
    isPhaseComplete: isPhaseComplete,
    isFinalQuizUnlocked: isFinalQuizUnlocked,
    getFinalQuizState: getFinalQuizState,
    recordFinalQuizAttempt: recordFinalQuizAttempt,
    getPhaseProgress: getPhaseProgress,
    getOverallProgress: getOverallProgress,
    setLastVisited: setLastVisited,
    getLastVisited: getLastVisited,
    getNextTopic: getNextTopic,
    getRecentScores: getRecentScores,
    resetAll: resetAll,
  };
})();
