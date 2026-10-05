/* ============================================================
   phase2.js — Phase 2: Spring Boot & Backend (titles only)
   ============================================================ */
(function () {
  "use strict";
  window.APP_DATA = window.APP_DATA || { phases: [] };

  window.APP_DATA.phases.push({
    id: "phase-2",
    number: 2,
    title: "Spring Boot & Backend",
    description: "Build production-style REST APIs with Spring Boot.",
    topics: [
      {
        id: "springbootapplication",
        title: "@SpringBootApplication",
        type: "lesson",
      },
      { id: "annotations", title: "Annotation Basics", type: "lesson" },
      {
        id: "dependency-injection",
        title: "Dependency Injection",
        type: "lesson",
      },
      { id: "rest-design", title: "REST API Design", type: "lesson" },
      {
        id: "application-properties",
        title: "application.properties",
        type: "lesson",
      },
      {
        id: "spring-security",
        title: "Spring Security Basics",
        type: "lesson",
      },
    ],
    finalQuiz: null,
  });
})();
