---
id: TEAM_170_COMMUNICATION_ARCHIVE_PHASE1_MAPPING_v1.0.0
historical_record: true
from: Team 170 (Librarian / Governance — communication hygiene Phase 1)
to: Team 00 (Chief Architect), Team 10 (Gateway)
cc: All squad leads
date: 2026-03-21
status: ALIGNMENT_SWEEP_EXECUTED — 2026-03-21
scope: _COMMUNICATION/ inventory for selective archive (anti-drift, exemptions, Round-2 deep review)---

# מיפוי `_COMMUNICATION/` — שלב 1 (לפני ארכיון יישור קו)

## 0. עקרונות (חובה לפני כל העברה לארכיון)

| עקרון | משמעות |
|--------|--------|
| **אין ארכיון גורף** | לא מעבירים את `team_*` / `agents_os` / `_Architects_Decisions` כולם בבת אחת. |
| **החרגות קבועות** | קטגוריות 1–3 (מסמכי צוות/תהליך, WP פעיל/עתידי, החלטות ואפיון סופי) — **נשארים במקום** עד החלטת Team 00 / Team 10. |
| **סימון סבב 2** | קבצים החשודים כ"מידע חשוב להמשך" מסומנים **🔶 DEEP_REVIEW_ROUND2** — לא לארכב עד סקירה. |
| **קנון SSOT** | מסמכי נהלים **קאנוניים** לרוב ב־`documentation/` (רק Team 10 כותב); ב־`team_*` קיימים **תוספות צוותיות** שיש למפות ולא למחוק בלי רשימה. |

---

## 1. מבנה עליון ונפחים (עדכון סריקה)

| נתיב | סוג | הערכת קבצים (כולל תת־ספריות) | הערות |
|------|-----|-------------------------------|--------|
| `team_00` … `team_191` | תיקיות צוות | ראה §1.1 | ליבת תקשורת תפעולית |
| `agents_os/` | ריצה AOS | ~101 | state, prompts, logs, config — **לא ארכיון** |
| `_Architects_Decisions/` | החלטות | ~177 | **קטגוריה 3** — החרג מלא |
| `_ARCHITECT_INBOX/` | כניסות לאדריכל | ~294 | **קטגוריה 3 + 🔶** — סבב 2 לפני ניקוי |
| `99-ARCHIVE/` | ארכיון קיים | ~4057+ | כבר מכיל המון היסטוריה — לא לכפול לוגיקה |
| `_ARCHIVE/` | ארכיון משני | קטן | לבדוק תוכן לפני מיזוג |
| `90_Architects_comunication/` | legacy | — | **🔶 DEEP_REVIEW_ROUND2** |
| `Legace_html_for_blueprint/` | legacy | — | **🔶** — ייתכן נכס עיצובי |
| `nimrod/` | אישי/פרויקט | — | **🔶** — לא לגעת בלי בעלים |
| שורש `_COMMUNICATION/*.md` | שכבת שרטוט | 3 קבצים | ראה §2.3 |

### 1.1 ספירת קבצים לפי תיקיית צוות (שכבה פעילה, לא כולל 99-ARCHIVE)

| תיקייה | קבצים (כולל הכל בעץ) |
|--------|----------------------|
| team_10 | 158 |
| team_60 | 110 |
| team_61 | 101 |
| team_00 | 99 |
| team_90 | 97 |
| team_170 | 90 |
| team_190 | 125 |
| team_100 | 60 |
| team_50 | 48 |
| team_70 | 36 |
| team_191 | 36 |
| team_51 | 31 |
| team_20 | 18 |
| team_30 | 14 |
| team_31 | 72 |
| team_11 | 8 |
| team_101 | 7 |
| team_40 | 2 |
| team_102 | 1 |

**מסקנה:** `team_190`, `team_10`, `team_60`, `team_61`, `team_90`, `team_170` דורשים **מיפוי מפורט** לפני כל העברה; אלה גם מועמדים ל־🔶 אם אין WP אקטיבי ברור.

---

## 2. קטגוריה 1 — נהלים, הגדרות ותהליכים (לפי צוות)

### 2.1 קאנוני מול תוספת צוותית

