"""
Validator abstract base — LLD400 §2.5.
Exit code protocol: 0=PASS, 1=BLOCK, 2=HOLD.
"""

from abc import ABC, abstractmethod
from enum import IntEnum
from typing import List, Optional, Tuple


class ExitCode(IntEnum):
    """Canonical exit codes per LLD400."""

    PASS = 0
    BLOCK = 1
    HOLD = 2


class ValidatorResult:
    """Single validation check result."""

    def __init__(
        self,
        check_id: str,
        passed: bool,
        message: str = "",
        detail: Optional[str] = None,
    ):
        self.check_id = check_id
        self.passed = passed
        self.message = message
        self.detail = detail


class ValidatorBase(ABC):
    """
    Abstract validator with exit-code protocol.
    Subclasses implement _run() returning list of ValidatorResult.
    """

    def __init__(self, check_prefix: str = ""):
        self.check_prefix = check_prefix

    @abstractmethod
    def _run(self, content: str, context: Optional[dict] = None) -> List[ValidatorResult]:
        """Run validation checks. Override in subclass."""
        pass

    def run(self, content: str, context: Optional[dict] = None) -> Tuple[ExitCode, List[ValidatorResult]]:
        """
        Execute validation. Returns (exit_code, results).
        BLOCK if any check fails; HOLD only when explicitly raised.
        """
        results = self._run(content, context)
        failed = [r for r in results if not r.passed]
        if failed:
            return ExitCode.BLOCK, results
        return ExitCode.PASS, results
