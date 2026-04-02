date: 2026-03-22
historical_record: true

# TEAM_00 — Prompt File Naming Architecture Analysis
**doc_id:** TEAM_00_PROMPT_FILE_NAMING_ARCHITECTURE_ANALYSIS_v1.0.0
**authority:** Team 00 (System Designer)
**date:** 2026-03-22
**status:** DECISION_REQUIRED — present to Nimrod
**trigger:** S003-P013-WP001 canary monitored run — stale prompt confusion caused DEV-GATE0-003

---

## Context

**Current behavior** (line 1387 in `pipeline.py`):
```python
path = _save_prompt(f"{gate_id}_prompt.md", prompt, domain=state.project_domain)
```
Result: files like `tiktrack_GATE_1_prompt.md`, `agentsos_GATE_2_prompt.md`.

These are **stateful files** — the same filename is overwritten every time the gate prompt is generated.

**The stale prompt incident (DEV-GATE0-003):**
When S003-P013-WP001 started, S003-P003-WP001 was still registered in the Program Registry. The pipeline blocked and served the old `tiktrack_GATE_0_prompt.md` (from S003-P003). Nimrod copied from the dashboard, which showed the stale file content. Team 190 received a prompt for a different work package (S003-P003), correctly blocked it (4 valid findings), but named the verdict file after S003-P003. The pipeline could not find the verdict (L1 detection failed). Three round-trips lost.

The stale prompt file was the amplifier: its existence made a governance error (unregistered program) harder to detect and recover from.

---

## Option A — Current: Stateful Domain+Gate File (Overwrite Model)

**Pattern:** `{domain}_{gate_id}_prompt.md`
**Example:** `tiktrack_GATE_1_prompt.md`
**Behavior:** File is overwritten on every `./pipeline_run.sh` call for that gate. One file per domain per gate, always current.

### Pros
1. **Simplest implementation** — zero change to pipeline code beyond what exists.
2. **Zero accumulation** — prompts dir stays small; no archival concern.
3. **Dashboard always reads one path** — `_specPathToFetchUrl` and prompt display need no logic.
4. **Teams always get latest** — no stale file confusion if they fetch from the canonical path.
5. **No disambiguation needed** — when you're at GATE_1, `tiktrack_GATE_1_prompt.md` is always the right one.

### Cons
1. **Forensic blindness** — once GATE_1 is done and GATE_2 runs, the GATE_1 prompt is gone. No audit trail of what Team 170 actually received.
2. **Stale-file confusion (demonstrated)** — if a prompt is generated for WP-A but pipeline advances to WP-B without regeneration, the stale file has no WP identity. Teams can't self-diagnose without reading content.
3. **Race condition risk** — if two domains generate GATE_1 simultaneously (unlikely but possible in a multi-run scenario), same-gate files can interfere if domain isolation is broken.
4. **No cross-program diff** — can't compare what GATE_1 looked like for S003-P003 vs S003-P013. Architectural learning is harder.

---

## Option B — Per-Program+WP File (Immutable Model)

**Pattern:** `{domain}_{stage}_{program}_{wp}_{gate_id}_prompt.md`
**Example:** `tiktrack_S003_P013_WP001_GATE_1_prompt.md`
**Behavior:** Each prompt generation creates a new file. Old files remain unless explicitly cleaned.

### Pros
1. **Self-identifying** — the filename encodes the full work package identity. Team 190 receiving the file cannot confuse it with another program.
2. **Audit trail** — every prompt ever sent is preserved. Forensic review of what each team received is trivial.
3. **L1 detection alignment** — verdict candidate paths already encode WP identity (`getVerdictCandidates(gate, wp)`). If prompt files also encode WP, the full chain is consistent: prompt file → team output → verdict file — all keyed on the same WP ID.
4. **Stale prompt detection** — if dashboard shows `tiktrack_S003_P003_WP001_GATE_0_prompt.md` but state says S003-P013, it's immediately visible that something is wrong.
5. **Historical comparison** — diff GATE_1 prompt between programs to detect spec drift or template regressions.

