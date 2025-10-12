#!/bin/bash
# ============================================
# TikTrack Cache Busting Script
# ============================================
# 
# מטרה: יצירת hash מ-git commit ועדכון כל קבצי HTML
# שימוש: ./build-tools/cache-buster.sh
# 
# תאריך: 13 ינואר 2025
# גרסה: 1.0
# ============================================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}🔨 TikTrack Cache Busting Script${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Generate build version from git
echo -e "${BLUE}📝 Generating build version...${NC}"

# Get git commit hash (short)
if command -v git &> /dev/null && git rev-parse --is-inside-work-tree &> /dev/null 2>&1; then
    BUILD_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "dev")
    echo -e "${GREEN}   ✅ Git hash: ${BUILD_HASH}${NC}"
else
    BUILD_HASH="dev"
    echo -e "${YELLOW}   ⚠️  Git not available, using: ${BUILD_HASH}${NC}"
fi

# Get current date and time
BUILD_DATE=$(date +%Y%m%d_%H%M%S)
echo -e "${GREEN}   ✅ Build date: ${BUILD_DATE}${NC}"

# Combine to full version
BUILD_VERSION="${BUILD_HASH}_${BUILD_DATE}"
echo -e "${GREEN}   ✅ Full version: ${BUILD_VERSION}${NC}"
echo ""

# Count files to process
echo -e "${BLUE}🔍 Scanning for HTML files...${NC}"
HTML_COUNT=$(find trading-ui -name "*.html" -type f | wc -l | tr -d ' ')
echo -e "${GREEN}   ✅ Found ${HTML_COUNT} HTML files${NC}"
echo ""

# Process HTML files
echo -e "${BLUE}🔄 Processing HTML files...${NC}"

PROCESSED=0
ERRORS=0

find trading-ui -name "*.html" -type f | while read file; do
    echo -e "${BLUE}   Processing: ${file}${NC}"
    
    # Backup original file (with .bak extension)
    cp "$file" "$file.bak"
    
    # Update JS files: src="path.js" → src="path.js?v=BUILD_VERSION"
    # הסרת ?v= קודם אם קיים, ואז הוספת החדש
    sed -i '' 's|\(src="[^"]*\.js\)[?]v=[^"]*"|\1"|g' "$file"
    sed -i '' 's|\(src="[^"]*\.js\)"|\1?v='"$BUILD_VERSION"'"|g' "$file"
    
    # Update CSS files: href="path.css" → href="path.css?v=BUILD_VERSION"
    sed -i '' 's|\(href="[^"]*\.css\)[?]v=[^"]*"|\1"|g' "$file"
    sed -i '' 's|\(href="[^"]*\.css\)"|\1?v='"$BUILD_VERSION"'"|g' "$file"
    
    # Check if changes were made
    if diff -q "$file" "$file.bak" > /dev/null 2>&1; then
        echo -e "${YELLOW}      ⚠️  No changes needed${NC}"
    else
        echo -e "${GREEN}      ✅ Updated successfully${NC}"
        PROCESSED=$((PROCESSED + 1))
    fi
    
    # Remove backup
    rm "$file.bak"
done

echo ""
echo -e "${GREEN}✅ Processing complete!${NC}"
echo -e "${GREEN}   Files processed: ${PROCESSED}/${HTML_COUNT}${NC}"
echo ""

# Save build version to file
echo -e "${BLUE}💾 Saving build version...${NC}"
echo "$BUILD_VERSION" > .build-version
echo -e "${GREEN}   ✅ Saved to .build-version${NC}"
echo ""

# Show summary
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}✅ Cache Busting Completed!${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "${GREEN}Version: ${BUILD_VERSION}${NC}"
echo -e "${GREEN}Files updated: ${PROCESSED}${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "${YELLOW}   1. Test a page: open any HTML file${NC}"
echo -e "${YELLOW}   2. Check console: look for ?v=${BUILD_VERSION}${NC}"
echo -e "${YELLOW}   3. Verify: all JS/CSS load correctly${NC}"
echo -e "${YELLOW}   4. Commit: git add . && git commit -m 'cache busting'${NC}"
echo ""

