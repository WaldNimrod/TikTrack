#!/usr/bin/env node
/**
 * Test script for Icon System
 * Tests if icons exist and paths are correct
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '../..');
const ICONS_DIR = path.join(PROJECT_ROOT, 'trading-ui/images/icons');

// Test cases
const testCases = [
    // Entity icons
    { type: 'entity', name: 'home', expectedPath: '/trading-ui/images/icons/entities/home.svg' },
    { type: 'entity', name: 'trade', expectedPath: '/trading-ui/images/icons/entities/trades.svg' },
    { type: 'entity', name: 'alert', expectedPath: '/trading-ui/images/icons/entities/alerts.svg' },
    
    // Button icons
    { type: 'button', name: 'edit', expectedPath: '/trading-ui/images/icons/tabler/pencil.svg' },
    { type: 'button', name: 'delete', expectedPath: '/trading-ui/images/icons/tabler/trash.svg' },
    
    // Page icons
    { type: 'page', name: 'index.html', expectedPath: '/trading-ui/images/icons/tabler/home.svg' },
    { type: 'page', name: 'trades.html', expectedPath: '/trading-ui/images/icons/tabler/chart-line.svg' },
];

function checkFileExists(filePath) {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    return fs.existsSync(fullPath);
}

function getActualPath(filePath) {
    const fullPath = path.join(PROJECT_ROOT, filePath);
    return fs.existsSync(fullPath) ? filePath : null;
}

console.log('🔍 Testing Icon System...\n');

let passed = 0;
let failed = 0;
const failures = [];

// Check if directories exist
console.log('📁 Checking directories...');
const dirs = ['entities', 'tabler'];
dirs.forEach(dir => {
    const dirPath = path.join(ICONS_DIR, dir);
    if (fs.existsSync(dirPath)) {
        console.log(`✅ ${dir}/ exists`);
    } else {
        console.log(`❌ ${dir}/ missing`);
        failed++;
    }
});

console.log('\n📋 Checking icon files...\n');

// Check entity icons
console.log('Entity Icons:');
const entityDir = path.join(ICONS_DIR, 'entities');
if (fs.existsSync(entityDir)) {
    const entityFiles = fs.readdirSync(entityDir).filter(f => f.endsWith('.svg'));
    console.log(`   Found ${entityFiles.length} entity icons`);
    entityFiles.forEach(file => {
        console.log(`   ✅ ${file}`);
    });
}

// Check Tabler icons
console.log('\nTabler Icons:');
const tablerDir = path.join(ICONS_DIR, 'tabler');
if (fs.existsSync(tablerDir)) {
    const tablerFiles = fs.readdirSync(tablerDir).filter(f => f.endsWith('.svg'));
    console.log(`   Found ${tablerFiles.length} Tabler icons`);
    if (tablerFiles.length < 10) {
        console.log(`   ⚠️  Warning: Expected more Tabler icons`);
        console.log(`   Files: ${tablerFiles.slice(0, 10).join(', ')}...`);
    }
} else {
    console.log(`   ❌ Tabler directory missing!`);
}

// Test specific paths
console.log('\n🧪 Testing specific icon paths...\n');

testCases.forEach(test => {
    const exists = checkFileExists(test.expectedPath);
    if (exists) {
        console.log(`✅ ${test.type}:${test.name} -> ${test.expectedPath}`);
        passed++;
    } else {
        console.log(`❌ ${test.type}:${test.name} -> ${test.expectedPath} (NOT FOUND)`);
        failed++;
        failures.push({ ...test, actual: null });
    }
});

console.log('\n' + '='.repeat(60));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(60));

if (failed > 0) {
    console.log('\n❌ Some icons are missing. Please check:');
    failures.forEach(f => {
        console.log(`   - ${f.type}:${f.name} -> ${f.expectedPath}`);
    });
    process.exit(1);
} else {
    console.log('\n✅ All icon tests passed!');
    process.exit(0);
}

