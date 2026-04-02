---
id: TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.0
historical_record: true
from: Team 101
to: Team 100, Team 190, Team 00
date: 2026-03-26
status: SUBMITTED_FOR_REVIEW
stage: SPEC_STAGE_1B
supersedes: TEAM_101_AOS_V3_ENTITY_DICTIONARY_v1.0.0---

# AOS v3 — Entity Dictionary (Stage 1b / v2.0.0)

מקורות: `TEAM_00_TO_TEAM_101_AOS_V3_ENTITY_DICT_REVISION_MANDATE_v2.0.0.md`, בסיס `TEAM_101_AOS_V3_ENTITY_DICTIONARY_v1.0.0.md`, `TEAM_TAXONOMY_v1.0.0.md`, סינתזה ארכיטקטונית (רקע).

---

## Summary

### החלטות שקיבלנו (מ-v1.0.0 + נעילות נוספות)

| # | נושא | החלטה | נימוק (קצר) |
|---|------|--------|--------------|
| 1 | `Run` vs `Execution` | **`Run`** | כב־v1.0.0 — תואם ARCH_SPEC_BASE והסינתזה. |
| 2 | `current_phase` | **שדה על `runs` + סנכרון אירועים** | כב־v1.0.0. |
| 3 | `correction_cycle_count` | **INTEGER על `runs`** | כב־v1.0.0. |
| 4 | `RoutingRule.priority` | **INTEGER מפורש** | כב־v1.0.0; הניתוב מצביע כעת ל־`role_id`, לא ל־`team_id`. |
| 5 | `Template.domain_id` | **Nullable — דומיין־ספציפי מותר** | כב־v1.0.0. |
| 6 | `Policy` granularity | **שורות עם היקף חלקי** | כב־v1.0.0. |
| 7 | `Event.actor_type` | **`human` \| `agent` \| `scheduler` \| `system`** | כב־v1.0.0. |
| 8 | צורת `pipeline_state.json` | **Option A (נעול)** | שורש: `{"tiktrack":{current_run...},"agents_os":{current_run...}}`. |
| 9 | `Run.status` — PAUSED / ABORTED | **PAUSED ב-v3.0; ABORTED ב-v3.1** | SUSPENDED לא נכנס; PAUSED מאפשר הקפאת WP עם המשך מאותו gate/phase. |

### שינויים מ-v1.0.0

1. **PipelineRole (חדש):** קטלוג תפקידי פייפליין (מה נדרש) — נפרד משיוך צוות.  
2. **Assignment (חדש):** קישור `role_id` + `team_id` + `work_package_id` ב־GATE_0; שיוך קבוע ל־WP; מעבר ניתוב דרך Assignment.  
3. **RoutingRule:** הוסר `team_id`; נוסף `role_id` (FK → `pipeline_roles`); `resolve_from_state_key` נשאר **DEPRECATED** (תאימות לאחור + אזהרה בלוג).  
4. **Team:** נוספו `group`, `profession`, `operating_mode` (ENUMs מ־`TEAM_TAXONOMY_v1.0.0.md` + `GATE|ADVISORY|DUAL`); עודכנו Relationships (אין `routing_rules` דרך `team_id`).  
5. **Run:** סטטוס כולל `PAUSED`; שדה `paused_at`; אינווריאנטים 4–6 (מקסימום אחד `IN_PROGRESS` לדומיין; מספר `PAUSED`; חידוש ממצב קפוא).  
6. **אינווריאנט 1 ל־Run (v1):** הוחלף במפורשות — ההגבלה הבלעדית היא על **`IN_PROGRESS`**, לא על כל ריצה שאינה `COMPLETE`.

### הערת יישור למנדט — "Program"

המנדט מסמן **Program** כישות ללא שינוי; ב־**v1.0.0** לא הוגדרה ישות DB נפרדת בשם Program — מזהה WP מיוצג ב־`runs.work_package_id` ובאירועים. **לא נוספה** טבלת `programs` ב־v2.0.0 ללא GIN נפרד; ניתן לסנתז ב־MERGED או ב־Stage 4 אם יוחלט אחרת.

### OPEN_QUESTIONs שנותרו

