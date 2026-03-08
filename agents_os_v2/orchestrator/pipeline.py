"""
Agents_OS V2 — Pipeline Orchestrator (Redesigned)
Deterministic state machine that replaces Team 10 chat.

The Orchestrator IS Team 10 — it manages state, routing, and prompt generation.
Actual LLM work happens in:
  - Cursor Composer sessions (primary, has MCP)
  - Codex sessions (Teams 90/190 validation)
  - Claude Code (architect decisions GATE_2/6)

Usage:
  python3 -m agents_os_v2.orchestrator.pipeline --spec "feature description"
  python3 -m agents_os_v2.orchestrator.pipeline --status
  python3 -m agents_os_v2.orchestrator.pipeline --next
  python3 -m agents_os_v2.orchestrator.pipeline --advance GATE_X [PASS|FAIL]
  python3 -m agents_os_v2.orchestrator.pipeline --generate-prompt GATE_X
"""

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from .state import PipelineState, STATE_FILE
from ..config import REPO_ROOT, AGENTS_OS_OUTPUT_DIR
from ..context.injection import (
    build_full_agent_prompt,
    build_canonical_message,
    build_state_summary,
    load_team_identity,
)


GATE_SEQUENCE = [
    "GATE_0", "GATE_1", "GATE_2",
    "G3_PLAN", "G3_5", "G3_6_MANDATES",
    "CURSOR_IMPLEMENTATION",
    "GATE_4", "GATE_5", "GATE_6", "GATE_7", "GATE_8",
]

GATE_CONFIG = {
    "GATE_0":    {"owner": "team_190", "engine": "codex",   "desc": "Team 190 validates LOD200 scope"},
    "GATE_1":    {"owner": "team_190", "engine": "codex",   "desc": "Team 170 produces LLD400 → Team 190 validates"},
    "GATE_2":    {"owner": "team_100", "engine": "claude",  "desc": "Team 100 approves architectural intent"},
    "G3_PLAN":   {"owner": "team_10",  "engine": "cursor",  "desc": "Build work plan from approved spec"},
    "G3_5":      {"owner": "team_90",  "engine": "codex",   "desc": "Team 90 validates work plan"},
    "G3_6_MANDATES": {"owner": "team_10", "engine": "orchestrator", "desc": "Generate per-team mandates (deterministic)"},
    "CURSOR_IMPLEMENTATION": {"owner": "teams_20_30", "engine": "cursor", "desc": "Cursor Composer: implement + MCP test"},
    "GATE_4":    {"owner": "team_10",  "engine": "cursor",  "desc": "QA — Team 10 coordinates, Team 50 executes tests + MCP"},
    "GATE_5":    {"owner": "team_90",  "engine": "codex",   "desc": "Team 90 dev validation (code vs spec)"},
    "GATE_6":    {"owner": "team_90",  "engine": "codex",   "desc": "Team 90 executes; Team 100 approval authority"},
    "GATE_7":    {"owner": "team_90",  "engine": "human",   "desc": "Team 90 executes; Nimrod (Team 00) human authority"},
    "GATE_8":    {"owner": "team_90",  "engine": "codex",   "desc": "Team 90 + Team 70 documentation closure"},
}


def _log(msg: str):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}")


def _save_prompt(filename: str, content: str) -> Path:
    prompts_dir = AGENTS_OS_OUTPUT_DIR / "prompts"
    prompts_dir.mkdir(parents=True, exist_ok=True)
    path = prompts_dir / filename
    path.write_text(content, encoding="utf-8")
    return path


def show_status():
    state = PipelineState.load()
    print(f"═══════════════════════════════════════")
    print(f"  Pipeline Status")
    print(f"═══════════════════════════════════════")
    print(f"  Spec:       {state.spec_brief[:80]}{'...' if len(state.spec_brief) > 80 else ''}")
    print(f"  Stage:      {state.stage_id}")
    print(f"  WP:         {state.work_package_id}")
    print(f"  Current:    {state.current_gate}")
    print(f"  Completed:  {', '.join(state.gates_completed) or 'none'}")
    print(f"  Failed:     {', '.join(state.gates_failed) or 'none'}")
    print(f"  Started:    {state.started_at or 'not started'}")
    print(f"  Updated:    {state.last_updated or 'never'}")
    print(f"═══════════════════════════════════════")

    if state.current_gate in GATE_CONFIG:
        cfg = GATE_CONFIG[state.current_gate]
        print(f"\n  Next action: {cfg['desc']}")
        print(f"  Owner:       {cfg['owner']}")
        print(f"  Engine:      {cfg['engine']}")
        print(f"\n  Run: python3 -m agents_os_v2.orchestrator.pipeline --generate-prompt {state.current_gate}")


