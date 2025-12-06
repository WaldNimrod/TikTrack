#!/usr/bin/env node
/**
 * Validate Label For Attributes
 * 
 * This script checks all HTML files for labels with 'for' attributes
 * and verifies that corresponding input/select/textarea elements exist
 * with matching 'id' attributes.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const TRADING_UI_DIR = path.join(__dirname, '..', 'trading-ui');
const HTML_EXTENSIONS = ['.html', '.htm'];
const EXCLUDE_DIRS = ['node_modules', '.git', 'bundles', 'backup', 'archive'];

// Results storage
const results = {
    valid: [],
    invalid: [],
    missing: [],
    totalFiles: 0,
    totalLabels: 0
};

/**
 * Check if directory should be excluded
 */
function shouldExcludeDir(dirPath) {
    const dirName = path.basename(dirPath);
    return EXCLUDE_DIRS.includes(dirName);
}

/**
 * Find all HTML files recursively
 */
function findHTMLFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (!shouldExcludeDir(filePath)) {
                findHTMLFiles(filePath, fileList);
            }
        } else if (HTML_EXTENSIONS.some(ext => file.endsWith(ext))) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

/**
 * Simple HTML parser using regex (no external dependencies)
 */
function parseHTML(html) {
    const labels = [];
    const elements = [];
    
    // Find all labels with for attributes
    const labelRegex = /<label\s+[^>]*for=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = labelRegex.exec(html)) !== null) {
        const fullMatch = match[0];
        const forAttr = match[1];
        const lineNumber = (html.substring(0, match.index).match(/\n/g) || []).length + 1;
        labels.push({ forAttr, fullMatch, lineNumber, index: match.index });
    }
    
    // Find all elements with id attributes (input, select, textarea, button)
    const elementRegex = /<(input|select|textarea|button)\s+[^>]*id=["']([^"']+)["'][^>]*>/gi;
    while ((match = elementRegex.exec(html)) !== null) {
        const tagName = match[1].toLowerCase();
        const id = match[2];
        elements.push({ id, tagName });
    }
    
    return { labels, elements };
}

/**
 * Validate labels in a single HTML file
 */
function validateLabelsInFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const { labels, elements } = parseHTML(content);
        const relativePath = path.relative(TRADING_UI_DIR, filePath);

        // Create a map of element IDs for quick lookup
        const elementMap = {};
        elements.forEach(el => {
            elementMap[el.id] = el.tagName;
        });

        labels.forEach(label => {
            const forAttr = label.forAttr;
            if (!forAttr) return;

            results.totalLabels++;

            // Find element with matching id
            const targetElementTag = elementMap[forAttr];

            if (!targetElementTag) {
                results.invalid.push({
                    file: relativePath,
                    label: label.fullMatch.substring(0, 100),
                    forAttr: forAttr,
                    line: label.lineNumber,
                    issue: 'No element found with matching id'
                });
            } else {
                results.valid.push({
                    file: relativePath,
                    forAttr: forAttr,
                    targetElement: targetElementTag
                });
            }
        });

        results.totalFiles++;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
    }
}


/**
 * Generate report
 */
function generateReport() {
    console.log('='.repeat(80));
    console.log('📋 Label For Attribute Validation Report');
    console.log('='.repeat(80));
    console.log();

    console.log(`📊 Summary:`);
    console.log(`   Total Files Scanned: ${results.totalFiles}`);
    console.log(`   Total Labels Found: ${results.totalLabels}`);
    console.log(`   ✅ Valid Labels: ${results.valid.length}`);
    console.log(`   ❌ Invalid Labels: ${results.invalid.length}`);
    console.log();

    if (results.invalid.length > 0) {
        console.log('❌ Invalid Labels:');
        console.log('-'.repeat(80));

        // Group by file
        const byFile = {};
        results.invalid.forEach(item => {
            if (!byFile[item.file]) {
                byFile[item.file] = [];
            }
            byFile[item.file].push(item);
        });

        Object.entries(byFile).forEach(([file, items]) => {
            console.log(`\n📄 ${file}:`);
            items.forEach((item, index) => {
                console.log(`   ${index + 1}. Line ${item.line || '?'}:`);
                console.log(`      Label: ${item.label}`);
                console.log(`      For: "${item.forAttr}"`);
                console.log(`      Issue: ${item.issue}`);
                if (item.targetElement) {
                    console.log(`      Target: ${item.targetElement}`);
                }
            });
        });
    } else {
        console.log('✅ All labels are valid!');
    }

    console.log();
    console.log('='.repeat(80));
}

/**
 * Main function
 */
function main() {
    console.log('🔍 Scanning for HTML files...\n');

    const htmlFiles = findHTMLFiles(TRADING_UI_DIR);
    console.log(`Found ${htmlFiles.length} HTML files\n`);

    console.log('🔍 Validating labels...\n');

    htmlFiles.forEach(file => {
        validateLabelsInFile(file);
    });

    generateReport();

    // Exit with error code if there are invalid labels
    if (results.invalid.length > 0) {
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = { validateLabelsInFile, findHTMLFiles };

