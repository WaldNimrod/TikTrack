#!/usr/bin/env node

/**
 * Find Duplicate Scripts in Mockup Pages
 * איתור טעינות כפולות של סקריפטים בעמודי מוקאפ
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..');
const MOCKUPS_DIR = path.join(BASE_DIR, 'trading-ui', 'mockups');
const DAILY_SNAPSHOTS_DIR = path.join(MOCKUPS_DIR, 'daily-snapshots');

// רשימת עמודי מוקאפ
const MOCKUP_PAGES = [
    { file: path.join(DAILY_SNAPSHOTS_DIR, 'comparative_analysis_page.html'), name: 'comparative-analysis-page' },
    { file: path.join(DAILY_SNAPSHOTS_DIR, 'date_comparison_modal.html'), name: 'date-comparison-modal' },
    { file: path.join(DAILY_SNAPSHOTS_DIR, 'economic_calendar_page.html'), name: 'economic-calendar-page' },
    { file: path.join(DAILY_SNAPSHOTS_DIR, 'emotional_tracking_widget.html'), name: 'emotional-tracking-widget' },
    { file: path.join(DAILY_SNAPSHOTS_DIR, 'history_widget.html'), name: 'history-widget' },
    { file: path.join(DAILY_SNAPSHOTS_DIR, 'portfolio_state_page.html'), name: 'portfolio-state-page' },
    { file: path.join(DAILY_SNAPSHOTS_DIR, 'price_history_page.html'), name: 'price-history-page' },
    { file: path.join(DAILY_SNAPSHOTS_DIR, 'strategy_analysis_page.html'), name: 'strategy-analysis-page' },
    { file: path.join(DAILY_SNAPSHOTS_DIR, 'trade_history_page.html'), name: 'trade-history-page' },
    { file: path.join(DAILY_SNAPSHOTS_DIR, 'trading_journal_page.html'), name: 'trading-journal-page' },
    { file: path.join(DAILY_SNAPSHOTS_DIR, 'tradingview_test_page.html'), name: 'tradingview-test-page' },
    { file: path.join(MOCKUPS_DIR, 'watch_lists_page.html'), name: 'watch-lists-page' },
];

// Global identifiers that should not be redeclared
const GLOBAL_IDENTIFIERS = [
    'Logger',
    'EntityDetailsRenderer',
    'EntityDetailsAPI',
    'showEntityDetails',
    'HeaderSystem',
    'IconSystem'
];

/**
 * Extract script sources from HTML content
 */
function extractScriptSources(content) {
    const scripts = [];
    const scriptRegex = /<script[^>]*src\s*=\s*["']([^"']+)["'][^>]*>/gi;
    
    let match;
    while ((match = scriptRegex.exec(content)) !== null) {
        const src = match[1].split('?')[0]; // Remove query string
        scripts.push({
            src: src,
            fullMatch: match[0],
            index: match.index,
            line: content.substring(0, match.index).split('\n').length
        });
    }
    
    return scripts;
}

/**
 * Extract inline scripts
 */
function extractInlineScripts(content) {
    const inlineScripts = [];
    const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    
    let match;
    while ((match = scriptRegex.exec(content)) !== null) {
        const scriptContent = match[1];
        if (scriptContent.trim()) {
            inlineScripts.push({
                content: scriptContent,
                index: match.index,
                line: content.substring(0, match.index).split('\n').length
            });
        }
    }
    
    return inlineScripts;
}

/**
 * Find duplicate script sources
 */
function findDuplicateScripts(scripts) {
    const seen = new Map();
    const duplicates = [];
    
    scripts.forEach((script, index) => {
        const normalizedSrc = script.src.toLowerCase();
        
        if (seen.has(normalizedSrc)) {
            duplicates.push({
                script: script,
                firstOccurrence: seen.get(normalizedSrc),
                type: 'duplicate-source'
            });
        } else {
            seen.set(normalizedSrc, script);
        }
    });
    
    return duplicates;
}

/**
 * Check for global identifier redeclarations in inline scripts
 */
