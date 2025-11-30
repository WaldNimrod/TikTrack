#!/usr/bin/env node

/**
 * Find Missing Resources in Mockup Pages
 * איתור משאבים חסרים (404 errors) בעמודי מוקאפ
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const BASE_DIR = path.resolve(__dirname, '..');
const MOCKUPS_DIR = path.join(BASE_DIR, 'trading-ui', 'mockups');
const DAILY_SNAPSHOTS_DIR = path.join(MOCKUPS_DIR, 'daily-snapshots');

// רשימת עמודי מוקאפ
const MOCKUP_PAGES = [
    { file: path.join(DAILY_SNAPSHOTS_DIR, 'comparative-analysis-page.html'), name: 'comparative-analysis-page' },
    { file: path.join(DAILY_SNAPSHOTS_DIR, 'date-comparison-modal.html'), name: 'date-comparison-modal' },
    { file: path.join(DAILY_SNAPSHOTS_DIR, 'economic-calendar-page.html'), name: 'economic-calendar-page' },
    { file: path.join(DAILY_SNAPSHOTS_DIR, 'emotional-tracking-widget.html'), name: 'emotional-tracking-widget' },
    { file: path.join(DAILY_SNAPSHOTS_DIR, 'history-widget.html'), name: 'history-widget' },
    { file: path.join(DAILY_SNAPSHOTS_DIR, 'portfolio-state-page.html'), name: 'portfolio-state-page' },
    { file: path.join(DAILY_SNAPSHOTS_DIR, 'price-history-page.html'), name: 'price-history-page' },
    { file: path.join(DAILY_SNAPSHOTS_DIR, 'strategy-analysis-page.html'), name: 'strategy-analysis-page' },
    { file: path.join(DAILY_SNAPSHOTS_DIR, 'trade-history-page.html'), name: 'trade-history-page' },
    { file: path.join(DAILY_SNAPSHOTS_DIR, 'trading-journal-page.html'), name: 'trading-journal-page' },
    { file: path.join(DAILY_SNAPSHOTS_DIR, 'tradingview-test-page.html'), name: 'tradingview-test-page' },
    { file: path.join(MOCKUPS_DIR, 'watch-lists-page.html'), name: 'watch-lists-page' },
];

const BASE_URL = 'http://localhost:8080';

/**
 * בדיקת קיום קובץ בשרת
 */
function checkResourceExists(url) {
    return new Promise((resolve) => {
        const urlObj = new URL(url, BASE_URL);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || 8080,
            path: urlObj.pathname + urlObj.search,
            method: 'HEAD',
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            resolve({
                exists: res.statusCode === 200,
                statusCode: res.statusCode,
                url: url
            });
        });

        req.on('error', () => {
            resolve({
                exists: false,
                statusCode: 0,
                url: url
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                exists: false,
                statusCode: 0,
                url: url,
                timeout: true
            });
        });

        req.end();
    });
}

/**
 * הפיכת נתיב יחסי למוחלט
 */
function resolvePath(relativePath, baseFile) {
    // אם כבר absolute (http/https), להחזיר כמו שהוא
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
        return relativePath;
    }

    // ניקוי query string
    const cleanPath = relativePath.split('?')[0];

    // אם מתחיל ב-/, זה נתיב מ-root של השרת
    if (cleanPath.startsWith('/')) {
        return cleanPath;
    }

    // אחרת, זה נתיב יחסי - לפתור מהקובץ הנוכחי
    const baseDir = path.dirname(baseFile);
    const resolved = path.resolve(baseDir, cleanPath);
    
    // המרה לנתיב יחסי מהשורש של trading-ui
    const tradingUiDir = path.join(BASE_DIR, 'trading-ui');
    if (resolved.startsWith(tradingUiDir)) {
        return '/' + path.relative(tradingUiDir, resolved).replace(/\\/g, '/');
    }

    return cleanPath;
}

/**
 * איתור כל המשאבים בעמוד
 */
