#!/usr/bin/env node

/**
 * Detect onclick Usage - TikTrack
 * ================================
 * 
 * כלי איתור מקיף למציאת כל השימושים ב-onclick רגיל במערכת
 * 
 * מטרה: לזהות כל הכפתורים שעדיין משתמשים ב-onclick רגיל במקום data-onclick
 * 
 * @version 1.0.0
 * @created January 27, 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

// רשימת תיקיות לבדיקה
const SCAN_DIRECTORIES = [
    'trading-ui',
    'trading-ui/scripts'
];

// רשימת קבצים/תיקיות להתעלם
const IGNORE_PATTERNS = [
    /node_modules/,
    /\.git/,
    /backup/,
    /archive/,
    /\.min\.js$/,
    /test-.*\.js$/,
    /\.backup/,
    /_backup/
];

// סוגי קבצים לבדיקה
const FILE_EXTENSIONS = {
    html: /\.html$/i,
    js: /\.js$/i
};

/**
 * בדיקה אם קובץ צריך להתעלם
 */
function shouldIgnoreFile(filePath) {
    return IGNORE_PATTERNS.some(pattern => pattern.test(filePath));
}

/**
 * סריקת קובץ HTML לאיתור onclick
 */
function scanHTMLFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const findings = [];
    
    // דפוסים לזיהוי onclick
    const onclickPattern = /onclick\s*=\s*["']([^"']+)["']/gi;
    const buttonWithOnclick = /<button[^>]*onclick\s*=/gi;
    const thWithOnclick = /<th[^>]*>[\s\S]*?<button[^>]*onclick\s*=/gi;
    
    lines.forEach((line, lineNumber) => {
        // בדיקת onclick בכלל
        let match;
        while ((match = onclickPattern.exec(line)) !== null) {
            const onclickValue = match[1];
            const fullMatch = match[0];
            
            // בדיקה אם זה בכפתור
            const isInButton = /<button[^>]*onclick/.test(line);
            const isInSortableHeader = /sortable-header/.test(line) && isInButton;
            
            // בדיקה אם זה בתוך th (כותרת סידור)
            const isInTableHeader = /<th[^>]*>/.test(line) || thWithOnclick.test(line);
            
            findings.push({
                type: isInSortableHeader ? 'sortable-header' : isInButton ? 'button' : 'other',
                location: {
                    file: filePath,
                    line: lineNumber + 1,
                    column: match.index
                },
                onclickValue: onclickValue,
                fullMatch: fullMatch,
                context: line.trim(),
                recommendation: isInSortableHeader 
                    ? 'המר ל-data-onclick="' + onclickValue + '"' 
                    : isInButton 
                        ? 'המר ל-data-onclick="' + onclickValue + '" או השתמש ב-Button System'
                        : 'בדוק אם ניתן להמיר ל-data-onclick'
            });
        }
    });
    
    return findings;
}

/**
 * סריקת קובץ JS לאיתור onclick
 */
function scanJSFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const findings = [];
    
    // דפוסים לזיהוי יצירת כפתורים עם onclick
    const patterns = [
        // innerHTML עם onclick
        /innerHTML\s*[+\-]=\s*["'][^"']*onclick\s*=/gi,
        // createElement עם onclick
        /\.setAttribute\(['"]onclick['"]/gi,
        // template literals עם onclick
        /`[^`]*onclick\s*=/gi,
        // string concatenation עם onclick
        /["'][^"']*onclick\s*=/gi
    ];
    
    lines.forEach((line, lineNumber) => {
        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(line)) !== null) {
                findings.push({
                    type: 'dynamic-button',
                    location: {
                        file: filePath,
                        line: lineNumber + 1,
                        column: match.index
                    },
                    context: line.trim(),
                    recommendation: 'עדכן את הקוד ליצור כפתורים עם data-onclick במקום onclick'
                });
            }
        });
    });
    
    return findings;
}

/**
 * סריקת תיקייה רקורסיבית
 */
