/* pipeline-teams.js — Team 61 AOUI LOD400 — Teams page logic (uses pipeline-state, pipeline-dom) */

// ── Team groups (display order + labels) — reusable for filtering, reports, etc. ──
const TEAM_GROUPS = [
  { id: "architects",    label: "Architects",    teamIds: ["team_00", "team_100", "team_101"] },
  { id: "validation",    label: "Validation",    teamIds: ["team_90", "team_190"] },
  { id: "execution",     label: "Execution",     teamIds: ["team_10", "team_20", "team_30", "team_40", "team_50", "team_60", "team_51", "team_61"] },
  { id: "documentation", label: "Documentation",  teamIds: ["team_70", "team_170"] },
  { id: "specialists",    label: "Specialists",   teamIds: ["team_31", "team_191"] },
];

// ── Canonical team roster (source: TEAMS_ROSTER_v1.0.0.json + ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v1.0.0.md) ─────
const TEAMS = [
  { id: "team_00", group: "architects", label: "Team 00", name: "Principal & Chief Architect", engine: "claude-code", domain: "multi",
    role: "Dual-nature: (A) Product Principal — defines WHAT and WHY, gives requirements; (B) Constitutional Architect — sets all Iron Rules, holds final approval at GATE_7",
    responsibilities: ["Define product vision and requirements — WHAT and WHY", "Set all Iron Rules (constitutional layer, cannot delegate)", "GATE_7: Personal browser sign-off on UX/product vision", "Override power at any gate if constitutional issue detected", "Maintain team constitution and document priority map"],
    writesTo: ["../../_COMMUNICATION/team_00/", "../../_COMMUNICATION/_Architects_Decisions/"], governedBy: ["CLAUDE.md", "PHOENIX_MASTER_SSM_v1.0.0.md", "03_IRON_RULES_AND_GOVERNANCE_CONSTITUTION.md"],
    isoRules: ["No guessing — read the file first", "GATE_7 requires personal Nimrod browser approval — cannot delegate", "All Iron Rules are set by Team 00 — no other team can modify them", "Writing authority: team_00/ and _Architects_Decisions/ ONLY", "Advisory role: present alternatives and well-founded opinions — NOT sycophancy, NOT unfounded assumptions"] },
  { id: "team_10", group: "execution", label: "Team 10", name: "Execution Orchestrator", engine: "cursor", domain: "tiktrack",
    role: "Gateway — Execution lead, team activation, gate submissions, WSM updates",
    responsibilities: ["Produce and maintain the Work Plan (G3_PLAN)", "Activate and coordinate Teams 20, 30, 40, 50", "Submit gate artifacts to Team 90 for validation", "Update WSM after each gate pass", "Manage carryover lists and level-2 registries"],
    writesTo: ["../../_COMMUNICATION/team_10/"], governedBy: ["SSM v1.0.0", "TEAM_ROSTER_LOCK", "PHOENIX_MASTER_WSM"],
    isoRules: ["No gate submission without all artifacts", "Work plan must be versioned", "Identity header mandatory on all outputs"] },
  { id: "team_20", group: "execution", label: "Team 20", name: "Backend Implementation", engine: "cursor", domain: "tiktrack",
    role: "API, logic, DB, services, runtime — backend execution only",
    responsibilities: ["Implement backend API endpoints (FastAPI, port 8082, /api/v1/ prefix)", "Write migrations and ORM models", "Verify API contracts against LLD400 spec", "Output verification report to _COMMUNICATION/team_20/"],
    writesTo: ["../../_COMMUNICATION/team_20/"], governedBy: ["SSM v1.0.0", "TEAM_ROSTER_LOCK"],
    isoRules: ["maskedLog mandatory on all server-side logging", "NUMERIC(20,8) for financial data", "4-state status model (pending/active/inactive/cancelled)"] },
  { id: "team_30", group: "execution", label: "Team 30", name: "Frontend Implementation", engine: "cursor", domain: "tiktrack",
    role: "Components, pages, API integration, client-side logic",
    responsibilities: ["Implement frontend pages and components (port 8080)", "Integrate with backend APIs per LLD400 contract", "Apply collapsible-container Iron Rule to all pages", "Run MCP browser verification after implementation"],
    writesTo: ["../../_COMMUNICATION/team_30/"], governedBy: ["SSM v1.0.0", "TEAM_ROSTER_LOCK"],
    isoRules: ["collapsible-container Iron Rule on ALL pages", "maskedLog mandatory", "Rich text: ONE unified object (no per-entity customization)"] },
  { id: "team_31", group: "specialists", label: "Team 31", name: "Blueprint Maker", engine: "cursor", domain: "tiktrack",
    role: "Visual Blueprint production (HTML/CSS static only) — structural design templates for TikTrack pages and modules. Outside main gate pipeline. Mode: Manual → Semi-auto (roadmap).",
    responsibilities: [
      "Produce *_BLUEPRINT.html files (HTML/CSS only, mock data) for TikTrack pages",
      "Build in sandbox: _COMMUNICATION/team_31/team_31_staging/sandbox_v2/",
      "Maintain sandbox index.html — status row per Blueprint",
      "Receive mandates from Team 00 or Team 10; scope-lock before building",
      "Deliver via Team 10 Gateway → Team 30/40 for implementation",
      "Use D15_PAGE_TEMPLATE_V3.html as base (locked, final)"
    ],
    writesTo: ["../../_COMMUNICATION/team_31/team_31_staging/sandbox_v2/", "../../_COMMUNICATION/team_31/"],
    governedBy: ["TEAM_00_TO_TEAM_31_ACTIVATION_PROMPT_v1.0.0.md", "TT2_BLUEPRINT_HANDOFF_REQUIREMENTS.md", "TEAM_ROSTER_LOCK"],
    isoRules: [
      "HTML/CSS ONLY — no JavaScript inside Blueprint HTML, no inline styles (Iron Rule)",
      "Clean Slate: data-action for interactive hooks; data-state for state variants",
      "Design Tokens SSOT: phoenix-base.css variables only — no hardcoded colors/fonts",
      "LEGO system: tt-container > tt-section > tt-section-row > components",
      "Fluid Design: clamp/min/max/Grid — avoid Media Queries",
      "Mock data only — field names sourced from TT2_PAGES_SSOT_MASTER_LIST (never invented)",
      "Blueprint = visual reference, NOT spec authority (LLD400 is the contract)",
      "Update sandbox index.html for every new Blueprint",
      "NOT in gate pipeline — does not submit to GATE_0 or any standard gate",
      "Handoff via Team 10 Gateway — not directly to Team 30/40"
    ] },
  { id: "team_40", group: "execution", label: "Team 40", name: "UI Assets & Design", engine: "cursor", domain: "tiktrack",
    role: "Design tokens, CSS, visual consistency, UI assets — NO QA, NO testing",
    responsibilities: ["Maintain design tokens and CSS variables", "Ensure visual consistency across pages", "Produce UI asset specifications"],
    writesTo: ["../../_COMMUNICATION/team_40/"], governedBy: ["SSM v1.0.0", "TEAM_ROSTER_LOCK"],
    isoRules: ["Team 40 = UI Assets ONLY (Iron Rule)", "No testing, no QA — that is Team 50", "FAV = QA activity → route to Team 50"] },
  { id: "team_50", group: "execution", label: "Team 50", name: "QA & Functional Acceptance", engine: "cursor", domain: "tiktrack",
    role: "Test scripts, E2E suites, regression, FAV, SOP-013 seals",
    responsibilities: ["Write and execute E2E test suites (Selenium, tests/ dir)", "Produce QA reports with pass/fail evidence", "SOP-013 seals — formal QA acceptance", "FAV (Functional Acceptance Verification)"],
    writesTo: ["../../_COMMUNICATION/team_50/"], governedBy: ["SSM v1.0.0", "TEAM_ROSTER_LOCK", "SOP-013"],
    isoRules: ["Team 50 = QA (Iron Rule) — includes test scripts, E2E, FAV", "GATE_4 requires PASS evidence: commands + outputs + exit codes"] },
  { id: "team_60", group: "execution", label: "Team 60", name: "DevOps & Platform", engine: "cursor", domain: "tiktrack",
    role: "Infrastructure, runtimes, CI/CD, platform readiness",
    responsibilities: ["CI/CD pipeline configuration", "Runtime infrastructure and environment setup", "Platform readiness checks"],
    writesTo: ["../../_COMMUNICATION/team_60/"], governedBy: ["SSM v1.0.0", "TEAM_ROSTER_LOCK"],
    isoRules: ["Infrastructure changes require Team 00 approval", "No production deployments without GATE_7 pass"] },
  { id: "team_70", group: "documentation", label: "Team 70", name: "Documentation", engine: "codex", domain: "tiktrack",
    role: "Technical writing, knowledge promotion, AS_MADE_REPORT",
    responsibilities: ["Write and maintain technical documentation", "Produce AS_MADE_REPORT at GATE_8", "Update canonical governance docs (under Team 00 direction)", "Knowledge base maintenance"],
    writesTo: ["../../_COMMUNICATION/team_70/"], governedBy: ["SSM v1.0.0", "TEAM_ROSTER_LOCK"],
    isoRules: ["All docs require identity header", "AS_MADE_REPORT mandatory at GATE_8", "Do NOT modify SSM/WSM without Team 00 instruction"] },
  { id: "team_90", group: "validation", label: "Team 90", name: "Dev Validator", engine: "codex", domain: "multi",
    role: "GATE_5–GATE_8 validation, blocking reports, route_recommendation",
    responsibilities: ["Perform fresh validation at GATE_5, G3_5, GATE_6, GATE_8", "Produce BLOCKING_REPORT with BF-Gx-NNN format findings", "Declare route_recommendation: doc or full in every BLOCKING_REPORT", "Verify previous blockers are resolved before re-run"],
    writesTo: ["../../_COMMUNICATION/team_90/"], governedBy: ["SSM v1.0.0", "TEAM_ROSTER_LOCK"],
    isoRules: ["CRITICAL: Every GATE_5 run MUST be a FRESH validation — never repeat prior findings", "route_recommendation MANDATORY in every BLOCKING_REPORT", "Do NOT return template or placeholder responses", "Identity header mandatory on all outputs"] },
  { id: "team_100", group: "architects", label: "Team 100", name: "AOS Domain Architects", engine: "codex", domain: "agents_os",
    role: "Primary architectural authority for Agents_OS domain — under Team 00 authority; hands-on direction to Team 61",
    responsibilities: ["GATE_2: Approve or reject architectural intent for AOS domain (delegated from Team 00)", "GATE_6: Reality vs intent — does built match approved? (AOS domain)", "Author LOD200 and LOD400 for all AOS programs", "Issue mandates to Team 61 (implementation) and Team 51 (QA)", "Route decisions upward to Team 00 for constitutional-level rulings"],
    writesTo: ["../../_COMMUNICATION/team_100/"], governedBy: ["SSM v1.0.0", "TEAM_ROSTER_LOCK", "CLAUDE.md Team 00 authority"],
    isoRules: ["GATE_6 approval requires explicit evidence review", "route_recommendation mandatory if REJECTED", "LOD400 must be fully specified before issuing to Team 61", "Never issue mandates without Nimrod context or Team 00 strategic alignment"] },
  { id: "team_101", group: "architects", label: "Team 101", name: "IDE Architecture Authority", engine: "cursor", domain: "multi",
    role: "Planner, Spec-Writer, and Approver for IDE parallel tracks.",
    responsibilities: ["Analyze local codebase", "Generate canonical Specs (LOD400)", "Validate Team 61 work post-execution"],
    writesTo: ["../../_COMMUNICATION/team_101/"], governedBy: ["team_101.md", "SSM v1.0.0"],
    isoRules: ["LOD400 must be fully specified before issuing to Team 61", "IDE spec authority under Team 00/100 oversight"] },
  { id: "team_170", group: "documentation", label: "Team 170", name: "Spec & Governance", engine: "codex", domain: "multi",
    role: "Canonical document maintenance, LOD200/LOD400, registry updates",
    responsibilities: ["Produce LLD400 (GATE_1)", "Maintain PROGRAM_REGISTRY and PORTFOLIO_ROADMAP", "DDL V2.x updates (KB-001..016)", "SSOT corrections and roadmap amendments"],
    writesTo: ["../../_COMMUNICATION/team_170/"], governedBy: ["SSM v1.0.0", "TEAM_ROSTER_LOCK", "PHOENIX_PORTFOLIO_ROADMAP"],
    isoRules: ["DDL is documentation only — production DB is source of truth", "Registry updates require Team 00 awareness"] },
  { id: "team_190", group: "validation", label: "Team 190", name: "Constitutional Validator", engine: "codex", domain: "multi",
    role: "Architectural integrity, GATE_0–GATE_2 validation",
    responsibilities: ["GATE_0: Scope validation — constitutional compliance check", "GATE_1: LLD400 validation — all mandatory sections present", "Constitutional integrity guard for all gate entries"],
    writesTo: ["../../_COMMUNICATION/team_190/"], governedBy: ["SSM v1.0.0", "TEAM_ROSTER_LOCK"],
    isoRules: ["GATE_0 BLOCK stops all downstream work — absolute rule", "Identity header mandatory", "route_recommendation mandatory in all BLOCK reports"] },

  // ── Agents_OS–domain teams (registered 2026-03-15) ──────────────────────
  { id: "team_51", group: "execution", label: "Team 51", name: "AOS QA & Functional Acceptance", engine: "cursor", domain: "agents_os",
    role: "QA & FAV for Agents_OS domain — mirrors Team 50 but scoped to AOS work",
    responsibilities: ["Write and execute QA test plans for AOS UI and pipeline tooling changes", "Produce QA reports with pass/fail evidence", "Submit to Team 190 for architectural re-validation after QA pass", "Functional acceptance verification for AOS deliverables"],
    writesTo: ["../../_COMMUNICATION/team_51/"], governedBy: ["SSM v1.0.0", "TEAM_ROSTER_LOCK", "SOP-013"],
    isoRules: ["Team 51 = QA for AOS domain (Iron Rule)", "Every QA run must be a FRESH test — never repeat prior findings without re-execution", "GATE_4 QA evidence required: commands + outputs + exit codes"] },

  { id: "team_61", group: "execution", label: "Team 61", name: "AOS Local Cursor Implementation", engine: "cursor", domain: "agents_os",
    role: "Local cursor-driven implementation of Agents_OS UI and pipeline tooling",
    responsibilities: ["Implement AOS UI pages (PIPELINE_DASHBOARD, PIPELINE_ROADMAP, PIPELINE_TEAMS)", "CSS/JS extraction and modularization per LOD400 work packages", "Run preflight URL tests and browser evidence checks before submitting", "Submit completed work to Team 51 for QA"],
    writesTo: ["../../_COMMUNICATION/team_61/"], governedBy: ["SSM v1.0.0", "TEAM_ROSTER_LOCK"],
    isoRules: ["Classic <script src> only — no ES modules (Iron Rule)", "All HTML pages must use agents-page-layout + agents-header contract", "No inline <style> or <script> blocks in final deliverables", "Preflight URL test mandatory before QA submission"] },

  { id: "team_191", group: "specialists", label: "Team 191", name: "Git-Governance Lane", engine: "cursor", domain: "multi",
    role: "Operational git-governance — pre-push guard triage, header normalization, registry sync. Child of Team 190.",
    responsibilities: ["Pre-push guard triage and remediation (DATE-LINT, SYNC CHECK, SNAPSHOT CHECK)", "Date/header normalization for governance/communication markdown", "Registry/WSM mirror standardization via canonical sync scripts", "Snapshot refresh and re-check sequencing", "Clean-tree enforcement and drift reporting"],
    writesTo: ["../../_COMMUNICATION/team_191/"], governedBy: ["SSM v1.0.0", "TEAM_ROSTER_LOCK", "TEAM_191_INTERNAL_WORK_PROCEDURE_v1.0.0"],
    isoRules: ["No constitutional gate verdicts — that is Team 190", "No architectural rulings — that is Team 00/100", "No business-logic changes under a Git fix mandate", "No policy semantic overrides without explicit ruling from Team 00"] },
];

