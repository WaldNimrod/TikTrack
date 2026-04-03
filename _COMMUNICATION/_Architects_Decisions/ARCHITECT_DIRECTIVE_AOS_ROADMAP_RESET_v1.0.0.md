---
project_domain: AGENTS_OS
id: ARCHITECT_DIRECTIVE_AOS_ROADMAP_RESET_v1.0.0
historical_record: true
from: Team 00 (Chief Architect — Nimrod)
authority: CONSTITUTIONAL — IRON RULE
date: 2026-03-19
status: ACTIVE — BINDING ON ALL TEAMS
supersedes: S003-P007 (MERGED), S003-P008 (SUPERSEDED)---

# ARCHITECT DIRECTIVE — AOS Roadmap Reset & Decision Lock
## V3 Program Architecture: Semi-Auto + Dashboard Milestone

---

## 0. Context & Authorization

This directive is issued following:
1. S003-P009-WP001 (Pipeline Resilience) test flight — completed 2026-03-18
2. Team 101 market research + IDEA-040 (7-Pillar proposal)
3. Team 100 architectural review session — 2026-03-19
4. Nimrod (Team 00) explicit approval of all decisions below

**All decisions in this directive are LOCKED and effective immediately.**

---

## 1. Goal Declaration — AOS V3 Target State

**One sentence:** agents_os transitions from a CLI-dependent tool to a semi-automatic pipeline orchestrator operable entirely from the Dashboard, with deterministic validation and self-correcting remediation cycles.

**Success criteria (measurable):**
1. A new operator can run a full pipeline cycle (GATE_0 → GATE_8) without executing a single CLI command
2. Remediation cycles produce targeted fix mandates — never full re-implementation
3. All validation verdict files are machine-parseable without regex fragility
4. The Dashboard shows the exact next action required at all times
5. File watcher eliminates manual `./pipeline_run.sh pass` for ≥70% of gate transitions

---

## 2. Program Architecture — LOCKED

### 2.1 Two Programs Replace Four

| Old Program | Status | Disposition |
|---|---|---|
| S003-P007 (Command Bridge Lite) | **MERGED** | Scope absorbed into S003-P011-WP001. ADR-031 Stage B is fully delivered through P011-WP001. |
| S003-P008 (Pipeline Governance Hardening) | **SUPERSEDED** | LOD200 acknowledged; all scope absorbed into S003-P010. |
| **S003-P010** (Pipeline Core Reliability) | **NEW — ACTIVE** | Core pipeline reliability: Remediation Engine, JSON Protocol, Auto-Correction |
| **S003-P011** (Dashboard Copilot + Event-Driven) | **NEW — ACTIVE** | Dashboard as primary interface: Guided Copilot, File Watcher |

### 2.2 S003-P010 — Pipeline Core Reliability

**Mission:** Make the pipeline mechanically correct — remediation that actually remediates, validation that is deterministically parseable, pre-flight correction that eliminates avoidable failures.

| WP | Name | Core Deliverable |
|---|---|---|
| WP001 | Remediation Engine | `G3_REMEDIATION` gate; `remediation_mandates.md`; Team 50 removed from CURSOR_IMPLEMENTATION; `last_blocking_findings` in state.py; FAIL routing fixes |
| WP002 | JSON Verdict Protocol | Single JSON fenced-block standard for all verdicts; `json_enforcer.py`; pipeline.py reads JSON not regex |
| WP003 | Auto-Correction + STATE_VIEW | Date auto-fix pre-validation hook; `STATE_VIEW.json` generator; IDEA-039 non-breaking gate aliases |

**Sequencing:** WP001 → WP002 → WP003 (strictly sequential)

### 2.3 S003-P011 — Dashboard Copilot + Event-Driven

**Mission:** Make the Dashboard the primary operational interface — active guidance, not passive status display.

| WP | Name | Core Deliverable |
|---|---|---|
| WP001 | Active Guided Copilot | Explicit next-action display; routing action buttons; ADR-031 Stage B scope (copy flow, desync fix, model-B); phase awareness |
| WP002 | Event-Driven File Watcher | `_COMMUNICATION/` filesystem watcher; SSE push to dashboard; auto-advance on verified verdict file; eliminates manual `pass` for automated gates |

**Sequencing:** WP001 starts in parallel with P010-WP002; WP002 requires P010-WP002 GATE_8 (JSON verdicts must exist before watcher can parse them)

### 2.4 Execution Order Map

```
PARALLEL START (immediate):
  P010-WP001 (Remediation Engine)     ←→    P011-WP001 (Guided Copilot)
         ↓                                          ↓
  P010-WP002 (JSON Protocol)  ←── P011-WP001 completes independently
         ↓
  P010-WP003 (Auto-Correction)   P011-WP002 (Event-Driven) ← needs P010-WP002 ✅
```

---

## 3. Verdict Format — IRON RULE

### 3.1 Decision

**ALL verdict, blocking report, and validation output files in agents_os MUST use the JSON-fenced-block format as their first block.**

This is the single canonical verdict format. No other format is permitted for new verdict files.

### 3.2 Schema

