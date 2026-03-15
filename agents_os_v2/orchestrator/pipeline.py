from __future__ import annotations
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
from .gate_router import run_data_model_checks
from ..config import REPO_ROOT, AGENTS_OS_OUTPUT_DIR, DOMAIN_GATE_OWNERS
from ..context.injection import (
    build_full_agent_prompt,
    build_canonical_message,
    build_state_summary,
    load_team_identity,
)
GATE_SEQUENCE = [
    "GATE_0", "GATE_1", "GATE_2", "WAITING_GATE2_APPROVAL",
    "G3_PLAN", "G3_5", "G3_6_MANDATES",
    "CURSOR_IMPLEMENTATION",
    "GATE_4", "GATE_5", "GATE_6", "WAITING_GATE6_APPROVAL",
    "GATE_7", "GATE_8",
]

GATE_CONFIG = {
    "GATE_0":    {"owner": "team_190", "engine": "codex",        "desc": "Team 190 validates LOD200 scope",                        "default_fail_route": "doc"},
    "GATE_1":    {"owner": "team_190", "engine": "codex",        "desc": "Team 170 produces LLD400 → Team 190 validates",          "default_fail_route": "doc"},
    "GATE_2":    {"owner": "team_100", "engine": "codex+human",  "desc": "Architectural intent review → WAITING_GATE2_APPROVAL (domain-aware owner)"},
    "WAITING_GATE2_APPROVAL": {"owner": "team_00", "engine": "human", "desc": "Nimrod reviews GATE_2 analysis and decides"},
    "G3_PLAN":   {"owner": "team_10",  "engine": "cursor",       "desc": "Build work plan from approved spec"},
    "G3_5":      {"owner": "team_90",  "engine": "codex",        "desc": "Team 90 validates work plan"},
    "G3_6_MANDATES": {"owner": "team_10", "engine": "orchestrator", "desc": "Generate per-team mandates (deterministic)"},
    "CURSOR_IMPLEMENTATION": {"owner": "teams_20_30", "engine": "cursor", "desc": "Cursor Composer: implement + MCP test"},
    "GATE_4":    {"owner": "team_10",  "engine": "cursor",       "desc": "QA — Team 10 coordinates, Team 50 executes tests + MCP"},
    "GATE_5":    {"owner": "team_90",  "engine": "codex",        "desc": "Team 90 dev validation (code vs spec)"},
    "G5_DOC_FIX": {
        "owner": "team_10", "engine": "cursor",
        "desc": "Admin block — Team 10 fixes doc/artifact gaps from GATE_5 → direct re-validation (no GATE_4, no impl teams)",
    },
    "GATE_6":    {"owner": "team_100", "engine": "codex+human",  "desc": "Architectural reality review → WAITING_GATE6_APPROVAL (domain-aware owner)"},
    "WAITING_GATE6_APPROVAL": {"owner": "team_00", "engine": "human", "desc": "Nimrod reviews GATE_6 analysis and decides"},
    "GATE_7":    {"owner": "team_90",  "engine": "human",        "desc": "Team 90 executes; Nimrod (Team 00) human authority"},
    "GATE_8":    {"owner": "team_90",  "engine": "codex",        "desc": "Team 90 + Team 70 documentation closure",               "default_fail_route": "doc"},
    "WAITING_FOR_IMPLEMENTATION_COMMIT": {
        "owner": "team_61", "engine": "cursor",
        "desc": "No commits detected — Team 61 must commit implementation first"
    },
}

# ── Fail routing table ─────────────────────────────────────────────────────
# For every decision gate: where does the pipeline go after a FAIL?
#
#   "doc"  → Documentation / governance / artifact issues ONLY.
#            No code changes needed. Team 10 fixes specific files/paths/evidence.
#
#            GATE_5 "doc" → G5_DOC_FIX (Team 10 doc-fix sprint) → GATE_5
#            ⚠️  NEVER routes to CURSOR_IMPLEMENTATION — that activates impl teams.
#            ⚠️  NEVER routes to GATE_4 — that's a full QA re-run cycle.
#
#   "full" → Substantial code or design issues (or unclear/mixed).
#            Full cycle: return to G3_PLAN for new plan → mandates → implementation.
#
# Format: { gate_id: { route_type: (target_gate, human_description) } }
FAIL_ROUTING: dict[str, dict[str, tuple[str, str]]] = {
    "GATE_0": {
        "doc":  ("GATE_0",  "Scope wording/doc issue — fix brief and re-validate"),
        "full": ("GATE_0",  "Scope rejected — revise brief fundamentally and re-validate"),
    },
    "GATE_1": {
        "doc":  ("GATE_1",  "LLD400 governance/header issues — Team 170 fixes and re-validates"),
        "full": ("GATE_1",  "LLD400 rejected — Team 170 rewrites spec from scratch"),
    },
    "GATE_2": {
        "doc":  ("GATE_1",  "Team 100 found doc gaps in spec — Team 170 revises"),
        "full": ("GATE_1",  "Team 100 rejected spec — major revision required"),
    },
    "WAITING_GATE2_APPROVAL": {
        "doc":  ("GATE_1",  "Nimrod: minor doc issue in spec — Team 170 revises"),
        "full": ("GATE_1",  "Nimrod rejected spec — full revision, re-validate"),
    },
    "G3_5": {
        "doc":  ("G3_PLAN", "Work plan governance/format issues — Team 10 revises plan"),
        "full": ("G3_PLAN", "Work plan rejected — Team 10 full rewrite of plan"),
    },
    "GATE_4": {
        "doc":  ("CURSOR_IMPLEMENTATION", "QA: doc/governance issues only — Team 10 fixes files, re-commit, re-QA"),
        "full": ("G3_6_MANDATES",         "QA: code failures — new mandates, full re-implementation, re-QA"),
    },
    "GATE_5": {
        # ⚠️ "doc" route: admin/artifact block — Team 10 fixes docs DIRECTLY → back to GATE_5
        # NO CURSOR_IMPLEMENTATION, NO mandates, NO Teams 20/30 activation.
        "doc":  ("G5_DOC_FIX", "Admin block (doc/artifact only) — Team 10 fixes → GATE_5 direct re-validation"),
        "full": ("G3_PLAN",    "Code/design issues — full re-plan → mandates → impl → QA → GATE_5"),
    },
    "G5_DOC_FIX": {
        # After Team 10 iterates on the doc fix: re-validate at GATE_5 (PASS → GATE_5).
        # If doc fix reveals code issues, escalate to full cycle.
        "doc":  ("G5_DOC_FIX", "Still doc gaps — Team 10 iterates doc fix"),
        "full": ("G3_PLAN",    "Doc fix revealed code issues — escalate to full cycle"),
    },
    "GATE_6": {
        "doc":  ("CURSOR_IMPLEMENTATION", "Team 100: minor code gaps — Team 10 fixes → re-validate"),
        "full": ("G3_PLAN",               "Team 100: major intent gap — full re-implementation required"),
    },
    "WAITING_GATE6_APPROVAL": {
        "doc":  ("CURSOR_IMPLEMENTATION", "Nimrod: minor issues found — Team 10 fixes → re-validate"),
        "full": ("G3_PLAN",               "Nimrod rejected — full re-implementation cycle required"),
    },
    "GATE_7": {
        "doc":  ("CURSOR_IMPLEMENTATION", "UX issues (UI/wording) — Team 10/30 fixes → re-review"),
        "full": ("G3_PLAN",               "Major UX redesign — full re-plan and implementation cycle"),
    },
    "GATE_8": {
        "doc":  ("GATE_8",  "Doc incomplete — Team 70 revises and re-runs GATE_8"),
        "full": ("GATE_8",  "Doc rejected — Team 70 full rewrite of documentation closure"),
    },
}


def _domain_gate_owner(gate_id: str, domain: str) -> str | None:
    """Return domain-specific gate owner override, or None to use GATE_CONFIG default.

    TikTrack:  GATE_2 + GATE_6 → team_00  (Chief Architect)
    AgentsOS:  GATE_2 + GATE_6 → team_100 (Strategic Reviewer)
    """
    return DOMAIN_GATE_OWNERS.get(domain, {}).get(gate_id)


def _log(msg: str):
    ts = datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] {msg}")


def _save_prompt(filename: str, content: str) -> Path:
    prompts_dir = AGENTS_OS_OUTPUT_DIR / "prompts"
    prompts_dir.mkdir(parents=True, exist_ok=True)
    path = prompts_dir / filename
    path.write_text(content, encoding="utf-8")
    return path


# ════════════════════════════════════════════════════════════════════════════
#  GENERIC MANDATE ENGINE
#  Reusable by any gate (G3_6_MANDATES, GATE_8, future gates).
#  Each MandateStep describes one team's work, its phase, dependencies,
#  and coordination data sources (auto-injected from prior team output files).
# ════════════════════════════════════════════════════════════════════════════

# Per-gate mandate filenames (saved under _COMMUNICATION/agents_os/prompts/)
GATE_MANDATE_FILES: dict = {
    "GATE_1":        "GATE_1_mandates.md",          # Phase 1: Team 170 (spec) | Phase 2: Team 190 (validate)
    "G3_6_MANDATES": "implementation_mandates.md",
    "GATE_8":        "gate_8_mandates.md",
}


class MandateStep:
    """One team's mandate within a multi-team gate execution.

    Attributes:
        team_id:     "team_20", "team_70", etc.
        label:       Display label, e.g. "Team 20 — API Verification"
        phase:       Execution phase (1 = first). Steps in the same phase run in parallel.
        task:        Full task description (markdown, multi-line).
        writes_to:   Canonical output path — what this team produces.
        reads_from:  List of file paths to search for coordination data.
        reads_label: Human-readable description of what to look for.
        depends_on:  List of team_ids whose phase must complete first.
        acceptance:  List of acceptance criteria strings.
        extra:       Additional context injected at the end (conventions, iron rules, etc.).
    """
    __slots__ = ("team_id","label","phase","task","writes_to",
                 "reads_from","reads_label","depends_on","acceptance","extra")

    def __init__(
        self,
        team_id:     str,
        label:       str,
        phase:       int,
        task:        str,
        writes_to:   str  = "",
        reads_from:  list = None,
        reads_label: str  = "",
        depends_on:  list = None,
        acceptance:  list = None,
        extra:       str  = "",
    ):
        self.team_id     = team_id
        self.label       = label
        self.phase       = phase
        self.task        = task
        self.writes_to   = writes_to
        self.reads_from  = reads_from  or []
        self.reads_label = reads_label
        self.depends_on  = depends_on  or []
        self.acceptance  = acceptance  or []
        self.extra       = extra


def _read_coordination_file(paths: list, repo_root: Path) -> tuple:
    """Search file paths for coordination data, auto-globbing the team folder as fallback.

    Returns (content_str, found_path_str) or ("", "") if not found.
    Multi-level search mirrors the JS autoLoadVerdictFile approach:
      1. Try each explicit candidate path.
      2. Glob the team folder for any file matching the WP pattern.
    """
    import re

    for raw_path in paths:
        full = repo_root / raw_path.lstrip("/")
        if full.is_file():
            text = full.read_text(encoding="utf-8").strip()
            if text:
                return text, raw_path

    # ── Fallback glob: extract team folder + WP pattern from first candidate ─
    if paths:
        team_match = re.search(r'(_COMMUNICATION/team_\d+)', paths[0])
        wp_match   = re.search(r'(S\d{3}[_-]P\d{3}[_-]WP\d{3})', paths[0])
        if team_match and wp_match:
            folder  = repo_root / team_match.group(1).lstrip("/")
            wp_pat  = wp_match.group(1).replace("-", "_").lower()
            wp_alt  = wp_match.group(1).lower()
            if folder.is_dir():
                for f in sorted(folder.iterdir()):
                    fname_l = f.name.lower()
                    if (wp_pat in fname_l or wp_alt in fname_l) and f.suffix in (".md", ".txt"):
                        text = f.read_text(encoding="utf-8").strip()
                        if text:
                            rel = str(f.relative_to(repo_root))
                            return text, rel

    return "", ""


