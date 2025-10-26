#!/usr/bin/env node

/**
 * Semantic Pattern Detector
 * Detects semantic duplicate patterns like Edit vs Add, Cancel vs Delete, Enable vs Disable
 */

const fs = require('fs');
const path = require('path');

// Get file name from command line argument
const fileName = process.argv[2];

if (!fileName) {
    console.log('Usage: node semantic-pattern-detector.js <filename>');
    console.log('Example: node semantic-pattern-detector.js executions.js');
    process.exit(1);
}

const filePath = path.join('trading-ui/scripts', fileName);

if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    process.exit(1);
}

console.log(`🔍 Analyzing semantic patterns in ${fileName}...\n`);

try {
    const content = fs.readFileSync(filePath, 'utf8');
    const functions = [];
    
    // Find all function definitions with JSDoc
    const functionRegex = /\/\*\*[\s\S]*?\*\/\s*(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*{/g;
    let match;
    
    while ((match = functionRegex.exec(content)) !== null) {
        const functionName = match[1];
        const jsdocMatch = match[0].match(/\/\*\*([\s\S]*?)\*\//);
        const jsdoc = jsdocMatch ? jsdocMatch[1].replace(/\*/g, '').trim() : '';
        const lineNumber = content.substring(0, match.index).split('\n').length;
        
        functions.push({
            name: functionName,
            jsdoc: jsdoc,
            lineNumber: lineNumber
        });
    }
    
    console.log(`📊 Found ${functions.length} functions with JSDoc\n`);
    
    // Define semantic patterns
    const patterns = {
        'Edit vs Add': {
            edit: ['edit', 'update', 'modify', 'change'],
            add: ['add', 'create', 'new', 'insert'],
            description: 'Functions that handle editing existing records vs adding new records'
        },
        'Cancel vs Delete': {
            cancel: ['cancel', 'abort', 'stop', 'undo'],
            delete: ['delete', 'remove', 'destroy', 'eliminate'],
            description: 'Functions that cancel operations vs permanently delete records'
        },
        'Enable vs Disable': {
            enable: ['enable', 'activate', 'start', 'turnOn'],
            disable: ['disable', 'deactivate', 'stop', 'turnOff'],
            description: 'Functions that enable/activate vs disable/deactivate features'
        }
    };
    
    // Analyze patterns
    for (const [patternName, pattern] of Object.entries(patterns)) {
        console.log(`🔍 Analyzing pattern: ${patternName}`);
        console.log(`   ${pattern.description}\n`);
        
        // Get the appropriate keyword arrays based on pattern name
        let firstKeywords, secondKeywords;
        if (patternName === 'Edit vs Add') {
            firstKeywords = pattern.edit;
            secondKeywords = pattern.add;
        } else if (patternName === 'Cancel vs Delete') {
            firstKeywords = pattern.cancel;
            secondKeywords = pattern.delete;
        } else if (patternName === 'Enable vs Disable') {
            firstKeywords = pattern.enable;
            secondKeywords = pattern.disable;
        }
        
        const firstFunctions = functions.filter(f => 
            firstKeywords.some(keyword => f.name.toLowerCase().includes(keyword))
        );
        const secondFunctions = functions.filter(f => 
            secondKeywords.some(keyword => f.name.toLowerCase().includes(keyword))
        );
        
        if (firstFunctions.length > 0 || secondFunctions.length > 0) {
            console.log(`   📝 ${patternName.split(' vs ')[0]} functions:`);
            firstFunctions.forEach(f => {
                console.log(`      - ${f.name} (line ${f.lineNumber})`);
                if (f.jsdoc) {
                    console.log(`        JSDoc: ${f.jsdoc.substring(0, 80)}...`);
                }
            });
            
            console.log(`\n   ➕ ${patternName.split(' vs ')[1]} functions:`);
            secondFunctions.forEach(f => {
                console.log(`      - ${f.name} (line ${f.lineNumber})`);
                if (f.jsdoc) {
                    console.log(`        JSDoc: ${f.jsdoc.substring(0, 80)}...`);
                }
            });
            
            // Check for potential semantic duplicates
            const potentialDuplicates = [];
            for (const firstFunc of firstFunctions) {
                for (const secondFunc of secondFunctions) {
                    // Check if they operate on the same entity
                    const firstEntity = extractEntity(firstFunc.name);
                    const secondEntity = extractEntity(secondFunc.name);
                    
                    if (firstEntity && secondEntity && firstEntity === secondEntity) {
                        potentialDuplicates.push({
                            first: firstFunc,
                            second: secondFunc,
                            entity: firstEntity
                        });
                    }
                }
            }
            
            if (potentialDuplicates.length > 0) {
                console.log(`\n   ⚠️  Potential semantic duplicates found:`);
                potentialDuplicates.forEach((dup, index) => {
                    console.log(`      ${index + 1}. ${dup.entity}:`);
                    console.log(`         ${patternName.split(' vs ')[0]}: ${dup.first.name} (line ${dup.first.lineNumber})`);
                    console.log(`         ${patternName.split(' vs ')[1]}: ${dup.second.name} (line ${dup.second.lineNumber})`);
                });
            }
            
            console.log(`\n`);
        } else {
            console.log(`   ✅ No functions matching this pattern\n`);
        }
    }
    
    // Helper function to extract entity name from function name
    function extractEntity(functionName) {
        const commonEntities = [
            'execution', 'trade', 'ticker', 'alert', 'plan', 'account', 
            'note', 'research', 'cashflow', 'preference', 'user'
        ];
        
        const lowerName = functionName.toLowerCase();
        for (const entity of commonEntities) {
            if (lowerName.includes(entity)) {
                return entity;
            }
        }
        return null;
    }
    
} catch (error) {
    console.error(`❌ Error analyzing file: ${error.message}`);
    process.exit(1);
}
