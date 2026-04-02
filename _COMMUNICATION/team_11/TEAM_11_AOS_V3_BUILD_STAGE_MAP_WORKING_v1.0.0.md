---
id: TEAM_11_AOS_V3_BUILD_STAGE_MAP_WORKING_v1.0.0
historical_record: true
owner: Team 11 (AOS Gateway)
date: 2026-03-28
type: WORKING_DOCUMENT — process map (temporary; delete or archive when BUILD closed)
domain: agents_os
branch: aos-v3
status: CLOSED — AOS v3 BUILD COMPLETE (2026-03-28); מועמד לארכיון לפי §6 / Team 10·191
note: Not canonical governance — operational control only. SSOT for ACs remains WP v1.0.3. פסיקת סגירה — `../team_00/TEAM_00_TO_TEAM_11_AOS_V3_GATE_5_BUILD_COMPLETE_VERDICT_v1.0.0.md`.---

# AOS v3 BUILD — מפת שלבים וניהול תהליך (זמני)

## מטרה

מסמך עבודה פנימי לצוות 11: סדר הפעלה, שערי עצירה, נקודות תאום, ודרישות ולידציה/QA לכל שלב.  
עודכן לאחר **PASS מוקדם** של צוות 190 על חבילת ה-activations (pre-transfer).

---

## 0. מצב עדכני — DDL v1.0.2 (משוב `team_111`)

**סטטוס:** `team_111` דיווח **COMPLETE** — כל 5 פריטי WP D.5 סופקו. **GATE_0 unblock מורשה** לכיוון `team_61`.

**מסמך handoff (SSOT לפרטים):**  
`_COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_v1.0.2_HANDOFF_TO_TEAM_11.md`

### 0.1 ארטיפקטים שנמסרו (רשימה מסודרת)

1. `agents_os_v3/db/migrations/001_aos_v3_fresh_schema_v1.0.2.sql` — סכימה מלאה, DB ריק → v1.0.2 (נתיב קבלה ראשי).
2. `agents_os_v3/db/migrations/002_aos_v3_delta_v1.0.1_to_v1.0.2.sql` — דלתא v1.0.1 → v1.0.2.
3. `agents_os_v3/FILE_INDEX.json` — **גרסת אינדקס (נכון ל-GATE_4 QA 51 / 2026-03-28): v1.1.5** — לאמת מול הקובץ ב-repo לפני כל commit. (היסטוריה: 1.1.4 מסירת 31; 1.1.3 GATE_3 QA; 1.1.2 מסירת 21; 1.1.1 GATE_2 QA; 1.1.0 GATE_2 יישום; 1.0.9 pytest GATE_1; 1.0.8 GATE_1 ראשון; 1.0.7 GATE_0.)
4. `_COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_v1.0.2_HANDOFF_TO_TEAM_11.md` — הערות handoff וצ’ק-ליסט ל-11 / 61.

### 0.2 סגירת WP D.5 (תמצית מסודרת)

1. **DDL-ERRATA-01:** (א) שינוי שם עמודה `wp_artifact_index.wp_id` → `work_package_id` (כלל שמות WP); (ב) אינדקס ייחודי `uq_templates_active_slot` על `templates WHERE is_active=1` לתמיכה ב-`get_active_template()`.
2. **`ideas`:** תיקונים מלאים לפי UI Spec v1.1.1 §13.2 — `domain_id` NOT NULL FK, `idea_type` CHECK, `decision_notes` TEXT NULL.
3. **`work_packages`:** PK `id TEXT`, עמודות לפי WP, FK מעגלי מול `runs` נפתר ב-deferred ALTER.
4. **`pending_feedbacks`:** אחסון FeedbackRecord מלא לפי §13.1, CHECK ו-FK→runs CASCADE.
5. **`teams.engine`:** ב-fresh: `VARCHAR(50) NOT NULL`; ב-delta: no-op אם v1.0.1 כבר כולל עמודה (TEXT); הערת ALTER מוערמת לשדרוג מלפני v1.0.1.

### 0.3 הערת חובה ל-`team_61` (לפני החלת מיגרציה)

במסלול **delta** (`002_...`): שלב FK backfill (Step 5) **ייכשל** אם ב-DB קיימים שורות ב-`runs` / `assignments` / `events` / `wp_artifact_index` עם מזהי WP שלא קיימים בטבלת `work_packages`.  
**חובה** להריץ את **ארבע שאילתות ה-pre-flight verification** שבקובץ ה-delta לפני החלה על DB **לא ריק**.

### 0.4 GATE_0 — השלמת `team_61` וסימון PASS מצוות 11

**סטטוס:** **GATE_0 PASS** (נרשם על ידי `team_11`, 2026-03-28).

**נקודת כניסה קנונית מצוות 61 (תמצית + בקשת פעולה):**  
`_COMMUNICATION/team_61/TEAM_61_TO_TEAM_11_AOS_V3_GATE_0_COMPLETION_CANONICAL_v1.0.0.md`

**ראיות טכניות + SOP-013 Seal (SSOT לפרטים):**  
`_COMMUNICATION/team_61/TEAM_61_AOS_V3_GATE_0_EVIDENCE_AND_SEAL_v1.0.0.md`

**זמן ריצה וסביבה (עדכון 61 — מרחיב את הקנון):**  
`_COMMUNICATION/team_61/TEAM_61_TO_TEAM_11_AOS_V3_LOCAL_ENV_RUNTIME_HANDOFF_v1.1.0.md`  
(פורט 8090: אין v2 UI במקביל ל-v3 API; סקריפטי start/stop; אימות שבוצע בריפו.)

**החלטת Gateway:** לאחר סקירה מול WP v1.0.3 D.4 (GATE_0) ומול מנדט `TEAM_11_TO_TEAM_61_AOS_V3_BUILD_ACTIVATION_v1.0.0.md`, תשתית הבסיס מוכרת כמסופקת. **בידוד דומיין:** מסד AOS נפרד ממסד TikTrack — `AOS_V3_DATABASE_URL` ב-`agents_os_v3/.env` בלבד; `bash scripts/init_aos_v3_database.sh`; `python3 scripts/verify_dual_domain_database_connectivity.py` (דחייה אם URL זהים). פירוט: דוח קנון 61 + handoff v1.1.0 + ראיות.

**המשך מיידי (לאחר GATE_0):** `team_21` — GATE_1; `team_51` — במקביל מ-GATE_1.  
מסמך GO: `_COMMUNICATION/team_11/TEAM_11_GATE_0_PASS_AND_TEAM_21_GO_v1.0.0.md`

### 0.5 GATE_1 — מסירת `team_21` + שלב 6 (QA `team_51`) + סגירת שער

**סטטוס GATE_1 מלא:** **PASS (2026-03-28)** — רשומת סגירה: `_COMMUNICATION/team_11/TEAM_11_GATE_1_FULL_CLOSURE_RECORD_v1.0.0.md`

**סטטוס שלב 6 (QA):** **PASS** — `_COMMUNICATION/team_51/TEAM_51_TO_TEAM_11_AOS_V3_GATE_1_QA_EVIDENCE_v1.0.1.md` (סבב ראשון BLOCK: `...v1.0.0.md` — ארכיון ממצא).  
**ניווט BLOCK (היסטוריה):** `_COMMUNICATION/team_11/TEAM_11_GATE_1_BLOCK_NAVIGATION_RECORD_v1.0.0.md`

