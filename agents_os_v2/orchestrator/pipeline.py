"""
Agents_OS V2 — Pipeline Orchestrator
Main CLI entry point. Runs full gate flow: GATE_0 → GATE_8.

Usage:
  python3 -m agents_os_v2.orchestrator.pipeline --spec "Add CRUD for strategies"
  python3 -m agents_os_v2.orchestrator.pipeline --continue
  python3 -m agents_os_v2.orchestrator.pipeline --approve gate7
  python3 -m agents_os_v2.orchestrator.pipeline --status
"""

import asyncio
import argparse
import sys
import json
from pathlib import Path
from datetime import datetime, timezone

from .state import PipelineState
from ..config import AGENTS_OS_OUTPUT_DIR, OPENAI_API_KEY, GEMINI_API_KEY
from ..engines.openai_engine import OpenAIEngine
from ..engines.gemini_engine import GeminiEngine
from ..engines.claude_engine import ClaudeEngine
from ..engines.cursor_engine import CursorEngine

from ..conversations.gate_0_spec_arc import run_gate_0
from ..conversations.gate_1_spec_lock import run_gate_1_produce, run_gate_1_validate
from ..conversations.gate_2_intent import run_gate_2
from ..conversations.gate_3_implementation import run_g35_work_plan_validation, run_g36_build_mandates
from ..conversations.gate_4_qa import run_gate_4
from ..conversations.gate_5_dev_validation import run_gate_5
from ..conversations.gate_6_arch_validation import run_gate_6
from ..conversations.gate_7_human_approval import run_gate_7
from ..conversations.gate_8_doc_closure import run_gate_8


def _get_engines():
    return {
        "openai": OpenAIEngine() if OPENAI_API_KEY else None,
        "gemini": GeminiEngine() if GEMINI_API_KEY else None,
        "claude": ClaudeEngine(),
        "cursor": CursorEngine(),
    }


def _log(msg: str):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}")