אין OPEN_QUESTION פתוח שנדרש Team 00 לפני review — החלטות OPEN_Q-1 ו־OPEN_Q-2 ננעלו. נשאר רק **OPEN_QUESTION (DDL)** מ־v1.0.0 על צורת FK מורכב ל־`routing_rules.phase_id` מול `gate_id` — ייפתר ב־Stage 4.

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
| default_variant | TEXT | NO | — | ∈ ENUM | `TRACK_FULL` \| `TRACK_FOCUSED` \| ערכים עתידיים מ־seed | `TRACK_FULL` |
| doc_team_id | TEXT | YES | NULL | FK → `teams.id` | NULL אם אין צוות תיעוד ייעודי | `team_70` |
| is_active | INTEGER | NO | 1 | BOOL 0/1 | דומיין לא פעיל לא יפתח Run חדש | `1` |
| created_at | TEXT | NO | — | ISO-8601 | חותמת יצירה | `2026-03-26T12:00:00Z` |

### Invariants

1. `slug` ייחודי בכל המערכת.  
2. רק דומיין עם `is_active=1` זכאי ל־`Run` חדש דרך Use Case אתחול.

### Relationships

- `has_many`: `runs` via `runs.domain_id`  
- `has_many`: `routing_rules` via `routing_rules.domain_id` (אופציונלי)  
- `has_many`: `assignments` via `assignments.domain_id`  
- `belongs_to`: `teams` via `doc_team_id` (אופציונלי)

### Notes

- ללא שינוי מול v1.0.0.

---

## Entity: Team

**Description:** יחידת ארגון שמבצעת שלב בפייפליין, כולל מנוע, היקף דומיין, ומטא־טקסונומיה ל־seed ולדשבורד.  
**Storage:** DB  
**Table name:** `teams`  
**Aggregate root:** no  
**Layer:** Domain  

### Fields

| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|-------|------|----------|---------|------------|---------------|---------|
| id | TEXT | NO | — | PK, UNIQUE | פורמט `team_XX`; חייב להתאים ל־`TEAMS_ROSTER` + `TEAM_TAXONOMY` בזמן seed | `team_11` |
| label | TEXT | NO | — | len ≤ 64 | תווית קצרה ל־UI | `Team 11` |
| name | TEXT | NO | — | len ≤ 256 | שם מלא | `AOS Gateway / Execution Lead` |
| engine | TEXT | NO | — | ∈ ENUM | `cursor` \| `cursor_composer` \| `claude` \| `claude_code` \| `codex` \| `openai` \| `human` \| `orchestrator` | `cursor` |
| domain_scope | TEXT | NO | `multi` | ∈ ENUM | `tiktrack` \| `agents_os` \| `shared` \| `multi` | `agents_os` |
| in_gate_process | INTEGER | NO | 1 | BOOL | אם 0 — לא ניתן לשייך לתפקיד פייפליין (Invariant Assignment) | `1` |
| **group** | TEXT | NO | — | ∈ ENUM | אחד מ: `leadership` \| `gateway` \| `implementation` \| `qa` \| `design` \| `architecture` \| `governance` \| `documentation` — לפי `TEAM_TAXONOMY_v1.0.0.md` §1 | `gateway` |
| **profession** | TEXT | NO | — | ∈ ENUM | אחד מ: `principal` \| `gateway_orchestrator` \| `backend_engineer` \| `frontend_engineer` \| `devops_engineer` \| `qa_engineer` \| `ui_designer` \| `domain_architect` \| `constitutional_validator` \| `spec_governance` \| `dev_validator` \| `git_operator` \| `technical_writer` — לפי §2 | `gateway_orchestrator` |
| **operating_mode** | TEXT | NO | `GATE` | ∈ ENUM | `GATE` — בתהליך שער בלבד; `ADVISORY` — ייעוץ בלבד; `DUAL` — שני מצבים (למשל team_170, team_190) | `GATE` |
| roster_version | TEXT | YES | NULL | — | גרסת roster שממנה נשמרה השורה | `1.3.0` |
| created_at | TEXT | NO | — | ISO-8601 | חותמת יצירה | `2026-03-26T12:00:00Z` |

### Invariants

1. `id` קיים ב־roster או נרשם בהליך שינוי מנוהל.  
2. `engine` תואם יכולות Prompt / Executor (מיפוי ב־Stage 3).  
3. **`group` + `profession` חייבים להתאים לשורת המיפוי ב־`TEAM_TAXONOMY_v1.0.0.md` §3** (אימות ב־seed / CI).

