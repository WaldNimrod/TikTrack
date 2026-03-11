# Team 10 | S002-P002-WP003 GATE_3 — Activation Prompts (G3.7)

**project_domain:** TIKTRACK  
**id:** TEAM_10_S002_P002_WP003_GATE3_ACTIVATION_PROMPTS  
**from:** Team 10 (Execution Orchestrator)  
**date:** 2026-03-11  
**gate_id:** GATE_3  
**sub_stage:** G3.7 — Implementation Orchestration  
**purpose:** פרומטים להפעלת צוותים 20, 30, 50 — העתק והעבר לכל צוות

---

## הקשר

WP003 נפסל ב־GATE_7; הזרימה חזרה ל־GATE_3. תוכנית העבודה אושרה (Team 190 + Team 00 PASS). כעת — **יישום פיתוח** (G3.7).

---

## פרומט 1 — Team 20 (TASE Agorot Fix)

```
## Team 20 | S002-P002-WP003 — TASE Agorot Fix (B2)

**Squad ID:** 20 (Backend Implementation)  
**gate_id:** GATE_3  
**sub_stage:** G3.7  
**מנדט:** _COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_S002_P002_WP003_TASE_AGOROT_FIX_MANDATE_v1.0.0.md

**תפקידך:**
1. קרא את המנדט לעיל במלואו.
2. בצע את התיקונים:
   - `api/integrations/market_data/providers/yahoo_provider.py` — _fetch_prices_batch_sync() + _fetch_last_close_via_v8_chart(): זיהוי `.TA` + ÷100
   - `api/integrations/market_data/providers/alpha_provider.py` — _get_price_from_timeseries_daily(): אם price > 1000 ל-ILS → ÷100
3. בדוק: TEVA.TA current_price < 200 (טווח שקלים).
4. צור דוח השלמה: _COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_S002_P002_WP003_TASE_AGOROT_FIX_COMPLETION.md

**חובה:** MANDATORY FILES — 06-GOVERNANCE_&_COMPLIANCE/standards/PHOENIX_MASTER_BIBLE.md, D15_SYSTEM_INDEX.md
```

---

## פרומט 2 — Team 30 (13 פריטים)

```
## Team 30 | S002-P002-WP003 — Full Mandate 13 Items (B1)

**Squad ID:** 30 (Frontend Execution)  
**gate_id:** GATE_3  
**sub_stage:** G3.7  
**מנדט:** _COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_S002_P002_WP003_GATE7_FULL_MANDATE_v1.0.0.md

**תפקידך:**
1. קרא את המנדט לעיל במלואו.
2. SSOT: _COMMUNICATION/team_00/TEAM_00_TO_TEAM_10_S002_P002_WP003_GATE7_SPEC_RESPONSE_v1.0.0.md, DECISIONS_LOCK_v1.0.0.md
3. מממש את כל 13 הפריטים (T30-1..T30-13) לפי סדר עדיפות: P0 → P1 → P2.
4. צור דוח השלמה: _COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_S002_P002_WP003_GATE7_FULL_MANDATE_COMPLETION.md

**פריטים קריטיים:** T30-1 (hover 150ms/100ms/0px), T30-2 (inline history), T30-3 (heat card), T30-9 (summary filter-aware), T30-10 (traffic light tooltip).

**חובה:** MANDATORY FILES — PHOENIX_MASTER_BIBLE.md, D15_SYSTEM_INDEX.md
```

---

## פרומט 3 — Team 50 (Phase 2 Runtime)

```
## Team 50 | S002-P002-WP003 — Phase 2 Runtime Assertions (B4)

**Squad ID:** 50 (QA & Fidelity)  
**gate_id:** GATE_3  
**sub_stage:** G3.7  
**מנדט:** _COMMUNICATION/team_10/TEAM_10_TO_TEAM_50_S002_P002_WP003_PHASE2_RUNTIME_MANDATE_v1.0.0.md

**תלות:** הרץ **אחרי** Team 20 השלים B2 (TASE fix) — assertion TEVA.TA < 200 דורש את התיקון.

**תפקידך:**
1. קרא את המנדט לעיל במלואו.
2. צור `tests/auto-wp003-runtime.test.js` עם 4 assertions:
   - price_source non-null לטיקרים פעילים
   - TEVA.TA current_price < 200
   - market_cap non-null (ANAU.MI, BTC-USD, TEVA.TA)
   - Actions menu stability (hover 200ms → visible; Escape closes)
3. צור דוח השלמה: _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_S002_P002_WP003_PHASE2_RUNTIME_COMPLETION.md

**חובה:** MANDATORY FILES — PHOENIX_MASTER_BIBLE.md, D15_SYSTEM_INDEX.md
```

---

## סדר העברה

| סדר | צוות | מתי להפעיל |
|-----|------|------------|
| 1 | Team 20 | **מיידי** |
| 2 | Team 30 | **מיידי** |
| 3 | Team 50 | **אחרי** Team 20 B2 Completion |

---

**log_entry | TEAM_10 | WP003_GATE3_ACTIVATION_PROMPTS | CREATED | 2026-03-11**