def _generate_mandate_doc(
    steps:   list,
    state:   "PipelineState",
    gate:    str = "",
    preamble: str = "",
) -> str:
    """Generic mandate document generator.

    Produces:
      1. Header (gate, WP, spec)
      2. EXECUTION ORDER block — phases, parallel/sequential notation,
         dependency arrows between phases
      3. Per-team sections — task, coordination data (auto-injected or
         guided placeholder), output path, acceptance criteria

    Args:
        steps:    list[MandateStep] — all teams for this gate, in phase order.
        state:    PipelineState — for WP, spec_brief, domain context.
        gate:     Gate identifier shown in header.
        preamble: Optional block inserted after header (e.g. full work plan).
    """
    SEP   = "─" * 60
    SEP_H = "═" * 60
    wp    = state.work_package_id

    # ── 1. Execution order block ─────────────────────────────────────────────
    phases: dict = {}
    for s in steps:
        phases.setdefault(s.phase, []).append(s)

    order_lines = []
    for phase_num in sorted(phases.keys()):
        phase_steps = phases[phase_num]
        # Label: short team name (before the em-dash)
        def _short(label: str) -> str:
            return label.split("—")[0].strip()

        if len(phase_steps) == 1:
            order_lines.append(
                f"  Phase {phase_num}:  {_short(phase_steps[0].label)}"
                f"   ← runs alone"
            )
        else:
            names = "  ‖  ".join(_short(s.label) for s in phase_steps)
            order_lines.append(
                f"  Phase {phase_num}:  {names}"
                f"   ← PARALLEL (start simultaneously)"
            )
        # Dependency arrow to next phase
        if phase_num < max(phases.keys()):
            next_phase   = phase_num + 1
            next_steps   = phases.get(next_phase, [])
            order_lines.append(
                f"             ↓  Phase {next_phase} starts ONLY after Phase {phase_num} completes"
            )
            order_lines.append(
                f"             💻  Phase {phase_num} done?  →  ./pipeline_run.sh phase{next_phase}"
            )
            # Coordination note: which teams provide data to which
            for ns in next_steps:
                if ns.reads_from and ns.depends_on:
                    dep_labels = [_short(s.label) for s in steps if s.team_id in ns.depends_on]
                    if dep_labels:
                        order_lines.append(
                            f"             📄 {_short(ns.label)} reads coordination data"
                            f" from {' + '.join(dep_labels)}"
                        )
        order_lines.append("")

    order_block = "\n".join(order_lines).rstrip()

    # ── 2. Per-team sections ─────────────────────────────────────────────────
    sections = []
    for step in steps:

        # Prerequisite banner
        if step.depends_on:
            dep_labels = [
                _short(s.label) for s in steps if s.team_id in step.depends_on
            ]
            dep_str  = " + ".join(dep_labels or step.depends_on)
            prereq   = (
                f"⚠️  PREREQUISITE: **{dep_str}** must be COMPLETE before starting "
                f"this mandate.\n\n"
            )
        else:
            prereq = ""

        # Coordination data injection
        coord_block = ""
        if step.reads_from:
            content, found_path = _read_coordination_file(step.reads_from, REPO_ROOT)
            lbl = step.reads_label or "coordination data from prior team"
            if content:
                preview = content[:1500]
                coord_block = (
                    f"### Coordination Data — {lbl}\n\n"
                    f"✅  Auto-loaded: `{found_path}`\n\n"
                    f"```\n{preview}\n```\n"
                    + ("_[… content truncated at 1500 chars]_\n" if len(content) > 1500 else "")
                )
            else:
                paths_str = "\n".join(f"  - `{p}`" for p in step.reads_from[:6])
                coord_block = (
                    f"### Coordination Data — {lbl}\n\n"
                    f"⚠️  File not yet available. Searched (in order):\n{paths_str}\n\n"
                    f"→ Complete the prerequisite team's work first.\n"
                    f"→ Re-generate after: `./pipeline_run.sh` injects real data.\n"
                )

        # Output path note
        writes_note = (
            f"\n**Output — write to:**\n`{step.writes_to}`\n"
            if step.writes_to else ""
        )

        # Acceptance
        accept_str = (
            "\n".join(f"- {a}" for a in step.acceptance)
            if step.acceptance else "- Complete all tasks above"
        )

        body = (
            f"## {step.label} (Phase {step.phase})\n\n"
            f"{prereq}"
            f"{step.task}\n"
            f"{writes_note}"
        )
        if coord_block:
            body += f"\n{coord_block}\n"
        if step.extra:
            body += f"\n### Additional Context\n{step.extra}\n"
        body += f"\n### Acceptance\n{accept_str}\n"

        sections.append(body)

    # Phase-aware section join: insert a visible transition command between phase boundaries
    sep_normal = "\n" + SEP + "\n\n"
    parts: list[str] = []
    for i, (step, body) in enumerate(zip(steps, sections)):
        parts.append(body)
        if i < len(steps) - 1:
            next_step = steps[i + 1]
            if next_step.phase > step.phase:
                next_ph = next_step.phase
                parts.append(
                    f"\n{SEP}\n"
                    f"  ✅  Phase {step.phase} complete?\n"
                    f"  →  Run in terminal:  ./pipeline_run.sh phase{next_ph}\n"
                    f"     Regenerates mandates with Phase {step.phase} output injected\n"
                    f"     + displays Phase {next_ph} section ready to copy.\n"
                    f"{SEP}\n\n"
                )
            else:
                parts.append(sep_normal)
    sections_text = "".join(parts)

    # ── 3. Assemble final document ────────────────────────────────────────────
    gate_label = f"  ·  {gate}" if gate else ""
    header = (
        f"# Mandates — {wp}{gate_label}\n\n"
        f"**Spec:** {state.spec_brief}\n\n"
        f"{SEP_H}\n"
        f"  EXECUTION ORDER\n"
        f"{SEP_H}\n\n"
        f"{order_block}\n\n"
        f"{SEP_H}\n\n"
    )
    preamble_block = f"{preamble}\n\n{SEP}\n\n" if preamble else ""

    return header + preamble_block + sections_text


def _print_human_approval_prompt(gate_name: str, analysis: str, summary: str):
    print(f"\n╔══════════════════════════════════════════════════════════╗")
    print(f"║  🛑 HUMAN APPROVAL REQUIRED — {gate_name:<24}  ║")
    print(f"╠══════════════════════════════════════════════════════════╣")
    print(f"║  Team 100 Analysis:")
    for line in analysis[:500].split("\n"):
        print(f"║    {line}")
    print(f"║")
    print(f"║  Summary: {summary[:60]}")
    print(f"╠══════════════════════════════════════════════════════════╣")
    print(f"║  Actions:")
    print(f"║    --approve {gate_name}              → PASS and continue")
    print(f"║    --reject  {gate_name} --reason '…' → FAIL with reason")
    print(f"║    --query   {gate_name} --question '…'→ Ask follow-up")
    print(f"╚══════════════════════════════════════════════════════════╝")


def show_status():
    state = PipelineState.load()
    print(f"═══════════════════════════════════════")
    print(f"  Pipeline Status")
    print(f"═══════════════════════════════════════")
    print(f"  Spec:       {state.spec_brief[:80]}{'...' if len(state.spec_brief) > 80 else ''}")
    print(f"  Domain:     {state.project_domain}")
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
        # Resolve domain-aware owner (GATE_2 / GATE_6 differ by domain)
        effective_owner = _domain_gate_owner(state.current_gate, state.project_domain) or cfg["owner"]
        print(f"\n  Next action: {cfg['desc']}")
        print(f"  Owner:       {effective_owner}  (domain: {state.project_domain})")
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
    effective_owner = _domain_gate_owner(gate, state.project_domain) or cfg["owner"]
    print(f"\n╔══════════════════════════════════════════════════════════╗")
    print(f"║  NEXT: {gate:<20} ({cfg['desc'][:35]})")
    print(f"║  Owner: {effective_owner:<15}  Engine: {cfg['engine']}  [{state.project_domain}]")
    print(f"╠══════════════════════════════════════════════════════════╣")

    if cfg["engine"] == "codex":
        print(f"║  → Open Codex session for {cfg['owner']}")
        print(f"║  → Paste prompt from: agents_os_v2 --generate-prompt {gate}")
    elif cfg["engine"] == "codex+human":
        print(f"║  → Codex analysis + human approval required")
        print(f"║  → Paste prompt from: agents_os_v2 --generate-prompt {gate}")
        print(f"║  → Then: --approve {gate} / --reject {gate} --reason '…'")
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


def route_after_fail(gate_id: str, route_type: str, notes: str = ""):
    """Move the pipeline forward after a FAIL by selecting the correct routing path.

    Must be called AFTER advance_gate(..., "FAIL") has already been recorded.
    This is a SEPARATE step so the user consciously chooses the route type.

    route_type:
        "doc"  — Documentation/governance issues only.
                 Targets CURSOR_IMPLEMENTATION (or equivalent) — no re-planning,
                 Team 10 fixes specific files, re-commits, gates re-run from there.
        "full" — Substantial code or design issues (or ambiguous).
                 Targets G3_PLAN — full re-plan → mandates → implementation cycle.

    Notes: paste the BF-*/BLOCK-* findings here — stored for next gate's prompt context.
    """
    state = PipelineState.load()

    if gate_id not in FAIL_ROUTING:
        _log(f"ERROR: No fail routing defined for gate: {gate_id}")
        _log(f"  Supported: {', '.join(FAIL_ROUTING.keys())}")
        return

    if route_type not in ("doc", "full"):
        _log(f"ERROR: route_type must be 'doc' or 'full' (got: {repr(route_type)})")
        _log(f"  Usage: ./pipeline_run.sh route doc|full [notes]")
        return

    target_gate, desc = FAIL_ROUTING[gate_id][route_type]

    _log(f"")
    _log(f"╔══ FAIL ROUTING ══════════════════════════════════════════╗")
    _log(f"║  Gate failed:  {gate_id}")
    _log(f"║  Route type:   {route_type.upper()}")
    _log(f"║  Description:  {desc[:60]}")
    _log(f"║  → Target:     {target_gate}")
    if notes:
        _log(f"║  Notes:        {notes[:72]}")
    _log(f"╚══════════════════════════════════════════════════════════╝")
    _log(f"")

    state.current_gate = target_gate
    state.save()
    _log(f"Pipeline advanced → {target_gate}")

    # Contextual hints for next action
    if target_gate == "G3_PLAN":
        _log(f"")
        _log(f"→ Generate G3_PLAN revision prompt:")
        if notes:
            safe_notes = notes[:120].replace("'", "\\'")
            _log(f'  ./pipeline_run.sh revise "{safe_notes}"')
        else:
            _log(f"  ./pipeline_run.sh revise \"[paste blocker findings]\"")
    elif target_gate == "CURSOR_IMPLEMENTATION":
        _log(f"")
        _log(f"→ Generate doc-fix mandate for Team 10:")
        _log(f"  ./pipeline_run.sh gate CURSOR_IMPLEMENTATION")
        _log(f"  (Team 10 fixes governance/doc files only — no re-implementation)")
    elif target_gate in ("GATE_0", "GATE_1", "GATE_8"):
        _log(f"")
        _log(f"→ Re-run the same gate:")
        _log(f"  ./pipeline_run.sh")

    show_next(state)


