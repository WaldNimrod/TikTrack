# User Tickers + Crypto + Exchanges — פערים קריטיים, תיקונים נדרשים, ועדכון תוכנית

**From:** Team 10 (The Gateway)  
**To:** Team 90 (The Spy), Teams 20 / 30 / 60 / 50  
**Date:** 2026-02-14  
**Subject:** USER_TICKERS — Corrective Plan | Crypto, Provider Mapping, European & TASE  
**מקור:** בדיקה מול קוד, SSOT, QA — לא לסגור לפני תיקון ואישור Team 90

---

## 1. ממצאים (Evidence)

### 1.1 מה עובד
- "הוספת טיקר חדש" עובדת **למניות** (למשל AAPL).
- לוגיקת **Live-data check** לפני יצירת טיקר קיימת.

### 1.2 מה לא עובד — פערים קריטיים

| פער | תיאור |
|-----|--------|
| **קריפטו** | BTC-USD נכשל (422). אין מיפוי ספקים, אין שימוש ב-provider mapping; Alpha משתמש ב-endpoints לא מתאימים לקריפטו (GLOBAL_QUOTE / TIME_SERIES_DAILY). |
| **Provider mapping** | `provider_mapping_data` מוגדר ב-SSOT (WP_20_09) אך **לא ממומש** בקוד (`user_tickers_service.py` בודק live data רק לפי symbol). |
| **UI קריפטו** | UI לא מאפשר לבחור market/currency לקריפטו (נדרש ל-Alpha). |
| **בורסות אירופאיות** | דוגמה: ANAU — דורש סימון בורסה (למשל ANAU.MI, מילאנו). לכל טיקר נדרש **שדה ייעודי** לבורסה/סיומת; אם אין — לבדוק באפיונים. |
| **בורסת תל אביב (TASE)** | יש להוסיף תמיכה; לאפשר סחירה; לבדוק קבלת נתונים לנכס דוגמה אמיתי מבורסה זו. |

---

## 2. Root Cause (פערים מול SSOT)

- **SSOT קיים אך לא ממומש:**
  - **WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md** — `provider_mapping_data` (JSONB) מוגדר; לא בשימוש ב-`user_tickers_service.py`.
  - **alpha_provider.py** — משתמש ב-GLOBAL_QUOTE ו-TIME_SERIES_DAILY; **לא מתאים לקריפטו** (נדרש DIGITAL_CURRENCY_DAILY עם symbol+market).

---

## 3. פתרון מומלץ — משימות לפי צוותים

