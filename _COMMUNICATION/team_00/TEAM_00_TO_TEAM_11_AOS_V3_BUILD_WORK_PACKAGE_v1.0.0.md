---
id: TEAM_00_TO_TEAM_11_AOS_V3_BUILD_WORK_PACKAGE_v1.0.0
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
authority: Team 00 Constitutional authority---

# AOS v3 — חבילת עבודה מלאה למימוש (BUILD)

---

## Part A — Layer 1: זהות וסמכות

**Team 11 = AOS Gateway / Execution Lead**
אתה מנהל BUILD של AOS v3. תפקידך:
- קבלת work package זה ופתיחת run ראשון
- הפצת activation packages לצוותי ה-BUILD (21, 31, 61)
- ניהול gate sequence — מ-GATE_0 ועד GATE_5
- דיווח ל-Team 100 (ארכיטקטורה) ול-Team 00 (Principal) בשערים הרלוונטיים

**Engine:** Cursor Composer
**Branch:** `aos-v3` | **Push:** `origin/aos-v3` ישירות | **Pipeline:** N/A (ראו Iron Rule #1)

---

## Part B — Layer 2: Iron Rules (10 — חובה לקריאה לפני כל פעולה)

| # | כלל | מקור |
|---|---|---|
| **IR-1** | `pipeline_run.sh` **לא בשימוש** למסלול זה. Git commits ישירים ל-`aos-v3`. | `TEAM_191_AOS_V3_PROJECT_BRANCH_WORK_MODE_v1.1.0` |
| **IR-2** | `agents_os_v2/` **מוקפא לחלוטין** — קריאה מותרת כ-reference; אסור לשנות. | `ARCHITECT_DIRECTIVE_AOS_V3_FILE_INDEX_AND_V2_FREEZE_v1.0.0` |
| **IR-3** | **FILE_INDEX Iron Rule:** כל קובץ ב-`agents_os_v3/` חייב להיות רשום ב-`agents_os_v3/FILE_INDEX.json` לפני commit. | `ARCHITECT_DIRECTIVE_AOS_V3_FILE_INDEX_AND_V2_FREEZE_v1.0.0` |
| **IR-4** | **Dashboard = consumer only.** כל חישוב, parsing, ו-`next_action` computation = server-side. Dashboard מרנדר בלבד. | AD-S8B-01, AD-S8B-09 |
| **IR-5** | **Financial precision:** NUMERIC(20,8) לכל ערכי כסף ורווח/הפסד. NUMERIC(24,4) ל-market_cap. | ARCHITECT_DIRECTIVE_QUALITY_INFRASTRUCTURE_v1.0.0 |
| **IR-6** | **FAIL חייב סיבה.** כל `POST /api/runs/{run_id}/fail` חייב `reason` שאינו ריק. | AD-S6-04 |
| **IR-7** | **Terminology locked.** 8 מונחים קנוניים מ-spec v1.1.0 §1 — אסור להחליפם. | spec v1.1.0 §1 |
| **IR-8** | **Atomic transactions:** כל state transition ב-`machine.py` = DB transaction בודדת עם rollback. | AD-S7-01 |
| **IR-9** | **SSE ב-BUILD** — `GET /api/events/stream` חייב להיות מיושם; polling fallback (15s) = fallback בלבד לא primary. | spec v1.1.0 §6 |
| **IR-10** | **UC-15:** AOS v2 לא רץ במקביל לתקופת פיתוח v3. | `ARCHITECT_DIRECTIVE_AOS_V3_FILE_INDEX_AND_V2_FREEZE_v1.0.0` §1 |

---

## Part C — Layer 3: קונטקסט מלא

### C.1 — מה AOS v3 בונה

AOS (Agents OS) v3 הוא מערכת תזמור פיפליין לסוכני AI. הפרינציפל (Nimrod) מנהל את תהליך הפיתוח של TikTrack באמצעות רצף שערים (GATE_0..GATE_5) שכל אחד מהם מופעל על ידי צוות AI שונה.

**מה שונה מ-v2:**

| היבט | v2 | v3 |
|---|---|---|
| גילוי סיום סוכן | סריקת קבצים בלבד | 4 Detection Modes (A/B/C/D) + FIP |
| סטטוס dashboard | polling כל 5s | SSE stream (real-time push) |
| Operator guidance | CLI commands בלבד | Operator Handoff section (PREVIOUS/NEXT/CLI) |
| next_action | לא קיים | server-computed (7 types) |
| History | event log פשוט | Analytics — run selector, timeline, run_id filter |
| Teams engine | קבוע ב-YAML | עריך ב-UI (Principal בלבד) |
| Portfolio | לא קיים | WP management + Ideas + gate filter |

### C.2 — מצב ה-spec (כל השלבים CLOSED)

| Stage | Spec file (canonical — latest) | סטטוס |
|---|---|---|
| Stage 1 (Entities) | `TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md` | ✅ CLOSED |
| Stage 2 (State Machine) | `TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md` | ✅ CLOSED |
| Stage 3 (Use Cases) | `TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md` | ✅ CLOSED |
| Stage 4 (DDL) | `TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md` + **DDL v1.0.2 pending** | ✅ + ⏳ |
| Stage 5 (Routing) | `TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.1.md` | ✅ CLOSED |
| Stage 6 (Prompting) | `TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.2.md` | ✅ CLOSED |
| Stage 7 (Events) | `TEAM_100_AOS_V3_EVENT_OBSERVABILITY_SPEC_v1.0.2.md` | ✅ CLOSED |
| Stage 8 (Module Map) | `TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.1.md` | ✅ CLOSED |
| Stage 8A (UI) | `TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.2.md` | ✅ CLOSED |
| Stage 8B (FIP+SSE) | `TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.1.0.md` | ✅ CLOSED |
| Mockup | `agents_os_v3/ui/` — 5 pages, 13 presets | ✅ UX APPROVED |

**כל הספרים ב:** `_COMMUNICATION/team_100/` ו-`_COMMUNICATION/team_101/` ו-`_COMMUNICATION/team_111/`

### C.3 — v2 reference files (קריאה בלבד)

```
agents_os_v2/orchestrator/json_enforcer.py   ← IL-1/IL-2/IL-3 logic לFIP
agents_os_v2/orchestrator/pipeline.py        ← _verdict_candidates(), advance_gate()
agents_os_v2/config.py                       ← process variants (TRACK_FULL / TRACK_FOCUSED)
```

---

## Part D — Layer 4: משימה מלאה

### D.1 — מבנה ספריות (SSOT: Module Map §1)

```
agents_os_v3/
├── FILE_INDEX.json                          ← Team 61 מחזיק — חובה לפני כל commit
├── definition.yaml                          ← Stage 1 | SSOT seed data
├── seed.py                                  ← Stage 1 | DB initialization
├── modules/
│   ├── definitions/                         ← Stage 1
│   │   ├── models.py                        ← dataclasses: Run, Gate, Phase, Team...
│   │   ├── constants.py                     ← enums: RunStatus, EventType...
│   │   └── queries.py                       ← read-only DB queries
│   ├── state/                               ← Stage 2
│   │   ├── machine.py                       ← transitions T01–T12 + A01–A10E
│   │   ├── repository.py                    ← runs CRUD + pipeline_state.json
│   │   └── models.py
│   ├── routing/                             ← Stage 5
│   │   └── resolver.py                      ← resolve_actor()
│   ├── prompting/                           ← Stage 6
│   │   ├── assembler.py
│   │   ├── layer_resolver.py
│   │   └── models.py
│   ├── events/                              ← Stage 7
│   │   ├── writer.py
│   │   ├── reader.py
│   │   └── models.py
│   └── use_cases/                           ← Stage 3 (Use Cases)
│       └── use_cases.py                     ← UC-01..UC-15
├── api/
│   ├── main.py                              ← FastAPI app + lifespan + scheduler
│   ├── routes/
│   │   ├── runs.py                          ← §4.1–§4.10
│   │   ├── feedback.py                      ← §4.19–§4.22 (NEW — Stage 8B)
│   │   ├── state.py                         ← §4.9 (amended Stage 8B)
│   │   ├── events_sse.py                    ← SSE stream §4 (NEW — Stage 8B)
│   │   ├── teams.py                         ← §4.24 engine edit (NEW — Stage 8B)
│   │   ├── ideas.py
│   │   ├── work_packages.py                 ← §4.23 (NEW)
│   │   ├── history.py                       ← §4.10 amended (run_id filter)
│   │   └── portfolio.py
│   └── services/
│       ├── audit/
│       │   ├── ingestion.py                 ← FIP engine (NEW — Stage 8B §12)
│       │   └── sse.py                       ← SSE manager (NEW — Stage 8B §12)
│       └── scheduler_registry.py           ← APScheduler jobs
├── db/
│   └── migrations/                          ← DDL v1.0.2 (see D.4)
├── ui/                                      ← מוקאפ → production (Team 31)
│   ├── index.html / history.html / config.html / teams.html / portfolio.html
│   └── [CSS + JS files]
└── tests/
    └── integration/                         ← IT-01..IT-26 (Team 51)
```

---

### D.2 — חלוקת עבודה לצוותים

#### Team 61 — AOS DevOps (ראשון מתחיל)

**משימות:**
1. יצירת `agents_os_v3/FILE_INDEX.json` עם כל קבצי UI הקיימים (status: `NEW`)
2. DB migrations — DDL v1.0.2 (ראו D.4)
3. `definition.yaml` + `seed.py` — טעינת data ראשונית
4. `main.py` — FastAPI app scaffold + lifespan + APScheduler skeleton
5. הגדרת environment: PostgreSQL connection, port 8082, `/api/v1/` prefix
6. Pre-commit hooks לפי הנחיות Team 191

**Gate output:** שרת עולה, DB migrations רצות, `seed.py` מוצלח, `FILE_INDEX.json` קיים.

#### Team 21 — AOS Backend

**משימות (לפי stage order):**
1. `modules/definitions/` — models, constants, queries (Stage 1)
2. `modules/state/` — machine.py (transitions T01–T12 + A01–A10E), repository.py (Stage 2)
3. `modules/routing/resolver.py` — resolve_actor() + sentinel logic (Stage 5)
4. `modules/prompting/` — 4-layer assembler + layer_resolver (Stage 6)
5. `modules/events/` — writer + reader (Stage 7)
6. `modules/use_cases/use_cases.py` — UC-01..UC-15 (Stage 3)
7. `api/routes/runs.py` — endpoints §4.1–§4.10 (Stage 8)
8. `api/services/audit/ingestion.py` — FIP engine: modes A/B/C/D + IL-1/IL-2/IL-3 (Stage 8B)
9. `api/services/audit/sse.py` — asyncio.Queue SSE manager (Stage 8B)
10. `api/routes/feedback.py` — §4.19–§4.22 (Stage 8B)
11. `api/routes/state.py` — GET /api/state amended: previous_event, pending_feedback, next_action (Stage 8B)
12. `api/routes/events_sse.py` — GET /api/events/stream (Stage 8B)
13. `api/routes/teams.py` — PUT /api/teams/{team_id}/engine (Stage 8B §7)
14. `api/routes/history.py` — GET /api/history amended: run_id filter (Stage 8B §8)
15. `api/routes/work_packages.py` — GET /api/work-packages/{wp_id} (Stage 8B §9)

**Reference for FIP:** `agents_os_v2/orchestrator/json_enforcer.py` — IL-1/IL-2/IL-3 parsing logic
**Reference for state:** `agents_os_v2/orchestrator/pipeline.py` — `_verdict_candidates()`, `advance_gate()`

#### Team 31 — AOS Frontend

**משימות:**
מעבר מ-mockup (`agents_os_v3/ui/`) ל-production frontend המחובר ל-API:

1. `index.html` (Pipeline page):
   - GET /api/state → render Operator Handoff (PREVIOUS/NEXT/CLI)
   - SSE subscription → `GET /api/events/stream`
   - Polling fallback (15s) כאשר SSE לא זמין
   - Detection Mode buttons (B/C/D) ← triggers API calls
   - CORRECTION blocking findings section
   - Copy Full Context button → GET /api/runs/{run_id}/prompt

2. `history.html` (History Analytics):
   - Run selector (GET /api/runs)
   - Event timeline (GET /api/history?run_id=...)
   - Actor breakdown
   - Deep link: `history.html?run_id=...`

3. `config.html` (Config) — minimal; no functional change from mockup

4. `teams.html` (Teams):
   - Team list + engine display
   - Engine edit (Principal team_00 only) → PUT /api/teams/{team_id}/engine

5. `portfolio.html` (Portfolio):
   - Ideas list + CRUD
   - Work Packages + WP detail modal → GET /api/work-packages/{wp_id}
   - Gate filter
   - Submit Idea → POST /api/ideas

**Iron Rule Frontend:** SSE connection state chip בheader — חייב להציג connected/polling בכל עמוד.

#### Team 51 — AOS QA

**Integration tests: TC-15 through TC-26** (spec v1.1.0 §17)

עיקרי:
- TC-15: Mode B ingestion — IL-1 PASS
- TC-16: Mode B fallback (→ Mode C/D)
- TC-17: Mode D IL-2 with blocking findings
- TC-18: GET /api/state includes next_action CONFIRM_ADVANCE
- TC-19..TC-26: SSE stream, History run_id filter, Teams engine edit, WP detail, AC coverage

**הפעלה:** עבור כל gate, Team 51 מריץ את ה-tests הרלוונטיים לpre-gate AC.

---

### D.3 — Gate Sequence for BUILD

**Gate 0 — Infrastructure Ready (Team 61)**

AC:
- [ ] `FILE_INDEX.json` קיים ומכיל כל קבצי UI
- [ ] DB migrations רצות ללא errors (DDL v1.0.2)
- [ ] `seed.py` מוצלח — `definition.yaml` loaded
- [ ] FastAPI server עולה על port 8082, `/api/v1/` prefix
- [ ] `GET /health` → 200
- [ ] `agents_os_v2/` ללא שינויים (IR-2)

**Gate 1 — State Machine + Core Backend (Team 21)**

AC:
- [ ] `modules/definitions/` — models + constants + queries
- [ ] `modules/state/machine.py` — T01–T12 + A01–A10E transitions
- [ ] `modules/state/repository.py` — CRUD + pipeline_state projection
- [ ] `POST /api/runs` → 201 (create run)
- [ ] `POST /api/runs/{run_id}/advance` → 200 (includes `summary` field)
- [ ] `POST /api/runs/{run_id}/fail` → requires non-empty `reason` (IR-6)
- [ ] Atomic transactions — rollback on failure (IR-8)
- [ ] FILE_INDEX מעודכן

**Gate 2 — Routing + Prompting + Events (Team 21)**

AC:
- [ ] `resolver.py` — sentinel detection + standard actor resolution
- [ ] `assembler.py` — 4-layer prompt assembly (spec Stage 6)
- [ ] `GET /api/runs/{run_id}/prompt` → assembled prompt JSON
- [ ] Events writer/reader — `events` table CRUD
- [ ] UC-01..UC-15 implemented (`use_cases.py`)
- [ ] FILE_INDEX מעודכן

**Gate 3 — FIP + SSE + State API extensions (Team 21, critical)**

AC:
- [ ] `audit/ingestion.py` — modes A/B/C/D + IL-1/IL-2/IL-3
  - IL-1: JSON block extraction → HIGH confidence
  - IL-2: regex extraction → MEDIUM confidence
  - IL-3: raw display → LOW confidence (infallible)
- [ ] `POST /api/runs/{run_id}/feedback/notify` → Mode B trigger
- [ ] `POST /api/runs/{run_id}/feedback/file` → Mode C
- [ ] `POST /api/runs/{run_id}/feedback/paste` → Mode D
- [ ] `GET /api/runs/{run_id}/feedback` → list FeedbackRecords
- [ ] `GET /api/state` includes `previous_event`, `pending_feedback`, `next_action` (all 7 types)
- [ ] `next_action.cli_command` pre-filled (table §10.7)
- [ ] `GET /api/events/stream` SSE → 4 event types (pipeline_event, run_state_changed, feedback_ingested, heartbeat)
- [ ] TC-15, TC-16, TC-17, TC-18 GREEN
- [ ] FILE_INDEX מעודכן

**Gate 4 — Frontend Production + History + Teams + Portfolio (Team 31)**

AC:
- [ ] Pipeline page: Operator Handoff renders from live API (not mock)
- [ ] SSE connected indicator works; polling fallback at 15s
- [ ] All 4 Detection Mode flows work end-to-end (B/C/D + fallback)
- [ ] CORRECTION blocking findings section renders
- [ ] History page: run selector + event timeline + `?run_id=` deep link
- [ ] Teams page: engine list + edit (team_00 only)
- [ ] Portfolio page: WP modal + Ideas CRUD + gate filter
- [ ] TC-19..TC-26 GREEN (QA by Team 51)
- [ ] FILE_INDEX מעודכן

**Gate 5 — Full E2E + Cleanup Report (Team 51 + Team 61)**

AC:
- [ ] כל TC-01..TC-26 GREEN
- [ ] `agents_os_v3/CLEANUP_REPORT.md` מוכן (Team 61)
- [ ] אין שינויים ב-`agents_os_v2/`
- [ ] FILE_INDEX מלא ומדויק
- [ ] Team 00 review של CLEANUP_REPORT
- [ ] **Gate 5 PASS = BUILD COMPLETE** → Nimrod approves merge ל-`main`

---

### D.4 — DDL v1.0.2 scope (Team 61 / Team 111)

**מנדט נפרד ייצא לצוות 111 — להלן הscope:**

| Item | טבלה/שדה | תיאור |
|---|---|---|
| DDL-ERRATA-01 | multiple | תיקונים מצטברים מ-Stages 1–7 (ראו DDL Spec v1.0.1 errata list) |
| Stage 8A | `ideas` | שדות: `domain_id`, `idea_type`, `decision_notes` |
| Stage 8A | `work_packages` | טבלה חדשה: `wp_id`, `label`, `domain_id`, `status`, `linked_run_id` |
| Stage 8B | `pending_feedbacks` | FeedbackRecord store — schema מלא ב-spec v1.1.0 §13 |
| Stage 8B | `teams.engine` | VARCHAR(50) NOT NULL DEFAULT 'cursor' — editable |
| Stage 8B | `events` | ווידוא שדות Stage 7 + `verdict`, `reason` columns |

---

### D.5 — API Endpoints Summary (Reference)

**קיימים מ-Module Map v1.0.1 (לא לכתוב מחדש — להרחיב):**

| Endpoint | Method | Stage |
|---|---|---|
| `/api/runs` | POST | 2 |
| `/api/runs/{run_id}` | GET | 2 |
| `/api/runs/{run_id}/advance` | POST | 2 (amended 8B: summary+feedback_json) |
| `/api/runs/{run_id}/fail` | POST | 2 |
| `/api/runs/{run_id}/approve` | POST | 2 |
| `/api/runs/{run_id}/pause` | POST | 2 |
| `/api/runs/{run_id}/resume` | POST | 2 |
| `/api/runs/{run_id}/prompt` | GET | 6 |
| `/api/state` | GET | 8 (amended 8B: +3 fields) |
| `/api/history` | GET | 7 (amended 8B: run_id filter) |

**חדשים ב-Stage 8B:**

| Endpoint | Method | תיאור |
|---|---|---|
| `/api/runs/{run_id}/feedback/notify` | POST | Mode B trigger |
| `/api/runs/{run_id}/feedback/file` | POST | Mode C |
| `/api/runs/{run_id}/feedback/paste` | POST | Mode D |
| `/api/runs/{run_id}/feedback` | GET | FeedbackRecords list |
| `/api/events/stream` | GET (SSE) | Real-time event stream |
| `/api/teams/{team_id}/engine` | PUT | Engine edit (Principal only) |
| `/api/work-packages/{wp_id}` | GET | WP detail + linked run |

---

### D.6 — Error Codes (total: 49)

Stages 1–7: error codes EC-01..EC-39 (ראו spec v1.0.1 §11)
Stage 8A: EC-40..EC-42
Stage 8B: EC-43..EC-49 (spec v1.1.0 §11)

---

### D.7 — FILE_INDEX: commit ראשון (Team 61)

ב-commit הראשון של BUILD, Team 61 יוצר `agents_os_v3/FILE_INDEX.json`:

```json
{
  "version": "1.0.0",
  "last_updated": "YYYY-MM-DD",
  "entries": [
    {"path": "agents_os_v3/ui/index.html",    "status": "NEW", "spec_ref": "§6.1", "owner_team": "team_31", "added_in_gate": "pre-BUILD"},
    {"path": "agents_os_v3/ui/history.html",  "status": "NEW", "spec_ref": "§6.2", "owner_team": "team_31", "added_in_gate": "pre-BUILD"},
    {"path": "agents_os_v3/ui/config.html",   "status": "NEW", "spec_ref": "§6.3", "owner_team": "team_31", "added_in_gate": "pre-BUILD"},
    {"path": "agents_os_v3/ui/teams.html",    "status": "NEW", "spec_ref": "§6.4", "owner_team": "team_31", "added_in_gate": "pre-BUILD"},
    {"path": "agents_os_v3/ui/portfolio.html","status": "NEW", "spec_ref": "§6.5", "owner_team": "team_31", "added_in_gate": "pre-BUILD"}
  ]
}
```

כל קובץ חדש שנוסף → entry חדש לפני commit. Team 61 מסנכרן ב-gate checkpoint.

---

## Part E — הפצה לצוותי BUILD

Team 11 אחראי על:
1. פתיחת run ראשון ב-AOS v3 (לאחר Gate 0 prerequisite)
2. activation prompt לצוות 61 — ביסוס Gate 0 (infrastructure)
3. activation prompt לצוות 21 — Gates 1–3 (backend)
4. activation prompt לצוות 31 — Gate 4 (frontend)
5. activation prompt לצוות 51 — Gate 3-5 (QA per gate)

כל activation חייב לכלול:
- Layer 1–4 per team
- רשימת SSOT files רלוונטיים לאותו צוות
- FILE_INDEX Iron Rule (IR-3)
- v2 FREEZE reminder (IR-2)
- Gate acceptance criteria הרלוונטיים

---

**log_entry | TEAM_00 | BUILD_WORK_PACKAGE | AOS_V3_FULL_v1.0.0 | ISSUED | 2026-03-27**
