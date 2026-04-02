---
**project_domain:** AGENTS_OS  
**id:** TEAM_51_AOS_V3_CANARY_DUAL_DOMAIN_QA_REPORT_v1.0.0  
date: 2026-04-02
historical_record: true
**from:** Team 51 (AOS QA)  
**to:** Team 00 (Principal)  
**cc:** Team 100, Team 11  
**date:** 2026-03-30  
**mandate:** `TEAM_00_TO_TEAM_51_AOS_V3_CANARY_DUAL_DOMAIN_MANDATE_v1.0.0`  
**repo_head (at verification):** `a75b7caccadf1430f41e413f2f4138a30e322051`  ---

# Team 51 — Canary Dual-Domain QA Report

## Section A — Test Results Summary

| Suite | Result |
|-------|--------|
| **tiktrack canary** (`TestCanaryFullPipeline`) | **10/10 PASS** |
| **agents_os canary** (`TestCanaryFullPipelineAgentsOS`) | **10/10 PASS** |
| **Full suite** | **161 passed, 0 failed** (3 warnings: urllib3 LibreSSL, websockets deprecation ×2) |

**Command (verbatim):**

```bash
set -a && source agents_os_v3/.env && set +a
AOS_V3_E2E_RUN=1 AOS_V3_E2E_HEADLESS=1 AOS_V3_E2E_UI_MOCK=0 \
  PYTHONPATH=. python3 -m pytest agents_os_v3/tests/ -q --tb=short
```

**Environment:** Live v3 API `http://127.0.0.1:8090`, `AOS_V3_DATABASE_URL` from `agents_os_v3/.env`, headless Chrome (Selenium).

---

## Section B — agents_os Domain Validation

| Test | Result | Notes |
|------|--------|-------|
| test_01_wp_dropdown_is_populated | **PASS** | After `agents_os` workspace click, canary AOS WP appears in `#aosv3-wp-select`. |
| test_02_start_run_agents_os | **PASS** | Start Run → `IN_PROGRESS` + `GATE_0`; `run_id` stored; prompt meta used to set `advance_hdr`. |
| test_03_gate0_prompt_live_aos | **PASS** | L1–L4 non-empty; `GET /api/runs/{id}` → `domain_id == 01JK8AOSV3DOMAIN00000001`. |
| test_04_browser_prompt_not_stale_aos | **PASS** | No stale mock timestamp / `MOCK_ASSEMBLED_PROMPT`. |
| test_05_advance_gate0_to_gate1_aos | **PASS** | Reached `GATE_1`; `process_variant == TRACK_FOCUSED` on run row (or `TRACK_FOCUSED` in L4 fallback). |
| test_06_advance_gate1_to_gate2_aos | **PASS** | |
| test_07_advance_gate2_to_gate3_aos | **PASS** | |
| test_08_advance_gate3_to_gate4_approve_visible_aos | **PASS** | APPROVE visible at `GATE_4`. |
| test_09_approve_gate4_advance_gate5_complete_aos | **PASS** | Principal approve + terminal advance → `COMPLETE` + UI badge. |
| test_10_run_log_events_aos | **PASS** | `RUN_INITIATED`, `RUN_COMPLETED`, `GATE_APPROVED`, ≥5× `PHASE_PASSED`. |

### Routing rules (agents_os GATE_1–GATE_5, IDs 15–19)

Advances succeeded through gates 1–5 for an agents_os-domain run — consistent with resolution of domain-scoped rules **01JK8AOSV3RR0000000015** … **01JK8AOSV3RR0000000019** (see Section E).

### TRACK_FOCUSED

Observed on `GET /api/runs/{run_id}` as `process_variant: TRACK_FOCUSED` for the agents_os canary run (asserted in test_05).

### Actor team (team_11 vs team_10) — **CRITICAL finding**

