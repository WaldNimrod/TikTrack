# TEAM_61_TO_TEAM_190_V2_CODE_VALIDATION_REQUEST_v1.0.0

**project_domain:** AGENTS_OS
**id:** TEAM_61_TO_TEAM_190_V2_CODE_VALIDATION_v1.0.0
**from:** Team 61 (Cloud Agent / DevOps Automation)
**to:** Team 190 (Constitutional Architectural Validator)
**cc:** Team 10 (Gateway), Team 00 (Chief Architect)
**date:** 2026-03-08
**status:** ACTION_REQUIRED
**gate_id:** N/A
**work_package_id:** N/A

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | N/A |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | N/A |
| phase_owner | Team 61 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

## 1) Purpose

בקשת ולידציה לקוד Agents_OS V2 לפני מיזוג ל-main. הקוד נמצא ב-branch `cursor/development-environment-setup-6742` וכולל 103 קבצים חדשים תחת `agents_os_v2/`. **אין שינויים לקוד production** (api/, ui/) — רק תוספות של תשתית אוטומציה, tooling, ותשתית unit tests.

## 2) Context / Inputs

### גישה לקוד

```bash
git fetch origin cursor/development-environment-setup-6742
git checkout cursor/development-environment-setup-6742
```

### מה ב-branch (כל השינויים ביחס ל-main)

**A. agents_os_v2/ — מערכת Orchestrator חדשה (103 קבצים, ~3,000 שורות Python)**

```
agents_os_v2/
├── orchestrator/          # Pipeline CLI — deterministic state machine (מחליף Team 10 chat)
│   ├── pipeline.py        # --spec, --status, --next, --generate-prompt, --advance
│   ├── gate_router.py     # Gate → engine + team mapping
│   ├── state.py           # Pipeline state (JSON persistence)
│   └── __main__.py
├── engines/               # LLM engine wrappers
│   ├── base.py            # Abstract interface
│   ├── openai_engine.py   # Teams 90, 190 (Codex)
│   ├── gemini_engine.py   # Teams 10, 50, 70, 170
│   ├── claude_engine.py   # Teams 00, 100 (Claude Code CLI)
│   └── cursor_engine.py   # Teams 20, 30, 40, 60 (prompt files)
├── context/               # Context injection per CANONICAL_MESSAGE_FORMAT_LOCK
│   ├── injection.py       # 4-layer builder: identity + governance + state + task
│   ├── identity/          # 12 team identity files (team_00.md → team_190.md)
│   ├── governance/        # Gate rules extracted from Protocol v2.3.0
│   └── conventions/       # Backend, frontend, constraints (from codebase)
├── conversations/         # Gate handlers (GATE_0 → GATE_8)
│   ├── gate_0 through gate_8
│   └── base.py            # GateResult dataclass
├── validators/            # Deterministic checks
│   ├── identity_header.py # V-01–V-13
│   ├── section_structure.py # V-14–V-20
│   ├── gate_compliance.py # V-21–V-24
│   ├── wsm_alignment.py   # V-25–V-29
│   ├── domain_isolation.py # V-30–V-33
│   ├── code_quality.py    # pytest+mypy+bandit+build wrapper
│   └── spec_compliance.py # Implementation vs LLD400
├── mcp/                   # MCP integration
│   ├── test_scenarios.py  # 18 MCP browser test scenarios (CRUD+validation+display)
│   └── evidence_validator.py # MATERIALIZATION_EVIDENCE.json validator
├── observers/
│   └── state_reader.py    # POC-1 Observer — STATE_SNAPSHOT.json
└── tests/                 # 47 tests (all passing)
    ├── test_engines.py, test_injection.py, test_pipeline.py
    ├── test_validators.py, test_mcp.py
```

**B. CI/CD Pipeline**
- `.github/workflows/ci.yml` — Backend tests + security + frontend build on every PR

**C. Quality Tooling**
- `ui/.eslintrc.cjs` — ESLint config for React frontend
- `api/mypy.ini` — mypy type checking config

**D. Unit Tests**
- `tests/unit/test_auth_service.py` — 17 tests
- `tests/unit/test_trading_accounts_service.py` — 7 tests
- `tests/unit/test_cash_flows_service.py` — 6 tests

**E. Communications**
- `_COMMUNICATION/team_61/` — Team 61 communications (2 files)
- `_COMMUNICATION/team_00/AGENTS_OS_*` — V2 plans (locked by Team 00)
- `_COMMUNICATION/team_60/CLOUD_AGENT_*` — CI/CD handoff

**F. AGENTS.md** — Cloud development instructions (repo root)

### מה לא נוגע ב-production
- **api/** — 0 changes (חוץ מ-`api/mypy.ini` שהוא config file)
- **ui/** — 0 changes (חוץ מ-`ui/.eslintrc.cjs` שהוא config file)
- **scripts/** — 0 changes
- **tests/*.test.js** — 0 changes (רק tests/unit/ חדש)

## 3) Required actions

1. **Domain isolation validation** — ודא ש-`agents_os_v2/` לא מייבא מ-`api/` או `ui/` (per domain isolation model)
2. **Gate compliance** — ודא ש-gate handlers ב-`conversations/` תואמים Gate Protocol v2.3.0
3. **Canonical format** — ודא ש-`context/injection.py` מייצר הודעות per CANONICAL_MESSAGE_FORMAT_LOCK
4. **Team identities** — ודא ש-12 קבצי identity תואמים TEAM_DEVELOPMENT_ROLE_MAPPING
5. **No production impact** — ודא שאין שינויים ל-api/, ui/ code (רק config files)
6. **Test coverage** — ודא ש-47 tests עוברים: `python3 -m pytest agents_os_v2/tests/ -v -k "not OpenAI and not Gemini"`
7. **אם נדרשים תיקונים** — העבר ל-Team 61 לתיקון לפני מיזוג

**לאחר PASS:** בצע merge של branch `cursor/development-environment-setup-6742` ל-main.

## 4) Deliverables and paths

1. `_COMMUNICATION/team_190/TEAM_190_AGENTS_OS_V2_VALIDATION_RESULT.md` — תוצאת ולידציה
2. Merge to main (after PASS)

## 5) Validation criteria (PASS/FAIL)

1. Domain isolation: agents_os_v2/ imports nothing from api/ or ui/
2. Gate handlers match Gate Protocol v2.3.0
3. Canonical message format compliant
4. Team identities accurate
5. Zero production code changes
6. 47/47 tests pass
7. No governance violations

## 6) Response required

- Decision: PASS / CONDITIONAL_PASS / BLOCK
- Blocking findings (if any, with file paths)
- Merge confirmation after PASS

log_entry | TEAM_61 | V2_CODE_VALIDATION_REQUEST | ACTION_REQUIRED | 2026-03-08
