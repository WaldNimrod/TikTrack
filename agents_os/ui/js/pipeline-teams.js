/* pipeline-teams.js — Team 61 AOUI LOD400 — Teams page logic (uses pipeline-state, pipeline-dom) */
/* Canonical roster: ARCHITECT_DIRECTIVE_TEAM_ROSTER_v2.0.0 (2026-03-19) */

// ── Team groups (display order + labels) — reusable for filtering, reports, etc. ──
const TEAM_GROUPS = [
  { id: "architects",    label: "Architects",    teamIds: ["team_00", "team_100", "team_101", "team_102"] },
  { id: "validation",    label: "Validation",    teamIds: ["team_90", "team_190"] },
  // team_10 = TikTrack gateway | team_11 = AOS gateway (TEAM_ROSTER_v2.0.0)
  { id: "execution",     label: "Execution",     teamIds: ["team_10", "team_11", "team_20", "team_30", "team_40", "team_50", "team_60", "team_51", "team_61"] },
  { id: "documentation", label: "Documentation",  teamIds: ["team_70", "team_170"] },
  { id: "specialists",    label: "Specialists",   teamIds: ["team_31", "team_191"] },
];

// ── Canonical team roster (source: ARCHITECT_DIRECTIVE_TEAM_ROSTER_v2.0.0 — 2026-03-19) ─────
const TEAMS = [
  { id: "team_00", group: "architects", label: "Team 00", name: "System Designer (Nimrod)", engine: "human", domain: "multi",
    role: "THE SINGLE HUMAN in the organization. Provides requirements, answers questions, makes decisions. Instructs all teams in human language. NOT an AI agent. NOT an architectural agent.",
    responsibilities: ["Define product vision and requirements — WHAT and WHY", "Set all Iron Rules (constitutional layer, cannot delegate)", "GATE_4 Phase 4.3: Personal UX sign-off (final human authority)", "Override power at any gate if constitutional issue detected", "Maintain team constitution and document priority map"],
    writesTo: ["../../_COMMUNICATION/team_00/", "../../_COMMUNICATION/_Architects_Decisions/"], governedBy: ["CLAUDE.md", "PHOENIX_MASTER_SSM_v1.0.0.md", "ARCHITECT_DIRECTIVE_TEAM_ROSTER_v2.0.0.md"],
    isoRules: ["No guessing — read the file first", "GATE_4 Phase 4.3 requires personal Nimrod approval — cannot delegate", "All Iron Rules are set by Team 00 — no other team can modify them", "Writing authority: team_00/ and _Architects_Decisions/ ONLY", "Team 00 = human only — never delegate Team 00 decision authority to an AI agent"] },
  // Team 10 = TikTrack Gateway ONLY (TEAM_ROSTER_v2.0.0). AOS gateway = Team 11.
  { id: "team_10", group: "execution", label: "Team 10", name: "Gateway / Execution Lead", engine: "cursor", domain: "tiktrack",
    role: "TikTrack-domain gateway. Execution lead, team activation, gate submissions, WSM updates. PWA authority (GATE_SEQUENCE_CANON §3). TikTrack domain only.",
    responsibilities: ["Produce and maintain the Work Plan (Phase 2.2)", "Generate per-team mandates (Phase 3.1)", "Activate and coordinate Teams 20, 30, 40, 50, 60", "Submit gate artifacts to Team 90 for validation", "Update WSM after each gate pass"],
    writesTo: ["../../_COMMUNICATION/team_10/"], governedBy: ["SSM v1.0.0", "ARCHITECT_DIRECTIVE_TEAM_ROSTER_v2.0.0.md", "ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0.md"],
    isoRules: ["TikTrack domain only — never activate AOS teams directly", "No gate submission without all artifacts", "Work plan must be versioned", "Identity header mandatory on all outputs", "PWA scope: ≤2 files, ≤50 lines, no schema, no API contract, no business logic"] },
  // Team 11 = AOS Gateway — mirrors Team 10 for AOS domain (added TEAM_ROSTER_v2.0.0 2026-03-19)
  { id: "team_11", group: "execution", label: "Team 11", name: "AOS Gateway / Execution Lead", engine: "cursor", domain: "agents_os",
    role: "AOS-domain mirror of Team 10. Phase 2.2 (work plan generation) + Phase 3.1 (mandate generation) for all AOS packages. Gate submissions, WSM updates for AOS domain.",
    responsibilities: ["Produce and maintain AOS Work Plan (Phase 2.2)", "Generate per-team mandates for Team 61 (Phase 3.1)", "Submit gate artifacts to Team 51/90 for validation", "Update WSM for AOS domain after each gate pass"],
    writesTo: ["../../_COMMUNICATION/team_11/"], governedBy: ["SSM v1.0.0", "ARCHITECT_DIRECTIVE_TEAM_ROSTER_v2.0.0.md", "ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0.md"],
    isoRules: ["AOS domain only — never activate TikTrack teams (Team 20/30/40/60)", "Never substitute for Team 10 — strict domain separation", "Work plan must be versioned", "Identity header mandatory on all outputs"] },
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
  // Team 70 = TikTrack GATE_5 Phase 5.1 (operational docs). AOS GATE_5 = Team 170 (TEAM_ROSTER_v2.0.0).
  { id: "team_70", group: "documentation", label: "Team 70", name: "Documentation", engine: "cursor", domain: "tiktrack",
    role: "Technical writing, AS_MADE_REPORT — TikTrack domain. GATE_5 Phase 5.1 for TikTrack packages.",
    responsibilities: ["Write and maintain technical documentation for TikTrack", "Produce AS_MADE_REPORT at GATE_5 Phase 5.1 (TikTrack domain)", "Update canonical governance docs (under Team 00 direction)", "Knowledge base maintenance"],
    writesTo: ["../../_COMMUNICATION/team_70/"], governedBy: ["SSM v1.0.0", "ARCHITECT_DIRECTIVE_TEAM_ROSTER_v2.0.0.md"],
    isoRules: ["All docs require identity header", "AS_MADE_REPORT mandatory at GATE_5 Phase 5.1 (TikTrack only)", "Do NOT modify SSM/WSM without Team 00 instruction", "AOS documentation closure → Team 170, not Team 70"] },
  { id: "team_90", group: "validation", label: "Team 90", name: "Dev Validator", engine: "codex", domain: "multi",
    role: "GATE_5 validation (final pipeline gate) + G3.5 work-plan validation. Blocking reports with route_recommendation. GATE_5 PASS → COMPLETE.",
    responsibilities: ["Perform fresh validation at GATE_5 (dev validation → COMPLETE)", "Validate work plans at G3.5 (CHANNEL_10_90_DEV_VALIDATION Phase 1)", "Produce BLOCKING_REPORT with BF-Gx-NNN format findings", "Declare route_recommendation: doc or full in every BLOCKING_REPORT", "Verify previous blockers are resolved before re-run"],
    writesTo: ["../../_COMMUNICATION/team_90/"], governedBy: ["SSM v1.0.0", "TEAM_ROSTER_LOCK"],
    isoRules: ["CRITICAL: Every GATE_5 run MUST be a FRESH validation — never repeat prior findings", "route_recommendation MANDATORY in every BLOCKING_REPORT", "Do NOT return template or placeholder responses", "Identity header mandatory on all outputs"] },
  // Team 100 = Chief System Architect, Claude Code (TEAM_ROSTER_v2.0.0 Correction 2 — updated 2026-03-24)
  { id: "team_100", group: "architects", label: "Team 100", name: "Chief System Architect", engine: "claude", domain: "multi",
    role: "System-level architectural decisions, delegated by Team 00 (Nimrod). GATE_2 Phase 2.3: 'האם אנחנו מאשרים לבנות את זה?' — final sign-off before execution. Post-execution architectural review (organizational action, not a pipeline gate): 'האם מה שנבנה הוא מה שאישרנו?' Applies FCP on rejection. Coordinates domain architects: Team 101 (AOS), Team 102 (TikTrack).",
    responsibilities: [
      "GATE_2 Phase 2.3: Final architectural sign-off on LLD400 + Work Plan (delegated by Team 00)",
      "Post-execution organizational review: verify build matches GATE_2 intent — triggered by Team 00, not by pipeline_run.sh",
      "Apply FCP (FCP-1/2/3) on rejection with mandatory routing recommendation",
      "System-level cross-domain architectural decisions and coordination",
      "Route constitutional-level rulings upward to Team 00",
      "Coordinate domain architects: Team 101 (AOS domain authority), Team 102 (TikTrack domain authority)"
    ],
    writesTo: ["../../_COMMUNICATION/team_100/"], governedBy: ["SSM v1.0.0", "ARCHITECT_DIRECTIVE_TEAM_ROSTER_v2.0.0.md", "ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0.md"],
    isoRules: [
      "GATE_2 Phase 2.3 approval requires explicit evidence review — no rubber-stamp",
      "FCP classification mandatory on every rejection (FCP-1: doc route / FCP-2: partial fix / FCP-3: full restart)",
      "LOD200 Author Rule: lod200_author_team = default reviewer for Phase 2.3",
      "Never issue cross-domain mandates without Team 00 strategic alignment",
      "Runtime state (current gate, WP, stage) lives exclusively in pipeline_state_*.json — WSM COS section removed (S003-P016). Read pipeline_state_tiktrack.json / pipeline_state_agentsos.json for operational state, never WSM.",
      "Active work: S003-P004 (User Tickers, D33, TikTrack domain). Runbook: _COMMUNICATION/team_00/S003_P004_ACTIVATION_RUNBOOK_v1.0.0.md"
    ] },
  // Team 101 = AOS Domain Architect, Codex (TEAM_ROSTER_v2.0.0)
  { id: "team_101", group: "architects", label: "Team 101", name: "AOS Domain Architect", engine: "openai", domain: "agents_os",
    role: "Agents_OS domain architectural authority. Research and best-practice analysis. May substitute for Team 100 in TRACK_FOCUSED and TRACK_FAST variants.",
    responsibilities: ["AOS domain architectural authority under Team 100", "GATE_2 Phase 2.3 for AOS packages (default reviewer per lod200_author_team)", "GATE_4 Phase 4.2 for AOS packages", "Research and best-practice analysis for AOS architecture"],
    writesTo: ["../../_COMMUNICATION/team_101/"], governedBy: ["SSM v1.0.0", "ARCHITECT_DIRECTIVE_TEAM_ROSTER_v2.0.0.md"],
    isoRules: ["AOS domain only unless Team 100 explicitly delegates cross-domain", "Team 190 independence: never share conclusions with Team 190 before Team 190 produces own validation", "LOD400 must be fully specified before issuing to Team 61"] },
  // Team 102 = TT Domain Architect (added TEAM_ROSTER_v2.0.0 2026-03-19)
  { id: "team_102", group: "architects", label: "Team 102", name: "TikTrack Domain Architect", engine: "openai", domain: "tiktrack",
    role: "TikTrack domain architectural authority. Coming soon — not yet active.",
    responsibilities: ["TikTrack domain architectural authority under Team 100", "GATE_2 Phase 2.3 for TikTrack packages", "GATE_4 Phase 4.2 for TikTrack packages"],
    writesTo: ["../../_COMMUNICATION/team_102/"], governedBy: ["SSM v1.0.0", "ARCHITECT_DIRECTIVE_TEAM_ROSTER_v2.0.0.md"],
    isoRules: ["Not yet active — registration only in S003-P011-WP001", "TikTrack domain only"] },
  // Team 170 = Spec & Governance + AOS GATE_5 Phase 5.1 (TEAM_ROSTER_v2.0.0 2026-03-19)
  { id: "team_170", group: "documentation", label: "Team 170", name: "Spec & Governance", engine: "cursor", domain: "multi",
    role: "LOD200/LLD400 production, registry sync, canonical document maintenance. GATE_5 Phase 5.1 for AOS domain (spec owner closes the spec — AS_MADE).",
    responsibilities: ["Produce LLD400 (GATE_2 Phase 2.1)", "Maintain PROGRAM_REGISTRY and PORTFOLIO_ROADMAP", "GATE_5 Phase 5.1 for AOS domain (AS_MADE documentation closure)", "DDL V2.x updates (KB-001..016)", "SSOT corrections and roadmap amendments"],
    writesTo: ["../../_COMMUNICATION/team_170/"], governedBy: ["SSM v1.0.0", "ARCHITECT_DIRECTIVE_TEAM_ROSTER_v2.0.0.md", "PHOENIX_PORTFOLIO_ROADMAP"],
    isoRules: ["AOS GATE_5 Phase 5.1 = Team 170 (spec owner closes spec)", "TikTrack GATE_5 Phase 5.1 = Team 70", "DDL is documentation only — production DB is source of truth", "Registry updates require Team 00 awareness"] },
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
/** S003-P011-WP001 BF-04/05: Engine config from team_engine_config.json (merged on load) */
let teamEngineConfig = null;
let selectedPromptType = "reset";
let _ctxOverride = {};
let contextAudit = { loading: true, error: null, ready: false };
let ctxDrill = { source: "roster_team", teamId: null };

/** SA-01: Load both domain states and populate dual-domain rows */
async function loadDomainStatesForRows() {
  const domainStates = {};
  for (const domain of ["tiktrack", "agents_os"]) {
    try {
      const path = DOMAIN_STATE_FILES[domain];
      const r = await fetch(path + "?t=" + Date.now());
      if (r.ok) domainStates[domain] = await r.json();
    } catch (_) { /* ignore */ }
  }
  renderTeamsDomainRows(domainStates);
  return domainStates;
}

function renderTeamsDomainRows(domainStates) {
  const fmt = (s) => (s && (s.work_package_id || s.current_gate) ? (s.work_package_id || "No active WP") : "No active WP");
  const fmtGate = (s) => (s?.current_gate && s.current_gate !== "NONE" ? s.current_gate : "—");
  const rowTt = document.getElementById("teams-domain-row-tiktrack");
  const rowAos = document.getElementById("teams-domain-row-agents_os");
  if (rowTt) {
    const s = domainStates?.tiktrack;
    const wpEl = rowTt.querySelector(".teams-domain-wp");
    const gateEl = rowTt.querySelector(".teams-domain-gate");
    const badgeEl = rowTt.querySelector(".teams-provenance-badge");
    if (wpEl) wpEl.textContent = fmt(s);
    if (gateEl) gateEl.textContent = fmtGate(s);
    if (badgeEl) badgeEl.textContent = s ? "[domain_file]" : "[unavailable]";
  }
  if (rowAos) {
    const s = domainStates?.agents_os;
    const wpEl = rowAos.querySelector(".teams-domain-wp");
    const gateEl = rowAos.querySelector(".teams-domain-gate");
    const badgeEl = rowAos.querySelector(".teams-provenance-badge");
    if (wpEl) wpEl.textContent = fmt(s);
    if (gateEl) gateEl.textContent = fmtGate(s);
    if (badgeEl) badgeEl.textContent = s ? "[domain_file]" : "[unavailable]";
  }
}

async function loadTeamEngineConfig() {
  try {
    const base = typeof window !== "undefined" && window.location && window.location.origin ? window.location.origin : "";
    const r = await fetch((base || "") + "/api/config/team-engine?t=" + Date.now()).catch(() => null);
    if (r && r.ok) {
      teamEngineConfig = await r.json();
      return;
    }
  } catch (_) {}
  try {
    const r = await fetch("../../_COMMUNICATION/agents_os/team_engine_config.json?t=" + Date.now());
    if (r.ok) teamEngineConfig = await r.json();
  } catch (_) {}
}

const ENGINE_OPTIONS = ["cursor", "Cursor Composer", "codex", "openai", "claude", "human"];

function buildEngineEditorTable() {
  const el = document.getElementById("engine-editor-table");
  if (!el) return;
  if (!teamEngineConfig?.teams) {
    el.innerHTML = "<div style='font-size:11px;color:var(--text-muted)'>Load config first</div>";
    return;
  }
  const teams = teamEngineConfig.teams;
  let html = "<table class='engine-editor-tbl'><thead><tr><th>Team</th><th>Engine</th><th>Domain</th></tr></thead><tbody>";
  for (const [tid, t] of Object.entries(teams)) {
    const opts = ENGINE_OPTIONS.map(e => `<option value="${escHtml(e)}"${(t.engine || "") === e ? " selected" : ""}>${escHtml(e)}</option>`).join("");
    html += `<tr data-team="${escHtml(tid)}">
      <td><span class="engine-editor-team-id">${escHtml(tid)}</span></td>
      <td><select class="engine-editor-select" data-team="${escHtml(tid)}">${opts}</select></td>
      <td><span class="engine-editor-domain">${escHtml(t.domain || "")}</span></td>
    </tr>`;
  }
  html += "</tbody></table>";
  el.innerHTML = html;
}

async function engineEditorSave() {
  if (!teamEngineConfig?.teams) return;
  const selects = document.querySelectorAll(".engine-editor-select");
  const updated = JSON.parse(JSON.stringify(teamEngineConfig));
  for (const sel of selects) {
    const tid = sel.dataset.team;
    if (tid && updated.teams[tid]) updated.teams[tid].engine = sel.value;
  }
  try {
    const base = typeof window !== "undefined" && window.location && window.location.origin ? window.location.origin : "";
    const r = await fetch((base || "") + "/api/config/team-engine", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (r.ok) {
      teamEngineConfig = updated;
      const btn = document.getElementById("engine-editor-save");
      if (btn) { btn.textContent = "✓ Saved"; setTimeout(() => { btn.textContent = "💾 Save to team_engine_config.json"; }, 1500); }
    } else {
      const j = await r.json().catch(() => ({}));
      alert("Save failed: " + (j.description || r.statusText || r.status));
    }
  } catch (e) {
    alert("Save failed: " + (e.message || "network error"));
  }
}

async function _fetchJSONSafe(path) {
  try {
    return await fetchJSON(path);
  } catch (_) {
    return null;
  }
}

async function _fetchTextSafe(path) {
  try {
    return await fetchText(path);
  } catch (_) {
    return null;
  }
}

function _teamSort(a, b) {
  const na = parseInt(String(a).replace("team_", ""), 10);
  const nb = parseInt(String(b).replace("team_", ""), 10);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return String(a).localeCompare(String(b));
}

function _parseTeamIdsFromConfigPy(text) {
  if (!text) return [];
  const ids = new Set();
  const re = /"team_(\d+)"/g;
  let m;
  while ((m = re.exec(text)) !== null) ids.add(`team_${m[1]}`);
  return Array.from(ids).sort(_teamSort);
}

function _parseTeamIdsFromCursorrules(text) {
  if (!text) return [];
  const first = (text.match(/Which Squad ID am I representing \(([^)]+)\)/) || [])[1] || "";
  const ids = new Set();
  first.split(",").map(s => s.trim()).filter(Boolean).forEach(n => {
    if (/^\d+$/.test(n)) ids.add(`team_${n}`);
  });
  return Array.from(ids).sort(_teamSort);
}

function _computeGaps(audit) {
  const gaps = [];
  const byId = Object.fromEntries((audit.matrix || []).map(r => [r.teamId, r]));
  for (const row of audit.matrix || []) {
    if (row.inUI && !row.inRoster) {
      gaps.push({
        id: `GAP-ROSTER-MISSING-${row.teamId}`,
        severity: "HIGH",
        summary: `${row.teamId} exists in UI but missing in TEAMS_ROSTER`,
      });
    }
    if (row.inUI && !row.hasIdentity) {
      gaps.push({
        id: `GAP-IDENTITY-MISSING-${row.teamId}`,
        severity: "HIGH",
        summary: `${row.teamId} used in UI but identity markdown is missing`,
      });
    }
  }
  if ((audit.rosterMeta?.note || "").includes("SINGLE SOURCE OF TRUTH") && audit.uiSource === "hardcoded") {
    gaps.push({
      id: "GAP-SSOT-UI-HARDCODE",
      severity: "HIGH",
      summary: "Roster declares SSOT, but Teams UI still uses hardcoded team catalog",
    });
  }
  const team70 = byId.team_70;
  const team100 = byId.team_100;
  const team00 = byId.team_00;
  if (team70 && team70.rosterEngine && team70.uiEngine && team70.rosterEngine !== team70.uiEngine) {
    gaps.push({ id: "GAP-ENGINE-CONFLICT-team_70", severity: "MEDIUM", summary: "Engine conflict for team_70 (roster vs UI/config)" });
  }
  if (team100 && team100.rosterEngine && team100.uiEngine && team100.rosterEngine !== team100.uiEngine) {
    gaps.push({ id: "GAP-ENGINE-CONFLICT-team_100", severity: "MEDIUM", summary: "Engine conflict for team_100 (roster vs UI/config)" });
  }
  if (team00 && team00.rosterEngine && team00.uiEngine && team00.rosterEngine !== team00.uiEngine) {
    gaps.push({ id: "GAP-ENGINE-CONFLICT-team_00", severity: "MEDIUM", summary: "Engine conflict for team_00 (roster vs UI/config)" });
  }
  if ((audit.cursorrulesTeamIds || []).length > 0) {
    const missingInOnboarding = (audit.matrix || []).filter(r => r.inRoster && !r.inCursorrules).map(r => r.teamId);
    if (missingInOnboarding.length > 0) {
      gaps.push({
        id: "GAP-CURSORRULES-SUBSET",
        severity: "LOW",
        summary: `.cursorrules onboarding includes only subset of roster teams (${missingInOnboarding.join(", ")})`,
      });
    }
  }
  return gaps;
}

async function loadContextAudit() {
  contextAudit = { loading: true, error: null, ready: false };
  const rosterPath = "../../documentation/docs-governance/01-FOUNDATIONS/TEAMS_ROSTER_v1.0.0.json";
  const roleMapPath = "../../documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md";
  const proceduresPath = "../../documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md";
  const injectionPath = "../../agents_os_v2/context/injection.py";
  const configPyPath = "../../agents_os_v2/config.py";
  const agentsPath = "../../AGENTS.md";
  const cursorrulesPath = "../../.cursorrules";
  try {
    const [roster, roleMap, procedures, injectionPy, configPy, agentsMd, cursorrules] = await Promise.all([
      _fetchJSONSafe(rosterPath),
      _fetchTextSafe(roleMapPath),
      _fetchTextSafe(proceduresPath),
      _fetchTextSafe(injectionPath),
      _fetchTextSafe(configPyPath),
      _fetchTextSafe(agentsPath),
      _fetchTextSafe(cursorrulesPath),
    ]);
    const rosterTeams = (roster?.teams || []);
    const rosterIds = rosterTeams.map(t => t.id).filter(Boolean).sort(_teamSort);
    const uiIds = TEAMS.map(t => t.id).filter(Boolean).sort(_teamSort);
    const cfgIds = _parseTeamIdsFromConfigPy(configPy);
    const cursorrulesTeamIds = _parseTeamIdsFromCursorrules(cursorrules);
    const overrideIds = Object.keys(teamEngineConfig?.teams || {}).sort(_teamSort);
    const unionIds = Array.from(new Set([...rosterIds, ...uiIds, ...cfgIds, ...overrideIds])).sort(_teamSort);
    const identityMap = {};
    await Promise.all(unionIds.map(async (teamId) => {
      const txt = await _fetchTextSafe(`../../agents_os_v2/context/identity/${teamId}.md`);
      if (txt && txt.trim()) identityMap[teamId] = txt;
    }));
    const uiMap = Object.fromEntries(TEAMS.map(t => [t.id, t]));
    const rosterMap = Object.fromEntries(rosterTeams.map(t => [t.id, t]));
    const matrix = unionIds.map((teamId) => {
      const r = rosterMap[teamId];
      const u = uiMap[teamId];
      const ov = teamEngineConfig?.teams?.[teamId];
      return {
        teamId,
        inRoster: Boolean(r),
        inUI: Boolean(u),
        inConfigMap: cfgIds.includes(teamId),
        inOverride: Boolean(ov),
        inCursorrules: cursorrulesTeamIds.includes(teamId),
        hasIdentity: Boolean(identityMap[teamId]),
        rosterEngine: r?.engine || "",
        uiEngine: (ov?.engine || u?.engine || ""),
        rosterDomain: r?.domain || "",
        uiDomain: (ov?.domain || u?.domain || ""),
      };
    });
    contextAudit = {
      loading: false,
      error: null,
      ready: true,
      uiSource: "hardcoded",
      rosterPath,
      roleMapPath,
      proceduresPath,
      injectionPath,
      configPyPath,
      agentsPath,
      cursorrulesPath,
      rosterMeta: roster?._meta || {},
      rosterTeams,
      rosterTeamIds: rosterIds,
      uiTeamIds: uiIds,
      configTeamIds: cfgIds,
      overrideIds,
      cursorrulesTeamIds,
      identityMap,
      matrix,
      gaps: [],
      raw: {
        roleMap: roleMap || "",
        procedures: procedures || "",
        injectionPy: injectionPy || "",
        configPy: configPy || "",
        agentsMd: agentsMd || "",
        cursorrules: cursorrules || "",
        rosterJson: roster || null,
      },
    };
    contextAudit.gaps = _computeGaps(contextAudit);
  } catch (e) {
    contextAudit = { loading: false, error: String(e?.message || e), ready: false };
  }
}

async function loadState() {
  await loadTeamEngineConfig();
  await loadContextAudit();
  buildEngineEditorTable();
  const domainStates = await loadDomainStatesForRows();
  const domain = currentDomain || "tiktrack";
  if (domainStates[domain]) {
    pipelineState = domainStates[domain];
    window.pipelineState = pipelineState;
  } else {
    try {
      await loadDomainState(domain);
    } catch (e) {
      /* state unavailable — prompts still work without it */
    }
  }
  buildTeamList();
  if (selectedTeam) renderTeamPanel(selectedTeam);
}

function engineDotClass(engine) {
  if (engine === "cursor" || engine === "Cursor Composer") return "dot-cursor";
  if (engine === "codex") return "dot-codex";
  if (engine === "human") return "dot-human";
  if (engine === "openai" || engine === "claude") return "dot-auto";
  return "dot-auto";
}

function domainBadgeHtml(domain, short) {
  const labels = { tiktrack: short ? "TT" : "tiktrack", agents_os: short ? "AOS" : "agents_os", multi: short ? "✦" : "multi" };
  const cls = { tiktrack: "tiktrack", agents_os: "agents_os", multi: "multi" };
  const label = labels[domain] || domain;
  const c = cls[domain] || "multi";
  return `<span class="domain-badge domain-${c}" title="${domain}">${label}</span>`;
}

function getTeamEngine(teamId) {
  if (teamEngineConfig?.teams?.[teamId]?.engine) return teamEngineConfig.teams[teamId].engine;
  const t = TEAMS.find(x => x.id === teamId);
  return t ? t.engine : "cursor";
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
      const engine = getTeamEngine(t.id);
      html += `<div class="team-item" id="tli-${t.id}" onclick="selectTeam('${t.id}')">
        <span class="team-engine-dot ${engineDotClass(engine)}" title="${engine}"></span>
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
  ctxDrill.teamId = teamId;
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
  const engine = getTeamEngine(team.id);
  const engineColors = { cursor: "#f0883e", codex: "var(--success)", human: "var(--warning)", "Cursor Composer": "#f0883e", openai: "var(--accent)", claude: "var(--success)", auto: "var(--text-muted)" };
  const eColor = engineColors[engine] || "var(--text-muted)";

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
        <span style="font-size:10px;color:${eColor};padding:2px 8px;background:rgba(0,0,0,0.3);border-radius:10px;border:1px solid ${eColor}">${escHtml(engine)}</span>
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
    </div>
    <div class="team-panel-full">
      <div class="section-card ctx-monitor-card">
        <div class="section-title">🧭 Context Structure Monitor</div>
        <div id="ctx-monitor-content" class="loading">Loading context monitor…</div>
      </div>
      <div class="section-card ctx-future-card">
        <div class="section-title">🛠️ Team Management Roadmap</div>
        <div class="ctx-roadmap">
          <div class="ctx-roadmap-item"><strong>Phase 1 (Now):</strong> Monitor + understand context structure and cross-source gaps.</div>
          <div class="ctx-roadmap-item"><strong>Phase 2 (Next):</strong> Team parameter editor per team with validation rules and preview before save.</div>
          <div class="ctx-roadmap-item"><strong>Phase 3 (Planned):</strong> Dynamic team/environment defaults per domain and process variant.</div>
        </div>
      </div>
    </div>`;
  renderPrompt();
  renderContextMonitor(team);
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

function _ynPill(v) {
  return v
    ? `<span class="ctx-pill ctx-pill-ok">Y</span>`
    : `<span class="ctx-pill ctx-pill-miss">N</span>`;
}

function _severityClass(s) {
  if (s === "HIGH") return "ctx-gap-high";
  if (s === "MEDIUM") return "ctx-gap-medium";
  return "ctx-gap-low";
}

function _drilldownText(source, teamId) {
  if (!contextAudit?.ready) return "Context monitor data is not ready.";
  const rosterMap = Object.fromEntries((contextAudit.rosterTeams || []).map(t => [t.id, t]));
  const uiMap = Object.fromEntries(TEAMS.map(t => [t.id, t]));
  const overrides = teamEngineConfig?.teams || {};
  if (source === "roster_team") {
    return JSON.stringify(rosterMap[teamId] || { error: `${teamId} not found in TEAMS_ROSTER` }, null, 2);
  }
  if (source === "ui_team") {
    return JSON.stringify(uiMap[teamId] || { error: `${teamId} not found in UI team catalog` }, null, 2);
  }
  if (source === "identity_team") {
    return contextAudit.identityMap?.[teamId] || `[identity missing] agents_os_v2/context/identity/${teamId}.md`;
  }
  if (source === "engine_override_team") {
    return JSON.stringify(overrides[teamId] || { error: `${teamId} has no override entry in team_engine_config.json` }, null, 2);
  }
  if (source === "roster_meta") {
    return JSON.stringify(contextAudit.rosterMeta || {}, null, 2);
  }
  if (source === "cursorrules_full") {
    return contextAudit.raw?.cursorrules || "[not available]";
  }
  if (source === "agents_md_full") {
    return contextAudit.raw?.agentsMd || "[not available]";
  }
  if (source === "config_py_full") {
    return contextAudit.raw?.configPy || "[not available]";
  }
  if (source === "injection_py_full") {
    return contextAudit.raw?.injectionPy || "[not available]";
  }
  if (source === "role_mapping_full") {
    return contextAudit.raw?.roleMap || "[not available]";
  }
  if (source === "procedures_full") {
    return contextAudit.raw?.procedures || "[not available]";
  }
  return "[unknown source]";
}

function ctxSetDrilldownSource(source) {
  ctxDrill.source = source || "roster_team";
  renderContextMonitor(selectedTeam);
}

function ctxSetDrilldownTeam(teamId) {
  ctxDrill.teamId = teamId || selectedTeam?.id || null;
  renderContextMonitor(selectedTeam);
}

function renderContextMonitor(team) {
  const el = document.getElementById("ctx-monitor-content");
  if (!el) return;
  const activeTeamId = ctxDrill.teamId || team?.id || selectedTeam?.id || "team_10";
  if (!contextAudit || contextAudit.loading) {
    el.innerHTML = `<div class="loading">Loading context monitor data…</div>`;
    return;
  }
  if (!contextAudit.ready) {
    el.innerHTML = `<div class="error-msg">Context monitor unavailable: ${escHtml(contextAudit.error || "unknown error")}</div>`;
    return;
  }
  const total = (contextAudit.matrix || []).length;
  const rosterOnly = (contextAudit.matrix || []).filter(r => r.inRoster && !r.inUI).length;
  const uiOnly = (contextAudit.matrix || []).filter(r => r.inUI && !r.inRoster).length;
  const missingIdentity = (contextAudit.matrix || []).filter(r => r.inUI && !r.hasIdentity).length;
  const gapsHigh = (contextAudit.gaps || []).filter(g => g.severity === "HIGH").length;
  const layers = [
    {
      layer: "Identity",
      definition: "AGENTS_OS_V2 operating procedures",
      runtime: "build_full_agent_prompt + load_team_identity",
      source: "agents_os_v2/context/identity/team_*.md",
    },
    {
      layer: "Governance",
      definition: "AGENTS_OS_V2 operating procedures",
      runtime: "load_governance_rules + conventions",
      source: "agents_os_v2/context/governance + conventions",
    },
    {
      layer: "State",
      definition: "AGENTS_OS_V2 operating procedures",
      runtime: "build_state_summary",
      source: "_COMMUNICATION/agents_os/STATE_SNAPSHOT.json + pipeline_state_*.json",
    },
    {
      layer: "Task",
      definition: "AGENTS_OS_V2 operating procedures",
      runtime: "build_full_agent_prompt(task_message) / build_canonical_message",
      source: "orchestrator prompts + gate-specific generators",
    },
  ];
  const layerRows = layers.map(l => `
    <tr>
      <td>${escHtml(l.layer)}</td>
      <td>${escHtml(l.definition)}</td>
      <td>${escHtml(l.runtime)}</td>
      <td><code>${escHtml(l.source)}</code></td>
    </tr>`).join("");
  const matrixRows = (contextAudit.matrix || []).map(r => `
    <tr class="${r.teamId === activeTeamId ? "ctx-row-active" : ""}">
      <td><code>${escHtml(r.teamId)}</code></td>
      <td>${_ynPill(r.inRoster)}</td>
      <td>${_ynPill(r.inUI)}</td>
      <td>${_ynPill(r.hasIdentity)}</td>
      <td>${_ynPill(r.inConfigMap)}</td>
      <td>${_ynPill(r.inOverride)}</td>
      <td>${_ynPill(r.inCursorrules)}</td>
      <td><span class="ctx-engine-val">${escHtml(r.rosterEngine || "—")}</span></td>
      <td><span class="ctx-engine-val">${escHtml(r.uiEngine || "—")}</span></td>
    </tr>`).join("");
  const gapRows = (contextAudit.gaps || []).map(g => `
    <tr>
      <td><span class="ctx-gap-tag ${_severityClass(g.severity)}">${escHtml(g.severity)}</span></td>
      <td><code>${escHtml(g.id)}</code></td>
      <td>${escHtml(g.summary)}</td>
    </tr>`).join("");
  const drilldownOptions = [
    { id: "roster_team", label: "Roster Team JSON" },
    { id: "ui_team", label: "UI Team Model" },
    { id: "identity_team", label: "Identity Markdown" },
    { id: "engine_override_team", label: "Engine Override JSON" },
    { id: "roster_meta", label: "Roster _meta" },
    { id: "cursorrules_full", label: ".cursorrules (full)" },
    { id: "agents_md_full", label: "AGENTS.md (full)" },
    { id: "config_py_full", label: "agents_os_v2/config.py (full)" },
    { id: "injection_py_full", label: "agents_os_v2/context/injection.py (full)" },
    { id: "role_mapping_full", label: "Role Mapping Doc (full)" },
    { id: "procedures_full", label: "AOS Operating Procedures (full)" },
  ];
  const sourceOpts = drilldownOptions.map(o =>
    `<option value="${escAttr(o.id)}"${ctxDrill.source === o.id ? " selected" : ""}>${escHtml(o.label)}</option>`
  ).join("");
  const teamOpts = (contextAudit.matrix || []).map(r =>
    `<option value="${escAttr(r.teamId)}"${activeTeamId === r.teamId ? " selected" : ""}>${escHtml(r.teamId)}</option>`
  ).join("");
  const drillText = _drilldownText(ctxDrill.source, activeTeamId);
  el.innerHTML = `
    <div class="ctx-kpi-grid">
      <div class="ctx-kpi"><span class="ctx-kpi-label">Teams in Matrix</span><strong>${total}</strong></div>
      <div class="ctx-kpi"><span class="ctx-kpi-label">UI Only</span><strong>${uiOnly}</strong></div>
      <div class="ctx-kpi"><span class="ctx-kpi-label">Roster Only</span><strong>${rosterOnly}</strong></div>
      <div class="ctx-kpi"><span class="ctx-kpi-label">Missing Identity</span><strong>${missingIdentity}</strong></div>
      <div class="ctx-kpi"><span class="ctx-kpi-label">High Gaps</span><strong>${gapsHigh}</strong></div>
    </div>

    <details class="ctx-acc" open>
      <summary>📚 Structure: 4 Context Layers</summary>
      <div class="ctx-acc-body">
        <table class="ctx-table">
          <thead><tr><th>Layer</th><th>Definition</th><th>Runtime Builder</th><th>Primary Source</th></tr></thead>
          <tbody>${layerRows}</tbody>
        </table>
      </div>
    </details>

    <details class="ctx-acc" open>
      <summary>🧩 Cross-Source Matrix (Team Coverage)</summary>
      <div class="ctx-acc-body">
        <table class="ctx-table">
          <thead><tr><th>Team</th><th>Roster</th><th>UI</th><th>Identity</th><th>ConfigMap</th><th>Override</th><th>.cursorrules</th><th>Roster Engine</th><th>UI/Override Engine</th></tr></thead>
          <tbody>${matrixRows}</tbody>
        </table>
      </div>
    </details>

    <details class="ctx-acc" open>
      <summary>🔬 Drilldown (Full Content)</summary>
      <div class="ctx-acc-body">
        <div class="ctx-drill-controls">
          <label>Source</label>
          <select onchange="ctxSetDrilldownSource(this.value)">${sourceOpts}</select>
          <label>Team</label>
          <select onchange="ctxSetDrilldownTeam(this.value)">${teamOpts}</select>
        </div>
        <pre class="ctx-drill-content">${escHtml(drillText)}</pre>
      </div>
    </details>

    <details class="ctx-acc" open>
      <summary>🚨 Gap Tracker (For Immediate Closure)</summary>
      <div class="ctx-acc-body">
        <table class="ctx-table">
          <thead><tr><th>Severity</th><th>Gap ID</th><th>Summary</th></tr></thead>
          <tbody>${gapRows || `<tr><td colspan="3">No gaps detected</td></tr>`}</tbody>
        </table>
      </div>
    </details>
  `;
}

function buildPrompt(team, typeId, injectionMode) {
  injectionMode = injectionMode || "hard";
  if (injectionMode === "rag") {
    const modeLabels = { reset: "Full Reset", reinforce: "Identity Reinforcement", handoff: "Handoff / Onboard", governance: "Governance Reminder" };
    return `@${team.id}.md @STATE_SNAPSHOT.json @PHOENIX_MASTER_WSM_v1.0.0.md

You are ${team.name}. Read your identity file and establish your rules.
Current state is in @STATE_SNAPSHOT.json.
Operational state is in @PHOENIX_MASTER_WSM_v1.0.0.md.
Task Focus: [${modeLabels[typeId] || "Pending Task"}]`;
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
  // Always show RAG prompt in preview as it requires no dynamic system variables
  out.textContent = buildPrompt(selectedTeam, selectedPromptType, "rag");
}

function copyPrompt(injectionMode) {
  injectionMode = injectionMode || "rag";
  const missing = _missingSystemVars();
  const text = injectionMode === "rag"
    ? buildPrompt(selectedTeam, selectedPromptType, "rag")
    : (missing.length > 0 ? null : buildPrompt(selectedTeam, selectedPromptType, "hard"));
    
  if (injectionMode === "hard" && missing.length > 0) {
    _showValidationPanel(missing);
    alert("Cannot copy Hard-Injection — prompt has unresolved system variables. Fill them in below.");
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
  loadState();
});