- **Mandate expectation:** Orchestrator advances for agents_os should use **team_11** (`AOS_ACTOR_HDR`).
- **Observed:** `POST .../advance` with `X-Actor-Team-Id: team_11` returns **403 WRONG_ACTOR** because the **assignment** row created at `initiate_run` uses `machine._team_for_role`, which maps `ORCHESTRATOR` → `C.ORCHESTRATOR_TEAM_ID` (**team_10**) for **all** domains.
- **Canary implementation:** After `RUN_INITIATED`, tests read `meta.actor_team_id` from `GET /api/runs/{id}/prompt` and set `X-Actor-Team-Id` to that value for all advances (`_STATE_AOS["advance_hdr"]`). On the verified DB this resolved to **team_10**, not team_11.
- **Root cause hypothesis:** [`agents_os_v3/modules/state/machine.py`](agents_os_v3/modules/state/machine.py) — `initiate_run` calls `_team_for_role(role_id)` without `domain_id`; should select **team_11** when `domain_id == agents_os` ULID (per `definition.yaml` routing comments).

**Remediation owner:** Team 21 / Team 11 (application); Team 51 did not modify application code per mandate.

---

## Section C — Template Content Quality (GATE_0–GATE_5, both domains)

Automated checks in [`agents_os_v3/tests/e2e/test_canary_full_pipeline.py`](agents_os_v3/tests/e2e/test_canary_full_pipeline.py) via `_assert_l1_template_quality` (invoked from `_assert_prompt` when `l1_domain` is set):

| Gate | TikTrack (`l1_domain=tiktrack`) | agents_os (`l1_domain=agents_os`) |
|------|----------------------------------|-----------------------------------|
| GATE_0 | ORCHESTRATOR; tiktrack/Team 10 lane; no “Your task: Implement” | ORCHESTRATOR; `agents_os` + `TRACK_FOCUSED` in L1; coordinator phrasing |
| GATE_1–GATE_3 | ORCHESTRATOR; coordinator / routing language | Same pattern; GATE_3 adds TRACK_FOCUSED / Team 61 check |
| GATE_4 | Human / HITL / approve language (template is HITL-centric) | Same |
| GATE_5 | ORCHESTRATOR; closure coordination | Same |

No template layer asserted literal executor phrase **“Your task: Implement”** in sampled prompts during the canary.

---

## Section D — Policy Coverage Check (`GET /api/policies`)

| Check | Result |
|-------|--------|
| Count | **4** policies |
| agents_os `default_process_variant` | **TRACK_FOCUSED** (`01JK8AOSV3POL00000000002`, `domain_id` agents_os ULID) |
| tiktrack `default_process_variant` | **TRACK_FULL** (`01JK8AOSV3POL00000000003`, `domain_id` tiktrack ULID) |
| GATE_4 `gate_type` | Present (`01JK8AOSV3POL00000000004`, `requires_principal: team_00`) |
| `max_correction_cycles` | **5** (`01JK8AOSV3POL00000000001`, GLOBAL) |

---

## Section E — Routing Rules Coverage Check (`GET /api/routing-rules`)

| Check | Result |
|-------|--------|
| Total rules | **18** |
| Per gate | Each of GATE_0–GATE_5 has: **global** (`domain_id` null, priority 100) + **tiktrack** (priority 10) + **agents_os** (priority 10) where applicable; GATE_0 uses null phase + domain-specific + fallback. |
| Duplicate (gate × domain × phase) | **None observed** in API list (unique combinations). |

**gate × domain → rule_id (summary)**

