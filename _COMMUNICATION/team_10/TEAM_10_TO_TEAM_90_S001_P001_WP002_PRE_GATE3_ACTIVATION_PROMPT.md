# Team 10 → Team 90 | פרומט הפעלה — ולידציה Pre-GATE_3 (S001-P001-WP002)

**project_domain:** AGENTS_OS

**id:** TEAM_10_TO_TEAM_90_S001_P001_WP002_PRE_GATE3_ACTIVATION_PROMPT  
**from:** Team 10 (The Gateway)  
**to:** Team 90 (Channel 10↔90 Validation Authority)  
**re:** הפעלת צוות 90 — Pre-GATE_3 Work Package / Work Plan validation  
**date:** 2026-02-22  
**status:** ACTION_REQUIRED  
**channel_id:** CHANNEL_10_90_DEV_VALIDATION  
**phase_indicator:** Pre-GATE_3 (gate_id = PRE_GATE_3; plan/package validation only)  
**work_package_id:** S001-P001-WP002  

---

## כותרת תקנית — Identity Header (חובה בתגובה)

כל ארטיפקט תגובה של Team 90 (VALIDATION_RESPONSE או BLOCKING_REPORT) חייב לכלול את בלוק ה־Identity Header הבא:

| Field | Value |
|-------|--------|
| roadmap_id | L0-PHOENIX / S001 |
| stage_id | S001 |
| program_id | S001-P001 |
| work_package_id | S001-P001-WP002 |
| task_id | N/A (work-package-level) |
| gate_id | PRE_GATE_3 |
| phase_owner | Team 10 |
| required_ssm_version | 1.0.0 |
| required_active_stage | GAP_CLOSURE_BEFORE_AGENT_POC |
| project_domain | AGENTS_OS |

---

## נהלים מחייבים (לפני ביצוע)

| מסמך | נתיב | שימוש |
|------|------|--------|
| **CHANNEL_10_90_CANONICAL_CONFIRMATION_v1.0.0** | _COMMUNICATION/team_190/CHANNEL_10_90_CANONICAL_CONFIRMATION_v1.0.0.md | ערוץ 10↔90; Phase 1 = Pre-GATE_3 (ולידציית תוכנית); נתיבי VALIDATION_RESPONSE / BLOCKING_REPORT; max_resubmissions = 5; לולאה PASS / ESCALATE / STUCK. |
| **04_GATE_MODEL_PROTOCOL_v2.3.0** | documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md | §1.4 Identity Header; §6.1 שני נקודות Team 90 (Pre-GATE_3, GATE_5); אין GATE_3 לפני Pre-GATE_3 PASS. |
| **בקשת הולידציה (מסמך הבקשה)** | _COMMUNICATION/team_10/TEAM_10_TO_TEAM_90_S001_P001_WP002_VALIDATION_REQUEST.md | מקור האמת לבקשה — חובה לקרוא במלואו לפני ביצוע. |

---

## פרומט הפעלה — להרצה על ידי צוות 90

**העתק את הבלוק שלהלן והרץ כצוות 90 (Channel 10↔90 Validation Authority).**

