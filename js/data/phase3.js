/* ============================================================
   phase3.js — Phase 3: Database & SQL (titles only)
   ============================================================ */
(function () {
  "use strict";
  window.APP_DATA = window.APP_DATA || { phases: [] };

  window.APP_DATA.phases.push({
    id: "phase-3",
    number: 3,
    title: "Database & SQL",
    description: "Query relational databases with confidence.",
    topics: [
      { id: "basic-queries", title: "Basic Queries", type: "lesson" },
      { id: "joins", title: "Joins", type: "lesson" },
      { id: "keys", title: "Primary Key vs Foreign Key", type: "lesson" },
      { id: "group-by-having", title: "GROUP BY vs HAVING", type: "lesson" },
      {
        id: "aggregation",
        title: "Subqueries and Aggregation",
        type: "lesson",
      },
      { id: "query-problems", title: "Common Query Problems", type: "lesson" },
    ],
    finalQuiz: null,
  });
})();
