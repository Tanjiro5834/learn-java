/* ============================================================
   phase6.js — Phase 6: Coding Practice (titles only)
   Uses "challenge" type once content is added.
   ============================================================ */
(function () {
  "use strict";
  window.APP_DATA = window.APP_DATA || { phases: [] };

  window.APP_DATA.phases.push({
    id: "phase-6",
    number: 6,
    title: "Coding Practice",
    description: "Hands-on challenges for strings, arrays, logic, and SQL.",
    topics: [
      { id: "strings", title: "String manipulation", type: "challenge" },
      { id: "arrays", title: "Array problems", type: "challenge" },
      { id: "logic", title: "Logic basics", type: "challenge" },
      { id: "sql-by-hand", title: "SQL by hand", type: "challenge" },
    ],
    finalQuiz: null,
  });
})();