function checkGlobalIdentifiers(inlineScripts, content) {
    const issues = [];
    
    inlineScripts.forEach((inlineScript, index) => {
        GLOBAL_IDENTIFIERS.forEach(identifier => {
            // Check for redeclaration patterns
            const patterns = [
                // const/let/var declarations
                new RegExp(`(?:const|let|var)\\s+${identifier}\\s*=`, 'g'),
                // class declarations
                new RegExp(`class\\s+${identifier}\\b`, 'g'),
                // function declarations
                new RegExp(`function\\s+${identifier}\\s*\\(`, 'g')
            ];
            
            patterns.forEach((pattern, patternIndex) => {
                const matches = inlineScript.content.match(pattern);
                if (matches && matches.length > 1) {
                    issues.push({
                        identifier: identifier,
                        type: 'redeclaration',
                        line: inlineScript.line,
                        pattern: ['const/let/var', 'class', 'function'][patternIndex],
                        count: matches.length
                    });
                }
            });
        });
    });
    
    return issues;
}

/**
 * Scan a page for duplicate scripts
 */
function scanPage(pageInfo) {
    const { file, name } = pageInfo;
    
    if (!fs.existsSync(file)) {
        return {
            name: name,
            error: 'File not found'
        };
    }
    
    const content = fs.readFileSync(file, 'utf-8');
    const scripts = extractScriptSources(content);
    const inlineScripts = extractInlineScripts(content);
    
    const duplicateScripts = findDuplicateScripts(scripts);
    const globalIssues = checkGlobalIdentifiers(inlineScripts, content);
    
    // Also check for duplicate script files in the content
    const scriptFiles = new Map();
    scripts.forEach(script => {
        const fileName = path.basename(script.src);
        if (!scriptFiles.has(fileName)) {
            scriptFiles.set(fileName, []);
        }
        scriptFiles.get(fileName).push(script);
    });
    
    const duplicateFiles = [];
    scriptFiles.forEach((occurrences, fileName) => {
        if (occurrences.length > 1) {
            duplicateFiles.push({
                fileName: fileName,
                occurrences: occurrences,
                count: occurrences.length
            });
        }
    });
    
    return {
        name: name,
        file: file,
        duplicateScripts: duplicateScripts,
        duplicateFiles: duplicateFiles,
        globalIssues: globalIssues,
        totalScripts: scripts.length,
        totalInlineScripts: inlineScripts.length,
        hasDuplicates: duplicateScripts.length > 0 || duplicateFiles.length > 0 || globalIssues.length > 0
    };
}

/**
 * Generate report
 */
