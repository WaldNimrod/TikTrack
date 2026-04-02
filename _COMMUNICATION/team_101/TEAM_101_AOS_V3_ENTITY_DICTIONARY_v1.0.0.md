---
id: TEAM_101_AOS_V3_ENTITY_DICTIONARY_v1.0.0
historical_record: true
from: Team 101
to: Team 190 (review), Team 100 (review), Team 00
date: 2026-03-25
status: SUBMITTED_FOR_REVIEW
stage: SPEC_STAGE_1---

# AOS v3 — Entity Dictionary (Stage 1)

מקורות מנדט: `TEAM_00_TO_TEAM_101_AOS_V3_SPEC_STAGE1_ENTITY_DICTIONARY_MANDATE_v1.0.0.md`  
הקשר ארכיטקטוני: `TEAM_00_AOS_V3_SYNTHESIS_ARCHITECTURE_SPEC_v1.0.0.md`, `TEAM_00_AOS_ARCHITECTURE_SPEC_BASE_v1.0.0.md`, `TEAM_00_AOS_GREENFIELD_ARCHITECTURE_v1.0.0.md`, Annex G/D (IDEA-052).

---

## Summary

### החלטות שקיבלנו (מענה לשאלות המנדט)

| # | נושא | החלטה | נימוק (קצר) |
|---|------|--------|--------------|
| 1 | `Run` vs `Execution` | **`Run`** | תואם ARCH_SPEC_BASE §5 והסינתזה; "Execution" דו־משמעי מול פעולה ומול `execution_mode`. |
| 2 | `current_phase` | **שדה על `runs` + סנכרון אירועים** | קריאת API/דשבורד ב־O(1); אירועים נשארים מקור אמת להיסטוריה ו־replay — אחרי כל מעבר מעדכנים את `runs.current_phase_id` באותו transaction כמו append ל־`events`. |
| 3 | `correction_cycle_count` | **INTEGER על `runs`** | נמנע ספירת FAIL בכל צג סטטוס; ניתן לאמת מול אירועים בבדיקות שלמות. |
| 4 | `RoutingRule.priority` | **INTEGER מפורש** | `ORDER BY priority DESC` דטרמיניסטי; ערכי ברירת־מחדל נגזרים מ־YAML seed לפי ספציפיות. |
| 5 | `Template.domain_id` | **Nullable — כן, דומיין־ספציפי מותר** | `NULL` = תבנית גלובלית; מזהה דומיין = override לפי דומיין (תואם dual-track). |
| 6 | `Policy` granularity | **שורות עם היקף חלקי** | עמודות `scope_type` + `domain_id` / `gate_id` / `phase_id` nullable; בחירת השורה הכי ספציפית (כמו ניתוב). |
| 7 | `Event.actor_type` | **`human` \| `agent` \| `scheduler` \| `system`** | שלושת הראשונים לפי מצבי עבודה; `system` למיגרציות/כתיבה פנימית של המנוע. |

### OPEN_QUESTIONs שנותרו פתוחות

1. **OPEN_QUESTION — צורת `pipeline_state.json` (projection):** האם השורש הוא אובייקט ממופה לפי `domain_id` (שני מפתחות קבועים) או מערך `runs` פעילים? משפיע על מודול `state/` בלבד, לא על טבלאות ה־ER. **המלצה:** אובייקט `{"tiktrack":{...},"agents_os":{...}}` לשחזור UX נוכחי; דורש אישור Team 00.
2. **OPEN_QUESTION — מצבי `Run.status` סופיים:** האם `ABORTED` / `SUSPENDED` נכנסים ל־v3.0 או נדחים ל־v3.1? **Tradeoff:** כיסוי תפעולי מול צמצום state machine ב־Stage 2.

### דגל ל־Team 00

- **יש** OPEN_QUESTION מס׳ 1 שדורש **אישור Principal (Team 00)** לפני ש־Team 190 נועל review על contract הקובץ היחיד — מומלץ להכריע לפני Stage 4 (DDL) / Build.

---

## Entity: Domain

