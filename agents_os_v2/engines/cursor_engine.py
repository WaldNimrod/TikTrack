"""
Agents_OS V2 — Cursor Prompt Engine
Teams: 20 (Backend), 30 (Frontend), 40 (UI/Design), 60 (DevOps)
Used for: G3.7 (implementation)

No API — generates ready-to-paste prompt files.
The human pastes the prompt into a Cursor Composer session.
"""

from datetime import datetime
from pathlib import Path
from .base import BaseEngine, EngineResponse
from ..config import AGENTS_OS_OUTPUT_DIR


class CursorEngine(BaseEngine):
    engine_type = "cursor"

    async def call(self, system_prompt: str, user_message: str) -> EngineResponse:
        return await self.generate_prompt_file(system_prompt, user_message, "cursor_prompt")

    async def generate_prompt_file(
        self, system_prompt: str, user_message: str, filename: str
    ) -> EngineResponse:
        output_dir = AGENTS_OS_OUTPUT_DIR / "prompts"
        output_dir.mkdir(parents=True, exist_ok=True)
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        prompt_file = output_dir / f"{filename}_{ts}.md"

        content = (
            f"# Cursor Composer Prompt\n\n"
            f"**Paste this entire content into a Cursor Composer session.**\n\n"
            f"---\n\n"
            f"{system_prompt}\n\n"
            f"---\n\n"
            f"## Task\n\n"
            f"{user_message}\n"
        )
        prompt_file.write_text(content, encoding="utf-8")

        try:
            latest_link = output_dir / f"{filename}_latest.md"
            if latest_link.is_symlink() or latest_link.exists():
                latest_link.unlink()
            latest_link.symlink_to(prompt_file.name)
        except OSError:
            pass

        return EngineResponse(
            content=f"Prompt saved to {prompt_file}. Paste into Cursor Composer.",
            model="cursor-composer",
            engine_type=self.engine_type,
        )
