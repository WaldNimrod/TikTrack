---
project_domain: AGENTS_OS
id: TEAM_61_TO_TEAM_51_STORE_ARTIFACT_QA_HANDOFF_PROMPT_v1.0.0
from: Team 61 (AOS Local Cursor Implementation)
to: Team 51 (AOS QA & Functional Acceptance)
cc: Team 190, Team 100, Team 10
date: 2026-03-10
historical_record: true
status: QA_COMPLETE — PASS (2026-03-15)
work_package_id: S002-P005-WP001
handoff_type: MANDATE_COMPLETION → QA_VERIFICATION
in_response_to: TEAM_00_TO_TEAM_61_PIPELINE_STORE_ARTIFACT_REMEDIATION_MANDATE_v1.0.0
---

# פרומט קאנוני — S002-P005-WP001 Pipeline Store Artifact — העברה לצוות 51

**Team 51, הנה הפרומט המפורט לביצוע QA על מנדט Pipeline Store Artifact.**

---

## §1 מי מעביר ומי מקבל

| מ | אל | שלב שהושלם | שלב להפעלה |
|---|---|---|---|
| Team 61 | Team 51 | Store Artifact Remediation (R-01, R-02, R-03, test_save_and_load) | QA Verification |

---

## §2 סקופ מלא — עדכונים שבוצעו

### 2.1 מנדט מקורי (AO2-STORE-001, AO2-STORE-002)

| Item | קובץ | שינוי |
|------|------|-------|
| **R-01** | `agents_os_v2/orchestrator/pipeline.py` | `store_artifact()` → חתימה `-> bool`; מחזיר `False` על file not found / unsupported gate; `main()` קורא `sys.exit(1)` כאשר `store_artifact()` מחזיר `False` |
| **R-02** | `agents_os_v2/orchestrator/pipeline.py` | help-text ל-`--store-artifact`: `GATE_1→lld400_content`, `G3_PLAN→work_plan`, `CURSOR_IMPLEMENTATION→implementation_files` (הוסר G3_5→validation, תוקן impl_files→implementation_files) |
| **R-03** | `agents_os_v2/tests/test_pipeline.py` | שני טסטים חדשים: `test_store_artifact_missing_file_exits_nonzero`, `test_store_artifact_unsupported_gate_exits_nonzero` — subprocess עם `PIPELINE_DOMAIN=agents_os` |

### 2.2 תיקון טסט (לפי פסיקת Team 00)

| Item | קובץ | שינוי |
|------|------|-------|
| **test_save_and_load** | `agents_os_v2/tests/test_pipeline.py` | monkeypatch ל-`STATE_FILE`, `get_state_file`, `PIPELINE_DOMAIN`; `PipelineState(project_domain="agents_os", ...)` — מונע כתיבה לדיסק אמיתי ו-domain guard conflict |

### 2.3 קבצים שנגעו בהם

| קובץ | סוג שינוי |
|------|-----------|
| `agents_os_v2/orchestrator/pipeline.py` | R-01, R-02 |
| `agents_os_v2/tests/test_pipeline.py` | R-03, test_save_and_load fix |

### 2.4 Iron Rule — אכיפה ב-QA

כל טסט שקורא ל-`PipelineState.load()`/`save()` **חייב** לבצע monkeypatch ל-`STATE_FILE`, `get_state_file`, ו-`PIPELINE_DOMAIN`. Team 51 מאכיפה בכל PR שנוגע ב-`test_pipeline.py` או בטסטים חדשים.

---

## §3 רשימת בדיקות — QA Verification

### 3.1 Regression Tests (מנדט)

```bash
cd /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix
python3 -m pytest agents_os_v2/tests/test_pipeline.py -v
```

**תוצאה נדרשת:** 15 passed (כולל `test_save_and_load`, `test_store_artifact_missing_file_exits_nonzero`, `test_store_artifact_unsupported_gate_exits_nonzero`).

### 3.2 Runtime Evidence — Missing File (AO2-STORE-001)

```bash
PIPELINE_DOMAIN=agents_os python3 -m agents_os_v2.orchestrator.pipeline --store-artifact GATE_1 /tmp/nonexistent_ao2_store.md
echo $?
```

**תוצאה נדרשת:** exit code = 1 (לא 0).

### 3.3 Runtime Evidence — Unsupported Gate (AO2-STORE-001)

```bash
echo "# test" > /tmp/qa_store_test.md
PIPELINE_DOMAIN=agents_os python3 -m agents_os_v2.orchestrator.pipeline --store-artifact GATE_999_UNSUPPORTED /tmp/qa_store_test.md
echo $?
```

**תוצאה נדרשת:** exit code = 1 (לא 0).

### 3.4 Success Path (אופציונלי)

```bash
echo "# lld400" > /tmp/qa_store_success.md
PIPELINE_DOMAIN=agents_os python3 -m agents_os_v2.orchestrator.pipeline --store-artifact GATE_1 /tmp/qa_store_success.md
echo $?
```

**תוצאה נדרשת:** exit code = 0.

### 3.5 test_save_and_load — אימות ללא side effects

הטסט רץ כחלק מ-§3.1. וידוא שלא נכתבת state לדיסק אמיתי — monkeypatch ל-`get_state_file` ו-`STATE_FILE` לנתיב tmp.

---

## §4 תוצר נדרש

**קובץ:** `_COMMUNICATION/team_51/TEAM_51_STORE_ARTIFACT_QA_RESULT_v1.0.0.md`

**מבנה מוצע:**

```markdown
---
project_domain: AGENTS_OS
id: TEAM_51_STORE_ARTIFACT_QA_RESULT_v1.0.0
from: Team 51
to: Team 61, Team 190, Team 100
date: [תאריך]
status: QA_PASS / BLOCK_FOR_FIX
---

## תוצאות

| בדיקה | תוצאה |
|-------|--------|
| 3.1 pytest (15 tests) | PASS / FAIL |
| 3.2 Missing file exit | exit=1 / אחר |
| 3.3 Unsupported gate exit | exit=1 / אחר |
| 3.4 Success path (optional) | exit=0 / אחר |

## החלטה

QA_PASS → Team 190 re-validation per UNIFIED_SCAN §7.
BLOCK_FOR_FIX → [רשימת תיקונים]
```

---

## §5 מקורות

| מסמך | path |
|------|------|
| מנדט | `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_61_PIPELINE_STORE_ARTIFACT_REMEDIATION_MANDATE_v1.0.0.md` |
| פסיקת test fix | `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_61_STORE_ARTIFACT_TEST_FIX_RULING_v1.0.0.md` |
| UNIFIED_SCAN §7 | `TEAM_190_TO_TEAM_100_UNIFIED_SCAN_CONSOLIDATED_FINDINGS_EXECUTION_APPROVAL_REQUEST` |

---

## §6 Closure Path

- **QA_PASS** → Team 190 re-validation לפי §7 ב-UNIFIED_SCAN
- **BLOCK_FOR_FIX** → Team 61 מתקן → re-submit ל-Team 51

---

**log_entry | TEAM_61 | STORE_ARTIFACT_QA_HANDOFF | ISSUED | 2026-03-10**
