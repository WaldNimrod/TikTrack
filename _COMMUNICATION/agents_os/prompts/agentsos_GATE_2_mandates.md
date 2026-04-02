⛔ **OPERATOR-ONLY — DO NOT TOUCH PIPELINE CLI**

⛔ DO NOT run `./pipeline_run.sh` or any pipeline CLI command.
⛔ DO NOT advance the gate or modify pipeline state.
✅ Save your artifact to the canonical path below.
✅ Notify Nimrod. Nimrod runs all pipeline commands.

---

# Mandates — S003-P015-WP001  ·  GATE_2

**Spec:** S003-P015-WP001 — AOS DM-005 SC Verification Run. Documentation-only pipeline run (GATE_0→GATE_5, TRACK_FOCUSED) to verify AOS pipeline engine readiness for DM-005 closure. No code changes. Authority: DM-005 v1.2.0.

**Canonical date:** Use `date -u +%F` for today; replace {{date}} in identity headers.

════════════════════════════════════════════════════════════
  EXECUTION ORDER
════════════════════════════════════════════════════════════

  Phase 1:  GATE_2 Phase 2.1   ← runs alone
             ↓  Phase 2 starts ONLY after Phase 1 completes
             💻  Phase 1 done?  →  ./pipeline_run.sh --domain agents_os phase2
             📄 GATE_2 Phase 2.1v reads coordination data from GATE_2 Phase 2.1

  Phase 2:  GATE_2 Phase 2.1v   ← runs alone
             ↓  Phase 3 starts ONLY after Phase 2 completes
             💻  Phase 2 done?  →  ./pipeline_run.sh --domain agents_os phase3

  Phase 3:  GATE_2 Phase 2.2   ← runs alone
             ↓  Phase 4 starts ONLY after Phase 3 completes
             💻  Phase 3 done?  →  ./pipeline_run.sh --domain agents_os phase4
             📄 GATE_2 Phase 2.2v reads coordination data from GATE_2 Phase 2.2

  Phase 4:  GATE_2 Phase 2.2v   ← runs alone
             ↓  Phase 5 starts ONLY after Phase 4 completes
             💻  Phase 4 done?  →  ./pipeline_run.sh --domain agents_os phase5

  Phase 5:  GATE_2 Phase 2.3   ← runs alone

════════════════════════════════════════════════════════════

## GATE_2 Phase 2.1 — LLD400 reference (Phase 1)

### GATE_2 Phase 2.1 — LLD400 baseline (completed in GATE_1)

**Environment:** Team 170 output — read-only reference for downstream phases.

- **LLD400 path:** `_COMMUNICATION/team_170/TEAM_170_S003_P015_WP001_LLD400_v1.0.0.md`
- **Identity:** gate=GATE_1 | wp=S003-P015-WP001 | date≤2026-03-24

No new authoring here — Phase 2.1 is **documentation of the approved spec** entering GATE_2.


**Output — write to:**
`_COMMUNICATION/team_170/TEAM_170_S003_P015_WP001_LLD400_v1.0.0.md`

### Acceptance
- LLD400 on disk: `_COMMUNICATION/team_170/TEAM_170_S003_P015_WP001_LLD400_v1.0.0.md`
- Matches GATE_1 completion

────────────────────────────────────────────────────────────
  ✅  YOUR MANDATE (Phase 1) IS COMPLETE WHEN you save your delivery artifact.
  ⚠️  DO NOT run pipeline_run.sh commands — the operator (Nimrod) controls pipeline advancement.
  ℹ️  OPERATOR NOTE: after Phase 1 delivery confirmed, run:
       ./pipeline_run.sh --domain agents_os phase2
     (regenerates mandates with Phase 1 output → activates Phase 2)
────────────────────────────────────────────────────────────

## GATE_2 Phase 2.1v — GATE_1 verdict (Phase 2)

⚠️  PREREQUISITE: **GATE_2 Phase 2.1** must be COMPLETE before starting this mandate.

### GATE_2 Phase 2.1v — Team 190 constitutional validation (from GATE_1)

**Read:** `_COMMUNICATION/team_190/TEAM_190_S003_P015_WP001_GATE_1_VERDICT_v1.0.0.md`

