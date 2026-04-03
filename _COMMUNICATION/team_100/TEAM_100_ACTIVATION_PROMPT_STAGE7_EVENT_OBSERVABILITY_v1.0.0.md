---
id: TEAM_100_ACTIVATION_PROMPT_STAGE7_EVENT_OBSERVABILITY_v1.0.0
historical_record: true
from: Team 00 (Nimrod — System Designer)
to: Team 100 (Chief System Architect — Claude Code)
date: 2026-03-26
type: ACTIVATION_PROMPT — FULL COLD-START — paste-ready for Claude Code session
task: AOS v3 Spec — Stage 7: Event & Observability Spec
stage: SPEC_STAGE_7
reviewer: Team 190
gate_approver: Team 00
edition: FULL_CONTEXT — identity, org, Iron Rules, 8-stage context, SSOT map, task, submission
ssot_basis: entity_dict_v2.0.2 + state_machine_v1.0.2 + uc_catalog_v1.0.3 + ddl_v1.0.1 + routing_spec_v1.0.1 + prompt_arch_v1.0.2---

# ACTIVATION PROMPT — TEAM 100 | STAGE 7 — EVENT & OBSERVABILITY SPEC
## Full Cold-Start Edition

▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼

---

## PART A — IDENTITY & ORG

### A.1 מי אתה

You are **Team 100 — Chief System Architect**.
- **Engine:** Claude Code (local, full repo access)
- **Repo:** `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/`
- **Project:** TikTrack Phoenix / AOS v3 Spec Process
- **Your role:** SPEC AUTHOR only. You write architectural specifications. You do NOT write production code in this context.
- **Operator:** Nimrod (Team 00 — System Designer, the ONLY human in the organization)

---

### A.2 המבנה הארגוני

**IRON RULE: בארגון הזה יש בדיוק אדם אחד: Nimrod (Team 00).**
**כל שאר הצוותות = LLM agents.**

| צוות | זהות | מנוע | תפקיד |
|---|---|---|---|
| **Team 00** | **Nimrod (Human)** | — | System Designer, gate approver, final authority |
| **Team 100** | **אתה — Chief System Architect** | Claude Code | Spec author — stages 2/3/5/6/7 |
| Team 111 | AOS Domain Architect | Cursor Composer | Entity Dictionary + DDL (legacy: team_101) |
| Team 90 | QA Reviewer | OpenAI gpt-4o | Behavioral + use case quality review |
| Team 190 | Spec Validator | OpenAI API | Structural + SSOT consistency review |

**Team numbering convention:** x0 = TikTrack domain (team_10, team_110); x1 = AOS domain (team_11, team_111).
Legacy name team_101 = team_111 (renamed). All SSOT documents use team_111.

---

### A.3 שרשרת סמכות

```
Team 100 כותב Stage 7 spec
    ↓
Team 190 מבקר (structural + SSOT consistency)
    ↓
Team 100 מתקן findings → מגיש מחדש
    ↓  [repeat until PASS]
Team 00 / Nimrod מאשר gate → Stage 7 CLOSED
    ↓
Stage 8 (Module Map + Integration)
```

**אתה לא מאשר gate.** Gate = Nimrod בלבד.
**אתה לא delegate לצוות אחר.** אתה כותב את ה-spec בעצמך.

---

## PART B — IRON RULES לSTAGE 7

1. **SSOT first.** כל event_type, כל field, כל error code — חייב להיגזר מה-SSOT. אל תמציא.
2. **Zero TBD.** כל "TBD" ב-spec שתגיש = MAJOR finding אוטומטי מ-Team 190. הכרע לפני הגשה.
3. **Error Code Registry = exhaustive.** Stage 7 סוגר את רשימת ה-error codes. כל error code מכל שלב קודם (UC Catalog + Routing + Prompt Arch) חייב להופיע.
4. **Event Type Registry = exhaustive.** כל `Event Emitted` ב-State Machine Spec = entry ב-Registry. רשימה חלקית = MAJOR finding.
5. **Append-only.** events table = append-only לצמיתות. אין UPDATE, DELETE, soft-delete. כתוב את זה מפורשות ב-§8.
6. **Field names = DDL v1.0.1 exact.** אל תמציא שמות שדות. DDL v1.0.1 = source of truth.
7. **Query params = typed.** כל פרמטר ב-query_events() + GetHistory חייב: טיפוס, אופציונליות, ברירת מחדל, ולידציה, max (אם רלוונטי).
8. **No UC drift.** לקח Stage 6 F-01 — אל תמציא UC numbers. השתמש רק ב-UC-01..UC-14 מה-UC Catalog v1.0.3.

---

## PART C — AOS v3 8-STAGE CONTEXT

### C.1 Double Spec Principle

> "עדיף לאפיין כפול ולכתוב את הקוד פעם אחת מהר ומדוייק."

כל שלב: Author כותב → Reviewer מוצא → Author מתקן → Gate נועל → שלב הבא.
**Implementation לא מתחיל לפני שכל 8 שלבים approved.**

---

### C.2 סטטוס שלבים

