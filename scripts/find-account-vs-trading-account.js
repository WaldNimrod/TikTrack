#!/usr/bin/env node

/**
 * סקריפט למיפוי מקומות שמשתמשים ב-"account" במקום "trading_account"
 * Script to map all places using "account" instead of "trading_account"
 * 
 * ⚠️ חשוב: אין במערכת ישות בשם "חשבון" - רק "חשבון מסחר"
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.join(__dirname, '..');
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'backup', 'account-vs-trading-account-report.md');

// דפוסי חיפוש חשודים
const SUSPICIOUS_PATTERNS = [
    // משתנים ופונקציות
    {
        name: 'Variable/Function: entity account (not trading_account)',
        pattern: /(?:entity|Entity|ENTITY)[_-]?account[^_]|account[_-]?(?:color|Color|COLOR|bg|BG|text|TEXT|border|BORDER|main|Main|sub|Sub)/gi,
        exclude: ['trading_account', 'tradingAccount', 'account_id', 'accountId', 'accountBalance', 'account_balance']
    },
    {
        name: 'CSS Classes: entity-account (not trading_account)',
        pattern: /\.entity-account(?!-trading)|entity-account-main|entity-account-sub|\.account-page/gi,
        exclude: ['trading_account']
    },
    {
        name: 'Entity type mapping: account (not trading_account)',
        pattern: /['"`]account['"`]\s*:\s*['"`]|'account'\s*=>|"account"\s*=>/gi,
        exclude: ['trading_account', 'default_trading_account']
    },
    {
        name: 'Comments: חשבון (not חשבון מסחר)',
        pattern: /\/\/\s*חשבון[^מ]|\/\*\s*חשבון[^מ]/g,
        exclude: ['חשבון מסחר']
    },
    {
        name: 'Page class mapping: accounts-page',
        pattern: /accounts-page\s*[:=>]\s*['"`]account['"`]/gi,
        exclude: ['trading_account']
    },
    {
        name: 'VALID_ENTITY_TYPES or type arrays: account (not trading_account)',
        pattern: /(?:VALID_ENTITY_TYPES|entityTypes|types)\s*[:=]\s*\[[^\]]*['"`]account['"`](?!.*trading_account)/gis,
        exclude: ['trading_account']
    },
    {
        name: 'PAGE_TO_ENTITY_MAPPING: account',
        pattern: /['"`]trading-accounts-page['"`]\s*:\s*['"`]account['"`]|['"`]accounts-page['"`]\s*:\s*['"`]account['"`]/gi,
        exclude: []
    },
    {
        name: 'Function names: account (not tradingAccount)',
        pattern: /(?:function|const|let|var)\s+(?:load|update|get|set|create|delete|render|show)[A-Z]?\w*[Aa]ccount(?!\w*trading)/g,
        exclude: ['tradingAccount', 'TradingAccount']
    },
    {
        name: 'Preference names: entityAccountColor (not entityTradingAccountColor)',
        pattern: /entityAccountColor(?!\w*Trading)/gi,
        exclude: ['entityTradingAccountColor']
    }
];

// תיקיות לבדיקה
const DIRS_TO_SEARCH = [
    'trading-ui/scripts',
    'trading-ui/styles-new',
    'trading-ui',
    'Backend/routes',
    'Backend/services',
    'documentation'
];

// קבצים/תיקיות לדלג עליהם
const EXCLUDE_PATTERNS = [
    /node_modules/,
    /\.git/,
    /backup/,
    /archive/,
    /\.min\.js$/,
    /\.map$/,
    /checkpoint/,
    /vendor/
];

// קבצים תקינים (לא לבדוק)
const VALID_FILES = [
    'trading-ui/scripts/debug-account-colors.js', // קובץ דיאגנוסטי
];

let results = {
    totalFiles: 0,
    suspiciousFiles: [],
    patterns: {}
};

function shouldExcludeFile(filePath) {
    // בדיקת תבניות הדרה
    for (const pattern of EXCLUDE_PATTERNS) {
        if (pattern.test(filePath)) {
            return true;
        }
    }
    
    // בדיקת קבצים תקינים
    const relativePath = path.relative(PROJECT_ROOT, filePath);
    if (VALID_FILES.includes(relativePath)) {
        return true;
    }
    
    return false;
}

function isFalsePositive(match, line, pattern) {
    // בדיקת false positives
    const lowerLine = line.toLowerCase();
    const lowerMatch = match.toLowerCase();
    
    // דילוג על משתנים תקינים
    const validPatterns = [
        'trading_account',
        'tradingaccount',
        'trading-account',
        'tradingaccountcolor',
        'trading_account_id',
        'account_id',
        'accountid',
        'accountbalance',
        'account_balance',
        'default_trading_account',
        'loadtradingaccounts',
        'tradingaccountsdata',
        'showtradingaccount',
        'edittradingaccount',
        'deletetradingaccount',
        'entitytradingaccountcolor'
    ];
    
    for (const valid of validPatterns) {
        if (lowerLine.includes(valid) || lowerMatch.includes(valid)) {
            return true;
        }
    }
    
    // דילוג על exclude patterns
    if (pattern.exclude) {
        for (const exclude of pattern.exclude) {
            if (line.includes(exclude)) {
                return true;
            }
        }
    }
    
    return false;
}

function searchFile(filePath) {
    if (shouldExcludeFile(filePath)) {
        return;
    }
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const relativePath = path.relative(PROJECT_ROOT, filePath);
        
        let fileHasSuspicious = false;
        const fileResults = {
            path: relativePath,
            fullPath: filePath,
            matches: []
        };
        
        for (const pattern of SUSPICIOUS_PATTERNS) {
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const matches = line.match(pattern.pattern);
                
                if (matches) {
                    for (const match of matches) {
                        if (!isFalsePositive(match, line, pattern)) {
                            fileHasSuspicious = true;
                            fileResults.matches.push({
                                pattern: pattern.name,
                                line: i + 1,
                                content: line.trim(),
                                match: match
                            });
                        }
                    }
                }
            }
        }
        
        if (fileHasSuspicious) {
            results.suspiciousFiles.push(fileResults);
            results.totalFiles++;
        }
    } catch (error) {
        // דילוג על קבצים שלא ניתן לקרוא
    }
}

function walkDir(dir) {
    if (shouldExcludeFile(dir)) {
        return;
    }
    
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                walkDir(fullPath);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name);
                // בדוק רק קבצי קוד ותיעוד
                if (['.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.md', '.json', '.py', '.sql'].includes(ext)) {
                    searchFile(fullPath);
                }
            }
        }
    } catch (error) {
        // דילוג על תיקיות שלא ניתן לגשת אליהן
    }
}

function generateReport() {
    let report = `# דוח: מיפוי מקומות שמשתמשים ב-"account" במקום "trading_account"\n\n`;
    report += `**תאריך:** ${new Date().toLocaleString('he-IL')}\n\n`;
    report += `**⚠️ חשוב:** אין במערכת ישות בשם "חשבון" - רק "חשבון מסחר"\n\n`;
    report += `---\n\n`;
    
    report += `## סיכום כללי\n\n`;
    report += `- **סך קבצים חשודים:** ${results.suspiciousFiles.length}\n`;
    
    // ספירת לפי סוג בעיה
    const byPattern = {};
    results.suspiciousFiles.forEach(file => {
        file.matches.forEach(match => {
            byPattern[match.pattern] = (byPattern[match.pattern] || 0) + 1;
        });
    });
    
    report += `- **סוגי בעיות שזוהו:**\n`;
    Object.entries(byPattern).sort((a, b) => b[1] - a[1]).forEach(([pattern, count]) => {
        report += `  - ${pattern}: ${count} מקרים\n`;
    });
    
    report += `\n---\n\n`;
    report += `## קבצים חשודים - פירוט מלא\n\n`;
    
    // קיבוץ לפי סוג בעיה
    const groupedByPattern = {};
    results.suspiciousFiles.forEach(file => {
        file.matches.forEach(match => {
            if (!groupedByPattern[match.pattern]) {
                groupedByPattern[match.pattern] = [];
            }
            groupedByPattern[match.pattern].push({
                file: file.path,
                line: match.line,
                content: match.content,
                match: match.match
            });
        });
    });
    
    // הצגה לפי סוג בעיה
    Object.entries(groupedByPattern).sort((a, b) => b[1].length - a[1].length).forEach(([pattern, matches]) => {
        report += `### ${pattern}\n\n`;
        report += `**סך מקרים:** ${matches.length}\n\n`;
        
        // קיבוץ לפי קובץ
        const byFile = {};
        matches.forEach(m => {
            if (!byFile[m.file]) {
                byFile[m.file] = [];
            }
            byFile[m.file].push(m);
        });
        
        Object.entries(byFile).sort().forEach(([filePath, fileMatches]) => {
            report += `#### \`${filePath}\`\n\n`;
            fileMatches.forEach(m => {
                report += `- **שורה ${m.line}:** \`${m.match}\`\n`;
                report += `  \`\`\`\n  ${m.content.substring(0, 150)}${m.content.length > 150 ? '...' : ''}\n  \`\`\`\n\n`;
            });
        });
        
        report += `---\n\n`;
    });
    
    report += `## המלצות לתיקון\n\n`;
    report += `1. **חיפוש והחלפה:** השתמש ב-"trading_account" במקום "account" בכל המיפויים וההגדרות\n`;
    report += `2. **CSS Classes:** שנה מ-\`.entity-account-\` ל-\`.entity-trading_account-\`\n`;
    report += `3. **משתנים:** שנה מ-\`entityAccountColor\` ל-\`entityTradingAccountColor\`\n`;
    report += `4. **מיפויים:** ודא ש-\`PAGE_TO_ENTITY_MAPPING\` ו-\`VALID_ENTITY_TYPES\` מכילים "trading_account"\n`;
    report += `5. **הערות ותיעוד:** עדכן הערות מ-"חשבון" ל-"חשבון מסחר"\n\n`;
    
    report += `---\n\n`;
    report += `*דוח נוצר אוטומטית על ידי \`find-account-vs-trading-account.js\`*\n`;
    
    return report;
}

// הרצה
console.log('🔍 מתחיל סריקת קבצים...\n');

for (const dir of DIRS_TO_SEARCH) {
    const fullDir = path.join(PROJECT_ROOT, dir);
    if (fs.existsSync(fullDir)) {
        console.log(`📁 סורק: ${dir}`);
        walkDir(fullDir);
    }
}

console.log(`\n✅ סריקה הושלמה! נמצאו ${results.suspiciousFiles.length} קבצים חשודים.\n`);

// יצירת הדוח
const report = generateReport();
fs.writeFileSync(OUTPUT_FILE, report, 'utf8');

console.log(`📄 דוח נוצר: ${OUTPUT_FILE}\n`);
console.log('📊 סיכום:');
console.log(`   - קבצים חשודים: ${results.suspiciousFiles.length}`);

// ספירת לפי סוג
const byPattern = {};
results.suspiciousFiles.forEach(file => {
    file.matches.forEach(match => {
        byPattern[match.pattern] = (byPattern[match.pattern] || 0) + 1;
    });
});

Object.entries(byPattern).sort((a, b) => b[1] - a[1]).forEach(([pattern, count]) => {
    console.log(`   - ${pattern}: ${count}`);
});

console.log(`\n✅ הושלם!`);

