#!/usr/bin/env node

/**
 * Detect Missing data-onclick - TikTrack
 * =======================================
 * 
 * כלי איתור לזיהוי כפתורים שנוצרים דינמית ללא data-onclick
 * 
 * מטרה: לזהות כפתורים שנוצרים ב-JavaScript שלא משתמשים ב-data-onclick
 * 
 * @version 1.0.0
 * @created January 27, 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

// רשימת תיקיות לבדיקה
const SCAN_DIRECTORIES = [
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
    /_backup/,
    /detect-.*\.js$/,
    /verify-.*\.js$/,
    /migration-.*\.js$/
];

/**
 * בדיקה אם קובץ צריך להתעלם
 */
function shouldIgnoreFile(filePath) {
    return IGNORE_PATTERNS.some(pattern => pattern.test(filePath));
}

/**
 * סריקת קובץ JS לאיתור יצירת כפתורים ללא data-onclick
 */
function scanJSFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const findings = [];
    
    // דפוסים לזיהוי יצירת כפתורים
    const buttonCreationPatterns = [
        // innerHTML עם כפתור
        /innerHTML\s*[+\-]=\s*["'][^"']*<button[^>]*>/gi,
        // createElement('button')
        /createElement\(['"]button['"]\)/gi,
        // template literals עם כפתור
        /`[^`]*<button[^>]*>/gi,
        // יצירת כפתור דרך Button System אבל ללא data-onclick
        /data-button-type[^>]*>/gi
    ];
    
    lines.forEach((line, lineNumber) => {
        // בדיקת יצירת כפתורים
        buttonCreationPatterns.forEach((pattern, patternIndex) => {
            let match;
            while ((match = pattern.exec(line)) !== null) {
                // בדיקה אם יש data-onclick בשורה
                const hasDataOnclick = /data-onclick\s*=/i.test(line);
                
                // בדיקה אם זה כפתור שנוצר דרך Button System (אלה אמורים להיות בסדר)
                const isButtonSystem = /data-button-type/i.test(line) && hasDataOnclick;
                
                // בדיקה אם זה כפתור עם onclick רגיל (זה כבר נבדק ב-detect-onclick-usage.js)
                const hasOnclick = /onclick\s*=/i.test(line);
                
                if (!hasDataOnclick && !isButtonSystem && !hasOnclick) {
                    // זה כפתור שנוצר ללא data-onclick וללא onclick
                    findings.push({
                        type: 'missing-data-onclick',
                        location: {
                            file: filePath,
                            line: lineNumber + 1,
                            column: match.index
                        },
                        context: line.trim(),
                        recommendation: 'הוסף data-onclick לכפתור או השתמש ב-Button System'
                    });
                } else if (hasOnclick && !hasDataOnclick) {
                    // זה כפתור עם onclick רגיל - צריך להמיר ל-data-onclick
                    findings.push({
                        type: 'onclick-needs-migration',
                        location: {
                            file: filePath,
                            line: lineNumber + 1,
                            column: match.index
                        },
                        context: line.trim(),
                        recommendation: 'המר מ-onclick ל-data-onclick'
                    });
                }
            }
        });
    });
    
    return findings;
}

/**
 * סריקת תיקייה רקורסיבית
 */
function scanDirectory(dirPath, findings = []) {
    if (!fs.existsSync(dirPath)) {
        return findings;
    }
    
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
        } else if (entry.isFile() && /\.js$/i.test(entry.name)) {
            // סריקת קובץ JS
            const fileFindings = scanJSFile(fullPath);
            findings.push(...fileFindings);
        }
    });
    
    return findings;
}

/**
 * יצירת דוח
 */
function generateReport(findings) {
    const stats = {
        total: findings.length,
        missingDataOnclick: findings.filter(f => f.type === 'missing-data-onclick').length,
        needsMigration: findings.filter(f => f.type === 'onclick-needs-migration').length
    };
    
    const byFile = {};
    findings.forEach(finding => {
        const file = finding.location.file;
        if (!byFile[file]) {
            byFile[file] = [];
        }
        byFile[file].push(finding);
    });
    
    return {
        stats,
        findings,
        byFile
    };
}

/**
 * Main function
 */
function main() {
    console.log('🔍 מתחיל סריקת כפתורים ללא data-onclick...\n');
    
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
    const jsonPath = path.join(process.cwd(), 'missing-data-onclick-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📄 דוח JSON נשמר: ${jsonPath}`);
    
    // הדפסת סיכום
    console.log('\n📊 סיכום:');
    console.log(`   סה"כ ממצאים: ${report.stats.total}`);
    console.log(`   כפתורים ללא data-onclick: ${report.stats.missingDataOnclick}`);
    console.log(`   כפתורים שצריכים מיגרציה: ${report.stats.needsMigration}`);
    console.log(`   קבצים: ${Object.keys(report.byFile).length}`);
    
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

module.exports = { main, scanJSFile, scanDirectory };

