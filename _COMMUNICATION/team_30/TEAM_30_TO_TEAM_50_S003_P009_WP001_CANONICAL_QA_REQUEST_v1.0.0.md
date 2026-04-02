date: 2026-03-18
historical_record: true

    ---
    project_domain: AGENTS_OS
    id: TEAM_30_TO_TEAM_50_S003_P009_WP001_CANONICAL_QA_REQUEST_v1.0.0
    from: Team 30 (Frontend Implementation)
    to: Team 50 (QA & Functional Acceptance)
    cc: Team 10, Team 20, Team 90, Team 100
    date: 2026-03-18
    status: SUBMITTED
    gate_id: GATE_5
    program_id: S003-P009
    work_package_id: S003-P009-WP001
    task_id: CANONICAL_QA_REQUEST
    phase_owner: Team 30
    required_ssm_version: 1.0.0
    required_active_stage: S003
    ---

    # Team 30 → Team 50 — Canonical QA Request (Full Scope)

    ## Mandatory Identity Header

    | Field | Value |
    | --- | --- |
    | roadmap_id | PHOENIX_ROADMAP |
    | stage_id | S003 |
    | program_id | S003-P009 |
    | work_package_id | S003-P009-WP001 |
    | task_id | CANONICAL_QA_REQUEST |
    | gate_id | GATE_5 |
    | phase_owner | Team 30 |
    | required_ssm_version | 1.0.0 |
    | required_active_stage | S003 |
    | date | 2026-03-18 |

    ---

    ## Process (Per Protocol)

    **Flow:** QA Gate → Team 50 approval **first** → only then handoff to Team 90 re-validation.

    This request is the canonical QA mandate for the combined remediation package (Team 20 + Team 30 + pipeline) prior to Team 90 re-validation.

    ---

    ## 1) Artifacts to Verify

    ### Team 20 Remediation (GATE_5 doc remediation)

    | Artifact | Purpose |
    | --- | --- |
    | `_COMMUNICATION/team_20/TEAM_20_S003_P009_WP001_API_VERIFY_v1.0.0.md` | API verification — canonical path |
    | `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S003_P009_WP001_G5_DOC_REMEDIATION_COMPLETION_v1.0.0.md` | BF-G5-R9:001/002 closure evidence mapping |

    Team 20 closure mapping:
    - BF-G5-R9: 001 — artifact paths missing → Team 20 canonical path present
    - BF-G5-R9: 002 — GATE_4 PASS unconfirmed → Team 50 QA report path referenced

    ### Team 30 Remediation (Constitutional flow + pipeline)

    | Artifact | Purpose |
    | --- | --- |
    | `_COMMUNICATION/team_30/TEAM_30_S003_P009_WP001_CONSTITUTIONAL_REMEDIATION_RESPONSE_v1.0.0.md` | Remediation flow implementation summary |
    | `agents_os_v2/orchestrator/pipeline.py` | `_extract_blocking_findings`, auto-injection into CURSOR_IMPLEMENTATION/G3_PLAN |
    | `pipeline_run.sh` | Correction cycle auto-generates remediation prompt; route with notes passes to generate-prompt |

    ### Pipeline / Team 61 (Constitutional ruling BLK-01..05)

    | Change | Location | Verification |
    | --- | --- | --- |
    | BLK-01 | `pipeline.py` | `_extract_blocking_findings(gate_id, wp_id)` exists and parses verdict formats |
    | BLK-02 | `pipeline.py` | CURSOR_IMPLEMENTATION prompt auto-injects blockers when GATE_4/GATE_5 in gates_failed |
    | BLK-03 | `pipeline.py` | G3_PLAN prompt auto-injects blockers when route=full from GATE_4/GATE_5 |
    | BLK-04 | `pipeline_run.sh` | fail auto-route → `_generate_and_show` next gate; route with notes → generate-prompt with revision-notes |
    | BLK-05 | `pipeline.py` | `_generate_cursor_prompts(revision_notes)` when non-empty: no reference to implementation_mandates.md; remediation prompt IS the mandate |

    ---

    ## 2) QA Verification Checklist (Full Scope)

    Team 50 shall execute and report on:

    ### Prerequisites
    - [ ] QA-PRE-01: Team 20 API verify artifact exists, status COMPLETED
    - [ ] QA-PRE-02: Team 20 G5 doc remediation completion artifact exists
    - [ ] QA-PRE-03: Team 30 implementation complete artifact exists
    - [ ] QA-PRE-04: Team 30 constitutional remediation response artifact exists

    ### Runtime / Regression
    - [ ] QA-E01: `python3 -m pytest agents_os_v2/tests/ -v -k "not OpenAI and not Gemini"` → exit 0
    - [ ] QA-E02: `python3 -m pytest agents_os_v2/server/tests/test_server.py -q` → exit 0
    - [ ] QA-E03: AOS page smoke (PIPELINE_DASHBOARD, PIPELINE_ROADMAP, PIPELINE_TEAMS) → HTTP 200

    ### S003-P009-WP001 Implementation Evidence (Pipeline Resilience)
    - [ ] QA-E04: `wsm_writer.py` exists and is integrated in pipeline.py
    - [ ] QA-E05: pre-GATE_4 uncommitted-change block in pipeline_run.sh (CURSOR_IMPLEMENTATION pass path)
    - [ ] QA-E06: Item 1 (3-tier resolution) — Tier-2 fallback and Tier-3 store hint evidenced in runtime

    ### Constitutional Remediation Flow (Team 190 ruling)
    - [ ] QA-E07: `_extract_blocking_findings` present in pipeline.py; parses blocking_findings / BF-XX formats
    - [ ] QA-E08: CURSOR_IMPLEMENTATION prompt when gates_failed includes GATE_4/GATE_5 → auto-injects blockers (no manual revise required for blocker content)
    - [ ] QA-E09: Remediation prompt when revision_notes non-empty → does NOT reference implementation_mandates.md as primary task
    - [ ] QA-E10: Sequencing note present in remediation prompt when both Team 20 and Team 30 in scope

    ### Team 20 BF Closure (BF-G5-R9:001/002)
    - [ ] QA-E11: `_COMMUNICATION/team_20/TEAM_20_S003_P009_WP001_API_VERIFY_v1.0.0.md` exists and readable
    - [ ] QA-E12: `_COMMUNICATION/team_50/TEAM_50_S003_P009_WP001_QA_REPORT_v1.0.0.md` exists; contains GATE_4 PASS verdict (or explicit re-QA verdict if updated)

    ---

    ## 3) Output and Handoff

    | Field | Value |
    | --- | --- |
    | QA report path | `_COMMUNICATION/team_50/TEAM_50_S003_P009_WP001_QA_REPORT_v1.0.0.md` |
    | On PASS | Team 10 routes to Team 90 for GATE_5 re-validation |
    | On FAIL | Team 50 reports blocking findings; remediation cycle per Team 190 ruling |

    ---

    ## 4) Copy-Paste Handover Prompt for Team 50

    ```
    Team 50 — Canonical QA mandate S003-P009-WP001

    Scope: Full verification of combined remediation package (Team 20 + Team 30 + pipeline).

    Artifacts:
    - Team 20: _COMMUNICATION/team_20/TEAM_20_S003_P009_WP001_API_VERIFY_v1.0.0.md
    - Team 20: _COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S003_P009_WP001_G5_DOC_REMEDIATION_COMPLETION_v1.0.0.md
    - Team 30: _COMMUNICATION/team_30/TEAM_30_S003_P009_WP001_CONSTITUTIONAL_REMEDIATION_RESPONSE_v1.0.0.md

    Request: Execute full QA checklist per _COMMUNICATION/team_30/TEAM_30_TO_TEAM_50_S003_P009_WP001_CANONICAL_QA_REQUEST_v1.0.0.md §2.

    Report to: _COMMUNICATION/team_50/TEAM_50_S003_P009_WP001_QA_REPORT_v1.0.0.md

    On PASS: Team 10 may hand off to Team 90 for GATE_5 re-validation.
    On FAIL: Blocking findings per Team 190 remediation flow; pipeline auto-injects for next correction cycle.
    ```

    ---

    log_entry | TEAM_30 | S003_P009_WP001 | CANONICAL_QA_REQUEST_SUBMITTED | 2026-03-18
