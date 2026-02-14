# Team 10 → Team 50: מנדט — User Tickers Crypto + Exchanges (תיקון)

**From:** Team 10 (The Gateway)  
**To:** Team 50 (QA & Fidelity)  
**Date:** 2026-02-14  
**Subject:** בדיקת קריפטו, 3 טיקרים (2 מניות + 1 קריפטו), TEVA.TA  
**מקור מחייב:** TEAM_10_USER_TICKERS_CRYPTO_EXCHANGE_GAPS_AND_CORRECTIVE_PLAN.md §3.5

---

## 1. הקשר

לאחר תיקוני צוותים 20 ו־30 (provider mapping, קריפטו, בורסות) — **נדרשת בדיקת QA חיים** לפי קריטריוני הסגירה.

---

## 2. משימות בדיקה (חובה)

| בדיקה | חובה | תיאור |
|-------|------|--------|
| **AAPL** (מניה) | כן | אימות בסיס — Live data check עובר |
| **BTC** (קריפטו) | כן | סוג CRYPTO, Market USD; הוספה בלי 422 |
| **TEVA.TA** | כן | בדיקת fetch חיים ראשונה — TASE; לא בועזו עדיין |
| **ANAU.MI** | אופציונלי | בורסת מילאנו |

---

## 3. קריטריון סגירה

- [ ] **לפחות 3 טיקרים:** 2 מניות + 1 קריפטו.
- [ ] **TEVA.TA** — בדיקת fetch חיים מוצלחת (אימות ראשון מול ספקים).
- [ ] Evidence ב־`documentation/05-REPORTS/artifacts/` + דיווח ל-Team 10.

---

## 4. מסמכי הבקשה והקוד

| מסמך | תיאור |
|------|--------|
| **TEAM_30_TO_TEAM_50_USER_TICKERS_QA_REQUEST.md** | בקשת בדיקה מפורטת (Team 30) |
| **TEAM_30_USER_TICKERS_CODE_VERIFICATION.md** | Evidence — שדות סוג נכס, Market, בורסה/סיומת; Payload; useQueryParams |

---

## 5. מסמכים מחייבים

- `TEAM_10_USER_TICKERS_CRYPTO_EXCHANGE_GAPS_AND_CORRECTIVE_PLAN.md`
- `TEAM_10_USER_TICKERS_SSOT_CRYPTO_EXCHANGE_UPDATES.md`

---

**log_entry | TEAM_10 | TO_TEAM_50 | USER_TICKERS_CRYPTO_EXCHANGE_CORRECTIVE | 2026-02-14**
