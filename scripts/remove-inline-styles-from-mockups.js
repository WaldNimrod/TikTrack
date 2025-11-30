#!/usr/bin/env node
/**
 * Remove inline styles from mockup pages
 * Replaces style="" attributes with CSS classes
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..');
const MOCKUPS_DIR = path.join(BASE_DIR, 'trading-ui', 'mockups');
const DAILY_SNAPSHOTS_DIR = path.join(MOCKUPS_DIR, 'daily-snapshots');

const MOCKUP_PAGES = [
    DAILY_SNAPSHOTS_DIR + '/economic-calendar-page.html',
    DAILY_SNAPSHOTS_DIR + '/trading-journal-page.html',
    DAILY_SNAPSHOTS_DIR + '/strategy-analysis-page.html',
    DAILY_SNAPSHOTS_DIR + '/price-history-page.html',
    DAILY_SNAPSHOTS_DIR + '/history-widget.html',
];

// Common style replacements
const STYLE_REPLACEMENTS = {
    'display: none;': 'mockup-hidden',
    'display: none': 'mockup-hidden',
    'width: auto; display: inline-block;': 'mockup-inline-block mockup-auto-width',
    'width: auto; display: inline-block': 'mockup-inline-block mockup-auto-width',
    'display: inline-block;': 'mockup-inline-block',
    'display: inline-block': 'mockup-inline-block',
    'width: auto;': 'mockup-auto-width',
    'width: auto': 'mockup-auto-width',
};

function removeInlineStyles(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        return false;
    }
    
    try {
        let content = fs.readFileSync(filePath, 'utf-8');
        const originalContent = content;
        
        // Replace style attributes with classes
        // Match style="..." attributes
        const styleAttrRegex = /style\s*=\s*["']([^"']+)["']/gi;
        
        content = content.replace(styleAttrRegex, (match, styleValue) => {
            const trimmedStyle = styleValue.trim();
            
            // Try to find a replacement
            for (const [stylePattern, className] of Object.entries(STYLE_REPLACEMENTS)) {
                if (trimmedStyle === stylePattern || trimmedStyle.startsWith(stylePattern)) {
                    return `class="${className}"`;
                }
            }
            
            // If no replacement found, log it and remove the style
            console.log(`  ⚠️  Unhandled style in ${path.basename(filePath)}: ${trimmedStyle}`);
            return '';
        });
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf-8');
            console.log(`✅ Fixed inline styles in: ${path.basename(filePath)}`);
            return true;
        } else {
            console.log(`ℹ️  No inline styles found in: ${path.basename(filePath)}`);
            return true;
        }
        
    } catch (error) {
        console.error(`❌ Error processing ${filePath}: ${error.message}`);
        return false;
    }
}

function main() {
    console.log('🔧 Removing inline styles from mockup pages...\n');
    
    let fixed = 0;
    let failed = 0;
    
    MOCKUP_PAGES.forEach(filePath => {
        if (removeInlineStyles(filePath)) {
            fixed++;
        } else {
            failed++;
        }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   Fixed: ${fixed}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total: ${MOCKUP_PAGES.length}`);
}

if (require.main === module) {
    main();
}

module.exports = { removeInlineStyles };