**סטטוס מימוש (צוות 21):** GATE_1 + **תיקון pytest** — `_COMMUNICATION/team_21/TEAM_21_TO_TEAM_11_AOS_V3_GATE_1_PYTEST_REMEDIATION_REPORT_v1.0.0.md` (**סופק** 2026-03-28).

**דוח השלמה מצוות 21:**  
`_COMMUNICATION/team_21/TEAM_21_TO_TEAM_11_AOS_V3_GATE_1_COMPLETION_REPORT_v1.0.0.md`

**ראיות טכניות + חוזה HTTP:**  
`_COMMUNICATION/team_21/TEAM_21_AOS_V3_GATE_1_EVIDENCE_AND_HANDOFF_v1.0.0.md`

**שלב 6 בתוכנית (§1) — QA על ביצוע 21:**  
סבב ראשון: `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_51_AOS_V3_GATE_1_QA_HANDOFF_v1.0.0.md` → פלט `...QA_EVIDENCE_v1.0.0.md` (BLOCK).  
**סבב שני (אחרי תיקון 21):** `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_51_AOS_V3_GATE_1_QA_REVERIFY_HANDOFF_v1.0.0.md` → פלט **`_COMMUNICATION/team_51/TEAM_51_TO_TEAM_11_AOS_V3_GATE_1_QA_EVIDENCE_v1.0.1.md`** (**PASS** לסגירת שער).

**סגירת GATE_1 מלאה:** **בוצעה** — ראיות שלב 6 PASS ב־v1.0.1.

**המשך היסטורי (אחרי 0.5):** GO GATE_2 — `TEAM_11_GATE_1_PASS_AND_TEAM_21_GO_GATE2_v1.0.0.md`; חבילת GATE_1 ל-100 — הוגשה (ראו **0.6**).

### 0.6 GATE_2 — סגירת שער (2026-03-28)

**סטטוס:** **PASS** — מימוש `team_21`, QA `team_51`, אישור ארכיטקטורה `team_100`.

| נושא | נתיב |
|------|------|
| אישור ארכיטקטורה (Team 100) | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_GATE_2_ARCHITECTURAL_VERDICT_v1.0.0.md` |
| ראיות QA (Team 51) | `_COMMUNICATION/team_51/TEAM_51_TO_TEAM_11_AOS_V3_GATE_2_QA_EVIDENCE_v1.0.0.md` (**43 passed**, governance PASS) |
| מסירת יישום (Team 21) | `_COMMUNICATION/team_21/TEAM_21_TO_TEAM_11_AOS_V3_GATE_2_COMPLETION_REPORT_v1.0.0.md` |
| חבילת סקירה ל-100 | `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_100_AOS_V3_GATE_2_REVIEW_PACKAGE_v1.0.0.md` |
| Router GATE_2 | `_COMMUNICATION/team_11/TEAM_11_AOS_V3_GATE_2_SUBMISSION_ROUTER_v1.0.0.md` |
| סגירת OBS-01 (mockup) — Team 31 | `_COMMUNICATION/team_31/TEAM_31_SEAL_AOS_V3_MOCKUP_AM01_IS_CURRENT_ACTOR_v1.0.0.md` + `TEAM_31_TO_TEAM_11_AOS_V3_MOCKUP_AM01_HANDOFF_v1.0.0.md` |
| פרומפט פוסט-GATE_2 (Team 100 → 11) | `_COMMUNICATION/team_100/TEAM_100_TO_TEAM_11_AOS_V3_POST_GATE_2_REACTIVATION_PROMPT_v1.0.0.md` |
| אישור חבילה פוסט-GATE_2 + מנדט GATE_3 (Team 100) | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_POST_GATE_2_PACKAGE_AND_GATE_3_APPROVAL_v1.0.0.md` (**APPROVED — GO**) |
| ולידציה חוקתית (Team 190, revalidation) | `_COMMUNICATION/team_190/TEAM_190_AOS_V3_POST_GATE_2_UPDATE_PACKAGE_REVIEW_v1.0.1.md` (**PASS**) |

**המשך מיידי:** ראו **סעיף 0.7** (GATE_3 — מסירת 21, QA 51, הגשה ל-190).

### 0.7 GATE_3 — מסירת מימוש `team_21` + QA `team_51` (2026-03-28)

**סטטוס מימוש:** **נמסר** — Seal SOP-013 + דוח השלמה (`team_21`).  
**סטטוס QA:** **PASS** — ראיות `team_51` (TC-15..TC-21, כולל SSE עם `curl` ב-TC-21).  
**סטטוס חוקתי:** **PASS** — `_COMMUNICATION/team_190/TEAM_190_AOS_V3_GATE_3_SUBMISSION_REVIEW_v1.0.1.md` (`correction_cycle: 2`); **AF-G3-01** נסגר.  
**סטטוס ארכיטקטורי:** **APPROVED** — `_COMMUNICATION/team_100/TEAM_100_AOS_V3_GATE_3_ARCHITECTURAL_VERDICT_v1.0.0.md` (GATE_4 SSOT alignment confirmed).  
**המשך (מעודכן ל-GATE_4):** ראו **§0.8** — מסירת UI מ-`team_31`; QA מ-`team_51`.