function extractResources(content, filePath) {
    const resources = {
        scripts: [],
        stylesheets: [],
        images: [],
        other: []
    };

    // Scripts
    const scriptRegex = /<script[^>]*src\s*=\s*["']([^"']+)["']/gi;
    let match;
    while ((match = scriptRegex.exec(content)) !== null) {
        const src = match[1];
        if (!src.includes('://') || src.includes('localhost') || src.includes('127.0.0.1')) {
            resources.scripts.push({
                src: src,
                resolved: resolvePath(src, filePath),
                line: content.substring(0, match.index).split('\n').length
            });
        }
    }

    // Stylesheets
    const linkRegex = /<link[^>]*href\s*=\s*["']([^"']+)["'][^>]*rel\s*=\s*["']stylesheet["']/gi;
    while ((match = linkRegex.exec(content)) !== null) {
        const href = match[1];
        if (!href.includes('://') || href.includes('localhost') || href.includes('127.0.0.1')) {
            resources.stylesheets.push({
                href: href,
                resolved: resolvePath(href, filePath),
                line: content.substring(0, match.index).split('\n').length
            });
        }
    }

    // Images
    const imgRegex = /<img[^>]*src\s*=\s*["']([^"']+)["']/gi;
    while ((match = imgRegex.exec(content)) !== null) {
        const src = match[1];
        if (!src.includes('://') || src.includes('localhost') || src.includes('127.0.0.1')) {
            resources.images.push({
                src: src,
                resolved: resolvePath(src, filePath),
                line: content.substring(0, match.index).split('\n').length
            });
        }
    }

    return resources;
}

/**
 * סריקת עמוד
 */
async function scanPage(pageInfo) {
    const { file, name } = pageInfo;
    
    if (!fs.existsSync(file)) {
        return {
            name: name,
            error: 'File not found'
        };
    }

    const content = fs.readFileSync(file, 'utf-8');
    const resources = extractResources(content, file);

    const results = {
        name: name,
        file: file,
        resources: {
            scripts: [],
            stylesheets: [],
            images: [],
            other: []
        },
        missing: [],
        total: 0,
        missingCount: 0
    };

    // בדיקת scripts
    for (const script of resources.scripts) {
        results.total++;
        const checkResult = await checkResourceExists(script.resolved);
        
        if (!checkResult.exists) {
            results.missingCount++;
            results.missing.push({
                type: 'script',
                original: script.src,
                resolved: script.resolved,
                line: script.line,
                statusCode: checkResult.statusCode
            });
        } else {
            results.resources.scripts.push(script);
        }
    }

    // בדיקת stylesheets
    for (const stylesheet of resources.stylesheets) {
        results.total++;
        const checkResult = await checkResourceExists(stylesheet.resolved);
        
        if (!checkResult.exists) {
            results.missingCount++;
            results.missing.push({
                type: 'stylesheet',
                original: stylesheet.href,
                resolved: stylesheet.resolved,
                line: stylesheet.line,
                statusCode: checkResult.statusCode
            });
        } else {
            results.resources.stylesheets.push(stylesheet);
        }
    }

    // בדיקת images (רק קבצים מקומיים)
    for (const image of resources.images) {
        results.total++;
        // בדיקת קיום קובץ מקומי
        const imagePath = path.join(BASE_DIR, 'trading-ui', image.resolved.replace(/^\//, ''));
        const exists = fs.existsSync(imagePath);
        
        if (!exists) {
            results.missingCount++;
            results.missing.push({
                type: 'image',
                original: image.src,
                resolved: image.resolved,
                line: image.line,
                localPath: imagePath
            });
        } else {
            results.resources.images.push(image);
        }
    }

    return results;
}

/**
 * יצירת דוח
 */
function generateReport(allResults) {
    const timestamp = new Date().toISOString();
    const totalMissing = allResults.reduce((sum, r) => sum + (r.missingCount || 0), 0);
    const pagesWithMissing = allResults.filter(r => r.missingCount > 0).length;

    let report = `# דוח משאבים חסרים - עמודי מוקאפ
# Missing Resources Report - Mockups Pages

**תאריך:** ${new Date(timestamp).toLocaleString('he-IL')}  
**סה"כ עמודים:** ${allResults.length}  
**עמודים עם משאבים חסרים:** ${pagesWithMissing}  
**סה"כ משאבים חסרים:** ${totalMissing}

---

## סיכום כללי

`;

    // חלוקה לפי סוג
    const byType = {
        script: 0,
        stylesheet: 0,
        image: 0,
        other: 0
    };

    allResults.forEach(result => {
        result.missing.forEach(item => {
            byType[item.type] = (byType[item.type] || 0) + 1;
        });
    });

    report += `### חלוקה לפי סוג משאב:
- **Scripts:** ${byType.script}
- **Stylesheets:** ${byType.stylesheet}
- **Images:** ${byType.image}
- **Other:** ${byType.other}

---

## דוח פרטני לכל עמוד

`;

    // דוח לכל עמוד
    allResults.forEach(result => {
        if (result.error) {
            report += `### ❌ ${result.name}\n\n`;
            report += `**שגיאה:** ${result.error}\n\n`;
            report += `---\n\n`;
            return;
        }

        const status = result.missingCount === 0 ? '✅' : '❌';
        
        report += `### ${status} ${result.name}\n\n`;
        report += `**משאבים סה"כ:** ${result.total}\n`;
        report += `**משאבים חסרים:** ${result.missingCount}\n\n`;

        if (result.missingCount > 0) {
            report += `#### משאבים חסרים:\n\n`;
            
            result.missing.forEach(item => {
                report += `- **${item.type}:** \`${item.original}\`\n`;
                report += `  - נתיב מפולס: \`${item.resolved}\`\n`;
                report += `  - שורה: ${item.line}\n`;
                if (item.statusCode) {
                    report += `  - Status: ${item.statusCode}\n`;
                }
                if (item.localPath) {
                    report += `  - נתיב מקומי: \`${item.localPath}\`\n`;
                }
                report += `\n`;
            });
        }

        report += `---\n\n`;
    });

    return report;
}

/**
 * הרצה ראשית
 */
async function main() {
    console.log('🔍 Scanning mockup pages for missing resources...\n');
    console.log(`🌐 Base URL: ${BASE_URL}\n`);

    const allResults = [];

    for (const pageInfo of MOCKUP_PAGES) {
        console.log(`Scanning: ${pageInfo.name}...`);
        const result = await scanPage(pageInfo);
        allResults.push(result);
        
        const status = result.missingCount === 0 ? '✅' : '❌';
        console.log(`  ${status} ${pageInfo.name} - ${result.missingCount || 0} missing resources`);
    }

    console.log('\n✅ Scan complete!\n');

    // יצירת דוח
    const report = generateReport(allResults);
    
    // שמירת דוח
    const reportPath = path.join(BASE_DIR, 'trading-ui', 'mockups', 'MISSING_RESOURCES_REPORT.md');
    fs.writeFileSync(reportPath, report, 'utf-8');
    
    console.log(`📄 Report saved: ${reportPath}`);
    
    // סיכום
    const totalMissing = allResults.reduce((sum, r) => sum + (r.missingCount || 0), 0);
    const pagesWithMissing = allResults.filter(r => r.missingCount > 0).length;
    
    console.log(`\n📊 Summary:`);
    console.log(`   Pages with missing resources: ${pagesWithMissing}`);
    console.log(`   Total missing resources: ${totalMissing}`);
}

if (require.main === module) {
    main().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { scanPage, extractResources, resolvePath };

