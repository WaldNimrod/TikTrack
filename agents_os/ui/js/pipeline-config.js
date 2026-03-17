/* pipeline-config.js — Team 61 AOUI LOD400 — all config constants */
/* Paths relative to HTML in agents_os/ui/ → ../../ to repo root */

const GATE_SEQUENCE = [
  "GATE_0", "GATE_1", "GATE_2", "WAITING_GATE2_APPROVAL",
  "G3_PLAN", "G3_5", "G3_6_MANDATES",
  "CURSOR_IMPLEMENTATION",
  "GATE_4", "GATE_5", "GATE_6", "WAITING_GATE6_APPROVAL",
  "GATE_7", "GATE_8"
];

const GATE_CONFIG = {
  "GATE_0":                 { owner: "team_190",    engine: "codex",         desc: "Team 190 validates scope", twoPaths: true },
  "GATE_1":                 { owner: "team_190",    engine: "codex",         desc: "Team 170 + 190: LLD400", twoPaths: true },
  "GATE_2":                 { owner: "team_100",    engine: "codex+human",   desc: "Team 100 → approve spec", twoPaths: true },
  "WAITING_GATE2_APPROVAL": { owner: "team_00",     engine: "human",         desc: "Nimrod approves GATE_2", twoPaths: true },
  "G3_PLAN":                { owner: "team_10",      engine: "cursor",        desc: "Build work plan", twoPaths: true },
  "G3_5":                   { owner: "team_90",     engine: "codex",         desc: "Validate work plan", twoPaths: true },
  "G3_6_MANDATES":          { owner: "team_10",     engine: "orchestrator",   desc: "Generate team mandates", twoPaths: false },
  "CURSOR_IMPLEMENTATION":  { owner: "teams_20+30", engine: "cursor",         desc: "Implement (Teams 20+30)", twoPaths: false },
  "GATE_4":                 { owner: "team_50",     engine: "cursor+mcp",     desc: "QA — Team 50", twoPaths: true },
  "GATE_5":                 { owner: "team_90",     engine: "codex",          desc: "Dev validation", twoPaths: true },
  "GATE_6":                 { owner: "team_100",    engine: "codex+human",     desc: "Team 100 → reality vs intent", twoPaths: true },
  "WAITING_GATE6_APPROVAL": { owner: "team_00",     engine: "human",          desc: "Nimrod approves GATE_6", twoPaths: true },
  "GATE_7":                 { owner: "team_90",     engine: "human",          desc: "Team 90 orchestrates UX review; Nimrod browser sign-off", twoPaths: true },
  "GATE_8":                 { owner: "team_90",     engine: "codex",           desc: "Team 70 (shared — all domains) writes AS_MADE_REPORT + archives WP → Team 90 validates → WP CLOSED", twoPaths: true },
};

// Domain-aware mandate path resolver (Iron Rule, locked 2026-03-15)
// All mandate files are saved with domain prefix by pipeline.py:
//   tiktrack_gate_8_mandates.md  |  agentsos_gate_8_mandates.md
// Use getGateMandatePath(gate, domain) everywhere — never read GATE_MANDATE_FILES_BASE directly.
const GATE_MANDATE_FILES_BASE = {
  "GATE_1":                "GATE_1_mandates.md",
  "G3_PLAN":               "G3_PLAN_mandates.md",
  "G3_6_MANDATES":         "implementation_mandates.md",
  "CURSOR_IMPLEMENTATION": "implementation_mandates.md",
  "GATE_4":                "implementation_mandates.md",
  "GATE_8":                "gate_8_mandates.md",
};

function getGateMandatePath(gate, domain) {
  const base = GATE_MANDATE_FILES_BASE[gate];
  if (!base) return null;
  // domain slug: "tiktrack" → "tiktrack", "agents_os" → "agentsos"
  const slug = (domain || currentDomain || 'tiktrack').toLowerCase()
                .replace(/_/g, '').replace(/-/g, '');
  return `../../_COMMUNICATION/agents_os/prompts/${slug}_${base}`;
}

// Legacy alias kept for backward-compat checks (do NOT use for file loading)
const GATE_MANDATE_FILES = GATE_MANDATE_FILES_BASE;

const DOMAIN_STATE_FILES = {
  "tiktrack":  "../../_COMMUNICATION/agents_os/pipeline_state_tiktrack.json",
  "agents_os": "../../_COMMUNICATION/agents_os/pipeline_state_agentsos.json",
};

const LEGACY_STATE_FILE = "../../_COMMUNICATION/agents_os/pipeline_state.json";