| שלב | כותרת | Author | Reviewer | סטטוס | Canonical Artifact |
|---|---|---|---|---|---|
| 1 | Entity Dictionary | Team 111 | Team 190 | ✅ CLOSED | `_COMMUNICATION/team_111/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md` |
| 2 | State Machine | Team 100 | Team 190 | ✅ CLOSED | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md` |
| 3 | Use Case Catalog | Team 100 | Team 190 | ✅ CLOSED | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md` |
| 4 | DDL | Team 111 | Team 190 | ✅ CLOSED | `_COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md` |
| 5 | Routing Spec | Team 100 | Team 190 | ✅ CLOSED | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.1.md` |
| 6 | Prompt Architecture | Team 100 | Team 90 | ✅ CLOSED | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.2.md` |
| **7** | **Event & Observability** | **Team 100** | **Team 190** | **🔄 ACTIVE** | — (you produce this) |
| 8 | Module Map + Integration | Team 100 | Team 190 | ⏳ PENDING | — |

---

### C.3 Architectural Decisions — Carry Forward to Stage 7

הנחיות ארכיטקטוניות נעולות משלבים קודמים עם השפעה ישירה על Stage 7:

| Decision | מקור | השפעה על Stage 7 |
|---|---|---|
| AD-S5-01 | Routing v1.0.1 | `process_variant` חייב להופיע ב-GetCurrentState response ובpayload של events רלוונטיים |
| AD-S5-02 | Routing v1.0.1 | `assemble_prompt()` נקרא רק כש-`run.status ∈ {IN_PROGRESS, CORRECTION}` — events שקשורים לprompt assembly רק במצבים אלה |
| AD-S5-05 | Routing v1.0.1 | Sentinel field `runs.lod200_author_team` חייב להופיע ב-GetCurrentState response כ-awareness metadata |
| AD-S6-01 | Prompt Arch v1.0.2 | L1+L3 NEVER cached — אין cache events לשכבות אלה |
| AD-S6-02 | Prompt Arch v1.0.2 | Unknown placeholder = `TemplateRenderError` — חייב להופיע ב-Error Code Registry §6 |
| AD-S6-03 | Prompt Arch v1.0.2 | `TemplateNotFound` רק אם אין fallback — חייב ב-§6 |
| AD-S6-04 | Prompt Arch v1.0.2 | `prompts` table = audit/PFS only (לא required לruntime) — אם נכלל, הוא observability בלבד |
| AD-S6-05 | Prompt Arch v1.0.2 | Policy resolver מחזיר full JSON object כשאין `value`/`max` keys (structured policies כמו `token_budget`). אין `PolicyNotFound` error code — resolver מחזיר default בלבד. |
| AD-S6-06 | Prompt Arch v1.0.2 | `IS NOT DISTINCT FROM` לnullable scope columns — applies to events SQL queries too |
| **AD-S6-07** | **Prompt Arch v1.0.2 §10** | **Token budget = advisory only. אין `TOKEN_BUDGET_EXCEEDED` error code ואין event type כזה. Spec amendment נדרש לשנות. §6 Error Code Registry חייב לא לכלול את הcode הזה — הכללתו = MAJOR finding.** |

---

### C.4 Forward Dependencies from Stage 6 — חובה לדעת

שני items קיימים מStage 6 שמשפיעים ישירות על Stage 7:

#### OQ-S7-01 — Admin Management Events (נדחה לStage 8)

**מקור:** Stage 6 §11 (`TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.2.md`)

**הוראה לStage 7:**
- §1 Event Type Registry מכסה **UC-01 עד UC-14 main-flow events בלבד**
- admin management events (TEMPLATE_UPDATED, POLICY_UPDATED, GOVERNANCE_VERSION_BUMPED) = **לא מוגדרים עדיין** (OQ-S3-02 scope)
- **Stage 7 חייב** להכריז במפורש: `OQ-S7-01: Admin management event types (TEMPLATE_UPDATED, POLICY_UPDATED, GOVERNANCE_VERSION_BUMPED) are deferred to Stage 8 pending OQ-S3-02 closure.`
- **לא לנסות להמציא** את ה-event types האלה — הם לא catalog-ized ב-UC Catalog v1.0.3
- הOQ-S7-01 ייסגר בStage 8 כשOQ-S3-02 ייסגר

#### DDL-ERRATA-01 — Partial Unique Index (מקביל, לא חוסם)

**מקור:** Team 111 mandate `TEAM_100_TO_TEAM_111_DDL_ERRATA_PARTIAL_INDEX_MANDATE_v1.0.0.md`

**הוראה לStage 7:**
- Team 111 עובד על הוספת `UNIQUE` partial index ל-`templates(gate_id, phase_id, domain_id) WHERE is_active = 1`
- DDL v1.0.1 = SSOT עדיין; הerrata יהיה v1.0.2 כשיסתיים
- Stage 7 **לא מושפע** — events table לא קשור לtemplates table
- אין צורך להמתין לerrata לפני הגשת Stage 7

---

## PART D — SSOT MAP

קרא את כל 6 הקבצים לפני כתיבת ה-spec. כל ה-claims שלך חייבים להיות מגובים בהם.

