# 🔴 בקשה קריטית: יצירת טבלת Brokers Fees (D18)

**id:** `TEAM_20_TO_TEAM_60_D18_BROKERS_FEES_TABLE_REQUEST`  
**מאת:** Team 20 (Backend Implementation)  
**אל:** Team 60 (DevOps & Platform)  
**תאריך:** 2026-01-31  
**Session:** Phase 2.1 - Brokers Fees (D18)  
**Subject:** D18_BROKERS_FEES_TABLE_CREATION | Status: 🔴 **CRITICAL BLOCKER**  
**Priority:** 🔴 **P0 - URGENT**

---

## 🎯 Executive Summary

**CRITICAL REQUEST:** נדרשת יצירת טבלת `user_data.brokers_fees` עבור Phase 2.1 - Brokers Fees (D18).

**מקור המנדט:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_PHASE_2_EXECUTION_D18_D21.md`

**הקשר:** זהו חלק מהליבה הפיננסית (Financial Core) של Phase 2, המאפשרת למשתמשים לנהל את מבני העמלות של הברוקרים שלהם.

**סטטוס Backend:** 🟡 **55.6% הושלם** - Model, Schema, Field Map מוכנים. Service ו-Router ממתינים ליצירת הטבלה.

---

## 📋 DDL נדרש - סקריפט SQL מלא

### **קובץ SQL מומלץ:** `scripts/create_d18_brokers_fees_table.sql`

```sql
-- ============================================
-- D18: Brokers Fees Table Creation Script
-- Phase 2.1 - Brokers Fees (D18)
-- Created: 2026-01-31
-- Team: Team 60 (DevOps & Platform)
-- ============================================

-- Step 1: Create ENUM type for commission_type
-- Note: Using DO block to handle case where ENUM already exists
DO $$ 
BEGIN
    CREATE TYPE user_data.commission_type AS ENUM ('TIERED', 'FLAT');
    RAISE NOTICE 'ENUM type user_data.commission_type created successfully';
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'ENUM type user_data.commission_type already exists, skipping creation';
END $$;

-- Step 2: Create brokers_fees table
CREATE TABLE IF NOT EXISTS user_data.brokers_fees (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Key
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    
    -- Broker Details
    broker VARCHAR(100) NOT NULL,
    commission_type user_data.commission_type NOT NULL,
    commission_value VARCHAR(255) NOT NULL,
    minimum NUMERIC(20, 8) NOT NULL DEFAULT 0 CHECK (minimum >= 0),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT brokers_fees_minimum_check CHECK (minimum >= 0)
);

-- Step 3: Create indexes for performance
-- Index on user_id (most common filter)
CREATE INDEX IF NOT EXISTS idx_brokers_fees_user_id 
    ON user_data.brokers_fees(user_id);

-- Index on broker (for filtering and search)
CREATE INDEX IF NOT EXISTS idx_brokers_fees_broker 
    ON user_data.brokers_fees(broker);

-- Index on commission_type (for filtering)
CREATE INDEX IF NOT EXISTS idx_brokers_fees_commission_type 
    ON user_data.brokers_fees(commission_type);

-- Partial index for soft delete (only non-deleted records)
CREATE INDEX IF NOT EXISTS idx_brokers_fees_deleted_at 
    ON user_data.brokers_fees(deleted_at) 
    WHERE deleted_at IS NULL;

-- Composite index for common query pattern (user_id + deleted_at)
CREATE INDEX IF NOT EXISTS idx_brokers_fees_user_deleted 
    ON user_data.brokers_fees(user_id, deleted_at) 
    WHERE deleted_at IS NULL;

-- Step 4: Add table and column comments
COMMENT ON TABLE user_data.brokers_fees IS 
    'Brokers fees and commission structures (D18) - Stores broker commission information per user';

COMMENT ON COLUMN user_data.brokers_fees.id IS 
    'Primary key - UUID';

COMMENT ON COLUMN user_data.brokers_fees.user_id IS 
    'Foreign key to user_data.users - Links broker fee to user';

COMMENT ON COLUMN user_data.brokers_fees.broker IS 
    'Broker name (e.g., "Interactive Brokers", "IBKR", "TD Ameritrade")';

