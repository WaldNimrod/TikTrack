/*
id: TEAM_31_AOS_V3_UI
team: Team 31
artifact: api-client.js
purpose: GATE_4 live API — base URL, X-Actor-Team-Id, fetch helpers
date: 2026-03-28
*/
(function (global) {
  "use strict";

  var LS_ACTOR = "aosv3_actor_team_id";
  var LS_BASE = "aosv3_api_base";

  function readMeta(name) {
    var m = document.querySelector('meta[name="' + name + '"]');
    return m ? m.getAttribute("content") : null;
  }

  function getApiBase() {
    var b =
      global.__AOSV3_API_BASE__ ||
      readMeta("aosv3-api-base") ||
      (typeof localStorage !== "undefined" && localStorage.getItem(LS_BASE)) ||
      "http://127.0.0.1:8090";
    return String(b).replace(/\/+$/, "");
  }

  function setApiBase(base) {
    if (typeof localStorage === "undefined") return;
    if (base == null || base === "") localStorage.removeItem(LS_BASE);
    else localStorage.setItem(LS_BASE, String(base).replace(/\/+$/, ""));
  }

  function getActorTeamId() {
    try {
      var a =
        readMeta("aosv3-actor-team-id") ||
        (typeof localStorage !== "undefined" && localStorage.getItem(LS_ACTOR));
      if (a && String(a).trim()) return String(a).trim();
    } catch (e) {
      /* ignore */
    }
    return "team_61";
  }

  function setActorTeamId(teamId) {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(LS_ACTOR, String(teamId || "").trim());
  }

  function apiFetch(path, options) {
    var base = getApiBase();
    var url = path.indexOf("http") === 0 ? path : base + path;
    var opt = options || {};
    var headers = Object.assign({}, opt.headers || {});
    if (!opt.skipActorHeader) {
      headers["X-Actor-Team-Id"] = getActorTeamId();
    }
    if (
      opt.body != null &&
      typeof opt.body === "string" &&
      !headers["Content-Type"]
    ) {
      headers["Content-Type"] = "application/json";
    }
    return fetch(url, Object.assign({}, opt, { headers: headers }));
  }

  function parseErrorBody(text) {
    if (!text) return text;
    try {
      return JSON.parse(text);
    } catch (e) {
      return { message: text };
    }
  }

  function apiJson(path, options) {
    var opt = options || {};
    return apiFetch(path, opt).then(function (r) {
      return r.text().then(function (text) {
        var data = text ? parseErrorBody(text) : null;
        if (!r.ok) {
          var msg = r.statusText || "HTTP " + r.status;
          if (data && data.detail) {
            var d = data.detail;
            if (typeof d === "string") msg = d;
            else if (d && typeof d === "object" && d.message) msg = d.message;
            else if (d && typeof d === "object" && d.code)
              msg = String(d.code) + ": " + (d.message || JSON.stringify(d));
          } else if (data && data.message) msg = data.message;
          var err = new Error(msg);
          err.status = r.status;
          err.body = data;
          throw err;
        }
        return data;
      });
    });
  }

  function buildEventStreamUrl(params) {
    var q = new URLSearchParams();
    if (params && params.run_id) q.set("run_id", params.run_id);
    if (params && params.domain_id) q.set("domain_id", params.domain_id);
    return getApiBase() + "/api/events/stream?" + q.toString();
  }

  global.AOSV3_getApiBase = getApiBase;
  global.AOSV3_setApiBase = setApiBase;
  global.AOSV3_getActorTeamId = getActorTeamId;
  global.AOSV3_setActorTeamId = setActorTeamId;
  global.AOSV3_apiFetch = apiFetch;
  global.AOSV3_apiJson = apiJson;
  global.AOSV3_buildEventStreamUrl = buildEventStreamUrl;
})(typeof window !== "undefined" ? window : globalThis);
