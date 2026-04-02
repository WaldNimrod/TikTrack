---
id: TEAM_100_TO_TEAM_111_STAGE4_DDL_MANDATE_v1.0.0
historical_record: true
from: Team 100 (Chief System Architect — Claude Code)
to: Team 111 (AOS Domain Architect — IDE/Cursor)
date: 2026-03-26
stage: SPEC_STAGE_4
type: MANDATE
gate_trigger: Stage 3 CLOSED (Team 190 PASS — v1.0.2 — 2026-03-26)
authority: Team 00 (Nimrod)
reviewer: Team 190
gate_approver: Team 00---

# MANDATE — Stage 4: Data Schema (DDL)
## AOS v3 Spec — שלב 4 מתוך 8

---

## §0 — הקשר ארגוני ותיקון זהות (חובה לקרוא)

**זהות Team 111:**
You are **Team 111 — AOS Domain Architect**.
- Legacy alias: `team_101` (ישן — לא בשימוש יותר)
- Domain: `agents_os` (AOS)
- Convention: x1 = AOS domain (team_11, team_111, team_191, etc.)
- Engine: Cursor Composer (IDE)
- Your predecessor role was called "team_101" — that identifier has been migrated to team_111 via `TEAMS_ROSTER_v1.0.0.json v1.6.0`
- All canonical documents now reference you as **team_111**

**מדוע team_111 כותב את Stage 4:**
- Stage 1/1b: Team 101 (עכשיו team_111) כתב את Entity Dictionary — אתה ה-SSOT owner של data model
- Stage 4 = DDL נגזר ישירות מה-Entity Dictionary שכתבת (v2.0.2)
- ה-authority הדאטה-מודלית נשארת אצלך

---

## §1 — טריגר ותלויות

| Item | Status |
|---|---|
| Stage 2 (State Machine) | ✅ CLOSED — `TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md` (יישור SSOT מול DDL; v1.0.1 superseded) |
| Stage 3 (Use Case Catalog) | ✅ CLOSED — `TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md` (G07/G08; v1.0.2 superseded) |
| Entity Dictionary SSOT | ✅ LOCKED — `TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md` |
| Stage 4 gate | 🔄 ACTIVE — this mandate |

**Stage 3 gate approval:** Team 190 PASS (Round 3, 2026-03-26) — no open findings.

---

## §2 — קבצי SSOT לקריאה חובה (לפני כתיבה)

```
1. _COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md
   → ה-SSOT המלא. כל DDL נגזר ישירות מכאן. אין סתירות מותרות.

2. _COMMUNICATION/team_100/TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.2.md
   → States: IDLE/IN_PROGRESS/PAUSED/CORRECTION/COMPLETE
   → A10A-E: FORCE_* actions — לוודא DDL תומך בכל שדות

3. _COMMUNICATION/team_100/TEAM_100_AOS_V3_USE_CASE_CATALOG_v1.0.3.md
   → UC-01..UC-14 + QO-01/QO-02
   → כל SQL INSERT/UPDATE/SELECT ← ודא שה-DDL מאפשר אותם

4. documentation/docs-governance/01-FOUNDATIONS/PRINCIPAL_AND_TEAM_00_MODEL_v1.0.0.md
   → D-03: team_00 DB row — seed data חובה
```

---

## §3 — Deliverable

**File:** `_COMMUNICATION/team_111/TEAM_111_AOS_V3_DDL_SPEC_v1.0.0.md`

---

## §4 — תוכן חובה

### §4.1 — DDL מלא

DDL ל-**14 טבלאות** (לפי Entity Dictionary v2.0.2 + addendums):