COMMENT ON COLUMN user_data.brokers_fees.commission_type IS 
    'Commission type: TIERED (volume-based) or FLAT (fixed rate)';

COMMENT ON COLUMN user_data.brokers_fees.commission_value IS 
    'Commission value as string (e.g., "0.0035 $ / Share", "$0.00", "0.1%")';

COMMENT ON COLUMN user_data.brokers_fees.minimum IS 
    'Minimum commission per transaction in USD (NUMERIC(20,8) for precision)';

COMMENT ON COLUMN user_data.brokers_fees.created_at IS 
    'Timestamp when record was created';

COMMENT ON COLUMN user_data.brokers_fees.updated_at IS 
    'Timestamp when record was last updated';

COMMENT ON COLUMN user_data.brokers_fees.deleted_at IS 
    'Timestamp when record was soft-deleted (NULL = active)';

-- Step 5: Create trigger for updated_at (auto-update on row change)
CREATE OR REPLACE FUNCTION update_brokers_fees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_brokers_fees_updated_at
    BEFORE UPDATE ON user_data.brokers_fees
    FOR EACH ROW
    EXECUTE FUNCTION update_brokers_fees_updated_at();

-- Step 6: Verify table creation
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_schema = 'user_data' 
               AND table_name = 'brokers_fees') THEN
        RAISE NOTICE 'Table user_data.brokers_fees created successfully';
    ELSE
        RAISE EXCEPTION 'Table user_data.brokers_fees was not created';
    END IF;
END $$;
```

---

## 🔐 הרשאות נדרשות

### **1. Grant Permissions to Application User**

**חשוב:** החלף `[APPLICATION_USER]` בשם המשתמש האמיתי של האפליקציה (כפי שמוגדר ב-`DATABASE_URL`).

```sql
-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_data.brokers_fees TO [APPLICATION_USER];

-- Grant schema usage
GRANT USAGE ON SCHEMA user_data TO [APPLICATION_USER];

-- Grant ENUM type usage
GRANT USAGE ON TYPE user_data.commission_type TO [APPLICATION_USER];

-- Grant sequence permissions (if using SERIAL/BIGSERIAL in future)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA user_data TO [APPLICATION_USER];
```

### **2. Set Default Permissions (Optional but Recommended)**

להבטחת הרשאות אוטומטיות על טבלאות עתידיות:

```sql
ALTER DEFAULT PRIVILEGES IN SCHEMA user_data 
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO [APPLICATION_USER];
```

### **3. How to Find Application User**

המשתמש מוגדר ב-`DATABASE_URL` environment variable:
```
postgresql+asyncpg://<username>:<password>@<host>:<port>/<database>
```

**מיקומים אפשריים:**
- Backend `.env` file
- Docker compose configuration
- Kubernetes secrets/configmaps
- Environment variables in deployment configuration

---

## 📊 מבנה הטבלה

| שדה | טיפוס | חובה | תיאור |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | ✅ | Primary Key |
| `user_id` | `UUID (FK)` | ✅ | קישור למשתמש |
| `broker` | `VARCHAR(100)` | ✅ | שם הברוקר |
| `commission_type` | `ENUM` | ✅ | סוג עמלה (TIERED/FLAT) |
| `commission_value` | `VARCHAR(255)` | ✅ | ערך העמלה |
| `minimum` | `NUMERIC(20,8)` | ✅ | מינימום לפעולה (USD) |
| `created_at` | `TIMESTAMPTZ` | ✅ | תאריך יצירה |
| `updated_at` | `TIMESTAMPTZ` | ✅ | תאריך עדכון |
| `deleted_at` | `TIMESTAMPTZ` | ❌ | תאריך מחיקה (Soft Delete) |

---

## ✅ Checklist - צעד אחר צעד

### **שלב 1: יצירת ENUM Type**
- [ ] הרצת `CREATE TYPE user_data.commission_type AS ENUM`
- [ ] אימות יצירה: `SELECT typname FROM pg_type WHERE typname = 'commission_type'`

### **שלב 2: יצירת טבלה**
- [ ] הרצת `CREATE TABLE user_data.brokers_fees`
- [ ] אימות יצירה: `SELECT * FROM information_schema.tables WHERE table_name = 'brokers_fees'`

### **שלב 3: יצירת אינדקסים**
- [ ] `idx_brokers_fees_user_id`
- [ ] `idx_brokers_fees_broker`
- [ ] `idx_brokers_fees_commission_type`
- [ ] `idx_brokers_fees_deleted_at` (partial index)
- [ ] `idx_brokers_fees_user_deleted` (composite partial index)
- [ ] אימות: `SELECT indexname FROM pg_indexes WHERE tablename = 'brokers_fees'`

### **שלב 4: יצירת Trigger**
- [ ] יצירת function `update_brokers_fees_updated_at()`
- [ ] יצירת trigger `trigger_brokers_fees_updated_at`
- [ ] אימות: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_brokers_fees_updated_at'`

