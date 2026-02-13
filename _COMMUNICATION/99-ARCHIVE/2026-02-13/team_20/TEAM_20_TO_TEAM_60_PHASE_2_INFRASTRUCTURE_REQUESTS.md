# 🔴 בקשות תשתית: Phase 2 - Financial Core (D18/D21)

**id:** `TEAM_20_TO_TEAM_60_PHASE_2_INFRASTRUCTURE_REQUESTS`  
**מאת:** Team 20 (Backend Implementation)  
**אל:** Team 60 (DevOps & Platform)  
**תאריך:** 2026-02-07  
**Session:** Phase 2 - Financial Core Active Development  
**Subject:** PHASE_2_INFRASTRUCTURE_REQUESTS | Status: 🔴 **CRITICAL**  
**Priority:** 🔴 **P0 - URGENT**

---

## 🎯 Executive Summary

**CRITICAL REQUESTS:** נדרשות פעולות תשתית עבור Phase 2 - Financial Core (D18/D21).

**מקור המנדט:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_PHASE_2_EXECUTION_D18_D21.md`

**הקשר:** Phase 2 במצב Active Development. Team 30 כבר עובד על הממשקים. נדרשת תמיכה תשתיתית מלאה.

**סטטוס Backend:** 🟡 **IN PROGRESS** - D18 חלקי, D21 ממתין לאימות תשתית.

---

## ⚠️ תיקונים לפי הערות ביקורת (Team 90)

**תאריך תיקון:** 2026-02-07  
**מקור:** הערות ביקורת מצוות הביקורת (Team 90)

### **תיקונים שבוצעו:**

1. ✅ **Precision של amount:** תוקן מ-`NUMERIC(20, 8)` ל-`NUMERIC(20, 6)` (תואם DDL v2.5 + ORM)
2. ✅ **CHECK constraint על amount:** הוסר (לא מוגדר ב-DDL v2.5)
3. ✅ **אינדקסים:** הוסרו אינדקסים נוספים (`idx_cash_flows_date`, `idx_cash_flows_external_ref`) - רק 3 אינדקסים לפי DDL v2.5
4. ✅ **Trigger updated_at:** הוסר (מטופל ברמת ORM עם `onupdate=func.now()`)
5. ✅ **הפניה לקובץ SQL:** עודכן להפניה ל-`PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (SSOT)

### **עקרון מנחה:**
**⚠️ חובה:** כל המבנה חייב להיות תואם בדיוק ל-DDL v2.5 (SSOT). אין סטיות ללא אישור אדריכלי מפורש.

**מקור SSOT:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (שורות 974-1018)

---

## ✅ סטטוס נוכחי

### **D18 - Brokers Fees:**
- ✅ **טבלת DB:** `user_data.brokers_fees` - נוצרה בהצלחה (2026-02-06)
- ✅ **ENUM Type:** `user_data.commission_type` - נוצר
- ✅ **אינדקסים:** כל האינדקסים נוצרו
- ✅ **הרשאות:** ניתנו למשתמש האפליקציה
- 🟡 **Backend Code:** Service ו-Router בפיתוח

### **D21 - Cash Flows:**
- 🟡 **טבלת DB:** `user_data.cash_flows` - **נדרש אימות קיום**
- 🟡 **אינדקסים:** **נדרש אימות קיום**
- 🟡 **הרשאות:** **נדרש אימות**
- 🟡 **Backend Code:** ממתין לאימות תשתית

---

## 📋 בקשות תשתית

### **1. D21 - Cash Flows: אימות/יצירת טבלת DB** 🔴 **CRITICAL**

#### **1.1. בדיקת קיום טבלה:**

**נדרש:** אימות שהטבלה `user_data.cash_flows` קיימת במסד הנתונים.

**SQL לבדיקה:**
```sql
-- בדיקת קיום טבלה
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'user_data' 
AND table_name = 'cash_flows';
```

#### **1.2. אם הטבלה לא קיימת - יצירת טבלה:**

**⚠️ חשוב:** יש ליצור את הטבלה בדיוק לפי DDL Schema v2.5 (SSOT).

**מקור SSOT:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (שורות 974-1018)

**מבנה נדרש (לפי DDL Schema v2.5 - SSOT):**

