---
**project_domain:** AGENTS_OS
**id:** TEAM_100_AGENTS_OS_SYSTEM_VALIDATION_PRELAUNCH_v1.0.0
**from:** Team 100 (Development Architecture Authority — Agents_OS)
**to:** Team 20 (Backend), Team 90 (Dev Validation), Team 50 (QA)
**cc:** Team 00, Team 10, Team 190
**date:** 2026-02-27
**status:** ACTIVE — ACTION REQUIRED
**purpose:** Pre-launch validation of the complete Agents_OS system before S001-P002 (Alerts POC) is activated. Confirms that both validators are fully operational, tests are green, CLI routing is correct, and the system is production-ready to run a real TikTrack feature through the pipeline.
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P001 (validation of completed deliverables) |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | N/A (pre-gate system health check) |
| phase_owner | Team 100 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

# AGENTS_OS SYSTEM PRE-LAUNCH VALIDATION v1.0.0
## Mandatory check before S001-P002 activation

---

## 1. Purpose and Scope

Before running S001-P002 (Alerts POC) — the first real TikTrack feature through the Agents_OS pipeline — Team 100 requires confirmation that the system is fully operational.

**This is not a gate.** This is a technical health check. It does not require a GATE_0 submission or WSM update. It produces a VALIDATION REPORT that Team 100 reviews before issuing the S001-P002 LOD200 GATE_0 package.

**What is being validated:**
- Test suite health — all automated tests green
- CLI routing correctness — `--mode=spec` and `--mode=execution` behave correctly
- Domain isolation integrity — no TikTrack imports in Agents_OS production code
- LLM quality gate functionality — judge returns structured decisions
- End-to-end smoke test — a sample submission flows through the full validator chain

---

## 2. Team Assignments

| Team | Responsibility | Section |
|---|---|---|
| **Team 20** | Run test suite + CLI checks + code scan | §3, §4, §5 |
| **Team 90** | Run end-to-end smoke test with sample submission | §6 |
| **Team 50** | Review Team 20 + Team 90 reports; issue sign-off | §7 |
| **Team 100** | Review all reports; issue PRELAUNCH PASS/FAIL | §8 |

---

## 3. CHECK BLOCK A — Test Suite (Team 20)

### A-01: Full Test Suite Pass

**Command:**
```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix
python3 -m pytest agents_os/tests/ -v --tb=short 2>&1 | tee /tmp/agents_os_test_report.txt
echo "Exit code: $?"
```

**Success Criteria:**
- Exit code = 0
- Zero failures, zero errors
- All test files collected: `test_tier1.py`, `test_tier3_tier7.py`, `test_base.py`, `test_llm_gate.py`, `test_validation_runner.py`, `test_tier_e1.py`, `test_tier_e2.py`, `test_validator_stub.py`

**Failure Action:** If any test fails — STOP. Record exact failure message. Submit BF to Team 100 with exact test name and traceback. Do NOT proceed to A-02 until all tests pass.

**Evidence artifact:** `/tmp/agents_os_test_report.txt` — include in submission

---

### A-02: Test Coverage Check

**Command:**
```bash
python3 -m pytest agents_os/tests/ --co -q 2>&1 | grep "test session starts" -A 200 | tee /tmp/agents_os_test_collection.txt
python3 -m pytest agents_os/tests/ --co -q 2>&1 | tail -5
```

**Success Criteria:**
- Spec tests collected: all 7 tier files have corresponding test coverage (`test_tier1.py`, `test_tier3_tier7.py`)
- Execution tests collected: `test_tier_e1.py`, `test_tier_e2.py` present
- Total test count ≥ 30 (not a threshold — verify no tests were silently removed)

**Evidence artifact:** Test collection output

---

## 4. CHECK BLOCK B — CLI Routing (Team 20)

The `validation_runner.py` must route correctly across all three invocation patterns.

### B-01: Spec Mode — Full Validation

**Command:**
```bash
# Use a sample spec submission from the existing WP001 tests
python3 -m agents_os.orchestrator.validation_runner \
  --mode=spec \
  --submission agents_os/tests/spec/ \
  2>&1 | tee /tmp/b01_spec_mode.txt
echo "Exit code: $?"
```

**Success Criteria:**
- No unhandled exception
- Output contains `mode=spec` confirmation
- Output contains check result summary (pass/fail counts)
- Exit code is 0 (PASS) or 1 (BLOCK) — both are valid; exit code 2 (HOLD) also valid if LLM is triggered
- Does NOT produce execution mode output

**Note:** If no ready sample submission exists for testing, Team 20 creates a minimal 9-field header stub in a temp folder and runs against it. The validator is expected to BLOCK on an incomplete submission — that is correct behavior.

---

### B-02: Execution Mode Phase 1 (G3.5)

**Command:**
```bash
python3 -m agents_os.orchestrator.validation_runner \
  --mode=execution \
  --phase=1 \
  --submission agents_os/tests/execution/ \
  2>&1 | tee /tmp/b02_exec_phase1.txt
echo "Exit code: $?"
```

