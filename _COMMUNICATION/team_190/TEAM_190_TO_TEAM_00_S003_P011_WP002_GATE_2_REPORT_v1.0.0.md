---
id: TEAM_190_TO_TEAM_00_S003_P011_WP002_GATE_2_REPORT_v1.0.0
historical_record: true
from: Team 190 (Constitutional Validator)
to: Team 00 (Nimrod)
date: 2026-03-20
status: DRAFT_WORKING_DOC
program: S003-P011
wp: S003-P011-WP002
gate: GATE_2
phase: 2.1
type: REPORT
domain: agents_os
purpose: Temporary working report for context model alignment and remediation planning before architect review---

# S003-P011-WP002 — Context Model Alignment (Temporary Working Report)

## 0) Scope

דוח זמני זה מרכז בצורה טבלאית:
1. פרמטרים מלאים לכל צוות.
2. ארבע שכבות הקונטקסט והיכן הן מוגדרות/נבנות.
3. הצלבות בין מקורות המידע.
4. חוסרים/פערים מזוהים.
5. תוכנית תיקון מוצעת בשלבים.

---

## 1) Sources Scanned (Evidence Map)

| # | Source | Role in system | SSOT claim | Notes |
|---|---|---|---|---|
| 1 | `documentation/docs-governance/01-FOUNDATIONS/TEAMS_ROSTER_v1.0.0.json` | Team definitions + 4-layer metadata | Yes (explicit) | Declares itself as single source of truth |
| 2 | `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md` | Governance role mapping | Canonical governance doc | Contains team definitions not fully synchronized with roster |
| 3 | `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md` | Defines 4-layer context model | Active procedure | Defines layer semantics and rule "use generated prompt as-is" |
| 4 | `agents_os_v2/context/injection.py` | Runtime context construction | Runtime implementation | Builds Identity/Governance/State/Task prompt payload |
| 5 | `agents_os_v2/config.py` | Engine map + domain defaults + state paths | Runtime config | Contains team set that differs from roster |
| 6 | `_COMMUNICATION/agents_os/team_engine_config.json` | Engine overrides (dashboard/API) | Operational override | Currently contains only one team override |
| 7 | `agents_os/ui/js/pipeline-teams.js` | UI teams model + prompt builder | Not SSOT | Holds hardcoded team catalog; diverges from roster |
| 8 | `AGENTS.md` + `.cursorrules` | Onboarding and runner constraints | Governance bootstrap | Contains partial team subset in onboarding prompt |

---

## 2) Full Team Parameter Model (Canonical Schema)

### 2.1 Top-level team object fields

| Field | Type | Meaning | Defined in |
|---|---|---|---|
| `id` | string | Canonical team id (`team_XX`) | TEAMS_ROSTER |
| `label` | string | Display label | TEAMS_ROSTER |
| `name` | string | Human-readable team name | TEAMS_ROSTER |
| `engine` | string | Primary execution engine | TEAMS_ROSTER |
| `domain` | enum-like string | Domain scope (`tiktrack` / `agents_os` / `multi`) | TEAMS_ROSTER |
| `status` | string | Team lifecycle status | TEAMS_ROSTER |
| `in_gate_process` | bool | Participates in gate pipeline | TEAMS_ROSTER |
| `layer_1_identity` | object | Identity layer metadata | TEAMS_ROSTER |
| `layer_2_authority` | object | Governance/authority layer metadata | TEAMS_ROSTER |
| `layer_3_knowledge` | object | Knowledge context pointers | TEAMS_ROSTER |
| `layer_4_procedure` | object | Procedure paths and iron rules | TEAMS_ROSTER |

### 2.2 Layer 1 (`layer_1_identity`) fields

| Field | Meaning |
|---|---|
| `role` | Team role and scope statement |
| `parent` | Parent team in hierarchy |
| `children` | Child teams |
| `model` | Optional operating model |
| `note` | Optional explanatory note |
| `principal_clarification` | Optional principal-level clarification |

### 2.3 Layer 2 (`layer_2_authority`) fields

| Field | Meaning |
|---|---|
| `gate_authority` | Gate-by-gate authority matrix |
| `can_override` | Override ability |
| `writes_to` | Allowed output paths |
| `governed_by` | Governing docs/contracts |

### 2.4 Layer 3 (`layer_3_knowledge`) fields

