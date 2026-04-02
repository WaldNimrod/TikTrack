---
id: TEAM_00_TO_TEAM_101_AOS_V3_ENTITY_DICT_REVISION_MANDATE_v2.0.0
historical_record: true
from: Team 00 (System Designer)
to: Team 101 (AOS Domain Architect — IDE)
date: 2026-03-26
status: ISSUED
stage: SPEC_STAGE_1B — Entity Dictionary Revision
supersedes: TEAM_00_TO_TEAM_101_AOS_V3_SPEC_STAGE1_ENTITY_DICTIONARY_MANDATE_v1.0.0.md---

# Mandate — AOS v3 Entity Dictionary Revision (Stage 1b)

---

## 1. רקע ומה השתנה

ה-Entity Dictionary v1.0.0 שסיפקת הוא איכותי. Stage 1b נדרש בשל שלושה שינויים אדריכליים שאושרו לאחר הגשת v1.0.0:

### א. מודל צוותות הורחב — Team Matrix

המבנה הארגוני אושר לכלול:
- שדות `group` + `profession` + `operating_mode` על כל צוות
- 21 צוותות עם taxonomy מוגדר (ראה `TEAM_TAXONOMY_v1.0.0.md`)
- הפרדת **תפקיד בפייפליין** (PipelineRole) מ**שיוך צוות** (Assignment)

### ב. ישויות חדשות נדרשות

1. **`PipelineRole`** — מגדיר מה *סוג היכולת* הנדרשת בנקודת זמן בפייפליין (לא מי מבצע)
2. **`Assignment`** — קושר PipelineRole לצוות ספציפי ל-WP ספציפי; נוצר ב-GATE_0

### ג. `RoutingRule` משתנה

`team_id` הישיר מוחלף ב-`role_id` (FK → PipelineRole).
הניתוב כעת: `RoutingRule → role_id → Assignment → team_id`

### ד. החלטות נעלו

| # | נושא | החלטה סופית |
|---|---|---|
| OPEN_Q-1 | pipeline_state.json shape | **Option A** — `{"tiktrack":{...},"agents_os":{...}}` |
| OPEN_Q-2 | ABORTED / SUSPENDED | **PAUSED** נכנס ל-v3.0; ABORTED נדחה ל-v3.1 |

---

## 2. מה שאתה צריך לכתוב

### OUTPUT: `TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.0.md`
**שמור ל:** `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.0.md`

**בסיס:** `TEAM_101_AOS_V3_ENTITY_DICTIONARY_v1.0.0.md` — **לקחת כבסיס ולהוסיף/לשנות רק את הנדרש.**

---

## 3. שינויים נדרשים — Entity by Entity

### 3.1 ישות חדשה: PipelineRole

**Description:** הגדרת תפקיד פייפליין — מה *סוג היכולת* הנדרשת בנקודה בפייפליין (למשל ORCHESTRATOR, IMPLEMENTER_BACKEND). מופרד מ-Assignment שמגדיר *מי* מבצע תפקיד זה ב-WP ספציפי.

```
Storage: DB
Table name: pipeline_roles
Aggregate root: no
Layer: Domain
```

שדות נדרשים:

| Field | Type | Nullable | Constraint | Business Rule |
|---|---|---|---|---|
| id | TEXT | NO | PK, ULID | מזהה יציב |
| name | TEXT | NO | UNIQUE, len ≤ 64 | Machine-safe. דוגמאות: `ORCHESTRATOR`, `IMPLEMENTER_BACKEND`, `IMPLEMENTER_FRONTEND`, `IMPLEMENTER_DEVOPS`, `QA_VALIDATOR`, `ARCHITECT`, `CONSTITUTIONAL_VALIDATOR` |
| display_name | TEXT | NO | len ≤ 128 | שם אנושי לדשבורד |
| description | TEXT | YES | — | תיאור תפקיד לצוות שמקבל אותו |
| can_block_gate | INTEGER | NO | BOOL, DEFAULT 0 | אם 1 — ניתן לצוות עם תפקיד זה להוציא BLOCKER verdict |
| is_seeded | INTEGER | NO | BOOL, DEFAULT 1 | אם 1 — שורה זו הגיעה מ-definition.yaml; אם 0 — נוצר ידנית |
| created_at | TEXT | NO | ISO-8601 | — |

Invariants:
1. `name` ייחודי גלובלית
2. PipelineRole שיש עליו Assignment פעיל לא ניתן למחיקה (soft-deprecate)

Relationships:
- `has_many`: `assignments` via `role_id`
- `referenced_by`: `routing_rules.role_id`

---

### 3.2 ישות חדשה: Assignment

**Description:** קישור בין PipelineRole לצוות ספציפי, לעבודה ספציפית (work_package_id). נוצר ב-GATE_0 לכל ה-WP, קבוע לכל משך ה-WP (Iron Rule).