**Description:** מזהה מסלול עבודה נפרד (למשל TikTrack מול Agents OS) עם וריאנט ברירת־מחדל וצוות תיעוד.  
**Storage:** DB  
**Table name:** `domains`  
**Aggregate root:** no  
**Layer:** Domain  

### Fields

| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|-------|------|----------|---------|------------|---------------|---------|
| id | TEXT | NO | — | PK, ULID | מזהה יציב; לא משתנה לאחר יצירה | `01JXYZ...` |
| slug | TEXT | NO | — | UNIQUE | ערך machine-safe: `tiktrack`, `agents_os` | `tiktrack` |
| display_name | TEXT | NO | — | len ≤ 128 | שם אנושי לדשבורד | `TikTrack` |
| default_variant | TEXT | NO | — | ∈ ENUM | `TRACK_FULL` \| `TRACK_FOCUSED` \| ערכים עתידיים מוגדרים ב־seed | `TRACK_FULL` |
| doc_team_id | TEXT | YES | NULL | FK → `teams.id` | NULL אם אין צוות תיעוד ייעודי; אחרת צוות אחראי ל־FILE lane | `team_70` |
| is_active | INTEGER | NO | 1 | BOOL 0/1 | דומיין לא פעיל לא יפתח Run חדש | `1` |
| created_at | TEXT | NO | — | ISO-8601 | no business constraint | `2026-03-25T12:00:00Z` |

### Invariants

1. `slug` ייחודי בכל המערכת.  
2. רק דומיין עם `is_active=1` זכאי ל־`Run` חדש דרך Use Case אתחול.

### Relationships

- `has_many`: `runs` via `runs.domain_id`  
- `has_many`: `routing_rules` via `routing_rules.domain_id` (אופציונלי)  
- `belongs_to`: `teams` via `doc_team_id` (אופציונלי)

### Notes

- תואם Annex G: `behavioral_scope=AOS_SYSTEM`, routing/config ב־DB.  
- הרחבת דומיין עתידית = `INSERT` + seed ניתוב; ללא שינוי קוד.

---

## Entity: Team

**Description:** יחידת ארגון שמבצעת שלב בפייפליין, כולל מנוע והיקף דומיין.  
**Storage:** DB  
**Table name:** `teams`  
**Aggregate root:** no  
**Layer:** Domain  

### Fields

| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|-------|------|----------|---------|------------|---------------|---------|
| id | TEXT | NO | — | PK, UNIQUE | פורמט `team_XX` או ULID לפי שרשרת roster; חייב להתאים ל־`TEAMS_ROSTER_v1.0.0.json` בזמן seed | `team_10` |
| label | TEXT | NO | — | len ≤ 64 | תווית קצרה ל־UI | `Team 10` |
| name | TEXT | NO | — | len ≤ 256 | שם מלא | `Execution Orchestrator` |
| engine | TEXT | NO | — | ∈ ENUM | `cursor` \| `cursor_composer` \| `claude` \| `claude_code` \| `codex` \| `openai` \| `human` \| `orchestrator` — מגביל איך מפעילים את הצוות | `cursor` |
| domain_scope | TEXT | NO | `multi` | ∈ ENUM | `tiktrack` \| `agents_os` \| `shared` \| `multi` — האם הצוות מוגבל לדומיין | `tiktrack` |
| in_gate_process | INTEGER | NO | 1 | BOOL | אם 0 — לא מופיע בניתוב פעיל (צוותי infra) | `1` |
| roster_version | TEXT | YES | NULL | — | גרסת roster שממנה נשמרה השורה (שקיפות אודיט) | `1.0.0` |
| created_at | TEXT | NO | — | ISO-8601 | no business constraint | `2026-03-25T12:00:00Z` |

### Invariants

1. `id` קיים ב־roster או נרשם בהליך שינוי מנוהל (לא עריכה אד־הוק בפרודקשן).  
2. `engine` חייב להיות תואם יכולות ה־Prompt / Executor (מיפוי ב־Stage 3).

### Relationships

- `has_many`: `routing_rules` via `team_id`  
- `has_many`: `events` via `actor_team_id` (אופציונלי בשדה נפרד — ראו Event)  
- `referenced_by`: `domains.doc_team_id`

