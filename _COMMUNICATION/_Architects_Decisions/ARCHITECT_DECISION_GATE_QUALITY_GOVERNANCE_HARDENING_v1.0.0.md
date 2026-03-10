# ARCHITECT DECISION — Gate Quality Governance Hardening v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)
**id:** ARCHITECT_DECISION_GATE_QUALITY_GOVERNANCE_HARDENING_v1.0.0
**from:** Team 00 (Chief Architect)
**date:** 2026-03-11
**status:** LOCKED
**effective:** Phase 0 — IMMEDIATE | Phase 1 — WP003 pilot | Phase 2 — S003+
**authority:** Team 00 constitutional authority
**trigger:** TEAM_190_TO_TEAM_00_TEAM_100_G5_G6_G7_AUTOMATION_GOVERNANCE_INTELLIGENCE_REPORT_v1.0.1
         + TEAM_50_QA_PROCESS_IMPROVEMENT_G5_G7_GAP_ANALYSIS_v1.0.0 (validated by Team 190)
**integrates_with:** ARCHITECT_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE_v1.0.0

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | CROSS-STAGE |
| program_id | GOVERNANCE |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 00 |

---

## §1 — Integration of Two Governance Streams

This decision integrates two parallel governance initiatives that were active simultaneously on 2026-03-11:

| Stream | Directive | Core focus |
|--------|-----------|------------|
| Stream A | `ARCHITECT_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE_v1.0.0` | Domain boundary, WSM structure, GATE_7 surface |
| Stream B | This document | GATE_4/5/6/7 quality evidence contracts, Manual-First baseline |

**These streams are complementary, not competing.** Their integration points are documented in §2.

---

## §2 — Acceptance of Team 190 Report v1.0.1

**Decision: ACCEPTED WITH CONDITIONS — conditions met by this document.**

Team 190's constitutional assessment is correct and adopted:

1. **Manual-First principle**: Lock manual governance baseline before any agent overlay. ✅ Accepted.
2. **Authority separation**: Team 00 = supreme; Team 100 = Agents_OS domain under Team 00; Team 190 = constitutional validator. ✅ Confirmed (already locked in ARCHITECT_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE_v1.0.0 §2).
3. **Operational reality**: Single human operator (Nimrod) passes messages between agents. Quality depends on clear manual procedures first. ✅ Accepted — Phase 0 must precede automation.

---

## §3 — Option B Decision (GATE_4 vs GATE_5 Suite Split)

**Decision: Option B — ADOPTED.**

> GATE_4 = subset suite (smoke + readiness)
> GATE_5 = canonical superset (deterministic, comprehensive)

**Rationale:**
- Option A (same suite at both gates) eliminates progressive validation benefit and doubles runtime with no quality gain.
- Option B preserves gate semantics: GATE_4 catches blocking failures early; GATE_5 provides the definitive evidence baseline for GATE_6 traceability.
- V2 pipeline already supports MCP browser test scenarios at GATE_4 level — consistent with subset approach.

**GATE_4 (subset) — mandatory contents:**
- Smoke tests: application starts, main routes reachable
- Readiness checks: no SEVERE regressions in critical flows
- MCP browser scenarios: core entity CRUD (from `agents_os_v2/mcp/test_scenarios.py` if applicable)
- 0 SEVERE blockers = PASS

**GATE_5 (canonical superset) — mandatory contents:**
- Full test suite: all AUTO_TESTABLE acceptance criteria from GATE_2 approval
- UI assertions: screen-level automated checks (not API-only)
- Deterministic data baseline (fixed seed/session)
- Evidence: `G5_AUTOMATION_EVIDENCE.json` (canonical schema — see §6)
- Verdict: Team 90 deterministic — no Nimrod run required as gate condition
- 0 SEVERE blockers in superset = PASS

---

## §4 — GATE_7 Unified Definition (Integration of Stream A + Stream B)

U-03 from Stream A defines the **surface requirement** (browser/UI always).
Team 190 Phase 0 from Stream B defines the **content requirement** (residuals-only).
Together, these form the complete GATE_7 canonical definition:

> **GATE_7 = HUMAN_UX_APPROVAL — Iron Rule.**
> Executor: Nimrod (Team 00) exclusively.
> Surface: browser/UI always (feature WPs: product pages; infrastructure WPs: admin panel / monitoring dashboard).
> Content: residuals only — items in `G7_HUMAN_RESIDUALS_MATRIX.md` that CANNOT be verified programmatically.
> GATE_7 must NOT re-run checks already closed deterministically at GATE_5.
> Pure log-file-only or terminal-only review is not valid GATE_7 evidence.
> No exceptions without Team 00 formal amendment.

**GATE_7 contract v1.1.0 (Team 170 mandate) must include this unified definition** — both U-03 additions (§2.5 infrastructure provision, §2.6 GATE_6 override prohibition) AND the residuals-only principle (§2.7).

---

## §5 — AUTO_TESTABLE / HUMAN_ONLY Classification Lock

