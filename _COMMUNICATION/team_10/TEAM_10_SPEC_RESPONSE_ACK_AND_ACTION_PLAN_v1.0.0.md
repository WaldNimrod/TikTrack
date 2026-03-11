# Team 10 | אישור תשובת האפיון ותוכנית פעולה

**project_domain:** TIKTRACK  
**id:** TEAM_10_SPEC_RESPONSE_ACK_AND_ACTION_PLAN  
**from:** Team 10 (The Gateway)  
**date:** 2026-03-11  
**context:** לאחר TEAM_00_TO_TEAM_10_S002_P002_WP003_GATE7_SPEC_RESPONSE_v1.0.0

---

## Correction Cycle (TEAM_190 / TEAM_00 revalidation)

| Field | Value |
|-------|-------|
| correction_cycle_ref | TEAM_190_PLAN_REVALIDATION_RESULT, TEAM_00_GATE7_REVIEW_RESULT |
| what_changed | תאריכים→2026-03-11; Team 60 blocker→CLOSED; B3 SPY resolution; N2 process note |

---

## 1) אישור קבלה

**Team 10 מאשר קבלת** `TEAM_00_TO_TEAM_10_S002_P002_WP003_GATE7_SPEC_RESPONSE_v1.0.0.md`.

כל 6 ה-GINs נענו במלואם. **כל 3 ההחלטות נעולות** (TEAM_00_DECISIONS_LOCK_v1.0.0).

---

## 2) החלטות — LOCKED ✅

| מזהה | החלטה | מסמך מקור |
|------|--------|------------|
| **[A]** | **Hover-only** — 150ms in, 100ms exit, gap=0, zone=שורה OR פאנל | `TEAM_00_TO_TEAM_10_S002_P002_WP003_DECISIONS_LOCK_v1.0.0.md` |
| **[B]** | **Inline expand** — `▼ היסטוריה (N)`, 5 ריצות inline. Log Viewer → D40 (S003-P003), לא WP003 | אותו מסמך |
| **[C]** | **Heat Indicator** — `load_pct = active/max×100`; ירוק <50%, צהוב 50–79%, אדום ≥80% | אותו מסמך |

---

## 3) תקלות — תיקון מיידי (ללא צורך בהחלטה)

### 3.1 TASE אגורות (ממצא #6) — Team 20

| | |
|---|---|
| **בעיה** | Yahoo Finance מחזיר מחירי TASE (`.TA`) **באגורות**, לא בשקלים. אין המרה ÷100. |
| **תיקון** | `yahoo_provider.py` + `alpha_provider.py` — זיהוי `.TA` + חלוקה ב־100 |
| **מפרט** | Section 1 Q2.1+Q2.2 ב־TEAM_00_SPEC_RESPONSE |

### 3.2 שדות חסרים ב־UI הגדרות — Team 30

| שדה | SSOT | פעולה |
|-----|------|-------|
| `off_hours_interval_minutes` | min=15, max=240, default=60 | **הוסף שדה** |
| `alpha_quota_cooldown_hours` | min=6, max=48, default=24 | **הוסף שדה** |

### 3.3 Defaults שגויים ב־UI — Team 30

| שדה | UI נוכחי | SSOT | פעולה |
|-----|-----------|------|-------|
| `max_symbols_per_request` | 5 | **50** | תקן default |
| `delay_between_symbols_seconds` | 0 | **1** | תקן default |

### 3.4 SPY — Resolution (B3)

| | |
|---|---|
| **GATE requirement (CC-WP003-03)** | **3/3** — ANAU.MI, BTC-USD, TEVA.TA. זה תנאי ה-GATE. |
| **SPY** | תוספת רגרסיה — נכלל ב-`verify_g7_prehuman_automation.py` (4 symbols). כשהסקריפט כולל 4 — PASS = 4/4. |
| **עקביות** | Team 60 RE_VERIFY: 3/3 (תואם GATE). אם verify מריץ 4 symbols — PASS רק ב-4/4. |

---

## 4) Root Cause — רמזורים אדומים (ממצאים #1, #2, #5)

| | |
|---|---|
| **מסקנה** | **לא bug בקוד** — אין נתונים ב־`market_data.ticker_prices`. ה-sync jobs לא רצו בסביבה זו. |
| **פעולה** | **Team 60:** לאשר ולהריץ EOD sync (או intraday, לפי הגדרות) |
| **תוצאה צפויה** | לאחר sync — נתונים יאוכלסו, traffic light יעבור לירוק/צהוב בהתאם |

---

## 5) תנאי פתיחת השער

| # | תנאי | סטטוס |
|---|------|--------|
| 1 | NIMROD_DECISION_A (Hover-only) | ✅ LOCKED |
| 2 | NIMROD_DECISION_B (Inline expand) | ✅ LOCKED |
| 3 | NIMROD_DECISION_C (Heat formula + thresholds) | ✅ LOCKED |
| 4 | Team 60: ticker_prices מאוכלס | ✅ **CLOSED** — evidence: `TEAM_60_RE_VERIFY_RESULT` (PASS 3/3) |

**PRE_DEVELOPMENT_GATE פתוח** — כל 4 התנאים מתקיימים.

**נוהל (N2):** שינויי דרישות ארכיטקטוניות עוברים **רק דרך Team 00**. לא Team 90.

---

## 6) ניתוב (סדר עדיפויות — TEAM_00_DECISIONS_LOCK §4)

| סדר | צוות | פעולה | P |
|---|------|--------|---|
| 1 | Team 20 | TASE agorot fix | P0 |
| 2 | Team 60 | הרצת EOD sync; וידוא ticker_prices מאוכלס; אימות 3/3 (GATE) | P0 — CLOSED |
| 3 | Team 30 | Traffic light tooltip; Summary filter-aware | P0 |
| 4 | Team 30 | Actions menu hover (Spec A) | P1 |
| 5 | Team 30 | Settings: 2 שדות + 2 defaults | P1 |
| 6 | Team 30 | Background jobs: toggle + inline history + heat card | P1/P2 |
| 7 | Team 30 | Modal skeleton loading | P1 |
| 8 | Team 50 | Runtime E2E assertions (Phase 2) | P1 |
| 9 | Team 30 | Status legend; Refresh buttons | P2 |

---

## 7) מסמכי ביצוע — הועברו ל-Inbox (TEAM_00_DECISIONS_LOCK §3)

| מסמך | מיקום |
|------|--------|
| Implementation docs package | `_COMMUNICATION/_ARCHITECT_INBOX/TEAM_10_TO_TEAM_00_WP003_GATE7_IMPLEMENTATION_DOCS_v1.0.0.md` |
| Canonical validation prompt | `_COMMUNICATION/team_10/TEAM_10_CANONICAL_VALIDATION_PROMPT_v1.0.0.md` |

---

**log_entry | TEAM_10 | SPEC_RESPONSE_ACK | ACTION_PLAN_CREATED | 2026-03-11**
