# Team 10 → Team 20 | S002-P002-WP003 GATE_7 Part A — פרומט קנוני לתיקון (סבב תיקון מהיר)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_20_S002_P002_WP003_GATE7_PARTA_REMEDIATION_CANONICAL_PROMPT_v1.0.0  
**from:** Team 10 (Gateway)  
**to:** Team 20 (Backend Implementation)  
**cc:** Team 50, Team 60, Team 90  
**date:** 2026-03-11  
**status:** MANDATE_ACTIVE  
**trigger:** GATE_7 Part A BLOCK (CC-WP003-04 + evidence gaps); סבב תיקון מהיר למניעת פסילת השער  
**in_response_to:** TEAM_90_TO_TEAM_60_TEAM_50_S002_P002_WP003_GATE7_PARTA_RERUN_MANDATE_v2.0.1  

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | S002-P002-WP003 |
| gate_id | GATE_7 |
| phase_owner | Team 90 |

---

## 1) מטרה (חד-משמעית)

להביא את **GATE_7 Part A** ל־**PASS מלא** בשלושת התנאים CC-WP003-01, CC-WP003-02, CC-WP003-04, באמצעות תיקוני צד שרת (Backend) והעברת חבילה ל־Team 50 להרצת בדיקות, ולאחר מכן איסוף עדות ואימות ע״י Team 60.

**זרימה מחייבת:**  
**Team 20 (תיקון)** → **Team 50 (הרצת בדיקות)** → **Team 60 (איסוף עדות ואימות)** → דוח סופי ל־Team 90.

---

## 2) הגדרה מדויקת של התיקונים הנדרשים

### 2.1 CC-WP003-04 — אפס מופעי 429 (חובה)

| פריט | הגדרה |
|------|--------|
| **בעיה נוכחית** | ב־4 מחזורי EOD רצופים נספרו **3** מופעי HTTP 429 מ־Yahoo (rate limit). |
| **קריטריון הצלחה** | ב־**4 מחזורים רצופים** באותו חלון evidence — **0** מופעי 429 בלוג (ספירה מפורשת). |
| **אחריות** | Team 20 — לוגיקת Yahoo provider: backoff, cooldown, דיליי בין בקשות, או צמצום/באצ'ינג של קריאות כך שבמרווח ~1h (4 מחזורים) Yahoo לא יחזיר 429. |
| **ראיה להצלחה** | Team 60 יריץ `scripts/run_g7_part_a_evidence.py` (או等价); ספירת "429" בלוג = 0; `pass_04: true` ב־`G7_PART_A_RUNTIME_EVIDENCE.json`. |

**מיקום רלוונטי בקוד:**  
- `api/integrations/market_data/providers/yahoo_provider.py` (כולל לוגיקת 429, backoff, cooldown)  
- סקריפט: `scripts/sync_ticker_prices_eod.py`, `scripts/run_g7_part_a_evidence.py`

---

### 2.2 CC-WP003-01 — market-open: ≤5 קריאות Yahoo

| פריט | הגדרה |
|------|--------|
| **דרישה** | במחזור sync **market-open** (שעות שוק פעיל) — מספר **קריאות HTTP ל־Yahoo** באותו מחזור ≤ **5**. |
| **קריטריון הצלחה** | לוג נתיב + ספירה מפורשת של קריאות Yahoo במחזור market-open; ערך ≤ 5. |
| **אחריות** | Team 20 — להבטיח שהמערכת במצב market-open מבצעת **לא יותר מ־5** קריאות ל־Yahoo באותו מחזור (אם כיום יש יותר — להגביל, לאחד בקשות, או להשתמש ב־cache/last-known כפי שמתאים). |
| **ראיה להצלחה** | Team 60 יריץ מחזור market-open, יתעד לוג ויספור קריאות Yahoo; הדוח יציין `cc_01_yahoo_call_count` ≤ 5 ו־`pass_01: true`. |

**הערה:** אם נדרש — Team 20 יוסיף/יפעיל instrumentation (למשל לוג שורה per Yahoo request כשמופעל `GATE7_CC_EVIDENCE`) כדי ש־Team 60 יוכל לספור מהלוג.

---

### 2.3 CC-WP003-02 — off-hours: ≤2 קריאות Yahoo

| פריט | הגדרה |
|------|--------|
| **דרישה** | ב־**חלון off-hours נפרד** (לא באותה ריצה כמו market-open) — מספר **קריאות HTTP ל־Yahoo** באותו מחזור ≤ **2**. |
| **קריטריון הצלחה** | לוג נפרד ל־off-hours + ספירה מפורשת; ערך ≤ 2. |
| **אחריות** | Team 20 — להבטיח שבמצב off-hours המערכת מבצעת **לא יותר מ־2** קריאות ל־Yahoo באותו מחזור (הגבלה, cache, או last-known). |
| **ראיה להצלחה** | Team 60 יריץ חלון off-hours נפרד, יתעד לוג ויספור; הדוח יציין `cc_02_yahoo_call_count` ≤ 2 ו־`pass_02: true`. |

---

## 3) קריטריוני הצלחה (סיכום)

