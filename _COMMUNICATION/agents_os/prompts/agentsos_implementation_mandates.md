# Mandates — S003-P009-WP001  ·  G3_6_MANDATES

**Spec:** Pipeline Resilience Package — 3-tier file resolution, wsm_writer.py auto-write, targeted git integration (pre-GATE_4 + GATE_8), route alias normalization (4a/4b already implemented)

**Canonical date:** Use `date -u +%F` for today; replace {{date}} in identity headers.

════════════════════════════════════════════════════════════
  EXECUTION ORDER
════════════════════════════════════════════════════════════

  Phase 1:  Team 20   ← runs alone
             ↓  Phase 2 starts ONLY after Phase 1 completes
             💻  Phase 1 done?  →  ./pipeline_run.sh --domain agents_os phase2
             📄 Team 30 reads coordination data from Team 20

  Phase 2:  Team 30   ← runs alone
             ↓  Phase 3 starts ONLY after Phase 2 completes
             💻  Phase 2 done?  →  ./pipeline_run.sh --domain agents_os phase3

  Phase 3:  Team 50   ← runs alone

════════════════════════════════════════════════════════════

## Full Work Plan (reference)

---
project_domain: AGENTS_OS
id: TEAM_10_S003_P009_WP001_G3_PLAN_WORK_PLAN_v1.2.0
from: Team 10 (Execution Orchestrator / Work Plan Generator)
to: Team 61, Team 51, Team 170
cc: Team 00, Team 100, Team 190
date: 2026-03-17
status: ACTIVE
gate_id: G3_PLAN
program_id: S003-P009
work_package_id: S003-P009-WP001
scope: Pipeline Resilience Package — G3 Build Work Plan (G3_5 Blocker Remediation)
authority_mode: TEAM_10_GATE_3_OWNER
spec_source: TEAM_170_S003_P009_WP001_LLD400_v1.0.0.md
supersedes: TEAM_10_S003_P009_WP001_G3_PLAN_WORK_PLAN_v1.1.0
g35_remediation: BF-G3_5-WP001-001, BF-G3_5-WP001-002, BF-G3_5-WP001-003, BF-G3_5-WP001-RE2-001
---

# Team 10 | S003-P009-WP001 — G3 Work Plan v1.2.0 (G3_5 Blocker Remediation)

## G3_5 Blocker Fixes Summary

| Blocker | Severity | Fix Applied |
|---------|----------|-------------|
| **BF-G3_5-WP001: 001** | SEVERE | Structural completeness: Added G3_5 fixes table; §3.2 Gate Routing table (G3_PLAN→G3_5→G3_6); completed dependency rules; §2 canonical paths per team with exact file lists; §7 Team 61 completion artifact contract |
| **BF-G3_5-WP001: 002** | SEVERE | Test coverage operationalized: §5 P0/P1 tests with exact runnable commands; binary PASS/FAIL per row; copy-paste-ready steps; pytest + regression with explicit commands |
| **BF-G3_5-WP001: 003** | MAJOR | Team 61 completion artifact contract: §7 required sections (identity header, modified files list, Item 1/2/3 checklist, test evidence, handover prompt); format spec; Team 51 trigger |
| **BF-G3_5-WP001-RE2: 001** | SEVERE | Submitted work plan incomplete: Added §G3_5 Readiness Checklist (immediately below) to attest all required sections present; Team 90 can validate completeness before full read. Full plan in `_COMMUNICATION/team_10/TEAM_10_S003_P009_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md` |

---

## G3_5 Submission Readiness Checklist

**Attestation:** This work plan is structurally complete. All required sections present.