### Notes

- תוכן FREE-TEXT של צוות נשאר ב־FILE (`team_XX.md`) — לא בטבלה זו (Annex G).  
- אין כפילות canonical: טבלה = control plane; markdown = artifact.

---

## Entity: Gate

**Description:** צעד מאקרו בפייפליין (למשל GATE_2) עם סדר גלובלי וסימון שער אנושי.  
**Storage:** DB  
**Table name:** `gates`  
**Aggregate root:** no  
**Layer:** Domain  

### Fields

| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|-------|------|----------|---------|------------|---------------|---------|
| id | TEXT | NO | — | PK, UNIQUE | מזהה יציב כמו `GATE_0` … `GATE_5` | `GATE_2` |
| sequence_order | INTEGER | NO | — | UNIQUE, ≥ 0 | קובע סדר המכונה; אין קפיצות כפולות באותו ערך | `2` |
| name | TEXT | NO | — | len ≤ 256 | תצוגה | `Work Plan` |
| is_human_gate | INTEGER | NO | 0 | BOOL | אם 1 — מצריך HITL / approve לפני מעבר | `1` |
| description | TEXT | YES | NULL | — | טקסט עזר לדשבורד | `…` |

### Invariants

1. `sequence_order` ייחודי — מגדיר את הגרף הליניארי הבסיסי בין שערים (תת־שלבים ב־`phases`).  
2. מחיקת שער אסורה אם קיימים `runs` או `events` המפנים אליו (soft-deprecate בלבד).

### Relationships

- `has_many`: `phases` via `phases.gate_id`  
- `has_many`: `routing_rules` via `gate_id`  
- `has_many`: `events` via `gate_id`

### Notes

- מעברים עדינים (PASS/FAIL) ב־Stage 2; כאן רק קטלוג.

---

## Entity: Phase

**Description:** תת־שלב בתוך שער (למשל `2.2`, `2.2v`) עם סדר ודגל אוטומציה.  
**Storage:** DB  
**Table name:** `phases`  
**Aggregate root:** no  
**Layer:** Domain  

### Fields

| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|-------|------|----------|---------|------------|---------------|---------|
| id | TEXT | NO | — | PK, UNIQUE | מזהה שלב יציב בתוך שער; מחרוזת חופשית מנורמלת | `2.2` |
| gate_id | TEXT | NO | — | FK → `gates.id` | שלב תלוי בשער הורה | `GATE_2` |
| sequence_order | INTEGER | NO | — | UNIQUE per (`gate_id`) | סדר בתוך השער | `1` |
| name | TEXT | NO | — | len ≤ 256 | תצוגה | `Work Plan` |
| allow_auto | INTEGER | NO | 0 | BOOL | אם 1 — מצב אוטומטי רשאי (עדיין בכפוף ל־Policy + HITL גלובלי) | `0` |
| display_in_ui | INTEGER | NO | 1 | BOOL | אם 0 — שלב טכני נסתר מציר זמן | `1` |

### Invariants

1. (`gate_id`, `sequence_order`) ייחודי.  
2. (`gate_id`, `id`) ייחודי — `id` של Phase גלובלי במסגרת השער.

### Relationships

- `belongs_to`: `gates` via `gate_id`  
- `has_many`: `routing_rules` via (`gate_id`,`phase_id`) לוגית — בטבלה `routing_rules.phase_id` מצביע ל־`phases.id` + `gate_id` (או FK מורכב אם נדרש ב־DDL)

### Notes

**OPEN_QUESTION (DDL):** האם FK של `routing_rules` הוא (`gate_id`,`phase_id`) מורכב או `phases.id` בלבד — להחליט ב־Stage 4 כאשר יהיה מפתח סינתטי ל־phase row.

---

## Entity: RoutingRule

**Description:** כלל ניתוב: הקשר gate/phase/domain/variant → צוות, עם עדיפות ואופציונלית sentinel לשדה מצב.  
**Storage:** DB  
**Table name:** `routing_rules`  
**Aggregate root:** no  
**Layer:** Domain  

