# PHOENIX_PORTFOLIO_ROADMAP_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** PHOENIX_PORTFOLIO_ROADMAP  
**version:** 1.0.0  
**owner:** Team 100 / Team 00 (architectural); maintained by Team 170 per consolidation  
**date:** 2026-02-23  
**directive:** TEAM_190_TO_TEAM_170_PORTFOLIO_CANONICALIZATION_MIGRATION_WORK_PACKAGE_v1.0.0  
**source_migrated_from:** `_COMMUNICATION/_Architects_Decisions/PHOENIX_UNIFIED_MODULAR_ROADMAP_V2_1.md`

---

## Boundary

This document is the **single canonical roadmap** for Portfolio (Stage-level only). **Operational state** (which stage is active, current gate) is **only** in WSM `CURRENT_OPERATIONAL_STATE`. No duplicate runtime state here.

---

## Schema (Stage-level only)

| Field | Description |
|-------|-------------|
| stage_id | S{NNN} (e.g. S001) |
| stage_name | Short label |
| planned_scope | Text scope |
| status | ACTIVE \| PLANNED \| COMPLETED \| HOLD |

---

## Stages (catalog)

סדר השורות = סדר התצוגה (היררכיה ראשית). שמות קנוניים: שלב 1, שלב 2, … חבילות העבודה הקיימות שתיהן תחת שלב 1 (S001).


| stage_id | stage_name | planned_scope | status |
| --- | --- | --- | --- |
| S-001 | שלב 0 — Prerequisites | — | HOLD |
| S001 | שלב 1 — Foundations Sealed | — | ACTIVE |
| S002 | שלב 2 — (ממתין להגדרה) | — | PLANNED |
| S003 | שלב 3 — Essential Data | — | PLANNED |
| S004 | שלב 4 — Financial Execution | — | PLANNED |
| S005 | שלב 5 — Trades/Plans | — | PLANNED |
| S006 | שלב 6 — Advanced Analytics | — | PLANNED |


**Note:** S-001 = שלב 0 (Prerequisites). S001 = שלב 1; חבילות העבודה הנוכחיות תחת S001.

---

## Superseded / pointer

**Original roadmap (structural + strategic):** `_COMMUNICATION/_Architects_Decisions/PHOENIX_UNIFIED_MODULAR_ROADMAP_V2_1.md` — remains authoritative for narrative and Level-2 list links. This file is the **Portfolio canonical catalog** for Stage-level only; no duplicate operational state.

---

**log_entry | TEAM_170 | PHOENIX_PORTFOLIO_ROADMAP | v1.0.0_CREATED | 2026-02-23**