| # | Required Element | Section | Status |
|---|------------------|---------|--------|
| 1 | Identity header (gate/wp/stage/domain/date) | Mandatory Identity Header | ✓ |
| 2 | §2 Files per team (canonical paths) | §2.1 Canonical Paths; §2.2–2.5 per team | ✓ |
| 3 | §3 Execution order with dependencies | §3.1 Execution Order; §3.2 Gate Routing | ✓ |
| 4 | §4 API/contract (CLI, Python, JSON) | §4 API / Contract Summary | ✓ |
| 5 | §5 Test scenarios (operationalized) | §5 P0/P1 tests, pytest | ✓ |
| 6 | §6 Per-team acceptance criteria | §6.1–6.6 | ✓ |
| 7 | §7 Team 61 completion artifact contract | §7 | ✓ |
| 8 | Domain adaptation (Team 61 + 51, no 20/30) | §2, §6 | ✓ |

**Canonical file (full content):** `_COMMUNICATION/team_10/TEAM_10_S003_P009_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md`

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P009 |
| work_package_id | S003-P009-WP001 |
| task_id | G3_PLAN |
| gate_id | G3_PLAN |
| phase_owner | Team 10 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S003 |
| project_domain | AGENTS_OS |
| date | 2026-03-17 |

---

## 1. Approved Spec (Locked)

**Source:** `_COMMUNICATION/team_170/TEAM_170_S003_P009_WP001_LLD400_v1.0.0.md`

S003-P009-WP001: Pipeline Resilience Package. 3-tier file path resolution (AC-10/AC-11 hardening), WSM auto-write module (`wsm_writer.py`), targeted git operations (pre-GATE_4 uncommitted block + GATE_8 closure checklist). Items 4a/4b (route alias) already implemented — verification only. No HTTP API — contracts are CLI, Python modules, file I/O.

---

## 2. Files to Create/Modify per Team

**Domain:** AGENTS_OS — Team 61 (implementation + contract verify), Team 51 (QA), Team 170 (governance doc).

### 2.1 §2 Canonical Paths per Team

| Team | Deliverable | Canonical Path |
|------|-------------|----------------|
| Team 61 | Contract verify | `_COMMUNICATION/team_61/TEAM_61_S003_P009_WP001_CONTRACT_VERIFY_v1.0.0.md` |
| Team 61 | Implementation | `pipeline_run.sh`, `agents_os_v2/orchestrator/wsm_writer.py`, `agents_os_v2/orchestrator/pipeline.py` |
| Team 61 | Implementation complete | `_COMMUNICATION/team_61/TEAM_61_S003_P009_WP001_IMPLEMENTATION_COMPLETE_v1.0.0.md` |
| Team 170 | WSM protocol | `_COMMUNICATION/team_170/TEAM_170_WSM_AUTO_WRITE_PROTOCOL_v1.0.0.md` |
| Team 51 | QA report | `_COMMUNICATION/team_51/TEAM_51_S003_P009_WP001_QA_REPORT_v1.0.0.md` |

### 2.2 Team 61 — Contract Verify (Pre-Implementation)

| Action | File | Purpose |
|--------|------|---------|
| **READ** | `_COMMUNICATION/team_170/TEAM_170_S003_P009_WP001_LLD400_v1.0.0.md` | LLD400 spec |
| **READ** | `pipeline_run.sh` | Confirm `pass`, `fail`, `store`, `status` exist; inspect `_auto_store_gate1_artifact`, `_auto_store_g3plan_artifact` |
| **VERIFY** | `agents_os_v2/orchestrator/pipeline.py` | advance() flow; no wsm_writer import yet |
| **OUTPUT** | `_COMMUNICATION/team_61/TEAM_61_S003_P009_WP001_CONTRACT_VERIFY_v1.0.0.md` | Confirmed contracts, gaps |

### 2.3 Team 61 — Implementation

