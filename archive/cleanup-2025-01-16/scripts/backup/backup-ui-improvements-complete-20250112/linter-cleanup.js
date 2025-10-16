#!/usr/bin/env node
/**
 * Linter Cleanup Script - סקריפט ניקוי לינטר מתקדם
 * ===================================================
 * 
 * סקריפט מתקדם לניקוי קוד אוטומטי עם ממשק אינטראקטיבי
 * כולל ניתוח, תיקון אוטומטי ומעקב אחר התקדמות
 * 
 * תכונות:
 * - ניתוח מפורט של בעיות לינטר
 * - תיקון אוטומטי של בעיות פשוטות
 * - דוחות מפורטים עם סטטיסטיקות
 * - ממשק אינטראקטיבי
 * - מעקב אחר התקדמות
 * 
 * שימוש:
 * node scripts/linter-cleanup.js [options]
 * 
 * אופציות:
 * --analyze    - ניתוח בלבד ללא תיקון
 * --fix        - תיקון אוטומטי
 * --interactive - ממשק אינטראקטיבי
 * --report     - יצירת דוח מפורט
 * --help       - הצגת עזרה
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

class LinterCleanupTool {
    constructor() {
        this.projectRoot = process.cwd();
        this.scriptsDir = path.join(this.projectRoot, 'trading-ui', 'scripts');
        this.reportDir = path.join(this.projectRoot, 'linter-reports');
        this.stats = {
            totalIssues: 0,
            errors: 0,
            warnings: 0,
            fixed: 0,
            files: new Map(),
            issueTypes: new Map()
        };
        this.startTime = Date.now();
        
        // צבעים לקונסול
        this.colors = {
            reset: '\x1b[0m',
            bright: '\x1b[1m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m'
        };
    }

    log(message, color = 'reset') {
        console.log(`${this.colors[color]}${message}${this.colors.reset}`);
    }

    async run() {
        this.log('🚀 מתחיל סקריפט ניקוי לינטר מתקדם...', 'cyan');
        this.log('=====================================', 'cyan');
        
        // יצירת תיקיית דוחות
        if (!fs.existsSync(this.reportDir)) {
            fs.mkdirSync(this.reportDir, { recursive: true });
        }

        // ניתוח מצב נוכחי
        await this.analyzeCurrentState();
        
        // הצגת תפריט
        await this.showMenu();
    }

    async analyzeCurrentState() {
        this.log('\n📊 מנתח מצב נוכחי של הלינטר...', 'blue');
        
        try {
            // הרצת לינטר וניתוח התוצאות
            const lintOutput = execSync('npm run lint 2>&1', { 
                cwd: this.projectRoot,
                encoding: 'utf8'
            });

            this.parseLintOutput(lintOutput);
            this.generateStats();
            
        } catch (error) {
            this.log('❌ שגיאה בהרצת לינטר:', 'red');
            this.log(error.message, 'red');
        }
    }

    parseLintOutput(output) {
        const lines = output.split('\n');
        let currentFile = null;

        for (const line of lines) {
            // זיהוי קובץ חדש
            if (line.includes('trading-ui/scripts/') && line.endsWith('.js')) {
                currentFile = line.trim();
                this.stats.files.set(currentFile, {
                    errors: 0,
                    warnings: 0,
                    issues: []
                });
            }
            
            // זיהוי שגיאות ואזהרות
            if (line.includes('error') || line.includes('warning')) {
                const match = line.match(/(\d+):(\d+)\s+(error|warning)\s+(.+)/);
                if (match && currentFile) {
                    const [, lineNum, colNum, type, message] = match;
                    const issue = {
                        line: parseInt(lineNum),
                        column: parseInt(colNum),
                        type: type,
                        message: message.trim(),
                        rule: this.extractRule(message)
                    };

                    this.stats.files.get(currentFile).issues.push(issue);
                    
                    if (type === 'error') {
                        this.stats.files.get(currentFile).errors++;
                        this.stats.errors++;
                    } else {
                        this.stats.files.get(currentFile).warnings++;
                        this.stats.warnings++;
                    }

                    // ספירת סוגי בעיות
                    const rule = issue.rule;
                    this.stats.issueTypes.set(rule, (this.stats.issueTypes.get(rule) || 0) + 1);
                }
            }
        }

        this.stats.totalIssues = this.stats.errors + this.stats.warnings;
    }

    extractRule(message) {
        const match = message.match(/([a-z-]+)\s*$/);
        return match ? match[1] : 'unknown';
    }

    generateStats() {
        this.log('\n📈 סטטיסטיקות נוכחיות:', 'green');
        this.log(`   סך הכל בעיות: ${this.stats.totalIssues}`, 'bright');
        this.log(`   שגיאות: ${this.stats.errors}`, 'red');
        this.log(`   אזהרות: ${this.stats.warnings}`, 'yellow');
        this.log(`   קבצים נסרקו: ${this.stats.files.size}`, 'blue');

        // סוגי בעיות נפוצות
        this.log('\n🔍 סוגי בעיות נפוצות:', 'magenta');
        const sortedIssues = Array.from(this.stats.issueTypes.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        sortedIssues.forEach(([rule, count], index) => {
            const percentage = ((count / this.stats.totalIssues) * 100).toFixed(1);
            this.log(`   ${index + 1}. ${rule}: ${count} (${percentage}%)`, 'cyan');
        });

        // קבצים בעייתיים ביותר
        this.log('\n📁 קבצים בעייתיים ביותר:', 'magenta');
        const sortedFiles = Array.from(this.stats.files.entries())
            .sort((a, b) => (b[1].errors + b[1].warnings) - (a[1].errors + a[1].warnings))
            .slice(0, 10);

        sortedFiles.forEach(([file, stats], index) => {
            const total = stats.errors + stats.warnings;
            this.log(`   ${index + 1}. ${path.basename(file)}: ${total} בעיות`, 'cyan');
        });
    }

    async showMenu() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

        while (true) {
            this.log('\n🎯 תפריט פעולות:', 'bright');
            this.log('1. ניתוח מפורט של קובץ ספציפי', 'blue');
            this.log('2. תיקון אוטומטי של בעיות פשוטות', 'green');
            this.log('3. ניקוי console statements', 'yellow');
            this.log('4. ניקוי משתנים לא בשימוש', 'yellow');
            this.log('5. יצירת דוח מפורט', 'magenta');
            this.log('6. ניקוי קובץ ספציפי', 'cyan');
            this.log('7. הצגת התקדמות', 'green');
            this.log('8. יציאה', 'red');

            const choice = await question('\nבחר פעולה (1-8): ');

            switch (choice) {
                case '1':
                    await this.analyzeSpecificFile(question);
                    break;
                case '2':
                    await this.autoFix();
                    break;
                case '3':
                    await this.cleanConsoleStatements(question);
                    break;
                case '4':
                    await this.cleanUnusedVariables(question);
                    break;
                case '5':
                    await this.generateDetailedReport();
                    break;
                case '6':
                    await this.cleanSpecificFile(question);
                    break;
                case '7':
                    this.showProgress();
                    break;
                case '8':
                    this.log('👋 יוצא מהסקריפט...', 'green');
                    rl.close();
                    return;
                default:
                    this.log('❌ בחירה לא תקינה, נסה שוב', 'red');
            }
        }
    }

    async analyzeSpecificFile(question) {
        const files = Array.from(this.stats.files.keys());
        this.log('\n📁 קבצים זמינים:', 'blue');
        files.forEach((file, index) => {
            const stats = this.stats.files.get(file);
            this.log(`   ${index + 1}. ${path.basename(file)} (${stats.errors + stats.warnings} בעיות)`, 'cyan');
        });

        const choice = await question('\nבחר קובץ (מספר): ');
        const fileIndex = parseInt(choice) - 1;

        if (fileIndex >= 0 && fileIndex < files.length) {
            const selectedFile = files[fileIndex];
            const stats = this.stats.files.get(selectedFile);
            
            this.log(`\n📊 ניתוח מפורט של ${path.basename(selectedFile)}:`, 'green');
            this.log(`   שגיאות: ${stats.errors}`, 'red');
            this.log(`   אזהרות: ${stats.warnings}`, 'yellow');
            
            this.log('\n🔍 בעיות מפורטות:', 'magenta');
            stats.issues.forEach((issue, index) => {
                const color = issue.type === 'error' ? 'red' : 'yellow';
                this.log(`   ${index + 1}. שורה ${issue.line}: ${issue.message}`, color);
            });
        } else {
            this.log('❌ בחירה לא תקינה', 'red');
        }
    }

    async autoFix() {
        this.log('\n🔧 מתחיל תיקון אוטומטי...', 'green');
        
        try {
            // תיקון אוטומטי עם eslint
            execSync('npm run lint:fix', { 
                cwd: this.projectRoot,
                stdio: 'inherit'
            });

            this.log('✅ תיקון אוטומטי הושלם', 'green');
            
            // ניתוח מחדש
            await this.analyzeCurrentState();
            
        } catch (error) {
            this.log('❌ שגיאה בתיקון אוטומטי:', 'red');
            this.log(error.message, 'red');
        }
    }

    async cleanConsoleStatements(question) {
        this.log('\n🧹 מנקה console statements...', 'yellow');
        
        const files = Array.from(this.stats.files.keys());
        let cleaned = 0;

        for (const file of files) {
            const filePath = path.join(this.projectRoot, file);
            if (fs.existsSync(filePath)) {
                let content = fs.readFileSync(filePath, 'utf8');
                const originalContent = content;

                // החלפת console statements
                content = content.replace(/console\.log\(/g, '// console.log(');
                content = content.replace(/console\.error\(/g, '// console.error(');
                content = content.replace(/console\.warn\(/g, '// console.warn(');
                content = content.replace(/console\.info\(/g, '// console.info(');

                if (content !== originalContent) {
                    fs.writeFileSync(filePath, content);
                    cleaned++;
                    this.log(`   ✅ נוקה: ${path.basename(file)}`, 'green');
                }
            }
        }

        this.log(`\n🎉 נוקו ${cleaned} קבצים`, 'green');
        
        // ניתוח מחדש
        await this.analyzeCurrentState();
    }

    async cleanUnusedVariables(question) {
        this.log('\n🧹 מנקה משתנים לא בשימוש...', 'yellow');
        
        const files = Array.from(this.stats.files.keys());
        let cleaned = 0;

        for (const file of files) {
            const filePath = path.join(this.projectRoot, file);
            if (fs.existsSync(filePath)) {
                let content = fs.readFileSync(filePath, 'utf8');
                const originalContent = content;

                // הוספת _ לפני משתנים לא בשימוש
                const lines = content.split('\n');
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line.includes('no-unused-vars')) {
                        // זהו שורה עם אזהרת no-unused-vars
                        // ננסה לתקן את השורה הקודמת
                        if (i > 0) {
                            const prevLine = lines[i - 1];
                            const match = prevLine.match(/(\s*)(let|const|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
                            if (match) {
                                const [, indent, declaration, varName] = match;
                                if (!varName.startsWith('_')) {
                                    lines[i - 1] = prevLine.replace(varName, `_${varName}`);
                                }
                            }
                        }
                    }
                }

                const newContent = lines.join('\n');
                if (newContent !== originalContent) {
                    fs.writeFileSync(filePath, newContent);
                    cleaned++;
                    this.log(`   ✅ נוקה: ${path.basename(file)}`, 'green');
                }
            }
        }

        this.log(`\n🎉 נוקו ${cleaned} קבצים`, 'green');
        
        // ניתוח מחדש
        await this.analyzeCurrentState();
    }

    async generateDetailedReport() {
        this.log('\n📊 יוצר דוח מפורט...', 'magenta');
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportFile = path.join(this.reportDir, `linter-report-${timestamp}.html`);
        
        const html = this.generateHTMLReport();
        fs.writeFileSync(reportFile, html);
        
        this.log(`✅ דוח נשמר ב: ${reportFile}`, 'green');
        this.log(`🌐 פתח בדפדפן: file://${reportFile}`, 'blue');
    }

    generateHTMLReport() {
        const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
        
        return `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>דוח לינטר מפורט - ${new Date().toLocaleDateString('he-IL')}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; color: #333; border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #007bff; }
        .stat-number { font-size: 2em; font-weight: bold; color: #007bff; }
        .stat-label { color: #666; margin-top: 5px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
        .file-list { background: #f8f9fa; padding: 15px; border-radius: 5px; }
        .file-item { padding: 8px 0; border-bottom: 1px solid #eee; }
        .file-item:last-child { border-bottom: none; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        .success { color: #28a745; }
        .timestamp { color: #666; font-size: 0.9em; text-align: center; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔧 דוח לינטר מפורט</h1>
            <p>נוצר ב: ${new Date().toLocaleString('he-IL')}</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${this.stats.totalIssues}</div>
                <div class="stat-label">סך הכל בעיות</div>
            </div>
            <div class="stat-card">
                <div class="stat-number error">${this.stats.errors}</div>
                <div class="stat-label">שגיאות</div>
            </div>
            <div class="stat-card">
                <div class="stat-number warning">${this.stats.warnings}</div>
                <div class="stat-label">אזהרות</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${this.stats.files.size}</div>
                <div class="stat-label">קבצים נסרקו</div>
            </div>
        </div>

        <div class="section">
            <h2>🔍 סוגי בעיות נפוצות</h2>
            <div class="file-list">
                ${Array.from(this.stats.issueTypes.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([rule, count], index) => {
                        const percentage = ((count / this.stats.totalIssues) * 100).toFixed(1);
                        return `<div class="file-item">${index + 1}. ${rule}: ${count} (${percentage}%)</div>`;
                    }).join('')}
            </div>
        </div>

        <div class="section">
            <h2>📁 קבצים בעייתיים ביותר</h2>
            <div class="file-list">
                ${Array.from(this.stats.files.entries())
                    .sort((a, b) => (b[1].errors + b[1].warnings) - (a[1].errors + a[1].warnings))
                    .slice(0, 15)
                    .map(([file, stats], index) => {
                        const total = stats.errors + stats.warnings;
                        const color = stats.errors > 0 ? 'error' : 'warning';
                        return `<div class="file-item"><span class="${color}">${index + 1}. ${path.basename(file)}: ${total} בעיות</span> (${stats.errors} שגיאות, ${stats.warnings} אזהרות)</div>`;
                    }).join('')}
            </div>
        </div>

        <div class="timestamp">
            דוח נוצר תוך ${duration} שניות
        </div>
    </div>
</body>
</html>`;
    }

    async cleanSpecificFile(question) {
        const files = Array.from(this.stats.files.keys());
        this.log('\n📁 קבצים זמינים לניקוי:', 'blue');
        files.forEach((file, index) => {
            const stats = this.stats.files.get(file);
            this.log(`   ${index + 1}. ${path.basename(file)} (${stats.errors + stats.warnings} בעיות)`, 'cyan');
        });

        const choice = await question('\nבחר קובץ לניקוי (מספר): ');
        const fileIndex = parseInt(choice) - 1;

        if (fileIndex >= 0 && fileIndex < files.length) {
            const selectedFile = files[fileIndex];
            const filePath = path.join(this.projectRoot, selectedFile);
            
            this.log(`\n🧹 מנקה ${path.basename(selectedFile)}...`, 'yellow');
            
            try {
                // תיקון אוטומטי של הקובץ הספציפי
                execSync(`npx eslint "${filePath}" --fix`, { 
                    cwd: this.projectRoot,
                    stdio: 'inherit'
                });

                this.log('✅ ניקוי הושלם', 'green');
                
                // ניתוח מחדש
                await this.analyzeCurrentState();
                
            } catch (error) {
                this.log('❌ שגיאה בניקוי הקובץ:', 'red');
                this.log(error.message, 'red');
            }
        } else {
            this.log('❌ בחירה לא תקינה', 'red');
        }
    }

    showProgress() {
        const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
        
        this.log('\n📊 התקדמות נוכחית:', 'green');
        this.log(`   זמן עבודה: ${duration} שניות`, 'blue');
        this.log(`   בעיות שנותרו: ${this.stats.totalIssues}`, 'yellow');
        this.log(`   שגיאות: ${this.stats.errors}`, 'red');
        this.log(`   אזהרות: ${this.stats.warnings}`, 'yellow');
        
        if (this.stats.totalIssues > 0) {
            const progress = ((this.stats.fixed / (this.stats.fixed + this.stats.totalIssues)) * 100).toFixed(1);
            this.log(`   התקדמות: ${progress}%`, 'green');
        }
    }
}

// הרצת הסקריפט
if (require.main === module) {
    const tool = new LinterCleanupTool();
    tool.run().catch(console.error);
}

module.exports = LinterCleanupTool;
