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
    { icon: "📁", label: "cd to repo",         text: "cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix" },
    { icon: "⚡", label: "Generate prompt",    text: (`./pipeline_run.sh ${df}`).trimEnd() },
    { icon: "✅", label: "Advance → PASS",     text: `./pipeline_run.sh ${df}pass` },
    { icon: "❌", label: "Advance → FAIL",     text: `./pipeline_run.sh ${df}fail "reason"` },
    { icon: "📝", label: "Route → doc fix",    text: `./pipeline_run.sh ${df}route doc "doc/gov issue only"` },
    { icon: "🔄", label: "Route → full cycle", text: `./pipeline_run.sh ${df}route full "code/design issues"` },
    { icon: "👤", label: "Approve gate",       text: `./pipeline_run.sh ${df}approve` },
    { icon: "📊", label: "Show status",        text: `./pipeline_run.sh ${df}status` },
    { icon: "🗂️", label: "Regen prompt",      text: `./pipeline_run.sh ${df}gate ${currentGate || "GATE_X"}` },
    { icon: "↩️", label: "G3_5 revise",        text: `./pipeline_run.sh ${df}revise "BLOCKER-1: ..."` },
    { icon: "🌐", label: "Both pipelines",      text: "./pipeline_run.sh domain" },
  ];
  const el = document.getElementById("sidebar-cmd-list");
  if (!el) return;
  el.innerHTML = cmds.map(c =>
    `<div class="sidebar-cmd-row" title="${escHtml(c.text)}">
      <span class="sidebar-cmd-icon">${c.icon}</span>
      <span class="sidebar-cmd-label">${escHtml(c.label)}</span>
      <button class="btn sidebar-cmd-btn" onclick="copyCmd(${escAttr(JSON.stringify(c.text))}, this)">⎘</button>
    </div>`
  ).join("");
}
