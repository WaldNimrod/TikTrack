---
id: TEAM_170_S003_P013_WP001_ARCHIVE_TRANSFER_PLAN_v1.0.0
historical_record: true
from: Team 170 (Librarian / _COMMUNICATION hygiene)
to: Team 00, Team 10
cc: Team 51, Team 61, Team 191
date: 2026-03-23
status: EXECUTED — 2026-03-23 (see §6)
work_package_id: S003-P013-WP001
in_response_to: TEAM_51_S003_P013_WP001_REPO_NOISE_BACKUP_RECOMMENDATIONS_v1.0.0.md---

# Team 170 | S003-P013-WP001 — תוכנית העברה לארכיון (צמצום רעש ריפו)

## מטרה

ליישם את [TEAM_51_S003_P013_WP001_REPO_NOISE_BACKUP_RECOMMENDATIONS_v1.0.0.md](../team_51/TEAM_51_S003_P013_WP001_REPO_NOISE_BACKUP_RECOMMENDATIONS_v1.0.0.md) **באמצעות העברה מסודרת בלבד** (אין מחיקה), בהתאם ל-[TEAM_170_COMMUNICATION_KEEP_RULES_v1.0.0.md](TEAM_170_COMMUNICATION_KEEP_RULES_v1.0.0.md).

---

## §1 — מיפוי דוח Team 51 (P0–P2) ↔ כללי KEEP / ARCHIVE

| עדיפות בדוח Team 51 | אזור | `archive_action` / תפקיד Team 170 |
|---------------------|------|-----------------------------------|
| **P0** | `_COMMUNICATION/Legace_html_for_blueprint/` (בלוק D גדול) | **ARCHIVE_ROUND2** — העברה ל־`_ROUND2_PENDING/` תחת shard היעד; **לא** commit של מחיקות בלי מניפסט והעברה פיזית. |
| **P0** | ~226 קבצים לא במעקב תחת `_COMMUNICATION/team_*` | סיווג מול טבלת KEEP; קבצים שאינם KEEP → **ARCHIVE** ל־shard; קבצי WP/QA/MANDATE וכו' לפי דפוסים → **KEEP** (נשארים פעילים). |
| **P1** | `agents_os_v2/`, `agents_os/ui/` | **מחוץ לסקופ ארכיון תקשורת** — הפניה לבעלי טכני (Team 61 / תהליך PR נפרד). |
| **P1** | `_COMMUNICATION/agents_os/` (state/prompts) | **KEEP** — צמצום רעש = תהליך commit / הפרדה; ראו [TEAM_170_TO_TEAM_191_S003_P013_WP001_REPO_NOISE_AND_LOCAL_ARCHIVE_REQUEST_v1.0.0.md](TEAM_170_TO_TEAM_191_S003_P013_WP001_REPO_NOISE_AND_LOCAL_ARCHIVE_REQUEST_v1.0.0.md). |
| **P2** | `documentation/`, `ui/` (שורש) | לא נוהל על ידי Team 170 ב־`documentation/` — קידום דרך Team 10 אם נדרש. |

---

## §2 — יעד shard (מבנה)

הסקריפט [`scripts/archive_communication_sweep.py`](../../scripts/archive_communication_sweep.py) קובע:

`Shard root = _COMMUNICATION/99-ARCHIVE/{YYYY-MM-DD}_TEAM170_ALIGNMENT`

(פרמטר `--shard-date` — ברירת מחדל: היום ב־UTC.)

