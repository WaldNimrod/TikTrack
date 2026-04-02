---
id: TEAM_00_TO_TEAM_11_AOS_V3_BUILD_WORK_PACKAGE_v1.0.2
historical_record: true
from: Team 00 (Principal — Nimrod)
to: Team 11 (AOS Gateway / Execution Lead)
cc: Team 100 (Chief Architect), Team 21 (AOS Backend), Team 31 (AOS Frontend),
    Team 51 (AOS QA), Team 61 (AOS DevOps), Team 111 (AOS Domain Architect)
date: 2026-03-27
type: BUILD_WORK_PACKAGE — full activation
domain: agents_os
stage: BUILD (post Stage 8B gate close)
branch: aos-v3
supersedes: TEAM_00_TO_TEAM_11_AOS_V3_BUILD_WORK_PACKAGE_v1.0.1
correction_cycle: 2
corrections_v1.0.1:
  - F-01 (T190 BLOCKER): Feedback API unified endpoint
  - F-02 (T190 MAJOR): Module structure aligned to Module Map v1.0.1 + Stage 8B §12.3
  - F-03 (T190 MAJOR): work_packages DDL — id (DB PK); wp_id = API alias only
  - F-04 (T190 MAJOR / T100 CRITICAL): API prefix locked as /api/ (no /v1/)
  - F-05 (T190 MINOR): Error codes — 49 total
corrections_v1.0.2:
  - F-03 (T100 CRITICAL): Port locked to 8090 (not TBD; not 8082)
  - F-05/F-06 (T100 MAJOR): Process Map role declared — Option C (WP = gate ACs; PM = build order)
  - F-09 (T100 MAJOR): cli/pipeline_run.sh assigned to Team 61
  - F-10 (T100 MAJOR): config.html scope expanded — 6 live API endpoints required
  - F-12 (T100 MAJOR): GET /api/feedback listing removed (confirmed absent; clarification note added)
  - F-13 (T100 MEDIUM): DDL v1.0.2 mandate = explicit Gate 0 prerequisite (hard blocker)
  - F-14 (T100 MEDIUM): Error code intermediate count clarified (39→41→49)
  - F-15 (T100 MEDIUM): UC-15 forward reference note added
  - F-17 (T100 MEDIUM): notes→summary rename explicitly annotated in team tasks
authority: Team 00 Constitutional authority---

# AOS v3 — חבילת עבודה מלאה למימוש (BUILD) — v1.0.2

## Canonical Source Lock

| היבט | SSOT | גרסה |
|---|---|---|
| API contracts | `TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.0.md` | Stage 8B v1.1.0 |
| Module structure | `TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.1.md` §1 + Stage 8B §12.3 | Module Map v1.0.1 |
| DDL shape | `TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.2.md` §10 + Stage 8B §13 | Stage 8A+8B |
| Error registry | Stage 7 `TEAM_100_AOS_V3_EVENT_OBSERVABILITY_SPEC_v1.0.2.md` §6.1 + Stage 8B §11 | 39+2+8=49 total |
| State machine | `TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md` | v1.0.2 |
| Use cases | `TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md` (UC-01..UC-14) + Stage 8B §12.4 (UC-15) | v1.0.3 + §12.4 |
| Entity dictionary | `TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md` | v2.0.2 |
| Config page API | Module Map §6.3 | v1.0.1 |

---

## Part A — Layer 1: זהות וסמכות

**Team 11 = AOS Gateway / Execution Lead**
אתה מנהל BUILD של AOS v3. תפקידך:
- קבלת work package זה ופתיחת run ראשון
- הפצת activation packages לצוותי ה-BUILD (21, 31, 61)
- ניהול gate sequence — מ-GATE_0 ועד GATE_5
- דיווח ל-Team 100 (ארכיטקטורה) ול-Team 00 (Principal) בשערים הרלוונטיים

**Engine:** Cursor Composer
**Branch:** `aos-v3` | **Push:** `origin/aos-v3` ישירות

---

## Part B — Layer 2: Iron Rules (10)

