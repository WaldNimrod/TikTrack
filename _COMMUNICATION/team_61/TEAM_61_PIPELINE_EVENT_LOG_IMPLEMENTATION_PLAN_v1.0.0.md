# Team 61 — Pipeline Event Log — תוכנית מימוש חבילה אחת

**date:** 2026-03-10  
**historical_record:** true  
**id:** TEAM_61_PIPELINE_EVENT_LOG_IMPLEMENTATION_PLAN  
**version:** 1.0.0  
**owner:** Team 61  
**status:** ACTIVE — מימוש מלא בסבב אחד  
**project_domain:** AGENTS_OS  
**supersedes:** Phase splitting in TEAM_61_PIPELINE_EVENT_LOG_SPEC_v1.0.0

---

## 0. עיקרון מנחה

**מימוש מלא בסבב אחד** — לוג טרמינל + לוג UI + תצוגה, ללא פיצול לשלבים.  
**ללא DB** — אחסון בקובץ JSONL בלבד.  
**אינטגרציה בתשתית הקיימת** — שימוש ב־8090, `start_ui_server.sh`, ללא פורט או תהליך חדש.

---

## 1. ארכיטקטורת פתרון מאוחדת

### 1.1 רעיון מרכזי

השרת הנוכחי (`python -m http.server 8090`) **יוחלף** בסקריפט Python מותאם שמשלב:

1. **שרת קבצים סטטיים** — אותה התנהגות כמו `http.server` (ל־HTML, CSS, JS, JSON)
2. **endpoint POST `/log`** — מקבל JSON, מוסיף שורה ל־JSONL, מחזיר 200
3. **endpoint GET `/logs/events`** — מחזיר N שורות אחרונות (לקריאת הלוג ב־UI)

**תוצאה:** אותה הפעלה (`start_ui_server.sh`), אותו פורט (8090), אותה סביבה — עם יכולת לוג מלא.

### 1.2 תרשים זרימה

```
┌─────────────────┐     ┌──────────────────────────────────────────┐
│ pipeline_run.sh │────▶│ append ל־JSONL (ישיר)                     │
│ pipeline.py     │────▶│ append ל־JSONL (ישיר)                     │
└─────────────────┘     │                                          │
                         │  _COMMUNICATION/agents_os/logs/          │
┌─────────────────┐     │    pipeline_events.jsonl                 │
│ Dashboard JS     │────▶│                                          │
│ Roadmap JS       │ POST /log ──────────────────────────────────▶ │
│ Teams JS         │     │                                          │
└─────────────────┘     └──────────────────────────────────────────┘
         │                                    ▲
         │ GET /logs/events?tail=N            │
         └────────────────────────────────────┘
```

### 1.3 תשתית — ללא שינויים מהותיים

| רכיב | שינוי |
|------|--------|
| **פורט** | 8090 (כמו כיום) |
| **סקריפט הפעלה** | `start_ui_server.sh` — יקרא לסקריפט Python החדש במקום `http.server` |
| **Docker** | לא נדרש — השרת רץ locally. אם ייכלל AOS UI ב־Docker בעתיד — הסקריפט יהיה מוכן |
| **DB** | לא נדרש |
| **תלויות** | Python stdlib בלבד — אין pip install נוספים |

---

## 2. רשימת קבצים — חבילת המימוש

### 2.1 קבצים חדשים

| קובץ | תפקיד |
|------|--------|
| `agents_os/scripts/aos_ui_server.py` | שרת משולב: static files + POST /log + GET /logs/events |
| `agents_os/ui/js/pipeline-log.js` | לוגיקת לוג ב־UI: `logEvent()`, קריאה ל־/log |
| `_COMMUNICATION/agents_os/logs/.gitkeep` | תיקיית logs (הלוג עצמו ב־.gitignore) |

### 2.2 קבצים לעדכון

