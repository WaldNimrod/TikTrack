# Team 90 Enforcement Notice: Architect Decisions Folder (v2.111)

**id:** `TEAM_90_ARCHITECTS_DECISIONS_FOLDER_ENFORCEMENT`  
**from:** Team 90 (The Spy)  
**to:** Team 10, Team 70, All Teams  
**date:** 2026-02-15  
**status:** ACTIVE — MANDATORY

---

## 1) Locked Rule (Effective Immediately)

Authoritative architect decisions (ADR / Directives / Bible / locked mandates) are sourced from:

`_COMMUNICATION/_Architects_Decisions/`

`_COMMUNICATION/90_Architects_comunication/` is now communication channel only (inbox/outbox), not SSOT source.

---

## 2) Findings (Current Drift)

| File | Drift |
|------|-------|
| `documentation/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_WORK_OPERATING_MODEL.md:96` | still points to `_COMMUNICATION/90_Architects_comunication` as authoritative decisions folder |
| `documentation/90_ARCHITECTS_DOCUMENTATION/OVERVIEW_PACK/TT2_WORK_OPERATING_MODEL.md:128` | roadmap reference still points to old architect communication path |
| `_COMMUNICATION/team_90/TEAM_90_GOVERNANCE_ROLE_RESET_AND_ENFORCEMENT.md:54` | canonical directive reference still uses old path |
| `_COMMUNICATION/team_70/TEAM_70_ONBOARDING_PACKAGE.md:58-60` | references external audit files in old communication folder (must be marked supplemental, not canonical SSOT) |

---

## 3) Mandatory Corrections

1. Update all canonical references for architect decisions to `_COMMUNICATION/_Architects_Decisions/`.
2. Keep old communication folder references only as:
   - inbox/outbox artifacts, or
   - supplemental legacy context (explicitly labeled non-SSOT).
3. Add one explicit rule line in Team 70 package:
   - "Architect decisions source of truth = `_COMMUNICATION/_Architects_Decisions/`".

---

## 4) Acceptance Criteria (for closure)

- No file under active governance docs identifies `_COMMUNICATION/90_Architects_comunication/` as authoritative decision SSOT.
- Team 70 handoff and onboarding documents include canonical source statement.
- Team 10 issues a short adoption note confirming reference migration.

---

**log_entry | TEAM_90 | ARCHITECTS_DECISIONS_FOLDER_ENFORCEMENT | 2026-02-15**