function generateReport(allResults) {
    const timestamp = new Date().toISOString();
    const pagesWithDuplicates = allResults.filter(r => r.hasDuplicates && !r.error).length;
    const totalDuplicates = allResults.reduce((sum, r) => {
        if (r.error) return sum;
        return sum + (r.duplicateScripts?.length || 0) + (r.duplicateFiles?.length || 0) + (r.globalIssues?.length || 0);
    }, 0);

    let report = `# דוח טעינות כפולות - עמודי מוקאפ
# Duplicate Scripts Report - Mockups Pages

**תאריך:** ${new Date(timestamp).toLocaleString('he-IL')}  
**סה"כ עמודים:** ${allResults.length}  
**עמודים עם כפילות:** ${pagesWithDuplicates}  
**סה"כ כפילויות:** ${totalDuplicates}

---

## סיכום כללי

`;

    // Summary by type
    let duplicateSources = 0;
    let duplicateFiles = 0;
    let globalRedeclarations = 0;

    allResults.forEach(result => {
        if (result.error) return;
        duplicateSources += result.duplicateScripts?.length || 0;
        duplicateFiles += result.duplicateFiles?.length || 0;
        globalRedeclarations += result.globalIssues?.length || 0;
    });

    report += `### חלוקה לפי סוג כפילות:
- **סקריפטים עם אותה src:** ${duplicateSources}
- **קבצים כפולים:** ${duplicateFiles}
- **הגדרות גלובליות כפולות:** ${globalRedeclarations}

---

## דוח פרטני לכל עמוד

`;

    // Report per page
    allResults.forEach(result => {
        if (result.error) {
            report += `### ❌ ${result.name}\n\n`;
            report += `**שגיאה:** ${result.error}\n\n`;
            report += `---\n\n`;
            return;
        }

        const status = result.hasDuplicates ? '❌' : '✅';
        
        report += `### ${status} ${result.name}\n\n`;
        report += `**סה"כ סקריפטים:** ${result.totalScripts}\n`;
        report += `**סה"כ inline scripts:** ${result.totalInlineScripts}\n\n`;

        if (result.hasDuplicates) {
            // Duplicate script sources
            if (result.duplicateScripts && result.duplicateScripts.length > 0) {
                report += `#### סקריפטים עם אותה src:\n\n`;
                result.duplicateScripts.forEach(dup => {
                    report += `- **${dup.script.src}**\n`;
                    report += `  - שורה ראשונה: ${dup.firstOccurrence.line}\n`;
                    report += `  - שורה כפולה: ${dup.script.line}\n\n`;
                });
            }

            // Duplicate files
            if (result.duplicateFiles && result.duplicateFiles.length > 0) {
                report += `#### קבצים כפולים:\n\n`;
                result.duplicateFiles.forEach(dup => {
                    report += `- **${dup.fileName}** (${dup.count} פעמים)\n`;
                    dup.occurrences.forEach((occ, idx) => {
                        report += `  - ${idx + 1}. שורה ${occ.line}: \`${occ.src}\`\n`;
                    });
                    report += `\n`;
                });
            }

            // Global redeclarations
            if (result.globalIssues && result.globalIssues.length > 0) {
                report += `#### הגדרות גלובליות כפולות:\n\n`;
                result.globalIssues.forEach(issue => {
                    report += `- **${issue.identifier}** - ${issue.type}\n`;
                    report += `  - שורה: ${issue.line}\n`;
                    report += `  - סוג: ${issue.pattern}\n`;
                    report += `  - כמות: ${issue.count}\n\n`;
                });
            }
        }

        report += `---\n\n`;
    });

    return report;
}

/**
 * Main execution
 */
function main() {
    console.log('🔍 Scanning mockup pages for duplicate scripts...\n');

    const allResults = [];

    MOCKUP_PAGES.forEach(pageInfo => {
        console.log(`Scanning: ${pageInfo.name}...`);
        const result = scanPage(pageInfo);
        allResults.push(result);
        
        const status = result.hasDuplicates ? '❌' : '✅';
        const count = (result.duplicateScripts?.length || 0) + 
                     (result.duplicateFiles?.length || 0) + 
                     (result.globalIssues?.length || 0);
        console.log(`  ${status} ${pageInfo.name} - ${count} duplicates/issues`);
    });

    console.log('\n✅ Scan complete!\n');

    // Generate report
    const report = generateReport(allResults);
    
    // Save report
    const reportPath = path.join(BASE_DIR, 'trading-ui', 'mockups', 'DUPLICATE_SCRIPTS_REPORT.md');
    fs.writeFileSync(reportPath, report, 'utf-8');
    
    console.log(`📄 Report saved: ${reportPath}`);
    
    // Summary
    const pagesWithDuplicates = allResults.filter(r => r.hasDuplicates && !r.error).length;
    const totalDuplicates = allResults.reduce((sum, r) => {
        if (r.error) return sum;
        return sum + (r.duplicateScripts?.length || 0) + (r.duplicateFiles?.length || 0) + (r.globalIssues?.length || 0);
    }, 0);
    
    console.log(`\n📊 Summary:`);
    console.log(`   Pages with duplicates: ${pagesWithDuplicates}`);
    console.log(`   Total duplicates/issues: ${totalDuplicates}`);
}

if (require.main === module) {
    try {
        main();
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

module.exports = { scanPage, extractScriptSources, findDuplicateScripts };

