---
id: TEAM_00_AOS_V3_SYNTHESIS_ARCHITECTURE_SPEC_v1.0.0
historical_record: true
from: Team 00 (Nimrod — System Designer / Chief Architect)
to: Team 100, Team 190, Team 101, Team 61, Team 170, Team 90
date: 2026-03-25
status: PENDING_NIMROD_APPROVAL
type: SYNTHESIS_SPEC + EXECUTIVE_BRIEF
subject: AOS v3 — Synthesis architecture from IDEA-052, IDEA-053, ARCH_SPEC_BASE, GREENFIELD_SIMPLE, COHERENCE_PLAN---

# AOS v3 — Synthesis Architecture Specification
## Executive Brief + Full Spec (Pre-approval)

---

## חלק א — תקציר מנהלים

### א.1 מה נבחן

5 מסמכי תכנון מצוותים שונים:

| מסמך | מוצא | גישה |
|---|---|---|
| IDEA-052 v1.2.2 | Team 190 | DB-first migration + classification + audit + RBAC |
| IDEA-053 v1.0.0 | Team 190 | Greenfield rewrite — module boundaries + execution strategy |
| ARCH_SPEC_BASE v1.0.0 | Team 100 | Clean Architecture (DDD) + Use Cases + 3 modes |
| GREENFIELD_SIMPLE v1.0.0 | Team 100 | Radically minimal — YAML + ~350 LOC Python |
| AOS_V3_COHERENCE_PLAN v1.0.0 | Team 190 | Process plan — 6 phases from ideas to coherent spec |

### א.2 טבלת השוואה — ממצאים מרכזיים

| ממד | IDEA-052 | IDEA-053 | ARCH_SPEC_BASE | GREENFIELD_SIMPLE |
|---|---|---|---|---|
| **Single source of truth** | DB לשליטה, FILE לארטיפקטים | DB + FILE (מפורט) | DB (SQLite) | YAML אחד |
| **ניתוב** | DB-canonical | definitions module | שאילתת DB אחת עם priority | definition.yaml |
| **גודל קוד צפוי** | לא מפורט | לא מפורט | DDD full layers | ~350 LOC Python |
| **דשבורד** | לא מפורט | API consumer only | read+copy+confirm | read-only + CLI copy |
| **Audit** | hash-chain + signed events | append-only ledger | Event immutable | append-only log |
| **RBAC** | מפורטת (Annex E) | mutation via API | server-side guard | לא מפורט |
| **3 מצבי עבודה** | לא מפורט | HITL configurable | ✅ מפורט (same UC, diff actor) | HITL only |
| **migration** | DB-first cutover (Annex F) | A–F phases | Repository pattern | Strangle Fig |
| **4-layer context** | locked (Annex H) | locked | Value Object | locked |
| **token efficiency** | cache policy (Annex H) | configurable SLO | per-layer budget | implicit |
| **חסמים פתוחים** | 9 decisions שלא נעלות | MVP boundary open | 4 open questions | YAML vs DB scale |

### א.3 איפה הדוחות מסכימים (יהלומים משותפים)

כל 4 הדוחות מסכימים על הדברים הבאים — אלו הם **Iron Rules של v3**:

1. **DB-first for control plane.** ניתוב, state, routing, assignments — DB. לא קוד, לא JSON files.
2. **FILE-canonical for artifacts.** team_XX.md, governance.md, ארטיפקטים של צוותים — קבצים.
3. **4-layer prompt model locked.** identity + governance + state + task. אין שכבה חמישית.
4. **Append-only audit.** אירועים לא נמחקים. history = truth.
5. **Dashboard = consumer only.** הדשבורד לא מחזיק לוגיקה עסקית. לא מחשב ניתוב. לא parse markdown.
6. **HITL חובה.** רק נימרוד מקדם pipeline transitions.

### א.4 איפה הדוחות חלוקים (החלטות פתוחות לנימרוד)