async def run_full_pipeline(spec_brief: str, stage_id: str = "S002"):
    engines = _get_engines()
    state = PipelineState(
        spec_brief=spec_brief,
        stage_id=stage_id,
        started_at=datetime.now(timezone.utc).isoformat(),
    )
    state.save()

    engine_openai = engines["openai"]
    engine_gemini = engines["gemini"]
    engine_claude = engines["claude"]
    engine_cursor = engines["cursor"]

    if not engine_openai:
        _log("ERROR: OPENAI_API_KEY not set. Cannot run pipeline.")
        return
    if not engine_gemini:
        _log("ERROR: GEMINI_API_KEY not set. Cannot run pipeline.")
        return

    # ═══════════════════════════════════════
    # PHASE A — SPEC (Team 190 manages flow)
    # ═══════════════════════════════════════

    _log("═══ PHASE A: SPEC ═══")

    # GATE_0
    _log("GATE_0: Team 190 validating scope...")
    g0 = await run_gate_0(engine_openai, spec_brief, stage_id)
    state.advance_gate("GATE_0", g0.status)
    _log(f"GATE_0: {g0.status} — {g0.message[:100]}")
    if g0.status != "PASS":
        _log(f"GATE_0 FAILED. Pipeline stopped.\n{g0.message}")
        return

    # GATE_1 — produce + validate
    _log("GATE_1: Team 170 producing LLD400...")
    g1_prod = await run_gate_1_produce(engine_gemini, spec_brief, g0.message, stage_id)
    state.lld400_content = g1_prod.engine_response or ""
    _log(f"GATE_1 production: {g1_prod.status}")

    _log("GATE_1: Team 190 validating LLD400...")
    g1_val = await run_gate_1_validate(engine_openai, state.lld400_content, stage_id)
    state.advance_gate("GATE_1", g1_val.status)
    _log(f"GATE_1: {g1_val.status} — {g1_val.message[:100]}")
    if g1_val.status != "PASS":
        _log(f"GATE_1 FAILED. Pipeline stopped.\n{g1_val.message}")
        return

    # GATE_2
    _log("GATE_2: Team 100 approving intent...")
    g2 = await run_gate_2(engine_claude, state.lld400_content, stage_id)
    state.advance_gate("GATE_2", g2.status)
    _log(f"GATE_2: {g2.status} — {g2.message[:100]}")
    if g2.status != "PASS":
        _log(f"GATE_2 FAILED. Pipeline stopped.\n{g2.message}")
        return

    # ═══════════════════════════════════════
    # PHASE B — IMPLEMENTATION (Team 10)
    # ═══════════════════════════════════════

    _log("═══ PHASE B: IMPLEMENTATION ═══")

    # Build work plan
    _log("GATE_3: Team 10 building work plan...")
    g3_plan = await run_g36_build_mandates(engine_gemini, state.lld400_content, "", state.work_package_id, stage_id)
    state.work_plan = g3_plan.engine_response or ""

    # G3.5 — validate work plan
    _log("G3.5: Team 90 validating work plan...")
    g35 = await run_g35_work_plan_validation(engine_openai, state.work_plan, state.work_package_id, stage_id)
    state.advance_gate("GATE_3_G35", g35.status)
    _log(f"G3.5: {g35.status} — {g35.message[:100]}")
    if g35.status != "PASS":
        _log(f"G3.5 FAILED. Pipeline stopped.\n{g35.message}")
        return

    # G3.6 — build mandates
    _log("G3.6: Building team mandates...")
    g36 = await run_g36_build_mandates(engine_gemini, state.lld400_content, state.work_plan, state.work_package_id, stage_id)
    state.mandates = g36.engine_response or ""
    state.advance_gate("GATE_3_G36", g36.status)

    # Save mandates to files
    mandates_dir = AGENTS_OS_OUTPUT_DIR / "prompts"
    mandates_dir.mkdir(parents=True, exist_ok=True)
    mandates_file = mandates_dir / "implementation_mandates.md"
    mandates_file.write_text(state.mandates, encoding="utf-8")

    _log(f"")
    _log(f"╔══════════════════════════════════════════════════════════╗")
    _log(f"║  PAUSE — Cursor Implementation Required                  ║")
    _log(f"║                                                          ║")
    _log(f"║  Mandates saved to:                                      ║")
    _log(f"║    {mandates_file}  ║")
    _log(f"║                                                          ║")
    _log(f"║  1. Open the mandates file                               ║")
    _log(f"║  2. Paste Team 20 mandate into Cursor (Backend)          ║")
    _log(f"║  3. Paste Team 30 mandate into Cursor (Frontend)         ║")
    _log(f"║  4. When done, run:                                      ║")
    _log(f"║     python3 -m agents_os_v2.orchestrator.pipeline \\      ║")
    _log(f"║       --continue                                         ║")
    _log(f"╚══════════════════════════════════════════════════════════╝")

    state.current_gate = "WAITING_FOR_CURSOR"
    state.save()