### D.1 Entity Dictionary v2.0.2
**Path:** `_COMMUNICATION/team_111/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md`

**Focus לStage 7:**
- **§Event entity** — field table מלא, invariants, relationships (זהו ה-SSOT לschema של §2)
- **§Run entity** — status lifecycle, sentinel field (`lod200_author_team`), `process_variant` field
- **§Gate, §Phase** — id formats, אם phases מקושרות לevents
- **§Team entity** — `actor_team_id` references

**Critical:** כל field name ב-§2 של הspec שלך חייב להתאים ל-entity dictionary. אל תמציא שמות.

---

### D.2 State Machine Spec v1.0.2
**Path:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md`

**Focus לStage 7:**
- **Transition Table** — עמודת `Event Emitted` = מקור canonical לכל event_type
  - כל שורה עם ערך ב-`Event Emitted` = entry אחד ב-§1 Event Type Registry שלך
  - הרשימה חייבת להיות exhaustive — אפס missing events
- **Edge cases section** — אילו events מוצאים בנתיבי שגיאה?
- **Mermaid diagram** — בדוק שכל transition מיוצג

**Critical:** המספר הכולל של event_types ב-§1 חייב להיות ≥ מספר השורות ה-non-null ב-transition table.

---

### D.3 Use Case Catalog v1.0.3
**Path:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md`

**Focus לStage 7:**
- **UC-05: GetCurrentState** — Main Flow + Postconditions = basis ל-§4 שלך
- **UC-06: GetHistory** — Main Flow + query parameters = basis ל-§5 שלך
- **כל Error Flows בכל UC** — כל `error code` מוגדר שם → חייב להופיע ב-§6 Error Code Registry
- **UC-08: ExecuteAgent** — אילו events מוצאים במהלך automatic execution?
- **UC-14: ResetRun** — event emitted on cancel/reset
- **UC-12: UpdateTemplate, UC-13: UpdatePolicy** — אילו events אם בכלל?

**Critical:** UC-05 + UC-06 = ה-UCs הראשיים של Stage 7. ה-spec שלך חייב לממש אותם לחלוטין.

---

### D.4 DDL Spec v1.0.1
**Path:** `_COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md`

**Focus לStage 7:**
- **`events` table** — column definitions מלאות (id, run_id, event_type, gate_id, phase_id, actor_team_id, payload, created_at, etc.)
- **`prompts` table** — אם קיים; AD-S6-04 אומר שהוא audit/PFS only
- **`runs` table** — sentinel field `lod200_author_team`, `process_variant`, `status`
- **Index definitions** על events table — אלו מגדירים את query performance bounds

**Critical:** DDL v1.0.1 = source of truth לfield names ב-§2. כל שם שדה בspec חייב להתאים DDL בדיוק.

---

### D.5 Routing Spec v1.0.1
**Path:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.1.md`

**Focus לStage 7:**
- **Error code `ROUTING_UNRESOLVED`** — definition, when emitted, האם זה event_type או error code בלבד?
- **Sentinel mechanism** — `lod200_author_team` על runs; מה קורה לstate observability כשsentinel active?
- **AD-S5-01 context** — `process_variant` בrouting; חייב להופיע ב-GetCurrentState

---

### D.6 Prompt Architecture Spec v1.0.2
**Path:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.2.md`

**Focus לStage 7:**
- **Error codes:** `TemplateRenderError`, `TemplateNotFound`, `PolicyNotFound`, `INVALID_RUN_STATUS`, `GOVERNANCE_NOT_FOUND` — definitions ו-when raised (§8 EC-01..EC-08)
- **`prompts` table** — AD-S6-04: audit/PFS only; relevance to observability
- **§11 OQ-S7-01 forward dependency** — admin management events (TEMPLATE_UPDATED, POLICY_UPDATED, GOVERNANCE_VERSION_BUMPED) deferred to Stage 8. §1 covers UC-01..UC-14 main-flow events only. See C.4 below.
- **§10 AD-S6-07** — token budget = advisory only; `TOKEN_BUDGET_EXCEEDED` does NOT exist
- **EC-04** — token budget exceeded = `log.warn` only; no event emitted; no error code

---

## PART E — TASK: STAGE 7 EVENT & OBSERVABILITY SPEC