| שכבה | מיקום טיפוסי | הערה |
|------|----------------|------|
| **קאנוני (SSOT נהלים)** | `documentation/docs-governance/`, `documentation/docs-agents-os/` | לא בארכיון `_COMMUNICATION` בשלב זה |
| **הנחיות הודעות / מטא־פרוטוקול** | `_COMMUNICATION/PHOENIX_CANONICAL_TEAM_MESSAGE_GUIDE_v1.0.0.md` | **החרג** — מסמך מערכתי |
| **תהליכי צוות פנימיים** | `team_170/TEAM_170_INTERNAL_WORK_PROCEDURE.md`, דומים בצוותים אחרים | **החרג** עד שמיפוי מלא יושלם |
| **דוחות השלמה / Seal / SOP** | `team_*/*COMPLETION*`, `*SEAL*`, `*MANDATE*` | מיפוי לפי שם קובץ — חלק ארכיון עתידי, חלק עדיין הפניה ל-WP פתוח |

### 2.2 מיפוי "סוגי קבצים" לפי דפוס שם (לכל `team_*`)

יש להריץ בשלב הבא (או סקריפט) **רשימת מלאה** לפי דפוסים:

| דפוס | קטגוריה 1 |
|------|-----------|
| `*PROCEDURE*`, `*RUNBOOK*`, `*SOP*`, `*GOVERNANCE*`, `*PROTOCOL*` | נהלים / תהליכים |
| `*MANDATE*`, `*HANDOFF*`, `*ACTIVATION*` | תהליך תפעולי |
| `*READINESS*`, `*DECLARATION*` | תהליך איכות |

**פלט נדרש לסבב המשך:** טבלת CSV / Markdown — `path | team | pattern | suggested_tier`  
(`tier`: KEEP_ACTIVE | ARCHIVE_CANDIDATE | 🔶 REVIEW)

---

## 3. קטגוריה 2 — תוכניות עבודה פעילות או עתידיות

### 3.1 סממנים ל־WP / Program (להחרגה)

| סממן בקובץ | משמעות |
|------------|--------|
| `S003-P011-WP002`, `S003-P012`, … ב־שם הקובץ | WP פעיל סביר |
| `work_package_id`, `program_id` בכותרת YAML | פעיל |
| `FLIGHT_LOG_*.md` בשורש | יומן תוכנית — **החרג** |

### 3.2 דגימת נוכחות S003 / WP002 בתיקיות מפתח (לא ממצה)

| תיקייה | קבצים עם `S003` בשם | קבצים עם `WP002` בשם |
|--------|---------------------|------------------------|
| team_190 | 24 | 15 |
| team_51 | 13 | 7 |
| team_170 | 9 | 2 |
| team_61 | 7 | 3 |
| team_11 | 5 | 5 |

**הנחיה:** כל קובץ התואם `S00*_P*_WP*` בתיקיית צוות — **ברירת מחדל: KEEP_ACTIVE** עד סגירת WP רשמית (Seal / Team 00).

### 3.3 שורש `_COMMUNICATION`

| קובץ | קטגוריה |
|------|---------|
| `FLIGHT_LOG_S003_P003_WP001.md` | 2 — החרג |
| `PHOENIX_SOURCE_AUTHORITY_CONVERGENCE_PROGRAM_v1.1.0.md` | 1 + 🔶 — תכנית מטא |
| `PHOENIX_CANONICAL_TEAM_MESSAGE_GUIDE_v1.0.0.md` | 1 — החרג |

---

## 4. קטגוריה 3 — החלטות אדריכליות ואפיון מאושר סופי

| נתיב | פעולה בשלב 1 |
|------|----------------|
| `_Architects_Decisions/*.md` | **אין ארכיון** |
| `_ARCHITECT_INBOX/**` | **אין ארכיון**; תת־תיקיות היסטוריות — 🔶 לסבב 2 |
| `agents_os/AGENTS_OS_ADR031_OPEN_ITEMS_v1.0.0.md` | החרג (AOS) |
| `archive/TikTrackV1-code&docs/...` (אם רלוונטי) | מחוץ לטווח `_COMMUNICATION` אך קשור ל-SSOT — לא לגעת כאן |

**מסמכי LLD400 / LOD200 מאושרים** לרוב ב־`team_170/`, `team_101/`, `_ARCHIVE/S003/...` — כל אלה **קטגוריה 3** או ארכיון כבר מבוקר; לא להזיז בלי מפת מקור.

---

## 5. קטגוריה 4 — 🔶 חשודים כ"מידע חשוב להמשך" (סבב 2 בלבד)

אזורים **לא** לארכב עד סקירה מעמיקה:

| אזור | סיבה |
|------|------|
| `team_10/` (נפח גבוה) | מרכז תיאום היסטורי + מנדטים; סיכון איבוד הקשר |
| `team_190/` | אימות ו-Gate — מסמכי אמת |
| `team_60/` | DevOps — סקריפטים/הפניות |
| `90_Architects_comunication/` | שם לא אחיד + תוכן לא ממופה |
| `Legace_html_for_blueprint/` | נכסי HTML ישנים |
| `nimrod/` | אישי |
| `team_31/team_31_staging/` | אם קיים — סטייג'ינג |
| `99-ARCHIVE/**` כפולים מול שורש `team_*` | סיכון כפילות — מיזוז דורש hash/compare |

