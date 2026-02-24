# TEAM_170_TO_TEAM_70_TEAM_100_ROLE_AND_GATE_2_GATE_6_CANONICAL_UPDATE_DIRECTIVE_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_170_TO_TEAM_70_TEAM_100_ROLE_AND_GATE_2_GATE_6_CANONICAL_UPDATE  
**from:** Team 170 (Spec Owner / Librarian Flow)  
**to:** Team 70 (Documentation Authority / Librarian)  
**cc:** Team 100, Team 10, Team 190  
**date:** 2026-02-24  
**source_request:** Team 100 — Development Architecture Authority (2026-02-24 session with Team 00)  
**status:** ACTION_REQUIRED  
**priority:** HIGH

---

## Mandatory identity header

| Field | Value |
|-------|-------|
| roadmap_id | L0-PHOENIX |
| stage_id | S001 |
| program_id | N/A |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | N/A |
| phase_owner | Team 170 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S001 |

---

## 1) Purpose

לבצע עדכון קנוני בתיקיות `documentation/` לפי דרישת Team 100 (תיקון הגדרת תפקיד Team 100 והבחנה מהותית בין GATE_2 ל-GATE_6). Team 100 יבצע review לפני אישור סופי.

---

## 2) Locked content (to apply)

### 2.1 GATE_2 — תיאור נכון

- **GATE_2** = אישור אדריכלי של האפיון הסופי. Team 100 בוחן ומאשר את ה-SPEC לפני כל מעבר לשלב ביצוע. **שער כוונה** — האדריכל מאשר **מה שמתכוונים לבנות**.
- **הבדל מהותי (לנעול):**  
  **GATE_2:** "האם אנחנו מאשרים לבנות את זה?"

### 2.2 GATE_6 — תיאור נכון

- **GATE_6** = בדיקה אדריכלית של **מה שנבנה בפועל**. לאחר ביצוע, חבילת Execution חוזרת ל-Team 100 לאישור. **שער מציאות** — האדריכל מאמת ש**מה שנבנה תואם את הכוונה שאושרה ב-GATE_2**.
- **הבדל מהותי (לנעול):**  
  **GATE_6:** "האם מה שנבנה הוא מה שאישרנו?"

### 2.3 Team 100 — הגדרה מחייבת

**טקסט לעדכון/הוספה בכל מסמך רלוונטי (כולל SSM §1.1 ומסמכי governance של תפקידים):**

> Team 100 הוא השותף האדריכלי של Team 00 ביצירת חזון הדומיין ופירוטו לתוכניות ניתנות לביצוע. Team 100 אחראי על GATE_0 (כוונה ראשונית LOD200) ו-GATE_1 (הגשת SPEC לולידציה), ומחזיק **סמכות אישור** ב-**GATE_2** (אישור אפיון סופי) ו-**GATE_6** (אישור אדריכלי post-execution). Team 100 מגדיר את מודל ה-gates, חוזי ה-lifecycle, וכללי האורקסטרציה — ופועל ביישור אסטרטגי עם Team 00.

---

## 3) מסמכים לעדכון (checklist)

| # | מסמך | סעיף/פעולה |
|---|------|------------|
| 1 | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md` | §1.1 Governance Authority Clause — עדכון שורת Team 100 להגדרה המלאה למעלה |
| 2 | `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md` | תיאורי GATE_2 ו-GATE_6: הוספת סעיפים 4.2 ו-4.3 (או טקסט מקביל) עם ההבחנה המהותית; ציון שסמכות האישור ב-GATE_2 ו-GATE_6 היא Team 100 |
| 3 | `documentation/docs-governance/01-FOUNDATIONS/GATE_LIFECYCLE_DESCRIPTION_AND_OWNERS_v1.1.0.md` | עדכון טבלת Gate + הוספת ההבחנה GATE_2 (כוונה) vs GATE_6 (מציאות) וציון Approval authority Team 100 בשערים 2 ו-6 |
| 4 | כל מסמך governance נוסף המתאר תפקידי צוותים או תיאורי GATE_2/GATE_6 | יישור לטקסט הקנוני לעיל (כולל חוזים ו-runbook אם נוגעים בתיאור הסמנטי) |

---

## 4) פרוטוקול

- Team 170 מפיק directive זה.
- Team 70 מבצע את העדכון הקנוני בתיקיות documentation (או מאמת יישום).
- Team 100 מבצע review לפני אישור סופי.

---

## 5) Execution note (2026-02-24)

עדכונים קנוניים יושמו לפי checklist §3:

- **PHOENIX_MASTER_SSM_v1.0.0.md** — §1.1 שורת Team 100 הוחלפה בהגדרה המלאה (שותף אדריכלי ל-Team 00; GATE_0/GATE_1 אחראי; סמכות אישור GATE_2 ו-GATE_6).
- **04_GATE_MODEL_PROTOCOL_v2.3.0.md** — טבלת שערים: ציון approval authority Team 100 ב-GATE_2 ו-GATE_6; נוספו §4.2 (GATE_2 Intent) ו-§4.3 (GATE_6 Reality) עם ההבחנה המהותית.
- **GATE_LIFECYCLE_DESCRIPTION_AND_OWNERS_v1.1.0.md** — טבלת Gate עם עמודת Approval authority; נעילת סמנטיקה GATE_2 (כוונה) vs GATE_6 (מציאות).
- **GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT_v1.0.0.md** — הערת GATE_2 Intent + approval authority Team 100.
- **TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md** — GATE_6 כותרת "Reality gate" + סמכות אישור Team 100.

---

**log_entry | TEAM_170 | TEAM_100_ROLE_GATE_2_GATE_6_DIRECTIVE | v1.0.0_ISSUED | 2026-02-24**
**log_entry | TEAM_170 | TEAM_100_ROLE_GATE_2_GATE_6_DIRECTIVE | CANONICAL_UPDATES_APPLIED | 2026-02-24**