```json
{
  "gate_id": "GATE_5",
  "decision": "PASS | BLOCK_FOR_FIX",
  "blocking_findings": [
    {"id": "BF-01", "description": "...", "evidence": "path/file.py:42"},
    {"id": "BF-02", "description": "...", "evidence": "path/file.py:87"}
  ],
  "route_recommendation": "doc | full",
  "summary": "One-sentence human-readable summary"
}
```

**Field rules:**
- `gate_id`: REQUIRED always
- `decision`: REQUIRED always; values: `PASS` or `BLOCK_FOR_FIX`
- `blocking_findings`: REQUIRED if `decision = BLOCK_FOR_FIX`; OMIT if PASS
- `route_recommendation`: REQUIRED if `decision = BLOCK_FOR_FIX`; values `doc` or `full`
- `summary`: REQUIRED always; max 200 chars

**Markdown body:** any human-readable content AFTER the JSON block is permitted and encouraged.

### 3.3 Enforcement

- `pipeline.py` extracts the FIRST ` ```json ` block → `json.loads()`. Parse failure = `MANUAL ROUTING REQUIRED`.
- `json_enforcer.py` (P010-WP002 deliverable): pre-flight JSON syntax auto-fixer — retries LLM silently on syntax error before raising MANUAL ROUTING.
- Regex-based `_extract_blocking_findings()` remains as legacy fallback for historical files ONLY — NOT for new verdicts.

### 3.4 Affected Teams

Teams 50, 90, 190 — ALL must adopt this format from P010-WP002 GATE_8 forward.
Team 170 must update all verdict file templates.
Team 10 must update all GATE_5 and GATE_4 prompt templates accordingly.

---

## 4. Remediation Flow — IRON RULE

### 4.1 Remediation Mandate Model

When a gate fails and routes back to execution:
1. Pipeline calls `_generate_remediation_mandate()` (new function, P010-WP001 deliverable)
2. Produces `remediation_mandates.md` (separate artifact, NEVER overwrites `implementation_mandates.md`)
3. `remediation_mandates.md` contains: BF verbatim + targeted tasks + explicit "DO NOT RE-IMPLEMENT FROM SCRATCH" prohibition + NON-SCOPE section
4. Execution team reads `remediation_mandates.md`, not the original

### 4.2 G3_REMEDIATION Gate — Scoped Usage

`G3_REMEDIATION` (new gate, P010-WP001 deliverable) is activated ONLY when:
- GATE_4 or GATE_5 fails with `route: full`
- AND blocking findings span multiple teams (deadlock scenario)

For single-team `doc` route failures: pipeline auto-injects BF directly into CURSOR_IMPLEMENTATION correction prompt — no Team 10 involvement.

For single-team `full` route failures: pipeline routes to `G3_6_MANDATES` with BF injected into new work plan. Team 10 produces scoped remediation work plan (NOT full feature re-plan).

### 4.3 Gate/Phase Separation

Team 50 (QA) is REMOVED from CURSOR_IMPLEMENTATION execution phase. From P010-WP001 forward:
- CURSOR_IMPLEMENTATION = Teams 20, 30, 61 ONLY
- GATE_4 = Team 10 coordinates, Team 50 executes QA. GATE_4 has full FAIL_ROUTING support.
- No QA team may appear in Phase 1, 2, or 3 of `implementation_mandates.md`

---

## 5. Disposition of Superseded Programs

### S003-P007 — MERGED

| Field | Value |
|---|---|
| Status | MERGED_INTO_S003-P011-WP001 |
| Effective date | 2026-03-19 |
| ADR-031 Stage B | Fully delivered through S003-P011-WP001 |
| Registry update | Team 170 must update PHOENIX_PROGRAM_REGISTRY: status = MERGED |
| Notes | P007 program number retired; no implementation against P007 ID permitted |

### S003-P008 — SUPERSEDED

| Field | Value |
|---|---|
| Status | SUPERSEDED_BY_S003-P010 |
| Effective date | 2026-03-19 |
| LOD200 | Acknowledged; scope absorbed. TEAM_100_AGENTS_OS_PIPELINE_GOVERNANCE_HARDENING_S003_P008_LOD200_v1.0.0.md = historical reference |
| Registry update | Team 170 must update PHOENIX_PROGRAM_REGISTRY: status = SUPERSEDED |
| Notes | No pipeline execution against P008 ID permitted |

---

## 6. S004 Programs — Unchanged

S004-P002 (Business Logic Validator), S004-P003 (Spec Draft Generator), S004-P008 (Mediated Reconciliation Engine) remain registered and PLANNED. These map to the "Road to Autonomy" milestone (S004). No changes to their scope or sequencing.

---

## 7. Immediate Actions Required

| Team | Action | Deadline |
|---|---|---|
| Team 170 | Update PHOENIX_PROGRAM_REGISTRY: P007 → MERGED, P008 → SUPERSEDED, P010 → ACTIVE, P011 → ACTIVE | After GATE_0 PASS for P010 |
| Team 190 | Validate P010-WP001 LOD200 at GATE_0 | Next pipeline cycle |
| Team 10 | Read this directive before next G3_PLAN execution | Immediate |
| Team 61 | Read this directive before next CURSOR_IMPLEMENTATION | Immediate |

---

**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE_AOS_ROADMAP_RESET | LOCKED_P010_P011_JSON_VERDICT_REMEDIATION_ENGINE | 2026-03-19**
