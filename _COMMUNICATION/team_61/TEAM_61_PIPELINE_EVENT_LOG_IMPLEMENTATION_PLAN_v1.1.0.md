# Team 61 — Pipeline Event Log — תוכנית מימוש (מעודכנת לפי משוב אדריכלי)

**date:** 2026-03-10  
**historical_record:** true  
**id:** TEAM_61_PIPELINE_EVENT_LOG_IMPLEMENTATION_PLAN  
**version:** 1.1.0  
**owner:** Team 61  
**status:** REVISED — כפוף לאישור חוזר  
**project_domain:** AGENTS_OS  
**supersedes:** v1.0.0  
**incorporates:** TEAM_00_TO_TEAM_61_EVENT_LOG_ARCHITECTURAL_FEEDBACK_v1.0.0.md  
**connection:** S003-P007 Phase 1 — AOS Pipeline Server Foundation

---

## 0. הקשר אדריכלי (חובה לקריאה)

### 0.1 עיקרון מנחה

`aos_ui_server.py` **אינו** שרת לוג בלבד. זהו **Phase 1 של S003-P007** — AOS Pipeline Server.  
יש לתכנן אותו כבסיס להרחבה מלאה (state live, pipeline commands, WebSocket) בלי רי־פקטור.

### 0.2 D-4 WP Flow (IR-CEV-05)

```
Team 00+100: spec → [GATE_0: Team 190] → Team 61: implement → [GATE_4: Team 51 QA] 
    → [GATE_5: Team 190] → [GATE_6: Team 100] → [GATE_7: Nimrod] → GATE_8
```

Team 61 מיישם בלבד. ולידציה ע"י Team 51 (GATE_4). אין self-validation.

---

## 1. פעולות מיידיות (לפני התחלת Event Log)

### 1.1 Action 1 — תיקון state.py

**קובץ:** `agents_os_v2/orchestrator/state.py`

| שדה | לפני | אחרי |
|-----|------|------|
| `work_package_id` | `"REQUIRED"` | `""` |
| `stage_id` | `"S002"` (hardcoded) | `""` |

**הוספה:**
```python
def is_initialized(self) -> bool:
    return bool(self.work_package_id) and self.work_package_id != "REQUIRED"
```

**עדכון save():** Guard — לא לכתוב state לא מאותחל.

### 1.2 Action 2 — מחיקת Phantom tiktrack JSON

**קובץ למחיקה:** `_COMMUNICATION/agents_os/pipeline_state_tiktrack.json`

**סיבה:** TikTrack במצב IDLE — אין WP פעיל. הקובץ מכיל `work_package_id: "REQUIRED"` (sentinel שבור).

### 1.3 Action 3 — state_reader.py

הוספת `read_wsm_identity_fields()` ו־`detect_drift()` — בסקופ WP003 (CS-01, CS-04). Event Log תלוי בזה להפקת WSM_UPDATE / DRIFT_DETECTED.

---

## 2. ארכיטקטורת שרת — aos_ui_server.py

### 2.1 מבנה קבצים

```
agents_os_v2/
├── server/
│   ├── __init__.py
│   ├── aos_ui_server.py        ← Starlette application (main)
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── health.py            ← GET /api/health
│   │   ├── events.py            ← POST /api/log/event + GET /api/log/events
│   │   └── state_stub.py        ← Phase 2 stubs (501)
│   └── models/
│       ├── __init__.py
│       └── event.py             ← PipelineEvent v2 + EventType enum
```

### 2.2 API Surface — Phase 1 (מימוש)

| Method | Path | תיאור |
|--------|------|-------|
| GET | / | index → redirect או serve dashboard entry |
| GET | /api/health | server health + log file integrity |
| POST | /api/log/event | ingest pipeline event (JSON body) |
| GET | /api/log/events | retrieve events (query: domain, gate, limit) |
| GET | /static/{path} | serve static files (CSS, JS, HTML) |

### 2.3 Phase 2 Stubs (501 Not Implemented)

| Path | Response |
|------|----------|
| GET /api/state/{domain} | 501 + JSON `{"error":"not_implemented","planned_for":"S003-P007",...}` |
| POST /api/pipeline/{domain}/{command} | 501 |
| GET /api/state/drift | 501 |

### 2.4 תצורה

```python
SERVER_PORT = 8090
API_PREFIX = "/api"
LOG_FILE = "_COMMUNICATION/agents_os/logs/pipeline_events.jsonl"
STATIC_DIR = "agents_os/ui"
```

