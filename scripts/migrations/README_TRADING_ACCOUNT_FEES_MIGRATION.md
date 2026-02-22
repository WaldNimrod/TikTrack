# Migration: brokers_fees → trading_account_fees (ADR-014, ADR-017)
**project_domain:** TIKTRACK

**Responsibility:** Team 60 (DevOps & Platform)  
**Plan:** `documentation/05-PROCEDURES/TEAM_20_TRADING_ACCOUNT_FEES_MIGRATION_PLAN.md`  
**Script:** `scripts/migrations/rename_brokers_fees_to_trading_account_fees.sql`

---

## 1. Prerequisites

- Full database backup before migration (mandatory)
- PostgreSQL container running (`tiktrack-postgres-dev`)
- Table `user_data.brokers_fees` exists (with `trading_account_id` per ADR-015)

---

## 2. Execution Order

1. **Backup:**
   ```bash
   make db-backup
   # or: python3 scripts/create_full_backup.py
   ```

2. **Run migration (as table owner):**
   ```bash
   docker exec -i tiktrack-postgres-dev psql -U tiktrack -d TikTrack-phoenix-db < scripts/migrations/rename_brokers_fees_to_trading_account_fees.sql
   ```

3. **Verify:**
   ```sql
   SELECT COUNT(*) FROM user_data.trading_account_fees;
   SELECT COUNT(*) FROM user_data.brokers_fees;
   -- Counts should match (data copied)
   ```

4. **Optional — rename old table (after Team 20 verification):**
   ```sql
   ALTER TABLE user_data.brokers_fees RENAME TO brokers_fees_deprecated_20260213;
   ```

---

## 3. Post-Migration

- **Team 20:** Update models/routers to use `trading_account_fees`
- **Team 30:** Update Frontend D18 if endpoint changes

---

**log_entry | TEAM_60 | TRADING_ACCOUNT_FEES_MIGRATION_README | ADR-014/017 | 2026-02-13**
