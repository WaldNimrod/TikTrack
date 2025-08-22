# TikTrack Backups

This directory contains backup files for the TikTrack project.

## Directory Structure

```
backups/
├── README.md                    # This file
└── database/                    # Database backups
    └── simpleTrade_new_backup_YYYYMMDD_HHMMSS.db
```

## Database Backups

### Backup Files
- **Location:** `backups/database/`
- **Format:** `simpleTrade_new_backup_YYYYMMDD_HHMMSS.db`
- **Size:** ~110KB per backup
- **Content:** Complete SQLite database with all tables and data

### Backup Schedule
- **Automatic:** Created before major changes
- **Manual:** Created on demand for safety
- **Retention:** Keep last 5 backups

### Restore Instructions
To restore a database backup:

1. **Stop the application** if running
2. **Backup current database** (if needed):
   ```bash
   cp Backend/db/simpleTrade_new.db Backend/db/simpleTrade_new_current_backup.db
   ```
3. **Restore from backup**:
   ```bash
   cp backups/database/simpleTrade_new_backup_YYYYMMDD_HHMMSS.db Backend/db/simpleTrade_new.db
   ```
4. **Restart the application**

### Database Schema
The database contains the following main tables:
- `accounts` - Account information
- `trades` - Trade records
- `tickers` - Stock ticker information
- `alerts` - Alert configurations
- `cash_flows` - Cash flow records
- `currencies` - Currency information
- `notes` - User notes
- `executions` - Trade executions
- `trade_plans` - Trading plans

## Backup History

### Latest Backup
- **Date:** August 23, 2025
- **Time:** 01:23:14
- **Reason:** JavaScript organization and documentation update
- **Changes:** Complete refactoring of translation functions and documentation

### Previous Backups
- Check individual backup files for timestamps and details

## Important Notes

- **Never delete** backup files without verification
- **Test restores** in development environment first
- **Keep backups** in multiple locations for safety
- **Document changes** that trigger backups

---

**Last Updated:** August 23, 2025  
**Backup Count:** 1  
**Total Size:** ~110KB
