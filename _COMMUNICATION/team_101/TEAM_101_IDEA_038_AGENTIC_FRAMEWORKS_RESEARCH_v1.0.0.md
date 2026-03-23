---
project_domain: AGENTS_OS
id: TEAM_101_IDEA_038_AGENTIC_FRAMEWORKS_RESEARCH_v1.0.0
from: Team 101 (IDE Architecture Authority)
to: Team 100, Team 00
date: 2026-03-17
historical_record: true
status: PROPOSED_IDEA
type: RESEARCH_AND_RECOMMENDATION
target_stage: S003+
---

# IDEA-038: Agentic Frameworks Research & Inspiration (Team 00 Strategized)

## 1. Overview
This document captures research on open-source agentic frameworks to inspire V3 of Agents_OS. The goal is to identify proven patterns in the industry that validate our architecture or offer off-the-shelf components to reduce our custom code footprint.

## 2. Research Subjects

### A. Virtual Software Company Models (MetaGPT, ChatDev)
- **Concept:** Multi-agent systems simulating a full software company (PM, Architect, Engineer, QA).
- **Key Inspiration:** Strict SOPs (Standard Operating Procedures) where output from one agent must strictly match a template to be consumed by the next. Event-driven message pools instead of direct prompt chaining.
- **Relevance to us:** Validates our LOD200/LOD400 and Maker-Checker contracts.

### B. Graph & State Orchestrators (LangGraph, CrewAI, AutoGen)
- **Concept:** Modeling agent workflows as cyclic graphs (Nodes = Agents, Edges = Routing logic) with a shared persistent state.
- **Key Inspiration:** Built-in persistence, human-in-the-loop pausing, and structured JSON outputs out-of-the-box.
- **Relevance to us:** Direct alternative to our custom `pipeline.py` state machine.

### C. Autonomous SWE Agents (SWE-agent, OpenDevin, Aider)
- **Concept:** Agents equipped with specialized Computer Interfaces (ACI) to read files, run bash, and patch code efficiently without losing context.
- **Key Inspiration:** Using specific unified diff formats or targeted read/write tools instead of rewriting entire files.
- **Relevance to us:** Enhancing Team 61's execution capabilities and MCP usage.

## 3. Strategic Recommendations & Team 00 Directives (S003+)

### Directive 1: Custom "Micro-Instructor" (JSON Enforcer)
**Decision:** Reject external heavy libraries (like `instructor` or Pydantic enforced outputs) to avoid vendor lock-in and maintain maximum engine flexibility (Cursor, local models, etc.).
**Action:** Build a lightweight, custom `json_enforcer.py` validator in Agents_OS that simply parses LLM output for JSON blocks, validates against a minimal dictionary, and automatically prompts the LLM to fix syntax errors silently before advancing.

### Directive 2: MCP Servers as First-Class Citizens
**Decision:** High priority. The ROI is massive and cost is zero.
**Action Path:** 
1. Implement standard Anthropic MCP servers (`server-filesystem`, `server-git`) via Cursor's built-in MCP settings for immediate use by Teams 20/30/50/61.
2. Later, build a simple Python MCP client wrapper for our `BaseEngine` so autonomous API teams (Team 90, 190) can utilize these tools directly.

### Directive 3: LangGraph Deferred
**Decision:** Hold off for now. While LangGraph is free, runs locally, and is highly flexible, moving to a cumulative reducer-based state makes manual intervention/rollbacks harder. `pipeline.py` serves us well for V2.

### Directive 4: MetaGPT Architecture "Theft"
**Decision:** Do not use MetaGPT out-of-the-box (too opinionated, would break our strict Zero-Trust governance). However, study their source code to adapt their **Message Pool (Event-driven pub/sub)** and **Role vs Action separation** for Agents_OS V3.

---
**log_entry | TEAM_101 | IDEA_038_RESEARCH | UPDATED_WITH_NIMROD_STRATEGY | 2026-03-17**