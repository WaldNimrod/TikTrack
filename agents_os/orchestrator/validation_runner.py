"""
Validation runner — CLI.
Produces canonical PASS/BLOCK/HOLD output.
"""

import argparse
import sys
from pathlib import Path

from agents_os.validators.base.validator_base import ExitCode
from agents_os.validators.base.response_generator import generate_response
from agents_os.validators.spec.tier1_identity_header import Tier1IdentityHeaderValidator
from agents_os.validators.spec.tier2_section_structure import Tier2SectionStructureValidator
from agents_os.validators.spec.tier3_gate_model import Tier3GateModelValidator
from agents_os.validators.spec.tier4_wsm_alignment import Tier4WsmAlignmentValidator
from agents_os.validators.spec.tier5_domain_isolation import Tier5DomainIsolationValidator
from agents_os.validators.spec.tier6_package_completeness import Tier6PackageCompletenessValidator
from agents_os.validators.spec.tier7_lod200_traceability import Tier7Lod200TraceabilityValidator
from agents_os.llm_gate.quality_judge import quality_judge


def _find_project_root() -> Path:
    p = Path(__file__).resolve()
    while p.name and p.name != "agents_os":
        p = p.parent
    return p.parent if p.name == "agents_os" else Path.cwd()


def run_spec_validation(artifact_path: str, package_path: str = "") -> int:
    """
    Run full spec validation pipeline.
    Returns exit code: 0=PASS, 1=BLOCK, 2=HOLD.
    """
    root = _find_project_root()
    path = root / artifact_path if not Path(artifact_path).is_absolute() else Path(artifact_path)
    if not path.exists():
        print(f"BLOCK: Artifact not found: {path}")
        return int(ExitCode.BLOCK)

    content = path.read_text(encoding="utf-8")
    context = {"package_path": package_path} if package_path else {}

    validators = [
        Tier1IdentityHeaderValidator(),
        Tier2SectionStructureValidator(),
        Tier3GateModelValidator(),
        Tier4WsmAlignmentValidator(),
        Tier5DomainIsolationValidator(),
        Tier6PackageCompletenessValidator(),
        Tier7Lod200TraceabilityValidator(),
    ]

    all_results = []
    final_exit = ExitCode.PASS

    for v in validators:
        ec, results = v.run(content, context)
        all_results.extend(results)
        if ec == ExitCode.BLOCK:
            final_exit = ExitCode.BLOCK

    if final_exit == ExitCode.PASS:
        ec_llm, reason = quality_judge(content, context, llm_call=None)
        if ec_llm == ExitCode.HOLD:
            final_exit = ExitCode.HOLD
            from agents_os.validators.base.validator_base import ValidatorResult
            all_results.append(ValidatorResult("Q-HOLD", False, reason, None))

    resp = generate_response(final_exit, all_results, artifact_path, "")
    print(resp["verdict"])
    print(f"exit_code={resp['exit_code']} passed={resp['passed']} failed={resp['failed']}")
    return resp["exit_code"]


def main() -> None:
    parser = argparse.ArgumentParser(description="Agents_OS Spec Validation Runner")
    parser.add_argument("artifact", help="Path to spec artifact (e.g. LLD400 markdown)")
    parser.add_argument("--package", default="", help="Submission package path (for Tier6)")
    args = parser.parse_args()
    exit_code = run_spec_validation(args.artifact, args.package)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
