"""
Tests for Agents_OS V2 Engines.
Tests OpenAI and Gemini with real API calls (requires keys).
Tests Claude CLI availability.
Tests Cursor prompt file generation.
"""

import asyncio
import os
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from agents_os_v2.engines.base import EngineResponse
from agents_os_v2.engines.openai_engine import OpenAIEngine
from agents_os_v2.engines.gemini_engine import GeminiEngine
from agents_os_v2.engines.claude_engine import ClaudeEngine
from agents_os_v2.engines.cursor_engine import CursorEngine
from agents_os_v2.config import OPENAI_API_KEY, GEMINI_API_KEY


class TestEngineResponse:
    def test_default_success(self):
        r = EngineResponse(content="test", model="m", engine_type="t")
        assert r.success is True
        assert r.error is None

    def test_failure(self):
        r = EngineResponse(content="", model="m", engine_type="t", success=False, error="fail")
        assert r.success is False
        assert r.error == "fail"


@pytest.mark.skipif(not OPENAI_API_KEY, reason="OPENAI_API_KEY not set")
class TestOpenAIEngine:
    @pytest.mark.asyncio
    async def test_simple_call(self):
        engine = OpenAIEngine()
        response = await engine.call(
            system_prompt="You are a test assistant. Reply with exactly: PONG",
            user_message="PING",
        )
        assert response.success, f"OpenAI failed: {response.error}"
        assert "PONG" in response.content.upper()
        assert response.engine_type == "openai"
        assert response.input_tokens > 0

    @pytest.mark.asyncio
    async def test_structured_response(self):
        engine = OpenAIEngine()
        response = await engine.call(
            system_prompt="You are Team 90. Reply with JSON: {\"status\": \"PASS\", \"gate\": \"GATE_5\"}",
            user_message="Validate this work package.",
        )
        assert response.success, f"OpenAI failed: {response.error}"
        assert "PASS" in response.content or "pass" in response.content


@pytest.mark.skipif(not GEMINI_API_KEY, reason="GEMINI_API_KEY not set")
class TestGeminiEngine:
    @pytest.mark.asyncio
    async def test_simple_call(self):
        engine = GeminiEngine()
        response = await engine.call(
            system_prompt="You are a test assistant. Reply with exactly: PONG",
            user_message="PING",
        )
        assert response.success, f"Gemini failed: {response.error}"
        assert "PONG" in response.content.upper()
        assert response.engine_type == "gemini"

    @pytest.mark.asyncio
    async def test_structured_response(self):
        engine = GeminiEngine()
        response = await engine.call(
            system_prompt="You are Team 10 (Gateway). Reply with a short work plan in markdown.",
            user_message="Plan implementation of a new /strategies endpoint.",
        )
        assert response.success, f"Gemini failed: {response.error}"
        assert len(response.content) > 50


class TestClaudeEngine:
    def test_fallback_when_cli_unavailable(self):
        engine = ClaudeEngine()
        response = asyncio.get_event_loop().run_until_complete(
            engine._fallback_to_file("system prompt", "user message")
        )
        assert response.success
        assert "MANUAL" in response.content or "Prompt saved" in response.content


class TestCursorEngine:
    @pytest.mark.asyncio
    async def test_generates_prompt_file(self):
        engine = CursorEngine()
        response = await engine.generate_prompt_file(
            system_prompt="You are Team 20 Backend.",
            user_message="Implement CRUD for strategies.",
            filename="test_cursor_prompt",
        )
        assert response.success
        assert "Prompt saved" in response.content
        prompt_path = Path(response.content.split("Prompt saved to ")[1].split(".")[0] + ".md")