### Relationships

- `has_many`: `assignments` via `team_id` (תפקיד ממולא)  
- `has_many`: `assignments` via `assigned_by` (מבצע שיוך — לרוב Principal)  
- `has_many`: `events` via `actor_team_id`  
- `referenced_by`: `domains.doc_team_id`

### Notes

- תוכן FREE-TEXT נשאר ב־FILE (`team_XX.md`).  
- `team_00` יכול להופיע כ־`assigned_by` כאשר השיוך מבוצע ע"י Principal.

---

## Entity: PipelineRole

**Description:** הגדרת תפקיד פייפליין — *סוג היכולת* הנדרשת בנקודה בפייפליין (לא *מי* מבצע). מופרד מ־Assignment.  
**Storage:** DB  
**Table name:** `pipeline_roles`  
**Aggregate root:** no  
**Layer:** Domain  

### Fields

| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|-------|------|----------|---------|------------|---------------|---------|
| id | TEXT | NO | — | PK, ULID | מזהה יציב | `01JROLE...` |
| name | TEXT | NO | — | UNIQUE, len ≤ 64 | Machine-safe: `ORCHESTRATOR`, `IMPLEMENTER_BACKEND`, … | `QA_VALIDATOR` |
| display_name | TEXT | NO | — | len ≤ 128 | תצוגה בדשבורד | `QA Validator` |
| description | TEXT | YES | NULL | — | הסבר לצוות שמקבל את התפקיד | `Blocks gate on FAIL` |
| can_block_gate | INTEGER | NO | 0 | BOOL 0/1 | אם 1 — ניתן להוציא BLOCKER verdict בתפקיד זה | `1` |
| is_seeded | INTEGER | NO | 1 | BOOL 0/1 | 1 = מ־`definition.yaml`; 0 = נוצר ידנית | `1` |
| created_at | TEXT | NO | — | ISO-8601 | חותמת יצירה | `2026-03-26T12:00:00Z` |

### Invariants

1. `name` ייחודי גלובלית.  
2. PipelineRole עם `Assignment` ב־`ACTIVE` לא נמחק (רק soft-deprecate).

### Relationships

- `has_many`: `assignments` via `role_id`  
- `referenced_by`: `routing_rules.role_id`

### Notes

- זרימת ניתוב: `RoutingRule → role_id → Assignment (ACTIVE) → team_id`.

---

## Entity: Assignment

**Description:** קישור בין PipelineRole לצוות קונקרטי ל־WP קונקרטי; נוצר ב־**GATE_0**; קבוע למשך ה־WP (Iron Rule).  
**Storage:** DB  
**Table name:** `assignments`  
**Aggregate root:** no  
**Layer:** Domain  

### Fields

| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|-------|------|----------|---------|------------|---------------|---------|
| id | TEXT | NO | — | PK, ULID | מזהה שיוך | `01JASG...` |
| work_package_id | TEXT | NO | — | — | מזהה WP חיצוני; קיים לפני יצירת Run | `S003-P004-WP001` |
| domain_id | TEXT | NO | — | FK → `domains.id` | דומיין ה־WP | `agents_os` |
| role_id | TEXT | NO | — | FK → `pipeline_roles.id` | התפקיד המשויך | `01JROLE...` |
| team_id | TEXT | NO | — | FK → `teams.id` | הצוות הממלא את התפקיד | `team_51` |
| assigned_at | TEXT | NO | — | ISO-8601 | זמן יצירה (GATE_0) | `2026-03-26T10:00:00Z` |
| assigned_by | TEXT | NO | — | FK → `teams.id` | מבצע השיוך (לרוב `team_00`) | `team_00` |
| status | TEXT | NO | `ACTIVE` | ∈ ENUM | `ACTIVE` \| `SUPERSEDED` — SUPERSEDED רק באישור Team 00 | `ACTIVE` |
| superseded_by | TEXT | YES | NULL | FK → `assignments.id` | NOT NULL רק כאשר `status=SUPERSEDED` | NULL |
| notes | TEXT | YES | NULL | — | הסבר אופציונלי | NULL |
| created_at | TEXT | NO | — | ISO-8601 | חותמת רשומה | `2026-03-26T10:00:00Z` |

