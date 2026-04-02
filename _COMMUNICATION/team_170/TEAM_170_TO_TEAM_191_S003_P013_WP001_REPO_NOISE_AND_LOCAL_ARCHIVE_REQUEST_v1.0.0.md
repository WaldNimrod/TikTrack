---
id: TEAM_170_TO_TEAM_191_S003_P013_WP001_REPO_NOISE_AND_LOCAL_ARCHIVE_REQUEST_v1.0.0
historical_record: true
from: Team 170 (Librarian / _COMMUNICATION hygiene)
to: Team 191 (Git governance & backup)
cc: Team 00, Team 10, Team 51
date: 2026-03-23
status: CLOSED — Team 191 execution per `TEAM_191_TO_TEAM_170_S003_P013_WP001_REPO_ARCHIVE_INDEX_EXECUTION_RESULT_v1.0.0.md` (2026-03-23)
work_package_id: S003-P013-WP001
in_response_to:
  - TEAM_51_S003_P013_WP001_REPO_NOISE_BACKUP_RECOMMENDATIONS_v1.0.0.md
  - TEAM_170_S003_P013_WP001_ARCHIVE_TRANSFER_PLAN_v1.0.0.md
supplements: TEAM_170_TO_TEAM_191_POST_ARCHIVE_SYNC_v1.0.0.md---

# Team 170 → Team 191 | רעש ריפו + ארכיונים מקומיים בלבד (S003-P013-WP001)

## הקשר

- Team 51 דיווח על רמת רעש גבוהה ב־`git status` (סה"כ ~1232 שורות; פילוח M/D/??) — ראו [TEAM_51_S003_P013_WP001_REPO_NOISE_BACKUP_RECOMMENDATIONS_v1.0.0.md](../team_51/TEAM_51_S003_P013_WP001_REPO_NOISE_BACKUP_RECOMMENDATIONS_v1.0.0.md).
- Team 170 מכין **העברות לארכיון בלבד** (אין מחיקת תוכן) — ראו [TEAM_170_S003_P013_WP001_ARCHIVE_TRANSFER_PLAN_v1.0.0.md](TEAM_170_S003_P013_WP001_ARCHIVE_TRANSFER_PLAN_v1.0.0.md).
- מסמך בסיס קודם: [TEAM_170_TO_TEAM_191_POST_ARCHIVE_SYNC_v1.0.0.md](TEAM_170_TO_TEAM_191_POST_ARCHIVE_SYNC_v1.0.0.md) (יישור קו אחרי `99-ARCHIVE`).

## בקשות מפורשות ל־Team 191

### 1) `**/99-ARCHIVE/` ו־`.gitignore`

- לאמת ש־[`.gitignore`](../../.gitignore) כולל `**/99-ARCHIVE/` (קיים) — shards של Team 170 לא אמורים להידחף בטעות.
- אם קבצים תחת `99-ARCHIVE/` **כבר tracked** בהיסטוריה — להסיר ממדדים (`git rm -r --cached …`) **בהתאם למדיניות** ובאישור גיבוי, בלי מחיקה מדיסק מקומי.

### 2) `_COMMUNICATION/_ARCHIVE/` (ארכיוני תוכנית; לדוגמה S003-P012)

- כיום **אין** דפוס ב־`.gitignore` שמכסה במפורש `_COMMUNICATION/_ARCHIVE/`.
- **בקשה:** להגדיר מדיניות אחת:
  - **א)** הוספת דפוס ignore מתאים (למשל `_COMMUNICATION/_ARCHIVE/` או הדק יותר), **ו/או**
  - **ב)** `git rm --cached` לנתיבים tracked — כך שהארכיון יישאר **מקומי** ולא יעמיס על GitHub/clone ציבורי.
- כל שינוי index מחייב תיאום CI והיסטוריה — ראו סעיף 3.

### 3) CI / סריקות

- לעדכן או להחריג סריקות שמניחות נוכחות כלל `_COMMUNICATION/` (כפי שפורט ב־POST_ARCHIVE_SYNC) — במיוחד אחרי הוצאת ארכיונים מהמעקב.

### 4) גיבוי לפני שינוי אינדקס

- ליישם גיבוי / snapshot (או לאשר מראה גיבוי קיים) לפני `git rm --cached` או שינוי דפוסי ignore נרחבים — עקביות עם §3 בדוח Team 51.

### 5) תהליך commit / רעש `_COMMUNICATION/agents_os/` (state/prompts)

- דוח Team 51 מסמן churn בקבצי ריצה — **KEEP** לפי [TEAM_170_COMMUNICATION_KEEP_RULES_v1.0.0.md](TEAM_170_COMMUNICATION_KEEP_RULES_v1.0.0.md).
- בקשה: המלצות workflow (commits קטנים / הפרדת generated מ-authored) — סמכות ביצוע Team 191 + בעלי מוצר.

### 6) יידוע Team 10

- שינוי מדיניות ריפו/רימוט — Team 10 כ-Gateway לתיאום הודעות וקידום ל־`documentation/` אם נדרש (לא נכתב על ידי Team 170).

---

## הפניות טכניות

| נושא | נתיב |
|------|------|
| סקריפט sweep | [`scripts/archive_communication_sweep.py`](../../scripts/archive_communication_sweep.py) |
| כללי KEEP | [`TEAM_170_COMMUNICATION_KEEP_RULES_v1.0.0.md`](TEAM_170_COMMUNICATION_KEEP_RULES_v1.0.0.md) |
| תוכנית העברה WP001 | [`TEAM_170_S003_P013_WP001_ARCHIVE_TRANSFER_PLAN_v1.0.0.md`](TEAM_170_S003_P013_WP001_ARCHIVE_TRANSFER_PLAN_v1.0.0.md) |

---

**log_entry | TEAM_170 | TO_TEAM_191 | S003_P013_WP001 | REPO_NOISE_LOCAL_ARCHIVE | CLOSED_ON_TEAM191_RESULT | 2026-03-23**
