# Contributing

## Development Setup

### Quality Tooling Bootstrap

This repository provides a reproducible local bootstrap for quality tools used by CI:

- `bandit`
- `pip-audit`
- `detect-secrets`
- `mypy`

Run once (or whenever refreshing local tooling):

```bash
make bootstrap-quality-tools
make verify-quality-tools
```

### Pre-commit Hooks

This project uses `pre-commit` to enforce quality checks before commits.

Install once per clone:

```bash
cd api
source venv/bin/activate
pip install pre-commit
cd ..
pre-commit install
```

Run hooks manually across the whole repository:

```bash
pre-commit run --all-files
```

### Secret Scanning Baseline

`detect-secrets` is enforced via pre-commit using repository baseline:

- `.secrets.baseline`

If intentional secrets metadata changes are required:

```bash
source api/venv/bin/activate
detect-secrets scan --all-files > .secrets.baseline
```

Review baseline diffs carefully before committing.

### Temporary Bypass (not recommended)

Bypass hooks only with explicit governance approval:

```bash
git commit --no-verify
```
