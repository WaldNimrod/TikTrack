#!/usr/bin/env node

/**
 * JSDoc Coverage Reporter - TikTrack
 * ==================================
 * 
 * Checks JSDoc documentation coverage in all user pages
 * Identifies functions without documentation
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
    outputDir: 'reports',
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
    ]
};

/**
 * Check if file exists and return full path
 */
function checkFileExists(fileName) {
    const fullPath = path.join(CONFIG.scriptsDir, fileName);
    const absolutePath = path.resolve(fullPath);
    
    if (fs.existsSync(absolutePath)) {
        return absolutePath;
    }
    
    // Try alternative paths
    const alternativePaths = [
        path.join(process.cwd(), 'trading-ui', 'scripts', fileName),
        path.join(process.cwd(), '..', 'trading-ui', 'scripts', fileName),
        path.join(__dirname, '..', '..', 'trading-ui', 'scripts', fileName)
    ];
    
    for (const altPath of alternativePaths) {
        if (fs.existsSync(altPath)) {
            return altPath;
        }
    }
    
    return null;
}

/**
 * Main execution function
 */
async function main() {
    try {
        console.log('📚 Starting JSDoc Coverage Reporter...\n');
        
        const results = {
            timestamp: new Date().toISOString(),
            pages: [],
            summary: {
                total: 0,
                withJSDoc: 0,
                withoutJSDoc: 0,
                coveragePercentage: 0
            }
        };

        // Process each core page
        for (const page of CONFIG.corePages) {
            const pagePath = checkFileExists(page);
            
            if (!pagePath) {
                console.log(`⚠️  File not found: ${page} (searched in multiple locations)`);
                continue;
            }

            console.log(`📄 Analyzing: ${page} (${pagePath})`);
            const pageResult = await analyzePage(pagePath, page);
            results.pages.push(pageResult);
            results.summary.total += pageResult.totalFunctions;
            results.summary.withJSDoc += pageResult.functionsWithJSDoc;
            results.summary.withoutJSDoc += pageResult.functionsWithoutJSDoc;
        }

        // Calculate overall coverage
        results.summary.coveragePercentage = results.summary.total > 0
            ? ((results.summary.withJSDoc / results.summary.total) * 100).toFixed(2)
            : 0;

        // Generate report
        await generateReport(results);

        // Print summary
        printSummary(results);

        console.log('\n✅ Analysis completed successfully!');
        console.log(`📊 Report saved to: ${CONFIG.outputDir}/jsdoc-coverage-${Date.now()}.json`);

    } catch (error) {
        console.error('❌ Error running reporter:', error.message);
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
            position: match.index,
            hasJSDoc: false
        });
    }

    // Check each function for JSDoc
    functions.forEach(func => {
        func.hasJSDoc = checkFunctionForJSDoc(content, func);
    });

    const functionsWithJSDoc = functions.filter(f => f.hasJSDoc).length;
    const functionsWithoutJSDoc = functions.length - functionsWithJSDoc;

    return {
        file: fileName,
        totalFunctions: functions.length,
        functionsWithJSDoc: functionsWithJSDoc,
        functionsWithoutJSDoc: functionsWithoutJSDoc,
        coveragePercentage: functions.length > 0 
            ? ((functionsWithJSDoc / functions.length) * 100).toFixed(2) 
            : '0.00',
        functions: functions.map(f => ({
            name: f.name,
            hasJSDoc: f.hasJSDoc
        }))
    };
}

/**
 * Check if a function has JSDoc documentation
 */
function checkFunctionForJSDoc(content, func) {
    // Look backwards from function declaration for JSDoc comment
    const startPos = func.position;
    const beforeFunction = content.substring(Math.max(0, startPos - 1000), startPos);
    
    // Check for JSDoc comment pattern (/** ... */)
    const jsdocPattern = /\/\*\*[\s\S]*?\*\//;
    const match = beforeFunction.match(jsdocPattern);
    
    if (!match) {
        return false;
    }
    
    // Check for advanced JSDoc tags
    const jsdocContent = match[0];
    const hasDescription = jsdocContent.includes('@description') || 
                          (jsdocContent.includes('*') && !jsdocContent.includes('@param') && !jsdocContent.includes('@returns'));
    const hasParams = jsdocContent.includes('@param');
    const hasReturns = jsdocContent.includes('@returns') || jsdocContent.includes('@return');
    const hasThrows = jsdocContent.includes('@throws');
    
    // Consider it documented if it has at least description or any advanced tags
    return hasDescription || hasParams || hasReturns || hasThrows;
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

    const jsonPath = path.join(CONFIG.outputDir, `jsdoc-coverage-${Date.now()}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));

    // Generate markdown report
    const mdReport = generateMarkdownReport(results);
    const mdPath = path.join(CONFIG.outputDir, `jsdoc-coverage-${Date.now()}.md`);
    fs.writeFileSync(mdPath, mdReport);

    console.log(`📝 Reports saved: ${jsonPath} and ${mdPath}`);
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(results) {
    let report = '# JSDoc Coverage Report\n\n';
    report += `**Generated**: ${new Date().toLocaleString()}\n\n`;
    report += '---\n\n';

    // Summary
    report += '## Summary\n\n';
    report += `- **Total Functions**: ${results.summary.total}\n`;
    report += `- **With JSDoc**: ${results.summary.withJSDoc}\n`;
    report += `- **Without JSDoc**: ${results.summary.withoutJSDoc}\n`;
    report += `- **Coverage**: ${results.summary.coveragePercentage}%\n\n`;
    report += '---\n\n';

    // Per-page details
    report += '## Per-Page Details\n\n';

    results.pages.forEach(page => {
        const status = parseFloat(page.coveragePercentage) >= 100 ? '✅' : '⚠️';
        
        report += `### ${status} ${page.file}\n\n`;
        report += `- **Total Functions**: ${page.totalFunctions}\n`;
        report += `- **Coverage**: ${page.coveragePercentage}%\n\n`;

        // List functions without JSDoc
        if (page.functionsWithoutJSDoc > 0) {
            report += '**Functions without JSDoc:**\n';
            page.functions
                .filter(f => !f.hasJSDoc)
                .forEach(f => {
                    report += `- \`${f.name}()\`\n`;
                });
            report += '\n';
        }

        report += '---\n\n';
    });

    // Recommendations
    report += '## Recommendations\n\n';
    
    const pagesNeedingWork = results.pages.filter(p => parseFloat(p.coveragePercentage) < 100);
    
    if (pagesNeedingWork.length === 0) {
        report += '✅ All pages meet the 100% coverage target!\n\n';
    } else {
        report += `⚠️  **${pagesNeedingWork.length} pages** need JSDoc documentation:\n\n`;
        pagesNeedingWork.forEach(page => {
            report += `- **${page.file}**: ${page.coveragePercentage}% coverage (need ${(100 - parseFloat(page.coveragePercentage)).toFixed(0)}% more)\n`;
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
    console.log('📚 JSDOC COVERAGE SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Functions:     ${results.summary.total}`);
    console.log(`With JSDoc:          ${results.summary.withJSDoc}`);
    console.log(`Without JSDoc:       ${results.summary.withoutJSDoc}`);
    console.log(`Coverage:            ${results.summary.coveragePercentage}%`);
    console.log('='.repeat(60) + '\n');

    results.pages.forEach(page => {
        const status = parseFloat(page.coveragePercentage) >= 100 ? '✅' : '⚠️';
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
    checkFunctionForJSDoc
};