const PROMPT_TYPES = [
  { id: "reset", label: "🔄 Full Reset", desc: "Complete identity injection for a brand-new agent session" },
  { id: "reinforce", label: "🛡️ Identity Reinforcement", desc: "Anti-drift reminder for an existing session that may be losing context" },
  { id: "handoff", label: "🤝 Handoff / Onboard", desc: "Context transfer prompt when handing off to a new session" },
  { id: "governance", label: "📋 Governance Reminder", desc: "SSM / Iron Rules / canonical paths compliance reminder" },
];

let selectedTeam = null;
let selectedPromptType = "reset";
let _ctxOverride = {};

async function loadState() {
  try {
    await loadDomainState("tiktrack");
  } catch (e) {
    /* state unavailable — prompts still work without it */
  }
  if (selectedTeam) renderTeamPanel(selectedTeam);
}

function engineDotClass(engine) {
  if (engine === "cursor") return "dot-cursor";
  if (engine === "codex") return "dot-codex";
  if (engine === "human") return "dot-human";
  return "dot-auto";
}

function domainBadgeHtml(domain, short) {
  const labels = { tiktrack: short ? "TT" : "tiktrack", agents_os: short ? "AOS" : "agents_os", multi: short ? "✦" : "multi" };
  const cls = { tiktrack: "tiktrack", agents_os: "agents_os", multi: "multi" };
  const label = labels[domain] || domain;
  const c = cls[domain] || "multi";
  return `<span class="domain-badge domain-${c}" title="${domain}">${label}</span>`;
}