**Success Criteria:**
- Only TIER E1 checks run (E-01 through E-06)
- TIER E2 checks do NOT run in phase=1
- LLM quality gate does NOT run in phase=1
- Output confirms: `phase=1`, `tier_e1=run`, `tier_e2=skip`, `llm_gate=skip`

---

### B-03: Execution Mode Phase 2 (GATE_5)

**Command:**
```bash
python3 -m agents_os.orchestrator.validation_runner \
  --mode=execution \
  --phase=2 \
  --submission agents_os/tests/execution/ \
  2>&1 | tee /tmp/b03_exec_phase2.txt
echo "Exit code: $?"
```

**Success Criteria:**
- TIER E1 checks run (E-01 through E-06)
- TIER E2 checks run (E-07 through E-11)
- LLM quality gate is triggered (either runs or gracefully handles missing API key in test environment)
- Output confirms: `phase=2`, `tier_e1=run`, `tier_e2=run`, `llm_gate=run|skip(no_key)`

---

### B-04: Invalid Mode Rejection

**Command:**
```bash
python3 -m agents_os.orchestrator.validation_runner \
  --mode=invalid_mode \
  --submission . \
  2>&1
echo "Exit code: $?"
```

**Success Criteria:**
- Exit code ≠ 0 (must fail on invalid mode)
- Error message is human-readable (not a raw Python traceback)
- Does not silently default to any mode

---

## 5. CHECK BLOCK C — Code Integrity (Team 20)

### C-01: Domain Isolation Scan

**Command:**
```bash
# Scan for any TikTrack application imports in agents_os production code
grep -rn "from tiktrack\|import tiktrack\|from app\.\|from backend\." \
  agents_os/ \
  --include="*.py" \
  --exclude-dir=tests \
  --exclude-dir=docs-governance \
  2>&1 | tee /tmp/c01_domain_isolation.txt
echo "Matches found: $(cat /tmp/c01_domain_isolation.txt | wc -l)"
```

**Success Criteria:**
- Zero matches
- Any match = FAIL; report exact file, line, import path to Team 100

---

### C-02: Debug Artifact Scan

**Command:**
```bash
# Scan production code for debug artifacts
grep -rn "print(\|breakpoint()\|import pdb\|pdb\.set_trace()\|console\.log" \
  agents_os/ \
  --include="*.py" \
  --exclude-dir=tests \
  --exclude-dir=docs-governance \
  2>&1 | tee /tmp/c02_debug_scan.txt
echo "Matches found: $(cat /tmp/c02_debug_scan.txt | wc -l)"
```

**Success Criteria:**
- Zero matches in production code (`agents_os/` excluding `tests/`)
- `maskedLog` pattern (if used) is acceptable — only raw `print(` is flagged

---

### C-03: File Structure Integrity

**Command:**
```bash
# Verify expected file structure
for f in \
  "agents_os/validators/spec/tier1_identity_header.py" \
  "agents_os/validators/spec/tier2_section_structure.py" \
  "agents_os/validators/spec/tier3_gate_model.py" \
  "agents_os/validators/spec/tier4_wsm_alignment.py" \
  "agents_os/validators/spec/tier5_domain_isolation.py" \
  "agents_os/validators/spec/tier6_package_completeness.py" \
  "agents_os/validators/spec/tier7_lod200_traceability.py" \
  "agents_os/validators/execution/tier_e1_work_plan.py" \
  "agents_os/validators/execution/tier_e2_code_quality.py" \
  "agents_os/validators/base/validator_base.py" \
  "agents_os/validators/base/wsm_state_reader.py" \
  "agents_os/orchestrator/validation_runner.py" \
  "agents_os/llm_gate/quality_judge.py"; do
  [ -f "$f" ] && echo "✅ $f" || echo "❌ MISSING: $f"
done
```

**Success Criteria:**
- All 14 files present (✅ for each)
- Zero missing files

---

## 6. CHECK BLOCK D — End-to-End Smoke Test (Team 90)

This check confirms that the full spec validator pipeline produces a structured, complete output on a real-format submission.

### D-01: Smoke Test with Minimal Valid Submission

Team 90 creates a minimal spec submission document in a temp folder (`/tmp/smoke_test_submission/`) with the following content:

```markdown
---
project_domain: AGENTS_OS
id: SMOKE_TEST_SUBMISSION_v1.0.0
from: Team 90 (smoke test)
to: Team 190
date: 2026-02-27
status: TEST
gate_id: GATE_0
architectural_approval_type: SPEC
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-SMOKE |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | GATE_0 |
| phase_owner | Team 90 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |
```

**Command:**
```bash
mkdir -p /tmp/smoke_test_submission
# (create SMOKE_TEST_SPEC.md with content above)
python3 -m agents_os.orchestrator.validation_runner \
  --mode=spec \
  --submission /tmp/smoke_test_submission/ \
  2>&1 | tee /tmp/d01_smoke_test.txt
echo "Exit code: $?"
```

