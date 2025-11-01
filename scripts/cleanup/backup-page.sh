#!/bin/bash

# סקריפט לגיבוי קובץ בודד לפני עריכה
# Usage: ./backup-page.sh <file_path>

set -e

if [ -z "$1" ]; then
    echo "❌ Error: File path required"
    echo "Usage: ./backup-page.sh <file_path>"
    exit 1
fi

FILE_PATH="$1"
FILE_NAME=$(basename "$FILE_PATH")
BACKUP_DIR="../TikTrackBackups/file-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${FILE_NAME}.backup.${TIMESTAMP}"

# יצירת תיקיית גיבויים אם לא קיימת
mkdir -p "$BACKUP_DIR"

# בדיקה שהקובץ קיים
if [ ! -f "$FILE_PATH" ]; then
    echo "❌ Error: File not found: $FILE_PATH"
    exit 1
fi

# יצירת גיבוי
cp "$FILE_PATH" "$BACKUP_FILE"

echo "✅ Backup created: $BACKUP_FILE"
echo "   Original: $FILE_PATH"
echo "   Size: $(du -h "$BACKUP_FILE" | cut -f1)"

# הוספת לגיט כגיבוי נוסף
git add "$FILE_PATH" 2>/dev/null || true

echo "✅ File staged for git backup"

