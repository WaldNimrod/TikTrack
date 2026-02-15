# Team 30 → Team 50: בקשת בדיקה — User Tickers Crypto + Exchanges

**From:** Team 30 (Frontend)  
**To:** Team 50 (QA)  
**Date:** 2026-02-14  
**Subject:** בדיקות חיים — קריפטו, TASE, בורסות אירופה  
**מקור:** TEAM_10_TO_TEAM_50_USER_TICKERS_CRYPTO_EXCHANGE_CORRECTIVE; תשובת צוות 20 על TASE

---

## 1. רקע

צוות 20 ו־30 סיימו את משימות התיקון. **נדרשת בדיקת QA חיים** — בפרט טיקר מבורסת תל אביב, שלא נבדק עדיין מול ספקים.

---

## 2. משימות בדיקה (חובה)

### 2.1 מניות (ברירת מחדל)
- [ ] **AAPL** — הוספת טיקר חדש; Live data check עובר; טיקר נכנס לרשימה.
- [ ] **MSFT** — (אופציונלי) אימות נוסף.

### 2.2 קריפטו
- [ ] **BTC** — סוג נכס: CRYPTO, Market: USD; הוספה בלי 422.
- [ ] **ETH** — (אופציונלי) אימות נוסף.

### 2.3 בורסת תל אביב (TASE) — **קריטי**
- [ ] **TEVA.TA** — סמל: TEVA, בורסה: תל אביב (.TA); הוספה; **ולוודא שהספקים (Yahoo/Alpha) מחזירים נתונים**.
- **הערה:** צוות 20 מציין — הקוד מעביר symbol as-is; Yahoo ו-Alpha תומכים בפורמט — **אבל טרם בוצעה בדיקת fetch חיים**. הבדיקה הזו תאשר לראשונה שזה עובד.

### 2.4 בורסה אירופאית (אופציונלי)
- [ ] **ANAU.MI** — סמל: ANAU, בורסה: מילאנו (.MI); אימות.

---

## 3. קריטריון סגירה

- [ ] **לפחות 3 טיקרים:** 2 מניות + 1 קריפטו (per Team 10).
- [ ] **TEVA.TA** — בדיקת fetch חיים מוצלחת (אימות ראשון שעובד מול ספקים).

---

## 4. Evidence

לתעד ב-`documentation/05-REPORTS/artifacts/`; דיווח ל-Team 10.  
לכלול: תוצאות TEVA.TA (הצלחה/כישלון + פרטי שגיאה אם יש).

---

## 5. מסמכים רלוונטיים

- `TEAM_10_TO_TEAM_50_USER_TICKERS_CRYPTO_EXCHANGE_CORRECTIVE.md`
- `TEAM_30_TO_TEAM_20_USER_TICKERS_VERIFICATION_QUESTION.md` — תשובת צוות 20 (TASE לא נבדק)

---

**Prepared by:** Team 30 (Frontend)  
**Status:** QA REQUEST — Awaiting Team 50 execution  
**log_entry | TEAM_30 | TO_TEAM_50_QA_REQUEST | 2026-02-14**