| Field | Meaning |
|---|---|
| `mandatory_reads_on_startup` | Required docs on startup |
| `constitution_path` | Team constitution path |
| `activation_prompt_path` | Activation prompt path |

### 2.5 Layer 4 (`layer_4_procedure`) fields

| Field | Meaning |
|---|---|
| `sop_path` | SOP path |
| `inbox_path` | Inbox path |
| `decisions_output_path` | Decisions output path |
| `iron_rules` | Team iron rules list |

---

## 3) Context Layers — Definition vs Runtime Construction

| Layer | Governance definition | Runtime builder | Data source(s) | Current risk |
|---|---|---|---|---|
| Identity | `AGENTS_OS_V2_OPERATING_PROCEDURES` §4 | `build_full_agent_prompt()` + `load_team_identity()` | `agents_os_v2/context/identity/team_*.md` + roster identity metadata | Missing identity files for some active teams |
| Governance | `AGENTS_OS_V2_OPERATING_PROCEDURES` §4 | `load_governance_rules()` (+ conventions) | `agents_os_v2/context/governance/`, `agents_os_v2/context/conventions/` | Medium risk of drift if UI prompts bypass pipeline |
| State | `AGENTS_OS_V2_OPERATING_PROCEDURES` §4 | `build_state_summary()` | `_COMMUNICATION/agents_os/STATE_SNAPSHOT.json` + domain state files | Snapshot freshness and old gate IDs can drift |
| Task | `AGENTS_OS_V2_OPERATING_PROCEDURES` §4 | `build_full_agent_prompt(task_message)` / `build_canonical_message(...)` | Orchestrator command context + gate-specific generators | Multiple channels can produce conflicting task framing |

---

## 4) Team Cross-Source Coverage Matrix

Legend: `Y` = exists, `N` = missing

| Team | Roster | UI `pipeline-teams.js` | Identity file (`context/identity`) | Engine map (`config.py`) | Engine override (`team_engine_config.json`) | `.cursorrules` onboarding list | Gap Summary |
|---|---:|---:|---:|---:|---:|---:|---|
| team_00 | Y | Y | Y | Y | N | N | Not listed in onboarding squad question |
| team_10 | Y | Y | Y | Y | N | N | Missing from onboarding squad list |
| team_11 | N | Y | N | Y | N | N | Exists in UI/config but absent in roster and identity |
| team_20 | Y | Y | Y | Y | N | Y | Aligned |
| team_30 | Y | Y | Y | Y | N | Y | Aligned |
| team_31 | Y | Y | N | N | N | N | In roster/UI but no identity/config entry |
| team_40 | Y | Y | Y | Y | N | Y | Aligned |
| team_50 | Y | Y | Y | Y | N | Y | Aligned |
| team_51 | Y | Y | Y | Y | N | Y | Aligned |
| team_60 | Y | Y | Y | Y | N | Y | Aligned |
| team_61 | Y | Y | Y | Y | N | Y | Aligned |
| team_70 | Y | Y | Y | Y | Y | Y | Override exists (only team with override) |
| team_90 | Y | Y | Y | Y | N | N | Missing from onboarding squad list |
| team_100 | Y | Y | Y | Y | N | N | Missing from onboarding squad list |
| team_101 | N | Y | Y | Y | N | N | UI/config/identity exist but no roster record |
| team_102 | N | Y | N | Y | N | N | UI/config exist but no roster/identity |
| team_170 | Y | Y | Y | Y | N | Y | Aligned |
| team_190 | Y | Y | Y | Y | N | Y | Aligned |
| team_191 | Y | Y | N | Y | N | Y | Missing identity file |

---

## 5) Engine Contradictions (Sample High-Impact)

| Team | Roster engine | `config.py` engine | UI engine | Override file | Status |
|---|---|---|---|---|---|
| team_00 | `claude-code` | `human` | `human` | none | Conflict |
| team_70 | `codex` | `cursor` | `cursor` | `cursor` | Conflict |
| team_100 | `codex` | `claude` | `claude` | none | Conflict |

Impact: לא ברור איזה מקור קובע בפועל בכל רכיב (UI / pipeline / governance review), מה שעלול לשבור ניתוב משימות ובקרת שערים.

---

## 6) Identified Gaps and Missing Items

