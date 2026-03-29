# Git hooks (local / opt-in)

These samples are **not** run automatically. Copy into `.git/hooks/` only if you want local advisory behavior.

## `prepare-commit-msg` — AOS v3 active-run suffix (advisory)

**Authority:** `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_191_SECTION_15_5_ARCHITECTURAL_ANSWERS_v1.0.0.md` — advisory only, never blocking.

**Install (one-time per clone):**

```bash
cp scripts/git-hooks/prepare-commit-msg.aos-v3-advisory.sample .git/hooks/prepare-commit-msg
chmod +x .git/hooks/prepare-commit-msg
```

**Behavior:** If staged changes include paths under `agents_os_v3/` and `scripts/suggest_run_suffix.sh` prints a non-empty suffix, a commented hint line is prepended to the commit message template. Remove the line or ignore; the hook never fails the commit.

**Uninstall:** `rm .git/hooks/prepare-commit-msg` (restore default: none, or symlink to your preferred hook).