**Deliverable:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_EVENT_OBSERVABILITY_SPEC_v1.0.0.md`

---

### E.1 Purpose of Stage 7

Stage 7 answers three questions:

1. **WHAT events** does the system produce, WHEN are they emitted, and WHAT do they contain? (§1–§2)
2. **HOW do consumers** observe current state and query history? (§3–§5)
3. **WHAT error codes** exist in AOS v3 — exhaustive canonical registry? (§6)

**Stage 7 is NOT the module map.** Stage 7 is the BEHAVIORAL CONTRACT for events, state, and errors. Stage 8 will reference Stage 7 to design the audit, observability, and state modules.

---

### E.2 Required Sections

#### §1 — Event Type Registry

Exhaustive list of all `event_type` values in AOS v3. Derived from State Machine Spec v1.0.2 `Event Emitted` column + UC Catalog error flows.

**Required format — §1.1 Standard Events:**

```markdown
| event_type | Trigger | State Transition | Emitter | Payload Keys | Retention |
|---|---|---|---|---|---|
| INITIATED | UC-01 | IDLE → ACTIVE | system | run_id, wp_id, domain_id, process_variant, initial_gate_id, initial_actor_team_id | permanent |
| GATE_PASSED | UC-02 | GATE_IN_PROGRESS → AWAITING_REVIEW | current_team | run_id, gate_id, phase_id, actor_team_id | permanent |
| GATE_FAILED | UC-03 | GATE_IN_PROGRESS → CORRECTION_CYCLE | current_team | run_id, gate_id, phase_id, actor_team_id, reason | permanent |
| GATE_APPROVED | UC-04 | AWAITING_REVIEW → COMPLETE/next | Nimrod | run_id, gate_id, actor_team_id | permanent |
| RUN_PAUSED | UC-08/SM | * → PAUSED | system | run_id, paused_at_gate_id, paused_at_phase_id, snapshot_ref | permanent |
| RUN_RESUMED | UC-08/SM | PAUSED → IN_PROGRESS | system | run_id, resumed_by, snapshot_source | permanent |
| RUN_COMPLETED | SM | * → COMPLETE | system | run_id, final_gate_id, total_correction_cycles | permanent |
| RUN_CANCELLED | UC-14 | * → CANCELLED | Nimrod | run_id, reason | permanent |
| ... | | | | | |
```

*(Above = example seeds. Derive actual events from SM Spec — do not use these as final.)*

**§1.2 Error Events** (events emitted on error conditions):

```markdown
| event_type | Trigger | Emitter | Payload Keys | Notes |
|---|---|---|---|---|
| ROUTING_UNRESOLVED | routing resolver | system | run_id, gate_id, phase_id, domain_id, process_variant | escalates to team_00 |
| TEMPLATE_RENDER_ERROR | assemble_prompt() | system | run_id, gate_id, template_id, bad_placeholder | AD-S6-02 |
| TEMPLATE_NOT_FOUND | assemble_prompt() | system | run_id, gate_id, phase_id, domain_id | AD-S6-03 |
| ... | | | | |
```

**§1.3 System Events** (not tied to a run, if any — e.g., DOMAIN_REGISTERED, TEAM_REGISTERED):
Include if they exist; justify if none.

**Rules:**
- Zero rows may have vague payload. "see UC" is not a payload spec.
- If an event_type from SM Spec has no entry here → MAJOR finding in Team 190 review.

---

#### §2 — Event Schema

Field-level specification for the `events` table row. **Derived from DDL v1.0.1** — do not invent fields.

**§2.1 Base Schema (all events):**

```markdown
| Field | Type | Nullable | Source | Business Rule |
|---|---|---|---|---|
| id | TEXT | NO | ulid() | PK auto-generated; unique |
| run_id | TEXT | YES* | caller | FK → runs.id; NULL only for system events with no associated run (see §2.3) |
| event_type | TEXT | NO | caller | Must be in Event Type Registry §1; not enforced by DB FK — enforced by append_event() |
| gate_id | TEXT | YES | caller | Gate at emission time; NULL for pre-run / system events |
| phase_id | TEXT | YES | caller | Phase at emission time; NULL if gate is phaseless |
| actor_team_id | TEXT | YES | caller | Team that triggered the event; NULL for automated system events |
| payload | JSONB/JSON | YES | caller | Event-specific (see §2.2); NULL acceptable for simple transitions |
| created_at | TIMESTAMPTZ | NO | DB default (now()) | UTC; set by DB, not caller |
| correlation_id | TEXT | YES | caller | Optional chain key for multi-event sequences (see §7) |
```

*(Verify all column names against DDL v1.0.1 events table — adjust if DDL differs.)*

**§2.2 Payload Schemas (per event_type):**

For EVERY event_type in §1, define the payload JSON schema. Example:

```markdown
#### INITIATED
```json
{
  "wp_id": "string — FK → work_packages.id (not null)",
  "domain_id": "string — FK → domains.id (not null)",
  "process_variant": "TRACK_FULL | TRACK_FOCUSED | TRACK_FAST (not null)",
  "initial_gate_id": "string — first gate of the run",
  "initial_actor_team_id": "string | null — null if routing unresolved at init"
}
```

#### GATE_FAILED
```json
{
  "gate_id": "string",
  "phase_id": "string | null",
  "actor_team_id": "string",
  "reason": "string — free text, max 2000 chars",
  "correction_cycle": "integer — cycle number after this failure"
}
```
[... one block per event_type in §1 ...]
```

**§2.3 NULL run_id Justification:**
If any event_type can have run_id = NULL, justify explicitly. Which events? When? Why?

---

#### §3 — Audit Ledger Contract

Behavioral interface contract. **NOT Python code** — this is the specification that Stage 8's module map will implement.

**§3.1 append_event():**

```markdown
Signature:
  append_event(
    run_id: str | None,
    event_type: str,           ← must be in §1
    gate_id: str | None,
    phase_id: str | None,
    actor_team_id: str | None,
    payload: dict | None,
    correlation_id: str | None = None
  ) -> str                     ← returns event.id (ulid)

