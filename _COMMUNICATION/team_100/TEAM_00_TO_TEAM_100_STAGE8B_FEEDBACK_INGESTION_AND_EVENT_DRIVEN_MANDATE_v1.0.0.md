---
id: TEAM_00_TO_TEAM_100_STAGE8B_FEEDBACK_INGESTION_AND_EVENT_DRIVEN_MANDATE_v1.0.0
historical_record: true
from: Team 00 (System Designer / Principal)
to: Team 100 (Chief System Architect)
cc: Team 31 (AOS Frontend), Team 51 (AOS QA)
date: 2026-03-27
type: MANDATE — STAGE 8B SPEC
priority: BLOCKING — no BUILD starts without this spec
subject: Stage 8B — Feedback Ingestion Pipeline + Event-Driven Architecture + Operator UX
basis:
  - Team 00 principal decisions (2026-03-27, this session)
  - S003-P011 LOD200 (WP003 — Event-Driven Watcher + SSE Push — PLANNED, not yet built)
  - Team 31 comprehensive status report + Operator Handoff proposal
  - AOS v2 pipeline analysis (verdict file scanning, json_enforcer.py)
  - AOS v3 Stage 7 Event Observability Spec v1.0.2 (15 event types, events table)
  - AOS v3 Stage 8 Module Map Spec v1.0.1 (API contracts)---

# Stage 8B — Full Spec Mandate: Feedback Ingestion + Event-Driven Architecture

---

## §0 — Context and Rationale

### מה חסר היום

המערכת הנוכחית (v2 + מוקאפ v3) עוסקת בשני אספקטים: **הפקת פרומפט** (מה שולחים לצוות) ו**קידום שערים** (advance/fail). החוליה המקשרת ביניהם — מה קורה **לאחר שהצוות סיים לעבוד** ולפני שהמפעיל מקדם את השער — חסרה לחלוטין.

**תהליך מלא כרגע (v2):**
```
מפעיל מפיק פרומפט → מעתיק לצוות → צוות עובד →
[חור] → מפעיל מריץ ./pipeline_run.sh pass → מנוע סורק קבצים → מקדם שער
```

**תהליך מלא הנדרש (v3):**
```
מפעיל מפיק פרומפט → מעתיק לצוות → צוות עובד →
[FEEDBACK INGESTION — 4 מצבים] → מנוע מנתח → דשבורד מציג החלטה + פקודה →
מפעיל מאשר → מנוע מקדם שער → SSE Event → דשבורד מתרענן
```

### מה קיים שנבנה עליו

1. **AOS v3 events table** (Stage 7) — append-only, 15 event types, `verdict`+`reason` fields
2. **AOS v3 API** (Stage 8) — `POST /api/runs/{run_id}/advance` + `/fail` + קרוב לזה
3. **v2 json_enforcer.py** — parsing logic מוכח: JSON block → regex → fallback
4. **S003-P011 WP003 (LOD200)** — SSE push תוכנן, לא בוצע
5. **Team 101 Iron Rule** — "Dashboard = consumer only. לא מחשב ניתוב. לא parse markdown."

---

## §1 — טרמינולוגיה קנונית (Iron Rule: עקביות מלאה בדוק/קוד/UI)

הגדרות אלה נעולות. **אסור לשנות שמות אלה בלי ADR חדש.**

| מונח קנוני | הגדרה | ❌ לא לשתמש |
|---|---|---|
| **Feedback Ingestion** | התהליך המלא של קבלת פלט צוות, ניתוחו והפקת FeedbackRecord | "parsing", "extraction", "verdict scan" |
| **Detection Mode** | אחת מ-4 השיטות לגילוי סיום הצוות + הזנת הפלט | "input method", "source" |
| **FeedbackRecord** | הייצוג המובנה הקנוני של פלט צוות לאחר ingestion | "verdict file", "result" |
| **Operator Handoff** | סקשן הדשבורד: מה קרה + מה לעשות + פקודת CLI | "copilot", "assistant", "guidance panel" |
| **Next Action** | הפקודה/פעולה הבאה הנדרשת מהמפעיל לפי מצב הריצה | "next step", "suggested action" |
| **Previous Event** | האירוע האחרון ב-events table עבור run_id הנוכחי | "last event", "recent event" |
| **SSE Stream** | Server-Sent Events endpoint לדחיפת אירועים בזמן אמת | "webhook", "websocket", "polling" |
| **Ingestion Layer** | שכבה ספציפית בשרשרת ה-ingestion (ראה §2.3) | "fallback" |
| **Principal** | team_00 — בן האדם היחיד | "admin", "user", "operator" (בקוד) |
| **Operator** | Principal בתפקיד ניהול הפיפליין | שימוש ב-UI מותר |

