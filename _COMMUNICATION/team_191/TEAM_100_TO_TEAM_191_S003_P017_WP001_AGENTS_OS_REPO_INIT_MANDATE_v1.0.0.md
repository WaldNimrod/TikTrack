---
id: TEAM_100_TO_TEAM_191_S003_P017_WP001_AGENTS_OS_REPO_INIT_MANDATE_v1.0.0
from: Team 100 (Claude Code — Architecture)
to: Team 191 (GitHub & Backup — Execution)
cc: Team 00 (Principal)
date: 2026-04-02
type: EXECUTION_MANDATE
work_package_id: S003-P017-WP001
gate: GATE_2 (execution authorized)
domain: agents_os
priority: HIGH
depends_on: null
blocks: S003-P017-WP002
---

# Mandate: S003-P017-WP001 — Initialize agents-os Repository

---

## Summary

Nimrod has created the GitHub repository `WaldNimrod/agents-os` (private) at:
`https://github.com/WaldNimrod/agents-os.git`

**Your task:** Initialize the repository locally and on GitHub with the canonical directory structure defined in this mandate. This is the foundational scaffold that all subsequent Lean Kit work (S003-P017-WP002) depends on. Execute completely and precisely — no partial execution.

---

## Pre-conditions (verify before executing)

1. Repository exists at `https://github.com/WaldNimrod/agents-os.git` ✓ (confirmed by Nimrod 2026-04-02)
2. SSH access to GitHub is working: `ssh -T git@github.com`
3. `/Users/nimrod/Documents/agents-os/` does NOT exist yet — you are creating it fresh
4. You have read access to `/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/`

If any pre-condition fails, STOP and report to Team 100. Do not proceed.

---

## Execution Steps (ordered — do not reorder)

### Step 1 — Create local directory and initialize git

```bash
mkdir -p /Users/nimrod/Documents/agents-os
cd /Users/nimrod/Documents/agents-os
git init
git remote add origin git@github.com:WaldNimrod/agents-os.git
```

### Step 2 — Create canonical directory structure

```bash
# Core AOS engine
mkdir -p core

# Lean Kit (L0 profile materials — content populated by Team 170 in WP002)
mkdir -p lean-kit/templates
mkdir -p lean-kit/team_roles
mkdir -p lean-kit/gates
mkdir -p lean-kit/config_templates
mkdir -p lean-kit/examples/example-project/work_packages

# Methodology (profile-agnostic, populated from TikTrack governance docs)
mkdir -p methodology/lod-standard
mkdir -p methodology/gate-model
mkdir -p methodology/iron-rules

# Governance (AOS-specific)
mkdir -p governance/directives
mkdir -p governance/standards

# Team communications (AOS teams only — fresh start, no TikTrack team history)
mkdir -p _COMMUNICATION/_Architects_Decisions
mkdir -p _COMMUNICATION/_ARCHITECT_INBOX
mkdir -p _COMMUNICATION/team_00
mkdir -p _COMMUNICATION/team_100
mkdir -p _COMMUNICATION/team_170
mkdir -p _COMMUNICATION/team_190
mkdir -p _COMMUNICATION/team_191

# Project registrations (pointer files for managed projects)
mkdir -p projects

# Pipeline scripts
mkdir -p scripts/portfolio

# Storage and logs (gitignored)
mkdir -p storage
mkdir -p logs
```

### Step 3 — Copy AOS v3 core files

```bash
TT_REPO="/Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix"

# Copy agents_os_v3 as core/ (this is the AOS engine — source of truth moves here)
cp -r "${TT_REPO}/agents_os_v3/." ./core/

# Copy pipeline runner scripts
cp "${TT_REPO}/pipeline_run.sh" ./pipeline_run.sh
cp "${TT_REPO}/idea_scan.sh" ./idea_scan.sh
cp "${TT_REPO}/idea_submit.sh" ./idea_submit.sh

# Copy governance scripts (lint + portfolio guards)
cp "${TT_REPO}/scripts/lint_governance_dates.sh" ./scripts/lint_governance_dates.sh
cp "${TT_REPO}/scripts/lint_aos_v3_file_index_and_v2_freeze.sh" ./scripts/lint_aos_v3_file_index_and_v2_freeze.sh
cp -r "${TT_REPO}/scripts/portfolio/." ./scripts/portfolio/

# Copy governance docs → methodology/
cp -r "${TT_REPO}/documentation/docs-governance/01-FOUNDATIONS/." ./methodology/gate-model/
cp "${TT_REPO}/documentation/docs-governance/00_MASTER_DOCUMENTATION_TABLE_v1.0.0.md" ./governance/standards/ 2>/dev/null || true

# Copy Architect Decisions (AOS governance directives)
cp -r "${TT_REPO}/_COMMUNICATION/_Architects_Decisions/." ./governance/directives/

# Copy LOD standard (methodology/lod-standard/)
cp "${TT_REPO}/_COMMUNICATION/team_100/TEAM_100_LOD_STANDARD_v0.3.md" ./methodology/lod-standard/
cp "${TT_REPO}/_COMMUNICATION/team_100/TEAM_100_LOD_STANDARD_v0.2.md" ./methodology/lod-standard/
cp "${TT_REPO}/_COMMUNICATION/team_100/TEAM_100_LOD_STANDARD_DELTA_v0.1_to_v0.2.md" ./methodology/lod-standard/
cp "${TT_REPO}/_COMMUNICATION/team_100/TEAM_100_LOD_STANDARD_DELTA_v0.2_to_v0.3.md" ./methodology/lod-standard/
cp "${TT_REPO}/_COMMUNICATION/team_100/PROJECT_CREATION_PROCEDURE_v1.0.0.md" ./methodology/

# Copy system context document
cp "${TT_REPO}/_COMMUNICATION/team_100/TEAM_100_SYSTEM_CONTEXT_FOR_EXTERNAL_REVIEW_v1.0.0.md" ./_COMMUNICATION/team_100/
```

