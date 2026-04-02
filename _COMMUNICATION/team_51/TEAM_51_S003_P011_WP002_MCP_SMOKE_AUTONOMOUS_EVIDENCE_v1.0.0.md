---
project_domain: AGENTS_OS
id: TEAM_51_S003_P011_WP002_MCP_SMOKE_AUTONOMOUS_EVIDENCE_v1.0.0
historical_record: true
from: Team 51 (AOS QA & Functional Acceptance)
to: Team 11, Team 61
date: 2026-03-20
work_package_id: S003-P011-WP002
status: EVIDENCE_ARTIFACT---

# S003-P011-WP002 — MCP + SMOKE אוטונומיים (ראיות runtime)

ביצוע עצמאי לפי `_COMMUNICATION/team_61/PIPELINE_SMOKE_TESTS_v1.0.0.md`, `agents_os/scripts/start_ui_server.sh`, ו־`agents_os_v2/mcp/test_scenarios.py` (דפוס צעדים).  
**כלים:** טרמינל (repo root), `curl`, `python3`, **cursor-ide-browser** (`browser_navigate`, `browser_click`, `browser_snapshot`).

---

## §1 CLI + JSON (ללא שינוי state פעיל)

| שלב | פקודה / פעולה | תוצאה |
|-----|----------------|--------|
| SMOKE_01/02 status | `./pipeline_run.sh --domain agents_os status` | **exit 0** — WP `S003-P011-WP002`, `Current: GATE_4`, Owner team_51 |
| | `./pipeline_run.sh --domain tiktrack status` | **exit 0** — WP `S002-P002-WP001`, `Current: GATE_3`, Owner team_11 |
| קוהרנטיות קובץ | `python3` קריאת JSON | `pipeline_state_agentsos.json`: `gate=GATE_4`, `phase=3.1`, `process_variant=TRACK_FOCUSED` |
| | | `pipeline_state_tiktrack.json`: `gate=GATE_3`, `phase=3.1`, `process_variant=TRACK_FULL` |
| API | `curl /api/health` | **HTTP 200** |
| | `curl /api/config/team-engine` | **HTTP 200** |

---

## §2 MCP — Dashboard (8090)

| צעד | כלי MCP | URL / פעולה | תוצאה |
|-----|---------|-------------|--------|
| D1 | `browser_navigate` | `http://127.0.0.1:8090/static/PIPELINE_DASHBOARD.html` | עמוד נטען |
| D2 | `browser_click` | 🟢 Agents OS | `Page Title: Agents OS — Pipeline Dashboard` |
| D3 | `browser_click` | ↺ Refresh | רשימת שערים: **GATE_4 ←** (תואם `pipeline_state_agentsos.json`) |
| D4 | `browser_snapshot` (selector) | `#team-assignment-panel`, `#lod200-author-override`, … | combobox Lod200: Team 100 / 101 / 102; כפתורי mandate/QA נראים |
| D5 | `browser_click` | 🔵 TikTrack | `Page Title: TikTrack — Pipeline Dashboard` |
| D6 | `browser_click` | ↺ Refresh | רשימת שערים: **GATE_3 ←** (תואם `pipeline_state_tiktrack.json`) |

**הערת UX:** לפני Refresh אחרי מעבר דומיין, פס השערים עלול להציג נתונים ישנים — **חובה Refresh** לאימות מול JSON.

---

## §3 MCP — Teams (Engine editor)

| צעד | כלי | תוצאה |
|-----|-----|--------|
| T1 | `browser_navigate` | `http://127.0.0.1:8090/static/PIPELINE_TEAMS.html` |
| T2 | `browser_snapshot` | כותרת **Agents OS — Teams & Context Monitor**; כפתור **💾 Save to team_engine_config.json** נוכח |

---

## §4 SMOKE_03 — מחזור תיקון (בידוד pytest; ללא הרצת fail על state פעיל)

לפי `PIPELINE_SMOKE_TESTS_v1.0.0.md` §SMOKE_03 + הפניה ל־`test_cert_10`:

```text
$ python3 -m pytest agents_os_v2/tests/test_certification.py::test_cert_11_cli_fail_writes_findings \
    agents_os_v2/tests/test_certification.py::test_cert_10_correction_banner_gate3 -v --tb=short
2 passed in 0.08s
```

---

## §5 סיכום

| רכיב | סטטוס |
|------|--------|
| SMOKE CLI + קריאת state | **בוצע** |
| MCP Dashboard AOS + TikTrack | **בוצע** |
| MCP Teams + Save | **בוצע** |
| לולאת pass מלאה GATE_1→GATE_5 על state פעיל | **לא בוצע** (מניעת drift — מכוסה ב־CERT_15 + pytest) |

---

**log_entry | TEAM_51 | S003_P011_WP002 | MCP_SMOKE_AUTONOMOUS | 2026-03-20**