Team 190 already validated LLD400 at GATE_1. If this verdict is PASS, proceed to Phase 2.2 (work plan).
If BLOCK, resolve via GATE_1 correction cycle before executing Phase 2.2.


**Output — write to:**
`_COMMUNICATION/team_190/TEAM_190_S003_P015_WP001_GATE_1_VERDICT_v1.0.0.md`

### Coordination Data — LLD400

✅  Auto-loaded: `_COMMUNICATION/team_170/TEAM_170_S003_P015_WP001_LLD400_v1.0.0.md`

```
---
id: TEAM_170_S003_P015_WP001_LLD400_v1.0.0
date: 2026-03-24
from: Team 170 (Spec & Governance)
to: Team 190 · Team 101 · Gateway
status: AS_MADE_VERIFICATION
work_package_id: S003-P015-WP001
---

# LLD400 — S003-P015-WP001 — DM-005 documentation-only verification

## 1. Identity Header

`gate: GATE_1 | wp: S003-P015-WP001 | stage: S003 | domain: agents_os | date: 2026-03-24`

| Field | Value |
|-------|-------|
| roadmap_program | S003-P015 |
| work_package_id | S003-P015-WP001 |
| architectural_approval_type | SPEC (LLD400 — verification WP) |
| phase_owner | Team 170 |

## 2. Endpoint Contract

**Normative:** This WP introduces **no new HTTP API** on TikTrack or AOS product surfaces.

| Method | Path | Purpose |
|--------|------|---------|
| N/A | N/A | No new routes. Existing `GET /health` on TikTrack backend (port 8082) may be used **only** as an optional environment sanity probe by QA; not a deliverable of this WP. |

**Request/response:** Not applicable beyond optional health check `200 {"status":"ok"}` if used.

## 3. DB Contract

**No database reads or writes** are introduced by this WP. **No migrations.** **No new tables or columns.**

## 4. UI Structural Contract

**Primary surface:** Agents OS **pipeline dashboard** (static UI served per `scripts/start_ui_server.sh`, port **8080**).

| Area | Requirement |
|------|-------------|
| WHO / WHAT NOW | Visible for each gate during the run |
| GATE_2 | Two-phase display; active phase visually indicated |
| Mandates |
```
_[… content truncated at 1500 chars]_


### Acceptance
- Verdict: `_COMMUNICATION/team_190/TEAM_190_S003_P015_WP001_GATE_1_VERDICT_v1.0.0.md`
- PASS or correction cycle complete

────────────────────────────────────────────────────────────
  ✅  YOUR MANDATE (Phase 2) IS COMPLETE WHEN you save your delivery artifact.
  ⚠️  DO NOT run pipeline_run.sh commands — the operator (Nimrod) controls pipeline advancement.
  ℹ️  OPERATOR NOTE: after Phase 2 delivery confirmed, run:
       ./pipeline_run.sh --domain agents_os phase3
     (regenerates mandates with Phase 2 output → activates Phase 3)
────────────────────────────────────────────────────────────

## GATE_2 Phase 2.2 — Team 11 work plan (Phase 3)

⚠️  PREREQUISITE: **GATE_2 Phase 2.1v** must be COMPLETE before starting this mandate.

### GATE_2 Phase 2.2 — Team 11 work plan

Produce / revise the versioned work plan for `S003-P015-WP001`.

- **Save to:** `_COMMUNICATION/team_11/TEAM_11_S003_P015_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md`
- **Full mandate engine:** same rules as legacy G3_PLAN — see also `G3_PLAN_mandates.md` in prompts/.

**Spec excerpt:**

