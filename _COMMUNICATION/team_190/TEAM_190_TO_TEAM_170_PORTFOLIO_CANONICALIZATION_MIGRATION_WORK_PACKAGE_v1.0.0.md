# TEAM_190_TO_TEAM_170_PORTFOLIO_CANONICALIZATION_MIGRATION_WORK_PACKAGE_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_190_TO_TEAM_170_PORTFOLIO_CANONICALIZATION_MIGRATION_WORK_PACKAGE_v1.0.0  
**from:** Team 190 (Architectural Validator / Spy)  
**to:** Team 170 (Spec Owner / Librarian Flow)  
**cc:** Team 100, Team 10, Team 90, Team 70, Team 00  
**date:** 2026-02-23  
**status:** ACTION_REQUIRED (HIGH_PRIORITY)  
**gate_id:** N/A  
**work_package_id:** N/A  

---

## Mandatory identity header

| Field | Value |
|---|---|
| roadmap_id | L0-PHOENIX |
| stage_id | S001 |
| program_id | N/A |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | N/A |
| phase_owner | Team 170 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S001 |

## 1) Purpose

לבצע מיגרציה מלאה למודל Portfolio קנוני ומינימלי, עם הפרדה קשיחה בין:
1. Runtime state (פעיל עכשיו) — נשמר ב־WSM בלבד.
2. Portfolio/Pipeline state (Roadmap/Stage/Program/Work Package) — נשמר ברשומות ייעודיות, ללא Task-level.

המטרה: ביטול כפילויות, ביטול מקורות אמת מתחרים, והבטחת תמונת מצב ברורה בכל רגע.

## 2) Context / Inputs

1. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`
2. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md`
3. `documentation/docs-governance/00_MASTER_DOCUMENTATION_TABLE_v1.0.0.md`
4. `_COMMUNICATION/_Architects_Decisions/PHOENIX_UNIFIED_MODULAR_ROADMAP_V2_1.md`
5. `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST_PROTOCOL.md`
6. `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST.md`
7. `_COMMUNICATION/team_10/TEAM_10_LEVEL2_LISTS_REGISTRY.md`
8. `_COMMUNICATION/team_10/TEAM_10_LEVEL2_COMPLETION_CARRYOVER_LIST.md`
9. `_COMMUNICATION/team_190/TEAM_190_PORTFOLIO_BASELINE_SCAN_AND_CONFLICT_MAP_2026-02-23.md`
10. `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_70_S001_P001_WP002_GATE8_VALIDATION_RESPONSE.md`

## 3) Locked decisions to implement

1. מפת דרכים אחת בלבד.
2. Stage יכול להיות רב־דומיינים.
3. Program הוא חד־דומיין בלבד.
4. שלבים/תוכניות מנוהלים אדריכלית (Team 100/00).
5. Work Packages נוצרים ע"י מחלקת הביצוע (Team 10).
6. לכל Work Package תהליך שערים אחד בלבד.
7. לכל Work Package gate נוכחי חובה.
8. חובה סימון ברור של Work Package פעילה.
9. חובה לאפשר מצב `NO_ACTIVE_WORK_PACKAGE`.
10. Task-level לא נכלל בפורטפוליו הקנוני.

## 4) Required actions

### R1 — Freeze and classification

1. לבצע Freeze על עדכוני מבנה Governance/Portfolio במהלך המיגרציה.
2. לסווג כל קובץ קיים לקטגוריה:
   - `CANONICAL_KEEP`
   - `MIGRATE_AND_SUPERSEDE`
   - `ARCHIVE_HISTORICAL`
3. להפיק מטריצת סיווג מלאה לפי נתיב.

### R2 — Build canonical portfolio layer

ליצור שכבת Portfolio קנונית חדשה תחת governance:

1. `documentation/docs-governance/00-INDEX/PORTFOLIO_INDEX.md`
2. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md`
3. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`
4. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md`
5. `documentation/docs-governance/01-FOUNDATIONS/PORTFOLIO_WSM_SYNC_RULES_v1.0.0.md`

### R3 — Define minimal canonical schemas

1. Roadmap schema (Stage-level only):
   - `stage_id`
   - `stage_name`
   - `planned_scope`
   - `status`
2. Program schema:
   - `program_id`
   - `program_name`
   - `domain` (single domain only)
   - `stage_id`
   - `status`
   - `current_gate_mirror` (derived from WSM updates)
3. Work Package schema:
   - `work_package_id`
   - `program_id`
   - `status`
   - `current_gate`
   - `is_active` (boolean)
   - `active_marker_reason` (or `NO_ACTIVE_WORK_PACKAGE`)

### R4 — Enforce runtime/portfolio boundary

1. לקבוע במפורש: runtime current state נשמר רק ב־WSM.
2. current gate בפורטפוליו הוא `mirror` מסונכרן (לא מקור runtime עצמאי).
3. להוציא Task-level מרשומות הפורטפוליו הקנוניות.
4. לנקות מסמכי רמה 2 של Team 10 ממידע Portfolio שאינו פנימי-משימתי:
   - `TEAM_10_MASTER_TASK_LIST.md`
   - `TEAM_10_MASTER_TASK_LIST_PROTOCOL.md`
   - `TEAM_10_LEVEL2_LISTS_REGISTRY.md`
   - `TEAM_10_LEVEL2_COMPLETION_CARRYOVER_LIST.md`
5. לקבע במסמכי Team 10 שרמה 2 נשארת Task-level פנימית בלבד (ללא Stage/Program/WP status כ־SSOT).

### R5 — WSM sync contract

1. להגדיר חוזה סנכרון פורמלי:
   - כל עדכון שער ב־WSM מחייב עדכון mirror ב־Program/WP registries.
2. להגדיר שדות חובה לסנכרון:
   - `wsm_event_date`
   - `wsm_event_gate`
   - `wsm_event_source_path`
3. לאפשר מצב:
   - `is_active=false` + `active_marker_reason=NO_ACTIVE_WORK_PACKAGE`.

### R6 — Migration and superseding

1. להעביר תוכן Portfolio נחוץ מהמקורות הישנים לקבצי היעד החדשים.
2. להוסיף בקבצים ישנים (שיישארו) בלוק superseded/pointer לקנון החדש.
3. לא להשאיר שני מקורות פעילים לאותה ישות Portfolio.

### R7 — Cleanup and archive

1. לארכב קבצי snapshot/history שאינם מקורות פעילים.
2. לעדכן `00_MASTER_DOCUMENTATION_TABLE_v1.0.0.md` כך שיצביע לקנון החדש.
3. לעדכן `GOVERNANCE_PROCEDURES_INDEX`/`SOURCE_MAP` לנתיבים החדשים.

### R8 — No duplicate governance procedures

1. לא ליצור נהלים כפולים לכוונה קיימת.
2. לעדכן in-place מסמכים קנוניים קיימים היכן שנדרש.

## 5) Deliverables and paths

### 5.1 Mandatory updated canonical files

1. `documentation/docs-governance/00_MASTER_DOCUMENTATION_TABLE_v1.0.0.md`
2. `documentation/docs-governance/00-INDEX/GOVERNANCE_PROCEDURES_INDEX.md`
3. `documentation/docs-governance/00-INDEX/GOVERNANCE_PROCEDURES_SOURCE_MAP.md`
4. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` (boundary text only; no runtime model break)
5. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md` (boundary consistency)
6. `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST.md` (Task-level scope only)
7. `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST_PROTOCOL.md` (Task-level scope only)
8. `_COMMUNICATION/team_10/TEAM_10_LEVEL2_LISTS_REGISTRY.md` (Task-level scope only)
9. `_COMMUNICATION/team_10/TEAM_10_LEVEL2_COMPLETION_CARRYOVER_LIST.md` (Task-level scope only)

### 5.2 New canonical portfolio artifacts

1. `documentation/docs-governance/00-INDEX/PORTFOLIO_INDEX.md`
2. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md`
3. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`
4. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md`
5. `documentation/docs-governance/01-FOUNDATIONS/PORTFOLIO_WSM_SYNC_RULES_v1.0.0.md`

### 5.3 Team 170 submission package (under `_COMMUNICATION/team_170/`)

1. `PORTFOLIO_CANONICALIZATION_EXECUTION_PLAN_v1.0.0.md`
2. `PORTFOLIO_MIGRATION_CHANGE_MATRIX_v1.0.0.md`
3. `PORTFOLIO_CLASSIFICATION_AND_SUPERSEDE_MAP_v1.0.0.md`
4. `PORTFOLIO_BOUNDARY_ENFORCEMENT_REPORT_v1.0.0.md`
5. `PORTFOLIO_WSM_SYNC_VALIDATION_REPORT_v1.0.0.md`
6. `PORTFOLIO_ARCHIVE_AND_CLEANUP_REPORT_v1.0.0.md`
7. `TEAM_170_FINAL_DECLARATION_PORTFOLIO_CANONICALIZATION_v1.0.0.md`
8. `TEAM_170_TO_TEAM_190_PORTFOLIO_CANONICALIZATION_VALIDATION_REQUEST_v1.0.0.md`

## 6) Validation criteria (PASS/FAIL)

PASS only if all are true:

1. יש מפת דרכים קנונית אחת בלבד.
2. Program registries מציגים Program חד־דומיין בלבד.
3. לכל Program קיים `current_gate_mirror` מסונכרן מ־WSM.
4. לכל Work Package יש `current_gate`.
5. יש סימון חד־משמעי ל־Work Package פעילה.
6. מצב `NO_ACTIVE_WORK_PACKAGE` נתמך ומודגם.
7. אין Task-level בקבצי הפורטפוליו הקנוניים.
8. אין מקורות אמת כפולים ל־Roadmap/Program/WP status.
9. קבצי snapshot/history סומנו/אורכבו כך שלא יתפקדו כמקור פעיל.
10. כל העדכונים שומרים תאימות לטרמינולוגיה הנעולה: Roadmap → Stage → Program → Work Package → Task.

## 7) Response required

1. Team 170 מגיש חבילת ביצוע מלאה לפי סעיף 5.3.
2. Team 190 מחזיר החלטה: `PASS` / `CONDITIONAL_PASS` / `FAIL`.
3. ללא PASS של Team 190 — המיגרציה אינה מושלמת ואין פתיחת חבילת פיתוח חדשה על מודל פורטפוליו לא סגור.

**log_entry | TEAM_190 | PORTFOLIO_CANONICALIZATION_MIGRATION_WORK_PACKAGE | ACTION_REQUIRED | 2026-02-23**
