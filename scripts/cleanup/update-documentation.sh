#!/bin/bash

# סקריפט לעדכון אוטומטי של דוקומנטציה
# Usage: ./update-documentation.sh [removed_functions_file]

set -e

DOC_DIR="documentation"
REPORTS_DIR="documentation/05-REPORTS"
REMOVED_FUNCTIONS_FILE="$1"

if [ -z "$REMOVED_FUNCTIONS_FILE" ]; then
    REMOVED_FUNCTIONS_FILE="documentation/05-REPORTS/CODE_CLEANUP_WORK_LOG.md"
fi

echo "📚 Updating documentation for removed functions"
echo "=============================================="

if [ ! -f "$REMOVED_FUNCTIONS_FILE" ]; then
    echo "⚠️  Warning: Removed functions log not found: $REMOVED_FUNCTIONS_FILE"
    echo "   Continuing with manual scan..."
fi

# רשימת קבצי דוקומנטציה לעדכון
DOC_FILES=(
    "documentation/frontend/GENERAL_SYSTEMS_LIST.md"
    "trading-ui/scripts/init-system/package-manifest.js"
    "documentation/INDEX.md"
)

# חיפוש קבצי SPEC/API
SPEC_FILES=$(find "$DOC_DIR" -type f -name "*.md" | grep -iE "(spec|api|guide|system)" || true)

echo ""
echo "📋 Files to check:"
for file in "${DOC_FILES[@]}" $SPEC_FILES; do
    if [ -f "$file" ]; then
        echo "  • $file"
    fi
done

echo ""
echo "🔍 Scanning for function references..."

# אם יש קובץ עם רשימת פונקציות שהוסרו, קרא אותו
if [ -f "$REMOVED_FUNCTIONS_FILE" ]; then
    REMOVED_FUNCTIONS=$(grep -oE "function\s+\w+|^\s*\*\s*\w+\s*\(" "$REMOVED_FUNCTIONS_FILE" | sed 's/function\s*//;s/.*\*\s*\([^(]*\)(.*/\1/' | sort -u)
    
    if [ -n "$REMOVED_FUNCTIONS" ]; then
        echo ""
        echo "📝 Found removed functions to check:"
        echo "$REMOVED_FUNCTIONS" | head -10
        
        for doc_file in "${DOC_FILES[@]}" $SPEC_FILES; do
            if [ -f "$doc_file" ]; then
                echo ""
                echo "Checking: $doc_file"
                for func in $REMOVED_FUNCTIONS; do
                    if grep -q "$func" "$doc_file" 2>/dev/null; then
                        echo "  ⚠️  Found reference to removed function: $func"
                    fi
                done
            fi
        done
    fi
else
    echo "⚠️  No removed functions file found - manual review required"
fi

echo ""
echo "=============================================="
echo "✅ Documentation scan completed"
echo ""
echo "📋 Next steps:"
echo "   1. Review flagged references manually"
echo "   2. Update documentation files as needed"
echo "   3. Remove or update function references"
echo "   4. Update examples and code snippets"

