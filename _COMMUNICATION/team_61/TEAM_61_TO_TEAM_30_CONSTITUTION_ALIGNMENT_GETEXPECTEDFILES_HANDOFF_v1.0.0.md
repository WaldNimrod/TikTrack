---
id: TEAM_61_TO_TEAM_30_CONSTITUTION_ALIGNMENT_GETEXPECTEDFILES_HANDOFF_v1.0.0
historical_record: true
from: Team 61
to: Team 30 (Frontend Execution)
cc: Team 101, Team 100
date: 2026-03-23
status: REVIEW_COMPLETE
mandate_ref: TEAM_101_TO_TEAM_61_CONSTITUTION_AND_CANONICAL_FLOW_ALIGNMENT_MANDATE_v1.0.0.md
topic: SIM-CLOSE-01 — getExpectedFiles for GATE_0 / GATE_1---

# Handoff — `getExpectedFiles` (GATE_0 / GATE_1)

## §1 — הקשר

מנדט Team 101 → Team 61 דורש **תיאום** עם Team 30 על `getExpectedFiles` ל-**GATE_0** / **GATE_1** (או patch לסקירה). Team 61 **לא** ממזג קוד Team 30 ללא review (מנדט §4.5).

## §2 — מה יושם ב-Team 61 (בינתיים)

**קובץ:** [`agents_os/ui/js/pipeline-config.js`](agents_os/ui/js/pipeline-config.js) — פונקציה `getExpectedFiles()`:

| Gate / phase | Expected artifacts (תמצית) |
|--------------|----------------------------|
| **GATE_0** | `TEAM_190_{WPU}_GATE_0_VERDICT_v1.0.0.md`, `GATE_0_VALIDATION` alt |
| **GATE_1 / 1.1** | `TEAM_170_{WPU}_LLD400_v1.0.0.md` |
| **GATE_1 / 1.2** | `TEAM_190_{WPU}_GATE_1_VERDICT_v1.0.0.md` |
| **GATE_1** (בלי phase) | שני הנתיבים למעלה (הנחיה כשהמצב ללא `current_phase`) |

הנתיבים מיושרים עם מועמדי verdict ב-[`agents_os_v2/orchestrator/pipeline.py`](agents_os_v2/orchestrator/pipeline.py) (בלוקי `_verdict_candidates` / GATE_0 / GATE_1).

## §3 — בקשה ל-Team 30

1. **סקירת UX** — האם תוויות/רשימת קבצים בדשבורד תואמות את תהליך העבודה של צוותי TikTrack / Agents_OS.
2. **הערות** — אם נדרשים שינויי naming או תנאים נוספים (למשל domain slug), להחזיר ל-Team 61 או Team 101.
3. **אין חובה** לממש בקוד בצד Team 30 אם הסקירה מאשרת את הלוגיקה הקיימת — עדכנו בדוח.

## §4 — קישורים

- דוח השלמה Team 61: `TEAM_61_CONSTITUTION_ALIGNMENT_COMPLETION_REPORT_v1.0.0.md` (באותה תיקייה).

---

## Resolution (2026-03-23)

| Field | Value |
|-------|--------|
| Team 30 review | `TEAM_30_TO_TEAM_61_GETEXPECTEDFILES_UX_REVIEW_v1.0.0.md` — **APPROVED** (no Team 30 code changes) |
| Team 61 ACK | `TEAM_61_TEAM30_GETEXPECTEDFILES_UX_ACK_v1.0.0.md` |
| Follow-up | Domain default alignment in `getExpectedFiles` per §5.1 |

---

**log_entry | TEAM_61 | TO_TEAM_30 | GETEXPECTEDFILES_GATE01 | 2026-03-23**
