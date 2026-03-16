#!/usr/bin/env bash
# Initialize pipeline state for a new work package
# Usage:
#   ./agents_os/scripts/init_pipeline.sh <domain> <work_package_id> [stage_id] [spec_brief]
#
# Examples:
#   ./agents_os/scripts/init_pipeline.sh agents_os S002-P005-WP001
#   ./agents_os/scripts/init_pipeline.sh tiktrack S003-P003-WP001 S003 "System Settings D39/D40/D41"

set -e
DOMAIN="${1:?Usage: init_pipeline.sh <domain> <work_package_id> [stage_id] [spec_brief]}"
WP="${2:?Usage: init_pipeline.sh <domain> <work_package_id> [stage_id] [spec_brief]}"
STAGE="${3:-S002}"
SPEC="${4:-New program}"

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO"

python3 -c "
import sys
sys.path.insert(0, '.')
from agents_os_v2.orchestrator.state import PipelineState
from agents_os_v2.orchestrator.log_events import append_event
from datetime import datetime, timezone

s = PipelineState(
    work_package_id='$WP',
    project_domain='$DOMAIN',
    stage_id='$STAGE',
    spec_brief='$SPEC',
    current_gate='GATE_0'
)
s.save()
try:
    append_event({
        'timestamp': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'pipe_run_id': s.pipe_run_id,
        'event_type': 'INIT_PIPELINE',
        'domain': '$DOMAIN',
        'stage_id': '$STAGE',
        'work_package_id': '$WP',
        'gate': 'GATE_0',
        'agent_team': 'team_61',
        'severity': 'INFO',
        'description': f'Pipeline initialized: $WP at GATE_0',
        'metadata': {'initialized_by': 'init_pipeline.sh', 'source': 'CLI_PARAM'},
    })
except Exception:
    pass
print('[agents_os] Pipeline initialized')
print(f'  WP:     {s.work_package_id}')
print(f'  Domain: {s.project_domain}')
print(f'  Stage:  {s.stage_id}')
print(f'  Gate:   {s.current_gate}')
print()
print('Next step:')
print(f'  ./pipeline_run.sh --domain $DOMAIN gate GATE_0')
"