function buildTeamList() {
  const el = document.getElementById("team-list-content");
  if (!el) return;
  const teamMap = Object.fromEntries(TEAMS.map(t => [t.id, t]));
  let html = "";
  for (const grp of TEAM_GROUPS) {
    const teamsInGroup = grp.teamIds.map(id => teamMap[id]).filter(Boolean);
    if (!teamsInGroup.length) continue;
    html += `<div class="team-group" data-group="${grp.id}">
      <div class="team-group-header">${escHtml(grp.label)}</div>`;
    for (const t of teamsInGroup) {
      html += `<div class="team-item" id="tli-${t.id}" onclick="selectTeam('${t.id}')">
        <span class="team-engine-dot ${engineDotClass(t.engine)}" title="${t.engine}"></span>
        <span class="team-badge">${t.label}</span>
        <span class="team-item-name">${t.name}</span>
        ${t.domain ? domainBadgeHtml(t.domain, true) : ""}
      </div>`;
    }
    html += "</div>";
  }
  el.innerHTML = html;
}

function updateHeaderFromTeam(team) {
  const el = document.getElementById("header-sub");
  if (!el) return;
  if (!team) {
    el.textContent = "← Select a team";
    return;
  }
  const domain = (team.domain || "—").replace(/_/g, "");
  el.textContent = `Team: ${team.label} | ${team.name} | ${domain}`;
}

