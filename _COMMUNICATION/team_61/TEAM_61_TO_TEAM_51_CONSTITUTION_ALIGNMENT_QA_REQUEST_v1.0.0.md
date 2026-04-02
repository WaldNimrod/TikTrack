---
id: TEAM_61_TO_TEAM_51_CONSTITUTION_ALIGNMENT_QA_REQUEST_v1.0.0
historical_record: true
from: Team 61
to: Team 51 (QA Remote)
cc: Team 101, Team 100
date: 2026-03-23
status: QA_REQUEST_FULFILLED — QA_PASS
type: CANONICAL_QA_ACTIVATION
mandate_ref: TEAM_101_TO_TEAM_61_CONSTITUTION_AND_CANONICAL_FLOW_ALIGNMENT_MANDATE_v1.0.0.md---

# בקשת QA קנונית — Team 51 | Constitution & Canonical Flow Alignment

## §1 — מטרה

אימות עצמאי (E2E + רגרסיה) של יישור **PIPELINE_CONSTITUTION.html** + **pipeline-monitor-core.js** (טבלת פאזים) + **gates.yaml** / **pipeline-gate-map.generated.js** מול מנוע ה-pipeline (`GATE_SEQUENCE`, routing ל-GATE_2/2.2).

## §2 — תנאי קדם

| # | Requirement |
|---|-------------|
| 1 | `./agents_os/scripts/start_ui_server.sh` — פורט **8090** |
| 2 | כתובות: `http://127.0.0.1:8090/static/PIPELINE_CONSTITUTION.html`, `.../PIPELINE_MONITOR.html` |
| 3 | `pipeline-config.js?v=16`, `pipeline-monitor-core.js?v=2`, `pipeline-gate-map.generated.js?v=2` |

## §3 — מטריצת בדיקה

| # | בדיקה | תוצאה צפויה |
|---|--------|-------------|
| C1 | **Constitution** — תרשים זרימה סטטי | **GATE_0** מופיע בין Idea Intake ל-**GATE_1** |
| C2 | **All Gate Phases** — שורה ראשונה | **GATE_0** (phase `0` או תצוגה מקבילה) עם Team **190** |
| C3 | **CON-004** — שורת **GATE_2 / 2.2**, מצב **AUTO** | עמודת TRACK_FOCUSED: **Team 10 (TikTrack) · Team 11 (Agents_OS)** (או ניסוח שקול) |
| C4 | **Monitor** — מצב **TRACK_FOCUSED** + דומיין **TikTrack** (localStorage) | בעלות 2.2 = **Team 10** |
| C5 | **resolveCanonicalGate** | אין מיפוי `GATE_0`→`GATE_1` ב-`__PHOENIX_LEGACY_GATE_MAP` (אימות בקונסול/קוד מקור) |
| C6 | **Dashboard** — expected files ב-GATE_0 (אם state מאפשר) | רשימה כוללת נתיבי TEAM_190 GATE_0 |
| R1 | Pytest | `python3 -m pytest agents_os_v2/tests/ -q -k "not OpenAI and not Gemini"` — **0 failures** |

## §4 — MCP / דפדפן (מומלץ)

`snapshot` ל-Constitution (תרשים + טבלת פאזים); בדיקת מתג Track + דומיין ל-2.2.

## §5 — ארטיפקט Team 51

| Deliverable | נתיב |
|-------------|------|
| דוח | `_COMMUNICATION/team_51/TEAM_51_CONSTITUTION_ALIGNMENT_QA_REPORT_v1.0.0.md` |
| תוצאה | `QA_PASS` או `QA_FAIL` |

## §6 — אחרי QA_PASS

Team 61 מעביר ל-**Team 101** (ראה `TEAM_61_TO_TEAM_101_CONSTITUTION_ALIGNMENT_HANDOFF_v1.0.0.md`).

---

**log_entry | TEAM_61 | TO_TEAM_51 | CONSTITUTION_ALIGNMENT_QA | 2026-03-23**