| Gap ID | Severity | Finding | Evidence |
|---|---|---|---|
| GAP-01 | HIGH | Team catalog divergence: roster vs UI/config | `TEAMS_ROSTER_v1.0.0.json` vs `pipeline-teams.js` vs `config.py` |
| GAP-02 | HIGH | Missing identity files for active teams (`team_11`, `team_102`, `team_191`) | `agents_os_v2/context/identity/` |
| GAP-03 | HIGH | SSOT claim exists, but UI still hardcodes team definitions | Roster note says UI should read roster directly |
| GAP-04 | MEDIUM | `.cursorrules` onboarding list covers only subset of teams | `.cursorrules` "Which Squad ID..." list |
| GAP-05 | MEDIUM | Engine override file effectively partial (single-team override) | `_COMMUNICATION/agents_os/team_engine_config.json` |
| GAP-06 | MEDIUM | Multiple prompt channels can create non-identical context (pipeline vs UI generator) | `pipeline.py` + `pipeline-teams.js` |
| GAP-07 | LOW | Team naming/role text inconsistencies between governance and UI wording | Role-mapping doc vs UI strings |

---

## 7) Context-Build Channels (Operational Review)

| Channel | Purpose | Layer contribution | Primary file(s) | Drift risk |
|---|---|---|---|---|
| Onboarding bootstrap | Runner setup and basic role constraints | Identity + Governance | `AGENTS.md`, `.cursorrules` | Medium |
| Pipeline generated prompt | Canonical execution prompt | All 4 layers | `agents_os_v2/orchestrator/pipeline.py`, `agents_os_v2/context/injection.py` | Low (if used exclusively) |
| UI prompt builder | Manual copy prompt flows | Identity + State + Task | `agents_os/ui/js/pipeline-teams.js` | High |
| Activation docs in communication folders | Team-specific activation/instruction packages | Identity + Task | `_COMMUNICATION/team_*/...` | Medium |

---

## 8) Recommended Remediation Plan (Working Draft)

### Phase A — SSOT Lock (Priority P0)
1. Freeze authoritative team catalog to one source:
   - `TEAMS_ROSTER_v1.0.0.json` (or publish `v1.1.0` and explicitly lock it).
2. Publish architect decision: "UI and runtime must consume roster, not duplicate it."
3. Approve canonical engine source precedence:
   - Option 1: Roster base + override file.
   - Option 2: Config map base + roster metadata.

### Phase B — Data Completion (Priority P0/P1)
1. Add missing roster entries if approved (`team_11`, `team_101`, `team_102`) or remove them from runtime/UI until approved.
2. Add missing identity files:
   - `agents_os_v2/context/identity/team_11.md`
   - `agents_os_v2/context/identity/team_102.md`
   - `agents_os_v2/context/identity/team_191.md`
3. Expand onboarding team list in `.cursorrules` or delegate to roster lookup.

### Phase C — Runtime Alignment (Priority P1)
1. Refactor `pipeline-teams.js` to load teams from roster JSON.
2. Keep UI-only fields in a thin overlay map (presentation only), not as duplicated team authority data.
3. Add CI check: fail if team IDs diverge across roster/UI/config/identity.

### Phase D — Validation and Sign-off (Priority P1)
1. Dry-run matrix for two domains (`tiktrack`, `agents_os`) with both tracks.
2. Verify generated prompts include valid 4-layer context for each active team.
3. Team 190 validation pass + Team 100 architecture review + Team 00 approval.

---

## 9) Acceptance Criteria for This Temporary Working Doc

| AC ID | Criterion |
|---|---|
| AC-TEMP-01 | Team 00 approves this temporary gap map as baseline |
| AC-TEMP-02 | SSOT precedence decision (roster/config/override) is explicitly selected |
| AC-TEMP-03 | Missing teams/identity files are resolved by approved action list |
| AC-TEMP-04 | Architect package can be generated directly from this report without re-discovery |

---

## 10) Next Output After Approval

After Team 00 approval of this temporary document:
1. Produce architect-ready package (Team 100 + Team 190).
2. Convert approved remediation plan into a formal WP execution plan.
3. Register tasks with owners, dependencies, and gates.

---

**log_entry | TEAM_190 | S003_P011_WP002 | CONTEXT_ALIGNMENT_TEMP_REPORT | DRAFT_WORKING_DOC | 2026-03-20**
