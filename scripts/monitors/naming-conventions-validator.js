#!/usr/bin/env node

/**
 * Naming Conventions Validator - TikTrack
 * =======================================
 * 
 * Checks adherence to naming conventions in all user pages
 * Identifies naming violations
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
    namingRules: {
        functions: /^[a-z][a-zA-Z0-9]*$/,  // camelCase
        variables: /^[a-z][a-zA-Z0-9]*$/,  // camelCase
        classes: /^[A-Z][a-zA-Z0-9]*$/,    // PascalCase
        constants: /^[A-Z][A-Z0-9_]*$/     // UPPER_SNAKE_CASE
    }
};

/**
 * Main execution function
 */
async function main() {
    try {
        console.log('🔤 Starting Naming Conventions Validator...\n');
        
        const results = {
            timestamp: new Date().toISOString(),
            pages: [],
            summary: {
                total: 0,
                compliant: 0,
                violations: 0
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
            results.summary.total += pageResult.total;
            results.summary.compliant += pageResult.compliant;
            results.summary.violations += pageResult.violations.length;
        }

        // Generate report
        await generateReport(results);

        // Print summary
        printSummary(results);

        console.log('\n✅ Validation completed successfully!');
        console.log(`📊 Report saved to: ${CONFIG.outputDir}/naming-conventions-${Date.now()}.json`);

    } catch (error) {
        console.error('❌ Error running validator:', error.message);
        process.exit(1);
    }
}

/**
 * Analyze a single page
 */
function analyzePage(filePath, fileName) {
    const content = fs.readFileSync(filePath, 'utf8');
    const violations = [];
    
    // Check function names
    violations.push(...checkFunctions(content));
    
    // Check variable names
    violations.push(...checkVariables(content));
    
    // Check class names
    violations.push(...checkClasses(content));
    
    // Check constant names
    violations.push(...checkConstants(content));

    const total = violations.length + Object.keys(CONFIG.namingRules).length;
    const compliant = total - violations.length;

    return {
        file: fileName,
        total: total,
        compliant: compliant,
        violations: violations
    };
}

/**
 * Check function naming conventions
 */
function checkFunctions(content) {
    const violations = [];
    const functionPattern = /function\s+(\w+)\s*\(/g;
    let match;

    while ((match = functionPattern.exec(content)) !== null) {
        const funcName = match[1];
        if (!CONFIG.namingRules.functions.test(funcName)) {
            violations.push({
                type: 'function',
                name: funcName,
                rule: 'camelCase',
                message: `Function "${funcName}" should be camelCase (e.g., myFunction)`
            });
        }
    }

    return violations;
}

/**
 * Check variable naming conventions
 */
function checkVariables(content) {
    const violations = [];
    // Match variable declarations: const, let, var
    const variablePattern = /(?:const|let|var)\s+(\w+)\s*=/g;
    let match;

    while ((match = variablePattern.exec(content)) !== null) {
        const varName = match[1];
        // Skip if it's a constant (all uppercase)
        if (varName === varName.toUpperCase()) {
            continue;
        }
        if (!CONFIG.namingRules.variables.test(varName)) {
            violations.push({
                type: 'variable',
                name: varName,
                rule: 'camelCase',
                message: `Variable "${varName}" should be camelCase (e.g., myVariable)`
            });
        }
    }

    return violations;
}

/**
 * Check class naming conventions
 */
function checkClasses(content) {
    const violations = [];
    const classPattern = /class\s+(\w+)/g;
    let match;

    while ((match = classPattern.exec(content)) !== null) {
        const className = match[1];
        if (!CONFIG.namingRules.classes.test(className)) {
            violations.push({
                type: 'class',
                name: className,
                rule: 'PascalCase',
                message: `Class "${className}" should be PascalCase (e.g., MyClass)`
            });
        }
    }

    return violations;
}

/**
 * Check constant naming conventions
 */
function checkConstants(content) {
    const violations = [];
    // Match const declarations with uppercase names
    const constantPattern = /const\s+([A-Z][A-Z0-9_]*)\s*=/g;
    let match;

    while ((match = constantPattern.exec(content)) !== null) {
        const constName = match[1];
        if (!CONFIG.namingRules.constants.test(constName)) {
            violations.push({
                type: 'constant',
                name: constName,
                rule: 'UPPER_SNAKE_CASE',
                message: `Constant "${constName}" should be UPPER_SNAKE_CASE (e.g., MY_CONSTANT)`
            });
        }
    }

    return violations;
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

    const jsonPath = path.join(CONFIG.outputDir, `naming-conventions-${Date.now()}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));

    // Generate markdown report
    const mdReport = generateMarkdownReport(results);
    const mdPath = path.join(CONFIG.outputDir, `naming-conventions-${Date.now()}.md`);
    fs.writeFileSync(mdPath, mdReport);

    console.log(`📝 Reports saved: ${jsonPath} and ${mdPath}`);
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(results) {
    let report = '# Naming Conventions Report\n\n';
    report += `**Generated**: ${new Date().toLocaleString()}\n\n`;
    report += '---\n\n';

    // Summary
    report += '## Summary\n\n';
    report += `- **Total Items**: ${results.summary.total}\n`;
    report += `- **Compliant**: ${results.summary.compliant}\n`;
    report += `- **Violations**: ${results.summary.violations}\n`;
    report += `- **Compliance**: ${((results.summary.compliant / results.summary.total) * 100).toFixed(2)}%\n\n`;
    report += '---\n\n';

    // Per-page details
    report += '## Per-Page Details\n\n';

    results.pages.forEach(page => {
        const status = page.violations.length === 0 ? '✅' : '⚠️';
        
        report += `### ${status} ${page.file}\n\n`;
        report += `- **Total Items**: ${page.total}\n`;
        report += `- **Violations**: ${page.violations.length}\n\n`;

        // List violations
        if (page.violations.length > 0) {
            report += '**Violations:**\n';
            page.violations.forEach(violation => {
                report += `- \`${violation.name}\` (${violation.type}): ${violation.message}\n`;
            });
            report += '\n';
        }

        report += '---\n\n';
    });

    // Recommendations
    report += '## Recommendations\n\n';
    
    const pagesWithViolations = results.pages.filter(p => p.violations.length > 0);
    
    if (pagesWithViolations.length === 0) {
        report += '✅ All pages meet naming convention standards!\n\n';
    } else {
        report += `⚠️  **${pagesWithViolations.length} pages** have naming violations:\n\n`;
        pagesWithViolations.forEach(page => {
            report += `- **${page.file}**: ${page.violations.length} violation(s)\n`;
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
    console.log('🔤 NAMING CONVENTIONS SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Items:        ${results.summary.total}`);
    console.log(`Compliant:          ${results.summary.compliant}`);
    console.log(`Violations:         ${results.summary.violations}`);
    console.log('='.repeat(60) + '\n');

    results.pages.forEach(page => {
        const status = page.violations.length === 0 ? '✅' : '⚠️';
        console.log(`${status} ${page.file.padEnd(25)} ${page.violations.length} violation(s)`);
    });
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = {
    main,
    analyzePage,
    checkFunctions,
    checkVariables,
    checkClasses,
    checkConstants
};
