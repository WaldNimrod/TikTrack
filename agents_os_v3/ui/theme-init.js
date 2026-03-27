/*
id: TEAM_31_AOS_V3_UI_MOCKUPS
team: Team 31
domain: agents_os
artifact: theme-init.js
mandate: TEAM_100_TO_TEAM_31_AOS_V3_UI_MOCKUPS_MANDATE_v2.0.0
date: 2026-03-27
status: MOCKUP
*/
(function () {
  var d = localStorage.getItem("pipeline_domain") || "agents_os";
  document.documentElement.classList.toggle("theme-tiktrack", d === "tiktrack");
})();