### **שלב 5: הרשאות**
- [ ] GRANT על טבלה
- [ ] GRANT USAGE על schema
- [ ] GRANT USAGE על ENUM type
- [ ] GRANT על sequences (אם רלוונטי)
- [ ] ALTER DEFAULT PRIVILEGES (אופציונלי)

### **שלב 6: בדיקות אימות**
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
AND table_name = 'brokers_fees';

-- בדיקת מבנה טבלה
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'user_data'
AND table_name = 'brokers_fees'
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
AND tablename = 'brokers_fees';
```

### **3. בדיקת הרשאות (כמשתמש האפליקציה)**

```sql
-- בדיקת הרשאות נוכחיות
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'user_data'
AND table_name = 'brokers_fees';

-- בדיקת הרשאות ENUM
SELECT 
    typname,
    typtype
FROM pg_type
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'user_data')
AND typname = 'commission_type';
```

### **4. בדיקת פעולות (כמשתמש האפליקציה)**

```sql
-- בדיקת SELECT
SET ROLE [APPLICATION_USER];
SELECT COUNT(*) FROM user_data.brokers_fees;

-- בדיקת INSERT (test)
INSERT INTO user_data.brokers_fees (user_id, broker, commission_type, commission_value, minimum)
VALUES (
    (SELECT id FROM user_data.users LIMIT 1),
    'Test Broker',
    'TIERED',
    '0.0035 $ / Share',
    0.35
);

-- בדיקת UPDATE
UPDATE user_data.brokers_fees 
SET broker = 'Updated Broker'
WHERE broker = 'Test Broker';

-- בדיקת Soft Delete
UPDATE user_data.brokers_fees 
SET deleted_at = NOW()
WHERE broker = 'Updated Broker';

-- בדיקת SELECT (רק לא נמחקו)
SELECT COUNT(*) FROM user_data.brokers_fees WHERE deleted_at IS NULL;

-- ניקוי (cleanup)
DELETE FROM user_data.brokers_fees WHERE broker IN ('Test Broker', 'Updated Broker');
```

### **5. בדיקת Trigger**

```sql
-- בדיקת קיום trigger
SELECT 
    tgname,
    tgtype,
    tgenabled
FROM pg_trigger
WHERE tgrelid = 'user_data.brokers_fees'::regclass
AND tgname = 'trigger_brokers_fees_updated_at';

-- בדיקת פעולת trigger (updated_at auto-update)
-- יצירת רשומה
INSERT INTO user_data.brokers_fees (user_id, broker, commission_type, commission_value, minimum)
VALUES (
    (SELECT id FROM user_data.users LIMIT 1),
    'Trigger Test',
    'FLAT',
    '$0.00',
    0.00
) RETURNING id, updated_at;

-- המתנה 2 שניות
SELECT pg_sleep(2);

-- עדכון (צריך לעדכן updated_at)
UPDATE user_data.brokers_fees 
SET broker = 'Trigger Test Updated'
WHERE broker = 'Trigger Test'
RETURNING id, updated_at;

