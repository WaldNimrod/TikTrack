#!/usr/bin/env node
/**
 * Setup Tabler Icons Script
 * ==========================
 * 
 * סקריפט להעתקת קבצי SVG מ-Tabler Icons package
 * 
 * Usage:
 *   npm install @tabler/icons --no-save
 *   node scripts/icons/setup-tabler-icons.js
 * 
 * Author: TikTrack Development Team
 * Version: 1.0.0
 */

const fs = require('fs');
const path = require('path');

// Paths
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const TABLER_OUTLINE = path.join(PROJECT_ROOT, 'node_modules', '@tabler', 'icons', 'icons', 'outline');
const TABLER_FILLED = path.join(PROJECT_ROOT, 'node_modules', '@tabler', 'icons', 'icons', 'filled');
const DEST_DIR = path.join(PROJECT_ROOT, 'trading-ui', 'images', 'icons', 'tabler');

// Load icon mappings
const ICON_MAPPINGS_PATH = path.join(PROJECT_ROOT, 'trading-ui', 'scripts', 'icon-mappings.js');

/**
 * Extract icon names from mappings
 */
function extractIconNames() {
    try {
        const mappingsContent = fs.readFileSync(ICON_MAPPINGS_PATH, 'utf8');
        
        // Extract all icon names from mappings
        const iconNames = new Set();
        
        // Extract from buttons
        const buttonsMatch = mappingsContent.match(/buttons:\s*\{([^}]+)\}/s);
        if (buttonsMatch) {
            const buttonsContent = buttonsMatch[1];
            const buttonMatches = buttonsContent.matchAll(/(\w+):\s*['"]([^'"]+)['"]/g);
            for (const match of buttonMatches) {
                iconNames.add(match[2]); // Tabler icon name
            }
        }
        
        // Extract from categories
        const categoriesMatch = mappingsContent.match(/categories:\s*\{([^}]+)\}/s);
        if (categoriesMatch) {
            const categoriesContent = categoriesMatch[1];
            const categoryMatches = categoriesContent.matchAll(/(\w+):\s*['"]([^'"]+)['"]/g);
            for (const match of categoryMatches) {
                iconNames.add(match[2]);
            }
        }
        
        // Extract from charts
        const chartsMatch = mappingsContent.match(/charts:\s*\{([^}]+)\}/s);
        if (chartsMatch) {
            const chartsContent = chartsMatch[1];
            const chartMatches = chartsContent.matchAll(/(['"]?[\w-]+['"]?):\s*['"]([^'"]+)['"]/g);
            for (const match of chartMatches) {
                iconNames.add(match[2]);
            }
        }
        
        // Extract from pages
        const pagesMatch = mappingsContent.match(/pages:\s*\{([^}]+)\}/s);
        if (pagesMatch) {
            const pagesContent = pagesMatch[1];
            const pageMatches = pagesContent.matchAll(/(['"]?[^'"]+['"]?):\s*['"]([^'"]+)['"]/g);
            for (const match of pageMatches) {
                iconNames.add(match[2]);
            }
        }
        
        return Array.from(iconNames);
    } catch (error) {
        console.error('❌ Error reading icon mappings:', error);
        return [];
    }
}

/**
 * Copy Tabler icon files
 */
function copyTablerIcons() {
    // Check if Tabler package exists
    if (!fs.existsSync(TABLER_OUTLINE)) {
        console.error('❌ Tabler Icons package not found!');
        console.error(`   Expected location: ${TABLER_OUTLINE}`);
        console.error('   Please run: npm install @tabler/icons --no-save');
        process.exit(1);
    }
    
    // Create destination directory
    if (!fs.existsSync(DEST_DIR)) {
        fs.mkdirSync(DEST_DIR, { recursive: true });
        console.log(`✅ Created directory: ${DEST_DIR}`);
    }
    
    // Extract icon names from mappings
    const iconNames = extractIconNames();
    console.log(`📋 Found ${iconNames.length} unique icon names in mappings`);
    
    if (iconNames.length === 0) {
        console.warn('⚠️  No icon names found in mappings. Using fallback list.');
        // Fallback to common icons
        iconNames.push(
            'pencil', 'trash', 'x', 'link', 'plus', 'device-floppy',
            'refresh', 'download', 'upload', 'alert-triangle', 'search',
            'filter', 'eye', 'copy', 'archive', 'restore', 'check',
            'player-pause', 'player-play', 'player-stop', 'chevron-down',
            'arrows-sort', 'settings', 'arrow-right', 'tools', 'briefcase',
            'gauge', 'palette', 'shield', 'network', 'database', 'plug',
            'bell', 'chart-line', 'chart-bar', 'chart-candlestick', 'line',
            'volume', 'arrows-maximize', 'zoom-in', 'zoom-out', 'zoom-reset',
            'chart-dots', 'toggle-left', 'camera', 'minus', 'typography',
            'ruler', 'trending-up', 'map-pin', 'clock', 'calendar',
            'calendar-week', 'calendar-month', 'calendar-event', 'calendar-stats',
            'currency-dollar', 'percentage', 'home', 'user', 'inbox',
            'clipboard-list', 'bolt', 'note', 'world', 'server', 'lock', 'flask'
        );
    }
    
    let copiedCount = 0;
    let missingCount = 0;
    const missingIcons = [];
    
    // Copy each icon - try outline first, then filled
    for (const iconName of iconNames) {
        let sourceFile = path.join(TABLER_OUTLINE, `${iconName}.svg`);
        let found = false;
        
        // Try outline first
        if (fs.existsSync(sourceFile)) {
            found = true;
        } else {
            // Try filled
            sourceFile = path.join(TABLER_FILLED, `${iconName}.svg`);
            if (fs.existsSync(sourceFile)) {
                found = true;
            }
        }
        
        if (found) {
            const destFile = path.join(DEST_DIR, `${iconName}.svg`);
            try {
                fs.copyFileSync(sourceFile, destFile);
                copiedCount++;
                if (copiedCount % 10 === 0) {
                    process.stdout.write('.');
                }
            } catch (error) {
                console.error(`\n❌ Error copying ${iconName}.svg:`, error.message);
                missingCount++;
                missingIcons.push(iconName);
            }
        } else {
            missingCount++;
            missingIcons.push(iconName);
        }
    }
    
    console.log('\n');
    console.log('='.repeat(60));
    console.log(`✅ Successfully copied: ${copiedCount} icons`);
    if (missingCount > 0) {
        console.log(`⚠️  Missing icons: ${missingCount}`);
        console.log('   Missing icons:', missingIcons.slice(0, 10).join(', '));
        if (missingIcons.length > 10) {
            console.log(`   ... and ${missingIcons.length - 10} more`);
        }
    }
    console.log('='.repeat(60));
    
    return { copiedCount, missingCount, missingIcons };
}

// Run script
if (require.main === module) {
    console.log('🚀 Starting Tabler Icons setup...\n');
    console.log(`📁 Source (outline): ${TABLER_OUTLINE}`);
    console.log(`📁 Source (filled): ${TABLER_FILLED}`);
    console.log(`📁 Destination: ${DEST_DIR}\n`);
    
    const result = copyTablerIcons();
    
    if (result.missingCount > 0) {
        console.log('\n⚠️  Some icons were not found. Please check:');
        console.log('   1. Tabler Icons package is installed: npm install @tabler/icons --no-save');
        console.log('   2. Icon names in mappings match Tabler icon names');
        console.log('   3. Visit https://tabler.io/icons to find correct icon names');
    } else {
        console.log('\n✅ All icons copied successfully!');
    }
}

module.exports = { copyTablerIcons, extractIconNames };