**סימון בדוחות המשך:** prefix `🔶` בעמודה ייעודית.

---

## 6. מה **לא** לעשות בשלב 1

- לא למחוק קבצים.
- לא להעביר `pipeline_state*.json`, `team_engine_config.json`, `prompts/`, `logs/` מתוך `agents_os/`.
- לא לגעת ב־`documentation/` (סמכות Team 10).

---

## 7. ארכיון יישור קו — **בוצע**

| פריט | מיקום |
|------|--------|
| שארד | `_COMMUNICATION/99-ARCHIVE/2026-03-21_TEAM170_ALIGNMENT/` |
| אינדקס מרכזי | `ARCHIVE_INDEX.md` |
| לוג העברות | `MANIFEST.csv` (765 שורות, כולן הצלחה) |
| מניפסט קלט (צילום) | `MANIFEST_PRE_ARCHIVE_SNAPSHOT.csv` |
| כללי KEEP | [TEAM_170_COMMUNICATION_KEEP_RULES_v1.0.0.md](TEAM_170_COMMUNICATION_KEEP_RULES_v1.0.0.md) |
| סקריפט ביצוע | `scripts/archive_communication_sweep.py` |

**המשך מומלץ:** סבב סקירה ל־`_ROUND2_PENDING/`; קידום SSOT דרך Team 10 לפי צורך.

---

## 8. מסקנות Team 170

- הדריפט טופל בשכבה הפעילה באמצעות **מיפוי אוטומטי** + **העברה בלבד** לשארד מתוארך.  
- **החרגות** (agents_os, החלטות אדריכל, WP בשם קובץ, נהלים לפי דפוס, `team_170/**`) נשמרו בשורש התקשורת.  
- **Team 191:** [TEAM_170_TO_TEAM_191_POST_ARCHIVE_SYNC_v1.0.0.md](TEAM_170_TO_TEAM_191_POST_ARCHIVE_SYNC_v1.0.0.md)

---

## 9. מיפוי מלא — אוטומציה חסכונית (מומלץ)

**סקריפט:** `scripts/map_communication_folder.py`

| מה עושה | ללא קריאת תוכן קבצים — רק `stat` + נתיב + שם קובץ; סריקה אחת (`rglob`). |
| זמן ריצה | ~מאות ms ל־~2k קבצים בשכבה הפעילה; עם `--include-archive` יותר שורות. |
| פלט | `COMMUNICATION_FULL_INVENTORY.csv` — כולל `archive_action`, `archive_reason`; `MANIFEST_PRE_ARCHIVE.csv` לשורות ARCHIVE בלבד (ריק אחרי ביצוע עד הרצה מחדש של המיפוי לפני סבב חדש). |

**הרצה:**
```bash
# שכבה פעילה בלבד (מדלג על 99-ARCHIVE — מומלץ לסבב ראשון)
python3 scripts/map_communication_folder.py

# כולל ארכיון קיים
python3 scripts/map_communication_folder.py --include-archive

# פלט מותאם
python3 scripts/map_communication_folder.py --out-csv _COMMUNICATION/team_170/inventory_active.csv
```

**סיווג `suggested_tier` (היוריסטי):**  
`EXEMPT_CAT3_NO_ARCHIVE` | `EXEMPT_RUNTIME` | `LIKELY_ACTIVE_WP_KEEP` | `LIKELY_ACTIVE_KEEP` | `CAT1_PROCESS_OR_SPEC_REVIEW` | `ROUND2_DEEP_REVIEW` | `ALREADY_ARCHIVED` | `UNCLASSIFIED_REVIEW`

**סבב 2:** מסננים ב־Excel / `csvkit` / pandas לפי `suggested_tier == UNCLASSIFIED_REVIEW` או לפי `team_bucket` — ואז בודקים ידנית או מוסיפים דפוסים לסקריפט.

---

**log_entry | TEAM_170 | COMMUNICATION_ARCHIVE | PHASE1_MAPPING | 2026-03-21**
**log_entry | TEAM_170 | COMMUNICATION_ARCHIVE | INVENTORY_SCRIPT_ADDED | 2026-03-21**
**log_entry | TEAM_170 | COMMUNICATION_ARCHIVE | ALIGNMENT_SWEEP_765_MOVES | 2026-03-21**