def _verdict_candidates(gate_id: str, work_package_id: str) -> list[Path]:
    """Return ordered list of candidate verdict file paths for a given gate.

    Mirrors the JS getVerdictCandidates() in PIPELINE_DASHBOARD.html — must stay in sync.
    NOTE: File names use underscores (S001_P002_WP001) while WP IDs use hyphens
    (S001-P002-WP001). Both variants are checked.
    """
    wp  = work_package_id or ""
    wpu = wp.replace("-", "_")   # S001-P002-WP001 → S001_P002_WP001 (file naming convention)
    d   = REPO_ROOT / "_COMMUNICATION"
    t90  = d / "team_90"
    t190 = d / "team_190"
    t100 = d / "team_100"
    t50  = d / "team_50"
    t70  = d / "team_70"
    # Each gate: underscore form (wpu) first — canonical file naming convention.
    # Hyphen form (wp) kept as fallback for forward-compatibility.
    # "TO_TEAM_10" prefix variant included for teams that use routing-style names.
    patterns: dict[str, list[Path]] = {
        "GATE_0": [
            # Canonical patterns (underscore naming)
            t190 / f"TEAM_190_{wpu}_GATE_0_VERDICT_v1.0.0.md",
            t190 / f"TEAM_190_{wpu}_GATE_0_VALIDATION_v1.0.0.md",
            # Routing-prefix variants (TEAM_190_TO_TEAM_*_WP_GATE0_*)
            t190 / f"TEAM_190_TO_TEAM_10_{wpu}_GATE_0_VALIDATION_RESULT_v1.0.0.md",
            t190 / f"TEAM_190_TO_TEAM_10_TEAM_90_{wpu}_GATE0_VALIDATION_RESULT_v1.0.0.md",
            t190 / f"TEAM_190_TO_TEAM_10_TEAM_90_{wpu}_GATE_0_VALIDATION_RESULT_v1.0.0.md",
            # Hyphen fallback
            t190 / f"TEAM_190_{wp}_GATE_0_VERDICT_v1.0.0.md",
        ],
        "GATE_1": [
            t190 / f"TEAM_190_{wpu}_GATE_1_VERDICT_v1.0.0.md",
            t190 / f"TEAM_190_{wpu}_LLD400_VALIDATION_v1.0.0.md",
            t190 / f"TEAM_190_TO_TEAM_10_{wpu}_GATE_1_VALIDATION_RESULT_v1.0.0.md",
            t190 / f"TEAM_190_TO_TEAM_10_TEAM_90_{wpu}_GATE1_VALIDATION_RESULT_v1.0.0.md",
            t190 / f"TEAM_190_TO_TEAM_10_TEAM_90_{wpu}_GATE_1_VALIDATION_RESULT_v1.0.0.md",
            t190 / f"TEAM_190_{wp}_GATE_1_VERDICT_v1.0.0.md",
        ],
        "GATE_2": [
            t100 / f"TEAM_100_{wpu}_GATE_2_VERDICT_v1.0.0.md",
            t100 / f"TEAM_100_{wpu}_GATE_2_SPEC_REVIEW_v1.0.0.md",
            t100 / f"TEAM_100_{wp}_GATE_2_VERDICT_v1.0.0.md",
        ],
        "G3_5": [
            t90 / f"TEAM_90_{wpu}_G3_5_VERDICT_v1.0.0.md",
            t90 / f"TEAM_90_{wpu}_G3_5_VALIDATION_v1.0.0.md",
            t90 / f"TEAM_90_{wpu}_WORK_PLAN_VALIDATION_v1.0.0.md",
            t90 / f"TEAM_90_TO_TEAM_10_{wpu}_VALIDATION_RESPONSE.md",
            t90 / f"TEAM_90_{wp}_G3_5_VERDICT_v1.0.0.md",
        ],
        "GATE_4": [
            t50 / f"TEAM_50_{wpu}_QA_REPORT_v1.0.0.md",
            t50 / f"TEAM_50_{wpu}_GATE_4_REPORT_v1.0.0.md",
            t50 / f"TEAM_50_{wp}_QA_REPORT_v1.0.0.md",
        ],
        "GATE_5": [
            t90 / f"TEAM_90_{wpu}_GATE_5_VALIDATION_v1.0.0.md",
            t90 / f"TEAM_90_{wpu}_GATE5_VALIDATION_v1.0.0.md",
            t90 / f"TEAM_90_{wpu}_GATE_5_VERDICT_v1.0.0.md",
            t90 / f"TEAM_90_{wpu}_G5_VALIDATION_v1.0.0.md",
            t90 / f"TEAM_90_{wpu}_GATE_5_REVIEW_v1.0.0.md",
            t90 / f"TEAM_90_TO_TEAM_10_{wpu}_GATE_5_VALIDATION_v1.0.0.md",
            t90 / f"TEAM_90_TO_TEAM_10_{wpu}_BLOCKING_REPORT.md",  # blocking report naming variant
            t90 / f"TEAM_90_{wp}_GATE_5_VALIDATION_v1.0.0.md",
        ],
        "G5_DOC_FIX": [
            # G5_DOC_FIX is passed manually — Team 10 confirms all docs fixed, no AI verdict file.
            # Verdict candidates are unused (no auto-routing from file at this gate).
        ],
        "GATE_6": [
            t100 / f"TEAM_100_{wpu}_GATE_6_VERDICT_v1.0.0.md",
            t100 / f"TEAM_100_{wpu}_GATE_6_REVIEW_v1.0.0.md",
            t100 / f"TEAM_100_{wp}_GATE_6_VERDICT_v1.0.0.md",
        ],
        "GATE_8": [
            t90 / f"TEAM_90_{wpu}_GATE_8_VERDICT_v1.0.0.md",
            t70 / f"TEAM_70_{wpu}_GATE_8_DOCS_v1.0.0.md",
            t90 / f"TEAM_90_{wp}_GATE_8_VERDICT_v1.0.0.md",
        ],
    }
    return patterns.get(gate_id, [])


def _extract_route_recommendation(gate_id: str, work_package_id: str) -> tuple[str | None, str]:
    """Read the verdict file for a gate and extract route_recommendation: doc|full.

    Returns (route_type, source_path) where route_type is 'doc', 'full', or None.
    Searches through candidate verdict file paths in order.
    """
    import re
    candidates = _verdict_candidates(gate_id, work_package_id)
    # Alias map: normalize variant names from team output to pipeline-internal values
    _ROUTE_ALIAS: dict[str, str] = {
        "doc":          "doc",
        "full":         "full",
        "doc_only":     "doc",
        "doc_only_loop":"doc",
        "doconly":      "doc",
        "loop":         "doc",   # GATE_0/1 self-loop = doc route
        "reject":       "full",
        "revision":     "full",
    }

    for path in candidates:
        if path.exists():
            text = path.read_text(encoding="utf-8")
            # Match: route_recommendation: doc | full | DOC_ONLY_LOOP | etc.
            m = re.search(
                r'^route_recommendation\s*[:\-]\s*([A-Za-z_]+)',
                text,
                re.IGNORECASE | re.MULTILINE,
            )
            if m:
                raw = m.group(1).lower().replace("-", "_")
                normalized = _ROUTE_ALIAS.get(raw)
                if normalized:
                    return normalized, str(path)
    return None, ""


def generate_prompt(gate_id: str, force_gate4: bool = False, revision_notes: str = "", fresh: bool = False):
    state = PipelineState.load()
    if gate_id == "WAITING_FOR_IMPLEMENTATION_COMMIT":
        gate_id = "GATE_4"  # Alias: retry GATE_4 after commit

    if gate_id == "GATE_0":
        # ── Pre-flight: governance registry checks (Program + WP registration) ─
        gov_issues = _check_governance_precheck(state)
        if gov_issues:
            _log("")
            _log("╔══ ⛔ GOVERNANCE PRE-CHECK FAILED ════════════════════════╗")
            _log("║  GATE_0 cannot proceed until these registry issues are    ║")
            _log("║  resolved. Fix them, then re-run ./pipeline_run.sh         ║")
            _log("╠══════════════════════════════════════════════════════════╣")
            for issue in gov_issues:
                _log(f"║  {issue}")
            _log("╠══════════════════════════════════════════════════════════╣")
            _log("║  Required fixes:                                          ║")
            _log("║  1. GOVERNANCE-01 → PHOENIX_PROGRAM_REGISTRY_v1.0.0.md   ║")
            _log("║     Set program status = ACTIVE                           ║")
            _log("║  2. GOVERNANCE-02 → PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0 ║")
            _log("║     Add WP row (status=IN_PROGRESS, current_gate=GATE_0) ║")
            _log("║  3. Issue ARCHITECT_DIRECTIVE authorizing activation      ║")
            _log("║     if program was previously DEFERRED                    ║")
            _log("╚══════════════════════════════════════════════════════════╝")
            return
        # ── Data model checks ─────────────────────────────────────────────────
        dm_findings = run_data_model_checks("GATE_0", state.spec_brief, "spec_brief")
        blocks = [f for f in dm_findings if f.status == "BLOCK"]
        if blocks:
            for b in blocks:
                _log(f"⛔ {b.check_id}: {b.message}")
            _log("GATE_0 blocked by Data Model Validator. Fix schema issues and re-run.")
            return
        prompt = _generate_gate_0_prompt(state, fresh)
    elif gate_id == "GATE_1":
        spec_content = state.lld400_content or state.spec_brief
        dm_findings = run_data_model_checks("GATE_1", spec_content, "lld400_or_spec")
        blocks = [f for f in dm_findings if f.status == "BLOCK"]
        if blocks:
            for b in blocks:
                _log(f"⛔ {b.check_id}: {b.message}")
            _log("GATE_1 blocked by Data Model Validator. Fix schema issues and re-run.")
            return
        # ── Same pattern as GATE_8: mandate doc IS the gate prompt ──
        # GATE_1_mandates.md  → phase* extractor (pipeline_run.sh phase1 / phase2)
        # GATE_1_prompt.md    → full mandate doc (saved by generate_prompt after this block)
        # Dashboard: mandate-gate mode (mandate tabs shown, copy button disabled)
        prompt = _generate_gate_1_mandates(state)
        _log("GATE_1 is a TWO-PHASE mandate gate (same pattern as GATE_8):")
        _log("  Phase 1 → Team 170 (Gemini)  | ./pipeline_run.sh phase1")
        _log("  Phase 2 → Team 190 (OpenAI)  | ./pipeline_run.sh phase2")
        _log("  Mandate tabs in Dashboard show each phase separately.")
    elif gate_id == "GATE_2":
        gate2_owner = _domain_gate_owner("GATE_2", state.project_domain) or "team_100"
        prompt = _generate_gate_2_prompt(state, fresh, team_id=gate2_owner)
    elif gate_id == "WAITING_GATE2_APPROVAL":
        gate2_owner = _domain_gate_owner("GATE_2", state.project_domain) or "team_100"
        analysis = state.lld400_content[:500] if state.lld400_content else "(no analysis stored)"
        _print_human_approval_prompt("GATE_2", analysis, state.spec_brief)
        prompt = (
            "# WAITING_GATE2_APPROVAL — Human Decision Required\n\n"
            f"{gate2_owner.replace('_', ' ').title()} has completed GATE_2 analysis.\n"
            "Nimrod must review and decide.\n\n"
            "## Actions\n"
            "  --approve GATE_2   → PASS and continue to G3_PLAN\n"
            "  --reject  GATE_2 --reason '…' → FAIL with reason\n"
            "  --query   GATE_2 --question '…' → Ask follow-up\n"
        )
    elif gate_id == "G3_PLAN":
        prompt = _generate_g3_plan_prompt(state, revision_notes=revision_notes, fresh=fresh)
    elif gate_id == "G3_5":
        prompt = _generate_g3_5_prompt(state, fresh)
    elif gate_id == "G3_6_MANDATES":
        prompt = _generate_mandates(state)
    elif gate_id == "CURSOR_IMPLEMENTATION":
        prompt = _generate_cursor_prompts(state)
    elif gate_id == "GATE_4":
        if not force_gate4:
            import subprocess
            result = subprocess.run(
                ["git", "diff", "--stat", "HEAD~1", "HEAD"],
                capture_output=True, text=True, cwd=str(REPO_ROOT),
            )
            if not result.stdout.strip():
                state.current_gate = "WAITING_FOR_IMPLEMENTATION_COMMIT"
                state.save()
                _log("⛔ STOPPED: No new commits since HEAD~1.")
                _log("GATE_4 blocked — implementation not committed.")
                _log("Fix: commit your implementation, then re-run --generate-prompt GATE_4")
                _log("Override: --generate-prompt GATE_4 --force-gate4")
                return
        prompt = _generate_gate_4_prompt(state)
    elif gate_id == "GATE_5":
        dm_findings = run_data_model_checks("GATE_5")
        dm_blocks = [f for f in dm_findings if f.status == "BLOCK"]
        if dm_blocks:
            for b in dm_blocks:
                _log(f"⚠  DM Validator: {b.check_id}: {b.message}")
            _log("DM Validator found issues — embedded in prompt for Team 90 to evaluate.")
        prompt = _generate_gate_5_prompt(state, fresh, dm_blocks=dm_blocks)
    elif gate_id == "GATE_6":
        gate6_owner = _domain_gate_owner("GATE_6", state.project_domain) or "team_100"
        prompt = _generate_gate_6_prompt(state, fresh, team_id=gate6_owner)
    elif gate_id == "WAITING_GATE6_APPROVAL":
        gate6_owner = _domain_gate_owner("GATE_6", state.project_domain) or "team_100"
        impl_summary = ", ".join(state.implementation_files[:10]) if state.implementation_files else "(no impl files stored)"
        _print_human_approval_prompt("GATE_6", impl_summary, state.spec_brief)
        prompt = (
            "# WAITING_GATE6_APPROVAL — Human Decision Required\n\n"
            f"{gate6_owner.replace('_', ' ').title()} has completed GATE_6 analysis.\n"
            "Nimrod must review and decide.\n\n"
            "## Actions\n"
            "  --approve GATE_6   → PASS and continue to GATE_7\n"
            "  --reject  GATE_6 --reason '…' → FAIL with reason\n"
            "  --query   GATE_6 --question '…' → Ask follow-up\n"
        )
    elif gate_id == "GATE_7":
        prompt = _generate_gate_7_prompt(state)
    elif gate_id == "G5_DOC_FIX":
        prompt = _generate_g5_doc_fix_prompt(state)
    elif gate_id == "GATE_8":
        prompt = _generate_gate_8_mandates(state, fresh)
    else:
        print(f"Unknown gate: {gate_id}")
        return

    path = _save_prompt(f"{gate_id}_prompt.md", prompt)
    _log(f"Prompt saved to: {path}")
    _log(f"Paste into: {GATE_CONFIG.get(gate_id, {}).get('engine', '?')} session")
    print(f"\n{'='*60}\n{prompt[:500]}...\n{'='*60}")
    print(f"\nFull prompt at: {path}")