| Condition | סף PASS | מי מודד |
|-----------|---------|----------|
| CC-WP003-01 | ≤5 קריאות Yahoo (market-open) | Team 60 (לאחר ריצה) |
| CC-WP003-02 | ≤2 קריאות Yahoo (off-hours) | Team 60 (לאחר ריצה נפרדת) |
| CC-WP003-04 | 0 מופעי 429 ב־4 מחזורים | Team 60 (לאחר ריצת evidence) |

**אין PASS מלא ב־Part A** ללא עמידה בכל שלושת התנאים.

---

## 4) ראיות והתנהגות נדרשת מצד Team 20

1. **תיאור תיקון:** במסמך ההשלמה — פירוט קצר של השינויים (קבצים, לוגיקה: backoff/cooldown/הגבלת קריאות, והתאמה ל־market-open vs off-hours אם רלוונטי).
2. **אימות מקומי (מומלץ):** הרצת `scripts/run_g7_part_a_evidence.py` בסביבה עם Yahoo; וידוא שספירת 429 יורדת ל־0 (או תיעוד מגבלה ידועה אם יש).
3. **Instrumentation (אם חסר):** וידוא שיש דרך לספור קריאות Yahoo per cycle (למשל לוג שורה ב־Yahoo provider כשמבצעים קריאה, עם דגל env כמו `GATE7_CC_EVIDENCE`) — כדי ש־Team 60 יוכל לספור מ־לוג.

---

## 5) דליברבל — דוח השלמה + העברת חבילה ל־Team 50

### 5.1 דוח השלמה (Team 20)

**נתיב חובה:**  
`_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P002_WP003_GATE7_PARTA_REMEDIATION_COMPLETION.md`

**תוכן מינימלי:**
- סטטוס: **DONE** (או BLOCK + סיבה אם לא הושלם).
- תיאור תיקונים: CC-04 (429), CC-01 (market-open ≤5), CC-02 (off-hours ≤2) — מה שונה ואיפה.
- אימות מקומי (אם בוצע): תוצאת ריצת evidence / ספירת 429.
- הפניה ל־commit / קבצים ששונו.

### 5.2 העברת חבילה ל־Team 50 (חובה)

**עם פרסום דוח ההשלמה**, Team 20 **מחויב** להעביר את החבילה ל־**Team 50** לצורך הרצת הבדיקות הדרושות.

**פעולות:**
1. **הודעה/פרומפט ל־Team 50:** צור או עדכן מסמך הפעלה ל־Team 50, או הפנה אותם למסמך הקיים:
   - `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_50_S002_P002_WP003_GATE7_PARTA_QA_ACTIVATION_v1.0.0.md`  
   (או הפרומפט הקנוני ש־Team 10 יספק ל־Team 50 להרצת בדיקות Part A לאחר תיקון.)
2. **בגוף דוח ההשלמה:** כלול משפט מפורש:
   - *"חבילת התיקון מועברת ל־Team 50 להרצת הבדיקות לפי הפרומפט/מנדט GATE_7 Part A QA. לאחר סיום בדיקות Team 50 — Team 60 יבצע איסוף עדות ואימות רשמי."*

**תזמון:**  
Team 50 מריץ את הבדיקות **אחרי** שהדוח של Team 20 מפורסם; Team 60 מריץ איסוף עדות **אחרי** ש־Team 50 סיימה (או במקביל לפי תיאום עם Team 10).

---

## 6) מסמכים רלוונטיים

| מסמך | תיאור |
|------|--------|
| `_COMMUNICATION/team_10/TEAM_10_GATE7_PARTA_REMEDIATION_OWNERSHIP_CLARIFICATION_v1.0.0.md` | הבהרת אחריות: מי מתקן מה (20/60/50). |
| `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_60_TEAM_50_S002_P002_WP003_GATE7_PARTA_RERUN_MANDATE_v2.0.1.md` | מנדט Team 90 — דרישות evidence ו־artifacts. |
| `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_90_S002_P002_WP003_GATE7_PARTA_RUNTIME_EVIDENCE_REPORT_v2.0.1.md` | דוח עדות נוכחי (BLOCK + NOT EVIDENCED). |
| `documentation/05-REPORTS/artifacts/G7_PART_A_RUNTIME_EVIDENCE.json` | ארטיפקט עדות — יעודכן ע״י Team 60 לאחר ריצה חוזרת. |
| `scripts/run_g7_part_a_evidence.py` | ריצת 4 מחזורים, לוג אחד, ספירת 429. |

---

## 7) סגירה וקריטריון להצלחת הסבב

- **Team 20:** דוח השלמה מפורסם; חבילה מועברת ל־Team 50 במפורש.  
- **Team 50:** מריץ בדיקות לפי הפרומפט/מנדט Part A QA; מדווח תוצאות.  
- **Team 60:** מריץ איסוף עדות (market-open, off-hours, 4-cycle); מעדכן דוח + JSON; `pass_01`, `pass_02`, `pass_04` כולם true.  
- **תוצאה:** GATE_7 Part A יכול להיות מוגש מחדש ל־Team 90 עם evidence תקף — סבב תיקון מהיר להמנעת פסילת השער.

---

**log_entry | TEAM_10 | GATE7_PARTA_REMEDIATION_CANONICAL_PROMPT | TO_TEAM_20 | MANDATE_ACTIVE | 2026-03-11**
