"""Structured errors for HTTP mapping (UC catalog codes)."""

from __future__ import annotations

from typing import Any, Optional


class StateMachineError(Exception):
    __slots__ = ("code", "status_code", "details")

    def __init__(
        self,
        code: str,
        status_code: int,
        message: Optional[str] = None,
        details: Optional[dict[str, Any]] = None,
    ) -> None:
        super().__init__(message or code)
        self.code = code
        self.status_code = status_code
        self.details = details or {}
