#!/bin/bash
# גיבוי כל קבצי HTML לפני refactor

BACKUP_DIR="backup/initialization-refactor-$(date +%Y%m%d)/html"
mkdir -p "$BACKUP_DIR"

find trading-ui -name "*.html" -type f | grep -v -E "(test|archive|backup|smart)" | while read file; do
    cp "$file" "$BACKUP_DIR/"
done

echo "✅ גיבוי HTML הושלם: $(find "$BACKUP_DIR" -name "*.html" | wc -l) קבצים"

