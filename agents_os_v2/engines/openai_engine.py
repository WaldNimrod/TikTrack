"""
Agents_OS V2 — OpenAI Engine
Teams: 90 (The Spy), 190 (Constitutional Validator)
Used for: GATE_0, GATE_1, G3.5, GATE_5, GATE_8
"""

from openai import AsyncOpenAI
from .base import BaseEngine, EngineResponse
from ..config import OPENAI_API_KEY, OPENAI_MODEL


class OpenAIEngine(BaseEngine):
    engine_type = "openai"

    def __init__(self, model: str = OPENAI_MODEL, api_key: str = OPENAI_API_KEY):
        self.client = AsyncOpenAI(api_key=api_key)
        self.model = model

    async def call(self, system_prompt: str, user_message: str) -> EngineResponse:
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                temperature=0.3,
            )
            choice = response.choices[0]
            usage = response.usage
            return EngineResponse(
                content=choice.message.content or "",
                model=self.model,
                engine_type=self.engine_type,
                input_tokens=usage.prompt_tokens if usage else 0,
                output_tokens=usage.completion_tokens if usage else 0,
            )
        except Exception as e:
            return EngineResponse(
                content="",
                model=self.model,
                engine_type=self.engine_type,
                success=False,
                error=str(e),
            )