---

## §2 — Feedback Ingestion Pipeline (FIP)

### §2.1 — מטרה

לאפשר למערכת לקבל את פלט הצוות ב-4 מצבי גילוי שונים, לנתח אותו לפי 3 שכבות ingestion, ולהפיק FeedbackRecord מובנה שמזין את Operator Handoff section ואת `POST /api/runs/{run_id}/advance` או `/fail`.

**עיקרון על:** Dashboard = consumer only. כל ה-parsing קורה בשרת (API). הדשבורד שולח גלם → מקבל FeedbackRecord.

### §2.2 — 4 Detection Modes

| Mode | מזהה | הפעלה | תיאור |
|------|------|--------|-------|
| **A** | `CANONICAL_AUTO` | אוטומטי | הצוות עצמו קורא ל-`POST /api/runs/{run_id}/advance` עם `feedback_json` מובנה — **לא נדרש מהמפעיל כלום**. מצב עתידי (execution_mode = AUTOMATIC). |
| **B** | `OPERATOR_NOTIFY` | כפתור "Agent Completed" בדשבורד | המפעיל מודיע — המערכת מחפשת verdict file בנתיב הקנוני. אם מצא: מנתח. אם לא: עולה ל-Mode C. |
| **C** | `NATIVE_FILE` | שדה file path בדשבורד | המפעיל מספק נתיב מלא לקובץ — המערכת קוראת ומנתחת. |
| **D** | `RAW_PASTE` | textarea בדשבורד | המפעיל מדביק את הטקסט המלא שחזר מהצוות — המערכת מנתחת inline. |

**Fallback chain (B→C→D):** Mode B מנסה קובץ → אם נכשל → מציג UI ל-Mode C → אם לא הוזן → מציג UI ל-Mode D. Mode A אינו חלק מה-fallback — הוא independent.

**מה "נכשל" ב-Mode B:**
- הקובץ לא קיים בנתיב הקנוני
- הקובץ קיים אבל timestamp שלו ישן מ-current_gate_started_at (=ישן, לא רלוונטי)
- הקובץ קיים אבל לא ניתן לנתח (ראה §2.3)

### §2.3 — 3 Ingestion Layers

כל mode (B/C/D) מריץ את אותה שרשרת 3 שכבות parsing:

| שכבה | מזהה | לוגיקה | Output אם הצליח |
|------|------|---------|----------------|
| **IL-1** | `JSON_BLOCK` | חיפוש בלוק ` ```json ... ``` ` + ולידציה של schema | FeedbackRecord מלא |
| **IL-2** | `REGEX_EXTRACT` | regex extraction: `verdict:`, `summary:`, `BF-NN:` lines, `route_recommendation:` | FeedbackRecord חלקי (verdict + findings) |
| **IL-3** | `RAW_DISPLAY` | המרה ל-FeedbackRecord עם `verdict=PENDING_REVIEW`, `raw_text` מלא | FeedbackRecord עם raw_text, ללא verdict |

**אחרי IL-3:** אם לא הצליח לחלץ verdict — דשבורד מציג raw text + שואל מפעיל לבחור ידנית PASS/FAIL.

### §2.4 — FeedbackRecord Schema

```json
{
  "run_id":             "string — ULID",
  "detection_mode":     "CANONICAL_AUTO | OPERATOR_NOTIFY | NATIVE_FILE | RAW_PASTE",
  "ingestion_layer":    "JSON_BLOCK | REGEX_EXTRACT | RAW_DISPLAY",
  "verdict":            "PASS | FAIL | PENDING_REVIEW",
  "summary":            "string | null",
  "blocking_findings":  [
    {
      "id":          "string — e.g. BF-01",
      "description": "string",
      "evidence":    "string | null"
    }
  ],
  "route_recommendation": "doc | full | null",
  "raw_text":           "string | null — populated only for IL-3",
  "source_path":        "string | null — file path for Mode B/C",
  "ingested_at":        "ISO-8601",
  "confidence":         "HIGH | MEDIUM | LOW"
}
```

**confidence:**
- `HIGH` = IL-1 (JSON block, schema valid)
- `MEDIUM` = IL-2 (regex, partial extraction)
- `LOW` = IL-3 (raw display, no structured extraction)

### §2.5 — Canonical Verdict File Path (Mode B)

**נתיב קנוני לחיפוש (לפי assignment.team_id):**
```
_COMMUNICATION/team_{team_id}/
  {work_package_id}_VERDICT.md          ← ראשי
  {work_package_id}_GATE_{gate_id}_*.md ← חלופה
  {work_package_id}_COMPLETION_*.md     ← חלופה
```

**fallback paths** — אותם נתיבים עם underscore/hyphen interop (תואם v2 `_verdict_candidates()`).

