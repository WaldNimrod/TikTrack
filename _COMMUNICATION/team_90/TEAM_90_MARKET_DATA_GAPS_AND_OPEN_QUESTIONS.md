# 🕵️ Team 90: Market Data — Gaps & Open Questions (Pre‑SSOT Lock)

**id:** `TEAM_90_MARKET_DATA_GAPS_AND_OPEN_QUESTIONS`  
**date:** 2026-02-13  
**status:** ⚠️ **OPEN — requires closure before implementation**

---

## 1) **Conflict: Intraday requirement vs Provider Specs**

- **Requirement (Owner):** Intraday prices for **Active tickers** in Stage‑1.  
- **Architect Provider Spec:** Yahoo interval = **1d (EOD)**.  

**Open:** נדרש להרחיב את ספק Yahoo ל‑intraday endpoints כבר בשלב זה?  
**Action:** לעדכן `EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.md` + `MARKET_DATA_PIPE_SPEC.md` בהתאם.

---

## 2) Rate‑Limit Feasibility (Alpha Vantage)

- Alpha rate limit: 5 calls/min → 12.5s queue.  
- Intraday + Active tickers עשוי להיות כבד תחת limit זה.

**Open:** כיצד מתוזמנת משיכת intraday כדי לא להפר SLA?  
**Action:** להגדיר max active tickers / schedule policy ב‑SSOT.

---

## 3) Provider Registry SSOT

- יש החלטה ל‑agnostic interface, אבל **Registry SSOT** לא קיים עדיין.

**Open:** האם ליצור SSOT חדש או להטמיע בתוך `MARKET_DATA_PIPE_SPEC.md`?  
**Action:** החלטת Team 10 לפי נוהל קידום ידע.

---

## 4) **Interval Dimension (Daily vs Intraday)**

- Stage‑1 דורש **Intraday + Daily** לאותו טיקר.  
- ב‑DB קיים `market_data.ticker_prices` ללא שדה interval.

**Open:** להוסיף `price_interval` (ENUM) או טבלה נפרדת ל‑intraday?  
**Action:** החלטה SSOT לפני מימוש.

---

## 4) Clock‑based Staleness UI

- הוחלט: **Clock + Tooltip**, ללא banner.  
- עדיין לא מוגדרים thresholds מדויקים (colors, warning/na boundaries).

**Open:** להגדיר thresholds ו‑UI contract ב‑SSOT.

---

## 5) Cadence Policy per Ticker Status

- נדרש: Active = intraday, inactive = EOD.  
- עדיין אין מיפוי SSOT לערכי `ticker_status` (איפה נשמר, מי מגדיר).

**Open:** החלטה על שדה מקור הסטטוס + ערכים חוקיים.  
**Action:** להוסיף ל‑System Settings SSOT.

---

## 6) Market Cap Precision

- Market Cap נכנס Stage‑1.  
- Precision Policy לא כולל שדה market_cap.

**Open:** להוסיף market_cap ל‑PRECISION_POLICY_SSOT (20,8).  
**Action:** Team 10 לעדכן SSOT.

---

**log_entry | TEAM_90 | MARKET_DATA_GAPS | 2026-02-13**