### Step 4 — Create tiktrack.yaml project registration

```bash
cat > ./projects/tiktrack.yaml << 'EOF'
# TikTrack — Registered Managed Project
# ----------------------------------------
project_id: tiktrack
name: TikTrack Phoenix
status: ACTIVE
profile: L2  # AOS v3 / Dashboard
repo: git@github.com:WaldNimrod/TikTrack.git
local_path: /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix
domain_id_in_aos: "01JK8AOSV3DOMAIN00000002"
active_stage: S003
registered: 2026-04-02
notes: "TikTrack is managed by AOS. Its agents_os_v3/ is a deployed snapshot of agents-os/core/."
EOF
```

### Step 5 — Create .gitignore

```bash
cat > .gitignore << 'EOF'
# Runtime and logs
storage/
logs/
*.log
__pycache__/
*.pyc
*.pyo
.pytest_cache/
.mypy_cache/

# Node
node_modules/
dist/

# Environment
.env
.env.*
*.env

# OS
.DS_Store
Thumbs.db

# Temp
tmp/
*.tmp
EOF
```

### Step 6 — Create lean-kit/LEAN_KIT_VERSION.md

```bash
cat > lean-kit/LEAN_KIT_VERSION.md << 'EOF'
# Lean Kit Version

**version:** 0.1.0-scaffold
**date:** 2026-04-02
**status:** SCAFFOLD — content pending (S003-P017-WP002)

## Contents status

| Component | Status |
|-----------|--------|
| templates/ | EMPTY — awaiting Team 170 (WP002) |
| team_roles/ | EMPTY — awaiting Team 170 (WP002) |
| gates/ | EMPTY — awaiting Team 170 (WP002) |
| config_templates/ | EMPTY — awaiting Team 170 (WP002) |
| examples/ | EMPTY — awaiting Team 170 (WP002) |

## Version history

| Version | Date | Change |
|---------|------|--------|
| 0.1.0-scaffold | 2026-04-02 | Initial repository scaffold |

## Snapshot model

Projects that adopt the Lean Kit clone at a specific version tag.
This file records which version is in use.
No auto-sync. Updates via Team 100 propagation notice.

Reference: `methodology/ARCHITECT_DIRECTIVE_METHODOLOGY_DEPLOYMENT_SPLIT_v1.0.0.md` §3
EOF
```

### Step 7 — Create CLAUDE.md for the agents-os repo

```bash
cat > CLAUDE.md << 'EOF'
# CLAUDE.md — agents-os

## Identity
**Repo:** agents-os — AOS methodology engine and Lean Kit
**Path:** /Users/nimrod/Documents/agents-os/
**GitHub:** https://github.com/WaldNimrod/agents-os (private)
**Owner:** Nimrod (Team 00)
**Created:** 2026-04-02

## What this repo is
This is the Agents OS (AOS) — the methodology and orchestration system.
It is NOT a product repo. It manages product repos (e.g., TikTrack).

Managed projects:
- TikTrack: /Users/nimrod/Documents/TikTrack/TikTrackAppV2-phoenix/

## Deployment profiles active
- L0 (Lean/Manual): lean-kit/ directory
- L2 (AOS v3/Dashboard): core/ directory (agents_os_v3 migrated here)
- L3 (AOS v4/CLI): future — not yet built

## Mandatory session startup
1. Read core/definition.yaml — active stage, programs, WPs
2. Read _COMMUNICATION/team_00/ — architect working documents
3. Read methodology/lod-standard/TEAM_100_LOD_STANDARD_v0.3.md (until promoted to v1.0.0)

## Writing authority
- Write to: _COMMUNICATION/team_100/ and governance/directives/
- Do NOT modify core/definition.yaml without Team 00 approval
- Do NOT modify methodology/ files without formal mandate

## Key paths
- AOS engine: core/ (source of truth; was agents_os_v3 in TikTrack repo)
- Lean Kit content: lean-kit/ (being built in S003-P017-WP002)
- Methodology docs: methodology/
- Governance directives: governance/directives/
- Pipeline runner: ./pipeline_run.sh

## Current active work
- S003-P017-WP001: This initialization (GATE_3 in progress)
- S003-P017-WP002: Lean Kit content — pending WP001 completion
EOF
```