function selectTeam(teamId) {
  _ctxOverride = {};
  selectedTeam = TEAMS.find(t => t.id === teamId);
  document.querySelectorAll(".team-item").forEach(el => el.classList.remove("active"));
  const li = document.getElementById("tli-" + teamId);
  if (li) li.classList.add("active");
  updateHeaderFromTeam(selectedTeam);
  renderTeamPanel(selectedTeam);
}

function renderTeamPanel(team) {
  if (!team) return;
  const panel = document.getElementById("team-panel");
  if (!panel) return;
  const engineColors = { cursor: "#f0883e", codex: "var(--success)", human: "var(--warning)", auto: "var(--text-muted)" };
  const eColor = engineColors[team.engine] || "var(--text-muted)";

  panel.innerHTML = `
    <div class="team-panel-col1">
    <div class="state-strip" id="state-bar">
      <span>⚡ Active pipeline: <strong id="sb-wp">${escHtml(pipelineState?.work_package_id || "—")}</strong></span>
      <span>Gate: <strong id="sb-gate">${escHtml(pipelineState?.current_gate || "—")}</strong></span>
      <span>Stage: <strong id="sb-stage">${escHtml(pipelineState?.stage_id || "—")}</strong></span>
      <span style="color:var(--text-muted);font-size:10px">← prompts are dynamically generated with this context</span>
    </div>
    <div class="team-header-card">
      <h2>
        <span class="team-id-badge">${escHtml(team.label)}</span>
        ${escHtml(team.name)}
        <span style="font-size:10px;color:${eColor};padding:2px 8px;background:rgba(0,0,0,0.3);border-radius:10px;border:1px solid ${eColor}">${escHtml(team.engine)}</span>
      </h2>
      <div class="team-role-text">${escHtml(team.role)}</div>
      <div class="team-meta-row">
        ${team.group ? `<span class="team-meta-item"><span class="team-meta-lbl">Group: </span><span class="team-meta-val">${escHtml((TEAM_GROUPS.find(g => g.id === team.group) || {}).label || team.group)}</span></span>` : ""}
        <span class="team-meta-item"><span class="team-meta-lbl">Writes to: </span><span class="team-meta-val" style="font-family:var(--mono);font-size:10px">${escHtml(team.writesTo.join(", "))}</span></span>
        <span class="team-meta-item"><span class="team-meta-lbl">Governed by: </span><span class="team-meta-val">${escHtml(team.governedBy.join(" · "))}</span></span>
        ${team.domain ? `<span class="team-meta-item"><span class="team-meta-lbl">Domain: </span>${domainBadgeHtml(team.domain)}</span>` : ""}
      </div>
      <div class="team-resp-list"><ul>${team.responsibilities.map(r => `<li>${escHtml(r)}</li>`).join("")}</ul></div>
      ${team.isoRules && team.isoRules.length ? `
      <div style="margin-top:10px;padding:8px 10px;background:rgba(248,81,73,0.07);border:1px solid rgba(248,81,73,0.25);border-radius:6px">
        <div style="font-size:10px;font-weight:700;color:var(--danger);margin-bottom:4px">⚠ Iron Rules for this team</div>
        <ul style="list-style:disc;padding-left:14px">
          ${team.isoRules.map(r => `<li style="font-size:11px;color:var(--text-muted);margin-bottom:2px">${escHtml(r)}</li>`).join("")}
        </ul>
      </div>` : ""}
    </div>
    </div>
    <div class="team-panel-col2">
    <div class="prompt-tabs">
      ${PROMPT_TYPES.map(pt => `
        <button class="prompt-tab${selectedPromptType === pt.id ? " active" : ""}"
                onclick="selectPromptType('${pt.id}')"
                title="${escHtml(pt.desc)}">
          ${escHtml(pt.label)}
        </button>`).join("")}
    </div>
    <div class="prompt-output-card">
      <div class="prompt-output-header">
        <span class="prompt-output-title" id="pt-title">${escHtml(PROMPT_TYPES.find(p => p.id === selectedPromptType)?.label || "")}</span>
        <div class="prompt-output-actions">
          <span class="prompt-state-badge" id="pt-badge">${escHtml(team.label)}</span>
          <button class="btn btn-primary" onclick="copyPrompt('rag')" id="copy-rag-btn">📋 Copy RAG Prompt (Mentions)</button>
          <button class="btn" onclick="copyPrompt('hard')" id="copy-hard-btn">📋 Copy Hard-Injection Prompt</button>
        </div>
      </div>
      <pre class="prompt-output-pre" id="prompt-output">Generating…</pre>
    </div>
    </div>`;
  renderPrompt();
}

