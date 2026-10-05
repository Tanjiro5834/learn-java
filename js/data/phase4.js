/* ============================================================
   phase4.js — Phase 4: Tools & Workflow (titles only)
   ============================================================ */
(function () {
  "use strict";
  window.APP_DATA = window.APP_DATA || { phases: [] };

  window.APP_DATA.phases.push({
    id: "phase-4",
    number: 4,
    title: "Tools & Workflow",
    description: "The tooling every junior developer is expected to know.",
    topics: [
      { id: "git", title: "Git Basics", type: "lesson" },
      { id: "maven", title: "Maven", type: "lesson" },
      { id: "ide", title: "IDE Comfort", type: "lesson" },
      { id: "junit", title: "Unit Testing", type: "lesson" },
    ],
    finalQuiz: null,
  });
})();
