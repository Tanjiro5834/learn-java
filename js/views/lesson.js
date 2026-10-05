/* ============================================================
   lesson.js — lesson view + syntax highlighter + copy button
   Exposes window.App.views.lesson
   ============================================================ */
(function () {
  "use strict";

  window.App = window.App || {};
  window.App.views = window.App.views || {};

  /* ---------------- Syntax highlighter ---------------- */

  var JAVA_KEYWORDS = [
    "abstract",
    "assert",
    "boolean",
    "break",
    "byte",
    "case",
    "catch",
    "char",
    "class",
    "const",
    "continue",
    "default",
    "do",
    "double",
    "else",
    "enum",
    "extends",
    "final",
    "finally",
    "float",
    "for",
    "goto",
    "if",
    "implements",
    "import",
    "instanceof",
    "int",
    "interface",
    "long",
    "native",
    "new",
    "package",
    "private",
    "protected",
    "public",
    "return",
    "short",
    "static",
    "strictfp",
    "super",
    "switch",
    "synchronized",
    "this",
    "throw",
    "throws",
    "transient",
    "try",
    "void",
    "volatile",
    "while",
    "true",
    "false",
    "null",
    "var",
    "record",
    "sealed",
    "permits",
    "yield",
    "lambda",
  ];

  var JAVA_TYPES = [
    "String",
    "Integer",
    "Long",
    "Double",
    "Float",
    "Boolean",
    "Character",
    "Byte",
    "Short",
    "Object",
    "List",
    "ArrayList",
    "LinkedList",
    "Map",
    "HashMap",
    "Set",
    "HashSet",
    "TreeMap",
    "TreeSet",
    "LinkedHashMap",
    "Optional",
    "Stream",
    "Collectors",
    "Exception",
    "RuntimeException",
    "IllegalArgumentException",
    "IllegalStateException",
    "Thread",
    "Runnable",
    "System",
    "Math",
    "Objects",
    "Arrays",
    "Collections",
    "Comparator",
    "Supplier",
    "Consumer",
    "Function",
    "Predicate",
  ];

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function highlightJava(src) {
    // Escape first so we never inject raw HTML.
    var escaped = escapeHtml(src);
    var placeholders = [];
    function stash(html) {
      placeholders.push(html);
      return "\u0000" + (placeholders.length - 1) + "\u0000";
    }

    // Block comments
    escaped = escaped.replace(/\/\*[\s\S]*?\*\//g, function (m) {
      return stash('<span class="tok-comment">' + m + "</span>");
    });
    // Line comments
    escaped = escaped.replace(/\/\/[^\n]*/g, function (m) {
      return stash('<span class="tok-comment">' + m + "</span>");
    });
    // Strings (double and single quoted, with escapes)
    escaped = escaped.replace(/"(\\.|[^"\\])*"/g, function (m) {
      return stash('<span class="tok-string">' + m + "</span>");
    });
    escaped = escaped.replace(/'(\\.|[^'\\])*'/g, function (m) {
      return stash('<span class="tok-string">' + m + "</span>");
    });
    // Annotations
    escaped = escaped.replace(/@[A-Za-z_][A-Za-z0-9_]*/g, function (m) {
      return stash('<span class="tok-annotation">' + m + "</span>");
    });
    // Numbers
    escaped = escaped.replace(/\b\d+(\.\d+)?[fFdDlL]?\b/g, function (m) {
      return stash('<span class="tok-number">' + m + "</span>");
    });
    // Types
    var typeRe = new RegExp("\\b(" + JAVA_TYPES.join("|") + ")\\b", "g");
    escaped = escaped.replace(typeRe, function (m) {
      return stash('<span class="tok-type">' + m + "</span>");
    });
    // Keywords
    var kwRe = new RegExp("\\b(" + JAVA_KEYWORDS.join("|") + ")\\b", "g");
    escaped = escaped.replace(kwRe, function (m) {
      return stash('<span class="tok-keyword">' + m + "</span>");
    });

    // Restore placeholders (repeat in case of nesting)
    var prev;
    do {
      prev = escaped;
      escaped = escaped.replace(/\u0000(\d+)\u0000/g, function (_, i) {
        return placeholders[Number(i)];
      });
    } while (escaped !== prev);

    return escaped;
  }

  function codeBlock(code, label) {
    var id = "code-" + Math.random().toString(36).slice(2, 9);
    var highlighted = highlightJava(code);
    return (
      '<div class="code-block" data-code-block>' +
      '<div class="code-block__header">' +
      "<span>" +
      escapeHtml(label || "Java") +
      "</span>" +
      '<button class="code-block__copy" type="button" data-copy-btn data-copy-target="' +
      id +
      '">' +
      '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
      "<span>Copy</span>" +
      "</button>" +
      "</div>" +
      '<pre><code id="' +
      id +
      '">' +
      highlighted +
      "</code></pre>" +
      '<textarea id="' +
      id +
      '-raw" class="sr-only" aria-hidden="true">' +
      escapeHtml(code) +
      "</textarea>" +
      "</div>"
    );
  }

  /* ---------------- Lesson rendering ---------------- */

  function renderLessonHeader(phase, topic) {
    return (
      '<header class="lesson-header">' +
      '<div class="lesson-header__breadcrumb">' +
      "<span>Phase " +
      phase.number +
      "</span>" +
      '<span aria-hidden="true">/</span>' +
      "<span>" +
      escapeHtml(phase.title) +
      "</span>" +
      "</div>" +
      "<h1>" +
      escapeHtml(topic.title) +
      "</h1>" +
      "</header>"
    );
  }

  function renderSection(section) {
    var bodyHtml = escapeHtml(section.body)
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>");
    var codeHtml = section.code
      ? codeBlock(section.code, section.codeLabel || "Java")
      : "";
    return (
      '<section class="lesson-section">' +
      "<h2>" +
      escapeHtml(section.heading) +
      "</h2>" +
      "<p>" +
      bodyHtml +
      "</p>" +
      codeHtml +
      "</section>"
    );
  }

  function renderWhyItMatters(text) {
    return (
      '<section class="lesson-section">' +
      "<h2>Why it matters</h2>" +
      '<div class="callout">' +
      escapeHtml(text) +
      "</div>" +
      "</section>"
    );
  }

  function renderMistakes(mistakes) {
    if (!mistakes || mistakes.length === 0) return "";
    var items = mistakes
      .map(function (m) {
        return "<li>" + escapeHtml(m) + "</li>";
      })
      .join("");
    return (
      '<section class="lesson-section">' +
      "<h2>Common mistakes &amp; gotchas</h2>" +
      '<div class="callout callout--danger">' +
      '<span class="callout__title">Watch out for these</span>' +
      '<ul style="margin:0;padding-left:1.2em">' +
      items +
      "</ul>" +
      "</div>" +
      "</section>"
    );
  }

  function renderInterview(interview) {
    if (!interview) return "";
    return (
      '<section class="lesson-section">' +
      '<div class="interview-box">' +
      '<span class="interview-box__label">' +
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
      "Interview Angle" +
      "</span>" +
      '<p class="interview-box__q">' +
      escapeHtml(interview.question) +
      "</p>" +
      '<p class="interview-box__a">' +
      escapeHtml(interview.answer) +
      "</p>" +
      "</div>" +
      "</section>"
    );
  }

  function renderSummary(text) {
    if (!text) return "";
    return (
      '<section class="lesson-section">' +
      "<h2>Summary</h2>" +
      '<div class="callout callout--success">' +
      escapeHtml(text) +
      "</div>" +
      "</section>"
    );
  }

  function renderFooter(phase, topic) {
    var hasQuiz = topic.quiz && topic.quiz.length > 0;
    var passed = window.App.progress.isTopicPassed(phase.id, topic.id);
    var qs = window.App.progress.getQuizState(phase.id, topic.id);
    var btnLabel = passed ? "Retake Quiz" : "Mark as Complete & Take Quiz";
    var primary = hasQuiz
      ? '<a class="btn btn--primary btn--lg" href="#/quiz/' +
        phase.id +
        "/" +
        topic.id +
        '">' +
        btnLabel +
        "</a>"
      : '<button class="btn btn--primary btn--lg" disabled title="Quiz coming soon">Quiz coming soon</button>';
    var scoreInfo =
      passed && qs
        ? '<span class="badge badge--passed" style="margin-left:auto">Best ' +
          qs.best +
          "%</span>"
        : "";
    return (
      '<footer class="lesson-footer">' +
      primary +
      '<a class="btn btn--secondary btn--lg" href="#/dashboard">Back to dashboard</a>' +
      scoreInfo +
      "</footer>"
    );
  }

  function renderEmptyLesson(phase, topic) {
    return (
      '<div class="state-box">' +
      '<div class="state-box__icon">' +
      '<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>' +
      "</div>" +
      "<h2>" +
      escapeHtml(topic.title) +
      "</h2>" +
      "<p>This lesson is registered but its content has not been written yet.</p>" +
      '<a class="btn btn--secondary" href="#/dashboard">Back to dashboard</a>' +
      "</div>"
    );
  }

  function render(phaseId, topicId) {
    var phase = window.App.progress.findPhase(phaseId);
    var topic = window.App.progress.findTopic(phaseId, topicId);

    if (!phase || !topic) {
      return (
        '<div class="state-box">' +
        "<h2>Topic not found</h2>" +
        "<p>The lesson you requested does not exist.</p>" +
        '<a class="btn btn--secondary" href="#/dashboard">Back to dashboard</a>' +
        "</div>"
      );
    }

    if (!window.App.progress.isTopicUnlocked(phaseId, topicId)) {
      return (
        '<div class="state-box">' +
        '<div class="state-box__icon">' +
        '<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>' +
        "</div>" +
        "<h2>This topic is locked</h2>" +
        "<p>Pass the previous topic's quiz to unlock this one.</p>" +
        '<a class="btn btn--primary" href="#/dashboard">Back to dashboard</a>' +
        "</div>"
      );
    }

    window.App.progress.setLastVisited(phaseId, topicId);

    var lesson = topic.lesson;
    if (!lesson) return renderEmptyLesson(phase, topic);

    var sectionsHtml = (lesson.sections || []).map(renderSection).join("");

    return (
      '<article class="lesson">' +
      renderLessonHeader(phase, topic) +
      (lesson.intro
        ? '<p style="font-size:1.05rem;color:var(--color-text-muted)">' +
          escapeHtml(lesson.intro) +
          "</p>"
        : "") +
      sectionsHtml +
      renderWhyItMatters(lesson.whyItMatters || "") +
      renderMistakes(lesson.commonMistakes || []) +
      renderInterview(lesson.interviewAngle) +
      renderSummary(lesson.summary) +
      renderFooter(phase, topic) +
      "</article>"
    );
  }

  /* ---------------- Copy button handling ---------------- */

  function initCopyButtons(root) {
    root = root || document;
    root.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-copy-btn]");
      if (!btn) return;
      var targetId = btn.getAttribute("data-copy-target");
      var raw = document.getElementById(targetId + "-raw");
      if (!raw) return;
      var text = raw.value;
      var done = function () {
        btn.classList.add("is-copied");
        var span = btn.querySelector("span");
        var original = span ? span.textContent : "Copy";
        if (span) span.textContent = "Copied!";
        setTimeout(function () {
          btn.classList.remove("is-copied");
          if (span) span.textContent = original;
        }, 1500);
      };
      var fail = function () {
        window.App.ui.toast("Copy failed — select the code manually.");
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(text)
          .then(done)
          .catch(function () {
            // Fallback for file:// contexts where clipboard API may be blocked
            try {
              raw.classList.remove("sr-only");
              raw.select();
              document.execCommand("copy");
              raw.classList.add("sr-only");
              done();
            } catch (err) {
              fail();
            }
          });
      } else {
        try {
          raw.classList.remove("sr-only");
          raw.select();
          document.execCommand("copy");
          raw.classList.add("sr-only");
          done();
        } catch (err) {
          fail();
        }
      }
    });
  }

  window.App.views.lesson = {
    render: render,
    initCopyButtons: initCopyButtons,
    highlightJava: highlightJava,
    codeBlock: codeBlock,
  };
})();
