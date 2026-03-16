# Team 61 — Pipeline Event Log — מסמך דרישות והגדרות פיתוח

**date:** 2026-03-16  
**id:** TEAM_61_PIPELINE_EVENT_LOG_SPEC  
**version:** 1.0.0  
**owner:** Team 61  
**status:** DRAFT — לדיוק משותף  
**project_domain:** AGENTS_OS

---

## 1. מטרות הלוג

### 1.1 מטרה א — ניטור ובקרה בדיעבד

- לאפשר ניתוח מעמיק של מערכת האיגנטים (בפיתוח)
- זיהוי מדויק של הצלחות וכשלים
- מידע דיבג רחב ככל האפשר לתחקור
- **דגל Production:** מומלץ להגדיר מראש — במצב production צמצום כמות המידע (למשל: רק state changes, לא copy-to-clipboard)

### 1.2 מטרה ב — משתמש בממשק

- תמונת מצב ברורה ורציפה
- מתי קרה כל אירוע (timestamp)
- מעקב קבוע וזיהוי כשלים בזמן אמת

---

## 2. עקרונות תכנון

| עקרון | משמעות |
|-------|--------|
| **פאסיבי** | לא משנה התנהלות קיימת — צופה ומתעד בלבד |
| **אוטומטי** | נוצר ללא התערבות — ללא תלות בפעולת איגנט |
| **ללא overhead** | כתיבה אסינכרונית, אין חסימת flow |
| **לא משבש** | כישלון לוג לא חוסם פעולה |

---

## 3. אירועים לתיעוד

### 3.1 פקודות טרמינל (pipeline_run.sh)

| אירוע | מתי | מקור |
|-------|-----|------|
| `CMD_INVOKE` | הרצת pipeline_run.sh | pipeline_run.sh (wrapper) או pipeline.py (entry) |
| `CMD_PASS` | ./pipeline_run.sh pass | pipeline.py — advance_gate PASS |
| `CMD_FAIL` | ./pipeline_run.sh fail "reason" | pipeline.py — advance_gate FAIL |
| `CMD_APPROVE` | ./pipeline_run.sh approve | pipeline.py |
| `CMD_REJECT` | ./pipeline_run.sh reject "reason" | pipeline.py |
| `CMD_STATUS` | ./pipeline_run.sh status | pipeline_run.sh |
| `CMD_GATE_OVERRIDE` | ./pipeline_run.sh gate NAME | pipeline.py |
| `CMD_OVERRIDE` | ./pipeline_run.sh override "reason" | pipeline.py |
| `STATE_CHANGE` | שינוי pipeline_state (gate advance) | pipeline.py / state.save() |

**שדות מומלצים לאירוע טרמינל:**
- `timestamp` (ISO 8601)
- `event_type`
- `domain` (agents_os | tiktrack)
- `command` (מחרוזת הפקודה)
- `gate_before`, `gate_after` (למעברי gate)
- `result` (PASS | FAIL | BLOCK...)
- `reason` (אם רלוונטי)
- `work_package_id`

### 3.2 פעולות ממשק דשבורד

