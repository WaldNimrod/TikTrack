# Team 10 → Team 20: External Data — Automated Testing Mandate

**from:** Team 10 (The Gateway)  
**to:** Team 20 (Backend)  
**date:** 2026-02-13  
**status:** 🔒 **MANDATORY — architect instruction (Team 90)**  
**מקור:** _COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_DIRECTIVE.md

---

## 1. היקף אחריות

| פריט | תוכן |
|------|------|
| **Provider Replay Mode** | כל אדפטרי הספקים (market data) חייבים לתמוך ב־`mode=REPLAY` — החזרת נתונים מ־fixtures **בלי קריאות רשת חיצוניות**. |
| **Contract & Schema tests** | בדיקות אוטומטיות לשדות חובה, precision, ו־staleness enum. |
| **Cache‑First + Failover tests** | בדיקות אוטומטיות ללוגיקת cache ו-failover. |

---

## 2. משימות מפורטות

### 2.1 Provider Replay Mode
- להוסיף/לאמת תמיכה ב־`mode=REPLAY` בכל אדפטר ספק (Yahoo, Alpha Vantage, וכו').
- ב־REPLAY: קריאת נתונים מ־`tests/fixtures/market_data/` — **אפס** קריאות HTTP לספקים.
- Fixtures נדרשים (מתוך ההנחיה): FX EOD, Prices (intraday + EOD), 250d daily history sample, Indicators (ATR/MA/CCI), Market Cap sample.  
  **תיאום:** חבילת ה-fixtures במשותף (מיקום `tests/fixtures/market_data/`); Team 20 אחראי על הלוגיקה שמשתמשת בהם ב-REPLAY.

### 2.2 סוויטה A — Contract & Schema
- לוודא בבדיקות אוטומטיות:
  - שדות חובה: `price_timestamp`, `fetched_at`, `is_stale`, `market_cap` (לפי סכמות ה-API/מודלים).
  - Precision **20,8** למחירים/שערים/market_cap.
  - Enum `staleness`: `ok | warning | na`.

### 2.3 סוויטה B — Cache‑First + Failover
- בדיקות אוטומטיות (עם REPLAY כך שאין תלות ברשת):
  - Cache HIT → אין קריאה לספק.
  - Cache MISS → Primary → Fallback.
  - Primary נכשל → Fallback מצליח.
  - שניהם נכשלים → stale + `staleness=na` (Never block UI).

---

## 3. אינטגרציה בתוכנית העבודה

- מנדט External Data המלא: TEAM_10_TO_TEAMS_20_30_60_EXTERNAL_DATA_FULL_MODULE_REVIEW_MANDATE — **§10**.
- הרצת Smoke (PR/commit): סוויטות A, B כלולות ב-smoke; יש להבטיח שהן רצות ב-CI על כל PR.

---

## 4. תוצרים / Evidence

- קוד: Replay Mode בכל אדפטר; בדיקות A ו-B (pytest או מסגרת הפרויקט).
- דיווח ל-Team 10: עם סיום — הודעה/דוח קצר (או עדכון במנדט §8) + ציון ש־Evidence זמין (נתיב קבצי בדיקות / תוצאות CI).

---

**log_entry | TEAM_10 | TO_TEAM_20 | EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE | 2026-02-13**
