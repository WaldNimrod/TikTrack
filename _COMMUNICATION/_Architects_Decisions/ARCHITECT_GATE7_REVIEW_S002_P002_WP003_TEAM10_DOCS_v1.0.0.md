# Team 00 — Architectural Review Decision | WP003 GATE_7 Implementation Docs

**project_domain:** TIKTRACK
**id:** ARCHITECT_GATE7_REVIEW_S002_P002_WP003_TEAM10_DOCS_v1.0.0
**authority:** Team 00 (Chief Architect)
**reviewed_by:** Nimrod (GATE_7 final authority)
**date:** 2026-03-11
**subject:** Review of Team 10 implementation docs package — WP003 GATE_7
**trigger:** TEAM_10_TO_TEAM_00_WP003_GATE7_IMPLEMENTATION_DOCS_v1.0.0.md

---

## ✅ VERDICT: CONDITIONAL BLOCK

**מניינת הממצאים:**
- **4 blocking issues (B1–B4):** חייבים לתיקון לפני שניתן לפתוח פיתוח
- **3 non-blocking issues (N1–N3):** לתיקון במסגרת ה-resubmission אך לא מונעים פיתוח

**תנאי לשחרור:** צוות 10 יטפל ב-B1–B4, יגיש מחדש לתיבת ה-inbox, ויקבל PASS מ-Team 00 לפני שמנדטים חדשים נפתחים לביצוע.

---

## ✅ מה עובד — הכרה בחוזקות

| # | ממצא חיובי |
|---|-----------|
| C1 | שלושת ההחלטות (A/B/C) תועדו נכון ובדיוק — alignment מלא עם DECISIONS_LOCK |
| C2 | תרחישי אימות (AUTO-WP003-01..08 + S7-WP003-01..06) — מיפוי מלא ומדויק |
| C3 | Root cause לטיקרים אדומים — אבחנה נכונה (runtime data, לא code bug) |
| C4 | שדות חסרים ו-defaults שגויים — זוהו נכון (off_hours, alpha_quota_cooldown, max_symbols, delay) |
| C5 | פרומט ולידציה קאנוני — כלי טוב; רשימת הבדיקות תואמת את ה-spec |
| C6 | Gate-blocker Team 60 — נרשם ומנוהל כראוי |
| C7 | SPY הוסף לסקריפטים — יוזמה נכונה |

---

## 🔴 BLOCKING ISSUE B1 — Missing Team 30 Mandate for GATE_7 New Features (Critical)

**מה חסר:** לא קיים מנדט לצוות 30 שמכסה את כל הפיצ'רים החדשים מה-GATE_7 SPEC_RESPONSE.

**מנדט Team 30 R2 הקיים** (`TEAM_10_TO_TEAM_30_S002_P002_WP003_GATE7_R2_MANDATE.md`) הוא:
- תאריך: 2026-03-10 — **לפני** ה-GATE_7 SPEC_RESPONSE (שנשלח 2026-03-11)
- סטטוס: ON_HOLD
- Scope: 4 פריטים בלבד (1.1, 1.3, 1.4, 1.7) — כולם מסבב הגשה קודמת

**פריטים שחייבים להיות במנדט Team 30 החדש (אך אינם):**

| # | פריט | SPEC_RESPONSE Section |
|---|------|-----------------------|
| T30-1 | Hover menu — precision spec (150ms/100ms/0px/zone) | Section 3, Decision A |
| T30-2 | Inline job history expand — `▼ היסטוריה (N)`, 5 ריצות | Section 4, Decision B |
| T30-3 | Heat indicator card — formula + 3 color levels | Section 5, Decision C |
| T30-4 | Settings: הוספת off_hours + alpha_quota_cooldown | Section 5 Q1.1 |
| T30-5 | Settings: תיקון default max_symbols=50, delay=1 | Section 5 Q1.1 |
| T30-6 | Settings: per-field validation error highlighting | Section 5 Q1.2 |
| T30-7 | Settings: hint text per field | Section 5 Q4.1 |
| T30-8 | Jobs table: toggle button (enable/disable) | Section 4 Q3.1 |
| T30-9 | Summary filter-aware display | Section 2 Q3.2 |
| T30-10 | Traffic light tooltip: null → "אין נתונים — יש לרוץ EOD sync" | Section 1 Q3.2 |
| T30-11 | Status legend after tickers table | Section 2 Q2.1 |
| T30-12 | Modal skeleton loading | Section 7 |
| T30-13 | Refresh buttons (detail modal + data integrity) | Section 8 |

**דרישה:** יש לכתוב מנדט חדש ומלא לצוות 30 המכסה כל 13 הפריטים הנ"ל.

---

## 🔴 BLOCKING ISSUE B2 — Missing Team 20 Mandate for TASE Agorot Fix

