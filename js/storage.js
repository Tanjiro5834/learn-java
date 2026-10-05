/* ============================================================
   storage.js — localStorage wrapper with try/catch
   Exposes window.App.storage
   ============================================================ */
(function () {
  "use strict";

  window.App = window.App || {};

  var PREFIX = "javapath.";

  function safeGet(key) {
    try {
      return window.localStorage.getItem(PREFIX + key);
    } catch (e) {
      return null;
    }
  }

  function safeSet(key, value) {
    try {
      window.localStorage.setItem(PREFIX + key, value);
      return true;
    } catch (e) {
      return false;
    }
  }

  function safeRemove(key) {
    try {
      window.localStorage.removeItem(PREFIX + key);
      return true;
    } catch (e) {
      return false;
    }
  }

  function getJSON(key, fallback) {
    var raw = safeGet(key);
    if (raw === null || raw === undefined) return fallback;
    try {
      var parsed = JSON.parse(raw);
      return parsed === null || parsed === undefined ? fallback : parsed;
    } catch (e) {
      return fallback;
    }
  }

  function setJSON(key, value) {
    try {
      return safeSet(key, JSON.stringify(value));
    } catch (e) {
      return false;
    }
  }

  window.App.storage = {
    get: safeGet,
    set: safeSet,
    remove: safeRemove,
    getJSON: getJSON,
    setJSON: setJSON,
    clearAll: function () {
      var keysToRemove = [];
      try {
        for (var i = 0; i < window.localStorage.length; i++) {
          var k = window.localStorage.key(i);
          if (k && k.indexOf(PREFIX) === 0) keysToRemove.push(k);
        }
        keysToRemove.forEach(function (k) {
          try {
            window.localStorage.removeItem(k);
          } catch (e) {}
        });
        return true;
      } catch (e) {
        return false;
      }
    },
  };
})();
