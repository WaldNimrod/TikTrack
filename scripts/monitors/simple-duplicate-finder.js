#!/usr/bin/env node

/**
 * Simple Duplicate Function Finder
 * Finds duplicate function names in a single file
 */

const fs = require('fs');
const path = require('path');

// Get file name from command line argument
const fileName = process.argv[2];

if (!fileName) {
    console.log('Usage: node simple-duplicate-finder.js <filename>');
    console.log('Example: node simple-duplicate-finder.js executions.js');
    process.exit(1);
}

const filePath = path.join('trading-ui/scripts', fileName);

if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    process.exit(1);
}

console.log(`🔍 Analyzing duplicate functions in ${fileName}...\n`);

try {
    const content = fs.readFileSync(filePath, 'utf8');
    const functions = [];
    
    // Find all function definitions
    const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*{/g;
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
        const functionName = match[1];
        const lineNumber = content.substring(0, match.index).split('\n').length;
        
        functions.push({
            name: functionName,
            lineNumber: lineNumber,
            startIndex: match.index
        });
    }
    
    console.log(`📊 Found ${functions.length} functions total\n`);
    
    // Group functions by name
    const functionGroups = new Map();
    for (const func of functions) {
        if (!functionGroups.has(func.name)) {
            functionGroups.set(func.name, []);
        }
        functionGroups.get(func.name).push(func);
    }
    
    // Find duplicates
    let duplicateCount = 0;
    for (const [name, funcs] of functionGroups) {
        if (funcs.length > 1) {
            duplicateCount++;
            console.log(`🔴 DUPLICATE: "${name}" (${funcs.length} instances)`);
            funcs.forEach((func, index) => {
                console.log(`   ${index + 1}. Line ${func.lineNumber}`);
            });
            console.log('');
        }
    }
    
    if (duplicateCount === 0) {
        console.log('✅ No duplicate function names found!');
    } else {
        console.log(`📈 Summary: Found ${duplicateCount} duplicate function names`);
        console.log('\n💡 Next step: Analyze each duplicate to decide which to keep/remove');
    }
    
} catch (error) {
    console.error(`❌ Error analyzing file: ${error.message}`);
    process.exit(1);
}