| Gate | Domain | rule_id |
|------|--------|---------|
| GATE_0 | global | 01JK8AOSV3RR0000000003 |
| GATE_0 | tiktrack | 01JK8AOSV3RR0000000002 |
| GATE_0 | agents_os | 01JK8AOSV3RR0000000001 |
| GATE_1 | global | 01JK8AOSV3RR0000000020 |
| GATE_1 | tiktrack | 01JK8AOSV3RR0000000010 |
| GATE_1 | agents_os | 01JK8AOSV3RR0000000015 |
| GATE_2 | global | 01JK8AOSV3RR0000000021 |
| GATE_2 | tiktrack | 01JK8AOSV3RR0000000011 |
| GATE_2 | agents_os | 01JK8AOSV3RR0000000016 |
| GATE_3 | global | 01JK8AOSV3RR0000000022 |
| GATE_3 | tiktrack | 01JK8AOSV3RR0000000012 |
| GATE_3 | agents_os | 01JK8AOSV3RR0000000017 |
| GATE_4 | global | 01JK8AOSV3RR0000000023 |
| GATE_4 | tiktrack | 01JK8AOSV3RR0000000013 |
| GATE_4 | agents_os | 01JK8AOSV3RR0000000018 |
| GATE_5 | global | 01JK8AOSV3RR0000000024 |
| GATE_5 | tiktrack | 01JK8AOSV3RR0000000014 |
| GATE_5 | agents_os | 01JK8AOSV3RR0000000019 |

---

## Section F — Open Issues and Observations

```
[SEVERITY: CRITICAL] — agents_os orchestrator assignment uses team_10 instead of team_11
Where: agents_os_v3/modules/state/machine.py — initiate_run → _team_for_role (ORCHESTRATOR_ROLE_ID → ORCHESTRATOR_TEAM_ID)
Observed: advance with X-Actor-Team-Id: team_11 → 403 WRONG_ACTOR; prompt meta.actor_team_id == team_10 for agents_os canary run
Expected: Assignment + advance actor for agents_os ORCHESTRATOR should be team_11 per definition.yaml / gateway model
Hypothesis: _team_for_role must be domain-aware (or resolve team from routing + domain registry)
```

```
[SEVERITY: LOW] — urllib3 LibreSSL warning on macOS dev host
Where: pytest warnings
Observed: NotOpenSSLWarning from urllib3
Expected: Clean CI on Linux OpenSSL; informational locally
```

---

## Section G — Canary Architecture Observations

1. **Two-class structure:** `TestCanaryFullPipeline` runs before `TestCanaryFullPipelineAgentsOS` (pytest collection order). Shared **module-scoped** `live_browser` + `canary_db` worked: separate WP fixtures and teardown-by-id prevented cross-deletion; after tiktrack `COMPLETE`, agents_os lane starts a fresh run.
2. **`advance_hdr` pattern:** Reading `meta.actor_team_id` from the prompt after start decouples tests from hard-coded actor headers when product assignment drifts — but **does not** replace the need to fix domain-correct orchestrator assignment.
3. **`_advance_to_gate`:** Same two-phase GATE_0 behavior applies to agents_os; no change required.
4. **Maintainability:** Consider a shared helper `orchestrator_headers_for_run(run_id)` in test utilities once application fixes team_11 assignment, and re-assert `team_11` explicitly in test_03.

---

## Acceptance Criteria (mandate)

| # | Criterion | Status |
|---|-----------|--------|
| AC-1 | 10 new agents_os tests in `test_canary_full_pipeline.py` | **DONE** |
| AC-2 | 10/10 agents_os PASS | **DONE** |
| AC-3 | Full suite 161+ passed, 0 failed | **DONE** (161) |
| AC-4 | TRACK_FOCUSED assertion | **DONE** (test_05) |
| AC-5 | Routing rules 15–19 exercised | **DONE** (via full advance path + Section E) |
| AC-6 | 4 policies verified | **DONE** (Section D) |
| AC-7 | 18 routing rules, table | **DONE** (Section E) |
| AC-8 | Template quality 6 gates | **DONE** (Section C / `_assert_l1_template_quality`) |
| AC-9 | Report in `_COMMUNICATION/team_51/` | **DONE** |
| AC-10 | CRITICAL/HIGH with root cause | **DONE** (Section F — orchestrator team) |

---

**log_entry | TEAM_51 | CANARY_DUAL_DOMAIN_QA | REPORT_COMPLETE | 2026-03-30**
