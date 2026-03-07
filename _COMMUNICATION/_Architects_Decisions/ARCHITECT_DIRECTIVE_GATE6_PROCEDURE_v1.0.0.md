# ARCHITECT_DIRECTIVE — GATE_6 REVIEW PROCEDURE v1.0.0
**id:** ARCHITECT_DIRECTIVE_GATE6_PROCEDURE
**from:** Team 00 (Chief Architect — Nimrod)
**to:** Team 90 (GATE_6 execution owner), Team 10 (Execution Orchestrator), All submission teams
**cc:** Team 100 (Architecture Authority), Team 170 (Spec Authority), Team 190 (Spec Validation)
**date:** 2026-03-01
**status:** LOCKED (canonical; effective immediately)
**gate_id:** GATE_6
**scope:** ALL future GATE_6 submissions, all domains

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | L0-PHOENIX |
| stage_id | All stages |
| program_id | All programs |
| work_package_id | N/A (cross-program directive) |
| task_id | N/A |
| gate_id | GATE_6 |
| phase_owner | Team 00 (authority) / Team 90 (execution) |
| required_ssm_version | 1.0.0 |

---

## §1 — Purpose

This directive codifies the **GATE_6 architectural review procedure** based on first-cycle execution experience (S002-P003-WP002, 2026-03-01). It defines:

1. **Mandatory submission requirements** — expanded 8-artifact package
2. **Architect review checklist** — what Team 00 verifies at GATE_6
3. **Evidence quality standard** — what constitutes sufficient runtime evidence
4. **Architectural quality checklist** — non-functional requirements verified at GATE_6

Supersedes any informal GATE_6 practices. Complements (does not replace):
- `04_GATE_MODEL_PROTOCOL_v2.3.0.md` §4.3 — gate semantics
- `GATE_6_REJECTION_ROUTE_PROTOCOL_v1.0.0.md` — rejection routing

---

## §2 — First-Cycle Gaps That Prompted This Directive

| Gap ID | Gap | Severity |
|--------|-----|----------|
| PG-01 | No formal GATE_6 review checklist — architect improvised on what to validate | MEDIUM |
| PG-02 | 7-artifact submission format does not require SOP-013 Seal completeness matrix — seals missed | MEDIUM |
| PG-03 | No mandatory "delta from GATE_2" section — no explicit comparison: approved spec vs. actual | MEDIUM |
| PG-04 | Evidence quality undefined — "PRESENT" treated equal to "X/X PASS exit 0" | LOW |
| PG-05 | No architectural quality checklist — maskedLog, NUMERIC precision, pattern compliance unverified | LOW |

---

## §3 — Updated Submission Package (8 Artifacts)

All future GATE_6 submissions MUST include the following **8 artifacts** (7 original + 1 new):

| # | Artifact | Content |
|---|----------|---------|
| 1 | COVER_NOTE | Submission summary, work_package_id, requested decision |
| 2 | EXECUTION_PACKAGE | Scope, canonical artifact list, execution evidence summary |
| 3 | VALIDATION_REPORT | Team 90 validation results by target |
| 4 | DIRECTIVE_RECORD | Reference to active directives governing the submission |
| 5 | PROCEDURE_AND_CONTRACT_REFERENCE | Identity header + contract conformance statement |
| 6 | SSM_VERSION_REFERENCE | SSM version + LOCKED status |
| 7 | WSM_VERSION_REFERENCE | WSM operational state at submission time |
| **8** | **GATE6_READINESS_MATRIX** | **NEW — see §4 below** |

### §3.1 — GATE6_READINESS_MATRIX (8th artifact)

The 8th artifact must contain both:

#### A. SOP-013 Seal Completeness Matrix

Table mapping every WP and domain track in the work package to its SOP-013 Seal status:

```
| WP | Domain Track | Seal issuer | Seal status | Reference |
|----|-------------|-------------|-------------|-----------|
| WP001 | D22 Filter UI | Team 30 | PRESENT / MISSING | [path to report] |
| WP002 | D22 FAV | Team 50 | PRESENT / MISSING | [path to report] |
| WP002 | D34 FAV | Team 50 | PRESENT / MISSING | [path to report] |
| WP002 | D35 FAV | Team 50 | PRESENT / MISSING | [path to report] |
```

Team 90 MUST NOT submit GATE_6 if any row shows MISSING unless explicitly escalated with justification.

#### B. Delta from GATE_2 — LLD400 Exit Criteria Table

Table mapping every LLD400 §2.6 exit criterion to actual delivery status:

```
| LLD400 §2.6 Exit Criterion | Status | Evidence (pass count, exit code, source) |
|---------------------------|--------|----------------------------------------|
| WP001: Filter bar present | ✅/❌/⚠️ | |
| WP001: loadTickersData params | ✅/❌/⚠️ | |
| WP002 D22: API script 100% PASS | ✅/❌/⚠️ | X/X exit 0 — [source] |
| WP002 D22: E2E 100% PASS | ✅/❌/⚠️ | X/X exit 0 — [source] |
| WP002 D34: CRUD E2E PASS | ✅/❌/⚠️ | |
| WP002 D34: CATS precision PASS | ✅/❌/⚠️ | |
| WP002 D34: Error contracts PASS | ✅/❌/⚠️ | |
| WP002 D34: Regression PASS | ✅/❌/⚠️ | |
| WP002 D34: SOP-013 | ✅/❌/⚠️ | |
| WP002 D35: CRUD E2E PASS | ✅/❌/⚠️ | |
| WP002 D35: XSS PASS | ✅/❌/⚠️ | |
| WP002 D35: Error contracts PASS | ✅/❌/⚠️ | |
| WP002 D35: Regression PASS | ✅/❌/⚠️ | |
| WP002 D35: SOP-013 | ✅/❌/⚠️ | |
```

Any ❌ row must be accompanied by explanation and proposed route (DOC_ONLY_LOOP or CODE_CHANGE_REQUIRED).
Any ⚠️ row must be accompanied by explanation and Team 90 classification.
A submission with any unexplained ❌ will be returned without architect review.

---

## §4 — Evidence Quality Standard

**"PRESENT" is NOT sufficient for PASS classification.**

| Evidence level | Definition | GATE_6 treatment |
|----------------|------------|-----------------|
| **EXISTS** | File present at canonical path | Confirms artifact delivery only. Not sufficient for PASS. |
| **RUNTIME_PASS** | Pass count + exit code documented (e.g., "12/12 PASS, exit 0") | Required for PASS on any quantitative test |
| **RUNTIME_EVIDENCE_PATH** | Log file path provided and accessible | Supports RUNTIME_PASS; must accompany PASS claims |
| **PRESENT_UNRUN** | File exists but no runtime result | Classified as ⚠️ in Delta table; requires DOC_ONLY remediation |

Every quantitative test (API scripts, E2E, CATS) must be backed by RUNTIME_PASS level evidence in the submission.

---

## §5 — GATE_6 Architect Review Checklist

The following checklist is used by Team 00 at every GATE_6 review cycle. Team 90 should self-assess against this checklist before submitting:

### 5.1 — Process Integrity
- [ ] Gate sequence correct: GATE_4 PASS → GATE_5 PASS → GATE_6 submission
- [ ] No GATE bypass or concurrent gate states
- [ ] Scope stays within approved WP — no creep
- [ ] Identity headers complete in all 8 artifacts
- [ ] SSM version locked; WSM state post-GATE_5 PASS

### 5.2 — Artifact Completeness
- [ ] All canonical artifacts exist at exact LLD400 paths (no aliases, no renamed files)
- [ ] All 8 submission artifacts present (GATE6_READINESS_MATRIX included)
- [ ] SOP-013 Seal Completeness Matrix shows no unexplained MISSING

### 5.3 — Delta from GATE_2 (Core GATE_6 question)
- [ ] GATE6_READINESS_MATRIX delta table covers every LLD400 §2.6 exit criterion
- [ ] Every ❌ or ⚠️ has a classified route (DOC_ONLY or CODE_CHANGE)
- [ ] No unexplained gaps

### 5.4 — Evidence Quality
- [ ] All quantitative tests: RUNTIME_PASS evidence (pass count + exit code)
- [ ] No "PRESENT" claims for tests that have a pass/fail quantitative result
- [ ] Runtime evidence paths referenced (log files, reports)

### 5.5 — Architectural Quality (spot-check)
- [ ] **maskedLog:** All JS error logging uses `maskedLog` (not `console.log`) — Iron Rule
- [ ] **NUMERIC precision:** Any financial/decimal field has CATS coverage (condition_value, price, etc.) — Iron Rule
- [ ] **Pattern compliance:** Implementation follows established Phoenix LEGO/UAI patterns (not checked for new architecture, applies to existing patterns)
- [ ] **Error contracts:** For every domain track with "error contracts PASS" in LLD400 §2.6, confirm ≥3 error response types are tested

---

## §6 — GATE_6 Fast-Reference Card

For quick reference during submission and review:

**GATE_6 = שער מציאות**
> "האם מה שנבנה הוא מה שאישרנו ב-GATE_2?"

**PASS requires:**
1. All LLD400 §2.6 exit criteria: ✅
2. All SOP-013 seals: PRESENT
3. All quantitative tests: RUNTIME_PASS
4. 8-artifact package: complete

**Rejection routes:**
- `DOC_ONLY_LOOP` → documentation/reports only, no code change, no WSM change, resubmit
- `CODE_CHANGE_REQUIRED` → implementation/test change required, WSM rollback to GATE_3
- `ESCALATE_TO_TEAM_00` → cannot classify; escalate to Nimrod

---

## §7 — Effective Date and Applicability

- **Effective:** 2026-03-01 (this directive)
- **Applies to:** All GATE_6 submissions, all domains (TikTrack, Agents_OS), all future cycles
- **First application:** S002-P003-WP002 GATE_6 resubmission
- **Authority:** Team 00 (Chief Architect). Teams 90, 10, 50 must comply.

---

**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE_GATE6_PROCEDURE | v1.0.0_LOCKED | 2026-03-01**