| Action | File | Purpose |
|--------|------|---------|
| **MODIFY** | `pipeline_run.sh` | Item 1: Replace inline Python in `_auto_store_gate1_artifact()` with 3-tier logic (Tier 1+2+3, mtime sort, 48h window, activation guard); same for `_auto_store_g3plan_artifact()`. Update NO_FILE message with Tier 3 store hint. Item 3: Add CURSOR_IMPLEMENTATION uncommitted-change block; GATE_8 closure checklist display |
| **CREATE** | `agents_os_v2/orchestrator/wsm_writer.py` | Item 2: `write_wsm_state(state, gate_id, result)`; WSM table field update; log_entry append; gate_state guard; idempotency; _emit_warn_event on error |
| **MODIFY** | `agents_os_v2/orchestrator/pipeline.py` | Item 2: Import `write_wsm_state`; call in `advance()` after `state.save()` when `state.gate_state is None`; wrap in try/except (non-blocking) |

### 2.4 Team 170 — Governance Documentation

| Action | File | Purpose |
|--------|------|---------|
| **CREATE** | `_COMMUNICATION/team_170/TEAM_170_WSM_AUTO_WRITE_PROTOCOL_v1.0.0.md` | Item 2: Document WSM auto-write protocol; EXPLICIT_WSM_PATCH tag; append-only log_entry; idempotency; Items 4a/4b alias map + hotfix acknowledgment |

### 2.5 Team 51 — QA

| Action | File | Purpose |
|--------|------|---------|
| **OUTPUT** | `_COMMUNICATION/team_51/TEAM_51_S003_P009_WP001_QA_REPORT_v1.0.0.md` | QA report per LLD400 §5 MCP scenarios + §6 acceptance criteria |

---

## 3. Execution Order and Gate Routing

### 3.1 Execution Order with Dependencies

```
Step 1: Team 61 — Contract verify (BLOCKING for implementation)
        ↓
Step 2: Team 61 — Implementation (Item 1, Item 2, Item 3)
Step 2b: Team 170 — Governance doc (parallel with or after Item 2)
        ↓
Step 3: Team 51 — QA/FAV
        ↓
Step 4: GATE_4 submission to Team 90
```

**Dependency rules:**
- Team 61 implementation starts only after contract verify note exists (or escalate if gaps found).
- Team 51 QA runs only after Team 61 completion report at `TEAM_61_S003_P009_WP001_IMPLEMENTATION_COMPLETE_v1.0.0.md`.
- Team 170 governance doc required for AC-2-08 before GATE_5.

### 3.2 Gate Routing (BF-G3_5-WP001: 001 FIX)

| Current Gate | Event | Next Gate | Action |
|--------------|-------|-----------|--------|
| G3_PLAN | PASS (after phase2 storage) | G3_5 | `./pipeline_run.sh --domain agents_os phase2` → `./pipeline_run.sh --domain agents_os pass` |
| G3_5 | PASS | G3_6_MANDATES | Team 90 validates → Team 10 generates mandates |
| G3_5 | FAIL (doc) | G3_PLAN | Work plan format/structural fix — Team 10 revises; `./pipeline_run.sh --domain agents_os revise "BF-xx"` |
| G3_5 | FAIL (full) | G3_PLAN | Work plan rejected — Team 10 full rewrite; route_recommendation: full |

**Verdict file:** Team 90 verdict must include `route_recommendation: doc` or `full` for auto-routing.

---

## 4. API / Contract Summary

### 4.1 CLI (pipeline_run.sh)

| Command | Purpose |
|---------|---------|
| `./pipeline_run.sh --domain agents_os pass` | Advance gate PASS; triggers wsm_writer; pre-GATE_4: block if uncommitted |
| `./pipeline_run.sh --domain agents_os fail "reason"` | Advance gate FAIL |
| `./pipeline_run.sh --domain agents_os store GATE_1 <path>` | Manual Tier 3 store LLD400 |
| `./pipeline_run.sh --domain agents_os store G3_PLAN <path>` | Manual Tier 3 store work plan |
| `./pipeline_run.sh --domain agents_os status` | Display pipeline status |
| `./pipeline_run.sh --domain agents_os phase2` | G3_PLAN: auto-store work plan, show Phase 2 mandate |