| שאלה | GREENFIELD_SIMPLE | ARCH_SPEC_BASE | המלצת הסינתזה |
|---|---|---|---|
| **Definition format** | YAML אחד | SQLite DB | YAML → auto-seed DB (שניהם) |
| **Dashboard mutations** | CLI בלבד (read-only לחלוטין) | PASS/FAIL via API | API wrapper — כפתור קורא ל-CLI layer |
| **ארכיטקטורת קוד** | 3 files × 100 LOC | Full DDD layers | 7 modules × ~80 LOC (ביניים) |
| **3 מצבי עבודה** | Manual/HITL only | Manual+Dashboard+Auto | ✅ שלושתם — phase בן v3.1 |
| **timing** | Strangle Fig (parallel) | Repository pattern | Strangle Fig + parity assertions |

---

## חלק ב — כשל היסודי שמחייב v3

### ב.1 אבחנת הכשל (מהסשן הנוכחי)

בסשן הנוכחי תועדו 10 תקלות/שינויים. ניתוח הדפוסים חושף כשל יסודי אחד:

> **הפייפליין מחזיק ידע ב-2 מקומות: pipeline.py יודע מה קורה בכל שלב, אבל מייצא רק markdown. הדשבורד מנסה לבנות מחדש את אותה ההבנה מ-parsing של הטקסט + hardcoded gate branches ב-JS.**

זו לא בעיה של שורה בעייתית. זו כפילות מודל ידע. ו-state machine שחי בשני מקומות תמיד ידריף.

### ב.2 העדויות הספציפיות (v2 היום)

| עדות | מקור |
|---|---|
| `pipeline.py` — 3,854 שורות. monolith שמחזיק routing + prompt + state + gate-specific logic | `agents_os_v2/orchestrator/pipeline.py` |
| ניתוב ב-3 מקומות: pipeline.py + config.py + pipeline-config.js | IDEA-053 §3 |
| JS roster hardcoded ב-`pipeline-teams.js` למרות SSOT ב-TEAMS_ROSTER.json | IDEA-053 §3 |
| `pipeline_state_tiktrack.json` ≠ `pipeline_state.json` — wsm-reset גורם drift | סשן נוכחי |
| Dashboard parse markdown כדי לדעת מי actor, מה prereq, מה phase active | סשן נוכחי |
| `GATE_CONFIG.update(...)` legacy blocks עדיין קיימים ב-orchestrator | IDEA-053 §3 |

---

## חלק ג — הארכיטקטורה הסינתטית

### ג.1 עיקרון מרכזי אחד

**עיקרון מנחה:** נתון → גזור. לא: קוד → שכפל.

כל מה שמשתנה בין שערים, דומיינים, וצוותים — **חי בנתונים**.
כל מה שנשאר קבוע — **חי בקוד פעם אחת**.

**מסקנה מידית:** אין `gate_0.py`, `gate_1.py`, ... . אין per-gate JS branches. אין 5 pipeline_state files. יש **קוד גנרי + נתונים ספציפיים**.

---

### ג.2 Single Source of Truth — מפה מלאה

| רכיב | מקור אמת יחיד | פורמט | מי כותב | מי קורא |
|---|---|---|---|---|
| Gates / Phases / sequence | `definition.yaml` → DB | YAML seed | אדריכל | Engine + Dashboard |
| Teams / engines / scope | `definition.yaml` → DB | YAML seed | אדריכל | Router + Dashboard |
| Routing rules | `definition.yaml` → DB | YAML seed | אדריכל | Router |
| Runtime state | `pipeline_state.json` (1 קובץ, domain = field) | JSON | Engine בלבד | Dashboard (read) |
| Audit / history | SQLite `events` table | DB | Engine בלבד | Dashboard (read) |
| Prompt task templates | SQLite `templates` table | DB | UI (configuration view) | Prompt Engine |
| Policy / cache | SQLite `policy` table | DB | UI (configuration view) | Context Engine |
| Team context | `teams/team_XX.md` | Markdown | צוות | Prompt Engine (inject) |
| Governance | `governance.md` | Markdown | אדריכל | Prompt Engine (inject) |
| Team artifacts | `_COMMUNICATION/team_XX/` | Markdown | צוות | אדם בלבד |

