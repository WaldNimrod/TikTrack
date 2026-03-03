# Agents_OS — ניתוח פער והצעת עיצוב מחדש
**Date:** 2026-03-03  
**From:** Cursor Cloud Agent  
**To:** Team 00 (Chief Architect)  
**Status:** PROPOSAL — Requires Architect Decision

---

## 1. אבחנה: למה Agents_OS לא מביא ערך

### מצב נוכחי — מספרים

| מימד | כמות |
|------|------|
| מסמכי governance/spec | ~50+ |
| קבצי Python | 6 |
| שורות קוד פונקציונלי | 2 (`return 0`) |
| POC-1 Observer (מיושם) | ❌ |
| Core Validation Engine (מיושם) | ❌ |
| STATE_SNAPSHOT.json (קיים) | ❌ |

### שורש הבעיה — "Governance Deadlock"

המערכת סובלת מ-**deadlock מבני**: הכלי שאמור לאטום את ה-gates חייב בעצמו לעבור את ה-gates.

```
כדי לבנות את ה-Validation Engine → צריך GATE_0 → GATE_1 → GATE_2 → WP → GATE_3...
כדי לעבור את ה-gates ביעילות → צריך את ה-Validation Engine
```

**התוצאה:** S001-P001 הוכרז COMPLETE עם stub בלבד. S002-P001 תקוע ב-GATE_0/GATE_1 מאז 2026-02-24. 0 שורות validation פונקציונליות.

### 5 גורמים ספציפיים

| # | גורם | הוכחה |
|---|-------|-------|
| 1 | **Spec-heavy, implementation-light** | 50+ docs, 2 שורות קוד |
| 2 | **Gate overhead על כלי ה-gates עצמו** | S002-P001 תקוע ב-GATE_0 שבוע+ |
| 3 | **POC-1 Observer לא נבנה** | L2-026 ב-WSM, אבל 0 implementation |
| 4 | **Templates חסרים** | T001 (LOD200/LLD400 templates) = prerequisite — לא נוצר |
| 5 | **MB3A v1.4.0 הוסגר** | ה-spec המרכזי (identity model) ב-quarantine |

---

## 2. החזון המקורי — נכון אבל מותאם לעולם של צוותים

הארכיטקטורה שעוצבה (44 checks, 7 tiers, LLM quality gate) מושלמת **לארגון עם 10 צוותים שמגישים specs במקביל**. אבל המציאות היא:

> **בן אדם אחד + מגוון agents בסביבות שונות**

בסביבה הזו, הבעיה אינה "איך לוולדט 44 שדות ב-spec" — הבעיה היא:

> **"איך לתת ל-agent את כל ה-context שהוא צריך כדי לייצר קוד נכון, ואיך לאמת שהקוד נכון — אוטומטית"**

---

## 3. הצעת עיצוב מחדש — "Agent Pipeline"

### עיקרון מנחה

**במקום:** Agent OS כמערכת validation של specs  
**צריך:** Agent OS כ-**pipeline שממיר spec לקוד בדוק**

```
SPEC (מה לבנות)
    │
    ▼
┌─────────────────────┐
│  1. STATE READER     │  קורא את מצב הפרויקט (WSM, SSM, schemas, models, routes)
│     (POC-1 Observer) │  מייצר STATE_SNAPSHOT.json
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  2. CONTEXT BUILDER  │  בונה context package ל-agent:
│                      │  - מצב נוכחי (STATE_SNAPSHOT)
│                      │  - קבצים רלוונטיים (models, schemas, routers)
│                      │  - conventions (coding patterns מה-codebase)
│                      │  - constraints (architectural rules)
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  3. AGENT EXECUTOR   │  ה-agent (Cursor Cloud / אחר) מקבל:
│                      │  - SPEC + CONTEXT → מייצר קוד
│                      │  (זה קורה מחוץ ל-Agents_OS)
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│  4. VALIDATOR        │  בודק את הקוד שנוצר:
│                      │  - unit tests pass?
│                      │  - mypy clean?
│                      │  - bandit clean?
│                      │  - build passes?
│                      │  - schema consistent with models?
│                      │  - routes match spec?
└─────────────────────┘
    │
    ▼
RESULT: PASS / BLOCK (with evidence)
```

### ההבדל המהותי מהתכנון הקודם

| תכנון קודם | תכנון חדש |
|------------|----------|
| מוולדט specs (מסמכים) | מוולדט **קוד** (תוצרים) |
| 44 checks על headers ושדות | Checks על **פונקציונליות**: tests pass, types correct, build works |
| LLM quality gate (עלות + latency) | **Deterministic only** — pytest, mypy, bandit, build |
| Template locking (T001) כ-prerequisite | **Zero prerequisites** — רץ על ה-codebase כמו שהוא |
| תלוי ב-gates כדי להתקדם | **רץ מיידית** — כלי פיתוח, לא governance |

---

## 4. מה ניתן לבנות עכשיו — פירוט טכני

### Component 1: State Reader (POC-1 Observer) — **יום אחד**

