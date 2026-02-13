# תוכנית אב — ספקי נתונים חיצוניים (External Data)

**id:** `TEAM_10_EXTERNAL_DATA_MASTER_PLAN`  
**owner:** Team 10 (The Gateway)  
**מקור:** TEAM_90_TO_TEAM_10_EXTERNAL_DATA_DELIVERY_NOTICE.md  
**תאריך:** 2026-02-13  
**סטטוס:** 🔒 **פעיל — ניהול תהליך עד להשלמה מלאה**

---

## 1. מקורות מחייבים (למדנו)

| מסמך | נתיב | תוכן עיקרי |
|------|------|-------------|
| ARCHITECT_MARKET_DATA_STRATEGY_ANALYSIS | documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_MARKET_DATA_STRATEGY_ANALYSIS.md | Yahoo+Alpha; FX: Alpha→Yahoo, Prices: Yahoo→Alpha; Caching חובה; NUMERIC(20,8) |
| EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC | documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.md | Primary Prices / Fallback FX; yfinance + Query V8; Interval 1d (EOD); User-Agent Rotation |
| EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC | documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC.md | Primary FX / Fallback Prices; 5 calls/min; RateLimitQueue 12.5s |
| ARCHITECT_VERDICT_MARKET_DATA_STAGE_1 (ADR-022) | _COMMUNICATION/90_Architects_comunication/ARCHITECT_VERDICT_MARKET_DATA_STAGE_1.md | Providers Yahoo+Alpha בלבד; Cache חובה; Agnostic Interface; Visual Warning EOD |

**החלטות נעולות (Delivery Notice):**
- Providers: **Yahoo + Alpha בלבד** (No Frankfurter).  
- FX: **Alpha → Yahoo** | EOD בלבד | USD/EUR/ILS.  
- Prices: **Yahoo → Alpha**.  
- Cache-First חובה. Provider Interface אגנוסטי.  
- Guardrails: Yahoo UA Rotation; Alpha RateLimitQueue 12.5s.  
- UI: **Clock + color + tooltip** (אין באנר).  
- Cadence/Precision לפי Domain + Ticker Status.  
- Fundamentals — שלבים מתקדמים בלבד.

---

## 2. חבילת מסמכים (Team 90)

| מסמך | שימוש |
|------|--------|
| TEAM_90_MARKET_DATA_SSOT_INTEGRATION_DRAFT | טיוטה להטמעה ב־MARKET_DATA_PIPE_SPEC, FOREX_MARKET_SPEC, WP_20_09_FIELD_MAP_TICKERS_MAPPINGS |
| TEAM_90_TO_TEAM_10_EXTERNAL_DATA_ACTIVATION_PACK | משימות Level-2 (M1–M6) — שילוב ברשימת המשימות |
| TEAM_90_MARKET_DATA_GAPS_AND_OPEN_QUESTIONS | שאלות פתוחות — לסגירה לפני מימוש או להעלאת אדריכלית |

---

## 3. שאלות פתוחות (Gaps) — סטטוס ופעולה

| # | נושא | פעולה מומלצת | סטטוס |
|---|------|---------------|--------|
| 1 | Intraday vs Yahoo 1d (EOD) — Active tickers דורש intraday? | להעלות לאדריכלית: האם להרחיב Yahoo ל־intraday (chart) ב־Stage-1 | מועבר למסמך שאלות לאדריכלית |
| 2 | Alpha 5 calls/min — תזמון intraday + Active tickers | להגדיר max active tickers / schedule policy ב־SSOT אחרי החלטה על intraday | תלוי סגירת 1 |
| 3 | Provider Registry SSOT — נפרד או בתוך MARKET_DATA_PIPE_SPEC? | החלטת Team 10: להטמיע ב־MARKET_DATA_PIPE_SPEC (סעיפים מרוכזים) בשלב זה | ננעל — הטמעה ב־Spec קיים |
| 4 | Clock-based UI — thresholds (colors, warning/na boundaries) | להגדיר ב־SSOT (חוזה UI); 15 דקות = warning, >24h = na (מקיים) | ננעל — מפורט במסמך UI/Staleness |
| 5 | Cadence per Ticker Status — מקור שדה ticker_status, ערכים חוקיים | להוסיף ל־System Settings SSOT; להגדיר Active/Inactive + איפה נשמר | נדרש תיעוד ב־SSOT |

---

## 4. סדר ביצוע (תלויות)

```
M1 (Team 10) SSOT Lock
    ↓
[Open Questions → אדריכלית אם נדרש]
    ↓
M2 (20) Provider Interface + Cache-First
M3 (20) Provider Guardrails
    ↓
M4 (10+20) Cadence Policy + Ticker Status
M5 (60) FX EOD Sync (Alpha→Yahoo)
    ↓
M6 (30) Clock-based Staleness UI
```

**תנאי להפעלת צוותים:** M1 הושלם (SSOT מעודכן); שאלות קריטיות למימוש (1, 2, 5) — סגורות או הוגדרו כ־"מימוש בשלב מאוחר יותר" באדריכלית.

---

## 5. חלוקת משימות לצוותים

| משימה | צוות | תוצר נדרש | מנדט/הודעה |
|--------|------|------------|-------------|
| **M1** SSOT Lock | Team 10 | עדכון MARKET_DATA_PIPE_SPEC, FOREX_MARKET_SPEC, WP_20_09; קישורים ב־00_MASTER_INDEX; Evidence Log | ביצוע ישיר |
| **M2** Provider Interface + Cache-First | Team 20 | ממשק אגנוסטי; cache-first; config-driven providers | TEAM_10_TO_TEAM_20_EXTERNAL_DATA_M2_M3_MANDATE |
| **M3** Provider Guardrails | Team 20 | Yahoo UA Rotation; Alpha RateLimitQueue 12.5s | כנ"ל (משולב עם M2) |
| **M4** Cadence + Ticker Status | Team 10 + 20 | הגדרת Cadence ב־SSOT; שדה ticker_status + ערכים; System Settings | Team 10 — תיעוד; Team 20 — מימוש לפי SSOT |
| **M5** FX EOD Sync | Team 60 | Alpha → Yahoo (לא Frankfurter); Evidence log | TEAM_10_TO_TEAM_60_EXTERNAL_DATA_M5_MANDATE |
| **M6** Clock-based Staleness UI | Team 30 | Clock + color + tooltip (אין באנר); thresholds ב־SSOT | TEAM_10_TO_TEAM_30_EXTERNAL_DATA_M6_MANDATE |

---

## 6. הודעות הפעלה — מתי ולמי

- **לאחר סגירת M1 + Open Questions (או החלטה לדחות):**  
  - TEAM_10_TO_TEAM_20_EXTERNAL_DATA_M2_M3_MANDATE  
  - TEAM_10_TO_TEAM_60_EXTERNAL_DATA_M5_MANDATE  
  - TEAM_10_TO_TEAM_30_EXTERNAL_DATA_M6_MANDATE  
- **M4:** תיאום 10+20 — Team 10 מפרסם Cadence/Ticker Status ב־SSOT; Team 20 מיישם (יכול להיות חלק ממנדט M2 או נפרד).

---

## 7. Evidence וולידציה

- Evidence Log לכל שינוי SSOT (Team 10).  
- דוחות השלמה מהצוותים (20, 60, 30) — בתיקיות _COMMUNICATION שלהם.  
- ולידציה: עמידה ב־SSOT ובהחלטות הנעולות; שער 90 — כל סטייה תיחסם.

---

**log_entry | TEAM_10 | EXTERNAL_DATA_MASTER_PLAN | CREATED | 2026-02-13**
