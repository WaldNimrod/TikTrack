# Database Backup Information

## Current Database
- **File**: `simpleTrade_new.db`
- **Size**: 151,552 bytes (as of August 23, 2025)
- **Last Modified**: August 23, 2025 04:58

## Backup Files
1. **simpleTrade_new_backup_20250823_012252.db**
   - Created: August 23, 2025 01:22
   - Size: 110,592 bytes
   - Purpose: Pre-constraint system backup

2. **simpleTrade_new_backup_20250823_045811.db**
   - Created: August 23, 2025 04:58
   - Size: 151,552 bytes
   - Purpose: Post-constraint system implementation backup

## Backup Strategy
- Database backups are stored locally in `Backend/db/`
- Backup files are excluded from git (via .gitignore)
- Manual backups should be created before major changes
- Backup naming convention: `simpleTrade_new_backup_YYYYMMDD_HHMMSS.db`

## Restore Instructions
To restore from a backup:
1. Stop the application server
2. Copy the backup file to `simpleTrade_new.db`
3. Restart the application server

## Important Notes
- Always create a backup before running migrations
- Test migrations on a copy of the database first
- Keep multiple backup versions for safety
- Consider automated backup scheduling for production

---
**Last Updated**: August 23, 2025  
**Backup Count**: 2 files