```sql
-- ============================================
-- D21: Cash Flows Table Creation Script
-- Phase 2.2 - Cash Flows (D21)
-- Created: 2026-02-07
-- Team: Team 60 (DevOps & Platform)
-- ============================================

-- Step 1: Create cash_flows table
CREATE TABLE IF NOT EXISTS user_data.cash_flows (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    trading_account_id UUID NOT NULL REFERENCES user_data.trading_accounts(id) ON DELETE CASCADE,
    
    -- Type
    flow_type VARCHAR(20) NOT NULL CHECK (flow_type IN ('DEPOSIT', 'WITHDRAWAL', 'DIVIDEND', 'INTEREST', 'FEE', 'OTHER')),
    
    -- Amount
    amount NUMERIC(20, 6) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Details
    description TEXT,
    transaction_date DATE NOT NULL,
    
    -- External Reference
    external_reference VARCHAR(100),
    
    -- Audit Fields
    created_by UUID NOT NULL REFERENCES user_data.users(id),
    updated_by UUID NOT NULL REFERENCES user_data.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Step 2: Create indexes for performance
-- Note: Only 3 indexes as defined in DDL v2.5 (SSOT)
-- Index on trading_account_id + transaction_date (most common filter)
CREATE INDEX IF NOT EXISTS idx_cash_flows_account 
    ON user_data.cash_flows(trading_account_id, transaction_date DESC) 
    WHERE deleted_at IS NULL;

-- Index on user_id + transaction_date (for user-level queries)
CREATE INDEX IF NOT EXISTS idx_cash_flows_user 
    ON user_data.cash_flows(user_id, transaction_date DESC) 
    WHERE deleted_at IS NULL;

-- Index on flow_type (for filtering by type)
CREATE INDEX IF NOT EXISTS idx_cash_flows_type 
    ON user_data.cash_flows(flow_type) 
    WHERE deleted_at IS NULL;

-- Step 3: Add table comment (per DDL v2.5 SSOT)
COMMENT ON TABLE user_data.cash_flows IS 
    'Account deposits, withdrawals, dividends';

COMMENT ON COLUMN user_data.cash_flows.id IS 
    'Primary key - UUID';

COMMENT ON COLUMN user_data.cash_flows.user_id IS 
    'Foreign key to user_data.users - Links cash flow to user';

COMMENT ON COLUMN user_data.cash_flows.trading_account_id IS 
    'Foreign key to user_data.trading_accounts - Links cash flow to trading account';

COMMENT ON COLUMN user_data.cash_flows.flow_type IS 
    'Flow type: DEPOSIT, WITHDRAWAL, DIVIDEND, INTEREST, FEE, OTHER';

COMMENT ON COLUMN user_data.cash_flows.amount IS 
    'Transaction amount in currency (NUMERIC(20,6) for precision - per DDL v2.5 SSOT)';

COMMENT ON COLUMN user_data.cash_flows.currency IS 
    'Currency code (ISO 3-letter, default: USD)';

COMMENT ON COLUMN user_data.cash_flows.description IS 
    'Transaction description';

COMMENT ON COLUMN user_data.cash_flows.transaction_date IS 
    'Date of transaction';

COMMENT ON COLUMN user_data.cash_flows.external_reference IS 
    'External system reference (optional)';

COMMENT ON COLUMN user_data.cash_flows.created_by IS 
    'User who created the record';

COMMENT ON COLUMN user_data.cash_flows.updated_by IS 
    'User who last updated the record';

COMMENT ON COLUMN user_data.cash_flows.created_at IS 
    'Timestamp when record was created';

COMMENT ON COLUMN user_data.cash_flows.updated_at IS 
    'Timestamp when record was last updated';

COMMENT ON COLUMN user_data.cash_flows.deleted_at IS 
    'Timestamp when record was soft-deleted (NULL = active)';

COMMENT ON COLUMN user_data.cash_flows.metadata IS 
    'Additional metadata as JSONB';

-- Step 4: Verify table creation
-- Note: No trigger needed - updated_at is handled by ORM (onupdate=func.now())
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'user_data' 
               AND table_name = 'cash_flows') THEN
        RAISE NOTICE 'Table user_data.cash_flows created successfully';
    ELSE
        RAISE EXCEPTION 'Table user_data.cash_flows was not created';
    END IF;
END $$;
```

#### **1.3. הרשאות נדרשות:**

**חשוב:** החלף `[APPLICATION_USER]` בשם המשתמש האמיתי של האפליקציה.

