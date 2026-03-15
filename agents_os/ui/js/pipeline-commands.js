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

/** S002-P005-WP002: Prompt for override reason, then copy override command to clipboard */
function copyOverrideWithReason(domainFlag, btn) {
  const r = prompt("Override reason (required):");
  if (!r || !r.trim()) return;
  const cmd = (domainFlag || "") + './pipeline_run.sh override "' + r.trim().replace(/"/g, '\\"') + '"';
  copyCmd(cmd, btn);
}

/* Command help text for ? modal */
const CMD_HELP = {
  "cd to repo": "Changes working directory to the repository root. Run this first in a new terminal before any pipeline commands.",
  "Generate prompt": "Outputs the 4-layer prompt for the current gate. Paste the ▼▼▼ block into the AI tool shown in the Current Step Banner (Cursor/Gemini/Codex).",
  "Advance → PASS": "Marks the current gate as passed and advances to the next gate. Run only after the gate actor has completed their work.",
  "Advance → FAIL": "Marks the current gate as failed with a reason. Use when blocking issues require remediation before re-validation.",
  "Route → doc fix": "Routes to a doc-only fix path: document governance or format issues that do not require code changes.",
  "Route → full cycle": "Routes to full revision: code or design issues that require rework and re-QA.",
  "Approve gate": "Human approval for GATE_2 (intent), GATE_6 (architectural), or GATE_7 (UX). Confirms \"yes, proceed\".",
  "Show status": "Displays current pipeline state only: WP, gate, domain. No side effects.",
  "Regen prompt": "Generates prompt for a specific gate (e.g. GATE_4, G3_PLAN). Use when you need a different gate's prompt.",
  "G3_5 revise": "Revise work plan after G3_5 BLOCK. Include blocker IDs and descriptions. Pipeline clears lld400 if needed.",
  "Both pipelines": "Shows domain overview when both agents_os and tiktrack pipelines are active. Helps resolve DOMAIN AMBIGUOUS.",
  "Submit idea": "Registers a new idea in PHOENIX_IDEA_LOG. Required: --title, --domain, --urgency, --team. Optional: --reference, --notes.",
  "Scan ideas": "Startup check for Idea Pipeline: validates log, counts by status, flags missing delivery_ref.",
};

var _lastBuiltCmds = [];

function showCmdHelp(idx) {
  const cmd = _lastBuiltCmds[idx];
  if (!cmd) return;
  const modal = document.getElementById("cmd-help-modal");
  const title = document.getElementById("cmd-help-title");
  const pre = document.getElementById("cmd-help-command");
  const detail = document.getElementById("cmd-help-detail");
  if (!modal || !title || !pre || !detail) return;
  title.textContent = cmd.icon + " " + cmd.label;
  pre.textContent = cmd.text;
  detail.textContent = CMD_HELP[cmd.label] || cmd.desc;
  modal.classList.add("open");
}

function closeCmdHelp() {
  const modal = document.getElementById("cmd-help-modal");
  if (modal) modal.classList.remove("open");
}

window.closeCmdHelp = closeCmdHelp;

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
    { icon: "💡", label: "Submit idea",       desc: "Register new idea in pipeline", text: './idea_submit.sh --title "..." --domain agents_os --urgency high --team team_XX\n# Optional: --reference "path/to/context.md" --notes "Context..."' },
    { icon: "🔍", label: "Scan ideas",        desc: "Idea pipeline startup check",   text: "./idea_scan.sh --summary" },
  ];
  _lastBuiltCmds = cmds;
  // Sidebar: Quick Commands — all commands with copy, tooltip (title), and ? help
  const sidebarEl = document.getElementById("sidebar-cmd-list");
  if (sidebarEl) {
    sidebarEl.innerHTML = cmds.map((c, i) =>
      `<div class="sidebar-cmd-row" title="${escHtml(c.text.replace(/\n/g, " "))}">
        <span class="sidebar-cmd-icon">${c.icon}</span>
        <span class="sidebar-cmd-label">${escHtml(c.label)}</span>
        <button class="btn sidebar-cmd-btn" onclick="copyCmd(${escAttr(JSON.stringify(c.text))}, this)" title="Copy command">⎘</button>
        <button class="btn sidebar-cmd-help-btn" onclick="showCmdHelp(${i})" title="Command help">?</button>
      </div>`
    ).join("");
  }
}