def show_next(state: PipelineState | None = None):
    if state is None:
        state = PipelineState.load()
    gate = state.current_gate
    if gate not in GATE_CONFIG:
        print(f"Pipeline not active or complete. Current: {gate}")
        return

    cfg = GATE_CONFIG[gate]
    print(f"\n╔══════════════════════════════════════════════════════════╗")
    print(f"║  NEXT: {gate:<20} ({cfg['desc'][:35]})")
    print(f"║  Owner: {cfg['owner']:<15}  Engine: {cfg['engine']}")
    print(f"╠══════════════════════════════════════════════════════════╣")

    if cfg["engine"] == "codex":
        print(f"║  → Open Codex session for {cfg['owner']}")
        print(f"║  → Paste prompt from: agents_os_v2 --generate-prompt {gate}")
    elif cfg["engine"] == "claude":
        print(f"║  → Open Claude Code session")
        print(f"║  → Paste prompt from: agents_os_v2 --generate-prompt {gate}")
    elif cfg["engine"] == "cursor":
        print(f"║  → Open Cursor Composer session")
        print(f"║  → Paste prompt from: agents_os_v2 --generate-prompt {gate}")
    elif cfg["engine"] == "human":
        print(f"║  → YOU review the application UX")
    elif cfg["engine"] == "orchestrator":
        print(f"║  → Run: agents_os_v2 --generate-prompt {gate}")
        print(f"║    (deterministic — generates mandates automatically)")

    print(f"║")
    print(f"║  After completion:")
    print(f"║  → agents_os_v2 --advance {gate} PASS")
    print(f"║    (or FAIL with --reason)")
    print(f"╚══════════════════════════════════════════════════════════╝")


def generate_prompt(gate_id: str):
    state = PipelineState.load()

    if gate_id == "GATE_0":
        prompt = _generate_gate_0_prompt(state)
    elif gate_id == "GATE_1":
        prompt = _generate_gate_1_prompt(state)
    elif gate_id == "GATE_2":
        prompt = _generate_gate_2_prompt(state)
    elif gate_id == "G3_PLAN":
        prompt = _generate_g3_plan_prompt(state)
    elif gate_id == "G3_5":
        prompt = _generate_g3_5_prompt(state)
    elif gate_id == "G3_6_MANDATES":
        prompt = _generate_mandates(state)
    elif gate_id == "CURSOR_IMPLEMENTATION":
        prompt = _generate_cursor_prompts(state)
    elif gate_id == "GATE_4":
        prompt = _generate_gate_4_prompt(state)
    elif gate_id == "GATE_5":
        prompt = _generate_gate_5_prompt(state)
    elif gate_id == "GATE_6":
        prompt = _generate_gate_6_prompt(state)
    elif gate_id == "GATE_7":
        prompt = _generate_gate_7_prompt(state)
    elif gate_id == "GATE_8":
        prompt = _generate_gate_8_prompt(state)
    else:
        print(f"Unknown gate: {gate_id}")
        return

    path = _save_prompt(f"{gate_id}_prompt.md", prompt)
    _log(f"Prompt saved to: {path}")
    _log(f"Paste into: {GATE_CONFIG.get(gate_id, {}).get('engine', '?')} session")
    print(f"\n{'='*60}\n{prompt[:500]}...\n{'='*60}")
    print(f"\nFull prompt at: {path}")