| # | Table | Entity | Source |
|---|---|---|---|
| 1 | `runs` | Run | Dict §Run |
| 2 | `gates` | Gate | Dict §Gate |
| 3 | `phases` | Phase | Dict §Phase |
| 4 | `domains` | Domain | Dict §Domain |
| 5 | `teams` | Team | Dict §Team |
| 6 | `pipeline_roles` | PipelineRole | Dict §PipelineRole |
| 7 | `routing_rules` | RoutingRule | Dict §RoutingRule |
| 8 | `gate_role_authorities` | GateRoleAuthority | Dict §GateRoleAuthority (שם טבלה קנוני ברבים; Team 190 אישר) |
| 9 | `assignments` | Assignment | Dict §Assignment |
| 10 | `events` | Event | Dict §Event |
| 11 | `prompts` | Prompt | Dict §Prompt |
| 12 | `templates` | Template | Dict §Template |
| 13 | `policies` | Policy | Dict §Policy |
| 14 | `wp_artifact_index` | WP_ARTIFACT_INDEX | Spec Process Plan §ו.5 |

**פורמט לכל טבלה:**
```sql
-- ========================================
-- TABLE: <table_name>
-- Entity: <EntityName>
-- Source: Dict v2.0.2 §<Entity>
-- ========================================
CREATE TABLE <table_name> (
  -- fields per Dict v2.0.2, exact types/constraints/nullability
);

-- Indexes (with justification comment)
CREATE INDEX idx_<table>_<field> ON <table>(<field>);
-- Justification: UC-XX uses this query pattern

-- Constraints (named, if not inline)
ALTER TABLE <table> ADD CONSTRAINT ...;
```

### §4.2 — Iron Rules לכתיבת DDL

1. **כל field מ-Dict v2.0.2 = חייב להופיע ב-DDL.** אין הוספות ואין השמטות ללא הסבר.
2. **כל FK חייב להיות מוגדר במפורש** — `REFERENCES <table>(<field>) ON DELETE <policy>`.
3. **כל index חייב comment** המציין את UC/query שמצדיק אותו.
4. **כל constraint חייב שם** — `CONSTRAINT <name> CHECK (...)`.
5. **NULL vs NOT NULL** — לפי Dict v2.0.2 בדיוק. ספק = NOT NULL.
6. **`id` fields** — `TEXT PRIMARY KEY` עם `DEFAULT (lower(hex(randomblob(16))))` אם ULID לא זמין ב-SQLite, או `ulid()` אם PostgreSQL.
7. **Financial precision** — כל field כספי: `NUMERIC(20,8)`. Iron Rule.
8. **`last_updated`** — חייב להופיע בכל טבלה מוטציה-capable; מוגדר בדיוק כמו ב-Dict.

### §4.3 — Composite FK (נגזר מ-Dict v2.0.2 — SSOT)

**תיקון 2026-03-26 (Team 190 F-03):** אין `run_id` בישות `Assignment` במילון; אין composite FK מומצא על `(run_id, role_id)`.

1. **`phases`:** `UNIQUE (gate_id, id)` (או מקביל) — תשתית ל־composite FK.  
2. **כאשר `phase_id IS NOT NULL`:** ב־`routing_rules`, `gate_role_authorities`, `runs` (זוג gate/phase נוכחי), `events`, `templates`, `policies` — `FOREIGN KEY (gate_id, phase_id) REFERENCES phases (gate_id, id)`.  
3. **`assignments`:** FKים לפי המילון בלבד — `role_id` → `pipeline_roles`, `team_id` / `assigned_by` → `teams`, `domain_id` → `domains`; קישור לוגי לריצה דרך `work_package_id` + `domain_id` (לא FK ל־`runs` בלי שדה SSOT).

### §4.4 — GateRoleAuthority Dual-Check

לפי Dict v2.0.2 §GateRoleAuthority: אכיפת BLOCKER דורשת `pipeline_roles.can_block_gate=1` **ו־**שורת `gate_role_authorities` מתאימה; ה־`role_id` ב־`assignments` נבדק מול הקשר ה־run הנוכחי (gate/phase) בשכבת המנוע.

**DDL חייב לכלול CHECK constraint מסוג:**
```sql
-- אם SQLite: trigger; אם PostgreSQL: CHECK + FK
-- ה-DDL יציין את הגישה הנבחרת ואת הנימוק
```

### §4.5 — D-03: Seed Data (team_00 חובה)

