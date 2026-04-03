---
id: TEAM_00_TO_TEAM_21_AOS_V3_GATE2_ARCH_CONSULTATION_RESOLUTION_v1.0.0
historical_record: true
from: Team 00 (Principal — Nimrod)
to: Team 21 (AOS Backend Implementation)
cc: Team 11 (AOS Gateway), Team 100 (Chief Architect)
date: 2026-03-28
type: ARCHITECTURAL_CONSULTATION_RESOLUTION — Q1..Q6 + authority model amendment
authority: ARCHITECT_DIRECTIVE_AUTHORITY_MODEL_v1.0.0.md
branch: aos-v3
gate: GATE_2---

# Team 00 → Team 21 | GATE_2 Architectural Consultation — Full Resolution

## Status

All 6 questions resolved. One additional directive issued (authority model — affects Q3 scope).
**Team 21 is unblocked to proceed with GATE_2 implementation.**

---

## Q1 — `event_hash` נוסח ✅ LOCKED

**פסיקה:** יישור מלא ל-Event Obs §3.1. אין חריגה מתועדת.

**נוסח קנוני (חובה):**
```python
event_hash = sha256(
    id + run_id + str(sequence_no) + event_type +
    occurred_at.isoformat() + (payload_json or '')
)
```

**מה משתנה:** `event_hash_blob` הנוכחי ב-`repository.py` מחושב על blob JSON שונה — כולל `prev_hash` ומבנה שגוי. **חובה לשכתב** ב-`audit/ledger.py` לנוסח §3.1 לפני GATE_2 acceptance. DB פיתוח קיים מאותחל מחדש.

**אין אופציה ב.** האלגוריתם הוא Iron Rule של Audit Ledger.

---

## Q2 — שכבת L2 — קבצי governance ✅ LOCKED

**פסיקה:** קבצי governance אמיתיים חובה ב-GATE_2. מוק לא מספיק.

**דרישה:**
- מינימום 3 קבצים: `team_00`, `team_10`, `team_11`
- פורמט: markdown; תוכן: identity, authority scope, iron rules, operating boundaries
- נתיב: `agents_os_v3/governance/team_{id}.md` (יש לרשום ב-FILE_INDEX)
- EC-02 (`GovernanceNotFound`) חייב להיות מכוסה בבדיקות integration — לא רק unit mock

**הסיבה:** UC-01 מקצה-לקצה לא ניתן לאמת בלי קבצים אמיתיים. Prompt assembly = core feature, לא nice-to-have.

---

## Q3 — זהות קורא ל-API ✅ LOCKED (עם תוספת directive)

**פסיקה:** `X-Actor-Team-Id` header אושר כ-BUILD-phase identity mechanism.

**יישום:**
```python
# FastAPI dependency — נקודת החלפה אחת בעתיד
async def get_actor_team_id(x_actor_team_id: str = Header(...)) -> str:
    # BUILD STUB: trusts header value.
    # TODO AUTH_STUB: Replace with API key → team_id resolution before PROD.
    return x_actor_team_id
```

**חובה:**
- כל endpoint שצריך actor identity משתמש ב-dependency זה בלבד
- `TODO AUTH_STUB` בכל מקום שמשתמשים ב-dependency
- Header חסר → 400 `MISSING_ACTOR_HEADER`

**תוספת קריטית מ-Directive AUTHORITY_MODEL_v1.0.0:**

`NOT_PRINCIPAL` **מוסר לחלוטין.** מוחלף ב-`INSUFFICIENT_AUTHORITY`.

לוגיקת ideas status — **לא** `team_id == 'team_00'` hard-coded. **חובה:**
```python
def can_change_idea_status(caller_team_id: str, db: Connection) -> bool:
    if caller_team_id == 'team_00':
        return True
    # Check delegated authority via gate_role_authorities
    return has_role_authority(caller_team_id, 'IDEA_STATUS_AUTHORITY', db)
```

ראה `ARCHITECT_DIRECTIVE_AUTHORITY_MODEL_v1.0.0.md` §4 לפרטי מימוש.

---

## Q4 — `is_current_actor` ב-GET /api/teams ✅ LOCKED

**פסיקה:** `is_current_actor` **מוסר לחלוטין** מ-GET /api/teams response.