```
---
id: TEAM_170_S003_P015_WP001_LLD400_v1.0.0
date: 2026-03-24
from: Team 170 (Spec & Governance)
to: Team 190 · Team 101 · Gateway
status: AS_MADE_VERIFICATION
work_package_id: S003-P015-WP001
---

# LLD400 — S003-P015-WP001 — DM-005 documentation-only verification

## 1. Identity Header

`gate: GATE_1 | wp: S003-P015-WP001 | stage: S003 | domain: agents_os | date: 2026-03-24`

| Field | Value |
|-------|-------|
| roadmap_program | S003-P015 |
| work_package_id | S003-P015-WP001 |
| architectural_approval_type | SPEC (LLD400 — verification WP) |
| phase_owner | Team 170 |

## 2. Endpoint Contract

**Normative:** This WP introduces **no new HTTP API** on TikTrack or AOS product surfaces.

| Method | Path | Purpose |
|--------|------|---------|
| N/A | N/A | No new routes. Existing `GET /health` on TikTrack backend (port 8082) may be used **only** as an optional environment sanity probe by QA; not a deliverable of this WP. |

**Request/response:** Not applicable beyond optional health check `200 {"status":"ok"}` if used.

## 3. DB Contract

**No database reads or writes** are introduced by this WP. **No migrations.** **No new tables or columns.**

## 4. UI Structural Contract

**Primary surface:** Agents OS **pipeline dashboard** (static UI served per `scripts/start_ui_server.sh`, port **8080**).

| Area | Requirement |
|------|-------------|
| WHO / WHAT NOW | Visible for each gate during the run |
| GATE_2 | Two-phase display; active phase visually indicated |
| Mandates | Load without blocking errors when artifacts exist |
| Console | **Zero** `404` fetch failures attributable to dashboard JS; **zero** `SEVERE` logs from dashboard scripts |

**DOM:** No new `data-testid` required for product pages; dashboard already carries its own test hooks per existing implementation.

**State shape:** Dashboard reads `_COMMUNICATION/agents_os/pipeline_state_agentsos.json` (and related `STATE_VIEW.json`) — unchanged contract.

## 5. MCP Test Scenarios

| ID | Precondition | Action | Expected |
|----|--------------|--------|----------|
| M-01 | Repo checkout; venv optional | `python3 -m agents_os_v2.tools.ssot_check --domain agents_os` | Exit **0**; `SSOT CHECK: ✓ CONSISTENT` |
| M-02 | Same | `python3 -m agents_os_v2.tools.ssot_check --domain tiktrack` | Exit **0**; consistent |
| M-03 | Same | `python3 -m pytest agents_os_v2/tests/ -q` | **208+** passed (skipped allowed) |
| M-04 | After GATE_5 COMPLETE | `./pipeline_run.sh --domain agents_os wsm-reset` | Completes; WSM idle fields coherent |
| M-05 | Same | `bash scripts/canary_simulation/run_canary_safe.sh` | Final line contains **no** unintended `pipeline_run.sh` execution (per script contract) |

## 6. Acceptance Criteria

1. Full **G0→G5** progression completes on **`agents_os`** domain for **S003-P015-WP001** without blocking CLI errors.
2. After **every** gate advance in the run log: `ssot_check --domain agents_os` → **CONSISTENT**.
3. After **every** gate where code changed: `pytest agents_os_v2/tests/` → **208+** pass (this WP expects **no** code changes).
4. After **COMPLETE**: `wsm-reset` run once; then **both** domain `ssot_check` commands **CONSISTENT**.
5. Canary safe script passes per DM-005 ITEM-3.
6. Dashboard console: **zero 404** and **zero SEVERE** from dashboard JS during the run (ITEM-3).

## 7. Gate 4.3 — Human Review Checklist (HRC)

| ID | Scenario (HE) | URL / Environment | Success Criteria | Failure Indicators |
|----|---------------|-------------------|---------------
```


**Output — write to:**
`_COMMUNICATION/team_11/TEAM_11_S003_P015_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md`

### Acceptance
- Plan saved: `_COMMUNICATION/team_11/TEAM_11_S003_P015_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md`
- Nimrod runs `phase2` then `pass` to reach 2.2v

────────────────────────────────────────────────────────────
  ✅  YOUR MANDATE (Phase 3) IS COMPLETE WHEN you save your delivery artifact.
  ⚠️  DO NOT run pipeline_run.sh commands — the operator (Nimrod) controls pipeline advancement.
  ℹ️  OPERATOR NOTE: after Phase 3 delivery confirmed, run:
       ./pipeline_run.sh --domain agents_os phase4
     (regenerates mandates with Phase 3 output → activates Phase 4)
────────────────────────────────────────────────────────────

## GATE_2 Phase 2.2v — Plan validation (Phase 4)

⚠️  PREREQUISITE: **GATE_2 Phase 2.2** must be COMPLETE before starting this mandate.

### GATE_2 Phase 2.2v — Team 90 work-plan validation

