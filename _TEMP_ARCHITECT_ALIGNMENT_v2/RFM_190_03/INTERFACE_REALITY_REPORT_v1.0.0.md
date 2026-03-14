# INTERFACE_REALITY_REPORT_v1.0.0
**id:** RFM-190-03
**from:** Team 190 (Constitutional Validator)
**to:** Chief Architect (Mother)
**cc:** Team 100, Team 170, Nimrod
**date:** 2026-03-14
**status:** SUBMITTED_READY
**priority:** CRITICAL
**scope:** Agents_OS v2 UI reality mirror (as implemented)

---

## 1) Evidence Scope

Ground-truth scan was executed on implemented UI/runtime assets only:

1. `PIPELINE_DASHBOARD.html`
2. `PIPELINE_ROADMAP.html`
3. `_COMMUNICATION/agents_os/pipeline_state.json`
4. `_COMMUNICATION/agents_os/STATE_SNAPSHOT.json`
5. `agents_os_v2/observers/state_reader.py`
6. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`

No design proposals were applied in this report.

---

## 2) UI Capabilities (Ground Truth)

| Capability | Exists | Evidence |
|---|---|---|
| Refresh + auto-refresh dashboard state | YES | `PIPELINE_DASHBOARD.html:491-495`, `PIPELINE_DASHBOARD.html:2003-2011` |
| Trigger progress diagnostics scan | YES | `PIPELINE_DASHBOARD.html:495`, `PIPELINE_DASHBOARD.html:1383-1395` |
| Open roadmap/history UI | YES | `PIPELINE_DASHBOARD.html:496` |
| Open Help modal + EN/HE toggle persistence | YES | `PIPELINE_DASHBOARD.html:501-507`, `PIPELINE_DASHBOARD.html:2015-2031` |
| Load current gate prompt from prompt files | YES | `PIPELINE_DASHBOARD.html:1018-1037` |
| Copy prompt/commands/mandate text | YES | `PIPELINE_DASHBOARD.html:771`, `PIPELINE_DASHBOARD.html:892-901`, `PIPELINE_DASHBOARD.html:1012`, `PIPELINE_DASHBOARD.html:794` |
| Load team mandates from generated markdown | YES | `PIPELINE_DASHBOARD.html:1041-1079` |
| Expected-file existence checks (HEAD) | YES | `PIPELINE_DASHBOARD.html:870-873`, `PIPELINE_DASHBOARD.html:1520-1531` |
| PASS/FAIL/route command guidance by gate | YES | `PIPELINE_DASHBOARD.html:1092-1319`, `PIPELINE_DASHBOARD.html:1545-1619` |
| Human gate approve guidance in UI | YES | `PIPELINE_DASHBOARD.html:1001`, `PIPELINE_DASHBOARD.html:1144-1149`, `PIPELINE_DASHBOARD.html:1275-1280`, `PIPELINE_DASHBOARD.html:1291-1295` |
| Program/stage roadmap exploration UI | YES | `PIPELINE_ROADMAP.html:181-236`, `PIPELINE_ROADMAP.html:615-680` |
| Inline canonical file viewer in roadmap page | YES | `PIPELINE_ROADMAP.html:752-765`, `PIPELINE_ROADMAP.html:813-825` |

---

## 3) Information Display (Ground Truth)

### 3.1 Dashboard (`PIPELINE_DASHBOARD.html`)

Displayed data classes:

1. Pipeline status card: WP, Stage, Gate, Owner, Engine (`PIPELINE_DASHBOARD.html:723-729`, `PIPELINE_DASHBOARD.html:934-943`).
2. Feature spec text + active WP (`PIPELINE_DASHBOARD.html:750-754`, `PIPELINE_DASHBOARD.html:945-946`).
3. Gate timeline with pass/fail/current markers (`PIPELINE_DASHBOARD.html:731-736`, `PIPELINE_DASHBOARD.html:949-958`).
4. Current-gate prompt metadata and file path (`PIPELINE_DASHBOARD.html:756-777`, `PIPELINE_DASHBOARD.html:1021-1027`).
5. Team mandates tabs + rendered text (`PIPELINE_DASHBOARD.html:783-798`, `PIPELINE_DASHBOARD.html:1072-1090`).
6. Expected output files with existence status (`PIPELINE_DASHBOARD.html:800-810`, `PIPELINE_DASHBOARD.html:1527-1531`).
7. Progress diagnostics: full gate overview, current gate analysis, fail-cycle markers (`PIPELINE_DASHBOARD.html:1403-1435`, `PIPELINE_DASHBOARD.html:1448-1499`, `PIPELINE_DASHBOARD.html:1665-1672`).

### 3.2 Roadmap (`PIPELINE_ROADMAP.html`)

Displayed data classes:

1. Header live summary from runtime state (`PIPELINE_ROADMAP.html:390-392`).
2. Program selector + focused program details (`PIPELINE_ROADMAP.html:183-191`, `PIPELINE_ROADMAP.html:437-487`).
3. Domain banners with totals/status split (`PIPELINE_ROADMAP.html:194-197`, `PIPELINE_ROADMAP.html:529-573`).
4. Gate visual map across full sequence (`PIPELINE_ROADMAP.html:199-203`, `PIPELINE_ROADMAP.html:575-612`).
5. Roadmap tree (stages/programs) parsed from markdown tables (`PIPELINE_ROADMAP.html:211-214`, `PIPELINE_ROADMAP.html:324-362`, `PIPELINE_ROADMAP.html:615-680`, `PIPELINE_ROADMAP.html:792-793`).
6. Full gate sequence + gate history panels (`PIPELINE_ROADMAP.html:219-227`, `PIPELINE_ROADMAP.html:682-711`, `PIPELINE_ROADMAP.html:714-750`).
7. Canonical file index with inline viewer (`PIPELINE_ROADMAP.html:233-236`, `PIPELINE_ROADMAP.html:752-765`, `PIPELINE_ROADMAP.html:813-825`).

---

## 4) Human-in-the-loop Interactivity (Ground Truth)

1. UI is command-driven: user copies shell commands and executes externally (`PIPELINE_DASHBOARD.html:537-544`, `PIPELINE_DASHBOARD.html:995-1005`).
2. Human approvals are explicit command steps for gate approvals (`PIPELINE_DASHBOARD.html:540`, `PIPELINE_DASHBOARD.html:562`, `PIPELINE_DASHBOARD.html:577`, `PIPELINE_DASHBOARD.html:1144-1149`, `PIPELINE_DASHBOARD.html:1275-1280`, `PIPELINE_DASHBOARD.html:1291-1295`).
3. Fail handling is user-mediated via generated fail/route commands (`PIPELINE_DASHBOARD.html:1448-1499`, `PIPELINE_DASHBOARD.html:1575-1619`).
4. Program focus interactions (select/highlight/virtual-state rendering) are available in roadmap (`PIPELINE_ROADMAP.html:438-487`, `PIPELINE_ROADMAP.html:502-526`).

---

## 5) State Logic Mirror

### 5.1 Runtime source consumed by UI

1. Dashboard state source is `_COMMUNICATION/agents_os/pipeline_state.json` (`PIPELINE_DASHBOARD.html:926`, `PIPELINE_DASHBOARD.html:1390`).
2. Roadmap state source is `_COMMUNICATION/agents_os/pipeline_state.json` (`PIPELINE_ROADMAP.html:388`).
3. UI gate status calculations are derived from `current_gate`, `gates_completed`, `gates_failed` fields (`PIPELINE_DASHBOARD.html:904-910`, `PIPELINE_ROADMAP.html:304-312`).

### 5.2 Governance source consumption pattern in roadmap page

1. Roadmap page parses roadmap and registry markdown tables (`PIPELINE_ROADMAP.html:776-777`, `PIPELINE_ROADMAP.html:792-793`).
2. WSM appears as canonical file entry and viewer target, not as parsed runtime state source for live gate/stage rendering (`PIPELINE_ROADMAP.html:272`, `PIPELINE_ROADMAP.html:752-765`, `PIPELINE_ROADMAP.html:813-825`).

### 5.3 WSM/runtime contradiction snapshot (at scan time)

Current runtime file values:
- `pipeline_state.json`: `stage_id=S001`, `current_gate=GATE_5`, `work_package_id=S001-P002-WP001` (`_COMMUNICATION/agents_os/pipeline_state.json:3-6`).

Current WSM canonical block values:
- `active_stage_id=S002`, `current_gate=GATE_8`, `active_program_id=S002-P002`, `active_work_package_id=N/A` (`documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md:94`, `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md:104`, `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md:109`, `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md:98`).

Observed result: runtime UI source and canonical WSM operational block are not equal at snapshot time.

---

## 6) Governance Integrity Check for AD-V2-01 / AD-V2-02 / AD-V2-05

| Debt ID | Current status (as implemented) | Evidence |
|---|---|---|
| AD-V2-01 (active stage extraction) | OPEN | `state_reader.py` searches `current_stage_id` regex (`agents_os_v2/observers/state_reader.py:66`), while WSM uses `active_stage_id` (`documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md:94`); resulting snapshot has no `active_stage` field (`_COMMUNICATION/agents_os/STATE_SNAPSHOT.json:6-11`). |
| AD-V2-02 (operational_state parser accuracy) | OPEN | `state_reader.py` extracts `CURRENT_OPERATIONAL_STATE ... (\w+)` (`agents_os_v2/observers/state_reader.py:69-71`); current snapshot value is `"operational_state": "upon"` (`_COMMUNICATION/agents_os/STATE_SNAPSHOT.json:8`). |
| AD-V2-05 (pipeline state vs WSM reconciliation) | OPEN | Both UIs render live state from `pipeline_state.json` (`PIPELINE_DASHBOARD.html:926`, `PIPELINE_ROADMAP.html:388`) with no WSM reconciliation step in UI logic; snapshot mismatch exists between runtime and WSM values (section 5.3). |

Manual relay status for current UI:
- Manual relay is still present (copy-paste flow remains required): `./pipeline_run.sh` output is pasted into external AI tools (`PIPELINE_DASHBOARD.html:517-520`, `PIPELINE_DASHBOARD.html:605-610`).

Parser improvement status in current UI code:
- Roadmap table parser includes a documented fix for header/separator ordering (`PIPELINE_ROADMAP.html:320-324`).
- Observer governance parser findings above remain open (AD-V2-01 / AD-V2-02).

---

## 7) Ground Truth Inventory (No Proposal Layer)

1. The implemented interface is a read/guide/copy control surface, not a direct state-mutating control plane.
2. The live UI state source is `pipeline_state.json`.
3. WSM is indexed/visible in roadmap UI but not used as the direct runtime rendering source for gate/stage.
4. Human approvals and route decisions are represented as explicit shell commands.
5. AD-V2-01, AD-V2-02, AD-V2-05 are still observable in current assets.

---

**log_entry | TEAM_190 | RFM_190_03 | INTERFACE_REALITY_REPORT_SUBMITTED | 2026-03-14**