const BOOSTER_TEAM_DATA = {
  "team_10":   { label: "Team 10",   name: "Work Plan Generator",        writesTo: ["../../_COMMUNICATION/team_10/"],   isoRules: ["No gate submission without all artifacts", "Work plan must be versioned", "Identity header mandatory on all outputs"] },
  "team_20":   { label: "Team 20",   name: "Backend Implementation",    writesTo: ["../../_COMMUNICATION/team_20/"],   isoRules: ["maskedLog mandatory on all server-side logging", "NUMERIC(20,8) for financial data", "4-state status model (pending/active/inactive/cancelled)"] },
  "team_30":   { label: "Team 30",   name: "Frontend Implementation",    writesTo: ["../../_COMMUNICATION/team_30/"],   isoRules: ["collapsible-container Iron Rule on ALL pages", "maskedLog mandatory", "Rich text: ONE unified object"] },
  "team_31":   { label: "Team 31",   name: "Blueprint Maker",            writesTo: ["../../staging/blueprints/"],        isoRules: ["OUTSIDE gate pipeline — no gate submissions", "Blueprint files are staging artifacts only — not production code"] },
  "team_50":   { label: "Team 50",   name: "QA & Functional Acceptance", writesTo: ["../../_COMMUNICATION/team_50/"],   isoRules: ["Team 50 = QA (Iron Rule)", "GATE_4 requires PASS evidence: commands + outputs + exit codes"] },
  "team_70":   { label: "Team 70",   name: "Documentation",               writesTo: ["../../_COMMUNICATION/team_70/"],   isoRules: ["All docs require identity header", "AS_MADE_REPORT mandatory at GATE_8"] },
  "team_90":   { label: "Team 90",   name: "Dev Validator",              writesTo: ["../../_COMMUNICATION/team_90/"],   isoRules: ["CRITICAL: Every GATE_5 run MUST be a FRESH validation", "route_recommendation MANDATORY in every BLOCKING_REPORT", "Do NOT return template or placeholder responses"] },
  "team_100":  { label: "Team 100",  name: "AOS Domain Architects",        writesTo: ["../../_COMMUNICATION/team_100/"],  isoRules: ["GATE_6 approval requires explicit evidence review", "route_recommendation mandatory if REJECTED", "LOD400 must be fully specified before issuing to Team 61"] },
  "team_170":  { label: "Team 170",  name: "Spec & Governance",           writesTo: ["../../_COMMUNICATION/team_170/"], isoRules: ["DDL is documentation only", "Registry updates require Team 00 awareness"] },
  "team_190":  { label: "Team 190",  name: "Constitutional Validator",     writesTo: ["../../_COMMUNICATION/team_190/"], isoRules: ["GATE_0 BLOCK stops all downstream work", "route_recommendation mandatory in all BLOCK reports"] },
  "teams_20+30": { label: "Teams 20+30", name: "Implementation",        writesTo: ["../../_COMMUNICATION/team_20/", "../../_COMMUNICATION/team_30/"], isoRules: ["maskedLog mandatory", "NUMERIC(20,8) for financial data", "collapsible-container Iron Rule on ALL pages"] },
  // AOS-domain teams (registered 2026-03-15)
  "team_51":   { label: "Team 51",   name: "AOS QA & Functional Acceptance", writesTo: ["../../_COMMUNICATION/team_51/"], isoRules: ["Team 51 = QA for AOS domain (Iron Rule)", "Every QA run must be FRESH — no repeating prior findings without re-execution"] },
  "team_61":   { label: "Team 61",   name: "AOS Local Cursor Implementation", writesTo: ["../../_COMMUNICATION/team_61/"], isoRules: ["Classic <script src> only — no ES modules", "agents-page-layout + agents-header mandatory on all AOS HTML pages", "Preflight URL test before QA submission"] },
  "team_191":  { label: "Team 191",  name: "Git-Governance Lane",            writesTo: ["../../_COMMUNICATION/team_191/"], isoRules: ["No constitutional verdicts (Team 190 only)", "No architectural rulings (Team 00/100 only)", "No business-logic changes under Git fix mandate"] },
};

const DOMAIN_GATE_OWNERS_JS = {
  "tiktrack": {
    "GATE_2":                 "team_00",
    "WAITING_GATE2_APPROVAL": "team_00",
    "GATE_6":                 "team_00",
    "WAITING_GATE6_APPROVAL": "team_00",
  },
  "agents_os": {
    "GATE_2":                 "team_100",
    "WAITING_GATE2_APPROVAL": "team_100",
    "GATE_6":                 "team_100",
    "WAITING_GATE6_APPROVAL": "team_100",
  },
};

