#!/bin/bash
# ============================================
# TikTrack - Add Polling System to HTML Files
# ============================================
# 
# מטרה: הוספת polling-manager.js ו-localstorage-sync.js לכל HTML
# שימוש: ./build-tools/add-polling-to-htmls.sh
# 
# תאריך: 13 ינואר 2025
# גרסה: 1.0
# ============================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}🔄 Adding Polling System to HTML Files${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Get current build version
if [ -f ".build-version" ]; then
    BUILD_VERSION=$(cat .build-version)
    echo -e "${GREEN}✅ Using build version: ${BUILD_VERSION}${NC}"
else
    BUILD_VERSION="dev"
    echo -e "${YELLOW}⚠️  No .build-version found, using: ${BUILD_VERSION}${NC}"
fi

echo ""

PROCESSED=0

# Process HTML files that have cache-module.js
find trading-ui -name "*.html" -type f | while read file; do
    if grep -q "cache-module\.js" "$file"; then
        # Check if already has polling-manager
        if grep -q "polling-manager\.js" "$file"; then
            echo -e "${YELLOW}⏭️  Skipping (already has polling): ${file}${NC}"
            continue
        fi
        
        echo -e "${BLUE}📝 Processing: ${file}${NC}"
        
        # Backup
        cp "$file" "$file.bak"
        
        # Add polling and localStorage scripts BEFORE cache-module.js
        awk -v version="$BUILD_VERSION" '
        /cache-module\.js/ && !done {
            print "    "
            print "    <!-- Polling System for Cache Auto-Invalidation (Option B-Lite) -->"
            print "    <script src=\"scripts/modules/polling-manager.js?v=" version "\"></script>"
            print "    <script src=\"scripts/modules/localstorage-sync.js?v=" version "\"></script>"
            print "    "
            done=1
        }
        { print }
        ' "$file.bak" > "$file"
        
        rm "$file.bak"
        echo -e "${GREEN}   ✅ Added polling system${NC}"
        PROCESSED=$((PROCESSED + 1))
    fi
done

echo ""
echo -e "${GREEN}✅ Complete!${NC}"
echo -e "${GREEN}   Files processed: ${PROCESSED}${NC}"
echo ""