**Success Criteria:**
- No Python exception or unhandled crash
- Output contains: structured pass/fail report for each tier (T1–T7)
- Some checks BLOCK (expected — minimal submission is incomplete) — this is correct behavior
- BLOCK message format is parseable: contains check_id, check_name, failure_reason
- Output is deterministic (run twice, get identical results)

**Record:** Number of checks that PASS vs. BLOCK vs. ERROR. Any ERROR (unhandled exception in a check) = FAIL.

---

### D-02: Smoke Test with Fully Valid Submission (from existing test fixtures)

**Command:**
```bash
# Use the test fixtures from the WP001 test suite as a reference
python3 -m agents_os.orchestrator.validation_runner \
  --mode=spec \
  --submission agents_os/tests/spec/fixtures/ \
  2>&1 | tee /tmp/d02_full_smoke.txt
echo "Exit code: $?"
```

*If `agents_os/tests/spec/fixtures/` doesn't exist, Team 90 reports this as a gap for Team 100 to address before S001-P002 activation.*

**Success Criteria:**
- Exit code = 0 (PASS) when running against a valid fixture
- All 44 checks report PASS
- Total runtime < 60 seconds (deterministic checks only; LLM excluded in test environment)

---

## 7. SIGN-OFF BLOCK — Team 50 QA Review

Team 50 reviews the output reports from Checks A, B, C, D and produces a QA sign-off artifact with:

```
QA SIGN-OFF — AGENTS_OS PRE-LAUNCH VALIDATION
Date: [date]
Reviewed by: Team 50

Check A (Test Suite):        [PASS / FAIL — summary]
Check B (CLI Routing):       [PASS / FAIL — summary]
Check C (Code Integrity):    [PASS / FAIL — summary]
Check D (Smoke Test):        [PASS / FAIL — summary]

Overall: [GREEN / RED]
Gaps found: [list or "none"]
Recommendation: [PROCEED with S001-P002 activation / HOLD — address gaps first]
```

**File:** `AGENTS_OS_PRELAUNCH_QA_SIGNOFF_v1.0.0.md`
**Submit to:** `_COMMUNICATION/team_100/` (for Team 100 review)

---

## 8. ARTIFACTS TO SUBMIT

All artifacts submitted to `_COMMUNICATION/team_100/AGENTS_OS_PRELAUNCH_VALIDATION_EVIDENCE/`:

| File | Produced by | Contains |
|---|---|---|
| `TEST_SUITE_REPORT.txt` | Team 20 | pytest output (A-01, A-02) |
| `CLI_ROUTING_REPORT.txt` | Team 20 | CLI output for B-01 through B-04 |
| `CODE_INTEGRITY_REPORT.txt` | Team 20 | Scan outputs C-01, C-02, C-03 |
| `SMOKE_TEST_REPORT.txt` | Team 90 | D-01, D-02 outputs |
| `AGENTS_OS_PRELAUNCH_QA_SIGNOFF_v1.0.0.md` | Team 50 | Overall sign-off |

---

## 9. SUCCESS CRITERIA — PRELAUNCH PASS

Team 100 issues **PRELAUNCH PASS** when ALL of the following are true:

| Criterion | Threshold |
|---|---|
| Test suite (A-01) | 0 failures, 0 errors |
| Test count (A-02) | ≥ 30 tests collected |
| CLI spec mode (B-01) | No crash; output contains check summary |
| CLI exec phase 1 (B-02) | E1 only; E2 and LLM skipped |
| CLI exec phase 2 (B-03) | E1 + E2 run; LLM triggered or gracefully skipped |
| Invalid mode (B-04) | Non-zero exit code; readable error |
| Domain isolation (C-01) | 0 TikTrack imports in production code |
| Debug scan (C-02) | 0 debug artifacts in production code |
| File structure (C-03) | All 14 files present |
| Smoke test minimal (D-01) | No crashes; structured BLOCK output |
| Smoke test valid (D-02) | exit_code=0; 44 PASS; runtime < 60s |
| Team 50 QA sign-off | GREEN |

**Any single criterion RED = PRELAUNCH FAIL.** Address gap, rerun failed check only, resubmit.

---

## 10. Post-PRELAUNCH PASS Action

When Team 100 issues PRELAUNCH PASS:

1. Team 100 packages S001-P002 LOD200 for GATE_0 submission (7 canonical files)
2. Team 100 submits to `_COMMUNICATION/_ARCHITECT_INBOX/`
3. Team 190 executes GATE_0 validation per standard protocol
4. S001-P002 pipeline begins

---

**log_entry | TEAM_100 | AGENTS_OS_SYSTEM_VALIDATION_PRELAUNCH_v1.0.0_ISSUED | TO_TEAM_20_TEAM_90_TEAM_50 | 2026-02-27**