/** AC-CS-06: Align to active WP. When no WP active: placeholder. Call at runtime (pipelineState must be loaded). */
function getExpectedFiles() {
  const wp = (typeof pipelineState !== "undefined" && pipelineState?.work_package_id) ? pipelineState.work_package_id : "";
  if (!wp || wp === "NONE") {
    return [{ label: "No active WP — expected files N/A", path: "" }];
  }
  if (wp.startsWith("S002-P005")) {
    return [
      { label: "Contract verify",     path: "../../_COMMUNICATION/team_61/TEAM_61_S002_P005_WP003_CONTRACT_VERIFY_v1.0.0.md" },
      { label: "G3_PLAN work plan",   path: "../../_COMMUNICATION/team_10/TEAM_10_S002_P005_WP003_G3_PLAN_WORK_PLAN_v1.1.0.md" },
      { label: "LLD400 spec",        path: "../../_COMMUNICATION/team_170/TEAM_170_S002_P005_WP003_LLD400_v1.0.0.md" },
      { label: "Mandates file",      path: "../../_COMMUNICATION/agents_os/prompts/agentsos_implementation_mandates.md" },
    ];
  }
  if (wp.startsWith("S001-P002")) {
    return [
      { label: "Team 20 API verify",  path: "../../_COMMUNICATION/team_20/TEAM_20_S001_P002_WP001_API_VERIFY_v1.0.0.md" },
      { label: "Team 30 widget JSX", path: "../../ui/src/components/AlertsSummaryWidget.jsx" },
      { label: "Team 30 HomePage",   path: "../../ui/src/components/HomePage.jsx" },
      { label: "Team 50 QA report",  path: "../../_COMMUNICATION/team_50/TEAM_50_S001_P002_WP001_QA_REPORT_v1.0.0.md" },
      { label: "G3_PLAN work plan", path: "../../_COMMUNICATION/team_10/TEAM_10_S001_P002_WP001_G3_PLAN_WORK_PLAN_v1.1.0.md" },
      { label: "Mandates file",     path: "../../_COMMUNICATION/agents_os/prompts/implementation_mandates.md" },
    ];
  }
  return [{ label: `WP ${wp} — paths TBD`, path: "" }];
}

/** @deprecated Use getExpectedFiles() at runtime. Fallback for S001-P002 when pipelineState unset. */
const EXPECTED_FILES = [
  { label: "Team 20 API verify",   path: "../../_COMMUNICATION/team_20/TEAM_20_S001_P002_WP001_API_VERIFY_v1.0.0.md" },
  { label: "Team 30 widget JSX",   path: "../../ui/src/components/AlertsSummaryWidget.jsx" },
  { label: "Team 30 HomePage",     path: "../../ui/src/components/HomePage.jsx" },
  { label: "Team 50 QA report",     path: "../../_COMMUNICATION/team_50/TEAM_50_S001_P002_WP001_QA_REPORT_v1.0.0.md" },
  { label: "G3_PLAN work plan",     path: "../../_COMMUNICATION/team_10/TEAM_10_S001_P002_WP001_G3_PLAN_WORK_PLAN_v1.1.0.md" },
  { label: "Mandates file",        path: "../../_COMMUNICATION/agents_os/prompts/implementation_mandates.md" },
];

/** SPC-01: Authorized stage exceptions — when stage is CLOSED/COMPLETE but architect directive authorizes parallel activation */
const AUTHORIZED_STAGE_EXCEPTIONS = {
  "S001": {
    authority_ref:  "ARCHITECT_DIRECTIVE_S001_P002_ACTIVATION_v1.0.0.md",
    authority_path: "../../_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_S001_P002_ACTIVATION_v1.0.0.md",
    description:    "S001-P002 Deferred Parallel Activation — authorized by Team 00 (2026-03-14)",
    authorized_programs: ["S001-P002"],
  },
  "S003": {
    authority_ref:  "TEAM_100_PIPELINE_RESILIENCE_LOD400_DRAFT_v1.0.0.md",
    authority_path: "../../_COMMUNICATION/team_100/TEAM_100_PIPELINE_RESILIENCE_LOD400_DRAFT_v1.0.0.md",
    description:    "S003-P009 Pipeline Resilience Package — authorized by Team 00 (2026-03-17); WSM active_stage=S002 but pipeline work is S003-domain",
    authorized_programs: ["S003-P009"],
  },
};

/** Canonical task files (Roadmap sidebar) */
const CANONICAL_FILES = [
  { label: "Known Bugs Register",            path: "../../documentation/docs-governance/01-FOUNDATIONS/KNOWN_BUGS_REGISTER_v1.0.0.md" },
  { label: "Bugs Remediation Procedure",      path: "../../documentation/docs-governance/04-PROCEDURES/KNOWN_BUGS_REMEDIATION_GOVERNANCE_PROCEDURE_v1.0.0.md" },
  { label: "Master Task List (Team 10)",     path: "../../_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST.md" },
  { label: "Level-2 Carryover List",          path: "../../_COMMUNICATION/team_10/TEAM_10_LEVEL2_COMPLETION_CARRYOVER_LIST.md" },
  { label: "Level-2 Registry",                path: "../../_COMMUNICATION/team_10/TEAM_10_LEVEL2_LISTS_REGISTRY.md" },
  { label: "WSM — Live Operational State",    path: "../../documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md" },
  { label: "Portfolio Roadmap",               path: "../../documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md" },
  { label: "Program Registry",                path: "../../documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md" },
  { label: "SSM (Governance Constitution)",  path: "../../documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md" },
  { label: "Iron Rules",                      path: "../../documentation/docs-governance/01-FOUNDATIONS/03_IRON_RULES_AND_GOVERNANCE_CONSTITUTION.md" },
  { label: "ADR-031 Open Items",              path: "../../_COMMUNICATION/agents_os/AGENTS_OS_ADR031_OPEN_ITEMS_v1.0.0.md" },
];