**Auto-store outputs:** `STORE:<path>`, `NO_FILE`, `ALREADY_STORED:<path>`, `TIER2_MATCH:<path>` (stderr)

### 4.2 Python Module: wsm_writer

| Entry Point | Purpose |
|-------------|---------|
| `from agents_os_v2.orchestrator.wsm_writer import write_wsm_state` | Update WSM CURRENT_OPERATIONAL_STATE; append log_entry |

**Request:** `state: PipelineState`, `gate_id: str`, `result: str`  
**Response:** None. On error: WARN to `pipeline_events.jsonl`; pipeline continues (non-blocking).

### 4.3 Files Read/Write

| Path | Purpose |
|------|---------|
| `_COMMUNICATION/agents_os/pipeline_state_agentsos.json` | Pipeline state |
| `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` | WSM (written by wsm_writer) |
| `_COMMUNICATION/agents_os/logs/pipeline_events.jsonl` | Event log (wsm_writer WARN) |

### 4.4 Artifact Resolution (3-Tier)

| Tier | LLD400 Pattern | G3_PLAN Pattern |
|------|----------------|------------------|
| 1 | `_COMMUNICATION/team_170/TEAM_170_{wp_fs}_LLD400_v*.md` | `_COMMUNICATION/team_10/TEAM_10_{wp_fs}_G3_PLAN_WORK_PLAN_v*.md` |
| 2 | `_COMMUNICATION/**/TEAM_170_*{wp_fragment}*LLD400*.md` | `_COMMUNICATION/**/TEAM_10_*{wp_fragment}*G3_PLAN*WORK_PLAN*.md` |
| 3 | `store GATE_1 <path>` | `store G3_PLAN <path>` |

---

## 5. Test Scenarios — Run Commands and Binary PASS/FAIL (BF-G3_5-WP001: 002 FIX)

**Operationalization:** Every test has an exact runnable command or step sequence. Team 51 copies from this section.

### 5.1 P0 Tests — Item 1 (Auto-Store)

**Prerequisite:** Set pipeline state to GATE_1: edit `_COMMUNICATION/agents_os/pipeline_state_agentsos.json` → `"current_gate": "GATE_1"`.

| test_id | Run Command / Steps | PASS | FAIL |
|---------|---------------------|------|------|
| QA-P0-01 | Ensure `_COMMUNICATION/team_170/TEAM_170_S003_P009_WP001_LLD400_v1.0.0.md` exists; run `./pipeline_run.sh --domain agents_os` 2>&1 \| grep -q 'STORE:'; echo $? | exit 0 | exit 1 |
| QA-P0-02 | Move LLD400 to `_COMMUNICATION/team_170/archive/`; run same; check stderr | `TIER2_MATCH:` in stderr; state.lld400_content populated | No match |
| QA-P0-03 | Remove all LLD400 from _COMMUNICATION; run same | Output contains `NO_FILE` and `store GATE_1` | Missing hint |
| QA-P0-04 | At G3_PLAN gate; ensure work plan in team_10/; run `./pipeline_run.sh --domain agents_os` | Output contains `STORE:` or `ALREADY_STORED:` for G3_PLAN | NO_FILE |

### 5.2 P0 Tests — Item 2 (WSM)

| test_id | Run Command / Steps | PASS | FAIL |
|---------|---------------------|------|------|
| QA-P0-05 | At GATE_1; run `./pipeline_run.sh --domain agents_os pass`; grep WSM for `current_gate` | WSM shows next gate (e.g. GATE_2) | Unchanged |
| QA-P0-06 | Advance to GATE_8 PASS; run pass; check WSM | `active_work_package_id` = NONE; `last_closed_work_package_id` set | Wrong |
| QA-P0-07 | Set `gate_state: "PASS_WITH_ACTION"` in state; run pass | WSM unchanged (no write) | WSM written |
| QA-P0-08 | `test -f _COMMUNICATION/team_170/TEAM_170_WSM_AUTO_WRITE_PROTOCOL_v1.0.0.md`; echo $? | exit 0 | exit 1 |