### §2.6 — API Endpoints חדשים ל-FIP

#### POST /api/runs/{run_id}/feedback — Ingest feedback

**Request:**
```json
{
  "detection_mode": "OPERATOR_NOTIFY | NATIVE_FILE | RAW_PASTE",
  "file_path":      "string | null — required for NATIVE_FILE",
  "raw_text":       "string | null — required for RAW_PASTE"
}
```

**Response 200:**
```json
{
  "feedback_record": { ...FeedbackRecord... },
  "proposed_action": "ADVANCE | FAIL | MANUAL_REVIEW",
  "next_action":     { ...NextAction... }
}
```

**Errors:**

| Code | HTTP | Condition |
|------|------|-----------|
| `INVALID_STATE` | 409 | run.status ≠ IN_PROGRESS |
| `FILE_NOT_FOUND` | 404 | Mode B/C: path doesn't exist |
| `INGESTION_FAILED` | 422 | All 3 layers failed to produce any output |
| `FEEDBACK_ALREADY_INGESTED` | 409 | feedback already pending for this run (idempotency) |

**Delegate chain:** `api.py` → `management/use_cases.py:ingest_feedback()` → `audit/ingestion.py:FeedbackIngestor` (new module)

#### POST /api/runs/{run_id}/feedback/clear — Clear pending feedback

Clears `PENDING_REVIEW` feedback so operator can re-ingest. Returns 200 OK.

---

## §3 — Operator Handoff UI Spec (§6.1.D)

### §3.1 — Layout

**Visibility:** הסקשן מוצג רק כשstatus ∈ {IN_PROGRESS, CORRECTION, PAUSED}. מוסתר ב-IDLE ו-COMPLETE.

**Position:** בין ASSEMBLED PROMPT לבין ACTIONS.

**Section name:** `OPERATOR HANDOFF`

### §3.2 — תת-סקשנים

#### A. PREVIOUS — אחרון בלדג'ר

```
PREVIOUS                                              (last event for this run)
──────────────────────────────────────────────────────
event_type:  GATE_FAILED_ADVISORY           [badge — amber]
occurred_at: 2026-03-27T14:03:12Z  (3 minutes ago)
actor:       team_90
gate/phase:  GATE_3 / phase_3_1
verdict:     ADVISORY
reason:      Token budget exceeds recommended threshold (AD-S6-07)
```

**מקור:** `GET /api/history?run_id={run_id}&limit=1&order=desc`
**שדות:** event_type (badge), occurred_at (relative + absolute tooltip), actor_team_id (team label), gate_id/phase_id, verdict, reason

#### B. NEXT — פעולה הבאה

```
NEXT                                              (computed from current state)
──────────────────────────────────────────────────────
[ Agent Completed ]   — click to trigger Feedback Ingestion (Mode B)
[ Provide File ]      — Mode C: file path input
[ Paste Text ]        — Mode D: paste textarea

— OR — when feedback is ingested and verdict = PASS:
↳ Advance to GATE_4 / phase_4_1 | actor: team_21

— OR — when verdict = FAIL:
↳ Fail GATE_3 | route: doc | blocking: 2 findings
```

**חוקי Next Action** (rule-based, server-computed, חלק מ-`GET /api/state` response):

| מצב | Next Action |
|-----|-------------|
| IN_PROGRESS, no feedback | Show 3 detection mode buttons |
| IN_PROGRESS, feedback ingested, verdict=PASS | Show "Confirm Advance" + gate/phase info |
| IN_PROGRESS, feedback ingested, verdict=FAIL | Show "Confirm Fail" + blocking findings count |
| IN_PROGRESS, feedback=PENDING_REVIEW | Show raw text + manual PASS/FAIL buttons |
| IN_PROGRESS, is_human_gate=true | Show "APPROVE" as primary (not feedback flow) |
| PAUSED | Show "Resume Run" |
| CORRECTION | Show "Resubmit" + current cycle count |

#### C. CLI COMMAND — פקודת הטרמינל

```
CLI COMMAND                                           (copy and run)
──────────────────────────────────────────────────────
$ POST /api/runs/01JQX...BCDE/advance
  {
    "verdict": "PASS",
    "summary": "Team 90 QA review complete — 0 blockers"
  }

                              [ Copy CLI ]   (copies the curl equivalent)
```

**מקור:** computed from feedback_record + run state
**פורמט:** curl command המוכן להרצה:
```bash
curl -X POST http://localhost:8082/api/v1/runs/01JQX.../advance \
  -H "X-API-Key: {team_api_key}" \
  -H "Content-Type: application/json" \
  -d '{"verdict":"PASS","summary":"..."}'
```