function scanDirectory(dirPath, findings = []) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    entries.forEach(entry => {
        const fullPath = path.join(dirPath, entry.name);
        
        // בדיקה אם להתעלם
        if (shouldIgnoreFile(fullPath)) {
            return;
        }
        
        if (entry.isDirectory()) {
            // סריקה רקורסיבית
            scanDirectory(fullPath, findings);
        } else if (entry.isFile()) {
            // בדיקת סוג קובץ
            if (FILE_EXTENSIONS.html.test(entry.name)) {
                const fileFindings = scanHTMLFile(fullPath);
                findings.push(...fileFindings);
            } else if (FILE_EXTENSIONS.js.test(entry.name)) {
                const fileFindings = scanJSFile(fullPath);
                findings.push(...fileFindings);
            }
        }
    });
    
    return findings;
}

/**
 * יצירת דוח מפורט
 */
function generateReport(findings) {
    // קטגוריזציה לפי סוג
    const byType = {
        'sortable-header': [],
        'button': [],
        'dynamic-button': [],
        'other': []
    };
    
    findings.forEach(finding => {
        byType[finding.type] = byType[finding.type] || [];
        byType[finding.type].push(finding);
    });
    
    // קטגוריזציה לפי קובץ
    const byFile = {};
    findings.forEach(finding => {
        const file = finding.location.file;
        if (!byFile[file]) {
            byFile[file] = [];
        }
        byFile[file].push(finding);
    });
    
    // סטטיסטיקות
    const stats = {
        total: findings.length,
        byType: {
            'sortable-header': byType['sortable-header'].length,
            'button': byType['button'].length,
            'dynamic-button': byType['dynamic-button'].length,
            'other': byType['other'].length
        },
        byFile: Object.keys(byFile).length,
        files: Object.keys(byFile)
    };
    
    return {
        stats,
        findings: byType,
        byFile
    };
}

/**
 * יצירת דוח HTML
 */
function generateHTMLReport(report) {
    let html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>דוח איתור onclick - TikTrack</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #26baac;
            border-bottom: 2px solid #26baac;
            padding-bottom: 10px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #26baac;
        }
        .stat-card h3 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 14px;
        }
        .stat-card .number {
            font-size: 32px;
            font-weight: bold;
            color: #26baac;
        }
        .finding {
            margin: 15px 0;
            padding: 15px;
            border-left: 4px solid #fc5a06;
            background: #fff;
            border-radius: 4px;
        }
        .finding-header {
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        .finding-location {
            color: #666;
            font-size: 14px;
            margin: 5px 0;
        }
        .finding-context {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
            margin: 10px 0;
            overflow-x: auto;
        }
        .finding-recommendation {
            color: #26baac;
            font-weight: bold;
            margin-top: 10px;
        }
        .type-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 10px;
        }
        .type-sortable-header {
            background: #ffc107;
            color: #000;
        }
        .type-button {
            background: #17a2b8;
            color: #fff;
        }
        .type-dynamic-button {
            background: #6c757d;
            color: #fff;
        }
        .type-other {
            background: #dc3545;
            color: #fff;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>דוח איתור onclick - TikTrack</h1>
        <p><strong>תאריך:</strong> ${new Date().toLocaleString('he-IL')}</p>
        
        <div class="stats">
            <div class="stat-card">
                <h3>סה"כ ממצאים</h3>
                <div class="number">${report.stats.total}</div>
            </div>
            <div class="stat-card">
                <h3>כותרות סידור</h3>
                <div class="number">${report.stats.byType['sortable-header']}</div>
            </div>
            <div class="stat-card">
                <h3>כפתורים רגילים</h3>
                <div class="number">${report.stats.byType['button']}</div>
            </div>
            <div class="stat-card">
                <h3>כפתורים דינמיים</h3>
                <div class="number">${report.stats.byType['dynamic-button']}</div>
            </div>
            <div class="stat-card">
                <h3>קבצים</h3>
                <div class="number">${report.stats.byFile}</div>
            </div>
        </div>
        
        <h2>ממצאים לפי סוג</h2>`;
    
    // הוספת ממצאים לפי סוג
    Object.keys(report.findings).forEach(type => {
        const findings = report.findings[type];
        if (findings.length === 0) return;
        
        html += `<h3>${getTypeLabel(type)} (${findings.length})</h3>`;
        
        findings.forEach((finding, index) => {
            html += `
        <div class="finding">
            <div class="finding-header">
                ממצא #${index + 1}
                <span class="type-badge type-${type}">${getTypeLabel(type)}</span>
            </div>
            <div class="finding-location">
                <strong>קובץ:</strong> ${finding.location.file}<br>
                <strong>שורה:</strong> ${finding.location.line}<br>
                ${finding.onclickValue ? `<strong>onclick:</strong> ${finding.onclickValue}` : ''}
            </div>
            <div class="finding-context">${escapeHtml(finding.context)}</div>
            <div class="finding-recommendation">
                💡 המלצה: ${finding.recommendation}
            </div>
        </div>`;
        });
    });
    
    // הוספת סיכום לפי קבצים
    html += `
        <h2>סיכום לפי קבצים</h2>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f8f9fa;">
                    <th style="padding: 10px; text-align: right; border: 1px solid #dee2e6;">קובץ</th>
                    <th style="padding: 10px; text-align: center; border: 1px solid #dee2e6;">מספר ממצאים</th>
                </tr>
            </thead>
            <tbody>`;
    
    Object.keys(report.byFile).sort().forEach(file => {
        const count = report.byFile[file].length;
        html += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #dee2e6;">${file}</td>
                    <td style="padding: 10px; text-align: center; border: 1px solid #dee2e6;">${count}</td>
                </tr>`;
    });
    
    html += `
            </tbody>
        </table>
    </div>
</body>
</html>`;
    
    return html;
}

