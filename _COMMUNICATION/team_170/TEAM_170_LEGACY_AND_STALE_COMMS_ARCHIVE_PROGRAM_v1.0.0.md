---
id: TEAM_170_LEGACY_AND_STALE_COMMS_ARCHIVE_PROGRAM_v1.0.0
historical_record: true
from: Team 170 (Librarian)
to: Team 00, Team 10
cc: Team 191, all squad leads
date: 2026-03-23
status: ACTIVE
scope: ניקיון תיקיות `_COMMUNICATION/` — legacy + תקשורת ישנה לארכיון (לא רק ריפו)---

# תוכנית: לגסי + תקשורת ישנה → ארכיון (ניקיון תיקיות)

## מטרה

להביא **סדר פיזי** בשכבת `_COMMUNICATION/` הפעילה: העברת תכנים **legacy / staging / רעש ריצה** ל־`99-ARCHIVE/<DATE>_TEAM170_ALIGNMENT/` (או `_ROUND2_PENDING/` לתוכן שדורש סבב בדיקה), **בלי מחיקה**.

זה **ממוקד בתיקיות**, בנוסף לעבודת Team 191 על **אינדקס Git** (מקומי מול רימוט).

---

## חריגים קשיחים — לעולם לא לארכיין (KEEP)

| נתיב / דפוס | סיבה |
|---------------|------|
| `_Architects_Decisions/**` | החלטות אדריכליות קנוניות |
| `_ARCHITECT_INBOX/**` | כניסות ואישורי אדריכל |
| `_COMMUNICATION/_ARCHIVE/**` (מראה תוכנית) | ארכיון מחזורי תוכנית — נשמר פעיל על הדיסק; לא מעבירים ל־99-ARCHIVE בשלב זה |
| `agents_os/**` | מצב ריצה / prompts / לוגים תפעוליים |
| `team_170/**` | מטא ספרן + מניפסטים |
| קבצי שורש קנוניים (`PHOENIX_*`, `FLIGHT_LOG*`, …) | ראו [TEAM_170_COMMUNICATION_KEEP_RULES_v1.0.0.md](TEAM_170_COMMUNICATION_KEEP_RULES_v1.0.0.md) |

הסקריפט [`scripts/map_communication_folder.py`](../../scripts/map_communication_folder.py) משקף זאת ב־`archive_action` (שורת פתיחה: `architect_inbox` / `architects_decisions` / `_archive/` → **KEEP**).

---

## דלי legacy (ARCHIVE_ROUND2 — בדיקה לפני מחיקה עתידית)

נוספו ל־`DEEP_REVIEW_SUBSTR` (סבב 2026-03-23):

- `90_architects_comunication` (לא לבלבל עם `_Architects_Decisions`)
- `legace_html_for_blueprint`
- `/nimrod/`, `team_31_staging`
- `_simulation_archive/`, `e2e_sim`, `_simulation_backup`

קבצים תחת נתיבים אלה → **`ARCHIVE_ROUND2`** → תת־תיקייה `_ROUND2_PENDING/` ב־shard.

---

## סבבי ביצוע

1. **מלאי:**  
   `python3 scripts/map_communication_folder.py`  
   → `COMMUNICATION_FULL_INVENTORY.csv` + `MANIFEST_PRE_ARCHIVE.csv`

2. **תצוגה:**  
   `python3 scripts/archive_communication_sweep.py --dry-run --shard-date YYYY-MM-DD`

3. **שער:** חתימת Team 00 / Team 10 על `--execute` (כמו ב־KEEP RULES).

4. **ביצוע:**  
   `python3 scripts/archive_communication_sweep.py --execute --i-have-team00-signoff --shard-date YYYY-MM-DD`

5. **מעקב:** עדכון Team 191 אם נדרש התאמה ל־`.gitignore` / clone נקי.

---

## ביצוע אחרון (דוגמה)

| Shard | תאריך | הערות |
|-------|--------|--------|
| `99-ARCHIVE/2026-03-24_TEAM170_ALIGNMENT/` | 2026-03-24 | כולל `_ROUND2_PENDING/_SIMULATION_ARCHIVE/...` + לוגי `team_60/evidence/runtime/` |

---

## מה עדיין לא “נקי” אוטומטית

- **~UNCLASSIFIED** ב־מלאי — דורש החלטה ידנית או הרחבת דפוסי `DEEP_REVIEW` / KEEP.
- **קבצי קוד / `documentation/`** — מחוץ לסוויפ `_COMMUNICATION` בלבד (אלא אם יורחב מנדט).
- **`.DS_Store`** — מסונן במיפוי; ניתן לנקות בנפרד (לא מחיקת תוכן מהותי).

---

**log_entry | TEAM_170 | LEGACY_STALE_COMMS_ARCHIVE_PROGRAM | v1.0.0 | ACTIVE | 2026-03-23**
