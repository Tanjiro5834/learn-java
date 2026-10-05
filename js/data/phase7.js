/* ============================================================
   phase7.js — Phase 7: Resume & Application (titles only)
   Uses "checklist" type once content is added.
   ============================================================ */
(function () {
  "use strict";
  window.APP_DATA = window.APP_DATA || { phases: [] };

  window.APP_DATA.phases.push({
    id: "phase-7",
    number: 7,
    title: "Resume & Application",
    description: "Turn your skills into interviews.",
    topics: [
      { id: "resume", title: "One-page tailored resume", type: "checklist" },
    ],
    finalQuiz: null,
  });
})();