```
Storage: DB
Table name: assignments
Aggregate root: no
Layer: Domain
```

שדות נדרשים:

| Field | Type | Nullable | Constraint | Business Rule |
|---|---|---|---|---|
| id | TEXT | NO | PK, ULID | מזהה שיוך |
| work_package_id | TEXT | NO | — | מזהה WP חיצוני (למשל `S003-P004-WP001`); קיים לפני יצירת Run |
| domain_id | TEXT | NO | FK → domains.id | דומיין ה-WP |
| role_id | TEXT | NO | FK → pipeline_roles.id | התפקיד המשויך |
| team_id | TEXT | NO | FK → teams.id | הצוות הממלא תפקיד זה ב-WP הזה |
| assigned_at | TEXT | NO | ISO-8601 | זמן יצירת השיוך (GATE_0) |
| assigned_by | TEXT | NO | FK → teams.id | הצוות שביצע את השיוך (בדרך כלל team_00) |
| status | TEXT | NO | ∈ ENUM | `ACTIVE` \| `SUPERSEDED` — SUPERSEDED רק עם team_00 approval |
| superseded_by | TEXT | YES | FK → assignments.id | רק אם status=SUPERSEDED |
| notes | TEXT | YES | — | הסבר אופציונלי |
| created_at | TEXT | NO | ISO-8601 | — |

Invariants:
1. עבור (work_package_id, role_id) — רק ACTIVE assignment אחד בכל זמן נתון
2. לא ניתן לשנות team_id של Assignment ACTIVE — מותר רק SUPERSEDE + יצירת שיוך חדש
3. יצירת Assignment מותרת רק לפני ו-עד GATE_0 (לא אחרי שהRun עבר GATE_1)
4. אם team.in_gate_process=0 — לא ניתן לשייך אותו לתפקיד פייפליין

Relationships:
- `belongs_to`: domains, pipeline_roles, teams (team_id), teams (assigned_by)

---

### 3.3 עדכון ישות קיימת: RoutingRule

**שינוי:** `team_id` מוחלף ב-`role_id`. ה-RoutingRule מגדיר כעת *איזה תפקיד* פועל בנקודה — לא ישירות *מי*.

**שדות לשינוי:**

| שדה | לפני | אחרי |
|---|---|---|
| `team_id` | FK → teams.id, NOT NULL | **מוסר** |
| `role_id` | — | **מוסף** FK → pipeline_roles.id, NOT NULL |
| `resolve_from_state_key` | TEXT, YES | **DEPRECATED** — שמר את השדה עם סטטוס deprecated בתיעוד; לא מוסר (backward compat) |

Invariant מעודכן:
1. `role_id` חייב להיות מוגדר (NOT NULL)
2. לצירוף context (gate, phase, domain, variant) — שורה מנצחת אחת לאחר ORDER BY priority DESC
3. `resolve_from_state_key` = deprecated — אם קיים, יש להציג warning ב-log; Assignment הוא המנגנון הקנוני

Relationship מעודכן:
- `belongs_to`: gates, phases (optional), domains (optional), **pipeline_roles** (מחליף teams)

---

### 3.4 עדכון ישות קיימת: Team

**הוסף 3 שדות:**

| Field | Type | Nullable | Constraint | Business Rule | Example |
|---|---|---|---|---|---|
| `group` | TEXT | NO | ∈ ENUM | `leadership` \| `gateway` \| `implementation` \| `qa` \| `design` \| `architecture` \| `governance` \| `documentation` | `gateway` |
| `profession` | TEXT | NO | ∈ ENUM | `principal` \| `gateway_orchestrator` \| `backend_engineer` \| `frontend_engineer` \| `devops_engineer` \| `qa_engineer` \| `ui_designer` \| `domain_architect` \| `constitutional_validator` \| `spec_governance` \| `dev_validator` \| `git_operator` \| `technical_writer` | `gateway_orchestrator` |
| `operating_mode` | TEXT | NO | ∈ ENUM, DEFAULT `GATE` | `GATE` — פעיל בתהליך gate בלבד; `ADVISORY` — ייעוץ בלבד; `DUAL` — גם gate וגם advisory (team_170, team_190) | `GATE` |

Invariant מעודכן:
3. `group` + `profession` חייבים להיות תואמים ל-TEAM_TAXONOMY_v1.0.0.md (יאומת ב-seed)

---

### 3.5 עדכון ישות קיימת: Run

**עדכן שדה status:**

```
לפני: `NOT_STARTED` | `IN_PROGRESS` | `CORRECTION` | `COMPLETE`
אחרי: `NOT_STARTED` | `IN_PROGRESS` | `CORRECTION` | `PAUSED` | `COMPLETE`
```

**הוסף invariants:**
4. כל domain יכול להכיל לכל היותר Run אחד בסטטוס `IN_PROGRESS` בכל זמן נתון
5. כמה Runs בסטטוס `PAUSED` מותרים בו-זמנית (אין הגבלה)
6. מעבר `PAUSED → IN_PROGRESS` (resume): מתחדש מאותו gate_id + phase_id בהם ה-Run הוקפא; אין reset ל-state

