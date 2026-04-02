---
id: TEAM_100_ACTIVATION_PROMPT_STAGE8_MODULE_MAP_INTEGRATION_v1.0.0
historical_record: true
from: Team 00 (Nimrod — System Designer)
to: Team 100 (Chief System Architect — Claude Code)
date: 2026-03-26
type: ACTIVATION_PROMPT — FULL COLD-START — paste-ready for Claude Code session
task: AOS v3 Spec — Stage 8: Module Map + Integration Spec
stage: SPEC_STAGE_8
artifact_id: A094
reviewer: Team 190
gate_approver: Team 00
edition: FULL_CONTEXT — identity, org, Iron Rules, 8-stage context, SSOT map (7 files), OQ closures, task, submission
ssot_basis: entity_dict_v2.0.2 + state_machine_v1.0.2 + uc_catalog_v1.0.3 + ddl_v1.0.1 + routing_spec_v1.0.1 + prompt_arch_v1.0.2 + event_observability_v1.0.2
note: FINAL SPEC STAGE — gate approval unlocks BUILD---

# ACTIVATION PROMPT — TEAM 100 | STAGE 8 — MODULE MAP + INTEGRATION SPEC
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
| **Team 100** | **אתה — Chief System Architect** | Claude Code | Spec author — stages 2/3/5/6/7/**8** |
| Team 111 | AOS Domain Architect | Cursor Composer | Entity Dictionary + DDL (legacy: team_101) |
| Team 190 | Spec Validator | OpenAI API | Structural + SSOT consistency review |
| Team 90 | QA Reviewer | OpenAI gpt-4o | Behavioral + use case quality review |

**Team numbering convention:** x0 = TikTrack domain; x1 = AOS domain.
Legacy name team_101 = team_111 (renamed). All SSOT documents use team_111.

---

### A.3 שרשרת סמכות

```
Team 100 כותב Stage 8 spec (אתה — עכשיו)
    ↓
Team 190 מבקר (structural + SSOT consistency)
    ↓
Team 100 מתקן findings → מגיש מחדש
    ↓  [repeat until PASS]
Team 00 / Nimrod מאשר gate → Stage 8 CLOSED
    ↓
BUILD — Teams 10/11/61 מממשים
```

**אתה לא מאשר gate.** Gate = Nimrod בלבד.
**אתה לא delegate לצוות אחר.** אתה כותב את ה-spec בעצמך.
**זהו השלב האחרון.** Stage 8 gate approval = unlock BUILD.

---

## PART B — IRON RULES לSTAGE 8

1. **SSOT first.** כל module, כל endpoint, כל interface type — חייב להיגזר מה-SSOT. לא ממציאים.
2. **Zero TBD.** כל "TBD" ב-spec שתגיש = MAJOR finding אוטומטי מ-Team 190.
3. **כל UC-01..UC-14 חייב להיות implemented בdefinitely one module.** רשימת UC mappings חייבת exhaustive. UC חסר = MAJOR.
4. **Interface contracts = fully typed.** כל function: signature מלא (types, optionality, defaults), return type, exceptions. "ראה spec" לא מספיק.
5. **No circular imports.** Module dependency graph חייב להיות acyclic. הגדר dependency order מפורש.
6. **OQ-S7-01 + OQ-S3-02 חייבים להיסגר בשלב זה.** Stage 8 = הזדמנות האחרונה לפני BUILD. "נדחה" לא מקובל.
7. **DDL-ERRATA-01 awareness.** Team 111 עובד על errata (partial unique index). SSOT = DDL v1.0.1 עד שהerrata complete. ציין בspec מפורשות.
8. **כל endpoint חייב:** method, path, request schema (typed), response schema (typed), error codes (מתוך §6 של Stage 7 בלבד).
9. **Module boundaries = spec stage scope.** State module = Stage 2, Routing module = Stage 5, Prompting module = Stage 6, Audit module = Stage 7. אין crossing.
10. **Integration test cases = deterministic.** מינימום 12. אין "should work" — כל TC: inputs, expected output, מקור spec.

---

## PART C — CONTEXT: AOS v3 SPEC PROCESS

### C.1 תיאור הפרויקט

AOS v3 (Agents OS version 3) = מערכת pipeline לניהול LLM agents בתהליכי פיתוח. המערכת מנהלת:
- **Runs** — מחזורי pipeline על work packages
- **Routing** — מי מטפל בכל gate/phase/domain/variant
- **Prompts** — הרכבת פרומפטים 4-שכבתיים
- **Events** — audit ledger append-only של כל transition
- **State** — observability ושאילתות על מצב נוכחי

v3 = greenfield בתיקיית `agents_os_v3/` (v2 קיים ב-`agents_os_v2/`, לא משנים).

### C.2 סטטוס שלבים — כולם CLOSED חוץ מ-8

| שלב | כותרת | Author | Reviewer | סטטוס | Canonical Artifact |
|---|---|---|---|---|---|
| 1 | Entity Dictionary | Team 111 | Team 190 | ✅ CLOSED | `_COMMUNICATION/team_111/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md` |
| 2 | State Machine | Team 100 | Team 190 | ✅ CLOSED | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md` |
| 3 | Use Case Catalog | Team 100 | Team 190 | ✅ CLOSED | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md` |
| 4 | DDL | Team 111 | Team 190 | ✅ CLOSED *(errata active)* | `_COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md` |
| 5 | Routing Spec | Team 100 | Team 190 | ✅ CLOSED | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.1.md` |
| 6 | Prompt Architecture | Team 100 | Team 90 | ✅ CLOSED | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.2.md` |
| 7 | Event & Observability | Team 100 | Team 190 | ✅ CLOSED | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_EVENT_OBSERVABILITY_SPEC_v1.0.2.md` |
| **8** | **Module Map + Integration** | **Team 100** | **Team 190** | **🔄 ACTIVE** | — (you produce this) |

---

### C.3 Architectural Decisions — Carry Forward לStage 8

כל ה-ADs מ-Stages 5–7 בתוקף ומחייבים את Module Map:

| AD | מקור | השפעה על Stage 8 |
|---|---|---|
| **AD-S5-01** | Routing v1.0.1 | `process_variant` חייב להופיע ב-`resolver.py` signature + API /api/state response |
| **AD-S5-02** | Routing v1.0.1 | `resolve_actor()` לא נקרא ל-PAUSED runs. `machine.py` חייב לאכוף. |
| **AD-S5-03** | Routing v1.0.1 | UC-08 Branch A: snapshot קריאה ישירה — אין routing query בresume. `machine.py` בlantch|
| **AD-S5-05** | Routing v1.0.1 | Sentinel `runs.lod200_author_team` חייב להיות exposed ב-`/api/state` כ-awareness metadata |
| **AD-S6-01** | Prompt Arch v1.0.2 | L1+L3 NEVER cached. `cache.py` במodule prompting = L2/L4 בלבד |
| **AD-S6-02** | Prompt Arch v1.0.2 | `builder.py` מ-raise `TemplateRenderError` על unknown placeholder — hard failure |
| **AD-S6-03** | Prompt Arch v1.0.2 | Template specificity chain: phase+domain > phase-only > domain-only > gate-default |
| **AD-S6-04** | Prompt Arch v1.0.2 | `prompts` table = audit/PFS only. `builder.py` לא חייב INSERT. Module prompting לא מחזיק ownership על `prompts` |
| **AD-S6-05** | Prompt Arch v1.0.2 | Policy resolver מחזיר full JSON object לstructured policies — אין POLICY_NOT_FOUND error |
| **AD-S6-06** | Prompt Arch v1.0.2 | `templates.py` queries משתמשים ב-`IS NOT DISTINCT FROM` לnullable scope columns |
| **AD-S6-07** | Prompt Arch v1.0.2 | Token budget = advisory only. `builder.py` logs warning only. אין `TOKEN_BUDGET_EXCEEDED`. |
| **AD-S7-01** | Event & Observability v1.0.2 | State transitions + event emissions = atomic DB transaction. `machine.py` חייב לכלול event INSERT באותו TX כ-runs UPDATE |

---

### C.4 Open Questions — חייבים להיסגר ב-Stage 8

**⚠️ Stage 8 הוא הזדמנות האחרונה. OQs שלא נסגרים כאן = drift לBUILD.**

#### OQ-S3-02 — Admin Management UCs (נדחה מStage 3)

**תיאור:** template ו-policy management operations לא cataloged כ-formal UCs ב-UC Catalog v1.0.3.
פעולות שצריכות להיסגר: UpdateTemplate, UpdatePolicy, governance version bump.

**Stage 8 חייב להכריע:**
- אילו UCs נוספים נדרשים? (UC-15, UC-16, ... או extension של UC-12?)
- מי רשאי לבצע? (`team_00` בלבד? כל `human` actor?)
- האם דורשים event emission (→ OQ-S7-01) או administrative-only?
- Module ownership: `management/use_cases.py` + `management/api.py`?

**אם ההכרעה היא: "administrative only, no formal UC"** — הכרז מפורשות עם נימוק + lock as AD-S8-XX.
**אם ההכרעה היא: "formal UCs required"** — הגדר UC-15..N בתוך Stage 8 spec, לא בUC Catalog (Stage 3 closed).

#### OQ-S7-01 — Admin Management Event Types (נדחה מStage 7)

**תיאור:** TEMPLATE_UPDATED, POLICY_UPDATED, GOVERNANCE_VERSION_BUMPED — deferred pending OQ-S3-02 closure.

**Stage 8 חייב להכריע:**
- אם OQ-S3-02 נסגר עם formal UCs → define these event_types + add to §1 of Event & Observability Spec as amendment note
- אם OQ-S3-02 נסגר עם "administrative only" → declare these events will NEVER be emitted; lock as AD-S8-XX

**⚠️ לא מקובל:** "נדחה לBUILD" / "implementation יחליט".

---

### C.5 DDL-ERRATA-01 — Awareness

Team 111 mandate `TEAM_100_TO_TEAM_111_DDL_ERRATA_PARTIAL_INDEX_MANDATE_v1.0.0.md` פעיל.

| פריט | מצב |
|---|---|
| Target index | `UNIQUE` partial index על `templates(gate_id, phase_id, domain_id) WHERE is_active = 1` |
| SSOT כרגע | DDL v1.0.1 — ה-index **לא קיים עדיין** |
| Defense-in-depth | `ORDER BY specificity DESC, version DESC LIMIT 1` בSTAGE 6 §2.3 |
| השפעה על Stage 8 | SSOT = DDL v1.0.1 בעת כתיבה. אם errata מושלמת במהלך Stage 8, ציין DDL v1.0.2 |
| Module impact | `templates.py` (`prompting` module) — צריין ב-interface contract שה-uniqueness enforced application-layer |

---

## PART D — SSOT MAP

קרא את כל 7 הקבצים לפני כתיבת ה-spec. כל claim חייב להיות מגובה בהם.

### D.1 Entity Dictionary v2.0.2
**Path:** `_COMMUNICATION/team_111/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md`

**Focus לStage 8:**
- **§Run** — כל fields; status lifecycle; `lod200_author_team` (sentinel); `process_variant` (NOT NULL)
- **§Event** — base schema; invariants (append-only, run_id NOT NULL)
- **§RoutingRule** — `resolve_from_state_key` (sentinel source); uniqueness invariant
- **§Template** — `is_active`, `body_markdown`, `version` — naming exact
- **§Assignment** — FKs: `role_id`, `team_id`, `domain_id` (no `run_id`!)
- **§GateRoleAuthority** — dual authority model; FK structure

---

### D.2 State Machine Spec v1.0.2
**Path:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md`

**Focus לStage 8:**
- **Transition Table** — כל transition + `Event Emitted` column → maps to `machine.py` handler names
- **States** — IN_PROGRESS, CORRECTION, PAUSED, COMPLETE, NOT_STARTED — חייבים להיות enum/constants ב-`state/models.py`
- **Edge cases** — PAUSED + CORRECTION edge cases → exception handling ב-`machine.py`

---

### D.3 Use Case Catalog v1.0.3
**Path:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md`

**Focus לStage 8:**
- **UC-01..UC-14 מיפוי לmodules** — כל UC חייב להיות ב-exactly one module
- **UC-13: GetCurrentState (QO-01)** — maps to `/api/state` endpoint; `management/api.py` delegates to `state/repository.py`
- **UC-14: GetHistory (QO-02)** — maps to `/api/history` endpoint; `management/api.py` delegates to `audit/ledger.py`
- **UC-12: PrincipalOverride** — FORCE_PASS/FAIL/PAUSE/RESUME/CORRECTION actions → `management/use_cases.py`
- **Error codes** — כל error code מ-UC error flows חייב להיות defined ב-API spec (§6 Stage 7 = exhaustive list)

---

### D.4 DDL Spec v1.0.1
**Path:** `_COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_SPEC_v1.0.1.md`

**Focus לStage 8:**
- **Table names** — canonical table names עבור SQL בinterface contracts (לא ORM names)
- **`runs` table** — כל columns; index definitions; NOT NULL constraints
- **`events` table** — append-only; `sequence_no` + `event_hash` uniqueness; index definitions
- **`routing_rules` table** — uniqueness constraint `uq_rr_sentinel_context`; `resolve_from_state_key`
- **`gate_role_authorities` table** (plural — canonical name per Team 190 approval)
- **DDL-ERRATA-01 note** — `templates` partial index = pending; `templates.py` must handle application-layer

---

### D.5 Routing Spec v1.0.1
**Path:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_ROUTING_SPEC_v1.0.1.md`

**Focus לStage 8:**
- **`resolve_actor()` algorithm** — canonical SQL (ROW_NUMBER() + priority) → maps to `routing/resolver.py`
- **Sentinel detection** — `runs.lod200_author_team` IS NOT NULL → skip routing query; AD-S5-05
- **PAUSED boundary** — `resolve_actor()` not called for PAUSED runs; AD-S5-02
- **ROUTING_UNRESOLVED** escalation → `team_00` alert mechanism in `routing/resolver.py`
- **Error codes** — ROUTING_UNRESOLVED, ROUTING_MISCONFIGURATION, VARIANT_IMMUTABLE → all in API spec

---

### D.6 Prompt Architecture Spec v1.0.2
**Path:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_PROMPT_ARCH_SPEC_v1.0.2.md`

**Focus לStage 8:**
- **`assemble_prompt()` precondition** — `run.status ∈ {IN_PROGRESS, CORRECTION}` (AD-S5-02); מוגדר ב-`prompting/builder.py`
- **L2 cache** — `l2:{team_id}:{governance_version}` → `prompting/cache.py`
- **L4 cache** — `l4:{gate_id}:{phase_id}:{domain_id}:{version}` → `prompting/cache.py`
- **`TEMPLATE_LOOKUP_SQL`** — `IS NOT DISTINCT FROM` (AD-S6-06); `is_active=1` filter — `prompting/templates.py`
- **§10 AD-S6-07** — token budget advisory; `_check_token_budget()` = log.warn only
- **§11 OQ-S7-01** — admin management event types deferred; Stage 8 closes this

---

### D.7 Event & Observability Spec v1.0.2
**Path:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_EVENT_OBSERVABILITY_SPEC_v1.0.2.md`

**Focus לStage 8:**
- **`append_event()` signature** (§3.1) → maps to `audit/ledger.py`
- **`query_events()` signature** (§3.2) → maps to `audit/ledger.py`
- **AD-S7-01: Atomic TX** (§8.1) — `machine.py` חייב לכלול `append_event()` באותו transaction כ-`UPDATE runs`
- **§1.4 OQ-S7-01** — admin events deferred; Stage 8 closes here
- **§6 Error Code Registry (39 codes)** — exhaustive list; כל API endpoint error חייב להיות מתוך הרשימה הזו בלבד
- **§4 GetCurrentState response schema** → `/api/state` response = exact match
- **§5 GetHistory response schema** → `/api/history` response = exact match

---

## PART E — TASK: STAGE 8 MODULE MAP + INTEGRATION SPEC

**Deliverable:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.0.md`

---

### E.1 Purpose of Stage 8

Stage 8 answers four questions:

1. **WHERE** does each spec concept live in code? (§1–§2: Module Map + UC Mapping)
2. **HOW** do modules communicate? (§3: Interface Contracts)
3. **WHAT** does the external API look like? (§4: API Spec)
4. **WHAT** open questions remain and how are they resolved? (§5: OQ Closures)

**Stage 8 = כרטיס הכניסה ל-BUILD.** Stage 8 spec = architectural blueprint שTeam 61/10/11 עובדים לפיו.

---

### E.2 Required Sections

#### §1 — Directory Structure

Complete, exhaustive file tree של `agents_os_v3/`. כל קובץ עם תפקידו.

**Required top-level structure (from Spec Process Plan §ג שלב 7+8):**

```
agents_os_v3/
├── definition.yaml              # SSOT — gates, phases, teams, routing rules (seed data)
├── seed.py                      # imports definition.yaml → DB initialization
├── modules/
│   ├── definitions/             # Stage 1 domain: entities, queries, constants
│   │   ├── __init__.py
│   │   ├── models.py            # dataclasses / TypedDicts for all entities
│   │   └── queries.py           # read-only DB queries (gates, phases, teams lookup)
│   ├── state/                   # Stage 2 domain: transitions, run lifecycle
│   │   ├── __init__.py
│   │   ├── machine.py           # transition handlers (AD-S7-01: atomic TX)
│   │   ├── repository.py        # runs table CRUD + pipeline_state.json projection
│   │   └── models.py            # Run, RunStatus enum, snapshot models
│   ├── routing/                 # Stage 5 domain: actor resolution
│   │   ├── __init__.py
│   │   └── resolver.py          # resolve_actor() (AD-S5-01/02/05)
│   ├── prompting/               # Stage 6 domain: 4-layer prompt assembly
│   │   ├── __init__.py
│   │   ├── builder.py           # assemble_prompt() (AD-S6-01/02/03/07)
│   │   ├── cache.py             # L2/L4 version-keyed cache (AD-S6-01)
│   │   └── templates.py         # templates table CRUD (DDL-ERRATA-01 note)
│   ├── audit/                   # Stage 7 domain: event ledger
│   │   ├── __init__.py
│   │   └── ledger.py            # append_event(), query_events() (AD-S7-01)
│   ├── policy/                  # Stage 6 domain: token/cache policy
│   │   ├── __init__.py
│   │   └── settings.py          # policies table CRUD
│   ├── management/              # Stage 3 domain: UC-01..UC-14 implementations
│   │   ├── __init__.py
│   │   ├── use_cases.py         # UC-01..UC-14 (+ OQ-S3-02 resolution)
│   │   └── api.py               # HTTP layer (FastAPI)
│   └── governance/              # WP artifact + archive management (§ו.6 addendum)
│       ├── __init__.py
│       ├── artifact_index.py    # CRUD for wp_artifact_index
│       └── archive.py           # archive manifest generation; Team 191 integration
├── cli/
│   └── pipeline_run.sh          # v3 CLI wrapper
└── ui/
    ├── index.html               # Pipeline View (/)
    ├── history.html             # History View (/history)
    ├── config.html              # Configuration (/config)
    ├── app.js                   # reads /api/state → renders; NO business logic
    └── style.css
```

**עבור כל קובץ ציין:** purpose בשורה אחת + לאיזה SSOT stage הוא שייך.

---

#### §2 — UC Implementation Map

Exhaustive mapping: כל UC-01..UC-14 → exactly one module + function.

**Required format:**

```markdown
| UC | Name | Module | Function | Notes |
|---|---|---|---|---|
| UC-01 | InitiateRun | management/use_cases.py | `initiate_run(wp_id, domain_id, execution_mode, process_variant)` | calls routing/resolver.py + audit/ledger.py in atomic TX |
| UC-02 | AdvanceGate | management/use_cases.py | `advance_gate(run_id, actor_team_id, verdict)` | delegates to state/machine.py + audit/ledger.py |
| ... | | | | |
| UC-13 | GetCurrentState | management/use_cases.py | `get_current_state(run_id?, domain_id?)` | read-only; delegates to state/repository.py |
| UC-14 | GetHistory | management/use_cases.py | `get_history(...)` | read-only; delegates to audit/ledger.py |
```

**Rules:**
- אפס UCs ריקים — כל UC חייב function מלא
- UCs מ-OQ-S3-02 closure (אם הוחלט לformulatize) = UC-15+ כאן

---

#### §3 — Module Interface Contracts

עבור כל module הגדר את ה-public interface המלא.

**Required format per function:**

```markdown
### routing/resolver.py

#### resolve_actor(run_id, gate_id, phase_id, domain_id, process_variant, status) → ResolvedActor | None

Params:
  - run_id: str — FK → runs.id; used for sentinel lookup (runs.lod200_author_team)
  - gate_id: str — FK → gates.id
  - phase_id: str | None — FK → phases; None for phaseless gates
  - domain_id: str — FK → domains.id
  - process_variant: str — TRACK_FULL | TRACK_FOCUSED | TRACK_FAST
  - status: RunStatus — function is a NO-OP if status == PAUSED (AD-S5-02)

Returns:
  ResolvedActor(team_id: str, label: str, engine: str, sentinel_active: bool)
  None only if status == PAUSED

Raises:
  RoutingUnresolvedError — no rule matched; auto-escalates to team_00
  RoutingMisconfigurationError — boot validation failure; should not reach runtime

Dependencies (imports):
  - modules/definitions/queries.py (gate, phase, routing_rule lookups)
  - modules/definitions/models.py (RunStatus enum)

Iron Rules:
  - NEVER called if status == PAUSED (AD-S5-02)
  - Sentinel detected via runs.lod200_author_team IS NOT NULL (AD-S5-05)
  - process_variant MUST be included in rule matching context (AD-S5-01)
```

**Modules requiring full contracts:** state/machine.py, state/repository.py, routing/resolver.py, prompting/builder.py, prompting/cache.py, prompting/templates.py, audit/ledger.py, policy/settings.py, management/use_cases.py.

**Dependency graph** (acyclic — Iron Rule #5):
```
management/ → state/ + routing/ + prompting/ + audit/ + policy/ + definitions/
state/       → audit/ + definitions/
routing/     → definitions/
prompting/   → definitions/ + policy/
audit/       → definitions/
policy/      → definitions/
governance/  → definitions/
definitions/ → (no internal deps)
```

---

#### §4 — API Endpoint Contracts

עבור כל endpoint: method, path, request schema, response schema, error codes (מ-§6 Stage 7 בלבד).

**Required endpoints (minimum — from Spec Process Plan §ג שלב 8):**

```markdown
#### GET /api/state

Query params:
  - run_id?: string (ULID) | domain_id?: string — one required

Response 200:
  {
    run_id:                string | null,
    work_package_id:       string | null,
    domain_id:             string,
    process_variant:       string | null,
    status:                "NOT_STARTED" | "IN_PROGRESS" | "CORRECTION" | "PAUSED" | "COMPLETE" | "IDLE",
    current_gate_id:       string | null,
    current_phase_id:      string | null,
    correction_cycle_count: integer,
    paused_at:             ISO-8601 | null,
    completed_at:          ISO-8601 | null,
    started_at:            ISO-8601 | null,
    last_updated:          ISO-8601 | null,
    actor:                 { team_id: string, label: string, engine: string } | null,
    sentinel:              { active: boolean, override_team: string | null } | null,
    execution_mode:        "MANUAL" | "DASHBOARD" | "AUTOMATIC" | null
  }

Error codes: RUN_NOT_FOUND (404), INVALID_HISTORY_PARAMS (400)
Stage 7 SSOT: §4 GetCurrentState (UC-13)
```

**Required additional endpoints:**

| Endpoint | UC | Stage 7 §6 codes |
|---|---|---|
| `GET /api/history` | UC-14 | INVALID_LIMIT, INVALID_EVENT_TYPE, INVALID_HISTORY_PARAMS |
| `POST /api/runs` | UC-01 | DOMAIN_ALREADY_ACTIVE, UNKNOWN_WP, DOMAIN_INACTIVE, ROUTING_UNRESOLVED |
| `POST /api/runs/{run_id}/advance` | UC-02 | WRONG_ACTOR, INVALID_STATE, PHASE_ALREADY_ADVANCED |
| `POST /api/runs/{run_id}/fail` | UC-04 | WRONG_ACTOR, INVALID_STATE, MISSING_REASON, INSUFFICIENT_AUTHORITY |
| `POST /api/runs/{run_id}/approve` | UC-06 | WRONG_ACTOR, NOT_HITL_GATE, INVALID_STATE |
| `POST /api/runs/{run_id}/pause` | UC-07 | NOT_PRINCIPAL, INVALID_STATE_TRANSITION |
| `POST /api/runs/{run_id}/resume` | UC-08 | NOT_PRINCIPAL, SNAPSHOT_MISSING, ROUTING_RESOLUTION_FAILED |
| `POST /api/runs/{run_id}/override` | UC-12 | NOT_PRINCIPAL, TERMINAL_STATE, INVALID_ACTION, MISSING_REASON |
| `GET /api/routing-rules` | — | — |
| `POST /api/routing-rules` | OQ-S3-02 admin | — |
| `PUT /api/routing-rules/{id}` | OQ-S3-02 admin | VARIANT_IMMUTABLE |
| `GET /api/templates` | — | — |
| `POST /api/templates` | OQ-S3-02 closure | — |
| `PUT /api/templates/{id}` | OQ-S3-02 closure | — |
| `GET /api/policy` | — | — |
| `PUT /api/policy/{key}` | OQ-S3-02 closure | — |

**Rule:** כל error code חייב להיות מתוך §6 Event & Observability Spec v1.0.2 (39 codes). אי אפשר להמציא codes חדשים.

---

#### §5 — OQ Closures

**Required format:**

```markdown
### OQ-S3-02 — Admin Management UCs

Decision: [FORMAL_UCS | ADMINISTRATIVE_ONLY]

If FORMAL_UCS:
  UC-15: <name> — Actor: <who>, Module: management/use_cases.py, API: <endpoint>
  UC-16: ...

If ADMINISTRATIVE_ONLY:
  Rationale: <why no formal UC needed>
  Implementation: <who calls these operations; how; access control>
  AD-S8-01: <locked decision text>

### OQ-S7-01 — Admin Management Event Types

Decision: [EVENTS_DEFINED | NO_EVENTS]

If EVENTS_DEFINED:
  Amends Event & Observability Spec v1.0.2 §1 with:
  TEMPLATE_UPDATED: Trigger UC-XX, Emitter: system, ...
  POLICY_UPDATED: ...
  GOVERNANCE_VERSION_BUMPED: ...

If NO_EVENTS:
  Rationale: <why no events>
  AD-S8-02: "TEMPLATE_UPDATED, POLICY_UPDATED, GOVERNANCE_VERSION_BUMPED events will never be emitted. Spec amendment required to change."
```

**⚠️ Iron Rule:** לא מקובל שניהם "נדחה". לפחות decision אחת מוכרחת להיות נעולה.

---

#### §6 — UI Pages Contract

עבור כל עמוד: URL, purpose, data sources, user actions.

| עמוד | URL | Data Source | User Actions |
|---|---|---|---|
| Pipeline View | `/` | `GET /api/state` | Copy prompt, PASS (`/advance`), FAIL (`/fail`), APPROVE (`/approve`), PAUSE, RESUME, OVERRIDE |
| History View | `/history` | `GET /api/history` | Filter by domain/gate/event_type/actor; paginate |
| Configuration | `/config` | routing-rules, templates, policy | View routing rules, manage templates, view policy (CRUD scoped to OQ-S3-02 decision) |

**Iron Rule:** UI = reads API only. Zero business logic in `app.js`.

---

#### §7 — Integration Test Cases

מינימום 12 test cases. כל TC: inputs, expected behavior, relevant UC/AD/error code, spec section.

**Required coverage:**
- At least 2 TCs per major flow: initiate → advance → complete
- At least 2 TCs for error paths: ROUTING_UNRESOLVED, WRONG_ACTOR
- At least 1 TC for atomic TX (AD-S7-01): event INSERT failure → state rollback
- At least 1 TC for PAUSED: actor=null in GetCurrentState (AD-S5-02)
- At least 1 TC for sentinel: lod200_author_team IS NOT NULL → routing bypass (AD-S5-05)
- At least 1 TC for OQ-S3-02 admin operation (whatever decision was made)

**Format:**

```markdown
| TC | Name | Input | Expected Output | UC/AD | Notes |
|---|---|---|---|---|---|
| TC-01 | Full run happy path | InitiateRun(wp_id, domain_tiktrack) → AdvanceGate → ApproveGate → CompleteRun | Status=COMPLETE; 4 events in ledger | UC-01/02/06/03 | Verifies atomic TX per AD-S7-01 |
| ... | | | | | |
```

---

#### §8 — Architectural Decisions Registry (Stage 8)

כל decision שתקבל ב-Stage 8 (כולל OQ closures) → locked כ-AD-S8-XX:

| AD ID | Decision | Locked In | Rationale |
|---|---|---|---|
| AD-S8-01 | [OQ-S3-02 decision] | §5 | [rationale] |
| AD-S8-02 | [OQ-S7-01 decision] | §5 | [rationale] |
| ... | | | |

---

### E.3 Pre-submission Checklist

**Module Map (§1):**
- [ ] כל קובץ בtree מוגדר עם purpose + SSOT stage
- [ ] `governance/` module כולל `artifact_index.py` + `archive.py` (§ו.6 addendum)
- [ ] `definition.yaml` מוגדר כ-SSOT לseed data

**UC Mapping (§2):**
- [ ] כל UC-01..UC-14 מופיע בmap
- [ ] OQ-S3-02 UCs (אם הוחלט) = UC-15+
- [ ] אפס UCs חסרים

**Interface Contracts (§3):**
- [ ] כל public function ב-9 modules: signature מלא, types, raises, dependencies
- [ ] Dependency graph מוגדר ו-acyclic
- [ ] AD-S5-02 PAUSED boundary מוגדר ב-`resolve_actor()` ו-`machine.py`
- [ ] AD-S7-01 atomic TX מוגדר ב-`machine.py`

**API Spec (§4):**
- [ ] כל endpoint: method, path, request schema, response schema
- [ ] כל error code מתוך §6 Stage 7 בלבד (39 codes)
- [ ] `/api/state` response = exact match של §4 Stage 7 spec
- [ ] `/api/history` response = exact match של §5 Stage 7 spec

**OQ Closures (§5):**
- [ ] OQ-S3-02: decision locked (FORMAL_UCS או ADMINISTRATIVE_ONLY)
- [ ] OQ-S7-01: decision locked (EVENTS_DEFINED או NO_EVENTS)
- [ ] כל decision locked כ-AD-S8-XX

**Integration Tests (§7):**
- [ ] מינימום 12 test cases
- [ ] Coverage: atomic TX, PAUSED actor=null, sentinel bypass, OQ-S3-02 admin op
- [ ] כל TC deterministic — אין "should" או "may"

**DDL-ERRATA-01:**
- [ ] ציון מפורש בspec שDDL v1.0.1 = SSOT עד complete
- [ ] `templates.py` interface contract מציין application-layer uniqueness enforcement

---

## PART F — SUBMISSION

### F.1 Deliverable

| Field | Value |
|---|---|
| **File** | `_COMMUNICATION/team_100/TEAM_100_AOS_V3_MODULE_MAP_INTEGRATION_SPEC_v1.0.0.md` |
| **Version** | v1.0.0 (initial submission) |
| **Format** | Markdown with YAML front matter |
| **Artifact ID** | A095 (next after A094 = this activation prompt) |

---

### F.2 Review Request to Team 190

אחרי השלמת הspec, צור:
**`_COMMUNICATION/team_190/TEAM_100_TO_TEAM_190_STAGE8_MODULE_MAP_REVIEW_REQUEST_v1.0.0.md`**

כלול:
- Artifact path + version
- Stage: SPEC_STAGE_8
- SSOT basis (all 7 file paths)
- Correction cycle: 0
- Focus areas לTeam 190:

```
Focus Area 1 — UC Implementation Completeness
  → Verify §2 covers all UC-01..UC-14 with no gaps
  → Any missing UC = MAJOR

Focus Area 2 — Interface Contract Correctness
  → Verify all function signatures match SSOT
  → AD-S5-02 PAUSED boundary in resolve_actor() + machine.py
  → AD-S7-01 atomic TX in machine.py
  → Any missing type or untyped parameter = MAJOR

Focus Area 3 — API Error Code Compliance
  → Verify all error codes in §4 are from §6 Stage 7 (39 codes)
  → Any invented error code = MAJOR

Focus Area 4 — OQ Closure Completeness
  → Verify OQ-S3-02 has a locked decision (FORMAL_UCS or ADMINISTRATIVE_ONLY)
  → Verify OQ-S7-01 has a locked decision (EVENTS_DEFINED or NO_EVENTS)
  → Each locked as AD-S8-XX
  → Missing decision = MAJOR

Focus Area 5 — API-SSOT Alignment
  → /api/state response exact match with Stage 7 §4 schema
  → /api/history response exact match with Stage 7 §5 schema
  → Any divergence = MAJOR

Focus Area 6 — Circular Import Check
  → Dependency graph in §3 must be acyclic
  → Any cycle = MAJOR
```

---

### F.3 Completion Report to Team 00 (Gate)

אחרי קבלת PASS מTeam 190, צור:
**`_COMMUNICATION/team_100/TEAM_100_STAGE8_MODULE_MAP_COMPLETION_REPORT_v1.0.0.md`**

כלול:
- Gate verdict chain (כל rounds)
- Findings closure summary
- OQ closure decisions (OQ-S3-02 + OQ-S7-01) — locked decisions listed
- AD-S8-XX registry
- Spec coverage summary (§1–§8)
- Stage completion matrix (8/8 CLOSED)
- Forward dependency: **BUILD ready** (Teams 10/11/61)
- DDL-ERRATA-01 status at time of gate

---

### F.4 הוראה קריטית — לאחר Gate Approval

Stage 8 gate approval = BUILD authorization. לאחר Team 00 approval:

1. **עדכן Artifact Index** — `current_spec_stage: SPEC_PROCESS_COMPLETE`
2. **הודע ל-Team 00** — "8/8 stages CLOSED. BUILD authorized. Awaiting BUILD activation."
3. **שמור OQ status** — אם OQ-S3-02 נסגר עם FORMAL_UCS, ציין איזה UCs נוספו ל-UC Catalog

---

▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

**log_entry | TEAM_00 | STAGE8_MODULE_MAP_ACTIVATION_PROMPT | CREATED | A094 | 2026-03-26**