### 5.3 P0 Tests — Item 3 (Git)

| test_id | Run Command / Steps | PASS | FAIL |
|---------|---------------------|------|------|
| QA-P0-09 | At CURSOR_IMPLEMENTATION; `echo "x" >> pipeline_run.sh`; run `./pipeline_run.sh --domain agents_os pass`; echo $? | exit 1; output "UNCOMMITTED" or "uncommitted" | exit 0 |
| QA-P0-10 | `git checkout -- pipeline_run.sh`; clean tree; at CURSOR_IMPLEMENTATION; run pass | exit 0; proceeds | Blocked |
| QA-P0-11 | At CURSOR_IMPLEMENTATION; `touch /tmp/untracked` (untracked); run pass | exit 0; proceeds | Blocked |
| QA-P0-12 | Advance to GATE_8 PASS; run pass; check output | Contains "Closure push checklist" or "Team 191" | Missing |
| QA-P0-13 | `grep -r "git add \." pipeline_run.sh agents_os_v2/orchestrator/pipeline.py`; echo $? | exit 1 (not found) | exit 0 (found) |

### 5.4 P1 Tests — Regression

| test_id | Run Command / Steps | PASS | FAIL |
|---------|---------------------|------|------|
| QA-P1-01 | `python3 -m pytest agents_os_v2/tests/ -v -k "not OpenAI and not Gemini"`; echo $? | exit 0 | exit ≠ 0 |
| QA-P1-02 | Inject exception in wsm_writer `raise RuntimeError("test")`; run pass | Pipeline advance succeeds; WARN in pipeline_events.jsonl | Pipeline fails |

### 5.5 pytest Regression

```bash
python3 -m pytest agents_os_v2/tests/ -v -k "not OpenAI and not Gemini"
```
**PASS:** exit 0; 0 failures. **FAIL:** exit ≠ 0 or any failure.

---

## 6. Per-Team Acceptance Criteria

### 6.1 Team 61 — Contract Verify

| # | Criterion | Pass |
|---|-----------|------|
| 1 | pipeline_run.sh pass/fail/store/status confirmed | Documented |
| 2 | Auto-store output schema (STORE/NO_FILE/ALREADY_STORED/TIER2_MATCH) documented | Documented |
| 3 | wsm_writer absent; pipeline.py advance() flow documented | Documented |
| 4 | No implementation — verify only | Confirmed |

### 6.2 Team 61 — Implementation

| # | Criterion | Pass |
|---|-----------|------|
| Item 1 | 3-tier resolution; mtime sort; 48h + activation guard; NO_FILE with Tier 3 hint | QA-P0-01..04 |
| Item 2 | wsm_writer.py created; pipeline.py integration; gate_state guard; idempotent; non-blocking | QA-P0-05..08 |
| Item 3 | CURSOR_IMPLEMENTATION uncommitted block; GATE_8 checklist; no `git add .` | QA-P0-09..13 |

### 6.3 Field Contract (N/A — No UI)

This WP has no new UI components. State is JSON + WSM. No field/empty/error contracts for UI.

### 6.4 Error-State Contract (wsm_writer)

- **WSM field not found:** Raise/log; emit WARN to pipeline_events.jsonl; return without blocking pipeline.
- **File not writable:** Same — non-blocking.
- **gate_state != None:** Skip write; return immediately.

### 6.5 Team 170 — Governance Doc

| # | Criterion | Pass |
|---|-----------|------|
| 1 | TEAM_170_WSM_AUTO_WRITE_PROTOCOL_v1.0.0.md exists | ✓ |
| 2 | Documents: auto-write protocol, EXPLICIT_WSM_PATCH, append-only, idempotency | ✓ |
| 3 | Items 4a/4b: alias map + hotfix acknowledgment | ✓ |

