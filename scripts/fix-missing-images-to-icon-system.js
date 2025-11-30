#!/usr/bin/env node

/**
 * Fix Missing Images - Replace with IconSystem
 * החלפת תמונות חסרות ב-IconSystem
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..');

// רשימת עמודי מוקאפ עם תמונות חסרות
const PAGES_TO_FIX = [
    {
        file: path.join(BASE_DIR, 'trading-ui', 'mockups', 'daily-snapshots', 'portfolio-state-page.html'),
        images: ['chevron-down']
    },
    {
        file: path.join(BASE_DIR, 'trading-ui', 'mockups', 'watch-lists-page.html'),
        images: ['flame', 'coins', 'table', 'cards', 'flag-filled', 'flag']
    }
];

/**
 * החלפת img tag ב-icon-placeholder
 */
function replaceImageWithIconPlaceholder(content, imgTag, iconName) {
    // Extract attributes
    const sizeMatch = imgTag.match(/width\s*=\s*["'](\d+)["']/);
    const altMatch = imgTag.match(/alt\s*=\s*["']([^"']+)["']/);
    const classMatch = imgTag.match(/class\s*=\s*["']([^"']+)["']/);
    const idMatch = imgTag.match(/id\s*=\s*["']([^"']+)["']/);
    
    const size = sizeMatch ? sizeMatch[1] : '16';
    const alt = altMatch ? altMatch[1] : iconName;
    const className = classMatch ? classMatch[1].replace('icon', '').trim() : '';
    
    let placeholder = `<span class="icon-placeholder icon ${className}" data-icon="${iconName}" data-size="${size}" data-alt="${alt}" aria-label="${alt}"`;
    
    if (idMatch) {
        placeholder += ` id="${idMatch[1]}"`;
    }
    
    placeholder += '></span>';
    
    return content.replace(imgTag, placeholder);
}

/**
 * תיקון עמוד
 */
function fixPage(pageInfo) {
    const { file, images } = pageInfo;
    
    if (!fs.existsSync(file)) {
        console.log(`⚠️  File not found: ${file}`);
        return false;
    }
    
    try {
        let content = fs.readFileSync(file, 'utf-8');
        const originalContent = content;
        
        // Replace each image type
        images.forEach(iconName => {
            // Pattern: <img src="..." tabler/{iconName}.svg ...>
            const patterns = [
                // Absolute path
                new RegExp(`<img[^>]*src\\s*=\\s*["'][^"']*tabler/${iconName}\\.svg["'][^>]*>`, 'gi'),
                // Relative path
                new RegExp(`<img[^>]*src\\s*=\\s*["'][^"']*${iconName}\\.svg["'][^>]*>`, 'gi')
            ];
            
            patterns.forEach(pattern => {
                content = content.replace(pattern, (match) => {
                    return replaceImageWithIconPlaceholder(content, match, iconName);
                });
            });
        });
        
        if (content !== originalContent) {
            fs.writeFileSync(file, content, 'utf-8');
            console.log(`✅ Fixed: ${path.basename(file)}`);
            return true;
        } else {
            console.log(`ℹ️  No changes needed: ${path.basename(file)}`);
            return false;
        }
        
    } catch (error) {
        console.error(`❌ Error fixing ${file}: ${error.message}`);
        return false;
    }
}

/**
 * הרצה ראשית
 */
function main() {
    console.log('🔧 Fixing missing images by replacing with IconSystem...\n');
    
    let fixed = 0;
    
    PAGES_TO_FIX.forEach(pageInfo => {
        if (fixPage(pageInfo)) {
            fixed++;
        }
    });
    
    console.log(`\n📊 Summary:`);
    console.log(`   Pages fixed: ${fixed}`);
    console.log(`   Total: ${PAGES_TO_FIX.length}`);
}

if (require.main === module) {
    main();
}

module.exports = { fixPage, replaceImageWithIconPlaceholder };

