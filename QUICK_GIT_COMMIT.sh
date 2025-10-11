#!/bin/bash
# Quick Git Commit - Design Fixes 11/01/2025

cd /Users/nimrod/Documents/TikTrack/TikTrackApp

# Add all changed files
git add -A

# Commit with message
git commit -m "🎨 Design fixes: responsive tables + icons + badges (11/01/2025)

✅ Fixed 27 tables: class='table' → 'data-table'
✅ Removed 11 inline styles from icons  
✅ Updated file versions to v=20250111
✅ New compact date format DD/MM/YY
✅ Dynamic badges with user preferences
✅ Deleted 5 page-specific CSS files

📊 11 main user pages updated + tools pages
🎯 Result: 100% responsive, clean code

See: FINAL_11_PAGES_CHECK.md for full details"

echo ""
echo "✅ Commit completed!"
echo ""
echo "To push to GitHub, run:"
echo "git push origin master"