### Invariants

1. לכל (`work_package_id`, `role_id`) קיים לכל היותר **שיוך `ACTIVE` אחד** בזמן נתון.  
2. אין שינוי `team_id` בשיוך `ACTIVE` — רק SUPERSEDE + שורת `assignments` חדשה.  
3. יצירת שיוך מותרת **עד סיום GATE_0** (לא לאחר מעבר Run ל־GATE_1).  
4. אם `teams.in_gate_process=0` — אסור לשייך צוות זה לתפקיד פייפליין.

### Relationships

- `belongs_to`: `domains`, `pipeline_roles`, `teams` (כ־`team_id`), `teams` (כ־`assigned_by`), `assignments` (כ־`superseded_by`, אופציונלי)

### Notes

- שינוי צוות אחרי GATE_0 = מסלול חריג עם אישור Team 00 + אירוע אודיט.

---

## Entity: Gate

**Description:** צעד מאקרו בפייפליין עם סדר גלובלי וסימון שער אנושי.  
**Storage:** DB  
**Table name:** `gates`  
**Aggregate root:** no  
**Layer:** Domain  

### Fields

| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|-------|------|----------|---------|------------|---------------|---------|
| id | TEXT | NO | — | PK, UNIQUE | `GATE_0` … | `GATE_2` |
| sequence_order | INTEGER | NO | — | UNIQUE, ≥ 0 | סדר המכונה | `2` |
| name | TEXT | NO | — | len ≤ 256 | תצוגה | `Work Plan` |
| is_human_gate | INTEGER | NO | 0 | BOOL | דורש HITL לפני מעבר | `1` |
| description | TEXT | YES | NULL | — | עזר לדשבורד | `…` |

### Invariants

1. `sequence_order` ייחודי.  
2. אין מחיקה אם קיימים הפניות מ־`runs` / `events` (soft-deprecate).

### Relationships

- `has_many`: `phases`, `routing_rules`, `events`

### Notes

- ללא שינוי מול v1.0.0.

---

## Entity: Phase

**Description:** תת־שלב בתוך שער עם סדר ודגל אוטומציה.  
**Storage:** DB  
**Table name:** `phases`  
**Aggregate root:** no  
**Layer:** Domain  

### Fields

| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|-------|------|----------|---------|------------|---------------|---------|
| id | TEXT | NO | — | PK, UNIQUE | מזהה שלב יציב בתוך שער | `2.2` |
| gate_id | TEXT | NO | — | FK → `gates.id` | שער הורה | `GATE_2` |
| sequence_order | INTEGER | NO | — | UNIQUE per `gate_id` | סדר בתוך השער | `1` |
| name | TEXT | NO | — | len ≤ 256 | תצוגה | `Work Plan` |
| allow_auto | INTEGER | NO | 0 | BOOL | אוטומציה מותרת בכפוף ל־Policy + HITL | `0` |
| display_in_ui | INTEGER | NO | 1 | BOOL | 0 = שלב טכני נסתר | `1` |

### Invariants

1. (`gate_id`, `sequence_order`) ייחודי.  
2. (`gate_id`, `id`) ייחודי.

### Relationships

- `belongs_to`: `gates`  
- `has_many`: `routing_rules` (לוגית דרך `phase_id`)

### Notes

- OPEN_QUESTION DDL על FK מורכב — כב־v1.0.0.

---

## Entity: RoutingRule

**Description:** כלל ניתוב: הקשר gate/phase/domain/variant → **תפקיד פייפליין** (`role_id`), עם עדיפות; לא מצביע ישירות לצוות.  
**Storage:** DB  
**Table name:** `routing_rules`  
**Aggregate root:** no  
**Layer:** Domain  

### Fields

| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|-------|------|----------|---------|------------|---------------|---------|
| id | TEXT | NO | — | PK, ULID | מזהה שורה | `01JABC...` |
| gate_id | TEXT | NO | — | FK → `gates.id` | שער חובה | `GATE_2` |
| phase_id | TEXT | YES | NULL | FK → `phases.id` | NULL = כלל ברמת שער | `2.2` |
| domain_id | TEXT | YES | NULL | FK → `domains.id` | NULL = כל הדומיינים הזכאים | `tiktrack` |
| variant | TEXT | YES | NULL | — | NULL = כל הווריאנטים | `TRACK_FULL` |
| **role_id** | TEXT | NO | — | FK → `pipeline_roles.id` | איזה תפקיד “מקבל את השורה” — פענוח צוות דרך Assignment | `01JROLE...` |
| priority | INTEGER | NO | 100 | — | גבוה = נבחר ראשון אחרי סינון | `500` |
| resolve_from_state_key | TEXT | YES | NULL | **DEPRECATED** | אם לא NULL — **legacy**: לוג אזהרה; המנגנון הקנוני הוא Assignment | `lod200_author_team` |
| created_at | TEXT | NO | — | ISO-8601 | חותמת יצירה | `2026-03-26T12:00:00Z` |

### Invariants

1. `role_id` חובה (NOT NULL).  
2. לאחר סינון הקשר, שורה מנצחת אחת לפי `ORDER BY priority DESC` (+ כללי שוויון ב־Stage 5).  
3. אם `resolve_from_state_key` אינו NULL — ריצת resolver מדווחת **warning**; לא להסתמך על שדה זה בלוגיקה חדשה.

### Relationships

- `belongs_to`: `gates`, `phases` (אופציונלי), `domains` (אופציונלי), **`pipeline_roles`**

### Notes

- Resolver: `role_id` → חיפוש `Assignment` עם אותו `work_package_id` + `role_id` + `ACTIVE` → `team_id`.

---

## Entity: Run

**Description:** ריצת פייפליין אחת ל־WP בדומיין — שורש אגרגציה; תומך **PAUSED** לפי נעילת v3.0.  
**Storage:** DB (canonical) + FILE projection (`pipeline_state.json` — Option A)  
**Table name:** `runs`  
**Aggregate root:** yes  
**Layer:** Domain  

### Fields

| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|-------|------|----------|---------|------------|---------------|---------|
| id | TEXT | NO | — | PK, ULID | מזהה ריצה פנימי | `01JRUN...` |
| work_package_id | TEXT | NO | — | ייחודיות “ריצה פעילה” מוגדרת ב־Invariant 1 (לא לפי WP בלבד); ב־DDL Stage 4: אינדקס חלקי מומלץ `UNIQUE(domain_id) WHERE status='IN_PROGRESS'` | מזהה WP | `S003-P004-WP001` |
| domain_id | TEXT | NO | — | FK → `domains.id` | דומיין הריצה | `agents_os` |
| process_variant | TEXT | NO | — | — | משפיע על ניתוב | `TRACK_FULL` |
| current_gate_id | TEXT | NO | — | FK → `gates.id` | שער פעיל | `GATE_2` |
| current_phase_id | TEXT | YES | NULL | FK → `phases.id` | NULL לפי מדיניות שלב | `2.2` |
| status | TEXT | NO | `NOT_STARTED` | ∈ ENUM | `NOT_STARTED` \| `IN_PROGRESS` \| `CORRECTION` \| `PAUSED` \| `COMPLETE` | `IN_PROGRESS` |
| **paused_at** | TEXT | YES | NULL | ISO-8601 | NOT NULL כאשר `status=PAUSED`; NULL אחרת | NULL |
| execution_mode | TEXT | NO | `MANUAL` | ∈ ENUM | `MANUAL` \| `DASHBOARD` \| `AUTOMATIC` | `MANUAL` |
| correction_cycle_count | INTEGER | NO | 0 | ≥ 0 | נספר ע"י אפליקציה במחזורי תיקון | `1` |
| spec_brief | TEXT | YES | NULL | — | שכבת זהות בפרומפט | `…` |
| gates_completed_json | TEXT | NO | `[]` | JSON array | מסונכרן עם אירועים | `[]` |
| gates_failed_json | TEXT | NO | `[]` | JSON array | היסטוריית כשלים ל־UX | `[]` |
| lod200_author_team | TEXT | YES | NULL | FK → `teams.id` | **DEPRECATED path** לעומת Assignment — העדפת מיגרציה ל־Assignment | `team_102` |
| state_payload_json | TEXT | YES | NULL | JSON | שדות נוספים | `{...}` |
| started_at | TEXT | NO | — | ISO-8601 | בעת INIT | `2026-03-26T10:00:00Z` |
| last_updated | TEXT | NO | — | ISO-8601 | בכל מעבר מצב | `2026-03-26T11:00:00Z` |
| completed_at | TEXT | YES | NULL | ISO-8601 | מלא רק ב־`COMPLETE` | NULL |