**תלות:** Starlette (כבר ב־stack).

---

## 3. Event Schema v2 — Canonical

### 3.1 שדות חובה

```json
{
  "timestamp":      "2026-03-16T14:32:01Z",   // ISO-8601 UTC
  "pipe_run_id":    "a7f209c1",
  "event_type":     "GATE_PASS",               // EventType enum
  "domain":         "agents_os",               // agents_os | tiktrack | global
  "stage_id":       "S002",
  "work_package_id": "S002-P005-WP003",        // מ-WSM — לא מ-JSON
  "gate":           "GATE_0",                  // null אם לא gate-related
  "agent_team":     "Team 190",
  "severity":       "info",                    // info | warn | error | critical
  "description":    "GATE_0 validation PASS — WP003 approved",
  "metadata":       {}
}
```

**חוקי ברזל:**
- `work_package_id` — תמיד מ־WSM `active_work_package_id`. לא מ־pipeline_state JSON.
- `stage_id` — תמיד מ־WSM `active_stage_id`.
- `timestamp` — תמיד UTC, ISO-8601.
- `domain` — `"global"` לאירועים שחלים על שני הדומיינים.

### 3.2 EventType Enum (מלא)

```python
# Gate lifecycle
GATE_ENTER, GATE_PASS, GATE_FAIL, GATE_BLOCK, GATE_ADVANCE_BLOCKED

# Pipeline lifecycle
INIT_PIPELINE, PIPELINE_PASS, PIPELINE_FAIL, PIPELINE_APPROVE, PIPELINE_RESET

# State management
WSM_UPDATE, DRIFT_DETECTED, DRIFT_RESOLVED

# Artifact lifecycle
ARTIFACT_STORE, ARTIFACT_VALIDATE

# Server lifecycle
SERVER_START, SERVER_STOP, SERVER_ERROR
```

### 3.3 Metadata לפי Event Type

| Event Type | שדות metadata חובה |
|------------|---------------------|
| GATE_PASS/FAIL/BLOCK | `verdict_file`, `findings_count`, `blocker_count` |
| INIT_PIPELINE | `initialized_by`, `work_package_id`, `source` |
| WSM_UPDATE | `fields_changed`, `changed_by_team` |
| DRIFT_DETECTED | `wsm_value`, `json_value`, `field`, `domain` |
| ARTIFACT_STORE | `artifact_path`, `artifact_type` |
| GATE_ADVANCE_BLOCKED | `attempted_gate`, `reason`, `blocking_team` |

---

## 4. רשימת קבצים מעודכנת

### 4.1 קבצים חדשים

| קובץ | תפקיד |
|------|--------|
| `agents_os_v2/server/__init__.py` | package |
| `agents_os_v2/server/aos_ui_server.py` | Starlette app |
| `agents_os_v2/server/routes/health.py` | GET /api/health |
| `agents_os_v2/server/routes/events.py` | POST/GET event log |
| `agents_os_v2/server/routes/state_stub.py` | 501 stubs |
| `agents_os_v2/server/models/event.py` | PipelineEvent v2, EventType |
| `agents_os_v2/orchestrator/log_events.py` | append_event, schema v2 |
| `agents_os/ui/js/pipeline-log.js` | logEvent(), fetch ל־/api/log/event |
| `_COMMUNICATION/agents_os/logs/.gitkeep` | תיקייה |

### 4.2 קבצים לעדכון

| קובץ | שינוי |
|------|--------|
| `agents_os_v2/orchestrator/state.py` | fix default, is_initialized(), save guard |
| `agents_os/scripts/start_ui_server.sh` | הפעלת `python3 -m agents_os_v2.server.aos_ui_server` |
| `agents_os_v2/orchestrator/pipeline.py` | instrumentation — כל EventType רלוונטי |
| `pipeline_run.sh` | instrumentation — INIT_PIPELINE, pass, fail, approve |
| `agents_os/scripts/init_pipeline.sh` | instrumentation — INIT_PIPELINE |
| `agents_os/ui/js/pipeline-config.js` | event log endpoint URL |
| `agents_os/ui/js/pipeline-dashboard.js`, `pipeline-roadmap.js`, `pipeline-teams.js` | logEvent wrappers |
| `agents_os/ui/PIPELINE_ROADMAP.html` | Event Log panel (Section 9) |
| `agents_os/ui/css/pipeline-roadmap.css` | סגנונות Event Log |

### 4.3 קובץ למחיקה

