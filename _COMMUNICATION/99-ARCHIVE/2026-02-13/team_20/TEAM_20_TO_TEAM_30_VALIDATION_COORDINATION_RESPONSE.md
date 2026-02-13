# Team 20 → Team 30: תשובת תיאום וולידציות — D16 חשבונות מסחר

**מאת:** Team 20 (Backend)  
**אל:** Team 30 (Frontend)  
**תאריך:** 2026-02-12  
**הקשר:** TEAM_30_TO_TEAM_20_VALIDATION_COORDINATION_REQUEST.md  
**סטטוס:** ✅ **מיושם**

---

## 1. סיכום ביצוע

| דרישה | סטטוס | פרטים |
|-------|--------|--------|
| **שדות חובה** | ✅ | broker, account_number — חובה ב-POST (create) |
| **ייחודיות שם** | ✅ | (user_id, account_name) — UNIQUE ב-DB + בדיקה ב-API |
| **ייחודיות מספר** | ✅ | (user_id, account_number) — index ב-DB + בדיקה ב-API |
| **קודי שגיאה** | ✅ | ACCOUNT_NAME_DUPLICATE, ACCOUNT_NUMBER_DUPLICATE |

---

## 2. שינויי API

### 2.1 POST /api/v1/trading_accounts (Create)

| שדה | לפני | אחרי |
|-----|------|------|
| broker | Optional | **חובה** (min_length=1) |
| account_number | Optional | **חובה** (min_length=1) |

### 2.2 קודי שגיאה חדשים

| קוד | HTTP | מתי |
|-----|------|-----|
| `ACCOUNT_NAME_DUPLICATE` | 400 | שם חשבון כבר קיים לאותו משתמש |
| `ACCOUNT_NUMBER_DUPLICATE` | 400 | מספר חשבון כבר קיים לאותו משתמש |

### 2.3 PUT /api/v1/trading_accounts/{id} (Update)

- broker, account_number — אופציונליים (חלקי עדכון)
- בעת שינוי account_number — נבדקת ייחודיות, במקרה של כפילות: `ACCOUNT_NUMBER_DUPLICATE`
- בעת שינוי account_name — נבדקת ייחודיות, במקרה של כפילות: `ACCOUNT_NAME_DUPLICATE`

---

## 3. DB — Constraints קיימים וחדשים

| Constraint | סטטוס |
|------------|--------|
| `trading_accounts_unique_name` | קיים — UNIQUE (user_id, account_name) |
| `idx_trading_accounts_user_account_number_unique` | **חדש** — migration נדרש |

### מיגרציה

**קובץ:** `scripts/migrations/adr_trading_accounts_account_number_unique.sql`  
**תיאום:** הרצה via Team 60 (לאחר גיבוי).

**הערה:** אם יש רשומות עם account_number כפול — המיגרציה תכשל. יש לפתור כפילויות באופן ידני לפני ההרצה.

---

## 4. טבלאות נוספות — G-Lead

התיאום על שדות חובה וולידציות לטבלאות אחרות (cash_flows, trades, brokers_fees וכו') — **מחייב תיאום מול G-Lead**.  
Team 20 מבקש הנחיה מ-Team 10 לגבי טווח וסדר עדיפויות.

---

## 5. קבצים שעודכנו

| קובץ | שינוי |
|------|--------|
| `api/utils/exceptions.py` | ACCOUNT_NAME_DUPLICATE, ACCOUNT_NUMBER_DUPLICATE |
| `api/schemas/trading_accounts.py` | broker, account_number חובה ב-Create |
| `api/services/trading_accounts.py` | בדיקות ייחודיות + קודי שגיאה |
| `scripts/migrations/adr_trading_accounts_account_number_unique.sql` | UNIQUE index |

---

## 6. המלצה ל-Frontend

- לטפל ב-`ACCOUNT_NAME_DUPLICATE` ו-`ACCOUNT_NUMBER_DUPLICATE` בהודעות משתמש ברורות.
- להמשיך לבדוק broker ו-account_number לפני שליחה — ה-API ידחה בקשות חסרות.

---

**Team 20 (Backend)**  
**log_entry | D16_VALIDATION | COORDINATION_RESPONSE | TO_TEAM_30 | 2026-02-12**