| אירוע | מתי | מקור |
|-------|-----|------|
| `UI_REFRESH` | לחיצה על ↺ Refresh | pipeline-dashboard.js, pipeline-roadmap.js |
| `UI_DOMAIN_SWITCH` | החלפת דומיין (TikTrack ↔ Agents OS) | onDomainSwitch() |
| `UI_COPY_CMD` | Copy command (כולל Copy mandate, Copy prompt) | copyCmd(), copyText(), copyCurrentMandate() |
| `UI_PROGRESS_CHECK` | 🔍 בדוק התקדמות | runProgressCheck() |
| `UI_ACCORDION_OPEN` | פתיחת אקורדיון (Gate Context, Mandates, וכו') | toggleAccordion() |
| `UI_PAGE_LOAD` | טעינת עמוד (Dashboard, Roadmap, Teams) | DOMContentLoaded |
| `UI_AUTO_REFRESH` | Refresh אוטומטי (כל 5s) | refreshTimer |

**שדות מומלצים לאירוע UI:**
- `timestamp`
- `event_type`
- `page` (dashboard | roadmap | teams)
- `domain` (אם רלוונטי)
- `detail` (למשל: command_copied, accordion_id)
- `command_text` (אם copy — הטקסט שהועתק; Production: omit או hash)

### 3.3 שינויים משמעותיים נוספים

| אירוע | מתי | מקור |
|-------|-----|------|
| `STATE_FILE_CHANGE` | כתיבת pipeline_state_*.json | state.py save() |
| `WSM_UPDATE` | עדכון WSM (אם יש hook — אופציונלי) | — |
| `INIT_PIPELINE` | init_pipeline.sh — הפעלת WP חדש | init_pipeline.sh / pipeline |

---

## 4. ארכיטקטורה מוצעת

### 4.1 מיקום הלוג

| אפשרות | יתרונות | חסרונות |
|--------|---------|----------|
| **A. קובץ JSONL** | append-only, קל לניתוח | גודל, rotation |
| **B. קובץ JSON (מערך)** | קריא | דורש read-parse-append-write — race risk |
| **C. SQLite** | query, indexing | תלות נוספת |
| **D. תיקיית קבצי אירוע** | event per file, parallel-safe | הרבה קבצים |

**המלצה:** JSONL — `_COMMUNICATION/agents_os/logs/pipeline_events.jsonl`  
שורה אחת לאירוע, append בלבד.

### 4.2 צריכת הלוג

- **Dashboard/Roadmap:** קריאת N שורות אחרונות via fetch, הצגה ב־UI
- **ניתוח:** `tail`, `grep`, או סקריפט Python
- **Rotation:** (עתידי) `logrotate` או סקריפט — לפי גודל/תאריך

### 4.3 דגל Production (PIPELINE_LOG_MODE)

| ערך | משמעות |
|-----|--------|
| `DEBUG` / default | כל האירועים — כולל copy text, accordion |
| `NORMAL` | state changes, terminal commands, refresh, domain switch |
| `MINIMAL` | רק PASS/FAIL/APPROVE — מעברי gate בלבד |

**מיקום:** env var `PIPELINE_LOG_MODE` או קובץ `_COMMUNICATION/agents_os/.log_mode`

---

## 5. נקודות החדרה (Instrumentation)

### 5.1 pipeline_run.sh

```bash
# בתחילת הסקריפט — אחרי domain resolution:
LOG_FILE="$REPO/_COMMUNICATION/agents_os/logs/pipeline_events.jsonl"
mkdir -p "$(dirname "$LOG_FILE")"
_log_event() {
  local evt="$1"
  echo "{\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"source\":\"pipeline_run\",\"event\":\"$evt\",\"domain\":\"${DOMAIN:-}\",\"cmd\":\"$*\"}" >> "$LOG_FILE"
}
# לפני exec ל-CLI:
_log_event "CMD_INVOKE" "$@"
```

**הערה:** pipeline_run.sh מעביר ל־Python — האירועים המפורטים (PASS, FAIL, gate) יופקו ב־pipeline.py.

### 5.2 pipeline.py (agents_os_v2)

- לפני/אחרי `state.advance_gate()` — log `STATE_CHANGE` עם gate_before, gate_after
- לפני `state.save()` — אופציונלי: רק אם state השתנה
- פונקציה מרכזית: `_append_event(event_dict)` — כותבת שורת JSON ל־JSONL

### 5.3 Dashboard / Roadmap (JS)

- **גישה:** אין גישת JS לכתיבת קבצים. נדרש endpoint או מנגנון אחר.
- **אפשרויות:**
  1. **Beacon API** ל־backend קל (למשל Flask/FastAPI) שרק append ל־JSONL — דורש שרת
  2. **לקבל על עצמנו:** אירועי UI נשמרים ב־localStorage ו־נשלחים ב־batch בעת Refresh (או fetch) — הדשבורד עושה fetch ל־state; ניתן להוסיף POST לאירוע — אבל זה דורש backend
  3. **ללא backend:** אירועי UI לא נרשמים לקובץ — רק אירועי טרמינל. המשתמש יראה לוג חלקי. **המלצה זמנית:** Phase 1 — לוג טרמינל בלבד; Phase 2 — אם יתווסף backend, יושלם לוג UI

**אלטרנטיבה:** שרת static פשוט עם CGI או endpoint — `agents_os/scripts/start_ui_server.sh` מריץ `python -m http.server`. ניתן להפעיל שרת קטן נוסף (למשל Flask על פורט 8091) שמקבל POST ו־appends ל־JSONL. או: הרחבת ה־http.server עם custom handler — מורכב יותר.

**המלצה מעשית:**  
- **Phase 1:** לוג מטעם pipeline_run.sh + pipeline.py (כל מה שקורה בטרמינל).  
- **Phase 2:** סקריפט או כלי קל שמאזין לקבצים/פרוצסים — או הוספת backend מינימלי — ל־אירועי UI.

---

## 6. ממשק משתמש — תצוגת הלוג

### 6.1 מיקום

- **אופציה א:** סעיף "Event Log" בעמוד Roadmap (ליד Gate History)
- **אופציה ב:** עמוד נפרד `PIPELINE_LOG.html` — גישה מהנווט
- **אופציה ג:** אקורדיון בעמוד Dashboard

**המלצה:** אופציה א — Roadmap, סעיף חדש "Pipeline Event Log" — מסונכרן עם Gate History (שניהם תחקור).

### 6.2 תוכן התצוגה

- טבלה/רשימה: `timestamp | event | source | domain | detail`
- **זמן אמת:** Auto-refresh כל 5s (או לפי ה־Auto הקיים)
- **סינון:** לפי event_type, domain, טווח תאריכים
- **זיהוי כשלים:** הדגשת שורות עם FAIL, BLOCK, error
- **ייצוא:** Copy או Download של N אירועים אחרונים (JSON/CSV)

---

## 7. הגדרות פיתוח נגזרות

### 7.1 Phase 1 — לוג טרמינל (MVP)

| # | משימה | קובץ/רכיב | אחראי |
|---|--------|-----------|-------|
| 1 | יצירת `_COMMUNICATION/agents_os/logs/` ו־`.gitignore` (או הכללת לוג בארכיון) | — | Team 61 |
| 2 | פונקציית `append_event()` ב־pipeline.py — כתיבה ל־JSONL | agents_os_v2/orchestrator/ | Team 61 |
| 3 | קריאות ל־append_event ב־advance_gate, approve, reject, status exit | pipeline.py | Team 61 |
| 4 | CMD_INVOKE ב־pipeline_run.sh (אופציונלי — או רק Python) | pipeline_run.sh | Team 61 |
| 5 | דגל PIPELINE_LOG_MODE — סינון לפי רמה | pipeline.py, config | Team 61 |
| 6 | תצוגת לוג ב־Roadmap — fetch + render | pipeline-roadmap.js, HTML | Team 61 |

### 7.2 Phase 2 — לוג UI (לאחר אישור)

| # | משימה | הערה |
|---|--------|------|
| 7 | Backend מינימלי ל־POST אירועים (או פתרון חלופי) | לפי החלטה ארכיטקטית |
| 8 | Instrumentation ב־copyCmd, onDomainSwitch, loadAll, runProgressCheck | pipeline-dashboard.js, pipeline-roadmap.js |
| 9 | שליחת אירועים מהדשבורד ל־backend | fetch POST |

### 7.3 Phase 3 — Production hardening

| # | משימה |
|---|--------|
| 10 | Log rotation (גודל/תאריך) |
| 11 | תיעוד PIPELINE_LOG_MODE בנוהל DevOps |
| 12 | בדיקת ביצועים — וידוא ללא overhead משמעותי |

---

## 8. סכמת אירוע (דוגמה)

```json
{
  "ts": "2026-03-16T14:32:01.123Z",
  "source": "pipeline",
  "event": "STATE_CHANGE",
  "domain": "agents_os",
  "work_package_id": "S002-P005-WP003",
  "gate_before": "GATE_0",
  "gate_after": "GATE_1",
  "result": "PASS",
  "command": "./pipeline_run.sh --domain agents_os pass"
}
```

```json
{
  "ts": "2026-03-16T14:31:55.000Z",
  "source": "ui",
  "event": "UI_COPY_CMD",
  "page": "dashboard",
  "domain": "agents_os",
  "detail": "pass",
  "command_preview": "./pipeline_run.sh --domain agents_os pass"
}
```

---

## 9. שאלות לדיוק

1. **אירועי UI ללא backend:** האם Phase 1 (לוג טרמינל בלבד) מספק כרגע, או שיש דרישה מפורשת ללוג UI כבר ב־MVP?
2. **גודל/retention:** האם להגדיר מכסה (למשל 10,000 אירועים) או rotation אוטומטי?
3. **`.gitignore`:** האם הקבצים ב־`logs/` ייכללו ב־git או יישארו local-only?
4. **PII/Sensitive:** האם יש איסור לוג של command text (למשל סיסמאות, tokens)?

---

**log_entry | TEAM_61 | PIPELINE_EVENT_LOG_SPEC | v1.0.0_DRAFT | 2026-03-16**
