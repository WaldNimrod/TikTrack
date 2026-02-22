# Data Migration Plan: brokers_fees → trading_account_fees (ADR-014/ADR-017)
**project_domain:** TIKTRACK

**מקור:** BATCH_2_5_COMPLETIONS_MANDATE.md (ADR-017 §2), ARCHITECT_PHASE_2_DATA_MODEL_PIVOT_VERDICT.md (ADR-014)  
**תאריך:** 2026-02-13  
**אחריות:** Team 20 (תכנון) + Team 60 (ביצוע DDL)

---

## 1. מצב נוכחי

- **טבלה:** `user_data.brokers_fees`
- **מפתח זר:** `trading_account_id` (קיים — ADR-015)
- **מבנה:** user_id, trading_account_id, commission_type, commission_value, minimum, timestamps

---

## 2. היעד

- **טבלה חדשה/מעודכנת:** `user_data.trading_account_fees`
- **אותו מבנה** — רק שינוי שם טבלה
- **חובת עמודת:** trading_account_id (קיים)

---

## 3. תוכנית מיגרציה

### שלב 1: יצירת טבלה חדשה (Team 60)

```sql
-- scripts/migrations/rename_brokers_fees_to_trading_account_fees.sql
-- ADR-014 / ADR-017

-- Create new table with same structure
CREATE TABLE IF NOT EXISTS user_data.trading_account_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    trading_account_id UUID NOT NULL REFERENCES user_data.trading_accounts(id) ON DELETE CASCADE,
    commission_type user_data.commission_type NOT NULL,
    commission_value NUMERIC(20,6) NOT NULL,
    minimum NUMERIC(20,6) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_trading_account_fees_user_id ON user_data.trading_account_fees(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_account_fees_trading_account_id ON user_data.trading_account_fees(trading_account_id);
CREATE INDEX IF NOT EXISTS idx_trading_account_fees_deleted_at ON user_data.trading_account_fees(deleted_at);

-- Migrate data
INSERT INTO user_data.trading_account_fees
    (id, user_id, trading_account_id, commission_type, commission_value, minimum, created_at, updated_at, deleted_at)
SELECT id, user_id, trading_account_id, commission_type, commission_value, minimum, created_at, updated_at, deleted_at
FROM user_data.brokers_fees;

-- Rename old table (backup)
ALTER TABLE user_data.brokers_fees RENAME TO brokers_fees_deprecated_20260213;

-- Rename new table to final name (if created as temp)
-- OR: DROP brokers_fees after verification, keep trading_account_fees
```

### שלב 2: עדכון Backend (Team 20)

לאחר אישור מיגרציה:

- `api/models/brokers_fees.py` → `api/models/trading_account_fees.py` (__tablename__ = "trading_account_fees")
- `api/routers/brokers_fees.py` → עדכון prefix ל-`/trading_account_fees` או שמירת `/brokers_fees` כ-alias (תלות בהחלטת Product)
- `api/schemas/`, `api/services/` — עדכון imports והפניות

### שלב 3: תיאום Team 30

- עדכון routes.json ו-calls ל-endpoint חדש (אם משתנה)
- Frontend D18 — עדכון URLs

---

## 4. קריטריון הצלחה

- [ ] טבלת `user_data.trading_account_fees` קיימת
- [ ] נתונים הועתקו מ-`brokers_fees`
- [ ] עמלות לא תלויות ב-broker כ-FK (רק trading_account_id)
- [ ] Backend מפנה לטבלה החדשה
- [ ] דוח ביצוע ב-`_COMMUNICATION/team_60/`

---

## 5. תלות בצוותים

| צוות | פעולה |
|------|--------|
| **Team 60** | הרצת DDL, העתקת נתונים, אימות |
| **Team 20** | עדכון מודלים ו-routers לאחר מיגרציה |
| **Team 30** | עדכון Frontend (אם endpoint משתנה) |

---

**Team 20 (Backend)**  
**log_entry | TRADING_ACCOUNT_FEES_MIGRATION_PLAN | ADR-014 | 2026-02-13**
