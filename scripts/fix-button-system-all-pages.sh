#!/bin/bash

# Fix Button System - Add event-handler-manager.js to all HTML pages
# =================================================================
# 
# This script scans all HTML pages and adds event-handler-manager.js
# if it's missing, placing it before button-system-init.js
#
# Usage: ./scripts/fix-button-system-all-pages.sh

echo "🔧 Fixing button system in all HTML pages..."
echo ""

# Counter
fixed=0
already_ok=0
error=0

# Find all HTML files
for html_file in trading-ui/*.html; do
    # Skip backup files
    if [[ "$html_file" == *"backup"* ]]; then
        continue
    fi
    
    # Check if file exists
    if [ ! -f "$html_file" ]; then
        continue
    fi
    
    # Extract filename
    filename=$(basename "$html_file")
    
    # Check if already has event-handler-manager
    if grep -q "event-handler-manager\.js" "$html_file"; then
        echo "✅ $filename - Already has event-handler-manager.js"
        ((already_ok++))
        continue
    fi
    
    # Check if has button-icons or button-system-init
    if grep -qE "(button-icons\.js|button-system-init\.js)" "$html_file"; then
        echo "🔨 $filename - Adding event-handler-manager.js..."
        
        # Use sed to add event-handler-manager.js before button-system-init.js
        # or after button-icons.js if button-system-init.js doesn't exist
        
        # First, try to add before button-system-init.js
        if grep -q "button-system-init\.js" "$html_file"; then
            # macOS compatible sed
            sed -i.bak "s|<script src=\"scripts/button-system-init\.js|<script src=\"scripts/event-handler-manager.js?v=05b6de6f_20251025_005449\"></script> <!-- מערכת ניהול אירועים מרכזית --><!-- add_new_line --><script src=\"scripts/button-system-init.js|g" "$html_file"
        # If no button-system-init, add after button-icons
        elif grep -q "button-icons\.js" "$html_file"; then
            sed -i.bak "s|<script src=\"scripts/button-icons\.js|<script src=\"scripts/button-icons.js|g" "$html_file"
            sed -i.bak "s|button-icons\.js\(.*\)</script>|button-icons.js\1</script><!-- add_new_line --><script src=\"scripts/event-handler-manager.js?v=05b6de6f_20251025_005449\"></script> <!-- מערכת ניהול אירועים מרכזית -->|g" "$html_file"
        fi
        
        # Remove backup file
        rm -f "$html_file.bak"
        
        # Replace placeholder with actual newline
        sed -i.tmp 's|<!-- add_new_line -->|\
|g' "$html_file"
        rm -f "$html_file.tmp"
        
        if grep -q "event-handler-manager\.js" "$html_file"; then
            echo "   ✅ Successfully added to $filename"
            ((fixed++))
        else
            echo "   ❌ Failed to add to $filename"
            ((error++))
        fi
    else
        echo "⚠️  $filename - No button system detected, skipping"
    fi
done

echo ""
echo "📊 Summary:"
echo "   ✅ Fixed: $fixed files"
echo "   ✅ Already OK: $already_ok files"
echo "   ❌ Errors: $error files"
echo ""
echo "🎉 Done!"
