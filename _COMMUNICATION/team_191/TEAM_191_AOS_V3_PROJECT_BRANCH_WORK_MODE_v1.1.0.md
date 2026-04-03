---
id: TEAM_191_AOS_V3_PROJECT_BRANCH_WORK_MODE_v1.1.0
type: TEAM_191_GIT_WORK_MODE_OVERLAY
from: Team 191 (Git Governance Operations)
to: Team 100 · Team 10 · Nimrod · מבצעי AOS v3
date: 2026-03-27
status: APPROVED — ref: TEAM_00_TO_TEAM_191_AOS_V3_GIT_GOVERNANCE_CANONICAL_v1.1.0
authority: Team 00 (Principal) — תגובה קנונית v1.1.0; מכסה PENDING_TEAM_100_SIGNOFF
supersedes: TEAM_191_AOS_V3_PROJECT_BRANCH_WORK_MODE_v1.0.0
---

# Team 191 — מצב עבודה: ענף ייעודי לפרויקט Agents_OS v3

## 1) מטרה

להגדיר **מצב Git זמני** לפרויקט **AOS v3**: עבודה **ישירה ופשוטה** על ענף ייעודי, **ללא שימוש בפיפליין** לפרויקט זה, תוך שמירה על **`main` כברירת המחדל של הריפו** עד **איחוד מבוקר** (כולל מיגרציית מידע) בסיום.

## 2) פרמטרים נעולים (בעלים)

| שדה | ערך |
|-----|-----|
| **ענף עבודה יומיומי (canonical)** | `aos-v3` |
| **יעד upstream לדחיפה** | `origin/aos-v3` **ישירות** |
| **פיפליין (`pipeline_run.sh` וכו')** | **לא בשימוש** למסלול פיתוח זה בתקופת הפרויקט |
| **`codex/team191-integration`** | **לא בשימוש** למסלול זה בתקופת הפרויקט — אין לולאת אינטגרציה נפרדת |
| **ברירת מחדל ב-GitHub** | נשארת **`main`** (ללא שינוי Default branch) |
| **סיום פרויקט** | איחוד ל־`main` (לרוב PR) **אחרי** השלמת הפיתוח **ו**מיגרציית המידע + `CLEANUP_REPORT` מאושר — ראו קנוני Team 00 §4 |

## 3) צ׳ק-ליסט הכנה (לפני / במעבר)

1. **סנכרון:** `git fetch origin` ווידוא ש־`main` הוא נקודת הבסיס הרצויה.
2. **יצירת ענף (מפעיל אנושי / Gateway):**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b aos-v3
   git push -u origin aos-v3
   ```
3. **צוותים:** `git fetch && git checkout aos-v3 && git pull`.
4. **הגדרות מקומיות (מומלץ):** `git config push.default upstream`.
5. **CI / GitHub rulesets:** להגדיר מול הריפו אם workflows חלים על `aos-v3` — מחוץ לטווח אוטומטי של Team 191 אלא אם הוגדר מנדט.

## 4) Overlay על נוהל Team 191 (זמני — רק למסלול AOS v3)

כל עוד מצב זה **APPROVED ופעיל**:

| נושא | נוהל רגיל (`TEAM_191_INTERNAL_WORK_PROCEDURE_v1.0.4.md` §10) | במסלול AOS v3 |
|------|----------------------------------------------------------------|----------------|
| ענף מקומי לעבודה | `main` | `aos-v3` |
| דחיפה / פרסום | `origin/codex/team191-integration` | **`origin/aos-v3`** |
| מיזוג ל־`main` | PR מ־`team191-integration` | **בסיום הפרויקט בלבד** — PR (או מדיניות מיזוג מאושרת) **מ־`aos-v3`** ל־`main` |

**Iron Rules (מסלול זה):**

- אין `push --force` כחלק מהמעבר או השגרה.
- Pre-commit / date-lint / שאר hooks — נשארים כפי שהריפו מגדיר; נוסף `phoenix-aos-v3-file-index-v2-freeze` (ראו קנוני Team 00).
- סגירת מצב זה = **191-C** בקנוני Team 00: `CLOSED` + ארכיב לאחר איחוד ל־`main`.

## 5) אישור

| שער | סטטוס |
|-----|--------|
| **Team 00** | **PASS** — `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_191_AOS_V3_GIT_GOVERNANCE_CANONICAL_v1.1.0.md` |
| **דרישת Team 100 (היסטורית)** | נסגרה דרך הקנוני לעיל (Team 00 מדווח כיסוי מלא) |

## 6) ביצוע Team 191 (מיפוי למשימות)

| משימה | מצב |
|--------|-----|
| 191-A1 ענף `aos-v3` | בוצע מקומית/רימוט לפי סביבה — ראה `git branch -a` |
| 191-A2 `AGENTS.md` | בוצע — סעיף **Active branch — AOS v3** |
| 191-A3/A4 נוהל + סטטוס | `TEAM_191_INTERNAL_WORK_PROCEDURE_v1.0.4.md` + סטטוס מסמך זה **APPROVED** |
| 191-A5 FILE_INDEX / FREEZE | **אפשרות A:** pre-commit `phoenix-aos-v3-file-index-v2-freeze` + **אפשרות B (fallback):** `AOS_V3_FILE_INDEX_PR_CHECKLIST.md` |
| 191-B BUILD | `bash scripts/check_aos_v3_build_governance.sh` בכל BUILD |
| 191-C | לביצוע בסיום — PR + merge ל־`main` לפי קנוני Team 00 |

דוח ביצוע ל-Team 00: `_COMMUNICATION/team_191/TEAM_191_TO_TEAM_00_AOS_V3_GOVERNANCE_EXECUTION_v1.0.0.md`

---

**log_entry | TEAM_191 | AOS_V3_BRANCH_WORK_MODE | APPROVED_v1.1.0 | 2026-03-27**

historical_record: true