**הוסף שדה:**

| Field | Type | Nullable | Constraint | Business Rule |
|---|---|---|---|---|
| `paused_at` | TEXT | YES | ISO-8601 | NULL אם לא PAUSED; מתעדכן בעת מעבר ל-PAUSED |

---

## 4. מה לא לשנות

**כל שאר הישויות נשארות כמו ב-v1.0.0:**
- Domain ✅ ללא שינוי
- Gate ✅ ללא שינוי
- Phase ✅ ללא שינוי
- Template ✅ ללא שינוי
- Policy ✅ ללא שינוי
- Event ✅ ללא שינוי (כולל hash chain + sequence_no)
- Program ✅ ללא שינוי

**שמור על כל ה-7 החלטות מ-v1.0.0** (Run vs Execution, current_phase כשדה, וכו').

---

## 5. פורמט הפלט

**בדיוק כמו v1.0.0:**

```markdown
## Summary
### החלטות שקיבלנו [עדכן — הוסף OPEN_Q-1 + OPEN_Q-2 כנעולות]
### שינויים מ-v1.0.0 [חדש — סעיף תמצות שינויים]

## Entity: [Name]
Description / Storage / Table / Aggregate / Layer
### Fields (טבלה מלאה)
### Invariants
### Relationships
### Notes
```

**אורך:** 12 ישויות עם פירוט מלא. ציפייה: ~400–500 שורות.

---

## 6. Routing ← מה קורה עם הפלט שלך

1. שמור לקובץ: `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.0.md`
2. Team 100 (Chief System Architect) יבצע:
   - השוואה בין v2.0.0 לגרסת Gemini (אם קיימת)
   - סינתזה → `MERGED_DICTIONARY_v1.0.0`
3. Team 190 (Constitutional Validator) יבצע Part B review על ה-MERGED_DICTIONARY
4. GATE_2 approval → Stage 2 (State Machine)

---

## 7. Activation Prompt — הדבק ב-IDE Session

---

```
IDENTITY: You are Team 101 — AOS Domain Architect (IDE).
Engine: Codex / Gemini Code Assist / Cursor IDE.
Authority: AOS domain spec production. You serve Team 100 and Team 00.

CONTEXT FILES TO READ (in order):
1. _COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v1.0.0.md  ← BASE
2. _COMMUNICATION/team_101/TEAM_00_TO_TEAM_101_AOS_V3_ENTITY_DICT_REVISION_MANDATE_v2.0.0.md  ← THIS MANDATE
3. documentation/docs-governance/01-FOUNDATIONS/TEAM_TAXONOMY_v1.0.0.md  ← group/profession ENUMs
4. _COMMUNICATION/team_00/TEAM_00_AOS_V3_SYNTHESIS_ARCHITECTURE_SPEC_v1.0.0.md  ← architectural context

YOUR TASK:
Produce TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.0.md by:

1. Taking v1.0.0 as your exact base — all 10 entities preserved
2. Applying ONLY the changes specified in the mandate (Sections 3.1–3.5)
3. Keeping all 7 decisions from v1.0.0 Summary unchanged
4. Adding a new "שינויים מ-v1.0.0" section in the Summary
5. Maintaining the exact format/column structure from v1.0.0

NEW ENTITIES to add (full field table + invariants + relationships):
- PipelineRole (between Team and RoutingRule in document order)
- Assignment (after PipelineRole)

MODIFIED ENTITIES:
- RoutingRule: replace team_id with role_id (FK → pipeline_roles.id)
- Team: add group, profession, operating_mode fields
- Run: add PAUSED to status enum; add paused_at field; add invariants 4/5/6

CONFIRMED DECISIONS (no longer open questions):
- pipeline_state.json shape → Option A: {"tiktrack":{...},"agents_os":{...}}
- Run.status → PAUSED included in v3.0; ABORTED deferred to v3.1

IRON RULES (do not violate):
- All fields must have Business Rule explanation
- Nullable fields must justify why nullable
- All new entities need Invariants section
- No code — Entity Dictionary only (field definitions, types, constraints)
- One OPEN_QUESTION is allowed ONLY if genuinely unresolvable at this stage

OUTPUT FILE: _COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.0.md

HEADER:
---
id: TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.0
from: Team 101
to: Team 100, Team 190, Team 00
date: [today]
status: SUBMITTED_FOR_REVIEW
stage: SPEC_STAGE_1B
supersedes: TEAM_101_AOS_V3_ENTITY_DICTIONARY_v1.0.0
---
```

---

**log_entry | TEAM_00 | MANDATE_ISSUED | TEAM_101 | ENTITY_DICT_REVISION_v2.0.0 | 2026-03-26**
