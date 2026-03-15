/* pipeline-commands.js — Team 61 AOUI LOD400 — clipboard and command builders */

function copyText(text, btn) {
  if (!navigator.clipboard) return;
  navigator.clipboard.writeText(text || "").then(() => {
    if (btn) {
      btn.classList.add("copy-flash");
      const orig = btn.textContent;
      btn.textContent = "✓ Copied!";
      setTimeout(() => {
        btn.classList.remove("copy-flash");
        btn.textContent = orig;
      }, 1500);
    }
  });
}

function copyPrompt() {
  let text = typeof currentPromptText !== "undefined" ? currentPromptText : "";
  const boosterOn = document.getElementById("booster-toggle")?.checked;
  if (boosterOn && typeof _getBoosterTeam === "function" && typeof buildBoosterText === "function" && typeof boosterType !== "undefined") {
    const team = _getBoosterTeam();
    const booster = buildBoosterText(team, boosterType);
    if (booster) text = text + "\n\n---\n\n" + booster;
  }
  copyText(text, document.getElementById("copy-prompt-btn"));
}

function copyCmd(text, btn) {
  copyText(text, btn);
}

function buildCommands(currentGate) {
  const df = typeof getDomainFlag === "function" ? getDomainFlag() : "";
  const cmds = [
    { icon: "📁", label: "cd to repo",         desc: "Change to repo root",           text: "cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix" },
    { icon: "⚡", label: "Generate prompt",    desc: "Display current gate prompt",    text: (`./pipeline_run.sh ${df}`).trimEnd() },
    { icon: "✅", label: "Advance → PASS",    desc: "Pass current gate",             text: `./pipeline_run.sh ${df}pass` },
    { icon: "❌", label: "Advance → FAIL",    desc: "Fail with reason",              text: `./pipeline_run.sh ${df}fail "reason"` },
    { icon: "📝", label: "Route → doc fix",   desc: "Doc-only fix path",             text: `./pipeline_run.sh ${df}route doc "doc/gov issue only"` },
    { icon: "🔄", label: "Route → full cycle",desc: "Full revision path",             text: `./pipeline_run.sh ${df}route full "code/design issues"` },
    { icon: "👤", label: "Approve gate",      desc: "Human approval (G2/G6/G7)",     text: `./pipeline_run.sh ${df}approve` },
    { icon: "📊", label: "Show status",       desc: "Current pipeline state",        text: `./pipeline_run.sh ${df}status` },
    { icon: "🗂️", label: "Regen prompt",     desc: "Prompt for specific gate",      text: `./pipeline_run.sh ${df}gate ${currentGate || "GATE_X"}` },
    { icon: "↩️", label: "G3_5 revise",       desc: "Revise work plan (blockers)",     text: `./pipeline_run.sh ${df}revise "BLOCKER-1: ..."` },
    { icon: "🌐", label: "Both pipelines",    desc: "Domain overview",              text: "./pipeline_run.sh domain" },
  ];
  // Sidebar compact list
  const sidebarEl = document.getElementById("sidebar-cmd-list");
  if (sidebarEl) {
    sidebarEl.innerHTML = cmds.map(c =>
      `<div class="sidebar-cmd-row" title="${escHtml(c.text)}">
        <span class="sidebar-cmd-icon">${c.icon}</span>
        <span class="sidebar-cmd-label">${escHtml(c.label)}</span>
        <button class="btn sidebar-cmd-btn" onclick="copyCmd(${escAttr(JSON.stringify(c.text))}, this)">⎘</button>
      </div>`
    ).join("");
  }
  // Main content: rich command list with full script visible
  const mainEl = document.getElementById("main-cmd-list");
  if (mainEl) {
    mainEl.innerHTML = cmds.map(c =>
      `<div class="cmd-row">
        <span class="cmd-desc">${c.icon} ${escHtml(c.label)}</span>
        <span class="cmd-text">${escHtml(c.text)}</span>
        <button class="btn cmd-copy" onclick="copyCmd(${escAttr(JSON.stringify(c.text))}, this)">⎘ Copy → terminal</button>
      </div>`
    ).join("");
  }
  const badge = document.getElementById("terminal-cmds-badge");
  if (badge) badge.textContent = cmds.length + " commands";
}
