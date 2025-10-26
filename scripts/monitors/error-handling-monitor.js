#!/usr/bin/env node

/**
 * Error Handling Coverage Monitor - TikTrack
 * ===========================================
 * 
 * Checks error handling coverage in all user pages
 * Identifies functions without try-catch blocks
 * Generates a comprehensive report
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    scriptsDir: '../trading-ui/scripts',
    outputDir: '../reports',
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
    excludePatterns: ['node_modules', '.backup', 'enhancements', 'modules', 'debug', 'services', 'conditions']
};

/**
 * Main execution function
 */
async function main() {
    try {
        console.log('🔍 Starting Error Handling Coverage Monitor...\n');
        
        const results = {
            timestamp: new Date().toISOString(),
            pages: [],
            summary: {
                total: 0,
                withCoverage: 0,
                withoutCoverage: 0,
                coveragePercentage: 0
            }
        };

        // Process each core page
        for (const page of CONFIG.corePages) {
            const pagePath = path.join(CONFIG.scriptsDir, page);
            
            if (!fs.existsSync(pagePath)) {
                console.log(`⚠️  File not found: ${page}`);
                continue;
            }

            console.log(`📄 Analyzing: ${page}`);
            const pageResult = await analyzePage(pagePath, page);
            results.pages.push(pageResult);
            results.summary.total += pageResult.totalFunctions;
            results.summary.withCoverage += pageResult.functionsWithCoverage;
            results.summary.withoutCoverage += pageResult.functionsWithoutCoverage;
        }

        // Calculate overall coverage
        results.summary.coveragePercentage = results.summary.total > 0
            ? ((results.summary.withCoverage / results.summary.total) * 100).toFixed(2)
            : 0;

        // Generate report
        await generateReport(results);

        // Print summary
        printSummary(results);

        console.log('\n✅ Analysis completed successfully!');
        console.log(`📊 Report saved to: ${CONFIG.outputDir}/error-handling-coverage-${Date.now()}.json`);

    } catch (error) {
        console.error('❌ Error running monitor:', error.message);
        process.exit(1);
    }
}

/**
 * Analyze a single page
 */
function analyzePage(filePath, fileName) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find all function declarations
    const functionPattern = /^\s*(?:async\s+)?function\s+(\w+)\s*\(/gm;
    const functions = [];
    let match;

    while ((match = functionPattern.exec(content)) !== null) {
        functions.push({
            name: match[1],
            startPos: match.index,
            hasTryCatch: false
        });
    }

    // Check each function for try-catch
    functions.forEach(func => {
        func.hasTryCatch = checkFunctionForTryCatch(content, func);
    });

    const functionsWithCoverage = functions.filter(f => f.hasTryCatch).length;
    const functionsWithoutCoverage = functions.length - functionsWithCoverage;

    return {
        file: fileName,
        totalFunctions: functions.length,
        functionsWithCoverage: functionsWithCoverage,
        functionsWithoutCoverage: functionsWithoutCoverage,
        coveragePercentage: functions.length > 0 
            ? ((functionsWithCoverage / functions.length) * 100).toFixed(2) 
            : '0.00',
        functions: functions.map(f => ({
            name: f.name,
            hasTryCatch: f.hasTryCatch
        }))
    };
}

/**
 * Check if a function has try-catch block
 */
function checkFunctionForTryCatch(content, func) {
    // Find the function body
    let depth = 0;
    let inFunction = false;
    let braceCount = 0;
    
    for (let i = func.startPos; i < content.length; i++) {
        const char = content[i];
        
        if (char === '{') {
            braceCount++;
            inFunction = true;
        } else if (char === '}') {
            braceCount--;
            if (inFunction && braceCount === 0) {
                // End of function, check if we found try-catch
                const functionBody = content.substring(func.startPos, i);
                return functionBody.includes('try {') && functionBody.includes('catch (');
            }
        }
    }

    return false;
}

/**
 * Generate report file
 */
async function generateReport(results) {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(CONFIG.outputDir)) {
        fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    // Save JSON report
    const jsonReport = {
        ...results,
        generatedAt: new Date().toISOString(),
        version: '1.0.0'
    };

    const jsonPath = path.join(CONFIG.outputDir, `error-handling-coverage-${Date.now()}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));

    // Generate markdown report
    const mdReport = generateMarkdownReport(results);
    const mdPath = path.join(CONFIG.outputDir, `error-handling-coverage-${Date.now()}.md`);
    fs.writeFileSync(mdPath, mdReport);

    console.log(`📝 Reports saved: ${jsonPath} and ${mdPath}`);
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(results) {
    let report = '# Error Handling Coverage Report\n\n';
    report += `**Generated**: ${new Date().toLocaleString()}\n\n`;
    report += '---\n\n';

    // Summary
    report += '## Summary\n\n';
    report += `- **Total Functions**: ${results.summary.total}\n`;
    report += `- **With Coverage**: ${results.summary.withCoverage}\n`;
    report += `- **Without Coverage**: ${results.summary.withoutCoverage}\n`;
    report += `- **Coverage**: ${results.summary.coveragePercentage}%\n\n`;
    report += '---\n\n';

    // Per-page details
    report += '## Per-Page Details\n\n';

    results.pages.forEach(page => {
        const status = parseFloat(page.coveragePercentage) >= 90 ? '✅' : '⚠️';
        
        report += `### ${status} ${page.file}\n\n`;
        report += `- **Total Functions**: ${page.totalFunctions}\n`;
        report += `- **Coverage**: ${page.coveragePercentage}%\n\n`;

        // List functions without coverage
        if (page.functionsWithoutCoverage > 0) {
            report += '**Functions without try-catch:**\n';
            page.functions
                .filter(f => !f.hasTryCatch)
                .forEach(f => {
                    report += `- \`${f.name}()\`\n`;
                });
            report += '\n';
        }

        report += '---\n\n';
    });

    // Recommendations
    report += '## Recommendations\n\n';
    
    const pagesNeedingWork = results.pages.filter(p => parseFloat(p.coveragePercentage) < 90);
    
    if (pagesNeedingWork.length === 0) {
        report += '✅ All pages meet the 90% coverage target!\n\n';
    } else {
        report += `⚠️  **${pagesNeedingWork.length} pages** need improvement:\n\n`;
        pagesNeedingWork.forEach(page => {
            report += `- **${page.file}**: ${page.coveragePercentage}% coverage (need ${90 - parseFloat(page.coveragePercentage)}% more)\n`;
        });
        report += '\n';
    }

    return report;
}

/**
 * Print summary to console
 */
function printSummary(results) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 ERROR HANDLING COVERAGE SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Functions:     ${results.summary.total}`);
    console.log(`With Coverage:       ${results.summary.withCoverage}`);
    console.log(`Without Coverage:    ${results.summary.withoutCoverage}`);
    console.log(`Coverage:            ${results.summary.coveragePercentage}%`);
    console.log('='.repeat(60) + '\n');

    results.pages.forEach(page => {
        const status = parseFloat(page.coveragePercentage) >= 90 ? '✅' : '⚠️';
        console.log(`${status} ${page.file.padEnd(25)} ${page.coveragePercentage.padStart(6)}%`);
    });
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    main,
    analyzePage,
    checkFunctionForTryCatch
};