### 3.1 Team 10 (Owner)
- [ ] לעדכן תוכנית עבודה + רשימת משימות מרכזית עם פרקי **crypto + provider mapping + בורסות (אירופה + TASE)**.
- [ ] לעדכן SSOTים מרכזיים (סעיף 4).
- [ ] להוציא **הודעות הפעלה מתוקנות** לצוותים 20 / 30 / 60 / 50.
- [ ] **סריקה ורשימת seed:** לבצע סריקה ולהודיע לצוות 20 **רשימת ערכים לטבלת seed** (exchanges, דוגמאות mapping וכו').
- [ ] לנהל את התהליך ולהחזיר לביקורת Team 90 עם Evidence מלא — **לא לסגור לפני סגירת פערים**.

### 3.2 Team 20 (Backend)
- [ ] **מיפוי ספקים בפועל:** שימוש ב-`provider_mapping_data` בעת בדיקת Live data ובכל fetch (לא symbol בלבד).
- [ ] **תמיכה בקריפטו ב-Alpha:** שימוש ב-**DIGITAL_CURRENCY_DAILY** (symbol+market) ל-EOD/History; **לא** GLOBAL_QUOTE לקריפטו.
- [ ] **Live data check:** אם `ticker_type=CRYPTO` → מיפוי ספקים + market/currency; אם STOCK → להמשיך כרגיל.
- [ ] **בורסות אירופה:** תמיכה ב-symbol+exchange suffix (למשל ANAU.MI); שדה ייעודי לכל טיקר (ב-DB/אפיונים אם חסר).
- [ ] **בורסת תל אביב (TASE):** תמיכה ובדיקת קבלת נתונים לנכס דוגמה אמיתי.
- [ ] לקבל מ-Team 10 רשימת ערכים ל-**seed** (exchanges, דוגמאות) וליישם.

**מסמכים מחייבים:**  
`documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.md`  
`documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC.md`  
`documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md`

### 3.3 Team 30 (Frontend)
- [ ] **הרחבת מודול הוספת טיקר:** שדה **סוג נכס (STOCK / CRYPTO)**.
- [ ] אם **CRYPTO** → שדה **Market** (ברירת מחדל USD); payload כולל `ticker_type` + provider mapping.
- [ ] **בורסה/סיומת** — תמיכה לטיקרים מבורסות אירופאיות (למשל סימון .MI); יישור עם SSOT ו-Team 20.
- [ ] UI חייב ליישר עם SSOT ועם Team 20.

### 3.4 Team 60 (Jobs/Cron)
- [ ] אם קיימים jobs לקריפטו → להשתמש ב-**מיפוי ספקים** (symbol+market).
- [ ] לוודא ש-intraday/cron **לא שוברים** קריפטו.

### 3.5 Team 50 (QA)
- [ ] להוסיף **בדיקת קריפטו:** יצירת טיקר חדש BTC-USD או ETH-USD (לפי mapping).
- [ ] לוודא Live data check עובר; הטיקר נכנס לרשימה.
- [ ] **קריטריון סגירה:** QA מאשר **3 טיקרים** (2 מניות + 1 קריפטו) לפחות.

---

## 4. עדכון SSOT נדרש (Team 10)

| מסמך | עדכון נדרש |
|------|-------------|
| **MARKET_DATA_PIPE_SPEC** | תיעוד פורמט `provider_mapping_data` עבור **קריפטו** (symbol+market, Alpha DIGITAL_CURRENCY_DAILY). |
| **MARKET_DATA_COVERAGE_MATRIX** | **קריפטו** כלול ומנוהל לפי mapping; בורסות אירופה + TASE. |
| **WP_20_09_FIELD_MAP_TICKERS_MAPPINGS** | דוגמת mapping ל**קריפטו**; דוגמאות בורסות (כולל .MI, TASE). |
| **00_MASTER_INDEX** | הפניות למסמכים המעודכנים ולתוכנית התיקון. |

---

## 5. קריטריוני הצלחה (חובה לפני סגירה)

- [ ] ניתן להוסיף **טיקר חדש קריפטו** דרך UI **בלי 422**.
- [ ] **Live-data check** משתמש ב-**מיפוי ספקים** (לא ב-symbol בלבד).
- [ ] **Alpha** עובד בקריפטו דרך endpoint ייעודי (DIGITAL_CURRENCY_DAILY).
- [ ] **QA** מאשר **3 טיקרים** (2 מניות + 1 קריפטו).
- [ ] תמיכה **בורסות אירופאיות** (דוגמה ANAU.MI) ו**בורסת תל אביב** — שדה ייעודי ונתונים אמיתיים.
- [ ] **רשימת seed** נמסרה ל-Team 20 ויושמה.

---

## 6. דרישה

- **לא להמשיך לסגירה** עד שכל הפערים לעיל נסגרו.
- לאחר עדכונים → **להגיש מחדש לאישור Team 90** עם Evidence מלא.

---

## 7. מסמכים מחייבים (להפנות בהודעות)

- `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC.md`
- `documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md`

---

**Prepared by:** Team 10 (The Gateway)  
**Status:** ⚠️ CORRECTIVE — NO CLOSURE UNTIL GAPS CLOSED  
**log_entry | TEAM_10 | USER_TICKERS_CRYPTO_EXCHANGE_CORRECTIVE_PLAN | 2026-02-14**
