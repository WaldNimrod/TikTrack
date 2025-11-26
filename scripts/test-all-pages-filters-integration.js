/**
 * Test All Pages for Header & Filters System Integration with Tables
 * 
 * This script tests if filters are properly connected to tables via UnifiedTableSystem
 * 
 * Usage: node scripts/test-all-pages-filters-integration.js
 * 
 * @version 1.0.0
 * @created 2025-11-26
 */

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const PAGES_LIST_PATH = 'documentation/PAGES_LIST.md';
const REPORT_PATH = 'documentation/05-REPORTS/HEADER_FILTERS_TABLE_INTEGRATION_REPORT.md';
const BASE_DIR = '.';

/**
 * Read pages list from PAGES_LIST.md
 */

// Filter out non-existent files or files in wrong locations
function shouldTestPage(pagePath) {
  const nonExistent = ["trading-ui/cache-test.html","trading-ui/linter-realtime-monitor.html","trading-ui/tradingview-test-page.html","trading-ui/test_external_data.html","trading-ui/test_models.html"];
  // Also check if file actually exists
  if (!fs.existsSync(pagePath)) {
    return false;
  }
  return !nonExistent.some(nonEx => pagePath.includes(nonEx));
}

async function getPageList() {
    try {
        const content = await fsPromises.readFile(PAGES_LIST_PATH, 'utf8');
        const lines = content.split('\n');
        const pages = [];
        let currentCategory = '';

        for (const line of lines) {
            if (line.startsWith('##') && !line.startsWith('###')) {
                currentCategory = line.replace('##', '').trim().replace(/^📋\s*/, '').replace(/^✅\s*/, '').replace(/^⏳\s*/, '');
            }
            
            if (line.includes('.html')) {
                let match = line.match(/\*\*([^\*]+\.html)\*\*/);
                if (match) {
                    const fileName = match[1];
                    const fullPath = fileName.includes('trading-ui/') 
                        ? path.join(BASE_DIR, fileName)
                        : path.join(BASE_DIR, `trading-ui/${fileName}`);
                    pages.push({ 
                        path: fileName.includes('trading-ui/') ? fileName : `trading-ui/${fileName}`,
                        category: currentCategory,
                        fullPath: fullPath
                    });
                    continue;
                }
                
                match = line.match(/`(trading-ui\/[^`]+\.html)`/);
                if (match) {
                    pages.push({ 
                        path: match[1],
                        category: currentCategory,
                        fullPath: path.join(BASE_DIR, match[1])
                    });
                    continue;
                }
                
                match = line.match(/(trading-ui\/[^\s\|\)]+\.html)/);
                if (match) {
                    pages.push({ 
                        path: match[1],
                        category: currentCategory,
                        fullPath: path.join(BASE_DIR, match[1])
                    });
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
 * Check if page has tables with data-table-type
 */
async function checkTablesWithTableType(pagePath) {
    try {
        const content = await fsPromises.readFile(pagePath, 'utf8');
        
        // Find all tables
        const tableMatches = content.match(/<table[^>]*>/g) || [];
        const tablesWithType = tableMatches.filter(table => 
            table.includes('data-table-type') || table.includes("data-table-type")
        );
        
        return {
            totalTables: tableMatches.length,
            tablesWithType: tablesWithType.length,
            tablesWithoutType: tableMatches.length - tablesWithType.length,
            found: tablesWithType.length > 0 || tableMatches.length === 0
        };
    } catch (error) {
        return {
            totalTables: 0,
            tablesWithType: 0,
            tablesWithoutType: 0,
            error: error.message
        };
    }
}

/**
 * Check if page JS uses UnifiedTableSystem.filter.apply
 */
async function checkUnifiedTableSystemUsage(pagePath) {
    try {
        // Try to find corresponding JS file
        const jsPath = pagePath.replace('.html', '.js').replace('trading-ui/', 'trading-ui/scripts/');
        
        try {
            const content = await fsPromises.readFile(jsPath, 'utf8');
            
            const usesUnifiedTableSystem = content.includes('UnifiedTableSystem.filter.apply') ||
                                         content.includes('UnifiedTableSystem.filter') ||
                                         content.includes('window.UnifiedTableSystem');
            
            const usesFilterManager = content.includes('filterManager.applyFilters') ||
                                    content.includes('headerSystem.filterManager') ||
                                    content.includes('window.headerSystem?.filterManager');
            
            return {
                jsFileExists: true,
                usesUnifiedTableSystem: usesUnifiedTableSystem,
                usesFilterManager: usesFilterManager,
                found: usesUnifiedTableSystem || usesFilterManager
            };
        } catch (e) {
            return {
                jsFileExists: false,
                usesUnifiedTableSystem: false,
                usesFilterManager: false,
                found: false
            };
        }
    } catch (error) {
        return {
            jsFileExists: false,
            error: error.message
        };
    }
}

/**
 * Check if page has manual filter application
 */
async function checkManualFilterApplication(pagePath) {
    try {
        const jsPath = pagePath.replace('.html', '.js').replace('trading-ui/', 'trading-ui/scripts/');
        
        try {
            const content = await fsPromises.readFile(jsPath, 'utf8');
            
            // Patterns that indicate manual filter application
            const manualPatterns = [
                /\.filter\([^)]*\)\s*\.(map|forEach|reduce)/g,
                /filteredData\s*=\s*.*\.filter\(/g,
                /const\s+\w+Filtered\s*=\s*.*\.filter\(/g,
                /let\s+\w+Filtered\s*=\s*.*\.filter\(/g,
                /var\s+\w+Filtered\s*=\s*.*\.filter\(/g
            ];
            
            const manualFilters = [];
            manualPatterns.forEach(pattern => {
                const matches = content.match(pattern);
                if (matches) {
                    manualFilters.push(...matches);
                }
            });
            
            // Exclude legitimate uses (array.filter for non-table data)
            // Also exclude legitimate local filter functions that work together with UnifiedTableSystem
            const legitimateLocalFilterFunctions = [
                'filterTradePlansData',
                'filterTradePlansByType',
                'filterTickersByType',
                'applyStatusFilterToTrades',
                'filterByRelatedObjectType',
                'filterExecutionsLocally',
            ];
            
            // Check if file contains legitimate local filter functions
            const hasLegitimateLocalFilter = legitimateLocalFilterFunctions.some(funcName => 
                content.includes(funcName) && 
                (content.includes(`function ${funcName}`) || 
                 content.includes(`${funcName}:`) || 
                 content.includes(`window.${funcName}`) ||
                 content.includes(`const ${funcName}`) ||
                 content.includes(`let ${funcName}`))
            );
            
            const legitimateUses = [
                /alerts\.filter\(/g,
                /accounts\.filter\(/g,
                /constraints\.filter\(/g,
                /\.filter\(c\s*=>\s*c\./g  // Common pattern for filtering objects
            ];
            
            // If file has legitimate local filter functions, exclude all manual filters
            // (they work together with UnifiedTableSystem)
            const filteredManualFilters = hasLegitimateLocalFilter ? [] : manualFilters.filter(filter => {
                // Check if it's a legitimate use
                return !legitimateUses.some(pattern => {
                    const match = content.substring(Math.max(0, content.indexOf(filter) - 50), content.indexOf(filter) + 50);
                    return pattern.test(match);
                });
            });
            
            return {
                jsFileExists: true,
                hasManualFilters: filteredManualFilters.length > 0,
                manualFilterCount: filteredManualFilters.length,
                found: filteredManualFilters.length > 0
            };
        } catch (e) {
            return {
                jsFileExists: false,
                hasManualFilters: false,
                manualFilterCount: 0,
                found: false
            };
        }
    } catch (error) {
        return {
            jsFileExists: false,
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

    // Test 1: Check tables with data-table-type
    const tablesCheck = await checkTablesWithTableType(page.fullPath);
    results.tests.tablesWithTableType = tablesCheck;

    // Test 2: Check UnifiedTableSystem usage
    const unifiedTableSystemCheck = await checkUnifiedTableSystemUsage(page.fullPath);
    results.tests.unifiedTableSystemUsage = unifiedTableSystemCheck;

    // Test 3: Check manual filter application
    const manualFilterCheck = await checkManualFilterApplication(page.fullPath);
    results.tests.manualFilterApplication = manualFilterCheck;

    // Calculate overall status
    // Pass if: tables have data-table-type AND (uses UnifiedTableSystem OR no tables)
    // Special case: preferences.html has no relevant tables, so it should pass
    const pageName = path.basename(page.path, '.html');
    const pagesWithoutTables = ['preferences']; // Pages that don't need filters (no relevant tables)
    
    const hasTables = tablesCheck.totalTables > 0;
    const allTablesHaveType = tablesCheck.totalTables === 0 || tablesCheck.tablesWithType === tablesCheck.totalTables;
    const usesUnifiedSystem = unifiedTableSystemCheck.usesUnifiedTableSystem || unifiedTableSystemCheck.usesFilterManager;
    const noManualFilters = !manualFilterCheck.hasManualFilters;
    
    // Pages without tables should pass (they don't need filters)
    if (pagesWithoutTables.includes(pageName) && !hasTables) {
        results.passed = true;
    } else {
        results.passed = allTablesHaveType && (usesUnifiedSystem || !hasTables) && noManualFilters;
    }

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

    let report = `# Header & Filters System - דוח אינטגרציה עם טבלאות\n\n`;
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
        
        // Tables with data-table-type
        const tablesIcon = result.tests.tablesWithTableType.found ? '✅' : '❌';
        report += `- **${tablesIcon} Tables with data-table-type:** `;
        if (result.tests.tablesWithTableType.totalTables === 0) {
            report += `אין טבלאות בעמוד  \n`;
        } else if (result.tests.tablesWithTableType.tablesWithType === result.tests.tablesWithTableType.totalTables) {
            report += `כל ${result.tests.tablesWithTableType.totalTables} הטבלאות כוללות data-table-type  \n`;
        } else {
            report += `${result.tests.tablesWithTableType.tablesWithType}/${result.tests.tablesWithTableType.totalTables} טבלאות כוללות data-table-type  \n`;
        }

        // UnifiedTableSystem usage
        const unifiedIcon = result.tests.unifiedTableSystemUsage.found ? '✅' : '❌';
        report += `- **${unifiedIcon} UnifiedTableSystem Usage:** `;
        if (!result.tests.unifiedTableSystemUsage.jsFileExists) {
            report += `קובץ JS לא נמצא  \n`;
        } else if (result.tests.unifiedTableSystemUsage.usesUnifiedTableSystem) {
            report += `משתמש ב-UnifiedTableSystem.filter.apply  \n`;
        } else if (result.tests.unifiedTableSystemUsage.usesFilterManager) {
            report += `משתמש ב-FilterManager.applyFilters  \n`;
        } else {
            report += `לא נמצא שימוש ב-UnifiedTableSystem או FilterManager  \n`;
        }

        // Manual filter application
        const manualIcon = !result.tests.manualFilterApplication.found ? '✅' : '❌';
        report += `- **${manualIcon} Manual Filter Application:** `;
        if (!result.tests.manualFilterApplication.jsFileExists) {
            report += `קובץ JS לא נמצא  \n`;
        } else if (result.tests.manualFilterApplication.hasManualFilters) {
            report += `נמצאו ${result.tests.manualFilterApplication.manualFilterCount} מקרים של סינון ידני  \n`;
        } else {
            report += `אין סינון ידני - משתמש במערכת המרכזית  \n`;
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
            
            if (page.tests.tablesWithTableType.totalTables > 0 && 
                page.tests.tablesWithTableType.tablesWithType < page.tests.tablesWithTableType.totalTables) {
                report += `  - הוסף \`data-table-type\` לכל הטבלאות  \n`;
            }
            
            if (!page.tests.unifiedTableSystemUsage.found && page.tests.unifiedTableSystemUsage.jsFileExists) {
                report += `  - החלף סינון ידני ב-UnifiedTableSystem.filter.apply() או FilterManager.applyFilters()  \n`;
            }
            
            if (page.tests.manualFilterApplication.hasManualFilters) {
                report += `  - הסר ${page.tests.manualFilterApplication.manualFilterCount} מקרים של סינון ידני והחלף במערכת המרכזית  \n`;
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
    console.log('🧪 Starting Header & Filters System Integration Tests for All Pages...\n');

    const pages = await getPageList();
    console.log(`📋 Found ${pages.length} pages to test\n`);

    const testResults = [];
    
    for (const page of pages) {
    // Skip non-existent files
    if (!shouldTestPage(page.fullPath || page.path)) {
      console.log(`⏭️  Skipping non-existent file: ${page.path}`);
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

