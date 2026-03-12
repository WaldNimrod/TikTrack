"""
Test Template Generator — main interface.
Input: spec document path or content
Output: generated test files written to tests/api/ and tests/ui/
"""

from __future__ import annotations

import re
import shutil
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

from .spec_parser import APIContract, PageContract, parse_api_contracts, parse_page_contracts


@dataclass
class GeneratorResult:
    generated_files: list[Path]
    skipped_sections: list[str]
    blocks: list[str]


def _to_class_name(value: str) -> str:
    """Convert endpoint like /api/v1/settings/ to SettingsApi."""
    if not value:
        return "Api"
    # Get last non-empty path segment
    parts = [p for p in value.strip("/").split("/") if p]
    if not parts:
        return "Api"
    last = parts[-1]
    # Capitalize and add Api if it looks like an endpoint
    base = "".join(w.capitalize() for w in re.sub(r"[^a-z0-9]+", " ", last.lower()).split())
    return base + "Api" if base else "Api"


def _to_snake(value: str) -> str:
    """Convert CamelCase to snake_case."""
    if not value:
        return ""
    s = re.sub(r"(?<!^)(?=[A-Z])", "_", value)
    return s.lower()


def _create_env(templates_dir: Path) -> Environment:
    env = Environment(
        loader=FileSystemLoader(str(templates_dir)),
        autoescape=select_autoescape(),
    )
    env.filters["to_class_name"] = _to_class_name
    env.filters["to_snake"] = _to_snake
    return env


def generate_test_templates(
    spec_path: Path,
    output_base: Path,
    force: bool = False,
) -> GeneratorResult:
    """
    Parse spec, generate API and UI test scaffolds.
    Returns GeneratorResult with generated_files, skipped_sections, blocks (TT-00).
    """
    generated_files: list[Path] = []
    skipped_sections: list[str] = []
    blocks: list[str] = []

    if not spec_path.exists():
        blocks.append(f"Spec file not found: {spec_path}")
        return GeneratorResult(
            generated_files=[],
            skipped_sections=[],
            blocks=blocks,
        )

    spec_content = spec_path.read_text(encoding="utf-8")
    api_contracts = parse_api_contracts(spec_content)
    page_contracts = parse_page_contracts(spec_content)

    # TT-00: section present but no parseable table
    api_section_present = "## API Contracts" in spec_content
    page_section_present = "## Page Contracts" in spec_content

    if api_section_present and len(api_contracts) == 0 and len(page_contracts) == 0:
        blocks.append(
            "TT-00: Spec section '## API Contracts' found but zero parseable contract tables extracted. "
            "Verify table format matches: | Endpoint | Method | Request | Response | Auth |"
        )
        return GeneratorResult(
            generated_files=[],
            skipped_sections=[],
            blocks=blocks,
        )

    if page_section_present and len(page_contracts) == 0 and len(api_contracts) == 0:
        blocks.append(
            "TT-00: Spec section '## Page Contracts' found but zero parseable contract tables extracted. "
            "Verify table format matches: | Page ID | Route | Components |"
        )
        return GeneratorResult(
            generated_files=[],
            skipped_sections=[],
            blocks=blocks,
        )

    # No sections at all → SKIP
    if not api_section_present and not page_section_present:
        skipped_sections.append("API Contracts")
        skipped_sections.append("Page Contracts")
        return GeneratorResult(
            generated_files=[],
            skipped_sections=skipped_sections,
            blocks=[],
        )

    # Partial: some sections parsed, some empty
    if api_section_present and len(api_contracts) == 0:
        skipped_sections.append("API Contracts")
    if page_section_present and len(page_contracts) == 0:
        skipped_sections.append("Page Contracts")

    templates_dir = Path(__file__).resolve().parent / "templates"
    env = _create_env(templates_dir)
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    api_out = output_base / "api"
    ui_out = output_base / "ui"
    api_out.mkdir(parents=True, exist_ok=True)
    ui_out.mkdir(parents=True, exist_ok=True)

    if api_contracts:
        filename = "test_generated_api.py"
        out_path = api_out / filename
        if out_path.exists() and not force:
            # Skip overwrite when force=False
            pass
        else:
            if out_path.exists() and force:
                backup = out_path.with_suffix(".pre_regen.py")
                shutil.copy2(out_path, backup)
            template = env.get_template("api_test.py.jinja")
            content = template.render(
                filename=filename,
                generation_timestamp=timestamp,
                api_contracts=api_contracts,
            )
            out_path.write_text(content, encoding="utf-8")
            generated_files.append(out_path)

    if page_contracts:
        filename = "test_generated_ui.py"
        out_path = ui_out / filename
        if out_path.exists() and not force:
            pass
        else:
            if out_path.exists() and force:
                backup = out_path.with_suffix(".pre_regen.py")
                shutil.copy2(out_path, backup)
            template = env.get_template("ui_test.py.jinja")
            content = template.render(
                filename=filename,
                generation_timestamp=timestamp,
                page_contracts=page_contracts,
            )
            out_path.write_text(content, encoding="utf-8")
            generated_files.append(out_path)

    return GeneratorResult(
        generated_files=generated_files,
        skipped_sections=skipped_sections,
        blocks=blocks,
    )