**Iron Rule:** לא קיים field שחי בשני מקומות. כל שדה יש לו בעלות ברורה.

---

### ג.3 מבנה המודולים (7 modules)

```
agents_os_v3/
├── definition.yaml           ← SINGLE SOURCE — gates/phases/teams/routing/domains
├── seed.py                   ← מייבא definition.yaml → SQLite בכל startup
│
├── modules/
│   ├── definitions/          ← [DB] read-only queries: gates, phases, teams, domains
│   ├── state/                ← [JSON] load/save pipeline_state.json
│   ├── routing/              ← [DB] resolve(gate, phase, domain, variant) → Team
│   ├── prompting/            ← [DB+FILE] 4-layer context assembly + templates
│   ├── audit/                ← [DB] append-only events — write + query
│   ├── policy/               ← [DB] cache/token policy — configurable
│   └── management/           ← [API] validated mutation surface — PASS/FAIL/init
│
├── cli/
│   └── pipeline_run.sh       ← pass / fail / status / init / domain
│
└── ui/
    ├── index.html
    ├── app.js                ← reads: definition.yaml + state.json — NO logic
    └── style.css
```

**גודל צפוי:** כל module ~60–100 LOC Python. סה"כ ~700 LOC Python.
(לעומת 3,854 שורות ב-pipeline.py היום.)

---

### ג.4 routing — אחד לכולם

```python
# modules/routing/resolver.py  (~30 שורות)

def resolve_owner(gate_id, phase_id, domain_id, variant, state) -> str:
    """
    מחזיר team_id.
    priority (ספציפי → כללי):
      1. sentinel (state field, e.g. lod200_author_team)
      2. domain + variant
      3. domain only
      4. variant only
      5. default (fallback מוגדר ב-definition.yaml)
    """
    # SQL: SELECT team_id FROM routing_rules
    #      WHERE gate_id=? AND (phase_id=? OR phase_id IS NULL)
    #        AND (domain_id=? OR domain_id IS NULL)
    #        AND (variant=? OR variant IS NULL)
    #      ORDER BY priority DESC LIMIT 1
```

**אפס** nested dicts. **אפס** composite string keys. **אפס** hardcoded `if gate == 'GATE_2' and domain == 'tiktrack'`.

---

### ג.5 state machine — גנרי

```python
# modules/state/machine.py  (~80 שורות)

TRANSITIONS = {
    "PASS":     lambda s: advance_to_next_phase(s),
    "FAIL":     lambda s: enter_correction_cycle(s),
    "APPROVE":  lambda s: advance_gate(s),
    "COMPLETE": lambda s: mark_done(s),
}

# advance_to_next_phase — קורא מ-DB:
#   "מה השלב הבא ב-sequence_order אחרי השלב הנוכחי?"
# לא יודע שקיים GATE_2. לא יודע שיש phase 2.2v.
# הכל נגזר מ-definition.yaml → DB.
```

---

### ג.6 הדשבורד — חוזה אחד וסופי

**מה הדשבורד עושה:**
- קורא `GET /api/state` → מקבל JSON עם כל מה שצריך לרנדר
- מציג: current actor, current phase, command to run, steps, mandate content
- מאפשר: copy command, copy mandate, PASS/FAIL buttons (→ POST /api/advance)

**מה הדשבורד לא עושה (לעולם):**
- לא parse markdown לדעת מי actor
- לא hardcode gate branches (`if gate === 'GATE_2'`)
- לא מחשב prereq
- לא מחזיק routing logic
- לא מחזיק יותר מקובץ state אחד

**מבנה ה-API response:**

