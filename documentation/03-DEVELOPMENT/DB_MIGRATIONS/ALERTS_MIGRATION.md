# Alerts Table Migration - TikTrack

**Date:** January 1, 2026
**Version:** 1.0
**Migration ID:** alerts_table_schema_update

---

## 📋 Overview

Historical documentation of the alerts table migration process. This migration updated the alerts table schema to include new relationship fields and improved condition handling.

## 🔄 Migration Details

### Before Migration

```sql
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100),
    ticker_id INTEGER REFERENCES tickers(id),
    condition_type VARCHAR(50),
    condition_value FLOAT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### After Migration

```sql
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    ticker_id INTEGER REFERENCES tickers(id),
    message VARCHAR(5000),
    triggered_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'open',
    is_triggered VARCHAR(20) DEFAULT 'false',
    related_type_id INTEGER REFERENCES note_relation_types(id) DEFAULT 4,
    related_id INTEGER,
    condition_attribute VARCHAR(50) DEFAULT 'price',
    condition_operator VARCHAR(50) DEFAULT 'more_than',
    condition_number VARCHAR(20) DEFAULT '0',
    plan_condition_id INTEGER REFERENCES plan_conditions(id),
    trade_condition_id INTEGER REFERENCES trade_conditions(id),
    expiry_date VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📊 Schema Changes

### Added Fields

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| message | VARCHAR(5000) | NULL | Alert message/description |
| triggered_at | TIMESTAMP | NULL | When alert was triggered |
| status | VARCHAR(20) | 'open' | Alert status (open/closed/cancelled) |
| is_triggered | VARCHAR(20) | 'false' | Trigger state (false/new/true) |
| related_type_id | INTEGER | 4 | Polymorphic relationship type |
| related_id | INTEGER | NULL | Polymorphic relationship ID |
| condition_attribute | VARCHAR(50) | 'price' | What to monitor (price/change/ma/volume/balance) |
| condition_operator | VARCHAR(50) | 'more_than' | Comparison operator |
| condition_number | VARCHAR(20) | '0' | Threshold value |
| plan_condition_id | INTEGER | NULL | Link to plan conditions |
| trade_condition_id | INTEGER | NULL | Link to trade conditions |
| expiry_date | VARCHAR(10) | NULL | Alert expiration date |

### Modified Fields

- `condition_type` → `condition_attribute` (renamed for clarity)
- `condition_value` → `condition_number` (changed to VARCHAR for flexibility)
- Added NOT NULL constraints to required fields
- Added foreign key relationships for polymorphic associations

## 🔄 Migration Steps

### 1. Data Backup

```sql
-- Create backup table
CREATE TABLE alerts_backup_20250101 AS
SELECT * FROM alerts;
```

### 2. Schema Migration

```sql
-- Add new columns
ALTER TABLE alerts ADD COLUMN message VARCHAR(5000);
ALTER TABLE alerts ADD COLUMN triggered_at TIMESTAMP;
ALTER TABLE alerts ADD COLUMN status VARCHAR(20) DEFAULT 'open';
ALTER TABLE alerts ADD COLUMN is_triggered VARCHAR(20) DEFAULT 'false';
ALTER TABLE alerts ADD COLUMN related_type_id INTEGER DEFAULT 4;
ALTER TABLE alerts ADD COLUMN related_id INTEGER;
ALTER TABLE alerts ADD COLUMN condition_attribute VARCHAR(50) DEFAULT 'price';
ALTER TABLE alerts ADD COLUMN condition_operator VARCHAR(50) DEFAULT 'more_than';
ALTER TABLE alerts ADD COLUMN condition_number VARCHAR(20) DEFAULT '0';
ALTER TABLE alerts ADD COLUMN plan_condition_id INTEGER;
ALTER TABLE alerts ADD COLUMN trade_condition_id INTEGER;
ALTER TABLE alerts ADD COLUMN expiry_date VARCHAR(10);

-- Rename columns
ALTER TABLE alerts RENAME COLUMN condition_type TO condition_attribute_old;
ALTER TABLE alerts RENAME COLUMN condition_value TO condition_number_old;

-- Migrate data
UPDATE alerts SET
    condition_attribute = COALESCE(condition_attribute_old, 'price'),
    condition_number = COALESCE(CAST(condition_number_old AS VARCHAR), '0');

-- Drop old columns
ALTER TABLE alerts DROP COLUMN condition_attribute_old;
ALTER TABLE alerts DROP COLUMN condition_number_old;

-- Add constraints
ALTER TABLE alerts ALTER COLUMN name SET NOT NULL;
ALTER TABLE alerts ALTER COLUMN condition_attribute SET NOT NULL;
ALTER TABLE alerts ALTER COLUMN condition_operator SET NOT NULL;
ALTER TABLE alerts ALTER COLUMN condition_number SET NOT NULL;
ALTER TABLE alerts ALTER COLUMN related_type_id SET NOT NULL;

-- Add foreign keys
ALTER TABLE alerts ADD CONSTRAINT fk_alerts_related_type
    FOREIGN KEY (related_type_id) REFERENCES note_relation_types(id);
ALTER TABLE alerts ADD CONSTRAINT fk_alerts_plan_condition
    FOREIGN KEY (plan_condition_id) REFERENCES plan_conditions(id);
ALTER TABLE alerts ADD CONSTRAINT fk_alerts_trade_condition
    FOREIGN KEY (trade_condition_id) REFERENCES trade_conditions(id);
```

### 3. Data Validation

```sql
-- Validate migration
SELECT
    COUNT(*) as total_alerts,
    COUNT(CASE WHEN condition_attribute IS NOT NULL THEN 1 END) as valid_attributes,
    COUNT(CASE WHEN condition_operator IS NOT NULL THEN 1 END) as valid_operators
FROM alerts;
```

### 4. Rollback Plan

```sql
-- Rollback procedure
DROP TABLE IF EXISTS alerts;
ALTER TABLE alerts_backup_20250101 RENAME TO alerts;
```

## ✅ Testing Results

### Pre-Migration Tests

- ✅ Schema backup created successfully
- ✅ 0 data integrity issues found
- ✅ All foreign key constraints valid

### Post-Migration Tests

- ✅ Schema migration completed without errors
- ✅ All new columns populated with defaults
- ✅ Foreign key constraints established
- ✅ Application functionality verified

### Data Integrity Checks

- ✅ Row count maintained: 0 rows affected
- ✅ No orphaned records created
- ✅ Default values applied correctly

## 📚 Related Documentation

- **[Database Architecture](../../02-ARCHITECTURE/BACKEND/DATABASE_ARCHITECTURE.md)** - Current schema overview
- **[DB Constraints Implementation](../../02-ARCHITECTURE/BACKEND/DB_CONSTRAINTS_IMPLEMENTATION.md)** - Complete constraint specifications
- **[Migration Guidelines](../../GUIDELINES/DATABASE_MIGRATION_GUIDELINES.md)** - Migration best practices

---

**Migration Date:** January 1, 2026
**Execution Time:** < 5 minutes
**Downtime:** None (zero-downtime migration)
**Rollback Tested:** ✅ Available
