# Team 00 — S002-P005 Decision D-A1: Desync Guard Deep Analysis
## TEAM_00_S002_P005_D_A1_DESYNC_ANALYSIS_v1.0.0.md

**project_domain:** AGENTS_OS
**from:** Team 00 (Chief Architect)
**to:** Nimrod — decision required
**date:** 2026-03-14
**status:** AWAITING_DECISION
**in_response_to:** D-A1 request for expanded analysis

---

## 1. The Real Problem (What We're Actually Solving)

ADR-031 wrote: "Parser determinism — stop guessing `active_stage_id`."

This was written in a **Google Drive context** — the WSM was a Docs file that could be edited independently from the pipeline, causing silent drift. In that world, the local JSON and the Drive doc were two separate truths.

**That context no longer applies.** Our system is now:
- `pipeline_state_*.json` = the authoritative runtime state (orchestrator reads this)
- WSM markdown = governance documentation (humans maintain this for audit trail)
- These are in the same local repo — there's no Drive sync to drift

**The original R1 ("parser determinism") actually contains two separate problems that should not be conflated:**

---

### Problem A: Code Fragility in `state_reader.py` (Non-Controversial)

File: `agents_os_v2/observers/state_reader.py`, line 66:
```python
stage_match = re.search(r"current_stage_id[:\s|]+\s*(S\d+)", text)
if stage_match:
    result["active_stage"] = stage_match.group(1)
# If no match: active_stage key is simply absent. No error. No alert.
```

**The fragility:** if the WSM table format changes by one pipe character, `active_stage` is silently absent from `STATE_SNAPSHOT.json`. Every downstream consumer that reads this field gets `None` or KeyError.

**The fix (non-controversial, no decision needed):** Replace regex with a structured table parser that either returns a validated result OR raises a typed `StateReadError`. Never silent null.

This fix is always needed regardless of D-A1 decision. **Team 00 locks this.**

---

### Problem B: What "Desync" Means Now — D-A1 Decision

This is the real question: given our current local system, what is the meaningful divergence condition worth alerting on?

**Three genuine failure modes to consider:**

---

## 2. Failure Mode Analysis

### Failure Mode 1: Gate Sequence Violation ⭐ (Most Dangerous)

**What:** Pipeline state shows GATE_4 completed, but no GATE_2 approval artifact exists on disk.

**Why it happens:** Operator ran `./pipeline_run.sh pass` to advance gates without actually completing the AI work. Or a state file was manually edited.

**Why it's dangerous:** Teams 20/30/50 are executing code that was never formally approved. The entire WP's audit trail is invalid.

**Detection:** For every gate in `state.gates_completed`, verify that the expected verdict/approval file exists.

---

### Failure Mode 2: Program Registry Drift (Medium Risk)

**What:** `pipeline_state.json` says domain=agents_os, wp=S002-P005-WP001, but PHOENIX_PROGRAM_REGISTRY shows S002-P005 as `planned` (Team 170 forgot to update).

**Why it happens:** Program was activated via `pipeline_run.sh new` (R4 command) but Team 170 didn't update the Program Registry markdown.

**Why it matters:** PIPELINE_ROADMAP.html reads registry data and shows "planned" for a program that's actively running. Other teams get incorrect picture.

**Detection:** Read Program Registry → check if current WP's program is marked `active`.

---

### Failure Mode 3: Stage ID Mismatch (Low Risk in Current System)

**What:** `pipeline_state.stage_id` = "S002" but WSM `current_stage_id` = "S003".

**Why it happens in the OLD system:** Drive WSM edited by human; local JSON not updated.

**Why it's LOW RISK NOW:** In our local system, `pipeline_state.json` IS the execution truth. If WSM says S003 but pipeline says S002, this is a WSM documentation error — it doesn't affect execution. The pipeline still works correctly. An operator noticing the Dashboard says "S002" while they expected "S003" would simply update the WSM.

**Architectural view:** Checking this creates coupling between the runtime (pipeline_state.json) and documentation (WSM markdown). We should not make the runtime DEPEND on the documentation being correct — that's backwards.

---

## 3. Options — Proper Framing

### Option A: Registry Consistency Check
**Checks:** Is the current WP's program listed as `active` in PHOENIX_PROGRAM_REGISTRY?

