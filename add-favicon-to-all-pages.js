#!/usr/bin/env node

/**
 * Add Global Favicon to All Pages - TikTrack
 * הוספת Favicon גלובלי לכל העמודים - TikTrack
 * 
 * @description סקריפט שמעדכן את כל קבצי ה-HTML להוסיף את global-favicon.js
 * @version 1.0.0
 * @author TikTrack Development Team
 * @created 2025-09-22
 */

const fs = require('fs');
const path = require('path');

// Configuration
const TRADING_UI_DIR = './trading-ui';
const FAVICON_SCRIPT = 'scripts/global-favicon.js';
const FAVICON_COMMENT = '    <!-- Favicon will be set by global-favicon.js -->';

/**
 * Check if file is HTML
 */
function isHtmlFile(filename) {
    return filename.endsWith('.html');
}

/**
 * Check if file already has favicon script
 */
function hasFaviconScript(content) {
    return content.includes('global-favicon.js');
}

/**
 * Check if file has favicon comment
 */
function hasFaviconComment(content) {
    return content.includes('Favicon will be set by global-favicon.js');
}

/**
 * Add favicon script to HTML content
 */
function addFaviconScript(content) {
    // Remove existing favicon links
    content = content.replace(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*>/gi, '');
    
    // Add favicon comment in head
    if (content.includes('<head>')) {
        content = content.replace(
            /(<head>[\s\S]*?<meta[^>]*viewport[^>]*>)/,
            `$1\n${FAVICON_COMMENT}`
        );
    }
    
    // Add favicon script before ui-utils.js
    if (content.includes('scripts/ui-utils.js')) {
        content = content.replace(
            /(<script[^>]*src=["']scripts\/ui-utils\.js["'][^>]*>)/,
            `<script src="${FAVICON_SCRIPT}"></script>\n    $1`
        );
    } else if (content.includes('scripts/main.js')) {
        content = content.replace(
            /(<script[^>]*src=["']scripts\/main\.js["'][^>]*>)/,
            `<script src="${FAVICON_SCRIPT}"></script>\n    $1`
        );
    } else {
        // Add at the end of head if no specific location found
        content = content.replace(
            /(<\/head>)/,
            `    <script src="${FAVICON_SCRIPT}"></script>\n$1`
        );
    }
    
    return content;
}

/**
 * Process a single HTML file
 */
function processHtmlFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (hasFaviconScript(content) && hasFaviconComment(content)) {
            console.log(`✅ ${filePath} - Already has favicon setup`);
            return false;
        }
        
        const updatedContent = addFaviconScript(content);
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        
        console.log(`✅ ${filePath} - Added favicon setup`);
        return true;
        
    } catch (error) {
        console.error(`❌ ${filePath} - Error: ${error.message}`);
        return false;
    }
}

/**
 * Main function
 */
function main() {
    console.log('🔧 Adding Global Favicon to All Pages...\n');
    
    let processedCount = 0;
    let updatedCount = 0;
    
    try {
        const files = fs.readdirSync(TRADING_UI_DIR);
        
        for (const file of files) {
            if (isHtmlFile(file)) {
                const filePath = path.join(TRADING_UI_DIR, file);
                processedCount++;
                
                if (processHtmlFile(filePath)) {
                    updatedCount++;
                }
            }
        }
        
        console.log(`\n📊 Summary:`);
        console.log(`   Processed: ${processedCount} HTML files`);
        console.log(`   Updated: ${updatedCount} files`);
        console.log(`   Already configured: ${processedCount - updatedCount} files`);
        
        if (updatedCount > 0) {
            console.log(`\n🎉 Successfully added global favicon to ${updatedCount} pages!`);
        } else {
            console.log(`\n✅ All pages already have favicon configured!`);
        }
        
    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { processHtmlFile, addFaviconScript };