**מה חסר:** הפריט P0 "TASE agorot fix" נרשם בתוכנית הביצוע, אך **לא נשלח מנדט מפורש לצוות 20** שמורה לו לבצע תיקון זה.

**מנדטי Team 20 הקיימים:** כולם עוסקים ב-`market_cap non-null` (AUTO-WP003-05). אין מנדט שמצווה:
- `yahoo_provider.py`: זיהוי `.TA` suffix + חלוקה ב-100 ב-`_fetch_prices_batch_sync()` ו-`_fetch_last_close_via_v8_chart()`
- `alpha_provider.py`: בדיקה ותיקון דומה ב-`_get_price_from_timeseries_daily()` (TEVA.TA)
- בדיקה שגם `regularMarketPreviousClose` מומר (ולא רק `regularMarketPrice`)

**דרישה:** מנדט מפורש לצוות 20 — TASE agorot fix עם spec מדויק מ-SPEC_RESPONSE Section 1 Q2.1+Q2.2.

**Spec לכלול במנדט:**
```python
# yahoo_provider.py — _fetch_prices_batch_sync():
if sym.upper().endswith('.TA') and price and price > 0:
    price = (price / Decimal("100")).quantize(Decimal("0.00000001"))
# Apply also to close_raw (regularMarketPreviousClose)

# yahoo_provider.py — _fetch_last_close_via_v8_chart():
# Same .TA detection + ÷100 on all price fields after parse

# alpha_provider.py — _get_price_from_timeseries_daily():
# Check if Alpha returns TEVA.TA in agorot; if price > 1000 for known ILS ticker → divide by 100
```

---

## 🔴 BLOCKING ISSUE B3 — SPY Discrepancy: 4/4 or 3/3 in AUTO-WP003-05?

**סתירה בתיעוד:**

| מסמך | ממצא |
|------|------|
| `SPEC_RESPONSE_ACK` §3.4 | "SPY הוסף — AUTO_WP003_05_SYMBOLS כוללים כעת SPY (4/4)" |
| `TEAM_10_TO_TEAM_90_G7_HUMAN_RELEASE_REQUEST` | `"market_cap non-null for 3/3: ['ANAU.MI', 'BTC-USD', 'TEVA.TA']"` |

**שאלות לצוות 10 לפתרון:**
1. האם SPY אכן נוסף ל-`AUTO_WP003_05_SYMBOLS` ב-`verify_g7_prehuman_automation.py`?
2. אם כן — ה-PASS שהוצהר (3/3) אינו מוכיח SPY. נדרש אימות SPY בנפרד.
3. אם לא — יש לעדכן ה-ACK ולהסיר את הטענה "(4/4)".

**דרישה:** בירור + תיעוד חד-משמעי: האם AUTO-WP003-05 דורש 3/3 (ללא SPY) או 4/4 (עם SPY)? להגיש תשובה ברורה.

**הערת Team 00:** Team 00 אינו דורש SPY ב-`market_cap` כתנאי לGATE_7 — הדרישה המקורית היא ANAU.MI, BTC-USD, TEVA.TA (CC-WP003-03). SPY הוא תוספת סביר לבדיקות רגרסיה אבל לא חובה לgate. עם זאת — המנדטים חייבים להיות עקביים.

---

## 🔴 BLOCKING ISSUE B4 — Missing Team 50 Mandate for Phase 2 Runtime Assertions

**מה חסר:** SPEC_RESPONSE Section 6 (GIN-006) ציוותה ביצירת Phase 2 runtime assertions:
- קובץ: `tests/auto-wp003-runtime.test.js`
- Assertions: price_source לא null לטיקרים פעילים, TEVA.TA < 200 (shekel range), market_cap assertions, actions menu stability

**מנדט Team 50 הקיים** (`AUTOMATION_PASS_MANDATE`) מכסה רק: "UI/automation consolidated PASS — 0 SEVERE" לAUTO-WP003-01..08 הקיימים. **אין מנדט לכתוב Phase 2 tests.**

**דרישה:** מנדט ל-Team 50 הכולל:
- יצירת `tests/auto-wp003-runtime.test.js`
- 4 assertions מ-SPEC_RESPONSE §6:
  1. לאחר sync trigger: `price_source !== null` לטיקרים פעילים
  2. לאחר sync: TEVA.TA `current_price < 200` (shekel validation)
  3. לאחר EOD: market_cap IS NOT NULL ל-ANAU.MI, BTC-USD, TEVA.TA
  4. Actions menu stability: hover 200ms → menu visible + Escape closes
- תזמון: לאחר החלת TASE fix (לאחר B2 resolved)

---

## 🟡 NON-BLOCKING N1 — Date Errors on 3 Documents