**Copy CLI:** מעתיק את הפקודה המלאה ל-clipboard עם toast notification.

**fallback כשאין feedback:** מציג את פקודת `POST /api/runs/{run_id}/feedback` (Mode B notification).

### §3.3 — Feedback Ingestion Flow in UI

כשמפעיל לוחץ **[Agent Completed]** (Mode B):

```
1. POST /api/runs/{run_id}/feedback { detection_mode: "OPERATOR_NOTIFY" }
2. Dashboard shows: "Searching for verdict file..." (spinner)
3a. Success (IL-1/IL-2, confidence HIGH/MEDIUM):
    ↳ PREVIOUS section updates with last event
    ↳ NEXT section shows: "PASS confirmed" / "FAIL — 2 blocking findings"
    ↳ CLI COMMAND section populates with exact curl
4a. Failure (IL-3 or no file):
    ↳ Show fallback options: [Provide File Path] [Paste Feedback Text]
```

כשלוחץ **[Provide File Path]** (Mode C):
```
1. Show inline input: "File path:" [ ___________________________ ]  [ Parse ]
2. POST /api/runs/{run_id}/feedback { detection_mode: "NATIVE_FILE", file_path: "..." }
3. Same success/failure flow as above
```

כשלוחץ **[Paste Feedback Text]** (Mode D):
```
1. Show textarea (max 10000 chars)
2. [ Parse Feedback ] button
3. POST /api/runs/{run_id}/feedback { detection_mode: "RAW_PASTE", raw_text: "..." }
4. Same flow
```

**Confidence indicator** (IL-3 / PENDING_REVIEW):
```
⚠️ Low confidence parsing. Please select verdict manually:
[ ✓ Mark as PASS ]   [ ✗ Mark as FAIL ]
reason: (optional) [____________________]
```

### §3.4 — חיבור ל-API State

`GET /api/state` response מורחב (Stage 8B):
```json
{
  ...existing fields...,
  "previous_event": {
    "event_type": "string",
    "occurred_at": "ISO-8601",
    "actor_team_id": "string",
    "gate_id": "string",
    "phase_id": "string | null",
    "verdict": "string | null",
    "reason": "string | null"
  },
  "pending_feedback": {
    "has_pending": "boolean",
    "feedback_record": "FeedbackRecord | null",
    "proposed_action": "ADVANCE | FAIL | MANUAL_REVIEW | null"
  },
  "next_action": {
    "type": "AWAIT_FEEDBACK | CONFIRM_ADVANCE | CONFIRM_FAIL | MANUAL_REVIEW | HUMAN_APPROVE | RESUME",
    "label": "string — human-readable (e.g. 'Advance to GATE_4 / phase_4_1')",
    "target_gate": "string | null",
    "target_phase": "string | null",
    "blocking_count": "integer | null"
  }
}
```

---

## §4 — §6.1.E — Verdict/Reason Input (Advance/Fail forms)

### §4.1 — כש-verdict מגיע מ-FeedbackRecord

הטפסים pre-filled מה-FeedbackRecord. המפעיל מאשר או עורך:

**ADVANCE form (pre-filled):**
```
Confirm Advance → GATE_4 / phase_4_1
──────────────────────────────────────
Summary:  [Team 90 QA review complete — 0 blockers     ]  (editable)
Verdict:  [PASS ▼]  (locked if from CANONICAL_AUTO/JSON_BLOCK)

                            [ Cancel ]  [ Confirm Advance → ]
```

**FAIL form (pre-filled):**
```
Confirm Fail — GATE_3
──────────────────────────────────────
Blocking findings from ingestion (2):
  • BF-01: Template not found for GATE_3/phase_3_1 | evidence: builder.py:143
  • BF-02: Routing rule gap — no match for domain agents_os, variant TRACK_FOCUSED

Reason:  [2 blocking findings — template gap + routing rule     ]  (editable)
Route:   [doc ▼]  (doc / full — pre-filled from route_recommendation)

                            [ Cancel ]  [ Confirm Fail → ]
```

### §4.2 — כש-feedback לא הוזן (manual)

**ADVANCE button:**
```
[ Advance Gate ↓ ]
  ↓ expands inline:
Summary (optional): [_________________________________]
                                    [ Confirm Advance ]
```

**FAIL button:**
```
[ Fail Gate ↓ ]
  ↓ expands inline:
Reason* (required): [_________________________________]
Route:              [doc ▼]
                                      [ Confirm Fail ]
```

**עיקרון:** ADVANCE summary = optional. FAIL reason = required (ולידציה ב-`POST /api/runs/{run_id}/fail`).

---

## §5 — §6.1.F — CORRECTION Blocking Findings Display

**כשstatus = CORRECTION**, הוסף section מעל OPERATOR HANDOFF:

