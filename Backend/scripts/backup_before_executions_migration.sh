#!/bin/bash
# Backup script before executions flexible association migration
# Created: 2025-10-14

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="Backend/db/backups"
DB_FILE="Backend/db/simpleTrade_new.db"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup the database
echo "🔄 Creating database backup..."
cp "$DB_FILE" "${BACKUP_DIR}/backup_before_executions_migration_${DATE}.db"

if [ $? -eq 0 ]; then
    echo "✅ Database backed up successfully to: ${BACKUP_DIR}/backup_before_executions_migration_${DATE}.db"
    
    # Calculate checksum
    CHECKSUM=$(md5 -q "${BACKUP_DIR}/backup_before_executions_migration_${DATE}.db" 2>/dev/null || md5sum "${BACKUP_DIR}/backup_before_executions_migration_${DATE}.db" | awk '{print $1}')
    echo "📋 Checksum: $CHECKSUM"
    
    # Get file size
    SIZE=$(ls -lh "${BACKUP_DIR}/backup_before_executions_migration_${DATE}.db" | awk '{print $5}')
    echo "📦 Size: $SIZE"
else
    echo "❌ Backup failed!"
    exit 1
fi

