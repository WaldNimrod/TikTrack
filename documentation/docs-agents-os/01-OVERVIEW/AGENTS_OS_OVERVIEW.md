# Agents_OS Overview
## documentation/docs-agents-os/01-OVERVIEW/AGENTS_OS_OVERVIEW.md

**project_domain:** AGENTS_OS  
**owner:** Team 170  
**date:** 2026-03-14

---

## 1. What is Agents_OS

Agents_OS is the automation and governance layer that drives TikTrack development. It is **not** a product feature. The problem it solves: replacing 100% manual prompting with structured mandate generation and gate enforcement. Each work package (feature program) goes through GATE_0 → GATE_8 with AI-assisted mandate generation, coordination between teams, and structured handoffs. Components: CLI (`pipeline_run.sh`), orchestrator (`agents_os_v2/`), and a web dashboard (3 HTML files).

---

## 2. V1 vs V2 — What Changed

| Component | V1 | V2 |
|-----------|-----|-----|
| Orchestrator | agents_os/orchestrator/ | agents_os_v2/orchestrator/pipeline.py |
| State | Manual | PipelineState dataclass in state.py |
| UI | None | 3 HTML files (PIPELINE_DASHBOARD, ROADMAP, TEAMS) |
| Mandates | Manual prompts | Generic Mandate Engine (MandateStep, phases, coordination) |
| Multi-domain | Single | tiktrack + agents_os parallel pipelines with --domain flag |

---

## 3. Key Components (brief)

| Component | Path | What it does |
|-----------|------|--------------|
| pipeline_run.sh | repo root | Primary CLI interface — all subcommands (next, pass, fail, approve, status, gate, route, revise, store, domain, phaseN) |
| Gate engine | agents_os_v2/orchestrator/pipeline.py | GATE_CONFIG, mandate generation, routing logic |
| State | agents_os_v2/orchestrator/state.py | PipelineState dataclass, save/load, domain resolution |
| STATE_SNAPSHOT producer | agents_os_v2/observers/state_reader.py | Reads WSM/docs, produces STATE_SNAPSHOT.json |
| Dashboard UI | agents_os/ui/PIPELINE_DASHBOARD.html | Gate management UI — load state, show prompt, mandates |
| Roadmap UI | agents_os/ui/PIPELINE_ROADMAP.html | Portfolio map — programs, stages, gate history |
| Runtime output | _COMMUNICATION/agents_os/ | pipeline_state.json, pipeline_state_agents_os.json, STATE_SNAPSHOT.json, prompts, mandates |

---

## 4. How to Start a New Program (5 steps)

```bash
# Step 1: Initialize pipeline state for new WP
./agents_os/scripts/init_pipeline.sh agents_os S002-P005-WP001

# Step 2: Generate GATE_0 activation prompt
./pipeline_run.sh --domain agents_os gate GATE_0

# Step 3: Paste prompt to AI, complete GATE_0 work

# Step 4: Advance
./pipeline_run.sh --domain agents_os pass

# Step 5: Continue gate by gate...
./pipeline_run.sh --domain agents_os  # shows current gate prompt
```

---

## 5. Contributing

| Team | Role |
|------|------|
| Team 10 | Implements changes, advances gates via CLI |
| Team 170 | Maintains documentation (this folder) |
| Team 00 | Architectural decisions and spec documents |

**Full protocol:** [documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md](../../docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md)

---

**log_entry | TEAM_170 | AGENTS_OS_OVERVIEW | DELIVERED | 2026-03-14**