def _generate_gate_0_prompt(state: PipelineState) -> str:
    identity = load_team_identity("team_190")
    return (
        f"TEAM_190_CONTEXT_RESET – Confirm active stage S002.\n\n"
        f"{identity}\n\n"
        f"---\n\n"
        f"# GATE_0 — Validate Scope\n\n"
        f"Validate the following scope brief for constitutional compliance.\n"
        f"Check: domain isolation, no conflict with active programs, feasibility.\n"
        f"Respond with: PASS or BLOCK + findings.\n\n"
        f"## Scope Brief\n\n{state.spec_brief}\n\n"
        f"## Current State\n\n{build_state_summary()}"
    )


def _generate_gate_1_prompt(state: PipelineState) -> str:
    identity_170 = load_team_identity("team_170")
    identity_190 = load_team_identity("team_190")
    return (
        f"# GATE_1 — Produce and Validate LLD400\n\n"
        f"## Step 1: Team 170 produces LLD400\n\n"
        f"{identity_170}\n\n"
        f"Produce a complete LLD400 spec for:\n{state.spec_brief}\n\n"
        f"Include: endpoint contract, DB contract, UI structural contract, "
        f"DOM anchors, MCP test scenarios, acceptance criteria.\n\n"
        f"## Step 2: Team 190 validates\n\n"
        f"{identity_190}\n\n"
        f"Validate the LLD400 against canonical standards.\n"
        f"Check all mandatory sections, identity headers, gate compliance.\n"
        f"Respond with: PASS or BLOCK + corrections."
    )


def _generate_gate_2_prompt(state: PipelineState) -> str:
    identity = load_team_identity("team_100")
    return (
        f"TEAM_100_CONTEXT_RESET – Load SSM and WSM. Confirm active stage S002.\n\n"
        f"{identity}\n\n"
        f"---\n\n"
        f"# GATE_2 — Approve Architectural Intent\n\n"
        f"Question: Do we approve building this?\n\n"
        f"## Approved Spec (LLD400 from GATE_1)\n\n"
        f"{state.lld400_content[:4000] if state.lld400_content else '[LLD400 not yet produced — paste from GATE_1 output]'}\n\n"
        f"Respond with: APPROVED or REJECTED + reasoning."
    )


def _generate_g3_plan_prompt(state: PipelineState) -> str:
    return (
        f"# Work Plan — Cursor Composer Session\n\n"
        f"You are Team 10 (Gateway). Build a work plan for this spec.\n\n"
        f"## Approved Spec\n\n"
        f"{state.lld400_content[:4000] if state.lld400_content else state.spec_brief}\n\n"
        f"## Required Output\n\n"
        f"1. List of files to create/modify per team:\n"
        f"   - Team 20 (Backend): models, schemas, services, routers, tests\n"
        f"   - Team 30 (Frontend): HTML pages, JS modules, CSS\n"
        f"2. Execution order with dependencies\n"
        f"3. MCP test scenarios for each page/endpoint\n"
        f"4. Acceptance criteria per deliverable"
    )


def _generate_g3_5_prompt(state: PipelineState) -> str:
    identity = load_team_identity("team_90")
    return (
        f"TEAM_90_CONTEXT_RESET\n\n"
        f"{identity}\n\n"
        f"---\n\n"
        f"# G3.5 — Validate Work Plan\n\n"
        f"Validate this work plan for implementation readiness.\n"
        f"Check: completeness, team assignments, deliverables, test coverage.\n"
        f"Respond with: PASS or FAIL + blocking findings.\n\n"
        f"## Work Plan\n\n"
        f"{state.work_plan[:4000] if state.work_plan else '[Paste work plan from G3_PLAN output]'}"
    )


