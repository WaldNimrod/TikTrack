# 📋 טבלת אילוצי DB מפורטת - ישויות יעד (trade_plan, cash_flow, user_profile)

## 🎯 מטרה
טבלת אילוצים מלאה ל-3 ישויות יעד: field, type, required, nullable, enum/allowed values, length, defaults, FK constraints
case-sensitivity לערכים (status/investment_type/condition_operator)
שדות תאריך בפועל + האם יש default ב-DB או חייבים להזין

---

## 📊 טבלת אילוצים מפורטת לישויות יעד

### 🏷️ **TRADE_PLAN**

| Field | Type | Required | Nullable | Length | Default | FK Constraints | Enum/Allowed Values | Case Sensitive | Date Field | Notes |
|-------|------|----------|----------|--------|---------|----------------|-------------------|---------------|------------|-------|
| id | INTEGER | Auto | False | - | Auto-increment | Primary Key | - | - | - | BaseModel provides |
| created_at | DATETIME | Auto | False | - | CURRENT_TIMESTAMP | - | - | - | ✅ Server timestamp | BaseModel provides |
| user_id | INTEGER | ✅ | False | - | - | FK→users.id | - | - | - | Must exist in users table |
| trading_account_id | INTEGER | ✅ | False | - | - | FK→trading_accounts.id | - | - | - | Must exist in trading_accounts table |
| ticker_id | INTEGER | ✅ | False | - | - | FK→tickers.id | - | - | - | Must exist in tickers table |
| investment_type | VARCHAR(20) | ✅ | False | 20 | 'swing' | - | 'swing' (only documented value) | ✅ | - | Must be exactly 'swing' |
| side | VARCHAR(10) | ✅ | False | 10 | 'Long' | - | 'Long', 'Short' | ✅ | - | Must be exactly 'Long' or 'Short' |
| status | VARCHAR(20) | ✅ | False | 20 | 'open' | - | 'open', 'closed', 'cancelled' | ✅ | - | Must be exactly one of these values |
| planned_amount | FLOAT | ✅ | False | - | 1000 | - | > 0 | - | - | Must be positive number |
| entry_price | FLOAT | ❌ | True | - | NULL | - | - | - | - | Optional, can be NULL |
| entry_conditions | VARCHAR(500) | ❌ | True | 500 | NULL | - | - | - | - | Optional text |
| stop_price | FLOAT | ❌ | True | - | 0.1 | - | - | - | - | Optional, default 0.1 |
| target_price | FLOAT | ❌ | True | - | 2000 | - | - | - | - | Optional, default 2000 |
| stop_percentage | FLOAT | ❌ | True | - | 0.1 | - | - | - | - | Optional percentage |
| target_percentage | FLOAT | ❌ | True | - | 2000 | - | - | - | - | Optional percentage |
| reasons | VARCHAR(500) | ❌ | True | 500 | NULL | - | - | - | - | Optional text |
| notes | VARCHAR(5000) | ❌ | True | 5000 | NULL | - | - | - | - | Optional long text |
| cancelled_at | DATETIME | ❌ | True | - | NULL | - | - | - | ✅ Manual timestamp | Set when status='cancelled' |
| cancel_reason | VARCHAR(500) | ❌ | True | 500 | NULL | - | - | - | - | Optional cancel explanation |

---

### 💸 **CASH_FLOW**

| Field | Type | Required | Nullable | Length | Default | FK Constraints | Enum/Allowed Values | Case Sensitive | Date Field | Notes |
|-------|------|----------|----------|--------|---------|----------------|-------------------|---------------|------------|-------|
| id | INTEGER | Auto | False | - | Auto-increment | Primary Key | - | - | - | BaseModel provides |
| created_at | DATETIME | Auto | False | - | CURRENT_TIMESTAMP | - | - | - | ✅ Server timestamp | BaseModel provides |
| user_id | INTEGER | ✅ | False | - | - | FK→users.id | - | - | - | Must exist in users table |
| trading_account_id | INTEGER | ✅ | False | - | - | FK→trading_accounts.id | - | - | - | Must exist in trading_accounts table |
| type | VARCHAR(50) | ✅ | False | 50 | 'deposit' | - | 'deposit', 'withdrawal', 'fee', 'dividend', 'transfer_in', 'transfer_out', 'currency_exchange_from', 'currency_exchange_to', 'other_positive', 'other_negative' | ✅ | - | Must be exactly one of these values |
| amount | FLOAT | ✅ | False | - | - | - | ≠ 0 (not zero) | - | - | Must be non-zero number |
| fee_amount | FLOAT | ✅ | False | - | 0 | - | ≥ 0 | - | - | Fee in base currency, non-negative |
| date | DATE | ❌ | True | - | NULL | - | - | - | ✅ Manual input | Format: YYYY-MM-DD, can be NULL |
| description | VARCHAR(5000) | ❌ | True | 5000 | NULL | - | - | - | - | Optional description |
| currency_id | INTEGER | ❌ | True | - | 1 | FK→currencies.id | - | - | - | Defaults to USD (ID=1) |
| usd_rate | DECIMAL(10,6) | ✅ | False | - | 1.000000 | - | > 0 | - | - | Exchange rate, must be positive |
| source | VARCHAR(20) | ❌ | True | 20 | 'manual' | - | 'manual', 'file_import', 'direct_import', 'api' | ✅ | - | Must be exactly one of these values |
| external_id | VARCHAR(100) | ❌ | True | 100 | '0' | - | - | - | - | External system identifier |
| trade_id | INTEGER | ❌ | True | - | NULL | FK→trades.id | - | - | - | Optional link to trade |

