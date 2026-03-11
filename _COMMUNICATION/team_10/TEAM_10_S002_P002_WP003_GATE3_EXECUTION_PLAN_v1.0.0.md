# Team 10 | S002-P002-WP003 — GATE_3 Execution Plan (סדר העברה ותלויות)

**project_domain:** TIKTRACK  
**id:** TEAM_10_S002_P002_WP003_GATE3_EXECUTION_PLAN  
**from:** Team 10 (Execution Orchestrator)  
**date:** 2026-03-11  
**gate_id:** GATE_3  
**work_package_id:** S002-P002-WP003  
**current_stage:** G3.7 (Implementation Orchestration)

---

## 1) סדר העברה ותלויות — G3.7

```
                    ┌─────────────────────────────────────────┐
                    │           Team 10 Orchestration          │
                    └─────────────────────────────────────────┘
                                       │
          ┌────────────────────────────┼────────────────────────────┐
          ▼                            ▼                            ▼
   ┌──────────────┐            ┌──────────────┐            ┌──────────────┐
   │   Team 20    │            │   Team 30    │            │   Team 50     │
   │   (B2)       │            │   (B1)       │            │   (B4)       │
   │ TASE Agorot  │            │ 13 items     │            │ Phase 2      │
   │   P0         │            │ T30-1..13    │            │ Runtime     │
   └──────────────┘            └──────────────┘            └──────────────┘
          │                            │                            │
          │  מקביל                     │  תלוי חלקי ב-B2             │  תלוי ב-B2
          │  (ללא חסימה)               │  (hover, tooltip...)        │  (TEVA.TA < 200)
          ▼                            ▼                            ▼
   ┌──────────────────────────────────────────────────────────────────────┐
   │                    G3.8 — Completion Collection                        │
   │  Team 10: איסוף דוחות השלמה מ-20, 30, 50; אימות evidence paths       │
   └──────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
   ┌──────────────────────────────────────────────────────────────────────┐
   │                    G3.9 — GATE_3 Close → GATE_4 Open                   │
   │  Team 10: חבילת handoff; פתיחת שלב QA; מנדט ל-Team 50                │
   └──────────────────────────────────────────────────────────────────────┘
```

---

## 2) טבלת תלויות מפורטת

| צוות | מנדט | תלות | ניתן להפעיל |
|------|------|------|-------------|
| **Team 20** | B2 — TASE agorot fix | אין | **עכשיו** |
| **Team 30** | B1 — 13 פריטים | T30-1..13 רובם עצמאיים; T30-2 (inline history) יכול לרוץ במקביל | **עכשיו** (רוב הפריטים) |
| **Team 50** | B4 — Phase 2 runtime | **תלוי B2** — assertions כוללים TEVA.TA < 200 | **אחרי B2 completed** |

---

## 3) סדר הפעלה מומלץ

| סדר | צוות | פעולה | טריגר |
|-----|------|--------|-------|
| 1 | **Team 20** | TASE agorot fix — `TEAM_10_TO_TEAM_20_S002_P002_WP003_TASE_AGOROT_FIX_MANDATE_v1.0.0.md` | מיידי |
| 2 | **Team 30** | 13 פריטים — `TEAM_10_TO_TEAM_30_S002_P002_WP003_GATE7_FULL_MANDATE_v1.0.0.md` | מיידי |
| 3 | **Team 50** | Phase 2 runtime — `TEAM_10_TO_TEAM_50_S002_P002_WP003_PHASE2_RUNTIME_MANDATE_v1.0.0.md` | אחרי Team 20 דוח השלמה B2 |

---

## 4) נתיבי Deliverable

| צוות | קובץ השלמה |
|------|-------------|
| Team 20 | `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P002_WP003_TASE_AGOROT_FIX_COMPLETION.md` |
| Team 30 | `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_S002_P002_WP003_GATE7_FULL_MANDATE_COMPLETION.md` |
| Team 50 | `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_S002_P002_WP003_PHASE2_RUNTIME_COMPLETION.md` |

---

## 5) פרומטים להפעלה

ראה: `TEAM_10_S002_P002_WP003_GATE3_ACTIVATION_PROMPTS_v1.0.0.md`

---

**log_entry | TEAM_10 | WP003_GATE3_EXECUTION_PLAN | CREATED | 2026-03-11**
