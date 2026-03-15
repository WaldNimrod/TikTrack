---
project_domain: SHARED (TIKTRACK + AGENTS_OS)
id: TEAM_00_TO_TEAM_191_PROCESS_FUNCTIONAL_SEPARATION_ENFORCEMENT_MANDATE_v1.0.0
from: Team 00 (Chief Architect)
to: Team 191 (Git Governance Operations)
cc: Team 190, Team 10, Team 170
date: 2026-03-15
authority: Team 00 constitutional authority + ARCHITECT_DIRECTIVE_PROCESS_FUNCTIONAL_SEPARATION_v1.0.0
status: MANDATE_ISSUED
---

# Mandate: Process-Functional Separation Enforcement — Automated Scan

## Background

`ARCHITECT_DIRECTIVE_PROCESS_FUNCTIONAL_SEPARATION_v1.0.0.md` permanently prohibits functional teams (Teams 190, 90, 50, 51) from including routing instructions (`owner_next_action`, "Team X should do Y") inside their validation/QA result artifacts.

This violation pattern has appeared **twice** in Team 190 output (v1.0.1 and v1.0.2 of the IDEA-019 revalidation result) despite the directive being locked. Layer 1 (behavioral anchors in activation prompts) has been implemented. You are tasked with Layer 2: **mechanical enforcement at commit/push time**.

---

## §1 — Deliverable: `scripts/lint_process_functional_separation.sh`

Create a new script at `scripts/lint_process_functional_separation.sh` with the following specification:

### Scan Scope

Check staged files (or files passed as arguments) within these paths:
- `_COMMUNICATION/team_190/`
- `_COMMUNICATION/team_90/`
- `_COMMUNICATION/team_50/`
- `_COMMUNICATION/team_51/`

### Detection Patterns (regex)

Detect any of the following patterns in scanned files:

```bash
# Primary violation — section header
'##\s*owner_next_action'

# Variant forms
'owner_next_action:'
'owner_next_action\s*$'

# Routing instructions embedded in verdict documents
'Team [0-9]+.*should.*next'
'Team [0-9]+.*must.*next'
'Team [0-9]+:.*required.*action'
```

**Important:** The primary enforced pattern is `owner_next_action` as a section or field. The "Team X should..." patterns are advisory (WARN, not BLOCK) — they produce warnings but do not fail the check.

### Whitelist (never flag these)

```bash
WHITELIST=(
  "_COMMUNICATION/_Architects_Decisions/"
  "_COMMUNICATION/team_00/"
  "_COMMUNICATION/team_191/"
)
```

Any file path matching a whitelist prefix is skipped entirely. This prevents false positives on the directive document itself and on architectural communications that legitimately reference these patterns by name.

### Exit Codes

- `0` — No violations found (PASS)
- `1` — `owner_next_action` section/field found in functional team output (BLOCK)
- `2` — Warnings only (WARN — do not fail push, but report to user)

### Output Format

```
[PROCESS-FUNCTIONAL-SEPARATION] Checking staged functional team documents...
BLOCK: _COMMUNICATION/team_190/EXAMPLE_v1.0.0.md:41 — '## owner_next_action' detected
  → This section is PROHIBITED in Team 190 output per ARCHITECT_DIRECTIVE_PROCESS_FUNCTIONAL_SEPARATION_v1.0.0
  → Fix: Remove the 'owner_next_action' section entirely.
  → Express routing intent via: 'remaining_blockers: NONE' (for no action needed) or 'overall_result: PASS' (for approval signal)
  → Authority: _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_PROCESS_FUNCTIONAL_SEPARATION_v1.0.0.md

[PROCESS-FUNCTIONAL-SEPARATION] Result: BLOCK — 1 violation(s) found. Commit halted.
```

---

## §2 — Integration into Pre-Commit Hook

### A. Pre-commit config (`.pre-commit-config.yaml`)

Add a new hook entry after the existing `phoenix-date-lint-staged` hook:

```yaml
- id: phoenix-process-functional-separation
  name: Phoenix — Process-Functional Separation Guard
  language: script
  entry: scripts/lint_process_functional_separation.sh
  pass_filenames: true
  files: '^_COMMUNICATION/team_(190|90|50|51)/'
  types: [markdown]
  stages: [commit]
```

### B. Standalone staged-file scan support

The script must also work when called with explicit file arguments:

