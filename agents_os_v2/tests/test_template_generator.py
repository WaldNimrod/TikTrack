"""
Test Template Generator tests — S003-P002 WP001.
15 tests per activation prompt STEP 4.
"""

from __future__ import annotations

import subprocess
from pathlib import Path

import pytest

from agents_os_v2.generators.spec_parser import (
    APIContract,
    PageContract,
    parse_api_contracts,
    parse_page_contracts,
)
from agents_os_v2.generators.test_templates import (
    GeneratorResult,
    generate_test_templates,
)

FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"
SAMPLE_SPEC = FIXTURES_DIR / "sample_spec_with_contracts.md"
GENERATORS_DIR = Path(__file__).resolve().parent.parent / "generators"


# --- Parser tests ---


def test_parse_api_contracts_standard_table():
    content = SAMPLE_SPEC.read_text()
    contracts = parse_api_contracts(content)
    assert len(contracts) == 1
    c = contracts[0]
    assert c.endpoint == "/api/v1/settings/"
    assert c.method == "GET"
    assert c.request_shape == "—"
    assert "settings" in c.response_shape
    assert c.auth_required is True


def test_parse_page_contracts_standard_table():
    content = SAMPLE_SPEC.read_text()
    contracts = parse_page_contracts(content)
    assert len(contracts) == 1
    c = contracts[0]
    assert c.page_id == "D39"
    assert c.route == "/settings"
    assert c.components == ["SettingsForm", "StatusBadge"]


def test_parse_no_section_returns_empty():
    content = "# Some spec\n\nNo contract sections here."
    assert parse_api_contracts(content) == []
    assert parse_page_contracts(content) == []


def test_tt00_block_empty_section(tmp_path):
    spec = tmp_path / "spec.md"
    spec.write_text(
        "# Spec\n\n## API Contracts\n\n"
        "(table missing — header only)\n"
    )
    result = generate_test_templates(spec, tmp_path / "out", force=True)
    assert len(result.blocks) > 0
    assert "TT-00" in str(result.blocks) or "API Contracts" in str(result.blocks)
    assert len(result.generated_files) == 0


def test_generate_api_test_file_created(tmp_path):
    spec = tmp_path / "spec.md"
    spec.write_text(
        "# Spec\n\n## API Contracts\n\n"
        "| Endpoint | Method | Request | Response | Auth |\n"
        "|----------|--------|---------|----------|------|\n"
        "| /api/v1/foo/ | GET | — | {} | Required |\n"
    )
    result = generate_test_templates(spec, tmp_path, force=True)
    api_dir = tmp_path / "api"
    assert api_dir.exists()
    api_file = api_dir / "test_generated_api.py"
    assert api_file.exists()
    assert api_file in result.generated_files or any(
        str(p).endswith("test_generated_api.py") for p in result.generated_files
    )


def test_generate_ui_test_file_created(tmp_path):
    spec = tmp_path / "spec.md"
    spec.write_text(
        "# Spec\n\n## Page Contracts\n\n"
        "| Page ID | Route | Components |\n"
        "|---------|-------|-------------|\n"
        "| D1 | /foo | Bar, Baz |\n"
    )
    result = generate_test_templates(spec, tmp_path, force=True)
    ui_dir = tmp_path / "ui"
    assert ui_dir.exists()
    ui_file = ui_dir / "test_generated_ui.py"
    assert ui_file.exists()


def test_generate_output_is_valid_python(tmp_path):
    spec = tmp_path / "spec.md"
    spec.write_text(
        "# Spec\n\n## API Contracts\n\n"
        "| Endpoint | Method | Request | Response | Auth |\n"
        "|----------|--------|---------|----------|------|\n"
        "| /api/v1/x/ | GET | — | {} | Required |\n"
    )
    result = generate_test_templates(spec, tmp_path, force=True)
    assert result.generated_files
    for p in result.generated_files:
        content = p.read_text()
        compile(content, str(p), "exec")


def test_generate_skip_when_no_contracts(tmp_path):
    spec = tmp_path / "spec.md"
    spec.write_text("# Spec\n\nNo contract sections.")
    result = generate_test_templates(spec, tmp_path, force=True)
    assert len(result.generated_files) == 0
    assert len(result.skipped_sections) > 0
    assert result.blocks == []