def _generate_mandates(state: PipelineState) -> str:
    """Deterministic mandate generation from work plan."""
    from ..context.injection import load_conventions
    backend_conv = load_conventions("backend")
    frontend_conv = load_conventions("frontend")

    mandates = f"# Implementation Mandates — Generated by V2 Orchestrator\n\n"
    mandates += f"Spec: {state.spec_brief}\n"
    mandates += f"WP: {state.work_package_id}\n\n"

    mandates += f"---\n\n## Team 20 Mandate (Backend — Cursor Composer)\n\n"
    mandates += f"### Context\n{backend_conv[:1000]}\n\n"
    mandates += f"### Task\nImplement backend for: {state.spec_brief}\n\n"
    mandates += f"### From Work Plan\n{state.work_plan[:2000] if state.work_plan else '[work plan]'}\n\n"
    mandates += f"### Acceptance\n- All unit tests pass\n- mypy clean\n- API endpoints return correct responses\n\n"

    mandates += f"---\n\n## Team 30 Mandate (Frontend — Cursor Composer + MCP)\n\n"
    mandates += f"### Context\n{frontend_conv[:1000]}\n\n"
    mandates += f"### Task\nImplement frontend for: {state.spec_brief}\n\n"
    mandates += f"### From Work Plan\n{state.work_plan[:2000] if state.work_plan else '[work plan]'}\n\n"
    mandates += f"### MCP Test Scenarios\n"
    mandates += f"After implementation, test with MCP browser tools:\n"
    mandates += f"1. Navigate to the new page\n"
    mandates += f"2. Verify all UI elements render (browser_snapshot)\n"
    mandates += f"3. Test CRUD operations (create, read, update, delete)\n"
    mandates += f"4. Verify validation (submit empty form, check error states)\n"
    mandates += f"5. Verify data displays correctly after operations\n\n"
    mandates += f"### Acceptance\n- Page renders correctly\n- All CRUD works via UI\n- MCP test scenarios pass\n- Vite build passes\n\n"

    path = _save_prompt("implementation_mandates.md", mandates)
    return mandates


def _generate_cursor_prompts(state: PipelineState) -> str:
    return (
        f"# CURSOR IMPLEMENTATION\n\n"
        f"Open the mandates file and paste each team's mandate into a Cursor Composer session:\n\n"
        f"  File: _COMMUNICATION/agents_os/prompts/implementation_mandates.md\n\n"
        f"1. Open Cursor Composer → paste Team 20 mandate → backend implementation\n"
        f"2. Open Cursor Composer → paste Team 30 mandate → frontend + MCP tests\n\n"
        f"When both are done:\n"
        f"  python3 -m agents_os_v2.orchestrator.pipeline --advance CURSOR_IMPLEMENTATION PASS"
    )


def _generate_gate_4_prompt(state: PipelineState) -> str:
    return (
        f"# GATE_4 — QA (Cursor Composer + MCP)\n\n"
        f"Run comprehensive QA on the implementation:\n\n"
        f"## Automated (terminal)\n"
        f"```bash\n"
        f"python3 -m pytest tests/unit/ -v\n"
        f"python3 -m pytest tests/test_external_data_cache_failover_pytest.py -v\n"
        f"cd ui && npx vite build\n"
        f"```\n\n"
        f"## MCP Browser Tests\n"
        f"Use MCP tools to test the new feature:\n"
        f"1. browser_navigate → login\n"
        f"2. browser_navigate → new page\n"
        f"3. browser_snapshot → verify UI renders\n"
        f"4. Test each CRUD operation via browser_click + browser_type\n"
        f"5. Verify error states (empty form submission)\n"
        f"6. Verify data persistence (create → refresh → verify present)\n\n"
        f"## Evidence\n"
        f"Produce QA report with PASS/FAIL per scenario.\n"
        f"0 SEVERE required for GATE_4 PASS."
    )


def _generate_gate_5_prompt(state: PipelineState) -> str:
    identity = load_team_identity("team_90")
    return (
        f"TEAM_90_CONTEXT_RESET\n\n{identity}\n\n---\n\n"
        f"# GATE_5 — Dev Validation\n\n"
        f"Validate implementation against approved spec.\n\n"
        f"## Check\n"
        f"1. All spec requirements implemented\n"
        f"2. Code follows project conventions (naming, types, patterns)\n"
        f"3. Tests exist and pass\n"
        f"4. No architectural violations\n"
        f"5. GATE_4 QA: PASS\n\n"
        f"## Spec\n{state.lld400_content[:3000] if state.lld400_content else state.spec_brief}\n\n"
        f"Respond with: VALIDATION_RESPONSE — PASS or BLOCKING_REPORT."
    )