```
CORRECTION IN PROGRESS — cycle 2 of 3
──────────────────────────────────────
Blocking findings from last GATE_FAILED_BLOCKING:
  [occurred_at: 2026-03-26T09:12:00Z — GATE_3 / phase_3_1 — team_90]

  • BF-01: Template not found for GATE_3/phase_3_1 | evidence: builder.py:143
  • BF-02: Routing rule gap — no match for domain agents_os

assigned_team: team_21 — AOS Backend
correction_cycle_count: 2
max_correction_cycles: 3  (from policy: max_correction_cycles)
```

**מקור:** `GET /api/history?run_id={run_id}&event_type=GATE_FAILED_BLOCKING&limit=1`
**extract:** `payload_json.blocking_findings[]`, `reason`, `gate_id`, `occurred_at`, `actor_team_id`

---

## §6 — Event-Driven Architecture: SSE Stream

### §6.1 — ההחלטה

**S003-P011 WP003** (LOD200 2026-03-19) תכנן SSE push לdashboard. הייתה דחייה של WP002 מ-P011 אבל לא של WP003 עצמו. בv3 — SSE היא גישה נכונה ונדרשת.

**החלטה:** SSE Stream נכלל ב-BUILD Phase של AOS v3. **לא** BUILD blocker לשאר הממשק — אבל חייב להיות מיושם ב-BUILD כדי שה-Operator Handoff יתפקד ב-real-time.

### §6.2 — SSE Endpoint

**`GET /api/events/stream`** — Server-Sent Events

**Query params:**
- `run_id` (optional) — filter by run
- `domain_id` (optional) — filter by domain

**Response:** `text/event-stream`

```
event: pipeline_event
data: {"event_id":"01JQX...","event_type":"GATE_PASSED","run_id":"...","occurred_at":"...","gate_id":"GATE_3","actor_team_id":"team_90","verdict":"PASS"}

event: heartbeat
data: {"ts":"ISO-8601"}

event: run_state_changed
data: {"run_id":"...","new_status":"CORRECTION","previous_status":"IN_PROGRESS"}
```

**Event types pushed via SSE:**
- כל 15 event types מ-Stage 7 (ב-format מינימלי)
- `run_state_changed` — כשstatus ה-run משתנה
- `feedback_ingested` — כש-FeedbackRecord חדש נוצר
- `heartbeat` — כל 30 שניות (prevent timeout)

### §6.3 — Dashboard Subscription

**Pipeline View** מתחבר ל-SSE stream אחרי טעינת דף:
```javascript
const evtSource = new EventSource('/api/events/stream?run_id={run_id}');
evtSource.addEventListener('pipeline_event', (e) => {
    const evt = JSON.parse(e.data);
    // 1. Update PREVIOUS event section
    // 2. Re-fetch /api/state if status changed
    // 3. If feedback_ingested: update NEXT section
});
evtSource.addEventListener('run_state_changed', (e) => {
    // Force full /api/state refresh
    refreshState();
});
```

**History View** גם מתחבר (מעדכן את הטבלה ב-real-time).

**Polling fallback:** אם SSE connection נכשל (network error) → fallback לpolling כל 15 שניות עם indicator "polling (no SSE)".

### §6.4 — Server Implementation

**Module:** `audit/sse.py` (new module under audit/)

```python
class SSEBroadcaster:
    """Thread-safe event broadcaster for SSE connections."""

    def broadcast(self, event: EventRecord) -> None:
        """Called by machine.py after every event INSERT (AD-S7-01 atomic TX)."""
        ...

    def subscribe(self, run_id: Optional[str], domain_id: Optional[str]) -> AsyncIterator[str]:
        """Returns async generator of SSE-formatted strings."""
        ...
```

**Integration point:** `machine.py` אחרי `INSERT INTO events` (באותו TX context) — מפעיל `broadcaster.broadcast(event)`.

**Implementation approach:** Python `asyncio.Queue` per subscriber + FastAPI `StreamingResponse`. לא נדרש Redis/message broker ב-v3.0.

---

## §7 — §6.4 Teams Page — Engine Configuration (עריכה)

**החלטה (D-04 מהסינתזה):** Engine field ב-Teams page = **editable** per team. SSOT = `teams` DB table (שדה `engine`). לא `definition.yaml` — engine הוא runtime attribute.

**UI addition ב-Teams page:**

בcontext generator, Layer 1 — הוסף:
```
engine:   [ cursor ▼ ]    [ Save ]
          (cursor / claude_code / codex / gemini / human)
```

**כשSave נלחץ:** `PUT /api/teams/{team_id}/engine { "engine": "claude_code" }`
**Toast:** "Engine updated: team_21 → claude_code"

