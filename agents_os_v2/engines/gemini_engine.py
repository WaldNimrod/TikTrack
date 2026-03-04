"""
Agents_OS V2 — Gemini Engine
Teams: 10 (Gateway), 50 (QA), 70 (Librarian), 170 (SSOT)
Used for: GATE_1 (production), GATE_3, GATE_4, GATE_8
"""

from google import genai
from google.genai import types
from .base import BaseEngine, EngineResponse
from ..config import GEMINI_API_KEY, GEMINI_MODEL


class GeminiEngine(BaseEngine):
    engine_type = "gemini"

    def __init__(self, model: str = GEMINI_MODEL, api_key: str = GEMINI_API_KEY):
        self.client = genai.Client(api_key=api_key)
        self.model_name = model

    async def call(self, system_prompt: str, user_message: str) -> EngineResponse:
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=user_message,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.3,
                ),
            )
            text = response.text or ""
            usage = response.usage_metadata
            return EngineResponse(
                content=text,
                model=self.model_name,
                engine_type=self.engine_type,
                input_tokens=getattr(usage, "prompt_token_count", 0) if usage else 0,
                output_tokens=getattr(usage, "candidates_token_count", 0) if usage else 0,
            )
        except Exception as e:
            return EngineResponse(
                content="",
                model=self.model_name,
                engine_type=self.engine_type,
                success=False,
                error=str(e),
            )