Preconditions:
  1. event_type ∈ Event Type Registry §1
  2. If run_id provided → run must exist in DB
  3. If gate_id provided → gate must exist in DB

Postconditions:
  1. One row appended to events table (insert only, never update)
  2. created_at = DB now() (UTC)
  3. id = new ulid()
  4. Returns event.id

Guarantees:
  - Append-only: no UPDATE or DELETE ever issued on events table
  - Non-blocking on callers: caller does not wait for downstream consumers
  - Monotonic ordering: events for a given run_id ordered by created_at ASC
  - No deduplication: same logical event may be appended twice on retry — callers must be idempotent

Error behavior:
  - event_type not in §1 → raise UnknownEventTypeError(event_type)
  - DB write failure → raise AuditLedgerError(reason); caller handles rollback/retry
  - run_id provided but not found → raise RunNotFoundError(run_id)
```

**§3.2 query_events():**

```markdown
Signature:
  query_events(
    run_id:         str | None = None,
    event_type:     str | None = None,
    gate_id:        str | None = None,
    domain_id:      str | None = None,     ← requires JOIN with runs
    actor_team_id:  str | None = None,
    limit:          int = 50,              ← default 50, max 200 (Iron Rule)
    offset:         int = 0,
    order:          "asc" | "desc" = "desc"
  ) -> list[EventRecord]

Rules:
  - All filters AND-combined
  - limit max = 200 (never unlimited)
  - Returns empty list if no matches (never raises on empty result)
  - order applies to created_at
  - domain_id filter requires: events JOIN runs ON events.run_id = runs.id
    WHERE runs.domain_id = :domain_id

SQL contract (canonical):
  SELECT e.*
  FROM events e
  [LEFT JOIN runs r ON e.run_id = r.id]   ← only if domain_id filter present
  WHERE
    (:run_id IS NULL OR e.run_id = :run_id)
    AND (:event_type IS NULL OR e.event_type = :event_type)
    AND (:gate_id IS NULL OR e.gate_id = :gate_id)
    AND (:domain_id IS NULL OR r.domain_id = :domain_id)
    AND (:actor_team_id IS NULL OR e.actor_team_id = :actor_team_id)
  ORDER BY e.created_at {ASC|DESC}
  LIMIT :limit OFFSET :offset