| # | כלל | מקור |
|---|---|---|
| **IR-1** | `pipeline_run.sh` **לא בשימוש** למסלול זה. Git commits ישירים ל-`aos-v3`. | Branch work mode v1.1.0 |
| **IR-2** | `agents_os_v2/` **מוקפא לחלוטין** — קריאה כ-reference בלבד; אסור לשנות. | `ARCHITECT_DIRECTIVE_AOS_V3_FILE_INDEX_AND_V2_FREEZE_v1.0.0` |
| **IR-3** | **FILE_INDEX:** כל קובץ ב-`agents_os_v3/` חייב להיות רשום ב-`FILE_INDEX.json` לפני commit. | `ARCHITECT_DIRECTIVE_AOS_V3_FILE_INDEX_AND_V2_FREEZE_v1.0.0` |
| **IR-4** | **Dashboard = consumer only.** כל חישוב ו-`next_action` = server-side בלבד. | AD-S8B-01, AD-S8B-09 |
| **IR-5** | **Financial precision:** NUMERIC(20,8) לכספים; NUMERIC(24,4) ל-market_cap. | KB-001 |
| **IR-6** | **FAIL חייב סיבה.** `fail_gate()` חייב `reason` שאינו ריק. | AD-S6-04 |
| **IR-7** | **Terminology locked.** 8 מונחים קנוניים מ-spec v1.1.0 §1 — אסור להחליפם. | spec v1.1.0 §1 |
| **IR-8** | **Atomic transactions:** כל state transition ב-`machine.py` = DB transaction עם rollback. | AD-S7-01 |
| **IR-9** | **SSE ב-BUILD:** `GET /api/events/stream` חייב להיות מיושם; polling 15s = fallback בלבד. | spec v1.1.0 §6 |
| **IR-10** | **v2 isolation:** AOS v2 לא רץ במקביל לפיתוח v3. | `ARCHITECT_DIRECTIVE_AOS_V3_FILE_INDEX_AND_V2_FREEZE_v1.0.0` §1 |

---

## Part C — Layer 3: קונטקסט

### C.1 — v2 vs v3

| היבט | v2 | v3 |
|---|---|---|
| גילוי סיום סוכן | סריקת קבצים בלבד | 4 Detection Modes (A/B/C/D) + FIP |
| Dashboard סטטוס | polling כל 5s | SSE stream (real-time push) |
| Operator guidance | CLI בלבד | Operator Handoff (PREVIOUS/NEXT/CLI) |
| `next_action` | לא קיים | server-computed (7 types) |
| History | event log פשוט | Analytics: run selector, timeline, run_id filter |
| Teams engine | קבוע ב-YAML | עריך ב-UI (Principal בלבד) |
| Portfolio | לא קיים | WP management + Ideas + gate filter |

### C.2 — Spec Status (כל השלבים CLOSED)

| Stage | Spec file | סטטוס |
|---|---|---|
| 1 (Entities) | `TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md` | ✅ |
| 2 (State Machine) | `TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md` | ✅ |
| 3 (Use Cases) | `TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md` (UC-01..UC-14) | ✅ |
| 4 (DDL) | `TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md` + **DDL v1.0.2 (mandate pending — Gate 0 blocker)** | ✅+⏳ |
| 5 (Routing) | `TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.1.md` | ✅ |
| 6 (Prompting) | `TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.2.md` | ✅ |
| 7 (Events) | `TEAM_100_AOS_V3_EVENT_OBSERVABILITY_SPEC_v1.0.2.md` | ✅ |
| 8 (Module Map) | `TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.1.md` | ✅ |
| 8A (UI) | `TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.2.md` | ✅ |
| 8B (FIP+SSE) | `TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.0.md` | ✅ |
| Mockup | `agents_os_v3/ui/` — 5 pages, UX approved | ✅ |

> **UC-15 note:** UC-15 (`ingest_feedback`) is **not** in UC Catalog v1.0.3 — it is defined in Stage 8B §12.4. Teams referencing the UC Catalog will only find UC-01..UC-14. UC-15 lives in Stage 8B §12.4 exclusively.

> **`notes` → `summary` rename:** Stage 8B §10.6 renames the `notes` parameter of `POST /api/runs/{run_id}/advance` to `summary`. UC-02 in the UC Catalog still uses `notes` (it predates Stage 8B). All Teams MUST use `summary`. The UC Catalog entry for UC-02 is superseded on this field name only.

