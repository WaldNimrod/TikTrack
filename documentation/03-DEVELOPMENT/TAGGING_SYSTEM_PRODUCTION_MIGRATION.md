# Tagging System – Production Deployment Manual

## 1. Scope
Operational checklist for deploying the Tagging System to the TikTrack production environment. Use alongside `TAGGING_SYSTEM_MIGRATION_GUIDE.md` for technical details.

---

## 2. Roles & Responsibilities
- **Release Engineer:** orchestrates deployment, executes migration commands.
- **Backend Lead:** monitors server logs, validates API responses.
- **QA Lead:** runs smoke tests and validates UI functionality.
- **DevOps Support:** on standby for infrastructure issues.

---

## 3. Timeline
| Phase | Duration | Owner | Notes |
| --- | --- | --- | --- |
| Preparation | 1 day before | Release Engineer | Backups, staging rehearsal |
| Deployment Window | 30 min | Release Engineer | Low traffic slot (Sunday 06:00 UTC) |
| Validation | 30 min | QA Lead | Smoke tests & analytics checks |
| Monitoring | 24 h | Backend Lead | Watch logs, performance dashboards |

---

## 4. Pre-Deployment Tasks
1. ✅ Merge `main` ➜ `production`.
2. ✅ Run `./scripts/sync_to_production.py --dry-run`.
3. ✅ Confirm DB backup exists (`tiktrack.db`).
4. ✅ Ensure tagging documentation updated (spec, developer, migration).
5. ✅ Prepare rollback instructions and credentials.

---

## 5. Deployment Steps
1. **Stop Background Jobs (if any):**
   ```bash
   tasks:run "TT: Server Management - Stop Background Tasks"
   ```
2. **Sync Code:**
   ```bash
   ./scripts/sync_to_production.py
   ```
3. **Run Migration:**
   ```bash
   source venv/bin/activate
   export FLASK_ENV=production
   alembic upgrade head
   ```
4. **Restart Backend:**
   ```bash
   ./start_server.sh
   ```
5. **Execute Smoke Tests:**
   ```bash
   pytest tests/backend/test_tag_service.py -q
   python scripts/tagging/smoke_test.py --env production
   ```
6. **Front-End Validation:**
   - Login as admin.
   - Navigate to Tag Management (menu > after Preferences).
   - Create sample category & tag, assign to trade, verify filter.
7. **Cache Refresh:**
   - Run `TT: Cache Management - Clear Full Cache`.
   - Confirm reload completes with no errors.

---

## 6. Post-Deployment Monitoring
- Review `Backend/logs/app.log` for WARN/ERROR.
- Monitor performance metrics (CPU, memory) for 24h.
- Check analytics dashboard to confirm tag usage counters increase.
- Log deployment summary in `documentation/production/VERSION_HISTORY.md`.

---

## 7. Rollback Instructions
1. Stop server (`Ctrl+C` in running session).
2. Restore backup:
   ```bash
   scripts/backup/restore_database.py --label tagging-pre
   ```
3. Downgrade migration (`alembic downgrade -1`).
4. Re-sync previous commit (`git checkout <last-stable>` & rerun sync script).
5. Restart server and verify smoke tests fail (as expected without tagging).
6. Notify stakeholders & document incident.

---

## 8. Communication Plan
- Pre-deployment message 24h prior (email + Slack).
- Live updates in #release channel during window.
- Post-deployment summary with validation results and follow-up tasks.

---

Prepared for Production Team – November 2025





