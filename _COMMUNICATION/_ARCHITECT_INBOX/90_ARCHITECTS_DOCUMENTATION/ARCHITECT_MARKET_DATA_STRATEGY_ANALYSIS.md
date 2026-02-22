---
id: ARCH-STRAT-002 | owner: Architect | status: APPROVED
---
**project_domain:** TIKTRACK
# 🏰 ניתוח אדריכלי: נעילת ספקי נתונים (Stage-1)

## 📊 1. בחירת הספקים והחלופות
- **החלטה:** Yahoo Finance + Alpha Vantage.
- **חלופות שנפסלו:** Frankfurter (לא יציב), IBKR API (מורכב מדי לשלב MVP).
- **השלכה:** חובת Caching ב-Backend למניעת Rate Limits.

## 💰 2. אסטרטגיית סדרי עדיפויות
- **FX (שערי חליפין):** Primary: Alpha | Fallback: Yahoo.
- **Prices (מחירי שוק):** Primary: Yahoo | Fallback: Alpha.

## 🛡️ 3. דיוק פיננסי (Precision)
- **חוק הברזל:** NUMERIC(20,8) לכלל המחירים והשערים.
- **נימוק:** ביצור נגד טעויות עיגול בהמרות מטבע כפולות.