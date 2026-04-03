---
id: TEAM_61_TO_TEAM_51_S003_P011_WP002_QA_HANDOFF_v1.0.0
historical_record: true
from: Team 61 (AOS Local Cursor Implementation)
to: Team 51 (AOS QA & Functional Acceptance)
cc: Team 11, Team 10, Team 90, Team 100
date: 2026-03-20
work_package_id: S003-P011-WP002
status: QA_HANDOFF_ACTIVE---

# S003-P011-WP002 — בקשת הרצת QA (מסירה מ־Team 61)

## הוראת ביצוע

**נא להריץ QA מלא** לפי מסמך ההגדרה הקנוני (ללא שינוי סקופ):

`_COMMUNICATION/team_51/TEAM_11_TO_TEAM_51_S003_P011_WP002_FULL_QA_REQUEST_v1.0.0.md`

## ראיות מוכנות מ־Team 61 (לפני PASS)

| # | דרישה (FULL_QA_REQUEST §1) | ראיה |
|---|---------------------------|------|
| P1 | `test_certification.py` קיים | `agents_os_v2/tests/test_certification.py` |
| P2 | pytest certification 0 כשלונות | `python3 -m pytest agents_os_v2/tests/test_certification.py -v` |
| P3 | regression ≥127 | **127 passed** עם `-k "not OpenAI and not Gemini"` |
| P4 | `pipeline_run.sh` pass/fail/gate | ללא שינוי שביר; `--advance` תואם `current_gate` (CERT_12) |
| P5 | Tier-2 procedure | `_COMMUNICATION/team_61/PIPELINE_SMOKE_TESTS_v1.0.0.md` — **פרומוטציה ל־`documentation/` ע"י Team 10** כשנדרש נתיב קנוני בדיוק |

## מיפוי CERT → טסט

| CERT | פונקציית טסט ב־pytest |
|------|-------------------------|
| CERT_01..10,13..15 | `test_cert_01` … `test_cert_15`, `test_wp002_*`, `test_resolve_lod200_sentinel` |
| CERT_11 | `test_cert_11_cli_fail_writes_findings` (in-process `advance_gate`) |
| CERT_12 | `test_cert_12_pass_gate_mismatch_exits_nonzero` |
| path/D-09 | `test_path_builder_roundtrip` |

## דוח נדרש מ־Team 51

`_COMMUNICATION/team_51/TEAM_51_S003_P011_WP002_QA_REPORT_v1.0.0.md`

---

**log_entry | TEAM_61 | S003_P011_WP002 | QA_HANDOFF_TO_TEAM_51 | 2026-03-20**
