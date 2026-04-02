---
id: TEAM_31_MOCKUP_REMEDIATION_TEAM51_MJ8B_v1.0.0
historical_record: true
from: Team 31
to: Team 51 (re-QA), Team 100
date: 2026-03-27
type: QA_REMEDIATION_NOTE
ref: TEAM_51_AOS_V3_MOCKUP_QA_REPORT_v2.0.0 (FAIL → targeted fix)---

# Remediation — MJ-8B-01, MJ-8B-02

| ID | Fix |
|----|-----|
| **MJ-8B-01** (TC-M29-5) | `MANUAL_REVIEW`: label states reason **required** for Mark FAIL; hint references `POST /fail`; Mark FAIL uses `data-handoff-manual-fail` + capture-phase validation (toast + `aria-invalid` if empty). Mark PASS unchanged (optional reason). |
| **MJ-8B-02** (TC-M40-1) | Engine **dropdown + Save** moved into **Layer 1 — Identity** card (`aosv3-layer1-card`), above the L1 `pre` and Copy L1. Roster panel shows engine as read-only badge + note “see Layer 1”. |

**Code:** `agents_os_v3/ui/app.js`, `agents_os_v3/ui/style.css` (`.aosv3-layer1-engine-row`).

**Suggested re-QA:** TC-M29-5 (preset `feedback_low`), TC-M40-1 (`teams.html`), smoke SSE/pipeline.

**log_entry | TEAM_31 | MOCKUP | TEAM51_MJ8B_REMEDIATION | 2026-03-27**