### Fields

| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|-------|------|----------|---------|------------|---------------|---------|
| id | TEXT | NO | — | PK, ULID | מזהה שורה | `01JABC...` |
| gate_id | TEXT | NO | — | FK → `gates.id` | שער חובה | `GATE_2` |
| phase_id | TEXT | YES | NULL | FK → `phases.id` (וגם gate consistency) | NULL = כלל ברמת שער (ברירת מחדל לשער) | `2.2` |
| domain_id | TEXT | YES | NULL | FK → `domains.id` | NULL = חל על כל הדומיינים הזכאים | `tiktrack` |
| variant | TEXT | YES | NULL | — | NULL = כל הווריאנטים; אחרת התאמה מדויקת ל־`runs.process_variant` | `TRACK_FULL` |
| team_id | TEXT | NO | — | FK → `teams.id` | יעד ניתוב | `team_10` |
| priority | INTEGER | NO | 100 | — | גבוה יותר = נבחר ראשון אחרי סינון שורות תואמות | `500` |
| resolve_from_state_key | TEXT | YES | NULL | — | אם לא NULL — ה־resolver קורא ערך מ־`runs` (למשל `lod200_author_team`) וממפה ל־`team_id` לפי טבלת עזר או ישירות אם הערך כבר `team_XX` | `lod200_author_team` |
| created_at | TEXT | NO | — | ISO-8601 | no business constraint | `2026-03-25T12:00:00Z` |

### Invariants

1. לכל צירוף הקשר קיימת לכל היותר שורה "מנצחת" אחרי `ORDER BY priority DESC` עם כללי שוויון מפורשים ב־Stage 5.  
2. אם `resolve_from_state_key` מוגדר, השורה לא אמורה להתנגש עם `team_id` ידוע מראש — `team_id` עדיין יעד ברירת מחדל אם ה־key חסר.

### Relationships

- `belongs_to`: `gates`, `phases` (אופציונלי), `domains` (אופציונלי), `teams`

### Notes

- תואם resolver בסינתזה (ג.4): שאילתה אחת + `ORDER BY priority DESC LIMIT 1` אחרי סינון תואמות.  
- Seed מ־`definition.yaml` (א.2).

---

## Entity: Run

**Description:** ריצת פייפליין אחת לעבודה (WP) בדומיין — שורש אגרגציה למצב נוכחי והיסטוריה מקושרת.  
**Storage:** DB (canonical runtime) + FILE projection (`pipeline_state.json`)  
**Table name:** `runs`  
**Aggregate root:** yes  
**Layer:** Domain  

### Fields

| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|-------|------|----------|---------|------------|---------------|---------|
| id | TEXT | NO | — | PK, ULID | מזהה ריצה פנימי | `01JRUN...` |
| work_package_id | TEXT | NO | — | UNIQUE per (`domain_id`) כאשר סטטוס פעיל | מזהה WP חיצוני מנורמל | `S003-P004-WP001` |
| domain_id | TEXT | NO | — | FK → `domains.id` | דומיין הריצה | `tiktrack` |
| process_variant | TEXT | NO | — | התאמה ל־`domains.default_variant` או override מותר | משפיע על ניתוב | `TRACK_FULL` |
| current_gate_id | TEXT | NO | — | FK → `gates.id` | שער פעיל | `GATE_2` |
| current_phase_id | TEXT | YES | NULL | FK → `phases.id` | NULL רק אם השער ללא פאזות או ב־COMPLETE לוגי לפני ניקוי — מדיניות מדויקת ב־Stage 2 | `2.2` |
| status | TEXT | NO | `NOT_STARTED` | ∈ ENUM | `NOT_STARTED` \| `IN_PROGRESS` \| `CORRECTION` \| `COMPLETE` \| (הרחבות ב־OPEN_QUESTION) | `IN_PROGRESS` |
| execution_mode | TEXT | NO | `MANUAL` | ∈ ENUM | `MANUAL` \| `DASHBOARD` \| `AUTOMATIC` — אותו Use Case, שחקן שונה | `MANUAL` |
| correction_cycle_count | INTEGER | NO | 0 | ≥ 0 | מוגדל על ידי האפליקציה בכל כניסה מבוקרת למחזור תיקון (FAIL) | `1` |
| spec_brief | TEXT | YES | NULL | — | תיאור קצר לשכבת זהות בפרומפט | `D33 User Tickers` |
| gates_completed_json | TEXT | NO | `[]` | JSON array | רשימת מזהי שערים שהושלמו; מסונכרן עם אירועים | `["GATE_0","GATE_1"]` |
| gates_failed_json | TEXT | NO | `[]` | JSON array | היסטוריית כשלים עבור UX | `[]` |
| lod200_author_team | TEXT | YES | NULL | FK → `teams.id` אם מוגדר | sentinel לניתוב phase מסוים | `team_102` |
| state_payload_json | TEXT | YES | NULL | JSON | שדות נוספים (lld400, mandates, …) — **לא** דורסים שדות קנוניים בטבלה בלי מיפוי ב־Stage 4 | `{...}` |
| started_at | TEXT | NO | — | ISO-8601 | נקבע בעת INIT | `2026-03-25T10:00:00Z` |
| last_updated | TEXT | NO | — | ISO-8601 | מעודכן בכל מעבר מצב | `2026-03-25T11:00:00Z` |
| completed_at | TEXT | YES | NULL | ISO-8601 | מלא רק ב־`COMPLETE` | NULL |

