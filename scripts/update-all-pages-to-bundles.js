#!/usr/bin/env node
/**
 * Update All Pages to Production Mode with Bundles
 * 
 * This script updates all HTML pages to use bundles in production mode.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TRADING_UI_DIR = path.join(__dirname, '..', 'trading-ui');
const GENERATE_SCRIPT = path.join(TRADING_UI_DIR, 'scripts', 'generate-script-loading-code.js');

// Get all pages from page-initialization-configs.js
function getAllPages() {
    const configPath = path.join(TRADING_UI_DIR, 'scripts', 'page-initialization-configs.js');
    const content = fs.readFileSync(configPath, 'utf8');
    
    // Extract page names from PAGE_CONFIGS
    const pages = [];
    const pageRegex = /^\s+([a-z_]+)\s*:\s*\{/gm;
    let match;
    
    while ((match = pageRegex.exec(content)) !== null) {
        pages.push(match[1]);
    }
    
    return pages;
}

// Get HTML file path for a page
function getHTMLPath(pageName) {
    // Try common patterns
    const patterns = [
        `${pageName}.html`,
        `${pageName.replace(/_/g, '-')}.html`,
        `${pageName.replace(/-/g, '_')}.html`
    ];
    
    for (const pattern of patterns) {
        const filePath = path.join(TRADING_UI_DIR, pattern);
        if (fs.existsSync(filePath)) {
            return filePath;
        }
    }
    
    return null;
}

// Update a single page
function updatePage(pageName) {
    const htmlPath = getHTMLPath(pageName);
    
    if (!htmlPath) {
        console.log(`⚠️  No HTML file found for page: ${pageName}`);
        return { success: false, reason: 'no_html_file' };
    }
    
    try {
        // Backup original file
        const backupPath = `${htmlPath}.backup-${Date.now()}`;
        fs.copyFileSync(htmlPath, backupPath);
        
        // Generate new script loading code
        const newScripts = execSync(
            `node "${GENERATE_SCRIPT}" ${pageName} --mode=production --use-bundles`,
            { encoding: 'utf8', cwd: path.dirname(GENERATE_SCRIPT) }
        );
        
        // Read original HTML
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // Find script loading section
        const startMarker = '<!-- ===== START SCRIPT LOADING ORDER ===== -->';
        const endMarker = '<!-- ===== FINAL SUMMARY ===== -->';
        
        const startIndex = htmlContent.indexOf(startMarker);
        const endIndex = htmlContent.indexOf(endMarker);
        
        if (startIndex === -1 || endIndex === -1) {
            console.log(`⚠️  Could not find script loading section in: ${pageName}`);
            return { success: false, reason: 'no_script_section' };
        }
        
        // Find the end of FINAL SUMMARY section
        const finalSummaryEnd = htmlContent.indexOf('</body>', endIndex);
        const scriptEndIndex = finalSummaryEnd > -1 ? htmlContent.lastIndexOf('\n', finalSummaryEnd) : htmlContent.length;
        
        // Replace script section
        const beforeScripts = htmlContent.substring(0, startIndex);
        const afterScripts = htmlContent.substring(scriptEndIndex);
        const newContent = beforeScripts + newScripts.trim() + '\n\n' + afterScripts;
        
        // Write updated content
        fs.writeFileSync(htmlPath, newContent, 'utf8');
        
        console.log(`✅ Updated: ${pageName} (${path.basename(htmlPath)})`);
        return { success: true, htmlPath, backupPath };
        
    } catch (error) {
        console.error(`❌ Error updating ${pageName}:`, error.message);
        return { success: false, reason: 'error', error: error.message };
    }
}

// Main function
function main() {
    console.log('='.repeat(80));
    console.log('📦 Updating All Pages to Production Mode with Bundles');
    console.log('='.repeat(80));
    console.log();
    
    const pages = getAllPages();
    console.log(`Found ${pages.length} pages in PAGE_CONFIGS\n`);
    
    const results = {
        successful: [],
        failed: [],
        skipped: []
    };
    
    pages.forEach((pageName, index) => {
        console.log(`[${index + 1}/${pages.length}] Processing: ${pageName}...`);
        const result = updatePage(pageName);
        
        if (result.success) {
            results.successful.push({ page: pageName, ...result });
        } else if (result.reason === 'no_html_file') {
            results.skipped.push({ page: pageName, reason: result.reason });
        } else {
            results.failed.push({ page: pageName, ...result });
        }
    });
    
    console.log();
    console.log('='.repeat(80));
    console.log('📊 Summary');
    console.log('='.repeat(80));
    console.log(`✅ Successful: ${results.successful.length}`);
    console.log(`⚠️  Skipped: ${results.skipped.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log();
    
    if (results.failed.length > 0) {
        console.log('❌ Failed Pages:');
        results.failed.forEach(({ page, reason }) => {
            console.log(`   - ${page}: ${reason}`);
        });
        console.log();
    }
    
    if (results.skipped.length > 0) {
        console.log('⚠️  Skipped Pages (no HTML file):');
        results.skipped.forEach(({ page }) => {
            console.log(`   - ${page}`);
        });
        console.log();
    }
    
    console.log('✅ Update complete!');
    console.log('='.repeat(80));
    
    // Exit with error code if there are failures
    if (results.failed.length > 0) {
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = { updatePage, getAllPages };

