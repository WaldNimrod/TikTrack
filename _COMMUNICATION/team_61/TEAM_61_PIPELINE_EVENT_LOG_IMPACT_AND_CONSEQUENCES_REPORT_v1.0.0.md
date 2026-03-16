# Team 61 — Pipeline Event Log — דוח השפעות והשלכות

**date:** 2026-03-10  
**historical_record:** true  
**id:** TEAM_61_PIPELINE_EVENT_LOG_IMPACT_REPORT  
**version:** 1.0.0  
**owner:** Team 61  
**status:** FOR REVIEW — טרם אישור החבילה  
**references:** TEAM_61_PIPELINE_EVENT_LOG_IMPLEMENTATION_PLAN_v1.0.0.md, TEAM_61_PIPELINE_EVENT_LOG_SPEC_v1.0.0.md

---

## 1. התוצאה הצפויה

### 1.1 מצב קצה (End State)

- **קובץ לוג מרכזי:** `_COMMUNICATION/agents_os/logs/pipeline_events.jsonl` — append-only, שורה אחת לאירוע.
- **מקורות אירועים:**
  - **טרמינל:** כל הרצת `pipeline_run.sh` (CMD_INVOKE) ו־`init_pipeline.sh` (INIT_PIPELINE).
  - **Python:** כל מעבר gate (STATE_CHANGE), approve/reject, store, route, status.
  - **UI:** Refresh, החלפת דומיין, Copy command, בדיקת התקדמות, פתיחת אקורדיון (לפי mode).
- **תצוגה:** סעיף "Pipeline Event Log" בעמוד Roadmap — טבלה עם auto-refresh כל 5 שניות.
- **שרת:** אותו פורט 8090 — static files + POST /log + GET /logs/events.

### 1.2 דוגמאות שימוש מיידי

| תרחיש | תוצאה |
|-------|--------|
| משתמש לוחץ Copy command בדשבורד | שורת `UI_COPY_CMD` עם command_preview (או בלי — לפי mode) |
| מפתח מריץ `./pipeline_run.sh pass` | CMD_INVOKE → STATE_CHANGE (result=PASS) |
| תחקור "למה ה־gate לא התקדם?" | חיפוש בלוג לפי timestamp ו־gate_before/gate_after |
| וידוא זרימת עבודה | רצף CMD_INVOKE / STATE_CHANGE / UI_REFRESH לפי זמן |

---

## 2. יתרונות למערכת

| יתרון | הסבר |
|-------|------|
| **ניתוח בדיעבד** | לוג רציף מאפשר תחקור "מה קרה לפני/אחרי X" — ללא צורך בזיכרון אנושי. |
| **דיבג** | זיהוי מדויק של הצלחות/כשלים — gate_before, gate_after, reason, work_package_id. |
| **שקיפות** | תמונה ברורה למשתמש — מתי קרה אירוע, מאיזה מקור (טרמינל/UI). |
| **אינטגרציה קלה** | ללא DB, ללא תלות חדשה — Python stdlib בלבד. |
| **התאמה ל־Production** | PIPELINE_LOG_MODE (DEBUG/NORMAL/MINIMAL) מאפשר צמצום נפח וסיכוני PII. |
| **חזרה על הוראות** | קל לשחזר רצף פעולות מתוך הלוג (לצורכי QA או הדרכה). |

---

## 3. עלויות — זמן, סיכון, אוברהד

### 3.1 עלות פיתוח

| מרכיב | אומדן | הערות |
|-------|--------|-------|
| `log_events.py` | ~1–2 שעות | מודול קטן, append + rotation + mode |
| `aos_ui_server.py` | ~3–4 שעות | החלפת http.server, שני endpoints |
| Instrumentation pipeline.py | ~2–3 שעות | ~15+ נקודות קריאה — advance, approve, route, store, status |
| Instrumentation pipeline_run.sh | ~30 דקות | פונקציה אחת בתחילת case |
| Instrumentation UI (JS) | ~2–3 שעות | pipeline-log.js + עטיפות ב־3–4 קבצי JS |
| תצוגת Roadmap | ~2 שעות | סעיף, טבלה, fetch, styling |
| בדיקות E2E | ~1–2 שעות | pipeline + UI + ולידציה |
| **סה"כ** | **~12–16 שעות** | תלוי ביכולת מיקום מדויק של instrumentation |

