# Tagging System Migration Guide

## 1. Purpose
This guide describes the required database changes, verification checkpoints, and rollback strategy for introducing the Tagging System into TikTrack. Follow this sequence in **staging** before executing in **production**.

---

## 2. Migration Artifacts
- **Alembic Revision:** `2025xxxx_add_tag_tables.py`
- **Models:** `TagCategory`, `Tag`, `TagLink`
- **Seed Script (optional):** `scripts/tagging/seed_default_tags.py`
- **Verification Script:** `scripts/tagging/verify_tag_schema.py`

---

## 3. Pre-Migration Checklist
1. ✅ Confirm Git branch contains the new tagging backend.
2. ✅ Run automated backend tests locally (`pytest tests/backend/test_tag_service.py`).
3. ✅ Ensure no pending DB migrations (`alembic current` equals production head).
4. ✅ Take full SQLite backup (`scripts/backup/backup_database.py --label tagging-pre`).
5. ✅ Announce maintenance window to team (Slack #devops, minimum 30 minutes).

---

## 4. Migration Steps (Staging & Production)
### Step 1 – Schema Upgrade
```bash
source venv/bin/activate
export FLASK_ENV=production
alembic upgrade head
```
Expected output includes creation of `tag_categories`, `tags`, `tag_links` tables with indexes.

### Step 2 – Verification
```bash
python scripts/tagging/verify_tag_schema.py
```
The script checks:
- Table existence & column definitions.
- Indexes and unique constraints.
- Foreign-key relationships (category ➜ tag).

### Step 3 – Smoke Test
```bash
pytest tests/backend/test_tag_service.py -q
```
Confirms CRUD & assignment flows.

### Step 4 – Seed (Optional)
If default categories required:
```bash
python scripts/tagging/seed_default_tags.py --env production
```

### Step 5 – Cache Sync Check
Run `./start_server.sh --check-only` to ensure no conflicting server process, then restart service to load new models.

---

## 5. Post-Migration Validation
1. **API Health:** Curl `/api/tags/` and `/api/tags/suggestions`.
2. **Existing Entities:** Create & edit a trade with tags (staging UI).
3. **Cache Sync:** Clear cache via UI; ensure tag data persists after reload.
4. **Logs:** Tail backend logs for migration warnings/errors.

---

## 6. Rollback Procedure
If issues arise:
1. Stop server (`Ctrl+C` or `restart` CLI command).
2. Restore DB backup: `scripts/backup/restore_database.py --label tagging-pre`.
3. Downgrade migration: `alembic downgrade -1`.
4. Re-run verification script (expect failure for tag tables).
5. Document root cause and communicate to team with log snippets.

---

## 7. Production Notes
- Execute during off-peak hours.
- Keep release engineer and backend lead on call.
- After completion, update `documentation/production/VERSION_HISTORY.md` with migration details.
- Attach results of verification & smoke tests to release ticket.

---

Prepared by: TikTrack Engineering  
Date: November 2025  
Version: 1.0.0





