# Agents_OS V2 — Phase 6: Local Setup & E2E Test Guide

## Prerequisites

- Python 3.12+
- Node.js 22+
- Docker (for PostgreSQL)
- Claude Code CLI (`claude --version`)
- Git access to this repo

---

## Step 1: Pull the branch

```bash
cd /path/to/TikTrack
git fetch origin cursor/development-environment-setup-6742
git checkout cursor/development-environment-setup-6742
```

## Step 2: Install dependencies

```bash
# Backend
cd api && python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
pip install openai google-genai bandit pip-audit mypy

# Frontend
cd ../ui && npm install

# Tests
cd ../tests && npm install
```

## Step 3: Set environment variables

```bash
# Add to your shell profile (~/.zshrc or ~/.bashrc):
export OPENAI_API_KEY="sk-proj-YOUR-NEW-KEY"
export GEMINI_API_KEY="AIzaSy-YOUR-NEW-KEY"

# Reload:
source ~/.zshrc
```

## Step 4: Verify engines work

```bash
cd /path/to/TikTrack

# Test OpenAI
python3 -c "
import asyncio
from agents_os_v2.engines.openai_engine import OpenAIEngine
async def test():
    e = OpenAIEngine()
    r = await e.call('Reply PONG', 'PING')
    print(f'OpenAI: {r.success} — {r.content[:50]}')
asyncio.run(test())
"

# Test Gemini
python3 -c "
import asyncio
from agents_os_v2.engines.gemini_engine import GeminiEngine
async def test():
    e = GeminiEngine()
    r = await e.call('Reply PONG', 'PING')
    print(f'Gemini: {r.success} — {r.content[:50]}')
asyncio.run(test())
"

# Test Claude Code CLI
claude --version
python3 -c "
import asyncio
from agents_os_v2.engines.claude_engine import ClaudeEngine
async def test():
    e = ClaudeEngine()
    print(f'Claude CLI available: {e.is_available()}')
asyncio.run(test())
"
```

## Step 5: Run all tests

```bash
cd /path/to/TikTrack
source api/venv/bin/activate

# V2 tests (local — no API calls)
python3 -m pytest agents_os_v2/tests/ -v -k "not OpenAI and not Gemini"

# V2 tests (with API — verifies engines)
python3 -m pytest agents_os_v2/tests/ -v
```

## Step 6: Start services (for GATE_4 QA)

```bash
# PostgreSQL
docker start tiktrack-postgres-dev  # or create if first time

# Backend
source api/venv/bin/activate
PYTHONPATH="/path/to/TikTrack/api:/path/to/TikTrack" \
  uvicorn api.main:app --reload --host 0.0.0.0 --port 8082 &

# Frontend
cd ui && npm run dev &
```

## Step 7: Run E2E test

```bash
cd /path/to/TikTrack
source api/venv/bin/activate

# Update STATE_SNAPSHOT first
python3 -m agents_os_v2.observers.state_reader

# Run pipeline with a test spec
python3 -m agents_os_v2.orchestrator.pipeline \
  --spec "Add a new /api/v1/strategies endpoint with CRUD operations. Include: model (strategies table in user_data schema), Pydantic schema, service with list/get/create/update/delete, router with all endpoints, and unit tests."
```

### What happens:

```
PHASE A (automatic):
  GATE_0 → Team 190 (OpenAI) validates scope
  GATE_1 → Team 170 (Gemini) writes LLD400 → Team 190 (OpenAI) validates
  GATE_2 → Team 100 (Claude Code) approves intent

PHASE B (semi-automatic):
  GATE_3 → Team 10 (Gemini) builds plan → Team 90 (OpenAI) validates
  
  ╔═══════════════════════════════════════════╗
  ║  PAUSE — Mandates saved to file           ║
  ║  Open the mandates file                   ║
  ║  Paste Team 20 mandate into Cursor        ║
  ║  Paste Team 30 mandate into Cursor        ║
  ║  When done:                               ║
  ║    python3 -m agents_os_v2.orchestrator.pipeline --continue  ║
  ╚═══════════════════════════════════════════╝

PHASE C (automatic):
  GATE_4 → Automated tests + Team 50 QA
  GATE_5 → Team 90 (OpenAI) validates code vs spec
  GATE_6 → Team 100 (Claude Code) reality check

  ╔═══════════════════════════════════════════╗
  ║  GATE_7 — Review the app yourself         ║
  ║  --approve gate7   or   --reject gate7    ║
  ╚═══════════════════════════════════════════╝

  GATE_8 → Documentation closure
  
  ✅ LIFECYCLE COMPLETE
```

## Step 8: Check status anytime

```bash
python3 -m agents_os_v2.orchestrator.pipeline --status
```

## Step 9: After E2E test

1. Did all gates pass? Note which ones failed and why.
2. Were the mandates useful for Cursor implementation?
3. Was the LLD400 quality sufficient?
4. How long did the full cycle take?
5. Report findings — iterate on conversation handlers.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `OPENAI_API_KEY not set` | `export OPENAI_API_KEY=...` in terminal |
| `Connection error` on OpenAI | Check internet; check API credits at platform.openai.com |
| `429 quota exceeded` on Gemini | Enable billing on Google Cloud project or wait for rate limit reset |
| Claude CLI not found | `npm install -g @anthropic-ai/claude-code` |
| Claude CLI auth error | Run `claude` once interactively to authenticate |
| GATE_4 fails (tests) | Start backend + frontend first (Step 6) |
| Pipeline stuck | Check `_COMMUNICATION/agents_os/pipeline_state.json` |

---

## File Reference

| File | Purpose |
|------|---------|
| `agents_os_v2/orchestrator/pipeline.py` | Main CLI |
| `agents_os_v2/config.py` | API keys + team mapping |
| `agents_os_v2/context/identity/team_*.md` | Team identities (12 files) |
| `agents_os_v2/context/governance/gate_rules.md` | Governance rules |
| `agents_os_v2/context/conventions/*.md` | Coding conventions |
| `_COMMUNICATION/agents_os/STATE_SNAPSHOT.json` | Current project state |
| `_COMMUNICATION/agents_os/pipeline_state.json` | Pipeline progress |
| `_COMMUNICATION/agents_os/prompts/` | Generated mandates |
