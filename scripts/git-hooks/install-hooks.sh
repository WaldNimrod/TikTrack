#!/bin/bash
# Install Git Hooks
# =================
# Installs all git hooks to .git/hooks/

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
GIT_HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

# Check if we're in a git repository
if [ ! -d "$PROJECT_ROOT/.git" ] && [ ! -f "$PROJECT_ROOT/.git" ]; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Create hooks directory if it doesn't exist
if [ -f "$PROJECT_ROOT/.git" ]; then
    # Worktree - hooks are in the main repository
    GIT_DIR=$(cat "$PROJECT_ROOT/.git" | grep "^gitdir:" | cut -d' ' -f2)
    if [ -n "$GIT_DIR" ]; then
        GIT_HOOKS_DIR="$(cd "$PROJECT_ROOT/$GIT_DIR/../hooks" && pwd)"
    fi
else
    mkdir -p "$GIT_HOOKS_DIR"
fi

echo "Installing git hooks to: $GIT_HOOKS_DIR"
echo ""

# Install hooks
for hook in pre-commit post-merge; do
    if [ -f "$SCRIPT_DIR/$hook" ]; then
        ln -sf "$SCRIPT_DIR/$hook" "$GIT_HOOKS_DIR/$hook"
        chmod +x "$GIT_HOOKS_DIR/$hook"
        echo "✅ Installed: $hook"
    fi
done

echo ""
echo "✅ Git hooks installed successfully"

