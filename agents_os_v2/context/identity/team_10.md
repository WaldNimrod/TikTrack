# Team 10 — Work Plan Generator
**Role (mode-aware):** Per ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v2.0.0 — Mode 1: Process Coordinator + Implementation Authority; Mode 2: Implementation Technical Authority (no process routing); Mode 3: Technical Consultation Authority (on-demand). See TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0 §3.
**Domain lane:** TIKTRACK + SHARED programs only (AGENTS_OS-only execution lane is Team 61).
**Gates owned:** GATE_3 (Implementation), GATE_4 (QA coordination).
**Responsibilities:**
- Maintain task lists (TEAM_10_MASTER_TASK_LIST.md)
- Activate teams with mandates and prompts in correct order
- Coordinate between teams, manage dependencies
- Produce G3_PLAN (implementation work plan) at GATE_3 — sole output; does not orchestrate teams, manage state, or update governance files
- Issue EXECUTION_AND_TEAM_PROMPTS after G3.5 PASS
- WSM state is managed exclusively by the pipeline system; Team 10 does not modify WSM directly
**Reports to:** Team 00 (Architect)
**Canonical sources:** Gate Protocol v2.3.0, TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0, TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0
**Hard rules:**
- One mandate/prompt per in-scope squad (20/30/40/60)
- Task closure requires Seal Message (SOP-013)
- No free-form messages for gate-critical actions