### 6.6 Team 51 — QA

| # | Criterion | Pass |
|---|-----------|------|
| 1 | All QA-P0-01..13 binary PASS | ✓ |
| 2 | All QA-P1-01..02 binary PASS | ✓ |
| 3 | pytest exit 0 | ✓ |
| 4 | Report at canonical path | `_COMMUNICATION/team_51/TEAM_51_S003_P009_WP001_QA_REPORT_v1.0.0.md` |

---

## 7. Team 61 Implementation Deliverable Artifact (BF-G3_5-WP001: 003 FIX)

**Canonical path:** `_COMMUNICATION/team_61/TEAM_61_S003_P009_WP001_IMPLEMENTATION_COMPLETE_v1.0.0.md`

**Required sections (mandatory):**

| Section | Content |
|---------|---------|
| **Identity header** | roadmap_id, stage_id, program_id, work_package_id, gate_id, phase_owner, date |
| **Modified files list** | Table: file path, change type (MODIFY/CREATE), purpose (e.g. Item 1: 3-tier resolution) |
| **Item 1 checklist** | AC-1-01..AC-1-08 — each row: ✓ or ✗ with note |
| **Item 2 checklist** | AC-2-01..AC-2-08 — each row: ✓ or ✗ |
| **Item 3 checklist** | AC-3-01..AC-3-06 — each row: ✓ or ✗ |
| **Test evidence** | pytest exit code and count; manual run for QA-P0-01..13; QA-P1-01..02 |
| **Handover prompt** | Copy-paste-ready prompt for Team 51 QA activation with this artifact path |

**Format:** Markdown; YAML frontmatter with id, from, to, date, status.

**Trigger for Team 51:** Team 10 hands off using this artifact; Team 51 runs QA per §5 and reports to `TEAM_51_S003_P009_WP001_QA_REPORT_v1.0.0.md`.

**Example handover prompt (skeleton):**
```
Team 51 — QA mandate S003-P009-WP001
Implementation complete artifact: _COMMUNICATION/team_61/TEAM_61_S003_P009_WP001_IMPLEMENTATION_COMPLETE_v1.0.0.md
Execute all QA-P0-01..13 and QA-P1-01..02 per work plan §5.
Report to: _COMMUNICATION/team_51/TEAM_51_S003_P009_WP001_QA_REPORT_v1.0.0.md
```

---

## 8. Canonical Deliverable Paths

| Team | Deliverable | Canonical Path |
|------|-------------|----------------|
| Team 61 | Contract verify | `_COMMUNICATION/team_61/TEAM_61_S003_P009_WP001_CONTRACT_VERIFY_v1.0.0.md` |
| Team 61 | Implementation complete | `_COMMUNICATION/team_61/TEAM_61_S003_P009_WP001_IMPLEMENTATION_COMPLETE_v1.0.0.md` |
| Team 170 | WSM protocol | `_COMMUNICATION/team_170/TEAM_170_WSM_AUTO_WRITE_PROTOCOL_v1.0.0.md` |
| Team 51 | QA report | `_COMMUNICATION/team_51/TEAM_51_S003_P009_WP001_QA_REPORT_v1.0.0.md` |

---

## 9. Team 10 Next Action

1. Await Team 61 contract verify
2. Issue Team 61 implementation mandate (or reference Team 100 mandate)
3. Issue Team 170 governance doc mandate (or reference Team 100 mandate)
4. Upon Team 61 completion artifact at §7 path, hand off to Team 51 per handover prompt
5. Upon Team 51 PASS, route to GATE_4 submission (Team 90)

---

