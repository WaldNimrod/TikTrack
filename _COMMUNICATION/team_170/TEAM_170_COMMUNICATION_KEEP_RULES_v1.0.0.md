---
id: TEAM_170_COMMUNICATION_KEEP_RULES_v1.0.0
historical_record: true
from: Team 170 (Librarian / _COMMUNICATION hygiene owner)
to: Team 00 (Chief Architect), Team 10 (Gateway)
cc: Team 191, all squad leads
date: 2026-03-21
status: EXECUTED — 2026-03-21 (see ARCHIVE_INDEX in shard; formal Team 00/10 signature still recommended on file)
scope: Frozen KEEP vs ARCHIVE rules before alignment sweep---

# כללי KEEP — `_COMMUNICATION/` (יישור קו ארכיון)

## מטרה

להגדיר **לפני כל העברה לארכיון** מה נשאר בשכבה הפעילה לפי קטגוריות ההמשך (1–4) ומתוך [TEAM_170_COMMUNICATION_ARCHIVE_PHASE1_MAPPING_v1.0.0.md](TEAM_170_COMMUNICATION_ARCHIVE_PHASE1_MAPPING_v1.0.0.md).

## מיפוי ל־`archive_action` (אוטומציה)

| `archive_action` | משמעות |
|------------------|--------|
| **KEEP** | נשאר ב־`_COMMUNICATION/` (לא מועבר) |
| **ARCHIVE** | מועבר ל־`99-ARCHIVE/<DATE>_TEAM170_ALIGNMENT/<mirror_path>` |
| **ARCHIVE_ROUND2** | מועבר ל־`99-ARCHIVE/<DATE>_TEAM170_ALIGNMENT/_ROUND2_PENDING/<mirror_path>` (תוכן חשוד להמשך — סבב 2) |
| **SKIP** | לא מעובד (שכבת סריקה אחרת) |

## טבלת KEEP (חובה)

| קבוצה | נתיב / תנאי | `archive_action` |
|--------|-------------|-------------------|
| ריצה AOS | כל קובץ תחת `agents_os/` | **KEEP** |
| החלטות אדריכליות | `_Architects_Decisions/**` | **KEEP** |
| כניסות לאדריכל | `_ARCHITECT_INBOX/**` | **KEEP** |
| ארכיון משני (עד החלטה) | `_archive/**` | **KEEP** |
| שורש תקשורת | `PHOENIX_CANONICAL_TEAM_MESSAGE_GUIDE_v1.0.0.md`, `FLIGHT_LOG*.md`, `PHOENIX_SOURCE_AUTHORITY*.md`, `PHOENIX_IDEA_LOG.json` | **KEEP** |
| צוות 170 (ספרן) | כל `team_170/**` | **KEEP** (סבב יישור קו v1 — ניהול SSOT צוותי) |
| מסמכי יישור קו (מטא) | כלולים ב־`team_170/**` + שמות סקריפטים ב-repo | **KEEP** |
| WP / תוכנית בשם קובץ | `Snnn_Pnn_WPnnn` או `Snnn-Pnn-WPnnn` או `Snnn_Pnn` (תוכנית) ב־שם הקובץ | **KEEP** (קטגוריה 2) |
| נהלים / אפיון / QA בשם | התאמה לדפוסים ב־`map_communication_folder.py` (`MANDATE`, `LLD400`, `LOD200`, `QA_REPORT`, …) | **KEEP** (קטגוריה 1) |

## טבלת ארכיון (ברירת מחדל אחרי חריגים למעלה)

| תנאי | `archive_action` |
|------|------------------|
| נתיב תחת `Legace_html_for_blueprint/`, `90_Architects_comunication/`, `nimrod/`, או `team_31_staging/` | **ARCHIVE_ROUND2** |
| שאר הקבצים בשכבה הפעילה שלא סווגו ל־KEEP למעלה | **ARCHIVE** |

## עקרונות בלתי ניתנים לשינוי

1. **אין מחיקה** — רק העברה לארכיון מתוארך.
2. **אין ארכיון** של `agents_os/`, `_Architects_Decisions/`, `_ARCHITECT_INBOX/` בשלב זה.
3. **אינדקס מרכזי** — `ARCHIVE_INDEX.md` + `MANIFEST.csv` בשורש תיקיית הארכיון של התאריך.

## תוכנית הרחבה — ניקיון תיקיות (legacy / תקשורת ישנה)

למעבר מסודר **מעבר לריפו בלבד** (תיקיות פעילות נקיות יותר), ראו:  
[TEAM_170_LEGACY_AND_STALE_COMMS_ARCHIVE_PROGRAM_v1.0.0.md](TEAM_170_LEGACY_AND_STALE_COMMS_ARCHIVE_PROGRAM_v1.0.0.md)  
(חריגים אדריכליים מפורשים; דלי `ARCHIVE_ROUND2` ל־Legace / simulation / וכו').

---

## שער אישור (חובה לפני `--execute`)

| תפקיד | שם | חתימה | תאריך |
|--------|-----|--------|--------|
| Team 00 | Nimrod / Chief Architect | _________ | _________ |
| Team 10 | Gateway | _________ | _________ |

**הערה:** בוצע ביצוע עם `--execute --i-have-team00-signoff` ב־2026-03-21; חתימה ידנית בטבלה עדיין מומלצת לאudit.

| ביצוע | תאריך | כלי |
|--------|--------|-----|
| Alignment sweep | 2026-03-21 | `scripts/archive_communication_sweep.py` |

---

**log_entry | TEAM_170 | COMMUNICATION_KEEP_RULES | v1.0.0 | 2026-03-21**
