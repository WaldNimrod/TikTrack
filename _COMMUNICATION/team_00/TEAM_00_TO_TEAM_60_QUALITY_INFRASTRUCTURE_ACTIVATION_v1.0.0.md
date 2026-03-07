# TEAM 00 → TEAM 60 | Quality Infrastructure Activation
**Document ID:** TEAM_00_TO_TEAM_60_QUALITY_INFRASTRUCTURE_ACTIVATION_v1.0.0
**date:** 2026-03-03
**From:** Team 00 (Chief Architect)
**To:** Team 60 (DevOps / Infrastructure)
**Authority:** ARCHITECT_DIRECTIVE_QUALITY_INFRASTRUCTURE_v1.0.0
**Status:** ACTIVE — CRITICAL. Execute before S003 work begins.

---

## YOUR MANDATE

Team 60 owns the two most critical infrastructure items from the KB lock:
1. **CI/CD Pipeline (KB-015)** — CRITICAL — create GitHub Actions workflow
2. **Pre-commit Framework (KB-016)** — HIGH — create `.pre-commit-config.yaml`
3. **pip upgrade in CI (KB-011)** — integrate during CI/CD setup

These must be completed BEFORE S003 implementation begins.

---

## TASK 1 — CI/CD Pipeline (KB-015) — CRITICAL

### 1.1 Create `.github/workflows/ci.yml`

Create the file at the repo root path `.github/workflows/ci.yml` with the following canonical content:

```yaml
name: Phoenix CI Quality Gate
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend-quality:
    name: Backend Tests & Security
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: |
          cd api
          python3 -m venv venv
          source venv/bin/activate
          pip install --upgrade pip
          pip install -r requirements.txt -q
          pip install bandit -q

      - name: Unit Tests [BLOCKING]
        run: |
          source api/venv/bin/activate
          python3 -m pytest tests/unit/ -v --tb=short
        # BLOCKING: failure here = PR cannot merge

      - name: Security Scan — Bandit HIGH [BLOCKING]
        run: |
          source api/venv/bin/activate
          bandit -r api/ --exclude api/venv -lll
        # BLOCKING: HIGH severity security issues = PR cannot merge
        # -lll = only HIGH confidence, HIGH severity (most strict)

      - name: Dependency Audit [INFORMATIONAL]
        run: |
          source api/venv/bin/activate
          pip install pip-audit -q
          pip-audit --format columns || true
        # Non-blocking until KB-010/011 resolved (|| true keeps CI green)
        continue-on-error: true

      - name: Type Safety — mypy [INFORMATIONAL]
        run: |
          source api/venv/bin/activate
          pip install mypy -q
          mypy api/ --config-file api/mypy.ini || true
        # Non-blocking until KB-006 (131 errors) is resolved
        continue-on-error: true

  frontend-quality:
    name: Frontend Build & Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Install dependencies
        run: cd ui && npm install

      - name: Frontend Build [BLOCKING]
        run: cd ui && npx vite build
        # BLOCKING: build must succeed for merge

      - name: ESLint [INFORMATIONAL]
        run: cd ui && ./node_modules/.bin/eslint . --ext js,jsx --report-unused-disable-directives || true
        # Non-blocking until KB-008/009 resolved
        continue-on-error: true

      - name: npm Security Audit [INFORMATIONAL]
        run: cd ui && npm audit || true
        # Non-blocking until KB-012/013 resolved
        continue-on-error: true
```

### 1.2 Phase 2 Promotion (DO NOT change yet)

When Team 10 confirms the following KB items are resolved, promote from `continue-on-error: true` to BLOCKING (remove the `|| true` and `continue-on-error`):

| Promotion | Trigger condition |
|-----------|------------------|
| mypy → BLOCKING | KB-006 (131 type errors) cleared by Team 00/Team 20 |
| ESLint → BLOCKING | KB-008 + KB-009 fixed (Team 30) |
| pip-audit → BLOCKING | KB-010 + KB-011 fixed (Team 20) |
| npm audit → BLOCKING | KB-012 + KB-013 fixed (Team 30) |

Create a tracking comment in the YAML: `# PHASE2_PROMOTION: see ARCHITECT_DIRECTIVE_QUALITY_INFRASTRUCTURE_v1.0.0 §5.5`

### 1.3 Branch Protection (post-CI setup)

After CI is confirmed working:
- Navigate to GitHub repo → Settings → Branches → Branch protection rules
- For `main`: require status checks `backend-quality` and `frontend-quality` to pass before merge
- For `develop` (if exists): same requirement
- Confirm this is done and report to Team 10.

**NOTE:** This is a SETTINGS change, not a code change. If you do not have GitHub admin rights, flag to Nimrod.

### 1.4 Deliver