function getTypeLabel(type) {
    const labels = {
        'sortable-header': 'כותרת סידור',
        'button': 'כפתור',
        'dynamic-button': 'כפתור דינמי',
        'other': 'אחר'
    };
    return labels[type] || type;
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Main function
 */
function main() {
    console.log('🔍 מתחיל סריקת onclick...\n');
    
    const allFindings = [];
    
    // סריקת כל התיקיות
    SCAN_DIRECTORIES.forEach(dir => {
        const fullPath = path.join(process.cwd(), dir);
        if (fs.existsSync(fullPath)) {
            console.log(`📂 סריקת תיקייה: ${dir}`);
            const findings = scanDirectory(fullPath);
            allFindings.push(...findings);
            console.log(`   נמצאו ${findings.length} ממצאים`);
        } else {
            console.log(`⚠️  תיקייה לא נמצאה: ${dir}`);
        }
    });
    
    console.log(`\n✅ סריקה הושלמה. נמצאו ${allFindings.length} ממצאים בסך הכל.\n`);
    
    // יצירת דוח
    const report = generateReport(allFindings);
    
    // שמירת דוח JSON
    const jsonPath = path.join(process.cwd(), 'onclick-usage-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📄 דוח JSON נשמר: ${jsonPath}`);
    
    // שמירת דוח HTML
    const htmlPath = path.join(process.cwd(), 'onclick-usage-report.html');
    const htmlReport = generateHTMLReport(report);
    fs.writeFileSync(htmlPath, htmlReport, 'utf8');
    console.log(`📄 דוח HTML נשמר: ${htmlPath}`);
    
    // הדפסת סיכום
    console.log('\n📊 סיכום:');
    console.log(`   סה"כ ממצאים: ${report.stats.total}`);
    console.log(`   כותרות סידור: ${report.stats.byType['sortable-header']}`);
    console.log(`   כפתורים רגילים: ${report.stats.byType['button']}`);
    console.log(`   כפתורים דינמיים: ${report.stats.byType['dynamic-button']}`);
    console.log(`   אחרים: ${report.stats.byType['other']}`);
    console.log(`   קבצים: ${report.stats.byFile}`);
    
    // רשימת קבצים עם הכי הרבה ממצאים
    const filesByCount = Object.keys(report.byFile)
        .map(file => ({ file, count: report.byFile[file].length }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    
    if (filesByCount.length > 0) {
        console.log('\n📋 10 הקבצים עם הכי הרבה ממצאים:');
        filesByCount.forEach(({ file, count }, index) => {
            console.log(`   ${index + 1}. ${file}: ${count} ממצאים`);
        });
    }
    
    console.log('\n✅ סיום!');
    
    return report;
}

// הרצה אם הקובץ מופעל ישירות
if (require.main === module) {
    main();
}

module.exports = { main, scanHTMLFile, scanJSFile, scanDirectory };

