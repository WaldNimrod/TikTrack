/* pipeline-booster.js — Team 61 AOUI LOD400 — Governance Booster panel */

let boosterType = "reinforce";

function _getBoosterTeam() {
  // 1. Try to derive team from the active mandate tab label (e.g. "Team 170 (Phase 1)" → "team_170")
  if (typeof activeTeam === "string" && activeTeam) {
    const m = activeTeam.match(/\bTeam\s+(\d+)/i);
    if (m) {
      const key  = 'team_' + m[1];
      const data = BOOSTER_TEAM_DATA[key];
      if (data) return data;
    }
  }
  // 2. Fallback: gate owner
  if (!pipelineState) return null;
  const owner = getDomainOwner(pipelineState.current_gate);
  return BOOSTER_TEAM_DATA[owner] || null;
}

function toggleBooster(on) {
  const opts = document.getElementById("booster-options");
  if (!opts) return;
  opts.style.display = on ? "block" : "none";
  if (on) {
    const team = _getBoosterTeam();
    const hint = team ? `(${team.label} — ${team.name})` : "(unknown team)";
    const hintEl = document.getElementById("booster-team-hint");
    if (hintEl) hintEl.textContent = hint;
    updateBoosterPreview();
  }
}

function selectBoosterType(type, el) {
  boosterType = type;
  document.querySelectorAll(".booster-tab").forEach(t => t.classList.remove("active"));
  if (el) el.classList.add("active");
  updateBoosterPreview();
}

function buildBoosterText(team, type) {
  if (!team) return "(team data not available — select team on Teams page)";
  const today = new Date().toISOString().split("T")[0];
  const wp = pipelineState?.work_package_id || "—";
  const gate = pipelineState?.current_gate || "—";
  const stage = pipelineState?.stage_id || "—";
  const irons = team.isoRules.map(r => `  - ${r}`).join("\n");
  const writes = team.writesTo.join(", ");

  switch (type) {
    case "reinforce":
      return `╔══════════════════════════════════════════════════════════════╗\n║  IDENTITY REINFORCEMENT — ${(team.label + " — " + team.name).substring(0, 33).padEnd(33)} ║\n╚══════════════════════════════════════════════════════════════╝\n\nREMINDER: You are ${team.label} — ${team.name}.\n\nCurrently working on:\n  WP:   ${wp}\n  Gate: ${gate}\n\nDo NOT drift into other teams' roles.\nDo NOT modify files outside your writing authority.\nWriting authority: ${writes}\n\nIron Rules:\n${irons}\n\nContinue the task above without deviation. Do NOT re-introduce yourself.`;

    case "governance":
      return `╔══════════════════════════════════════════════════════════════╗\n║  GOVERNANCE REMINDER — ${(team.label + " — " + team.name).substring(0, 36).padEnd(36)} ║\n╚══════════════════════════════════════════════════════════════╝\n\n${team.label} — ${team.name} — governance compliance check.\n\n## SSM / Iron Rules (mandatory)\n\n  - maskedLog mandatory on ALL server-side logging\n  - NUMERIC(20,8) for all financial / monetary data\n  - 4-state status model: pending / active / inactive / cancelled\n  - collapsible-container Iron Rule: ALL pages use this template\n  - Do NOT modify SSM, WSM, canonical governance docs\n  - Do NOT write to other teams' folders\n\n## This team's Iron Rules\n\n${irons}\n\n## Writing authority\n\nYou write ONLY to: ${writes}\n\nWP: ${wp} | Gate: ${gate} | Stage: ${stage}\n\nGovernance reminder delivered. ${team.label} context locked.`;

    case "reset":
      return `╔══════════════════════════════════════════════════════════════╗\n║  FULL RESET — ${(team.label + " — " + team.name).substring(0, 46).padEnd(46)} ║\n╚══════════════════════════════════════════════════════════════╝\n\nYou are starting a new session as ${team.label} — ${team.name}.\n\n## Identity\nTeam: ${team.label}\nName: ${team.name}\n\n## Writing Authority\nYou write ONLY to: ${writes}\nDo NOT modify SSM, WSM, canonical governance docs, or other teams' folders.\n\n## Iron Rules\n\n${irons}\n  - Identity header mandatory on ALL outputs\n  - Do NOT drift into other teams' roles\n\n## Current Pipeline Context\nWP:    ${wp}\nGate:  ${gate}\nStage: ${stage}\nDate:  ${today}\n\n---\nLocked. ${team.label} (${team.name}) context adopted.`;

    default:
      return "";
  }
}

function updateBoosterPreview() {
  const preview = document.getElementById("booster-preview");
  if (!preview) return;
  const team = _getBoosterTeam();
  preview.textContent = buildBoosterText(team, boosterType);
}
