# MIGRATIONS AND DATA CORRECTIONS
**project_domain:** TIKTRACK
**id:** S002_P003_WP002_GATE7_REMEDIATION_MIGRATIONS_AND_DATA_CORRECTIONS_v1.0.0
**from:** Team 90
**to:** Team 10
**date:** 2026-03-04
**status:** LOCKED
**work_package_id:** S002-P003-WP002

---

## Required schema migrations

### 1. Alerts datetime linkage

```sql
ALTER TABLE user_data.alerts
ADD COLUMN target_datetime TIMESTAMPTZ NULL;
```

### 2. Notes datetime linkage

```sql
ALTER TABLE user_data.notes
ADD COLUMN parent_datetime TIMESTAMPTZ NULL;
```

---

## Required data correction

### 3. Remove legacy general-linked alerts

```sql
UPDATE user_data.alerts
SET target_type = NULL, target_id = NULL
WHERE target_type = 'general';
```

---

## Required application-level validation changes

1. Alerts `target_type` allowlist:
   - `ticker`
   - `trade`
   - `trade_plan`
   - `account`
   - `datetime`
   - `NULL`
2. Remove `general` from backend validation and frontend selectors.
3. Notes `parent_type` allowlist:
   - `ticker`
   - `trade`
   - `trade_plan`
   - `account`
   - `datetime`
   - `NULL`
4. If type is `datetime`, the matching datetime field is required.
5. If type is entity-based, the matching entity ID is required.
6. Mixed state is invalid:
   - datetime type + entity ID
   - entity type + datetime value

---

## Required status-value correction

Alert `trigger_status` accepted values must include:
- `untriggered`
- `triggered_unread`
- `triggered_read`
- `rearmed`

No database enum migration is required for this change in the current model.

---

## Proof requirement

Team 10 must provide migration execution evidence and data-state verification evidence in the post-implementation QA handover.

---

**log_entry | TEAM_90 | EXECUTION_MIGRATIONS_AND_DATA_CORRECTIONS | S002_P003_WP002 | LOCKED | 2026-03-04**
