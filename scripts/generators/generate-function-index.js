#!/usr/bin/env node

/**
 * Function Index Auto-Generator - TikTrack
 * =========================================
 * 
 * Automatically generates and updates Function Index sections
 * in user page JavaScript files
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    scriptsDir: 'trading-ui/scripts',
    corePages: [
        'index.js',
        'trades.js',
        'executions.js',
        'alerts.js',
        'trade_plans.js',
        'cash_flows.js',
        'notes.js',
        'research.js',
        'tickers.js',
        'trading_accounts.js',
        'database.js',
        'preferences-page.js'
    ],
    sectionKeywords: {
        'PAGE INITIALIZATION': ['init', 'setup', 'initialize'],
        'DATA LOADING': ['load', 'fetch', 'get', 'retrieve'],
        'DATA MANIPULATION': ['save', 'update', 'delete', 'create', 'add', 'remove'],
        'EVENT HANDLING': ['handle', 'on', 'click', 'change', 'submit'],
        'UI UPDATES': ['update', 'render', 'display', 'show', 'hide'],
        'VALIDATION': ['validate', 'check'],
        'UTILITIES': ['format', 'parse', 'convert']
    }
};

/**
 * Main execution function
 */
async function main() {
    try {
        console.log('📇 Starting Function Index Generator...\n');

        for (const page of CONFIG.corePages) {
            const pagePath = path.join(CONFIG.scriptsDir, page);
            
            if (!fs.existsSync(pagePath)) {
                console.log(`⚠️  File not found: ${page}`);
                continue;
            }

            console.log(`📄 Processing: ${page}`);
            await processFile(pagePath, page);
        }

        console.log('\n✅ Function Index generation completed!');

    } catch (error) {
        console.error('❌ Error running generator:', error.message);
        process.exit(1);
    }
}

/**
 * Process a single file
 */
function processFile(filePath, fileName) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract all functions
    const functions = extractFunctions(content);
    
    if (functions.length === 0) {
        console.log(`   ⚠️  No functions found in ${fileName}`);
        return;
    }

    // Categorize functions
    const categorizedFunctions = categorizeFunctions(functions);
    
    // Generate Function Index
    const functionIndex = generateFunctionIndex(categorizedFunctions);
    
    // Update or insert Function Index in file
    const updatedContent = updateFunctionIndex(content, functionIndex);
    
    // Write updated content
    fs.writeFileSync(filePath, updatedContent);
    
    console.log(`   ✅ Generated index for ${functions.length} functions`);
}

/**
 * Extract all function declarations from content
 */
function extractFunctions(content) {
    const functions = [];
    
    // Find all function declarations
    const functionPattern = /^\s*(?:\/\*\*[\s\S]*?\*\/)?\s*\n?\s*(?:async\s+)?function\s+(\w+)\s*\(/gm;
    let match;

    while ((match = functionPattern.exec(content)) !== null) {
        const funcName = match[1];
        const funcPos = match.index;
        
        // Extract JSDoc comment if present
        const beforeFunction = content.substring(Math.max(0, funcPos - 1000), funcPos);
        const jsdocMatch = beforeFunction.match(/\/\*\*[\s\S]*?\*\//);
        let description = '';
        
        if (jsdocMatch) {
            // Extract description from JSDoc
            const jsdoc = jsdocMatch[0];
            const descMatch = jsdoc.match(/\*\s+(.+?)(?:\n|$)/);
            if (descMatch) {
                description = descMatch[1].trim();
            }
        }
        
        functions.push({
            name: funcName,
            description: description || `${funcName} function`,
            position: funcPos
        });
    }
    
    return functions;
}

/**
 * Categorize functions based on their names
 */
function categorizeFunctions(functions) {
    const categorized = {};
    
    // Initialize categories
    Object.keys(CONFIG.sectionKeywords).forEach(category => {
        categorized[category] = [];
    });
    categorized['OTHER'] = [];
    
    // Categorize each function
    functions.forEach(func => {
        let categorizedFlag = false;
        
        // Check each category
        for (const [category, keywords] of Object.entries(CONFIG.sectionKeywords)) {
            for (const keyword of keywords) {
                if (func.name.toLowerCase().includes(keyword.toLowerCase())) {
                    categorized[category].push(func);
                    categorizedFlag = true;
                    break;
                }
            }
            if (categorizedFlag) break;
        }
        
        // If not categorized, add to OTHER
        if (!categorizedFlag) {
            categorized['OTHER'].push(func);
        }
    });
    
    // Remove empty categories
    Object.keys(categorized).forEach(key => {
        if (categorized[key].length === 0) {
            delete categorized[key];
        }
    });
    
    return categorized;
}

/**
 * Generate Function Index markdown
 */
function generateFunctionIndex(categorizedFunctions) {
    let index = '/*\n';
    index += ' * ==========================================\n';
    index += ' * FUNCTION INDEX\n';
    index += ' * ==========================================\n';
    index += ' * \n';
    index += ' * This index lists all functions in this file, organized by category.\n';
    index += ' * \n';
    
    // Count total functions
    const totalFunctions = Object.values(categorizedFunctions).reduce((sum, arr) => sum + arr.length, 0);
    index += ` * Total Functions: ${totalFunctions}\n`;
    index += ' * \n';
    
    // List functions by category
    for (const [category, functions] of Object.entries(categorizedFunctions)) {
        index += ` * ${category} (${functions.length})\n`;
        functions.forEach(func => {
            index += ` * - ${func.name}() - ${func.description}\n`;
        });
        index += ' * \n';
    }
    
    index += ' * ==========================================\n';
    index += ' */\n';
    
    return index;
}

/**
 * Update or insert Function Index in content
 */
function updateFunctionIndex(content, newIndex) {
    // Check if Function Index already exists
    const existingIndexPattern = /\/\*[\s\S]*?FUNCTION INDEX[\s\S]*?\*\/\n/;
    const match = content.match(existingIndexPattern);
    
    if (match) {
        // Replace existing index
        console.log('   ↻ Updating existing Function Index');
        return content.replace(existingIndexPattern, newIndex);
    } else {
        // Insert new index at the beginning (after shebang if present)
        console.log('   ✨ Adding new Function Index');
        const shebangMatch = content.match(/^#!.*\n/);
        
        if (shebangMatch) {
            return content.replace(shebangMatch[0], shebangMatch[0] + '\n' + newIndex);
        } else {
            return newIndex + content;
        }
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    main,
    processFile,
    extractFunctions,
    categorizeFunctions,
    generateFunctionIndex
};
