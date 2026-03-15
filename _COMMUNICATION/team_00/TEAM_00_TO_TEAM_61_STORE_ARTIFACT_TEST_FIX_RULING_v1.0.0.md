---
project_domain: AGENTS_OS
id: TEAM_00_TO_TEAM_61_STORE_ARTIFACT_TEST_FIX_RULING_v1.0.0
from: Team 00 (Chief Architect)
to: Team 61 (AOS Local Cursor Implementation)
cc: Team 190, Team 51, Team 100
date: 2026-03-15
status: RULING_ACTIVE
in_response_to: TEAM_61_TO_TEAM_100_STORE_ARTIFACT_CONSULTATION_REQUEST_v1.0.0
---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P005 |
| work_package_id | S002-P005-WP001 |
| ruling_type | TEST_FIX_AUTHORIZATION + ROOT_CAUSE_ANALYSIS |
| issued_by | Team 00, 2026-03-15 |

---

## 1) Ruling: Fix IS Within Scope

**`test_save_and_load` fix — APPROVED and required within current mandate.**

ניתוח ה-CONSULTATION_REQUEST מראה כשל שהוא **השלכה ישירה** של ארכיטקטורת domain guard שנשלחה. Team 61 אחראית לוודא שאין regression בטסטים קיימים — הכשל הזה הוא regression בדיוק. תיקון זה נכלל בגדר ה-mandate המקורי ב-§ "no regression in existing pipeline commands and tests".

---

## 2) Root Cause Analysis (Full)

### גורם 1 — הטסט כותב לקובץ state אמיתי

```python
# test_save_and_load (current)
state = PipelineState(work_package_id="S002-P001-WP001", current_gate="GATE_3")
state.save()
```

`PipelineState()` ללא `project_domain` משתמש ב-`DEFAULT_DOMAIN = "tiktrack"` (מוגדר ב-`agents_os_v2/config.py:49`).
`save()` קורא לـ`_state_file()` → `get_state_file("tiktrack")` → **כותב לקובץ האמיתי** `pipeline_state_tiktrack.json` על הדיסק.

**תוצאה:** הטסט זיהם את state הייצור של tiktrack עם `current_gate="GATE_3"`.

### גורם 2 — `PipelineState.load()` מזהה שני domains פעילים

```
tiktrack:   current_gate="GATE_3", work_package_id="S002-P001-WP001"  → ACTIVE
agents_os:  current_gate="GATE_1", work_package_id="S002-P005-WP001"  → ACTIVE
```

Domain guard (state.py lines 101–122): שני domains פעילים → `sys.exit(1)`.

### גורם 3 — תיקון STATE_FILE לא מספיק

הפאץ' הנוכחי `state_mod.STATE_FILE = tmp_path / "test_state.json"` מתקן רק את **legacy STATE_FILE** (שורה 125–127 ב-load). הוא לא מתקן את `get_state_file("tiktrack")` שנקרא על ידי `save()` ו-`load()` (שורות 44, 72, 84).

### מקור פגיעת State tiktrack

הקובץ `pipeline_state_tiktrack.json` נפגע משתי סיבות:
1. **הטסט** (`state.save()`) כתב `{current_gate: GATE_3, gates_failed: []}` לקובץ האמיתי — ניכר מ-`gates_failed: []` (advance_gate לא נקרא)
2. **`fail` ללא `--domain`** (באג שתוקן בנפרד) תרם גם הוא לזיהום הראשוני

**שחזור בוצע:** Team 00 איפס את `pipeline_state_tiktrack.json` ל-`NOT_STARTED` / `work_package_id="REQUIRED"` ישירות (2026-03-15).

---

## 3) Exact Fix — Required Code Change

### שינוי `test_save_and_load` — exact replacement

**Current (lines 37–48):**
```python
def test_save_and_load(self, tmp_path):
    import agents_os_v2.orchestrator.state as state_mod
    original = state_mod.STATE_FILE
    state_mod.STATE_FILE = tmp_path / "test_state.json"
    try:
        state = PipelineState(work_package_id="S002-P001-WP001", current_gate="GATE_3")
        state.save()
        loaded = PipelineState.load()
        assert loaded.work_package_id == "S002-P001-WP001"
        assert loaded.current_gate == "GATE_3"
    finally:
        state_mod.STATE_FILE = original
```

