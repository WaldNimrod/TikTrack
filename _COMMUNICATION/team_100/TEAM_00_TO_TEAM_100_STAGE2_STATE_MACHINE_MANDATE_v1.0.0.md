---
id: TEAM_00_TO_TEAM_100_STAGE2_STATE_MACHINE_MANDATE_v1.0.0
historical_record: true
from: Team 00 (Nimrod — System Designer)
to: Team 100 (Chief System Architect)
date: 2026-03-26
status: ACTIVE
type: MANDATE
subject: AOS v3 Spec — Stage 2 State Machine Spec
prereq: Stage 1b CLOSED (Entity Dictionary v2.0.2 — SSOT)
reviewer: Team 190
gate_approver: Team 00 (Nimrod)---

# MANDATE — Stage 2: State Machine Spec

## 1. מטרה

לייצר מפרט מכונת מצבים מלאה ומדויקת ל-`Run` — יחידת האגרגציה המרכזית ב-AOS v3.
הפלט ינעל את לוגיקת המעברים, ה-Guards, ה-Actions, ואת Edge Cases — כך שStage 3 (Use Cases) ו-Stage 4 (DDL) יכולים להסתמך עליו ישירות.

## 2. SSOT להכנה — חובה לקרוא לפני כתיבה

| קובץ | מה רלוונטי |
|---|---|
| `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md` | **SSOT מלא** — כל 13 ישויות, שדות, invariants |
| `_COMMUNICATION/team_00/TEAM_00_AOS_V3_SPEC_PROCESS_PLAN_v1.0.0.md` | פורמט חובה לStage 2, Iron Rules |
| `documentation/docs-governance/01-FOUNDATIONS/TEAMS_ROSTER_v1.0.0.json` | team_00 = Principal, team_10 scope |
| `_COMMUNICATION/team_100/TEAM_101_TO_TEAM_100_AOS_V3_CONSOLIDATED_FEEDBACK_FOR_CHIEF_ARCHITECT_v1.1.0.md` | §12 (Team 10 Iron Rule) + D-03 |

## 3. פורמט פלט חובה

```markdown
## States (per Run)
NOT_STARTED | IN_PROGRESS | CORRECTION | PAUSED | COMPLETE

## Transition Table
| From | Event | Actor | Guard | To | Action | Event Emitted |
|---|---|---|---|---|---|---|
| ... | ... | ... | ... | ... | ... | ... |

## Mermaid State Diagram
[diagram]

## Edge Cases (minimum 10)
| EC-# | תיאור | תוצאה מצופה |

## Iron Rules (locked)
[ראה §4 למטה]
```

## 4. Iron Rules שחייבים להופיע בSpec

1. **Pipeline engine = orchestrator** — אף צוות (כולל team_10) לא מבצע state transitions ישירות. כל מעבר מצב = pipeline engine בלבד.
2. **team_10 scope ב-v3** = GATE_3 Work Plan author בלבד — לא state mutator, לא status updater.
3. **PAUSED snapshot חובה** — מעבר ל-PAUSED חייב לכתוב `paused_routing_snapshot_json` באותה טרנזקציה.
4. **Resume = same gate/phase** — PAUSED → IN_PROGRESS חוזר לאותו `current_gate_id` + `current_phase_id` ללא איפוס.
5. **HITL gates = team_00 בלבד** — actor=team_00 ב-APPROVE transitions.
6. **BLOCKER = dual check** — `can_block_gate=1` AND שורה ב-`gate_role_authorities` — שניהם נדרשים.
7. **Assignment frozen during PAUSED** — אסור לשנות Assignment כאשר Run=PAUSED, אלא באירוע `TEAM_ASSIGNMENT_CHANGED` מאושר team_00.

## 5. מעברים קריטיים לכסות (לפחות)

| From | Event | הערה |
|---|---|---|
| NOT_STARTED | initiate | Guard: אין IN_PROGRESS אחר לאותו domain |
| IN_PROGRESS | pass | Guard: actor = current team per routing |
| IN_PROGRESS | fail | Guard: role has can_block_gate + gate_role_authorities row |
| IN_PROGRESS | approve | Guard: actor = team_00 (HITL gate only) |
| IN_PROGRESS | pause | Action: write paused_routing_snapshot_json |
| PAUSED | resume | Action: restore gate/phase from snapshot |
| CORRECTION | pass | Guard: correction_cycle_count < policy max |
| CORRECTION | pass_final | COMPLETE on final retry |
| ANY_ACTIVE | principal_override | team_00 can intervene at any point |

## 6. Edge Cases חובה (לפחות 10)

1. `pass()` קורה פעמיים על אותו gate/phase
2. `pause()` כאשר Run כבר PAUSED
3. `resume()` כאשר snapshot חסר (NULL)
4. שני domains פועלים במקביל — אחד PAUSED, אחד IN_PROGRESS
5. Assignment משתנה בזמן PAUSED בלי Principal event
6. `fail()` ע"י role שאין לו שורה ב-gate_role_authorities
7. CORRECTION מגיע למקסימום cycles (policy לא קבועה ב-dict)
8. HITL gate — team_00 לא מגיב (timeout policy)
9. `initiate()` כאשר יש כבר IN_PROGRESS באותו domain
10. `resume()` אחרי TEAM_ASSIGNMENT_CHANGED בזמן PAUSE

## 7. פלט נדרש

**קובץ:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_STATE_MACHINE_SPEC_v1.0.0.md`

**ולאחר מכן:** route ל-Team 190 לביקורת.

---

**log_entry | TEAM_00 | STAGE2_STATE_MACHINE_MANDATE | ISSUED | 2026-03-26**