_TEAM_ROLES = {
    "team_10":  "Gateway",
    "team_20":  "API-Verify",
    "team_30":  "Frontend",
    "team_50":  "QA",
    "team_90":  "Dev-Validator",
    "team_100": "Arch-Authority",
    "team_170": "Spec-Author",
    "team_190": "Constitutional-Validator",
}


def _team_header(team_id: str, gate_name: str, state: "PipelineState", fresh: bool = False) -> str:
    """Lean identity stamp — ~40 tokens. Prevents context drift without full re-injection.

    Format: **ACTIVE: TEAM_XX (Role)** gate=... | wp=... | stage=... | date=...

    fresh=True: prepends the full team constitution (for brand-new sessions).
    fresh=False (default): stamp only (for continuing sessions — agent already has context).
    """
    role = _TEAM_ROLES.get(team_id, team_id.upper())
    today = datetime.now().strftime("%Y-%m-%d")
    stamp = (
        f"**ACTIVE: {team_id.upper()} ({role})**  "
        f"gate={gate_name} | wp={state.work_package_id} | "
        f"stage={state.stage_id} | {today}\n\n"
        f"---\n\n"
    )
    if fresh:
        identity = load_team_identity(team_id)
        return f"{identity}\n\n---\n\n{stamp}"
    return stamp


def _check_governance_precheck(state: "PipelineState") -> list[str]:
    """Pre-flight governance validation before GATE_0 can generate a prompt.

    Checks that:
      1. The program is ACTIVE (or explicitly activation-ready) in PHOENIX_PROGRAM_REGISTRY.
      2. The work_package_id is registered in PHOENIX_WORK_PACKAGE_REGISTRY.

    Returns a list of human-readable warning strings.
    Empty list = all checks passed.
    """
    import re

    warnings: list[str] = []
    registry_dir = REPO_ROOT / "documentation" / "docs-governance" / "01-FOUNDATIONS"
    prog_id = "-".join(state.work_package_id.split("-")[:2])  # S001-P002-WP001 → S001-P002

    # ── 1. Program Registry check ─────────────────────────────────────────────
    prog_reg = registry_dir / "PHOENIX_PROGRAM_REGISTRY_v1.0.0.md"
    if prog_reg.exists():
        text = prog_reg.read_text(encoding="utf-8")
        row_match = re.search(
            rf"\|\s*\S+\s*\|\s*{re.escape(prog_id)}\s*\|[^|]*\|[^|]*\|\s*([A-Z_]+)\s*\|",
            text,
        )
        if row_match:
            status = row_match.group(1).strip()
            allowed = {"ACTIVE", "PIPELINE"}
            if status not in allowed:
                warnings.append(
                    f"GOVERNANCE-01: Program {prog_id} has status='{status}' in "
                    f"PHOENIX_PROGRAM_REGISTRY (expected: ACTIVE or PIPELINE). "
                    f"Fix: update program status, then re-run."
                )
        else:
            warnings.append(
                f"GOVERNANCE-01: Program {prog_id} NOT FOUND in PHOENIX_PROGRAM_REGISTRY. "
                f"Fix: register the program with status=ACTIVE before GATE_0."
            )

    # ── 2. Work Package Registry check ────────────────────────────────────────
    wp_reg = registry_dir / "PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md"
    if wp_reg.exists():
        text = wp_reg.read_text(encoding="utf-8")
        if state.work_package_id not in text:
            warnings.append(
                f"GOVERNANCE-02: Work Package {state.work_package_id} NOT FOUND in "
                f"PHOENIX_WORK_PACKAGE_REGISTRY. "
                f"Fix: register the WP (even as HOLD/IN_PROGRESS) before GATE_0."
            )

    return warnings


def _generate_gate_0_prompt(state: PipelineState, fresh: bool = False) -> str:
    return (
        f"{_team_header('team_190', 'GATE_0', state, fresh)}"
        f"# GATE_0 — Validate LOD200 Scope (SPEC_ARC)\n\n"
        f"Validate the following LOD200 scope brief for constitutional compliance.\n\n"
        f"**Check:**\n"
        f"- Identity header consistency (stage_id, program_id, work_package_id all match WSM/registry)\n"
        f"- Program registration status (program_id must be ACTIVE in PHOENIX_PROGRAM_REGISTRY)\n"
        f"- Work Package registration (work_package_id must exist in WORK_PACKAGE_REGISTRY)\n"
        f"- Domain isolation (no TikTrack ↔ Agents_OS boundary violations)\n"
        f"- No conflict with currently active programs\n"
        f"- Feasibility and scope clarity\n\n"
        f"## MANDATORY: Output Format\n\n"
        f"**Your response MUST include these fields at the top:**\n\n"
        f"```\n"
        f"gate_id: GATE_0\n"
        f"decision: PASS | BLOCK_FOR_FIX\n"
        f"route_recommendation: doc\n"
        f"blocking_findings:\n"
        f"  - BF-01: <description> | evidence: <file:line>\n"
        f"  - BF-02: <description> | evidence: <file:line>\n"
        f"next_required_action: <what must happen before resubmission>\n"
        f"next_responsible_team: <team_id>\n"
        f"```\n\n"
        f"**`route_recommendation` values (REQUIRED — drives pipeline auto-routing):**\n"
        f"```\nroute_recommendation: doc\n```  "
        f"← any fix required before resubmission (always `doc` for GATE_0 — spec revision)\n\n"
        f"**`blocking_findings` list (REQUIRED if BLOCK_FOR_FIX — drives remediation flow):**\n"
        f"- Each entry: `BF-NN: <description> | evidence: <canonical_path:line_number>`\n"
        f"- Missing or empty findings = invalid BLOCK; pipeline cannot auto-route\n\n"
        f"**On PASS:** route_recommendation and blocking_findings may be omitted.\n"
        f"**On BLOCK:** architect (Team 00) is the next responsible team — LOD200 revision required.\n\n"
        f"## Scope Brief\n\n{state.spec_brief}\n\n"
        + (
            f"## Activation Context (for S001 WPs run during S002 era)\n\n"
            f"**Authorized architectural context:** When `stage_id` on this WP is S001 while WSM "
            f"`active_stage_id=S002`, this is an AUTHORIZED parallel activation of a DEFERRED S001 "
            f"program — NOT a stage mismatch error. Check for directive:\n"
            f"`_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_S001_P002_ACTIVATION_v1.0.0.md`\n"
            f"If this directive exists and references the WP, the stage context discrepancy is "
            f"**RESOLVED** — do NOT raise it as a blocking finding.\n\n"
            if state.stage_id == "S001" else ""
        )
        + f"## Current State\n\n{build_state_summary()}"
    )


def _generate_gate_1_mandates(state: PipelineState) -> str:
    """GATE_1 two-phase mandate document using the generic mandate engine.

    Phase 1: Team 170 (Gemini) — produces LLD400 spec.
    Phase 2: Team 190 (OpenAI) — validates LLD400 independently (external validation,
             different engine — this is architecturally mandatory).

    Saves GATE_1_mandates.md (used by pipeline_run.sh phase* extraction).
    Returns the full mandate document (also saved as GATE_1_prompt.md by generate_prompt).
    Same pattern as GATE_8 / _generate_gate_8_mandates.
    """
    import glob as _glob
    wp  = state.work_package_id
    wpu = wp.replace("-", "_")

    # ── Resolve latest LLD400 file (AC-10: use newest version, not hardcoded v1.0.0) ─
    _lld_candidates = sorted(
        _glob.glob(str(REPO_ROOT / f"_COMMUNICATION/team_170/TEAM_170_{wpu}_LLD400_v*.md"))
    )
    lld400_path = (
        str(Path(_lld_candidates[-1]).relative_to(REPO_ROOT))
        if _lld_candidates
        else f"_COMMUNICATION/team_170/TEAM_170_{wpu}_LLD400_v1.0.0.md"
    )

    verdict_path = f"_COMMUNICATION/team_190/TEAM_190_{wpu}_GATE_1_VERDICT_v1.0.0.md"

    phase1_task = (
        f"### Your Task\n\n"
        f"**Environment:** Gemini (Team 170 — Spec-Author)\n\n"
        f"Produce a complete LLD400 spec for WP `{wp}`.\n\n"
        f"**Spec Brief:**\n\n{state.spec_brief}\n\n"
        f"---\n\n"
        f"**Required sections (all 6 are mandatory):**\n\n"
        f"1. **Identity Header** — `gate: GATE_1 | wp: {wp} | stage: {state.stage_id} | domain: {state.project_domain} | date: <today>`\n"
        f"2. **Endpoint Contract** — HTTP method, path, request body schema, response schema\n"
        f"3. **DB Contract** — tables accessed, columns read/written, query patterns; no new schema unless spec mandates\n"
        f"4. **UI Structural Contract** — component hierarchy, DOM anchors (`data-testid`), state shape\n"
        f"5. **MCP Test Scenarios** — each scenario: precondition → action → expected assertion\n"
        f"6. **Acceptance Criteria** — numbered, each criterion independently pass/fail testable\n\n"
        f"---\n\n"
        f"Save LLD400 to: `{lld400_path}`\n\n"
        f"When done, inform Nimrod. Nimrod runs `./pipeline_run.sh phase2` to activate Team 190 validation.\n\n"
        f"⛔ **YOUR TASK ENDS WITH SAVING THE LLD400. Do NOT validate your own output.**"
    )

    phase2_task = (
        f"### Your Task\n\n"
        f"**Environment:** OpenAI / Codex (Team 190 — Constitutional-Validator)\n\n"
        f"Validate the LLD400 produced by Team 170. This is **external validation** — "
        f"you use a different engine from Team 170 by architectural design.\n\n"
        f"**Read the LLD400 from:** `{lld400_path}`\n\n"
        f"(If the file is missing, Team 170 has not completed Phase 1. Stop and notify.)\n\n"
        f"---\n\n"
        f"**Validation checklist (all 8 items required):**\n\n"
        f"1. **Identity Header** — gate/wp/stage/domain/date all present and match state\n"
        f"2. **All 6 sections present** — Identity, Endpoint, DB, UI, MCP Scenarios, Acceptance Criteria\n"
        f"3. **Endpoint Contract** — method, path, full request/response schema specified\n"
        f"4. **DB Contract** — no undeclared schema changes; NUMERIC(20,8) Iron Rule for financial data\n"
        f"5. **UI Contract** — DOM anchors (`data-testid`), component tree, state shape complete\n"
        f"6. **Acceptance Criteria** — numbered, each criterion independently testable\n"
        f"7. **Scope compliance** — stays within spec_brief; no undeclared additions\n"
        f"8. **Iron Rules** — maskedLog mandatory, collapsible-container, no new backend unless spec mandates\n\n"
        f"**Spec Brief (reference):**\n\n{state.spec_brief}\n\n"
        f"---\n\n"
        f"Save verdict to: `{verdict_path}`\n\n"
        f"- **PASS** → ready for GATE_2\n"
        f"- **BLOCK** → `BF-XX: description | fix required`\n\n"
        f"If BLOCK: Team 170 must revise the LLD400. Do NOT fix it yourself.\n\n"
        f"⛔ **YOU ARE TEAM 190 — VALIDATE ONLY. Do NOT rewrite or fix the LLD400.**"
    )

    steps = [
        MandateStep(
            team_id    = "team_170",
            label      = "Team 170 — LLD400 Production",
            phase      = 1,
            task       = phase1_task,
            writes_to  = lld400_path,
            acceptance = [
                f"LLD400 saved to: `{lld400_path}`",
                "All 6 required sections present with complete content",
                "Identity Header matches state (gate/wp/stage/domain/date)",
                "Scope matches spec_brief — no undeclared additions",
                "Team 190 notified for Phase 2 validation",
            ],
        ),
        MandateStep(
            team_id    = "team_190",
            label      = "Team 190 — LLD400 Validation",
            phase      = 2,
            task       = phase2_task,
            reads_from = [lld400_path],
            reads_label= "LLD400 produced by Team 170 (Phase 1 output)",
            depends_on = ["team_170"],
            writes_to  = verdict_path,
            acceptance = [
                "All 8 validation checklist items addressed",
                f"If PASS  →  `./pipeline_run.sh pass`  (advances to GATE_2)",
                f"If BLOCK →  `./pipeline_run.sh fail \"BF-XX: [description]\"`  (returns to Team 170)",
            ],
        ),
    ]

    doc = _generate_mandate_doc(steps, state, gate="GATE_1")
    _save_prompt("GATE_1_mandates.md", doc)
    return doc


