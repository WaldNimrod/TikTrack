"""
Agents_OS V2 — Claude Code CLI Engine
Teams: 00 (Architect), 100 (Architecture Authority)
Used for: GATE_2 (intent approval), GATE_6 (reality validation)

Uses Claude Code CLI (`claude`) via subprocess.
Falls back to generating a prompt file if CLI is not available.
"""

import asyncio
import shutil
import json
from pathlib import Path
from .base import BaseEngine, EngineResponse
from ..config import AGENTS_OS_OUTPUT_DIR


class ClaudeEngine(BaseEngine):
    engine_type = "claude"

    def __init__(self):
        self.cli_path = shutil.which("claude")

    def is_available(self) -> bool:
        return self.cli_path is not None

    async def call(self, system_prompt: str, user_message: str) -> EngineResponse:
        if not self.is_available():
            return await self._fallback_to_file(system_prompt, user_message)
        return await self._call_cli(system_prompt, user_message)

    async def _call_cli(self, system_prompt: str, user_message: str) -> EngineResponse:
        try:
            full_prompt = f"{system_prompt}\n\n---\n\n{user_message}"
            process = await asyncio.create_subprocess_exec(
                self.cli_path, "--print", "-p", full_prompt,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await asyncio.wait_for(
                process.communicate(), timeout=300
            )
            if process.returncode == 0:
                return EngineResponse(
                    content=stdout.decode("utf-8", errors="replace"),
                    model="claude-code-cli",
                    engine_type=self.engine_type,
                )
            return EngineResponse(
                content="",
                model="claude-code-cli",
                engine_type=self.engine_type,
                success=False,
                error=stderr.decode("utf-8", errors="replace"),
            )
        except asyncio.TimeoutError:
            return EngineResponse(
                content="",
                model="claude-code-cli",
                engine_type=self.engine_type,
                success=False,
                error="Claude CLI timed out after 300s",
            )
        except Exception as e:
            return EngineResponse(
                content="",
                model="claude-code-cli",
                engine_type=self.engine_type,
                success=False,
                error=str(e),
            )

    async def _fallback_to_file(self, system_prompt: str, user_message: str) -> EngineResponse:
        """When CLI is not available, save prompt to file for manual execution."""
        output_dir = AGENTS_OS_OUTPUT_DIR / "prompts"
        output_dir.mkdir(parents=True, exist_ok=True)
        prompt_file = output_dir / "claude_pending_prompt.md"
        prompt_file.write_text(
            f"# Claude Code Prompt (Manual Execution Required)\n\n"
            f"## System\n{system_prompt}\n\n"
            f"## Message\n{user_message}\n",
            encoding="utf-8",
        )
        return EngineResponse(
            content=f"[MANUAL] Prompt saved to {prompt_file}. Run in Claude Code manually.",
            model="claude-code-cli-fallback",
            engine_type=self.engine_type,
            success=True,
        )
