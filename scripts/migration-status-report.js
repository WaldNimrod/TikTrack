#!/usr/bin/env node

/**
 * Migration Status Report - TikTrack
 * ===================================
 * 
 * כלי ליצירת דוח HTML מפורט על סטטוס המיגרציה ל-data-onclick
 * 
 * מטרה: לספק תמונה מלאה של התקדמות המיגרציה בכל העמודים והקבצים
 * 
 * @version 1.0.0
 * @created January 27, 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

// יבוא של כלי האיתור
const { main: detectOnclickUsage } = require('./detect-onclick-usage.js');
const { main: detectMissingDataOnclick } = require('./detect-missing-data-onclick.js');
const { main: verifyEventIntegration } = require('./verify-event-integration.js');

// רשימת עמודי המשתמש
const USER_PAGES = [
    'index.html',
    'trades.html',
    'trade_plans.html',
    'executions.html',
    'alerts.html',
    'tickers.html',
    'trading_accounts.html',
    'cash_flows.html',
    'notes.html',
    'research.html',
    'preferences.html',
    'db_display.html',
    'db_extradata.html'
];

/**
 * קריאת דוחות JSON
 */
function loadReports() {
    const reports = {
        onclickUsage: null,
        missingDataOnclick: null,
        eventIntegration: null
    };
    
    // קריאת דוח onclick usage
    const onclickReportPath = path.join(process.cwd(), 'onclick-usage-report.json');
    if (fs.existsSync(onclickReportPath)) {
        reports.onclickUsage = JSON.parse(fs.readFileSync(onclickReportPath, 'utf8'));
    }
    
    // קריאת דוח missing data-onclick
    const missingReportPath = path.join(process.cwd(), 'missing-data-onclick-report.json');
    if (fs.existsSync(missingReportPath)) {
        reports.missingDataOnclick = JSON.parse(fs.readFileSync(missingReportPath, 'utf8'));
    }
    
    // קריאת דוח event integration
    const integrationReportPath = path.join(process.cwd(), 'event-integration-report.json');
    if (fs.existsSync(integrationReportPath)) {
        reports.eventIntegration = JSON.parse(fs.readFileSync(integrationReportPath, 'utf8'));
    }
    
    return reports;
}

/**
 * חישוב סטטוס מיגרציה לעמוד
 */
function calculatePageStatus(pageName, reports) {
    const status = {
        page: pageName,
        onclickCount: 0,
        dataOnclickCount: 0,
        missingDataOnclickCount: 0,
        migrationPercentage: 0,
        status: 'unknown',
        issues: []
    };
    
    // חיפוש ממצאים בקובץ HTML
    const htmlPath = path.join(process.cwd(), 'trading-ui', pageName);
    if (fs.existsSync(htmlPath)) {
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        // ספירת onclick
        const onclickMatches = htmlContent.match(/onclick\s*=/gi);
        if (onclickMatches) {
            status.onclickCount = onclickMatches.length;
        }
        
        // ספירת data-onclick
        const dataOnclickMatches = htmlContent.match(/data-onclick\s*=/gi);
        if (dataOnclickMatches) {
            status.dataOnclickCount = dataOnclickMatches.length;
        }
    }
    
    // חיפוש ממצאים בדוחות
    if (reports.onclickUsage && reports.onclickUsage.byFile) {
        Object.keys(reports.onclickUsage.byFile).forEach(file => {
            if (file.includes(pageName.replace('.html', ''))) {
                status.onclickCount += reports.onclickUsage.byFile[file].length;
            }
        });
    }
    
    // חישוב אחוז מיגרציה
    const total = status.onclickCount + status.dataOnclickCount;
    if (total > 0) {
        status.migrationPercentage = Math.round((status.dataOnclickCount / total) * 100);
    } else {
        status.migrationPercentage = 100; // אין כפתורים = 100% מיגרציה
    }
    
    // קביעת סטטוס
    if (status.migrationPercentage === 100) {
        status.status = 'completed';
    } else if (status.migrationPercentage >= 75) {
        status.status = 'almost-complete';
    } else if (status.migrationPercentage >= 50) {
        status.status = 'in-progress';
    } else if (status.migrationPercentage > 0) {
        status.status = 'started';
    } else {
        status.status = 'not-started';
    }
    
    return status;
}

/**
 * יצירת דוח HTML מפורט
 */