| שדה | ערך |
|-----|-----|
| **Shard root (דוגמה ביצוע 2026-03-23)** | `_COMMUNICATION/99-ARCHIVE/2026-03-23_TEAM170_ALIGNMENT/` |
| **תת־נתיב ROUND2 (Legace וכו')** | `{shard}/_ROUND2_PENDING/<mirror של source_rel_path>` |
| **אינדקס** | `ARCHIVE_INDEX.md` בשורש ה-shard (נוצר/מתעדכל על ידי הסקריפט לפי המימוש) |
| **מניפסט** | `MANIFEST.csv` + עותק `MANIFEST_PRE_ARCHIVE_SNAPSHOT.csv` |

**תיוג לוגי S003-P013-WP001:** יש לרשום ב־`ARCHIVE_INDEX.md` או ב־`log_entry` שסבב זה נובע מדוח Team 51 (רעש ריפו) — **שם התיקייה נשאר לפי הסקריפט** (לא שם מותאם אישית נפרד).

---

## §3 — שלבים לביצוע

1. **ריענון מניפסט**  
   - הרצת `scripts/map_communication_folder.py` (לפי נוהל הקיים) לייצוא/עדכון `MANIFEST_PRE_ARCHIVE.csv` תחת `team_170/`.

2. **Dry-run**  
   ```bash
   python3 scripts/archive_communication_sweep.py --dry-run --shard-date 2026-03-23
   ```  
   (התאימו `--manifest` אם המניפסט לא בנתיב ברירת המחדל.)

3. **גיבוי לפני execute** (עקביות עם §3 בדוח Team 51)  
   - Branch snapshot / tar ל־Legace לפי הצורך — **לפני** `--execute`.

4. **שער אישור**  
   - חתימת Team 00 / Team 10 על ביצוע sweep (כמו ב־KEEP RULES §שער אישור), אלא אם הוגדר אחרת למסלול S003-P013.

5. **ביצוע**  
   ```bash
   python3 scripts/archive_communication_sweep.py --execute --i-have-team00-signoff --shard-date 2026-03-23
   ```  
   (התאימו `--shard-date` לתאריך UTC של הריצה; `--manifest` לפי הצורך.)

6. **עדכון אינדקס**  
   - מילוי `ARCHIVE_INDEX.md` + `MANIFEST.csv` ב-shard; `log_entry` עם תאריך UTC.

7. **המשך**  
   - [TEAM_170_TO_TEAM_191_S003_P013_WP001_REPO_NOISE_AND_LOCAL_ARCHIVE_REQUEST_v1.0.0.md](TEAM_170_TO_TEAM_191_S003_P013_WP001_REPO_NOISE_AND_LOCAL_ARCHIVE_REQUEST_v1.0.0.md) — Git מקומי מול רימוט, CI, גיבוי.

---

## §4 — סיכונים (קצר)

- **Legace:** מניעת אובדן — רק העברה לאחר מניפסט; לא מחיקה ישירה של תוכן היסטורי.
- **226 קבצי team_\*:** סיווג שגוי עלול להעביר קנון פעיל — חובה להיצמד לטבלאות KEEP ול־`map_communication_folder` patterns.

---

## §6 — ביצוע (2026-03-23 UTC)

| שדה | ערך |
|-----|-----|
| **Shard** | `_COMMUNICATION/99-ARCHIVE/2026-03-23_TEAM170_ALIGNMENT/` |
| **קבצים שהועברו** | **7** (הכל `executed_ok`; אין שגיאות) |
| **תוכן** | לוגי מוניטור `team_00/monitor/` + `TT_TEST_FLIGHT_MONITOR_LOG`; לוגי ריצה `team_60/evidence/runtime/*.log` |
| **מניפסט** | עודכן `MANIFEST_PRE_ARCHIVE.csv` אחרי תיקון סיווג ב־`map_communication_folder.py` (סגירת squad authority — לא לארכיון כ־"unclassified") |
| **דוח ביצוע + העברה לוידאציה** | [TEAM_170_S003_P013_WP001_ARCHIVE_SWEEP_EXECUTION_REPORT_v1.0.0.md](TEAM_170_S003_P013_WP001_ARCHIVE_SWEEP_EXECUTION_REPORT_v1.0.0.md) |

---

**log_entry | TEAM_170 | S003_P013_WP001 | ARCHIVE_TRANSFER_PLAN | EXECUTED | 2026-03-23**
