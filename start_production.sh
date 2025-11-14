#!/bin/bash

# Wrapper script retained for backward compatibility.
# Delegates to the unified start_server.sh with production configuration.

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
exec "$PROJECT_ROOT/start_server.sh" --env production "$@"