| קובץ | סיבה |
|------|------|
| `_COMMUNICATION/agents_os/pipeline_state_tiktrack.json` | phantom state — TikTrack IDLE |

---

## 5. Instrumentation — מיפוי מלא

### 5.1 pipeline.py

| נקודה | EventType | metadata |
|-------|-----------|----------|
| advance_gate PASS | GATE_PASS | verdict_file, findings_count |
| advance_gate FAIL | GATE_FAIL | reason, verdict_file |
| approve success | PIPELINE_APPROVE | gate |
| store_artifact | ARTIFACT_STORE | artifact_path, artifact_type |
| route doc/full | (gate advance) | routing metadata |
| advance blocked (pre-check) | GATE_ADVANCE_BLOCKED | attempted_gate, reason |

### 5.2 pipeline_run.sh

| פעולה | EventType |
|-------|-----------|
| תחילת הרצה | PIPELINE_PASS / PIPELINE_FAIL (לפי תת־פקודה) |
| pass | GATE_PASS (via pipeline.py) |
| fail | GATE_FAIL |
| approve | PIPELINE_APPROVE |
| route | (gate transition) |
| ADVANCE_BLOCKED (artifact missing) | GATE_ADVANCE_BLOCKED |

### 5.3 init_pipeline.sh

| פעולה | EventType |
|-------|-----------|
| הצלחה | INIT_PIPELINE — metadata: work_package_id, source |

### 5.4 log_events.py

- emit WSM_UPDATE כאשר WSM `active_work_package_id` נקרא ב־init
- emit DRIFT_DETECTED כאשר pipeline_state JSON ≠ WSM

---

## 6. דרישות UI — Event Log (Roadmap)

### 6.1 מיקום

פאנל בצד ימין (300px), מתחת ל־Gate History.

### 6.2 פילטרים

```
Domain:  [All | Agents OS | TikTrack | Global]
Gate:    [All | GATE_0 | ... | GATE_8]
Type:    [All | Gate Events | State Events | System]
Limit:   [20 | 50 | 100]
```

### 6.3 תצוגת שורה

```
[timestamp short] [domain badge] [gate badge] [event_type chip] [description]
[agent_team]                                      [severity icon]
```

### 6.4 צבעים

- GATE_PASS: ירוק
- GATE_FAIL / GATE_BLOCK / GATE_ADVANCE_BLOCKED: אדום
- DRIFT_DETECTED: כתום + bold
- DRIFT_RESOLVED: ירוק (מעומעם)
- WSM_UPDATE: כחול
- SERVER_*: אפור
- INIT_PIPELINE: teal

### 6.5 Auto-refresh

Poll `GET /api/log/events?limit=50&domain={active_domain}` כל 10 שניות.  
על אירועים חדשים: scroll לתחתית + הבזקה.

---

## 7. סדר ביצוע

### Phase 1 — מיידי (לפני Event Log)
1. [ ] תיקון state.py (Action 1)
2. [ ] מחיקת pipeline_state_tiktrack.json (Action 2)
3. [ ] אישור/מימוש state_reader WSM identity (WP003 scope)

### Phase 2 — Event Log Server (מקביל ל־WP003)
4. [ ] agents_os_v2/server/ — מבנה + routes + models
5. [ ] log_events.py — schema v2, append
6. [ ] instrumentation — pipeline.py, pipeline_run.sh, init_pipeline.sh
7. [ ] Roadmap UI — panel, filters, colors
8. [ ] start_ui_server.sh — launch aos_ui_server
9. [ ] pipeline-config.js — endpoint
10. [ ] הגשה ל־Team 51 (GATE_4 QA)

---

## 8. STAGE_PARALLEL_TRACKS

WSM יכלול בלוק `STAGE_PARALLEL_TRACKS`. Team 61 חייב לקרוא אותו כאשר:
- מאתחל pipeline state
- מפיק INIT_PIPELINE
- מזהה drift

השדה `agents_os_parallel_track` (פרוזה) — legacy עד WP004. לא authoritative.

---

## 9. Cross-Engine Validation

- Team 61 (Cursor) מייצר קוד → Team 51 (Gemini QA) מאמת.
- אין self-validation כג verdict.
- הגשה ל־GATE_4 עם השלמת מימוש.
- קבלת GATE_4 FAIL — תיקון והגשה מחדש.

---

**log_entry | TEAM_61 | PIPELINE_EVENT_LOG_IMPLEMENTATION_PLAN | v1.1.0_REVISED | 2026-03-10**
