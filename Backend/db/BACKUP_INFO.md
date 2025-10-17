# Database Backup Information

## Current Database
- **File**: `simpleTrade_new.db`
- **Size**: 30,846,976 bytes (as of September 25, 2025)
- **Last Modified**: September 25, 2025 23:28
- **Integrity**: ✅ Verified (PRAGMA integrity_check = "ok")
- **Mode**: WAL (Write-Ahead Logging)

## Backup Files
1. **simpleTrade_new_backup_20250925_233733.db**
   - Created: September 25, 2025 23:37
   - Size: 30,846,976 bytes
   - Purpose: Pre-version 2.1.0 standardization backup
   - Status: ✅ Current and verified

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

## Database Statistics
- **Total Tables**: 21 tables
- **Main Data Tables**: 7 tables with 71 records
- **System Tables**: 14 tables for configuration and management
- **WAL File Size**: 2.1 MB (active transactions)
- **SHM File Size**: 32 KB (shared memory)

---
**Last Updated**: September 25, 2025  
**Backup Count**: 1 file (current)
**Version**: 2.1.0 compatible