| נושא | נתיב |
|------|------|
| **חבילת הגשה (11 → 190)** | `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_190_AOS_V3_GATE_3_SUBMISSION_PACKAGE_v1.0.0.md` |
| **דוח ולידציה 190** | `_COMMUNICATION/team_190/TEAM_190_AOS_V3_GATE_3_SUBMISSION_REVIEW_v1.0.1.md` (**PASS** CC2) + v1.0.0 (היסטוריה) |
| **בקשה ל-100 (סגירת GATE_3)** | `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_100_AOS_V3_GATE_3_CLOSURE_REVIEW_REQUEST_v1.0.0.md` |
| **Verdict ארכיטקטורה 100** | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_GATE_3_ARCHITECTURAL_VERDICT_v1.0.0.md` (**APPROVED**) |
| **מנדט ביצוע GATE_4 (31)** | `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_31_AOS_V3_BUILD_ACTIVATION_v1.0.0.md` |
| **GO GATE_4 (11 → 31)** | `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_31_AOS_V3_GATE_4_GO_v1.0.0.md` |
| מסירה + SOP-013 Seal | `_COMMUNICATION/team_21/TEAM_21_TO_TEAM_11_AOS_V3_GATE_3_COMPLETION_AND_SEAL_v1.0.0.md` |
| מנדט | `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_21_AOS_V3_GATE_3_ACTIVATION_MANDATE_v1.0.0.md` |
| Handoff QA (Team 11 → 51) | `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_51_AOS_V3_GATE_3_QA_HANDOFF_v1.0.0.md` |
| ראיות QA (PASS) | `_COMMUNICATION/team_51/TEAM_51_TO_TEAM_11_AOS_V3_GATE_3_QA_EVIDENCE_v1.0.0.md` — **56 passed**, governance **PASS**, `FILE_INDEX` **v1.1.3** |
| בדיקות TC §17 | `agents_os_v3/tests/test_gate3_tc15_21_api.py` |
| FILE_INDEX (repo) | `agents_os_v3/FILE_INDEX.json` — **v1.1.3** בשלב GATE_3; **v1.1.5** אחרי GATE_4 QA — ראו **§0.8** |

### 0.8 GATE_4 — UI `team_31` + QA `team_51` + הגשה ל-`team_00` (2026-03-28)

**סטטוס מימוש (31):** **התקבל ב-Gateway** — ראיות `_COMMUNICATION/team_31/TEAM_31_GATE_4_AOS_V3_UI_LIVE_EVIDENCE_v1.0.0.md`; קבלה `_COMMUNICATION/team_11/TEAM_11_RECEIPT_TEAM_31_AOS_V3_GATE_4_DELIVERY_v1.0.0.md`.  
**סטטוס QA (51):** **PASS** — `_COMMUNICATION/team_51/TEAM_51_TO_TEAM_11_AOS_V3_GATE_4_QA_EVIDENCE_v1.0.0.md` — **63 passed**, governance **PASS**, preflight, mock regression, TC-19..TC-26 (כולל `test_gate4_tc19_26_api.py`, `test_gate4_ui_mock_regression.py`).  
**בדיקת Gateway (אימות 2026-03-28):** `pytest agents_os_v3/tests/` — **63 passed**.  
**סטטוס UX (00):** **PASS (2026-03-28)** — `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_11_AOS_V3_GATE_4_UX_VERDICT_v1.0.0.md` (canary A+B PASS; 10/10 controls).  
**הפעלת GATE_5:** `_COMMUNICATION/team_11/TEAM_00_TO_TEAM_11_AOS_V3_GATE_4_PASS_AND_GATE_5_ACTIVATION_v1.0.0.md` — **GATE_5 ACTIVE**.  
**המשך מיידי:** ראו **§0.10** (GATE_5).

| נושא | נתיב |
|------|------|
| מנדט + GO (היסטוריה) | `TEAM_11_TO_TEAM_31_AOS_V3_BUILD_ACTIVATION_v1.0.0.md` + `TEAM_11_TO_TEAM_31_AOS_V3_GATE_4_GO_v1.0.0.md` |
| ראיות 31 | `_COMMUNICATION/team_31/TEAM_31_GATE_4_AOS_V3_UI_LIVE_EVIDENCE_v1.0.0.md` |
| קבלת 11 (31) | `_COMMUNICATION/team_11/TEAM_11_RECEIPT_TEAM_31_AOS_V3_GATE_4_DELIVERY_v1.0.0.md` |
| Handoff QA (11 → 51) | `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_51_AOS_V3_GATE_4_QA_HANDOFF_v1.0.0.md` |
| ראיות QA (PASS) | `_COMMUNICATION/team_51/TEAM_51_TO_TEAM_11_AOS_V3_GATE_4_QA_EVIDENCE_v1.0.0.md` |
| חבילת הגשה (11 → 00) | `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_00_AOS_V3_GATE_4_UX_SUBMISSION_PACKAGE_v1.0.0.md` |
| פסיקת UX (00) | `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_11_AOS_V3_GATE_4_UX_VERDICT_v1.0.0.md` |
| PASS + הפעלת GATE_5 (00 → 11) | `_COMMUNICATION/team_11/TEAM_00_TO_TEAM_11_AOS_V3_GATE_4_PASS_AND_GATE_5_ACTIVATION_v1.0.0.md` |
| בדיקות TC (דגימה) | `agents_os_v3/tests/test_gate3_tc15_21_api.py` (TC-19..TC-21); `agents_os_v3/tests/test_gate4_tc19_26_api.py` (TC-22..TC-26); `test_gate4_ui_mock_regression.py` |
| Canary GATE_4/5 | `agents_os_v3/tests/canary_gate4.sh` |
| FILE_INDEX (repo) | `agents_os_v3/FILE_INDEX.json` — **v1.1.7** (GATE_5 — 61/51/31) |

### 0.9 GATE_DOC — דוקומנטציה מסודרת (**PASS — שלב ב סגור** — 2026-03-28)

**מקור החלטה:** Principal — `TEAM_11_AOS_V3_PRINCIPAL_APPROVAL_DOCUMENTATION_PHASE_v1.0.0.md` (**אושר** להוסיף שלב רשמי).  
**שתי רמות בדיקה (v3 מוצר / v2 מטא־פיפליין)** נשארות בתוקף; התיעוד יבהיר הפרדה וקישורים.

**שלב א — הכנה (לפני מימוש):** **הושלם** — פסיקה **`TEAM_100_AOS_V3_BUILD_DOCUMENTATION_CANONICAL_DIRECTIVE_3B_v1.0.0.md`** (יעד קנון `documentation/docs-agents-os/`, קידומת `AGENTS_OS_V3_`, Iron Rules; **אין** `agents_os_v3/docs/`). בקשה מקורית: `TEAM_11_TO_TEAM_100_AOS_V3_BUILD_DOCUMENTATION_STANDARDS_APPROVAL_REQUEST_v1.0.0.md` (מעודכנת ל-3B).

**שלב ב — מימוש + אישור סופי:** מסירות **`team_71`** / **`team_21`** / **`team_31`** — `TEAM_71_TO_TEAM_11_AOS_V3_GATE_DOC_PHASE_B_COMPLETION_v1.0.0.md`, `TEAM_21_TO_TEAM_11_AOS_V3_GATE_DOC_PHASE_B_COMPLETION_v1.0.0.md`, `TEAM_31_TO_TEAM_11_AOS_V3_GATE_DOC_PHASE_B_COMPLETION_v1.0.0.md`; קלט Runbook: `TEAM_31_TO_TEAM_71_AOS_V3_GATE_DOC_RUNBOOK_INPUT_v1.0.0.md`. **ולידציה 190:** **`TEAM_190_AOS_V3_GATE_DOC_PHASE_B_REVIEW_v1.0.0.md` — PASS** (`correction_cycle: 1`). **קבלת Gateway:** `TEAM_11_RECEIPT_AOS_V3_GATE_DOC_PHASE_B_CLOSURE_v1.0.0.md`.

**מיקום בתוכנית:** **אחרי** אישור UX **GATE_4** מ-`team_00` (**PASS — 2026-03-28**); מימוש שלב ב יכול לרוץ **במקביל** ל-**GATE_5** לפי תיאום Gateway; **לפני** או **משולב** עם סגירת **GATE_5** — ייקבע במנדט המימוש לאחר אישור 100.

| נושא | נתיב |
|------|------|
| רישום אישור Principal | `_COMMUNICATION/team_11/TEAM_11_AOS_V3_PRINCIPAL_APPROVAL_DOCUMENTATION_PHASE_v1.0.0.md` |
| בקשה לאדריכלות (100) | `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_100_AOS_V3_BUILD_DOCUMENTATION_STANDARDS_APPROVAL_REQUEST_v1.0.0.md` |
| פסיקה קנון (100) — **3B** | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_BUILD_DOCUMENTATION_CANONICAL_DIRECTIVE_3B_v1.0.0.md` |
| מנדט שלב ב (11 → 71) | `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_71_AOS_V3_GATE_DOC_PHASE_B_MANDATE_v1.0.0.md` |
| מנדט שלב ב (11 → 21) — README + docstrings | `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_21_AOS_V3_GATE_DOC_PHASE_B_MANDATE_v1.0.0.md` |
| מנדט שלב ב (11 → 31) — קלט Runbook UI | `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_31_AOS_V3_GATE_DOC_PHASE_B_MANDATE_v1.0.0.md` |
| השלמת 71 (71 → 11) | `_COMMUNICATION/team_71/TEAM_71_TO_TEAM_11_AOS_V3_GATE_DOC_PHASE_B_COMPLETION_v1.0.0.md` |
| השלמת 21 (21 → 11) | `_COMMUNICATION/team_21/TEAM_21_TO_TEAM_11_AOS_V3_GATE_DOC_PHASE_B_COMPLETION_v1.0.0.md` |
| השלמת 31 (31 → 11) | `_COMMUNICATION/team_31/TEAM_31_TO_TEAM_11_AOS_V3_GATE_DOC_PHASE_B_COMPLETION_v1.0.0.md` |
| קלט Runbook (31 → 71) | `_COMMUNICATION/team_31/TEAM_31_TO_TEAM_71_AOS_V3_GATE_DOC_RUNBOOK_INPUT_v1.0.0.md` |
| בקשת ולידציה (11 → 190) | `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_190_AOS_V3_GATE_DOC_PHASE_B_VALIDATION_REQUEST_v1.0.0.md` |
| סקירת 190 — **PASS** | `_COMMUNICATION/team_190/TEAM_190_AOS_V3_GATE_DOC_PHASE_B_REVIEW_v1.0.0.md` |
| קבלת Gateway (סגירה) | `_COMMUNICATION/team_11/TEAM_11_RECEIPT_AOS_V3_GATE_DOC_PHASE_B_CLOSURE_v1.0.0.md` |
| פרוטוקול שינוי דרישות QA | `_COMMUNICATION/team_11/TEAM_11_AOS_V3_QA_REQUIREMENTS_CHANGE_PROTOCOL_v1.0.0.md` |