```
אתה פועל כצוות 90 (Channel 10↔90 Validation Authority), channel_owner של CHANNEL_10_90_DEV_VALIDATION. Team 10 הגיש לך בקשת **Pre-GATE_3** (ולידציית חבילת עבודה / תוכנית ביצוע) עבור Work Package **S001-P001-WP002** (Agents_OS Phase 1 — Runtime Structure & Validator Foundation).

---

**1. נהלים — חובה לקרוא לפני ביצוע**

- **CHANNEL_10_90_CANONICAL_CONFIRMATION_v1.0.0:** ערוץ 10↔90; Phase 1 = Pre-GATE_3 (ולידציית תוכנית בלבד); רק אחרי PASS מותרת פתיחת GATE_3. נתיבי תגובה: VALIDATION_RESPONSE → _COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S001_P001_WP002_VALIDATION_RESPONSE.md; BLOCKING_REPORT → _COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S001_P001_WP002_BLOCKING_REPORT.md. max_resubmissions = 5; לולאה PASS / ESCALATE / STUCK.
- **04_GATE_MODEL_PROTOCOL_v2.3.0 §6.1:** Pre-GATE_3 = ולידציית Work Plan לפני ביצוע; gate_id = PRE_GATE_3 בארטיפקטים; אין GATE_3 לפני Team 90 PASS.

---

**2. מסמך הבקשה (מקור חובה)**

קרא במלואו: **_COMMUNICATION/team_10/TEAM_10_TO_TEAM_90_S001_P001_WP002_VALIDATION_REQUEST.md**

במסמך: Identity Header, Request metadata (request_id REQ-S001-P001-WP002-PreG3-20260222, submission_iteration 1, max_resubmissions 5), Scope statement, Validation targets, Pass criteria, Fail conditions, Deliverables expected from Team 90, Evidence (רשימת ארטיפקטים מוגשים).

---

**3. ארטיפקטים לבדיקה (Evidence)**

חובה לאמת מול המסמכים הבאים:

| # | ארטיפקט | נתיב |
|---|----------|------|
| 1 | WORK_PACKAGE_DEFINITION | _COMMUNICATION/team_10/TEAM_10_S001_P001_WP002_WORK_PACKAGE_DEFINITION.md |
| 2 | בקשת VALIDATION_REQUEST | _COMMUNICATION/team_10/TEAM_10_TO_TEAM_90_S001_P001_WP002_VALIDATION_REQUEST.md |
| 3 | PROMPTS_AND_ORDER_OF_OPERATIONS | _COMMUNICATION/team_10/TEAM_10_S001_P001_WP002_PROMPTS_AND_ORDER_OF_OPERATIONS.md |

בדוק שכל שלושת המסמכים קיימים וכוללים Identity Header מלא (work_package_id S001-P001-WP002, gate_id PRE_GATE_3, phase_owner Team 10, project_domain AGENTS_OS).

---

**4. קריטריוני ולידציה (Validation targets)**

אמת כל אחד מהבאים:

- **תכלית 1 — Work Package Definition:** Identity header מלא; סקופ מוגבל ל־agents_os/ (מבנה runtime + validator foundation); בידוד דומיין; אין TikTrack runtime בסקופ; עקביות ל־AGENTS_OS_PHASE_1_LLD400_v1.0.0.
- **תכלית 2 — תוכנית שערים:** רצף Pre-GATE_3 → GATE_3 → GATE_4 → GATE_5 → … → GATE_8; מודל שני שלבים של Team 90 (Pre-GATE_3 + GATE_5) מופיע בתוכנית.
- **תכלית 3 — שיוך בעלויות:** phase_owner Team 10; Channel 10↔90 validation = Team 90; QA = Team 50; GATE_6 = Team 190; GATE_8 = Team 70/190.
- **תכלית 4 — מקורות קנוניים:** SSM, WSM, 04_GATE_MODEL_PROTOCOL_v2.3.0, CHANNEL_10_90_CANONICAL_CONFIRMATION_v1.0.0, AGENTS_OS_PHASE_1_LLD400_v1.0.0 — מוזכרים ועקביים.
- **תכלית 5 — אין ביצוע לפני PASS:** הצהרה מפורשת בבקשה וב־WORK_PACKAGE_DEFINITION שאין GATE_3 או מימוש לפני VALIDATION_RESPONSE PASS מ-Team 90.

**Pass criteria (תנאי למעבר):** כל חמש התכליות מתקיימות; Identity header קיים ומלא; סקופ תואם LLD400 ובידוד דומיין; אין הפרת סדר שערים.

**Fail conditions:** Identity header חסר או לא מלא; סקופ כולל שינוי TikTrack או הפרת בידוד דומיין; תוכנית משתמעת GATE_3 לפני Pre-GATE_3 PASS או GATE_5 לפני GATE_4 PASS; הפניה למקור לא קנוני או למספור שגוי.

---

**5. תוצר נדרש מצוות 90**

- **אם PASS:** צור קובץ **VALIDATION_RESPONSE** בנתיב: **_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S001_P001_WP002_VALIDATION_RESPONSE.md**
  - כותרת תקנית: id, from (Team 90), to (Team 10), date, status: PASS, channel_id: CHANNEL_10_90_DEV_VALIDATION, phase_indicator: Pre-GATE_3.
  - בלוק **Mandatory identity header** (טבלה) עם: roadmap_id, stage_id, program_id, work_package_id S001-P001-WP002, task_id N/A, gate_id PRE_GATE_3, phase_owner Team 10, required_ssm_version 1.0.0, required_active_stage GAP_CLOSURE_BEFORE_AGENT_POC, project_domain AGENTS_OS.
  - סעיף Scope validated (רשימת מסמכים שאומתו).
  - סעיף Validation result by target (טבלה: Target | Result | Notes) — כל חמש התכליות עם PASS.
  - סעיף Decision: **overall_status: PASS**. המשך: Team 10 רשאי לפתוח GATE_3 (Implementation) עבור S001-P001-WP002.
  - log_entry: TEAM_90 | S001_P001_WP002 | Pre-GATE_3 | VALIDATION_RESPONSE | PASS | 2026-02-22

- **אם FAIL:** צור קובץ **BLOCKING_REPORT** בנתיב: **_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S001_P001_WP002_BLOCKING_REPORT.md**
  - כותרת תקנית + Identity Header ( above).
  - סעיף Blocking findings (ממצאים חוסמים עם הפניה למסמך ולסעיף).
  - overall_status: FAIL; Team 10 יגיש מחדש לאחר תיקון (עד max_resubmissions 5); לולאה עד PASS או ESCALATE/STUCK לפי CHANNEL_10_90.

---

**6. איסור**

- אין לפתוח GATE_3 או לאשר ביצוע לפני שתגובש החלטת PASS מפורשת בתגובה. אם יש ספק — החזר BLOCKING_REPORT עם ממצאים ברורים.
```

---

## קישור לבקשת הולידציה המלאה

מסמך הבקשה הרשמי (מקור האמת): [_COMMUNICATION/team_10/TEAM_10_TO_TEAM_90_S001_P001_WP002_VALIDATION_REQUEST.md](TEAM_10_TO_TEAM_90_S001_P001_WP002_VALIDATION_REQUEST.md)

---

**log_entry | TEAM_10 | PRE_GATE3_ACTIVATION_PROMPT | S001_P001_WP002 | TO_TEAM_90 | 2026-02-22**