### 3.2 אוברהד ריצה

| מקור | השפעה |
|------|--------|
| **טרמינל** | כתיבה ל־JSONL — ~0.1–1 ms לאירוע. append-only, ללא I/O כבד. |
| **UI** | fetch POST — fire-and-forget. לא חוסם את המשתמש. |
| **שרת** | קריאה/כתיבה לקובץ — negligible ביחס ל־static file serving. |
| **סה"כ** | **לא מורגש** — עקרון "לא משבש" נשמר. |

### 3.3 סיכונים

| סיכון | הסתברות | חומרה | מitigation |
|-------|----------|--------|------------|
| כשלון כתיבת לוג | נמוכה | נמוכה | כישלון לוג לא חוסם פעולה — try/except, המשך flow |
| race על JSONL (ריבוי writers) | בינונית | בינונית | append-only + fd פתוח; OS מספק atomic append ל־single file |
| גודל לוג מנופח | בינונית | נמוכה | rotation ב־5MB, PIPELINE_LOG_MODE=MINIMAL ל־production |
| PII ב־command_preview | בינונית | בינונית | MINIMAL/NORMAL — omit או hash; תיעוד מפורש |
| השרת החדש שבור (static) | נמוכה | בינונית | E2E לפני merge — Dashboard/Roadmap חייבים לעבוד |

---

## 4. מה יכול להשתבש ואיך נאתר

### 4.1 תרחישי כשל

| כשל | סימנים | איתור |
|-----|--------|-------|
| **לוג לא נכתב** | אין שורות חדשות ב־JSONL | בדיקה: הרצת `pass` + `tail -1 pipeline_events.jsonl` |
| **אירועי UI חסרים** | יש CMD אבל אין UI_* | וידוא: השרת 8090 רץ; fetch ל־/log מגיע; CORS/network |
| **תצוגה לא מתעדכנת** | Roadmap Event Log ריק/סטטי | וידוא: GET /logs/events מחזיר 200; refresh timer פעיל |
| **שרת static שבור** | Dashboard/Roadmap 404 או לא נטענים | וידוא: `aos_ui_server.py` משרת קבצים כמו http.server |
| **ריבוי שורות שבורות** | JSON לא valid ב־שורות | `python -c "import json; [json.loads(l) for l in open('...')]"` |
| **Rotation לא רץ** | קובץ > 5MB ללא .old | בדיקה: log_events.py קורא ל־rotation לפני append |

### 4.2 נקודות בדיקה מומלצות

1. **Pre-merge:** `./pipeline_run.sh status` → CMD_INVOKE ב־JSONL.
2. **Post-merge:** Dashboard → Copy command → UI_COPY_CMD ב־JSONL.
3. **Post-merge:** Roadmap → Event Log section → טבלה מתמלאת, auto-refresh.
4. **Regression:** הדשבורד והרואדמאפ נטענים ותפקודיים כמו לפני השינוי.

---

## 5. שיפורים להצעה לפני התקדמות

### 5.1 חיוני (מומלץ לכלול בחבילה)

| # | שיפור | הסבר |
|---|--------|------|
| 1 | **INIT_PIPELINE instrumentation** | `init_pipeline.sh` אינו בתוכנית — זוהי נקודת כניסה קריטית (הפעלת WP חדש). יש להוסיף CMD/אירוע INIT_PIPELINE. |
| 2 | **UI_PAGE_LOAD + UI_AUTO_REFRESH** | ה־SPEC מזכיר אותם; התוכנית לא. הוספה קלה — loadAll + refreshTimer — משפרת הקשר זמן. |
| 3 | **Store artifact event** | `./pipeline_run.sh store GATE FILE` — אירוע `ARTIFACT_STORE` עם gate, file path (ללא תוכן). |