```python
# agents_os/observers/state_reader.py
# קורא את מצב הפרויקט ומייצר STATE_SNAPSHOT.json

Output:
{
  "schema_version": "2.0.0",
  "project_state": {
    "active_stage": "S002",
    "wsm_state": "READY_FOR_NEXT_WORK_PACKAGE"
  },
  "codebase_state": {
    "backend": {
      "models": ["users", "trading_accounts", "trades", ...],
      "routers": ["auth", "users", "trading_accounts", ...],
      "services": ["auth", "trading_accounts", ...],
      "schemas": ["identity", "trading_accounts", ...]
    },
    "frontend": {
      "pages": ["trading_accounts", "brokers_fees", ...],
      "routes": 49
    },
    "database": {
      "tables": 30,
      "schemas": ["user_data", "market_data"]
    }
  },
  "quality_state": {
    "unit_tests": { "total": 30, "passing": 30 },
    "eslint": { "errors": 40, "warnings": 77 },
    "mypy": { "errors": 131 },
    "bandit": { "high": 0, "medium": 1 },
    "known_bugs": 21
  }
}
```

### Component 2: Context Builder — **שני ימים**

```python
# agents_os/context/builder.py
# בונה context package ל-agent session

def build_agent_context(spec: str, scope: str) -> dict:
    """
    מקבל: spec (מה לבנות) + scope (backend/frontend/full)
    מחזיר: context package עם כל מה שה-agent צריך
    """
    return {
        "spec": spec,
        "state_snapshot": read_state_snapshot(),
        "relevant_files": find_relevant_files(spec, scope),
        "conventions": extract_coding_conventions(scope),
        "constraints": load_architectural_constraints(),
        "testing_requirements": {
            "unit_tests_required": True,
            "mypy_clean": True,
            "bandit_clean": True,
            "build_pass": True
        }
    }
```

### Component 3: Validator — **כבר קיים (90%)**

הבדיקות **כבר קיימות** מהעבודה שביצענו:

```bash
# agents_os/validators/code_validator.py
pytest tests/unit/ -v          # unit tests
mypy api/ --config-file api/mypy.ini  # type safety
bandit -r api/ --exclude api/venv -ll  # security
cd ui && npx vite build        # frontend build
```

צריך רק לעטוף אותם ב-Python runner שמחזיר exit code 0/1 + evidence.

---

## 5. Rollout Plan

| שלב | מה | זמן | תלות |
|-----|-----|-----|------|
| **0** | CI/CD pipeline ✅ | **בוצע** | — |
| **1** | POC-1 Observer (State Reader) | 1 session | — |
| **2** | Code Validator (wrapper) | 1 session | שלב 1 |
| **3** | Context Builder | 1 session | שלב 1 |
| **4** | Agent Prompt Template | 1 session | שלב 3 |
| **5** | End-to-end test: spec → code → validate | 1 session | שלב 4 |

**Total:** 5 Cloud Agent sessions ≈ 1-2 שבועות

### מה זה נותן בסוף

```
Architect: "צור API endpoint חדש ל-strategies עם CRUD מלא"
    │
    ▼
agents_os/context/builder.py builds context:
  - STATE_SNAPSHOT: מה קיים (models, schemas, routers)
  - CONVENTIONS: איך נראה router (from trading_accounts.py)
  - CONVENTIONS: איך נראה service (from trading_accounts_service.py)
  - CONVENTIONS: איך נראה schema (from trading_accounts schemas)
  - CONSTRAINTS: naming rules, ULID for external IDs, Decimal(20,8)
    │
    ▼
Agent (Cursor Cloud) generates:
  - api/models/strategies.py
  - api/schemas/strategies.py
  - api/services/strategies.py
  - api/routers/strategies.py
  - tests/unit/test_strategies_service.py
    │
    ▼
agents_os/validators/code_validator.py validates:
  ✅ pytest tests/unit/ — PASS
  ✅ mypy api/services/strategies.py — clean
  ✅ bandit api/routers/strategies.py — clean
  ✅ vite build — PASS
    │
    ▼
RESULT: Production-ready code with evidence
```

---

## 6. מה קורה עם ה-Governance הקיים?

**הוא לא נעלם — הוא מתייעל.**

| ממשל קודם | ממשל חדש |
|-----------|---------|
| LOD200 → GATE_0 → LLD400 → GATE_1 → GATE_2 → WP → GATE_3... | **Spec → Agent Pipeline → Code + Tests → Human Review (GATE_6)** |
| 7 gates, ~10 מסמכים per WP | **GATE_2 (approve intent) → Agent Pipeline → GATE_6 (human verify)** |
| שבועות per WP | **שעות per feature** |

**ה-gates שנשארים:**
- GATE_2: האדריכל מאשר "כן, בנו את זה" (intent)
- GATE_6: האדריכל מאמת "זה מה שרציתי" (reality)

**ה-gates שנחלפים ע"י automation:**
- GATE_1 (spec lock) → Agent context builder validates spec completeness
- GATE_3 (implementation) → Agent executes
- GATE_4 (QA) → Automated tests
- GATE_5 (dev validation) → Code validator

---

**Prepared by:** Cursor Cloud Agent  
**Date:** 2026-03-03
