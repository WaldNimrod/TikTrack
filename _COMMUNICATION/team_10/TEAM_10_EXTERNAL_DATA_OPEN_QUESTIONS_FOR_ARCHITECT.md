# Team 10 → אדריכלית: שאלות פתוחות — External Data (לפני מימוש מלא)

**id:** `TEAM_10_EXTERNAL_DATA_OPEN_QUESTIONS_FOR_ARCHITECT`  
**from:** Team 10 (The Gateway)  
**to:** אדריכלית (Gemini Bridge / G-Lead)  
**date:** 2026-02-13  
**מקור:** TEAM_90_MARKET_DATA_GAPS_AND_OPEN_QUESTIONS.md  
**הקשר:** חבילת External Data נמסרה (TEAM_90_TO_TEAM_10_EXTERNAL_DATA_DELIVERY_NOTICE). נדרש נעילה לפני מימוש מלא.

---

## 1. Intraday vs Yahoo 1d (EOD)

- **דרישה (Owner):** מחירי intraday לטיקרים **Active** ב־Stage-1.
- **מפרט ספק Yahoo:** Interval = **1d (EOD)**.

**שאלה:** האם נדרש להרחיב את ספק Yahoo ל־intraday endpoints (chart) כבר ב־Stage-1? אם כן — לעדכן EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.

---

## 2. Alpha Vantage — Rate Limit ו־Intraday

- Alpha: 5 calls/min → 12.5s queue.
- Intraday + Active tickers עלול להיות כבד תחת limit זה.

**שאלה:** כיצד מתוזמנת משיכת intraday כדי לא להפר SLA? נדרש: הגדרת max active tickers / schedule policy ב־SSOT (או אישור ש־Stage-1 הוא EOD בלבד ומדיניות intraday נדחית).

---

## 3. Cadence per Ticker Status — מקוררכים

- נדרש: Active = intraday, Inactive = EOD.
- **חסר:** מיפוי SSOT לערכי `ticker_status` — איפה נשמר, מי מגדיר, ערכים חוקיים.

**שאלה:** החלטה על שדה מקור הסטטוס + ערכים חוקיים (למשל Active/Inactive). להוסיף ל־System Settings SSOT.

---

## 4. Clock-based UI — Thresholds (ננעל מקומית)

- הוחלט: Clock + Tooltip, ללא באנר.
- **פעולה Team 10:** ננעל ב־SSOT — 15 דקות = warning (צבע X); >24h = na (צבע Y). חוזה UI יפורט ב־MARKET_DATA_PIPE_SPEC §2.5. אם אדריכלית תבקש שינוי — נעדכן.

---

**סיכום:** שאלות 1–3 דורשות הכרעה או אישור לדחייה. שאלה 4 ננעלה בהחלטת Team 10 לפי המסמכים הקיימים; ניתן לעדכן לפי הנחיה.

---

**log_entry | TEAM_10 | EXTERNAL_DATA | OPEN_QUESTIONS_TO_ARCHITECT | 2026-02-13**