### Invariants

1. לכל `domain_id` לכל היותר **ריצה אחת** בסטטוס **`IN_PROGRESS`** בכל זמן נתון (אלא אם Team 00 מאשר אחרת).  
2. **מספר ריצות `PAUSED` מותר** בו־זמנית לאותו `domain_id` (אין תקרה בסיסית ב־v2.0.0).  
3. מעבר **`PAUSED` → `IN_PROGRESS` (resume)**: חוזרים ל־**אותו** `current_gate_id` + `current_phase_id` שהיו בעת ההקפאה — ללא איפוס מצב.  
4. מעבר מצב משמעותי יוצר `Event` לפני עדכון שדות denormalized.  
5. `pipeline_state.json` הוא **projection** לפי Option A; לא מקור אמת.  
6. `paused_at` חייב להתאים ל־`status` (NULL iff not PAUSED).

### Relationships

- `belongs_to`: `domains`, `gates`, `phases`  
- `has_many`: `events`

### Notes

- `ABORTED` / `SUSPENDED` — מחוץ ל־v3.0 (ABORTED ב־v3.1).

---

## Entity: Event

**Description:** רשומת אמת בלתי משתנה (append-only) למעבר או אבן דרך בריצה.  
**Storage:** DB  
**Table name:** `events`  
**Aggregate root:** no  
**Layer:** Domain  

### Fields

| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|-------|------|----------|---------|------------|---------------|---------|
| id | TEXT | NO | — | PK, ULID | מזהה אירוע | `01JEVT...` |
| run_id | TEXT | NO | — | FK → `runs.id` | שיוך לריצה | `01JRUN...` |
| sequence_no | INTEGER | NO | — | UNIQUE per `run_id` | מונוטוני | `42` |
| event_type | TEXT | NO | — | ∈ ENUM | כולל `TEAM_ASSIGNMENT_CHANGED` וכו' | `GATE_PASS` |
| gate_id | TEXT | YES | NULL | FK | לפי רלוונטיות | `GATE_2` |
| phase_id | TEXT | YES | NULL | FK | שלב בזמן האירוע | `2.2` |
| domain_id | TEXT | NO | — | FK | denormalized | `agents_os` |
| work_package_id | TEXT | NO | — | — | שכפול מ־`runs` | `S003-P004-WP001` |
| actor_team_id | TEXT | YES | NULL | FK → `teams.id` | NULL אם אין אקטור צוות | `team_61` |
| actor_type | TEXT | NO | — | ∈ ENUM | `human` \| `agent` \| `scheduler` \| `system` | `human` |
| verdict | TEXT | YES | NULL | — | `PASS` / `FAIL` / … | `PASS` |
| reason | TEXT | YES | NULL | — | טקסט או קוד | `…` |
| payload_json | TEXT | YES | NULL | JSON | פירוט | `{...}` |
| occurred_at | TEXT | NO | — | ISO-8601 | wall-clock | `2026-03-26T12:00:00Z` |
| prev_hash | TEXT | YES | NULL | — | שרשרת L2 | `sha256:...` |
| event_hash | TEXT | NO | — | UNIQUE | גיבוב | `sha256:...` |

### Invariants

1. **אין UPDATE / DELETE** על שורות קיימות.  
2. `sequence_no` רציף לכל `run_id` (ברירת מחדל).  
3. שרשרת `prev_hash` שלמה לאירועים קריטיים.

### Relationships

- `belongs_to`: `runs`, `gates`, `phases`, `domains`, `teams` (אופציונלי)

### Notes

- ללא שינוי עקרוני מול v1.0.0.

---

## Entity: Template

**Description:** תבנית שכבת משימה (Layer 4) לפרומפט.  
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
| domain_id | TEXT | YES | NULL | FK | NULL = גלובלי | `agents_os` |
| name | TEXT | NO | — | len ≤ 128 | תווית | `GATE_3 skeleton` |
| body_markdown | TEXT | NO | — | — | תוכן + placeholders | `## Task\n...` |
| version | INTEGER | NO | 1 | ≥ 1 | גרסה | `2` |
| is_active | INTEGER | NO | 1 | BOOL | תבנית פעילה אחת להקשר (ברירת מחדל) | `1` |
| updated_at | TEXT | NO | — | ISO-8601 | עדכון | `2026-03-26T12:00:00Z` |

