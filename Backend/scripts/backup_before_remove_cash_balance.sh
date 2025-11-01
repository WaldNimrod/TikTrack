#!/bin/bash
# Backup script before removing cash_balance column
# Creates a timestamped backup of the database

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SOURCE_DB="Backend/db/simpleTrade_new.db"
BACKUP_DIR="Backend/db/backups"
BACKUP_FILE="${BACKUP_DIR}/simpleTrade_new_before_remove_cash_balance_${TIMESTAMP}.db"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Copy database file
if [ -f "$SOURCE_DB" ]; then
    cp "$SOURCE_DB" "$BACKUP_FILE"
    echo "✅ Backup created: $BACKUP_FILE"
    ls -lh "$BACKUP_FILE"
else
    echo "❌ Error: Source database not found: $SOURCE_DB"
    exit 1
fi