function generateHTMLReport(reports) {
    // חישוב סטטוס לכל עמוד
    let pageStatuses = [];
    try {
        pageStatuses = USER_PAGES.map(page => calculatePageStatus(page, reports));
    } catch (error) {
        console.warn('⚠️  שגיאה בחישוב סטטוס עמודים:', error.message);
        pageStatuses = [];
    }
    
    // חישוב סטטיסטיקות כוללות
    const totalOnclick = pageStatuses.reduce((sum, page) => sum + page.onclickCount, 0);
    const totalDataOnclick = pageStatuses.reduce((sum, page) => sum + page.dataOnclickCount, 0);
    const totalPages = pageStatuses.length;
    const completedPages = pageStatuses.filter(p => p.status === 'completed').length;
    const inProgressPages = pageStatuses.filter(p => p.status === 'in-progress' || p.status === 'almost-complete' || p.status === 'started').length;
    const notStartedPages = pageStatuses.filter(p => p.status === 'not-started').length;
    
    const overallPercentage = totalOnclick + totalDataOnclick > 0 
        ? Math.round((totalDataOnclick / (totalOnclick + totalDataOnclick)) * 100)
        : 100;
    
    let html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>דוח סטטוס מיגרציה - TikTrack</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            padding: 20px;
            color: #333;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 {
            color: #26baac;
            border-bottom: 3px solid #26baac;
            padding-bottom: 15px;
            margin-bottom: 30px;
        }
        h2 {
            color: #333;
            margin: 30px 0 15px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #dee2e6;
        }
        .overall-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .stat-card {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 20px;
            border-radius: 8px;
            border-left: 5px solid #26baac;
            text-align: center;
        }
        .stat-card h3 {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
            font-weight: normal;
        }
        .stat-card .number {
            font-size: 42px;
            font-weight: bold;
            color: #26baac;
        }
        .stat-card .percentage {
            font-size: 32px;
            font-weight: bold;
            color: #fc5a06;
        }
        .progress-bar {
            width: 100%;
            height: 30px;
            background: #e9ecef;
            border-radius: 15px;
            overflow: hidden;
            margin: 20px 0;
            position: relative;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #26baac 0%, #20a395 100%);
            transition: width 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
        }
        .pages-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .pages-table th {
            background: #26baac;
            color: white;
            padding: 12px;
            text-align: right;
            font-weight: 600;
        }
        .pages-table td {
            padding: 12px;
            border-bottom: 1px solid #dee2e6;
        }
        .pages-table tr:hover {
            background: #f8f9fa;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
        }
        .status-completed {
            background: #28a745;
            color: white;
        }
        .status-almost-complete {
            background: #17a2b8;
            color: white;
        }
        .status-in-progress {
            background: #ffc107;
            color: #000;
        }
        .status-started {
            background: #fd7e14;
            color: white;
        }
        .status-not-started {
            background: #dc3545;
            color: white;
        }
        .integration-status {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .integration-card {
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid;
        }
        .integration-card.ok {
            background: #d4edda;
            border-color: #28a745;
        }
        .integration-card.issues {
            background: #fff3cd;
            border-color: #ffc107;
        }
        .integration-card.missing {
            background: #f8d7da;
            border-color: #dc3545;
        }
        .integration-card h4 {
            margin-bottom: 10px;
            color: #333;
        }
        .integration-card ul {
            margin: 10px 0;
            padding-right: 20px;
        }
        .integration-card li {
            margin: 5px 0;
            font-size: 14px;
        }
        .timestamp {
            color: #666;
            font-size: 14px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 דוח סטטוס מיגרציה ל-data-onclick</h1>
        <div class="timestamp">
            <strong>תאריך:</strong> ${new Date().toLocaleString('he-IL')}
        </div>
        
        <h2>📈 סטטיסטיקות כוללות</h2>
        <div class="overall-stats">
            <div class="stat-card">
                <h3>אחוז מיגרציה כולל</h3>
                <div class="percentage">${overallPercentage}%</div>
            </div>
            <div class="stat-card">
                <h3>סה"כ onclick רגיל</h3>
                <div class="number">${totalOnclick}</div>
            </div>
            <div class="stat-card">
                <h3>סה"כ data-onclick</h3>
                <div class="number">${totalDataOnclick}</div>
            </div>
            <div class="stat-card">
                <h3>עמודים הושלמו</h3>
                <div class="number">${completedPages}</div>
            </div>
            <div class="stat-card">
                <h3>עמודים בתהליך</h3>
                <div class="number">${inProgressPages}</div>
            </div>
            <div class="stat-card">
                <h3>עמודים לא התחילו</h3>
                <div class="number">${notStartedPages}</div>
            </div>
        </div>
        
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${overallPercentage}%">
                ${overallPercentage}%
            </div>
        </div>
        
        <h2>📄 סטטוס לפי עמודים</h2>
        <table class="pages-table">
            <thead>
                <tr>
                    <th>עמוד</th>
                    <th>onclick רגיל</th>
                    <th>data-onclick</th>
                    <th>אחוז מיגרציה</th>
                    <th>סטטוס</th>
                </tr>
            </thead>
            <tbody>`;
    
    pageStatuses.forEach(page => {
        const statusLabel = {
            'completed': 'הושלם',
            'almost-complete': 'כמעט הושלם',
            'in-progress': 'בתהליך',
            'started': 'התחיל',
            'not-started': 'לא התחיל'
        }[page.status] || 'לא ידוע';
        
        const statusClass = `status-${page.status}`;
        
        html += `
                <tr>
                    <td><strong>${page.page}</strong></td>
                    <td>${page.onclickCount}</td>
                    <td>${page.dataOnclickCount}</td>
                    <td>${page.migrationPercentage}%</td>
                    <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
                </tr>`;
    });
    
    html += `
            </tbody>
        </table>
        
        <h2>🔗 סטטוס אינטגרציה עם מערכות</h2>
        <div class="integration-status">`;
    
    if (reports.eventIntegration && reports.eventIntegration.systems) {
        reports.eventIntegration.systems.forEach(system => {
            const statusClass = system.status === 'ok' ? 'ok' : system.status === 'missing' ? 'missing' : 'issues';
            const statusIcon = system.status === 'ok' ? '✅' : system.status === 'missing' ? '❌' : '⚠️';
            
            html += `
            <div class="integration-card ${statusClass}">
                <h4>${statusIcon} ${system.system}</h4>
                <p><strong>סטטוס:</strong> ${system.status}</p>`;
            
            if (system.issues && system.issues.length > 0) {
                html += `<ul>`;
                system.issues.forEach(issue => {
                    html += `<li>${issue}</li>`;
                });
                html += `</ul>`;
            }
            
            if (system.recommendations && system.recommendations.length > 0) {
                html += `<p><strong>המלצות:</strong></p><ul>`;
                system.recommendations.forEach(rec => {
                    html += `<li>${rec}</li>`;
                });
                html += `</ul>`;
            }
            
            html += `</div>`;
        });
    } else {
        html += `<p>לא נמצאו נתוני אינטגרציה. נא להריץ את verify-event-integration.js</p>`;
    }
    
    html += `
        </div>
        
        <h2>📋 פעולות נדרשות</h2>
        <div style="background: #fff3cd; padding: 20px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <h3 style="margin-bottom: 15px;">עדיפויות:</h3>
            <ol style="padding-right: 20px;">
                <li style="margin: 10px 0;">המרת כל כותרות סידור מ-onclick ל-data-onclick</li>
                <li style="margin: 10px 0;">המרת כל כפתורי פעולות מ-onclick ל-data-onclick</li>
                <li style="margin: 10px 0;">המרת כל כפתורי מודולים מ-onclick ל-data-onclick</li>
                <li style="margin: 10px 0;">המרת כל כפתורי ריענון מ-onclick ל-data-onclick</li>
                <li style="margin: 10px 0;">עדכון כל הכפתורים שנוצרים דינמית להשתמש ב-data-onclick</li>
            </ol>
        </div>
        
        <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 6px; text-align: center; color: #666;">
            <p>דוח זה נוצר אוטומטית על ידי כלי המיגרציה של TikTrack</p>
            <p>לעדכון הדוח, הרץ: <code>node scripts/migration-status-report.js</code></p>
        </div>
    </div>
</body>
</html>`;
    
    return html;
}

/**
 * Main function
 */
async function main() {
    console.log('📊 מתחיל יצירת דוח סטטוס מיגרציה...\n');
    
    // בדיקה אם יש דוחות קיימים
    console.log('🔍 מחפש דוחות קיימים...');
    const reports = loadReports();
    
    // אם אין דוחות, נצטרך להריץ את הכלים
    if (!reports.onclickUsage || !reports.missingDataOnclick || !reports.eventIntegration) {
        console.log('⚠️  לא נמצאו דוחות קיימים. נא להריץ את הכלים הבאים תחילה:');
        if (!reports.onclickUsage) {
            console.log('   - node scripts/detect-onclick-usage.js');
        }
        if (!reports.missingDataOnclick) {
            console.log('   - node scripts/detect-missing-data-onclick.js');
        }
        if (!reports.eventIntegration) {
            console.log('   - node scripts/verify-event-integration.js');
        }
        console.log('\nאו הרץ את כל הכלים אוטומטית עכשיו? (y/n)');
        console.log('⚠️  לא ניתן להריץ אוטומטית - נא להריץ ידנית');
    }
    
    // יצירת דוח
    console.log('\n📄 יוצר דוח HTML...');
    const htmlReport = generateHTMLReport(reports);
    
    // שמירת דוח HTML
    const htmlPath = path.join(process.cwd(), 'migration-status-report.html');
    fs.writeFileSync(htmlPath, htmlReport, 'utf8');
    console.log(`✅ דוח HTML נשמר: ${htmlPath}`);
    
    // שמירת דוח JSON
    const jsonReport = {
        timestamp: new Date().toISOString(),
        overallPercentage: pageStatuses.reduce((sum, p) => sum + p.migrationPercentage, 0) / pageStatuses.length,
        pageStatuses: pageStatuses.map(p => ({
            page: p.page,
            onclickCount: p.onclickCount,
            dataOnclickCount: p.dataOnclickCount,
            migrationPercentage: p.migrationPercentage,
            status: p.status
        })),
        reports
    };
    
    const jsonPath = path.join(process.cwd(), 'migration-status-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2), 'utf8');
    console.log(`✅ דוח JSON נשמר: ${jsonPath}`);
    
    console.log('\n✅ סיום!');
    console.log(`\n📊 פתח את ${htmlPath} בדפדפן כדי לצפות בדוח המלא`);
    
    return jsonReport;
}

// הרצה אם הקובץ מופעל ישירות
if (require.main === module) {
    main().catch(error => {
        console.error('❌ שגיאה:', error);
        process.exit(1);
    });
}

module.exports = { main, generateHTMLReport, calculatePageStatus };

