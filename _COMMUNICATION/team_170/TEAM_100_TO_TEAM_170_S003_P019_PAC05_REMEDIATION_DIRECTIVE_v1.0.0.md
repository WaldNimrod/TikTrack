---
id: TEAM_100_TO_TEAM_170_S003_P019_PAC05_REMEDIATION_DIRECTIVE_v1.0.0
from: Team 100 (Architecture)
to: Team 170 (Documentation)
cc: Team 00 (Principal), Team 190 (awareness)
date: 2026-04-04
type: REMEDIATION_DIRECTIVE
program_id: S003-P019
phase: Phase 2 — L-GATE_V PAC-05 remediation
trigger: sfa_team_50 L-GATE_V FAIL (PAC-05 blocking) — 2026-04-04
severity: MINOR_FIX (single-line command correction)
estimated_effort: < 10 minutes
---

# Remediation Directive — S003-P019 Phase 2 | PAC-05

---

## §1 — Root Cause Analysis

**sfa_team_50 (OpenAI) returned L-GATE_V FAIL — PAC-05 BLOCKING.**

### What happened

PAC-05 command in PD5 (`LEAN_KIT_ACTIVATION_TEAM50.md`):
```bash
git diff --name-only HEAD~1
```

This command, when run without a second explicit ref, compares HEAD~1 **to the current working tree** (not to HEAD). It therefore includes all unstaged/staged changes in the repo — including unrelated WIP from ongoing SFA M10 work (`organic_market_agent/`, `output/public/`).

### What is NOT compromised

The Phase 2 commit itself (`836211987ca0f56d46c82e2836ec7aac98fd61e2`) is **clean** and scope-correct. Confirmed by three independent checks:

| Source | Check | Result |
|--------|-------|--------|
| sfa_team_50 PAC-06 | `git show --name-only ... -n 1` on HEAD | PASS — only PD1–PD5 in commit |
| Team 51 PAC-05 | `git show --name-only 836211987ca0f56d46c82e2836ec7aac98fd61e2` | PASS |
| Team 190 V-05 | Commit-scope spot-check | PASS |

The issue is **the test command in PD5**, not the deliverables.

---

## §2 — Required Fix (single change)

**File:** `SmallFarmsAgents/_COMMUNICATION/TEAM_50/LEAN_KIT_ACTIVATION_TEAM50.md`

**Section:** PAC-05 test command (in the validator checklist / First Validation section)

Find the line:
```bash
git diff --name-only HEAD~1
```

Replace with:
```bash
git diff --name-only HEAD~1 HEAD
```

This makes the command check **committed changes only** (between HEAD~1 and HEAD commits) — which is the correct intent of PAC-05.

**No other file changes are required.** PD1–PD4 are unaffected. The Phase 2 commit scope is already correct.

---

## §3 — Execution Steps

1. Edit `SmallFarmsAgents/_COMMUNICATION/TEAM_50/LEAN_KIT_ACTIVATION_TEAM50.md`:
   - Find the PAC-05 test command
   - Change `git diff --name-only HEAD~1` → `git diff --name-only HEAD~1 HEAD`

2. Self-verify: `grep "git diff --name-only HEAD~1 HEAD" _COMMUNICATION/TEAM_50/LEAN_KIT_ACTIVATION_TEAM50.md` → must match

3. Commit the change:
   ```bash
   cd /Users/nimrod/Documents/SmallFarmsAgents
   git add _COMMUNICATION/TEAM_50/LEAN_KIT_ACTIVATION_TEAM50.md
   git commit -m "fix(lean-kit): correct PAC-05 test command — use HEAD~1 HEAD to check commit scope only"
   git push origin main
   ```

4. Record new commit SHA.

5. File completion notice to `_ARCHITECT_INBOX/`:
   ```
   TEAM_170_TO_TEAM_100_S003_P019_PAC05_REMEDIATION_COMPLETE_v1.0.0.md
   ```
   Required header fields:
   ```yaml
   from: Team 170
   to: Team 100
   cc: Team 00
   date: <today>
   program_id: S003-P019
   fix: PAC-05 test command corrected in PD5
   old_command: "git diff --name-only HEAD~1"
   new_command: "git diff --name-only HEAD~1 HEAD"
   sfa_repo_commit: <new sha>
   ready_for: L-GATE_V re-run
   ```

---

## §4 — What Nimrod Does Next (after Step 5)

Nimrod opens a new **OpenAI** session. Pastes the **updated** contents of:
```
SmallFarmsAgents/_COMMUNICATION/TEAM_50/LEAN_KIT_ACTIVATION_TEAM50.md
```

sfa_team_50 re-validates PAC-01..PAC-10.
Expected: PAC-05 now PASS (commit scope check returns only `_COMMUNICATION/` paths).
Result filed to:
```
SmallFarmsAgents/_COMMUNICATION/TEAM_50/reports/LGATE_V_SFA_P001_WP001_RESULT_v1.0.0.md
```
(overwrite existing FAIL report)

---

## §5 — No Scope Creep

**Do NOT:**
- Change PD1–PD4
- Re-run PAC-01..PAC-04, PAC-06..PAC-10 (all PASS, unchanged)
- Touch agents-os (no changes there)
- Modify PAC-05 criterion — only the test command

The sole change is one line in PD5. Everything else is clean.

---

**log_entry | TEAM_100 | S003_P019_PHASE2 | PAC05_REMEDIATION_DIRECTIVE | TEAM_170 | ROOT_CAUSE_PD5_COMMAND | 2026-04-04**