- `.github/workflows/ci.yml` committed to main/develop
- First CI run passes (both jobs green for blocking checks)
- Report: CI URL from first successful run

---

## TASK 2 — Pre-commit Framework (KB-016)

### 2.1 Install pre-commit framework

```bash
pip install pre-commit
```

Add `pre-commit` to `api/requirements.txt` (development dependencies section or separate `requirements-dev.txt`).

### 2.2 Create `.pre-commit-config.yaml`

Create at repo root:

```yaml
# .pre-commit-config.yaml
# Phoenix Project — Pre-commit Quality Gate
# See: ARCHITECT_DIRECTIVE_QUALITY_INFRASTRUCTURE_v1.0.0 §6
# PHASE2_PROMOTION: add mypy/ESLint/audit hooks once KB-006/008/009/010-013 cleared

repos:
  # ─── BLOCKING HOOKS (all must pass for commit to proceed) ────────────────

  - repo: local
    hooks:
      - id: phoenix-unit-tests
        name: "Phoenix Unit Tests [BLOCKING]"
        entry: bash -c "source api/venv/bin/activate 2>/dev/null || true; python3 -m pytest tests/unit/ -q --tb=short"
        language: system
        pass_filenames: false
        always_run: true
        stages: [commit]

      - id: phoenix-bandit-security
        name: "Phoenix Security Scan — Bandit HIGH [BLOCKING]"
        entry: bash -c "source api/venv/bin/activate 2>/dev/null || true; bandit -r api/ --exclude api/venv -lll"
        language: system
        pass_filenames: false
        types: [python]
        stages: [commit]

      - id: phoenix-frontend-build
        name: "Phoenix Frontend Build [BLOCKING on JS changes]"
        entry: bash -c "cd ui && npx vite build --mode development"
        language: system
        pass_filenames: false
        files: \.(jsx?|css|html|json)$
        stages: [commit]

  # ─── INFORMATIONAL HOOKS (print output, do not block) ────────────────────
  # Uncomment when respective KB items are resolved:

  # - repo: local
  #   hooks:
  #     - id: phoenix-mypy
  #       name: "mypy Type Check [INFORMATIONAL — enable after KB-006]"
  #       entry: bash -c "source api/venv/bin/activate 2>/dev/null || true; mypy api/ --config-file api/mypy.ini; exit 0"
  #       language: system
  #       pass_filenames: false
  #       types: [python]
  #
  #     - id: phoenix-eslint
  #       name: "ESLint [INFORMATIONAL — enable after KB-008/009]"
  #       entry: bash -c "cd ui && ./node_modules/.bin/eslint . --ext js,jsx || exit 0"
  #       language: system
  #       pass_filenames: false
  #       files: \.(jsx?)$
```

### 2.3 Activate and test

```bash
pre-commit install  # Installs hooks into .git/hooks/pre-commit
pre-commit run --all-files  # Test against entire repo (expected: unit tests pass, bandit pass, build pass)
```

If test run fails on unit tests or bandit — investigate and resolve before delivering.

### 2.4 Documentation

Create `docs/CONTRIBUTING.md` (or update if exists) with a setup section:

```markdown
## Development Setup

### Pre-commit Hooks

This project uses `pre-commit` to ensure code quality before commits.

Install once (per developer):
```bash
pip install pre-commit
pre-commit install
```

After this, every `git commit` will run quality checks automatically.
To bypass (NOT recommended, requires Team 00 approval): `git commit --no-verify`
```

**Deliver:**
- `.pre-commit-config.yaml` committed to main/develop
- `pre-commit run --all-files` output showing all blocking hooks pass
- Developer setup note in docs

---

## TASK 3 — pip Upgrade in CI (KB-011)

This is already included in the CI/CD YAML above (`pip install --upgrade pip` in the setup step). Confirm that after this runs, CI shows pip ≥ 26.0.

Add a pip version check step to CI (optional but recommended):
```yaml
      - name: Verify pip version
        run: |
          source api/venv/bin/activate
          pip --version
```

---

## COMPLETION CRITERIA

Team 60 is complete when:
- [ ] `.github/workflows/ci.yml` committed to main/develop — CI runs on PR
- [ ] First CI run: both `backend-quality` and `frontend-quality` jobs GREEN
- [ ] Branch protection rules set for `main` (and `develop` if used)
- [ ] `.pre-commit-config.yaml` committed — all blocking hooks pass on `--all-files` run
- [ ] `pre-commit install` documented for all developers
- [ ] pip ≥ 26.0 confirmed in CI environment

**Report completion to Team 10.** Include:
- CI run URL (first green run)
- pre-commit `--all-files` output summary

---

**log_entry | TEAM_00→TEAM_60 | QUALITY_INFRASTRUCTURE_ACTIVATION_v1.0.0 | ACTIVE | 2026-03-03**