function selectPromptType(typeId) {
  _ctxOverride = {};
  selectedPromptType = typeId;
  document.querySelectorAll(".prompt-tab").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".prompt-tab").forEach(el => {
    if (el.textContent.trim() === (PROMPT_TYPES.find(p => p.id === typeId)?.label || "").trim()) el.classList.add("active");
  });
  const ptTitle = document.getElementById("pt-title");
  if (ptTitle) ptTitle.textContent = PROMPT_TYPES.find(p => p.id === typeId)?.label || "";
  renderPrompt();
}

function _resolveCtx() {
  const today = new Date().toISOString().split("T")[0];
  const wp = _ctxOverride.wp ?? pipelineState?.work_package_id ?? null;
  const gate = _ctxOverride.gate ?? pipelineState?.current_gate ?? null;
  const stage = _ctxOverride.stage ?? pipelineState?.stage_id ?? null;
  return { today, wp, gate, stage };
}

function _missingSystemVars() {
  const ctx = _resolveCtx();
  const missing = [];
  if (!ctx.wp) missing.push({ key: "wp", label: "Work Package ID", placeholder: "e.g. S001-P002-WP001" });
  if (!ctx.gate) missing.push({ key: "gate", label: "Current Gate", placeholder: "e.g. GATE_5" });
  if (!ctx.stage) missing.push({ key: "stage", label: "Stage ID", placeholder: "e.g. S001" });
  return missing;
}