```bash
scripts/lint_process_functional_separation.sh _COMMUNICATION/team_190/SOME_RESULT_v1.0.0.md
```

This allows manual invocation during push guard triage.

---

## §3 — Integration into Team 191 `191 checks` Lane

When `191 checks` or `191 fix` is executed, Team 191 must include the process-functional separation check as a standard check lane:

```
CHECK LANE: PROCESS-FUNCTIONAL-SEPARATION
  → scripts/lint_process_functional_separation.sh
  → Scope: _COMMUNICATION/team_190/, team_90/, team_50/, team_51/
  → Result: PASS | WARN | BLOCK
```

Add this check to Team 191's internal check sequence in `TEAM_191_INTERNAL_WORK_PROCEDURE` §3 (Operating Sequence), under the classification step:

```
- `PROCESS-FUNCTIONAL-SEPARATION` — owner_next_action in functional team outputs
```

And add a remediation playbook entry:

```
LANE: PROCESS-FUNCTIONAL-SEPARATION
  Symptoms: owner_next_action section found in team_190/90/50/51 document
  Remediation: NOT Team 191's responsibility to fix content.
               BLOCK and route to document owner with exact file:line.
               Do NOT silently remove the section — content decisions belong to the issuing team.
  Escalation: Team 190 (constitutional validation) if issuing team is Team 190
              Team 00 (architect) if Team 190 refuses correction
```

**Important:** Unlike DATE-LINT, Team 191 does **NOT** auto-remediate `owner_next_action` violations. It reports the violation with exact location and blocks. The issuing team must fix their own output.

---

## §4 — Update `TEAM_191_INTERNAL_WORK_PROCEDURE` (v1.0.3)

Create `TEAM_191_INTERNAL_WORK_PROCEDURE_v1.0.3.md` superseding v1.0.2 with:

1. Add `PROCESS-FUNCTIONAL-SEPARATION` to §2 In-Scope list
2. Add check lane to §3 Operating Sequence classification step
3. Add remediation playbook for `PROCESS-FUNCTIONAL-SEPARATION` lane (§7 Mandatory Operational Character)
4. Update §6 Iron Rules: add Iron Rule 6: "Never auto-remediate content violations (PROCESS-FUNCTIONAL-SEPARATION lane) — report with exact location and block only"

---

## §5 — Delivery Requirements

| # | Deliverable | Path | Notes |
|---|-------------|------|-------|
| 1 | Lint script | `scripts/lint_process_functional_separation.sh` | Executable (`chmod +x`) |
| 2 | Pre-commit hook entry | `.pre-commit-config.yaml` | After date-lint hook |
| 3 | Work procedure update | `_COMMUNICATION/team_191/TEAM_191_INTERNAL_WORK_PROCEDURE_v1.0.3.md` | Supersedes v1.0.2 |
| 4 | Closure notice | `_COMMUNICATION/team_191/TEAM_191_TO_TEAM_00_TEAM_190_PROCESS_FUNCTIONAL_SEPARATION_ENFORCEMENT_COMPLETION_v1.0.0.md` | Report to Team 00 + Team 190 |

---

## §6 — Acceptance Criteria

Team 191 mandate is complete when:

1. `scripts/lint_process_functional_separation.sh` exists and is executable
2. Running the script against a file containing `## owner_next_action` exits with code `1` and prints the BLOCK message
3. Running the script against a file in `_COMMUNICATION/_Architects_Decisions/` exits with code `0` (whitelist respected)
4. `.pre-commit-config.yaml` includes `phoenix-process-functional-separation` hook
5. `191 checks` execution includes PROCESS-FUNCTIONAL-SEPARATION in its check output
6. `TEAM_191_INTERNAL_WORK_PROCEDURE_v1.0.3.md` authored with all 4 changes from §4
7. Closure notice delivered

---

## §7 — Escalation Path

- Questions on scope / whitelist decisions → Team 190
- Architectural questions on the directive → Team 00 via `_COMMUNICATION/_ARCHITECT_INBOX/`
- Do NOT make semantic decisions about which documents should be exempt — bring to Team 190 with a specific question

---

**log_entry | TEAM_00 | PROCESS_FUNCTIONAL_SEPARATION_ENFORCEMENT_MANDATE | ISSUED_TO_TEAM_191 | 2026-03-15**
