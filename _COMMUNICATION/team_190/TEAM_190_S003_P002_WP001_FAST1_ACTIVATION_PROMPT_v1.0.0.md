---
**project_domain:** AGENTS_OS
**id:** TEAM_190_S003_P002_WP001_FAST1_ACTIVATION_PROMPT_v1.0.0
**from:** Team 100 (FAST_0 owner)
**to:** Team 190 (Constitutional Validator — FAST_1)
**cc:** Team 00, Team 61
**date:** 2026-03-11
**status:** ACTIVE — awaiting Team 190 FAST_1 ruling
**context:** This is a FULL LOD400 validation. Previous concept validation (CONCEPT_APPROVED_WITH_FLAGS, 7 CV checks) was on the LOD200. This prompt validates the complete LOD400 implementation spec.
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P002 |
| work_package_id | WP001 |
| gate_id | FAST_1 |
| phase_owner | Team 190 |
| required_ssm_version | 1.0.0 |

---

# Team 190 — FAST_1 Validation
## S003-P002 WP001: Test Template Generator — Full LOD400

---

## §1 Validation Request

Team 100 submits the complete LOD400 for S003-P002 (Test Template Generator) for constitutional validation.

This is **FAST_1 on the full LOD400**, not a concept check. The prior Team 190 validation (CONCEPT_APPROVED_WITH_FLAGS) was on the LOD200 and was superseded by the LOD400 which resolved all 6 flags. You are validating the implementation spec.

**Your task:** Validate implementation soundness, domain isolation, protocol compliance, and gate integration. Issue FAST_1_PASS, FAST_1_PASS_WITH_ACTION, or FAST_1_BLOCK.

---

## §2 Documents to Read

| # | Document | Why |
|---|---|---|
| 1 | `_COMMUNICATION/team_00/TEAM_00_S003_P002_TEST_TEMPLATE_GENERATOR_LOD400_v1.0.0.md` | **Primary — full LOD400 spec** |
| 2 | `_COMMUNICATION/team_100/TEAM_100_S003_P002_WP001_FAST0_SCOPE_BRIEF_v1.0.0.md` | FAST_0 scope brief — procedural corrections (req.txt + FAST_3 sample spec) |
| 3 | `documentation/docs-governance/04-PROCEDURES/FAST_TRACK_EXECUTION_PROTOCOL_v1.2.0.md` | §6.2 AGENTS_OS lane, §3 active teams |
| 4 | `agents_os_v2/context/identity/team_51.md` | Team 51 QA checks — verify LOD400 is QA-able |
| 5 | `_COMMUNICATION/team_00/TEAM_00_AGENTS_OS_INDEPENDENT_ADVANCEMENT_DIRECTIVE_v1.0.0.md` | Activation authority |

---

## §3 Validation Checks (BF-01..BF-09)

Assess each check. Return PASS / PASS_WITH_ACTION / BLOCK per check.

---

### BF-01 — Domain Isolation — FLAG-01 Implementation
**Check:** Is the import contract for `generators/` fully specified and enforceable?
- Allowed: stdlib + Jinja2 + `agents_os_v2.config` only
- Prohibited: `api.*`, `ui.*`, `orchestrator.*`, `conversations.*`, `validators.*`
- Is this prohibition coherent with V-30..V-33 (domain_isolation validator)?
- Is Team 51 Check 3 (grep) sufficient to enforce this at FAST_2.5?

---

### BF-02 — G3.7 Integration Soundness
**Check:** Is the G3.7 sub-stage integration into gate_router.py well-specified?
- LOD400 §5.3 provides the exact code block. Is it architecturally sound?
- G3.7 position: after G3.5, before G3.6. Does this sequencing make sense for all WPs (including WPs with no LLD400 contracts — TT-SKIP case)?
- Does the TT-SKIP path (no contract sections) safely advance to G3.6 without blocking?
- **Risk**: If G3.7 BLOCKS (TT-00), Team 10 is stuck between G3.5 and G3.6. Is there an explicit unblock procedure?

---

### BF-03 — Parser Failure Policy — FLAG-04 Implementation
**Check:** Are TT-00 and TT-SKIP mutually exclusive and exhaustive?
- TT-00: section found + no parseable tables → BLOCK
- TT-SKIP: no section at all → skip (not a failure)
- What happens when SOME sections have tables and some don't? (LOD400 §4 FLAG-04 case 3)
- Is "generate for found contracts; log WARNING per missing section" safe for G3.7 exit?

---

