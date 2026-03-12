---
**project_domain:** AGENTS_OS
**id:** ARCHITECT_DIRECTIVE_TEAM51_RUNTIME_AND_NIMROD_HANDOFF_v1.0.0
**from:** Team 00 (Chief Architect) — Nimrod authority
**to:** Team 51, Team 100, Team 170
**cc:** Team 61
**date:** 2026-03-11
**status:** LOCKED — immediate implementation
**authority:** Nimrod (Visionary) + Team 00 constitutional authority
---

# Architect Directive — Team 51: Runtime Checks + Nimrod Handoff

---

## §1 Background

1. **No technical limitation** requires Nimrod to perform checks that Team 51 can execute. Team 51 runs in the same environment and has full access to the codebase.
2. **Team 100** (Architect) is operationally busy; presenting detailed scenarios to Nimrod is not an efficient use of that team's time.
3. **Team 51** is the QA gate before FAST_3; it is the natural owner of packaging verification evidence and presenting it for human sign-off.

---

## §2 Directives (immediate effect)

### 2.1 Team 51 runs all non-browser checks

**Team 51 must run every check that does NOT require:**
- Browser execution (Selenium, MCP browser, human UI interaction)
- Human judgment that cannot be automated (e.g., aesthetic UX approval)

**Team 51 must run (in addition to current static/unit checks):**
- Live runtime checks (e.g., generator invocation, output file creation)
- Output validity checks (e.g., `py_compile` on generated files)
- BLOCK/SKIP scenario verification (when applicable)
- Any other automated check listed in the FAST_3 acceptance criteria

**Nimrod executes only:**
- Browser checks (GATE_7-style human UI scenarios)
- Checks that are technically impossible for an automated agent (e.g., physical device, external human-only approval)
- Final sign-off confirmation after reviewing Team 51's evidence package

---

### 2.2 Team 51 presents Nimrod handoff after PASS

**After full PASS of all Team 51 checks**, Team 51 produces a **Nimrod handoff document**:

| Field | Content |
|-------|---------|
| **Location** | `_COMMUNICATION/team_51/TEAM_51_TO_NIMROD_{WP_ID}_FAST3_HANDOFF_v1.0.0.md` |
| **Source** | Scenarios/checklist from Team 100's FAST0 scope brief (or equivalent) |
| **Format** | Clear, user-accessible: environment setup, commands, expected outcomes |
| **When** | Only after Team 51 has passed ALL checks it is authorized to run |

**The handoff must include:**
1. **Environment setup** — how to run, prerequisites, paths
2. **Checklist** — items (if any) that remain for Nimrod (browser / human-only)
3. **Evidence summary** — what Team 51 verified; reference to QA report
4. **Sign-off line** — simple confirmation that Nimrod has reviewed and approves

**Team 100** continues to author the canonical checklist in the FAST0 scope brief. **Team 51** packages and presents it to Nimrod in operational form. Team 100 does not need to produce a separate "scenarios for Nimrod" document.

---

## §3 Implementation

1. **Team 51 identity** (`agents_os_v2/context/identity/team_51.md`) — add runtime checks and Nimrod handoff duty
2. **Team 51 constitution** (`_COMMUNICATION/team_00/TEAM_00_TEAM_51_CONSTITUTION_v1.0.0.md`) — add authority scope for runtime execution
3. **FAST_TRACK_EXECUTION_PROTOCOL** §10 — update Team 51 description
4. **Activation prompts** (per WP) — add runtime checks where FAST_3 criteria include them
5. **Immediate:** Run S003-P002 runtime checks; create `TEAM_51_TO_NIMROD_S003_P002_WP001_FAST3_HANDOFF_v1.0.0.md`

---

**log_entry | TEAM_00 | ARCHITECT_DIRECTIVE | TEAM51_RUNTIME_NIMROD_HANDOFF | LOCKED | 2026-03-11**
