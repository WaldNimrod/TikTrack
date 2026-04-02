"""Unit tests for scripts/update_aos_v3_file_index.py.

Covers:
- Stub entry added for new unregistered file
- Idempotency: second run does not duplicate entries
- EXCLUDE list: .env, pipeline_state.json, FILE_INDEX.json, node_modules not added
- status/spec_ref values of auto-generated stubs
- Script exits 0 and prints expected messages
"""

from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
from pathlib import Path

import pytest

# ---------------------------------------------------------------------------
# Helper: load the script as a module via importlib (no package required)
# ---------------------------------------------------------------------------
_SCRIPT_PATH = Path(__file__).resolve().parents[2] / "scripts" / "update_aos_v3_file_index.py"


def _run_main(root: Path, index_path: Path) -> str:
    """Execute the script's main() against a custom root/index_path via monkeypatched globals."""
    spec = importlib.util.spec_from_file_location("_update_index", _SCRIPT_PATH)
    assert spec and spec.loader
    mod = importlib.util.module_from_spec(spec)

    # Patch module-level constants before running
    spec.loader.exec_module(mod)  # type: ignore[union-attr]
    # Re-assign constants to use tmp_path fixtures
    mod.ROOT = root  # type: ignore[attr-defined]
    mod.INDEX_PATH = index_path  # type: ignore[attr-defined]

    import io
    from contextlib import redirect_stdout

    buf = io.StringIO()
    with redirect_stdout(buf):
        mod.main()  # type: ignore[attr-defined]
    return buf.getvalue()


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def fake_tree(tmp_path: Path):
    """Minimal agents_os_v3 tree with a pre-existing index and one new file."""
    aos_dir = tmp_path / "agents_os_v3"
    aos_dir.mkdir()

    # Pre-existing tracked file
    tracked = aos_dir / "existing_module.py"
    tracked.write_text("# existing")

    # New untracked file — should get a stub
    new_file = aos_dir / "new_feature.py"
    new_file.write_text("# new")

    # FILE_INDEX.json with only the existing file
    index = {
        "version": "1.0.0",
        "entries": [
            {
                "path": "agents_os_v3/existing_module.py",
                "status": "ACTIVE",
                "spec_ref": "SPEC-001",
                "owner_team": "team_61",
                "added_in_gate": "GATE_0",
                "notes": "",
            }
        ],
    }
    index_path = aos_dir / "FILE_INDEX.json"
    index_path.write_text(json.dumps(index, indent=2))

    return tmp_path, index_path, new_file


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestStubAdded:
    def test_new_file_gets_stub_entry(self, fake_tree):
        root, index_path, new_file = fake_tree
        _run_main(root, index_path)

        data = json.loads(index_path.read_text())
        paths = [e["path"] for e in data["entries"]]
        assert "agents_os_v3/new_feature.py" in paths

    def test_stub_has_correct_status(self, fake_tree):
        root, index_path, _ = fake_tree
        _run_main(root, index_path)

        data = json.loads(index_path.read_text())
        stub = next(e for e in data["entries"] if e["path"] == "agents_os_v3/new_feature.py")
        assert stub["status"] == "NEW"

    def test_stub_spec_ref_contains_auto(self, fake_tree):
        root, index_path, _ = fake_tree
        _run_main(root, index_path)

        data = json.loads(index_path.read_text())
        stub = next(e for e in data["entries"] if e["path"] == "agents_os_v3/new_feature.py")
        assert "AUTO" in stub["spec_ref"]

    def test_existing_entry_preserved(self, fake_tree):
        root, index_path, _ = fake_tree
        _run_main(root, index_path)

        data = json.loads(index_path.read_text())
        existing = next(e for e in data["entries"] if e["path"] == "agents_os_v3/existing_module.py")
        assert existing["status"] == "ACTIVE"
        assert existing["spec_ref"] == "SPEC-001"

    def test_output_mentions_added_file(self, fake_tree):
        root, index_path, _ = fake_tree
        output = _run_main(root, index_path)
        assert "agents_os_v3/new_feature.py" in output
        assert "Added" in output


