---
id: TEAM_170_TO_TEAM_191_POST_ARCHIVE_SYNC_v1.0.0
historical_record: true
from: Team 170 (Librarian / _COMMUNICATION hygiene)
to: Team 191 (Git governance & backup)
cc: Team 00, Team 10
date: 2026-03-21
status: ACTION_REQUIRED
scope: Post–alignment-sweep Git sync and archive path verification---

# Team 170 → Team 191 | סנכרון Git אחרי ארכיון יישור קו

## מה בוצע

בוצע **העברה בלבד** (ללא מחיקה) של 765 קבצים משכבת `_COMMUNICATION/` הפעילה לשארד:

| שדה | ערך |
|-----|-----|
| **Shard root** | `_COMMUNICATION/99-ARCHIVE/2026-03-21_TEAM170_ALIGNMENT/` |
| **אינדקס** | [ARCHIVE_INDEX.md](../99-ARCHIVE/2026-03-21_TEAM170_ALIGNMENT/ARCHIVE_INDEX.md) |
| **לוג ביצוע** | [MANIFEST.csv](../99-ARCHIVE/2026-03-21_TEAM170_ALIGNMENT/MANIFEST.csv) |
| **מניפסט קלט (צילום)** | `MANIFEST_PRE_ARCHIVE_SNAPSHOT.csv` (באותה תיקייה) |
| **תוצאה** | 765/765 העברות מוצלחות (`git_mv` / `shutil_move`) |

תת־תיקייה **`_ROUND2_PENDING/`** — קבצים מסומנים לסבב סקירה עמוקה (Legacy HTML, וכו').

## בקשות ל־Team 191

1. **`.gitignore`**  
   - לאמת ש־[`.gitignore`](../../.gitignore) מכיל `**/99-ARCHIVE/` — השארד החדש מכוסה; אין צורך בחרגה נוספת לנתיב הספציפי.

2. **`git status`**  
   - לסקור שינויים: קבצים שעברו ב־`git mv` יופיעו כ־rename/delete+untracked לפי מדיניות Git מול תיקיות מתעלמות.  
   - לוודא שאין קבצים “תלויים” מחוץ ל־`.gitignore` שצריכים מעקב.

3. **Push / CI**  
   - לוודא שאין workflow שמניח נוכחות קבצים ישנים בנתיבי `team_*` שהועברו.  
   - אם יש בדיקות שסורקות את כל `_COMMUNICATION/` — לעדכן או להחריג `99-ARCHIVE` במפורש.

4. **LFS / גודל**  
   - השארד כולל בעיקר `.md` / `.json` / HTML ירושה; אם מזוהים קבצים גדולים חדשים — החלטה לפי מדיניות Repo.

5. **גיבוי**  
   - לאשר שגיבוי/מראה כוללים את מבנה ה־shard (או מתעלמים ממנו בכוונה אם `99-ARCHIVE` מחוץ לפריסה).

## הפניות

- [TEAM_170_COMMUNICATION_KEEP_RULES_v1.0.0.md](TEAM_170_COMMUNICATION_KEEP_RULES_v1.0.0.md)  
- [scripts/archive_communication_sweep.py](../../scripts/archive_communication_sweep.py)  
- [scripts/map_communication_folder.py](../../scripts/map_communication_folder.py)

---

**log_entry | TEAM_170 | TO_TEAM_191 | POST_ARCHIVE_SYNC | 2026-03-21**