### 5.2 רצוי (שיקול לסבב עוקב)

| # | שיפור | הסבר |
|---|--------|------|
| 4 | **Route event** | `./pipeline_run.sh route doc\|full` — אירוע `ROUTE` עם type, gate, reason. |
| 5 | **Revise event** | `./pipeline_run.sh revise "notes"` — אירוע `REVISE` עם notes (hash ב־NORMAL). |
| 6 | **Pass-with-actions / Override** | `pass_with_actions`, `override` — אירועים ייעודיים. |
| 7 | **Phase transition** | `./pipeline_run.sh phase2` — אירוע `PHASE_TRANSITION`. |
| 8 | **Validate-before-pass BLOCK** | כש־pass נחסם (artifact missing) — אירוע `ADVANCE_BLOCKED`. |

### 5.3 עתידי

| # | שיפור |
|---|--------|
| 9 | WSM_UPDATE — אם ייווצר hook לעדכון WSM. |
| 10 | logrotate או סקריפט retention אוטומטי (לפי תאריך). |
| 11 | ייצוא CSV/JSON מ־UI — כפתור Download. |

---

## 6. הכנות ואינטגרציה נדרשת

### 6.1 הכנות טרם התחלה

| הכנה | סטטוס |
|------|--------|
| תיקיית `_COMMUNICATION/agents_os/logs/` | תיווצר ע"י הסקריפט — `.gitkeep` או קובץ ריק |
| `.gitignore` — `*.jsonl` | החלטה: להוסיף או לא (לפי מדיניות local-only) |
| PIPELINE_LOG_MODE | ברירת מחדל DEBUG — אין צורך בהכנה |
| וידוא Python 3.x | קיים — אין שינוי |

### 6.2 אינטגרציה

| רכיב | פעולה |
|------|--------|
| **start_ui_server.sh** | החלפת `python -m http.server` ב־`python3 agents_os/scripts/aos_ui_server.py` |
| **pipeline_run.sh** | הוספת `_log_invoke` לפני ה־case — **לא** משנה סדר/תלויות |
| **pipeline.py** | import + קריאות ל־append_event — **לא** משנה לוגיקה |
| **Dashboard/Roadmap/Teams** | טעינת pipeline-log.js — חייב להיות לפני קריאות ל־logEvent |
| **כלים חיצוניים** | אין — Makefile, VSCode tasks, launchd (check_alert) — לא תלויים ב־pipeline event log |

### 6.3 תלות הדדית

- **אין הפעלה ללא שרת 8090 ל־אירועי UI** — אם השרת לא רץ, אירועי UI לא ייכתבו (טרמינל ימשיך לעבוד).
- **init_pipeline.sh** — רץ independantly; אם נוסיף instrumentation — יש לו גישת כתיבה ישירה ל־JSONL (כמו pipeline_run.sh).

---

## 7. כיסוי הסקואופ — האם מחסה את כל האירועים?

### 7.1 מה **כן** מכוסה

| קטגוריה | אירועים |
|---------|----------|
| **פקודות טרמינל** | CMD_INVOKE, STATE_CHANGE (PASS/FAIL/APPROVE/REJECT), STATE_FILE_CHANGE |
| **פעולות דשבורד** | UI_REFRESH, UI_DOMAIN_SWITCH, UI_COPY_CMD, UI_PROGRESS_CHECK, UI_ACCORDION_OPEN (ב־DEBUG) |
| **ממשק** | Copy command, Copy mandate, Copy prompt (אם ממומש ב־pipeline-teams/pipeline-commands) |

### 7.2 מה **לא** מכוסה בתוכנית הנוכחית

