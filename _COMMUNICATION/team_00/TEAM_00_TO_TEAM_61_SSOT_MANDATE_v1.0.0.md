---
id: TEAM_00_TO_TEAM_61_SSOT_MANDATE_v1.0.0
historical_record: true
from: Team 00 (Nimrod — System Designer)
to: Team 61 (AOS TRACK_FOCUSED Unified Implementor)
cc: Team 190 (Constitutional Validator — post-delivery), Team 170 (WSM Governance), Team 100
date: 2026-03-21
priority: CRITICAL — BLOCKING all other packages
status: ISSUED
domain: AOS (agents_os_v2 infrastructure)
work_package: S003-P012-WP001 scope (pipeline infrastructure)
superseded_by: N/A---

# מנדט SSOT — Single Source of Truth יישום מיידי

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| mandate_id | SSOT_IMPLEMENTATION_v1.0.0 |
| from | Team 00 (Nimrod) |
| to | Team 61 |
| priority | CRITICAL — pre-condition לכל חבילה אחרת |
| domain | AOS (agents_os_v2 + WSM) |

---

## §1 — הקשר והחלטה נעולה

**החלטת ארכיטקטורה נעולה (2026-03-21):**

מודל SSOT קנוני שלוש שכבות:

```
pipeline_state_*.json     ← SINGLE MASTER — SSOT לכל מצב תפעולי
WSM CURRENT_OPERATIONAL_STATE ← auto-projection (נכתב ע"י pipeline בלבד)
STATE_SNAPSHOT.json / STATE_VIEW.json ← auto-rebuilt בכל advance
```

**כלל עליון (Iron Rule):**
- `pipeline_run.sh pass/fail/approve` ← מעדכן בצורה אטומית את כל שלוש השכבות
- **אף צוות לא כותב ל-WSM CURRENT_OPERATIONAL_STATE ידנית — לעולם**
- Dashboard buttons → קוראים לאותה advance logic (לא bypass)
- אוטומציה עתידית → קוראת לאותה advance logic

---

## §2 — מצב קיים (בסיס לעבודה)

| רכיב | מצב |
|---|---|
| `agents_os_v2/orchestrator/wsm_writer.py` — `write_wsm_state()` | קיים, עובד חלקית (4 שדות בלבד) |
| Guard: `if state.gate_state is not None: return` | חוסם עדכונים — יש לבטל/לתקן |
| `_write_state_view()` ב-pipeline.py | כותב STATE_VIEW.json — בסיס טוב |
| CI --check script | **לא קיים** |
| WSM governance note | **לא קיים** |
| Fields updated by wsm_writer | 4 בלבד: active_stage_id, current_gate, active_work_package_id, last_closed_work_package_id |

---

## §3 — הגדרת עבודה מפורטת

### Task A — הרחבת `write_wsm_state()` לכל שדות CURRENT_OPERATIONAL_STATE

**קובץ:** `agents_os_v2/orchestrator/wsm_writer.py`

השדות הנדרשים לסנכרון (כל השדות בבלוק CURRENT_OPERATIONAL_STATE ב-WSM):

| שדה WSM | מקור ב-pipeline_state | כלל עדכון |
|---|---|---|
| `active_stage_id` | `state.stage_id` | תמיד |
| `active_stage_label` | lookup מ-stage_id | תמיד |
| `active_flow` | `state.work_package_id` + gate status | תמיד |
| `active_project_domain` | `state.project_domain` | תמיד |
| `active_work_package_id` | `state.work_package_id` (GATE_8 PASS → N/A) | תמיד |
| `in_progress_work_package_id` | `state.work_package_id` (GATE_8 PASS → N/A) | תמיד |
| `last_closed_work_package_id` | `state.work_package_id` בGATE_8 PASS | GATE_8 PASS בלבד |
| `current_gate` | `state.current_gate` | תמיד |
| `track_mode` | `state.process_variant` → NORMAL/FAST | תמיד |
| `phase_owner_team` | resolve_phase_owner_from_state() | תמיד |
| `last_gate_event` | gate_id + result + date | תמיד |
| `next_required_action` | generated from gate + result | תמיד |
| `next_responsible_team` | phase_owner עבור שלב הבא | תמיד |

**בנוסף:** הסר את הguard `if state.gate_state is not None: return` — Guard זה חוסם עדכונים ב-states לגיטימיים. אם יש סיבה לguard — תעד ב-comment + צמצם לcases ספציפיים בלבד.

### Task B — STATE_SNAPSHOT rebuild on every advance

**קבצים:** `agents_os_v2/orchestrator/pipeline.py` + `agents_os_v2/observers/state_reader.py`

כל קריאה ל-advance (pass/fail/approve) חייבת לכלול rebuild של STATE_SNAPSHOT.json:
```python
# After writing pipeline_state:
try:
    _rebuild_state_snapshot(state)
except Exception:
    _emit_pipeline_event("SNAPSHOT_WARN", state, gate_id, "snapshot_rebuild_failed")
```

`_rebuild_state_snapshot()` → קוראת ל-state_reader.py build_state_snapshot() → כותבת STATE_SNAPSHOT.json.

**כלל:** לא נכשלת advance גם אם snapshot rebuild נכשל (non-blocking — כמו write_wsm).

