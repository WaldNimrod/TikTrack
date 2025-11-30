#!/usr/bin/env node
/**
 * Mockups Standardization Checker
 * בודק עמודי מוקאפ לפי דרישות הסטנדרטיזציה:
 * - מבנה HTML נכון
 * - ITCSS וייבוא CSS
 * - שילוב Header System
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.resolve(__dirname, '..');
const MOCKUPS_DIR = path.join(BASE_DIR, 'trading-ui', 'mockups');
const DAILY_SNAPSHOTS_DIR = path.join(MOCKUPS_DIR, 'daily-snapshots');

// רשימת עמודי מוקאפ
const MOCKUP_PAGES = [
    // daily-snapshots
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
    // mockups נוספים
    { file: path.join(MOCKUPS_DIR, 'add-ticker-modal.html'), name: 'add-ticker-modal' },
    { file: path.join(MOCKUPS_DIR, 'flag-quick-action.html'), name: 'flag-quick-action' },
    { file: path.join(MOCKUPS_DIR, 'watch-list-modal.html'), name: 'watch-list-modal' },
    { file: path.join(MOCKUPS_DIR, 'watch-lists-page.html'), name: 'watch-lists-page' },
];

/**
 * קריאת קובץ
 */
function readFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            return null;
        }
        return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
        return null;
    }
}

/**
 * חישוב מספר שורה
 */
function getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
}

/**
 * בדיקת מבנה HTML
 */
