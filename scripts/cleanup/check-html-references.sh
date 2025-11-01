#!/bin/bash

# סקריפט לבדיקת קריאות ב-HTML
# Usage: ./check-html-references.sh <function_name>

set -e

if [ -z "$1" ]; then
    echo "❌ Error: Function name required"
    echo "Usage: ./check-html-references.sh <function_name>"
    exit 1
fi

FUNCTION_NAME="$1"
HTML_DIR="trading-ui/pages"
SCRIPTS_DIR="trading-ui/scripts"

echo "🔍 Checking references to function: $FUNCTION_NAME"
echo "=================================================="

FOUND=0

# חיפוש ב-HTML
if [ -d "$HTML_DIR" ]; then
    echo ""
    echo "📄 HTML files:"
    HTML_MATCHES=$(grep -rn "$FUNCTION_NAME" "$HTML_DIR" 2>/dev/null || true)
    if [ -n "$HTML_MATCHES" ]; then
        echo "$HTML_MATCHES" | while IFS= read -r line; do
            echo "  ⚠️  $line"
            FOUND=$((FOUND + 1))
        done
    else
        echo "  ✅ No references found in HTML"
    fi
fi

# חיפוש ב-JavaScript (event listeners, וכו')
if [ -d "$SCRIPTS_DIR" ]; then
    echo ""
    echo "📄 JavaScript files (event listeners, dynamic calls):"
    
    # קריאות דרך addEventListener
    EVENT_MATCHES=$(grep -rn "addEventListener.*$FUNCTION_NAME\|$FUNCTION_NAME.*addEventListener" "$SCRIPTS_DIR" 2>/dev/null || true)
    if [ -n "$EVENT_MATCHES" ]; then
        echo "$EVENT_MATCHES" | while IFS= read -r line; do
            echo "  ⚠️  Event listener: $line"
            FOUND=$((FOUND + 1))
        done
    fi
    
    # קריאות דינמיות
    DYNAMIC_MATCHES=$(grep -rn "window\[.*$FUNCTION_NAME\|\[.*$FUNCTION_NAME" "$SCRIPTS_DIR" 2>/dev/null || true)
    if [ -n "$DYNAMIC_MATCHES" ]; then
        echo "$DYNAMIC_MATCHES" | while IFS= read -r line; do
            echo "  ⚠️  Dynamic call: $line"
            FOUND=$((FOUND + 1))
        done
    fi
    
    # קריאות דרך data attributes
    DATA_MATCHES=$(grep -rn "data-.*$FUNCTION_NAME" "$SCRIPTS_DIR" 2>/dev/null || true)
    if [ -n "$DATA_MATCHES" ]; then
        echo "$DATA_MATCHES" | while IFS= read -r line; do
            echo "  ⚠️  Data attribute: $line"
            FOUND=$((FOUND + 1))
        done
    fi
fi

echo ""
echo "=================================================="
if [ $FOUND -eq 0 ]; then
    echo "✅ Safe to remove: No HTML/event references found"
    exit 0
else
    echo "⚠️  Warning: Found $FOUND references - Review before removal"
    exit 1
fi