### 0.10 GATE_5 — סגירת BUILD (**PASS — BUILD COMPLETE** — 2026-03-28)

**מקור הפעלה:** `TEAM_00_TO_TEAM_11_AOS_V3_GATE_4_PASS_AND_GATE_5_ACTIVATION_v1.0.0.md`.  
**תיאום Gateway:** `TEAM_11_AOS_V3_GATE_5_COORDINATION_v1.0.0.md`.  
**תפעול כניסות (11):** `TEAM_11_AOS_V3_GATE_5_GATEWAY_OPERATIONS_v1.0.0.md`.  
**חבילת סגירה + פסיקה:** `TEAM_11_TO_TEAM_00_AOS_V3_BUILD_CLOSURE_SUBMISSION_v1.0.0.md` (**CLOSED**) + `../team_00/TEAM_00_TO_TEAM_11_AOS_V3_GATE_5_BUILD_COMPLETE_VERDICT_v1.0.0.md`.

| צוות | משימה | מסמך |
|------|--------|------|
| **61** | ניקוי תשתית + `CLEANUP_REPORT.md` | **התקבל** — `TEAM_61_TO_TEAM_11_AOS_V3_GATE_5_CANONICAL_FEEDBACK_v1.0.0.md` |
| **31** | היגיינת קוד, אישור UI מול `FILE_INDEX` | **התקבל** — `TEAM_31_TO_TEAM_11_AOS_V3_GATE_5_HYGIENE_EVIDENCE_v1.0.0.md` + `TEAM_11_RECEIPT_TEAM_31_AOS_V3_GATE_5_HYGIENE_v1.0.0.md` |
| **51** | רגרסיה מלאה + canary (DB) | **PASS** — `TEAM_51_TO_TEAM_11_AOS_V3_GATE_5_QA_EVIDENCE_v1.0.0.md` |
| **21** | תיאום + בעלות backend | **התקבל** — ruling: `TEAM_11_TO_TEAM_21_AOS_V3_GATE_5_BACKEND_ACCEPTANCE_RULING_v1.0.0.md` |
| **11** | חבילת סגירה → **00** | `TEAM_11_TO_TEAM_00_AOS_V3_BUILD_CLOSURE_SUBMISSION_v1.0.0.md` (**CLOSED**) |
| **00** | אישור סופי → **BUILD COMPLETE** | `../team_00/TEAM_00_TO_TEAM_11_AOS_V3_GATE_5_BUILD_COMPLETE_VERDICT_v1.0.0.md` (**PASS**) |

### 0.11 REMEDIATION — Post-100 Audit (**PASS — סגור 2026-03-28**)

**מקור:** `TEAM_100_AOS_V3_BUILD_COMPLETENESS_AUDIT_AND_GAP_PLAN_v1.0.0.md` — פערים F-01..F-07; תוכנית 5 פאזות. **לא** מבטל BUILD COMPLETE רשמי; משלים מול WP D.6 ו-E2E/CI.

