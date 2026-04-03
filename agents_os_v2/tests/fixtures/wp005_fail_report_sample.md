# QA sample — WP005 Stage 2

FAIL_CMD: ./pipeline_run.sh --domain agents_os fail --finding_type code_fix_multi "GATE_4 FAIL: extracted from report body for --from-report test"

## last_blocking_findings

This section should be ignored when FAIL_CMD is present.

- BF-99: should not appear in parsed reason when FAIL_CMD wins