**New API endpoint: PUT /api/teams/{team_id}/engine**

Request: `{ "engine": "string — cursor|claude_code|codex|gemini|human" }`
Response 200: `{ "team_id": "string", "engine": "string", "updated_at": "ISO-8601" }`
Errors: `INVALID_ENGINE` (400), `NOT_PRINCIPAL` (403 — team_00 only), `TEAM_NOT_FOUND` (404)

**Authorization:** שינוי engine = team_00 only (AD-S8A-03 pattern).

---

## §8 — §6.2 History Page — Repositioned as Analytics

### §8.1 — מיצוב מחדש

History = **Observability Analytics** — לא רק לוג. הדף מספק:
1. **Event Timeline** — ציר זמן ויזואלי של אירועי run
2. **Event Log** — הטבלה הנוכחית (קיימת)
3. **Actor Breakdown** — כמה אירועים per actor
4. **Event Type Distribution** — pie/bar (mock)
5. **Correction Cycle Analysis** — מה גרם לכל cycle

### §8.2 — הוספות לdaf history.html

**Run Selector** (header):
```
Run:  [ 01JQX...BCDE (S003-P002-WP001 — IN_PROGRESS) ▼ ]    [ Apply ]
```
מקור: `GET /api/runs` — מאפשר ניתוח כל run.

**Event Timeline** (חדש — mock):
```
GATE_0────────GATE_1────────GATE_2────────GATE_3──▶ (current)
  ✓ RUN_INITIATED  ✓ GATE_PASSED  ✓ GATE_PASSED  ✗ GATE_FAILED  ↻ CORRECTION
  team_11          team_21         team_61         team_90         team_21
```

**run_id filter** (H-01 תיקון):
```
Run ID: [ _________________________ ]  (filter event log by specific run)
```
Portfolio "View History" link → `/history?run_id={run_id}` → auto-fills this filter.

### §8.3 — History API amendment

`GET /api/history` — הוסף query param:
- `run_id`: filter events by specific run (exact match)

---

## §9 — New/Amended API Endpoints (Stage 8B complete list)

| Endpoint | Method | Type | Description |
|---|---|---|---|
| `/api/runs/{run_id}/feedback` | POST | NEW | Ingest feedback (FIP) |
| `/api/runs/{run_id}/feedback/clear` | POST | NEW | Clear pending feedback |
| `/api/teams/{team_id}/engine` | PUT | NEW | Update team engine |
| `/api/events/stream` | GET | NEW | SSE stream |
| `/api/runs/{run_id}/advance` | POST | AMEND | Add `summary` (optional) body field |
| `/api/runs/{run_id}/fail` | POST | AMEND | `reason` required (was optional) |
| `/api/state` | GET | AMEND | Add `previous_event`, `pending_feedback`, `next_action` to response |
| `/api/history` | GET | AMEND | Add `run_id` query param |

---

## §10 — New Error Codes (Stage 8B)

| Code | HTTP | Endpoint | Semantic |
|---|---|---|---|
| `FILE_NOT_FOUND` | 404 | POST /feedback | Mode B/C: path doesn't exist |
| `INGESTION_FAILED` | 422 | POST /feedback | All 3 ingestion layers failed |
| `FEEDBACK_ALREADY_INGESTED` | 409 | POST /feedback | Idempotency: feedback already pending |
| `INVALID_ENGINE` | 400 | PUT /engine | Engine value not in valid set |

**Updated total:** 42 (Stage 8A) + 4 (Stage 8B) = **46 total**.

---

## §11 — New Module: audit/ingestion.py

בנוסף ל-`audit/sse.py` מ-§6.4, נדרש:

```python
# agents_os_v3/audit/ingestion.py

class FeedbackIngestor:
    """3-layer feedback extraction pipeline."""

    def ingest(self, source: IngestSource) -> FeedbackRecord:
        """Try IL-1 → IL-2 → IL-3. Returns FeedbackRecord with confidence."""
        ...

    def _try_json_block(self, text: str) -> Optional[FeedbackRecord]:
        """IL-1: Extract ```json ... ``` block + validate schema."""
        ...

    def _try_regex_extract(self, text: str) -> Optional[FeedbackRecord]:
        """IL-2: Regex extraction of verdict, summary, BF-NN lines."""
        ...

    def _raw_display(self, text: str) -> FeedbackRecord:
        """IL-3: Raw display fallback. verdict=PENDING_REVIEW."""
        ...

    def _find_canonical_verdict_file(self, run_id: str, gate_id: str,
                                     team_id: str, wp_id: str) -> Optional[Path]:
        """Mode B: Search canonical paths for verdict file."""
        ...
```