def _generate_gate_2_prompt(state: PipelineState, fresh: bool = False, team_id: str = "team_100") -> str:
    domain_note = (
        f"\n**Domain:** `{state.project_domain}` — Architectural authority for this domain: `{team_id}`\n"
    )
    return (
        f"{_team_header(team_id, 'GATE_2', state, fresh)}"
        f"# GATE_2 — Approve Architectural Intent\n\n"
        f"Question: Do we approve building this?\n"
        f"{domain_note}\n"
        f"## Approved Spec (LLD400 from GATE_1)\n\n"
        f"{state.lld400_content[:4000] if state.lld400_content else '[LLD400 not yet produced — paste from GATE_1 output]'}\n\n"
        f"Respond with: APPROVED or REJECTED + reasoning.\n\n"
        f"**NOTE:** After analysis, the pipeline will PAUSE for human decision.\n"
        f"Use --approve GATE_2 / --reject GATE_2 --reason '…' to continue."
    )


def _generate_g3_plan_prompt(state: PipelineState, revision_notes: str = "", fresh: bool = False) -> str:
    header = _team_header("team_10", "G3_PLAN", state, fresh)
    spec = state.lld400_content[:4000] if state.lld400_content else state.spec_brief

    if revision_notes:
        # Revision mode: G3_5 failed — ask Team 10 to fix the existing plan
        existing_plan_ref = "_COMMUNICATION/team_10/" if not state.work_plan else ""
        return (
            f"{header}"
            f"# G3_PLAN REVISION — Fix Work Plan per G3_5 Blockers\n\n"
            f"Your work plan was reviewed by Team 90 (G3_5) and **FAILED**.\n"
            f"Do NOT produce a new plan from scratch — update the existing plan to address the blockers below.\n\n"
            f"## G3_5 Blockers to Fix\n\n{revision_notes}\n\n"
            f"## Existing Work Plan\n\n"
            f"{state.work_plan[:4000] if state.work_plan else '[work plan not in state — check _COMMUNICATION/team_10/ for your prior output]'}\n\n"
            f"## Spec (for reference)\n\n{spec}\n\n"
            f"## Required Output\n\n"
            f"Produce an updated work plan that resolves every blocker above.\n"
            f"For each blocker, confirm how you fixed it.\n"
            f"Save to: `_COMMUNICATION/team_10/TEAM_10_S001_P002_WP001_G3_PLAN_WORK_PLAN_v1.1.0.md`\n\n"
            f"## Pipeline State\n\n{build_state_summary()}"
        )

    # Fresh mode: first run of G3_PLAN
    return (
        f"{header}"
        f"# G3_PLAN — Build Work Plan from Approved Spec\n\n"
        f"## Approved Spec\n\n{spec}\n\n"
        f"## Required Output\n\n"
        f"1. Files to create/modify per team (canonical paths):\n"
        f"   - Team 20 (API verify only): confirm existing API endpoints — no code changes\n"
        f"   - Team 30 (Frontend): exact file paths to create/modify in `ui/src/`\n"
        f"   - Team 50 (QA): test scenarios + run commands + PASS criteria\n"
        f"2. Execution order with dependencies\n"
        f"3. Per-team acceptance criteria (field contract, empty state, error state for UI)\n"
        f"4. API contract: endpoint, params, response shape\n\n"
        f"## Pipeline State\n\n{build_state_summary()}"
    )


def _generate_g3_5_prompt(state: PipelineState, fresh: bool = False) -> str:
    wp         = state.work_package_id
    wpu        = wp.replace("-", "_")
    fail_count = state.gates_failed.count("G3_5")
    is_rerun   = fail_count > 0

    if is_rerun:
        cycle_banner = (
            f"╔══════════════════════════════════════════════════════════════╗\n"
            f"║  ⚠  RE-VALIDATION — G3_5 CYCLE #{fail_count + 1:<3}                        ║\n"
            f"║  Work plan was revised to address prior blockers.            ║\n"
            f"║  Perform a FRESH review — do NOT repeat previous findings.   ║\n"
            f"╚══════════════════════════════════════════════════════════════╝\n\n"
            f"Previous verdict (read for context, do NOT copy its blockers):\n"
            f"  `_COMMUNICATION/team_90/TEAM_90_{wpu}_G3_5_VERDICT_v1.0.0.md`\n\n"
        )
        title = f"G3.5 — Validate Work Plan  [RE-RUN #{fail_count + 1}]"
    else:
        cycle_banner = ""
        title = "G3.5 — Validate Work Plan  [FIRST RUN]"

    return (
        f"{_team_header('team_90', 'G3_5', state, fresh)}"
        f"{cycle_banner}"
        f"# {title}\n\n"
        f"**WP:** `{wp}`\n\n"
        f"Validate this work plan for implementation readiness.\n"
        f"Check: completeness, team assignments, deliverables, test coverage.\n\n"
        f"## MANDATORY: route_recommendation\n\n"
        f"**If FAIL — include at the top of your response:**\n\n"
        f"```\nroute_recommendation: doc\n```  ← plan has format/governance/wording issues only\n"
        f"```\nroute_recommendation: full\n``` ← plan has structural/scope/logic problems\n\n"
        f"Classification:\n"
        f"- `doc`: blockers are grammar, missing paths, credential text, format-only\n"
        f"- `full`: scope unclear, wrong team assignments, missing deliverables, logic errors\n\n"
        f"This field drives automatic pipeline routing. Missing = manual block.\n\n"
        f"Respond with: PASS or FAIL + blocking findings.\n\n"
        f"## Work Plan\n\n"
        f"{state.work_plan[:4000] if state.work_plan else '[Paste work plan from G3_PLAN output]'}"
    )


def _extract_team_task(work_plan: str, team_num: int) -> str:
    """Extract team-specific task section from pipe-delimited work plan string."""
    if not work_plan:
        return ""
    sections = [s.strip() for s in work_plan.split("|")]
    team_key = f"Team {team_num}"
    for section in sections:
        if section.startswith(team_key):
            return section
    return ""


def _generate_mandates(state: PipelineState) -> str:
    """Generate per-team implementation mandates using the generic mandate engine.

    Teams 20 → 30 → 50 run sequentially.  Team 30 reads Team 20's API verification
    output (coordination injection).  Document is saved to implementation_mandates.md
    and also returned for the prompt display in generate_prompt().
    """
    from ..context.injection import load_conventions
    backend_conv  = load_conventions("backend")
    frontend_conv = load_conventions("frontend")

    wp  = state.work_package_id
    wpu = wp.replace("-", "_")

    # Canonical output paths
    t20_out = f"_COMMUNICATION/team_20/TEAM_20_{wpu}_API_VERIFY_v1.0.0.md"
    t50_out = f"_COMMUNICATION/team_50/TEAM_50_{wpu}_QA_REPORT_v1.0.0.md"

    # Extract per-team sections from work plan (falls back to spec_brief)
    team_20_task = _extract_team_task(state.work_plan, 20) or f"Verify backend APIs required for: {state.spec_brief}"
    team_30_task = _extract_team_task(state.work_plan, 30) or f"Implement frontend for: {state.spec_brief}"
    team_50_task = _extract_team_task(state.work_plan, 50) or f"Run QA for: {state.spec_brief}"

    # Preamble: full work plan (shown in raw file; not a tab section)
    preamble = (
        "## Full Work Plan (reference)\n\n"
        + (state.work_plan if state.work_plan else "[work plan not available — run G3_PLAN first]")
    )

    steps = [
        MandateStep(
            team_id    = "team_20",
            label      = "Team 20 — API Verification",
            phase      = 1,
            task       = (
                f"### Your Task\n\n{team_20_task}\n\n"
                f"**Environment:** Cursor Composer\n\n"
                f"Verify all backend API endpoints required for this feature.\n"
                f"No code changes unless a critical blocker is found.\n"
                f"Document: endpoint paths, params, response shapes, auth requirements."
            ),
            writes_to  = t20_out,
            acceptance = [
                "All required endpoints confirmed present and behaving as specified",
                "API params + response shapes documented",
                "No code changes (unless blocker found — document it)",
                f"Output saved to: `{t20_out}`",
            ],
            extra      = f"### Backend Conventions\n{backend_conv[:800]}",
        ),
        MandateStep(
            team_id     = "team_30",
            label       = "Team 30 — Frontend Implementation",
            phase       = 2,
            task        = (
                f"### Your Task\n\n{team_30_task}\n\n"
                f"**Environment:** Cursor Composer + MCP browser tools\n\n"
                f"Implement the frontend feature per spec. After implementation, run MCP verification:\n"
                f"1. Navigate to the target page and login\n"
                f"2. `browser_snapshot` — verify new component renders\n"
                f"3. Test primary feature (badge/count/list as applicable)\n"
                f"4. Verify edge case: hidden/empty state when count is 0\n"
                f"5. Test all navigation flows (Click item/badge → correct page)\n"
                f"6. `cd ui && npx vite build` — must succeed\n"
            ),
            reads_from  = [
                f"_COMMUNICATION/team_20/TEAM_20_{wpu}_API_VERIFY_v1.0.0.md",
                f"_COMMUNICATION/team_20/TEAM_20_{wpu}_API_VERIFICATION_v1.0.0.md",
            ],
            reads_label = "Team 20 API verification report",
            depends_on  = ["team_20"],
            acceptance  = [
                "All files listed in work plan created/modified",
                "collapsible-container Iron Rule applied",
                "maskedLog used for all console output",
                "Vite build passes (`cd ui && npx vite build`)",
                "All MCP browser verification steps pass",
            ],
            extra       = f"### Frontend Conventions\n{frontend_conv[:800]}",
        ),
        MandateStep(
            team_id    = "team_50",
            label      = "Team 50 — QA",
            phase      = 3,
            task       = (
                f"### Your Task\n\n{team_50_task}\n\n"
                f"**Environment:** Cursor Composer + MCP browser tools\n\n"
                f"Run comprehensive QA on the completed implementation.\n"
                f"Team 20 API verification AND Team 30 implementation must both be complete first."
            ),
            writes_to  = t50_out,
            depends_on  = ["team_30"],
            acceptance  = [
                "All FAST_3 checks pass",
                "No regressions on adjacent pages",
                f"QA report saved to: `{t50_out}`",
            ],
        ),
    ]

    doc = _generate_mandate_doc(steps, state, gate="G3_6_MANDATES", preamble=preamble)
    _save_prompt("implementation_mandates.md", doc)
    return doc