### Invariants

1. לכל `domain_id` יש לכל היותר **ריצה פעילה אחת** (`status` ∉ {`COMPLETE`}) — אלא אם Team 00 מאשר מרובה בכוונה (לא ברירת מחדל).  
2. מעבר מצב יוצר `Event` לפני עדכון שדות denormalized.  
3. `pipeline_state.json` הוא **projection** של שורת `runs` (+ שדות נלווים מה־API) — לא מקור אמת נפרד.

### Relationships

- `belongs_to`: `domains`  
- `has_many`: `events` via `run_id`  
- `belongs_to`: `gates` (current), `phases` (current)

### Notes

- שדה legacy אופציונלי `pipe_run_id` מה־JSON הקיים ימופה ל־`id` או עמודת `external_short_id` ב־Stage 4 אם נדרש.  
- Annex G: מצב ריצה = DB + mirror file non-canonical אם קיים.

---

## Entity: Event

**Description:** רשומת אמת בלתי משתנה למעבר או מילSTONE בריצה (append-only).  
**Storage:** DB  
**Table name:** `events`  
**Aggregate root:** no  
**Layer:** Domain  

### Fields

| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|-------|------|----------|---------|------------|---------------|---------|
| id | TEXT | NO | — | PK, ULID | מזהה אירוע | `01JEVT...` |
| run_id | TEXT | NO | — | FK → `runs.id` | שיוך לריצה | `01JRUN...` |
| sequence_no | INTEGER | NO | — | UNIQUE per `run_id` | מונוטוני עולה לפי זמן הוספה | `42` |
| event_type | TEXT | NO | — | ∈ ENUM | בסיס: `GATE_PASS` \| `GATE_FAIL` \| `APPROVE` \| `INITIATE` \| `OVERRIDE` \| `STATE_MIGRATION` \| `TEAM_ASSIGNMENT_CHANGED` \| `REGISTRY_UPDATE` \| `AUDIT_POLICY_CHANGED` — הרחבה מותרת עם גרסת סכימה | `GATE_PASS` |
| gate_id | TEXT | YES | NULL | FK | חובה כאשר רלוונטי לשער | `GATE_2` |
| phase_id | TEXT | YES | NULL | FK | שלב בזמן האירוע | `2.2` |
| domain_id | TEXT | NO | — | FK | שכפול denormalized לשאילתות לוג | `tiktrack` |
| work_package_id | TEXT | NO | — | — | שכפול מ־`runs` | `S003-P004-WP001` |
| actor_team_id | TEXT | YES | NULL | FK → `teams.id` | NULL אם אין צוות אקטורי (מיגרציה) | `team_61` |
| actor_type | TEXT | NO | — | ∈ ENUM | `human` \| `agent` \| `scheduler` \| `system` | `human` |
| verdict | TEXT | YES | NULL | — | למשל `PASS` / `FAIL` / `APPROVED` | `PASS` |
| reason | TEXT | YES | NULL | — | סיבה אנושית או קוד | `KB-84 block` |
| payload_json | TEXT | YES | NULL | JSON | פירוט נוסף (findings ref, hashes) | `{...}` |
| occurred_at | TEXT | NO | — | ISO-8601 | זמן wall-clock | `2026-03-25T12:00:00Z` |
| prev_hash | TEXT | YES | NULL | — | גיבוב שרשרת L2 (Annex D); NULL רק לאירוע ראשון | `sha256:...` |
| event_hash | TEXT | NO | — | UNIQUE | גיבוב `prev_hash + canonical_payload` | `sha256:...` |

