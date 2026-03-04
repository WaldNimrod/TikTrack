"""
Agents_OS V2 — Base Engine Interface
All engines implement this interface.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional
import logging

logger = logging.getLogger(__name__)


@dataclass
class EngineResponse:
    """Structured response from any engine."""
    content: str
    model: str
    engine_type: str
    input_tokens: int = 0
    output_tokens: int = 0
    success: bool = True
    error: Optional[str] = None


class BaseEngine(ABC):
    """Abstract base for all LLM engines."""

    engine_type: str = "base"

    @abstractmethod
    async def call(self, system_prompt: str, user_message: str) -> EngineResponse:
        """Send a message and get a response."""
        ...

    async def call_with_retry(
        self, system_prompt: str, user_message: str, max_retries: int = 3
    ) -> EngineResponse:
        """Call with retry on transient failures."""
        last_error = None
        for attempt in range(max_retries):
            try:
                response = await self.call(system_prompt, user_message)
                if response.success:
                    return response
                last_error = response.error
            except Exception as e:
                last_error = str(e)
                logger.warning(f"Engine {self.engine_type} attempt {attempt+1} failed: {e}")
        return EngineResponse(
            content="",
            model="",
            engine_type=self.engine_type,
            success=False,
            error=f"Failed after {max_retries} retries: {last_error}",
        )