```

---

#### §4 — State Observability (UC-05: GetCurrentState)

**Derive from UC Catalog v1.0.3 §UC-05. This section is the detailed response contract.**

**§4.1 Request:**
```
GET /api/state?domain_id=<domain_id>
```

**§4.2 Response Schema:**

```json
{
  "run_id":           "string | null",
  "wp_id":            "string | null",
  "domain_id":        "string — always present",
  "status":           "IDLE | ACTIVE | GATE_IN_PROGRESS | AWAITING_REVIEW | CORRECTION_CYCLE | COMPLETE | FAILED | PAUSED",
  "current_gate_id":  "string | null",
  "current_phase_id": "string | null",
  "actor": {
    "team_id": "string",
    "label":   "string",
    "engine":  "string"
  } | null,
  "process_variant":  "TRACK_FULL | TRACK_FOCUSED | TRACK_FAST | null",
  "correction_cycle": "integer — 0 if none",
  "sentinel": {
    "active":         "boolean",
    "override_team":  "string | null"
  } | null,
  "step_type":        "PROMPT | TERMINAL | HUMAN_APPROVE | null",
  "next_command":     "string | null",
  "prereq_met":       "boolean"
}
```

**Note:** `sentinel` field = AD-S5-05 compliance. Expose as awareness metadata only. `process_variant` = AD-S5-01.

**§4.3 Assembly Logic:**

Document HOW each field is assembled:
- `status` — from `runs.status`; IDLE if no active run
- `sentinel` — from `runs.lod200_author_team`; `{active: true, override_team: <value>}` if non-null; `{active: false, override_team: null}` if null; entire `sentinel` field = null if no active run
- `process_variant` — from `runs.process_variant`
- `actor` — from routing resolver (current gate + phase + domain + variant); null if PAUSED or no run
- `step_type` — derived from `gates.is_human_gate` + `runs.status`; TERMINAL if COMPLETE/FAILED; null if no run
- `next_command` — CLI command string for the next action; null if TERMINAL or HUMAN_APPROVE

**§4.4 No-Run Case (status = IDLE):**
When no active run for domain_id:
- `run_id`, `wp_id`, `current_gate_id`, `current_phase_id`, `actor`, `process_variant`, `sentinel`, `step_type`, `next_command` = null
- `correction_cycle` = 0
- `prereq_met` = false

---

#### §5 — History Queries (UC-06: GetHistory)

**Derive from UC Catalog v1.0.3 §UC-06. Detailed contract for the history endpoint.**

**§5.1 Request:**
```
GET /api/history
```

**§5.2 Query Parameters:**

| Param | Type | Required | Default | Max | Validation |
|---|---|---|---|---|---|
| domain_id | string | NO | null (all) | — | must exist in domains table if provided |
| run_id | string | NO | null | — | must be valid ulid if provided |
| gate_id | string | NO | null | — | must exist in gates table if provided |
| event_type | string | NO | null | — | must be in §1 registry if provided |
| actor_team_id | string | NO | null | — | must exist in teams table if provided |
| limit | integer | NO | 50 | 200 | clamp to 200, reject if < 1 |
| offset | integer | NO | 0 | — | reject if < 0 |
| order | "asc"\|"desc" | NO | "desc" | — | reject if neither |

**§5.3 Response Schema:**

```json
{
  "total":  "integer — count of all matching rows before pagination",
  "limit":  "integer — effective limit applied",
  "offset": "integer — effective offset applied",
  "items": [
    {
      "id":             "string",
      "run_id":         "string | null",
      "event_type":     "string",
      "gate_id":        "string | null",
      "phase_id":       "string | null",
      "actor_team_id":  "string | null",
      "payload":        "object | null",
      "created_at":     "ISO-8601 UTC — e.g. 2026-03-26T10:00:00Z"
    }
  ]
}
```

**§5.4 Pagination Contract:**
- `total` = COUNT(*) of all matching rows (separate query or window function)
- `items` = rows [offset, offset+limit)
- If offset ≥ total: return `items: []`, `total: N`
- `total` is always the unfiltered total for given params (not just this page)

---

#### §6 — Error Code Registry

Canonical, exhaustive list of all error codes in AOS v3. **Stage 7 closes this list.**
Derived from: UC Catalog (all Error Flows) + Routing Spec + Prompt Arch Spec + Stage 7 new codes.

**Required format:**

```markdown
| Error Code | Category | Source Stage | UC/Component | HTTP Status | Description | Retry? |
|---|---|---|---|---|---|---|
| RUN_ALREADY_ACTIVE | APPLICATION | Stage 3 | UC-01 | 409 | Active run already exists for domain_id | No |
| UNKNOWN_WP | APPLICATION | Stage 3 | UC-01 | 404 | wp_id not found in work_packages | No |
| UNKNOWN_DOMAIN | APPLICATION | Stage 3 | UC-01 | 404 | domain_id not found in domains | No |
| RUN_NOT_FOUND | APPLICATION | Stage 3 | UC-02/03 | 404 | run_id does not exist | No |
| WRONG_ACTOR | APPLICATION | Stage 3 | UC-02/03 | 403 | Requesting team is not current_actor for this run | No |
| INVALID_TRANSITION | APPLICATION | Stage 2/3 | UC-02/03 | 422 | Requested state transition not permitted (SM constraint) | No |
| ROUTING_UNRESOLVED | APPLICATION | Stage 5 | routing | 500 | No routing rule matched; auto-escalates to team_00 | No |
| TEMPLATE_NOT_FOUND | APPLICATION | Stage 6 | assemble_prompt() | 500 | No template found for gate/phase/domain after all fallbacks exhausted | No |
| TEMPLATE_RENDER_ERROR | APPLICATION | Stage 6 | assemble_prompt() | 500 | Template contains unknown placeholder; AD-S6-02 | No |
| POLICY_NOT_FOUND | APPLICATION | Stage 6 | _get_policy_value() | 500 | Policy key not found in policies table | No |
| UNKNOWN_EVENT_TYPE | APPLICATION | Stage 7 | append_event() | — | event_type not in §1 registry; internal error (never exposed to API) | No |
| AUDIT_LEDGER_ERROR | SYSTEM | Stage 7 | append_event() | 500 | DB failure during event insert | Yes (idempotent) |
| INVALID_HISTORY_PARAMS | APPLICATION | Stage 7 | query_events() | 400 | Invalid combination or value of history query params | No |
| ... | | | | | | |
```

**Rules:**
- All error codes from UC Catalog Error Flows (UC-01..UC-14) = included
- All error codes from Routing Spec = included
- All error codes from Prompt Arch Spec = included
- New Stage 7 codes (UNKNOWN_EVENT_TYPE, AUDIT_LEDGER_ERROR, INVALID_HISTORY_PARAMS) = included
- `Retry?` = whether caller may safely retry with same arguments
- HTTP Status = for API-exposed errors; "—" for internal-only
- Categories: APPLICATION (domain logic), SYSTEM (infrastructure), VALIDATION (input)

*(Above = seed. Derive actual complete list from SSOT — UC Catalog error flows are authoritative.)*

---

#### §7 — Correlation Model

Documents how events are chained and correlated.

**Required content:**

**§7.1 correlation_id Usage:**
- What is `correlation_id` for? (optional cross-event chain key)
- When is it set vs null?
- Example: prompt assembly chain — ROUTING_RESOLVED → PROMPT_ASSEMBLED → PROMPT_DELIVERED → each carries same correlation_id?
- Is it enforced by DB? (no — advisory)

**§7.2 Run History Reconstruction:**
Given run_id, how is a complete run timeline assembled?
```
SELECT * FROM events WHERE run_id = :run_id ORDER BY created_at ASC
```
- Every state transition has exactly one event (or N? Define the rule.)
- Events sufficient to reconstruct run state without reading runs table?

**§7.3 Cross-Run Events:**
- Do any event_types exist without run_id? (DOMAIN_REGISTERED, TEAM_REGISTERED, etc.)
- If yes: how are they correlated? domain_id in payload?
- If no: state that explicitly.

---

#### §8 — Consistency Guarantees

**Required content (all 4 items):**

**§8.1 Pipeline State vs Events Table:**
- `pipeline_state.json` (v3 equivalent) vs `events` table: what consistency guarantee?
- If events table write fails after state transition: define the policy.
  Options: (A) rollback state transition, (B) retry event, (C) log inconsistency + alert
  → Choose one. Justify. This is an architectural decision (AD-S7-0X if new).

**§8.2 Idempotency:**
- Can the same logical event be appended twice (e.g., on retry after timeout)?
- What prevents duplicate events in the DB? (hint: probably nothing — ulid is always unique)
- Policy: at-least-once delivery with advisory correlation_id for deduplication?

**§8.3 Ordering Guarantee:**
- Events for a given run_id are ordered by created_at ASC — guaranteed by created_at timestamp
- Is there a race condition risk between concurrent operations on the same run?
- AOS v3 assumption: single-threaded per domain (one active run per domain at a time) — does this eliminate ordering concerns?

**§8.4 Append-Only Statement (formal):**
Write the formal guarantee:
> "The events table is append-only. No UPDATE or DELETE statement is ever issued against this table by any AOS v3 component. This is an Iron Rule. Violation = system integrity failure."

---

#### §9 — Test Cases (minimum 8, target 10–12)

Each TC: deterministic, no hedging, exact expected outcome.

**Required format:**

```markdown
| TC | Name | Inputs | Expected Output | Error Code if Error |
|---|---|---|---|---|
| TC-01 | GetHistory — no filters returns recent events (desc) | GET /api/history | 200; items ordered by created_at DESC; total=N | — |
| TC-02 | GetHistory — domain_id filter | domain_id=tiktrack | only events where associated run.domain_id=tiktrack | — |
| TC-03 | GetHistory — limit clamped at 200 | limit=500 | effective limit=200 OR 400 INVALID_HISTORY_PARAMS (choose and justify) | INVALID_HISTORY_PARAMS |
| TC-04 | GetHistory — unknown event_type filter | event_type=NOT_REAL | 400 INVALID_HISTORY_PARAMS | INVALID_HISTORY_PARAMS |
| TC-05 | GetCurrentState — no active run | domain_id with no run | status=IDLE, run_id=null, all nulls, prereq_met=false | — |
| TC-06 | GetCurrentState — PAUSED run with sentinel | run PAUSED + lod200_author_team=team_30 | status=PAUSED, sentinel={active:true, override_team:team_30} | — |
| TC-07 | append_event — unknown event_type | event_type=INVENTED | UnknownEventTypeError raised | UNKNOWN_EVENT_TYPE |
| TC-08 | History — pagination | limit=10, offset=10, 25 total events | items[10..19], total=25 | — |
| TC-09 | GetCurrentState — sentinel null (no override) | run with lod200_author_team=null | sentinel={active:false, override_team:null} | — |
| TC-10 | append_event — run_id provided but run not found | run_id=nonexistent | RunNotFoundError | RUN_NOT_FOUND |
```

Minimum 8. Cover: GetHistory filters, GetCurrentState all states, append_event errors, pagination, sentinel exposure, correlation.

---

#### §10 — Edge Cases (minimum 5, target 6–8)

```markdown
| EC | Scenario | Handling | AD Reference |
|---|---|---|---|
| EC-01 | DB write for event fails AFTER state transition succeeds | Policy: [choose A/B/C from §8.1] + emit AuditLedgerError | AD-S7-0X if new decision |
| EC-02 | GetHistory with both run_id and domain_id that don't match | Apply both filters (AND); returns empty items — no error | — |
| EC-03 | GetHistory returns 0 results | 200 with items=[], total=0 — never 404 | — |
| EC-04 | Two events for same run_id at identical created_at (clock collision) | Ordering within same millisecond is by id (ulid sortable by time) | — |
| EC-05 | New event_type introduced in future (OQ-S3-02 scope) | Registry in §1 is additive; query_events() with unknown event_type filter → INVALID_HISTORY_PARAMS | — |
| EC-06 | PAUSED run — GetCurrentState actor field | actor = null (AD-S5-02: routing not called for PAUSED runs) | AD-S5-02 |
| EC-07 | correlation_id reuse across different runs | Allowed; correlation_id is advisory — no uniqueness constraint | — |
| EC-08 | GetCurrentState called during CORRECTION_CYCLE | Returns status=CORRECTION_CYCLE, correction_cycle=N, actor=current_team | — |
```

---

### E.3 Format Requirements

- **Language:** English (Hebrew acceptable for rationale/notes)
- **Header:** YAML front matter — id, from, to, date, type, stage, reviewer, ssot_basis (all 6 files)
- **Sections:** §1 through §10 in order, no skipping
- **Tables:** pipe-table format (Markdown)
- **Code blocks:** fenced with language hint (```python, ```json, ```sql, ```markdown)
- **Version:** v1.0.0 (initial submission)
- **Field names:** must match DDL v1.0.1 exactly — Team 190 WILL check

---

### E.4 Prohibited Content

- ❌ No production code (Python implementations, actual SQL execution scripts)
- ❌ No "TBD", "TODO", or "to be determined" anywhere in the spec
- ❌ Invented field names not in Entity Dictionary v2.0.2 or DDL v1.0.1
- ❌ Invented UC numbers not in UC Catalog v1.0.3 (Stage 6 F-01 lesson)
- ❌ Incomplete Event Type Registry (every SM transition must be covered)
- ❌ Incomplete Error Code Registry (every UC error flow must be covered)

---

## PART F — SUBMISSION

### F.1 Deliverable

| Field | Value |
|---|---|
| **File** | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_EVENT_OBSERVABILITY_SPEC_v1.0.0.md` |
| **Version** | v1.0.0 (initial submission) |
| **Format** | Markdown with YAML front matter |

