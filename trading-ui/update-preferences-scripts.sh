#!/bin/bash

# Script to update all HTML files with new preferences scripts
# This script replaces old preferences scripts with new ones

echo "🔄 Updating preferences scripts in all HTML files..."

# List of files to update (excluding backups)
files=(
    "trading-ui/alerts.html"
    "trading-ui/background-tasks.html"
    "trading-ui/cash_flows.html"
    "trading-ui/db_display.html"
    "trading-ui/db_extradata.html"
    "trading-ui/executions.html"
    "trading-ui/init-system-management.html"
    "trading-ui/notes.html"
    "trading-ui/tickers.html"
    "trading-ui/trading_accounts.html"
)

# Update each file
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "📝 Updating $file..."
        
        # Replace old preferences scripts with new ones
        sed -i.bak 's|scripts/preferences-core\.js|scripts/preferences-core.js|g' "$file"
        sed -i.bak 's|scripts/preferences\.js|scripts/preferences-colors.js|g' "$file"
        
        # Add the new scripts after the first one
        sed -i.bak '/scripts\/preferences-core-new\.js/a\
    <script src="scripts/preferences-lazy-loader.js?v=1.0.0"></script> <!-- lazy loading -->\
    <script src="scripts/preferences-validation.js?v=1.0.0"></script> <!-- validation -->\
    <script src="scripts/preferences-ui.js?v=1.0.0"></script> <!-- ממשק משתמש -->' "$file"
        
        echo "✅ Updated $file"
    else
        echo "⚠️  File not found: $file"
    fi
done

echo "🎉 All files updated successfully!"
echo "📋 Summary:"
echo "  - Replaced preferences-core.js with preferences-core.js"
echo "  - Replaced preferences.js with preferences-colors.js"
echo "  - Added preferences-lazy-loader.js"
echo "  - Added preferences-validation.js"
echo "  - Added preferences-ui.js"