```sql
-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_data.cash_flows TO [APPLICATION_USER];

-- Grant schema usage
GRANT USAGE ON SCHEMA user_data TO [APPLICATION_USER];

-- Grant sequence permissions (if using SERIAL/BIGSERIAL in future)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA user_data TO [APPLICATION_USER];

-- Set default privileges (optional but recommended)
ALTER DEFAULT PRIVILEGES IN SCHEMA user_data 
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO [APPLICATION_USER];
```

---

### **2. אימות תשתית כללי** 🟡 **IMPORTANT**

#### **2.1. בדיקת קישוריות:**

**נדרש:** אימות שהמסד הנתונים נגיש מ-Backend API (Port 8082).

**בדיקות:**
- [ ] Connection string תקין ב-`.env`
- [ ] Database נגיש מ-Backend container/service
- [ ] Port 8082 פתוח ופועל

#### **2.2. בדיקת הרשאות:**

**נדרש:** אימות שהמשתמש האפליקציה יכול לבצע CRUD operations על כל הטבלאות.

**SQL לבדיקה:**
```sql
-- בדיקת הרשאות על טבלאות Phase 2
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'user_data'
AND table_name IN ('brokers_fees', 'cash_flows')
ORDER BY table_name, grantee;
```

---

## 📊 מבנה טבלת Cash Flows

| שדה | טיפוס | חובה | תיאור |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | ✅ | Primary Key |
| `user_id` | `UUID (FK)` | ✅ | קישור למשתמש |
| `trading_account_id` | `UUID (FK)` | ✅ | קישור לחשבון מסחר |
| `flow_type` | `VARCHAR(20)` | ✅ | סוג תנועה (DEPOSIT/WITHDRAWAL/DIVIDEND/INTEREST/FEE/OTHER) |
| `amount` | `NUMERIC(20,6)` | ✅ | סכום התנועה (לפי DDL v2.5 SSOT) |
| `currency` | `VARCHAR(3)` | ✅ | מטבע (default: USD) |
| `description` | `TEXT` | ❌ | תיאור התנועה |
| `transaction_date` | `DATE` | ✅ | תאריך פעולה |
| `external_reference` | `VARCHAR(100)` | ❌ | מזהה חיצוני |
| `created_by` | `UUID (FK)` | ✅ | משתמש שיצר |
| `updated_by` | `UUID (FK)` | ✅ | משתמש שעדכן |
| `created_at` | `TIMESTAMPTZ` | ✅ | תאריך יצירה |
| `updated_at` | `TIMESTAMPTZ` | ✅ | תאריך עדכון |
| `deleted_at` | `TIMESTAMPTZ` | ❌ | תאריך מחיקה (Soft Delete) |
| `metadata` | `JSONB` | ❌ | מטא-דאטה נוסף |

---

## ✅ Checklist - צעד אחר צעד

### **שלב 1: בדיקת קיום טבלת Cash Flows**
- [ ] הרצת SQL לבדיקת קיום טבלה
- [ ] תיעוד תוצאות

### **שלב 2: יצירת טבלה (אם לא קיימת)**
- [ ] הרצת `CREATE TABLE user_data.cash_flows`
- [ ] אימות יצירה: `SELECT * FROM information_schema.tables WHERE table_name = 'cash_flows'`

### **שלב 3: יצירת אינדקסים (רק 3 אינדקסים לפי DDL v2.5)**
- [ ] `idx_cash_flows_account` (trading_account_id + transaction_date)
- [ ] `idx_cash_flows_user` (user_id + transaction_date)
- [ ] `idx_cash_flows_type` (flow_type)
- [ ] אימות: `SELECT indexname FROM pg_indexes WHERE tablename = 'cash_flows'`

### **שלב 4: הרשאות**
- [ ] GRANT על טבלה
- [ ] GRANT USAGE על schema
- [ ] GRANT על sequences (אם רלוונטי)
- [ ] ALTER DEFAULT PRIVILEGES (אופציונלי)

### **שלב 5: בדיקות אימות**
- [ ] בדיקת יצירת טבלה
- [ ] בדיקת הרשאות (כמשתמש האפליקציה)
- [ ] בדיקת INSERT/UPDATE/DELETE (כמשתמש האפליקציה)
- [ ] בדיקת Soft Delete (deleted_at)
- [ ] בדיקת Trigger (updated_at auto-update)

---

## 📋 Verification Steps - צעדי אימות

### **1. בדיקת יצירת טבלה**

```sql
-- בדיקת קיום טבלה
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'user_data' 
AND table_name = 'cash_flows';

-- בדיקת מבנה טבלה
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'user_data'
AND table_name = 'cash_flows'
ORDER BY ordinal_position;
```