-- ניקוי
DELETE FROM user_data.brokers_fees WHERE broker = 'Trigger Test Updated';
```

---

## ⚠️ Impact & Dependencies

### **Impact על Backend:**

**לפני יצירת טבלה:** 🔴 **BLOCKED**
- Service ו-Router לא יכולים לפעול
- כל ה-endpoints יחזירו `500 Internal Server Error`
- Frontend לא יכול לטעון נתונים

**אחרי יצירת טבלה:** ✅ **OPERATIONAL**
- כל ה-endpoints יחזירו `200 OK`
- CRUD operations יעבדו במלואם
- Frontend יכול לטעון ולעדכן נתונים

### **Dependencies:**

**טבלאות נדרשות (קיימות):**
- ✅ `user_data.users` - קיימת (לצורך FK `user_id`)

**Schemas נדרשות:**
- ✅ `user_data` - קיים

**ENUM Types:**
- 🔴 `user_data.commission_type` - צריך ליצור

---

## 🎯 Next Steps

### **לאחר יצירת הטבלה:**

1. ⚠️ **Team 60:** הודעה ל-Team 20 על השלמה
2. ✅ **Team 20:** בדיקת endpoints (GET/POST/PUT/DELETE)
3. ✅ **Team 20:** בדיקת פילטרים (broker, commission_type, search)
4. ✅ **Team 20:** בדיקת Soft Delete
5. ✅ **Team 30:** אינטגרציה Frontend

---

## 📞 תקשורת

### **לאחר יצירת הטבלה, נא להודיע ל-Team 20:**

**פורמט הודעה:**
- 📧 `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_20_D18_TABLE_CREATED.md`
- 📋 **תוכן נדרש:**
  - אישור יצירת טבלה
  - אישור יצירת אינדקסים
  - אישור הרשאות
  - תוצאות בדיקות אימות
  - כל הערות או שינויים שבוצעו

---

## 🔗 קישורים רלוונטיים

### **מסמכי Team 20:**
- **Field Map:** `_COMMUNICATION/team_20/WP_20_09_FIELD_MAP_BROKERS_FEES.md`
- **Progress Report:** `_COMMUNICATION/team_20/TEAM_20_PHASE_2_D18_PROGRESS_REPORT.md`
- **Model:** `api/models/brokers_fees.py`
- **Schema:** `api/schemas/brokers_fees.py`

### **מנדטים:**
- **מנדט Phase 2:** `_COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_PHASE_2_EXECUTION_D18_D21.md`
- **Implementation Plan:** `documentation/01-ARCHITECTURE/TT2_PHASE_2_IMPLEMENTATION_PLAN.md`

### **דוגמאות קודמות:**
- **D16 Table Creation:** `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_20_D16_TABLES_CREATED.md`
- **D16 Permissions:** `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_60_D16_TABLES_PERMISSIONS_MISSING.md`

---

## 📝 הערות טכניות

### **1. ENUM vs VARCHAR:**
- **החלטה:** שימוש ב-ENUM type (`user_data.commission_type`)
- **סיבה:** אכיפת ערכים תקינים ברמת DB
- **חלופה:** אם ENUM לא מתאים, ניתן להשתמש ב-VARCHAR עם CHECK constraint

### **2. NUMERIC Precision:**
- **החלטה:** `NUMERIC(20, 8)` עבור `minimum`
- **סיבה:** דיוק גבוה לסכומי כסף (20 ספרות כולל, 8 אחרי הנקודה)
- **תואם:** סטנדרט `Decimal(20,8)` של הפרויקט

### **3. Soft Delete:**
- **החלטה:** שימוש ב-`deleted_at` (Soft Delete)
- **סיבה:** שמירת היסטוריה ומניעת אובדן נתונים
- **אינדקס:** Partial index (`WHERE deleted_at IS NULL`) לאופטימיזציה

### **4. Trigger for updated_at:**
- **החלטה:** Trigger אוטומטי לעדכון `updated_at`
- **סיבה:** הבטחת עדכון עקבי ללא תלות בקוד האפליקציה

---

**Prepared by:** Team 20 (Backend Implementation)  
**Date:** 2026-01-31  
**Session:** Phase 2.1 - Brokers Fees (D18)  
**Status:** 🔴 **CRITICAL BLOCKER - AWAITING DB TABLE CREATION**

**log_entry | [Team 20] | D18 | DB_TABLE_REQUEST | CRITICAL | RED | 2026-01-31**
