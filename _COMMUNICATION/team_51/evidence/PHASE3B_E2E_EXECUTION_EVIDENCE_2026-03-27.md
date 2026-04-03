---
id: PHASE3B_E2E_EXECUTION_EVIDENCE_2026-03-27
historical_record: true
from: Team 51 (AOS QA)
date: 2026-03-27
domain: agents_os
purpose: Executed browser E2E + full pytest evidence (Remediation Phase 3b)---

# Phase 3b — executed E2E evidence

## Environment snapshot

See `_COMMUNICATION/team_51/evidence/PHASE3B_E2E_ENV_2026-03-27.txt` (Chrome, Python, selenium, `git rev-parse HEAD` at time of first capture).

## Stack

- API: `http://127.0.0.1:8090/api/health` — OK at run time.
- Static UI: `bash scripts/run_aos_v3_e2e_stack.sh` (pid/log under `/tmp/aos_v3_e2e_*` per script).

## Commands run (verbatim)

```bash
cd <repo-root>
bash scripts/run_aos_v3_e2e_stack.sh
PYTHONPATH=. AOS_V3_E2E_RUN=1 python3 -m pytest agents_os_v3/tests/e2e/ -v
PYTHONPATH=. AOS_V3_E2E_RUN=1 python3 -m pytest agents_os_v3/tests/ -q --tb=line
bash scripts/check_aos_v3_build_governance.sh
```

## Results (2026-03-27)

| Step | Outcome |
|------|---------|
| `agents_os_v3/tests/e2e/` with `AOS_V3_E2E_RUN=1` | **9 passed** (see `PHASE3B_E2E_ONLY_AFTER_MOCK_FIX_2026-03-27.log`) |
| `agents_os_v3/tests/` with `AOS_V3_E2E_RUN=1` | **109 passed** (see `PHASE3B_FULL_PYTEST_WITH_E2E_PASS_2026-03-27.log`) |
| `check_aos_v3_build_governance.sh` | **PASS** (see `PHASE3B_GOVERNANCE_2026-03-27.log`) |

## First-run failure (documented)

Initial full run with E2E showed **5 failed** E2E cases: live `fetch` from static origin to API failed (**Failed to fetch** / CORS), so `aosv3_preset` never applied. **Remediation:** E2E fixtures default to appending `aosv3_mock=1` (`AOS_V3_E2E_UI_MOCK`, default `1`). Log preserved: `PHASE3B_FULL_PYTEST_WITH_E2E_2026-03-27.log` (failures).

## Selenium / ChromeDriver

Selenium may warn if Homebrew `chromedriver` lags Chrome; run still completed green. Operators can align versions or let Selenium Manager resolve when PATH does not pin an old driver.

## MCP browser

Not used for this evidence pack; suite is **pytest + Selenium** per mandate C-02.

---

**log_entry | TEAM_51 | AOS_V3 | REMEDIATION | PHASE3B_E2E_EXECUTED_EVIDENCE | 2026-03-27**
