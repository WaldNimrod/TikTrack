#!/bin/bash

# סקריפט לבדיקת תקינות אחרי מחיקת פונקציות
# Usage: ./verify-cleanup.sh <file_path> [function_names...]

set -e

FILE_PATH="$1"
shift
FUNCTION_NAMES=("$@")

if [ -z "$FILE_PATH" ]; then
    echo "❌ Error: File path required"
    echo "Usage: ./verify-cleanup.sh <file_path> [function_names...]"
    exit 1
fi

if [ ! -f "$FILE_PATH" ]; then
    echo "❌ Error: File not found: $FILE_PATH"
    exit 1
fi

CONTENT=$(cat "$FILE_PATH")
ERRORS=0
WARNINGS=0

echo "🔍 Verifying cleanup for: $FILE_PATH"
echo "======================================"

# בדיקה שכל הפונקציות אכן נמחקו
if [ ${#FUNCTION_NAMES[@]} -gt 0 ]; then
    echo ""
    echo "📋 Checking deleted functions:"
    for func in "${FUNCTION_NAMES[@]}"; do
        if echo "$CONTENT" | grep -q "function ${func}\|${func}\s*=\s*function\|${func}\s*:\s*function"; then
            echo "  ❌ Function '$func' still exists in file!"
            ERRORS=$((ERRORS + 1))
        else
            echo "  ✅ Function '$func' successfully removed"
        fi
    done
fi

# בדיקת syntax בסיסית (אם יש node)
if command -v node &> /dev/null; then
    echo ""
    echo "📋 Checking JavaScript syntax:"
    if node -c "$FILE_PATH" 2>/dev/null; then
        echo "  ✅ JavaScript syntax is valid"
    else
        echo "  ❌ JavaScript syntax errors found!"
        ERRORS=$((ERRORS + 1))
    fi
fi

# בדיקת קריאות לפונקציות שנמחקו ב-HTML
HTML_DIR="trading-ui/pages"
if [ -d "$HTML_DIR" ]; then
    echo ""
    echo "📋 Checking HTML references:"
    if [ ${#FUNCTION_NAMES[@]} -gt 0 ]; then
        for func in "${FUNCTION_NAMES[@]}"; do
            HTML_REFS=$(grep -r "$func" "$HTML_DIR" 2>/dev/null | wc -l | tr -d ' ')
            if [ "$HTML_REFS" -gt 0 ]; then
                echo "  ⚠️  Found $HTML_REFS references to '$func' in HTML files!"
                WARNINGS=$((WARNINGS + 1))
            fi
        done
    fi
fi

# סיכום
echo ""
echo "======================================"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ Verification passed - No issues found"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Verification passed with $WARNINGS warnings"
    exit 0
else
    echo "❌ Verification failed - $ERRORS errors, $WARNINGS warnings"
    exit 1
fi