```json
{
  "wp_id": "S003-P004-WP001",
  "domain": "tiktrack",
  "current_gate": "GATE_2",
  "current_phase": "2.2",
  "actor": {
    "team_id": "team_10",
    "label": "Team 10 — Gateway / Execution Lead (TikTrack)",
    "engine": "cursor_composer"
  },
  "step_type": "PROMPT",
  "mandate_content": "...",
  "next_command": "./pipeline_run.sh --domain tiktrack --wp S003-P004-WP001 pass",
  "prereq_met": true,
  "phases": [
    { "id": "2.2", "label": "Work Plan", "status": "active", "display": true },
    { "id": "2.2v", "label": "Plan Review", "status": "pending", "display": true },
    { "id": "2.3", "label": "Arch Sign-off", "status": "pending", "display": true }
  ]
}
```

הדשבורד מרנדר את זה. **אין logic**. אין interpretation. מה שה-API מחזיר — זה מה שמוצג.

---

### ג.7 שלושת מצבי העבודה

```
Manual mode:    Nimrod → CLI → Application Layer
Dashboard mode: Nimrod → UI Button → POST /api/advance → Application Layer
Automatic mode: Scheduler → POST /api/advance → Application Layer (HITL checkpoint)
```

`modules/management/advance.py` (Use Case אחד) — זהה בשלושתם.
ההבדל: מי קורא לו. לא איך הוא עובד.

---

### ג.8 4-layer context — נעול, לא משתנה

```
Layer 1 — Identity:    ~40 tokens  (stable per gate/wp)
Layer 2 — Governance:  ~200 tokens (immutable, cached by hash)
Layer 3 — State:       ~100 tokens (minimal diff — only relevant fields)
Layer 4 — Task:        ~300 tokens (template from DB, editable via UI)
─────────────────────────────────
Total budget:          ~640 tokens (configurable per policy table)
```

שכבה 2 (governance.md) — cached. שכבה 4 (task template) — ניתנת לעריכה מהדשבורד ללא קוד.

---

### ג.9 Audit — immutable

```python
# modules/audit/events.py  (~50 שורות)

class Event:
    id: str           # ulid
    run_id: str
    gate_id: str
    phase_id: str
    team_id: str
    event_type: str   # PASS | FAIL | APPROVE | INITIATE | OVERRIDE
    verdict: str
    reason: str
    occurred_at: datetime
    # hash: SHA256(prev_hash + payload) — chain integrity
```

Events לעולם לא נמחקים. לעולם לא נערכים. State נוכחי = projection על events.

---

## חלק ד — מסלול המעבר (Strangle Fig)

### ד.1 גישה

לא מוחקים v2 בבת אחת. כותבים v3 לצד v2 עם assertions שהתוצאות זהות.

### ד.2 שלבים

| שלב | מה נעשה | output | v2 עדיין עובד? |
|---|---|---|---|
| **Phase A — Freeze** | snapshot מלא של v2 state + backup + branch isolation | `AOS_V3_BASELINE_MANIFEST` | ✅ כן |
| **Phase B — Definition** | כותבים `definition.yaml` + `seed.py` + `routing/resolver.py` | routing layer עובד | ✅ כן |
| **Phase C — State** | `state.py` + `machine.py` גנריים | state machine עובד | ✅ כן |
| **Phase D — Prompt** | `prompting/` + 4-layer integration | prompt engine עובד | ✅ כן |
| **Phase E — API** | `management/` + CLI wrapper | advance/pass/fail via API | ✅ כן |
| **Phase F — Dashboard** | `ui/app.js` חדש — reads API only | dashboard v3 | ✅ כן |
| **Phase G — Parity** | replay 5+ historical WPs, assert identical outcomes | parity report | ✅ כן |
| **Phase H — Cutover** | switch canonical runtime to v3, v2 → read-only archive | v3 live | ❌ v2 archived |

**כלל:** שלב חדש מתחיל רק אחרי parity assertion עבר בשלב הקודם.

---

## חלק ה — החלטות פתוחות לנימרוד

**5 שאלות שדורשות אישורך לפני שמתחילים:**