**נימוק:** עמוד Teams = ניהול סטטי. מצב pipeline מוצג בעמודים אחרים. הוספת pipeline state לעמוד teams = overhead מיותר שמסבך את ה-API ואת ה-UI ללא תועלת.

**מה לבצע:**
- הסר שדה `is_current_actor` מ-TeamResponse model
- הסר את החישוב (query לריצה פעילה) מ-GET /api/teams handler
- **אין** `domain_id` query param לעמוד זה — לא נדרש

**הערה:** UI Spec v1.0.2 §4.13 יעודכן ע"י Team 100 בהתאם לדירקטיב נפרד.

---

## Q5 — היררכיית צוותים ב-`definition.yaml` ✅ LOCKED

**פסיקה:** הרחב את `definition.yaml` עם `parent_team_id` + `children` מפורשים.

**כלל (AD-S8A-05 — קיים):** hierarchy = `definition.yaml`-canonical. לא ב-DB. מחושב ב-response time.

**פורמט לכל entry ב-definition.yaml:**
```yaml
teams:
  - id: team_21
    label: "Team 21"
    name: "AOS Backend Implementation"
    engine: cursor
    parent_team_id: "team_11"
    children: []
    # ... שאר השדות
```

**מקור ערכים:** `TEAMS_ROSTER_v1.0.0.json` (reference בלבד — אל תטען ב-runtime). ערכי hierarchy ב-definition.yaml = SSOT.

**אל תוסיף עמודות hierarchy ל-DB teams table.**

---

## Q6 — ממשק מכונת המצבים ✅ LOCKED

**פסיקה:** `execute_transition` חובה — שם + חתימה + atomicity מדויקים.

**חתימה קנונית (Module Map Integration v1.0.1 §10):**
```python
def execute_transition(
    run: Run,
    transition: str,
    actor: ActorContext,
    payload: dict | None = None
) -> tuple[Run, EventRecord]:
    """
    Atomic: UPDATE runs + INSERT events in single DB transaction.
    Raises: InsufficientAuthorityError, MaxCyclesReachedError, AuditLedgerError
    AD-S7-01: AuditLedgerError → full rollback of run changes.
    """
```

**כלל:** `use_cases.py` קורא **אך ורק** ל-`execute_transition`. אסור לקרוא לפונקציות machine פנימיות ישירות מ-use_cases. הפרדת responsibilities: use_cases = orchestration logic; machine = state + atomicity.

---

## סיכום — טבלת שינויים מיידיים ל-GATE_2

| נושא | מה לשנות | קובץ |
|------|----------|-------|
| `event_hash` | שכתוב לנוסח §3.1 | `audit/ledger.py` |
| Governance files | יצירת 3 קבצים אמיתיים | `agents_os_v3/governance/team_*.md` |
| Actor identity | `X-Actor-Team-Id` dependency | `modules/management/api.py` |
| `NOT_PRINCIPAL` | החלף ב-`INSUFFICIENT_AUTHORITY` בכל מקום | כל הקוד |
| Ideas status auth | `check_authority()` function — לא hard-coded | `modules/management/use_cases.py` |
| `is_current_actor` | הסר מ-TeamResponse + handler | `modules/management/api.py`, `definitions/models.py` |
| `definition.yaml` | הוסף `parent_team_id` + `children` לכל team | `agents_os_v3/definition.yaml` |
| `execute_transition` | חתימה קנונית + atomic TX | `modules/state/machine.py` |

---

## מה לא משתנה

- UC-13/UC-14: מימוש use_cases.py ב-GATE_2; HTTP endpoints ל-`/api/state` ו-`/api/history` → GATE_3 (פסיקת Team 11 — בתוקף)
- UC-13 SQL JOIN: יישם עם `DISTINCT ON` או subquery לסינון current actor לפי routing (לא להמציא עמודות)
- Admin config APIs (routing-rules, templates, policies) — ללא שינוי
- Stage 8A (teams, runs, work-packages, ideas CRUD) — ללא שינוי מלבד הנקודות למעלה

---

**log_entry | TEAM_00 | GATE2_CONSULTATION | RESOLVED_Q1_Q6 | AUTHORITY_MODEL_ISSUED | 2026-03-28**
