/*
id: TEAM_31_AOS_V3_UI
team: Team 31
domain: agents_os
artifact: theme-init.js
mandate: TEAM_100_TO_TEAM_31_AOS_V3_UI_MOCKUPS_MANDATE_v2.0.0
date: 2026-03-29
status: ACTIVE
*/
(function () {
  /* Light by default; dark (root tokens) only when AOS domain is explicitly selected. */
  var raw = localStorage.getItem("pipeline_domain");
  var useLight = raw !== "agents_os";
  document.documentElement.classList.toggle("theme-tiktrack", useLight);
})();