| Dimension | Assessment |
|---|---|
| Catches | Failure Mode 2 (registry drift) |
| Doesn't catch | Failure Mode 1 (the dangerous one) |
| Implementation risk | Requires parsing Program Registry markdown — another regex dependency. If registry format changes, check breaks silently. |
| Maintenance burden | Team 170 must update registry whenever a program is activated. If they forget, false alarm fires. |
| Value | Medium — detects documentation lag, not execution errors |
| Architect concern | Creates same fragility we're trying to fix in `state_reader.py`. Two regex parsers instead of one. |

---

### Option B: WSM Stage Cross-Validation
**Checks:** Does `pipeline_state.stage_id` match WSM `current_stage_id`?

| Dimension | Assessment |
|---|---|
| Catches | Failure Mode 3 (stage mismatch) |
| Doesn't catch | Failure Mode 1 or 2 |
| Implementation risk | Same regex fragility as current state_reader.py. This is exactly what we're trying to move away from. |
| Maintenance burden | WSM must always be kept in sync manually. Not a new problem — but we'd be making the system ALERT on something that doesn't affect execution. |
| Value | Low — detects documentation error, not execution risk |
| Architect concern | This is the original Google Drive design applied to a local system where it doesn't fit. We're alerting on the wrong thing. |

---

### Option C: Gate Sequence Integrity Check ⭐ (Architect's Recommendation)
**Checks:** For every gate in `gates_completed`, does the expected artifact file exist on disk?

| Dimension | Assessment |
|---|---|
| Catches | Failure Mode 1 (the most dangerous failure) |
| Doesn't catch | Registry drift or stage mismatch |
| Implementation | Requires `GATE_ARTIFACT_PATHS` map in `pipeline.py` — each gate knows its expected output file. Fully deterministic. |
| Maintenance burden | None — artifact paths are defined once in GATE_CONFIG. If gate produces artifact, check passes. |
| Value | **Highest** — catches execution integrity violations, not documentation lag |
| Architect concern | None. This is self-contained: the pipeline defines what artifacts gates produce, and the check validates they actually exist. No dependency on human-maintained docs. |

**Example:** If `gates_completed = ["GATE_0", "GATE_1", "GATE_2", "GATE_3"]`, the check verifies:
- `_COMMUNICATION/agents_os/prompts/GATE_0_prompt.md` exists
- `_COMMUNICATION/team_190/TEAM_190_{WP}_GATE2_DECISION_v1.0.0.md` (or equivalent) exists
- etc.

Missing artifact → `consistency_check.gate_integrity = FAIL` + list of missing artifacts.

---

### Option D: Minimal — Parser Fix Only
**Checks:** Nothing beyond fixing the regex fragility.

| Dimension | Assessment |
|---|---|
| Scope | Smallest — only Problem A fix |
| Risk | Zero — no new behavior |
| Value | Baseline robustness only |
| When appropriate | If you judge that the pipeline is single-operator, controlled, and explicit gate skipping isn't a real risk in practice |

---

## 4. Architect's Position

We recommend **Option C** over A and B for one architectural reason:

> Options A and B create a runtime dependency on human-maintained markdown documents. We're solving fragility in `state_reader.py` by adding MORE fragility of the same kind. Option C depends only on filesystem artifacts that the pipeline itself creates — this is self-contained and testable.

We recommend **Option C over Option D** because gate integrity is the one check that protects the entire pipeline audit trail. S002-P002-WP003 taught us that the pipeline has self-healing correction cycles — but those correction cycles depend on the audit trail being valid.

**Minimum viable:** If scope concerns exist, Option D (parser fix only) for Stage A, Option C for Stage B.

---

## 5. Summary — What Nimrod Decides

| Option | You get | You accept |
|---|---|---|
| **A** | Registry drift detection | Another fragile markdown parser; misses gate violations |
| **B** | Stage mismatch detection | Backwards dependency (runtime depends on docs); low real value |
| **C ← Recommended** | Gate integrity validation | Requires defining artifact paths per gate in GATE_CONFIG |
| **D** | Parser fix only | No desync detection in Stage A |

---

**→ Nimrod decision: A / B / C / D**

---

**log_entry | TEAM_00 | D_A1_EXPANDED_ANALYSIS | AWAITING_NIMROD_DECISION | 2026-03-14**
