---
project_domain: AGENTS_OS
id: TEAM_10_TO_TEAM_170_AOUI_F02_CSS_INDEX_MANDATE_v1.0.0
from: Team 10 (Implementation Coordinator)
to: Team 170 (Spec & Governance Authority)
cc: Team 61, Team 100, Team 190, Team 00
date: 2026-03-14
status: COMPLETED
in_response_to: TEAM_100_TO_TEAM_10_AOUI_F02_CSS_INDEX_MANDATE_DIRECTIVE_v1.0.0
finding_id: AOUI-F02
---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| task_id | AGENTS_OS_UI_OPTIMIZATION |
| finding_id | AOUI-F02 |
| severity | LOW |

---

## 1) תנאי הפעלה (Trigger)

**מנדט זה מופעל לאחר:** Team 61 סיימו ומזגו את יישום אופטימיזציית Agents_OS UI — כל קבצי ה-CSS ב-`agents_os/ui/css/` וקבצי ה-JS ב-`agents_os/ui/js/` מאושרים ומאוחדים בענף main.

---

## 2) פעולה נדרשת מ-Team 170

### 2.1 הוסף את כל מחלקות ה-CSS החדשות של Agents_OS

מהקבצים הבאים ל־`documentation/docs-system/07-DESIGN/CSS_CLASSES_INDEX.md`:

| קובץ | היקף |
|------|------|
| `agents_os/ui/css/pipeline-shared.css` | Cross-page (Dashboard, Roadmap, Teams) |
| `agents_os/ui/css/pipeline-dashboard.css` | Dashboard בלבד |
| `agents_os/ui/css/pipeline-roadmap.css` | Roadmap בלבד |
| `agents_os/ui/css/pipeline-teams.css` | Teams בלבד |

### 2.2 לכל מחלקה — תעד:

- **שם המחלקה** (class name)
- **תיאור** (description)
- **הקשר שימוש** (usage context) — באיזה קובץ HTML / באיזה רכיב

### 2.3 מחלקות שהועברו מ-inline

אם מחלקות שהיו ב-inline CSS כבר מופיעות ב-`CSS_CLASSES_INDEX.md`, עדכן את נתיב המקור שלהן כך שיצביעו לקבצי ה-CSS החיצוניים החדשים.

### 2.4 חריגה מפורשת

**אל תתעד קבצי JS** — מנדט זה מכסה מחלקות CSS בלבד.

---

## 3) קלט מוכן (Team 61)

**מקור מומלץ:** `_COMMUNICATION/team_61/TEAM_61_AGENTS_OS_UI_CSS_CLASS_INVENTORY_v1.0.0.md`

אינבנטר מלא של כל המחלקות לפי קובץ, עם מטרה ותיאור. השתמש בקובץ זה כבסיס לעדכון האינדקס.

---

## 4) גבולות היקף

| בתוך היקף | מחוץ להיקף |
|-----------|-------------|
| מחלקות חדשות ב-pipeline-*.css | תיעוד פונקציות JS (משימה נפרדת) |
| עדכון נתיבי מקור למחלקות שהועברו | שינוי מבנה HTML של Dashboard/Roadmap/Teams |
| סקשן Agents_OS ב-CSS_CLASSES_INDEX | מחלקות CSS של TikTrack |

---

## 5) עדיפות ותזמון

| שדה | ערך |
|-----|-----|
| **עדיפות** | LOW |
| **מועד** | Post-merge — לא חוסם את יישום Team 61 |
| **דדליין** | בתוך סשן אחד לאחר אימות שמזגון Team 61 הושלם |
| **חוסם?** | לא — זה governance בלבד ב-lane של איחוד |

---

## 6) מסמך יעד

| שדה | ערך |
|-----|-----|
| **קובץ** | `documentation/docs-system/07-DESIGN/CSS_CLASSES_INDEX.md` |
| **סקשן** | 11. Agents_OS Pipeline UI (קיים; יש להרחיב/לעדכן) |

---

**log_entry | TEAM_10 | TO_TEAM_170 | AOUI_F02_CSS_INDEX_MANDATE | ISSUED | 2026-03-14**