**Every LOD400 spec (GATE_1/GATE_2) must include, per acceptance criterion:**

| Tag | Meaning | Gate verification |
|-----|---------|-------------------|
| `AUTO_TESTABLE` | Can be verified programmatically | GATE_5 (canonical superset) |
| `HUMAN_ONLY` | Requires human judgement or browser interaction | GATE_7 (residuals matrix) |

**This classification:**
- Must be defined at GATE_1 (spec lock) and confirmed at GATE_2 (intent approval)
- Is the basis for the `G7_HUMAN_RESIDUALS_MATRIX.md` — which contains ONLY items tagged `HUMAN_ONLY`
- Is the basis for Team 90's GATE_5 verdict scope

**GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT_v1.1.0 (Team 170 mandate) must add:**
- AUTO_TESTABLE / HUMAN_ONLY tags as required fields in LOD400 acceptance criteria
- `G7_HUMAN_RESIDUALS_MATRIX.md` as a mandatory GATE_2 output artifact

---

## §6 — Canonical Artifact Contract Schemas (Iron Rule)

These artifacts must exist and conform to these schemas for every WP. Team 170 creates the canonical templates.

### G5_AUTOMATION_EVIDENCE.json (minimal required schema)

```json
{
  "work_package_id": "S00X-P00X-WP00X",
  "gate_id": "GATE_5",
  "verdict": "PASS | FAIL",
  "run_timestamp": "ISO8601",
  "test_suite_type": "canonical_superset",
  "total_tests": 0,
  "passed": 0,
  "failed": 0,
  "skipped": 0,
  "severe_blockers": 0,
  "flakiness_controls": {
    "seed": "fixed_value_or_none",
    "timeout_policy": "per_test_ms",
    "retry_policy": "no_retry_on_first_run"
  },
  "evidence_artifacts": ["path/to/report"],
  "issuer_team": "Team 90"
}
```

### G6_TRACEABILITY_MATRIX.md (template)

```markdown
# GATE_6 Traceability Matrix — {WP_ID}
gate_id: GATE_6
work_package_id: {WP_ID}
gate2_decision_reference: ARCHITECT_GATE2_{SCOPE_ID}_DECISION.md

| Spec Item (GATE_2 intent) | LOD400 §Ref | Implementation File | Test Evidence (GATE_5) | Status |
|---|---|---|---|---|
| [acceptance criterion] | §X.X | path/to/file.py | G5_AUTOMATION_EVIDENCE row N | MATCH / DEVIATION |

VERDICT: MATCH_ALL | DEVIATION_FOUND
If DEVIATION_FOUND: routing per GATE_6 rejection protocol.
```

### G7_HUMAN_RESIDUALS_MATRIX.md (template)

```markdown
# GATE_7 Human Residuals Matrix — {WP_ID}
gate_id: GATE_7
work_package_id: {WP_ID}
classification_basis: GATE_2 approved AUTO_TESTABLE/HUMAN_ONLY tags

SCOPE: This matrix contains ONLY items tagged HUMAN_ONLY in the approved spec.
       GATE_7 DOES NOT re-run any item already closed in GATE_5.

| # | Residual Item | GATE_2 Ref | UI Page/Surface | Expected Result | Nimrod Actual | PASS/FAIL |
|---|---|---|---|---|---|---|
| 1 | [description] | §X.X | [page name] | [expected] | [to fill] | — |

GATE_7 PASS condition: all residuals PASS + Nimrod sign-off (אישור).
```

---

## §7 — Anti-Flakiness Policy (Iron Rule)

All automated test suites used in GATE_4 and GATE_5 must comply:

| Policy | Rule |
|--------|------|
| Seed | Fixed random seed declared in test config |
| Session isolation | Each gate run in isolated environment (no shared state) |
| Timeout | All async operations have explicit timeout in ms |
| Retry | No retries on initial gate run; retry flag allowed on re-run only |
| Data baseline | Deterministic seed data — no reliance on live external state for pass/fail |
| Flakiness block | Flaky test = SEVERE blocker until root cause resolved |

---

## §8 — Phase 0/1/2 Implementation Roadmap

### Phase 0 — Manual Governance Baseline (IMMEDIATE)

**Trigger:** Now — before WP003 exits GATE_4
**Owners:** Team 170 (documentation); Team 00 (approval)
**Deliverables:**