### Cons
1. **Directory accumulation** — prompts dir grows without bound. After 20 programs, 40+ files. Needs periodic archival or retention policy.
2. **Dashboard complexity** — prompt file path must be derived from current state (WP+gate), not a static pattern. `loadPrompt()` must compute the correct path dynamically.
3. **Migration needed** — dashboard and any other consumers of prompt file paths must update their lookup logic.
4. **Naming length** — filenames become long. Not a technical problem, but operationally verbose.
5. **Generation idempotency question** — if GATE_1 is re-generated (e.g., after a FAIL), should it overwrite the existing per-program file, or create `_v1.0.1`? Needs a versioning decision.

---

## Option C — Hybrid: Stateful Canonical + Archived Copy

**Pattern:** Canonical `{domain}_{gate_id}_prompt.md` (always current) + archived copy `{domain}_{wp}_{gate_id}_{timestamp}_prompt.md` on every generation.

**Behavior:** Pipeline writes to both locations. Dashboard reads from canonical (no change). Archives are for forensics only.

### Pros
1. **No dashboard change** — canonical path stays the same. Zero disruption to current tooling.
2. **Forensic capability** — full history preserved in archive files.
3. **Self-identifying archives** — old prompts traceable to exact WP and timestamp.
4. **Stale detection** — if canonical exists but archive shows a different WP, drift is visible in the archive naming.

### Cons
1. **Double write on every generation** — minor cost, but adds a write operation.
2. **Archive dir grows** — needs retention policy (same as Option B).
3. **Not self-identifying at runtime** — teams still receive the canonical file, which doesn't encode WP identity. Stale confusion at runtime is still possible (same failure mode as Option A).
4. **Partial improvement** — archives help forensically but don't prevent the core failure mode (stale prompt confusion during active pipeline).

---

## Root Cause Analysis

The DEV-GATE0-003 incident had two contributing causes:

1. **Governance failure (GOVERNANCE-01):** S003-P013 not registered → pipeline served stale content.
   → Fixed by program registration requirement.

2. **File naming amplifier:** The file had no WP identity → confusion propagated.
   → Options B and C address this; Option A does not.

The question is: **is the naming amplifier significant enough to change, or is the governance fix sufficient?**

Assessment: With strict program registration enforcement (GOVERNANCE-01 resolved + registry check hardened), stale prompt generation should not occur. The file naming issue would only surface in edge cases. However, the L1 detection alignment argument (Pro #3 of Option B) is architecturally compelling — consistent WP identity across the prompt→team→verdict chain reduces structural coupling risk.

---

## Recommendation

**Option B — Per-Program+WP File**, with these constraints:

1. **Retention policy:** Archive prompt files for the active stage only; purge prior-stage files at GATE_5 closure. Maximum ~6-8 files per domain per stage (one per gate).
2. **Versioning rule:** On re-generation of the same gate/WP, overwrite the existing file (no version suffix). The file is the "latest prompt for this WP at this gate."
3. **Dashboard change:** `loadPrompt()` computes path as `{domain}_{wp}_{gate}_prompt.md`. Fallback to current stateful pattern if not found (backward compatibility during transition).
4. **Team prompt headers:** Already include WP identity in the FULL RESET block — this reinforces the naming.

**Priority:** LOW — implement as part of the next pipeline hardening WP, not as a blocker for the current monitored run. The current monitored run proceeds with Option A (current behavior). This decision authorizes Option B as the target architecture.

---

## Decision Required from Nimrod

| Choice | Action |
|--------|--------|
| **B — Per-program files** | Team 100 writes implementation plan; mandate issued for next pipeline hardening WP |
| **C — Hybrid** | Team 100 implements archive-write in `_save_prompt()`; dashboard unchanged |
| **A — Stay as-is** | Close this analysis; governance fix is sufficient; no naming change |

---

**log_entry | TEAM_00 | PROMPT_FILE_NAMING_ARCHITECTURE_ANALYSIS | v1.0.0 | DECISION_REQUIRED | 2026-03-22**