```sql
-- ========================================
-- SEED: D-03 — team_00 DB row
-- Reference: PRINCIPAL_AND_TEAM_00_MODEL_v1.0.0.md §D-03
-- ========================================
INSERT INTO teams (id, label, engine, domain, group_name, status)
VALUES ('team_00', 'System Designer (Human)', 'human', NULL, 'principals', 'ACTIVE');
-- Note: team_00 is the sole principal; domain=NULL (cross-domain authority)
```

**Validation query (לכלול בSpec):**
```sql
SELECT id FROM teams WHERE id = 'team_00';
-- Expected: 1 row — if 0 rows, system is in invalid state (D-03 violated)
```

### §4.6 — wp_artifact_index (Addendum)

לפי Spec Process Plan §ו.5:
```sql
CREATE TABLE wp_artifact_index (
  id          TEXT PRIMARY KEY,
  wp_id       TEXT NOT NULL,
  path        TEXT NOT NULL UNIQUE,
  type        TEXT NOT NULL CHECK (type IN ('CANONICAL','DELIVERABLE','OPERATIONAL','NOTIFICATION','RUNTIME_LOG')),
  status      TEXT NOT NULL CHECK (status IN ('ACTIVE','LOCKED','SUPERSEDED','ARCHIVE_PENDING')),
  stage       TEXT,
  created_by  TEXT REFERENCES teams(id),
  created_at  DATETIME NOT NULL DEFAULT (datetime('now')),
  supersedes  TEXT,
  purpose     TEXT,
  last_updated DATETIME NOT NULL DEFAULT (datetime('now'))
);
```

---

## §5 — Validation Checklist (לכלול ב-Deliverable)

בסוף ה-DDL Spec, הוסף section:

```markdown
## Validation Checklist

### V-01: Entity Coverage
| Entity | Table | Dict v2.0.2 field count | DDL column count | Match |
|---|---|---|---|---|
| Run | runs | N | N | ✅/❌ |
| ... | | | | |

### V-02: FK Completeness
| FK | From | To | ON DELETE | Defined |
|---|---|---|---|---|
| runs.domain_id | runs | domains | RESTRICT | ✅/❌ |
| ... | | | | |

### V-03: Index Justification
| Index | Table | Field | UC Reference | Defined |
|---|---|---|---|---|
| idx_runs_domain | runs | domain_id | UC-01 G01 check 1 | ✅/❌ |
| ... | | | | |

### V-04: D-03 Seed
- [ ] team_00 row exists in seed
- [ ] Validation query documented

### V-05: GateRoleAuthority Dual-Check
- [ ] Mechanism defined (CHECK/trigger/application-layer)
- [ ] Approach documented with rationale

### V-06: State Machine Alignment
- [ ] All `runs.status` values match SM Spec states
- [ ] `paused_routing_snapshot_json` field exists on runs
- [ ] `correction_cycle_count` field exists on runs
- [ ] `paused_at` field exists on runs
- [ ] `started_at` field exists on runs (not created_at)
```

---

## §6 — Review Routing

| Action | Team | Trigger |
|---|---|---|
| Submit | Team 111 → Team 190 | upon completion |
| Review | Team 190 | PASS / CONDITIONAL_PASS / FAIL |
| Fix & resubmit | Team 111 | on CONDITIONAL_PASS |
| Gate approval | Team 00 (Nimrod) | after Team 190 PASS |
| Index update | Team 111 | include in submission |

**Target file for review submission:**
```
_COMMUNICATION/team_190/TEAM_111_TO_TEAM_190_STAGE4_DDL_REVIEW_REQUEST_v1.0.0.md
```

---

## §7 — Artifact Index Update (חובה עם הגשה)

עדכן `_COMMUNICATION/team_00/AOS_V3_SPEC_ARTIFACT_INDEX_v1.0.0.json`:
- הוסף entry לDDL Spec (ACTIVE)
- מתחזק כ-SSOT — אל תשכח `updated_at` + `updated_by`

---

**log_entry | TEAM_100 | STAGE4_DDL_MANDATE | ISSUED_TO_TEAM_111 | 2026-03-26**  
**log_entry | TEAM_100 | STAGE4_DDL_MANDATE | ERRATA_TEAM190_F03_F04_TABLE_NAME | 2026-03-26**