**Required replacement:**
```python
def test_save_and_load(self, tmp_path, monkeypatch):
    import agents_os_v2.orchestrator.state as state_mod

    # Redirect ALL state file I/O to tmp_path — no real disk side effects
    monkeypatch.setattr(state_mod, "STATE_FILE", tmp_path / "legacy_state.json")
    monkeypatch.setattr(state_mod, "get_state_file",
                        lambda domain: tmp_path / f"pipeline_state_{domain}.json")
    # Explicit domain → bypass auto-detect guard entirely
    monkeypatch.setenv("PIPELINE_DOMAIN", "agents_os")

    state = PipelineState(
        work_package_id="S002-P001-WP001",
        current_gate="GATE_3",
        project_domain="agents_os",   # must match PIPELINE_DOMAIN
    )
    state.save()
    loaded = PipelineState.load()
    assert loaded.work_package_id == "S002-P001-WP001"
    assert loaded.current_gate == "GATE_3"
```

### שינויים והסיבות:

| שינוי | סיבה |
|---|---|
| `tmp_path, monkeypatch` בחתימה | pytest built-ins — `monkeypatch` עדיף על try/finally ידני |
| `monkeypatch.setattr(state_mod, "get_state_file", ...)` | מונע כתיבה לכל קובץ domain אמיתי (state_mod הוא namespace שממנו save/load משתמשים) |
| `monkeypatch.setattr(state_mod, "STATE_FILE", ...)` | מונע כתיבה ל-legacy STATE_FILE |
| `monkeypatch.setenv("PIPELINE_DOMAIN", "agents_os")` | מעקף auto-detect — load() הולך ישר לנתיב 1 (explicit domain) |
| `project_domain="agents_os"` ב-PipelineState | חייב להתאים ל-PIPELINE_DOMAIN אחרת save() כותב ל-domain שגוי |

### אין imports נוספים נדרשים

`monkeypatch` הוא pytest fixture מובנה — אין `import` נדרש.

---

## 4) Standing Test Rule (Iron Rule — effective immediately)

**כל טסט שקורא ל-`PipelineState.load()` חייב:**
1. לבצע `monkeypatch.setattr(state_mod, "get_state_file", ...)` לנתיב temp
2. לבצע `monkeypatch.setattr(state_mod, "STATE_FILE", ...)` לנתיב temp
3. לבצע `monkeypatch.setenv("PIPELINE_DOMAIN", <domain>)` — domain מפורש
4. לוודא ש-`project_domain` ב-PipelineState תואם ל-`PIPELINE_DOMAIN`

**Team 51** מתועד בהנחיות QA לאכוף כלל זה בכל PR שנוגע ב-`test_pipeline.py` או בטסטים חדשים.

---

## 5) Submission Path

```
Team 61: מיישם fix (test_save_and_load)
       ↓
Team 61: מריץ pytest כולל — כל הטסטים PASS
       ↓
Team 61: מגיש completion v2 ל-_COMMUNICATION/team_61/
         (R-01 + R-02 + R-03 + test_save_and_load fix)
       ↓
Team 190: re-validation לפי §7 ב-UNIFIED_SCAN_CONSOLIDATED_FINDINGS
       ↓
Team 51: QA (יכול לרוץ במקביל לאחר completion v2)
```

---

## 6) tiktrack State — Reset Confirmed

Team 00 איפס ישירות את `pipeline_state_tiktrack.json` (2026-03-15, 09:30 UTC):

```json
{
  "work_package_id": "REQUIRED",
  "current_gate": "NOT_STARTED",
  "gates_completed": [],
  "gates_failed": []
}
```

**תוצאה:** `PipelineState.load()` ללא domain יזהה רק agents_os כ-active → auto-select → לא יחסום. הטסט אחרי התיקון לא יכתוב יותר לקובץ אמיתי ולכן לא ייתכן זיהום עתידי.

---

## 7) Do NOT Change

| Item | Reason |
|---|---|
| `test_create_default`, `test_advance_gate_pass`, `test_advance_gate_fail` | לא קוראים ל-`load()` או `save()` לדיסק — לא מושפעים |
| `test_store_artifact_missing_file_exits_nonzero` | כבר משתמש ב-`PIPELINE_DOMAIN=agents_os` env — תקין |
| `test_store_artifact_unsupported_gate_exits_nonzero` | כבר משתמש ב-`PIPELINE_DOMAIN=agents_os` env — תקין |
| `TestGateRouter`, `TestGateResult` | לא נוגעים ב-state files |

---

**log_entry | TEAM_00 | TEST_FIX_RULING | TEAM_61 | test_save_and_load | WITHIN_SCOPE | APPROVED | 2026-03-15**