| קובץ | שינוי |
|------|--------|
| `agents_os/scripts/start_ui_server.sh` | הפעלת `aos_ui_server.py` במקום `python -m http.server` |
| `agents_os_v2/orchestrator/pipeline.py` | ייבוא והפעלת `append_event()` בנקודות רלוונטיות |
| `agents_os_v2/orchestrator/log_events.py` | **חדש** — מודול לוג משותף (נקרא מ־pipeline.py וב־aos_ui_server) |
| `pipeline_run.sh` | הוספת `_log_invoke` לפני exec ל־CLI |
| `agents_os/ui/js/pipeline-commands.js` | עטיפה ל־`copyCmd` עם `logEvent("UI_COPY_CMD", ...)` |
| `agents_os/ui/js/pipeline-dashboard.js` | `onDomainSwitch`, `loadAll`, `runProgressCheck` — הוספת logEvent |
| `agents_os/ui/js/pipeline-roadmap.js` | `loadAll`, refresh — הוספת logEvent |
| `agents_os/ui/js/pipeline-teams.js` | `copyPrompt`, `loadState` — הוספת logEvent |
| `agents_os/ui/PIPELINE_ROADMAP.html` | סעיף "Pipeline Event Log" + טעינת pipeline-log.js |
| `agents_os/ui/css/pipeline-roadmap.css` | סגנונות ל־event log table |
| `.gitignore` | הוספת `_COMMUNICATION/agents_os/logs/*.jsonl` (אופציונלי — לפי מדיניות) |

---

## 3. מפרט טכני מפורט

### 3.1 aos_ui_server.py

```python
# מבנה כללי:
# - ThreadingHTTPServer או HTTPServer
# - Custom RequestHandler:
#   - GET / → serve from repo root (כמו http.server)
#   - POST /log → parse JSON, append to LOG_FILE, return 200
#   - GET /logs/events?tail=200 → read last N lines, return JSON array
# - LOG_FILE = REPO/_COMMUNICATION/agents_os/logs/pipeline_events.jsonl
```

**דרישות:**
- CORS: Allow same-origin (כבר מתקיים — אותו origin)
- POST /log: Content-Type application/json, body = אובייקט אירוע
- GET /logs/events: query `tail` (default 100, max 1000)
- כישלון לוג: לא להחזיר 500 — להחזיר 200 ולהתעלם (עקרון "לא משבש")

### 3.2 log_events.py (מודול משותף)

```python
# פונקציות:
# - append_event(event_dict: dict) -> None
# - get_log_mode() -> str  # DEBUG | NORMAL | MINIMAL
# - should_log(event_type: str) -> bool  # לפי mode
```

**מיקום:** `agents_os_v2/orchestrator/log_events.py` או `agents_os/tools/log_events.py`  
**קריאות:** pipeline.py, aos_ui_server.py (בקבלת POST — ולידציה)

### 3.3 pipeline-log.js

```javascript
// פונקציה: logEvent(eventType, detail, extra)
// - בונה אובייקט { ts, source: "ui", event, page, domain, ... }
// - fetch POST ל־/log (relative URL)
// - fire-and-forget — לא מחכים ל־response
// - אם fetch נכשל — שקט (ללא console.error ב-prod)
```

### 3.4 Instrumentation ב־pipeline.py

| נקודה | אירוע | שדות נוספים |
|-------|--------|-------------|
| תחילת `main()` (לפני parse) | CMD_INVOKE | domain, argv |
| לפני `state.advance_gate(PASS)` | STATE_CHANGE | gate_before, gate_after, result=PASS |
| לפני `state.advance_gate(FAIL)` | STATE_CHANGE | gate_before, gate_after, result=FAIL, reason |
| `approve` success | STATE_CHANGE | gate, result=APPROVE |
| `reject` | STATE_CHANGE | gate, result=REJECT, reason |
| `state.save()` (אם השתנה) | STATE_FILE_CHANGE | domain, work_package_id, current_gate |

### 3.5 Instrumentation ב־pipeline_run.sh

```bash
# מיד אחרי domain resolution, לפני case/esac:
LOG_FILE="$REPO/_COMMUNICATION/agents_os/logs/pipeline_events.jsonl"
mkdir -p "$(dirname "$LOG_FILE")"
_log_invoke() {
  printf '%s\n' "{\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"source\":\"pipeline_run\",\"event\":\"CMD_INVOKE\",\"domain\":\"${DOMAIN:-}\",\"cmd\":\"$*\"}" >> "$LOG_FILE"
}
_log_invoke "$@"
```

### 3.6 Instrumentation ב־UI (JS)

| מיקום | אירוע | פרטים |
|-------|--------|-------|
| `copyCmd(text, btn)` | UI_COPY_CMD | command_preview: 80 chars ראשונים |
| `copyCurrentMandate()` | UI_COPY_CMD | detail: mandate |
| `onDomainSwitch(domain)` | UI_DOMAIN_SWITCH | domain |
| `loadAll()` (Refresh) | UI_REFRESH | page |
| `runProgressCheck()` | UI_PROGRESS_CHECK | page |
| `toggleAccordion(id)` | UI_ACCORDION_OPEN | accordion_id (ב־NORMAL ו־DEBUG) |