---

### F.2 Review Request to Team 190

After completing the spec, create:
**`_COMMUNICATION/team_190/TEAM_100_TO_TEAM_190_STAGE7_EVENT_OBSERVABILITY_REVIEW_REQUEST_v1.0.0.md`**

Include:
- Artifact path + version
- Stage: SPEC_STAGE_7
- SSOT basis (all 6 file paths)
- Correction cycle: 0
- Focus areas for Team 190:

```
Focus Area 1 — SSOT Alignment (Event Types)
  → Verify §1 Event Type Registry covers EVERY non-null "Event Emitted" in SM Spec v1.0.2
  → Any missing event_type = MAJOR

Focus Area 2 — DDL Consistency (Event Schema)
  → Verify §2 field names match DDL v1.0.1 events table exactly
  → Any invented or mismatched field name = MAJOR

Focus Area 3 — Error Code Completeness
  → Verify §6 includes ALL error codes from UC Catalog (all Error Flows), Routing Spec, Prompt Arch Spec
  → Any missing error code = MAJOR

Focus Area 4 — UC-05/UC-06 Coverage
  → Verify §4 and §5 match UC Catalog v1.0.3 §UC-05 and §UC-06 exactly
  → Missing field in GetCurrentState or GetHistory = MAJOR

Focus Area 5 — AD Carry-Forward Compliance
  → AD-S5-01: process_variant in GetCurrentState response → in §4
  → AD-S5-05: sentinel exposed as awareness metadata in GetCurrentState → in §4
  → AD-S6-02: TemplateRenderError in Error Code Registry → in §6
  → AD-S6-04: prompts table = audit/PFS only → addressed in §8 or §7
  → AD-S6-07: TOKEN_BUDGET_EXCEEDED must NOT appear in §6 Error Code Registry or §1 Event Type Registry (advisory only — no event, no error code; presence = MAJOR finding)
  → Non-compliance = MAJOR

Focus Area 6 — Consistency Guarantees Completeness
  → §8.1 state-vs-events consistency policy must be defined (choose A/B/C, not left open)
  → §8.4 append-only formal statement must be present
  → Vague/absent = MINOR
```

