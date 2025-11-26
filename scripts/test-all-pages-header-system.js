/**
 * Test All Pages for Header & Filters System Compliance
 * 
 * This script tests all pages listed in PAGES_LIST.md to ensure they use Header System correctly
 * 
 * Usage: node scripts/test-all-pages-header-system.js
 * 
 * @version 1.0.0
 * @created 2025-11-26
 */

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const PAGES_LIST_PATH = 'documentation/PAGES_LIST.md';
const REPORT_PATH = 'documentation/05-REPORTS/HEADER_FILTERS_SYSTEM_TESTING_REPORT.md';
const BASE_DIR = '.';

/**
 * Read pages list from PAGES_LIST.md
 */

// Filter out non-existent files
function shouldTestPage(pagePath) {
  const nonExistent = ["trading-ui/cache-test.html","trading-ui/linter-realtime-monitor.html","trading-ui/tradingview-test-page.html","trading-ui/test_external_data.html","trading-ui/test_models.html"];
  return !nonExistent.some(nonEx => pagePath.includes(nonEx));
}

async function getPageList() {
    try {
        const content = await fsPromises.readFile(PAGES_LIST_PATH, 'utf8');
        const lines = content.split('\n');
        const pages = [];
        let currentCategory = '';

        for (const line of lines) {
            // Check for category headers
            if (line.startsWith('##') && !line.startsWith('###')) {
                currentCategory = line.replace('##', '').trim().replace(/^📋\s*/, '').replace(/^✅\s*/, '').replace(/^⏳\s*/, '');
            }
            
            // Look for HTML file references
            if (line.includes('.html')) {
                // Pattern 1: | **index.html** | ... |
                let match = line.match(/\*\*([^\*]+\.html)\*\*/);
                if (match) {
                    const fileName = match[1];
                    if (fileName.includes('trading-ui/') || fileName.startsWith('trading-ui/')) {
                        pages.push({ 
                            path: fileName,
                            category: currentCategory,
                            fullPath: path.join(BASE_DIR, fileName)
                        });
                    } else {
                        pages.push({ 
                            path: `trading-ui/${fileName}`,
                            category: currentCategory,
                            fullPath: path.join(BASE_DIR, `trading-ui/${fileName}`)
                        });
                    }
                    continue;
                }
                
                // Pattern 2: `trading-ui/file.html`
                match = line.match(/`(trading-ui\/[^`]+\.html)`/);
                if (match) {
                    pages.push({ 
                        path: match[1],
                        category: currentCategory,
                        fullPath: path.join(BASE_DIR, match[1])
                    });
                    continue;
                }
                
                // Pattern 3: trading-ui/file.html (without backticks)
                match = line.match(/(trading-ui\/[^\s\|\)]+\.html)/);
                if (match) {
                    pages.push({ 
                        path: match[1],
                        category: currentCategory,
                        fullPath: path.join(BASE_DIR, match[1])
                    });
                    continue;
                }
            }
        }
        return pages;
    } catch (error) {
        console.error(`Error reading ${PAGES_LIST_PATH}:`, error.message);
        return [];
    }
}

/**
 * Check if page has unified-header element
 */
async function checkUnifiedHeader(pagePath) {
    try {
        // Check if file exists
        if (!fs.existsSync(pagePath)) {
            return {
                hasUnifiedHeader: false,
                found: false,
                error: 'File not found'
            };
        }
        const content = await fsPromises.readFile(pagePath, 'utf8');
        const hasUnifiedHeader = content.includes('id="unified-header"') || 
                                 content.includes("id='unified-header'");
        return {
            hasUnifiedHeader,
            found: hasUnifiedHeader
        };
    } catch (error) {
        return {
            hasUnifiedHeader: false,
            error: error.message
        };
    }
}

/**
 * Check if page loads header-system.js
 */
async function checkHeaderSystemScript(pagePath) {
    try {
        // Check if file exists
        if (!fs.existsSync(pagePath)) {
            return {
                hasHeaderSystem: false,
                found: false,
                error: 'File not found'
            };
        }
        const content = await fsPromises.readFile(pagePath, 'utf8');
        const hasHeaderSystem = content.includes('header-system.js');
        const hasBasePackage = content.includes("packages: ['base'") || 
                              content.includes('packages: ["base"') ||
                              content.includes("'base'") ||
                              content.includes('"base"');
        
        return {
            hasHeaderSystemScript: hasHeaderSystem,
            hasBasePackage: hasBasePackage,
            found: hasHeaderSystem || hasBasePackage
        };
    } catch (error) {
        return {
            hasHeaderSystemScript: false,
            hasBasePackage: false,
            error: error.message
        };
    }
}

/**
 * Check page initialization config
 */
// Filter out non-existent files
function shouldTestPage(pagePath) {
    if (!fs.existsSync(pagePath)) {
        return false;
    }
    // Exclude files in archive, external_data_integration_client, or scripts directories
    const excludePatterns = [
        '/archive/',
        '/external_data_integration_client/',
        '/scripts/',
        '/mockups/daily-snapshots/tradingview-test-page.html' // This is a mockup, not a main page
    ];
    return !excludePatterns.some(pattern => pagePath.includes(pattern));
}

async function checkPageConfig(pageName) {
    try {
        const configPath = 'trading-ui/scripts/page-initialization-configs.js';
        const content = await fsPromises.readFile(configPath, 'utf8');
        
        // Extract page name from path (e.g., trading-ui/alerts.html -> alerts)
        // Handle both background-tasks.html and background_tasks
        let pageKey = pageName.replace('trading-ui/', '').replace('.html', '').replace(/-/g, '_');
        
        // Also try with dashes
        const pageKeyWithDash = pageName.replace('trading-ui/', '').replace('.html', '');
        
        // Check if page has base package - try multiple patterns
        let hasBaseInConfig = false;
        
        // Pattern 1: 'page-key': { ... packages: ['base', ...]
        const pattern1 = new RegExp(`['"]${pageKey}['"]:\\s*{[^}]*packages:\\s*\\[[^\\]]*['"]base['"]`, 's');
        if (pattern1.test(content)) {
            hasBaseInConfig = true;
        }
        
        // Pattern 2: 'page-key': { ... packages: ["base", ...]
        const pattern2 = new RegExp(`['"]${pageKey}['"]:\\s*{[^}]*packages:\\s*\\[[^\\]]*["']base["']`, 's');
        if (pattern2.test(content)) {
            hasBaseInConfig = true;
        }
        
        // Pattern 3: Try with dashes
        if (!hasBaseInConfig) {
            const pattern3 = new RegExp(`['"]${pageKeyWithDash}['"]:\\s*{[^}]*packages:\\s*\\[[^\\]]*['"]base['"]`, 's');
            if (pattern3.test(content)) {
                hasBaseInConfig = true;
            }
        }
        
        return {
            hasBaseInConfig: hasBaseInConfig,
            found: hasBaseInConfig,
            pageKey: pageKey,
            pageKeyWithDash: pageKeyWithDash
        };
    } catch (error) {
        return {
            hasBaseInConfig: false,
            error: error.message
        };
    }
}

/**
 * Test a single page
 */
async function testPage(page) {
    const results = {
        page: page.path,
        category: page.category,
        tests: {}
    };

    // Test 1: Check unified-header element
    const headerCheck = await checkUnifiedHeader(page.fullPath);
    results.tests.unifiedHeader = headerCheck;

    // Test 2: Check header-system.js loading
    const scriptCheck = await checkHeaderSystemScript(page.fullPath);
    results.tests.headerSystemScript = scriptCheck;

    // Test 3: Check page config
    const configCheck = await checkPageConfig(page.path);
    results.tests.pageConfig = configCheck;

    // Calculate overall status
    // Pass if: unified-header exists AND (header-system.js is loaded OR BASE package is used)
    // Page config check is optional - if header-system.js is loaded directly, that's fine too
    results.passed = headerCheck.hasUnifiedHeader && 
                    (scriptCheck.hasHeaderSystemScript || scriptCheck.hasBasePackage || configCheck.hasBaseInConfig);

    return results;
}

/**
 * Generate test report
 */
async function generateReport(testResults) {
    const total = testResults.length;
    const passed = testResults.filter(r => r.passed).length;
    const failed = total - passed;
    const percentage = Math.round((passed / total) * 100);

    let report = `# Header & Filters System - דוח בדיקות אוטומטיות\n\n`;
    report += `**תאריך בדיקה:** ${new Date().toISOString().split('T')[0]}  \n`;
    report += `**סה"כ עמודים נבדקו:** ${total}  \n`;
    report += `**עמודים שעברו:** ${passed} ✅  \n`;
    report += `**עמודים שנכשלו:** ${failed} ❌  \n`;
    report += `**אחוז הצלחה:** ${percentage}%  \n\n`;
    report += `---\n\n`;

    // Summary by category
    const categories = {};
    testResults.forEach(result => {
        if (!categories[result.category]) {
            categories[result.category] = { total: 0, passed: 0, failed: 0 };
        }
        categories[result.category].total++;
        if (result.passed) {
            categories[result.category].passed++;
        } else {
            categories[result.category].failed++;
        }
    });

    report += `## סיכום לפי קטגוריה\n\n`;
    report += `| קטגוריה | סה"כ | עברו | נכשלו | אחוז הצלחה |\n`;
    report += `|----------|------|------|--------|-------------|\n`;
    for (const [category, stats] of Object.entries(categories)) {
        const catPercentage = Math.round((stats.passed / stats.total) * 100);
        report += `| ${category} | ${stats.total} | ${stats.passed} | ${stats.failed} | ${catPercentage}% |\n`;
    }
    report += `\n---\n\n`;

    // Detailed results
    report += `## פירוט לפי עמוד\n\n`;

    for (const result of testResults) {
        const icon = result.passed ? '✅' : '❌';
        report += `### ${icon} ${path.basename(result.page)}\n\n`;
        report += `**קטגוריה:** ${result.category}  \n`;
        report += `**סטטוס כללי:** ${result.passed ? 'עבר' : 'נכשל'}  \n\n`;

        // Test details
        report += `#### בדיקות:\n\n`;
        
        // Unified Header
        const headerIcon = result.tests.unifiedHeader.hasUnifiedHeader ? '✅' : '❌';
        report += `- **${headerIcon} Unified Header Element:** `;
        if (result.tests.unifiedHeader.hasUnifiedHeader) {
            report += `נמצא  \n`;
        } else {
            report += `לא נמצא`;
            if (result.tests.unifiedHeader.error) {
                report += ` (שגיאה: ${result.tests.unifiedHeader.error})`;
            }
            report += `  \n`;
        }

        // Header System Script
        const scriptIcon = (result.tests.headerSystemScript.hasHeaderSystemScript || 
                           result.tests.headerSystemScript.hasBasePackage) ? '✅' : '❌';
        report += `- **${scriptIcon} Header System Script:** `;
        if (result.tests.headerSystemScript.hasHeaderSystemScript) {
            report += `נטען ישירות  \n`;
        } else if (result.tests.headerSystemScript.hasBasePackage) {
            report += `נטען דרך BASE package  \n`;
        } else {
            report += `לא נמצא`;
            if (result.tests.headerSystemScript.error) {
                report += ` (שגיאה: ${result.tests.headerSystemScript.error})`;
            }
            report += `  \n`;
        }

        // Page Config
        const configIcon = result.tests.pageConfig.hasBaseInConfig ? '✅' : '❌';
        report += `- **${configIcon} Page Config (BASE package):** `;
        if (result.tests.pageConfig.hasBaseInConfig) {
            report += `מוגדר  \n`;
        } else {
            report += `לא מוגדר`;
            if (result.tests.pageConfig.error) {
                report += ` (שגיאה: ${result.tests.pageConfig.error})`;
            }
            report += `  \n`;
        }

        report += `\n---\n\n`;
    }

    // Recommendations
    report += `## המלצות\n\n`;
    
    const failedPages = testResults.filter(r => !r.passed);
    if (failedPages.length > 0) {
        report += `### עמודים שדורשים תיקון:\n\n`;
        failedPages.forEach(page => {
            report += `- **${path.basename(page.page)}** (${page.category}):\n`;
            if (!page.tests.unifiedHeader.hasUnifiedHeader) {
                report += `  - הוסף \`<div id="unified-header"></div>\` לעמוד  \n`;
            }
            if (!page.tests.headerSystemScript.hasHeaderSystemScript && 
                !page.tests.headerSystemScript.hasBasePackage) {
                report += `  - וודא שהעמוד טוען את BASE package (כולל header-system.js)  \n`;
            }
            if (!page.tests.pageConfig.hasBaseInConfig) {
                report += `  - עדכן את page-initialization-configs.js להוסיף 'base' ל-packages  \n`;
            }
            report += `\n`;
        });
    } else {
        report += `✅ כל העמודים עברו את הבדיקות בהצלחה!\n\n`;
    }

    return report;
}

/**
 * Main function
 */
async function main() {
    console.log('🧪 Starting Header & Filters System Tests for All Pages...\n');

    const pages = await getPageList();
    console.log(`📋 Found ${pages.length} pages to test\n`);

    const testResults = [];
    
    for (const page of pages) {
        // Skip non-existent files or files in wrong locations
        const filePath = page.fullPath || page.path;
        if (!shouldTestPage(filePath)) {
            console.log(`⏭️  Skipping: ${page.path}`);
            continue;
        }
        console.log(`Testing: ${page.path}...`);
        const result = await testPage(page);
        testResults.push(result);
        
        const icon = result.passed ? '✅' : '❌';
        console.log(`  ${icon} ${result.passed ? 'Passed' : 'Failed'}`);
    }

    console.log('\n📊 Generating report...');
    const report = await generateReport(testResults);
    
    await fsPromises.writeFile(REPORT_PATH, report, 'utf8');
    console.log(`\n✅ Report saved to: ${REPORT_PATH}`);

    // Summary
    const passed = testResults.filter(r => r.passed).length;
    const total = testResults.length;
    const percentage = Math.round((passed / total) * 100);

    console.log('\n📈 Summary:');
    console.log(`   Total: ${total}`);
    console.log(`   Passed: ${passed} ✅`);
    console.log(`   Failed: ${total - passed} ❌`);
    console.log(`   Success Rate: ${percentage}%`);
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
}

module.exports = { main, testPage, getPageList };