### Step 8 — Create README.md

```bash
cat > README.md << 'EOF'
# agents-os

AOS (Agents OS) — methodology engine and Lean Kit for LLM-agent-based development.

## What this is

A system for managing software projects built by LLM agent teams. Provides:
- **Lean Kit (L0):** Document templates, role definitions, gate checklists for manual orchestration
- **AOS v3 (L2):** Full pipeline engine with DB, API, dashboard UI
- **AOS v4 (L3):** Future — full CLI automation

## Managed projects

- [TikTrack](https://github.com/WaldNimrod/TikTrack) — stock tracking application (L2 profile)

## Reference

- LOD Standard: `methodology/lod-standard/`
- Project creation: `methodology/PROJECT_CREATION_PROCEDURE_v1.0.0.md`
- Lean Kit: `lean-kit/`
EOF
```

### Step 9 — Commit and push

```bash
cd /Users/nimrod/Documents/agents-os

git add .
git commit -m "$(cat <<'COMMITMSG'
init(agents-os): S003-P017-WP001 — scaffold AOS repo with core/, lean-kit/, methodology/

Initial repository scaffold for agents-os:
- core/: AOS v3 engine (copied from TikTrackAppV2-phoenix/agents_os_v3/)
- lean-kit/: L0 profile directory structure (content pending S003-P017-WP002)
- methodology/: LOD standard v0.3, gate model docs, iron rules directives
- governance/directives/: Architect decisions (AOS governance layer)
- _COMMUNICATION/: AOS teams only (fresh start; no TikTrack team history)
- projects/tiktrack.yaml: TikTrack registered as managed project
- CLAUDE.md, README.md, .gitignore

This is Phase 1 of the TikTrack/AOS repository separation.
TikTrack repo retains agents_os_v3/ as a deployed snapshot until L3 is ready.

Ref: ARCHITECT_DIRECTIVE_METHODOLOGY_DEPLOYMENT_SPLIT_v1.0.0.md
     S003-P017-WP001 mandate: TEAM_100_TO_TEAM_191_S003_P017_WP001_AGENTS_OS_REPO_INIT_MANDATE_v1.0.0.md

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
COMMITMSG
)"

git push -u origin main
```

---

## Post-execution verification

After pushing, verify:

1. `https://github.com/WaldNimrod/agents-os` is accessible and shows the commit
2. `ls /Users/nimrod/Documents/agents-os/core/` shows `definition.yaml`, `modules/`, `cli/`, `ui/`, `db/` etc.
3. `ls /Users/nimrod/Documents/agents-os/lean-kit/` shows `templates/`, `team_roles/`, `gates/`, `config_templates/`, `examples/`, `LEAN_KIT_VERSION.md`
4. `ls /Users/nimrod/Documents/agents-os/methodology/` shows `lod-standard/`, `gate-model/`, `iron-rules/`
5. `cat /Users/nimrod/Documents/agents-os/projects/tiktrack.yaml` shows correct TikTrack path

---

## Output to submit

Submit a completion report to `_COMMUNICATION/_ARCHITECT_INBOX/` in the **TikTrack repo** (not the new agents-os repo):

File: `TEAM_191_TO_TEAM_100_S003_P017_WP001_REPO_INIT_COMPLETION_REPORT_v1.0.0.md`

Include:
- Execution date/time
- Git log of first commit (SHA + message)
- GitHub URL confirmation
- Verification checklist (5 items above: PASS/FAIL each)
- Any issues encountered and resolutions

---

## Gate sequence for this WP

```
GATE_0 (this mandate = intake) → GATE_1 (spec = this document) → GATE_2 (auth = issued)
→ GATE_3 (execution = your task) → GATE_4 (QA = verify checklist) → GATE_5 (Team 190 cross-engine validation)
```

Team 190 will validate the repo structure and CLAUDE.md content at GATE_5.
After GATE_5 PASS, S003-P017-WP002 (Team 170 Lean Kit content) is unblocked.

---

*log_entry | TEAM_100 → TEAM_191 | S003-P017-WP001 | GATE_2_MANDATE_ISSUED | 2026-04-02*

historical_record: true