**Integration:** `use_cases.py:ingest_feedback()` → `FeedbackIngestor.ingest()` → store to `pending_feedbacks` (new table or `state_payload_json` on runs).

---

## §12 — DDL Additions (Stage 8B)

### §12.1 — `pending_feedbacks` table

```sql
CREATE TABLE pending_feedbacks (
    id                  TEXT NOT NULL,
    run_id              TEXT NOT NULL,
    detection_mode      TEXT NOT NULL,
    ingestion_layer     TEXT NOT NULL,
    verdict             TEXT NOT NULL,  -- PASS|FAIL|PENDING_REVIEW
    summary             TEXT,
    blocking_findings_json TEXT,        -- JSON array of BF objects
    route_recommendation TEXT,
    raw_text            TEXT,
    source_path         TEXT,
    confidence          TEXT NOT NULL,  -- HIGH|MEDIUM|LOW
    ingested_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cleared_at          TIMESTAMPTZ,
    CONSTRAINT pk_pending_feedbacks PRIMARY KEY (id),
    CONSTRAINT fk_pf_run FOREIGN KEY (run_id) REFERENCES runs(id) ON DELETE CASCADE,
    CONSTRAINT chk_pf_verdict CHECK (verdict IN ('PASS','FAIL','PENDING_REVIEW')),
    CONSTRAINT chk_pf_confidence CHECK (confidence IN ('HIGH','MEDIUM','LOW')),
    CONSTRAINT chk_pf_detection_mode CHECK (detection_mode IN (
        'CANONICAL_AUTO','OPERATOR_NOTIFY','NATIVE_FILE','RAW_PASTE'
    ))
);

CREATE INDEX idx_pf_run_id ON pending_feedbacks(run_id);
CREATE INDEX idx_pf_ingested_at ON pending_feedbacks(ingested_at);
```

---

## §13 — Architectural Decisions (Stage 8B)

| AD ID | Decision | Locked In |
|-------|----------|-----------|
| **AD-S8B-01** | Feedback Ingestion Pipeline (FIP) = 4 Detection Modes × 3 Ingestion Layers. All parsing server-side. Dashboard = consumer only (Team 101 Iron Rule). | §2 |
| **AD-S8B-02** | FeedbackRecord is the canonical output of FIP. Stored in `pending_feedbacks` table. Used to pre-fill Advance/Fail forms. | §2.4 |
| **AD-S8B-03** | Mode B canonical verdict file search follows v2 `_verdict_candidates()` path logic with hyphen/underscore interop. | §2.5 |
| **AD-S8B-04** | SSE Stream included in BUILD phase. Polling fallback (15s) when SSE unavailable. No external message broker (asyncio.Queue per subscriber). | §6 |
| **AD-S8B-05** | `GET /api/state` response extended with `previous_event`, `pending_feedback`, `next_action` — single-call for full Operator Handoff render. | §3.4 |
| **AD-S8B-06** | Team engine = editable, SSOT = `teams` DB table. `definition.yaml` is NOT SSOT for `engine` field. team_00 only. | §7 |
| **AD-S8B-07** | History page = Observability Analytics. `run_id` query param added to `GET /api/history`. | §8 |
| **AD-S8B-08** | FAIL reason = required field. ADVANCE summary = optional. Server validates at `POST /api/runs/{run_id}/fail`. | §4.2 |
| **AD-S8B-09** | `next_action` is computed server-side from run state. Dashboard renders it — does NOT compute it. | §3.2 |
| **AD-S8B-10** | SSE event `feedback_ingested` pushed to dashboard after every successful `POST /api/runs/{run_id}/feedback`. | §6.2 |

---

## §14 — Impact Analysis on Existing Stages

