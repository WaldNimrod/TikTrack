/* pipeline-help.js — Team 61 AOUI LOD400 — Help Modal EN/HE */

function toggleLang() {
  const current = localStorage.getItem("pipeline_dashboard_lang") || "en";
  const next = current === "en" ? "he" : "en";
  localStorage.setItem("pipeline_dashboard_lang", next);
  applyLang(next);
}

function applyLang(lang) {
  document.querySelectorAll(".lang-en").forEach(el => { el.style.display = lang === "en" ? "" : "none"; });
  document.querySelectorAll(".lang-he").forEach(el => { el.style.display = lang === "he" ? "" : "none"; });
  const btn = document.getElementById("lang-toggle-btn");
  if (btn) btn.textContent = "🌐 " + (lang === "en" ? "EN" : "HE");
}

function toggleHelp() {
  const modal = document.getElementById("help-modal");
  if (!modal) return;
  modal.classList.toggle("open");
  if (modal.classList.contains("open")) {
    applyLang(localStorage.getItem("pipeline_dashboard_lang") || "en");
  }
}

function closeHelpOutside(e) {
  if (e.target === document.getElementById("help-modal")) toggleHelp();
}