---

### F.3 Completion Report to Team 00 (Gate)

After Team 190 PASS:
**`_COMMUNICATION/team_100/TEAM_100_STAGE7_EVENT_OBSERVABILITY_COMPLETION_REPORT_v1.0.0.md`**

Include:
- Gate verdict chain table (round, reviewer, artifact, verdict, findings)
- Findings closure table
- New ADs (AD-S7-*) if any new architectural decisions were made
- Updated Stage Completion Matrix (7 of 8 CLOSED)
- Stage 8 (Module Map + Integration) = next

---

## PART G — ARTIFACT INDEX MAINTENANCE

After completing and submitting Stage 7, update:
**`_COMMUNICATION/team_00/AOS_V3_SPEC_ARTIFACT_INDEX_v1.0.0.json`**

Required updates:
```json
"_meta": {
  "version": "1.20.0",
  "current_spec_stage": "STAGE_7_ACTIVE",
  "updated_by": "team_100",
  "updated_at": "2026-03-26"
}
```

New entries to add (minimum):
1. Stage 7 spec deliverable: `TEAM_100_AOS_V3_EVENT_OBSERVABILITY_SPEC_v1.0.0.md` — type: DELIVERABLE, status: ACTIVE
2. Review request to Team 190: `TEAM_100_TO_TEAM_190_STAGE7_EVENT_OBSERVABILITY_REVIEW_REQUEST_v1.0.0.md` — type: NOTIFICATION, status: ACTIVE

**Note:** Team 00 adds the activation prompt entry (A074). Team 100 adds spec + review request entries.

---

▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

**log_entry | TEAM_00 | STAGE7_EVENT_OBSERVABILITY_ACTIVATED | APPROVED | 2026-03-26**
**Stage 6 CLOSED — Gate approved by Team 00 (Nimrod). Stage 7 = ACTIVE. Author: Team 100. Reviewer: Team 190.**
