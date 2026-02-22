# Team 10 → Team 90: SOP-013 Reference Validation Request
**project_domain:** TIKTRACK

**from:** Team 10 (The Gateway)  
**to:** Team 90 (External Validation Unit)  
**date:** 2026-02-18  
**subject:** Canonical SOP-013 location and file name — reference alignment and validation

---

## 1. Canonical SOP-013 (Closure/Seal policy)

| Item | Value |
|------|--------|
| **Canonical location** | `_COMMUNICATION/_Architects_Decisions/` |
| **Canonical file name** | `ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md` |
| **Full path** | `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md` |

**Rule:** Task closure is valid only with Seal Message (SOP-013). The path `documentation/07-POLICIES/TT2_GOVERNANCE_V2_102_SOP_013_CLOSURE_GATE.md` is **archived context only** — not an active governance baseline.

---

## 2. Changes submitted for validation

References to SOP-013 have been aligned to the canonical path above in:

| Document | Change |
|----------|--------|
| **Master Index** | `00_MASTER_INDEX.md` (root) — added § "SOP-013 (Closure/Seal policy) — canonical only" with location, file name, full path, and archived-path note. |
| **Governance Source Matrix** | `_COMMUNICATION/team_90/GOVERNANCE_SOURCE_MATRIX.md` — added dedicated row "SOP-013 (Closure/Seal policy)" with Authority Source = full path; Notes = Canonical location + file name LOCKED. |
| **Related procedures** | `TEAM_10_MASTER_TASK_LIST_PROTOCOL.md` — rule 6: canonical path cited first. |
| | `TEAM_10_CLEAN_TABLE_PROTOCOL.md` — canonical path cited. |
| | `documentation/docs-governance/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md` — §7: explicit "קנון (מיקום + שם קובץ)" line. |
| | `documentation/docs-governance/02-PROCEDURES/TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md` — §3 closure note + §4 הפניות: SOP-013 canonical path. |

---

## 3. Requested validation

Team 90 is requested to:

1. Verify that all active references to SOP-013 (Closure/Seal policy) across Master Index, Governance Source Matrix, and the procedures listed above point to the **single canonical path**:  
   `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md`
2. Confirm that no active governance artifact treats the old path `documentation/07-POLICIES/TT2_GOVERNANCE_V2_102_SOP_013_CLOSURE_GATE.md` as baseline (archived context only).
3. Issue **explicit written validation confirmation** including:

```text
SOP_REFERENCE_DRIFT_RESOLVED = TRUE
```

---

## 4. Required confirmation format

Team 90 response must include a clear statement, for example:

- **SOP_REFERENCE_DRIFT_RESOLVED = TRUE** — All active references to SOP-013 (Closure/Seal policy) point to the canonical file `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_GOVERNANCE_STRENGTHENING.md`; no active baseline reference to the archived 07-POLICIES path.

---

**log_entry | TEAM_10 | SOP_013_REFERENCE_VALIDATION_REQUEST_SUBMITTED | 2026-02-18**