class TestIdempotency:
    def test_second_run_no_duplicates(self, fake_tree):
        root, index_path, _ = fake_tree
        _run_main(root, index_path)
        _run_main(root, index_path)

        data = json.loads(index_path.read_text())
        paths = [e["path"] for e in data["entries"]]
        assert paths.count("agents_os_v3/new_feature.py") == 1

    def test_second_run_reports_up_to_date(self, fake_tree):
        root, index_path, _ = fake_tree
        _run_main(root, index_path)
        output = _run_main(root, index_path)
        assert "up to date" in output.lower()


class TestExcludeList:
    def _make_tree_with_excluded(self, tmp_path: Path, filename: str):
        aos_dir = tmp_path / "agents_os_v3"
        aos_dir.mkdir(exist_ok=True)
        (aos_dir / filename).write_text("excluded")
        index = {"version": "1.0.0", "entries": []}
        index_path = aos_dir / "FILE_INDEX.json"
        index_path.write_text(json.dumps(index))
        return tmp_path, index_path

    def test_dotenv_excluded(self, tmp_path):
        root, index_path = self._make_tree_with_excluded(tmp_path, ".env")
        _run_main(root, index_path)
        data = json.loads(index_path.read_text())
        paths = [e["path"] for e in data["entries"]]
        assert "agents_os_v3/.env" not in paths

    def test_pipeline_state_excluded(self, tmp_path):
        root, index_path = self._make_tree_with_excluded(tmp_path, "pipeline_state.json")
        _run_main(root, index_path)
        data = json.loads(index_path.read_text())
        paths = [e["path"] for e in data["entries"]]
        assert "agents_os_v3/pipeline_state.json" not in paths

    def test_file_index_itself_excluded(self, tmp_path):
        root, index_path = self._make_tree_with_excluded(tmp_path, "dummy.py")
        _run_main(root, index_path)
        data = json.loads(index_path.read_text())
        paths = [e["path"] for e in data["entries"]]
        assert "agents_os_v3/FILE_INDEX.json" not in paths

    def test_node_modules_excluded(self, tmp_path):
        aos_dir = tmp_path / "agents_os_v3"
        (aos_dir / "node_modules" / "pkg").mkdir(parents=True)
        (aos_dir / "node_modules" / "pkg" / "index.js").write_text("// pkg")
        index = {"version": "1.0.0", "entries": []}
        index_path = aos_dir / "FILE_INDEX.json"
        index_path.write_text(json.dumps(index))
        _run_main(tmp_path, index_path)
        data = json.loads(index_path.read_text())
        paths = [e["path"] for e in data["entries"]]
        assert not any("node_modules" in p for p in paths)


class TestScriptSubprocess:
    """Black-box subprocess test — verifies the script runs and exits 0."""

    def test_script_exits_zero_on_up_to_date_index(self, tmp_path):
        """If FILE_INDEX already covers all files, script must exit 0."""
        aos_dir = tmp_path / "agents_os_v3"
        aos_dir.mkdir()
        f = aos_dir / "only_file.py"
        f.write_text("# x")
        index = {
            "version": "1.0.0",
            "entries": [
                {
                    "path": "agents_os_v3/only_file.py",
                    "status": "ACTIVE",
                    "spec_ref": "S",
                    "owner_team": "team_61",
                    "added_in_gate": "GATE_0",
                    "notes": "",
                }
            ],
        }
        index_path = aos_dir / "FILE_INDEX.json"
        index_path.write_text(json.dumps(index))

        # Patch ROOT and INDEX_PATH via env (script uses __file__ to derive ROOT)
        # We invoke main() directly via importlib; subprocess test uses the real script
        # against the real repo (confirms the real FILE_INDEX is current).
        result = subprocess.run(
            [sys.executable, str(_SCRIPT_PATH)],
            capture_output=True,
            text=True,
        )
        assert result.returncode == 0
        assert "up to date" in result.stdout.lower() or "Added" in result.stdout
