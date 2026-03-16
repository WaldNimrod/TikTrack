#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# setup_claude_permissions.sh
# Configures Claude Code auto-allow permissions for TikTrack / Agents_OS project.
# Run once: ./setup_claude_permissions.sh
# Idempotent — safe to re-run.
# ─────────────────────────────────────────────────────────────────────────────

SETTINGS="$HOME/.claude/settings.json"

# ── Permissions to auto-allow ─────────────────────────────────────────────
# Format: "Bash(glob_pattern)" — Claude runs without asking for each match.
# ─────────────────────────────────────────────────────────────────────────────
ALLOW_PATTERNS=(
  # ── Pipeline tool (all subcommands) ──────────────────────────────────────
  "Bash(./pipeline_run.sh*)"

  # ── Python pipeline CLI ───────────────────────────────────────────────────
  "Bash(python3 -m agents_os_v2*)"
  "Bash(python3 agents_os_v2/orchestrator/pipeline.py*)"

  # ── Git — read-only operations (safe) ────────────────────────────────────
  "Bash(git status*)"
  "Bash(git log*)"
  "Bash(git diff*)"
  "Bash(git show*)"
  "Bash(git branch*)"

  # ── Project-specific scripts ──────────────────────────────────────────────
  "Bash(./idea_scan.sh*)"
  "Bash(./idea_submit.sh*)"

  # ── Node.js syntax checks (used by Claude for JS validation) ─────────────
  "Bash(node -e*)"
  "Bash(node --check*)"

  # ── Tail / cat log files (read-only diagnostics) ─────────────────────────
  "Bash(tail -* _COMMUNICATION/agents_os/logs/*)"
  "Bash(tail -* _COMMUNICATION/agents_os/pipeline_state*)"
)

# ─────────────────────────────────────────────────────────────────────────────
# NOT auto-allowed (always prompt) — destructive / external:
#   git commit, git push, git reset, git checkout --
#   rm, mv (destructive file ops)
#   curl / wget (external network)
#   pip install / npm install
# ─────────────────────────────────────────────────────────────────────────────

echo "Configuring Claude Code permissions..."
echo "Settings file: $SETTINGS"

# Ensure ~/.claude directory exists
mkdir -p "$HOME/.claude"

# Read existing settings (preserve current content)
if [ -f "$SETTINGS" ]; then
  CURRENT=$(cat "$SETTINGS")
else
  CURRENT='{}'
fi

# Build the new allow array as JSON
ALLOW_JSON="["
FIRST=true
for pattern in "${ALLOW_PATTERNS[@]}"; do
  if $FIRST; then
    FIRST=false
  else
    ALLOW_JSON+=","
  fi
  ALLOW_JSON+="\"$pattern\""
done
ALLOW_JSON+="]"

# Merge: add/replace permissions.allow in existing settings using Python
python3 - <<PYEOF
import json, sys

settings_path = "$SETTINGS"
allow_patterns = $ALLOW_JSON

try:
    with open(settings_path, 'r') as f:
        settings = json.load(f)
except (FileNotFoundError, json.JSONDecodeError):
    settings = {}

if 'permissions' not in settings:
    settings['permissions'] = {}

existing = settings['permissions'].get('allow', [])

# Merge: add new patterns, preserve existing ones not in our list
merged = list(existing)
added = []
for p in allow_patterns:
    if p not in merged:
        merged.append(p)
        added.append(p)

settings['permissions']['allow'] = merged

with open(settings_path, 'w') as f:
    json.dump(settings, f, indent=2)

if added:
    print(f"Added {len(added)} new permission(s):")
    for p in added:
        print(f"  + {p}")
else:
    print("All permissions already configured — no changes needed.")

print(f"\nTotal auto-allow rules: {len(merged)}")
PYEOF

echo ""
echo "Done. Claude Code will now auto-approve these commands without prompting."
echo "To verify: cat $SETTINGS"
