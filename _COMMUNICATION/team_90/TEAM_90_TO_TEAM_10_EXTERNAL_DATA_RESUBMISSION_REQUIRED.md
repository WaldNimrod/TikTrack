# 🕵️ Team 90 → Team 10: External Data — Resubmission Required

**id:** `TEAM_90_TO_TEAM_10_EXTERNAL_DATA_RESUBMISSION_REQUIRED`  
**from:** Team 90 (The Spy)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**status:** 🔴 **RESUBMIT REQUIRED — SSOT EXPANSION**

---

## 1) החלטה
אנו **מקבלים את הכיוון**, אך נדרש **עדכון SSOT והגשה מחדש** לפני אישור סופי.

---

## 2) מסמכים חדשים להטמעה ב‑SSOT

1. **Market Data Coverage Matrix (Stage‑1)**  
   `_COMMUNICATION/team_90/TEAM_90_MARKET_DATA_COVERAGE_MATRIX_SSOT_DRAFT.md`

2. **Indicators & Fundamentals (Stage‑1)**  
   `_COMMUNICATION/team_90/TEAM_90_MARKET_INDICATORS_AND_FUNDAMENTALS_SSOT_DRAFT.md`

3. **Addendum החלטות (Indicators + Market Cap)**  
   `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_EXTERNAL_DATA_INDICATORS_ADDENDUM.md`

---

## 3) תיקוני SSOT מחייבים

- `MARKET_DATA_PIPE_SPEC.md` — להוסיף Market Cap + Indicators + 250d historical daily + cadence detail.  
- `PRECISION_POLICY_SSOT.md` — להוסיף **market_cap = 20,8**.  
- `WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md` — יישור למטריצה החדשה.  
- להסיר אזכור Frankfurter ב‑log_entry/חתימות.

---

## 4) פערים שחייבים להיסגר לפני אישור

1. **Intraday vs Yahoo Spec (1d)** — להחליט ולעדכן `EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.md` אם נדרש intraday.  
2. **Interval dimension** — להחליט: `price_interval` או טבלה נפרדת לאינטרדיי.  
3. **Ticker Status Policy** — מקור שדה + ערכים חוקיים (System Settings).

רשימת פערים מעודכנת:  
`_COMMUNICATION/team_90/TEAM_90_MARKET_DATA_GAPS_AND_OPEN_QUESTIONS.md`

---

## 5) דרישת הגשה מחדש

לאחר עדכון SSOT וסגירת הפערים, יש להגיש מחדש ל‑Team 90 עם:
- Evidence Log מעודכן  
- קישורים לכל מסמכי SSOT המעודכנים  
- סטטוס משימות Level‑2

---

**log_entry | TEAM_90 | EXTERNAL_DATA_RESUBMISSION_REQUIRED | 2026-02-13**