---

## 4. ממשק תצוגת הלוג (Roadmap)

### 4.1 מיקום

סעיף חדש בעמוד Roadmap, באותו אקורדיון "Map & Legend", מתחת ל־Gate History:

```
├── Portfolio Roadmap
├── Full Gate Sequence
├── Gate History
└── Pipeline Event Log   ← חדש
    ├── טבלה: ts | event | source | domain | detail
    ├── Auto-refresh (5s)
    ├── סינון: event_type, domain
    └── הדגשת FAIL/BLOCK
```

### 4.2 תצוגה

- **טבלה:** `timestamp | event | source | domain | detail`
- **צבעים:** שורות FAIL/REJECT — רקע אדום קל; PASS/APPROVE — ירוק קל
- **איפון:** tail=200 כברירת מחדל; אפשרות להגדלה
- **ייצוא:** כפתור "Copy last N" או "Download JSON"

---

## 5. דגל Production (PIPELINE_LOG_MODE)

| ערך | אירועים שנרשמים |
|-----|-------------------|
| `DEBUG` (default) | הכל — כולל UI_ACCORDION_OPEN, command_preview מלא |
| `NORMAL` | CMD_*, STATE_*, UI_REFRESH, UI_DOMAIN_SWITCH, UI_COPY_CMD (בלי טקסט), UI_PROGRESS_CHECK |
| `MINIMAL` | STATE_CHANGE בלבד (PASS/FAIL/APPROVE/REJECT) |

**מיקום:** `PIPELINE_LOG_MODE` env var, או קובץ `_COMMUNICATION/agents_os/.log_mode` (שורה אחת).

---

## 6. סדר ביצוע מומלץ

| # | משימה | הערות |
|---|--------|-------|
| 1 | יצירת `log_events.py` — append_event, get_log_mode, should_log | מודול עצמאי |
| 2 | יצירת `aos_ui_server.py` — static + POST /log + GET /logs/events | תלוי ב־1 |
| 3 | עדכון `start_ui_server.sh` | קורא ל־2 |
| 4 | Instrumentation ב־pipeline.py | קורא ל־1 |
| 5 | Instrumentation ב־pipeline_run.sh | ישיר לכתיבה |
| 6 | יצירת `pipeline-log.js` + עטיפות copyCmd וכו' | תלוי ב־2 רץ |
| 7 | הוספת סעיף Event Log ב־Roadmap + fetch + render | תלוי ב־2 |
| 8 | בדיקות: הרצת pipeline, לחיצות ב־UI, וידוא לוג | E2E |

---

## 7. בדיקות ואימות

| בדיקה | צעד | תוצאה צפויה |
|-------|-----|--------------|
| 1 | `./pipeline_run.sh --domain agents_os status` | שורת CMD_INVOKE ב־JSONL |
| 2 | `./pipeline_run.sh --domain agents_os pass` | STATE_CHANGE עם result=PASS |
| 3 | Dashboard → Copy command | UI_COPY_CMD ב־JSONL |
| 4 | Dashboard → Domain switch | UI_DOMAIN_SWITCH |
| 5 | Roadmap → Refresh | UI_REFRESH |
| 6 | Roadmap → Event Log section | טבלה מעודכנת, auto-refresh |

---

## 8. .gitignore ו־Retention

| החלטה | ערך מומלץ |
|--------|-------------|
| **logs/** | `_COMMUNICATION/agents_os/logs/*.jsonl` ב־.gitignore — לוג מקומי בלבד |
| **Retention** | גודל מקסימלי: 50,000 שורות (~5MB) — rotation: שינוי שם ל־`pipeline_events.YYYYMMDD.jsonl.old` ו־פתיחת קובץ חדש |
| **Rotation trigger** | בקובץ `log_events.py` — לפני append, אם `os.path.getsize > 5*1024*1024` |

---

## 9. סיכום חבילה

| רכיב | היקף |
|------|------|
| **קבצים חדשים** | 3 (aos_ui_server.py, log_events.py, pipeline-log.js) |
| **קבצים מעודכנים** | 8 (start_ui_server, pipeline.py, pipeline_run.sh, 3× pipeline-*.js, PIPELINE_ROADMAP, CSS) |
| **תלות חדשה** | אין |
| **פורט/תהליך חדש** | אין |
| **DB** | אין |

---

**log_entry | TEAM_61 | PIPELINE_EVENT_LOG_IMPLEMENTATION_PLAN | v1.0.0 | 2026-03-10**