| # | שאלה | אפשרות A | אפשרות B | המלצת הסינתזה |
|---|---|---|---|---|
| 1 | **YAML vs DB כ-definition source** | YAML + auto-seed DB (human-edit + runtime query) | DB directly (dashboard UI לניהול) | **A** — YAML קריא לאדם, DB לruntime |
| 2 | **Dashboard PASS/FAIL** | CLI only — dashboard read-only לחלוטין | API wrapper — כפתור → POST → CLI equivalent | **B** — שיפור UX, אותו code path |
| 3 | **Auto mode בv3.0** | defer ל-v3.1 (HITL only בv3.0) | כלול בv3.0 core | **A** — מצמצם scope ל-MVP |
| 4 | **HITL granularity** | per-gate configurable (`allow_auto` per phase) | global per-domain | **A** — גמישות מקסימלית |
| 5 | **Timing** | v3 build מתחיל לפני S004 (Strangle Fig — v2 עדיין חי) | v3 אחרי S004 | **A** — Strangle Fig מאפשר parallel |

---

## חלק ו — מה לא לשנות (גם בv3)

ה-GREENFIELD_SIMPLE אמר זאת הכי ברור — ואני מסכים:

| מה | למה לא לשנות |
|---|---|
| **HITL rule** | רק נימרוד מקדם transitions. Iron Rule. |
| **4-layer prompt** | עובד. לא לשבור. |
| **Append-only audit** | לא מוחקים היסטוריה. |
| **team_XX.md context files** | השכבה הכי בריאה ב-v2. אין מה לשנות. |
| **Domain isolation** | שני state files עצמאיים — הרעיון נכון (רק מבנה הקובץ ישתנה) |
| **governance.md** | עובד. |

---

## חלק ז — מה שהדוחות לא כיסו (תוספות הסינתזה)

תובנות שלא הופיעו בדוחות המקוריים אבל נגזרות מהניתוח:

### ז.1 pipeline_state — קובץ אחד, domain כ-field

כל הדוחות דיברו על DB או state files — אבל אף אחד לא פתר במפורש את בעיית ה-domain file duplication.

**הפתרון:** `pipeline_state.json` אחד. domain הוא field בתוכו, לא שם קובץ. אין `pipeline_state_tiktrack.json`. אין `pipeline_state_agentsos.json`. הדשבורד מסנן לפי domain.

### ז.2 wsm-reset חייב לכתוב לקובץ האחד

`wsm-reset` גורם drift כי כותב ל-domain files בנפרד מהbase. בv3 אין domain files — הבעיה נפתרת by construction.

### ז.3 Dashboard "rendering hints" — לא קובץ נוסף אלא שדות ב-API response

הסינתזה דחתה הצעה קודמת להוסיף "rendering hint block" כקובץ נפרד. הפתרון הנכון: ה-API response של `GET /api/state` מכיל את כל המידע הנדרש לרנדור. אין קבצים נוספים.

---

## נספח — טבלת "יהלומים" ממכל מסמך

| מסמך | היהלומים שנלקחו לסינתזה |
|---|---|
| **IDEA-052** | DB/FILE classification ruleset (Annex G); 4-layer lock (Annex H); Audit model + hash-chain (Annex D); RBAC + write-channel policy (Annex E) |
| **IDEA-053** | 7 module boundaries; "UI uses API only — no fallback routing logic"; Phase A–F execution strategy |
| **ARCH_SPEC_BASE** | Use Case model (one class, one operation); Routing priority chain (query-based); 3 modes = same UC + different Actor; Dashboard validation stack (client + server + typed error codes); Configuration UI for templates |
| **GREENFIELD_SIMPLE** | `definition.yaml` as human-readable authoring surface; Strangle Fig migration pattern; Context layer (team_XX.md) is healthy — don't touch; Radical simplicity target (~350 LOC Python) |
| **COHERENCE_PLAN** | Phase 0 baseline freeze first; Dependency graph before implementation; Program revision pack process |
| **סשן נוכחי** | Single `pipeline_state.json` (no domain copies); Dashboard must never parse markdown for logic; wsm-reset must write to single canonical source |

---

**log_entry | TEAM_00 | AOS_V3_SYNTHESIS_SPEC | PENDING_NIMROD_APPROVAL | 2026-03-25**