**log_entry | TEAM_10 | G3_PLAN | S003_P009_WP001 | v1.2.0_G35_REMEDIATION | 2026-03-17**
**log_entry | TEAM_10 | BF-G3_5-WP001-001 | STRUCTURAL_COMPLETENESS | 2026-03-17**
**log_entry | TEAM_10 | BF-G3_5-WP001-002 | TEST_COVERAGE_OPERATIONALIZED | 2026-03-17**
**log_entry | TEAM_10 | BF-G3_5-WP001-003 | TEAM61_COMPLETION_ARTIFACT_CONTRACT | 2026-03-17**
**log_entry | TEAM_10 | BF-G3_5-WP001-RE2-001 | G35_READINESS_CHECKLIST_ADDED | 2026-03-17**


────────────────────────────────────────────────────────────

## Team 20 — API Verification (Phase 1)

### Your Task

Verify backend APIs required for: Pipeline Resilience Package — 3-tier file resolution, wsm_writer.py auto-write, targeted git integration (pre-GATE_4 + GATE_8), route alias normalization (4a/4b already implemented)

**Environment:** Cursor Composer

Verify all backend API endpoints required for this feature.
No code changes unless a critical blocker is found.
Document: endpoint paths, params, response shapes, auth requirements.

**Output — write to:**
`_COMMUNICATION/team_20/TEAM_20_S003_P009_WP001_API_VERIFY_v1.0.0.md`

### Additional Context
### Backend Conventions
# Backend Conventions — TikTrack Phoenix

## Structure
- Models: `api/models/<entity>.py` — SQLAlchemy ORM with `Base` from `api/models/base.py`
- Schemas: `api/schemas/<entity>.py` — Pydantic BaseModel
- Services: `api/services/<entity>_service.py` — Business logic, singleton pattern
- Routers: `api/routers/<entity>.py` — FastAPI APIRouter

## Naming
- Table names: plural (users, trading_accounts, cash_flows)
- Schemas: `user_data.*` or `market_data.*`
- External IDs: ULID strings (`uuid_to_ulid()` / `ulid_to_uuid()` from `api/utils/identity`)
- Endpoints: underscore naming (`/trading_accounts`, `/cash_flows`)