### Invariants

1. **אין UPDATE / DELETE** על שורות קיימות (אכיפה ברמת אפליקציה + הרשאות DB).  
2. `sequence_no` רציף ללא חורים לכל `run_id` (או מדיניות פערים מפורשת ב־Stage 2 — ברירת מחדל: רציף).  
3. שרשרת `prev_hash` שלמה לאירועים קריטיים (Annex D.4).

### Relationships

- `belongs_to`: `runs`  
- `belongs_to`: `gates`, `phases`, `domains`, `teams` (אופציונלי)

### Notes

- שדות נדרשים לפי סוג אירוע יוגדרו ב־Stage 2 (state machine) + אימות ב־Use Case.  
- חתימות L3 (Annex D) — שדה עתידי `signature` מחוץ לטבלה או הרחבה ב־Stage 6.

---

## Entity: Template

**Description:** תבנית שכבת משימה (Layer 4) לבניית פרומפט לפי שער/שלב ואופציונלית דומיין.  
**Storage:** DB  
**Table name:** `templates`  
**Aggregate root:** no  
**Layer:** Domain  

### Fields

| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|-------|------|----------|---------|------------|---------------|---------|
| id | TEXT | NO | — | PK, ULID | מזהה | `01JTPL...` |
| gate_id | TEXT | NO | — | FK | שער יעד | `GATE_3` |
| phase_id | TEXT | YES | NULL | FK | NULL = ברירת מחדל לשער | `3.1` |
| domain_id | TEXT | YES | NULL | FK | NULL = גלובלי; אחרת override דומייני | `agents_os` |
| name | TEXT | NO | — | len ≤ 128 | תווית ב־Configuration View | `GATE_3 / 3.1 mandate skeleton` |
| body_markdown | TEXT | NO | — | — | תוכן התבנית; placeholders בשם מוסכם ב־Stage 6 | `## Task\n...` |
| version | INTEGER | NO | 1 | ≥ 1 | גדל בכל שמירה משמעותית | `2` |
| is_active | INTEGER | NO | 1 | BOOL | רק שורה פעילה אחת "מנצחת" לפי אותו הקשר (gate/phase/domain) — כלל בחירה ב־Stage 5 | `1` |
| updated_at | TEXT | NO | — | ISO-8601 | no business constraint | `2026-03-25T12:00:00Z` |

### Invariants

1. לכל (`gate_id`, `phase_id`, `domain_id` עם כללי NULL) קיימת לכל היותר תבנית **פעילה** אחת (`is_active=1`) אלא אם מודל גרסאות מפורש מאפשר מספר עם `version` (להחליט ב־Stage 6 — ברירת מחדל: אחת פעילה).  
2. עריכה דרך דשבורד = INSERT גרסה חדשה או UPDATE לפי מדיניות versioning (יפורט ב־Stage 3).

### Relationships

- `belongs_to`: `gates`, `phases` (אופציונלי), `domains` (אופציונלי)

### Notes

- תואם סעיף ג.2 בסינתזה: "Prompt task templates — SQLite".

---

## Entity: Policy

**Description:** מדיניות תקציב טוקנים, מטמון שכבות, ופרמטרי ביצועים לפרומפט ולממשק הניהול.  
**Storage:** DB  
**Table name:** `policies`  
**Aggregate root:** no  
**Layer:** Domain  

