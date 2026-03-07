# PHASE1_BASELINE_EVIDENCE_v1.0.0
**project_domain:** SHARED (TIKTRACK + AGENTS_OS)

**id:** PHASE1_BASELINE_EVIDENCE_v1.0.0  
**program_id:** PHOENIX_SOURCE_AUTHORITY_CONVERGENCE_PROGRAM_v1.1.0  
**owner:** Team 10  
**date:** 2026-02-26  
**status:** BASELINE_VALIDATED_PASS

---

## 1) Volume Snapshot

| Team folder | Markdown files |
|---|---|
| `_COMMUNICATION/team_00/` | 5 |
| `_COMMUNICATION/team_90/` | 37 |
| `_COMMUNICATION/team_100/` | 96 |
| `_COMMUNICATION/team_190/` | 132 |

---

## 2) Reference Density Snapshot

| Pattern | Occurrences |
|---|---|
| `documentation/docs-governance/PHOENIX_CANONICAL/` | 120 |
| `documentation/docs-governance/AGENTS_OS_GOVERNANCE/` | 407 |

---

## 3) Critical Findings Snapshot (Current)

### P0-A: Canonical root path contradictions in entry index (open)

From `00_MASTER_INDEX.md`:
- `documentation/docs-governance/PHOENIX_CANONICAL/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md`
- `documentation/docs-governance/PHOENIX_CANONICAL/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md`
- `documentation/docs-governance/PHOENIX_CANONICAL/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`

### P0-B: Missing canonical root directory (open)

- `documentation/docs-governance/PHOENIX_CANONICAL/` is missing.

### P0-C: Stale Team 190 constitution artifact (open)

- `documentation/docs-governance/01-FOUNDATIONS/07_TEAM_190_CONSTITUTION.md` includes stale scope line: `Blocks any violation before Gate 5 pass.`

### P1-A: Team 00 onboarding drift (open)

- Team 00 briefing states `current_gate = GATE_1` and `active_flow = GATE_1_BLOCKED`.
- Canonical WSM current state (2026-02-26 publication baseline) is `current_gate = GATE_8` with `active_flow = GATE_8 active`.

---

## 4) Resolved/Closed Findings (Phase 1 remediation)

Closed as resolved:
- `.cursorrules` bootstrap missing-path claim is no longer valid after path normalization to existing sources:
  - `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`
  - `documentation/docs-system/07-DESIGN/CSS_CLASSES_INDEX.md`
- `.cursorrules` semantic drift for Team 190 ownership was corrected to `Gate 0-2`.
- AGENTS_OS templates missing-path claim is no longer valid.
- Existing paths:
  - `documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/LOD200_TEMPLATE_v1.0.0.md`
  - `documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/LLD400_TEMPLATE_v1.0.0.md`

---

**log_entry | TEAM_10 | PHASE1_BASELINE_EVIDENCE | VALIDATED_PASS_TEAM190_REVALIDATION | 2026-02-26**