async def continue_pipeline():
    """Continue after Cursor implementation (GATE_4 → GATE_8)."""
    engines = _get_engines()
    state = PipelineState.load()

    engine_openai = engines["openai"]
    engine_gemini = engines["gemini"]
    engine_claude = engines["claude"]

    if not engine_openai or not engine_gemini:
        _log("ERROR: API keys not set.")
        return

    # ═══════════════════════════════════════
    # GATE_4 — QA
    # ═══════════════════════════════════════

    _log("GATE_4: Running QA checks...")
    g4 = await run_gate_4()
    state.advance_gate("GATE_4", g4.status)
    _log(f"GATE_4: {g4.status} — {g4.message}")
    if g4.status != "PASS":
        _log(f"GATE_4 FAILED.\n{json.dumps(g4.findings, indent=2)}")
        return

    # ═══════════════════════════════════════
    # PHASE C — VALIDATION (Team 90)
    # ═══════════════════════════════════════

    _log("═══ PHASE C: VALIDATION ═══")

    # GATE_5
    _log("GATE_5: Team 90 validating implementation...")
    g5 = await run_gate_5(
        engine_openai,
        state.lld400_content,
        state.implementation_files,
        state.implementation_endpoints,
        state.work_package_id,
        state.stage_id,
    )
    state.advance_gate("GATE_5", g5.status)
    _log(f"GATE_5: {g5.status} — {g5.message[:100]}")
    if g5.status != "PASS":
        _log(f"GATE_5 FAILED.\n{g5.message}")
        return

    # GATE_6
    _log("GATE_6: Team 100 verifying reality vs intent...")
    impl_summary = f"Files: {', '.join(state.implementation_files[:10])}"
    g6 = await run_gate_6(engine_claude, state.lld400_content, impl_summary, state.work_package_id, state.stage_id)
    state.advance_gate("GATE_6", g6.status)
    _log(f"GATE_6: {g6.status} — {g6.message[:100]}")
    if g6.status != "PASS":
        _log(f"GATE_6 FAILED.\n{g6.message}")
        return

    # GATE_7
    _log("GATE_7: Human UX review required...")
    g7 = await run_gate_7(state.work_package_id, f"Implementation complete. {len(state.implementation_files)} files. Please review UX.")
    state.advance_gate("GATE_7", g7.status)
    _log(f"GATE_7: {g7.message}")
    _log(f"")
    _log(f"╔══════════════════════════════════════════════════════════╗")
    _log(f"║  GATE_7 — Review the application UX                     ║")
    _log(f"║  Then run:                                               ║")
    _log(f"║    --approve gate7    (to approve)                       ║")
    _log(f"║    --reject gate7     (to reject)                        ║")
    _log(f"╚══════════════════════════════════════════════════════════╝")
    state.save()


async def approve_gate7():
    engines = _get_engines()
    state = PipelineState.load()
    engine_openai = engines["openai"]
    engine_gemini = engines["gemini"]

    if not engine_openai or not engine_gemini:
        _log("ERROR: API keys not set.")
        return

    _log("GATE_7: APPROVED by human.")
    state.advance_gate("GATE_7", "PASS")

    _log("GATE_8: Documentation closure...")
    g8 = await run_gate_8(engine_openai, engine_gemini, state.work_package_id, state.stage_id)
    state.advance_gate("GATE_8", g8.status)
    _log(f"GATE_8: {g8.status} — {g8.message}")

    if g8.status == "PASS":
        _log("")
        _log("╔══════════════════════════════════════════════════════════╗")
        _log("║  ✅ LIFECYCLE COMPLETE                                   ║")
        _log(f"║  Work Package: {state.work_package_id:<39}║")
        _log(f"║  Gates passed: {', '.join(state.gates_completed)}")
        _log("╚══════════════════════════════════════════════════════════╝")


def show_status():
    state = PipelineState.load()
    print(f"Current gate: {state.current_gate}")
    print(f"Gates completed: {', '.join(state.gates_completed) or 'none'}")
    print(f"Gates failed: {', '.join(state.gates_failed) or 'none'}")
    print(f"Work Package: {state.work_package_id}")
    print(f"Stage: {state.stage_id}")
    print(f"Started: {state.started_at or 'not started'}")
    print(f"Last updated: {state.last_updated or 'never'}")


def main():
    parser = argparse.ArgumentParser(description="Agents_OS V2 Pipeline Orchestrator")
    parser.add_argument("--spec", type=str, help="Spec brief to start full pipeline")
    parser.add_argument("--continue", dest="continue_pipeline", action="store_true", help="Continue after Cursor implementation")
    parser.add_argument("--approve", type=str, help="Approve a gate (e.g., gate7)")
    parser.add_argument("--reject", type=str, help="Reject a gate (e.g., gate7)")
    parser.add_argument("--reason", type=str, default="", help="Rejection reason")
    parser.add_argument("--status", action="store_true", help="Show pipeline status")
    parser.add_argument("--stage", type=str, default="S002", help="Stage ID (default: S002)")

    args = parser.parse_args()

    if args.status:
        show_status()
    elif args.spec:
        asyncio.run(run_full_pipeline(args.spec, args.stage))
    elif args.continue_pipeline:
        asyncio.run(continue_pipeline())
    elif args.approve == "gate7":
        asyncio.run(approve_gate7())
    elif args.reject:
        state = PipelineState.load()
        state.advance_gate(f"GATE_7", "FAIL")
        _log(f"GATE_7: REJECTED. Reason: {args.reason}")
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
