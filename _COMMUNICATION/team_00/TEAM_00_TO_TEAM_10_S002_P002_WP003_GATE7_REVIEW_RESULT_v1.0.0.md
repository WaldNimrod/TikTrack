# Team 00 → Team 10 | WP003 GATE_7 Implementation Docs — Review Result

**project_domain:** TIKTRACK
**id:** TEAM_00_TO_TEAM_10_S002_P002_WP003_GATE7_REVIEW_RESULT_v1.0.0
**from:** Team 00 (Chief Architect)
**to:** Team 10 (PM/Coordination)
**date:** 2026-03-11
**re:** `TEAM_10_TO_TEAM_00_WP003_GATE7_IMPLEMENTATION_DOCS_v1.0.0.md` — review outcome

---

## VERDICT: ⛔ CONDITIONAL BLOCK

עיינו בחבילת המסמכים שהגשתם. הבדיקה מצאה **4 בעיות חוסמות (B1–B4)** שחייבות לתיקון לפני שניתן לפתוח ביצוע.

**מסמך ההחלטה המלא:**
`_COMMUNICATION/_Architects_Decisions/ARCHITECT_GATE7_REVIEW_S002_P002_WP003_TEAM10_DOCS_v1.0.0.md`

יש לקרוא אותו במלואו לפני הגשה חוזרת.

---

## 4 בעיות חוסמות — תקציר

### B1 — מנדט Team 30 חסר לפיצ'רים החדשים (Critical)

מנדט Team 30 הקיים (R2, ON_HOLD) מכסה 4 פריטים בלבד מסבב קודם (**תאריך: 2026-03-10 — לפני** ה-SPEC_RESPONSE).

**חובה:** לכתוב מנדט חדש ומלא לצוות 30 המכסה את כל **13 הפריטים** שפורטו ב-SPEC_RESPONSE:

| # | פריט |
|---|------|
| T30-1 | Hover menu precision (150ms/100ms/0px/`<tr>` zone) |
| T30-2 | Inline job history expand — `▼ היסטוריה (N)`, 5 ריצות |
| T30-3 | Heat indicator card — formula + 3 color levels |
| T30-4 | Settings: הוספת `off_hours_interval_minutes` + `alpha_quota_cooldown_hours` |
| T30-5 | Settings: תיקון defaults — `max_symbols_per_request=50`, `delay_between_symbols_seconds=1` |
| T30-6 | Settings: per-field validation error highlighting |
| T30-7 | Settings: hint text per field |
| T30-8 | Jobs table: toggle button (enable/disable) |
| T30-9 | Summary filter-aware display |
| T30-10 | Traffic light tooltip: null → "אין נתונים — יש לרוץ EOD sync" |
| T30-11 | Status legend after tickers table |
| T30-12 | Modal skeleton loading |
| T30-13 | Refresh buttons (detail modal + data integrity) |

---

### B2 — מנדט Team 20 לתיקון TASE Agorot חסר (P0 — Urgent)

הפריט "TASE agorot fix" מופיע בתוכנית הביצוע שלכם — **אך לא שלחתם מנדט מפורש לצוות 20** לביצועו.

**חובה:** מנדט לצוות 20 המכסה:
- `yahoo_provider.py → _fetch_prices_batch_sync()`: זיהוי `.TA` suffix + `÷100` על `regularMarketPrice` + `regularMarketPreviousClose`
- `yahoo_provider.py → _fetch_last_close_via_v8_chart()`: אותה לוגיקה
- `alpha_provider.py → _get_price_from_timeseries_daily()`: בדיקת `price > 1000` לטיקרים ILS → `÷100`
- Deliverable: TEVA.TA `current_price < 200` (טווח שקלים)

הspec המלא להכלה במנדט מופיע במסמך ההחלטה §B2.

---

### B3 — סתירת SPY: 4/4 מול 3/3 ב-AUTO-WP003-05

| מסמך | טענה |
|------|------|
| `SPEC_RESPONSE_ACK` §3.4 | SPY הוסף — **4/4** |
| `TEAM_10_TO_TEAM_90_G7_HUMAN_RELEASE_REQUEST` | market_cap non-null for **3/3**: `['ANAU.MI', 'BTC-USD', 'TEVA.TA']` |

**חובה:** תשובה חד-משמעית בכתב:
- האם `AUTO_WP003_05_SYMBOLS` ב-`verify_g7_prehuman_automation.py` כולל SPY?
- אם כן — PASS חייב להיות **4/4** (לא 3/3)
- אם לא — יש לתקן את ה-ACK ולהסיר את הטענה

הערת Team 00: הדרישה המקורית (CC-WP003-03) היא 3/3 (ANAU.MI, BTC-USD, TEVA.TA). SPY הוא תוספת סבירה לרגרסיה אך לא חובה לGATE. המנדטים חייבים להיות עקביים.

---

### B4 — מנדט Team 50 לPhase 2 Runtime Assertions חסר

SPEC_RESPONSE §6 (GIN-006) ציוותה יצירת `tests/auto-wp003-runtime.test.js`.

מנדט Team 50 הקיים מכסה רק PASS ל-AUTO-WP003-01..08 הקיימים — **אין מנדט לכתיבת Phase 2 tests**.

**חובה:** מנדט לצוות 50 הכולל:
1. `tests/auto-wp003-runtime.test.js` — יצירה
2. 4 assertions: price_source non-null, TEVA.TA < 200, market_cap non-null (3 טיקרים), actions menu stability
3. תזמון: לאחר B2 resolved

---

## Non-Blocking (לתיקון באותה הגשה חוזרת)

| # | בעיה | תיקון |
|---|------|-------|
| N1 | תאריך שגוי 2025-01-30 ב-3 מסמכים | → 2026-03-11 |
| N2 | פנייה לTeam 90 לגבי הרפיית דרישה (process violation) | יש לתעד: דרישות עוברות דרך Team 00 בלבד |
| N3 | Log Viewer D40 — לא נשלחה הודעה לTeam 170 | Team 10 ישלח notification לTeam 170: D40 §6 = generic log viewer, עדיפות S003 |

---

## מה מותר להמשיך **כבר עכשיו** (לא מחכה לאישור)

| פריט | צוות |
|------|------|
| market_cap fix (AUTO-WP003-05) | Team 20 — מנדט קיים, ניתן להמשיך |
| EOD sync + ticker_prices confirmation | Team 60 — gate-blocker, ניתן להמשיך |
| TASE agorot fix (B2) | Team 20 — ניתן לבצע במקביל לB1/B4 (יש לכתוב המנדט תחילה) |

---

## הגשה חוזרת

**נתיב הגשה:**
`_COMMUNICATION/_ARCHITECT_INBOX/TEAM_10_TO_TEAM_00_WP003_GATE7_IMPLEMENTATION_DOCS_v1.1.0.md`

**תוכן נדרש בהגשה:**
1. רשימת מסמכים חדשים שנוצרו (מנדטים B1..B4)
2. פתרון SPY discrepancy (B3) — טקסט ברור
3. תיקוני תאריכים (N1)
4. הערה על נוהל הרפיה (N2)
5. Notification לTeam 170 על D40 log viewer (N3)

**SLA:** Team 00 יחזיר החלטה PASS/BLOCK תוך **24 שעות** מקבלת ההגשה.

---

**log_entry | TEAM_00 | GATE7_REVIEW_RESULT | CONDITIONAL_BLOCK | B1+B2+B3+B4 | TO_TEAM_10 | 2026-03-11**