### **2. בדיקת אינדקסים**

```sql
-- רשימת כל האינדקסים
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'user_data'
AND tablename = 'cash_flows';
```

### **3. בדיקת הרשאות (כמשתמש האפליקציה)**

```sql
-- בדיקת הרשאות נוכחיות
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'user_data'
AND table_name = 'cash_flows';
```

### **4. בדיקת פעולות (כמשתמש האפליקציה)**

```sql
-- בדיקת SELECT
SET ROLE [APPLICATION_USER];
SELECT COUNT(*) FROM user_data.cash_flows;

-- בדיקת INSERT (test)
INSERT INTO user_data.cash_flows (
    user_id, 
    trading_account_id, 
    flow_type, 
    amount, 
    currency, 
    transaction_date,
    created_by,
    updated_by
)
VALUES (
    (SELECT id FROM user_data.users LIMIT 1),
    (SELECT id FROM user_data.trading_accounts LIMIT 1),
    'DEPOSIT',
    1000.00,
    'USD',
    CURRENT_DATE,
    (SELECT id FROM user_data.users LIMIT 1),
    (SELECT id FROM user_data.users LIMIT 1)
);

-- בדיקת UPDATE
UPDATE user_data.cash_flows 
SET amount = 1500.00
WHERE flow_type = 'DEPOSIT'
RETURNING id, updated_at;

-- בדיקת Soft Delete
UPDATE user_data.cash_flows 
SET deleted_at = NOW()
WHERE flow_type = 'DEPOSIT'
RETURNING id, deleted_at;

-- בדיקת SELECT (רק לא נמחקו)
SELECT COUNT(*) FROM user_data.cash_flows WHERE deleted_at IS NULL;

-- ניקוי (cleanup)
DELETE FROM user_data.cash_flows WHERE flow_type = 'DEPOSIT';
```

### **5. בדיקת updated_at (מטופל ברמת ORM)**
```sql
-- הערה: updated_at מטופל ברמת ORM (onupdate=func.now())
-- אין צורך ב-Trigger ברמת DB לפי DDL v2.5
-- בדיקת שדה updated_at קיים
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_schema = 'user_data'
AND table_name = 'cash_flows'
AND column_name = 'updated_at';
```

---

## ⚠️ Impact & Dependencies

### **Impact על Backend:**

**לפני אימות/יצירת טבלה:** 🔴 **BLOCKED**
- Service ו-Router לא יכולים לפעול
- כל ה-endpoints יחזירו `500 Internal Server Error`
- Frontend לא יכול לטעון נתונים

**אחרי אימות/יצירת טבלה:** ✅ **OPERATIONAL**
- כל ה-endpoints יחזירו `200 OK`
- CRUD operations יעבדו במלואם
- Frontend יכול לטעון ולעדכן נתונים

### **Dependencies:**

**טבלאות נדרשות (קיימות):**
- ✅ `user_data.users` - קיימת (לצורך FK `user_id`, `created_by`, `updated_by`)
- ✅ `user_data.trading_accounts` - קיימת (לצורך FK `trading_account_id`)

**Schemas נדרשות:**
- ✅ `user_data` - קיים

---

## 🎯 Next Steps

### **לאחר אימות/יצירת הטבלה:**

1. ⚠️ **Team 60:** הודעה ל-Team 20 על השלמה
2. ✅ **Team 20:** בדיקת endpoints (GET/POST/PUT/DELETE)
3. ✅ **Team 20:** בדיקת פילטרים (trading_account_id, flow_type, date_from, date_to, search)
4. ✅ **Team 20:** בדיקת Soft Delete
5. ✅ **Team 30:** אינטגרציה Frontend

---

## 📞 תקשורת

### **לאחר אימות/יצירת הטבלה, נא להודיע ל-Team 20:**

**פורמט הודעה:**
- 📧 `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_20_D21_CASH_FLOWS_TABLE_VERIFIED.md`
- 📋 **תוכן נדרש:**
  - אישור קיום/יצירת טבלה
  - אישור יצירת אינדקסים
  - אישור הרשאות
  - תוצאות בדיקות אימות
  - כל הערות או שינויים שבוצעו

---

## 🔗 קישורים רלוונטיים

