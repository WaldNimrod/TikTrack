---
id: TEAM_100_TO_TEAM_170_AOS_PIPELINE_DOCUMENTATION_MANDATE_v1.0.0
historical_record: true
from: Team 100 (Claude Code — Architect)
to: Team 170 (Spec & Governance — AOS Domain)
authority: Direct architectural instruction — authorized by Team 00 (Nimrod). Not part of any WSM work package. Active regardless of WSM state. This mandate overrides any pending AOS pipeline queue.
date: 2026-03-23
classification: ARCHITECT_DIRECTIVE
priority: HIGH---

# Team 170 — AOS Pipeline System Documentation Mandate
## Comprehensive Documentation: Pipeline Architecture + Dashboard + Decisions

**⚠️ AUTHORITY NOTE:** This mandate is a direct instruction from the Architect (Team 100, authorized by Team 00). It does not originate from a work package and is not gated by WSM state. Execute as a standalone documentation sprint. Return all deliverables to Team 100 for architectural review.

---

## 1. Purpose and Background

S003-P013-WP001 (TikTrack Canary Run, 2026-03-22/23) completed successfully. The run exposed significant documentation gaps in the AOS Pipeline system: no agent or developer can currently onboard to the pipeline without manual context transfer from Team 100 or Nimrod.

**This mandate produces comprehensive, self-contained documentation** that enables any new agent or developer to:
- Understand the full pipeline architecture from first principles
- Navigate the dashboard confidently
- Know every iron rule, canonical decision, and constraint
- Understand the intelligence gathered from the canary run

---

## 2. Documentation Scope — Required Deliverables

### DOC-170-01: Pipeline Architecture Reference
**File:** `documentation/docs-system/02-PIPELINE/AOS_PIPELINE_ARCHITECTURE_REFERENCE_v1.0.0.md`

**Content required:**

#### §1 — System Overview
- What is the AOS Pipeline? Purpose and role in the project
- The 5-gate canonical model: GATE_0 → GATE_1 → GATE_2 → GATE_3 → GATE_4 → GATE_5
- Gate responsibilities and ownership table (which team at each gate)
- Two-phase gates: GATE_1, GATE_2, GATE_5, GATE_8 — explain phase structure
- TRACK_FULL vs TRACK_FOCUSED vs TRACK_FAST process variants

#### §2 — Component Architecture
- `pipeline_run.sh` — the operator CLI wrapper: all commands, flags, and behavior
  - Commands: `pass`, `fail`, `route`, `phase*`, `status`, `generate`, `approve`
  - Required identifiers: `--domain`, `--wp`, `--gate`, `--phase` (KB-84 pattern)
  - Pipeline state file locations
- `agents_os_v2/orchestrator/pipeline.py` — the Python engine
  - `PipelineState` dataclass: all fields, meanings, and canonical values
  - Gate dispatch routing: how `--generate-prompt GATE_N` maps to functions
  - `_generate_mandate_doc()` + `MandateStep` — the mandate generation pattern
  - Auto-inject: `_read_coordination_file()` — how prior team artifacts flow to next phase
  - KB-84 guard: parameter validation logic
- `agents_os/ui/js/pipeline-dashboard.js` — the dashboard
  - State loading and auto-refresh
  - Mandate tab system: `_parseMandateSections()`, tab highlighting, phase badges
  - CSB (Current Step Block) and QAB (Quick Action Block)
  - File detection: `getExpectedFiles()`, `autoLoadVerdictFile()`, `extractVerdictStatus()`
  - Single source of truth: `getEffectiveVerdictTeam()` — WHY this matters
  - Pass-Ready CTA: when and how it appears
- `agents_os/ui/js/pipeline-config.js` — configuration
  - `ALL_GATE_DEFS` — gate definitions and ownership
  - `GATE_MANDATE_FILES_BASE` — which file each gate loads
  - `getGateMandatePath()` — domain-scoped path resolution

#### §3 — Gate-by-Gate Reference
For each gate (GATE_0 through GATE_5 + GATE_8):
- Gate purpose and trigger condition
- Who runs it (which team(s), which engine)
- Input: what files are needed
- Output: what canonical artifact is produced (canonical path format)
- Phase structure (if two-phase): Phase N → Phase N+1 transition command
- Acceptance criteria for PASS
- Common failure patterns and `route_recommendation` values (doc vs full)

#### §4 — Iron Rules (pipeline layer)
Extract and document ALL iron rules that apply to the pipeline layer:
- HITL boundary: operators advance pipeline, agents never run `pipeline_run.sh`
- WSM sync: mandatory at every gate transition (auto-sync after FIX-101-02)
- SSOT check: must exit 0 before any PASS
- Canonical file naming: CanonicalPathBuilder format
- `writes_to` mandatory in every mandate
- KB-84: identifier validation on all state-mutating commands
- Cross-engine validation principle
- One active stage globally

#### §5 — Team Roster (pipeline roles)
Table of all teams with:
- Team ID, engine, primary role
- Which gates they participate in
- Output artifact pattern (canonical filename structure)
- Relevant KB entries or known constraints