function buildPrompt(team, typeId, injectionMode) {
  injectionMode = injectionMode || "hard";
  if (injectionMode === "rag") {
    return `@${team.id}.md @STATE_SNAPSHOT.json @PHOENIX_MASTER_WSM_v1.0.0.md

You are ${team.name}. Read your identity file and establish your rules.
Current state is in @STATE_SNAPSHOT.json.
Operational state is in @PHOENIX_MASTER_WSM_v1.0.0.md.`;
  }
  const ctx = _resolveCtx();
  const today = ctx.today;
  const wp = ctx.wp || "—";
  const gate = ctx.gate || "—";
  const stage = ctx.stage || "—";
  const resp = team.responsibilities.map(r => `  - ${r}`).join("\n");
  const irons = (team.isoRules || []).map(r => `  - ${r}`).join("\n");
  const writes = team.writesTo.join(", ");
  const domain = team.domain || "—";

  switch (typeId) {
    case "reset":
      return `╔══════════════════════════════════════════════════════════════╗
║  FULL RESET — ${(team.label + " — " + team.name).padEnd(46)} ║
╚══════════════════════════════════════════════════════════════╝

You are starting a new session as ${team.label} — ${team.name}.

## Identity

**Team:** ${team.label}
**Name:** ${team.name}
**Engine:** ${team.engine}
**Domain:** ${domain}
**Role:** ${team.role}

## Responsibilities

${resp}

## Writing Authority

You write ONLY to:
  ${writes}

You do NOT modify SSM, WSM, canonical governance docs, or other teams' folders.

## Iron Rules (mandatory — non-negotiable)

${irons || "  - Follow SSM v1.0.0 and canonical governance at all times"}
  - Identity header mandatory on ALL outputs
  - Do NOT drift into other teams' roles or responsibilities
  - Governed by: ${team.governedBy.join(", ")}

## Current Pipeline Context

WP:    ${wp}
Gate:  ${gate}
Stage: ${stage}
Date:  ${today}

## Task

[Paste your specific task for this session here]

---
Locked. ${team.label} (${team.name}) context adopted.`;
    case "reinforce":
      return `╔══════════════════════════════════════════════════════════════╗
║  IDENTITY REINFORCEMENT — ${(team.label + " — " + team.name).padEnd(33)} ║
╚══════════════════════════════════════════════════════════════╝

REMINDER: You are ${team.label} — ${team.name}.

Role: ${team.role}

You are currently working on:
  WP:   ${wp}
  Gate: ${gate}

Do NOT drift into other teams' roles.
Do NOT modify files outside your writing authority.
Writing authority: ${writes}

Iron Rules for this session:
${irons || "  - Follow SSM v1.0.0 and canonical governance at all times"}

Your task is the one we were just working on — continue without deviation.
Do NOT re-initialize. Do NOT re-introduce yourself. Just continue the work.`;
    case "handoff":
      return `╔══════════════════════════════════════════════════════════════╗
║  HANDOFF / ONBOARD — ${(team.label + " — " + team.name).padEnd(38)} ║
╚══════════════════════════════════════════════════════════════╝

You are ${team.label} — ${team.name}.
Role: ${team.role}
Engine: ${team.engine}
Domain: ${domain}

## Context from prior session

WP:    ${wp}
Gate:  ${gate}
Stage: ${stage}
Date:  ${today}

## Prior session summary

[Paste the summary from the previous session here]

## What was completed

[List artifacts produced / tasks completed]

## What remains

[List what still needs to be done in this session]

## Your task for this session

[Describe the specific next action]

## Authority and constraints

You write ONLY to: ${writes}
Iron Rules: ${(team.isoRules || []).join(" | ") || "SSM v1.0.0"}

---
Locked. ${team.label} (${team.name}) context adopted. Continuing prior work.`;
    case "governance":
      return `╔══════════════════════════════════════════════════════════════╗
║  GOVERNANCE REMINDER — ${(team.label + " — " + team.name).padEnd(36)} ║
╚══════════════════════════════════════════════════════════════╝

${team.label} — ${team.name} — governance compliance check.

## SSM / Iron Rules (mandatory — cannot be overridden)

  - maskedLog mandatory on ALL server-side logging
  - NUMERIC(20,8) for all financial / monetary data
  - 4-state status model everywhere: pending / active / inactive / cancelled
  - collapsible-container Iron Rule: ALL pages use this template
  - Rich text: ONE unified rich-text object (no per-entity customization)
  - Do NOT modify SSM, WSM, canonical governance docs
  - Do NOT modify other teams' folders

## This team's specific iron rules

${irons || "  - Follow SSM v1.0.0 and canonical governance at all times"}

## Current state

WP:    ${wp}
Gate:  ${gate}
Stage: ${stage}

## Writing authority

You write ONLY to: ${writes}

If you are about to write to a path NOT in your writing authority → STOP and ask Team 00.

---
Governance reminder delivered. ${team.label} context locked.`;
    default:
      return `[Unknown prompt type: ${typeId}]`;
  }
}