**בעיה:** 3 מסמכים נושאים תאריך שגוי **2025-01-30** (2025 במקום 2026):
- `TEAM_10_TO_TEAM_00_WP003_GATE7_IMPLEMENTATION_DOCS_v1.0.0.md`
- `TEAM_10_CANONICAL_VALIDATION_PROMPT_v1.0.0.md`
- `TEAM_10_SPEC_RESPONSE_ACK_AND_ACTION_PLAN_v1.0.0.md`

**דרישה:** תיקון לתאריך **2026-03-11**.

---

## 🟡 NON-BLOCKING N2 — Team 10 → Team 90 Relaxation Request (Process Violation)

**בעיה:** המסמך `TEAM_10_TO_TEAM_90_AUTO_WP003_05_CLARIFICATION_REQUEST.md` שאל את Team 90 האם לאפשר "הרפיה" של AUTO-WP003-05 — **בלי לשאול את Team 00 תחילה**.

**Iron Rule:** שינויים בדרישות ארכיטקטוניות עוברים **רק דרך Team 00**. Team 90 אינו מוסמך לאפשר הרפיה — גם אם הם ה-GATE_7 owner. הם QA validators, לא authority לשינוי requirements.

**הבהרת Team 00:** AUTO-WP003-05 — market_cap non-null ל-ANAU.MI, BTC-USD, TEVA.TA — **נשאר בתוקף**. לא הורפה ולא תורפה ללא request מפורש ל-Team 00.

**דרישה:** תיעוד ב-ACK שהנוהל הנכון הוא Team 10 → Team 00 (לא Team 90) לשינויי requirements.

---

## 🟡 NON-BLOCKING N3 — Log Viewer D40 Scope — יש לנתב ל-Team 170

**בעיה:** ה-ACK מציין נכון "Log Viewer → D40, לא WP003" אך **לא נשלחה הודעה ל-Team 170** לשלב זאת ב-LOD200/LOD400 של D40.

**דרישה:** Team 10 ישלח notification ל-Team 170 (או Team 00 ישלח) לרשום: D40 Section 6 יכלול generic log viewer (file logging + API + UI) — עדיפות S003.

---

## קריטריוני הצלחה לגשה חוזרת

### עבור B1 (Team 30 Mandate):
- [ ] מנדט חדש לצוות 30 — כולל כל 13 הפריטים (T30-1..13)
- [ ] כל פריט עם spec מדויק (מספר section ב-SPEC_RESPONSE, ערכים מדויקים)
- [ ] מנדט R2 הישן (ON_HOLD) — לסגור/לבטל

### עבור B2 (Team 20 TASE):
- [ ] מנדט לצוות 20 — TASE fix, spec מלא כולל שתי פונקציות ב-yahoo + alpha
- [ ] כולל: בדיקת `regularMarketPreviousClose` בנוסף ל-price
- [ ] Deliverable: דוח השלמה + TEVA.TA price בטווח שקלים (< 200)

### עבור B3 (SPY):
- [ ] מסמך ברור: AUTO-WP003-05 דורש 3/3 (ANAU.MI, BTC-USD, TEVA.TA) — SPY בנפרד
- [ ] אם SPY נוסף לסקריפט — חייב לעבור PASS ב-4/4

### עבור B4 (Team 50 Phase 2):
- [ ] מנדט לצוות 50 — יצירת `tests/auto-wp003-runtime.test.js` עם 4 assertions
- [ ] תזמון: לאחר B2 completed

---

## הגשה חוזרת — הנחיות

**מסמך הגשה:** `_COMMUNICATION/_ARCHITECT_INBOX/TEAM_10_TO_TEAM_00_WP003_GATE7_IMPLEMENTATION_DOCS_v1.1.0.md`

**תוכן הגשה חוזרת:**
1. רשימת המסמכים החדשים שנוצרו (מנדטים B1..B4)
2. פתרון SPY discrepancy (B3) — טקסט ברור
3. תיקוני תאריכים (N1)
4. הערה על נוהל הרפיה (N2)

**SLA:** Team 00 יחזיר החלטה PASS/BLOCK תוך **24 שעות** מקבלת הגשה חוזרת.

---

## מה מותר לקדם כבר עכשיו (לא תלוי בגשה חוזרת)

| פריט | צוות | הערה |
|------|------|------|
| market_cap fix (AUTO-WP003-05) | Team 20 | מנדט קיים, תקין, ניתן להמשיך |
| Team 60: EOD sync + אישור ticker_prices | Team 60 | Gate-blocker, ניתן להמשיך |
| B2 TASE fix | Team 20 | ניתן לבצע במקביל לB1/B4 resolution |

---

**log_entry | TEAM_00 | ARCHITECT_REVIEW | GATE7_IMPL_DOCS | CONDITIONAL_BLOCK | B1+B2+B3+B4 | 2026-03-11**