### **מסמכי Team 20:**
- **Field Map:** `documentation/01-ARCHITECTURE/LOGIC/WP_20_08_C_FIELD_MAP_CASH_FLOWS.md`
- **Progress Report:** `_COMMUNICATION/team_20/TEAM_20_PHASE_2_D18_PROGRESS_REPORT.md`
- **Model:** `api/models/cash_flows.py` (אם קיים)
- **Schema:** `api/schemas/cash_flows.py` (אם קיים)

### **מנדטים:**
- **מנדט Phase 2:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_PHASE_2_EXECUTION_D18_D21.md`
- **Implementation Plan:** `documentation/01-ARCHITECTURE/TT2_PHASE_2_IMPLEMENTATION_PLAN.md`
- **Phase 2 Active Development:** `_COMMUNICATION/team_10/TEAM_10_TO_ALL_TEAMS_PHASE_2_ACTIVE_DEVELOPMENT.md`

### **דוגמאות קודמות:**
- **D18 Table Creation:** `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_60_D18_BROKERS_FEES_TABLE_REQUEST.md`
- **D18 Table Acknowledgment:** `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_60_D18_TABLE_ACKNOWLEDGMENT.md`

### **DB Schema (SSOT):**
- **Full DDL:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (שורות 974-1018)
- **ORM Model:** `api/models/cash_flows.py`
- **⚠️ חשוב:** יש ליצור את הטבלה בדיוק לפי DDL v2.5 - אין סטיות מ-SSOT

---

## 📝 הערות טכניות

### **1. NUMERIC Precision (SSOT):**
- **SSOT:** `NUMERIC(20, 6)` עבור `amount` (DDL v2.5, שורה 985)
- **ORM:** `Numeric(20, 6)` (api/models/cash_flows.py, שורה 63)
- **סיבה:** דיוק לסכומי כסף (20 ספרות כולל, 6 אחרי הנקודה)
- **⚠️ חשוב:** אין CHECK constraint על amount - לא מוגדר ב-DDL v2.5

### **2. CHECK Constraint על flow_type:**
- **SSOT:** CHECK constraint מוגדר ב-DDL v2.5 (שורה 982)
- **ערכים מותרים:** DEPOSIT, WITHDRAWAL, DIVIDEND, INTEREST, FEE, OTHER
- **תואם:** ORM model (api/models/cash_flows.py, שורות 32-35)

### **3. אינדקסים (SSOT):**
- **SSOT:** רק 3 אינדקסים מוגדרים ב-DDL v2.5 (שורות 1006-1016):
  - `idx_cash_flows_account` (trading_account_id + transaction_date)
  - `idx_cash_flows_user` (user_id + transaction_date)
  - `idx_cash_flows_type` (flow_type)
- **⚠️ חשוב:** אין אינדקסים נוספים - לא מוגדרים ב-DDL v2.5
- **Partial indexes:** כל האינדקסים עם `WHERE deleted_at IS NULL` לאופטימיזציה

### **4. Soft Delete:**
- **החלטה:** שימוש ב-`deleted_at` (Soft Delete)
- **סיבה:** שמירת היסטוריה ומניעת אובדן נתונים
- **אינדקס:** Partial indexes (`WHERE deleted_at IS NULL`) לאופטימיזציה

### **5. updated_at (SSOT):**
- **SSOT:** אין Trigger ב-DDL v2.5
- **ORM:** מטופל ברמת ORM עם `onupdate=func.now()` (api/models/cash_flows.py, שורה 98)
- **⚠️ חשוב:** אין צורך ב-Trigger ברמת DB - מטופל ברמת ORM

### **6. Foreign Keys:**
- **user_id:** קישור ל-`user_data.users` (ON DELETE CASCADE)
- **trading_account_id:** קישור ל-`user_data.trading_accounts` (ON DELETE CASCADE)
- **created_by / updated_by:** קישור ל-`user_data.users` (audit trail, ON DELETE CASCADE)

### **7. מקור SSOT:**
- **DDL Schema:** `documentation/06-ENGINEERING/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (שורות 974-1018)
- **ORM Model:** `api/models/cash_flows.py`
- **⚠️ חובה:** כל שינוי מהמבנה ב-DDL v2.5 דורש אישור אדריכלי מפורש

---

**Prepared by:** Team 20 (Backend Implementation)  
**Date:** 2026-02-07  
**Session:** Phase 2 - Financial Core Active Development  
**Status:** 🔴 **CRITICAL - AWAITING INFRASTRUCTURE VERIFICATION/CREATION**

**log_entry | [Team 20] | PHASE_2 | INFRASTRUCTURE_REQUESTS | CRITICAL | RED | 2026-02-07**