function _showValidationPanel(missing) {
  const out = document.getElementById("prompt-output");
  if (!out) return;
  const intentionalTypes = new Set(["reset", "handoff"]);
  const hasIntentional = intentionalTypes.has(selectedPromptType);
  const fields = missing.map(f => `
    <div class="pv-field">
      <label>${escHtml(f.label)} <span style="color:var(--danger)">*</span></label>
      <input type="text" id="pvi-${f.key}" placeholder="${escHtml(f.placeholder)}"
             value="${escHtml(_ctxOverride[f.key] || "")}"
             oninput="document.getElementById('pvi-${f.key}').classList.toggle('pv-ok', this.value.trim().length>0)">
    </div>`).join("");
  const warnBlock = hasIntentional
    ? `<div class="pv-warn">ℹ️  Note: This prompt type (<strong>${escHtml(selectedPromptType)}</strong>) also contains intentional placeholders like <code>[Paste summary here]</code> — those are meant for you to fill in after copying.</div>`
    : "";
  out.innerHTML = `
    <div class="pv-panel">
      <div class="pv-title">⛔ Pipeline state not loaded — system variables missing</div>
      <div class="pv-desc">
        The following variables are required to generate this prompt but could not be read from
        <code>pipeline_state.json</code>. Enter them manually to generate the prompt, or
        refresh state and try again.
      </div>
      ${fields}
      <div class="pv-actions">
        <button class="btn btn-primary" onclick="_applyManualCtx()">✅ Generate prompt</button>
        <button class="btn" onclick="_clearValidation()">✕ Cancel</button>
        <button class="btn" onclick="loadState().then(renderPrompt)" style="margin-left:auto">↺ Reload state</button>
      </div>
      ${warnBlock}
      <div class="pv-hint">
        These values are used only for this prompt and not saved anywhere.
        Missing: ${missing.map(f => f.label).join(", ")}.
      </div>
    </div>`;
}