| חסר | משמעות | האם קריטי לניתוח בדיעבד? |
|-----|---------|---------------------------|
| **init_pipeline.sh** | הפעלת WP חדש — אין תיעוד | **כן** — זה אירוע משמעותי בתהליך |
| **store** | `./pipeline_run.sh store GATE FILE` | **כן** — שינוי state משמעותי |
| **route** | `./pipeline_run.sh route doc\|full` | **כן** — החלטת routing אחרי FAIL |
| **revise** | `./pipeline_run.sh revise "notes"` | בינוני |
| **pass_with_actions / override / insist** | פקודות משנה | בינוני |
| **phase2, phase3...** | מעברי phase | בינוני |
| **ADVANCE_BLOCKED** | pass נחסם (artifact missing) | **כן** — מסביר למה לא התקדם |
| **state_reader** | _refresh_state_snapshot — נקרא מ־pipeline_run | לא קריטי — משני ל־CMD_INVOKE |
| **WSM_UPDATE** | אין hook — לא ממומש | עתידי |
| **פעולות Cursor/Codex** | עבודה בתוך AI sessions | **לא** — מחוץ לסקואופ; אין instrumentation שם |
| **CI/GitHub Actions** | אם ירוצו pipeline — יעברו דרך pipeline_run | **מכוסה** — CMD_INVOKE יתעד |

### 7.3 מסקנה — כיסוי לניתוח בדיעבד

| שאלה | תשובה |
|------|--------|
| **האם הסקואופ מכסה את כל האירועים בתהליך הפיתוח והפייפליין?** | **חלקית.** התוכנית הנוכחית מכסה היטב: (1) כל הרצת pipeline_run, (2) מעברי gate, (3) פעולות UI מרכזיות. **חסרים:** init_pipeline, store, route, ADVANCE_BLOCKED. |
| **האם ניתן ניתוח בדיעבד משמעותי?** | **כן** — עם ההרחבות המומלצות (§5.1) הכיסוי יהיה מספק לרוב התחקורים. |
| **האם פעולות AI (Cursor, Codex) מכוסות?** | **לא** — וזה מחוץ לסקואופ. הלוג מתעד **מה המשתמש והמערכת עושים** סביב הפייפליין, לא מה קורה בתוך סשן AI. |

### 7.4 המלצה לסגירת פערים

לפני אישור החבילה — **לכלול בתוכנית** את:

1. **INIT_PIPELINE** — instrumentation ב־`init_pipeline.sh`
2. **ARTIFACT_STORE** — instrumentation ב־`pipeline.py` (store_artifact)
3. **ROUTE** — instrumentation ב־`pipeline.py` (--route)
4. **ADVANCE_BLOCKED** — instrumentation ב־`pipeline_run.sh` (כש־pass נחסם)

אלו אירועים שמסבירים **למה** הפייפליין נעצר או **מה** השתנה — קריטיים לניתוח בדיעבד.

---

## 8. סיכום להחלטה

| נושא | מסקנה |
|------|--------|
| **תוצאה** | לוג JSONL מרכזי + תצוגה ב־Roadmap — מועיל לדיבג ותחקור. |
| **יתרונות** | ניתוח בדיעבד, שקיפות, ללא תלות חדשה. |
| **עלויות** | ~12–16 שעות פיתוח; אוברהד ריצה negligible. |
| **סיכונים** | נמוכים; כישלון לוג לא חוסם. |
| **איתור כשלים** | tail, fetch, E2E — פרוטוקול ברור. |
| **שיפורים לפני התקדמות** | init_pipeline, store, route, ADVANCE_BLOCKED — להכליל. |
| **הכנות** | מינימליות — תיקייה, .gitignore, החלפת שרת. |
| **כיסוי** | מספק עם הרחבה — חוסר כיסוי ל־AI sessions (מחוץ לסקואופ). |

---

**log_entry | TEAM_61 | PIPELINE_EVENT_LOG_IMPACT_REPORT | v1.0.0 | 2026-03-10**
