"""
Tests for validator_stub.
S001-P001-WP002 | Domain isolation: no TikTrack imports.
"""

import sys
from pathlib import Path

# Ensure agents_os is importable from project root
_root = Path(__file__).resolve().parent.parent.parent
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

from agents_os.validators.validator_stub import run_validation_stub


def test_run_validation_stub_returns_zero():
    """Validator stub returns 0 (success)."""
    assert run_validation_stub() == 0