---

### DOC-170-02: Pipeline Dashboard User Guide
**File:** `documentation/docs-system/02-PIPELINE/AOS_PIPELINE_DASHBOARD_GUIDE_v1.0.0.md`

**Content required:**

#### §1 — Dashboard Overview
- URL and launch instructions
- Layout: header, accordion sections (Next Steps, Mandates, Human Review, QA, Roadmap)
- Domain selector: how to switch tiktrack ↔ agents_os
- Auto-refresh: 5s interval, what triggers re-render

#### §2 — Status Indicators
- Gate badge colors and meanings
- PASS / FAIL / PENDING / COMPLETE states
- Phase badge (P1, P2) — what active phase means
- `next-phase` tab highlight vs `correction-needed`
- Verdict detection: green file found / PASS badge / FAIL badge / unknown

#### §3 — Mandate Tabs
- How tabs are generated from the mandate file
- Phase 1 vs Phase 2 tabs — which is active when
- How to read each team's mandate section
- Coordination data injection: "✅ Auto-loaded" vs "⚠️ File not yet available"

#### §4 — Pass-Ready CTA
- When it appears
- Phase 5.1 exception: shows `phase2` command instead of `pass`
- How to use it: copy command → paste in terminal → verify → run

#### §5 — Human Review (GATE_4/4.3)
- HRC (Human Review Checklist): how to use
- PASS / BLOCK / PWA verdicts per item
- Bulk approve/reject buttons
- Final decision + artifact generation

#### §6 — File Detection and Verdict Scan
- How the dashboard finds team artifacts (glob patterns by gate/phase)
- `extractVerdictStatus()`: which verdict phrases are recognized
- Manual rescan: when and how to use it
- What to do if a file shows "unknown" verdict

#### §7 — Common Operator Actions (step-by-step)
- Starting a new work package: pre-conditions, reset, GATE_0
- Advancing a gate: run command → wait for agent → verify dashboard → run pass
- Running phase2: when, how, what changes on dashboard
- Recovering from fail: re-run flow, WSM state
- Troubleshooting: ssot_check exit 1, dashboard stale, mandate not loading

---

### DOC-170-03: Canary Run Retrospective & Decision Log
**File:** `documentation/docs-system/02-PIPELINE/CANARY_RUN_S003_P013_RETROSPECTIVE_v1.0.0.md`

**Content required:**

#### §1 — Run Summary
- WP: S003-P013-WP001 (D33 display_name)
- Dates: 2026-03-22 to 2026-03-23
- Result: ALL GATES PASS (GATE_0–GATE_5)
- Monitor: Team 100
- Process variant: TRACK_FOCUSED

#### §2 — Deviations Encountered
Summarize all 16 deviations from the flight log (FLIGHT_LOG_S003_P013_WP001_v1.0.0.md Section H.1):
- Severity, gate, description, resolution status
- Lessons learned per deviation
- Prevention mechanism added or recommended

#### §3 — Bugs Found and Fixed (KB register reference)
For each KB entry (KB-72 through KB-84 range):
- What the bug was
- Root cause
- Fix applied
- Prevention principle added

#### §4 — Architectural Decisions Made During Run
Document every decision that was made during the canary run that affects future pipeline behavior:
- DEV-GATE2-001 fix: HITL prohibition block pattern
- GATE_5 two-phase mandate architecture (new `_generate_gate_5_mandates()`)
- `getEffectiveVerdictTeam()` as single source of truth (mandate + CSB + QAB)
- `_parseMandateSections()` section regex pattern (why `## Team \d+`)
- `extractVerdictStatus()` CLOSURE_RESPONSE pattern (Team 70/90 doc closure format)
- KB-84 extension to phase2/fail/route commands
- conftest.py state file guard (pytest protection)
- `phase5_content` → `current_phase` naming correction
- `activePhase` logic for GATE_5 (uses `current_phase === '5.2'`)

#### §5 — Open Items for S003-P014 / Next Canary Run
Enumerate all unresolved issues from FIX-101-01 through FIX-101-07 (Team 101 delegation). Note:
- What each fix resolves
- How to verify once implemented
- Impact on next canary run if NOT fixed

#### §6 — Canary Intelligence: What to Monitor Next Run
Based on this run, what should Team 100 pay special attention to in the next monitored run?
- WSM sync automation (verify auto-sync working)
- GATE_2 phase structure (FIX-101-01 — verify all 5 phases work)
- Team 90 GATE_5 save path (verify explicit writes_to instruction followed)
- HITL boundary (verify no agent self-advances after FIX-101-03)
- Dashboard phase badge activation per gate (verify all two-phase gates)

---

### DOC-170-04: Agent Onboarding Quick Reference
**File:** `documentation/docs-system/02-PIPELINE/PIPELINE_AGENT_ONBOARDING_v1.0.0.md`

**Content required:**

A concise (2–3 page) reference card for any new agent starting work in the pipeline:

