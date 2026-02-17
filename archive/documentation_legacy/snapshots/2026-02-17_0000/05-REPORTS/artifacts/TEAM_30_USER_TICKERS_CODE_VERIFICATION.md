# Evidence: Team 30 — בדיקה ראשונית ברקוד (User Tickers Corrective)

**Date:** 2026-02-14  
**Squad:** Team 30 (Frontend)  
**Type:** Code verification post-implementation

## 1. סיכום

בוצעה בדיקה ראשונית ברקוד — מימוש התיקון הושלם; כל השדות והלוגיקה במקום.

## 2. אימות קוד

| קובץ | בדיקה | סטטוס |
|------|--------|--------|
| `userTickerAddForm.js` | שדה סוג נכס (STOCK/CRYPTO/ETF) | ✅ |
| `userTickerAddForm.js` | שדה Market (מותנה ב-CRYPTO) | ✅ |
| `userTickerAddForm.js` | שדה בורסה/סיומת (.TA, .MI, .L) | ✅ |
| `userTickerAddForm.js` | הצגה/הסתרה לפי סוג נכס | ✅ |
| `userTickerAddForm.js` | Payload: symbol, ticker_type, market | ✅ |
| `userTickerAddForm.js` | symbol+סיומת (ANAU → ANAU.MI) | ✅ |
| `sharedServices.js` | useQueryParams עבור POST /me/tickers | ✅ |

## 3. צעדים הבאים

- בקשת בדיקה נשלחה ל-Team 50: `TEAM_30_TO_TEAM_50_USER_TICKERS_QA_REQUEST.md`
- נדרש: TEVA.TA (בדיקת fetch חיים ראשונה), BTC/ETH, AAPL