| Stage | Spec | Impact | Action Required |
|-------|------|--------|----------------|
| Stage 2 (State Machine) | v1.0.2 | `pending_feedback` state is NOT a RunStatus. Ingestion is a side effect, not a state transition. | No amendment needed — add note in §12 or module commentary |
| Stage 7 (Event Observability) | v1.0.2 | `feedback_ingested` is a new SSE event type — NOT in the 15 `events` table event types (it's a system notification, not a domain event). | Clarify in §6 Stage 8B — SSE-only event, not persisted to events table |
| Stage 8 (Module Map) | v1.0.1 | 2 new modules: `audit/ingestion.py`, `audit/sse.py`. `use_cases.py` gets `ingest_feedback()` UC. | Amend §1 directory structure, §3 interface contracts, §7 integration tests |
| Stage 8A (UI Spec) | v1.0.2 | §6.1 gets §6.1.D + §6.1.E + §6.1.F. §6.2 gets analytics additions. §6.4 gets engine editor. | This document IS Stage 8B — additive to Stage 8A |

---

## §15 — Mockup Update Scope (Team 31 — post Stage 8B approval)

Team 31 updates the mockup AFTER Stage 8B spec is gate-approved. Updates:

| Page | Change |
|------|--------|
| `index.html` | Add OPERATOR HANDOFF section (§3.2) with all 3 sub-sections (PREVIOUS/NEXT/CLI) |
| `index.html` | Add Feedback Ingestion flow (3 detection mode buttons + mode-specific UIs) |
| `index.html` | Add CORRECTION blocking findings section (§5) |
| `index.html` | Advance/Fail forms: pre-fill + expand/collapse (§4) |
| `index.html` | Add SSE connection indicator in header (green dot = SSE connected, grey = polling) |
| `history.html` | Add Run Selector, Event Timeline (mock), run_id filter field |
| `teams.html` | Engine field = editable dropdown + Save button |
| `app.js` | Expand MOCK_STATE to include `previous_event`, `pending_feedback`, `next_action` per scenario |
| `app.js` | Add scenario: "CORRECTION — blocking findings visible" |
| `app.js` | Add scenario: "Feedback ingested — PASS pending confirm" |
| `app.js` | Add scenario: "Feedback ingested — FAIL pending confirm (2 findings)" |
| `app.js` | Add scenario: "IL-3 raw display — manual verdict required" |

**New scenarios total:** 4 Pipeline + 2 History = 6 new scenarios.

---

## §16 — Integration Tests (Stage 8B additions)

| TC | Description |
|----|-------------|
| IT-15 | `POST /feedback` Mode B: canonical path exists, IL-1 PASS → FeedbackRecord verdict=PASS confidence=HIGH |
| IT-16 | `POST /feedback` Mode B: file not found → fallback offered (response includes `fallback_required: true`) |
| IT-17 | `POST /feedback` Mode D: raw paste with BF-NN lines → IL-2 extracts 2 findings confidence=MEDIUM |
| IT-18 | `POST /advance` with pre-filled summary from FeedbackRecord → events table shows GATE_PASSED with verdict+reason |
| IT-19 | `POST /fail` without reason → 400 MISSING_REASON |
| IT-20 | SSE stream: trigger GATE_PASSED → SSE event received within 1 second |
| IT-21 | `GET /state` after feedback ingestion → `pending_feedback.has_pending=true` + `next_action.type=CONFIRM_ADVANCE` |
| IT-22 | `PUT /teams/{team_id}/engine` as team_21 (non-principal) → 403 NOT_PRINCIPAL |

---

## §17 — Sequencing

```
Stage 8B Spec (this mandate → Team 100)
    ↓ Team 190 review → Team 00 gate approval
Team 31: Mockup update (§15 scope)
    ↓
Team 51: QA (§16 integration test TCs as acceptance criteria)
    ↓
Team 00: Final UX sign-off
    ↓
BUILD begins (Teams 21, 61, 11)
```

**Note:** DDL v1.0.2 mandate to Team 111 must include: ideas table + work_packages table (Stage 8A) + pending_feedbacks table (Stage 8B) + DDL-ERRATA-01. Issue to Team 111 after this spec is gate-approved.

---

## §18 — Pre-submission Checklist for Team 100

- [ ] §2: FeedbackRecord schema complete with all fields
- [ ] §2.2: 4 Detection Modes with trigger mechanism and fallback chain
- [ ] §2.3: 3 Ingestion Layers with exact parsing logic references
- [ ] §2.6: `POST /api/runs/{run_id}/feedback` full contract
- [ ] §3: Operator Handoff UI spec (3 sub-sections) with data sources
- [ ] §3.4: `GET /api/state` response extension (3 new fields)
- [ ] §4: Advance/Fail forms — pre-fill behavior + manual fallback
- [ ] §5: CORRECTION blocking findings display
- [ ] §6: SSE endpoint + server implementation + dashboard subscription
- [ ] §7: Teams engine edit — endpoint + authorization
- [ ] §8: History Analytics additions + run_id filter
- [ ] §9: All 8 new/amended API endpoints
- [ ] §10: 4 new error codes (total 46)
- [ ] §11: `audit/ingestion.py` interface contract
- [ ] §12: `pending_feedbacks` DDL
- [ ] §13: AD-S8B-01 through AD-S8B-10 registry
- [ ] §14: Impact analysis confirmed (Stage 7 SSE-only clarification)
- [ ] §15: Mockup scope clearly stated for Team 31
- [ ] §16: 8 integration test cases (IT-15 through IT-22)
- [ ] Zero open questions — all decisions locked
- [ ] Consistent terminology throughout (§1 glossary)

---

**log_entry | TEAM_00 | STAGE8B_MANDATE | ISSUED | team_100 | 2026-03-27**