function _applyManualCtx() {
  const missing = _missingSystemVars();
  const newOverrides = {};
  let allFilled = true;
  for (const f of missing) {
    const val = (document.getElementById("pvi-" + f.key)?.value || "").trim();
    if (!val) { allFilled = false; continue; }
    newOverrides[f.key] = val;
  }
  if (!allFilled) {
    for (const f of missing) {
      const el = document.getElementById("pvi-" + f.key);
      if (el && !el.value.trim()) el.style.borderColor = "var(--danger)";
    }
    return;
  }
  _ctxOverride = { ..._ctxOverride, ...newOverrides };
  renderPrompt();
}

function _clearValidation() {
  _ctxOverride = {};
  const out = document.getElementById("prompt-output");
  if (out) out.innerHTML = "<em style='color:var(--text-muted);font-size:12px'>Prompt generation cancelled. Load pipeline state and try again.</em>";
}

function renderPrompt() {
  const out = document.getElementById("prompt-output");
  if (!out || !selectedTeam) return;
  const missing = _missingSystemVars();
  if (missing.length > 0) {
    _showValidationPanel(missing);
    return;
  }
  out.textContent = buildPrompt(selectedTeam, selectedPromptType, "rag");
}

function copyPrompt(injectionMode) {
  injectionMode = injectionMode || "rag";
  const missing = _missingSystemVars();
  const text = injectionMode === "rag"
    ? buildPrompt(selectedTeam, selectedPromptType, "rag")
    : (missing.length > 0 ? null : buildPrompt(selectedTeam, selectedPromptType, "hard"));
  if (!text || text.startsWith("⛔") || text.includes("pv-panel")) {
    if (injectionMode === "hard" && missing.length > 0) {
      alert("Cannot copy Hard-Injection — prompt has unresolved system variables. Fill in the required fields first.");
    } else {
      alert("Cannot copy — prompt has unresolved system variables. Fill in the required fields first.");
    }
    return;
  }
  const btnId = injectionMode === "rag" ? "copy-rag-btn" : "copy-hard-btn";
  const btn = document.getElementById(btnId);
  if (!btn) return;
  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add("copy-flash");
    const orig = btn.textContent;
    btn.textContent = "✓ Copied!";
    setTimeout(() => { btn.classList.remove("copy-flash"); btn.textContent = orig; }, 1800);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  buildTeamList();
  loadState();
});
