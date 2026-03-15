/* pipeline-help.js — Team 61 AOUI LOD400 — Help Modal EN/HE + 4 tabs (TEAM_00_HELP_MODAL_UPGRADE) */

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

function buildHelpContextBanner() {
  const state = (typeof window !== "undefined" && window.pipelineState) || (typeof pipelineState !== "undefined" ? pipelineState : null);
  if (!state || !state.current_gate || state.current_gate === "NOT_STARTED") return "";

  const gate = state.current_gate;
  const lld400 = (state.lld400_content || "").trim();
  const domain = state.project_domain || "";

  let actorText = "";
  if (gate === "GATE_1") {
    actorText = lld400
      ? 'Phase 2 — Paste Team 190 (Codex) mandate → run → <code>./pipeline_run.sh pass</code>'
      : 'Phase 1 — Paste Team 170 (Gemini) mandate → run → <code>./pipeline_run.sh pass</code>';
  } else {
    actorText = 'See "Current Step Banner" above Gate Context for exact next steps.';
  }

  const domainCmd = domain ? `--domain ${domain} ` : "";
  return `
    <div class="help-context-banner">
      📍 <strong>You are at: ${gate}</strong> (domain: ${domain || "—"})
      <div class="help-context-next">${actorText}</div>
      <div class="help-context-cmd">
        <code>./pipeline_run.sh ${domainCmd}pass</code>
        — to advance after AI completes
      </div>
    </div>`;
}

function showHelpTab(name) {
  document.querySelectorAll(".help-tab-content").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".help-tab-btn").forEach(el => el.classList.remove("active"));
  const tab = document.getElementById("help-tab-" + name);
  const btn = document.querySelector(".help-tab-btn[data-tab=\"" + name + "\"]");
  if (tab) tab.classList.add("active");
  if (btn) btn.classList.add("active");
  try { localStorage.setItem("help_active_tab", name); } catch (e) {}
}

function toggleHelp() {
  const modal = document.getElementById("help-modal");
  if (!modal) return;
  modal.classList.toggle("open");
  if (modal.classList.contains("open")) {
    applyLang(localStorage.getItem("pipeline_dashboard_lang") || "en");
    const lastTab = localStorage.getItem("help_active_tab") || "start";
    showHelpTab(lastTab);
    const zone = document.getElementById("help-context-zone");
    if (zone) zone.innerHTML = buildHelpContextBanner();
  }
}

function closeHelpOutside(e) {
  if (e.target === document.getElementById("help-modal")) toggleHelp();
}
