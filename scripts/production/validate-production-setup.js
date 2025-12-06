#!/usr/bin/env node
/**
 * Validate Production Setup
 * Checks that all pages are in production mode with bundles
 */

const fs = require('fs');
const path = require('path');

const TRADING_UI_DIR = path.join(__dirname, '..', '..', 'trading-ui');

function findHTMLFiles() {
    const files = [];
    const dir = fs.readdirSync(TRADING_UI_DIR);
    
    dir.forEach(file => {
        if (file.endsWith('.html') && !file.includes('backup')) {
            files.push(path.join(TRADING_UI_DIR, file));
        }
    });
    
    return files;
}

function validatePage(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasProductionMode = content.includes('Mode: production');
    const hasBundles = content.includes('Use Bundles: true');
    const hasBundleFiles = content.includes('.bundle.js');
    const hasScriptSection = content.includes('START SCRIPT LOADING ORDER');
    
    return {
        file: path.basename(filePath),
        hasProductionMode,
        hasBundles,
        hasBundleFiles,
        hasScriptSection,
        valid: hasScriptSection && (hasProductionMode && hasBundles && hasBundleFiles)
    };
}

function main() {
    console.log('🔍 Validating Production Setup...\n');
    
    const htmlFiles = findHTMLFiles();
    const results = htmlFiles.map(validatePage);
    
    // Filter only pages with script sections (main pages)
    const pagesWithScripts = results.filter(r => r.hasScriptSection);
    const valid = pagesWithScripts.filter(r => r.valid);
    const invalid = pagesWithScripts.filter(r => !r.valid);
    
    console.log(`📄 Total HTML files: ${htmlFiles.length}`);
    console.log(`📝 Pages with script sections: ${pagesWithScripts.length}`);
    console.log(`✅ Valid pages: ${valid.length}/${pagesWithScripts.length}`);
    console.log(`❌ Invalid pages: ${invalid.length}/${pagesWithScripts.length}\n`);
    
    if (invalid.length > 0) {
        console.log('❌ Invalid pages:');
        invalid.forEach(r => {
            console.log(`   - ${r.file}:`);
            if (!r.hasProductionMode) console.log('     ❌ Missing production mode');
            if (!r.hasBundles) console.log('     ❌ Missing bundles flag');
            if (!r.hasBundleFiles) console.log('     ❌ Missing bundle files');
        });
        console.log('');
        process.exit(1);
    }
    
    console.log('✅ All pages are valid!');
    console.log('✅ Production setup is correct!');
}

main();