def test_idempotency_backup_on_rerun(tmp_path):
    spec = tmp_path / "spec.md"
    spec.write_text(
        "# Spec\n\n## API Contracts\n\n"
        "| Endpoint | Method | Request | Response | Auth |\n"
        "|----------|--------|---------|----------|------|\n"
        "| /api/v1/x/ | GET | — | {} | Required |\n"
    )
    out_base = tmp_path / "out"
    generate_test_templates(spec, out_base, force=True)
    api_file = out_base / "api" / "test_generated_api.py"
    assert api_file.exists()
    original_content = api_file.read_text()
    generate_test_templates(spec, out_base, force=True)
    backup = out_base / "api" / "test_generated_api.pre_regen.py"
    assert backup.exists()
    assert backup.read_text() == original_content


def test_no_import_from_api():
    result = subprocess.run(
        ["grep", "-r", "-l", "from api\\.", str(GENERATORS_DIR)],
        capture_output=True,
        text=True,
    )
    assert result.returncode != 0 or result.stdout.strip() == ""


def test_no_import_from_orchestrator():
    result = subprocess.run(
        ["grep", "-r", "-l", "from agents_os_v2.orchestrator", str(GENERATORS_DIR)],
        capture_output=True,
        text=True,
    )
    assert result.returncode != 0 or result.stdout.strip() == ""


def test_jinja2_template_renders():
    from jinja2 import Environment, FileSystemLoader, select_autoescape

    def to_class_name(v):
        return "SettingsApi" if "settings" in v.lower() else "Api"

    env = Environment(
        loader=FileSystemLoader(str(GENERATORS_DIR / "templates")),
        autoescape=select_autoescape(),
    )
    env.filters["to_class_name"] = to_class_name
    env.filters["to_snake"] = lambda v: v.replace(" ", "_").lower() if v else ""
    template = env.get_template("api_test.py.jinja")
    contracts = [
        APIContract(
            endpoint="/api/v1/settings/",
            method="GET",
            request_shape="—",
            response_shape="{}",
            auth_required=True,
        )
    ]
    out = template.render(
        filename="test_api.py",
        generation_timestamp="2026-01-01T00:00:00Z",
        api_contracts=contracts,
    )
    assert "class Test" in out
    assert "/api/v1/settings/" in out
    assert "pytest" in out
    compile(out.replace("...", "pass"), "<string>", "exec")


def test_ui_template_renders():
    from jinja2 import Environment, FileSystemLoader, select_autoescape

    env = Environment(
        loader=FileSystemLoader(str(GENERATORS_DIR / "templates")),
        autoescape=select_autoescape(),
    )
    env.filters["to_snake"] = lambda v: "".join(
        ("_" + c.lower() if c.isupper() else c for c in v)
    ).lstrip("_")

    template = env.get_template("ui_test.py.jinja")
    pages = [
        PageContract(
            page_id="D39",
            route="/settings",
            components=["SettingsForm", "StatusBadge"],
        )
    ]
    out = template.render(
        filename="test_ui.py",
        generation_timestamp="2026-01-01T00:00:00Z",
        page_contracts=pages,
    )
    assert "TestD39Page" in out
    assert "/settings" in out
    assert "SettingsForm" in out
    assert "StatusBadge" in out
    compile(out.replace("...", "pass"), "<string>", "exec")


def test_generator_result_lists_generated_files(tmp_path):
    spec = tmp_path / "spec.md"
    spec.write_text(SAMPLE_SPEC.read_text())
    result = generate_test_templates(spec, tmp_path, force=True)
    assert len(result.generated_files) >= 1
    for p in result.generated_files:
        assert p.exists()


def test_mixed_sections_partial_generation(tmp_path):
    spec = tmp_path / "spec.md"
    spec.write_text(
        "# Spec\n\n"
        "## API Contracts\n\n"
        "| Endpoint | Method | Request | Response | Auth |\n"
        "|----------|--------|---------|----------|------|\n"
        "| /api/v1/settings/ | GET | — | {} | Required |\n\n"
        "## Page Contracts\n\n"
        "(header only — no table)\n"
    )
    result = generate_test_templates(spec, tmp_path, force=True)
    assert len(result.blocks) == 0, "No TT-00 in partial generation"
    assert any("Page Contracts" in s for s in result.skipped_sections)
    assert len(result.generated_files) >= 1
    api_file = tmp_path / "api" / "test_generated_api.py"
    assert api_file.exists()
    assert api_file.read_text()
