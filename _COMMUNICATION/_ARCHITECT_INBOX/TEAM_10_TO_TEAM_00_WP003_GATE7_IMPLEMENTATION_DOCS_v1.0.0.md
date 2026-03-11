# Team 10 → Team 00 | WP003 GATE_7 — Implementation Docs Package

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_00_WP003_GATE7_IMPLEMENTATION_DOCS  
**from:** Team 10 (The Gateway)  
**to:** Team 00 (Chief Architect)  
**date:** 2026-03-11  
**trigger:** TEAM_00_TO_TEAM_10_S002_P002_WP003_DECISIONS_LOCK §3 — Document Review Request

---

## Correction Cycle (TEAM_190 / TEAM_00)

| Field | Value |
|-------|-------|
| correction_cycle_ref | TEAM_190_PLAN_REVALIDATION_RESULT, TEAM_00_GATE7_REVIEW_RESULT |
| what_changed | תאריכים→2026-03-11; Team 60 blocker→CLOSED; v1.1.0 resubmission עם מנדטים B1/B2/B4 |

---

## 1) רשימת מסמכים — LOD400 / Spec / Implementation

| # | מסמך | תיאור |
|---|------|--------|
| 1 | `TEAM_00_TO_TEAM_10_S002_P002_WP003_GATE7_SPEC_RESPONSE_v1.0.0.md` | תשובות מלאות ל־6 GINs — מקור האפיון |
| 2 | `TEAM_00_TO_TEAM_10_S002_P002_WP003_DECISIONS_LOCK_v1.0.0.md` | 3 החלטות נעולות + סדר ביצוע |
| 3 | `TEAM_10_SPEC_RESPONSE_ACK_AND_ACTION_PLAN_v1.0.0.md` | אישור Team 10 + תוכנית פעולה + ניתוב |
| 4 | `TEAM_10_NIMROD_S002_P002_WP003_G7_PRELIMINARY_FEEDBACK_v1.0.0.md` | 14 ממצאים + 2.5 (מקור הדרישות) |
| 5 | `TEAM_10_PRE_DEVELOPMENT_GATE_AND_INFORMATION_REQUESTS_v1.0.0.md` | שער מקדמי + 6 GINs |
| 6 | `TEAM_10_TO_ARCHITECT_TEAMS_QA_PROCESS_GAP_ANALYSIS_v1.0.0.md` | ניתוח כשל QA — Handoff |

---

## 2) Implementation Plan — חלוקת עבודה

### סדר ביצוע (מתוך TEAM_00_DECISIONS_LOCK §4)

| סדר | צוות | פעולה | P |
|-----|------|--------|---|
| 1 | **Team 20** | TASE agorot fix (`yahoo_provider.py`, `alpha_provider.py`) | P0 |
| 2 | **Team 60** | EOD sync, וידוא ticker_prices מאוכלס, אימות 3/3 (GATE) | P0 — CLOSED |
| 3 | **Team 30** | Traffic light tooltip (null→"אין נתונים"); Summary filter-aware | P0 |
| 4 | **Team 30** | Actions menu hover (Spec A: 150ms/100ms, gap=0, zone) | P1 |
| 5 | **Team 30** | Settings: off_hours_interval_minutes, alpha_quota_cooldown_hours; תיקון max_symbols (50), delay (1) | P1 |
| 6 | **Team 30** | Background jobs: toggle + inline history (▼ היסטוריה N) + heat card | P1/P2 |
| 7 | **Team 30** | Modal skeleton loading (ממצא 3) | P1 |
| 8 | **Team 50** | Runtime E2E assertions (Phase 2) | P1 |
| 9 | **Team 30** | Status legend; Refresh buttons | P2 |

### Specs נעולים להעברת מימוש

| פריט | Spec | קובץ |
|------|------|------|
| Hover menu | Hover-in 150ms, exit 100ms, gap=0, zone=tr+panel | DECISIONS_LOCK §1 [A] |
| Inline history | `▼ היסטוריה (N)`, 5 ריצות, עמודות: תאריך \| סטטוס \| משך \| רשומות \| שגיאות | DECISIONS_LOCK §1 [B] |
| Heat card | `load_pct = active/max×100`; ירוק <50%, צהוב 50–79%, אדום ≥80% | DECISIONS_LOCK §1 [C] |

---

## 3) מסמכי קואורדינציה

| מסמך | יעד |
|------|-----|
| `TEAM_10_GIN_001_PRICE_AND_MARKET_DATA_CLARIFICATIONS.md` | GIN — נענה ב־SPEC_RESPONSE |
| `TEAM_10_GIN_002_TICKER_STATUS_AND_SUMMARY_CLARIFICATIONS.md` | GIN — נענה |
| `TEAM_10_GIN_003_TABLE_ACTIONS_MENU_UX_SPEC.md` | GIN — נענה + החלטה A |
| `TEAM_10_GIN_004_SYSTEM_MANAGEMENT_SPEC_COMPLETIONS.md` | GIN — נענה + החלטה B |
| `TEAM_10_GIN_005_MARKET_DATA_SETTINGS_SPEC.md` | GIN — נענה + החלטה C |
| `TEAM_10_GIN_006_QA_AUTOMATION_SPEC_COMPLETIONS.md` | GIN — נענה |

---

## 4) Gate-Blocker: CLOSED

**Team 60** — **CLOSED.** Evidence: `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_S002_P002_WP003_AUTO_WP003_05_RE_VERIFY_RESULT.md` (status PASS, 3/3). ticker_prices מאוכלס.

---

**log_entry | TEAM_10 | IMPLEMENTATION_DOCS | TO_TEAM_00 | 2026-03-11**