---

### 👤 **USER_PROFILE (User Entity)**

| Field | Type | Required | Nullable | Length | Default | FK Constraints | Enum/Allowed Values | Case Sensitive | Date Field | Notes |
|-------|------|----------|----------|--------|---------|----------------|-------------------|---------------|------------|-------|
| id | INTEGER | Auto | False | - | Auto-increment | Primary Key | - | - | - | BaseModel provides |
| created_at | DATETIME | Auto | False | - | CURRENT_TIMESTAMP | - | - | - | ✅ Server timestamp | BaseModel provides |
| updated_at | DATETIME | ❌ | True | - | NULL | - | - | - | ✅ Auto/manual | Updated on changes |
| username | VARCHAR(50) | ✅ | False | 50 | - | UNIQUE constraint | - | ✅ | - | Must be unique, case-sensitive |
| email | VARCHAR(100) | ❌ | True | 100 | NULL | UNIQUE constraint | - | ✅ | - | Must be unique if provided, case-insensitive uniqueness |
| first_name | VARCHAR(50) | ❌ | True | 50 | NULL | - | - | - | - | Optional display name |
| last_name | VARCHAR(50) | ❌ | True | 50 | NULL | - | - | - | - | Optional display name |
| is_active | BOOLEAN | ✅ | False | - | TRUE | - | TRUE, FALSE | - | - | Must be explicitly set |
| is_default | BOOLEAN | ✅ | False | - | FALSE | UNIQUE constraint | TRUE, FALSE | - | - | Only one default user allowed |
| password_hash | VARCHAR(255) | ❌ | True | 255 | NULL | - | - | - | - | Bcrypt hash, optional for some auth methods |

---

## 🔍 **הסבר מפורט לכל עמודה בטבלה**

### **Field**
שם השדה המדויק בטבלת DB

### **Type**
סוג הנתון ב-SQLAlchemy:
- INTEGER: מספר שלם
- VARCHAR(n): מחרוזת באורך מוגבל
- FLOAT: מספר עשרוני
- DECIMAL(precision,scale): מספר עשרוני מדויק
- BOOLEAN: true/false
- DATETIME: תאריך ושעה
- DATE: תאריך בלבד

### **Required**
- ✅: חובה להזין בעת יצירה
- ❌: אופציונלי
- Auto: נוצר אוטומטית על ידי המערכת

### **Nullable**
- True: יכול להיות NULL
- False: אסור NULL

### **Length**
אורך מקסימלי מותר:
- VARCHAR(n): מקסימום n תווים
- DECIMAL(10,6): 10 ספרות בסך, 6 אחרי נקודה

### **Default**
ערך ברירת מחדל אם לא צוין

### **FK Constraints**
אילוצי מפתח זר - חייב להפנות לרשומה קיימת

### **Enum/Allowed Values**
ערכים מותרים בלבד (case-sensitive)

### **Case Sensitive**
- ✅: חובה שימוש באותיות מדויקות
- -: לא רלוונטי

### **Date Field**
- ✅: שדה תאריך
- -: לא שדה תאריך

### **Notes**
הערות נוספות על אילוצים והתנהגות

---

## ⚠️ **נקודות קריטיות לשים לב**

### **Foreign Key Constraints**
כל FK חייב להפנות לרשומה קיימת:
- user_id → users.id
- trading_account_id → trading_accounts.id
- ticker_id → tickers.id
- currency_id → currencies.id
- trade_id → trades.id

### **Case-Sensitivity**
כל הערכים ב-ENUM הם case-sensitive בדיוק כפי שמופיע:
- investment_type: 'swing' (לא 'SWING')
- side: 'Long', 'Short' (לא 'long', 'SHORT')
- status: 'open', 'closed', 'cancelled' (לא 'OPEN')
- type (cash_flow): 'deposit', 'withdrawal', etc. (אותיות קטנות בדיוק)
- source (cash_flow): 'manual', 'file_import', etc.

### **שדות תאריך**
- **created_at**: תמיד נוצר אוטומטית בשרת
- **updated_at**: מתעדכן אוטומטית או ידנית
- **date (cash_flow)**: חובה להזין בפורמט YYYY-MM-DD
- **cancelled_at**: נוצר כאשר status='cancelled'

### **אילוצי אורך**
- username: מקסימום 50 תווים
- email: מקסימום 100 תווים
- first_name/last_name: מקסימום 50 תווים
- notes: מקסימום 5000 תווים
- description: מקסימום 5000 תווים

### **אילוצי ערכים**
- amount (cash_flow): ≠ 0 (לא יכול להיות אפס)
- usd_rate: > 0 (חייב להיות חיובי)
- fee_amount: ≥ 0 (לא יכול להיות שלילי)
- planned_amount: > 0 (חייב להיות חיובי)

---

## 🎯 **מסקנה**
טבלה זו מספקת את כל האילוצים הנדרשים ל-QA ידני ללא ניחושים.
כל שדה מתועד עם סוג, אילוצים, ערכים מותרים ודרישות case-sensitivity.