**Output verdict:** `_COMMUNICATION/team_90/TEAM_90_S003_P015_WP001_G3_5_VERDICT_v1.0.0.md`

Validate implementation readiness of the work plan (same bar as G3_5).
Use stored `work_plan` in pipeline state + file `_COMMUNICATION/team_11/TEAM_11_S003_P015_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md`.


**Output — write to:**
`_COMMUNICATION/team_90/TEAM_90_S003_P015_WP001_G3_5_VERDICT_v1.0.0.md`

### Coordination Data — Work plan

✅  Auto-loaded: `_COMMUNICATION/team_11/TEAM_11_S003_P015_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md`

```
---
id: TEAM_11_S003_P015_WP001_G3_PLAN_WORK_PLAN_v1.0.0
date: 2026-03-24
from: Team 11 (AOS Gateway / Work Plan)
to: Team 61 · Team 51 · Team 90
wp: S003-P015-WP001
process_variant: TRACK_FOCUSED
---

# G3 Plan — S003-P015-WP001 — DM-005 verification (documentation-only)

## Identity

`gate: GATE_2 / Phase 2.2 | wp: S003-P015-WP001 | stage: S003 | domain: agents_os | date: 2026-03-24`

## Scope

Execute **DM-005 ITEM-2 + ITEM-3**: end-to-end **G0→G5** on `agents_os` with **no product code changes**, evidence only.

## Team 61 — Implementation (verification artifacts)

| Step | Deliverable |
|------|-------------|
| 1 | Log of each `./pipeline_run.sh --domain agents_os` command used (gate + outcome). |
| 2 | Confirm `python3 -m agents_os_v2.tools.ssot_check --domain agents_os` after each gate. |
| 3 | Confirm `python3 -m pytest agents_os_v2/tests/ -q` (208+) when any code touched (expect **none**). |
| 4 | After COMPLETE: run `./pipeline_run.sh --domain agents_os wsm-reset` once. |
| 5 | Optional: `_COMMUNICATION/team_61/TEAM_61_S003_P015_WP001_VERIFICATION_LOG_v1.0.0.md` |

## Team 51 — QA

- Regression: **208+** pytest + both-domain `ssot_check` after any fix (expect **no fixes**).
- Dashboard: console **404 / SEVERE** check per DM-005 ITEM-3 when UI server runs.

## Team 90 — Validation

- GATE_2 Phase **2.2v** verdict on this plan (PASS).
- GATE_5 final documentation review per pipeline prompt.

## Dependencies

None — LLD400 and GATE_1 verdict already PASS.

---

**log_e
```
_[… content truncated at 1500 chars]_


### Acceptance
- PASS/FAIL with route_recommendation
- Verdict: `_COMMUNICATION/team_90/TEAM_90_S003_P015_WP001_G3_5_VERDICT_v1.0.0.md`

────────────────────────────────────────────────────────────
  ✅  YOUR MANDATE (Phase 4) IS COMPLETE WHEN you save your delivery artifact.
  ⚠️  DO NOT run pipeline_run.sh commands — the operator (Nimrod) controls pipeline advancement.
  ℹ️  OPERATOR NOTE: after Phase 4 delivery confirmed, run:
       ./pipeline_run.sh --domain agents_os phase5
     (regenerates mandates with Phase 4 output → activates Phase 5)
────────────────────────────────────────────────────────────

## GATE_2 Phase 2.3 — Architect sign-off (Phase 5)

⚠️  PREREQUISITE: **GATE_2 Phase 2.2v** must be COMPLETE before starting this mandate.

### GATE_2 Phase 2.3 — Architectural review (team_101)

**Verdict artifact (typical):** `_COMMUNICATION/team_101/TEAM_101_S003_P015_WP001_GATE_2_VERDICT_v1.0.0.md`

Combined LLD400 + work-plan sign-off. Respond APPROVED / REJECTED with `route_recommendation` if rejected.
**After verdict:** operator runs precision `pass` — agents do **not** run pipeline CLI.


**Output — write to:**
`_COMMUNICATION/team_101/TEAM_101_S003_P015_WP001_GATE_2_VERDICT_v1.0.0.md`

### Acceptance
- APPROVED or REJECTED + route
- Operator runs precision pass

historical_record: true
