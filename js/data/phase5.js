/* ============================================================
   phase5.js — Phase 5: Projects (titles only)
   ============================================================ */
(function () {
  "use strict";
  window.APP_DATA = window.APP_DATA || { phases: [] };

  window.APP_DATA.phases.push({
    id: "phase-5",
    number: 5,
    title: "Projects",
    description: "Build and explain one complete portfolio project.",
    topics: [
      {
        id: "build-project",
        title: "Building one complete project",
        type: "lesson",
      },
      {
        id: "explain-project",
        title: "Explaining your project",
        type: "lesson",
      },
    ],
    finalQuiz: null,
  });
})();