## Types
- Money: `Decimal(20,8)` — NUMERIC(20,8) in DB
- Market cap: `Decimal(24,4)` — NUMERIC(24,4) in DB
- IDs: UUID internally, ULID externally
- Timestamps: TIMESTAMPTZ (timez

### Acceptance
- All required endpoints confirmed present and behaving as specified
- API params + response shapes documented
- No code changes (unless blocker found — document it)
- Output saved to: `_COMMUNICATION/team_20/TEAM_20_S003_P009_WP001_API_VERIFY_v1.0.0.md`

────────────────────────────────────────────────────────────
  ✅  Phase 1 complete?
  →  Run in terminal:  ./pipeline_run.sh --domain agents_os phase2
     Regenerates mandates with Phase 1 output injected
     + displays Phase 2 section ready to copy.
────────────────────────────────────────────────────────────

## Team 30 — Frontend Implementation (Phase 2)

⚠️  PREREQUISITE: **Team 20** must be COMPLETE before starting this mandate.

### Your Task

Implement frontend for: Pipeline Resilience Package — 3-tier file resolution, wsm_writer.py auto-write, targeted git integration (pre-GATE_4 + GATE_8), route alias normalization (4a/4b already implemented)

**Environment:** Cursor Composer + MCP browser tools

Implement the frontend feature per spec. After implementation, run MCP verification:
1. Navigate to the target page and login
2. `browser_snapshot` — verify new component renders
3. Test primary feature (badge/count/list as applicable)
4. Verify edge case: hidden/empty state when count is 0
5. Test all navigation flows (Click item/badge → correct page)
6. `cd ui && npx vite build` — must succeed


### Coordination Data — Team 20 API verification report

✅  Auto-loaded: `_COMMUNICATION/team_20/TEAM_20_S003_P009_WP001_API_VERIFY_v1.0.0.md`

```
---
date: 2026-03-17
team: Team 20
task: S003-P009-WP001 API Verification (Phase 1)
status: COMPLETED
---

# Team 20 API Verification — S003-P009-WP001

## Mandatory Identity Header

| Field | Value |
| --- | --- |
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P009 |
| work_package_id | S003-P009-WP001 |
| task_id | API_VERIFY_PHASE1 |
| gate_id | G3_6_MANDATES |
| phase_owner | Team 20 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S003 |

## Scope Verified

Feature scope under verification:

- 3-tier file resolution hardening
- `wsm_writer.py` auto-write integration
- targeted git integration (pre-GATE_4 + GATE_8)
- route alias normalization (4a/4b already implemented)

Backend surface verified in:

- `agents_os_v2/server/aos_ui_server.py`
- `agents_os_v2/server/routes/events.py`
- `agents_os_v2/server/routes/health.py`
- `agents_os_v2/server/routes/state_stub.py`
- `agents_os_v2/server/models/event.py`

Verification evidence:

- `python3 -m pytest agents_os_v2/server/tests/test_server.py -q`
- Result: `10 passed` (no failures)

## Endpoint Verification Matrix

| Endpoint | Method | Params / Body | Response shape | Auth | Verification | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `/api/health` | GET | none | `{ "status": "ok", "uptime_s": number }` | None | Code + automated test (`test_health_returns_ok`) | PRESENT / PASS |
| `/api/log/event` | POST | JSON body matching `PipelineEvent` model (`timestamp`, `pipe_run_id`, `e
```
_[… content truncated at 1500 chars]_


### Additional Context
### Frontend Conventions
# Frontend Conventions — TikTrack Phoenix

## Structure
- React SPA: `ui/src/App.jsx`, `ui/src/main.jsx`
- Hybrid HTML pages: `ui/src/views/<category>/<feature>/<feature>.html`
- JavaScript modules: `ui/src/views/<category>/<feature>/<feature>.js`
- Shared components: `ui/src/components/`
- Styles: `ui/src/styles/` (phoenix-base, phoenix-components)
- Cubes (table managers): `ui/src/cubes/`

## Routing
- routes.json: `ui/public/routes.json` — SSOT for all routes
- Vite plugin serves HTML pages directly (bypasses React Router)
- API proxy: `/api` → `http://localhost:8082`

## API Integration
- Axios for HTTP calls
- Base URL from `import.meta.env.VITE_API_BASE_URL`
- Auth via Bearer token in Authorization header

## CSS Rules (Iron Rule from .cursorrules)
1. First: default classes or no cla

### Acceptance
- All files listed in work plan created/modified
- collapsible-container Iron Rule applied
- maskedLog used for all console output
- Vite build passes (`cd ui && npx vite build`)
- All MCP browser verification steps pass

────────────────────────────────────────────────────────────
  ✅  Phase 2 complete?
  →  Run in terminal:  ./pipeline_run.sh --domain agents_os phase3
     Regenerates mandates with Phase 2 output injected
     + displays Phase 3 section ready to copy.
────────────────────────────────────────────────────────────

## Team 50 — QA (Phase 3)

⚠️  PREREQUISITE: **Team 30** must be COMPLETE before starting this mandate.

### Your Task

Run QA for: Pipeline Resilience Package — 3-tier file resolution, wsm_writer.py auto-write, targeted git integration (pre-GATE_4 + GATE_8), route alias normalization (4a/4b already implemented)

**Environment:** Cursor Composer + MCP browser tools

Run comprehensive QA on the completed implementation.
Team 20 API verification AND Team 30 implementation must both be complete first.

**Output — write to:**
`_COMMUNICATION/team_50/TEAM_50_S003_P009_WP001_QA_REPORT_v1.0.0.md`

### Acceptance
- All FAST_3 checks pass
- No regressions on adjacent pages
- QA report saved to: `_COMMUNICATION/team_50/TEAM_50_S003_P009_WP001_QA_REPORT_v1.0.0.md`