| פאזה | צוות | מנדט Gateway | סטטוס | מסירה צפויה |
|------|------|----------------|--------|-------------|
| **0** | **100** (פסיקה) | `../team_100/TEAM_100_AOS_V3_REMEDIATION_ADMIN_PREFIX_DECISION_v1.0.0.md` (**Option B**) | **פורסם / סגור** | — |
| **0** | **11** (רישום) | `TEAM_11_AOS_V3_REMEDIATION_PHASE0_DECISION_RECORD_v1.0.1.md` | **סגור** | — |
| **1** | **21** | `TEAM_11_TO_TEAM_21_AOS_V3_REMEDIATION_PHASE1_API_GAPS_MANDATE_v1.0.1.md` (**GO**; C-01) | **הושלם — PASS** | `TEAM_21_TO_TEAM_11_AOS_V3_REMEDIATION_PHASE1_COMPLETION_v1.0.0.md` + `TEAM_11_RECEIPT_TEAM_21_AOS_V3_REMEDIATION_PHASE1_COMPLETION_v1.0.0.md` |
| **2** | **51** | `TEAM_11_TO_TEAM_51_AOS_V3_REMEDIATION_PHASE2_TC_TRACEABILITY_MANDATE_v1.0.0.md` + handoff GO | **הושלם — PASS** | `TEAM_51_TO_TEAM_11_AOS_V3_REMEDIATION_PHASE2_COMPLETION_v1.0.0.md` + `TEAM_11_RECEIPT_TEAM_51_AOS_V3_REMEDIATION_PHASE2_COMPLETION_v1.0.0.md` |
| **3a** | **61** | `TEAM_11_TO_TEAM_61_AOS_V3_REMEDIATION_PHASE3_E2E_INFRA_MANDATE_v1.0.0.md` + GO handoff | **הושלם — PASS** | `TEAM_61_TO_TEAM_11_AOS_V3_REMEDIATION_PHASE3_INFRA_COMPLETION_v1.0.0.md` + `TEAM_11_RECEIPT_TEAM_61_AOS_V3_REMEDIATION_PHASE3_INFRA_COMPLETION_v1.0.0.md` |
| **3b** | **51** | `TEAM_11_TO_TEAM_51_AOS_V3_REMEDIATION_PHASE3_BROWSER_E2E_MANDATE_v1.0.0.md` + GO handoff | **הושלם — PASS** | `TEAM_51_TO_TEAM_11_AOS_V3_REMEDIATION_PHASE3_E2E_COMPLETION_v1.0.0.md` + `TEAM_11_RECEIPT_TEAM_51_AOS_V3_REMEDIATION_PHASE3_E2E_COMPLETION_v1.0.0.md` |
| **3** (אופציונלי) | **31** | `TEAM_11_TO_TEAM_31_AOS_V3_REMEDIATION_PHASE3_UI_SELECTORS_SUPPORT_v1.0.0.md` | **אופציונלי** | לפי צורך |
| **4** | **61** | `TEAM_11_TO_TEAM_61_AOS_V3_REMEDIATION_PHASE4_CI_MANDATE_v1.0.0.md` + GO handoff | **הושלם — PASS** | `TEAM_61_TO_TEAM_11_AOS_V3_REMEDIATION_PHASE4_CI_COMPLETION_v1.0.0.md` + `TEAM_11_RECEIPT_TEAM_61_AOS_V3_REMEDIATION_PHASE4_CI_COMPLETION_v1.0.0.md` |
| **5** | **51** + **61** | מנדטים Phase 5 + **`TEAM_11_REMEDIATION_PHASE5_CANARY_SIM_GO_HANDOFF_v1.0.0.md` (GO)** | **הושלם — PASS** | `TEAM_51_TO_TEAM_11_AOS_V3_REMEDIATION_PHASE5_COMPLETION_v1.0.0.md` + `TEAM_61_TO_TEAM_11_AOS_V3_REMEDIATION_PHASE5_CANARY_SIM_COMPLETION_v1.0.0.md` |
| **סגירה** | **11** → **00**/**100** | `TEAM_11_TO_TEAM_00_AOS_V3_REMEDIATION_CLOSURE_REPORT_v1.0.1.md` (**FINAL**) + `TEAM_11_TO_TEAM_100_AOS_V3_REMEDIATION_CLOSURE_REPORT_v1.0.0.md` (**FINAL**) | **FINAL** | ראיות מלאות §3 בדוח ל-100 |

**סדר מומלץ:** 0 → 1 → 2 (2.2 אחרי 1) → 3a → 3b → 4 → 5.

---

## 1. רשימה מסודרת — סדר פתיחת סשן (צוותים מממשים)

קריאה מלמעלה למטה. **בתוכנית הזו שלב 6 הוא QA של צוות 51 על מסירת צוות 21 ל-GATE_1** — לא לדלג עליו ולא למזג עם ”המשך“.

1. `team_111` — **הושלם** — DDL v1.0.2 נמסר; ראו **סעיף 0**.
2. `team_11` — **הושלם** — פרסום המשך ל-61 לאחר DDL.
3. `team_61` — **הושלם** — GATE_0; ראו **סעיף 0.4** ודוח הקנוני ב-`team_61`.
4. `team_11` — **הושלם** — GATE_0 PASS + מסמך GO ל-21 (`TEAM_11_GATE_0_PASS_AND_TEAM_21_GO_v1.0.0.md`).
5. `team_21` — **הושלם** — מימוש **GATE_1** (מסירה ל-11); ראו **סעיף 0.5** — קבצים: `TEAM_21_TO_TEAM_11_AOS_V3_GATE_1_COMPLETION_REPORT_v1.0.0.md` + `TEAM_21_AOS_V3_GATE_1_EVIDENCE_AND_HANDOFF_v1.0.0.md`.
6. `team_51` — **הושלם** — שלב 6 QA על GATE_1 — `_COMMUNICATION/team_51/TEAM_51_TO_TEAM_11_AOS_V3_GATE_1_QA_EVIDENCE_v1.0.1.md` (**PASS**).
7. `team_11` — **הושלם** — חבילת GATE_1 ל-`team_100`: `TEAM_11_TO_TEAM_100_AOS_V3_GATE_1_REVIEW_PACKAGE_v1.0.0.md`.
8. `team_21` — **הושלם** — GATE_2 — `TEAM_11_GATE_1_PASS_AND_TEAM_21_GO_GATE2_v1.0.0.md` + activation §GATE_2 + reactivation Authority; מסירה: `TEAM_21_TO_TEAM_11_AOS_V3_GATE_2_COMPLETION_REPORT_v1.0.0.md`.
9. `team_51` — **הושלם** — QA GATE_2 — `TEAM_51_TO_TEAM_11_AOS_V3_GATE_2_QA_EVIDENCE_v1.0.0.md` (**PASS**).
10. `team_11` — **הושלם** — הגשת GATE_2 ל-`team_100` + **APPROVED** — `TEAM_100_AOS_V3_GATE_2_ARCHITECTURAL_VERDICT_v1.0.0.md`.
11. `team_21` — **הושלם** — GATE_3 — מסירה + Seal: `TEAM_21_TO_TEAM_11_AOS_V3_GATE_3_COMPLETION_AND_SEAL_v1.0.0.md` (pytest **49**; governance **PASS**; `FILE_INDEX` **v1.1.2**).
12. `team_51` — **הושלם** — QA GATE_3 — `TEAM_51_TO_TEAM_11_AOS_V3_GATE_3_QA_EVIDENCE_v1.0.0.md` (**PASS**; **56** pytest; `FILE_INDEX` **v1.1.3**).
13. `team_11` — **הושלם** — הגשת **GATE_3** ל-`team_190` + **revalidation PASS** — `TEAM_190_AOS_V3_GATE_3_SUBMISSION_REVIEW_v1.0.1.md`.  
14. `team_11` — **הושלם** — בקשה + **APPROVED** מ-`team_100` — `TEAM_100_AOS_V3_GATE_3_ARCHITECTURAL_VERDICT_v1.0.0.md`.
15. `team_31` — **הושלם** — GATE_4 מסירת UI — `_COMMUNICATION/team_31/TEAM_31_GATE_4_AOS_V3_UI_LIVE_EVIDENCE_v1.0.0.md`; קבלה 11: `TEAM_11_RECEIPT_TEAM_31_AOS_V3_GATE_4_DELIVERY_v1.0.0.md` (סעיף **0.8**); Mockup AM01 (סעיף **0.6**).
16. `team_51` — **הושלם** — GATE_4 QA — `TEAM_51_TO_TEAM_11_AOS_V3_GATE_4_QA_EVIDENCE_v1.0.0.md` (**PASS**; **63** pytest; `FILE_INDEX` **v1.1.5**).
17. `team_11` — **הושלם** — הגשת GATE_4 ל-`team_00` + **PASS** — `TEAM_00_TO_TEAM_11_AOS_V3_GATE_4_UX_VERDICT_v1.0.0.md` + `TEAM_00_TO_TEAM_11_AOS_V3_GATE_4_PASS_AND_GATE_5_ACTIVATION_v1.0.0.md`.
18. `team_11` — **הושלם** — **GATE_DOC שלב א** — בקשה + פסיקה **`TEAM_100_AOS_V3_BUILD_DOCUMENTATION_CANONICAL_DIRECTIVE_3B_v1.0.0.md`** (ראו **§0.9**).
19. `team_11` — **הושלם** — מנדטים **GATE_DOC שלב ב** ל־`team_71` + `team_21` + `team_31` — `TEAM_11_TO_TEAM_71_AOS_V3_GATE_DOC_PHASE_B_MANDATE_v1.0.0.md`, `TEAM_11_TO_TEAM_21_AOS_V3_GATE_DOC_PHASE_B_MANDATE_v1.0.0.md`, `TEAM_11_TO_TEAM_31_AOS_V3_GATE_DOC_PHASE_B_MANDATE_v1.0.0.md` (2026-03-28).
20. `team_71` + `team_21` + `team_31` — **הושלם** — **GATE_DOC שלב ב** — מסירות + קלט Runbook (כנלעד); **`team_190`** — **הושלם** — **PASS** — `TEAM_190_AOS_V3_GATE_DOC_PHASE_B_REVIEW_v1.0.0.md`; **`team_11`** — **קבלה** — `TEAM_11_RECEIPT_AOS_V3_GATE_DOC_PHASE_B_CLOSURE_v1.0.0.md` (**§0.9 PASS סופי**).
21. `team_61` — **הושלם** — **GATE_5** — ניקוי תשתית + `CLEANUP_REPORT.md` — `TEAM_61_TO_TEAM_11_AOS_V3_GATE_5_CANONICAL_FEEDBACK_v1.0.0.md`.
22. `team_31` — **הושלם** — **GATE_5** — `TEAM_31_TO_TEAM_11_AOS_V3_GATE_5_HYGIENE_EVIDENCE_v1.0.0.md` + קבלה `TEAM_11_RECEIPT_TEAM_31_AOS_V3_GATE_5_HYGIENE_v1.0.0.md`.
23. `team_51` — **הושלם** — **GATE_5** QA **PASS** — `TEAM_51_TO_TEAM_11_AOS_V3_GATE_5_QA_EVIDENCE_v1.0.0.md`.
24. `team_11` — **הושלם** — חבילת **סגירת BUILD** ל-`team_00` — `TEAM_11_TO_TEAM_00_AOS_V3_BUILD_CLOSURE_SUBMISSION_v1.0.0.md` (**CLOSED**).
25. `team_00` — **הושלם** — **BUILD COMPLETE** — `TEAM_00_TO_TEAM_11_AOS_V3_GATE_5_BUILD_COMPLETE_VERDICT_v1.0.0.md`.
26. `team_11` + `team_21` + `team_51` + `team_61` (+ `team_31` אופציונלי) — **הושלם** — **REMEDIATION** (דוח 100) — ראו **§0.11** (**PASS**); דוחות סגירה: `TEAM_11_TO_TEAM_00_AOS_V3_REMEDIATION_CLOSURE_REPORT_v1.0.1.md` + `TEAM_11_TO_TEAM_100_AOS_V3_REMEDIATION_CLOSURE_REPORT_v1.0.0.md`.

**לא ברשימה למעלה (תפקיד מאשר / תשתית הכנה):**

- `team_11` — מתאם לאורך כל הרשימה (לא ”סשן מימוש“ של קוד מוצר).
- `team_100` — בדיקת seed ב-GATE_1; **אישור חובה** ב-GATE_2; **Verdict ארכיטקטורה** על סגירת GATE_3 (`TEAM_100_AOS_V3_GATE_3_ARCHITECTURAL_VERDICT_v1.0.0.md`); **GATE_DOC שלב א** — **`TEAM_100_AOS_V3_BUILD_DOCUMENTATION_CANONICAL_DIRECTIVE_3B_v1.0.0.md`**; **REMEDIATION** — דוח שלמות BUILD **`TEAM_100_AOS_V3_BUILD_COMPLETENESS_AUDIT_AND_GAP_PLAN_v1.0.0.md`**; פסיקת **prefix admin** (1.5) — **`TEAM_100_AOS_V3_REMEDIATION_ADMIN_PREFIX_DECISION_v1.0.0.md` (Option B)**; סקירת תוכנית — **`TEAM_100_AOS_V3_REMEDIATION_PLAN_REVIEW_AND_FEEDBACK_v1.0.0.md`**.
- `team_190` — ולידציה חוקתית על חבילות; **מאשר GATE_3**; **GATE_DOC שלב ב** — **הושלם** — `TEAM_190_AOS_V3_GATE_DOC_PHASE_B_REVIEW_v1.0.0.md` (**PASS**); **GATE_4** — ללא חבילת 190 נפרדת במפת השלבים הנוכחית (אחרי PASS מ-51 → **Team 00** UX).
- `team_00` — **מאשר GATE_4** (UX) ו-**CLEANUP ב-GATE_5**.
- `team_191` — תנאי כניסה GATE_0 (ענף, AGENTS, hooks); תיאום מול 61.
- `team_71` — **GATE_DOC** — **הושלם** — אכלוס **`documentation/docs-agents-os/`** עם קידומת **`AGENTS_OS_V3_`** (Directive **3B**); סגירה **§0.9**.

---

## 2. רשימה מסודרת — שערי עצירה (לפי סדר כרונולוגי)

1. **GATE_0** — **PASS (2026-03-28)** — מימוש: `team_61`; מאשר: `team_11`; ראו סעיף **0.4**.  
2. **GATE_1** — **PASS מלא (2026-03-28)** — מימוש: `team_21`; QA שלב 6: `team_51` — `TEAM_51_TO_TEAM_11_AOS_V3_GATE_1_QA_EVIDENCE_v1.0.1.md`; מאשר: `team_11`; חבילה ל-`team_100`: סעיף **0.5**.  
3. **GATE_2** — **PASS (2026-03-28)** — מימוש: `team_21`; QA: `team_51` — `TEAM_51_TO_TEAM_11_AOS_V3_GATE_2_QA_EVIDENCE_v1.0.0.md`; מאשר: `team_100` — `TEAM_100_AOS_V3_GATE_2_ARCHITECTURAL_VERDICT_v1.0.0.md`; ראו סעיף **0.6**.  
4. **GATE_3** — **PASS (2026-03-28)** — מימוש `team_21` + QA `team_51` + `team_190` (**PASS** v1.0.1) + **`team_100` APPROVED** — `TEAM_100_AOS_V3_GATE_3_ARCHITECTURAL_VERDICT_v1.0.0.md` — סעיף **0.7**.  
5. **GATE_4** — **PASS (2026-03-28)** — `team_31` + `team_51` + **`team_00` UX** — `TEAM_00_TO_TEAM_11_AOS_V3_GATE_4_UX_VERDICT_v1.0.0.md` + `TEAM_00_TO_TEAM_11_AOS_V3_GATE_4_PASS_AND_GATE_5_ACTIVATION_v1.0.0.md` — §**0.8**.  
6. **GATE_DOC** — **שלב א:** **PASS** — `TEAM_100_AOS_V3_BUILD_DOCUMENTATION_CANONICAL_DIRECTIVE_3B_v1.0.0.md`. **שלב ב:** **PASS סופי** — מימוש **71**/**21**/**31** + **ולידציה 190** + קבלת Gateway — (**§0.9**).  
7. **GATE_5** — **PASS + BUILD COMPLETE (2026-03-28)** — ראיות מלאות; פסיקה `team_00` — `TEAM_00_TO_TEAM_11_AOS_V3_GATE_5_BUILD_COMPLETE_VERDICT_v1.0.0.md` — §**0.10**.
8. **REMEDIATION (post-audit)** — **PASS (2026-03-28)** — סגירת פערים מול WP / E2E / CI / canary — §**0.11**; דוח סופי ל-`team_100`: `TEAM_11_TO_TEAM_100_AOS_V3_REMEDIATION_CLOSURE_REPORT_v1.0.0.md`.

הערה: אין שינוי ב-`agents_os_v2/` בכל השערים (IR-2).

---

## 3. רשימה מסודרת — נקודות תאום (ארטיפקטים)

1. העברת DDL: `team_111` → `team_11` → `team_61` — **בוצע מצד 111** (ראו סעיף 0 + קובץ `TEAM_111_AOS_V3_DDL_v1.0.2_HANDOFF_TO_TEAM_11.md`); `team_61` מיישם מיגרציה בפועל.
2. ראיות GATE_0: `team_61` → `team_11` — **הוגש** — `TEAM_61_TO_TEAM_11_AOS_V3_GATE_0_COMPLETION_CANONICAL_v1.0.0.md` + `TEAM_61_AOS_V3_GATE_0_EVIDENCE_AND_SEAL_v1.0.0.md`; **PASS** מצוות 11 (סעיף 0.4).
3. חבילת GATE_1: `team_11` → `team_100` — **הוגשה** — `TEAM_11_TO_TEAM_100_AOS_V3_GATE_1_REVIEW_PACKAGE_v1.0.0.md` (pytest: `TEAM_51_TO_TEAM_11_AOS_V3_GATE_1_QA_EVIDENCE_v1.0.1.md`).
4. הגשת GATE_2: `team_11` → `team_100` — **הושלמה + APPROVED** — `TEAM_11_TO_TEAM_100_AOS_V3_GATE_2_REVIEW_PACKAGE_v1.0.0.md` + `TEAM_100_AOS_V3_GATE_2_ARCHITECTURAL_VERDICT_v1.0.0.md`.
5. הגשת GATE_3: `team_11` → `team_190` — **הושלמה** — `TEAM_190_AOS_V3_GATE_3_SUBMISSION_REVIEW_v1.0.1.md` (**PASS** CC2); סגירה ארכיטקטונית `team_100` — `TEAM_100_AOS_V3_GATE_3_ARCHITECTURAL_VERDICT_v1.0.0.md` (**APPROVED**).
6. הגשת GATE_4 + פסיקה: `team_11` → `team_00` — **הושלמה + PASS (2026-03-28)** — הגשה `TEAM_11_TO_TEAM_00_AOS_V3_GATE_4_UX_SUBMISSION_PACKAGE_v1.0.0.md`; פסיקה `TEAM_00_TO_TEAM_11_AOS_V3_GATE_4_UX_VERDICT_v1.0.0.md`; הפעלה `TEAM_00_TO_TEAM_11_AOS_V3_GATE_4_PASS_AND_GATE_5_ACTIVATION_v1.0.0.md`.
7. **GATE_DOC:** שלב א — `team_100` — **`TEAM_100_AOS_V3_BUILD_DOCUMENTATION_CANONICAL_DIRECTIVE_3B_v1.0.0.md`** (2026-03-28). שלב ב — מנדטים + מסירות + **PASS** `team_190` — `TEAM_190_AOS_V3_GATE_DOC_PHASE_B_REVIEW_v1.0.0.md` + קבלה `TEAM_11_RECEIPT_AOS_V3_GATE_DOC_PHASE_B_CLOSURE_v1.0.0.md`. ראו **§0.9**.
8. **שינוי דרישות QA:** פרוטוקול `TEAM_11_AOS_V3_QA_REQUIREMENTS_CHANGE_PROTOCOL_v1.0.0.md` (מפת שלבים §4).
9. **GATE_5:** תיאום + תפעול — כל הכניסות **התקבלו**; חבילה **CLOSED** — `TEAM_11_TO_TEAM_00_AOS_V3_BUILD_CLOSURE_SUBMISSION_v1.0.0.md`; QA **PASS**; היגיינה **31**.
10. סגירת BUILD: **הושלמה** — `team_00` — `TEAM_00_TO_TEAM_11_AOS_V3_GATE_5_BUILD_COMPLETE_VERDICT_v1.0.0.md` (**BUILD COMPLETE**); `team_11` עדכן מפה (מסמך זה).
11. **REMEDIATION:** דוח **`TEAM_100_AOS_V3_BUILD_COMPLETENESS_AUDIT_AND_GAP_PLAN_v1.0.0.md`**; מנדטים §**0.11** (**PASS**); דוחות סגירה **`TEAM_11_TO_TEAM_00_AOS_V3_REMEDIATION_CLOSURE_REPORT_v1.0.1.md`** + **`TEAM_11_TO_TEAM_100_AOS_V3_REMEDIATION_CLOSURE_REPORT_v1.0.0.md`** (**FINAL**).

---

## 4. רשימה מסודרת — ולידציה ו-QA (עקרון)

1. לפני העברת activations לצוותים — ולידציה חוקתית: `team_190` על חבילת התקשורת (**בוצע**).
2. GATE_0 — **PASS (2026-03-28)** — אימות AC: `team_11` מול דוח קנוני 61 + ראיות; QA טכני אופציונלי: `team_51` (smoke אם הוגדר).
3. GATE_1 — **PASS (2026-03-28)** — שלב 6 pytest GREEN; ארכיטקטורה ו-seed: `team_100` — חבילת סקירה (`TEAM_11_TO_TEAM_100_AOS_V3_GATE_1_REVIEW_PACKAGE_v1.0.0.md`).
4. GATE_2 — **PASS (2026-03-28)** — QA: `team_51` — `TEAM_51_TO_TEAM_11_AOS_V3_GATE_2_QA_EVIDENCE_v1.0.0.md`; אישור: `team_100` — verdict GATE_2; ראו **0.6**.
5. GATE_3 — **PASS** — `team_21` + `team_51` + `team_190` + **`team_100`** — ראו **0.7** (verdict ארכיטקטורה מאושר).
6. GATE_4 — **PASS** — UX `team_00`: `TEAM_00_TO_TEAM_11_AOS_V3_GATE_4_UX_VERDICT_v1.0.0.md`; הפעלת GATE_5: `TEAM_00_TO_TEAM_11_AOS_V3_GATE_4_PASS_AND_GATE_5_ACTIVATION_v1.0.0.md`.
7. **GATE_DOC** — קנון (100) **3B**; **שלב ב סגור** — **§0.9**; שינויי דרישות QA — `TEAM_11_AOS_V3_QA_REQUIREMENTS_CHANGE_PROTOCOL_v1.0.0.md`.
8. GATE_5 — **PASS + BUILD COMPLETE** — פסיקת `team_00` — `TEAM_00_TO_TEAM_11_AOS_V3_GATE_5_BUILD_COMPLETE_VERDICT_v1.0.0.md` — **§0.10**.
9. **REMEDIATION** — **הושלם (2026-03-28)** — ראיות §**0.11**; דוח סופי ל-`team_100`: `TEAM_11_TO_TEAM_100_AOS_V3_REMEDIATION_CLOSURE_REPORT_v1.0.0.md`.

**כל שלב:** אין PASS בלי עמידה ב-WP וראיות תחת `_COMMUNICATION/team_*` לפי נוהל הצוות הבודק.

---

## 5. רשימה מסודרת — קישורים להפעלה (לפי סדר צוותים מממשים)

1. `team_111` — `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_111_AOS_V3_BUILD_ACTIVATION_v1.0.0.md`
2. `team_61` — `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_61_AOS_V3_BUILD_ACTIVATION_v1.0.0.md`
3. `team_21` — `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_21_AOS_V3_BUILD_ACTIVATION_v1.0.1.md` + **GATE_3:** מנדט + מסירה `_COMMUNICATION/team_21/TEAM_21_TO_TEAM_11_AOS_V3_GATE_3_COMPLETION_AND_SEAL_v1.0.0.md`
4. `team_51` — `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_51_AOS_V3_BUILD_ACTIVATION_v1.0.0.md` + **GATE_4 QA:** `TEAM_11_TO_TEAM_51_AOS_V3_GATE_4_QA_HANDOFF_v1.0.0.md` → **ראיות:** `../team_51/TEAM_51_TO_TEAM_11_AOS_V3_GATE_4_QA_EVIDENCE_v1.0.0.md`
5. `team_31` — `_COMMUNICATION/team_11/TEAM_11_TO_TEAM_31_AOS_V3_BUILD_ACTIVATION_v1.0.0.md` + **GATE_4 GO:** `TEAM_11_TO_TEAM_31_AOS_V3_GATE_4_GO_v1.0.0.md` + **Verdict 100:** `TEAM_100_AOS_V3_GATE_3_ARCHITECTURAL_VERDICT_v1.0.0.md`  
6. `team_00` — **GATE_4:** הגשה `TEAM_11_TO_TEAM_00_AOS_V3_GATE_4_UX_SUBMISSION_PACKAGE_v1.0.0.md` → פסיקה `../team_00/TEAM_00_TO_TEAM_11_AOS_V3_GATE_4_UX_VERDICT_v1.0.0.md` + **`TEAM_00_TO_TEAM_11_AOS_V3_GATE_4_PASS_AND_GATE_5_ACTIVATION_v1.0.0.md`**  
7. **GATE_5 / BUILD COMPLETE** — תיאום `TEAM_11_AOS_V3_GATE_5_COORDINATION_v1.0.0.md` + סגירה `TEAM_11_TO_TEAM_00_AOS_V3_BUILD_CLOSURE_SUBMISSION_v1.0.0.md` + פסיקה **`../team_00/TEAM_00_TO_TEAM_11_AOS_V3_GATE_5_BUILD_COMPLETE_VERDICT_v1.0.0.md`**  
8. `team_100` — **GATE_DOC קנון 3B:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_BUILD_DOCUMENTATION_CANONICAL_DIRECTIVE_3B_v1.0.0.md` + בקשה מקורית `TEAM_11_TO_TEAM_100_AOS_V3_BUILD_DOCUMENTATION_STANDARDS_APPROVAL_REQUEST_v1.0.0.md`  
9. `team_71` — **GATE_DOC שלב ב** — `TEAM_11_TO_TEAM_71_AOS_V3_GATE_DOC_PHASE_B_MANDATE_v1.0.0.md`; מסירה: `../team_71/TEAM_71_TO_TEAM_11_AOS_V3_GATE_DOC_PHASE_B_COMPLETION_v1.0.0.md`; אינדקס: `documentation/docs-agents-os/00_AGENTS_OS_MASTER_INDEX.md` (סעיף v3)  
10. `team_190` — **GATE_DOC שלב ב — ולידציה** — `TEAM_11_TO_TEAM_190_AOS_V3_GATE_DOC_PHASE_B_VALIDATION_REQUEST_v1.0.0.md` → **PASS** `../team_190/TEAM_190_AOS_V3_GATE_DOC_PHASE_B_REVIEW_v1.0.0.md` + קבלה `TEAM_11_RECEIPT_AOS_V3_GATE_DOC_PHASE_B_CLOSURE_v1.0.0.md`  
11. **פרוטוקול QA** — `TEAM_11_AOS_V3_QA_REQUIREMENTS_CHANGE_PROTOCOL_v1.0.0.md`
12. **REMEDIATION (Team 100 audit)** — דוח: `../team_100/TEAM_100_AOS_V3_BUILD_COMPLETENESS_AUDIT_AND_GAP_PLAN_v1.0.0.md`; מפת פאזות: §**0.11** (**PASS**); **Phase 1–5 PASS**; סגירה: `TEAM_11_TO_TEAM_100_AOS_V3_REMEDIATION_CLOSURE_REPORT_v1.0.0.md`; מנדטים (היסטוריה): `TEAM_11_TO_TEAM_21_AOS_V3_REMEDIATION_PHASE1_API_GAPS_MANDATE_v1.0.1.md`, `TEAM_11_TO_TEAM_51_AOS_V3_REMEDIATION_PHASE2_TC_TRACEABILITY_MANDATE_v1.0.0.md`, `TEAM_11_TO_TEAM_61_AOS_V3_REMEDIATION_PHASE3_E2E_INFRA_MANDATE_v1.0.0.md`, `TEAM_11_TO_TEAM_51_AOS_V3_REMEDIATION_PHASE3_BROWSER_E2E_MANDATE_v1.0.0.md`, `TEAM_11_TO_TEAM_31_AOS_V3_REMEDIATION_PHASE3_UI_SELECTORS_SUPPORT_v1.0.0.md`, `TEAM_11_TO_TEAM_61_AOS_V3_REMEDIATION_PHASE4_CI_MANDATE_v1.0.0.md`, `TEAM_11_TO_TEAM_51_AOS_V3_REMEDIATION_PHASE5_CANARY_SIM_MANDATE_v1.0.0.md`, `TEAM_11_TO_TEAM_61_AOS_V3_REMEDIATION_PHASE5_CANARY_SIM_COORDINATION_v1.0.0.md`

**פרומטי סשן (ארבע שכבות):** `_COMMUNICATION/team_11/TEAM_11_AOS_V3_BUILD_ONBOARDING_INDEX_v1.0.0.md`

---

## 6. תחזוקת מסמך זה

- עדכן שורות סטטוס (✅/⏳) כששער נסגר.
- בסיום BUILD: העבר לארכיון או מחק לפי הנחיית צוות 10/191 — **אל** לקדם ל-`documentation/` מבלי Team 70/170.

---

**log_entry | TEAM_11 | AOS_V3_BUILD | STAGE_MAP_WORKING | REMEDIATION_ALL_PHASES_PASS_FINAL | 2026-03-28**