### Task C — CI --check script

**קובץ חדש:** `agents_os_v2/tools/ssot_check.py`

```
python -m agents_os_v2.tools.ssot_check [--domain tiktrack|agents_os]
```

**לוגיקה:**
1. טוען `pipeline_state_{domain}.json`
2. טוען WSM `CURRENT_OPERATIONAL_STATE` block
3. משווה: active_stage_id, current_gate, active_work_package_id, active_project_domain
4. exit 0 אם עקבי
5. exit 1 + diff ברור אם drift מזוהה

**integration ב-`pipeline_run.sh`:**
- לאחר כל `pass/fail/approve` command: run `--check` ו-print תוצאה (non-blocking אך visible)
- כל output: "SSOT CHECK: ✓ CONSISTENT" / "SSOT CHECK: ⚠ DRIFT DETECTED — [field]: [wsm] ≠ [state]"

### Task D — WSM Governance Note

**קובץ:** `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`

הוסף בראש הבלוק CURRENT_OPERATIONAL_STATE:

```markdown
> ⚠️ AUTO-GENERATED BLOCK — Do NOT edit manually.
> This block is written exclusively by `pipeline_run.sh` (pass/fail/approve).
> Manual edits will be overwritten on next pipeline advance.
> To check SSOT consistency: `python -m agents_os_v2.tools.ssot_check`
```

**Team 170:** אחראי על הוספת ה-note לWSM ועל עדכון PORTFOLIO_WSM_SYNC_RULES שלא כולל עוד "Teams manually update WSM after each gate."

### Task E — Background sync (Team 101 integration note)

כחלק מחבילת Team 101 (recurring background tasks): רשום use case ראשוני:
```
task_id: wsm_sync
interval: configurable by operator (default: 5 minutes)
action: python -m agents_os_v2.tools.ssot_check --auto-sync
effect: if drift detected → auto-patch WSM from pipeline_state (non-blocking)
```

**אין לממש Task E עכשיו** — זה placeholder לLOD200 של חבילת Team 101. רשום רק בתוצר comment/note.

---

## §4 — קריטריוני הצלחה (Acceptance Criteria)

כל AC חייב להיות PASS לפני שהצוות מגיש GATE_4:

| # | AC | בדיקה |
|---|---|---|
| AC-01 | `./pipeline_run.sh --domain tiktrack pass` → WSM CURRENT_OPERATIONAL_STATE מכיל ≥10 שדות מעודכנים | grep + compare |
| AC-02 | `./pipeline_run.sh --domain tiktrack pass` → STATE_SNAPSHOT.json מכיל stage_id עדכני | file compare |
| AC-03 | Guard `gate_state is not None` הוסר/צומצם — WSM מתעדכן ב-GATE_3/3.2 pass | test + verify |
| AC-04 | `python -m agents_os_v2.tools.ssot_check --domain tiktrack` → exit 0 כשלא drift | CI run |
| AC-05 | `python -m agents_os_v2.tools.ssot_check --domain tiktrack` → exit 1 + diff output כש-drift מלאכותי מוזרק | test inject |
| AC-06 | WSM CURRENT_OPERATIONAL_STATE כולל note "AUTO-GENERATED BLOCK — Do NOT edit manually" | grep |
| AC-07 | כל 125 בדיקות קיימות עוברות (לא כולל pre-existing failure: test_gate_2_uses_gemini) | pytest |
| AC-08 | 5+ בדיקות חדשות: SSOT consistency scenarios (drift detect, advance sync, full cycle) | pytest -v |
| AC-09 | pipeline_run.sh מציג SSOT CHECK result אחרי כל pass/fail/approve | manual verify |
| AC-10 | Team 170 מאשר: PORTFOLIO_WSM_SYNC_RULES מעודכן לאסור manual writes לCURRENT_OPERATIONAL_STATE | doc review |

---

## §5 — אופן ביצוע

**מסגרת S003-P012 — meta-process מאושר:**
תהליך זה רץ ללא pipeline_run.sh (pipeline בתיקון). מסגרת:
1. Team 61: מממש Tasks A-E
2. Team 190: מאמת (adversarial validation — AC-01..AC-10)
3. Team 100 / Team 00: מאשר
4. Team 170: מעדכן WSM governance + PORTFOLIO_WSM_SYNC_RULES

**הגשת תוצר:**
```
_COMMUNICATION/team_61/TEAM_61_SSOT_IMPLEMENTATION_DELIVERY_v1.0.0.md
```
כולל:
- Identity header מלא
- Evidence per AC-01..AC-10 (pass/fail + evidence path)
- שינויים בקוד (diff summary)
- Note על Task E (Team 101 placeholder)
- SOP-013 seal

---

## §6 — עדיפות וחסימה

**חסם:** אין לפתוח חבילת עבודה חדשה (TikTrack או AOS) עד ש-AC-01..AC-10 PASS + Team 190 VALIDATION PASS + Team 00 APPROVE.

זהו תנאי כניסה מוחלט לכל חבילה הבאה ברצף S003-P012.

---

**log_entry | TEAM_00 | MANDATE_ISSUED | SSOT_IMPLEMENTATION | TO_TEAM_61 | CRITICAL_BLOCKING | 2026-03-21**