def _generate_gate_6_prompt(state: PipelineState) -> str:
    identity = load_team_identity("team_100")
    return (
        f"TEAM_100_CONTEXT_RESET – Load SSM and WSM.\n\n{identity}\n\n---\n\n"
        f"# GATE_6 — Reality vs Intent\n\n"
        f"Does what was built match what we approved at GATE_2?\n\n"
        f"## Approved Spec\n{state.lld400_content[:2000] if state.lld400_content else state.spec_brief}\n\n"
        f"## Implementation Summary\n{', '.join(state.implementation_files[:20]) if state.implementation_files else '[list files created]'}\n\n"
        f"Respond with: APPROVED or REJECTED + rejection route."
    )


def _generate_gate_7_prompt(state: PipelineState) -> str:
    return (
        f"# GATE_7 — Human UX Review\n\n"
        f"**Nimrod — review the application.**\n\n"
        f"Feature: {state.spec_brief}\n\n"
        f"1. Open http://localhost:8080\n"
        f"2. Navigate to the new feature\n"
        f"3. Test the UX — does it feel right?\n"
        f"4. Test edge cases\n\n"
        f"When done:\n"
        f"  --advance GATE_7 PASS    (approve)\n"
        f"  --advance GATE_7 FAIL --reason '...'  (reject)"
    )


def _generate_gate_8_prompt(state: PipelineState) -> str:
    identity_90 = load_team_identity("team_90")
    return (
        f"TEAM_90_CONTEXT_RESET\n\n{identity_90}\n\n---\n\n"
        f"# GATE_8 — Documentation Closure\n\n"
        f"1. Produce AS_MADE_REPORT: what was built, files modified, evidence\n"
        f"2. Verify documentation indexes are consistent\n"
        f"3. Clean communication folders\n"
        f"4. Confirm lifecycle complete\n\n"
        f"Feature: {state.spec_brief}\n"
        f"Files: {', '.join(state.implementation_files[:20]) if state.implementation_files else '[list from implementation]'}"
    )


def start_pipeline(spec: str, stage: str = "S002"):
    state = PipelineState(
        spec_brief=spec,
        stage_id=stage,
        current_gate="GATE_0",
        started_at=datetime.now(timezone.utc).isoformat(),
    )
    state.save()
    _log(f"Pipeline started: {spec[:80]}")
    _log(f"Stage: {stage}")
    show_next(state)


def advance_gate(gate_id: str, status: str, reason: str = ""):
    state = PipelineState.load()

    if status == "PASS":
        state.gates_completed.append(gate_id)
        idx = GATE_SEQUENCE.index(gate_id) if gate_id in GATE_SEQUENCE else -1
        if idx >= 0 and idx + 1 < len(GATE_SEQUENCE):
            state.current_gate = GATE_SEQUENCE[idx + 1]
        else:
            state.current_gate = "COMPLETE"
    else:
        state.gates_failed.append(gate_id)
        _log(f"GATE {gate_id} FAILED: {reason}")

    state.save()
    _log(f"{gate_id}: {status}")

    if state.current_gate == "COMPLETE":
        _log("")
        _log("╔══════════════════════════════════════════════════════════╗")
        _log("║  ✅ LIFECYCLE COMPLETE                                   ║")
        _log(f"║  Spec: {state.spec_brief[:45]:<45}  ║")
        _log("╚══════════════════════════════════════════════════════════╝")
    else:
        show_next(state)


def main():
    parser = argparse.ArgumentParser(description="Agents_OS V2 Pipeline — Team 10 Orchestrator")
    parser.add_argument("--spec", type=str, help="Start pipeline with spec brief")
    parser.add_argument("--status", action="store_true", help="Show pipeline status")
    parser.add_argument("--next", action="store_true", help="Show next action")
    parser.add_argument("--advance", nargs=2, metavar=("GATE", "STATUS"), help="Advance gate: GATE_X PASS|FAIL")
    parser.add_argument("--reason", type=str, default="", help="Failure reason")
    parser.add_argument("--generate-prompt", type=str, metavar="GATE", help="Generate prompt for gate")
    parser.add_argument("--stage", type=str, default="S002", help="Stage ID")
    args = parser.parse_args()

    if args.status:
        show_status()
    elif args.next:
        show_next()
    elif args.spec:
        start_pipeline(args.spec, args.stage)
    elif args.advance:
        advance_gate(args.advance[0], args.advance[1], args.reason)
    elif args.generate_prompt:
        generate_prompt(args.generate_prompt)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
