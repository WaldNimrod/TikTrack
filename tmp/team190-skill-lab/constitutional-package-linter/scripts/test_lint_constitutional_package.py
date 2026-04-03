#!/usr/bin/env python3
from __future__ import annotations

import pathlib
import tempfile
import textwrap
import unittest

from lint_constitutional_package import lint_file


class ConstitutionalPackageLinterTests(unittest.TestCase):
    def _write_temp(self, content: str) -> pathlib.Path:
        tmpdir = tempfile.TemporaryDirectory()
        self.addCleanup(tmpdir.cleanup)
        path = pathlib.Path(tmpdir.name) / "fixture.md"
        path.write_text(textwrap.dedent(content).strip() + "\n", encoding="utf-8")
        return path

    def test_passes_clean_revalidation_package(self) -> None:
        path = self._write_temp(
            """
            ---
            date: 2026-03-15
            status: REVALIDATION_REQUEST
            ---

            ## Mandatory Identity Header

            | Field | Value |
            |---|---|
            | phase_owner | Team 170 |

            correction_cycle: BF-01, BF-02
            """
        )
        findings = lint_file(path, today=__import__("datetime").date(2026, 3, 16))
        self.assertEqual(findings, [])

    def test_flags_placeholder_phase_owner_and_missing_correction_cycle(self) -> None:
        path = self._write_temp(
            """
            ---
            date: 2026-03-15
            status: REVALIDATION_REQUEST
            ---

            ## Mandatory Identity Header

            | Field | Value |
            |---|---|
            | phase_owner | RECEIVING_TEAM |
            """
        )
        findings = lint_file(path, today=__import__("datetime").date(2026, 3, 16))
        ids = {finding.finding_id for finding in findings}
        self.assertIn("CPL-003", ids)
        self.assertIn("CPL-004", ids)

    def test_flags_future_date(self) -> None:
        path = self._write_temp(
            """
            ---
            date: 2026-03-17
            ---
            """
        )
        findings = lint_file(path, today=__import__("datetime").date(2026, 3, 16))
        ids = {finding.finding_id for finding in findings}
        self.assertIn("CPL-002", ids)

    def test_flags_validation_result_schema_gaps(self) -> None:
        path = self._write_temp(
            """
            ---
            date: 2026-03-15
            status: VALIDATION_RESULT
            ---

            | finding_id | severity | status | description |
            |---|---|---|---|
            | BF-01 | BLOCKER | OPEN | Example |
            """
        )
        findings = lint_file(path, today=__import__("datetime").date(2026, 3, 16))
        ids = {finding.finding_id for finding in findings}
        self.assertIn("CPL-005", ids)
        self.assertIn("CPL-006", ids)


if __name__ == "__main__":
    unittest.main()