### C.3 — v2 Reference Files (קריאה בלבד)

```
agents_os_v2/orchestrator/json_enforcer.py  ← IL-1/IL-2/IL-3 logic (FeedbackIngestor reference)
agents_os_v2/orchestrator/pipeline.py       ← _verdict_candidates(), advance_gate()
agents_os_v2/config.py                      ← process variants reference
```

---

## Part D — Layer 4: משימה מלאה

### D.1 — מבנה ספריות קנוני (SSOT: Module Map §1 + Stage 8B §12.3)

> **קנוני:** Module Map v1.0.1 §1 הוא ה-SSOT. כל שמות הקבצים, המודולים, והספריות להלן מדויקים לפיו.

```
agents_os_v3/
├── FILE_INDEX.json                          ← Team 61 — חובה לפני כל commit
├── definition.yaml                          ← Stage 1 | seed data SSOT
├── seed.py                                  ← Stage 1 | DB init + D-03 validation
├── modules/
│   ├── definitions/                         ← Stage 1
│   │   ├── __init__.py
│   │   ├── models.py                        ← dataclasses: Run, Gate, Phase, Team, Event, AssembledPrompt...
│   │   ├── constants.py                     ← enums: RunStatus, EventType, ActorType, ProcessVariant...
│   │   └── queries.py                       ← read-only DB queries: get_gate, get_phase, get_team...
│   ├── state/                               ← Stage 2
│   │   ├── __init__.py
│   │   ├── machine.py                       ← transitions T01–T12 + A01–A10E (AD-S7-01: atomic TX)
│   │   ├── repository.py                    ← runs CRUD + pipeline_state.json projection
│   │   └── models.py
│   ├── routing/                             ← Stage 5
│   │   ├── __init__.py
│   │   └── resolver.py                      ← resolve_actor(): sentinel + standard (AD-S5-01/02/05)
│   ├── prompting/                           ← Stage 6
│   │   ├── __init__.py
│   │   ├── builder.py                       ← assemble_prompt() (AD-S6-01/02/03/07)
│   │   ├── cache.py                         ← L2/L4 version-keyed cache
│   │   └── templates.py                     ← get_active_template, update_template (DDL-ERRATA-01)
│   ├── audit/                               ← Stage 7 + Stage 8B
│   │   ├── __init__.py
│   │   ├── ledger.py                        ← Stage 7 | append_event(), query_events()
│   │   ├── ingestion.py                     ← Stage 8B NEW | FeedbackIngestor — IL-1/IL-2/IL-3
│   │   └── sse.py                           ← Stage 8B NEW | SSEBroadcaster — asyncio.Queue
│   ├── policy/                              ← Stage 6
│   │   ├── __init__.py
│   │   └── settings.py                      ← get_policy_value(), list_policies, update_policy
│   ├── management/                          ← Stage 3 + Stage 8 HTTP layer
│   │   ├── __init__.py
│   │   ├── use_cases.py                     ← UC-01..UC-15 (UC-15 = ingest_feedback, Stage 8B §12.4)
│   │   └── api.py                           ← ALL FastAPI HTTP endpoints (/api/*)
│   └── governance/                          ← Spec Process Plan §ו.6
│       ├── __init__.py
│       ├── artifact_index.py                ← wp_artifact_index CRUD
│       └── archive.py                       ← Archive manifests for Team 191 cleanup
├── cli/
│   └── pipeline_run.sh                      ← v3 CLI wrapper (Team 61 — see D.3)
└── ui/                                      ← Mockup → production (Team 31)
    ├── index.html / history.html / config.html / teams.html / portfolio.html
    ├── app.js
    └── style.css
```

### D.2 — Infrastructure Parameters (Locked)

> **F-03 תיקון:** Port נעול ל-8090 — תואם Process Map §12 + מסורת v2. Port 8082 = TikTrack בלבד.

| פרמטר | ערך | מקור |
|---|---|---|
| **API prefix** | `/api/` (ללא `/v1/`) | spec v1.1.0 throughout |
| **Port** | **8090** | Process Map §12; v2 convention; TikTrack uses 8082 |
| Serving | `modules/management/api.py` — FastAPI router mounted on `/api` | Module Map §3.13 |
| DB | PostgreSQL — schema per DDL v1.0.2 | DDL Spec |
| Branch | `aos-v3` → `origin/aos-v3` | Branch work mode v1.1.0 |

