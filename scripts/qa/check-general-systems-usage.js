#!/usr/bin/env node

/**
 * Check General Systems Usage
 * ---------------------------
 * Checks if code uses general systems from GENERAL_SYSTEMS_LIST.md
 * instead of writing duplicate code
 */

const fs = require('fs');
const path = require('path');

const GENERAL_SYSTEMS_LIST = path.join(__dirname, '../../documentation/frontend/GENERAL_SYSTEMS_LIST.md');
const SCRIPTS_DIR = path.join(__dirname, '../../trading-ui/scripts');

// Read general systems list
function readGeneralSystems() {
    const content = fs.readFileSync(GENERAL_SYSTEMS_LIST, 'utf8');
    const systems = [];
    
    // Extract system names from markdown table
    const tableRegex = /\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|/g;
    let match;
    
    while ((match = tableRegex.exec(content)) !== null) {
        const systemName = match[1].trim();
        const files = match[2].trim();
        
        if (systemName && files && !systemName.includes('---') && !systemName.includes('מערכת')) {
            systems.push({
                name: systemName,
                files: files.split(',').map(f => f.trim())
            });
        }
    }
    
    return systems;
}

// Check if file uses general systems
function checkFileUsesGeneralSystems(filePath, systems) {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Check for common patterns that might indicate duplicate code
    const duplicatePatterns = [
        /function\s+renderStatus\s*\(/,
        /function\s+openModal\s*\(/,
        /function\s+closeModal\s*\(/,
        /function\s+showNotification\s*\(/,
        /function\s+handleCrudResponse\s*\(/,
    ];
    
    duplicatePatterns.forEach((pattern, index) => {
        if (pattern.test(content)) {
            const patternNames = [
                'renderStatus',
                'openModal',
                'closeModal',
                'showNotification',
                'handleCrudResponse'
            ];
            
            issues.push({
                file: filePath,
                pattern: patternNames[index],
                message: `Found ${patternNames[index]} function - check if FieldRendererService/ModalManagerV2/NotificationSystem should be used instead`
            });
        }
    });
    
    return issues;
}

// Main function
function main() {
    console.log('🔍 Checking general systems usage...\n');
    
    // Read general systems
    const systems = readGeneralSystems();
    console.log(`Found ${systems.length} general systems\n`);
    
    // Check all JavaScript files
    const allIssues = [];
    const files = fs.readdirSync(SCRIPTS_DIR, { recursive: true, withFileTypes: true })
        .filter(dirent => dirent.isFile() && dirent.name.endsWith('.js'))
        .map(dirent => path.join(SCRIPTS_DIR, dirent.path, dirent.name))
        .filter(file => !file.includes('node_modules') && !file.includes('archive') && !file.includes('backup'));
    
    files.forEach(file => {
        const issues = checkFileUsesGeneralSystems(file, systems);
        allIssues.push(...issues);
    });
    
    // Report results
    if (allIssues.length === 0) {
        console.log('✅ No issues found - all code uses general systems correctly');
        process.exit(0);
    } else {
        console.log(`⚠️  Found ${allIssues.length} potential issues:\n`);
        
        allIssues.forEach(issue => {
            console.log(`  ${issue.file}`);
            console.log(`    Pattern: ${issue.pattern}`);
            console.log(`    Message: ${issue.message}\n`);
        });
        
        console.log('💡 Tip: Check GENERAL_SYSTEMS_LIST.md for available general systems');
        process.exit(1);
    }
}

main();