### Fields

| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|-------|------|----------|---------|------------|---------------|---------|
| id | TEXT | NO | — | PK, ULID | מזהה | `01JPOL...` |
| scope_type | TEXT | NO | `GLOBAL` | ∈ ENUM | `GLOBAL` \| `DOMAIN` \| `GATE` \| `PHASE` | `DOMAIN` |
| domain_id | TEXT | YES | NULL | FK | חובה כאשר `scope_type=DOMAIN` | `tiktrack` |
| gate_id | TEXT | YES | NULL | FK | חובה כאשר `scope_type=GATE` | `GATE_1` |
| phase_id | TEXT | YES | NULL | FK | חובה כאשר `scope_type=PHASE` | `1.2` |
| policy_key | TEXT | NO | — | — | מפתח לוגי: `token_budget_total`, `layer2_cache_ttl_sec`, `layer4_max_tokens`, ... | `token_budget_total` |
| policy_value_json | TEXT | NO | `{}` | JSON | ערך מובנה | `{"max":640}` |
| priority | INTEGER | NO | 100 | — | ככל שהערך גבוה — ספציפיות גוברת על GLOBAL | `200` |
| updated_at | TEXT | NO | — | ISO-8601 | שינוי מדיניות יוצר אירוע `AUDIT_POLICY_CHANGED` (Annex D) | `2026-03-25T12:00:00Z` |

### Invariants

1. התאמת `scope_type` לשדות NULL/NOT NULL: `GLOBAL` ⇒ כל FK scope = NULL.  
2. אין שתי שורות פעילות עם אותו `policy_key` ואותה רמת ספציפיות ועדיפות שווה — דטרמיניזם.

### Relationships

- `belongs_to`: `domains`, `gates`, `phases` (אופציונלי לפי scope)

### Notes

- תואם ג.8 (תקציב ~640) + Annex H / token efficiency מ־ARCH_SPEC_BASE.

---

## Entity: Prompt

**Description:** אובייקט ערך רuntime המרכיב את ארבע שכבות ההקשר לפני שליחה לסוכן — לא נשמר כשורת DB.  
**Storage:** Value Object  
**Table name:** — (לא רלוונטי)  
**Aggregate root:** no  
**Layer:** Application (נבנה ב־PromptBuilder)  

### Fields (Value Object — שדות לוגיים)

| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|-------|------|----------|---------|------------|---------------|---------|
| layer1_identity | TEXT | NO | — | len bound by Policy | זהות WP/gate/team/domain — ~40 טוקנים יעד | `gate: GATE_2 \| wp: ...` |
| layer2_governance | TEXT | NO | — | cached by content hash | נטען מ־FILE `governance.md`; מטמון לפי Policy | `…` |
| layer3_state | TEXT | NO | — | minimal diff | תמצית מצב מ־`runs` + diff מהריצה הקודמת | `…` |
| layer4_task | TEXT | NO | — | from `templates` | שכבת משימה מ־DB | `…` |
| assembled_at | TEXT | NO | — | ISO-8601 | חותמת הרכבה | `2026-03-25T12:00:00Z` |
| content_hash | TEXT | NO | — | SHA-256 hex | גיבוב כל השכבות לצורך audit / cache | `abc...` |
| token_estimate | INTEGER | YES | NULL | DERIVED | הערכת טוקנים לפי Policy; NULL אם לא נספר | `620` |

### Invariants

1. בדיוק ארבע שכבות; אין שכבה חמישית (Iron Rule).  
2. אובייקט Prompt **אינו** נכתב ל־DB; נרשם אירוע עם hash / מזהי תבנית בלבד אם נדרש אודיט.

### Relationships

- נבנה מ־`Run`, `Template`, FILE governance, `Policy`, `Team` context files.

### Notes

- Annex G: PROMPT כארטיפקט קומוניקציה הוא FILE; כאן מדובר ב־**runtime VO** בלבד.

---

**log_entry | TEAM_101 | ENTITY_DICTIONARY_SUBMITTED | v1.0.0 | 2026-03-25**