| # | Deliverable | Location | Owner |
|---|---|---|---|
| P0-D1 | `GATES_4_5_6_7_GOVERNANCE_POLICY_v1.0.0.md` | `documentation/docs-governance/04-PROCEDURES/` | Team 170 |
| P0-D2 | `G5_AUTOMATION_EVIDENCE_CONTRACT_v1.0.0.md` | `documentation/docs-governance/05-CONTRACTS/` | Team 170 |
| P0-D3 | `G6_TRACEABILITY_MATRIX_CONTRACT_v1.0.0.md` | `documentation/docs-governance/05-CONTRACTS/` | Team 170 |
| P0-D4 | `G7_HUMAN_RESIDUALS_MATRIX_CONTRACT_v1.0.0.md` | `documentation/docs-governance/05-CONTRACTS/` | Team 170 |
| P0-D5 | `GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.1.0.md` | `documentation/docs-governance/05-CONTRACTS/` | Team 170 |
| P0-D6 | `04_GATE_MODEL_PROTOCOL_v2.3.0.md` §2.3 amendment | `documentation/docs-governance/01-FOUNDATIONS/` | Team 170 |
| P0-D7 | `GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT_v1.1.0.md` | `documentation/docs-governance/05-CONTRACTS/` | Team 170 |
| P0-D8 | `STAGE_ACTIVE_PORTFOLIO_S002.md` | `_COMMUNICATION/team_170/` | Team 170 |
| P0-D9 | WP003 AUTO_TESTABLE/HUMAN_ONLY classification | As addendum to WP003 GATE_5 prep | Team 50 + Team 90 |

**Gate dependency:** Phase 0 must complete before WP003 GATE_5 submission to Team 90.

### Phase 1 — Pilot on WP003 (Active WP)

**Trigger:** WP003 GATE_5 submission (after Phase 0 complete + Team 50 QA PASS)
**Owners:** Team 10 (orchestration), Team 50 (QA), Team 90 (validation), Team 60 (runtime)
**WP003 pilot sequence:**

| Step | Action | Evidence artifact |
|------|--------|-------------------|
| GATE_4 | Team 50 smoke/readiness subset | QA smoke report |
| GATE_5 | Team 90 canonical superset verdict | `G5_AUTOMATION_EVIDENCE.json` |
| GATE_6 | Traceability-only match vs GATE_2 intent | `G6_TRACEABILITY_MATRIX.md` |
| GATE_7 | D22 browser walk-through (residuals from matrix) | `G7_HUMAN_RESIDUALS_MATRIX.md` + Nimrod sign-off |

**Pilot success criteria:** All 3 artifacts produced with correct schema; GATE_7 = residuals only; no GATE_5 re-runs at GATE_7.

### Phase 2 — Agent Overlay (S003+)

**Trigger:** WP003 GATE_8 PASS + Phase 1 pilot confirmed successful
**Owners:** Team 100 (domain architecture), Team 61 (automation), Team 00 (approval)
**Scope:** V2 Pipeline (`orchestrator/pipeline.py`) as execution multiplier for mandate generation, prompt generation, gate advancement
**Constraint:** Agent outputs must produce the SAME artifact schemas as Phase 0/1 manual baseline
**Gate semantics:** Unchanged. Agent pipeline = execution accelerator, NOT gate authority.
**Requires dedicated WP:** Phase 2 agent overlay activation = new GATE_0 package for a dedicated Agents_OS WP in S003.

---

## §9 — Root Cause Corrections (from Team 190 §5)

These issues will be eliminated by the Phase 0 contracts:

| Root cause | Fix |
|-----------|-----|
| API green ≠ UI green | AUTO_TESTABLE items must include UI assertion (not API-only); enforced at GATE_1 classification |
| Non-deterministic data baseline | Anti-flakiness policy §7 mandates fixed seed + session isolation |
| Non-uniform evidence schema | G5_AUTOMATION_EVIDENCE.json canonical schema mandated at every GATE_5 |
| GATE_4 / GATE_5 owner confusion | Option B: different suites, different owners, explicit policy (P0-D1) |

---

## §10 — Team Activation Summary

| Team | Task | Timing |
|------|------|--------|
| Team 170 | P0-D1..D8 (all governance documents) | IMMEDIATE |
| Team 100 | U-01 route to Team 61 via BF-03 | IMMEDIATE |
| Team 61 | team_190.md GATE_0 domain-match item 7 | Part of BF-03 |
| Team 50 | WP003 AUTO_TESTABLE/HUMAN_ONLY classification | Before WP003 GATE_5 |
| Team 90 | Apply new artifact contracts to WP003 GATE_5/6/7 | After Phase 0 complete |
| Team 10 | Coordinate Phase 1 pilot for WP003 | After Phase 0 complete |
| Team 170 | U-02 WSM structure changes | S003 start |
| Team 100 + Team 61 | Phase 2 agent overlay WP | S003, after Phase 1 success |

---

## §11 — GATE_8 WP003 Closure Requirement

WP003 GATE_8 closure document must include:
1. Pilot Phase 1 result confirmation (3 artifacts produced and valid)
2. Historical anomaly note (TIKTRACK WP under AGENTS_OS program — per §6 of DUAL_DOMAIN_GOVERNANCE directive)
3. Phase 2 go/no-go assessment based on Phase 1 evidence

---

**log_entry | TEAM_00 | ARCHITECT_DECISION_GATE_QUALITY_GOVERNANCE_HARDENING | v1.0.0 | LOCKED | 2026-03-11**