def _generate_gate_8_mandates(state: PipelineState, fresh: bool = False) -> str:
    """GATE_8 closure mandates using the generic mandate engine.

    Phase 1: domain doc team writes AS_MADE_REPORT + archives WP communication files.
    Phase 2: Team 90 validates completeness; if valid → WP CLOSED; if not → back to Phase 1.

    Saved to gate_8_mandates.md (separate from implementation_mandates.md so the
    Dashboard can load the correct file based on the current gate).
    """
    from ..config import DOMAIN_DOC_TEAM

    doc_team     = DOMAIN_DOC_TEAM.get(state.project_domain, "team_70")
    doc_team_up  = doc_team.upper()                    # "TEAM_70" or "TEAM_170"
    doc_team_n   = doc_team_up.replace("_", " ").title()  # "Team 70" or "Team 170"
    wp           = state.work_package_id
    wpu          = wp.replace("-", "_")
    stage        = state.stage_id
    archive_dest = f"_COMMUNICATION/_ARCHIVE/{stage}/{wp}/"
    as_made_path = f"_COMMUNICATION/{doc_team}/{doc_team_up}_{wpu}_AS_MADE_REPORT_v1.0.0.md"

    # Build impl files block for the AS_MADE_REPORT task description
    impl_files = state.implementation_files[:20] if state.implementation_files else []
    impl_block = (
        "\n".join(f"    - {f}" for f in impl_files)
        if impl_files
        else "    [list all files created/modified during implementation]"
    )

    phase1_task = (
        f"### Your Task\n\n"
        f"**Environment:** Cursor Composer (Team 70) / Codex (Team 170)\n\n"
        f"Complete **two mandatory tasks** for WP `{wp}` closure:\n\n"
        f"---\n\n"
        f"**TASK A — Write AS_MADE_REPORT**\n\n"
        f"Write to: `{as_made_path}`\n\n"
        f"Required sections:\n"
        f"  1. Feature summary — what was built\n"
        f"  2. Files created / modified:\n{impl_block}\n"
        f"  3. API endpoints added / changed (if any)\n"
        f"  4. Migrations or schema changes applied (if any)\n"
        f"  5. Known limitations / deferred items\n"
        f"  6. Notes for future developers (setup, gotchas, dependencies)\n"
        f"  7. Archive manifest (populated after Task B — list all archived files)\n\n"
        f"---\n\n"
        f"**TASK B — Archive WP Communication Files**\n\n"
        f"Source: `_COMMUNICATION/team_*/` (files containing `{wpu}` or `{wp}` in name)\n"
        f"Destination: `{archive_dest}`\n\n"
        f"```bash\n"
        f"mkdir -p {archive_dest}\n"
        f"find _COMMUNICATION/team_*/ \\( -name '*{wpu}*' -o -name '*{wp}*' \\) -type f\n"
        f"# Copy all matching files to {archive_dest}\n"
        f"```\n\n"
        f"**Do NOT archive** (keep active): SSM, WSM, PHOENIX_MASTER_WSM, "
        f"PHOENIX_PROGRAM_REGISTRY, TEAM_ROSTER_LOCK\n\n"
        f"→ When BOTH tasks complete, Team 90 can begin Phase 2 validation."
    )

    phase2_task = (
        f"### Your Task\n\n"
        f"**Environment:** Codex\n\n"
        f"Validate that {doc_team_n} has completed all closure requirements for `{wp}`.\n\n"
        f"**Validation checklist:**\n"
        f"□ AS_MADE_REPORT exists at: `{as_made_path}`\n"
        f"□ AS_MADE_REPORT has all required sections (1–7)\n"
        f"□ Archive directory exists: `{archive_dest}`\n"
        f"□ Archive contains gate artifacts (verdicts, blocking reports, work plans)\n"
        f"□ Archive manifest (Section 7) correctly lists all archived files\n"
        f"□ No unarchived WP-specific files remain in active team folders\n"
    )

    steps = [
        MandateStep(
            team_id     = doc_team,
            label       = f"{doc_team_n} — Documentation & Archive",
            phase       = 1,
            task        = phase1_task,
            writes_to   = as_made_path,
            # reads_from: Team 90's validation result — auto-injected in correction cycles.
            # On first run the file doesn't exist yet (Team 90 hasn't validated).
            # On correction run the file exists and blockers are injected automatically.
            reads_from  = [
                f"_COMMUNICATION/team_90/TEAM_90_TO_{doc_team_up}_{wpu}_GATE8_CLOSURE_VALIDATION_PHASE2_RESULT_v1.0.0.md",
                f"_COMMUNICATION/team_90/TEAM_90_{wpu}_GATE_8_VERDICT_v1.0.0.md",
                f"_COMMUNICATION/team_90/TEAM_90_TO_{doc_team_up}_{wpu}_GATE8_RESULT_v1.0.0.md",
            ],
            reads_label = "Team 90 validation result (correction cycle — empty on first run)",
            acceptance  = [
                f"AS_MADE_REPORT written at: `{as_made_path}`",
                f"All WP files archived to: `{archive_dest}`",
                "Archive manifest in AS_MADE_REPORT Section 7",
                "Team 90 notified for Phase 2 validation",
            ],
        ),
        MandateStep(
            team_id     = "team_90",
            label       = "Team 90 — Closure Validation",
            phase       = 2,
            task        = phase2_task,
            reads_from  = [
                as_made_path,
                f"_COMMUNICATION/{doc_team}/TEAM_70_{wpu}_AS_MADE_REPORT_v1.0.0.md",
            ],
            reads_label = f"{doc_team_n} AS_MADE_REPORT",
            depends_on  = [doc_team],
            acceptance  = [
                "All 6 checklist items PASS",
                "No missing sections in AS_MADE_REPORT",
                "No unarchived WP files found in active team folders",
                f"If ALL pass  →  `./pipeline_run.sh pass`  →  WP {wp} CLOSED ✅",
                f"If ANY fail  →  `./pipeline_run.sh fail \"CLOSURE-001: [specific issue]\"`"
                f"  →  returns to {doc_team_n} for correction",
            ],
        ),
    ]

    doc = _generate_mandate_doc(steps, state, gate="GATE_8")
    _save_prompt("gate_8_mandates.md", doc)
    return doc


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


def _generate_gate_5_prompt(
    state: PipelineState,
    fresh: bool = False,
    dm_blocks: list | None = None,
) -> str:
    wp        = state.work_package_id
    wpu       = wp.replace("-", "_")
    fail_count = state.gates_failed.count("GATE_5")
    is_rerun  = fail_count > 0
    dm_blocks  = dm_blocks or []

    # ── Cycle banner: printed prominently so the AI agent cannot miss it ──────
    if is_rerun:
        cycle_banner = (
            f"╔══════════════════════════════════════════════════════════════╗\n"
            f"║  ⚠  RE-VALIDATION — GATE_5 CYCLE #{fail_count + 1:<3}                       ║\n"
            f"║                                                              ║\n"
            f"║  GATE_5 was attempted {fail_count}× before this run.                  ║\n"
            f"║  Teams addressed the previous blockers.                      ║\n"
            f"║                                                              ║\n"
            f"║  YOU MUST PERFORM A COMPLETELY FRESH VALIDATION:             ║\n"
            f"║  • Read the CURRENT state of code and artifacts NOW          ║\n"
            f"║  • Do NOT copy or repeat findings from previous cycles       ║\n"
            f"║  • Do NOT return a template or placeholder document          ║\n"
            f"║  • If prior issues are fixed → do NOT re-raise them          ║\n"
            f"╚══════════════════════════════════════════════════════════════╝\n\n"
            f"Previous verdict file (read for context, do NOT copy its blockers):\n"
            f"  `_COMMUNICATION/team_90/TEAM_90_{wpu}_GATE_5_VALIDATION_v1.0.0.md`\n\n"
        )
        title = f"GATE_5 — Dev Validation  [RE-RUN #{fail_count + 1} of {fail_count + 1}]"
    else:
        cycle_banner = ""
        title = "GATE_5 — Dev Validation  [FIRST RUN]"

    # ── Data Model Validator findings (if any) ────────────────────────────────
    if dm_blocks:
        dm_section = (
            f"## ⚠️ Data Model Validator — Pre-flight Findings\n\n"
            f"The automated data model validator flagged the following issues before generating this prompt.\n"
            f"Include these in your validation findings — mark PASS if spec declares no schema changes.\n\n"
        )
        for b in dm_blocks:
            dm_section += f"- **{b.check_id}**: {b.message}\n"
        dm_section += "\n"
    else:
        dm_section = ""

    # ── Artifact paths for this specific WP ──────────────────────────────────
    artifacts = (
        f"## Artifacts to inspect for `{wp}`\n\n"
        f"| Artifact | Path |\n"
        f"|---|---|\n"
        f"| Work Plan (latest version) | `_COMMUNICATION/team_10/TEAM_10_{wpu}_G3_PLAN_WORK_PLAN_v*.md` |\n"
        f"| GATE_4 QA report | `_COMMUNICATION/team_50/TEAM_50_{wpu}_QA_REPORT_v*.md` |\n"
        f"| Team 20 outputs | `_COMMUNICATION/team_20/` |\n"
        f"| Team 30 outputs | `_COMMUNICATION/team_30/` |\n\n"
        f"You MUST check these files exist and contain valid content before reporting findings.\n\n"
    )

    return (
        f"{_team_header('team_90', 'GATE_5', state, fresh)}"
        f"{cycle_banner}"
        f"# {title}\n\n"
        f"**WP under validation:** `{wp}`\n\n"
        f"## Your Task\n\n"
        f"Perform a **complete, fresh validation** of the implementation for `{wp}`.\n"
        f"Read the actual files listed below. Report only findings you observe in the CURRENT run.\n\n"
        f"## Validation Checklist\n"
        f"1. All spec requirements are implemented (check every item in §Spec below)\n"
        f"2. Code follows project conventions (naming, types, patterns, Iron Rules)\n"
        f"3. Tests exist and pass — GATE_4 PASS is confirmed\n"
        f"4. No architectural violations (maskedLog, status 4-state, NUMERIC(20,8))\n"
        f"5. All required artifacts are present and versioned correctly\n\n"
        f"{dm_section}"
        f"{artifacts}"
        f"## Spec\n\n{state.lld400_content[:3000] if state.lld400_content else state.spec_brief}\n\n"
        f"## MANDATORY: route_recommendation\n\n"
        f"**If BLOCKING_REPORT — you MUST include this field at the very top of your response:**\n\n"
        f"```\nroute_recommendation: doc\n```\n"
        f"OR\n"
        f"```\nroute_recommendation: full\n```\n\n"
        f"**Classification rules:**\n"
        f"- `route_recommendation: doc` — ALL blockers are doc/text only: credentials, file paths,\n"
        f"  governance format, work plan wording, QA contract text. Zero code changes needed.\n"
        f"- `route_recommendation: full` — ANY blocker requires: code changes, architectural fix,\n"
        f"  missing feature, data model change, or mixed doc+code issues.\n\n"
        f"This field drives automatic pipeline routing. Missing or ambiguous = manual block.\n\n"
        f"Respond with: VALIDATION_RESPONSE — PASS or BLOCKING_REPORT."
    )


