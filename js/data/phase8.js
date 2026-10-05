/* ============================================================
   phase8.js — Phase 8: Interview Preparation (titles only)
   Uses "checklist" type once content is added.
   ============================================================ */
(function () {
  "use strict";
  window.APP_DATA = window.APP_DATA || { phases: [] };

  window.APP_DATA.phases.push({
    id: "phase-8",
    number: 8,
    title: "Interview Preparation",
    description: "Walk into the room ready.",
    topics: [
      {
        id: "tell-me-about-yourself",
        title: "Tell me about yourself",
        type: "checklist",
      },
      {
        id: "project-walkthrough",
        title: "Project walkthrough",
        type: "checklist",
      },
      { id: "hr-questions", title: "Common HR questions", type: "checklist" },
      {
        id: "mock-interview",
        title: "Mock interview practice",
        type: "checklist",
      },
      { id: "dont-know", title: 'Handling "I don\'t know"', type: "checklist" },
    ],
    finalQuiz: null,
  });
})();