---

### D.3 — חלוקת עבודה לצוותים

#### Team 11 — Gate 0 Prerequisite: DDL v1.0.2 Mandate

> **F-13:** לפני פתיחת GATE_0, Team 11 **חייב** להוציא mandate לצוות 111 להכנת DDL v1.0.2.
> **Gate 0 אינו יכול לעבור ללא DDL v1.0.2 מסופק.**

| פעולה | מועד |
|---|---|
| Mandate → Team 111: DDL v1.0.2 (5 items — ראו D.5) | לפני GATE_0 activation |
| קבלת DDL v1.0.2 מ-Team 111 | חלק מ-GATE_0 AC |

---

#### Team 61 — AOS DevOps (ראשון — Gate 0)

1. יצירת `FILE_INDEX.json` — כל קבצי `agents_os_v3/ui/` (status: `NEW`)
2. DB setup + DDL v1.0.2 migrations (ראו D.5) — **prerequisite: Team 111 מסיים DDL v1.0.2**
3. `definition.yaml` + `seed.py` — data ראשונית
4. FastAPI app scaffold ב-`modules/management/api.py` — `/api` prefix, port **8090**, lifespan, APScheduler
5. `GET /api/health` → 200
6. `GET /api/events/stream` skeleton (SSE endpoint ריק — למלא ע"י Team 21)
7. **`cli/pipeline_run.sh`** — v3 CLI wrapper (assigned to Team 61 as DevOps tooling; tested at Gate 4)
8. Pre-commit hook / checklist לפי הנחיות Team 191

---

#### Team 21 — AOS Backend (Gates 1–3)

> **UC-15 note:** UC-01..UC-14 מוגדרים ב-UC Catalog v1.0.3. **UC-15 (`ingest_feedback`) מוגדר ב-Stage 8B §12.4 בלבד** — לא קיים ב-UC Catalog. קראו §12.4 ישירות.

> **`notes` → `summary`:** `POST /api/runs/{run_id}/advance` — השדה הוא `summary` (לא `notes`). UC-02 בקטלוג מיושן על שם זה. השתמשו ב-`summary` בלבד.

**לפי stage order — כולל ב-`modules/management/api.py` (HTTP layer unified):**

| # | Stage | קובץ/module | תיאור |
|---|---|---|---|
| 1 | 1 | `modules/definitions/` | models, constants, queries |
| 2 | 2 | `modules/state/machine.py` | T01–T12 + A01–A10E (atomic TX) |
| 3 | 2 | `modules/state/repository.py` | CRUD + pipeline_state.json |
| 4 | 5 | `modules/routing/resolver.py` | resolve_actor() + sentinel |
| 5 | 6 | `modules/prompting/builder.py` + `cache.py` + `templates.py` | 4-layer assembler |
| 6 | 7 | `modules/audit/ledger.py` | append_event(), query_events() |
| 7 | 6 | `modules/policy/settings.py` | policy CRUD |
| 8 | 3 | `modules/management/use_cases.py` UC-01..UC-14 | state use cases |
| 9 | 8 | `modules/management/api.py` §4.1–§4.10 | core endpoints |
| 10 | 8B | `modules/audit/ingestion.py` | FeedbackIngestor: modes A/B/C/D + IL-1/IL-2/IL-3 |
| 11 | 8B | `modules/audit/sse.py` | SSEBroadcaster: asyncio.Queue, 4 event types |
| 12 | 8B | `modules/management/use_cases.py` UC-15 | `ingest_feedback()` (spec: Stage 8B §12.4) |
| 13 | 8B | `modules/management/api.py` §4.19–§4.22 | Feedback + SSE + engine edit + config admin |
| 14 | 8B | `modules/management/api.py` §4.9 amended | GET /api/state + previous_event + next_action |
| 15 | 8B | `modules/management/api.py` §4.10 amended | GET /api/history?run_id= |

**Config admin endpoints (Module Map §6.3 — assigned to Team 21):**

| Endpoint | Method | תיאור |
|---|---|---|
| `/api/routing-rules` | GET, POST, PUT | Routing rules table (admin) |
| `/api/templates/{id}` | GET, PUT | Template list + edit (admin) |
| `/api/policies` | GET | Policy viewer (read-only) |

**Reference:** `agents_os_v2/orchestrator/json_enforcer.py` ← IL-1/IL-2/IL-3 base logic

---

#### Team 31 — AOS Frontend (Gate 4)

> **`notes` → `summary`:** כאשר שולחים `POST /api/runs/{run_id}/advance`, השדה הוא `summary` (לא `notes`).

מעבר mockup → production (חיבור ל-API):

| עמוד | חיבורי API עיקריים |
|---|---|
| `index.html` (Pipeline) | GET /api/state → Operator Handoff; SSE `/api/events/stream`; POST /api/runs/{id}/feedback; POST /api/runs/{id}/advance \| fail \| approve |
| `history.html` (History) | GET /api/runs (selector); GET /api/history?run_id=...; deep link `?run_id=` |
| `config.html` (Config) | **מלא — 6 endpoints (Module Map §6.3):** GET/POST/PUT `/api/routing-rules` (routing rules table); GET/PUT `/api/templates/{id}` (templates list+edit); GET `/api/policies` (policy viewer, read-only). **Read-only for non-team_00 users.** |
| `teams.html` (Teams) | GET /api/teams; PUT /api/teams/{id}/engine (Principal/team_00 only) |
| `portfolio.html` (Portfolio) | GET /api/ideas; POST /api/ideas; GET /api/work-packages/{wp_id}; gate filter |

> **Config page scope clarification (F-10 fix):** config.html is NOT "no functional change from mockup." It requires wiring to 6 live API endpoints with authorization (routing rules, templates, policy). The mockup showed static placeholder content; production requires full admin functionality.

**Iron Rule Frontend:** SSE status chip בheader — connected/polling בכל עמוד; polling fallback = 15s.

---

#### Team 51 — AOS QA (Gates 3–5)

Integration tests TC-01..TC-26 (TC-15..TC-26 = Stage 8B חדשים, ראו spec v1.1.0 §17).

עיקרי Stage 8B:
- TC-15: Mode B → IL-1 PASS
- TC-16: Mode B fallback → Mode C/D
- TC-17: Mode D + IL-2 + blocking findings
- TC-18: GET /api/state → next_action=CONFIRM_ADVANCE
- TC-19..TC-26: SSE stream, History run_id, Teams engine edit, WP detail, AC coverage

---

### D.4 — Gate Sequence for BUILD

**Gate 0 — Infrastructure Ready (Team 61)**

> **Prerequisites (must be complete before Gate 0 can PASS):**
> 1. DDL v1.0.2 delivered by Team 111 (hard blocker — Team 11 issues mandate first)
> 2. Team 191: branch `aos-v3` created + AGENTS.md updated

AC:
- [ ] DDL v1.0.2 mandate to Team 111 issued by Team 11 AND DDL v1.0.2 delivered
- [ ] `FILE_INDEX.json` קיים — כל קבצי UI מרשומים (status: NEW)
- [ ] DDL v1.0.2 migrations — ללא errors
- [ ] `seed.py` מוצלח
- [ ] FastAPI app עולה; `GET /api/health` → 200
- [ ] **Port = 8090** | **API prefix = `/api/`** (לא `/api/v1/`) — ודאו ב-router mount
- [ ] `agents_os_v2/` ללא שינויים

---

**Gate 1 — State Machine + Core (Team 21)**

AC:
- [ ] `modules/definitions/` — models + constants + queries
- [ ] `modules/state/machine.py` — T01–T12 + A01–A10E
- [ ] `modules/state/repository.py` — CRUD + pipeline_state.json
- [ ] `POST /api/runs` → 201
- [ ] `POST /api/runs/{run_id}/advance` → 200 (field: **`summary`**, not `notes`)
- [ ] `POST /api/runs/{run_id}/fail` → requires non-empty `reason` (IR-6)
- [ ] Atomic rollback on failure (IR-8)
- [ ] FILE_INDEX מעודכן

---

**Gate 2 — Routing + Prompting + Events (Team 21)**

AC:
- [ ] `modules/routing/resolver.py` — sentinel + standard actor resolution
- [ ] `modules/prompting/builder.py` — 4-layer assembly (files: builder.py, cache.py, templates.py)
- [ ] `GET /api/runs/{run_id}/prompt` → assembled prompt JSON (current_phase_id reflected)
- [ ] `modules/audit/ledger.py` — events CRUD
- [ ] `modules/policy/settings.py` — policy reads/writes
- [ ] UC-01..UC-14 in `modules/management/use_cases.py`
- [ ] Config admin endpoints implemented: GET/POST/PUT /api/routing-rules; GET/PUT /api/templates/{id}; GET /api/policies
- [ ] FILE_INDEX מעודכן

---

**Gate 3 — FIP + SSE + State API Extensions (Team 21 — critical)**

AC:
- [ ] `modules/audit/ingestion.py` — FeedbackIngestor
  - IL-1: JSON block → HIGH confidence
  - IL-2: regex → MEDIUM confidence
  - IL-3: raw display → LOW (infallible)
- [ ] UC-15 (`ingest_feedback`) in `modules/management/use_cases.py` (per Stage 8B §12.4)
- [ ] **`POST /api/runs/{run_id}/feedback`** — unified (detection_mode: OPERATOR_NOTIFY | NATIVE_FILE | RAW_PASTE)
- [ ] **`POST /api/runs/{run_id}/feedback/clear`** — clear pending FeedbackRecord
- [ ] `GET /api/state` — includes `previous_event`, `pending_feedback`, `next_action` (all 7 types + `cli_command`)
- [ ] `GET /api/events/stream` SSE — 4 event types (pipeline_event, run_state_changed, feedback_ingested, heartbeat)
- [ ] `modules/audit/sse.py` — SSEBroadcaster operational
- [ ] TC-15, TC-16, TC-17, TC-18 GREEN
- [ ] FILE_INDEX מעודכן

> ⚠️ **No `GET /api/runs/{run_id}/feedback` listing endpoint.** Pending feedback is exposed only via `GET /api/state` → `pending_feedback` field. No separate listing endpoint is defined in any spec.

---

**Gate 4 — Frontend Production + CLI (Team 31 + Team 51)**

AC:
- [ ] Pipeline page: Operator Handoff renders from live API
- [ ] SSE connected indicator + polling fallback at 15s
- [ ] Detection Mode B/C/D flows end-to-end
- [ ] CORRECTION blocking findings section renders
- [ ] History: run selector + event timeline + `?run_id=` deep link
- [ ] Config page: routing rules table + templates edit + policy viewer — all wired (6 endpoints)
- [ ] Teams: engine list + PUT /api/teams/{id}/engine (team_00 only)
- [ ] Portfolio: WP modal + Ideas CRUD + gate filter
- [ ] **`cli/pipeline_run.sh`** — Team 61 deliverable; tested here in UX review (Process Map §8)
- [ ] TC-19..TC-26 GREEN
- [ ] FILE_INDEX מעודכן

---

**Gate 5 — Full E2E + Cleanup Report (Team 51 + Team 61)**

AC:
- [ ] TC-01..TC-26 ALL GREEN
- [ ] `agents_os_v3/CLEANUP_REPORT.md` מוכן (Team 61)
- [ ] אין שינויים ב-`agents_os_v2/`
- [ ] FILE_INDEX מלא ומדויק
- [ ] Team 00 (Nimrod) מאשר CLEANUP_REPORT
- [ ] **Gate 5 PASS = BUILD COMPLETE** → merge ל-`main`

---

### D.5 — DDL v1.0.2 Scope

> **Team 11 mandate → Team 111:** יש להוציא mandate לצוות 111 לפני GATE_0. DDL v1.0.2 = Gate 0 hard blocker.

> **DB naming rule:** `work_packages.id` = PK ב-DB (TEXT). API response field `wp_id` = application-layer alias בלבד. אין עמודה בשם `wp_id` ב-DB.

| Item | Schema | תיאור |
|---|---|---|
| DDL-ERRATA-01 | multiple tables | תיקונים מצטברים (ראו DDL Spec v1.0.1 errata) |
| `ideas` amendments | `ideas` | הוספת: `domain_id` (TEXT FK), `idea_type` (TEXT), `decision_notes` (TEXT NULL) |
| `work_packages` (NEW) | `work_packages` | PK: `id TEXT NOT NULL`; columns: `label`, `domain_id` (FK), `status` CHECK, `linked_run_id` (FK→runs.id), `created_at`, `updated_at` |
| `pending_feedbacks` (NEW) | `pending_feedbacks` | FeedbackRecord store — schema מלא ב-spec v1.1.0 §13 |
| `teams.engine` | `teams` | ADD COLUMN `engine VARCHAR(50) NOT NULL DEFAULT 'cursor'` |

**Mapping:** `work_packages.id` (DB) ↔ `wp_id` (API response field, set in application layer)

---

### D.6 — API Endpoints Summary

**קנוני מ-Module Map v1.0.1 (ב-`modules/management/api.py`) — prefix: `/api/`, port: 8090:**

| Endpoint | Method | Stage | הערה |
|---|---|---|---|
| `/api/health` | GET | infra | health check |
| `/api/runs` | POST | 2 | create run |
| `/api/runs/{run_id}` | GET | 2 | run details |
| `/api/runs/{run_id}/advance` | POST | 2 | field: `summary` (not `notes`) |
| `/api/runs/{run_id}/fail` | POST | 2 | `reason` non-empty required |
| `/api/runs/{run_id}/approve` | POST | 2 | HITL approval |
| `/api/runs/{run_id}/pause` | POST | 2 | pause run |
| `/api/runs/{run_id}/resume` | POST | 2 | resume run |
| `/api/runs/{run_id}/prompt` | GET | 6 | assembled prompt |
| `/api/state` | GET | 8→8B | +previous_event, +pending_feedback, +next_action |
| `/api/history` | GET | 7→8B | +run_id filter param |
| `/api/events/stream` | GET (SSE) | 8B | 4 event types |
| `/api/routing-rules` | GET, POST, PUT | 8/config | routing rules admin (Module Map §6.3) |
| `/api/templates/{id}` | GET, PUT | 8/config | template admin (Module Map §6.3) |
| `/api/policies` | GET | 8/config | policy viewer (Module Map §6.3) |
| `/api/teams` | GET | 8A | team list |
| `/api/teams/{team_id}/engine` | PUT | 8B | engine edit (Principal/team_00 only) |
| `/api/ideas` | GET, POST | 8A | ideas CRUD |
| `/api/work-packages/{wp_id}` | GET | 8A | WP detail + linked run |
| `/api/runs/{run_id}/feedback` | POST | 8B | **Unified** detection (B/C/D) — `detection_mode` field |
| `/api/runs/{run_id}/feedback/clear` | POST | 8B | Clear pending FeedbackRecord |

> ⚠️ **אין** endpoints נפרדים `/feedback/notify`, `/feedback/file`, `/feedback/paste`.
> ⚠️ **אין** `GET /api/runs/{run_id}/feedback` — pending feedback מגיע דרך `GET /api/state` → `pending_feedback` בלבד.

---

### D.7 — Error Codes

> **קנוני מ-spec v1.1.0 §11 + Event Observability §6.1:**

| Batch | Count | Codes | Source |
|---|---|---|---|
| Stages 1–7 | 39 | EC-01..EC-39 | Event Observability Spec v1.0.2 §6.1 |
| Stage 8A net additions | +2 | EC-40..EC-41 | UI Spec Amendment v1.0.2 (NOT_PRINCIPAL pre-existed) |
| Pre-8B subtotal | **41** | EC-01..EC-41 | Stage 8B §11 baseline reference |
| Stage 8B new | +8 | EC-42..EC-49 | UI Spec Amendment v1.1.0 §11 |
| **Total** | **49** | EC-01..EC-49 | canonical |

Stage 8B codes (EC-42..EC-49): `FILE_NOT_FOUND`, `INGESTION_FAILED`, `FEEDBACK_ALREADY_INGESTED`, `INVALID_ENGINE`, `NO_PENDING_FEEDBACK`, `INVALID_IDEA_TYPE`, `WP_NOT_FOUND`, `TEAM_NOT_FOUND`

> **Note (F-14):** Stages 1–7 = 39 codes; Stage 8A adds 2 net new codes (total 41 pre-8B). Stage 8B adds 8 codes (total 49). If the UC Catalog or older documents reference 42 pre-8B codes, those are wrong — the canonical count is 41 per Stage 8B §11.

---

### D.8 — FILE_INDEX: Commit ראשון (Team 61)

```json
{
  "version": "1.0.0",
  "last_updated": "YYYY-MM-DD",
  "entries": [
    {"path": "agents_os_v3/ui/index.html",     "status": "NEW", "spec_ref": "§6.1", "owner_team": "team_31", "added_in_gate": "pre-BUILD"},
    {"path": "agents_os_v3/ui/history.html",   "status": "NEW", "spec_ref": "§6.2", "owner_team": "team_31", "added_in_gate": "pre-BUILD"},
    {"path": "agents_os_v3/ui/config.html",    "status": "NEW", "spec_ref": "§6.3", "owner_team": "team_31", "added_in_gate": "pre-BUILD"},
    {"path": "agents_os_v3/ui/teams.html",     "status": "NEW", "spec_ref": "§6.4", "owner_team": "team_31", "added_in_gate": "pre-BUILD"},
    {"path": "agents_os_v3/ui/portfolio.html", "status": "NEW", "spec_ref": "§6.5", "owner_team": "team_31", "added_in_gate": "pre-BUILD"},
    {"path": "agents_os_v3/ui/app.js",         "status": "NEW", "spec_ref": "§6",   "owner_team": "team_31", "added_in_gate": "pre-BUILD"},
    {"path": "agents_os_v3/ui/style.css",      "status": "NEW", "spec_ref": "§6",   "owner_team": "team_31", "added_in_gate": "pre-BUILD"}
  ]
}
```

---

## Part E — Process Map: Authority Declaration (Option C)

> **F-05/F-06 resolution:** The Build Process Map (`TEAM_00_AOS_V3_BUILD_PROCESS_MAP_v1.0.0.md`) and this Work Package define different gate content. **This Work Package is the authoritative source for gate Acceptance Criteria and team assignments.**

| Document | Authority Scope |
|---|---|
| **This Work Package (v1.0.2)** | Gate ACs, team assignments, endpoint contracts, Iron Rules, correction history |
| **Build Process Map v1.0.0** | Module dependency build order (§5–§6), visual dependency graph (§10); these remain valid for sequencing guidance |
| **Build Process Map gate definitions (§4–§8)** | Superseded by this WP on all gate content |

**Process Map known staleness (informational — teams use WP):**
- Process Map lists 3 UI pages; canonical = 5 (teams.html + portfolio.html added in Stage 8A)
- Process Map lists 14 TCs; canonical = 26 (TC-15..TC-26 added in Stage 8B)
- Process Map port = 8090 ✅ (consistent with this WP)
- Process Map does not reference Stage 8A/8B scope

---

## Part F — הפצה לצוותי BUILD

Team 11 פותח activation per team לאחר DDL v1.0.2 mandate ו-Gate 0:

| צוות | Gates | תפקיד |
|---|---|---|
| **Team 111** | pre-Gate 0 | DDL v1.0.2 delivery (mandate from Team 11) |
| **Team 61** | Gate 0 + Gate 5 | Infrastructure, DB, CLI, FILE_INDEX, Cleanup |
| **Team 21** | Gates 1–3 | Backend (state order), config admin endpoints |
| **Team 31** | Gate 4 | Frontend production — all 5 pages; config page = full API scope |
| **Team 51** | Gates 3–5 | QA — TC-01..TC-26 |

כל activation חייב לכלול:
- Layer 1–4
- SSOT files map
- FILE_INDEX Iron Rule (IR-3)
- v2 FREEZE (IR-2)
- UC-15 = Stage 8B §12.4 (not in UC Catalog)
- Field rename: `notes` → `summary` in advance endpoint

---

**log_entry | TEAM_00 | BUILD_WORK_PACKAGE | AOS_V3_v1.0.2 | T190-F01-F05_CLOSED + T100-F03/F05-F10/F12-F17_CLOSED | 2026-03-27**