def _generate_g5_doc_fix_prompt(state: PipelineState) -> str:
    """Generate the Team 10 prompt for fixing admin/doc blockers from GATE_5.

    This is the G5_DOC_FIX gate — an administrative sprint.
    - NO mandate generation
    - NO CURSOR_IMPLEMENTATION activation
    - NO Teams 20/30 code implementation
    - Team 10 fixes docs/artifacts/evidence directly, then ./pipeline_run.sh pass → GATE_5
    """
    wp  = state.work_package_id
    wpu = wp.replace("-", "_")

    # ── Load the GATE_5 blocking report to extract specific blockers ──────────
    t90         = REPO_ROOT / "_COMMUNICATION" / "team_90"
    blocking_report_candidates = [
        t90 / f"TEAM_90_TO_TEAM_10_{wpu}_BLOCKING_REPORT.md",
        t90 / f"TEAM_90_{wpu}_GATE_5_VALIDATION_v1.0.0.md",
        t90 / f"TEAM_90_{wpu}_GATE_5_VERDICT_v1.0.0.md",
    ]
    blocking_report_content = ""
    blocking_report_path    = ""
    for p in blocking_report_candidates:
        if p.exists():
            blocking_report_content = p.read_text(encoding="utf-8")
            blocking_report_path    = str(p.relative_to(REPO_ROOT))
            break

    blockers_section = (
        f"## Blocking Report (from Team 90 — GATE_5 FAIL)\n\n"
        f"Source: `{blocking_report_path}`\n\n"
        + (
            f"```\n{blocking_report_content[:3000]}\n```\n\n"
            if blocking_report_content else
            f"⚠️  Blocking report not found — check `_COMMUNICATION/team_90/` manually.\n\n"
        )
    )

    return (
        f"{_team_header('team_10', 'G5_DOC_FIX', state, fresh=False)}"
        f"╔══════════════════════════════════════════════════════════════╗\n"
        f"║  ⚙  G5_DOC_FIX — ADMINISTRATIVE DOC FIX SPRINT              ║\n"
        f"║                                                              ║\n"
        f"║  GATE_5 failed on documentation/artifact gaps.              ║\n"
        f"║  This is NOT a code issue. You are Team 10.                 ║\n"
        f"║                                                              ║\n"
        f"║  ⛔ DO NOT generate new mandates                             ║\n"
        f"║  ⛔ DO NOT activate Teams 20 or 30 for code implementation   ║\n"
        f"║  ⛔ DO NOT trigger CURSOR_IMPLEMENTATION                     ║\n"
        f"║  ⛔ DO NOT run a full GATE_4 QA cycle                        ║\n"
        f"║                                                              ║\n"
        f"║  ✅ Fix ONLY the doc/artifact gaps listed in the report      ║\n"
        f"║  ✅ Coordinate Team 50 for partial QA re-run if needed       ║\n"
        f"║  ✅ When all fixes are done → ./pipeline_run.sh pass         ║\n"
        f"╚══════════════════════════════════════════════════════════════╝\n\n"
        f"# G5_DOC_FIX — Administrative Doc Fix for `{wp}`\n\n"
        f"**WP:** `{wp}` | **Your role:** Team 10 (Execution Orchestrator)\n\n"
        f"## Your Mission\n\n"
        f"GATE_5 returned `route_recommendation: doc` — all blockers are documentation/artifact gaps.\n"
        f"No code changes are needed. Fix each blocker below and confirm resolution.\n\n"
        f"## Typical doc-fix tasks (check the blocking report below):\n"
        f"- Rename or alias mismatched artifact file paths (Team 20, Team 30, Team 50)\n"
        f"- Write missing completion/closure artifacts for any team that lacks one\n"
        f"- Coordinate Team 50 for a **targeted partial QA re-run** (specific scenarios only)\n"
        f"  — NOT a full GATE_4 cycle; just the N/A or missing test scenarios\n"
        f"- Update work plan artifact references if paths changed\n\n"
        f"{blockers_section}"
        f"## When All Fixes Are Done\n\n"
        f"1. Verify each fix with a quick file-level check\n"
        f"2. Run: `./pipeline_run.sh pass`\n"
        f"   → Pipeline advances directly to **GATE_5** (Team 90 re-validates)\n\n"
        f"⚠️  If during the fix you discover a **code bug** (not a doc gap),\n"
        f"    do NOT fix it yourself — run: `./pipeline_run.sh fail \"code issue found: [description]\"`\n"
        f"    and let the pipeline escalate to a full cycle."
    )


def _generate_gate_6_prompt(state: PipelineState, fresh: bool = False, team_id: str = "team_100") -> str:
    domain_note = (
        f"\n**Domain:** `{state.project_domain}` — Architectural authority for this domain: `{team_id}`\n"
    )
    return (
        f"{_team_header(team_id, 'GATE_6', state, fresh)}"
        f"# GATE_6 — Reality vs Intent\n\n"
        f"Does what was built match what we approved at GATE_2?\n"
        f"{domain_note}\n"
        f"## Approved Spec\n{state.lld400_content[:2000] if state.lld400_content else state.spec_brief}\n\n"
        f"## Implementation Summary\n{', '.join(state.implementation_files[:20]) if state.implementation_files else '[list files created]'}\n\n"
        f"## MANDATORY: route_recommendation\n\n"
        f"**If REJECTED — include at the top of your response:**\n\n"
        f"```\nroute_recommendation: doc\n```  ← minor gaps, code fix only, no re-planning\n"
        f"```\nroute_recommendation: full\n``` ← intent mismatch, needs full re-implementation\n\n"
        f"This field drives automatic pipeline routing. Missing = manual block.\n\n"
        f"Respond with: APPROVED or REJECTED + rejection route."
    )


def _parse_gate7_scenarios(spec_brief: str, page_routes: dict) -> list:
    """Derive actionable test scenarios from spec_brief.

    Parses:
      - Page codes (D15, D22, …) → lookup URL
      - "Click X → DNN" patterns  → navigation scenarios
      - Keywords: badge, count, hidden, list, filter → edge-case scenarios
    """
    import re

    base = "http://localhost:8080"
    scenarios: list = []

    # ── 1. Find all D-codes in order of appearance ─────────────────────────
    codes = list(dict.fromkeys(re.findall(r'\bD(\d+)(?:\.[A-Z]+)?\b', spec_brief)))
    if not codes:
        return [{"name": "Verify feature",
                 "url": base,
                 "steps": ["Open the application", "Navigate to the new feature", "Test the feature"],
                 "pass_if": ["Feature works as specified", "No JS errors in console"]}]

    primary_code = f"D{codes[0]}"
    primary_url  = page_routes.get(primary_code, base)
    spec_lower   = spec_brief.lower()

    # ── 2. Main scenario: open primary page, verify feature renders ─────────
    main_steps: list = [f"Open {primary_url}"]
    main_pass:  list = ["Page loads without errors"]

    if "badge" in spec_lower or "count" in spec_lower:
        n_match = re.search(r'N=(\d+)', spec_brief)
        n = n_match.group(1) if n_match else "N"
        main_steps.append("Verify unread count badge is visible and non-zero")
        main_pass.append(f"Badge shows correct triggered-unread count")
        main_steps.append(f"Verify list shows ≤{n} most-recent alerts")
        main_pass.append(f"List renders ≤{n} items, ordered by recency")

    scenarios.append({
        "name": f"{primary_code} — Feature renders",
        "url":  primary_url,
        "steps": main_steps,
        "pass_if": main_pass,
    })

    # ── 3. Edge case: hidden when count is 0 ───────────────────────────────
    if re.search(r'hidden.{0,30}0|fully hidden|hidden when 0', spec_lower):
        scenarios.append({
            "name": f"{primary_code} — Hidden when empty",
            "url":  primary_url,
            "steps": [
                f"Open {primary_url}",
                "Ensure zero triggered-unread alerts exist (or clear test data)",
                "Verify widget is fully hidden / not rendered",
            ],
            "pass_if": [
                "Widget element absent or display:none / visibility:hidden",
                "No empty container or placeholder shown",
            ],
        })

    # ── 4. Navigation scenarios from "Click X → DNN [qualifier]" patterns ────
    # Capture: click_what, target_code, optional qualifier after DNN
    nav_pattern = re.compile(
        r'[Cc]lick\s+([^→\n.]{1,40})\s*→\s*D(\d+)([^.\n]{0,50})?'
    )
    for m in nav_pattern.finditer(spec_brief):
        click_what  = m.group(1).strip().rstrip(' ,;')
        target_num  = m.group(2)
        qualifier   = (m.group(3) or "").strip()        # e.g. " filtered unread"
        target_code = f"D{target_num}"
        target_url  = page_routes.get(target_code, base)
        # Detect if a filtered/unread view is mentioned in click_what OR qualifier
        is_filtered = bool(re.search(r'filter|unread', click_what + qualifier, re.I))
        pass_criteria = [f"Browser navigates to {target_code} ({target_url})"]
        if is_filtered:
            pass_criteria.append("Page shows filtered view (triggered_unread alerts only)")
        qualifier_label = f" [{qualifier.strip()}]" if qualifier.strip() else ""
        scenarios.append({
            "name": f"{primary_code} → {target_code}  [click {click_what}{qualifier_label}]",
            "url":  primary_url,
            "steps": [
                f"Open {primary_url}",
                f"Click: {click_what}",
                f"Verify browser navigates to {target_url}",
            ],
            "pass_if": pass_criteria,
        })

    return scenarios


def _generate_gate_7_prompt(state: PipelineState) -> str:
    """Human UX sign-off with precise, actionable test scenarios."""
    from ..config import TIKTRACK_PAGE_ROUTES
    SEP = "─" * 60

    page_routes = TIKTRACK_PAGE_ROUTES if state.project_domain == "tiktrack" else {}
    scenarios   = _parse_gate7_scenarios(state.spec_brief, page_routes)

    # ── Build scenario checklist ────────────────────────────────────────────
    checklist_lines: list = []
    for i, s in enumerate(scenarios, 1):
        name   = s["name"]
        url    = s["url"]
        steps  = s.get("steps", ["Open the app", "Test the feature"])
        passes = s.get("pass_if", ["Feature works"])

        steps_str  = "\n         ".join(f"→ {st}" for st in steps)
        passes_str = "\n         ".join(f"✓ {p}" for p in passes)

        checklist_lines.append(
            f"  □ {i}. {name}\n"
            f"       URL:    {url}\n"
            f"       Steps:  {steps_str}\n"
            f"       Pass:   {passes_str}"
        )

    checklist = "\n\n".join(checklist_lines)
    wp        = state.work_package_id

    return (
        f"╔══════════════════════════════════════════════════════════════╗\n"
        f"║  GATE_7 — UX SIGN-OFF              {wp:<27}║\n"
        f"╚══════════════════════════════════════════════════════════════╝\n\n"
        f"Feature: {state.spec_brief}\n\n"
        f"{SEP}\n"
        f"  TEST CHECKLIST  ({len(scenarios)} scenario{'s' if len(scenarios) != 1 else ''})\n"
        f"{SEP}\n\n"
        f"{checklist}\n\n"
        f"{SEP}\n"
        f"  COMMANDS\n"
        f"{SEP}\n\n"
        f"  All scenarios pass:\n"
        f"    ./pipeline_run.sh pass\n\n"
        f"  Issues found:\n"
        f"    ./pipeline_run.sh fail \"UX-001: [describe issue]\"\n"
        f"    ./pipeline_run.sh fail \"UX-001: badge missing; UX-002: D34 nav broken\"\n"
    )


def _generate_gate_8_prompt(state: PipelineState, fresh: bool = False) -> str:
    """GATE_8 two-phase closure: doc team produces AS_MADE_REPORT + archives WP files;
    Team 90 validates archiving and documentation before final WP close."""
    from ..config import DOMAIN_DOC_TEAM
    SEP = "─" * 60

    doc_team   = DOMAIN_DOC_TEAM.get(state.project_domain, "team_70")
    doc_team_n = doc_team.replace("_", " ").title()   # "Team 70"
    wp         = state.work_package_id
    stage      = state.stage_id

    # WP-id filename pattern: S001-P002-WP001 → S001_P002_WP001
    wp_file_pattern = wp.replace("-", "_")
    archive_dest    = f"_COMMUNICATION/_ARCHIVE/{stage}/{wp}/"
    as_made_path    = f"_COMMUNICATION/{doc_team}/{wp_file_pattern}_AS_MADE_REPORT_v1.0.0.md"

    # List of implementation files (if available)
    impl_files = state.implementation_files[:20] if state.implementation_files else []
    impl_block = (
        "\n".join(f"    - {f}" for f in impl_files)
        if impl_files
        else "    [list all files created/modified during implementation]"
    )

    return (
        f"╔══════════════════════════════════════════════════════════════╗\n"
        f"║  GATE_8 — CLOSURE: DOCUMENTATION & ARCHIVING                ║\n"
        f"║  Work Package: {wp:<46}║\n"
        f"╚══════════════════════════════════════════════════════════════╝\n\n"
        f"TWO-PHASE GATE:\n"
        f"  Phase 1 → {doc_team_n}  — Documentation + Archive WP files\n"
        f"  Phase 2 → Team 90  — Validate → PASS (close) or FAIL (back to {doc_team_n})\n\n"
        f"{SEP}\n"
        f"  PHASE 1 — {doc_team_n.upper()}: TWO MANDATORY TASKS\n"
        f"{SEP}\n\n"
        f"TASK A — AS_MADE_REPORT\n\n"
        f"  Write to: {as_made_path}\n\n"
        f"  Required sections:\n"
        f"    1. Feature summary — what was built\n"
        f"    2. Files created / modified:\n"
        f"{impl_block}\n"
        f"    3. API endpoints added / changed (if any)\n"
        f"    4. Migrations or schema changes applied (if any)\n"
        f"    5. Known limitations / deferred items\n"
        f"    6. Notes for future developers (setup, gotchas, dependencies)\n\n"
        f"TASK B — Archive WP communication files\n\n"
        f"  Source pattern:  _COMMUNICATION/team_*/  (files matching: {wp_file_pattern} OR {wp})\n"
        f"  Archive to:      {archive_dest}\n\n"
        f"  Steps:\n"
        f"    1. mkdir -p {archive_dest}\n"
        f"    2. Find:  find _COMMUNICATION/team_*/ -name \"*{wp_file_pattern}*\" -o -name \"*{wp}*\"\n"
        f"    3. Copy all matching files to {archive_dest}\n"
        f"    4. List archived files in AS_MADE_REPORT (Section 7 — Archive manifest)\n\n"
        f"  Keep active (do NOT archive):\n"
        f"    SSM, WSM, PHOENIX_MASTER_WSM, PHOENIX_PROGRAM_REGISTRY, TEAM_ROSTER_LOCK\n\n"
        f"  → When BOTH tasks complete: inform Team 90 to validate.\n\n"
        f"{SEP}\n"
        f"  PHASE 2 — TEAM 90: VALIDATE CLOSURE\n"
        f"{SEP}\n\n"
        f"  Validation checklist:\n"
        f"  □ AS_MADE_REPORT exists at: {as_made_path}\n"
        f"  □ AS_MADE_REPORT has all required sections (1–6 above)\n"
        f"  □ WP files archived to: {archive_dest}\n"
        f"  □ Archive contains gate artifacts (verdicts, blocking reports, work plans)\n"
        f"  □ No unarchived WP-specific files remain in active team folders\n\n"
        f"  If ALL pass:\n"
        f"    ./pipeline_run.sh pass        → WP {wp} CLOSED ✅\n\n"
        f"  If ANY fail (list specific issues):\n"
        f"    ./pipeline_run.sh fail \"CLOSURE-001: [specific issue]\"\n"
        f"    → Returns to {doc_team_n} for correction → re-run GATE_8\n"
    )