#### §1 — What You Need to Know (1 page)
- You are one team in a multi-team pipeline
- Your mandate tells you exactly what to do and where to save
- **You NEVER run `./pipeline_run.sh`** — this is the operator's (Nimrod's) tool
- Your artifact canonical path is in your mandate under "Output — write to:"
- Save your artifact → notify Nimrod → done

#### §2 — Canonical File Naming
- Pattern: `TEAM_{N}_{WP_SNAKE}_{PURPOSE}_v{VERSION}.md`
- Examples and anti-patterns
- How to derive your WP from the identity header in your mandate

#### §3 — Verdict Format Standards
For each team type (validation teams, doc teams, QA teams):
- Exactly what verdict phrase to use at the top of your file
- Recognized patterns: `VERDICT: PASS`, `CLOSURE_RESPONSE — PASS`, `BLOCKING_REPORT`, `FINAL DECISION: APPROVED`
- JSON verdict block format (if applicable)
- `route_recommendation` field: when and how to include

#### §4 — Coordination Data
- Your mandate may show `### Coordination Data — [X]` section
- If "✅ Auto-loaded": real data from prior team is already there — use it
- If "⚠️ File not yet available": prior team hasn't delivered yet — do not proceed
- Never copy-paste coordination data from a prior session into your response

---

## 3. Documentation Standards (MANDATORY)

All deliverables MUST comply with these standards:

| Standard | Requirement |
|---|---|
| **Self-contained** | A reader with NO prior context can understand the document without external briefing |
| **Current** | All content reflects canary run findings and latest code state (2026-03-23) |
| **Code references** | Every code reference includes `file:line_number` (e.g. `pipeline.py:1367`) |
| **Decision rationale** | Every architectural decision documents the WHY (not just what) |
| **Example-driven** | Each concept includes a concrete example (command, file snippet, or scenario) |
| **No stale content** | Do NOT copy-paste from legacy docs without verifying currency against current codebase |
| **Canonical paths** | All file paths verified to exist at time of writing |
| **Iron Rules flagged** | All iron rules marked with `⛔ IRON RULE:` prefix |

---

## 4. Source Material

Read these files before writing any documentation:

| File | Why |
|---|---|
| `_COMMUNICATION/team_00/monitor/FLIGHT_LOG_S003_P013_WP001_v1.0.0.md` | Full canary run record — 16 deviations, 8 KB entries, H.1–H.3 |
| `agents_os_v2/orchestrator/pipeline.py` | Full Python engine — read lines 459–2700 |
| `pipeline_run.sh` | Full shell wrapper — read all cases |
| `agents_os/ui/js/pipeline-dashboard.js` | Full dashboard logic |
| `agents_os/ui/js/pipeline-config.js` | Gate definitions and mandate file routing |
| `agents_os/ui/js/pipeline-commands.js` | Popup and prerequisite logic |
| `documentation/docs-governance/01-FOUNDATIONS/KNOWN_BUGS_REGISTER_v1.0.0.md` | KB-72 through KB-84 section |
| `_COMMUNICATION/team_101/TEAM_100_TO_TEAM_101_CANARY_FINDINGS_DELEGATION_v1.0.0.md` | Open items (FIX-101-01 to FIX-101-07) |

---

## 5. Deliverable Paths

| Deliverable | Canonical path |
|---|---|
| DOC-170-01: Architecture Reference | `documentation/docs-system/02-PIPELINE/AOS_PIPELINE_ARCHITECTURE_REFERENCE_v1.0.0.md` |
| DOC-170-02: Dashboard Guide | `documentation/docs-system/02-PIPELINE/AOS_PIPELINE_DASHBOARD_GUIDE_v1.0.0.md` |
| DOC-170-03: Canary Retrospective | `documentation/docs-system/02-PIPELINE/CANARY_RUN_S003_P013_RETROSPECTIVE_v1.0.0.md` |
| DOC-170-04: Agent Onboarding | `documentation/docs-system/02-PIPELINE/PIPELINE_AGENT_ONBOARDING_v1.0.0.md` |
| Completion report | `_COMMUNICATION/team_170/TEAM_170_PIPELINE_DOCS_COMPLETION_REPORT_v1.0.0.md` |

Create `documentation/docs-system/02-PIPELINE/` if it does not exist.

---

## 6. Acceptance Criteria (Team 100 review)

- [ ] All 4 documentation files created at canonical paths
- [ ] Each file is self-contained (readable without external briefing)
- [ ] All 16 canary deviations documented in DOC-170-03
- [ ] All 7 open fix items (FIX-101-01 to -07) documented in DOC-170-03 §5
- [ ] Iron Rules section in DOC-170-01 covers at minimum 8 rules
- [ ] Agent onboarding doc (DOC-170-04) is ≤ 3 pages and actionable for any new agent
- [ ] All code references verified with actual file:line
- [ ] Completion report saved at canonical path

---

`log_entry | TEAM_100 | TO_TEAM_170 | AOS_PIPELINE_DOCUMENTATION_MANDATE | 4_DELIVERABLES | AUTHORIZED_BY_TEAM_00 | 2026-03-23`
