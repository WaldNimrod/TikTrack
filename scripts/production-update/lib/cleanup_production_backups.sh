#!/bin/bash
# Cleanup Backup Files in Production
# ==================================
# Removes backup files from production environment

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
PRODUCTION_DIR="$PROJECT_ROOT/production"

echo "=" * 70
echo "Production Backup Files Cleanup"
echo "=" * 70
echo ""

if [ ! -d "$PRODUCTION_DIR" ]; then
    echo "❌ Production directory not found: $PRODUCTION_DIR"
    exit 1
fi

removed_count=0

# Remove backup files
echo "🗑️  Removing backup files..."
find "$PRODUCTION_DIR" -type f \( -name "*.backup" -o -name "*.bak" -o -name "*backup*" -o -name "*old*" \) | while read -r file; do
    echo "  ✅ Removing: ${file#$PRODUCTION_DIR/}"
    rm -f "$file"
    ((removed_count++)) || true
done

# Remove backup directories
echo ""
echo "🗑️  Removing backup directories..."
find "$PRODUCTION_DIR" -type d \( -name "*backup*" -o -name "*old*" \) | while read -r dir; do
    if [ -d "$dir" ]; then
        echo "  ✅ Removing: ${dir#$PRODUCTION_DIR/}"
        rm -rf "$dir"
        ((removed_count++)) || true
    fi
done

echo ""
echo "=" * 70
echo "✅ Cleanup complete"
echo "=" * 70
echo "Removed: $removed_count items"
echo ""

