#!/bin/bash

# Wrapper script retained for backward compatibility inside the production tree.
# Delegates to the unified start_server.sh in the repository root.

set -e

PRODUCTION_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$PRODUCTION_DIR/.." && pwd)"
exec "$REPO_ROOT/start_server.sh" --env production "$@"