### Invariants

1. לכל הקשר (`gate_id`, `phase_id`, `domain_id` + NULL rules) לכל היותר תבנית `ACTIVE` אחת (ברירת מחדל).  
2. עריכה = גרסה / מדיניות ב־Stage 3.

### Relationships

- `belongs_to`: `gates`, `phases` (אופציונלי), `domains` (אופציונלי)

### Notes

- ללא שינוי מול v1.0.0.

---

## Entity: Policy

**Description:** מדיניות תקציב טוקנים, מטמון שכבות, פרמטרי ביצועים.  
**Storage:** DB  
**Table name:** `policies`  
**Aggregate root:** no  
**Layer:** Domain  

### Fields

| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|-------|------|----------|---------|------------|---------------|---------|
| id | TEXT | NO | — | PK, ULID | מזהה | `01JPOL...` |
| scope_type | TEXT | NO | `GLOBAL` | ∈ ENUM | `GLOBAL` \| `DOMAIN` \| `GATE` \| `PHASE` | `DOMAIN` |
| domain_id | TEXT | YES | NULL | FK | חובה לפי scope | `tiktrack` |
| gate_id | TEXT | YES | NULL | FK | חובה לפי scope | `GATE_1` |
| phase_id | TEXT | YES | NULL | FK | חובה לפי scope | `1.2` |
| policy_key | TEXT | NO | — | — | מפתח לוגי | `token_budget_total` |
| policy_value_json | TEXT | NO | `{}` | JSON | ערך | `{"max":640}` |
| priority | INTEGER | NO | 100 | — | ספציפיות | `200` |
| updated_at | TEXT | NO | — | ISO-8601 | שינוי → אירוע אודיט אם נדרש | `2026-03-26T12:00:00Z` |

### Invariants

1. `GLOBAL` ⇒ כל FK scope = NULL.  
2. אין כפילות דטרמיניסטית לפי מפתח + היקף + עדיפות.

### Relationships

- `belongs_to`: `domains`, `gates`, `phases` (לפי scope)

### Notes

- ללא שינוי מול v1.0.0.

---

## Entity: Prompt

**Description:** אובייקט ערך רuntime — ארבע שכבות לפני שליחה לסוכן; לא שורת DB.  
**Storage:** Value Object  
**Table name:** —  
**Aggregate root:** no  
**Layer:** Application  

### Fields (Value Object)

| Field | Type | Nullable | Default | Constraint | Business Rule | Example |
|-------|------|----------|---------|------------|---------------|---------|
| layer1_identity | TEXT | NO | — | לפי Policy | ~40 טוקנים יעד | `gate: GATE_2 …` |
| layer2_governance | TEXT | NO | — | cache לפי hash | מ־FILE `governance.md` | `…` |
| layer3_state | TEXT | NO | — | minimal diff | מ־`runs` + assignments רלוונטיים | `…` |
| layer4_task | TEXT | NO | — | from `templates` | משימה | `…` |
| assembled_at | TEXT | NO | — | ISO-8601 | חותמת | `2026-03-26T12:00:00Z` |
| content_hash | TEXT | NO | — | SHA-256 hex | audit | `abc...` |
| token_estimate | INTEGER | YES | NULL | DERIVED | NULL אם לא נספר | `620` |

### Invariants

1. בדיוק ארבע שכבות.  
2. לא נשמר ב־DB כשורה; אודיט דרך אירוע/hash אם נדרש.

### Relationships

- נבנה מ־`Run`, `Template`, `Policy`, FILE governance, הקשר צוותים.

### Notes

- ללא שינוי עקרוני מול v1.0.0; Layer 3 יכול לכלול תמצית שיוכים מ־Assignment.  
- מודל Principal / בן־אנוש יחיד / בלי שמות פרטיים בקנון: `TEAM_101_PRINCIPAL_TEAM_00_AND_COMMUNICATION_MODEL_v1.0.0.md`.

---

**log_entry | TEAM_101 | ENTITY_DICTIONARY_SUBMITTED | v2.0.0 | 2026-03-26**