function checkHTMLStructure(content, filePath) {
    const issues = [];
    const lines = content.split('\n');
    
    // בדיקות מבנה
    const checks = {
        hasBodyClass: /<body[^>]*class=["'][^"']*-page["']/.test(content),
        hasBackgroundWrapper: /<div[^>]*class=["'][^"']*background-wrapper["']/.test(content),
        hasUnifiedHeader: /<div[^>]*id=["']unified-header["']/.test(content),
        hasPageBody: /<div[^>]*class=["'][^"']*page-body["']/.test(content),
        hasMainContent: /<div[^>]*class=["'][^"']*main-content["']/.test(content),
    };
    
    // בדיקת מיקום unified-header בתוך background-wrapper
    let headerInWrapper = false;
    const headerMatch = content.match(/<div[^>]*id=["']unified-header["'][^>]*>/);
    if (headerMatch) {
        const headerIndex = headerMatch.index;
        const beforeHeader = content.substring(0, headerIndex);
        const lastWrapper = beforeHeader.lastIndexOf('<div');
        if (lastWrapper !== -1) {
            const wrapperSection = content.substring(lastWrapper, headerIndex + headerMatch[0].length + 500);
            headerInWrapper = wrapperSection.includes('background-wrapper');
        }
    }
    
    // דיווח על בעיות
    if (!checks.hasBodyClass) {
        issues.push({
            type: 'missing',
            severity: 'medium',
            check: 'body-class',
            description: 'Missing body class with page name (e.g., class="page-name-page")',
            line: null
        });
    }
    
    if (!checks.hasBackgroundWrapper) {
        issues.push({
            type: 'missing',
            severity: 'critical',
            check: 'background-wrapper',
            description: 'Missing background-wrapper div',
            line: null
        });
    }
    
    if (!checks.hasUnifiedHeader) {
        issues.push({
            type: 'missing',
            severity: 'critical',
            check: 'unified-header',
            description: 'Missing unified-header div',
            line: null
        });
    } else if (!headerInWrapper) {
        issues.push({
            type: 'structure',
            severity: 'critical',
            check: 'header-placement',
            description: 'unified-header should be inside background-wrapper',
            line: headerMatch ? getLineNumber(content, headerMatch.index) : null
        });
    }
    
    if (!checks.hasPageBody) {
        issues.push({
            type: 'missing',
            severity: 'high',
            check: 'page-body',
            description: 'Missing page-body div',
            line: null
        });
    }
    
    if (!checks.hasMainContent) {
        issues.push({
            type: 'missing',
            severity: 'high',
            check: 'main-content',
            description: 'Missing main-content div',
            line: null
        });
    }
    
    // בדיקת מבנה sections
    const hasTopSection = /<div[^>]*class=["'][^"']*top-section["']/.test(content);
    const hasContentSection = /<div[^>]*class=["'][^"']*content-section["']/.test(content);
    
    if (!hasTopSection && !hasContentSection) {
        issues.push({
            type: 'missing',
            severity: 'medium',
            check: 'sections',
            description: 'Missing top-section or content-section',
            line: null
        });
    }
    
    // בדיקת מבנה section נכון
    const sectionMatches = [...content.matchAll(/<div[^>]*class=["'][^"']*(?:top-section|content-section)["'][^>]*>/g)];
    sectionMatches.forEach(match => {
        const sectionStart = match.index;
        const sectionContent = content.substring(sectionStart, sectionStart + 2000);
        
        if (!sectionContent.includes('section-header')) {
            issues.push({
                type: 'structure',
                severity: 'medium',
                check: 'section-header',
                description: 'Section missing section-header',
                line: getLineNumber(content, sectionStart)
            });
        }
        
        if (!sectionContent.includes('section-body')) {
            issues.push({
                type: 'structure',
                severity: 'medium',
                check: 'section-body',
                description: 'Section missing section-body',
                line: getLineNumber(content, sectionStart)
            });
        }
    });
    
    return { issues, structure: checks, headerInWrapper };
}

/**
 * בדיקת inline styles
 */
function checkInlineStyles(content) {
    const issues = [];
    const lines = content.split('\n');
    
    // בדיקת <style> tags
    const styleTagMatches = [...content.matchAll(/<style[^>]*>[\s\S]*?<\/style>/gi)];
    styleTagMatches.forEach(match => {
        const styleContent = match[0];
        const lineCount = styleContent.split('\n').length - 1;
        issues.push({
            type: 'inline-style',
            severity: 'high',
            check: 'style-tag',
            description: `Found <style> tag with ${lineCount} lines (should be in external CSS)`,
            line: getLineNumber(content, match.index),
            snippet: styleContent.substring(0, 100)
        });
    });
    
    // בדיקת style="" attributes
    const inlineStyleMatches = [...content.matchAll(/style=["']([^"']+)["']/gi)];
    inlineStyleMatches.forEach((match, index) => {
        // דלג על style="" ריק
        if (match[1].trim().length === 0) return;
        
        issues.push({
            type: 'inline-style',
            severity: 'medium',
            check: 'style-attribute',
            description: `Found inline style attribute: ${match[1].substring(0, 50)}...`,
            line: getLineNumber(content, match.index),
            snippet: match[0].substring(0, 100)
        });
    });
    
    return {
        issues,
        styleTagsCount: styleTagMatches.length,
        inlineStylesCount: inlineStyleMatches.filter(m => m[1].trim().length > 0).length
    };
}

/**
 * בדיקת ייבוא CSS
 */
function checkCSSImports(content) {
    const issues = [];
    
    // בדיקת master.css
    const hasMasterCSS = /href=["'][^"']*master\.css/.test(content);
    const hasHeaderStyles = /href=["'][^"']*header-styles\.css/.test(content);
    
    // בדיקת Bootstrap Icons/FontAwesome ישירים
    const hasBootstrapIcons = /bootstrap-icons|font-awesome|fontawesome/i.test(content);
    
    if (!hasMasterCSS) {
        issues.push({
            type: 'missing',
            severity: 'critical',
            check: 'master-css',
            description: 'Missing master.css import',
            line: null
        });
    }
    
    if (!hasHeaderStyles) {
        issues.push({
            type: 'missing',
            severity: 'high',
            check: 'header-styles-css',
            description: 'Missing header-styles.css import',
            line: null
        });
    }
    
    if (hasBootstrapIcons) {
        const matches = [...content.matchAll(/(bootstrap-icons|font-awesome|fontawesome)[^"']*\.css/gi)];
        matches.forEach(match => {
            issues.push({
                type: 'forbidden',
                severity: 'medium',
                check: 'bootstrap-icons',
                description: 'Direct import of Bootstrap Icons/FontAwesome (should use IconSystem)',
                line: getLineNumber(content, match.index),
                snippet: match[0]
            });
        });
    }
    
    return { issues, hasMasterCSS, hasHeaderStyles };
}

/**
 * בדיקת Header System
 */
function checkHeaderSystem(content) {
    const issues = [];
    
    // בדיקת header-system.js
    const hasHeaderSystemJS = /header-system\.js/.test(content);
    
    if (!hasHeaderSystemJS) {
        issues.push({
            type: 'missing',
            severity: 'critical',
            check: 'header-system-js',
            description: 'Missing header-system.js script',
            line: null
        });
    }
    
    // בדיקת initialization code
    const hasHeaderInit = /HeaderSystem.*initialize|headerSystem.*initialize/.test(content);
    
    if (hasHeaderSystemJS && !hasHeaderInit) {
        issues.push({
            type: 'missing',
            severity: 'medium',
            check: 'header-init',
            description: 'Header system script found but no initialization code',
            line: null
        });
    }
    
    return { issues, hasHeaderSystemJS, hasHeaderInit };
}

/**
 * סריקת עמוד
 */
function scanPage(pageInfo) {
    const { file, name } = pageInfo;
    const content = readFile(file);
    
    if (!content) {
        return {
            success: false,
            error: 'File not found or cannot be read',
            file: file
        };
    }
    
    // הרצת כל הבדיקות
    const htmlStructure = checkHTMLStructure(content, file);
    const inlineStyles = checkInlineStyles(content);
    const cssImports = checkCSSImports(content);
    const headerSystem = checkHeaderSystem(content);
    
    // איסוף כל הבעיות
    const allIssues = [
        ...htmlStructure.issues,
        ...inlineStyles.issues,
        ...cssImports.issues,
        ...headerSystem.issues
    ];
    
    // חישוב סטטיסטיקות
    const severityCounts = {
        critical: allIssues.filter(i => i.severity === 'critical').length,
        high: allIssues.filter(i => i.severity === 'high').length,
        medium: allIssues.filter(i => i.severity === 'medium').length,
        low: allIssues.filter(i => i.severity === 'low').length
    };
    
    return {
        success: true,
        name: name,
        file: file,
        totalIssues: allIssues.length,
        severityCounts: severityCounts,
        issues: allIssues,
        htmlStructure: htmlStructure.structure,
        headerInWrapper: htmlStructure.headerInWrapper,
        inlineStyles: {
            styleTagsCount: inlineStyles.styleTagsCount,
            inlineStylesCount: inlineStyles.inlineStylesCount
        },
        cssImports: {
            hasMasterCSS: cssImports.hasMasterCSS,
            hasHeaderStyles: cssImports.hasHeaderStyles
        },
        headerSystem: {
            hasHeaderSystemJS: headerSystem.hasHeaderSystemJS,
            hasHeaderInit: headerSystem.hasHeaderInit
        }
    };
}

/**
 * יצירת דוח
 */
function generateReport(results) {
    const timestamp = new Date().toISOString();
    
    // חישוב סיכומים
    const totalPages = results.length;
    const pagesScanned = results.filter(r => r.success).length;
    const pagesWithIssues = results.filter(r => r.success && r.totalIssues > 0).length;
    const totalIssues = results.reduce((sum, r) => sum + (r.totalIssues || 0), 0);
    
    const severityTotals = {
        critical: results.reduce((sum, r) => sum + (r.severityCounts?.critical || 0), 0),
        high: results.reduce((sum, r) => sum + (r.severityCounts?.high || 0), 0),
        medium: results.reduce((sum, r) => sum + (r.severityCounts?.medium || 0), 0),
        low: results.reduce((sum, r) => sum + (r.severityCounts?.low || 0), 0)
    };
    
    // דוח Markdown
    let md = `# דוח סטנדרטיזציה - עמודי מוקאפ
# Mockups Standardization Report

**תאריך:** ${timestamp}  
**סה"כ עמודים:** ${totalPages}  
**עמודים נסרקו:** ${pagesScanned}  
**עמודים עם בעיות:** ${pagesWithIssues}  
**סה"כ בעיות:** ${totalIssues}

---

## סיכום כללי

### חלוקה לפי חומרה:
- 🔴 **קריטי:** ${severityTotals.critical}
- 🟠 **גבוה:** ${severityTotals.high}
- 🟡 **בינוני:** ${severityTotals.medium}
- 🟢 **נמוך:** ${severityTotals.low}

---

## דוח פרטני לכל עמוד

`;
    
    // דוח לכל עמוד
    results.forEach(result => {
        if (!result.success) {
            md += `### ${result.name}\n\n`;
            md += `❌ **שגיאה:** ${result.error}\n\n`;
            md += `---\n\n`;
            return;
        }
        
        const status = result.totalIssues === 0 ? '✅' : 
                      result.totalIssues < 5 ? '⚠️' : '❌';
        
        md += `### ${result.name}\n\n`;
        md += `${status} **סה"כ בעיות:** ${result.totalIssues}\n\n`;
        
        if (result.totalIssues > 0) {
            md += `**חומרה:** 🔴 ${result.severityCounts.critical} | 🟠 ${result.severityCounts.high} | 🟡 ${result.severityCounts.medium} | 🟢 ${result.severityCounts.low}\n\n`;
            
            // קיבוץ לפי סוג
            const byType = {};
            result.issues.forEach(issue => {
                if (!byType[issue.type]) {
                    byType[issue.type] = [];
                }
                byType[issue.type].push(issue);
            });
            
            Object.entries(byType).forEach(([type, issues]) => {
                md += `#### ${type.toUpperCase()}\n\n`;
                
                issues.forEach(issue => {
                    const severityIcon = {
                        'critical': '🔴',
                        'high': '🟠',
                        'medium': '🟡',
                        'low': '🟢'
                    }[issue.severity] || '⚪';
                    
                    md += `- ${severityIcon} **${issue.check}:** ${issue.description}\n`;
                    if (issue.line) {
                        md += `  - שורה: ${issue.line}\n`;
                    }
                    if (issue.snippet) {
                        md += `  - קוד: \`${issue.snippet.substring(0, 80)}...\`\n`;
                    }
                });
                md += `\n`;
            });
        }
        
        // סטטיסטיקות
        md += `**סטטיסטיקות:**\n`;
        md += `- Inline styles: ${result.inlineStyles.styleTagsCount} style tags, ${result.inlineStyles.inlineStylesCount} inline attributes\n`;
        md += `- CSS imports: ${result.cssImports.hasMasterCSS ? '✅' : '❌'} master.css, ${result.cssImports.hasHeaderStyles ? '✅' : '❌'} header-styles.css\n`;
        md += `- Header System: ${result.headerSystem.hasHeaderSystemJS ? '✅' : '❌'} script, ${result.headerSystem.hasHeaderInit ? '✅' : '❌'} initialization\n`;
        md += `- Structure: ${result.headerInWrapper ? '✅' : '❌'} header in wrapper\n\n`;
        
        md += `---\n\n`;
    });
    
    return md;
}

/**
 * הרצה ראשית
 */
function main() {
    console.log('🔍 Scanning mockup pages for standardization issues...\n');
    
    const results = MOCKUP_PAGES.map(pageInfo => {
        console.log(`Checking: ${pageInfo.name}...`);
        return scanPage(pageInfo);
    });
    
    console.log('\n✅ Scan complete!\n');
    
    // יצירת דוח
    const report = generateReport(results);
    
    // שמירת דוח
    const reportPath = path.join(BASE_DIR, 'trading-ui', 'mockups', 'MOCKUPS_STANDARDIZATION_REPORT.md');
    fs.writeFileSync(reportPath, report, 'utf-8');
    
    console.log(`📄 Report saved: ${reportPath}`);
    
    // סיכום
    const totalIssues = results.reduce((sum, r) => sum + (r.totalIssues || 0), 0);
    const pagesWithIssues = results.filter(r => r.success && r.totalIssues > 0).length;
    
    console.log(`\n📊 Summary:`);
    console.log(`   Pages scanned: ${results.filter(r => r.success).length}`);
    console.log(`   Pages with issues: ${pagesWithIssues}`);
    console.log(`   Total issues: ${totalIssues}`);
}

if (require.main === module) {
    main();
}

module.exports = { scanPage, checkHTMLStructure, checkInlineStyles, checkCSSImports, checkHeaderSystem };