### BF-04 — Idempotency — FLAG-03 Implementation
**Check:** Is GENERATE_ONCE + backup policy safe for the git workflow?
- Generated files are committed at G3.7 exit (per LOD400 §4 FLAG-03)
- Team 50 MUST NOT edit generated files — is this constraint documented in a place Team 50 will see it?
- If Team 50 edits a generated file accidentally and Team 10 re-runs G3.7 with `--force`, the backup protects their edits. Is the backup location (`{filename}.pre_regen.py` in same dir) clear enough?

---

### BF-05 — Jinja2 Dependency and Requirements Scope
**Check:** Is the Jinja2 dependency correctly scoped?
- FAST_0 scope brief §6 mandates creating `agents_os_v2/requirements.txt` (new file) for Jinja2
- This is NOT going into `api/requirements.txt` (TIKTRACK domain boundary)
- Is creating `agents_os_v2/requirements.txt` as a new file appropriate, or does it conflict with how agents_os_v2 is currently installed/run?
- Who installs from this requirements.txt? (Team 61 during FAST_2; Team 51 must confirm Jinja2 is importable before FAST_2.5)

---

### BF-06 — Test Adequacy (14 tests)
**Check:** Do the 14 specified tests (LOD400 §6) provide adequate coverage?
- Review the test table: does each test have clear pass/fail semantics?
- Is `test_generate_output_is_valid_python` (using `compile()`) a reliable check?
- Are domain isolation tests (`test_no_import_from_api`, `test_no_import_from_orchestrator`) static checks or runtime? Static grep is sufficient?
- Is 14 the right count, or is there a critical case not covered?

---

### BF-07 — FAST_3 Sample Spec Correction (FAST_0 §7)
**Check:** Is the FAST_0 procedural correction for FAST_3 check #3 sound?
- Original LOD400 check #3: "run on S003-P003 LLD400" — not available
- Correction: Team 61 creates `agents_os_v2/tests/fixtures/sample_spec_with_contracts.md`
- Is this fixture an appropriate test surface? (It should contain exactly one API contract table + one Page contract table)
- Does this approach fully validate the generator's correctness, or is it too minimal?

---

### BF-08 — Protocol and Team Assignment Compliance
**Check:** Are all team assignments compliant with FAST_TRACK_EXECUTION_PROTOCOL_v1.2.0 §3?
- Team 61: execution ✓ (in §3 active teams)
- Team 51: QA FAST_2.5 ✓ (in §3 active teams)
- Team 170: FAST_4 ✓ (in §3 active teams)
- Team 190: FAST_1 ✓
- Team 10: NOT in AGENTS_OS fast-track active teams — but LOD400 §4 FLAG-02 says "Team 10 includes scaffold file paths in Team 50 activation mandate." Is this a cross-domain dependency that violates Team 10's AGENTS_OS exclusion?

---

### BF-09 — Downstream Impact: Team 10 Runbook Update
**Check:** Is the GATE_3 runbook update (G3.7 addition) properly scoped and deferred?
- LOD400 says G3.7 is added to the GATE_3 chain
- FAST_0 §9 + §11 say Team 170 updates the runbook at FAST_4
- Is deferring this runbook update to FAST_4 safe? (i.e., does G3.7 need to be in the runbook before Team 61 implements it, or only before Team 10 starts using it in production?)
- If Team 10 is notified at FAST_4, is there a risk they've already processed a WP that would have used G3.7 in the meantime?

---

## §4 Expected Output Format

```
## validation_result_matrix

| # | Check | Result | Finding | Evidence |
|---|---|---|---|---|
| BF-01 | Domain isolation | PASS/PASS_WITH_ACTION/BLOCK | ... | path:line |
| BF-02 | G3.7 integration | ... | ... | path:line |
| BF-03 | Parser failure policy | ... | ... | path:line |
| BF-04 | Idempotency policy | ... | ... | path:line |
| BF-05 | Jinja2 dependency | ... | ... | path:line |
| BF-06 | Test adequacy | ... | ... | path:line |
| BF-07 | FAST_3 sample spec | ... | ... | path:line |
| BF-08 | Protocol compliance | ... | ... | path:line |
| BF-09 | Runbook deferral | ... | ... | path:line |

## overall_verdict
FAST_1_PASS | FAST_1_PASS_WITH_ACTION | FAST_1_BLOCK

## routing_authorization (if PASS or PASS_WITH_ACTION)
Team 61: authorized to begin FAST_2
Team 51: on standby for FAST_2.5

## actions_required (if PASS_WITH_ACTION)
[list of specific actions with owners]
```

---

**log_entry | TEAM_100 | TO_TEAM_190 | S003_P002_WP001_FAST1_ACTIVATION_PROMPT | v1.0.0 | BF01_TO_BF09 | 2026-03-11**