def start_pipeline(spec: str, stage: str = "S002", wp_id: str = ""):
    import re
    if not re.match(r"S\d{3}-P\d{3}-WP\d{3}", wp_id or ""):
        _log("ERROR: --wp required (format: S###-P###-WP###)")
        return

    _log("INIT: Updating STATE_SNAPSHOT.json...")
    from ..observers.state_reader import main as update_snapshot
    update_snapshot()
    _log("INIT: STATE_SNAPSHOT updated.")

    state = PipelineState(
        spec_brief=spec,
        stage_id=stage,
        work_package_id=wp_id,
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
        if gate_id == "GATE_2":
            state.current_gate = "WAITING_GATE2_APPROVAL"
        elif gate_id == "GATE_6":
            state.current_gate = "WAITING_GATE6_APPROVAL"
        elif gate_id == "G5_DOC_FIX":
            # Admin block fixed — go directly to GATE_5 re-validation (no GATE_4, no impl teams)
            state.current_gate = "GATE_5"
            _log("G5_DOC_FIX PASS — routing directly to GATE_5 for re-validation")
        else:
            idx = GATE_SEQUENCE.index(gate_id) if gate_id in GATE_SEQUENCE else -1
            if idx >= 0 and idx + 1 < len(GATE_SEQUENCE):
                state.current_gate = GATE_SEQUENCE[idx + 1]
            else:
                state.current_gate = "COMPLETE"
    else:
        state.gates_failed.append(gate_id)
        _log(f"GATE {gate_id} FAILED: {reason}")
        # ── Auto-routing from verdict file ────────────────────────────────────
        # The reviewing team (Team 90, 190, etc.) must include:
        #   route_recommendation: doc   ← doc/governance fixes only
        #   route_recommendation: full  ← code/design issues, full cycle required
        # If found, route automatically. If not found, warn and leave for manual routing.
        if gate_id in FAIL_ROUTING:
            auto_route, verdict_path = _extract_route_recommendation(
                gate_id, state.work_package_id
            )
            if auto_route:
                target_gate, desc = FAIL_ROUTING[gate_id][auto_route]
                _log(f"")
                _log(f"╔══ AUTO-ROUTING (from verdict file) ═══════════════════════╗")
                _log(f"║  Source:       {verdict_path[-70:]}")
                _log(f"║  Detected:     route_recommendation: {auto_route.upper()}")
                _log(f"║  Description:  {desc[:60]}")
                _log(f"║  → Target:     {target_gate}")
                _log(f"╚══════════════════════════════════════════════════════════╝")
                state.current_gate = target_gate
            else:
                # ── Self-loop gate: default_fail_route overrides manual routing ─
                default_route = GATE_CONFIG.get(gate_id, {}).get("default_fail_route")
                if default_route:
                    target_gate, desc = FAIL_ROUTING[gate_id][default_route]
                    _log(f"")
                    _log(f"╔══ CORRECTION CYCLE (self-loop gate) ══════════════════════╗")
                    _log(f"║  Gate:          {gate_id}")
                    _log(f"║  Auto-default:  route={default_route} → {target_gate}")
                    _log(f"║  (Both doc + full routes return to the same gate)")
                    _log(f"║  No route_recommendation needed in verdict file.")
                    _log(f"╚══════════════════════════════════════════════════════════╝")
                    state.current_gate = target_gate
                else:
                    _log(f"")
                    _log(f"╔══ MANUAL ROUTING REQUIRED ════════════════════════════════╗")
                    _log(f"║  Verdict file did not declare route_recommendation.")
                    _log(f"║  The reviewing team MUST include one of:")
                    _log(f"║    route_recommendation: doc   (doc/governance only)")
                    _log(f"║    route_recommendation: full  (code/design issues)")
                    _log(f"║")
                    _log(f"║  Until routing is done, pipeline stays at: {gate_id}")
                    _log(f"║")
                    _log(f"║  To route manually:")
                    _log(f'║    ./pipeline_run.sh route doc  "{(reason or "reason")[:40]}"')
                    _log(f'║    ./pipeline_run.sh route full "{(reason or "reason")[:40]}"')
                    _log(f"╚══════════════════════════════════════════════════════════╝")

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


def store_artifact(gate_id: str, file_path: str):
    """Store agent output file content to the appropriate pipeline state field.

    Gate → field mapping:
      GATE_1                → state.lld400_content
      G3_PLAN               → state.work_plan
      CURSOR_IMPLEMENTATION → state.implementation_files (one path per line)
    """
    path = Path(file_path)
    if not path.exists():
        path = REPO_ROOT / file_path
    if not path.exists():
        _log(f"ERROR: File not found: {file_path}")
        return

    content = path.read_text(encoding="utf-8")
    state = PipelineState.load()

    GATE_TO_FIELD: dict[str, str] = {
        "GATE_1": "lld400_content",
        "G3_PLAN": "work_plan",
        "CURSOR_IMPLEMENTATION": "implementation_files",
    }

    field_name = GATE_TO_FIELD.get(gate_id)
    if not field_name:
        _log(f"ERROR: No state field mapping for gate: {gate_id}")
        _log(f"Supported gates: {', '.join(GATE_TO_FIELD.keys())}")
        return

    if field_name == "implementation_files":
        files = [
            line.strip()
            for line in content.splitlines()
            if line.strip() and not line.startswith("#")
        ]
        state.implementation_files = files
        _log(f"Stored {len(files)} implementation file paths to state.implementation_files")
    else:
        setattr(state, field_name, content)
        _log(f"Stored {len(content)} chars to state.{field_name}")

    state.save()
    _log(f"Gate {gate_id} artifact stored successfully.")


def main():
    parser = argparse.ArgumentParser(description="Agents_OS V2 Pipeline — Team 10 Orchestrator")
    parser.add_argument("--spec", type=str, help="Start pipeline with spec brief")
    parser.add_argument("--status", action="store_true", help="Show pipeline status")
    parser.add_argument("--next", action="store_true", help="Show next action")
    parser.add_argument("--advance", nargs=2, metavar=("GATE", "STATUS"), help="Advance gate: GATE_X PASS|FAIL")
    parser.add_argument("--reason", type=str, default="", help="Failure reason")
    parser.add_argument("--store-artifact", nargs=2, metavar=("GATE", "FILE"),
                        help="Store agent output file to pipeline state. G3_PLAN→work_plan, G3_5→validation, CURSOR_IMPLEMENTATION→impl_files")
    parser.add_argument("--generate-prompt", type=str, metavar="GATE", help="Generate prompt for gate")
    parser.add_argument("--revision-notes", type=str, default="",
                        help="Revision notes to include in prompt (for G3_PLAN after G3_5 FAIL). "
                             "Pass blocker text or path to blocker report file.")
    parser.add_argument("--fresh", action="store_true",
                        help="Prepend full team constitution to prompt (for brand-new sessions). "
                             "Default: lean stamp only (for continuing sessions).")
    parser.add_argument("--stage", type=str, default="S002", help="Stage ID")
    parser.add_argument("--approve", type=str, metavar="GATE", help="Approve gate (GATE_2, GATE_6, GATE_7)")
    parser.add_argument("--reject", type=str, metavar="GATE", help="Reject gate (GATE_2, GATE_6, GATE_7)")
    parser.add_argument("--query", type=str, metavar="GATE", help="Query gate for follow-up (GATE_2, GATE_6)")
    parser.add_argument("--question", type=str, default="", help="Follow-up question for --query")
    parser.add_argument(
        "--route", nargs=2, metavar=("TYPE", "GATE"),
        help="Route pipeline after FAIL: --route doc|full GATE_NAME [--reason 'notes']. "
             "doc = governance/doc fix only → CURSOR_IMPLEMENTATION. "
             "full = substantial issues → G3_PLAN for full cycle."
    )
    parser.add_argument("--wp", type=str, default="", help="Work package ID (format: S###-P###-WP###)")
    parser.add_argument(
        "--force-gate4", action="store_true", dest="force_gate4",
        help="Override commit freshness check before GATE_4 (use when commits exist on a different branch)"
    )
    args = parser.parse_args()

    if args.route:
        route_type, gate_id = args.route
        route_after_fail(gate_id, route_type, args.reason)
    elif args.store_artifact:
        gate_id, file_path = args.store_artifact
        store_artifact(gate_id, file_path)
    elif args.status:
        show_status()
    elif args.next:
        show_next()
    elif args.spec:
        start_pipeline(args.spec, args.stage, args.wp)
    elif args.advance:
        advance_gate(args.advance[0], args.advance[1], args.reason)
    elif args.approve:
        gate = args.approve
        approve_map = {
            "GATE_2": "WAITING_GATE2_APPROVAL",
            "gate2": "WAITING_GATE2_APPROVAL",
            "GATE_6": "WAITING_GATE6_APPROVAL",
            "gate6": "WAITING_GATE6_APPROVAL",
            "GATE_7": "GATE_7",
            "gate7": "GATE_7",
        }
        wait_gate = approve_map.get(gate)
        if wait_gate:
            _log(f"Human APPROVED {gate}")
            advance_gate(wait_gate, "PASS")
        else:
            _log(f"ERROR: --approve only valid for GATE_2, GATE_6, GATE_7 (got {gate})")
    elif args.reject:
        gate = args.reject
        reject_map = {
            "GATE_2": "WAITING_GATE2_APPROVAL",
            "gate2": "WAITING_GATE2_APPROVAL",
            "GATE_6": "WAITING_GATE6_APPROVAL",
            "gate6": "WAITING_GATE6_APPROVAL",
            "GATE_7": "GATE_7",
            "gate7": "GATE_7",
        }
        wait_gate = reject_map.get(gate)
        if wait_gate:
            _log(f"Human REJECTED {gate}: {args.reason}")
            advance_gate(wait_gate, "FAIL", args.reason)
        else:
            _log(f"ERROR: --reject only valid for GATE_2, GATE_6, GATE_7 (got {gate})")
    elif args.query:
        gate = args.query
        if gate in ("GATE_2", "GATE_6"):
            _log(f"QUERY on {gate}: {args.question}")
            _log(f"Re-run --generate-prompt {gate} with updated context, or ask in the Codex/Claude session.")
        else:
            _log(f"ERROR: --query only valid for GATE_2, GATE_6 (got {gate})")
    elif args.generate_prompt:
        # If --revision-notes is a file path, read it; otherwise use as inline text
        revision_notes = ""
        if args.revision_notes:
            rn_path = Path(args.revision_notes)
            if rn_path.exists():
                revision_notes = rn_path.read_text(encoding="utf-8")
            else:
                revision_notes = args.revision_notes
        generate_prompt(
            args.generate_prompt,
            force_gate4=getattr(args, "force_gate4", False),
            revision_notes=revision_notes,
            fresh=getattr(args, "fresh", False),
        )
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
